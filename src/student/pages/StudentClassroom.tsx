import { useState, useMemo, useEffect, ChangeEvent } from 'react';
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
  PenTool,
  Clock,
  Check,
  File,
  FileSpreadsheet,
  FileArchive,
  FileCheck,
  Sparkles,
  Lock,
  HelpCircle,
  Timer,
  AlertCircle,
  Upload,
  Send,
  RotateCcw,
  Award,
} from 'lucide-react';
import { useAdminStore, uid } from '../../admin/store/adminStore';
import { useAuth } from '../../auth/AuthProvider';
import RichTextEditor from '../../components/common/RichTextEditor';
import { uploadMediaFile } from '../../lib/storage';
import type {
  Lecture,
  LectureMaterial,
  CurriculumItem,
  Quiz,
  Assignment,
  Submission,
} from '../../admin/types';

export default function StudentClassroom() {
  const { id } = useParams<{ id: string }>();
  const { courses, orders, submissions, addSubmission } = useAdminStore();
  const { user } = useAuth();

  const course = useMemo(() => courses.find((c) => c.id === id), [courses, id]);
  const userEmail = user?.email?.toLowerCase() || '';

  // Access control: course is free OR user has approved/paid order OR enrolled in profile
  const isEnrolled = useMemo(() => {
    if (!course) return false;
    if (course.free) return true;
    if (user?.role === 'super_admin' || user?.role === 'instructor') return true;
    if (user?.enrolledCourseIds?.includes(course.id)) return true;

    return orders.some(
      (o) =>
        o.status === 'paid' &&
        o.studentEmail.toLowerCase() === userEmail &&
        (o.courseTitle.toLowerCase().includes(course.title.toLowerCase()) ||
          o.courseIds?.includes(course.id))
    );
  }, [course, user, orders, userEmail]);

  // Check if there is an order awaiting admin payment verification
  const pendingOrder = useMemo(() => {
    if (!course || isEnrolled) return null;
    return (
      orders.find(
        (o) =>
          o.status === 'pending' &&
          o.studentEmail.toLowerCase() === userEmail &&
          (o.courseTitle.toLowerCase().includes(course.title.toLowerCase()) ||
            o.courseIds?.includes(course.id))
      ) || null
    );
  }, [course, isEnrolled, userEmail, orders]);

  // Flattened curriculum items
  const sections = useMemo(() => course?.curriculum || [], [course]);
  const allItems = useMemo(
    () => sections.flatMap((sec) => sec.items.map((item) => ({ ...item, sectionTitle: sec.title }))),
    [sections]
  );

  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'materials' | 'my_notebook'>('notes');
  const [studentNotes, setStudentNotes] = useState<string>('');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number[]>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Assignment Submission State
  const [assignmentResponse, setAssignmentResponse] = useState<string>('');
  const [assignmentFile, setAssignmentFile] = useState<{ name: string; size: string; url?: string } | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const currentItem = allItems[activeItemIndex];

  // Completed items in localStorage
  const [completedItems, setCompletedItems] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(`completed_items_${id}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const markItemCompleted = (itemId: string) => {
    setCompletedItems((prev) => {
      const next = new Set(prev);
      next.add(itemId);
      if (id) {
        localStorage.setItem(`completed_items_${id}`, JSON.stringify(Array.from(next)));
      }
      return next;
    });
  };

  // Student's existing submission for current task
  const existingSubmission = useMemo(() => {
    if (!currentItem || currentItem.kind === 'lecture' || !course) return null;
    return (
      submissions.find(
        (s) =>
          s.courseId === course.id &&
          s.taskId === currentItem.id &&
          ((s.studentEmail && s.studentEmail.toLowerCase() === userEmail) ||
            s.studentName.toLowerCase() === (user?.name?.toLowerCase() || ''))
      ) || null
    );
  }, [submissions, course, currentItem, userEmail, user]);

  // Load student personal notes for this lecture from localStorage
  useEffect(() => {
    if (course && id) {
      const storageKey = `student_notes_${id}_item_${activeItemIndex}`;
      const saved = localStorage.getItem(storageKey);
      setStudentNotes(saved || '');
    }
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setAssignmentResponse('');
    setAssignmentFile(null);
    setSubmitSuccess(null);
  }, [id, activeItemIndex, course]);

  const handleSaveStudentNotes = (notes: string) => {
    setStudentNotes(notes);
    if (course && id) {
      const storageKey = `student_notes_${id}_item_${activeItemIndex}`;
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

  // Access control gate: block access if student hasn't paid or isn't approved
  if (!isEnrolled) {
    if (pendingOrder) {
      return (
        <div className="mx-auto max-w-xl py-12">
          <div className="rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-card sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Clock size={36} />
            </div>
            <h2 className="mt-5 font-display text-xl font-bold text-slate-900">
              Payment Verification in Progress
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Your enrollment for <strong className="text-slate-800">{course.title}</strong> has been received under Order Reference <code className="font-mono font-bold text-brand-700">{pendingOrder.reference}</code>.
            </p>
            <div className="mt-4 rounded-xl bg-amber-50/80 p-4 text-xs text-amber-800 leading-normal text-left">
              <p className="font-bold flex items-center gap-1.5 mb-1 text-amber-900">
                <Sparkles size={13} /> Status: Awaiting Admin Verification
              </p>
              Our administration team is currently verifying your Mobile Money / Bank Transfer transaction reference. As soon as your payment is verified, this classroom will unlock automatically.
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/student/orders"
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-purple-700 transition"
              >
                <Clock size={14} /> Check Order Status
              </Link>
              <Link
                to="/student/courses"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <ArrowLeft size={14} /> Back to My Courses
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-xl py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <Lock size={36} />
          </div>
          <h2 className="mt-5 font-display text-xl font-bold text-slate-900">
            Classroom Access Locked
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            You are not enrolled in <strong className="text-slate-800">{course.title}</strong>. An approved enrollment is required to access the video lectures, assignments, and study materials.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={`/courses/${course.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-purple-700 transition"
            >
              Enroll Now — Unlock Access
            </Link>
            <Link
              to="/student/courses"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <ArrowLeft size={14} /> Back to My Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER VIDEO PLAYER (For Lectures)
  // -------------------------------------------------------------
  const renderVideoPlayer = (lecture: Lecture) => {
    const url = lecture.videoUrl;
    if (!url) {
      return (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-950 shadow-lg flex items-center justify-center">
          <img
            src={course.thumbnail}
            alt="Thumbnail"
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
            title={lecture.title}
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

  // -------------------------------------------------------------
  // QUIZ & EXAM RUNNER HANDLERS
  // -------------------------------------------------------------
  const handleSelectAnswer = (qId: string, optionIndex: number, isMulti = false) => {
    setQuizAnswers((prev) => {
      const current = prev[qId] || [];
      if (isMulti) {
        return {
          ...prev,
          [qId]: current.includes(optionIndex)
            ? current.filter((x) => x !== optionIndex)
            : [...current, optionIndex],
        };
      }
      return { ...prev, [qId]: [optionIndex] };
    });
  };

  const handleSubmitQuiz = (quiz: Quiz) => {
    const totalPoints = quiz.questions.reduce((acc, q) => acc + (q.points || 1), 0);
    let earnedPoints = 0;

    for (const q of quiz.questions) {
      const userSelected = quizAnswers[q.id] || [];
      const correct = q.correctIndexes || [];
      const isCorrect =
        userSelected.length === correct.length &&
        userSelected.every((idx) => correct.includes(idx));
      if (isCorrect) earnedPoints += (q.points || 1);
    }

    const calculatedPct = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 100;
    const isPass = calculatedPct >= (quiz.passingScorePct || 60);

    const submissionRecord: Submission = {
      id: uid('sub'),
      studentId: user?.id,
      studentEmail: userEmail,
      studentName: user?.name || 'Student',
      studentAvatar: user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'S')}`,
      courseId: course.id,
      courseTitle: course.title,
      taskId: quiz.id,
      taskTitle: quiz.title,
      taskKind: quiz.kind,
      submittedDate: new Date().toISOString(),
      status: isPass ? 'auto_graded' : 'graded',
      score: calculatedPct,
      maxScore: 100,
      feedback: isPass
        ? `Passed with ${calculatedPct}%. Great grasp of the assessment material!`
        : `Scored ${calculatedPct}% (Passing threshold: ${quiz.passingScorePct}%). Review questions and retry.`,
      improvementTips: isPass
        ? 'Solid performance! Keep practicing code exercises and lecture takeaways.'
        : 'Review the lecture materials corresponding to this quiz section to reinforce key concepts.',
    };

    addSubmission(submissionRecord);
    markItemCompleted(quiz.id);
    setQuizScore(calculatedPct);
    setQuizSubmitted(true);
  };

  // -------------------------------------------------------------
  // ASSIGNMENT SUBMISSION HANDLERS
  // -------------------------------------------------------------
  const handleAssignmentFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploadingFile(true);
      try {
        const res = await uploadMediaFile(file, 'documents', 'document');
        if (res.url) {
          setAssignmentFile({ name: file.name, size: res.sizeFormatted, url: res.url });
        }
      } catch (err: any) {
        console.warn(err);
      } finally {
        setIsUploadingFile(false);
      }
    }
  };

  const handleSubmitAssignment = (assign: Assignment) => {
    if (!assignmentResponse.trim() && !assignmentFile) return;

    const submissionRecord: Submission = {
      id: existingSubmission?.id || uid('sub'),
      studentId: user?.id,
      studentEmail: userEmail,
      studentName: user?.name || 'Student',
      studentAvatar: user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'S')}`,
      courseId: course.id,
      courseTitle: course.title,
      taskId: assign.id,
      taskTitle: assign.title,
      taskKind: 'assignment',
      submittedDate: new Date().toISOString(),
      status: 'needs_grading',
      maxScore: 100,
      responseText: assignmentResponse.trim(),
      fileName: assignmentFile?.name,
      fileSize: assignmentFile?.size,
    };

    addSubmission(submissionRecord);
    markItemCompleted(assign.id);
    setSubmitSuccess('Your assignment has been submitted to your course instructor for review and grading!');
    setTimeout(() => setSubmitSuccess(null), 5000);
  };

  const currentLecture = currentItem?.kind === 'lecture' ? (currentItem as Lecture) : null;
  const currentQuiz = currentItem?.kind === 'quiz' || currentItem?.kind === 'test' ? (currentItem as Quiz) : null;
  const currentAssignment = currentItem?.kind === 'assignment' ? (currentItem as Assignment) : null;

  const totalMaterials = [
    ...(currentLecture?.materials || []),
    ...(course.materials || []),
  ];

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
              {currentItem ? `${currentItem.kind.toUpperCase()}: ${currentItem.title}` : 'Curriculum Viewer'} · Item {activeItemIndex + 1} of {allItems.length}
            </p>
          </div>
        </div>

        {currentItem?.kind === 'lecture' && (
          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700">
            <Clock size={13} />
            <span>{(currentItem as Lecture).durationMin} minutes</span>
          </div>
        )}
      </div>

      {allItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          <FileText size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-display text-base font-bold text-slate-800">
            No curriculum lessons published yet
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            The instructor has not added video lessons or tasks to this course yet. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Left Area: Lecture, Quiz, or Assignment */}
          <div className="lg:col-span-2 space-y-5">
            {/* 1. LECTURE ITEM */}
            {currentLecture && (
              <>
                {renderVideoPlayer(currentLecture)}

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 p-4">
                    <h2 className="font-display text-lg font-bold text-slate-900">
                      {currentLecture.title}
                    </h2>
                    <button
                      onClick={() => markItemCompleted(currentLecture.id)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        completedItems.has(currentLecture.id)
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <CheckCircle2 size={14} className={completedItems.has(currentLecture.id) ? 'text-emerald-600' : ''} />
                      {completedItems.has(currentLecture.id) ? 'Completed' : 'Mark Lesson Complete'}
                    </button>
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

                  {activeTab === 'notes' && (
                    <div className="p-6">
                      {currentLecture.notes ? (
                        <div
                          className="prose prose-purple max-w-none text-sm text-slate-700 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: currentLecture.notes }}
                        />
                      ) : (
                        <div className="py-8 text-center text-slate-400">
                          <FileText size={32} className="mx-auto mb-2 text-slate-300" />
                          <p className="text-sm font-semibold text-slate-600">No instructor notes written for this lesson.</p>
                          <p className="text-xs text-slate-400 mt-0.5">Use the "My Notes & Sketches" tab to write personal notes.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'materials' && (
                    <div className="p-6 space-y-4">
                      {totalMaterials.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
                          <Paperclip size={28} className="mx-auto mb-2 text-slate-300" />
                          <p className="text-xs font-semibold text-slate-600">No documents attached to this lesson.</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                          {totalMaterials.map((mat) => (
                            <div key={mat.id} className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition">
                              <div className="flex items-center gap-3 min-w-0 pr-3">
                                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100">
                                  {getFileIcon(mat.type)}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-bold text-slate-800">{mat.name}</p>
                                  <p className="text-[11px] text-slate-400">{mat.size} · {mat.type.toUpperCase()}</p>
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

                  {activeTab === 'my_notebook' && (
                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Sparkles size={14} className="text-purple-600" /> Personal Lecture Notebook
                          </h3>
                          <p className="text-[11px] text-slate-400">Saved locally on your device.</p>
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
                        placeholder="Write study takeaways or questions here…"
                        minHeight="220px"
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            {/* 2. QUIZ / EXAM ITEM */}
            {currentQuiz && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700">
                    <HelpCircle size={15} />
                    <span>{currentQuiz.kind === 'test' ? 'Exam / Official Test' : 'Knowledge Quiz'}</span>
                  </div>
                  <h2 className="mt-1 font-display text-xl font-bold text-slate-900">{currentQuiz.title}</h2>
                  <p className="mt-1 text-xs text-slate-500">{currentQuiz.description || 'Test your understanding of the curriculum concepts.'}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1">
                      {currentQuiz.questions.length} Questions
                    </span>
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1">
                      Passing Threshold: {currentQuiz.passingScorePct}%
                    </span>
                    {currentQuiz.durationMin && (
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 flex items-center gap-1">
                        <Timer size={12} /> {currentQuiz.durationMin} Minutes
                      </span>
                    )}
                  </div>
                </div>

                {/* Prior submission review banner */}
                {existingSubmission && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-emerald-600" />
                        <div>
                          <p className="text-xs font-bold text-emerald-900">
                            Assessment Completed: Scored {existingSubmission.score} / {existingSubmission.maxScore}
                          </p>
                          <p className="text-[11px] text-emerald-700 mt-0.5">
                            Status: <strong className="uppercase">{existingSubmission.status.replace('_', ' ')}</strong>
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setQuizSubmitted(false);
                          setQuizAnswers({});
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 transition"
                      >
                        <RotateCcw size={12} /> Retake Quiz
                      </button>
                    </div>

                    {existingSubmission.feedback && (
                      <div className="mt-3 rounded-lg bg-white/80 p-3 text-xs text-slate-700">
                        <strong>Instructor Feedback:</strong> {existingSubmission.feedback}
                      </div>
                    )}
                    {existingSubmission.improvementTips && (
                      <div className="mt-2 rounded-lg bg-emerald-100/60 p-3 text-xs text-emerald-900">
                        <strong>💡 Where to Improve:</strong> {existingSubmission.improvementTips}
                      </div>
                    )}
                  </div>
                )}

                {/* Interactive Questions */}
                <div className="space-y-6">
                  {currentQuiz.questions.map((q, qIndex) => {
                    const isMulti = q.type === 'multi';
                    const selected = quizAnswers[q.id] || [];

                    return (
                      <div key={q.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-sm text-slate-900">
                            <span className="font-bold text-purple-700 mr-1.5">Q{qIndex + 1}.</span>
                            {q.prompt}
                          </p>
                          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700 shrink-0">
                            {q.points || 1} pt
                          </span>
                        </div>

                        {/* Options */}
                        <div className="space-y-2 pt-1">
                          {q.options.map((opt, optIdx) => {
                            const isChecked = selected.includes(optIdx);
                            const isCorrectOpt = q.correctIndexes?.includes(optIdx);
                            const showResult = quizSubmitted || (existingSubmission && !quizAnswers[q.id]);

                            let optionStyle = 'border-slate-200 hover:bg-slate-100 text-slate-800 bg-white';
                            if (showResult) {
                              if (isCorrectOpt) {
                                optionStyle = 'border-emerald-300 bg-emerald-50 text-emerald-900 font-bold';
                              } else if (isChecked && !isCorrectOpt) {
                                optionStyle = 'border-rose-300 bg-rose-50 text-rose-900 line-through';
                              }
                            } else if (isChecked) {
                              optionStyle = 'border-purple-600 bg-purple-50 text-purple-900 font-bold';
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                disabled={quizSubmitted}
                                onClick={() => handleSelectAnswer(q.id, optIdx, isMulti)}
                                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left text-xs transition ${optionStyle}`}
                              >
                                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-current text-[11px] font-bold">
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation when submitted */}
                        {(quizSubmitted || existingSubmission) && q.explanation && (
                          <div className="rounded-lg bg-purple-50 p-3 text-xs text-purple-900 mt-2">
                            <strong>Explanation:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!quizSubmitted && (
                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleSubmitQuiz(currentQuiz)}
                      className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-purple-700 shadow-md transition"
                    >
                      <Send size={14} /> Submit Quiz for Grading
                    </button>
                  </div>
                )}

                {quizSubmitted && quizScore !== null && (
                  <div className="rounded-xl border border-purple-200 bg-purple-50 p-5 text-center space-y-2">
                    <Award size={36} className="mx-auto text-purple-600" />
                    <h3 className="font-display text-lg font-bold text-slate-900">
                      Quiz Complete! You Scored {quizScore}%
                    </h3>
                    <p className="text-xs text-slate-600 max-w-md mx-auto">
                      {quizScore >= currentQuiz.passingScorePct
                        ? 'Congratulations! You passed this knowledge check. This module is recorded in your gradebook.'
                        : `You scored below the passing threshold (${currentQuiz.passingScorePct}%). Review questions above and retry.`}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 3. ASSIGNMENT ITEM */}
            {currentAssignment && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
                    <FileText size={15} />
                    <span>Project Assignment</span>
                  </div>
                  <h2 className="mt-1 font-display text-xl font-bold text-slate-900">{currentAssignment.title}</h2>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
                    <span className="rounded-lg bg-amber-50 text-amber-800 px-2.5 py-1">
                      Estimated: {currentAssignment.estimatedHours} Hours
                    </span>
                    {currentAssignment.dueDate && (
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 flex items-center gap-1">
                        <Clock size={12} /> Due: {currentAssignment.dueDate}
                      </span>
                    )}
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Assignment Brief & Instructions</h3>
                  <div
                    className="prose prose-purple max-w-none text-xs text-slate-700 leading-relaxed rounded-xl border border-slate-200 bg-slate-50 p-4"
                    dangerouslySetInnerHTML={{ __html: currentAssignment.instructions }}
                  />
                </div>

                {/* Reference Files */}
                {currentAssignment.referenceFiles && currentAssignment.referenceFiles.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Provided Reference Materials</h3>
                    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                      {currentAssignment.referenceFiles.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-3 text-xs">
                          <span className="font-semibold text-slate-800">📄 {file.name} ({file.size})</span>
                          {file.url && (
                            <a
                              href={file.url}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="text-purple-700 hover:underline font-bold"
                            >
                              Download File
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Existing Submission Status & Feedback */}
                {existingSubmission && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900">Your Current Submission</p>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        existingSubmission.status === 'graded' ? 'bg-emerald-100 text-emerald-800' :
                        existingSubmission.status === 'resubmission_requested' ? 'bg-amber-100 text-amber-800' :
                        'bg-sky-100 text-sky-800'
                      }`}>
                        {existingSubmission.status.replace('_', ' ')}
                      </span>
                    </div>

                    {existingSubmission.score !== undefined && (
                      <p className="text-sm font-bold text-slate-900">
                        Score Awarded: {existingSubmission.score} / {existingSubmission.maxScore}
                      </p>
                    )}

                    {existingSubmission.feedback && (
                      <div className="rounded-lg bg-white p-3 text-xs text-slate-700 border border-slate-200">
                        <strong>Instructor Feedback:</strong> {existingSubmission.feedback}
                      </div>
                    )}

                    {existingSubmission.improvementTips && (
                      <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-900 border border-emerald-200">
                        <strong>💡 Where to Improve:</strong> {existingSubmission.improvementTips}
                      </div>
                    )}
                  </div>
                )}

                {/* Submission Form */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="font-display text-sm font-bold text-slate-900">
                    {existingSubmission ? 'Update or Resubmit Assignment Work' : 'Submit Your Assignment Work'}
                  </h3>

                  {submitSuccess && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-900">
                      ✓ {submitSuccess}
                    </div>
                  )}

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
                      Written Response / Repository Link / Summary
                    </label>
                    <textarea
                      rows={4}
                      value={assignmentResponse}
                      onChange={(e) => setAssignmentResponse(e.target.value)}
                      placeholder="Type your explanation, answers, or paste your GitHub repository link here…"
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-200"
                    />
                  </div>

                  {/* Document upload */}
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
                      Upload Solution File (PDF, DOCX, ZIP, or Code Archive)
                    </label>
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 hover:bg-slate-100 transition">
                      <Upload size={22} className="text-slate-400 mb-1" />
                      <span className="text-xs font-bold text-slate-700">
                        {isUploadingFile ? 'Uploading file…' : assignmentFile ? `Uploaded: ${assignmentFile.name} (${assignmentFile.size})` : 'Click to browse and upload file'}
                      </span>
                      <input
                        type="file"
                        onChange={handleAssignmentFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => handleSubmitAssignment(currentAssignment)}
                      disabled={isUploadingFile || (!assignmentResponse.trim() && !assignmentFile)}
                      className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-purple-700 shadow-md transition disabled:opacity-50"
                    >
                      <Send size={14} /> Submit Assignment to Instructor
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Syllabus Playlist */}
          <div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sticky top-20">
              <h3 className="font-display text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Course Syllabus ({allItems.length} modules)
              </h3>
              <div className="mt-4 space-y-2 max-h-[560px] overflow-y-auto pr-1">
                {allItems.map((item, i) => {
                  const isDone = completedItems.has(item.id);
                  const isCurrent = i === activeItemIndex;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveItemIndex(i);
                        setIsPlaying(false);
                      }}
                      className={`flex w-full items-center justify-between gap-2.5 rounded-xl p-2.5 text-left text-xs transition ${
                        isCurrent
                          ? 'bg-purple-100 text-purple-900 font-bold'
                          : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {isDone ? (
                          <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
                        ) : (
                          <Circle size={15} className="shrink-0 text-slate-400" />
                        )}
                        <span className="truncate">{item.title}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 text-[10px] text-slate-400">
                        {item.kind === 'lecture' && (
                          <span>{(item as Lecture).durationMin}m</span>
                        )}
                        {item.kind === 'quiz' && (
                          <span className="rounded bg-rose-50 px-1.5 py-0.5 text-rose-700 font-bold">Quiz</span>
                        )}
                        {item.kind === 'test' && (
                          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700 font-bold">Exam</span>
                        )}
                        {item.kind === 'assignment' && (
                          <span className="rounded bg-amber-50 px-1.5 py-0.5 text-amber-700 font-bold">Task</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
