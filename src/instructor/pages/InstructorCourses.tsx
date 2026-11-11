import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Star, Plus } from 'lucide-react';
import { useAdminStore } from '../../admin/store/adminStore';
import { useAuth } from '../../auth/AuthProvider';

export default function InstructorCourses() {
  const { user } = useAuth();
  const { courses } = useAdminStore();

  const myCourses = useMemo(() => {
    return courses.filter((c) => c.instructorId === user?.id || c.instructorId === user?.instructorId);
  }, [courses, user]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950">My Courses</h1>
          <p className="text-sm text-slate-500">
            Courses assigned to your instruction portfolio.
          </p>
        </div>
      </div>

      {myCourses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-display text-base font-bold text-slate-800">
            No courses assigned yet
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You do not currently have any assigned courses. Contact the Super Admin to be assigned as lead instructor for a course.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {myCourses.map((c) => (
            <div
              key={c.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src={c.thumbnail}
                  alt={c.title}
                  className="h-full w-full object-cover"
                />
                <span className="absolute right-3 top-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
                  {c.category}
                </span>
                <span
                  className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    c.published ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                  }`}
                >
                  {c.published ? 'Published' : 'Draft'}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-base font-bold text-slate-900 line-clamp-2">
                  {c.title}
                </h3>

                <div className="mt-4 grid grid-cols-2 gap-2 border-y border-slate-100 py-3 text-center text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{c.lessonsCount || 0}</p>
                    <p className="text-slate-400 text-[10px]">Lessons</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{c.studentsCount || 0}</p>
                    <p className="text-slate-400 text-[10px]">Students</p>
                  </div>
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between gap-2">
                  <Link
                    to={`/instructor/assessments?courseId=${c.id}`}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Assessments ({c.tasksCount || 0})
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
