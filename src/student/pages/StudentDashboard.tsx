import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Award,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Compass,
  Video,
  Clock,
  ArrowRight,
  Play,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { useAdminStore } from '../../admin/store/adminStore';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { courses, orders, submissions, events } = useAdminStore();
  const userEmail = user?.email?.toLowerCase() || '';

  // 1. Enrolled courses
  const myEnrolledCourses = useMemo(() => {
    if (!userEmail) return [];

    const paidOrders = orders.filter(
      (o) => o.status === 'paid' && o.studentEmail.toLowerCase() === userEmail
    );
    const paidTitles = new Set(
      paidOrders.flatMap((o) => [
        o.courseTitle,
        ...(o.courseTitle?.split(',').map((t) => t.trim()) || []),
      ])
    );
    const paidCourseIds = new Set(paidOrders.flatMap((o) => o.courseIds || []));
    const userEnrolledIds = new Set(user?.enrolledCourseIds || []);

    return courses.filter(
      (c) =>
        c.free ||
        paidTitles.has(c.title) ||
        paidCourseIds.has(c.id) ||
        userEnrolledIds.has(c.id)
    );
  }, [courses, orders, user, userEmail]);

  // 2. Student Submissions
  const mySubmissions = useMemo(() => {
    return submissions.filter(
      (s) =>
        (s.studentEmail && s.studentEmail.toLowerCase() === userEmail) ||
        s.studentName.toLowerCase() === (user?.name?.toLowerCase() || '')
    );
  }, [submissions, userEmail, user]);

  // 3. Completed Lessons Count from localStorage
  const completedLessonsCount = useMemo(() => {
    let count = 0;
    for (const c of myEnrolledCourses) {
      try {
        const saved = localStorage.getItem(`completed_items_${c.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          count += parsed.length;
        }
      } catch {
        // ignore
      }
    }
    return count;
  }, [myEnrolledCourses]);

  // 4. Quizzes & Tests Passed
  const quizzesPassed = useMemo(() => {
    return mySubmissions.filter(
      (s) =>
        (s.taskKind === 'quiz' || s.taskKind === 'test') &&
        (s.status === 'auto_graded' || s.status === 'graded') &&
        (s.score || 0) >= 60
    ).length;
  }, [mySubmissions]);

  // 5. Eligible Certificates
  const certificatesEarned = useMemo(() => {
    return myEnrolledCourses.filter((c) => {
      if (!c.certificate) return false;
      const allTasks = (c.curriculum || []).flatMap((sec) => sec.items.filter((it) => it.kind !== 'lecture'));
      if (allTasks.length === 0) return true;
      const passedTasks = allTasks.filter((t) =>
        mySubmissions.some((s) => s.courseId === c.id && s.taskId === t.id && (s.score || 0) >= 60)
      );
      return passedTasks.length >= Math.min(1, allTasks.length);
    }).length;
  }, [myEnrolledCourses, mySubmissions]);

  // 6. Upcoming Live Classes
  const enrolledIds = useMemo(() => new Set(myEnrolledCourses.map((c) => c.id)), [myEnrolledCourses]);
  const upcomingLiveClasses = useMemo(() => {
    return events
      .filter((e) => !e.courseId || enrolledIds.has(e.courseId))
      .slice(0, 3);
  }, [events, enrolledIds]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-purple-200 bg-gradient-to-br from-brand-950 via-purple-950 to-slate-950 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent-500/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-300 backdrop-blur border border-white/10">
            <Sparkles size={13} /> Student Learning Hub
          </span>
          <h1 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Track your course progress, complete assignments, attend live coaching classes, and achieve verified credentials.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              to="/student/courses"
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-purple-700 transition"
            >
              <BookOpen size={15} /> Resume Studies ({myEnrolledCourses.length})
            </Link>
            <Link
              to="/student/live-classes"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition backdrop-blur"
            >
              <Video size={15} /> Live Classes
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Enrolled Courses
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-purple-50 text-purple-600">
              <BookOpen size={18} />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold text-slate-900">
            {myEnrolledCourses.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Active enrollments</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Completed Lessons
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold text-slate-900">
            {completedLessonsCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">Across enrolled curriculum</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Quizzes Passed
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-600">
              <HelpCircle size={18} />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold text-slate-900">
            {quizzesPassed}
          </p>
          <p className="mt-1 text-xs text-slate-500">Evaluated assessments</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Certificates Earned
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <Award size={18} />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold text-slate-900">
            {certificatesEarned}
          </p>
          <p className="mt-1 text-xs text-slate-500">Verified credentials</p>
        </div>
      </div>

      {/* Main Grid: Courses In Progress & Live Sessions Widget */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Enrolled Courses */}
        <section className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-950">My Enrolled Courses</h2>
              <p className="text-xs text-slate-500">Continue learning and tracking progress.</p>
            </div>
            {myEnrolledCourses.length > 0 && (
              <Link
                to="/student/courses"
                className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1"
              >
                View all ({myEnrolledCourses.length}) <ArrowRight size={13} />
              </Link>
            )}
          </div>

          {myEnrolledCourses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
              <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
              <h3 className="font-display text-base font-bold text-slate-800">
                You are not enrolled in any courses yet
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Browse our course catalog to find the right English or tech program for your career goals.
              </p>
              <Link
                to="/courses"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 transition"
              >
                <Compass size={14} /> Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {myEnrolledCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition"
                >
                  <div className="relative h-36 w-full bg-slate-100">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute top-2.5 right-2.5 rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                      {course.category}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h3 className="font-display text-sm font-bold text-slate-900 line-clamp-2">
                      {course.title}
                    </h3>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {course.lessonsCount || 0} lessons
                      </span>
                      <Link
                        to={`/student/courses/${course.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-700 transition"
                      >
                        <Play size={12} fill="currentColor" /> Open Class
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Live Classes Widget */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
              <Video size={16} className="text-purple-600" /> Live Classes
            </h2>
            <Link to="/student/live-classes" className="text-xs font-bold text-purple-700 hover:underline">
              View all
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            {upcomingLiveClasses.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <Video size={28} className="mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-600">No scheduled sessions</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Classes scheduled by your instructors will appear here.</p>
              </div>
            ) : (
              upcomingLiveClasses.map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs space-y-1.5 hover:bg-slate-100 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                      {ev.type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">{ev.date.slice(0, 10)}</span>
                  </div>
                  <p className="font-bold text-slate-900 line-clamp-1">{ev.title}</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock size={11} /> {ev.startTime} — {ev.endTime} · {ev.instructor}
                  </p>
                  <Link
                    to="/student/live-classes"
                    className="inline-block text-[11px] font-bold text-purple-700 hover:underline pt-1"
                  >
                    Open Live Class Room →
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
