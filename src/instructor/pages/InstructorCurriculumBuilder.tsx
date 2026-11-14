import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ListTree,
  Plus,
  ChevronDown,
  ChevronRight,
  Video,
  HelpCircle,
  FileText,
  Timer,
  Trash2,
  Pencil,
  ArrowLeft,
  Clock,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { useAdminStore } from '../../admin/store/adminStore';
import { useAuth } from '../../auth/AuthProvider';
import Badge from '../../admin/components/ui/Badge';
import Modal from '../../admin/components/ui/Modal';
import QuizBuilderModal from '../../admin/components/QuizBuilderModal';
import AssignmentBuilderModal from '../../admin/components/AssignmentBuilderModal';
import LectureModal from '../../admin/components/LectureModal';
import type { CurriculumItem, CurriculumItemKind, Quiz, Assignment, Lecture } from '../../admin/types';

const kindMeta: Record<CurriculumItemKind, { label: string; icon: React.ReactNode; tone: 'info' | 'coral' | 'amber' | 'success' }> = {
  lecture: { label: 'Lecture', icon: <Video size={14} />, tone: 'info' },
  quiz: { label: 'Quiz', icon: <HelpCircle size={14} />, tone: 'coral' },
  assignment: { label: 'Assignment', icon: <FileText size={14} />, tone: 'amber' },
  test: { label: 'Test', icon: <Timer size={14} />, tone: 'success' },
};

export default function InstructorCurriculumBuilder() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
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

  // Security check: course must be assigned to this instructor
  const isAssigned = Boolean(
    course &&
      (course.instructorId === user?.id ||
        course.instructorId === user?.instructorId ||
        user?.role === 'super_admin')
  );

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
        <Link to="/instructor/courses" className="btn-primary mt-4 inline-flex">
          <ArrowLeft size={16} /> Back to My Courses
        </Link>
      </div>
    );
  }

  // Access Denied Screen
  if (!isAssigned) {
    return (
      <div className="mx-auto max-w-xl py-12">
        <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-card sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <Lock size={36} />
          </div>
          <h2 className="mt-5 font-display text-xl font-bold text-slate-900">
            Curriculum Access Restricted
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            You are not assigned as lead instructor for <strong className="text-slate-800">{course.title}</strong>.
            Curriculum modifications, video uploads, and assessment additions are strictly restricted to the assigned instructor and Super Admin.
          </p>
          <div className="mt-6">
            <Link
              to="/instructor/courses"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
            >
              <ArrowLeft size={14} /> Back to My Assigned Courses
            </Link>
          </div>
        </div>
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
  const totalTasks = course.curriculum.reduce((s, sec) => s + sec.items.filter((i) => i.kind !== 'lecture').length, 0);

  return (
    <div className="space-y-6">
      {/* Breadcrumb header */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/instructor/courses" className="hover:text-emerald-700 font-semibold flex items-center gap-1">
          <ArrowLeft size={14} /> My Courses
        </Link>
        <ChevronRight size={14} />
        <span className="font-semibold text-slate-700">{course.title}</span>
        <ChevronRight size={14} />
        <span>Curriculum & Content Builder</span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <ListTree size={20} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
              Curriculum Builder
            </h1>
            <p className="text-xs text-slate-500">
              {totalLessons} video lessons · {totalTasks} quizzes & assignments · {course.curriculum.length} sections
            </p>
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={() => setShowSectionInput(true)}
        >
          <Plus size={16} /> Add Module Section
        </button>
      </div>

      {/* Add section inline */}
      {showSectionInput && (
        <div className="card flex items-center gap-3 p-4">
          <input
            className="input flex-1"
            placeholder="New section title (e.g. Module 3: Advanced APIs)"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addNewSection()}
            autoFocus
          />
          <button className="btn-primary" onClick={addNewSection} disabled={!newSectionTitle.trim()}>
            Add Section
          </button>
          <button className="btn-outline" onClick={() => { setShowSectionInput(false); setNewSectionTitle(''); }}>
            Cancel
          </button>
        </div>
      )}

      {/* Curriculum sections */}
      <div className="space-y-4">
        {course.curriculum.map((section, sIndex) => {
          const isOpen = expanded.has(section.id);
          return (
            <div key={section.id} className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 p-4">
                <button
                  onClick={() => toggle(section.id)}
                  className="flex items-center gap-2.5 font-bold text-sm text-slate-900 text-left"
                >
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span>Section {sIndex + 1}: {section.title}</span>
                  <span className="text-xs text-slate-400 font-normal">({section.items.length} items)</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setContentPickerFor(section.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                  >
                    <Plus size={13} /> Add Content
                  </button>
                  <button
                    onClick={() => setEditingSection({ id: section.id, title: section.title })}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
                    title="Rename Section"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteSec({ id: section.id, title: section.title })}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    title="Delete Section"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="p-4 space-y-2">
                  {section.items.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No items in this section yet. Click "Add Content" to add a video lecture, quiz, test, or assignment.
                    </div>
                  ) : (
                    section.items.map((it) => {
                      const meta = kindMeta[it.kind];
                      return (
                        <div
                          key={it.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition"
                        >
                          <div className="flex items-center gap-3">
                            <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-600">
                              {meta.icon}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{it.title}</p>
                              <p className="text-[10px] text-slate-400 uppercase tracking-wide">{it.kind}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => editItem(section.id, it)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                              title="Edit item"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => setDeleteItem({ sectionId: section.id, itemId: it.id, title: it.title })}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                              title="Delete item"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}

        {course.curriculum.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400 bg-white">
            <ListTree size={36} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">Curriculum is empty</p>
            <p className="text-xs text-slate-400 mt-1">Click "Add Module Section" above to organize your course lessons and assessments.</p>
          </div>
        )}
      </div>

      {/* Content Type Picker Modal */}
      {contentPickerFor && (
        <Modal
          open={Boolean(contentPickerFor)}
          onClose={() => setContentPickerFor(null)}
          title="Add Curriculum Content"
          subtitle="Choose what type of content to add to this module section"
          size="sm"
        >
          <div className="grid grid-cols-2 gap-3">
            {[
              { kind: 'lecture' as const, label: 'Video Lecture', desc: 'Video lesson, notes, materials', icon: <Video size={18} /> },
              { kind: 'quiz' as const, label: 'Quiz', desc: 'Knowledge check with scoring', icon: <HelpCircle size={18} /> },
              { kind: 'assignment' as const, label: 'Assignment', desc: 'Project with file submission', icon: <FileText size={18} /> },
              { kind: 'test' as const, label: 'Exam / Test', desc: 'Timed formal assessment', icon: <Timer size={18} /> },
            ].map((opt) => (
              <button
                key={opt.kind}
                onClick={() => handleAddItem(contentPickerFor, opt.kind)}
                className="flex flex-col items-center p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-center transition"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700 mb-2">
                  {opt.icon}
                </div>
                <p className="font-bold text-xs text-slate-800">{opt.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </Modal>
      )}

      {/* Edit Section Modal */}
      {editingSection && (
        <Modal
          open={Boolean(editingSection)}
          onClose={() => setEditingSection(null)}
          title="Rename Section"
          size="sm"
          footer={
            <>
              <button className="btn-outline" onClick={() => setEditingSection(null)}>Cancel</button>
              <button
                className="btn-primary"
                onClick={() => {
                  renameSection(course.id, editingSection.id, editingSection.title);
                  setEditingSection(null);
                }}
              >
                Save
              </button>
            </>
          }
        >
          <input
            className="input"
            value={editingSection.title}
            onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
          />
        </Modal>
      )}

      {/* Lecture Modal */}
      {lectureModal && (
        <LectureModal
          open={Boolean(lectureModal)}
          onClose={() => setLectureModal(null)}
          lecture={lectureModal.lecture}
          onSave={saveLecture}
        />
      )}

      {/* Quiz Modal */}
      {quizModal && (
        <QuizBuilderModal
          open={Boolean(quizModal)}
          onClose={() => setQuizModal(null)}
          quiz={quizModal.quiz}
          kind={quizModal.kind}
          onSave={saveQuiz}
        />
      )}

      {/* Assignment Modal */}
      {assignModal && (
        <AssignmentBuilderModal
          open={Boolean(assignModal)}
          onClose={() => setAssignModal(null)}
          assignment={assignModal.assignment}
          onSave={saveAssignment}
        />
      )}

      {/* Delete Item Confirmation */}
      {deleteItem && (
        <Modal
          open={Boolean(deleteItem)}
          onClose={() => setDeleteItem(null)}
          title="Delete Curriculum Item"
          size="sm"
          footer={
            <>
              <button className="btn-outline" onClick={() => setDeleteItem(null)}>Cancel</button>
              <button
                className="btn-danger"
                onClick={() => {
                  deleteCurriculumItem(course.id, deleteItem.sectionId, deleteItem.itemId);
                  setDeleteItem(null);
                }}
              >
                Delete
              </button>
            </>
          }
        >
          <p className="text-xs text-slate-600">Are you sure you want to delete "{deleteItem.title}"?</p>
        </Modal>
      )}

      {/* Delete Section Confirmation */}
      {deleteSec && (
        <Modal
          open={Boolean(deleteSec)}
          onClose={() => setDeleteSec(null)}
          title="Delete Section"
          size="sm"
          footer={
            <>
              <button className="btn-outline" onClick={() => setDeleteSec(null)}>Cancel</button>
              <button
                className="btn-danger"
                onClick={() => {
                  deleteSection(course.id, deleteSec.id);
                  setDeleteSec(null);
                }}
              >
                Delete
              </button>
            </>
          }
        >
          <p className="text-xs text-slate-600">Are you sure you want to delete "{deleteSec.title}" and all its lessons?</p>
        </Modal>
      )}
    </div>
  );
}
