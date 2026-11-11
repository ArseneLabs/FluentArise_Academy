import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, ShoppingBag, Landmark, Smartphone, CheckCircle2, Copy,
  ShieldCheck, Loader2, Trash2, FileText, Home as HomeIcon, Package, AlertCircle,
} from 'lucide-react';
import { useCart } from '@/store/cart';
import { useToast } from '@/store/toast';
import { formatRwf } from '@/data/courses';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { generateOrderNumber, type OrderRecord } from '@/lib/orders';
import { useAdminStore } from '@/admin/store/adminStore';

type Step = 'review' | 'details' | 'payment' | 'success';
type PaymentMethod = 'bank' | 'momo';

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

interface Errors {
  name?: string;
  email?: string;
  phone?: string;
  reference?: string;
}

const BANK_DETAILS = {
  bankName: 'Bank of Kigali (BK)',
  accountName: 'Dufitimana Arsene Johnkelly',
  accountNumber: '100158888526',
  branch: 'KN 2 Ave Branch, Kigali',
  swift: 'BKINRWRP',
};

const MOMO_DETAILS = {
  provider: 'MTN MobileMoney / Airtel Money',
  number: '0795041000',
  accountName: 'KWIZERA Josee Micheline',
};

export default function Checkout() {
  const navigate = useNavigate();
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total());
  const clear = useCart((s) => s.clear);
  const remove = useCart((s) => s.remove);
  const push = useToast((s) => s.push);

  const [step, setStep] = useState<Step>('review');
  const [customer, setCustomer] = useState<CustomerInfo>({ name: '', email: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('momo');
  const [paymentReference, setPaymentReference] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Empty cart and no completed order → redirect to courses
  if (items.length === 0 && step !== 'success') {
    return <Navigate to="/courses" replace />;
  }

  const validateDetails = (): boolean => {
    const e: Errors = {};
    if (!customer.name.trim()) e.name = 'Please enter your full name';
    if (!customer.email.trim()) e.email = 'Please enter your email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) e.email = 'Please enter a valid email';
    if (!customer.phone.trim()) e.phone = 'Please enter your phone number';
    else if (customer.phone.replace(/\s/g, '').length < 8) e.phone = 'Please enter a valid phone number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePayment = (): boolean => {
    const e: Errors = {};
    if (!paymentReference.trim()) e.reference = 'Please enter your payment reference / transaction ID';
    else if (paymentReference.trim().length < 4) e.reference = 'Reference seems too short';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1800);
    push(`${label} copied to clipboard`, 'info');
  };

  const submitOrder = async () => {
    if (!validatePayment()) return;
    setSubmitting(true);

    const orderItems = items.map((i) => ({
      id: i.id,
      title: i.title,
      price: i.price,
      thumbnail: i.thumbnail,
      category: i.category,
    }));

    const payload = {
      order_number: generateOrderNumber(),
      customer_name: customer.name.trim(),
      customer_email: customer.email.trim(),
      customer_phone: customer.phone.trim(),
      items: orderItems,
      total_amount: total,
      payment_method: paymentMethod,
      payment_reference: paymentReference.trim(),
      status: 'confirmed',
    };

    try {
      if (isSupabaseConfigured && supabase) {
        // Try up to 3 times in case of order_number collision
        let lastError: unknown = null;
        let createdOrder: OrderRecord | null = null;
        for (let attempt = 0; attempt < 3; attempt++) {
          const attemptPayload = { ...payload, order_number: generateOrderNumber() };
          const { data, error } = await supabase
            .from('orders')
            .insert(attemptPayload)
            .select()
            .maybeSingle();

          if (!error && data) {
            createdOrder = data as OrderRecord;
            setOrder(createdOrder);
            break;
          }
          lastError = error;
        }
        if (!createdOrder) {
          throw lastError ?? new Error('Could not create order');
        }
      } else {
        // Offline fallback — still generate a confirmation
        const fallback: OrderRecord = {
          id: crypto.randomUUID(),
          ...payload,
          created_at: new Date().toISOString(),
        };
        setOrder(fallback);
      }

      // Sync real checkout order to admin store
      useAdminStore.getState().addOrder({
        id: `ord_${Date.now()}`,
        reference: payload.order_number,
        studentName: payload.customer_name,
        studentEmail: payload.customer_email,
        courseTitle: orderItems.map((i) => i.title).join(', '),
        amount: payload.total_amount,
        method: payload.payment_method === 'momo' ? 'MTN Mobile Money' : 'Bank Transfer',
        status: 'paid',
        date: new Date().toISOString(),
      });

      clear();
      setStep('success');
      push('Order placed successfully!', 'success');
    } catch (err) {
      push('Something went wrong placing your order. Please try again.', 'error');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const steps: { id: Step; label: string }[] = [
    { id: 'review', label: 'Cart Review' },
    { id: 'details', label: 'Your Details' },
    { id: 'payment', label: 'Payment' },
  ];
  const activeIndex = steps.findIndex((s) => s.id === step);

  return (
    <>
      {/* Header banner */}
      <section className="gradient-hero py-10">
        <div className="container-page">
          <Breadcrumbs />
          <h1 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">Checkout</h1>
          <p className="mt-2 text-white/70">Complete your enrolment in a few simple steps.</p>
        </div>
      </section>

      <section className="bg-slate-50 py-10 lg:py-14">
        <div className="container-page">
          {/* Stepper */}
          {step !== 'success' && (
            <div className="mb-8 flex items-center justify-center gap-2 sm:gap-4">
              {steps.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2 sm:gap-4">
                  <div className="flex flex-col items-center gap-1.5">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all ${
                        i < activeIndex
                          ? 'bg-emerald-500 text-white'
                          : i === activeIndex
                          ? 'gradient-brand text-white shadow-brand'
                          : 'bg-white text-slate-400 ring-1 ring-slate-200'
                      }`}
                    >
                      {i < activeIndex ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                    </span>
                    <span className={`hidden text-xs font-semibold sm:block ${i === activeIndex ? 'text-brand-800' : 'text-slate-400'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <span className={`h-0.5 w-8 rounded-full sm:w-16 ${i < activeIndex ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Steps content */}
          {step === 'review' && (
            <ReviewStep items={items} total={total} onRemove={remove} onNext={() => setStep('details')} onBack={() => navigate('/courses')} />
          )}

          {step === 'details' && (
            <DetailsStep
              customer={customer}
              setCustomer={setCustomer}
              errors={errors}
              total={total}
              onNext={() => validateDetails() && setStep('payment')}
              onBack={() => setStep('review')}
            />
          )}

          {step === 'payment' && (
            <PaymentStep
              method={paymentMethod}
              setMethod={setPaymentMethod}
              reference={paymentReference}
              setReference={setPaymentReference}
              errors={errors}
              total={total}
              customer={customer}
              onBack={() => setStep('details')}
              onSubmit={submitOrder}
              submitting={submitting}
              onCopy={copyToClipboard}
              copied={copied}
            />
          )}

          {step === 'success' && order && <SuccessStep order={order} />}
        </div>
      </section>
    </>
  );
}

function Breadcrumbs() {
  return (
    <nav className="flex items-center gap-1.5 text-sm">
      <Link to="/" className="text-white/70 hover:text-white">Home</Link>
      <span className="text-white/40">/</span>
      <Link to="/courses" className="text-white/70 hover:text-white">Courses</Link>
      <span className="text-white/40">/</span>
      <span className="font-medium text-white">Checkout</span>
    </nav>
  );
}

/* ───────────────── Review Step ───────────────── */

function ReviewStep({
  items, total, onRemove, onNext, onBack,
}: {
  items: ReturnType<typeof useCart.getState>['items'];
  total: number;
  onRemove: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
        <h2 className="flex items-center gap-2 text-lg font-bold text-brand-900">
          <ShoppingBag className="h-5 w-5 text-brand-700" /> Your Courses
        </h2>

        <ul className="mt-6 divide-y divide-slate-100">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4 py-4">
              <img src={item.thumbnail} alt={item.title} className="h-20 w-28 shrink-0 rounded-xl object-cover" />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="inline-flex w-fit rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">{item.category}</span>
                <h3 className="mt-1.5 line-clamp-2 text-sm font-bold text-slate-800">{item.title}</h3>
                <p className="mt-1 text-xs text-slate-500">{item.lessons} lessons · {item.duration}</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => onRemove(item.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <p className="text-base font-extrabold text-brand-900">{formatRwf(item.price)}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
          <Row label="Subtotal" value={formatRwf(total)} />
          <Row label="Platform fee" value="Free" valueClass="text-emerald-600" />
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-base">
            <span className="font-bold text-slate-800">Total</span>
            <span className="font-extrabold text-brand-900">{formatRwf(total)}</span>
          </div>
        </div>
      </div>

      <NavButtons onBack={onBack} backLabel="Continue Shopping" onNext={onNext} nextLabel="Continue to Details" />
    </div>
  );
}

/* ───────────────── Details Step ───────────────── */

function DetailsStep({
  customer, setCustomer, errors, total, onNext, onBack,
}: {
  customer: CustomerInfo;
  setCustomer: (c: CustomerInfo) => void;
  errors: Errors;
  total: number;
  onNext: () => void;
  onBack: () => void;
}) {
  const update = (key: keyof CustomerInfo, value: string) => {
    setCustomer({ ...customer, [key]: value });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
        <h2 className="flex items-center gap-2 text-lg font-bold text-brand-900">
          <Package className="h-5 w-5 text-brand-700" /> Your Details
        </h2>
        <p className="mt-1 text-sm text-slate-500">We need these to send you your enrolment confirmation and course access.</p>

        <div className="mt-6 space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Full Name</label>
            <input
              value={customer.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Jane Doe"
              className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-2 ${
                errors.name ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-brand-400 focus:ring-brand-100'
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email Address</label>
              <input
                type="email"
                value={customer.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="kjmicheline@gmail.com"
                className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-2 ${
                  errors.email ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-brand-400 focus:ring-brand-100'
                }`}
              />
              {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Phone Number</label>
              <input
                value={customer.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="0795041000"
                className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-2 ${
                  errors.phone ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-brand-400 focus:ring-brand-100'
                }`}
              />
              {errors.phone && <p className="mt-1 text-xs text-rose-500">{errors.phone}</p>}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
          <span className="text-sm font-semibold text-brand-800">Amount to pay</span>
          <span className="text-lg font-extrabold text-brand-900">{formatRwf(total)}</span>
        </div>
      </div>

      <NavButtons onBack={onBack} backLabel="Back to Cart" onNext={onNext} nextLabel="Continue to Payment" />
    </div>
  );
}

/* ───────────────── Payment Step ───────────────── */

function PaymentStep({
  method, setMethod, reference, setReference, errors, total, customer,
  onBack, onSubmit, submitting, onCopy, copied,
}: {
  method: PaymentMethod;
  setMethod: (m: PaymentMethod) => void;
  reference: string;
  setReference: (v: string) => void;
  errors: Errors;
  total: number;
  customer: CustomerInfo;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  onCopy: (text: string, label: string) => void;
  copied: string | null;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
        <h2 className="flex items-center gap-2 text-lg font-bold text-brand-900">
          <ShieldCheck className="h-5 w-5 text-brand-700" /> Payment Method
        </h2>
        <p className="mt-1 text-sm text-slate-500">Choose how you'd like to pay. We'll verify your payment manually.</p>

        {/* Method selector */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => setMethod('momo')}
            className={`flex items-start gap-3 rounded-2xl border-2 p-5 text-left transition-all ${
              method === 'momo' ? 'border-brand-500 bg-brand-50/50 shadow-card' : 'border-slate-200 hover:border-brand-200'
            }`}
          >
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${method === 'momo' ? 'gradient-brand text-white' : 'bg-slate-100 text-slate-500'}`}>
              <Smartphone className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-bold text-brand-900">Mobile Money (MoMo)</p>
              <p className="mt-0.5 text-xs text-slate-500">MTN MobileMoney or Airtel Money</p>
            </div>
            {method === 'momo' && <CheckCircle2 className="ml-auto h-5 w-5 text-brand-600" />}
          </button>

          <button
            onClick={() => setMethod('bank')}
            className={`flex items-start gap-3 rounded-2xl border-2 p-5 text-left transition-all ${
              method === 'bank' ? 'border-brand-500 bg-brand-50/50 shadow-card' : 'border-slate-200 hover:border-brand-200'
            }`}
          >
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${method === 'bank' ? 'gradient-brand text-white' : 'bg-slate-100 text-slate-500'}`}>
              <Landmark className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-bold text-brand-900">Bank Transfer</p>
              <p className="mt-0.5 text-xs text-slate-500">Direct deposit or wire transfer</p>
            </div>
            {method === 'bank' && <CheckCircle2 className="ml-auto h-5 w-5 text-brand-600" />}
          </button>
        </div>

        {/* Payment details */}
        <div className="mt-6 rounded-2xl bg-slate-50 p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment Instructions</p>
          <p className="mt-1 text-sm text-slate-600">
            Send <span className="font-extrabold text-brand-900">{formatRwf(total)}</span> to the {method === 'momo' ? 'Mobile Money number' : 'bank account'} below, then enter the transaction reference to complete your order.
          </p>

          {method === 'momo' ? (
            <div className="mt-4 space-y-3">
              <DetailRow label="Provider" value={MOMO_DETAILS.provider} onCopy={onCopy} copied={copied} />
              <DetailRow label="MoMo Number" value={MOMO_DETAILS.number} onCopy={onCopy} copied={copied} highlight />
              <DetailRow label="Account Name" value={MOMO_DETAILS.accountName} onCopy={onCopy} copied={copied} />
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <DetailRow label="Bank Name" value={BANK_DETAILS.bankName} onCopy={onCopy} copied={copied} />
              <DetailRow label="Account Name" value={BANK_DETAILS.accountName} onCopy={onCopy} copied={copied} />
              <DetailRow label="Account Number" value={BANK_DETAILS.accountNumber} onCopy={onCopy} copied={copied} highlight />
              <DetailRow label="Branch" value={BANK_DETAILS.branch} onCopy={onCopy} copied={copied} />
              <DetailRow label="SWIFT Code" value={BANK_DETAILS.swift} onCopy={onCopy} copied={copied} />
            </div>
          )}

          <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Use your name "<span className="font-semibold">{customer.name || 'Your Name'}</span>" as the payment reference on your bank/MoMo app so we can match it quickly.</p>
          </div>
        </div>

        {/* Reference input */}
        <div className="mt-6">
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            {method === 'momo' ? 'MoMo Transaction ID' : 'Bank Transfer Reference'}
          </label>
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder={method === 'momo' ? 'e.g. MP250109.1234.A56789' : 'e.g. TRF-2026-00123'}
            className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-2 ${
              errors.reference ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-brand-400 focus:ring-brand-100'
            }`}
          />
          {errors.reference && <p className="mt-1 text-xs text-rose-500">{errors.reference}</p>}
          <p className="mt-2 text-xs text-slate-400">Enter the reference number you received after making the payment. Your order will be confirmed once verified.</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl gradient-accent px-7 py-3 text-sm font-bold text-white shadow-accent hover:opacity-95 transition disabled:opacity-60"
        >
          {submitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Placing Order...</>
          ) : (
            <><CheckCircle2 className="h-4 w-4" /> Complete Order — {formatRwf(total)}</>
          )}
        </button>
      </div>
    </div>
  );
}

function DetailRow({
  label, value, onCopy, copied, highlight,
}: {
  label: string;
  value: string;
  onCopy: (text: string, label: string) => void;
  copied: string | null;
  highlight?: boolean;
}) {
  const isCopied = copied === label;
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className={`truncate text-sm font-bold ${highlight ? 'text-brand-900 text-base' : 'text-slate-800'}`}>{value}</p>
      </div>
      <button
        onClick={() => onCopy(value, label)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-700 transition"
        aria-label={`Copy ${label}`}
      >
        {isCopied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

/* ───────────────── Success Step ───────────────── */

function SuccessStep({ order }: { order: OrderRecord }) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl bg-white p-8 text-center shadow-card sm:p-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 animate-scale-in">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h2 className="mt-5 text-2xl font-extrabold text-brand-900">Order Confirmed!</h2>
        <p className="mt-2 text-sm text-slate-500">
          Thank you, {order.customer_name?.split(' ')[0] || 'Learner'}! Your order has been placed successfully. We've sent a confirmation email to <span className="font-semibold text-slate-700">{order.customer_email}</span>.
        </p>

        {/* Order ID card */}
        <div className="mt-6 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/50 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Your Order ID</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-brand-900">{order.order_number}</p>
          <p className="mt-1 text-xs text-slate-500">Save this reference to track your order status.</p>
        </div>

        {/* Order summary */}
        <div className="mt-6 space-y-3 text-left">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Payment method</span>
            <span className="font-semibold text-slate-800 capitalize">{order.payment_method === 'momo' ? 'Mobile Money' : 'Bank Transfer'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Payment reference</span>
            <span className="font-semibold text-slate-800">{order.payment_reference}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Courses purchased</span>
            <span className="font-semibold text-slate-800">{order.items.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Status</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Confirmed
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-base">
            <span className="font-bold text-slate-800">Total Paid</span>
            <span className="font-extrabold text-brand-900">{formatRwf(order.total_amount)}</span>
          </div>
        </div>

        {/* What's next */}
        <div className="mt-6 rounded-xl bg-slate-50 p-5 text-left">
          <p className="text-sm font-bold text-brand-900">What happens next?</p>
          <ul className="mt-3 space-y-2.5">
            {[
              'Our team verifies your payment within 24 hours.',
              'You receive course access details by email once verified.',
              'You can start learning immediately after access is granted.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full gradient-brand text-xs font-bold text-white">{i + 1}</span>
                {step}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/courses" className="inline-flex items-center justify-center gap-2 rounded-xl gradient-brand px-6 py-3 text-sm font-bold text-white shadow-brand hover:opacity-95 transition">
            <FileText className="h-4 w-4" /> Browse More Courses
          </Link>
          <Link to="/" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
            <HomeIcon className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ───────────────── Shared bits ───────────────── */

function Row({ label, value, valueClass = '' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between text-sm text-slate-600">
      <span>{label}</span>
      <span className={`font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}

function NavButtons({
  onBack, backLabel, onNext, nextLabel,
}: {
  onBack: () => void;
  backLabel: string;
  onNext: () => void;
  nextLabel: string;
}) {
  return (
    <div className="mt-6 flex items-center justify-between gap-4">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
      >
        <ArrowLeft className="h-4 w-4" /> {backLabel}
      </button>
      <button
        onClick={onNext}
        className="inline-flex items-center gap-2 rounded-xl gradient-brand px-7 py-3 text-sm font-bold text-white shadow-brand hover:opacity-95 transition"
      >
        {nextLabel} <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
