import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Search,
  Star,
  Pencil,
  ListTree,
  Trash2,
  Check,
} from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { uid } from '../store/adminStore';
import { PageHeader } from '../components/AdminLayout';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { formatRwf } from '../lib/format';
import type { Course, CourseCategory, CourseLevel } from '../types';

const categories: CourseCategory[] = ['Languages', 'Programming', 'Test Prep', 'Web Development', 'Professional'];
const levels: CourseLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

const blankCourse: Course = {
  id: '',
  title: '',
  category: 'Programming',
  level: 'Beginner',
  price: 0,
  free: false,
  thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80',
  instructorId: 'ins_prince',
  published: false,
  certificate: false,
  assessmentsEnabled: true,
  lessonsCount: 0,
  tasksCount: 0,
  studentsCount: 0,
  rating: 0,
  revenue: 0,
  createdAt: new Date().toISOString(),
  curriculum: [],
};

export default function CourseManagement() {
  const { courses, instructors, addCourse, updateCourse, deleteCourse, toggleCoursePublished } = useAdminStore();
  const [query, setQuery] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Course | null>(null);

  const filtered = courses.filter(
    (c) =>
      (filterCat === 'all' || c.category === filterCat) &&
      c.title.toLowerCase().includes(query.toLowerCase()),
  );

  const openNew = () => {
    setEditing({ ...blankCourse, id: uid('c') });
    setModalOpen(true);
  };
  const openEdit = (c: Course) => {
    setEditing({ ...c });
    setModalOpen(true);
  };

  const save = () => {
    if (!editing) return;
    const exists = courses.some((c) => c.id === editing.id);
    if (exists) updateCourse(editing.id, editing);
    else addCourse(editing);
    setModalOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Course Management"
        subtitle="Create, configure and publish courses on FluentaRise"
        icon={<BookOpen size={20} />}
        actions={
          <button className="btn-primary" onClick={openNew}>
            <Plus size={16} /> New Course
          </button>
        }
      />

      {/* Filter bar */}
      <div className="card mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-10"
            placeholder="Search courses…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select className="input sm:w-56" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Course grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => {
          const ins = instructors.find((i) => i.id === c.instructorId);
          return (
            <div key={c.id} className="card group overflow-hidden transition hover:shadow-card-hover">
              <div className="relative h-40 overflow-hidden">
                <img
                  src={c.thumbnail}
                  alt={c.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 to-transparent" />
                <div className="absolute left-3 top-3 flex gap-2">
                  <Badge tone={c.published ? 'success' : 'warning'} dot>
                    {c.published ? 'Published' : 'Draft'}
                  </Badge>
                  <Badge tone="neutral">{c.category}</Badge>
                </div>
                <div className="absolute right-3 top-3 flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-xs font-bold text-slate-800 backdrop-blur">
                  <Star size={12} className="text-amber-500 fill-amber-500" />
                  {c.rating || '—'}
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-display text-base font-bold text-white line-clamp-1">{c.title}</h3>
                  <p className="text-xs text-slate-200">{ins?.name}</p>
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-slate-400">Lessons</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{c.lessonsCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Tasks</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{c.tasksCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Students</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{c.studentsCount}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    {c.free ? (
                      <span className="font-display text-lg font-bold text-success-600">Free</span>
                    ) : (
                      <div>
                        <span className="font-display text-lg font-bold text-slate-900 dark:text-white">
                          {formatRwf(c.discountPrice ?? c.price)}
                        </span>
                        {c.discountPrice && (
                          <span className="ml-1.5 text-xs text-slate-400 line-through">
                            {formatRwf(c.price)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <Badge tone="info">{c.level}</Badge>
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-ink-700">
                  <Link to={`/admin/courses/${c.id}/curriculum`} className="btn-outline flex-1 !py-2 text-xs">
                    <ListTree size={14} /> Curriculum
                  </Link>
                  <button
                    onClick={() => openEdit(c)}
                    className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-coral-600 dark:border-ink-700 dark:hover:bg-ink-700"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => toggleCoursePublished(c.id)}
                    className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-success-600 dark:border-ink-700 dark:hover:bg-ink-700"
                    title={c.published ? 'Unpublish' : 'Publish'}
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(c)}
                    className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-error-600 dark:border-ink-700 dark:hover:bg-ink-700"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card p-12 text-center">
          <BookOpen size={32} className="mx-auto text-slate-300" />
          <p className="mt-3 text-sm text-slate-400">No courses match your filters.</p>
        </div>
      )}

      {/* Create/Edit wizard */}
      {editing && (
        <CourseWizard
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          course={editing}
          setCourse={setEditing}
          instructors={instructors}
          onSave={save}
        />
      )}

      {/* Delete confirm */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete course"
        size="sm"
        footer={
          <>
            <button className="btn-outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </button>
            <button
              className="btn-danger"
              onClick={() => {
                if (confirmDelete) deleteCourse(confirmDelete.id);
                setConfirmDelete(null);
              }}
            >
              <Trash2 size={16} /> Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to delete <strong>{confirmDelete?.title}</strong>? This will remove its
          curriculum and all associated tasks. This action cannot be undone.
        </p>
      </Modal>
    </>
  );
}

function CourseWizard({
  open,
  onClose,
  course,
  setCourse,
  instructors,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  course: Course;
  setCourse: (c: Course) => void;
  instructors: ReturnType<typeof useAdminStore.getState>['instructors'];
  onSave: () => void;
}) {
  const [tab, setTab] = useState<'basic' | 'pricing' | 'media' | 'instructor'>('basic');
  const tabs = [
    { id: 'basic' as const, label: 'Basic Details' },
    { id: 'pricing' as const, label: 'Pricing' },
    { id: 'media' as const, label: 'Media' },
    { id: 'instructor' as const, label: 'Instructor' },
  ];
  const upd = (patch: Partial<Course>) => setCourse({ ...course, ...patch });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={course.title ? `Edit: ${course.title}` : 'Create New Course'}
      subtitle="Configure course details across four sections"
      size="lg"
      footer={
        <>
          <button className="btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={onSave} disabled={!course.title}>
            <Check size={16} /> Save Course
          </button>
        </>
      }
    >
      {/* Tabs */}
      <div className="mb-5 flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 dark:bg-ink-700/60">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${
              tab === t.id
                ? 'bg-white text-coral-600 shadow-sm dark:bg-ink-800 dark:text-coral-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'basic' && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <label className="label">Course Title</label>
            <input className="input" value={course.title} onChange={(e) => upd({ title: e.target.value })} placeholder="e.g. Java Backend Development" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="input" value={course.category} onChange={(e) => upd({ category: e.target.value as CourseCategory })}>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Level</label>
              <select className="input" value={course.level} onChange={(e) => upd({ level: e.target.value as CourseLevel })}>
                {levels.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <Toggle label="Certificate eligible" checked={course.certificate} onChange={(v) => upd({ certificate: v })} />
            <Toggle label="Assessments enabled" checked={course.assessmentsEnabled} onChange={(v) => upd({ assessmentsEnabled: v })} />
          </div>
        </div>
      )}

      {tab === 'pricing' && (
        <div className="space-y-4 animate-fade-in">
          <Toggle label="Free course" checked={course.free} onChange={(v) => upd({ free: v, price: v ? 0 : course.price })} />
          {!course.free && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Standard Price (Rwf)</label>
                  <input type="number" className="input" value={course.price} onChange={(e) => upd({ price: +e.target.value })} />
                </div>
                <div>
                  <label className="label">Discount Price (optional)</label>
                  <input type="number" className="input" value={course.discountPrice ?? ''} onChange={(e) => upd({ discountPrice: e.target.value ? +e.target.value : undefined })} />
                </div>
              </div>
              <div className="rounded-xl bg-coral-50 p-3 text-sm text-coral-700 dark:bg-coral-500/10 dark:text-coral-300">
                Students pay: <strong>{formatRwf(course.discountPrice ?? course.price)}</strong>
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'media' && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <label className="label">Thumbnail URL</label>
            <input className="input" value={course.thumbnail} onChange={(e) => upd({ thumbnail: e.target.value })} placeholder="https://…" />
          </div>
          {course.thumbnail && (
            <img src={course.thumbnail} alt="Preview" className="h-40 w-full rounded-xl object-cover" />
          )}
          <div>
            <label className="label">Promo Video URL (optional)</label>
            <input className="input" value={course.promoVideoUrl ?? ''} onChange={(e) => upd({ promoVideoUrl: e.target.value })} placeholder="https://youtube.com/embed/…" />
          </div>
        </div>
      )}

      {tab === 'instructor' && (
        <div className="space-y-3 animate-fade-in">
          <label className="label">Assign Instructor</label>
          {instructors.map((ins) => (
            <button
              key={ins.id}
              onClick={() => upd({ instructorId: ins.id })}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                course.instructorId === ins.id
                  ? 'border-coral-500 bg-coral-50 dark:bg-coral-500/10'
                  : 'border-slate-200 hover:border-slate-300 dark:border-ink-700 dark:hover:border-ink-600'
              }`}
            >
              <img src={ins.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{ins.name}</p>
                <p className="text-xs text-slate-400">{ins.title}</p>
              </div>
              {course.instructorId === ins.id && <Check size={18} className="text-coral-500" />}
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3"
      type="button"
    >
      <span className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-coral-500' : 'bg-slate-200 dark:bg-ink-600'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
    </button>
  );
}
