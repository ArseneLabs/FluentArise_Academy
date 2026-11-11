import { useState } from 'react';
import {
  Save,
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Check,
  HelpCircle,
  Timer,
  ListChecks,
  ToggleLeft,
  PenLine,
} from 'lucide-react';
import Modal from './ui/Modal';
import { uid } from '../store/adminStore';
import type { Quiz, Question, QuestionType } from '../types';

const qTypeMeta: Record<QuestionType, { label: string; icon: React.ReactNode }> = {
  single: { label: 'Single Choice', icon: <ListChecks size={14} /> },
  multi: { label: 'Multi Select', icon: <Check size={14} /> },
  truefalse: { label: 'True / False', icon: <ToggleLeft size={14} /> },
  short: { label: 'Short Answer', icon: <PenLine size={14} /> },
};

const blankQuestion = (type: QuestionType): Question => ({
  id: uid('qq'),
  type,
  prompt: '',
  options: type === 'truefalse' ? ['True', 'False'] : ['', ''],
  correctIndexes: [],
  explanation: '',
  points: 1,
});

export default function QuizBuilderModal({
  open,
  onClose,
  quiz,
  kind,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  quiz?: Quiz;
  kind: 'quiz' | 'test';
  onSave: (q: Quiz) => void;
}) {
  const [tab, setTab] = useState<'meta' | 'questions'>('meta');
  const [title, setTitle] = useState(quiz?.title ?? '');
  const [description, setDescription] = useState(quiz?.description ?? '');
  const [passingScorePct, setPassingScorePct] = useState(quiz?.passingScorePct ?? 70);
  const [durationMin, setDurationMin] = useState<number | null>(quiz?.durationMin ?? 15);
  const [maxAttempts, setMaxAttempts] = useState(quiz?.maxAttempts ?? 3);
  const [questions, setQuestions] = useState<Question[]>(quiz?.questions ?? []);

  const totalPoints = questions.reduce((s, q) => s + q.points, 0);

  const addQuestion = (type: QuestionType) => setQuestions((q) => [...q, blankQuestion(type)]);
  const updateQuestion = (id: string, patch: Partial<Question>) =>
    setQuestions((q) => q.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const removeQuestion = (id: string) => setQuestions((q) => q.filter((x) => x.id !== id));
  const move = (i: number, dir: -1 | 1) =>
    setQuestions((q) => {
      const arr = [...q];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return q;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr;
    });

  const setOption = (qid: string, idx: number, val: string) =>
    setQuestions((q) =>
      q.map((x) =>
        x.id === qid ? { ...x, options: x.options.map((o, i) => (i === idx ? val : o)) } : x,
      ),
    );
  const addOption = (qid: string) =>
    setQuestions((q) => q.map((x) => (x.id === qid ? { ...x, options: [...x.options, ''] } : x)));
  const removeOption = (qid: string, idx: number) =>
    setQuestions((q) =>
      q.map((x) =>
        x.id === qid
          ? {
              ...x,
              options: x.options.filter((_, i) => i !== idx),
              correctIndexes: x.correctIndexes.filter((c) => c !== idx).map((c) => (c > idx ? c - 1 : c)),
            }
          : x,
      ),
    );

  const toggleCorrect = (qid: string, idx: number, multi: boolean) =>
    setQuestions((q) =>
      q.map((x) => {
        if (x.id !== qid) return x;
        if (multi) {
          return {
            ...x,
            correctIndexes: x.correctIndexes.includes(idx)
              ? x.correctIndexes.filter((c) => c !== idx)
              : [...x.correctIndexes, idx],
          };
        }
        return { ...x, correctIndexes: [idx] };
      }),
    );

  const save = () => {
    onSave({
      id: quiz?.id ?? uid(kind === 'quiz' ? 'q' : 't'),
      kind,
      title: title || (kind === 'quiz' ? 'Untitled Quiz' : 'Untitled Test'),
      description,
      passingScorePct,
      durationMin,
      maxAttempts,
      questions,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={quiz ? `Edit ${kind === 'quiz' ? 'Quiz' : 'Test'}` : `Create ${kind === 'quiz' ? 'Quiz' : 'Formal Test'}`}
      subtitle={kind === 'test' ? 'Timed assessment required for certificate qualification' : 'Short knowledge check with instant auto-grading'}
      size="xl"
      footer={
        <>
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={!title || questions.length === 0}>
            <Save size={16} /> Save {kind === 'quiz' ? 'Quiz' : 'Test'}
          </button>
        </>
      }
    >
      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-ink-700/60">
        {[
          { id: 'meta' as const, label: 'Metadata', icon: kind === 'test' ? <Timer size={14} /> : <HelpCircle size={14} /> },
          { id: 'questions' as const, label: `Questions (${questions.length})`, icon: <ListChecks size={14} /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
              tab === t.id ? 'bg-white text-coral-600 shadow-sm dark:bg-ink-800 dark:text-coral-400' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'meta' && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <label className="label">{kind === 'quiz' ? 'Quiz' : 'Test'} Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={kind === 'quiz' ? 'e.g. OOP Inheritance Quiz' : 'e.g. Final English Proficiency Test'} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-[60px]" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description shown to students" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Passing Score (%)</label>
              <input type="number" className="input" value={passingScorePct} onChange={(e) => setPassingScorePct(+e.target.value)} min={0} max={100} />
            </div>
            <div>
              <label className="label">Duration (min)</label>
              <input
                type="number"
                className="input"
                value={durationMin ?? ''}
                onChange={(e) => setDurationMin(e.target.value ? +e.target.value : null)}
                placeholder="No limit"
              />
            </div>
            <div>
              <label className="label">Max Attempts</label>
              <input type="number" className="input" value={maxAttempts} onChange={(e) => setMaxAttempts(+e.target.value)} min={1} />
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500 dark:bg-ink-700/40 dark:text-slate-400">
            {durationMin ? `Timed ${durationMin} min · ` : 'No time limit · '}
            Pass at {passingScorePct}% · {maxAttempts} attempt{maxAttempts > 1 ? 's' : ''} allowed
          </div>
        </div>
      )}

      {tab === 'questions' && (
        <div className="animate-fade-in">
          {/* Add question row */}
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="self-center text-xs font-semibold text-slate-400">Add:</span>
            {(Object.keys(qTypeMeta) as QuestionType[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  addQuestion(t);
                  setTab('questions');
                }}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-coral-500 hover:text-coral-600 dark:border-ink-700 dark:text-slate-300"
              >
                <Plus size={12} /> {qTypeMeta[t].label}
              </button>
            ))}
          </div>

          {/* Questions list */}
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div key={q.id} className="rounded-xl border border-slate-200 p-4 dark:border-ink-700">
                <div className="mb-3 flex items-center gap-2">
                  <GripVertical size={16} className="text-slate-300 dark:text-ink-600" />
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-ink-800 text-xs font-bold text-coral-400">{i + 1}</span>
                  <Badge className="!bg-info-50 !text-info-600 dark:!bg-info-500/15 dark:!text-info-400">
                    {qTypeMeta[q.type].icon} {qTypeMeta[q.type].label}
                  </Badge>
                  <div className="ml-auto flex items-center gap-1">
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-ink-700">
                      <ChevronUp size={14} />
                    </button>
                    <button onClick={() => move(i, 1)} disabled={i === questions.length - 1} className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-ink-700">
                      <ChevronDown size={14} />
                    </button>
                    <button onClick={() => removeQuestion(q.id)} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-error-600 dark:hover:bg-ink-700">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <input
                  className="input mb-3"
                  value={q.prompt}
                  onChange={(e) => updateQuestion(q.id, { prompt: e.target.value })}
                  placeholder="Enter question prompt…"
                />

                {/* Options */}
                {q.type !== 'short' && (
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const isCorrect = q.correctIndexes.includes(oi);
                      const multi = q.type === 'multi';
                      return (
                        <div key={oi} className="flex items-center gap-2">
                          <button
                            onClick={() => toggleCorrect(q.id, oi, multi)}
                            className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 transition ${
                              isCorrect
                                ? 'border-success-500 bg-success-500 text-white'
                                : 'border-slate-200 text-transparent hover:border-success-400 dark:border-ink-600'
                            }`}
                            title="Mark as correct"
                          >
                            <Check size={14} />
                          </button>
                          <input
                            className="input flex-1"
                            value={opt}
                            onChange={(e) => setOption(q.id, oi, e.target.value)}
                            placeholder={`Option ${oi + 1}`}
                          />
                          {q.options.length > 2 && (
                            <button onClick={() => removeOption(q.id, oi)} className="rounded p-1.5 text-slate-400 hover:text-error-600">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {q.type !== 'truefalse' && (
                      <button onClick={() => addOption(q.id)} className="flex items-center gap-1.5 text-xs font-semibold text-coral-600 hover:text-coral-700">
                        <Plus size={12} /> Add option
                      </button>
                    )}
                  </div>
                )}
                {q.type === 'short' && (
                  <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:bg-ink-700/40 dark:text-slate-400">
                    Short answer questions are graded manually by the instructor.
                  </p>
                )}

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Explanation / Hint</label>
                    <input className="input" value={q.explanation ?? ''} onChange={(e) => updateQuestion(q.id, { explanation: e.target.value })} placeholder="Shown after answering" />
                  </div>
                  <div>
                    <label className="label">Points</label>
                    <input type="number" className="input" value={q.points} onChange={(e) => updateQuestion(q.id, { points: +e.target.value })} min={1} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {questions.length === 0 && (
            <div className="rounded-xl border-2 border-dashed border-slate-200 py-10 text-center dark:border-ink-600">
              <HelpCircle size={28} className="mx-auto text-slate-300" />
              <p className="mt-2 text-sm text-slate-400">No questions yet. Pick a question type above to add one.</p>
            </div>
          )}

          {questions.length > 0 && (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm dark:bg-ink-700/40">
              <span className="text-slate-500 dark:text-slate-400">{questions.length} questions</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">Total: {totalPoints} points</span>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={`chip ${className}`}>{children}</span>;
}
