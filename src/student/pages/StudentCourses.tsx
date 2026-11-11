import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Play, CheckCircle2, Clock, Search, Award } from 'lucide-react';

const coursesList = [
  {
    id: 'c_java',
    title: 'Java & Object-Oriented Programming Mastery',
    category: 'Programming & OOP',
    instructor: 'Prince Dimpoz',
    progress: 68,
    totalLessons: 32,
    completedLessons: 22,
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
    status: 'in_progress',
  },
  {
    id: 'c_english',
    title: 'Professional English Fluency & Public Speaking',
    category: 'Languages',
    instructor: 'Amina Uwase',
    progress: 45,
    totalLessons: 24,
    completedLessons: 11,
    thumbnail: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=600&q=80',
    status: 'in_progress',
  },
  {
    id: 'c_web',
    title: 'Full-Stack Modern Web Engineering',
    category: 'Web Development',
    instructor: 'David Mugisha',
    progress: 25,
    totalLessons: 40,
    completedLessons: 10,
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
    status: 'in_progress',
  },
  {
    id: 'c_ielts',
    title: 'IELTS Academic Examination Masterclass',
    category: 'Exam Preparation',
    instructor: 'Diane Mukamana',
    progress: 100,
    totalLessons: 18,
    completedLessons: 18,
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
    status: 'completed',
  },
];

export default function StudentCourses() {
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [search, setSearch] = useState('');

  const filtered = coursesList.filter((c) => {
    const matchFilter = filter === 'all' || c.status === filter;
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950">My Enrolled Courses</h1>
          <p className="text-sm text-slate-500">
            Access your course materials, video lectures, and syllabus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              filter === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All ({coursesList.length})
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              filter === 'in_progress'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              filter === 'completed'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((course) => (
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
              {course.status === 'completed' && (
                <span className="absolute left-3 top-3 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm flex items-center gap-1">
                  <Award size={13} /> Completed
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-col p-5">
              <h3 className="font-display text-base font-bold text-slate-900 line-clamp-2">
                {course.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500">Instructor: {course.instructor}</p>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-600">
                    {course.completedLessons} / {course.totalLessons} Lessons
                  </span>
                  <span className="font-bold text-purple-700">{course.progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-purple-600"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-auto pt-5">
                <Link
                  to={`/student/courses/${course.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-purple-700 transition shadow-sm"
                >
                  <Play size={14} fill="currentColor" />
                  {course.status === 'completed' ? 'Review Classroom' : 'Open Classroom'}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
