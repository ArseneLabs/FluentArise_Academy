import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Play,
  FileText,
  Download,
  Award,
  BookOpen,
  Volume2,
  Maximize2,
  Check,
} from 'lucide-react';

interface ClassroomLecture {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  notes: string;
}

interface ClassroomSection {
  id: string;
  title: string;
  lectures: ClassroomLecture[];
}

const initialSections: ClassroomSection[] = [
  {
    id: 'sec_1',
    title: 'Module 1: Object-Oriented Fundamentals & Syntax',
    lectures: [
      {
        id: 'lec_1',
        title: 'Welcome to Java OOP & Development Environment',
        duration: '12:45',
        completed: true,
        notes:
          'In this session, we set up IntelliJ IDEA, configured Java 21 LTS SDK, and verified compilation via javac.',
      },
      {
        id: 'lec_2',
        title: 'Class Blueprints, Fields, and Methods',
        duration: '18:20',
        completed: true,
        notes:
          'Classes define state (fields) and behavior (methods). We explored public vs private encapsulation.',
      },
      {
        id: 'lec_3',
        title: 'Constructors, Memory Heap vs Stack Allocation',
        duration: '22:15',
        completed: true,
        notes:
          'Objects live on the heap; reference variables live on the call stack. Multiple constructors enable method overloading.',
      },
    ],
  },
  {
    id: 'sec_2',
    title: 'Module 2: Inheritance & Subclassing',
    lectures: [
      {
        id: 'lec_4',
        title: 'The extends Keyword & Superclass Hierarchy',
        duration: '19:40',
        completed: true,
        notes:
          'Inheritance models an "is-a" relationship. We learned how super() invokes the parent constructor.',
      },
      {
        id: 'lec_5',
        title: 'Method Overriding & Polymorphic Dispatch',
        duration: '25:10',
        completed: false,
        notes:
          'Dynamic method dispatch allows Java to determine at runtime which version of an overridden method to execute.',
      },
      {
        id: 'lec_6',
        title: 'Abstract Classes vs Interfaces',
        duration: '28:30',
        completed: false,
        notes:
          'Abstract classes allow partial implementation and state, while interfaces define pure contracts with multiple implementation support.',
      },
    ],
  },
  {
    id: 'sec_3',
    title: 'Module 3: Advanced Architecture & Design Patterns',
    lectures: [
      {
        id: 'lec_7',
        title: 'Factory & Singleton Patterns in Java',
        duration: '31:00',
        completed: false,
        notes: 'Decoupling object instantiation and controlling lifecycle concurrency.',
      },
      {
        id: 'lec_8',
        title: 'Exception Handling & Custom Domain Errors',
        duration: '21:15',
        completed: false,
        notes: 'Checked vs unchecked exceptions and fail-fast architectural patterns.',
      },
    ],
  },
];

export default function StudentClassroom() {
  const { id } = useParams<{ id: string }>();
  const [sections, setSections] = useState<ClassroomSection[]>(initialSections);
  const [activeLectureId, setActiveLectureId] = useState<string>('lec_5');
  const [activeTab, setActiveTab] = useState<'notes' | 'resources'>('notes');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Find active lecture
  let activeLecture: ClassroomLecture | null = null;
  let activeSectionTitle = '';
  for (const s of sections) {
    for (const l of s.lectures) {
      if (l.id === activeLectureId) {
        activeLecture = l;
        activeSectionTitle = s.title;
        break;
      }
    }
  }

  const toggleComplete = (lectureId: string) => {
    setSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        lectures: sec.lectures.map((lec) =>
          lec.id === lectureId ? { ...lec, completed: !lec.completed } : lec
        ),
      }))
    );
  };

  const totalCount = sections.reduce((acc, s) => acc + s.lectures.length, 0);
  const completedCount = sections.reduce(
    (acc, s) => acc + s.lectures.filter((l) => l.completed).length,
    0
  );
  const progressPct = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/student/courses"
            className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-slate-900">
              Java & Object-Oriented Programming Mastery
            </h1>
            <p className="text-xs text-slate-500">
              {activeSectionTitle} · {activeLecture?.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <span className="font-bold text-purple-700">{progressPct}% Completed</span>
            <p className="text-[11px] text-slate-400">
              {completedCount} of {totalCount} lessons
            </p>
          </div>
          <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-purple-600 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Video Player + Curriculum Sidebar */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Player + Notes */}
        <div className="lg:col-span-2 space-y-4">
          {/* Player Simulation */}
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-950 shadow-lg flex items-center justify-center group">
            <img
              src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80"
              alt="Video Poster"
              className={`h-full w-full object-cover transition-opacity duration-300 ${
                isPlaying ? 'opacity-30' : 'opacity-60'
              }`}
            />

            {/* Video overlay controls */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-t from-black/80 via-transparent to-black/40">
              <div className="flex items-center justify-between text-xs text-white">
                <span className="font-bold bg-purple-600/90 px-2.5 py-1 rounded-md backdrop-blur">
                  HD 1080p
                </span>
                <span className="font-medium text-slate-300">
                  Duration: {activeLecture?.duration}
                </span>
              </div>

              {/* Center Play Button */}
              <button
                onClick={() => setIsPlaying((p) => !p)}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-600 text-white shadow-2xl transition hover:scale-110 active:scale-95"
              >
                <Play size={28} fill="currentColor" className="ml-1" />
              </button>

              <div className="flex items-center justify-between text-xs text-white">
                <p className="font-bold truncate max-w-sm">{activeLecture?.title}</p>
                <div className="flex items-center gap-2">
                  <Volume2 size={16} />
                  <Maximize2 size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* Player Action Row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                {activeLecture?.title}
              </h2>
              <p className="text-xs text-slate-500">Estimated duration: {activeLecture?.duration}</p>
            </div>

            <button
              onClick={() => activeLecture && toggleComplete(activeLecture.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-sm ${
                activeLecture?.completed
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {activeLecture?.completed ? (
                <>
                  <Check size={16} /> Completed (Click to Undo)
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} /> Mark Lesson as Complete
                </>
              )}
            </button>
          </div>

          {/* Notes & Resources Tabs */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex border-b border-slate-100 pb-3 gap-6">
              <button
                onClick={() => setActiveTab('notes')}
                className={`text-sm font-bold pb-2 transition border-b-2 -mb-3 ${
                  activeTab === 'notes'
                    ? 'border-purple-600 text-purple-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Lecture Notes & Summary
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`text-sm font-bold pb-2 transition border-b-2 -mb-3 ${
                  activeTab === 'resources'
                    ? 'border-purple-600 text-purple-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Downloadable Resources (2)
              </button>
            </div>

            <div className="pt-4 text-sm text-slate-700 leading-relaxed">
              {activeTab === 'notes' ? (
                <div>
                  <p className="font-semibold text-slate-900 mb-2">Lesson Overview:</p>
                  <p>{activeLecture?.notes}</p>
                  <div className="mt-4 rounded-xl bg-purple-50 p-4 text-xs text-purple-900 border border-purple-100">
                    <p className="font-bold">Key takeaway:</p>
                    <p className="mt-1">
                      Always declare polymorphic variables with superclass or interface types, while instantiating them with specific concrete classes.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3 hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-purple-600" />
                      <div>
                        <p className="font-bold text-xs text-slate-900">
                          Polymorphism_CheatSheet_L5.pdf
                        </p>
                        <p className="text-[11px] text-slate-400">PDF Document · 840 KB</p>
                      </div>
                    </div>
                    <button className="flex items-center gap-1 text-xs font-bold text-purple-700 hover:underline">
                      <Download size={13} /> Download
                    </button>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3 hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-purple-600" />
                      <div>
                        <p className="font-bold text-xs text-slate-900">
                          PolymorphicShapes_Starter_Code.zip
                        </p>
                        <p className="text-[11px] text-slate-400">Source Archive · 2.1 MB</p>
                      </div>
                    </div>
                    <button className="flex items-center gap-1 text-xs font-bold text-purple-700 hover:underline">
                      <Download size={13} /> Download
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Interactive Curriculum Drawer */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-display text-base font-bold text-slate-900">Course Syllabus</h2>
              <p className="text-xs text-slate-400">Click any lecture to load it</p>
            </div>

            <div className="mt-4 space-y-4 max-h-[640px] overflow-y-auto pr-1">
              {sections.map((section) => (
                <div key={section.id} className="space-y-1.5">
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {section.title}
                  </p>
                  <div className="space-y-1">
                    {section.lectures.map((lecture) => {
                      const isActive = lecture.id === activeLectureId;
                      return (
                        <button
                          key={lecture.id}
                          onClick={() => setActiveLectureId(lecture.id)}
                          className={`flex w-full items-start gap-2.5 rounded-xl p-2.5 text-left text-xs transition ${
                            isActive
                              ? 'bg-purple-100 text-purple-900 font-bold border border-purple-200'
                              : 'hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleComplete(lecture.id);
                            }}
                            className="mt-0.5 shrink-0 text-slate-400 hover:text-emerald-600"
                          >
                            {lecture.completed ? (
                              <CheckCircle2 size={15} className="text-emerald-600" />
                            ) : (
                              <Circle size={15} />
                            )}
                          </span>
                          <div className="flex-1 truncate">
                            <p className="truncate">{lecture.title}</p>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {lecture.duration}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
