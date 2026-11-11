import { useState, useRef, type ChangeEvent } from 'react';
import { Save, Upload, FileText, X, Calendar, Loader2, Download, AlertCircle } from 'lucide-react';
import Modal from './ui/Modal';
import { uid } from '../store/adminStore';
import { relativeDate } from '../lib/format';
import { uploadMediaFile } from '../../lib/storage';
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
  const [instructions, setInstructions] = useState(
    assignment?.instructions ??
      '# Task Instructions\n\n## Learning Objectives\n- Master fundamental architecture\n\n## Requirements\n1. Implement classes with encapsulation\n2. Submit source code in ZIP format\n\n## Rubric\n- Code correctness: 50%\n- Clean architecture: 30%\n- Documentation: 20%'
  );
  const [allowedFormats, setAllowedFormats] = useState<string[]>(
    assignment?.allowedFormats ?? ['.pdf', '.zip']
  );
  const [maxFileMb, setMaxFileMb] = useState(assignment?.maxFileMb ?? 20);
  const dueDefault = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const [dueDate, setDueDate] = useState(assignment ? assignment.dueDate.slice(0, 10) : dueDefault);
  const [refFiles, setRefFiles] = useState<{ name: string; size: string; url?: string }[]>(
    assignment?.referenceFiles ?? []
  );
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleFormat = (f: string) =>
    setAllowedFormats((arr) => (arr.includes(f) ? arr.filter((x) => x !== f) : [...arr, f]));

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadError(null);
      setUploading(true);
      try {
        const res = await uploadMediaFile(file, 'documents', 'document');
        if (res.error) {
          setUploadError(res.error);
        } else if (res.url) {
          setRefFiles((prev) => [
            ...prev,
            { name: file.name, size: res.sizeFormatted, url: res.url },
          ]);
        }
      } catch (err: any) {
        setUploadError(err?.message || 'Failed to upload document');
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
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
      subtitle="Practical project task with guidelines, starter files, and submission limits"
      size="xl"
      footer={
        <>
          <button className="btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={save} disabled={!title}>
            <Save size={16} /> Save Assignment
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Assignment Title *</label>
            <input
              className="input font-semibold"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Java Console Banking Application"
            />
          </div>
          <div>
            <label className="label">Estimated Completion Hours</label>
            <input
              type="number"
              className="input"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(+e.target.value)}
              min={1}
            />
          </div>
        </div>

        {/* Instructions markdown */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="label !mb-0">Task Instructions & Rubric (Markdown)</label>
            <button
              type="button"
              onClick={() => setPreview((p) => !p)}
              className="text-xs font-semibold text-brand-600 hover:text-brand-800 transition"
            >
              {preview ? 'Switch to Editor' : 'Preview Formatted Text'}
            </button>
          </div>
          {preview ? (
            <div
              className="min-h-[160px] rounded-xl border border-slate-200 bg-white p-4 text-sm prose dark:border-ink-700 dark:bg-ink-900"
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

        {/* Reference / Starter Materials */}
        <div>
          <label className="label">Reference & Starter Files (For Students to Download)</label>

          {uploadError && (
            <div className="mb-2 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">
              <AlertCircle size={15} />
              <span>{uploadError}</span>
            </div>
          )}

          <div className="space-y-2">
            {refFiles.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm dark:border-ink-700 dark:bg-ink-800"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText size={16} className="text-amber-600 shrink-0" />
                  <span className="truncate font-semibold text-slate-800 dark:text-white">
                    {f.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{f.size}</span>
                  <button
                    type="button"
                    onClick={() => setRefFiles((arr) => arr.filter((_, j) => j !== i))}
                    className="rounded p-1 text-slate-400 hover:text-rose-600 transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.zip,.docx,.doc,.txt,.java,.py"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-3 text-xs font-bold text-slate-600 hover:border-brand-500 hover:text-brand-700 hover:bg-brand-50/50 transition dark:border-ink-600"
            >
              {uploading ? (
                <>
                  <Loader2 size={15} className="animate-spin text-brand-600" /> Uploading starter
                  file…
                </>
              ) : (
                <>
                  <Upload size={15} /> Select Starter File from Computer (Max 20 MB)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Student Submission Configuration */}
        <div className="rounded-xl border border-slate-200 p-4 dark:border-ink-700">
          <p className="mb-3 text-sm font-bold text-slate-800 dark:text-slate-100">
            Student Submission Rules & Limits
          </p>

          <div className="mb-3">
            <label className="label">Allowed File Extensions for Student Uploads</label>
            <div className="flex flex-wrap gap-2">
              {formatOptions.map((f) => (
                <button
                  type="button"
                  key={f}
                  onClick={() => toggleFormat(f)}
                  className={`rounded-lg border px-2.5 py-1 font-mono text-xs font-semibold transition ${
                    allowedFormats.includes(f)
                      ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-ink-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Max Allowed Student File Size (MB)</label>
              <input
                type="number"
                className="input"
                value={maxFileMb}
                onChange={(e) => setMaxFileMb(+e.target.value)}
                min={1}
                max={50}
              />
            </div>
            <div>
              <label className="label">Assignment Due Date</label>
              <input
                type="date"
                className="input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
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
