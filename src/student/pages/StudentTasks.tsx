import { useState } from 'react';
import { HelpCircle, FileText, ClipboardList } from 'lucide-react';

export default function StudentTasks() {
  const [tab, setTab] = useState<'quizzes' | 'assignments'>('quizzes');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950">Tasks & Quizzes</h1>
          <p className="text-sm text-slate-500">
            Knowledge checks, quizzes, and project assignments for your enrolled courses.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setTab('quizzes')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition ${
            tab === 'quizzes'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HelpCircle size={16} /> Course Quizzes
        </button>
        <button
          onClick={() => setTab('assignments')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition ${
            tab === 'assignments'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText size={16} /> Course Assignments
        </button>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
        <ClipboardList size={40} className="mx-auto text-slate-300 mb-3" />
        <h3 className="font-display text-base font-bold text-slate-800">
          No {tab === 'quizzes' ? 'quizzes' : 'assignments'} currently active
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          When you enroll in courses with assessments, your knowledge checks and assignment prompts will appear here.
        </p>
      </div>
    </div>
  );
}
