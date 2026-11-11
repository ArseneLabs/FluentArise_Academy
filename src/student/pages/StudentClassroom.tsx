import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Play,
  FileText,
  Volume2,
  Maximize2,
  BookOpen,
} from 'lucide-react';
import { useAdminStore } from '../../admin/store/adminStore';

export default function StudentClassroom() {
  const { id } = useParams<{ id: string }>();
  const { courses } = useAdminStore();

  const course = useMemo(() => courses.find((c) => c.id === id), [courses, id]);
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  if (!course) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
        <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
        <h3 className="font-display text-base font-bold text-slate-800">
          Course not found
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          This course may have been removed or updated.
        </p>
        <Link
          to="/student/courses"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:underline"
        >
          <ArrowLeft size={14} /> Back to My Courses
        </Link>
      </div>
    );
  }

  const sections = course.curriculum || [];
  const allLectures = sections.flatMap((s) => s.items.filter((it) => it.kind === 'lecture'));
  const currentLecture = allLectures[activeItemIndex];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/student/courses"
          className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-display text-xl font-bold text-slate-900">{course.title}</h1>
          <p className="text-xs text-slate-500">Course Classroom</p>
        </div>
      </div>

      {allLectures.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          <FileText size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-display text-base font-bold text-slate-800">
            No curriculum lessons published yet
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            The instructor has not added video lessons to this course yet. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-950 shadow-lg flex items-center justify-center">
              <img
                src={course.thumbnail}
                alt="Video Thumbnail"
                className="h-full w-full object-cover opacity-60"
              />
              <button
                onClick={() => setIsPlaying((p) => !p)}
                className="absolute flex h-16 w-16 items-center justify-center rounded-full bg-purple-600 text-white shadow-2xl transition hover:scale-110"
              >
                <Play size={28} fill="currentColor" className="ml-1" />
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h2 className="font-display text-base font-bold text-slate-900">
                {currentLecture?.title}
              </h2>
            </div>
          </div>

          <div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-display text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Course Syllabus
              </h3>
              <div className="mt-4 space-y-2">
                {allLectures.map((lec, i) => (
                  <button
                    key={lec.id}
                    onClick={() => setActiveItemIndex(i)}
                    className={`flex w-full items-center gap-2.5 rounded-xl p-2.5 text-left text-xs transition ${
                      i === activeItemIndex
                        ? 'bg-purple-100 text-purple-900 font-bold'
                        : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Circle size={14} className="shrink-0 text-slate-400" />
                    <span className="truncate">{lec.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
