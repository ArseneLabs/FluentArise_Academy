import { useState } from 'react';
import { Save } from 'lucide-react';
import Modal from './ui/Modal';
import Toggle from './ui/Toggle';
import MediaUploader from './ui/MediaUploader';
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
      subtitle="Upload a video/audio lesson or paste an embed link with optional notes and preview"
      size="lg"
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

        <div>
          <label className="label">Lecture Notes & Transcript (Optional)</label>
          <textarea
            className="input min-h-[90px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Summary, key takeaways, slide links, or exercise instructions…"
          />
        </div>
      </div>
    </Modal>
  );
}
