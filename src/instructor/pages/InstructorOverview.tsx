import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  FileCheck2,
  Star,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAdminStore } from '../../admin/store/adminStore';
import { useAuth } from '../../auth/AuthProvider';
import { relativeDate } from '../../admin/lib/format';

export default function InstructorOverview() {
  const { user } = useAuth();
  const { courses, submissions, events } = useAdminStore();

  const myCourses = useMemo(() => {
    return courses.filter((c) => c.instructorId === user?.id || c.instructorId === user?.instructorId);
  }, [courses, user]);

  const mySubmissions = useMemo(() => {
    const courseIds = new Set(myCourses.map((c) => c.id));
    return submissions.filter((s) => courseIds.has(s.courseId));
  }, [submissions, myCourses]);

  const pendingGrading = useMemo(() => {
    return mySubmissions.filter(
      (s) => s.status === 'needs_grading' || s.status === 'submitted'
    );
  }, [mySubmissions]);

  const totalStudents = useMemo(() => {
    return myCourses.reduce((acc, c) => acc + (c.studentsCount || 0), 0);
  }, [myCourses]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300 backdrop-blur border border-white/10">
            <Sparkles size={13} /> Instructor Portal
          </span>
          <h1 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name || 'Instructor'}!
          </h1>
          <p className="mt-2 text-sm text-emerald-100/90 leading-relaxed">
            Your live teaching summary and student submissions queue.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              to="/instructor/courses"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-emerald-950 shadow-md hover:bg-emerald-50 transition"
            >
              <BookOpen size={16} /> View My Courses ({myCourses.length})
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Courses
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <BookOpen size={18} />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold text-slate-900">
            {myCourses.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Assigned to you</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Learners
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-600">
              <Users size={18} />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold text-slate-900">
            {totalStudents}
          </p>
          <p className="mt-1 text-xs text-slate-500">Enrolled across your classes</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Needs Grading
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <Clock size={18} />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold text-slate-900">
            {pendingGrading.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Pending submissions</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Course Rating
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <Star size={18} />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold text-slate-900">—</p>
          <p className="mt-1 text-xs text-slate-500">Student reviews</p>
        </div>
      </div>

      {/* Submissions & Sessions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Pending Submissions Queue
              </h2>
              <p className="text-xs text-slate-500">
                Coursework awaiting grading.
              </p>
            </div>
            <Link
              to="/instructor/submissions"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-4">
            {pendingGrading.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No submissions currently pending. All assignments are up to date!
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingGrading.slice(0, 4).map((sub) => (
                  <div
                    key={sub.id}
                    className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900">{sub.studentName}</p>
                      <p className="text-xs text-slate-500">{sub.taskTitle}</p>
                    </div>
                    <Link
                      to="/instructor/submissions"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition"
                    >
                      <FileCheck2 size={14} /> Review & Grade
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Live Classes */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="font-display text-base font-bold text-slate-900">
              Live Sessions
            </h2>
            <Link
              to="/instructor/sessions"
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              Schedule
            </Link>
          </div>

          <div className="mt-4">
            {events.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                No upcoming live classes scheduled.
              </div>
            ) : (
              <div className="space-y-3">
                {events.slice(0, 3).map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs"
                  >
                    <p className="font-bold text-slate-900">{ev.title}</p>
                    <p className="text-slate-500 mt-1">{ev.date} · {ev.startTime}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
