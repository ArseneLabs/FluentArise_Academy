import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Plus,
  FileText,
  HelpCircle,
  Timer,
  BookOpen,
  Pencil,
  FileCheck2,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useAdminStore } from '../../admin/store/adminStore';
import { useAuth } from '../../auth/AuthProvider';
import type { Quiz, Assignment, CurriculumItem } from '../../admin/types';

interface FlatInstructorTask {
  id: string;
  title: string;
  kind: 'quiz' | 'test' | 'assignment';
  courseId: string;
  courseTitle: string;
  sectionTitle: string;
  item: CurriculumItem;
  submissionsCount: number;
}

export default function InstructorAssessments() {
  const { courses, submissions } = useAdminStore();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'quiz' | 'test' | 'assignment'>('all');

  // Instructor assigned courses
  const myCourses = useMemo(() => {
    return courses.filter(
      (c) => c.instructorId === user?.id || c.instructorId === user?.instructorId
    );
  }, [courses, user]);

  // Extract all assessments from assigned courses
  const myTasks = useMemo(() => {
    const list: FlatInstructorTask[] = [];

    for (const c of myCourses) {
      for (const sec of c.curriculum || []) {
        for (const item of sec.items) {
          if (item.kind !== 'lecture') {
            const subs = submissions.filter((s) => s.courseId === c.id && s.taskId === item.id);
            list.push({
              id: item.id,
              title: item.title,
              kind: item.kind as 'quiz' | 'test' | 'assignment',
              courseId: c.id,
              courseTitle: c.title,
              sectionTitle: sec.title,
              item,
              submissionsCount: subs.length,
            });
          }
        }
      }
    }

    return list;
  }, [myCourses, submissions]);

  const filtered = useMemo(() => {
    return myTasks.filter((t) => activeTab === 'all' || t.kind === activeTab);
  }, [myTasks, activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950">Tasks & Quizzes</h1>
          <p className="text-sm text-slate-500">
            Coursework and knowledge checks created across your assigned courses.
          </p>
        </div>

        {myCourses.length > 0 && (
          <Link
            to={`/instructor/courses/${myCourses[0].id}/curriculum`}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition"
          >
            <Plus size={15} /> Create Assessment
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {[
          { key: 'all' as const, label: `All Tasks (${myTasks.length})` },
          { key: 'quiz' as const, label: 'Quizzes' },
          { key: 'test' as const, label: 'Exams & Tests' },
          { key: 'assignment' as const, label: 'Project Assignments' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition ${
              activeTab === tab.key
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {myCourses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-display text-base font-bold text-slate-800">
            No courses assigned to your profile
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Once you are assigned to a course, you can create quizzes, tests, and assignments for your students.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          <ClipboardList size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-display text-base font-bold text-slate-800">
            No assessments found in curriculum
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Open the Curriculum Builder on any of your assigned courses to add quizzes and assignments.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <div
              key={`${t.courseId}_${t.id}`}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      t.kind === 'quiz'
                        ? 'bg-rose-100 text-rose-800'
                        : t.kind === 'test'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {t.kind}
                  </span>

                  <span className="text-[11px] font-bold text-slate-500">
                    {t.submissionsCount} Submission{t.submissionsCount !== 1 ? 's' : ''}
                  </span>
                </div>

                <h3 className="mt-3 font-display text-base font-bold text-slate-900 line-clamp-1">
                  {t.title}
                </h3>
                <p className="text-xs text-emerald-800 font-medium truncate mt-0.5">{t.courseTitle}</p>
                <p className="text-[11px] text-slate-400 mt-1">Section: {t.sectionTitle}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  {t.kind === 'assignment' ? (
                    <span>Est. {(t.item as Assignment).estimatedHours}h · Due {(t.item as Assignment).dueDate || 'Open'}</span>
                  ) : (
                    <span>{(t.item as Quiz).questions?.length || 0} Questions · Pass {(t.item as Quiz).passingScorePct}%</span>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  to={`/instructor/courses/${t.courseId}/curriculum`}
                  className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Pencil size={12} /> Edit in Curriculum
                </Link>

                <Link
                  to={`/instructor/submissions?courseId=${t.courseId}`}
                  className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                >
                  Grade ({t.submissionsCount})
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
