import { useState } from 'react';
import { Save, Video, FileText, Paperclip, PenTool } from 'lucide-react';
import Modal from './ui/Modal';
import Toggle from './ui/Toggle';
import MediaUploader from './ui/MediaUploader';
import RichTextEditor from '../../components/common/RichTextEditor';
import LectureMaterialsManager from '../../components/common/LectureMaterialsManager';
import { uid } from '../store/adminStore';
import type { Lecture, LectureMaterial } from '../types';

export default function LectureModal({
  open,
  onClose,
  lecture,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  lecture?: Lecture;
  onSave: (l: Lecture) => void;
}) {
  const [title, setTitle] = useState(lecture?.title ?? '');
  const [durationMin, setDurationMin] = useState(lecture?.durationMin ?? 15);
  const [videoUrl, setVideoUrl] = useState(lecture?.videoUrl ?? '');
  const [freePreview, setFreePreview] = useState(lecture?.freePreview ?? false);
  const [notes, setNotes] = useState(lecture?.notes ?? '');
  const [materials, setMaterials] = useState<LectureMaterial[]>(lecture?.materials ?? []);
  const [activeTab, setActiveTab] = useState<'video' | 'notes' | 'materials'>('video');

  const save = () => {
    onSave({
      id: lecture?.id ?? uid('lec'),
      kind: 'lecture',
      title: title || 'Untitled Lecture',
      durationMin,
      videoUrl,
      freePreview,
      notes: notes || undefined,
      materials: materials.length > 0 ? materials : undefined,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={lecture ? 'Edit Lecture & Materials' : 'Add Video / Lecture'}
      subtitle="Configure video lesson, write formatted notes with handwriting, and attach PDF/Word documents"
      size="xl"
      footer={
        <>
          <button className="btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={save} disabled={!title}>
            <Save size={16} /> Save Lecture
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Lecture Title *</label>
          <input
            className="input font-semibold"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Classes & Objects Explained"
          />
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 dark:border-ink-800">
          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
              activeTab === 'video'
                ? 'border-brand-600 text-brand-700 dark:border-brand-500 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Video size={15} /> Video & Settings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
              activeTab === 'notes'
                ? 'border-brand-600 text-brand-700 dark:border-brand-500 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <PenTool size={15} /> Word Notes & Handwriting
            {notes && (
              <span className="h-1.5 w-1.5 rounded-full bg-brand-600 dark:bg-brand-400" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('materials')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
              activeTab === 'materials'
                ? 'border-brand-600 text-brand-700 dark:border-brand-500 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Paperclip size={15} /> PDF & Word Materials
            {materials.length > 0 && (
              <span className="rounded-full bg-brand-100 px-1.5 py-0.2 text-[10px] font-bold text-brand-800 dark:bg-brand-950 dark:text-brand-300">
                {materials.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Video & Settings */}
        {activeTab === 'video' && (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Estimated Duration (minutes)</label>
                <input
                  type="number"
                  className="input"
                  value={durationMin}
                  onChange={(e) => setDurationMin(+e.target.value)}
                  min={1}
                />
              </div>

              <div>
                <label className="label">Free Preview</label>
                <div className="flex h-[42px] items-center">
                  <Toggle
                    label="Available without enrolment"
                    checked={freePreview}
                    onChange={setFreePreview}
                  />
                </div>
              </div>
            </div>

            <MediaUploader
              type="video"
              label="Lecture Video File or Embed URL"
              helperText="Upload video file (MP4, WebM, up to 50 MB) from computer or paste a YouTube / Vimeo embed link."
              value={videoUrl}
              onChange={(url) => setVideoUrl(url)}
              folder="videos"
              placeholder="https://youtube.com/embed/… or direct video URL"
            />
          </div>
        )}

        {/* Tab 2: Word-Style Notes & Handwriting */}
        {activeTab === 'notes' && (
          <div className="space-y-3 pt-1">
            <RichTextEditor
              label="Lecture Study Notes & Transcript"
              helperText="Type formatted notes with headings, lists, bold text, or click 'Write by Hand / Sketch' to draw diagrams"
              value={notes}
              onChange={setNotes}
              placeholder="Write detailed lesson takeaways, step-by-step instructions, code explanations, or sketch diagrams…"
              minHeight="280px"
            />
          </div>
        )}

        {/* Tab 3: PDF & Word Document Materials */}
        {activeTab === 'materials' && (
          <div className="space-y-3 pt-1">
            <LectureMaterialsManager
              materials={materials}
              onChange={setMaterials}
              label="Lecture Attachments & Downloads"
              helperText="Upload PDF lecture notes, Word documents (.doc/.docx), slides (.pptx), or link cloud files"
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
