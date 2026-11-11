import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import {
  Upload,
  Link as LinkIcon,
  X,
  FileText,
  Video,
  Music,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import {
  type MediaType,
  MEDIA_CONFIGS,
  uploadMediaFile,
  validateMediaFile,
  formatBytes,
} from '../../../lib/storage';

interface MediaUploaderProps {
  type: MediaType;
  value: string;
  onChange: (url: string, fileName?: string, fileSize?: string) => void;
  label?: string;
  helperText?: string;
  folder?: 'thumbnails' | 'videos' | 'audio' | 'documents';
  placeholder?: string;
}

export default function MediaUploader({
  type,
  value,
  onChange,
  label,
  helperText,
  folder = 'thumbnails',
  placeholder = 'https://…',
}: MediaUploaderProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const config = MEDIA_CONFIGS[type];

  const handleFile = async (file: File) => {
    setError(null);

    // Validate size & type
    const validation = validateMediaFile(file, type);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setUploading(true);
    try {
      const res = await uploadMediaFile(file, folder, type);
      if (res.error) {
        setError(res.error);
      } else if (res.url) {
        setUploadedFileName(file.name);
        setUploadedFileSize(res.sizeFormatted);
        onChange(res.url, file.name, res.sizeFormatted);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const clearValue = () => {
    onChange('', undefined, undefined);
    setUploadedFileName(null);
    setUploadedFileSize(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getMediaIcon = () => {
    switch (type) {
      case 'image':
        return <ImageIcon size={22} className="text-brand-600" />;
      case 'video':
        return <Video size={22} className="text-sky-600" />;
      case 'audio':
        return <Music size={22} className="text-emerald-600" />;
      case 'document':
        return <FileText size={22} className="text-amber-600" />;
    }
  };

  const isYouTube = value.includes('youtube.com') || value.includes('youtu.be');

  return (
    <div className="space-y-2">
      {/* Header with Mode Switcher */}
      <div className="flex items-center justify-between">
        {label && <label className="label mb-0">{label}</label>}
        <div className="flex items-center rounded-lg bg-slate-100 p-0.5 text-xs font-semibold dark:bg-ink-700">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition ${
              mode === 'upload'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-ink-800 dark:text-white'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Upload size={12} /> From Computer
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition ${
              mode === 'url'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-ink-800 dark:text-white'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <LinkIcon size={12} /> Paste URL
          </button>
        </div>
      </div>

      {helperText && <p className="text-xs text-slate-400">{helperText}</p>}

      {/* ERROR NOTICE */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 animate-fade-in">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1">{error}</div>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700">
            <X size={14} />
          </button>
        </div>
      )}

      {/* MODE 1: UPLOAD FROM COMPUTER */}
      {mode === 'upload' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={config.allowedExtensions.join(',')}
            onChange={onFileChange}
            className="hidden"
          />

          {!value ? (
            /* DROPZONE */
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition ${
                isDragging
                  ? 'border-brand-500 bg-brand-50/60 ring-4 ring-brand-100 dark:bg-brand-950/40'
                  : 'border-slate-200 bg-slate-50/60 hover:border-brand-400 hover:bg-slate-50 dark:border-ink-700 dark:bg-ink-800/40'
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition group-hover:scale-110 dark:bg-ink-700 dark:ring-ink-600">
                {uploading ? (
                  <Loader2 size={22} className="animate-spin text-brand-600" />
                ) : (
                  getMediaIcon()
                )}
              </div>

              <div className="mt-3">
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  {uploading ? 'Uploading to secure storage…' : 'Click to browse or drag & drop'}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Supported formats: {config.allowedExtensions.join(', ')}
                </p>
              </div>

              {/* Size limit pill */}
              <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-slate-200/80 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 dark:bg-ink-600 dark:text-slate-200">
                Max file size: {config.labelMax}
              </span>
            </div>
          ) : (
            /* PREVIEW BOX */
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-ink-700 dark:bg-ink-800">
              {/* IMAGE PREVIEW */}
              {type === 'image' && (
                <div className="space-y-3">
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-100">
                    <img src={value} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 truncate max-w-xs dark:text-slate-200">
                      {uploadedFileName || 'Image Uploaded'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-50 transition"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={clearValue}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 font-semibold text-rose-700 hover:bg-rose-100 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* VIDEO PREVIEW */}
              {type === 'video' && (
                <div className="space-y-3">
                  <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
                    {isYouTube ? (
                      <iframe
                        src={value}
                        title="Video Preview"
                        className="h-full w-full"
                        allowFullScreen
                      />
                    ) : (
                      <video src={value} controls className="h-full w-full" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 truncate max-w-xs dark:text-slate-200">
                      {uploadedFileName || 'Video File'}
                    </span>
                    <button
                      type="button"
                      onClick={clearValue}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 font-semibold text-rose-700 hover:bg-rose-100 transition"
                    >
                      Remove Video
                    </button>
                  </div>
                </div>
              )}

              {/* AUDIO PREVIEW */}
              {type === 'audio' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-xl bg-emerald-50/70 p-3 text-emerald-900">
                    <Music size={22} className="text-emerald-600 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate">
                        {uploadedFileName || 'Audio Track'}
                      </p>
                      {uploadedFileSize && (
                        <p className="text-[11px] text-emerald-700">{uploadedFileSize}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={clearValue}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <audio src={value} controls className="w-full" />
                </div>
              )}

              {/* DOCUMENT PREVIEW */}
              {type === 'document' && (
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-ink-700">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700 shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate dark:text-white">
                        {uploadedFileName || 'Document File'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {uploadedFileSize || 'Ready for learners'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-white transition"
                      title="Open in new tab"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button
                      type="button"
                      onClick={clearValue}
                      className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-700 hover:bg-rose-100 transition"
                      title="Remove"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODE 2: PASTE URL */}
      {mode === 'url' && (
        <div className="space-y-3">
          <div className="relative">
            <input
              type="url"
              className="input pl-9 pr-9 text-xs font-mono"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
            />
            <LinkIcon
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            {value && (
              <button
                type="button"
                onClick={clearValue}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {value && type === 'image' && (
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-200">
              <img src={value} alt="Preview" className="h-full w-full object-cover" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
