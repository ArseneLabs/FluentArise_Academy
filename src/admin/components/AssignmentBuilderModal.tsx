import { useState } from 'react';
import { Save, Upload, FileText, X, Calendar } from 'lucide-react';
import Modal from './ui/Modal';
import { uid } from '../store/adminStore';
import { relativeDate } from '../lib/format';
import type { Assignment } from '../types';

const formatOptions = ['.pdf', '.zip', '.java', '.docx', '.py', '.js', '.txt'];

function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/^(?!<[hul])(.+)$/gm, '<p>$1</p>')
    .replace(/<p><p>/g, '<p>')
    .replace(/<\/p><\/p>/g, '</p>');
}

export default function AssignmentBuilderModal({
  open,
  onClose,
  assignment,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  assignment?: Assignment;
  onSave: (a: Assignment) => void;
}) {
  const [title, setTitle] = useState(assignment?.title ?? '');
  const [estimatedHours, setEstimatedHours] = useState(assignment?.estimatedHours ?? 4);
  const [instructions, setInstructions] = useState(assignment?.instructions ?? '# Task Instructions\n\n## Learning Objectives\n- \n\n## Requirements\n1. \n\n## Rubric\n- ');
  const [allowedFormats, setAllowedFormats] = useState<string[]>(assignment?.allowedFormats ?? ['.pdf', '.zip']);
  const [maxFileMb, setMaxFileMb] = useState(assignment?.maxFileMb ?? 25);
  const dueDefault = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const [dueDate, setDueDate] = useState(assignment ? assignment.dueDate.slice(0, 10) : dueDefault);
  const [refFiles, setRefFiles] = useState(assignment?.referenceFiles ?? []);
  const [preview, setPreview] = useState(false);

  const toggleFormat = (f: string) =>
    setAllowedFormats((arr) => (arr.includes(f) ? arr.filter((x) => x !== f) : [...arr, f]));

  const addRefFile = () => {
    const name = prompt('Reference file name (e.g. StarterTemplate.zip)');
    if (!name) return;
    setRefFiles((f) => [...f, { name, size: '1.0 MB' }]);
  };

  const save = () => {
    onSave({
      id: assignment?.id ?? uid('a'),
      kind: 'assignment',
      title: title || 'Untitled Assignment',
      estimatedHours,
      instructions,
      allowedFormats,
      maxFileMb,
      dueDate: new Date(dueDate).toISOString(),
      referenceFiles: refFiles,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={assignment ? 'Edit Assignment' : 'Create Assignment / Exercise'}
      subtitle="Practical project task with file submission dropzone"
      size="xl"
      footer={
        <>
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={!title}>
            <Save size={16} /> Save Assignment
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Assignment Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Java Console Banking Application" />
          </div>
          <div>
            <label className="label">Estimated Hours</label>
            <input type="number" className="input" value={estimatedHours} onChange={(e) => setEstimatedHours(+e.target.value)} min={1} />
          </div>
        </div>

        {/* Instructions markdown */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="label !mb-0">Task Instructions (Markdown)</label>
            <button
              onClick={() => setPreview((p) => !p)}
              className="text-xs font-semibold text-coral-600 hover:text-coral-700"
            >
              {preview ? 'Edit' : 'Preview'}
            </button>
          </div>
          {preview ? (
            <div
              className="markdown-preview min-h-[160px] rounded-xl border border-slate-200 bg-white p-4 dark:border-ink-700 dark:bg-ink-900"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(instructions) }}
            />
          ) : (
            <textarea
              className="input min-h-[160px] font-mono text-xs"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          )}
        </div>

        {/* Reference files */}
        <div>
          <label className="label">Instructor Reference Files / Starter Templates</label>
          <div className="space-y-2">
            {refFiles.map((f, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-ink-700">
                <FileText size={16} className="text-coral-500" />
                <span className="flex-1 text-sm text-slate-700 dark:text-slate-200">{f.name}</span>
                <span className="text-xs text-slate-400">{f.size}</span>
                <button onClick={() => setRefFiles((arr) => arr.filter((_, j) => j !== i))} className="rounded p-1 text-slate-400 hover:text-error-600">
                  <X size={14} />
                </button>
              </div>
            ))}
            <button onClick={addRefFile} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-2.5 text-sm font-semibold text-slate-500 hover:border-coral-500 hover:text-coral-600 dark:border-ink-600">
              <Upload size={14} /> Upload reference file
            </button>
          </div>
        </div>

        {/* Submission config */}
        <div className="rounded-xl border border-slate-200 p-4 dark:border-ink-700">
          <p className="mb-3 text-sm font-bold text-slate-800 dark:text-slate-100">Submission Configuration</p>
          <div className="mb-3">
            <label className="label">Allowed File Formats</label>
            <div className="flex flex-wrap gap-2">
              {formatOptions.map((f) => (
                <button
                  key={f}
                  onClick={() => toggleFormat(f)}
                  className={`rounded-lg border px-2.5 py-1 font-mono text-xs font-semibold transition ${
                    allowedFormats.includes(f)
                      ? 'border-coral-500 bg-coral-50 text-coral-700 dark:bg-coral-500/15 dark:text-coral-300'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-ink-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Max File Size (MB)</label>
              <input type="number" className="input" value={maxFileMb} onChange={(e) => setMaxFileMb(+e.target.value)} min={1} />
            </div>
            <div>
              <label className="label">Submission Due Date</label>
              <input type="date" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                <Calendar size={11} /> {relativeDate(new Date(dueDate).toISOString())}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
