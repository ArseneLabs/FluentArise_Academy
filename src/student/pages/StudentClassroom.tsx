import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Play,
  FileText,
  BookOpen,
  Paperclip,
  Download,
  ExternalLink,
  PenTool,
  Clock,
  Check,
  File,
  FileSpreadsheet,
  FileArchive,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { useAdminStore } from '../../admin/store/adminStore';
import RichTextEditor from '../../components/common/RichTextEditor';
import type { Lecture, LectureMaterial } from '../../admin/types';

export default function StudentClassroom() {
  const { id } = useParams<{ id: string }>();
  const { courses } = useAdminStore();

  const course = useMemo(() => courses.find((c) => c.id === id), [courses, id]);
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'materials' | 'my_notebook'>('notes');
  const [studentNotes, setStudentNotes] = useState<string>('');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Load student personal notes for this lecture from localStorage
  useEffect(() => {
    if (course && id) {
      const storageKey = `student_notes_${id}_lecture_${activeItemIndex}`;
      const saved = localStorage.getItem(storageKey);
      setStudentNotes(saved || '');
    }
  }, [id, activeItemIndex, course]);

  const handleSaveStudentNotes = (notes: string) => {
    setStudentNotes(notes);
    if (course && id) {
      const storageKey = `student_notes_${id}_lecture_${activeItemIndex}`;
      localStorage.setItem(storageKey, notes);
      setIsSavedNotice(true);
      setTimeout(() => setIsSavedNotice(false), 2000);
    }
  };

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
  const allLectures = sections.flatMap((s) => s.items.filter((it) => it.kind === 'lecture')) as Lecture[];
  const currentLecture = allLectures[activeItemIndex];

  // Helper to format embed URL if YouTube or standard video
  const renderVideoPlayer = () => {
    const url = currentLecture?.videoUrl;
    if (!url) {
      return (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-950 shadow-lg flex items-center justify-center">
          <img
            src={course.thumbnail}
            alt="Video Thumbnail"
            className="h-full w-full object-cover opacity-60"
          />
          <div className="absolute text-center p-6 text-white">
            <p className="font-display text-base font-bold">Audio / Text Lecture</p>
            <p className="text-xs text-slate-300 mt-1">Refer to lecture notes and materials below</p>
          </div>
        </div>
      );
    }

    if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo')) {
      let embedUrl = url;
      if (url.includes('watch?v=')) {
        embedUrl = url.replace('watch?v=', 'embed/');
      } else if (url.includes('youtu.be/')) {
        embedUrl = url.replace('youtu.be/', 'youtube.com/embed/');
      }
      return (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-950 shadow-lg">
          <iframe
            src={embedUrl}
            title={currentLecture.title}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-950 shadow-lg flex items-center justify-center">
        {isPlaying ? (
          <video
            src={url}
            controls
            autoPlay
            className="h-full w-full object-cover"
          />
        ) : (
          <>
            <img
              src={course.thumbnail}
              alt="Video Thumbnail"
              className="h-full w-full object-cover opacity-60"
            />
            <button
              onClick={() => setIsPlaying(true)}
              className="absolute flex h-16 w-16 items-center justify-center rounded-full bg-purple-600 text-white shadow-2xl transition hover:scale-110"
            >
              <Play size={28} fill="currentColor" className="ml-1" />
            </button>
          </>
        )}
      </div>
    );
  };

  const getFileIcon = (type: LectureMaterial['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="text-rose-600" size={18} />;
      case 'doc':
        return <File className="text-blue-600" size={18} />;
      case 'slide':
        return <FileCheck className="text-amber-600" size={18} />;
      case 'sheet':
        return <FileSpreadsheet className="text-emerald-600" size={18} />;
      case 'archive':
        return <FileArchive className="text-purple-600" size={18} />;
      default:
        return <FileText className="text-slate-600" size={18} />;
    }
  };

  // Combine lecture-specific materials and course-level materials
  const lectureMaterials = currentLecture?.materials || [];
  const courseMaterials = course.materials || [];
  const totalMaterials = [...lectureMaterials, ...courseMaterials];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/student/courses"
            className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-slate-900">{course.title}</h1>
            <p className="text-xs text-slate-500">
              Lecture {activeItemIndex + 1} of {allLectures.length} · {currentLecture?.title}
            </p>
          </div>
        </div>

        {currentLecture && (
          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700">
            <Clock size={13} />
            <span>{currentLecture.durationMin} minutes</span>
          </div>
        )}
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
          {/* Main Left: Video + Tabs for Notes & Materials */}
          <div className="lg:col-span-2 space-y-5">
            {renderVideoPlayer()}

            {/* Lecture Meta & Tab Navigation */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 p-4">
                <h2 className="font-display text-lg font-bold text-slate-900">
                  {currentLecture?.title}
                </h2>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-100 bg-slate-50/70 px-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('notes')}
                  className={`flex items-center gap-1.5 border-b-2 py-3 px-3 text-xs font-bold transition ${
                    activeTab === 'notes'
                      ? 'border-purple-600 text-purple-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileText size={14} /> Lecture Notes
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('materials')}
                  className={`flex items-center gap-1.5 border-b-2 py-3 px-3 text-xs font-bold transition ${
                    activeTab === 'materials'
                      ? 'border-purple-600 text-purple-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Paperclip size={14} /> PDF & Materials ({totalMaterials.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('my_notebook')}
                  className={`flex items-center gap-1.5 border-b-2 py-3 px-3 text-xs font-bold transition ${
                    activeTab === 'my_notebook'
                      ? 'border-purple-600 text-purple-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <PenTool size={14} /> My Notes & Sketches
                </button>
              </div>

              {/* TAB 1: Lecture Notes */}
              {activeTab === 'notes' && (
                <div className="p-6">
                  {currentLecture?.notes ? (
                    <div
                      className="prose prose-purple max-w-none text-sm text-slate-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: currentLecture.notes }}
                    />
                  ) : (
                    <div className="py-8 text-center text-slate-400">
                      <FileText size={32} className="mx-auto mb-2 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-600">No lecture notes written for this lesson.</p>
                      <p className="text-xs text-slate-400 mt-0.5">Use the "My Notes & Sketches" tab to write your own personal notes!</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Materials & Documents */}
              {activeTab === 'materials' && (
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Downloadable Study Materials & Lecture Documents
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Review slides, lecture notes, and exercises offline
                    </p>
                  </div>

                  {totalMaterials.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
                      <Paperclip size={28} className="mx-auto mb-2 text-slate-300" />
                      <p className="text-xs font-semibold text-slate-600">No documents attached to this lecture.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                      {totalMaterials.map((mat) => (
                        <div
                          key={mat.id}
                          className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition"
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-3">
                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100">
                              {getFileIcon(mat.type)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-slate-800">
                                {mat.name}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {mat.size} · {mat.type.toUpperCase()}
                              </p>
                            </div>
                          </div>

                          <a
                            href={mat.url}
                            target="_blank"
                            rel="noreferrer"
                            download
                            className="inline-flex items-center gap-1.5 rounded-lg bg-purple-700 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-purple-800 transition shrink-0"
                          >
                            <Download size={13} /> Download
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Student Personal Notebook & Handwriting */}
              {activeTab === 'my_notebook' && (
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-purple-600" /> My Personal Lecture Notebook
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Type notes or click "Write by Hand / Sketch" to draw diagrams. Automatically saved on your device.
                      </p>
                    </div>
                    {isSavedNotice && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                        <Check size={12} /> Auto-saved
                      </span>
                    )}
                  </div>

                  <RichTextEditor
                    value={studentNotes}
                    onChange={handleSaveStudentNotes}
                    placeholder="Write your personal study takeaways, questions to ask, key concepts, or sketch notes here…"
                    minHeight="220px"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Syllabus & Lecture Playlist */}
          <div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-display text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Course Syllabus ({allLectures.length} lessons)
              </h3>
              <div className="mt-4 space-y-2 max-h-[560px] overflow-y-auto pr-1">
                {allLectures.map((lec, i) => (
                  <button
                    key={lec.id}
                    onClick={() => {
                      setActiveItemIndex(i);
                      setIsPlaying(false);
                    }}
                    className={`flex w-full items-center justify-between gap-2.5 rounded-xl p-2.5 text-left text-xs transition ${
                      i === activeItemIndex
                        ? 'bg-purple-100 text-purple-900 font-bold'
                        : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Circle size={14} className="shrink-0 text-slate-400" />
                      <span className="truncate">{lec.title}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 text-[10px] text-slate-400">
                      {lec.notes && <FileText size={11} className="text-purple-600" title="Has Notes" />}
                      {lec.materials && lec.materials.length > 0 && (
                        <Paperclip size={11} className="text-blue-600" title="Has Attached Materials" />
                      )}
                      <span>{lec.durationMin}m</span>
                    </div>
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
