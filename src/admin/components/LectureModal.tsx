import { useState } from 'react';
import { Save } from 'lucide-react';
import Modal from './ui/Modal';
import Toggle from './ui/Toggle';
import { uid } from '../store/adminStore';
import type { Lecture } from '../types';

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

  const save = () => {
    onSave({
      id: lecture?.id ?? uid('lec'),
      kind: 'lecture',
      title: title || 'Untitled Lecture',
      durationMin,
      videoUrl,
      freePreview,
      notes: notes || undefined,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={lecture ? 'Edit Lecture' : 'Add Video / Lecture'}
      subtitle="Recorded lesson with optional notes and free preview"
      size="lg"
      footer={
        <>
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={!title}>
            <Save size={16} /> Save Lecture
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Lecture Title</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Classes & Objects Explained" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Duration (minutes)</label>
            <input type="number" className="input" value={durationMin} onChange={(e) => setDurationMin(+e.target.value)} min={1} />
          </div>
          <div>
            <label className="label">Free Preview</label>
            <div className="flex h-[42px] items-center">
              <Toggle label="Available without enrolment" checked={freePreview} onChange={setFreePreview} />
            </div>
          </div>
        </div>
        <div>
          <label className="label">Video Embed / Storage URL</label>
          <input className="input font-mono text-xs" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/embed/… or storage URL" />
          {videoUrl && (
            <div className="mt-2 aspect-video overflow-hidden rounded-xl bg-ink-900">
              <iframe src={videoUrl} className="h-full w-full" title="Preview" allowFullScreen />
            </div>
          )}
        </div>
        <div>
          <label className="label">Lecture Notes (optional)</label>
          <textarea className="input min-h-[80px]" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Summary, slide links, or extra reading…" />
        </div>
      </div>
    </Modal>
  );
}
