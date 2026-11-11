import { useState } from 'react';
import { ClipboardList, Plus, FileText, CheckSquare, HelpCircle, Layers } from 'lucide-react';
import { useAdminStore } from '../../admin/store/adminStore';

export default function InstructorAssessments() {
  const { courses } = useAdminStore();
  const [activeTab, setActiveTab] = useState<'quizzes' | 'assignments'>('quizzes');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950">Tasks & Quizzes</h1>
          <p className="text-sm text-slate-500">
            Create and manage knowledge checks, quizzes, and project assignments for your courses.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition ${
            activeTab === 'quizzes'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HelpCircle size={16} /> Course Quizzes
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition ${
            activeTab === 'assignments'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText size={16} /> Project Assignments
        </button>
      </div>

      {activeTab === 'quizzes' ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                Quiz · 15 Min
              </span>
              <span className="text-xs font-semibold text-slate-400">Passing: 70%</span>
            </div>
            <h3 className="mt-3 font-display text-base font-bold text-slate-900">
              OOP Inheritance & Polymorphism Quiz
            </h3>
            <p className="mt-1 text-xs text-slate-500">Course: Java & OOP Foundations</p>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-600">
              <span>Questions: 10</span>
              <span>Submissions: 34 learners</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                Quiz · 20 Min
              </span>
              <span className="text-xs font-semibold text-slate-400">Passing: 75%</span>
            </div>
            <h3 className="mt-3 font-display text-base font-bold text-slate-900">
              English Business Communication Assessment
            </h3>
            <p className="mt-1 text-xs text-slate-500">Course: Professional English Fluency</p>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-600">
              <span>Questions: 15</span>
              <span>Submissions: 48 learners</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800">
                Assignment · Due in 5 days
              </span>
              <span className="text-xs font-semibold text-slate-400">Max Score: 100</span>
            </div>
            <h3 className="mt-3 font-display text-base font-bold text-slate-900">
              Banking Ledger OOP Project
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Course: Java Enterprise Architecture
            </p>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Implement transactions, account verification, and account ledger abstraction.
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-600">
              <span>Accepted: .zip, .java, .pdf</span>
              <span className="font-bold text-emerald-700">18 Submissions</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
