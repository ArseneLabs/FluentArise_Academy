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
} from 'lucide-react';
import { useAdminStore, uid } from '../store/adminStore';
import { PageHeader } from '../components/AdminLayout';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { formatRwf, formatDate, relativeDate } from '../lib/format';
import type { Order, PaymentMethod, OrderStatus } from '../types';

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
  const { orders, courses, addOrder } = useAdminStore();
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [manualOpen, setManualOpen] = useState(false);

  const filtered = orders.filter((o) => {
    if (query && !o.studentName.toLowerCase().includes(query.toLowerCase()) && !o.reference.toLowerCase().includes(query.toLowerCase())) return false;
    if (filterStatus !== 'all' && o.status !== filterStatus) return false;
    return true;
  });

  const totalRevenue = orders.filter((o) => o.status === 'paid').reduce((s, o) => s + o.amount, 0);
  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <>
      <PageHeader
        title="Enrollments & Orders"
        subtitle="Track payments and grant manual course access"
        icon={<ShoppingCart size={20} />}
        actions={
          <button className="btn-primary" onClick={() => setManualOpen(true)}>
            <Plus size={16} /> Manual Enrollment
          </button>
        }
      />

      {/* Stats */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card flex items-center gap-4 p-5">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-success-50 text-success-600 dark:bg-success-500/15">
            <Wallet size={20} />
          </div>
          <div>
            <p className="font-display text-xl font-bold text-slate-900 dark:text-white">{formatRwf(totalRevenue)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total collected</p>
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
            <ShoppingCart size={20} />
          </div>
          <div>
            <p className="font-display text-xl font-bold text-slate-900 dark:text-white">{pendingCount}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pending payments</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-10" placeholder="Search by student or reference…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select className="input sm:w-48" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-ink-700">
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Course</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-ink-700/60">
              {filtered.map((o) => (
                <tr key={o.id} className="table-row-hover">
                  <td className="px-5 py-3 font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">{o.reference}</td>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{o.studentName}</p>
                    <p className="text-xs text-slate-400">{o.studentEmail}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{o.courseTitle}</td>
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
                      {o.status}
                    </Badge>
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
