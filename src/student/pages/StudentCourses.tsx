import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Play, Compass, Clock, AlertCircle, ShoppingBag } from 'lucide-react';
import { useAdminStore } from '../../admin/store/adminStore';
import { useAuth } from '../../auth/AuthProvider';

export default function StudentCourses() {
  const { user } = useAuth();
  const { courses, orders } = useAdminStore();

  const userEmail = user?.email?.toLowerCase();

  // Active enrolled courses (must be 'paid' or in user.enrolledCourseIds)
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

  // Orders awaiting verification for this student
  const pendingOrders = useMemo(() => {
    if (!userEmail) return [];
    return orders.filter(
      (o) => o.status === 'pending' && o.studentEmail.toLowerCase() === userEmail
    );
  }, [orders, userEmail]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950">My Enrolled Courses</h1>
          <p className="text-sm text-slate-500">
            Access your course curriculum and learning materials.
          </p>
        </div>
      </div>

      {/* Pending verification notice banner */}
      {pendingOrders.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-900">
                {pendingOrders.length} Order{pendingOrders.length > 1 ? 's' : ''} Awaiting Payment Verification
              </h3>
              <p className="mt-1 text-xs text-amber-700">
                You have submitted payments via Mobile Money or Bank Transfer that are currently being checked by our administration team. Once verified, these courses will appear below automatically.
              </p>
              <div className="mt-3 divide-y divide-amber-200/60 rounded-xl bg-white/80 p-3 text-xs">
                {pendingOrders.map((ord) => (
                  <div key={ord.id} className="flex flex-wrap items-center justify-between gap-2 py-1.5 first:pt-0 last:pb-0">
                    <div>
                      <span className="font-semibold text-slate-800">{ord.courseTitle}</span>
                      <span className="ml-2 font-mono text-[11px] text-slate-400">({ord.reference})</span>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                      <Clock size={10} /> Pending Admin Approval
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enrolled Courses Grid */}
      {myEnrolledCourses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-display text-base font-bold text-slate-800">
            You have no active course enrollments
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {pendingOrders.length > 0
              ? 'Your submitted orders are pending verification. Once an administrator approves your payment, your courses will unlock here.'
              : 'Explore our academy course catalog and enroll to unlock live lessons, videos, assignments, and certificates.'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 transition"
            >
              <Compass size={14} /> Browse Courses
            </Link>
            {pendingOrders.length > 0 && (
              <Link
                to="/student/orders"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <ShoppingBag size={14} /> View Orders
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {myEnrolledCourses.map((course) => (
            <div
              key={course.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
                <span className="absolute right-3 top-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
                  {course.category}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-base font-bold text-slate-900 line-clamp-2">
                  {course.title}
                </h3>

                <div className="mt-auto pt-5">
                  <Link
                    to={`/student/courses/${course.id}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-purple-700 transition shadow-sm"
                  >
                    <Play size={14} fill="currentColor" /> Open Classroom
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
