import { useState, useMemo } from 'react';
import { Users, Search, GraduationCap } from 'lucide-react';
import { useAdminStore } from '../../admin/store/adminStore';
import { useAuth } from '../../auth/AuthProvider';

export default function InstructorStudents() {
  const [search, setSearch] = useState('');
  const { orders, courses } = useAdminStore();
  const { user } = useAuth();

  // Find courses taught by this instructor
  const myCourseTitles = useMemo(() => {
    return new Set(
      courses
        .filter((c) => c.instructorId === user?.id || c.instructorId === user?.instructorId)
        .map((c) => c.title)
    );
  }, [courses, user]);

  // Find students enrolled in instructor's courses
  const students = useMemo(() => {
    return orders
      .filter((o) => o.status === 'paid' && (myCourseTitles.size === 0 || myCourseTitles.has(o.courseTitle)))
      .map((o) => ({
        id: o.id,
        name: o.studentName,
        email: o.studentEmail,
        course: o.courseTitle,
        date: o.date,
      }));
  }, [orders, myCourseTitles]);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.course.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950">My Students</h1>
          <p className="text-sm text-slate-500">
            Learners enrolled in your courses.
          </p>
        </div>

        {students.length > 0 && (
          <div className="relative min-w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search learner name or course…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-emerald-500 transition shadow-sm"
            />
          </div>
        )}
      </div>

      {students.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          <Users size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-display text-base font-bold text-slate-800">
            No students enrolled yet
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            When learners enroll in your courses, their names and course details will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Enrolled Course</th>
                  <th className="py-3 px-4">Enrolled Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.email}</p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{s.course}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">{s.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
