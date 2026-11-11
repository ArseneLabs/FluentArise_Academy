import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Play, Compass } from 'lucide-react';
import { useAdminStore } from '../../admin/store/adminStore';
import { useAuth } from '../../auth/AuthProvider';

export default function StudentCourses() {
  const { user } = useAuth();
  const { courses, orders } = useAdminStore();

  const myEnrolledCourses = useMemo(() => {
    const userEmail = user?.email?.toLowerCase();
    const paidTitles = new Set(
      orders
        .filter((o) => o.status === 'paid' && o.studentEmail.toLowerCase() === userEmail)
        .map((o) => o.courseTitle)
    );
    return courses.filter((c) => paidTitles.has(c.title));
  }, [courses, orders, user]);

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

      {myEnrolledCourses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-display text-base font-bold text-slate-800">
            You are not enrolled in any courses yet
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Explore our academy course catalog and enroll to unlock live lessons and materials.
          </p>
          <Link
            to="/courses"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 transition"
          >
            <Compass size={14} /> Browse Courses
          </Link>
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
