import { useState } from 'react';
import {
  HelpCircle,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  Play,
  Award,
} from 'lucide-react';
import Modal from '../../admin/components/ui/Modal';

interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const oopQuizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: 'Which Java keyword is used to inherit from a superclass?',
    options: ['implements', 'extends', 'inherits', 'super'],
    correctIndex: 1,
    explanation: '`extends` is used for class inheritance, while `implements` is used for interfaces.',
  },
  {
    id: 'q2',
    prompt: 'What is polymorphism in Object-Oriented Programming?',
    options: [
      'The ability to define multiple constructors',
      'The ability of an object or method call to take multiple dynamic forms',
      'A method to hide private variables inside a class',
      'A mechanism to compile code into bytecode',
    ],
    correctIndex: 1,
    explanation: 'Polymorphism allows objects of different classes to respond to the same method call dynamically at runtime.',
  },
  {
    id: 'q3',
    prompt: 'Can an abstract class have constructors in Java?',
    options: [
      'No, because abstract classes cannot be instantiated',
      'Yes, and they are called when subclasses are instantiated',
      'Only if all methods inside the class are static',
      'Only if the class implements Serializable',
    ],
    correctIndex: 1,
    explanation: 'Abstract classes have constructors that are invoked via super() when a subclass is instantiated.',
  },
];

export default function StudentTasks() {
  const [tab, setTab] = useState<'quizzes' | 'assignments'>('quizzes');
  const [activeQuizModal, setActiveQuizModal] = useState<boolean>(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Assignment state
  const [assignmentModal, setAssignmentModal] = useState<boolean>(false);
  const [assignmentText, setAssignmentText] = useState<string>('');
  const [assignmentSubmitted, setAssignmentSubmitted] = useState<boolean>(false);

  const handleSelectAnswer = (qId: string, optIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIndex }));
  };

  const submitQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    let correctCount = 0;
    for (const q of oopQuizQuestions) {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    }
    const scorePct = Math.round((correctCount / oopQuizQuestions.length) * 100);
    setQuizScore(scorePct);
    setQuizSubmitted(true);
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
    setActiveQuizModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950">Tasks & Quizzes</h1>
          <p className="text-sm text-slate-500">
            Take knowledge checks, submit project assignments, and view instructor grading.
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

      {tab === 'quizzes' ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {/* OOP Quiz */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-purple-100 px-3 py-0.5 text-xs font-bold text-purple-800">
                15 Minutes · Passing: 70%
              </span>
              <span className="text-xs font-semibold text-slate-400">3 Questions</span>
            </div>
            <h3 className="mt-3 font-display text-base font-bold text-slate-900">
              OOP Inheritance & Polymorphism Quiz
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Course: Java & Object-Oriented Programming Mastery
            </p>
            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              Test your understanding of abstract classes, polymorphism dispatch, dynamic binding, and inheritance.
            </p>

            <div className="mt-5 border-t border-slate-100 pt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500">Attempts allowed: Unlimited</span>
              <button
                onClick={() => {
                  setSelectedAnswers({});
                  setQuizSubmitted(false);
                  setActiveQuizModal(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 transition shadow-sm"
              >
                <Play size={13} fill="currentColor" /> Take Quiz
              </button>
            </div>
          </div>

          {/* English Quiz */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800">
                Score: 92% (Passed)
              </span>
              <span className="text-xs font-semibold text-emerald-600">Completed</span>
            </div>
            <h3 className="mt-3 font-display text-base font-bold text-slate-900">
              Business English & Meeting Vocabulary
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Course: Professional English Fluency & Public Speaking
            </p>
            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              Assesses vocabulary for executive presentations, boardroom negotations, and email tone.
            </p>

            <div className="mt-5 border-t border-slate-100 pt-4 flex items-center justify-between">
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 size={14} /> Passed with Distinction
              </span>
              <button
                onClick={() => {
                  setSelectedAnswers({ q1: 1, q2: 1, q3: 1 });
                  setQuizSubmitted(true);
                  setQuizScore(100);
                  setActiveQuizModal(true);
                }}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Review Answers
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Assignment 1 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-purple-100 px-3 py-0.5 text-xs font-bold text-purple-800">
                Max Score: 100
              </span>
              <span className="text-xs font-semibold text-amber-600">Due in 3 days</span>
            </div>
            <h3 className="mt-3 font-display text-base font-bold text-slate-900">
              Banking Ledger OOP Project
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Course: Java & Object-Oriented Programming Mastery
            </p>
            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              Design a console or GUI banking application utilizing BankAccount subclasses, transaction validation, and exception handling.
            </p>

            <div className="mt-5 border-t border-slate-100 pt-4 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                {assignmentSubmitted ? 'Status: Submitted' : 'Status: Not Submitted'}
              </span>
              <button
                onClick={() => setAssignmentModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 transition shadow-sm"
              >
                {assignmentSubmitted ? 'View Submission' : 'Submit Assignment'}
              </button>
            </div>
          </div>

          {/* Assignment 2 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800">
                Score: 88 / 100
              </span>
              <span className="text-xs font-semibold text-emerald-600">Graded</span>
            </div>
            <h3 className="mt-3 font-display text-base font-bold text-slate-900">
              Self-Introduction & Professional Elevator Pitch
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Course: Professional English Fluency & Public Speaking
            </p>
            <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs border border-slate-100">
              <p className="font-bold text-slate-800">Instructor Feedback (Amina Uwase):</p>
              <p className="mt-1 text-slate-600 italic">
                “Clear delivery and confident tone throughout. Pay close attention to vowel length on technical terms. Well done!”
              </p>
            </div>
          </div>
        </div>
      )}

      {/* QUIZ RUNNER MODAL */}
      <Modal
        open={activeQuizModal}
        onClose={resetQuiz}
        title="OOP Inheritance & Polymorphism Quiz"
        subtitle="Select the best answer for each question. Click Submit when done."
      >
        <form onSubmit={submitQuiz} className="space-y-6">
          {quizSubmitted && (
            <div
              className={`rounded-2xl p-5 border text-center ${
                quizScore >= 70
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-amber-200 bg-amber-50 text-amber-900'
              }`}
            >
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white shadow-sm mb-2">
                <Award
                  size={24}
                  className={quizScore >= 70 ? 'text-emerald-600' : 'text-amber-600'}
                />
              </div>
              <h3 className="text-lg font-bold">
                {quizScore >= 70 ? '🎉 Congratulations, You Passed!' : 'Needs Review'}
              </h3>
              <p className="text-sm font-semibold mt-1">
                Your Score: {quizScore}% (Threshold: 70%)
              </p>
            </div>
          )}

          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1">
            {oopQuizQuestions.map((q, idx) => {
              const selected = selectedAnswers[q.id];
              const isCorrect = selected === q.correctIndex;
              return (
                <div key={q.id} className="rounded-2xl border border-slate-200 p-4 space-y-3">
                  <p className="text-sm font-bold text-slate-900">
                    {idx + 1}. {q.prompt}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isOptionSelected = selected === optIdx;
                      let optionClasses = 'border-slate-200 hover:bg-slate-50';

                      if (quizSubmitted) {
                        if (optIdx === q.correctIndex) {
                          optionClasses = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
                        } else if (isOptionSelected && !isCorrect) {
                          optionClasses = 'border-red-400 bg-red-50 text-red-900';
                        }
                      } else if (isOptionSelected) {
                        optionClasses = 'border-purple-600 bg-purple-50 text-purple-900 font-semibold ring-1 ring-purple-500';
                      }

                      return (
                        <label
                          key={optIdx}
                          onClick={() => handleSelectAnswer(q.id, optIdx)}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-xs transition ${optionClasses}`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            disabled={quizSubmitted}
                            checked={isOptionSelected}
                            onChange={() => handleSelectAnswer(q.id, optIdx)}
                            className="text-purple-600"
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="mt-2 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600 border border-slate-100">
                      <span className="font-bold text-slate-800">Explanation: </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={resetQuiz}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              {quizSubmitted ? 'Close' : 'Cancel'}
            </button>
            {!quizSubmitted && (
              <button
                type="submit"
                disabled={Object.keys(selectedAnswers).length < oopQuizQuestions.length}
                className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-bold text-white hover:bg-purple-700 transition disabled:opacity-50"
              >
                Submit Answers
              </button>
            )}
          </div>
        </form>
      </Modal>

      {/* ASSIGNMENT MODAL */}
      <Modal
        open={assignmentModal}
        onClose={() => setAssignmentModal(false)}
        title="Submit Assignment: Banking Ledger OOP Project"
        subtitle="Provide your project response, link to GitHub repository, or summary."
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
              Project Description / GitHub Repository Link
            </label>
            <textarea
              rows={4}
              value={assignmentText}
              onChange={(e) => setAssignmentText(e.target.value)}
              placeholder="e.g. GitHub: https://github.com/student/java-banking-ledger — Implemented account abstraction, transaction ledger, and unit tests."
              className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center hover:bg-slate-50 transition cursor-pointer">
            <FileText size={24} className="mx-auto text-purple-600 mb-2" />
            <p className="text-xs font-bold text-slate-700">Attach Source Code Archive (.zip)</p>
            <p className="text-[11px] text-slate-400 mt-1">Maximum file size: 25 MB</p>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setAssignmentModal(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setAssignmentSubmitted(true);
                setAssignmentModal(false);
              }}
              className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-bold text-white hover:bg-purple-700 transition"
            >
              Confirm & Submit to Instructor
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
