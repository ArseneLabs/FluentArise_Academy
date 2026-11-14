import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, ShoppingBag, Landmark, Smartphone, CheckCircle2, Copy,
  ShieldCheck, Loader2, Trash2, FileText, Home as HomeIcon, Package, AlertCircle,
  Zap, CreditCard, Lock, Clock, MessageCircle, Phone, Check,
} from 'lucide-react';
import { useCart } from '@/store/cart';
import { useToast } from '@/store/toast';
import { formatRwf } from '@/data/courses';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { generateOrderNumber, type OrderRecord } from '@/lib/orders';
import { useAdminStore } from '@/admin/store/adminStore';
import { initiatePesapalPayment } from '@/lib/pesapalClient';
import PesapalPaymentModal from '@/components/checkout/PesapalPaymentModal';
import { notifyOrderPlaced } from '@/lib/emailService';

type Step = 'review' | 'details' | 'payment' | 'success';
type PaymentMethod = 'pesapal' | 'bank' | 'momo';

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pesapal');
  const [paymentReference, setPaymentReference] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // In-Page Pesapal Modal State
  const [pesapalModalOpen, setPesapalModalOpen] = useState(false);
  const [pesapalSession, setPesapalSession] = useState<{
    redirectUrl: string;
    orderTrackingId: string;
    orderNumber: string;
  } | null>(null);

  // Only redirect if cart is empty AND user has not placed an order AND is not currently submitting
  if (items.length === 0 && step !== 'success' && !order && !submitting) {
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
    // ─── Automated In-Page Online Checkout (Pesapal) ───
    if (paymentMethod === 'pesapal') {
      setSubmitting(true);
      try {
        const orderItems = items.map((i) => ({
          id: i.id,
          title: i.title,
          price: i.price,
          thumbnail: i.thumbnail,
          category: i.category,
        }));

        push('Launching secure in-page checkout...', 'info');
        const res = await initiatePesapalPayment({
          customerName: customer.name.trim(),
          customerEmail: customer.email.trim(),
          customerPhone: customer.phone.trim(),
          items: orderItems,
          totalAmount: total,
        });

        if (res && res.redirectUrl) {
          setPesapalSession({
            redirectUrl: res.redirectUrl,
            orderTrackingId: res.orderTrackingId,
            orderNumber: res.orderNumber,
          });
          setPesapalModalOpen(true);
        } else {
          throw new Error('Pesapal did not return a valid checkout link.');
        }
      } catch (err: any) {
        console.error('Pesapal checkout error:', err);
        push(err.message || 'Failed to connect to Pesapal. Please try again.', 'error');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // ─── Manual Bank / MoMo Transfer Flow ───
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
      status: 'pending',
    };

    try {
      let finalOrder: OrderRecord | null = null;

      if (isSupabaseConfigured && supabase) {
        // Try up to 3 times in case of order_number collision
        let lastError: unknown = null;
        for (let attempt = 0; attempt < 3; attempt++) {
          const attemptPayload = { ...payload, order_number: generateOrderNumber() };
          const { data, error } = await supabase
            .from('orders')
            .insert(attemptPayload)
            .select()
            .maybeSingle();

          if (!error && data) {
            finalOrder = data as OrderRecord;
            break;
          }
          lastError = error;
        }
        if (!finalOrder) {
          console.warn('Supabase insert did not return record, using client fallback:', lastError);
        }
      }

      if (!finalOrder) {
        // Offline / fallback order record
        finalOrder = {
          id: crypto.randomUUID(),
          ...payload,
          created_at: new Date().toISOString(),
        };
      }

      // 1. Store order record in state
      setOrder(finalOrder);

      // 2. Dispatch automated email notification to client and admin
      notifyOrderPlaced({
        orderNumber: finalOrder.order_number,
        customerName: payload.customer_name,
        customerEmail: payload.customer_email,
        customerPhone: payload.customer_phone,
        items: orderItems,
        totalAmount: payload.total_amount,
        paymentMethod: payload.payment_method,
        paymentReference: payload.payment_reference,
        status: 'pending',
      }).catch((emailErr) => {
        console.warn('Order placed email notification note:', emailErr);
      });

      // 3. Sync to local admin store
      useAdminStore.getState().addOrder({
        id: finalOrder.id,
        reference: finalOrder.order_number,
        studentName: payload.customer_name,
        studentEmail: payload.customer_email,
        customerPhone: payload.customer_phone,
        paymentReference: payload.payment_reference,
        courseTitle: orderItems.map((i) => i.title).join(', '),
        courseIds: orderItems.map((i) => i.id),
        amount: payload.total_amount,
        method: payload.payment_method === 'momo' ? 'MTN Mobile Money' : 'Bank Transfer',
        status: 'pending',
        date: finalOrder.created_at,
      });

      // 3. Switch to success step FIRST
      setStep('success');

      // 4. Clear cart after transitioning step
      clear();

      push('Order submitted! Awaiting payment verification.', 'success');
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

      {/* In-Page Pesapal Secure Payment Modal */}
      {pesapalSession && (
        <PesapalPaymentModal
          isOpen={pesapalModalOpen}
          redirectUrl={pesapalSession.redirectUrl}
          orderTrackingId={pesapalSession.orderTrackingId}
          orderNumber={pesapalSession.orderNumber}
          totalAmount={total}
          customerName={customer.name}
          customerEmail={customer.email}
          onClose={() => setPesapalModalOpen(false)}
          onSuccess={(data) => {
            setOrder({
              id: pesapalSession.orderTrackingId,
              order_number: pesapalSession.orderNumber,
              customer_name: customer.name,
              customer_email: customer.email,
              customer_phone: customer.phone,
              items: items.map((i) => ({ ...i, price: i.price })),
              total_amount: total,
              payment_method: 'momo',
              payment_reference: data.details?.confirmationCode || pesapalSession.orderTrackingId,
              status: 'confirmed',
              created_at: new Date().toISOString(),
            });
            setPesapalModalOpen(false);
            setStep('success');
            push('Payment successfully confirmed! Course access unlocked.', 'success');
          }}
        />
      )}
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
        <p className="mt-1 text-sm text-slate-500">
          Choose your preferred payment method. Online payments via Pesapal provide instant, automated course activation.
        </p>

        {/* Method selector */}
        <div className="mt-6 space-y-3">
          {/* 1. Automated Pesapal Checkout (Recommended) */}
          <button
            onClick={() => setMethod('pesapal')}
            className={`w-full flex items-start gap-4 rounded-2xl border-2 p-5 text-left transition-all ${
              method === 'pesapal'
                ? 'border-purple-600 bg-purple-50/50 shadow-md ring-2 ring-purple-100'
                : 'border-slate-200 hover:border-purple-200 bg-white'
            }`}
          >
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition ${
                method === 'pesapal'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <Zap className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-base font-bold text-slate-900">
                  Instant Online Payment (MoMo & Card)
                </p>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                  ⚡ Recommended · Instant
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600">
                MTN MobileMoney, Airtel Money, Visa & Mastercard via secure USSD push prompt.
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="rounded-md bg-yellow-100 border border-yellow-200/80 px-2 py-0.5 text-[10px] font-bold text-yellow-900">
                  MTN MoMo
                </span>
                <span className="rounded-md bg-rose-100 border border-rose-200/80 px-2 py-0.5 text-[10px] font-bold text-rose-900">
                  Airtel Money
                </span>
                <span className="rounded-md bg-blue-100 border border-blue-200/80 px-2 py-0.5 text-[10px] font-bold text-blue-900">
                  Visa / Mastercard
                </span>
                <span className="text-[10px] text-slate-400 font-medium ml-1">
                  Powered by Pesapal
                </span>
              </div>
            </div>
            {method === 'pesapal' && (
              <CheckCircle2 className="h-6 w-6 shrink-0 text-purple-600" />
            )}
          </button>

          {/* 2. Manual Methods Row */}
          <div className="grid gap-3 sm:grid-cols-2 pt-1">
            <button
              onClick={() => setMethod('momo')}
              className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                method === 'momo'
                  ? 'border-brand-500 bg-brand-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                  method === 'momo' ? 'gradient-brand text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Smartphone className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-brand-900">Manual MoMo Transfer</p>
                <p className="mt-0.5 text-[11px] text-slate-500">Manual reference approval</p>
              </div>
              {method === 'momo' && <CheckCircle2 className="ml-auto h-5 w-5 text-brand-600" />}
            </button>

            <button
              onClick={() => setMethod('bank')}
              className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                method === 'bank'
                  ? 'border-brand-500 bg-brand-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                  method === 'bank' ? 'gradient-brand text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Landmark className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-brand-900">Bank Transfer (BK)</p>
                <p className="mt-0.5 text-[11px] text-slate-500">Direct deposit / SWIFT</p>
              </div>
              {method === 'bank' && <CheckCircle2 className="ml-auto h-5 w-5 text-brand-600" />}
            </button>
          </div>
        </div>

        {/* Dynamic Payment Details Section */}
        {method === 'pesapal' ? (
          <div className="mt-6 rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50/70 to-indigo-50/40 p-6">
            <div className="flex items-center gap-2 text-sm font-bold text-purple-950">
              <ShieldCheck className="h-5 w-5 text-purple-600" />
              <span>Automated Checkout Instructions</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              When you click <strong className="text-purple-900">"Pay with Pesapal"</strong> below, you will be redirected to the secure Pesapal checkout page. Simply select <strong>MTN Mobile Money</strong>, <strong>Airtel Money</strong>, or <strong>Card</strong>, and authorize the payment.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 text-xs text-slate-700">
              <div className="flex items-center gap-2 rounded-xl bg-white/80 p-2.5 border border-purple-100/60">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Instant course unlocking</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/80 p-2.5 border border-purple-100/60">
                <Lock className="h-4 w-4 text-purple-600 shrink-0" />
                <span>256-bit bank-grade encryption</span>
              </div>
            </div>
          </div>
        ) : (
          <>
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

            {/* Reference input for manual methods */}
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
          </>
        )}
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
          className={`inline-flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-bold text-white transition disabled:opacity-60 ${
            method === 'pesapal'
              ? 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200'
              : 'gradient-accent shadow-accent hover:opacity-95'
          }`}
        >
          {submitting ? (
            method === 'pesapal' ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Connecting to Pesapal...</>
            ) : (
              <><Loader2 className="h-4 w-4 animate-spin" /> Placing Order...</>
            )
          ) : method === 'pesapal' ? (
            <><Lock className="h-4 w-4" /> Pay with Pesapal — {formatRwf(total)}</>
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
  const isPending = order.status === 'pending';
  const [copiedId, setCopiedId] = useState(false);
  const push = useToast((s) => s.push);

  const copyOrderId = () => {
    navigator.clipboard?.writeText(order.order_number);
    setCopiedId(true);
    push(`Order ID ${order.order_number} copied to clipboard!`, 'info');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const supportNumber = '0795041000';
  const supportIntl = '+250795041000';
  const courseList = order.items.map((i) => i.title).join(', ');
  const whatsappMessage = encodeURIComponent(
    `Hello FluentaRise! I have placed order ${order.order_number} for "${courseList}". My payment reference is: ${
      order.payment_reference || 'N/A'
    }. Please verify my payment so my course can be activated.`
  );
  const whatsappUrl = `https://wa.me/${supportIntl.replace('+', '')}?text=${whatsappMessage}`;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-3xl bg-white p-8 text-center shadow-card sm:p-10 border border-slate-100">
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl animate-scale-in shadow-sm ${
            isPending ? 'bg-amber-50 text-amber-600 ring-8 ring-amber-50/50' : 'bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50'
          }`}
        >
          {isPending ? (
            <Clock className="h-10 w-10 text-amber-600" />
          ) : (
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          )}
        </div>

        <h2 className="mt-6 text-2xl font-extrabold text-brand-900 sm:text-3xl">
          Order Placed Successfully!
        </h2>
        <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Thank you, <span className="font-bold text-slate-800">{order.customer_name?.split(' ')[0] || 'Learner'}</span>! We have received your order. Please keep your Order ID handy while we verify your payment.
        </p>

        {/* Order ID card with copy button */}
        <div className="mt-6 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/60 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Your Order ID / Tracking Number</p>
            <p className="mt-1 font-mono text-2xl font-black text-brand-950 tracking-tight">{order.order_number}</p>
            <p className="text-xs text-slate-500 mt-0.5">Use this number when contacting support or checking status.</p>
          </div>
          <button
            onClick={copyOrderId}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-brand-800 shadow-sm border border-brand-200 hover:bg-brand-50 transition shrink-0"
          >
            {copiedId ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" /> Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-brand-600" /> Copy Order ID
              </>
            )}
          </button>
        </div>

        {/* 5 - 10 Minutes Verification Alert Banner */}
        {isPending && (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-left">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <p className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                Payment Verification Notice (Usually takes 5 to 10 minutes)
              </p>
            </div>
            <p className="mt-1.5 text-xs text-amber-800 leading-relaxed">
              Our administration team is currently verifying your transaction reference (<strong>{order.payment_reference || 'Submitted'}</strong>) against our Bank / MTN MoMo records. Once approved, course lectures and materials will unlock automatically.
            </p>
          </div>
        )}

        {/* Contact Support for Instant Approval Card */}
        <div className="mt-5 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 to-teal-50/50 p-5 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <MessageCircle size={14} className="text-emerald-700" /> Need Instant Approval or Have a Question?
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Contact our support team directly on WhatsApp or Call with your Order ID:
              </p>
              <p className="mt-1 font-mono text-xs font-bold text-slate-900">
                Tel: <a href={`tel:${supportNumber}`} className="text-emerald-700 hover:underline">{supportNumber}</a> ({supportIntl})
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
              >
                <MessageCircle size={15} /> Chat on WhatsApp
              </a>
              <a
                href={`tel:${supportNumber}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <Phone size={14} /> Call Support
              </a>
            </div>
          </div>
        </div>

        {/* Order summary breakdown */}
        <div className="mt-6 space-y-3 text-left">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Student Name</span>
            <span className="font-semibold text-slate-800">{order.customer_name}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Email & Phone</span>
            <span className="font-semibold text-slate-800">{order.customer_email} · {order.customer_phone}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Payment method</span>
            <span className="font-semibold text-slate-800 capitalize">
              {order.payment_method === 'momo' ? 'MTN Mobile Money' : 'Bank Transfer'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Transaction Reference</span>
            <span className="font-mono text-xs font-bold text-brand-800 bg-brand-50 px-2 py-0.5 rounded">
              {order.payment_reference || 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Courses requested</span>
            <span className="font-semibold text-slate-800">{order.items.length} Course{order.items.length > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Order Status</span>
            {isPending ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                <Clock className="h-3.5 w-3.5" /> Pending Verification (5–10 mins)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" /> Confirmed & Active
              </span>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-base">
            <span className="font-bold text-slate-800">Total Amount</span>
            <span className="font-extrabold text-brand-900">{formatRwf(order.total_amount)}</span>
          </div>
        </div>

        {/* What's next timeline */}
        <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-left border border-slate-100">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-900">What happens next?</p>
          <ul className="mt-3 space-y-2.5">
            {[
              'Our finance team verifies your transaction reference (usually takes 5 to 10 minutes).',
              'Once approved, course videos, lessons, and assignments unlock immediately in your portal.',
              'You can track your real-time approval status in your Student Portal under Order History.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-xs text-slate-600">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full gradient-brand text-[10px] font-bold text-white">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/student/orders"
            className="inline-flex items-center justify-center gap-2 rounded-xl gradient-brand px-6 py-3 text-sm font-bold text-white shadow-brand hover:opacity-95 transition"
          >
            <Clock className="h-4 w-4" /> Go to Student Portal (View Orders)
          </Link>
          <Link
            to="/courses"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <FileText className="h-4 w-4" /> Browse More Courses
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <HomeIcon className="h-4 w-4" /> Home
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
