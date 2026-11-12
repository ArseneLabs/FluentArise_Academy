import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import {
  FileText,
  Upload,
  Link as LinkIcon,
  Trash2,
  ExternalLink,
  Plus,
  Loader2,
  FileCode,
  FileSpreadsheet,
  FileArchive,
  FileCheck,
  AlertCircle,
  File,
} from 'lucide-react';
import { uploadMediaFile, validateMediaFile, formatBytes } from '../../lib/storage';
import type { LectureMaterial } from '../../admin/types';

interface LectureMaterialsManagerProps {
  materials: LectureMaterial[];
  onChange: (materials: LectureMaterial[]) => void;
  label?: string;
  helperText?: string;
}

export default function LectureMaterialsManager({
  materials = [],
  onChange,
  label = 'Lecture Materials & Documents',
  helperText = 'Upload downloadable lecture slides, PDF notes, or Word documents for students',
}: LectureMaterialsManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlTitle, setUrlTitle] = useState('');
  const [urlLink, setUrlLink] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const detectMaterialType = (fileName: string): LectureMaterial['type'] => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (ext === 'doc' || ext === 'docx') return 'doc';
    if (ext === 'xls' || ext === 'xlsx' || ext === 'csv') return 'sheet';
    if (ext === 'ppt' || ext === 'pptx') return 'slide';
    if (ext === 'zip' || ext === 'rar' || ext === 'tar' || ext === 'gz') return 'archive';
    if (ext === 'txt' || ext === 'md') return 'text';
    return 'other';
  };

  const handleFiles = async (files: FileList | File[]) => {
    setError(null);
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    setIsUploading(true);
    const newItems: LectureMaterial[] = [];

    for (const file of fileList) {
      const validation = validateMediaFile(file, 'document');
      if (!validation.valid) {
        setError(validation.error || `Invalid file "${file.name}"`);
        setIsUploading(false);
        return;
      }

      try {
        const res = await uploadMediaFile(file, 'documents', 'document');
        if (res.error) {
          setError(res.error);
        } else if (res.url) {
          newItems.push({
            id: `mat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: file.name,
            size: res.sizeFormatted || formatBytes(file.size),
            url: res.url,
            type: detectMaterialType(file.name),
            uploadedAt: new Date().toISOString(),
          });
        }
      } catch (err: any) {
        setError(err?.message || `Failed to upload ${file.name}`);
      }
    }

    setIsUploading(false);
    if (newItems.length > 0) {
      onChange([...materials, ...newItems]);
    }
  };

  const handleAddExternalLink = () => {
    if (!urlLink.trim() || !urlTitle.trim()) return;
    const newMaterial: LectureMaterial = {
      id: `mat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: urlTitle.trim(),
      size: 'External Link',
      url: urlLink.trim(),
      type: detectMaterialType(urlTitle),
      uploadedAt: new Date().toISOString(),
    };
    onChange([...materials, newMaterial]);
    setUrlTitle('');
    setUrlLink('');
    setShowUrlModal(false);
  };

  const handleRemove = (id: string) => {
    onChange(materials.filter((m) => m.id !== id));
  };

  const getFileIcon = (type: LectureMaterial['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="text-rose-600 dark:text-rose-400" size={20} />;
      case 'doc':
        return <File className="text-blue-600 dark:text-blue-400" size={20} />;
      case 'slide':
        return <FileCheck className="text-amber-600 dark:text-amber-400" size={20} />;
      case 'sheet':
        return <FileSpreadsheet className="text-emerald-600 dark:text-emerald-400" size={20} />;
      case 'archive':
        return <FileArchive className="text-purple-600 dark:text-purple-400" size={20} />;
      default:
        return <FileCode className="text-slate-600 dark:text-slate-400" size={20} />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
            {label}
          </label>
          <p className="text-[11px] text-slate-400">{helperText}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowUrlModal(!showUrlModal)}
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-900 transition dark:text-brand-400"
        >
          <LinkIcon size={13} /> {showUrlModal ? 'Cancel' : 'Add External Link'}
        </button>
      </div>

      {/* External Link Input Drawer */}
      {showUrlModal && (
        <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-3.5 space-y-2.5 dark:border-brand-900 dark:bg-brand-950/30">
          <p className="text-xs font-bold text-brand-900 dark:text-brand-300">
            Attach Cloud Document (Google Drive, OneDrive, Dropbox, etc.)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              className="input text-xs"
              placeholder="Document Name (e.g. Week 1 Lecture Notes.pdf)"
              value={urlTitle}
              onChange={(e) => setUrlTitle(e.target.value)}
            />
            <input
              className="input text-xs"
              placeholder="https://drive.google.com/… or public link"
              value={urlLink}
              onChange={(e) => setUrlLink(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddExternalLink}
              disabled={!urlTitle.trim() || !urlLink.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-brand-800 disabled:opacity-40"
            >
              <Plus size={14} /> Attach Document Link
            </button>
          </div>
        </div>
      )}

      {/* Drag & Drop Upload Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition ${
          isDragging
            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20'
            : 'border-slate-200 bg-slate-50/60 hover:border-brand-400 hover:bg-white dark:border-ink-700 dark:bg-ink-950/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center py-2">
            <Loader2 size={28} className="animate-spin text-brand-600 mb-2" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Uploading lecture materials to secure cloud storage…
            </p>
          </div>
        ) : (
          <>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-brand-700 shadow-sm border border-slate-100 group-hover:scale-110 transition dark:bg-ink-900 dark:border-ink-800 dark:text-brand-400">
              <Upload size={18} />
            </div>
            <p className="mt-2 text-xs font-bold text-slate-700 dark:text-slate-200">
              Drop lecture PDF or Word documents here, or{' '}
              <span className="text-brand-700 dark:text-brand-400 underline">browse files</span>
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Supports PDF, DOC, DOCX, PPTX, XLSX, ZIP (up to 25 MB per file)
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-2.5 text-xs text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-400">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Materials List */}
      {materials.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Attached Lecture Documents ({materials.length})
          </p>
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white dark:divide-ink-800 dark:border-ink-800 dark:bg-ink-900">
            {materials.map((mat) => (
              <div
                key={mat.id}
                className="flex items-center justify-between p-3 transition hover:bg-slate-50/80 dark:hover:bg-ink-800/40"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-50 dark:bg-ink-800">
                    {getFileIcon(mat.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                      {mat.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {mat.size} · {mat.type.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={mat.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition dark:border-ink-700 dark:text-slate-300 dark:hover:bg-ink-800"
                    title="Open document"
                  >
                    <ExternalLink size={13} /> Open
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRemove(mat.id)}
                    className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition dark:hover:bg-rose-950/40"
                    title="Remove document"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
