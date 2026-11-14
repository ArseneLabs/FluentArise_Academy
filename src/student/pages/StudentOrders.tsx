import { useMemo } from 'react';
import { ShoppingCart, CheckCircle2, Clock, XCircle, AlertCircle, FileText } from 'lucide-react';
import { formatRwf, formatDate, relativeDate } from '../../admin/lib/format';
import { useAdminStore } from '../../admin/store/adminStore';
import { useAuth } from '../../auth/AuthProvider';

export default function StudentOrders() {
  const { user } = useAuth();
  const { orders } = useAdminStore();

  const myOrders = useMemo(() => {
    const userEmail = user?.email?.toLowerCase();
    return orders.filter((o) => o.studentEmail.toLowerCase() === userEmail);
  }, [orders, user]);

  const hasPending = myOrders.some((o) => o.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950">
            Order History & Payment Status
          </h1>
          <p className="text-sm text-slate-500">
            Track your course purchases, transaction references, and approval status.
          </p>
        </div>
      </div>

      {hasPending && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
          <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-950">Payment Verification Note</p>
            <p className="mt-0.5 text-amber-800 leading-relaxed">
              Orders with status <strong>Pending Verification</strong> are currently being matched against our MTN Mobile Money or Bank records. Your classroom access will automatically unlock as soon as our team approves the transaction.
            </p>
          </div>
        </div>
      )}

      {myOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          <ShoppingCart size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-display text-base font-bold text-slate-800">
            No purchase history found
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            When you purchase course enrollments via Mobile Money or Bank Transfer, your receipts and approval status will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Course Enrolled</th>
                  <th className="py-3 px-4">Method & Ref</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-900">
                      {ord.reference}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{ord.courseTitle}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-xs font-medium text-slate-700">{ord.method}</p>
                      {ord.paymentReference && (
                        <p className="font-mono text-[11px] text-slate-400">Ref: {ord.paymentReference}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      <p>{formatDate(ord.date)}</p>
                      <p className="text-[11px] text-slate-400">{relativeDate(ord.date)}</p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatRwf(ord.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      {ord.status === 'paid' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                          <CheckCircle2 size={13} /> Paid & Enrolled
                        </span>
                      )}
                      {ord.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                          <Clock size={13} /> Pending Verification
                        </span>
                      )}
                      {ord.status === 'failed' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-200">
                          <XCircle size={13} /> Unverified / Rejected
                        </span>
                      )}
                      {ord.status === 'refunded' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                          Refunded
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
