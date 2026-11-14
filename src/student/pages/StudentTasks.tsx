import { useState, useMemo, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  FileText,
  ClipboardList,
  CheckCircle2,
  Clock,
  Timer,
  Award,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Upload,
  Send,
  X,
  BookOpen,
} from 'lucide-react';
import { useAdminStore, uid } from '../../admin/store/adminStore';
import { useAuth } from '../../auth/AuthProvider';
import Modal from '../../admin/components/ui/Modal';
import { uploadMediaFile } from '../../lib/storage';
import type { CurriculumItem, Quiz, Assignment, Submission } from '../../admin/types';

interface FlattenedTask {
  id: string;
  title: string;
  kind: 'quiz' | 'test' | 'assignment';
  courseId: string;
  courseTitle: string;
  sectionTitle: string;
  item: CurriculumItem;
  submission: Submission | null;
}

export default function StudentTasks() {
  const { courses, orders, submissions, addSubmission } = useAdminStore();
  const { user } = useAuth();

  const userEmail = user?.email?.toLowerCase() || '';

  // 1. Student's enrolled courses
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

  // 2. Student's own submissions
  const mySubmissions = useMemo(() => {
    return submissions.filter(
      (s) =>
        (s.studentEmail && s.studentEmail.toLowerCase() === userEmail) ||
        s.studentName.toLowerCase() === (user?.name?.toLowerCase() || '')
    );
  }, [submissions, userEmail, user]);

  // 3. Extract tasks from enrolled courses
  const allEnrolledTasks = useMemo(() => {
    const list: FlattenedTask[] = [];

    for (const c of myEnrolledCourses) {
      for (const sec of c.curriculum || []) {
        for (const item of sec.items) {
          if (item.kind !== 'lecture') {
            const sub = mySubmissions.find((s) => s.courseId === c.id && s.taskId === item.id) || null;
            list.push({
              id: item.id,
              title: item.title,
              kind: item.kind as 'quiz' | 'test' | 'assignment',
              courseId: c.id,
              courseTitle: c.title,
              sectionTitle: sec.title,
              item,
              submission: sub,
            });
          }
        }
      }
    }

    return list;
  }, [myEnrolledCourses, mySubmissions]);

  const [activeTab, setActiveTab] = useState<'all_tasks' | 'grades_feedback'>('all_tasks');
  const [filterKind, setFilterKind] = useState<'all' | 'quiz' | 'test' | 'assignment'>('all');

  // Modal Runner States
  const [activeQuizModal, setActiveQuizModal] = useState<FlattenedTask | null>(null);
  const [activeAssignModal, setActiveAssignModal] = useState<FlattenedTask | null>(null);

  // Quiz Runner In-Modal
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number[]>>({});
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean } | null>(null);

  // Assignment In-Modal
  const [assignText, setAssignText] = useState('');
  const [assignFile, setAssignFile] = useState<{ name: string; size: string; url?: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const filteredTasks = useMemo(() => {
    return allEnrolledTasks.filter((t) => filterKind === 'all' || t.kind === filterKind);
  }, [allEnrolledTasks, filterKind]);

  // Handle Quiz in Modal
  const handleStartQuiz = (task: FlattenedTask) => {
    setActiveQuizModal(task);
    setQuizAnswers({});
    setQuizResult(null);
  };

  const handleSelectQuizOption = (qId: string, optIdx: number, isMulti = false) => {
    setQuizAnswers((prev) => {
      const current = prev[qId] || [];
      if (isMulti) {
        return {
          ...prev,
          [qId]: current.includes(optIdx) ? current.filter((x) => x !== optIdx) : [...current, optIdx],
        };
      }
      return { ...prev, [qId]: [optIdx] };
    });
  };

  const handleSubmitModalQuiz = () => {
    if (!activeQuizModal) return;
    const quiz = activeQuizModal.item as Quiz;
    const totalPoints = quiz.questions.reduce((acc, q) => acc + (q.points || 1), 0);
    let earnedPoints = 0;

    for (const q of quiz.questions) {
      const selected = quizAnswers[q.id] || [];
      const correct = q.correctIndexes || [];
      const isCorrect = selected.length === correct.length && selected.every((i) => correct.includes(i));
      if (isCorrect) earnedPoints += (q.points || 1);
    }

    const pct = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 100;
    const passed = pct >= (quiz.passingScorePct || 60);

    const sub: Submission = {
      id: uid('sub'),
      studentId: user?.id,
      studentEmail: userEmail,
      studentName: user?.name || 'Student',
      studentAvatar: user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'S')}`,
      courseId: activeQuizModal.courseId,
      courseTitle: activeQuizModal.courseTitle,
      taskId: quiz.id,
      taskTitle: quiz.title,
      taskKind: quiz.kind,
      submittedDate: new Date().toISOString(),
      status: passed ? 'auto_graded' : 'graded',
      score: pct,
      maxScore: 100,
      feedback: passed
        ? `Passed with ${pct}%. Excellent understanding of core topics!`
        : `Scored ${pct}% (Pass threshold: ${quiz.passingScorePct}%). Review questions and retry.`,
      improvementTips: passed
        ? 'Great job! Continue to the next syllabus module.'
        : 'Revisit the related video lecture and study notes to reinforce key points.',
    };

    addSubmission(sub);
    setQuizResult({ score: pct, passed });
  };

  // Handle Assignment in Modal
  const handleOpenAssignModal = (task: FlattenedTask) => {
    setActiveAssignModal(task);
    setAssignText(task.submission?.responseText || '');
    setAssignFile(
      task.submission?.fileName
        ? { name: task.submission.fileName, size: task.submission.fileSize || 'Attached' }
        : null
    );
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      try {
        const res = await uploadMediaFile(file, 'documents', 'document');
        if (res.url) {
          setAssignFile({ name: file.name, size: res.sizeFormatted, url: res.url });
        }
      } catch (err: any) {
        console.warn(err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmitModalAssignment = () => {
    if (!activeAssignModal || (!assignText.trim() && !assignFile)) return;
    const assign = activeAssignModal.item as Assignment;

    const sub: Submission = {
      id: activeAssignModal.submission?.id || uid('sub'),
      studentId: user?.id,
      studentEmail: userEmail,
      studentName: user?.name || 'Student',
      studentAvatar: user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'S')}`,
      courseId: activeAssignModal.courseId,
      courseTitle: activeAssignModal.courseTitle,
      taskId: assign.id,
      taskTitle: assign.title,
      taskKind: 'assignment',
      submittedDate: new Date().toISOString(),
      status: 'needs_grading',
      maxScore: 100,
      responseText: assignText.trim(),
      fileName: assignFile?.name,
      fileSize: assignFile?.size,
    };

    addSubmission(sub);
    setActiveAssignModal(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950">Tasks & Quizzes</h1>
          <p className="text-sm text-slate-500">
            Knowledge checks, project assignments, and teacher evaluations for your enrolled courses.
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('all_tasks')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition ${
            activeTab === 'all_tasks'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList size={16} /> All Tasks & Assessments ({allEnrolledTasks.length})
        </button>
        <button
          onClick={() => setActiveTab('grades_feedback')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition ${
            activeTab === 'grades_feedback'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award size={16} /> My Grades & Feedback ({mySubmissions.length})
        </button>
      </div>

      {/* TAB 1: ALL ENROLLED TASKS */}
      {activeTab === 'all_tasks' && (
        <div className="space-y-4">
          {/* Sub filter bar */}
          <div className="flex flex-wrap items-center gap-2">
            {(['all', 'quiz', 'test', 'assignment'] as const).map((k) => (
              <button
                key={k}
                onClick={() => setFilterKind(k)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  filterKind === k
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {k === 'all' ? 'All Tasks' : k === 'quiz' ? 'Quizzes' : k === 'test' ? 'Exams' : 'Assignments'}
              </button>
            ))}
          </div>

          {filteredTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
              <ClipboardList size={40} className="mx-auto text-slate-300 mb-3" />
              <h3 className="font-display text-base font-bold text-slate-800">
                {myEnrolledCourses.length === 0 ? 'You are not enrolled in any courses yet' : 'No tasks match the filter'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {myEnrolledCourses.length === 0
                  ? 'Enroll in an academy course to access hands-on assignments and quizzes.'
                  : 'Tasks added to your curriculum will show up here.'}
              </p>
              {myEnrolledCourses.length === 0 && (
                <Link
                  to="/courses"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 transition"
                >
                  <BookOpen size={14} /> Browse Courses
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTasks.map((t) => {
                const isDone = t.submission?.status === 'graded' || t.submission?.status === 'auto_graded';
                const isPending = t.submission?.status === 'needs_grading' || t.submission?.status === 'submitted';
                const isResubmit = t.submission?.status === 'resubmission_requested';

                return (
                  <div
                    key={`${t.courseId}_${t.id}`}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            t.kind === 'quiz'
                              ? 'bg-rose-100 text-rose-800'
                              : t.kind === 'test'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {t.kind}
                        </span>

                        {isDone && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                            <CheckCircle2 size={12} /> {t.submission?.score}/100
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                            <Clock size={12} /> In Review
                          </span>
                        )}
                        {isResubmit && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                            Resubmit
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 font-display text-base font-bold text-slate-900 line-clamp-1">
                        {t.title}
                      </h3>
                      <p className="text-xs text-purple-700 font-medium truncate mt-0.5">{t.courseTitle}</p>
                      <p className="text-[11px] text-slate-400 mt-1">Module: {t.sectionTitle}</p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Link
                        to={`/student/courses/${t.courseId}`}
                        className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Classroom
                      </Link>

                      {t.kind === 'quiz' || t.kind === 'test' ? (
                        <button
                          onClick={() => handleStartQuiz(t)}
                          className="rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-purple-700 transition"
                        >
                          {t.submission ? 'Retake Quiz' : 'Start Quiz'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenAssignModal(t)}
                          className="rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-purple-700 transition"
                        >
                          {t.submission ? 'View / Resubmit' : 'Submit Work'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY GRADES & FEEDBACK */}
      {activeTab === 'grades_feedback' && (
        <div className="space-y-4">
          {mySubmissions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
              <Award size={40} className="mx-auto text-slate-300 mb-3" />
              <h3 className="font-display text-base font-bold text-slate-800">
                No evaluated grades yet
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Once you complete quizzes or submit assignments and your instructor grades them, your rubric evaluations and feedback will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {mySubmissions.map((sub) => {
                const isGraded = sub.status === 'graded' || sub.status === 'auto_graded';
                return (
                  <div
                    key={sub.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold uppercase text-purple-700">
                            {sub.taskKind}
                          </span>
                          <span className="text-xs text-slate-400">· {sub.courseTitle}</span>
                        </div>
                        <h3 className="mt-1 font-display text-base font-bold text-slate-900">{sub.taskTitle}</h3>
                      </div>

                      <div className="flex items-center gap-3">
                        {sub.score !== undefined ? (
                          <div className="text-right">
                            <span className="font-display text-2xl font-black text-emerald-600">
                              {sub.score}
                            </span>
                            <span className="text-xs text-slate-400 font-bold"> / {sub.maxScore}</span>
                          </div>
                        ) : (
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                            Awaiting Grade
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Instructor Written Feedback */}
                    {sub.feedback && (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-bold uppercase text-slate-500 mb-1">
                          Teacher Written Feedback
                        </p>
                        <p className="text-xs text-slate-800 leading-relaxed italic">
                          "{sub.feedback}"
                        </p>
                      </div>
                    )}

                    {/* Where to Improve Section */}
                    {sub.improvementTips ? (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                        <p className="text-xs font-bold uppercase text-emerald-800 flex items-center gap-1.5 mb-1">
                          <Sparkles size={14} className="text-emerald-600" /> Where to Improve & Recommendations
                        </p>
                        <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                          {sub.improvementTips}
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs text-slate-500">
                        Continue reviewing course takeaways and practice exercises to maximize mastery.
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Submitted: {new Date(sub.submittedDate).toLocaleDateString()}</span>
                      <Link
                        to={`/student/courses/${sub.courseId}`}
                        className="inline-flex items-center gap-1 font-bold text-purple-700 hover:underline"
                      >
                        Review in Classroom <ExternalLink size={12} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* QUIZ RUNNER MODAL */}
      {activeQuizModal && (
        <Modal
          open={Boolean(activeQuizModal)}
          onClose={() => setActiveQuizModal(null)}
          title={activeQuizModal.title}
          subtitle={`Course: ${activeQuizModal.courseTitle} · ${(activeQuizModal.item as Quiz).questions.length} Questions`}
          size="lg"
          footer={
            !quizResult ? (
              <>
                <button className="btn-outline" onClick={() => setActiveQuizModal(null)}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleSubmitModalQuiz}>
                  <Send size={15} /> Submit for Grading
                </button>
              </>
            ) : (
              <button className="btn-primary" onClick={() => setActiveQuizModal(null)}>
                Done & Close
              </button>
            )
          }
        >
          <div className="space-y-6">
            {quizResult && (
              <div className="rounded-xl border border-purple-200 bg-purple-50 p-5 text-center space-y-2">
                <Award size={36} className="mx-auto text-purple-600" />
                <h3 className="font-display text-lg font-bold text-slate-900">
                  You Scored {quizResult.score}%
                </h3>
                <p className="text-xs text-slate-600">
                  {quizResult.passed ? 'Assessment passed and saved to your gradebook.' : 'Score below passing mark. You can retry anytime.'}
                </p>
              </div>
            )}

            {(activeQuizModal.item as Quiz).questions.map((q, idx) => {
              const selected = quizAnswers[q.id] || [];
              const isMulti = q.type === 'multi';

              return (
                <div key={q.id} className="rounded-xl border border-slate-200 p-4 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <p className="font-semibold text-xs text-slate-900">
                      <span className="font-bold text-purple-700 mr-1.5">Q{idx + 1}.</span> {q.prompt}
                    </p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      {q.points || 1} pt
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isChecked = selected.includes(optIdx);
                      return (
                        <button
                          key={optIdx}
                          disabled={Boolean(quizResult)}
                          onClick={() => handleSelectQuizOption(q.id, optIdx, isMulti)}
                          className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left text-xs transition ${
                            isChecked
                              ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-current text-[11px] font-bold">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Modal>
      )}

      {/* ASSIGNMENT MODAL */}
      {activeAssignModal && (
        <Modal
          open={Boolean(activeAssignModal)}
          onClose={() => setActiveAssignModal(null)}
          title={`Submit Assignment: ${activeAssignModal.title}`}
          subtitle={`Course: ${activeAssignModal.courseTitle}`}
          size="md"
          footer={
            <>
              <button className="btn-outline" onClick={() => setActiveAssignModal(null)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                disabled={isUploading || (!assignText.trim() && !assignFile)}
                onClick={handleSubmitModalAssignment}
              >
                <Send size={15} /> Submit Assignment
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="label">Response Notes / Explanations / Repository Link</label>
              <textarea
                rows={4}
                className="input"
                placeholder="Type your explanation or paste your GitHub repository link here…"
                value={assignText}
                onChange={(e) => setAssignText(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Upload Solution File (PDF, ZIP, DOCX)</label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 hover:bg-slate-100 transition">
                <Upload size={22} className="text-slate-400 mb-1" />
                <span className="text-xs font-bold text-slate-700">
                  {isUploading ? 'Uploading file…' : assignFile ? `${assignFile.name} (${assignFile.size})` : 'Choose file to upload'}
                </span>
                <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
