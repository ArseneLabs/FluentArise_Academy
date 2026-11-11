import { useState } from 'react';
import {
  FileCheck2,
  Search,
  Download,
  MessageSquare,
  Check,
  RotateCcw,
  FileCode,
  ThumbsUp,
} from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { PageHeader } from '../components/AdminLayout';
import Badge, { toneForSubmissionStatus } from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { formatDate, relativeDate } from '../lib/format';
import type { Submission } from '../types';

const statusOptions = ['all', 'needs_grading', 'auto_graded', 'graded', 'resubmission_requested'];
const kindOptions = ['all', 'quiz', 'test', 'assignment'];

export default function SubmissionsGrading() {
  const { submissions, courses, gradeSubmission } = useAdminStore();
  const [query, setQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterKind, setFilterKind] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [grading, setGrading] = useState<Submission | null>(null);

  const filtered = submissions.filter((s) => {
    if (query && !s.studentName.toLowerCase().includes(query.toLowerCase()) && !s.taskTitle.toLowerCase().includes(query.toLowerCase())) return false;
    if (filterCourse !== 'all' && s.courseId !== filterCourse) return false;
    if (filterKind !== 'all' && s.taskKind !== filterKind) return false;
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    return true;
  });

  const pendingCount = submissions.filter((s) => s.status === 'needs_grading' || s.status === 'submitted').length;

  return (
    <>
      <PageHeader
        title="Submissions & Grading"
        subtitle={`${pendingCount} submission${pendingCount !== 1 ? 's' : ''} awaiting review`}
        icon={<FileCheck2 size={20} />}
      />

      {/* Filters */}
      <div className="card mb-5 grid grid-cols-1 gap-3 p-4 lg:grid-cols-4">
        <div className="relative lg:col-span-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-10" placeholder="Search student or task…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select className="input" value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}>
          <option value="all">All courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
        <select className="input" value={filterKind} onChange={(e) => setFilterKind(e.target.value)}>
          {kindOptions.map((k) => (
            <option key={k} value={k}>{k === 'all' ? 'All task types' : k.charAt(0).toUpperCase() + k.slice(1)}</option>
          ))}
        </select>
        <select className="input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s === 'all' ? 'All statuses' : s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-ink-700">
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Task</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Submitted</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Score</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-ink-700/60">
              {filtered.map((s) => (
                <tr key={s.id} className="table-row-hover">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={s.studentAvatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{s.studentName}</p>
                        <p className="text-xs text-slate-400">{s.courseTitle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-slate-700 dark:text-slate-200">{s.taskTitle}</p>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={s.taskKind === 'quiz' ? 'coral' : s.taskKind === 'test' ? 'success' : 'amber'}>
                      {s.taskKind}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                    <p>{formatDate(s.submittedDate)}</p>
                    <p className="text-xs text-slate-400">{relativeDate(s.submittedDate)}</p>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={toneForSubmissionStatus(s.status)} dot>
                      {s.status.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    {s.score !== undefined ? (
                      <span className={`font-bold ${s.score / s.maxScore >= 0.7 ? 'text-success-600' : 'text-error-600'}`}>
                        {s.score}/{s.maxScore}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => setGrading(s)} className="btn-outline !py-1.5 !px-3 text-xs">
                      <FileCheck2 size={12} /> Review & Grade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <FileCheck2 size={32} className="mx-auto text-slate-300" />
            <p className="mt-3 text-sm text-slate-400">No submissions match your filters.</p>
          </div>
        )}
      </div>

      {grading && (
        <GradingModal
          submission={grading}
          onClose={() => setGrading(null)}
          onGrade={(score, feedback, status) => {
            gradeSubmission(grading.id, score, feedback, status);
            setGrading(null);
          }}
        />
      )}
    </>
  );
}

function GradingModal({
  submission,
  onClose,
  onGrade,
}: {
  submission: Submission;
  onClose: () => void;
  onGrade: (score: number, feedback: string, status: 'graded' | 'resubmission_requested') => void;
}) {
  const [score, setScore] = useState(submission.score ?? Math.round(submission.maxScore * 0.8));
  const [feedback, setFeedback] = useState(submission.feedback ?? '');
  const pct = Math.round((score / submission.maxScore) * 100);

  return (
    <Modal
      open
      onClose={onClose}
      title="Review & Grade Submission"
      subtitle={`${submission.studentName} · ${submission.courseTitle}`}
      size="lg"
      footer={
        <>
          <button
            className="btn-outline"
            onClick={() => onGrade(score, feedback || 'Please revise and resubmit.', 'resubmission_requested')}
          >
            <RotateCcw size={16} /> Request Revision
          </button>
          <button className="btn-primary" onClick={() => onGrade(score, feedback, 'graded')}>
            <Check size={16} /> Approve & Grade
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Task info */}
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 dark:bg-ink-700/40">
          <img src={submission.studentAvatar} alt="" className="h-12 w-12 rounded-full object-cover" />
          <div className="flex-1">
            <p className="font-semibold text-slate-800 dark:text-slate-100">{submission.taskTitle}</p>
            <p className="text-sm text-slate-400">{submission.studentName} · submitted {relativeDate(submission.submittedDate)}</p>
          </div>
          <Badge tone={submission.taskKind === 'quiz' ? 'coral' : submission.taskKind === 'test' ? 'success' : 'amber'}>
            {submission.taskKind}
          </Badge>
        </div>

        {/* Submission content */}
        <div>
          <p className="label">Student Submission</p>
          {submission.fileName ? (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-ink-700">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-coral-50 text-coral-600 dark:bg-coral-500/15">
                <FileCode size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{submission.fileName}</p>
                <p className="text-xs text-slate-400">{submission.fileSize}</p>
              </div>
              <button className="btn-ghost !py-2 text-xs">
                <Download size={14} /> Download
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-ink-700 dark:bg-ink-700/40 dark:text-slate-400">
              <ThumbsUp size={16} className="mb-2 text-success-500" />
              This {submission.taskKind} was auto-graded by the platform. Review the score and add instructor feedback below.
            </div>
          )}
        </div>

        {/* Score */}
        <div>
          <label className="label">Score</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              className="input w-28"
              value={score}
              onChange={(e) => setScore(+e.target.value)}
              min={0}
              max={submission.maxScore}
            />
            <span className="text-lg font-bold text-slate-400">/ {submission.maxScore}</span>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{pct}%</span>
              <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-ink-600">
                <div
                  className={`h-full rounded-full transition-all ${pct >= 70 ? 'bg-success-500' : 'bg-error-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <Badge tone={pct >= 70 ? 'success' : 'error'}>{pct >= 70 ? 'Pass' : 'Fail'}</Badge>
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div>
          <label className="label">
            <span className="inline-flex items-center gap-1">
              <MessageSquare size={12} /> Instructor Feedback
            </span>
          </label>
          <textarea
            className="input min-h-[100px]"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Provide personalised comments to the student…"
          />
        </div>
      </div>
    </Modal>
  );
}
