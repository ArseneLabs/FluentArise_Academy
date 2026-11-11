import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Users,
  BookOpen,
  FileCheck2,
  TrendingUp,
  ClipboardList,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { PageHeader } from '../components/AdminLayout';
import { formatCompactRwf } from '../lib/format';

function KpiCard({
  label,
  value,
  icon,
  accent,
  hint,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
  hint?: string;
}) {
  return (
    <div className="card relative overflow-hidden p-5 transition hover:shadow-card-hover">
      <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
      <div className="flex items-start justify-between">
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${accent} bg-opacity-10`}>
          {icon}
        </div>
        {hint && (
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {hint}
          </span>
        )}
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

export default function DashboardOverview() {
  const { courses, submissions, orders } = useAdminStore();

  const stats = useMemo(() => {
    const revenue = orders.filter((o) => o.status === 'paid').reduce((s, o) => s + o.amount, 0);
    const activeStudents = new Set(orders.filter((o) => o.status === 'paid').map((o) => o.studentName)).size;
    const published = courses.filter((c) => c.published).length;
    const drafts = courses.filter((c) => !c.published).length;
    const pending = submissions.filter((s) => s.status === 'needs_grading' || s.status === 'submitted').length;
    return { revenue, activeStudents, published, drafts, pending };
  }, [courses, submissions, orders]);

  const pendingSubs = submissions
    .filter((s) => s.status === 'needs_grading' || s.status === 'submitted')
    .slice(0, 5);
  const recentOrders = orders.filter((o) => o.status === 'paid').slice(0, 5);

  return (
    <>
      <PageHeader
        title="Academy Overview"
        subtitle="Platform metrics, active enrollments, and operational queue"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/admin/courses" className="btn-outline">
              <BookOpen size={16} /> Manage Courses
            </Link>
            <Link to="/admin/submissions" className="btn-primary">
              <ClipboardList size={16} /> Review Submissions
            </Link>
          </div>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Revenue"
          value={formatCompactRwf(stats.revenue)}
          hint="Gross Rwf"
          icon={<Wallet size={20} className="text-emerald-600" />}
          accent="bg-emerald-500"
        />
        <KpiCard
          label="Active Students"
          value={stats.activeStudents.toString()}
          hint="Paid learners"
          icon={<Users size={20} className="text-sky-600" />}
          accent="bg-sky-500"
        />
        <KpiCard
          label="Academy Courses"
          value={`${stats.published} published / ${stats.drafts} drafts`}
          hint="Catalog"
          icon={<BookOpen size={20} className="text-purple-600" />}
          accent="bg-purple-500"
        />
        <KpiCard
          label="Pending Submissions"
          value={stats.pending.toString()}
          hint="To review"
          icon={<FileCheck2 size={20} className="text-amber-600" />}
          accent="bg-amber-500"
        />
      </div>

      {/* Top courses & Overview Grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Trend summary or empty state */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Enrollment & Revenue Trend
              </h2>
              <p className="text-xs text-slate-400">Live operational data</p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <TrendingUp size={36} className="text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No enrollment transactions yet</p>
              <p className="text-xs text-slate-500 mt-1">
                When students purchase courses, monthly revenue and enrollment charts will appear here.
              </p>
            </div>
          ) : (
            <div className="py-6 space-y-2">
              <p className="text-sm font-semibold text-slate-800">
                {orders.length} total orders recorded ({formatCompactRwf(stats.revenue)})
              </p>
            </div>
          )}
        </div>

        {/* Top courses */}
        <div className="card p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-display text-base font-bold text-slate-900">Top Courses</h2>
            <Link to="/admin/courses" className="text-xs font-semibold text-sky-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4">
            {courses.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <p>No courses created yet.</p>
                <Link
                  to="/admin/courses"
                  className="mt-3 inline-flex items-center gap-1.5 font-bold text-sky-600 hover:underline"
                >
                  <PlusCircle size={14} /> Create your first course
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {[...courses]
                  .filter((c) => c.published)
                  .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
                  .slice(0, 4)
                  .map((c, i) => (
                    <div key={c.id} className="flex items-center gap-3">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-slate-100 text-xs font-bold text-slate-500">
                        {i + 1}
                      </span>
                      <img src={c.thumbnail} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">{c.title}</p>
                        <p className="text-xs text-slate-400">{c.studentsCount || 0} students</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-600">
                        {formatCompactRwf(c.revenue || 0)}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick action tables */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent enrollments */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-display text-base font-bold text-slate-900">
              Recent Enrollments
            </h2>
            <Link
              to="/admin/enrollments"
              className="flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700"
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div>
            {recentOrders.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No orders or enrollments recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {recentOrders.map((o) => (
                  <div key={o.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{o.studentName}</p>
                      <p className="text-xs text-slate-400">{o.courseTitle}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-900">{formatCompactRwf(o.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending Submissions */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-display text-base font-bold text-slate-900">
              Submissions Needing Grading
            </h2>
            <Link
              to="/admin/submissions"
              className="flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700"
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div>
            {pendingSubs.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                All submissions have been reviewed! No pending tasks to grade.
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {pendingSubs.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{s.studentName}</p>
                      <p className="text-xs text-slate-400">{s.taskTitle}</p>
                    </div>
                    <Link
                      to="/admin/submissions"
                      className="rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700 hover:bg-sky-100 transition"
                    >
                      Grade
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
