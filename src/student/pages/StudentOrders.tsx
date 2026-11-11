import { ShoppingCart, CheckCircle2, FileText, ArrowRight, ExternalLink } from 'lucide-react';
import { formatRwf } from '../../admin/lib/format';
import { Link } from 'react-router-dom';

const studentOrders = [
  {
    id: 'ord_1',
    reference: 'FR-2026-0891',
    courseTitle: 'Java & Object-Oriented Programming Mastery',
    date: 'February 12, 2026',
    amount: 120000,
    method: 'MTN Mobile Money (*182#)',
    status: 'paid',
  },
  {
    id: 'ord_2',
    reference: 'FR-2026-0642',
    courseTitle: 'Professional English Fluency & Public Speaking',
    date: 'January 28, 2026',
    amount: 95000,
    method: 'Bank Transfer (BK)',
    status: 'paid',
  },
  {
    id: 'ord_3',
    reference: 'FR-2026-0419',
    courseTitle: 'Full-Stack Modern Web Engineering',
    date: 'January 10, 2026',
    amount: 150000,
    method: 'MTN Mobile Money (*182#)',
    status: 'paid',
  },
];

export default function StudentOrders() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950">
            Order History & Receipts
          </h1>
          <p className="text-sm text-slate-500">
            View past course enrollment transactions and payment receipts.
          </p>
        </div>
      </div>

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
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentOrders.map((ord) => (
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
                      <CheckCircle2 size={12} /> Paid & Confirmed
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => alert(`Receipt for ${ord.reference} downloaded.`)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:underline"
                    >
                      <FileText size={13} /> View Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
