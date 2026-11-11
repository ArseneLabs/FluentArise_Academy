import { useState, useMemo } from 'react';
import {
  FileCheck2,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  MessageSquare,
  Award,
} from 'lucide-react';
import { useAdminStore } from '../../admin/store/adminStore';
import { useAuth } from '../../auth/AuthProvider';
import Modal from '../../admin/components/ui/Modal';
import { relativeDate } from '../../admin/lib/format';
import type { Submission } from '../../admin/types';

export default function InstructorSubmissions() {
  const { user } = useAuth();
  const { submissions, courses, gradeSubmission } = useAdminStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'needs_grading' | 'graded'>('all');
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  // Grade Form State
  const [gradeScore, setGradeScore] = useState<number>(85);
  const [gradeFeedback, setGradeFeedback] = useState<string>('');
  const [gradeStatus, setGradeStatus] = useState<'graded' | 'resubmission_requested'>('graded');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filtered submissions for this instructor
  const instructorSubmissions = useMemo(() => {
    return submissions.filter((s) => {
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
  }, [submissions, search, statusFilter]);

  const openGradingModal = (sub: Submission) => {
    setSelectedSub(sub);
    setGradeScore(sub.score ?? Math.round(sub.maxScore * 0.85));
    setGradeFeedback(sub.feedback || 'Good attempt on the exercises. Well structured.');
    setGradeStatus(sub.status === 'resubmission_requested' ? 'resubmission_requested' : 'graded');
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    gradeSubmission(selectedSub.id, Number(gradeScore), gradeFeedback, gradeStatus);
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
            Review student responses, assign rubric grades, and provide constructive feedback.
          </p>
        </div>
      </div>

      {toastMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900 shadow-sm animate-fade-in">
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
                        <p className="font-bold text-slate-900">{sub.studentName}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{sub.taskTitle}</p>
                      <p className="text-xs text-slate-500">{sub.courseTitle}</p>
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
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isPending ? 'Needs Grading' : 'Graded'}
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
                        {isPending ? 'Grade Now' : 'Edit Grade'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {instructorSubmissions.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400">
              No submissions found for the selected criteria.
            </div>
          )}
        </div>
      </div>

      {/* Grading Modal */}
      {selectedSub && (
        <Modal
          open={Boolean(selectedSub)}
          onClose={() => setSelectedSub(null)}
          title={`Grade Submission: ${selectedSub.taskTitle}`}
          subtitle={`Student: ${selectedSub.studentName} · ${selectedSub.courseTitle}`}
        >
          <form onSubmit={handleSaveGrade} className="space-y-4">
            {/* Student work preview */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-slate-500 mb-1.5">
                Student Response / Submission Text
              </p>
              <p className="text-sm text-slate-800 leading-relaxed italic bg-white p-3 rounded-lg border border-slate-200">
                {selectedSub.responseText ||
                  '“Implemented class hierarchy with encapsulation. Handled polymorphism with overridden dispatch methods.”'}
              </p>
              {selectedSub.fileName && (
                <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">
                  <span className="font-semibold text-slate-700">
                    📎 {selectedSub.fileName} ({selectedSub.fileSize || '1.2 MB'})
                  </span>
                  <span className="font-bold text-emerald-600 cursor-pointer hover:underline">
                    Download File
                  </span>
                </div>
              )}
            </div>

            {/* Score input */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
                  Score (Max {selectedSub.maxScore})
                </label>
                <div className="relative">
                  <input
                    required
                    type="number"
                    min={0}
                    max={selectedSub.maxScore}
                    value={gradeScore}
                    onChange={(e) => setGradeScore(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    / {selectedSub.maxScore}
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
                  Outcome Status
                </label>
                <select
                  value={gradeStatus}
                  onChange={(e) => setGradeStatus(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="graded">Graded & Passed</option>
                  <option value="resubmission_requested">Request Resubmission</option>
                </select>
              </div>
            </div>

            {/* Written Feedback */}
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
                Instructor Written Feedback
              </label>
              <textarea
                rows={3}
                value={gradeFeedback}
                onChange={(e) => setGradeFeedback(e.target.value)}
                placeholder="Give constructive feedback on what the student did well and what can be improved…"
                className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
              >
                Save Grade & Submit
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
