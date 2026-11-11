import { useState, useMemo } from 'react';
import { ClipboardList, Plus, FileText, HelpCircle } from 'lucide-react';
import { useAdminStore } from '../../admin/store/adminStore';
import { useAuth } from '../../auth/AuthProvider';

export default function InstructorAssessments() {
  const { courses } = useAdminStore();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'quizzes' | 'assignments'>('quizzes');

  const myCourses = useMemo(() => {
    return courses.filter((c) => c.instructorId === user?.id || c.instructorId === user?.instructorId);
  }, [courses, user]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950">Tasks & Quizzes</h1>
          <p className="text-sm text-slate-500">
            Assessments created for your assigned courses.
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

      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
        <ClipboardList size={40} className="mx-auto text-slate-300 mb-3" />
        <h3 className="font-display text-base font-bold text-slate-800">
          No {activeTab === 'quizzes' ? 'quizzes' : 'assignments'} created yet
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Assessments added to your course curriculum modules will appear here.
        </p>
      </div>
    </div>
  );
}
