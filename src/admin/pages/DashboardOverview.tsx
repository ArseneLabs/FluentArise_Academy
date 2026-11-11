import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Users,
  BookOpen,
  FileCheck2,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Plus,
  ClipboardList,
  ChevronRight,
} from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { PageHeader } from '../components/AdminLayout';
import Badge, { toneForSubmissionStatus } from '../components/ui/Badge';
import { formatCompactRwf, formatRwf, relativeDate } from '../lib/format';

function KpiCard({
  label,
  value,
  delta,
  deltaTone,
  icon,
  accent,
  alert,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: 'up' | 'down';
  icon: React.ReactNode;
  accent: string;
  alert?: string;
}) {
  return (
    <div className="card relative overflow-hidden p-5 transition hover:shadow-card-hover">
      <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
      <div className="flex items-start justify-between">
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${accent} bg-opacity-10`}>
          {icon}
        </div>
        {delta && (
          <span
            className={`chip ${
              deltaTone === 'up'
                ? 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500'
                : 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400'
            }`}
          >
            {deltaTone === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {delta}
          </span>
        )}
        {alert && (
          <span className="chip bg-coral-50 text-coral-700 dark:bg-coral-500/15 dark:text-coral-300">
            {alert}
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

  // Build a 7-month trend from mock revenue + enrollment
  const trend = useMemo(() => {
    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
    const rev = [2.1, 3.4, 4.8, 6.2, 8.1, 10.4, 13.8];
    const enr = [40, 68, 95, 120, 150, 188, 210];
    const maxRev = Math.max(...rev);
    const maxEnr = Math.max(...enr);
    return months.map((m, i) => ({
      m,
      rev: rev[i],
      enr: enr[i],
      revPct: (rev[i] / maxRev) * 100,
      enrPct: (enr[i] / maxEnr) * 100,
    }));
  }, []);

  const pendingSubs = submissions.filter((s) => s.status === 'needs_grading' || s.status === 'submitted').slice(0, 5);
  const recentOrders = orders.filter((o) => o.status === 'paid').slice(0, 5);

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="Academic performance and operational metrics at a glance"
        actions={
          <>
            <Link to="/admin/courses" className="btn-outline">
              <BookOpen size={16} /> Manage Courses
            </Link>
            <Link to="/admin/submissions" className="btn-primary">
              <ClipboardList size={16} /> Review Submissions
            </Link>
          </>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Revenue"
          value={formatCompactRwf(stats.revenue)}
          delta="18.2%"
          deltaTone="up"
          icon={<Wallet size={20} className="text-coral-600" />}
          accent="bg-coral-500"
        />
        <KpiCard
          label="Active Students"
          value={stats.activeStudents.toString()}
          delta="12.5%"
          deltaTone="up"
          icon={<Users size={20} className="text-info-600" />}
          accent="bg-info-500"
        />
        <KpiCard
          label="Active Courses"
          value={`${stats.published} / ${stats.drafts} drafts`}
          delta="3 new"
          deltaTone="up"
          icon={<BookOpen size={20} className="text-success-600" />}
          accent="bg-success-500"
        />
        <KpiCard
          label="Pending Submissions"
          value={stats.pending.toString()}
          alert="to grade"
          icon={<FileCheck2 size={20} className="text-amber-600" />}
          accent="bg-amber-500"
        />
      </div>

      {/* Trend chart + quick info */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Enrollment & Revenue Trend
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Last 7 months</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full bg-coral-500" /> Revenue (M Rwf)
              </span>
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full bg-info-500" /> Enrollments
              </span>
            </div>
          </div>

          <div className="mt-6 flex h-56 items-end gap-3">
            {trend.map((t) => (
              <div key={t.m} className="group flex flex-1 flex-col items-center gap-2">
                <div className="relative flex h-44 w-full items-end justify-center gap-1">
                  <div
                    className="w-1/2 rounded-t-md bg-coral-500/80 transition-all group-hover:bg-coral-500"
                    style={{ height: `${t.revPct}%` }}
                    title={`${t.rev}M Rwf`}
                  >
                    <span className="absolute -top-5 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink-900 px-2 py-0.5 text-[10px] font-semibold text-white group-hover:block">
                      {t.rev}M
                    </span>
                  </div>
                  <div
                    className="w-1/2 rounded-t-md bg-info-500/70 transition-all group-hover:bg-info-500"
                    style={{ height: `${t.enrPct}%` }}
                    title={`${t.enr} enrollments`}
                  />
                </div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top courses */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">Top Courses</h2>
            <TrendingUp size={18} className="text-coral-500" />
          </div>
          <div className="mt-4 space-y-3">
            {[...courses]
              .filter((c) => c.published)
              .sort((a, b) => b.revenue - a.revenue)
              .slice(0, 4)
              .map((c, i) => (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-slate-100 text-xs font-bold text-slate-500 dark:bg-ink-700 dark:text-slate-300">
                    {i + 1}
                  </span>
                  <img src={c.thumbnail} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {c.title}
                    </p>
                    <p className="text-xs text-slate-400">{c.studentsCount} students</p>
                  </div>
                  <span className="text-xs font-bold text-coral-600">{formatCompactRwf(c.revenue)}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Quick action tables */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent enrollments */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-ink-700">
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Recent Enrollments
            </h2>
            <Link
              to="/admin/enrollments"
              className="flex items-center gap-1 text-xs font-semibold text-coral-600 hover:text-coral-700"
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-ink-700/60">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center gap-3 px-5 py-3 table-row-hover">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-coral-50 text-xs font-bold text-coral-700 dark:bg-coral-500/15 dark:text-coral-300">
                  {o.studentName.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {o.studentName}
                  </p>
                  <p className="truncate text-xs text-slate-400">{o.courseTitle}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{formatRwf(o.amount)}</p>
                  <p className="text-xs text-slate-400">{o.method}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending submissions */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-ink-700">
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Pending Submissions
            </h2>
            <Link
              to="/admin/submissions"
              className="flex items-center gap-1 text-xs font-semibold text-coral-600 hover:text-coral-700"
            >
              Grade now <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-ink-700/60">
            {pendingSubs.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3 table-row-hover">
                <img src={s.studentAvatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {s.studentName}
                  </p>
                  <p className="truncate text-xs text-slate-400">{s.taskTitle}</p>
                </div>
                <div className="text-right">
                  <Badge tone={toneForSubmissionStatus(s.status)} dot>
                    {s.status.replace('_', ' ')}
                  </Badge>
                  <p className="mt-1 text-xs text-slate-400">{relativeDate(s.submittedDate)}</p>
                </div>
              </div>
            ))}
            {pendingSubs.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-slate-400">All caught up!</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'New Course', to: '/admin/courses', icon: <Plus size={18} /> },
          { label: 'Add Task', to: '/admin/assessments', icon: <ClipboardList size={18} /> },
          { label: 'Grade Work', to: '/admin/submissions', icon: <FileCheck2 size={18} /> },
          { label: 'Instructors', to: '/admin/instructors', icon: <Users size={18} /> },
        ].map((a) => (
          <Link
            key={a.label}
            to={a.to}
            className="card flex items-center gap-3 p-4 transition hover:shadow-card-hover hover:ring-1 hover:ring-coral-500/30"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-coral-50 text-coral-600 dark:bg-coral-500/15 dark:text-coral-400">
              {a.icon}
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{a.label}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
