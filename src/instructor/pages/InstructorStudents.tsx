import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Users, Search, BookOpen, Mail, Calendar, ArrowLeft } from 'lucide-react';
import { useAdminStore } from '../../admin/store/adminStore';
import { useAuth } from '../../auth/AuthProvider';

export default function InstructorStudents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCourseId = searchParams.get('courseId') || 'all';

  const [search, setSearch] = useState('');
  const { orders, courses } = useAdminStore();
  const { user } = useAuth();

  // Find courses assigned to this instructor
  const myCourses = useMemo(() => {
    return courses.filter(
      (c) => c.instructorId === user?.id || c.instructorId === user?.instructorId
    );
  }, [courses, user]);

  const myCourseIds = useMemo(() => new Set(myCourses.map((c) => c.id)), [myCourses]);
  const myCourseTitles = useMemo(() => new Set(myCourses.map((c) => c.title.toLowerCase())), [myCourses]);

  // Find students enrolled in instructor's assigned courses only
  const students = useMemo(() => {
    if (myCourses.length === 0) return [];

    const enrolledList: {
      id: string;
      name: string;
      email: string;
      phone?: string;
      courseId: string;
      courseTitle: string;
      date: string;
    }[] = [];

    const paidOrders = orders.filter((o) => o.status === 'paid');

    for (const ord of paidOrders) {
      // Check if order contains one of this instructor's courses
      const matchesCourse = myCourses.some((c) => {
        if (selectedCourseId !== 'all' && c.id !== selectedCourseId) return false;
        return (
          ord.courseIds?.includes(c.id) ||
          ord.courseTitle.toLowerCase().includes(c.title.toLowerCase())
        );
      });

      if (matchesCourse) {
        enrolledList.push({
          id: ord.id,
          name: ord.studentName,
          email: ord.studentEmail,
          phone: ord.customerPhone,
          courseId: ord.courseIds?.[0] || '',
          courseTitle: ord.courseTitle,
          date: ord.date,
        });
      }
    }

    return enrolledList;
  }, [orders, myCourses, selectedCourseId]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return students.filter(
      (s) =>
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.courseTitle.toLowerCase().includes(q)
    );
  }, [students, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950">My Students</h1>
          <p className="text-sm text-slate-500">
            Learners enrolled in courses assigned to your instruction portfolio.
          </p>
        </div>

        {myCourses.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            {/* Course Filter Dropdown */}
            <select
              value={selectedCourseId}
              onChange={(e) => {
                if (e.target.value === 'all') {
                  searchParams.delete('courseId');
                  setSearchParams(searchParams);
                } else {
                  setSearchParams({ courseId: e.target.value });
                }
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500 shadow-sm"
            >
              <option value="all">All My Courses ({myCourses.length})</option>
              {myCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>

            <div className="relative min-w-56">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search learners…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-emerald-500 transition shadow-sm"
              />
            </div>
          </div>
        )}
      </div>

      {myCourses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-display text-base font-bold text-slate-800">
            No courses assigned to your profile
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Once a Super Admin assigns you as lead instructor for courses, your enrolled students will appear here.
          </p>
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          <Users size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-display text-base font-bold text-slate-800">
            No student enrollments yet
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            When learners enroll in your courses, their profile details and enrollment records will show up here.
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
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Enrolled Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s, idx) => (
                  <tr key={`${s.id}_${idx}`} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                          {s.name.slice(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900">{s.name}</p>
                          <p className="text-xs text-slate-400">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 text-xs">{s.courseTitle}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {s.phone || 'Email verified'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {new Date(s.date).toLocaleDateString()}
                    </td>
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
