import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Search,
  HelpCircle,
  FileText,
  Timer,
  Plus,
  Pencil,
  ListTree,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { PageHeader } from '../components/AdminLayout';
import Badge from '../components/ui/Badge';
import { relativeDate } from '../lib/format';
import type { Quiz, Assignment, CurriculumItem } from '../types';

interface FlatTask {
  id: string;
  title: string;
  kind: 'quiz' | 'test' | 'assignment';
  courseId: string;
  courseTitle: string;
  sectionId: string;
  sectionTitle: string;
  item: CurriculumItem;
}

export default function AssessmentsHub() {
  const { courses } = useAdminStore();
  const [filter, setFilter] = useState<'all' | 'quiz' | 'test' | 'assignment'>('all');
  const [query, setQuery] = useState('');

  const tasks: FlatTask[] = courses.flatMap((c) =>
    c.curriculum.flatMap((sec) =>
      sec.items
        .filter((i) => i.kind !== 'lecture')
        .map((item) => ({
          id: item.id,
          title: item.title,
          kind: item.kind as 'quiz' | 'test' | 'assignment',
          courseId: c.id,
          courseTitle: c.title,
          sectionId: sec.id,
          sectionTitle: sec.title,
          item,
        })),
    ),
  );

  const filtered = tasks.filter(
    (t) =>
      (filter === 'all' || t.kind === filter) &&
      t.title.toLowerCase().includes(query.toLowerCase()),
  );

  const counts = {
    quiz: tasks.filter((t) => t.kind === 'quiz').length,
    test: tasks.filter((t) => t.kind === 'test').length,
    assignment: tasks.filter((t) => t.kind === 'assignment').length,
  };

  return (
    <>
      <PageHeader
        title="Tasks & Assessments"
        subtitle="All quizzes, tests and assignments across your courses"
        icon={<ClipboardList size={20} />}
        actions={
          <Link to="/admin/courses" className="btn-primary">
            <Plus size={16} /> New Task
          </Link>
        }
      />

      {/* Stat cards */}
      <div className="mb-5 grid grid-cols-3 gap-4">
        {[
          { label: 'Quizzes', count: counts.quiz, icon: <HelpCircle size={18} />, cls: 'bg-coral-50 text-coral-600 dark:bg-coral-500/15' },
          { label: 'Tests / Exams', count: counts.test, icon: <Timer size={18} />, cls: 'bg-success-50 text-success-600 dark:bg-success-500/15' },
          { label: 'Assignments', count: counts.assignment, icon: <FileText size={18} />, cls: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15' },
        ].map((s) => (
          <div key={s.label} className="card flex items-center gap-4 p-4">
            <div className={`grid h-11 w-11 place-items-center rounded-xl ${s.cls}`}>
              {s.icon}
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-slate-900 dark:text-white">{s.count}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="card mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-10" placeholder="Search tasks…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-ink-700/60">
          {(['all', 'quiz', 'test', 'assignment'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                filter === f ? 'bg-white text-coral-600 shadow-sm dark:bg-ink-800 dark:text-coral-400' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {f === 'all' ? 'All' : f + 's'}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-ink-700">
                <th className="px-5 py-3">Task</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Course</th>
                <th className="px-5 py-3">Section</th>
                <th className="px-5 py-3">Details</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-ink-700/60">
              {filtered.map((t) => {
                const meta =
                  t.kind === 'assignment'
                    ? { icon: <FileText size={14} />, tone: 'amber' as const, detail: `${(t.item as Assignment).estimatedHours}h · Due ${relativeDate((t.item as Assignment).dueDate)}` }
                    : t.kind === 'test'
                      ? { icon: <Timer size={14} />, tone: 'success' as const, detail: `${(t.item as Quiz).questions.length} Qs · ${(t.item as Quiz).durationMin} min` }
                      : { icon: <HelpCircle size={14} />, tone: 'coral' as const, detail: `${(t.item as Quiz).questions.length} Qs · ${(t.item as Quiz).durationMin} min` };
                return (
                  <tr key={t.id} className="table-row-hover">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{t.title}</p>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={meta.tone} dot>
                        {meta.icon} {t.kind}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{t.courseTitle}</td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{t.sectionTitle}</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        {t.kind !== 'assignment' && <Clock size={12} />}
                        {t.kind === 'assignment' && <CheckCircle2 size={12} />}
                        {meta.detail}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        to={`/admin/courses/${t.courseId}/curriculum`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-coral-500 hover:text-coral-600 dark:border-ink-700 dark:text-slate-300"
                      >
                        <Pencil size={12} /> Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <ClipboardList size={32} className="mx-auto text-slate-300" />
            <p className="mt-3 text-sm text-slate-400">No tasks found. Build curriculum in a course to add tasks.</p>
            <Link to="/admin/courses" className="btn-primary mt-4 inline-flex">
              <ListTree size={16} /> Go to Courses
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
