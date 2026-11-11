import { useMemo } from 'react';
import { ShoppingCart, CheckCircle2, FileText } from 'lucide-react';
import { formatRwf } from '../../admin/lib/format';
import { useAdminStore } from '../../admin/store/adminStore';
import { useAuth } from '../../auth/AuthProvider';

export default function StudentOrders() {
  const { user } = useAuth();
  const { orders } = useAdminStore();

  const myOrders = useMemo(() => {
    const userEmail = user?.email?.toLowerCase();
    return orders.filter((o) => o.studentEmail.toLowerCase() === userEmail);
  }, [orders, user]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950">
            Order History & Receipts
          </h1>
          <p className="text-sm text-slate-500">
            View course enrollment transactions and payment receipts.
          </p>
        </div>
      </div>

      {myOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          <ShoppingCart size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-display text-base font-bold text-slate-800">
            No purchase history found
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            When you purchase course enrollments via Mobile Money or Bank Transfer, your receipts will be archived here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                  <th className="py-3 px-4">Order Reference</th>
                  <th className="py-3 px-4">Course Enrolled</th>
                  <th className="py-3 px-4">Payment Method</th>
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
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {ord.courseTitle}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">{ord.method}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">{ord.date}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatRwf(ord.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                        <CheckCircle2 size={12} /> {ord.status === 'paid' ? 'Paid & Confirmed' : ord.status}
                      </span>
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
