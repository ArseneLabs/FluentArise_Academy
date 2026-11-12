import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ListTree,
  Plus,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Video,
  HelpCircle,
  FileText,
  Timer,
  Trash2,
  Pencil,
  ArrowLeft,
  PlayCircle,
  CircleDollarSign,
  Clock,
  Save,
  Paperclip,
} from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import QuizBuilderModal from '../components/QuizBuilderModal';
import AssignmentBuilderModal from '../components/AssignmentBuilderModal';
import LectureModal from '../components/LectureModal';
import { relativeDate } from '../lib/format';
import type { CurriculumItem, CurriculumItemKind, Quiz, Assignment, Lecture } from '../types';

const kindMeta: Record<CurriculumItemKind, { label: string; icon: React.ReactNode; tone: 'info' | 'coral' | 'amber' | 'success' }> = {
  lecture: { label: 'Lecture', icon: <Video size={14} />, tone: 'info' },
  quiz: { label: 'Quiz', icon: <HelpCircle size={14} />, tone: 'coral' },
  assignment: { label: 'Assignment', icon: <FileText size={14} />, tone: 'amber' },
  test: { label: 'Test', icon: <Timer size={14} />, tone: 'success' },
};

export default function CurriculumBuilder() {
  const { id } = useParams<{ id: string }>();
  const {
    courses,
    addSection,
    renameSection,
    deleteSection,
    addCurriculumItem,
    updateCurriculumItem,
    deleteCurriculumItem,
  } = useAdminStore();

  const course = courses.find((c) => c.id === id);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(course?.curriculum.map((s) => s.id) ?? []));
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [showSectionInput, setShowSectionInput] = useState(false);
  const [editingSection, setEditingSection] = useState<{ id: string; title: string } | null>(null);
  const [contentPickerFor, setContentPickerFor] = useState<string | null>(null);
  const [quizModal, setQuizModal] = useState<{ sectionId: string; quiz?: Quiz; kind: 'quiz' | 'test' } | null>(null);
  const [assignModal, setAssignModal] = useState<{ sectionId: string; assignment?: Assignment } | null>(null);
  const [lectureModal, setLectureModal] = useState<{ sectionId: string; lecture?: Lecture } | null>(null);
  const [deleteItem, setDeleteItem] = useState<{ sectionId: string; itemId: string; title: string } | null>(null);
  const [deleteSec, setDeleteSec] = useState<{ id: string; title: string } | null>(null);

  if (!course) {
    return (
      <div className="card p-12 text-center">
        <p className="text-slate-400">Course not found.</p>
        <Link to="/admin/courses" className="btn-primary mt-4 inline-flex">
          <ArrowLeft size={16} /> Back to courses
        </Link>
      </div>
    );
  }

  const toggle = (sid: string) =>
    setExpanded((prev) => {
      const n = new Set(prev);
      if (n.has(sid)) n.delete(sid);
      else n.add(sid);
      return n;
    });

  const addNewSection = () => {
    if (!newSectionTitle.trim()) return;
    addSection(course.id, newSectionTitle.trim());
    setNewSectionTitle('');
    setShowSectionInput(false);
  };

  const handleAddItem = (sectionId: string, kind: CurriculumItemKind) => {
    setContentPickerFor(null);
    if (kind === 'lecture') setLectureModal({ sectionId });
    else if (kind === 'quiz') setQuizModal({ sectionId, kind: 'quiz' });
    else if (kind === 'test') setQuizModal({ sectionId, kind: 'test' });
    else if (kind === 'assignment') setAssignModal({ sectionId });
  };

  const saveLecture = (lecture: Lecture) => {
    if (!lectureModal) return;
    if (lectureModal.lecture) updateCurriculumItem(course.id, lectureModal.sectionId, lecture);
    else addCurriculumItem(course.id, lectureModal.sectionId, lecture);
    setLectureModal(null);
  };

  const saveQuiz = (quiz: Quiz) => {
    if (!quizModal) return;
    if (quizModal.quiz) updateCurriculumItem(course.id, quizModal.sectionId, quiz);
    else addCurriculumItem(course.id, quizModal.sectionId, quiz);
    setQuizModal(null);
  };

  const saveAssignment = (assignment: Assignment) => {
    if (!assignModal) return;
    if (assignModal.assignment) updateCurriculumItem(course.id, assignModal.sectionId, assignment);
    else addCurriculumItem(course.id, assignModal.sectionId, assignment);
    setAssignModal(null);
  };

  const editItem = (sectionId: string, item: CurriculumItem) => {
    if (item.kind === 'lecture') setLectureModal({ sectionId, lecture: item });
    else if (item.kind === 'quiz' || item.kind === 'test') setQuizModal({ sectionId, quiz: item, kind: item.kind });
    else if (item.kind === 'assignment') setAssignModal({ sectionId, assignment: item });
  };

  const totalLessons = course.curriculum.reduce((s, sec) => s + sec.items.filter((i) => i.kind === 'lecture').length, 0);
  const totalTasks = course.curriculum.reduce(
    (s, sec) => s + sec.items.filter((i) => i.kind !== 'lecture').length,
    0,
  );
  const totalDuration = course.curriculum.reduce(
    (s, sec) => s + sec.items.filter((i) => i.kind === 'lecture').reduce((a, l) => a + (l as Lecture).durationMin, 0),
    0,
  );

  return (
    <>
      {/* Breadcrumb header */}
      <div className="mb-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link to="/admin/courses" className="hover:text-coral-600">Courses</Link>
        <ChevronRight size={14} />
        <span className="font-semibold text-slate-700 dark:text-slate-200">{course.title}</span>
        <ChevronRight size={14} />
        <span>Curriculum</span>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-coral-50 text-coral-600 dark:bg-coral-500/15 dark:text-coral-400">
            <ListTree size={20} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Curriculum Builder
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {course.curriculum.length} sections · {totalLessons} lessons · {totalTasks} tasks · {totalDuration} min total
            </p>
          </div>
        </div>
        <button className="btn-primary" disabled>
          <Save size={16} /> Saved
        </button>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {course.curriculum.map((section, si) => {
          const isOpen = expanded.has(section.id);
          return (
            <div key={section.id} className="card overflow-hidden">
              {/* Section header */}
              <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-ink-700">
                <GripVertical size={18} className="cursor-grab text-slate-300 dark:text-ink-600" />
                <button onClick={() => toggle(section.id)} className="flex flex-1 items-center gap-2 text-left">
                  {isOpen ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-ink-800 text-xs font-bold text-coral-400">
                    {si + 1}
                  </span>
                  <span className="font-display text-sm font-bold text-slate-900 dark:text-white">{section.title}</span>
                  <Badge tone="neutral">{section.items.length}</Badge>
                </button>
                <button
                  onClick={() => setEditingSection({ id: section.id, title: section.title })}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-coral-600 dark:hover:bg-ink-700"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setDeleteSec({ id: section.id, title: section.title })}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-error-600 dark:hover:bg-ink-700"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Items */}
              {isOpen && (
                <div className="animate-slide-down">
                  {section.items.length === 0 && (
                    <p className="px-4 py-6 text-center text-sm text-slate-400">No content yet. Add your first item.</p>
                  )}
                  {section.items.map((item) => {
                    const meta = kindMeta[item.kind];
                    return (
                      <div
                        key={item.id}
                        className="group flex items-center gap-3 border-b border-slate-50 px-4 py-3 last:border-0 hover:bg-slate-50 dark:border-ink-700/60 dark:hover:bg-ink-700/30"
                      >
                        <GripVertical size={16} className="cursor-grab text-slate-300 dark:text-ink-600" />
                        <Badge tone={meta.tone}>{meta.icon} {meta.label}</Badge>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{item.title}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            {item.kind === 'lecture' && (
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="flex items-center gap-1">
                                  <Clock size={11} /> {item.durationMin} min
                                  {item.freePreview && <span className="ml-1 text-success-600">· Free preview</span>}
                                </span>
                                {item.notes && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 dark:text-brand-400">
                                    <FileText size={11} /> Notes
                                  </span>
                                )}
                                {item.materials && item.materials.length > 0 && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 dark:text-purple-400">
                                    <Paperclip size={11} /> {item.materials.length} {item.materials.length === 1 ? 'doc' : 'docs'}
                                  </span>
                                )}
                              </div>
                            )}
                            {(item.kind === 'quiz' || item.kind === 'test') && (
                              <>
                                <span>{item.questions.length} questions</span>
                                <span>· {item.passingScorePct}% to pass</span>
                                {item.durationMin && <span>· {item.durationMin} min</span>}
                              </>
                            )}
                            {item.kind === 'assignment' && (
                              <>
                                <span>{item.estimatedHours}h est.</span>
                                <span>· Due {relativeDate(item.dueDate)}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                          {item.kind === 'lecture' && item.freePreview && (
                            <CircleDollarSign size={14} className="text-success-500" />
                          )}
                          {item.kind === 'lecture' && <PlayCircle size={14} className="text-info-500" />}
                          <button
                            onClick={() => editItem(section.id, item)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-coral-600 dark:hover:bg-ink-700"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteItem({ sectionId: section.id, itemId: item.id, title: item.title })}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-error-600 dark:hover:bg-ink-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add content */}
                  <div className="px-4 py-3">
                    <button
                      onClick={() => setContentPickerFor(section.id)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-2.5 text-sm font-semibold text-slate-500 transition hover:border-coral-500 hover:text-coral-600 dark:border-ink-600 dark:hover:border-coral-500"
                    >
                      <Plus size={16} /> Add Content
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add new section */}
      <div className="mt-5">
        {showSectionInput ? (
          <div className="card flex items-center gap-3 p-4">
            <input
              autoFocus
              className="input flex-1"
              placeholder="Section title, e.g. Module 3: Collections & Generics"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addNewSection()}
            />
            <button className="btn-primary" onClick={addNewSection}>
              <Plus size={16} /> Add
            </button>
            <button className="btn-ghost" onClick={() => setShowSectionInput(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowSectionInput(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-500 transition hover:border-coral-500 hover:text-coral-600 dark:border-ink-600"
          >
            <Plus size={18} /> Add Section
          </button>
        )}
      </div>

      {/* Content type picker */}
      <Modal
        open={!!contentPickerFor}
        onClose={() => setContentPickerFor(null)}
        title="Add Content"
        subtitle="Choose the type of content to add to this section"
        size="md"
      >
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { kind: 'lecture' as const, label: 'Video / Lecture', desc: 'Recorded lesson with notes', icon: <Video size={22} />, tone: 'text-info-600 bg-info-50 dark:bg-info-500/15 dark:text-info-400' },
              { kind: 'quiz' as const, label: 'Quiz', desc: 'Short auto-graded knowledge check', icon: <HelpCircle size={22} />, tone: 'text-coral-600 bg-coral-50 dark:bg-coral-500/15 dark:text-coral-400' },
              { kind: 'assignment' as const, label: 'Assignment / Exercise', desc: 'Practical project with submission', icon: <FileText size={22} />, tone: 'text-amber-600 bg-amber-50 dark:bg-amber-500/15 dark:text-amber-400' },
              { kind: 'test' as const, label: 'Formal Test / Exam', desc: 'Timed assessment for certificates', icon: <Timer size={22} />, tone: 'text-success-600 bg-success-50 dark:bg-success-500/15 dark:text-success-500' },
            ]
          ).map((opt) => (
            <button
              key={opt.kind}
              onClick={() => contentPickerFor && handleAddItem(contentPickerFor, opt.kind)}
              className="group flex flex-col items-start gap-2 rounded-xl border border-slate-200 p-4 text-left transition hover:border-coral-500 hover:shadow-card-hover dark:border-ink-700"
            >
              <span className={`grid h-11 w-11 place-items-center rounded-xl ${opt.tone}`}>{opt.icon}</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{opt.label}</span>
              <span className="text-xs text-slate-400">{opt.desc}</span>
            </button>
          ))}
        </div>
      </Modal>

      {/* Rename section modal */}
      <Modal
        open={!!editingSection}
        onClose={() => setEditingSection(null)}
        title="Rename Section"
        size="sm"
        footer={
          <>
            <button className="btn-outline" onClick={() => setEditingSection(null)}>Cancel</button>
            <button
              className="btn-primary"
              onClick={() => {
                if (editingSection) renameSection(course.id, editingSection.id, editingSection.title);
                setEditingSection(null);
              }}
            >
              <Save size={16} /> Save
            </button>
          </>
        }
      >
        <label className="label">Section Title</label>
        <input
          className="input"
          value={editingSection?.title ?? ''}
          onChange={(e) => setEditingSection((s) => (s ? { ...s, title: e.target.value } : s))}
        />
      </Modal>

      {/* Delete item confirm */}
      <Modal
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        title="Remove content"
        size="sm"
        footer={
          <>
            <button className="btn-outline" onClick={() => setDeleteItem(null)}>Cancel</button>
            <button
              className="btn-danger"
              onClick={() => {
                if (deleteItem) deleteCurriculumItem(course.id, deleteItem.sectionId, deleteItem.itemId);
                setDeleteItem(null);
              }}
            >
              <Trash2 size={16} /> Remove
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Remove <strong>{deleteItem?.title}</strong> from this section?
        </p>
      </Modal>

      {/* Delete section confirm */}
      <Modal
        open={!!deleteSec}
        onClose={() => setDeleteSec(null)}
        title="Delete section"
        size="sm"
        footer={
          <>
            <button className="btn-outline" onClick={() => setDeleteSec(null)}>Cancel</button>
            <button
              className="btn-danger"
              onClick={() => {
                if (deleteSec) deleteSection(course.id, deleteSec.id);
                setDeleteSec(null);
              }}
            >
              <Trash2 size={16} /> Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Delete section <strong>{deleteSec?.title}</strong> and all its content? This cannot be undone.
        </p>
      </Modal>

      {/* Builder modals */}
      {lectureModal && (
        <LectureModal
          open={!!lectureModal}
          onClose={() => setLectureModal(null)}
          lecture={lectureModal.lecture}
          onSave={saveLecture}
        />
      )}
      {quizModal && (
        <QuizBuilderModal
          open={!!quizModal}
          onClose={() => setQuizModal(null)}
          quiz={quizModal.quiz}
          kind={quizModal.kind}
          onSave={saveQuiz}
        />
      )}
      {assignModal && (
        <AssignmentBuilderModal
          open={!!assignModal}
          onClose={() => setAssignModal(null)}
          assignment={assignModal.assignment}
          onSave={saveAssignment}
        />
      )}
    </>
  );
}
