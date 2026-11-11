import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Award,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { useAdminStore } from '../../admin/store/adminStore';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { courses, orders } = useAdminStore();

  // Find user's paid courses from orders or user.enrolledCourseIds
  const myEnrolledCourses = useMemo(() => {
    const userEmails = user?.email?.toLowerCase();
    const paidCourseTitles = new Set(
      orders
        .filter((o) => o.status === 'paid' && o.studentEmail.toLowerCase() === userEmails)
        .map((o) => o.courseTitle)
    );
    return courses.filter((c) => paidCourseTitles.has(c.title));
  }, [courses, orders, user]);

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
            Welcome, {user?.name || 'Student'}!
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Welcome to your FluentaRise student learning portal. Access your coursework, live coaching, and certificates here.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-accent-600 transition"
            >
              <Compass size={15} /> Explore Academy Courses
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
          <p className="mt-3 font-display text-3xl font-extrabold text-slate-900">0</p>
          <p className="mt-1 text-xs text-slate-500">Across enrolled courses</p>
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
          <p className="mt-3 font-display text-3xl font-extrabold text-slate-900">0</p>
          <p className="mt-1 text-xs text-slate-500">Assessments passed</p>
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
          <p className="mt-3 font-display text-3xl font-extrabold text-slate-900">0</p>
          <p className="mt-1 text-xs text-slate-500">Verified credentials</p>
        </div>
      </div>

      {/* Courses in Progress */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-950">My Enrolled Courses</h2>
            <p className="text-xs text-slate-500">Continue learning and tracking progress.</p>
          </div>
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
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {myEnrolledCourses.map((course) => (
              <div
                key={course.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-40 w-full object-cover"
                />
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-display text-base font-bold text-slate-900">
                    {course.title}
                  </h3>
                  <Link
                    to={`/student/courses/${course.id}`}
                    className="mt-auto pt-4 text-xs font-bold text-purple-700 hover:underline"
                  >
                    Open Classroom →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
