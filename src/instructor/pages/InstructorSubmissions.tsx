import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileCheck2,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  MessageSquare,
  Award,
  BookOpen,
} from 'lucide-react';
import { useAdminStore } from '../../admin/store/adminStore';
import { useAuth } from '../../auth/AuthProvider';
import Modal from '../../admin/components/ui/Modal';
import { relativeDate } from '../../admin/lib/format';
import type { Submission } from '../../admin/types';

export default function InstructorSubmissions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCourseId = searchParams.get('courseId') || 'all';

  const { user } = useAuth();
  const { submissions, courses, gradeSubmission } = useAdminStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'needs_grading' | 'graded'>('all');
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  // Grade Form State
  const [gradeScore, setGradeScore] = useState<number>(85);
  const [gradeFeedback, setGradeFeedback] = useState<string>('');
  const [gradeTips, setGradeTips] = useState<string>('');
  const [gradeStatus, setGradeStatus] = useState<'graded' | 'resubmission_requested'>('graded');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Find instructor assigned courses
  const myCourses = useMemo(() => {
    return courses.filter(
      (c) => c.instructorId === user?.id || c.instructorId === user?.instructorId
    );
  }, [courses, user]);

  const myCourseIds = useMemo(() => new Set(myCourses.map((c) => c.id)), [myCourses]);

  // Strictly filter submissions to ONLY courses assigned to this instructor!
  const instructorSubmissions = useMemo(() => {
    if (myCourses.length === 0) return [];

    return submissions.filter((s) => {
      // Must belong to one of this instructor's courses
      if (!myCourseIds.has(s.courseId)) return false;

      // Filter by selected course if specified
      if (selectedCourseId !== 'all' && s.courseId !== selectedCourseId) return false;

      const matchSearch =
        s.studentName.toLowerCase().includes(search.toLowerCase()) ||
        s.taskTitle.toLowerCase().includes(search.toLowerCase()) ||
        s.courseTitle.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'needs_grading'
          ? s.status === 'needs_grading' || s.status === 'submitted'
          : s.status === 'graded' || s.status === 'auto_graded');

      return matchSearch && matchStatus;
    });
  }, [submissions, myCourses, myCourseIds, selectedCourseId, search, statusFilter]);

  const openGradingModal = (sub: Submission) => {
    setSelectedSub(sub);
    setGradeScore(sub.score ?? Math.round(sub.maxScore * 0.85));
    setGradeFeedback(sub.feedback || 'Good effort on the exercises and solutions.');
    setGradeTips(sub.improvementTips || 'Focus on code structure, edge case handling, and best practices.');
    setGradeStatus(sub.status === 'resubmission_requested' ? 'resubmission_requested' : 'graded');
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    gradeSubmission(
      selectedSub.id,
      Number(gradeScore),
      gradeFeedback.trim(),
      gradeStatus,
      gradeTips.trim()
    );

    setToastMessage(`Graded ${selectedSub.studentName} for "${selectedSub.taskTitle}"!`);
    setSelectedSub(null);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950">
            Submissions & Grading
          </h1>
          <p className="text-sm text-slate-500">
            Review student responses, evaluate coursework, and provide actionable tips for improvement.
          </p>
        </div>

        {myCourses.length > 0 && (
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
        )}
      </div>

      {toastMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900 shadow-sm">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student, task, or course…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs outline-none focus:border-emerald-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              statusFilter === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Submissions
          </button>
          <button
            onClick={() => setStatusFilter('needs_grading')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              statusFilter === 'needs_grading'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Needs Grading
          </button>
          <button
            onClick={() => setStatusFilter('graded')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              statusFilter === 'graded'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Graded
          </button>
        </div>
      </div>

      {/* Submissions List */}
      {myCourses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-display text-base font-bold text-slate-800">
            No courses assigned to your profile
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Once you are assigned to courses by a Super Admin, submissions for those courses will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Task & Course</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {instructorSubmissions.map((sub) => {
                  const isPending = sub.status === 'needs_grading' || sub.status === 'submitted';
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={sub.studentAvatar}
                            alt={sub.studentName}
                            className="h-9 w-9 rounded-lg object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{sub.studentName}</p>
                            {sub.studentEmail && (
                              <p className="text-[11px] text-slate-400">{sub.studentEmail}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900 text-xs">{sub.taskTitle}</p>
                        <p className="text-[11px] text-emerald-800 font-medium">{sub.courseTitle}</p>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {relativeDate(sub.submittedDate)}
                      </td>

                      <td className="py-3.5 px-4">
                        {sub.score !== undefined ? (
                          <span className="font-bold text-slate-900">
                            {sub.score} / {sub.maxScore}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">— / {sub.maxScore}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            isPending
                              ? 'bg-amber-100 text-amber-800'
                              : sub.status === 'resubmission_requested'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isPending ? 'Needs Grading' : sub.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openGradingModal(sub)}
                          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                            isPending
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                              : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {isPending ? 'Grade Now' : 'Edit Evaluation'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {instructorSubmissions.length === 0 && (
              <div className="py-12 text-center text-xs text-slate-400">
                No coursework submissions found matching your selected criteria.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grading Modal */}
      {selectedSub && (
        <Modal
          open={Boolean(selectedSub)}
          onClose={() => setSelectedSub(null)}
          title={`Evaluate Submission: ${selectedSub.taskTitle}`}
          subtitle={`Student: ${selectedSub.studentName} · Course: ${selectedSub.courseTitle}`}
          size="lg"
        >
          <form onSubmit={handleSaveGrade} className="space-y-4">
            {/* Student work preview */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-slate-500 mb-1.5">
                Student Submitted Response
              </p>
              <p className="text-xs text-slate-800 leading-relaxed bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-wrap">
                {selectedSub.responseText || 'No written text was provided for this task.'}
              </p>
              {selectedSub.fileName && (
                <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">
                  <span className="font-semibold text-slate-700">
                    📎 {selectedSub.fileName} ({selectedSub.fileSize || 'Attached File'})
                  </span>
                  <span className="font-bold text-emerald-600">Document Uploaded</span>
                </div>
              )}
            </div>

            {/* Score input */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
                  Rubric Score (Max {selectedSub.maxScore})
                </label>
                <div className="relative">
                  <input
                    required
                    type="number"
                    min={0}
                    max={selectedSub.maxScore}
                    value={gradeScore}
                    onChange={(e) => setGradeScore(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    / {selectedSub.maxScore}
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
                  Evaluation Outcome
                </label>
                <select
                  value={gradeStatus}
                  onChange={(e) => setGradeStatus(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                >
                  <option value="graded">Graded & Passed</option>
                  <option value="resubmission_requested">Request Resubmission (Revision Required)</option>
                </select>
              </div>
            </div>

            {/* Written Feedback */}
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
                General Feedback
              </label>
              <textarea
                rows={3}
                value={gradeFeedback}
                onChange={(e) => setGradeFeedback(e.target.value)}
                placeholder="Comments on what the student did well…"
                className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-emerald-500"
              />
            </div>

            {/* Where to Improve */}
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-emerald-800 flex items-center gap-1.5">
                <Sparkles size={13} className="text-emerald-600" /> Where to Improve & Recommendations for Student
              </label>
              <textarea
                rows={3}
                value={gradeTips}
                onChange={(e) => setGradeTips(e.target.value)}
                placeholder="Concrete advice, specific chapters to review, or code practices to adopt…"
                className="w-full rounded-xl border border-emerald-200 bg-emerald-50/30 p-3 text-xs outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-md transition"
              >
                Save Evaluation & Notify Student
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
