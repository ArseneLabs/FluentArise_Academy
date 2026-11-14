import { useState } from 'react';
import {
  ShoppingCart,
  Search,
  Plus,
  Check,
  CreditCard,
  Smartphone,
  Building2,
  TrendingUp,
  Wallet,
  Clock,
  X,
  AlertCircle,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import { useAdminStore, uid } from '../store/adminStore';
import { PageHeader } from '../components/AdminLayout';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { formatRwf, formatDate, relativeDate } from '../lib/format';
import type { Order, PaymentMethod, OrderStatus } from '../types';
import { notifyOrderStatusChanged } from '../../lib/emailService';

const methodIcon: Record<PaymentMethod, React.ReactNode> = {
  'MTN Mobile Money': <Smartphone size={14} />,
  'Airtel Money': <Smartphone size={14} />,
  Card: <CreditCard size={14} />,
  'Bank Transfer': <Building2 size={14} />,
};

const statusTone: Record<OrderStatus, 'success' | 'warning' | 'error' | 'neutral'> = {
  paid: 'success',
  pending: 'warning',
  refunded: 'error',
  failed: 'neutral',
};

export default function EnrollmentsOrders() {
  const { orders, courses, addOrder, updateOrderStatus } = useAdminStore();
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [manualOpen, setManualOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; tone: 'success' | 'info' | 'error' } | null>(null);

  const filtered = orders.filter((o) => {
    if (
      query &&
      !o.studentName.toLowerCase().includes(query.toLowerCase()) &&
      !o.studentEmail.toLowerCase().includes(query.toLowerCase()) &&
      !o.reference.toLowerCase().includes(query.toLowerCase()) &&
      !(o.paymentReference && o.paymentReference.toLowerCase().includes(query.toLowerCase())) &&
      !o.courseTitle.toLowerCase().includes(query.toLowerCase())
    ) {
      return false;
    }
    if (filterStatus !== 'all' && o.status !== filterStatus) return false;
    return true;
  });

  const totalRevenue = orders.filter((o) => o.status === 'paid').reduce((s, o) => s + o.amount, 0);
  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  const showFeedback = (message: string, tone: 'success' | 'info' | 'error' = 'success') => {
    setFeedback({ message, tone });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleApprove = (order: Order) => {
    updateOrderStatus(order.id, 'paid');
    notifyOrderStatusChanged({
      orderNumber: order.reference,
      customerName: order.studentName,
      customerEmail: order.studentEmail,
      newStatus: 'confirmed',
      totalAmount: order.amount,
      paymentReference: order.paymentReference,
      items: [{ id: '', title: order.courseTitle, price: order.amount }],
    }).catch(console.warn);
    showFeedback(`Payment verified & access granted to ${order.studentName} for "${order.courseTitle}". Confirmation email sent.`, 'success');
  };

  const handleReject = (order: Order) => {
    if (confirm(`Reject payment reference for order ${order.reference}? This will keep course access locked.`)) {
      updateOrderStatus(order.id, 'failed');
      notifyOrderStatusChanged({
        orderNumber: order.reference,
        customerName: order.studentName,
        customerEmail: order.studentEmail,
        newStatus: 'failed',
        totalAmount: order.amount,
        paymentReference: order.paymentReference,
        note: 'Payment reference could not be verified by administration. Please reach out to support if you believe this is an error.',
      }).catch(console.warn);
      showFeedback(`Order ${order.reference} marked as unverified / rejected. Notice email sent.`, 'info');
    }
  };

  const handleRevoke = (order: Order) => {
    if (confirm(`Revoke course access for ${order.studentName}?`)) {
      updateOrderStatus(order.id, 'pending');
      notifyOrderStatusChanged({
        orderNumber: order.reference,
        customerName: order.studentName,
        customerEmail: order.studentEmail,
        newStatus: 'pending',
        totalAmount: order.amount,
        paymentReference: order.paymentReference,
        note: 'Course access has been revoked by administration.',
      }).catch(console.warn);
      showFeedback(`Course access revoked for order ${order.reference}. Client notified via email.`, 'info');
    }
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <>
      <PageHeader
        title="Enrollments & Orders"
        subtitle="Verify offline payments and grant course access to students"
        icon={<ShoppingCart size={20} />}
        actions={
          <button className="btn-primary" onClick={() => setManualOpen(true)}>
            <Plus size={16} /> Manual Enrollment
          </button>
        }
      />

      {feedback && (
        <div
          className={`mb-5 flex items-center justify-between rounded-xl p-4 text-sm font-semibold transition ${
            feedback.tone === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : feedback.tone === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.tone === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Pending verification alert banner */}
      {pendingCount > 0 && (
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-amber-800/40 dark:bg-amber-950/20">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-950 dark:text-amber-200">
                {pendingCount} order{pendingCount > 1 ? 's' : ''} awaiting payment verification
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Check your MTN MoMo / Bank statements for each transaction ID before clicking &ldquo;Approve&rdquo;.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilterStatus('pending')}
            className="self-start rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition sm:self-center"
          >
            Show Pending Only
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card flex items-center gap-4 p-5">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-success-50 text-success-600 dark:bg-success-500/15">
            <Wallet size={20} />
          </div>
          <div>
            <p className="font-display text-xl font-bold text-slate-900 dark:text-white">{formatRwf(totalRevenue)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total verified collected</p>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-5">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-info-50 text-info-600 dark:bg-info-500/15">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="font-display text-xl font-bold text-slate-900 dark:text-white">{orders.length}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total orders</p>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-5">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/15">
            <Clock size={20} />
          </div>
          <div>
            <p className="font-display text-xl font-bold text-slate-900 dark:text-white">{pendingCount}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pending payment reviews</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-10"
            placeholder="Search by student name, email, order reference, or TxID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select className="input sm:w-48" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All statuses ({orders.length})</option>
          <option value="pending">Pending Verification ({pendingCount})</option>
          <option value="paid">Paid & Enrolled ({orders.filter((o) => o.status === 'paid').length})</option>
          <option value="failed">Rejected ({orders.filter((o) => o.status === 'failed').length})</option>
          <option value="refunded">Refunded ({orders.filter((o) => o.status === 'refunded').length})</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-ink-700">
                <th className="px-5 py-3">Order & Ref</th>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Course</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-ink-700/60">
              {filtered.map((o) => (
                <tr key={o.id} className="table-row-hover">
                  <td className="px-5 py-3">
                    <p className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200">{o.reference}</p>
                    {o.paymentReference ? (
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded">
                          TxID: {o.paymentReference}
                        </span>
                        <button
                          onClick={() => copyText(o.paymentReference!, o.reference)}
                          className="text-slate-400 hover:text-slate-600"
                          title="Copy Transaction ID"
                        >
                          {copied === o.reference ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No TxID</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{o.studentName}</p>
                    <p className="text-xs text-slate-400">{o.studentEmail}</p>
                    {o.customerPhone && (
                      <p className="text-[11px] text-slate-400">Tel: {o.customerPhone}</p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={o.courseTitle}>
                    {o.courseTitle}
                  </td>
                  <td className="px-5 py-3 font-bold text-slate-800 dark:text-slate-100">{formatRwf(o.amount)}</td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      {methodIcon[o.method]} {o.method}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-slate-600 dark:text-slate-300">{formatDate(o.date)}</p>
                    <p className="text-xs text-slate-400">{relativeDate(o.date)}</p>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={statusTone[o.status]} dot>
                      {o.status === 'paid' ? 'Paid & Active' : o.status === 'pending' ? 'Pending Review' : o.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {o.status === 'pending' && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(o)}
                          className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                          title="Verify payment and unlock course for student"
                        >
                          <Check size={14} /> Approve & Unlock
                        </button>
                        <button
                          onClick={() => handleReject(o)}
                          className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition"
                          title="Mark as invalid payment reference"
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    )}
                    {o.status === 'paid' && (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          Enrolled
                        </span>
                        <button
                          onClick={() => handleRevoke(o)}
                          className="text-[11px] text-slate-400 hover:text-rose-600 transition underline"
                          title="Revoke access and set back to pending"
                        >
                          Revoke
                        </button>
                      </div>
                    )}
                    {o.status === 'failed' && (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs font-semibold text-rose-500">
                          Rejected
                        </span>
                        <button
                          onClick={() => handleApprove(o)}
                          className="text-xs font-bold text-purple-600 hover:text-purple-700 transition underline"
                        >
                          Approve
                        </button>
                      </div>
                    )}
                    {o.status === 'refunded' && (
                      <span className="text-xs text-slate-400">Refunded</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <ShoppingCart size={32} className="mx-auto text-slate-300" />
            <p className="mt-3 text-sm text-slate-400">No orders match your filters.</p>
          </div>
        )}
      </div>

      {manualOpen && (
        <ManualEnrollmentModal
          courses={courses.map((c) => ({ id: c.id, title: c.title, price: c.discountPrice ?? c.price }))}
          onClose={() => setManualOpen(false)}
          onEnroll={(data) => {
            const order: Order = {
              id: uid('o'),
              reference: `FR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              studentName: data.studentName,
              studentEmail: data.studentEmail,
              courseTitle: data.courseTitle,
              amount: 0,
              method: 'Bank Transfer',
              status: 'paid',
              date: new Date().toISOString(),
            };
            addOrder(order);
            showFeedback(`Manual enrollment granted to ${data.studentName} for "${data.courseTitle}".`, 'success');
            setManualOpen(false);
          }}
        />
      )}
    </>
  );
}

function ManualEnrollmentModal({
  courses,
  onClose,
  onEnroll,
}: {
  courses: { id: string; title: string; price: number }[];
  onClose: () => void;
  onEnroll: (d: { studentName: string; studentEmail: string; courseTitle: string }) => void;
}) {
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [courseId, setCourseId] = useState(courses[0]?.id ?? '');

  const course = courses.find((c) => c.id === courseId);

  return (
    <Modal
      open
      onClose={onClose}
      title="Manual Enrollment"
      subtitle="Grant instant course access to a student"
      size="md"
      footer={
        <>
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            disabled={!studentName || !studentEmail}
            onClick={() => onEnroll({ studentName, studentEmail, courseTitle: course?.title ?? '' })}
          >
            <Check size={16} /> Grant Access
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Student Name</label>
          <input className="input" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="e.g. Mugisha Eric" />
        </div>
        <div>
          <label className="label">Student Email</label>
          <input className="input" type="email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} placeholder="eric@mail.rw" />
        </div>
        <div>
          <label className="label">Course</label>
          <select className="input" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <div className="rounded-xl bg-success-50 p-3 text-sm text-success-700 dark:bg-success-500/10 dark:text-success-500">
          The student will receive immediate access to <strong>{course?.title}</strong> at no charge.
        </div>
      </div>
    </Modal>
  );
}
