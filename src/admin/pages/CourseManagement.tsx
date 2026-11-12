import { useState, useMemo, useEffect } from 'react';
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
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  RefreshCw,
  LayoutGrid,
  Table as TableIcon,
  Sparkles,
  Layers,
  GraduationCap,
  Users,
  Award,
  DollarSign,
  AlertCircle,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useAdminStore, uid } from '../store/adminStore';
import { useAuth } from '../../auth/AuthProvider';
import { PageHeader } from '../components/AdminLayout';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import MediaUploader from '../components/ui/MediaUploader';
import RichTextEditor from '../../components/common/RichTextEditor';
import LectureMaterialsManager from '../../components/common/LectureMaterialsManager';
import { formatRwf } from '../lib/format';
import type { Course, CourseCategory, CourseLevel, Instructor } from '../types';

const categories: CourseCategory[] = [
  'Languages',
  'Programming',
  'Test Prep',
  'Web Development',
  'Professional',
];

const levels: CourseLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

const thumbnailPresets = [
  {
    label: 'English / Languages',
    url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80',
  },
  {
    label: 'Software / Coding',
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
  },
  {
    label: 'Web Development',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
  },
  {
    label: 'Exam Prep / IELTS',
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
  },
  {
    label: 'Business / Professional',
    url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
  },
];

const blankCourse: Course = {
  id: '',
  title: '',
  category: 'Programming',
  level: 'Beginner',
  price: 50000,
  free: false,
  thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
  instructorId: '',
  published: false,
  certificate: true,
  assessmentsEnabled: true,
  lessonsCount: 0,
  tasksCount: 0,
  studentsCount: 0,
  rating: 5.0,
  revenue: 0,
  createdAt: new Date().toISOString(),
  curriculum: [],
  shortDescription: '',
  overview: '',
};

export default function CourseManagement() {
  const {
    courses,
    instructors,
    addCourse,
    updateCourse,
    deleteCourse,
    toggleCoursePublished,
    syncFromSupabase,
    addInstructor,
  } = useAdminStore();

  const { allUsers } = useAuth();

  const [query, setQuery] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<
    'newest' | 'title' | 'price-asc' | 'price-desc' | 'lessons' | 'students'
  >('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Course | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: 'success' | 'info' | 'error';
  } | null>(null);

  // Auto-sync on component mount
  useEffect(() => {
    syncFromSupabase();
  }, [syncFromSupabase]);

  const showToast = (message: string, tone: 'success' | 'info' | 'error' = 'success') => {
    setFeedback({ message, tone });
    setTimeout(() => setFeedback(null), 4500);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncFromSupabase();
    setIsSyncing(false);
    showToast('Courses synchronized with Supabase database.', 'info');
  };

  // Metrics
  const stats = useMemo(() => {
    const total = courses.length;
    const published = courses.filter((c) => c.published).length;
    const drafts = total - published;
    const totalStudents = courses.reduce((sum, c) => sum + (c.studentsCount || 0), 0);
    const totalLessons = courses.reduce((sum, c) => sum + (c.lessonsCount || 0), 0);
    return { total, published, drafts, totalStudents, totalLessons };
  }, [courses]);

  // Combined Instructors from instructors store and user accounts with role instructor/admin
  const combinedInstructors = useMemo(() => {
    const list: { id: string; name: string; title: string; avatar: string }[] = instructors.map(
      (i) => ({
        id: i.id,
        name: i.name,
        title: i.title,
        avatar: i.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(i.name),
      })
    );

    for (const u of allUsers) {
      if ((u.role === 'instructor' || u.role === 'super_admin') && !list.some((i) => i.id === u.id)) {
        list.push({
          id: u.id,
          name: u.name,
          title: u.headline || (u.role === 'super_admin' ? 'Academy Director' : 'Lead Instructor'),
          avatar: u.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(u.name),
        });
      }
    }

    return list;
  }, [instructors, allUsers]);

  // Filtered & Sorted Courses
  const filtered = useMemo(() => {
    let result = courses.filter((c) => {
      const matchCat = filterCat === 'all' || c.category === filterCat;
      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'published' && c.published) ||
        (filterStatus === 'draft' && !c.published);
      const matchLevel = filterLevel === 'all' || c.level === filterLevel;
      const q = query.toLowerCase().trim();
      const matchQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (c.shortDescription && c.shortDescription.toLowerCase().includes(q));

      return matchCat && matchStatus && matchLevel && matchQuery;
    });

    switch (sortBy) {
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'price-asc':
        result.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
        break;
      case 'price-desc':
        result.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
        break;
      case 'lessons':
        result.sort((a, b) => (b.lessonsCount || 0) - (a.lessonsCount || 0));
        break;
      case 'students':
        result.sort((a, b) => (b.studentsCount || 0) - (a.studentsCount || 0));
        break;
      case 'newest':
      default:
        result.sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        break;
    }

    return result;
  }, [courses, query, filterCat, filterStatus, filterLevel, sortBy]);

  const openNew = () => {
    const defaultInstructorId = combinedInstructors[0]?.id || 'ins_director';
    setEditing({
      ...blankCourse,
      id: uid('course'),
      instructorId: defaultInstructorId,
      createdAt: new Date().toISOString(),
    });
    setModalOpen(true);
  };

  const openEdit = (c: Course) => {
    setEditing({ ...c });
    setModalOpen(true);
  };

  const handleDuplicate = (c: Course) => {
    const cloned: Course = {
      ...c,
      id: uid('course'),
      title: `${c.title} (Copy)`,
      published: false,
      studentsCount: 0,
      createdAt: new Date().toISOString(),
    };
    addCourse(cloned);
    showToast(`Created duplicate copy of "${c.title}" as draft.`, 'success');
  };

  const handleTogglePublish = (c: Course) => {
    toggleCoursePublished(c.id);
    showToast(
      c.published
        ? `"${c.title}" moved to drafts.`
        : `"${c.title}" published! Live on website catalog.`,
      c.published ? 'info' : 'success'
    );
  };

  const saveCourse = async () => {
    if (!editing || !editing.title.trim()) {
      showToast('Please enter a course title.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const exists = courses.some((c) => c.id === editing.id);
      if (exists) {
        updateCourse(editing.id, editing);
        showToast(`Course "${editing.title}" updated successfully!`, 'success');
      } else {
        addCourse(editing);
        showToast(`New course "${editing.title}" created successfully!`, 'success');
      }
      setModalOpen(false);
      setEditing(null);
    } catch {
      showToast('Failed to save course. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (confirmDelete) {
      deleteCourse(confirmDelete.id);
      showToast(`Course "${confirmDelete.title}" has been deleted.`, 'info');
      setConfirmDelete(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Course Management"
        subtitle="Create, configure, publish and manage courses on FluentaRise Academy"
        icon={<BookOpen size={20} />}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-ink-700 dark:bg-ink-800 dark:text-slate-200"
              title="Sync latest from Supabase"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin text-sky-600' : ''} />
              <span>{isSyncing ? 'Syncing…' : 'Sync DB'}</span>
            </button>
            <button className="btn-primary" onClick={openNew}>
              <Plus size={16} /> New Course
            </button>
          </div>
        }
      />

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`mb-5 flex items-center justify-between gap-3 rounded-xl p-4 text-sm font-medium transition-all ${
            feedback.tone === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
              : feedback.tone === 'error'
              ? 'border border-rose-200 bg-rose-50 text-rose-800'
              : 'border border-sky-200 bg-sky-50 text-sky-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.tone === 'success' ? (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-sky-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Metrics Banner */}
      <div className="mb-6 grid grid-cols-2 gap-3.5 sm:grid-cols-5">
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Courses
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white">
            {stats.total}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            Published Live
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-emerald-600">
            {stats.published}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Drafts</p>
          <p className="mt-1 font-display text-2xl font-bold text-amber-600">{stats.drafts}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-600">
            Total Enrolled
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-sky-600">
            {stats.totalStudents}
          </p>
        </div>
        <div className="card p-4 col-span-2 sm:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Curriculum Lessons
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-indigo-600">
            {stats.totalLessons}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card mb-6 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-10 pr-9"
              placeholder="Search by course title, category, keywords…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-ink-700/60">
            <button
              onClick={() => setFilterStatus('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                filterStatus === 'all'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-ink-800 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              All ({courses.length})
            </button>
            <button
              onClick={() => setFilterStatus('published')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                filterStatus === 'published'
                  ? 'bg-white text-emerald-600 shadow-sm dark:bg-ink-800 dark:text-emerald-400'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Published ({stats.published})
            </button>
            <button
              onClick={() => setFilterStatus('draft')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                filterStatus === 'draft'
                  ? 'bg-white text-amber-600 shadow-sm dark:bg-ink-800 dark:text-amber-400'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Drafts ({stats.drafts})
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            className="input lg:w-44"
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Level Dropdown */}
          <select
            className="input lg:w-36"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
          >
            <option value="all">All levels</option>
            {levels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <select
            className="input lg:w-44"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="newest">Newest first</option>
            <option value="title">Title (A-Z)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="lessons">Most Lessons</option>
            <option value="students">Most Students</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 border-l border-slate-200 pl-3 dark:border-ink-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg p-2 transition ${
                viewMode === 'grid'
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Grid Card View"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`rounded-lg p-2 transition ${
                viewMode === 'table'
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Table List View"
            >
              <TableIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Courses Display */}
      {filtered.length === 0 ? (
        <div className="card p-14 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-ink-700 dark:text-brand-400">
            <BookOpen size={32} />
          </div>
          <h3 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">
            {courses.length === 0 ? 'No courses created yet' : 'No courses match your filters'}
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
            {courses.length === 0
              ? 'Get started by creating your first course. Configure the syllabus, pricing, and instructors.'
              : 'Try clearing your search query or selecting a different category filter.'}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            {courses.length === 0 ? (
              <button className="btn-primary" onClick={openNew}>
                <Plus size={16} /> Create First Course
              </button>
            ) : (
              <button
                className="btn-outline"
                onClick={() => {
                  setQuery('');
                  setFilterCat('all');
                  setFilterStatus('all');
                  setFilterLevel('all');
                }}
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => {
            const ins = combinedInstructors.find((i) => i.id === c.instructorId);
            return (
              <div
                key={c.id}
                className="card group flex flex-col overflow-hidden transition-all duration-300 hover:shadow-cardHover border border-slate-200/80 dark:border-ink-700"
              >
                {/* Thumbnail Header */}
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                  <img
                    src={c.thumbnail}
                    alt={c.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute left-3 top-3 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm backdrop-blur ${
                        c.published
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-amber-500/90 text-white'
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      {c.published ? 'Published' : 'Draft'}
                    </span>
                    <span className="rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
                      {c.category}
                    </span>
                  </div>

                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-lg bg-white/95 px-2 py-1 text-xs font-bold text-slate-800 shadow backdrop-blur">
                    <Star size={13} className="text-amber-500 fill-amber-500" />
                    <span>{c.rating ? c.rating.toFixed(1) : '5.0'}</span>
                  </div>

                  {/* Bottom Image Info */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-display text-base font-bold leading-snug line-clamp-1">
                      {c.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-300">
                      <span>{ins?.name || 'Academy Staff'}</span>
                      <span>•</span>
                      <span>{c.level}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col p-5">
                  {c.shortDescription && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 dark:text-slate-400">
                      {c.shortDescription}
                    </p>
                  )}

                  {/* Course Stats */}
                  <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-2.5 text-center dark:bg-ink-700/50">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase">Lessons</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">
                        {c.lessonsCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase">Tasks</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">
                        {c.tasksCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase">Students</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">
                        {c.studentsCount}
                      </p>
                    </div>
                  </div>

                  {/* Pricing row */}
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      {c.free ? (
                        <span className="font-display text-lg font-extrabold text-emerald-600">
                          Free
                        </span>
                      ) : (
                        <div className="flex items-baseline gap-2">
                          <span className="font-display text-lg font-extrabold text-slate-900 dark:text-white">
                            {formatRwf(c.discountPrice ?? c.price)}
                          </span>
                          {c.discountPrice && (
                            <span className="text-xs text-slate-400 line-through">
                              {formatRwf(c.price)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {c.certificate && (
                        <span
                          className="rounded-lg bg-sky-50 px-2 py-1 text-[11px] font-bold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
                          title="Completion certificate enabled"
                        >
                          Cert
                        </span>
                      )}
                      {c.assessmentsEnabled && (
                        <span
                          className="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          title="Assessments enabled"
                        >
                          Quiz
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 dark:border-ink-700">
                    <Link
                      to={`/admin/courses/${c.id}/curriculum`}
                      className="btn-outline flex-1 !py-2 text-xs font-bold"
                    >
                      <ListTree size={14} /> Curriculum
                    </Link>

                    {c.published && (
                      <Link
                        to={`/courses/${c.id}`}
                        target="_blank"
                        className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 hover:text-sky-600 transition dark:border-ink-700 dark:hover:bg-ink-700"
                        title="View on Public Website"
                      >
                        <ExternalLink size={15} />
                      </Link>
                    )}

                    <button
                      onClick={() => handleTogglePublish(c)}
                      className={`rounded-xl border p-2 transition ${
                        c.published
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-emerald-600 dark:border-ink-700'
                      }`}
                      title={c.published ? 'Unpublish Course' : 'Publish Course'}
                    >
                      {c.published ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>

                    <button
                      onClick={() => openEdit(c)}
                      className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-700 transition dark:border-ink-700 dark:hover:bg-ink-700"
                      title="Edit Course"
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      onClick={() => handleDuplicate(c)}
                      className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition dark:border-ink-700 dark:hover:bg-ink-700"
                      title="Duplicate / Clone Course"
                    >
                      <Copy size={15} />
                    </button>

                    <button
                      onClick={() => setConfirmDelete(c)}
                      className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition dark:border-ink-700 dark:hover:bg-ink-700"
                      title="Delete Course"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-ink-700 dark:bg-ink-700/50">
              <tr>
                <th className="py-3.5 px-4">Course</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Level</th>
                <th className="py-3.5 px-3">Instructor</th>
                <th className="py-3.5 px-3">Price</th>
                <th className="py-3.5 px-3 text-center">Lessons</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-ink-700">
              {filtered.map((c) => {
                const ins = combinedInstructors.find((i) => i.id === c.instructorId);
                return (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/80 transition dark:hover:bg-ink-700/40"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.thumbnail}
                          alt=""
                          className="h-12 w-16 rounded-lg object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-xs dark:text-white">
                            {c.title}
                          </p>
                          <p className="text-xs text-slate-400">ID: {c.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-ink-700 dark:text-slate-300">
                        {c.category}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-300">
                      {c.level}
                    </td>

                    <td className="py-3 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {ins?.name || 'Unassigned'}
                    </td>

                    <td className="py-3 px-3">
                      {c.free ? (
                        <span className="text-xs font-bold text-emerald-600">Free</span>
                      ) : (
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {formatRwf(c.discountPrice ?? c.price)}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center text-xs font-bold text-slate-700 dark:text-slate-300">
                      {c.lessonsCount}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleTogglePublish(c)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition ${
                          c.published
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            c.published ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        {c.published ? 'Published' : 'Draft'}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/courses/${c.id}/curriculum`}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-700 transition"
                          title="Curriculum Builder"
                        >
                          <ListTree size={16} />
                        </Link>
                        <button
                          onClick={() => openEdit(c)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-700 transition"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDuplicate(c)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition"
                          title="Duplicate"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(c)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT COURSE WIZARD MODAL */}
      {editing && (
        <CourseWizardModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          course={editing}
          setCourse={setEditing}
          instructors={combinedInstructors}
          onSave={saveCourse}
          isSaving={isSaving}
          onQuickAddInstructor={(name, title) => {
            const newId = `ins_${Date.now()}`;
            const newIns: Instructor = {
              id: newId,
              name,
              title,
              bio: '',
              avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
              email: `${name.toLowerCase().replace(/\s+/g, '.')}@fluentarise.com`,
              courseIds: [],
              rating: 5.0,
              students: 0,
            };
            addInstructor(newIns);
            setEditing({ ...editing, instructorId: newId });
            showToast(`Added instructor "${name}"`, 'success');
          }}
        />
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete Course"
        size="sm"
        footer={
          <>
            <button className="btn-outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </button>
            <button className="btn-danger" onClick={handleDeleteConfirm}>
              <Trash2 size={16} /> Permanently Delete
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to permanently delete{' '}
            <strong className="text-slate-900 dark:text-white font-bold">
              {confirmDelete?.title}
            </strong>
            ?
          </p>
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            <strong>Warning:</strong> This will also remove the course and its syllabus from the
            Supabase database and public website catalog.
          </div>
        </div>
      </Modal>
    </>
  );
}

// ----------------------------------------------------------------------
// COURSE WIZARD MODAL COMPONENT
// ----------------------------------------------------------------------

interface CourseWizardProps {
  open: boolean;
  onClose: () => void;
  course: Course;
  setCourse: (c: Course) => void;
  instructors: { id: string; name: string; title: string; avatar: string }[];
  onSave: () => void;
  isSaving: boolean;
  onQuickAddInstructor: (name: string, title: string) => void;
}

function CourseWizardModal({
  open,
  onClose,
  course,
  setCourse,
  instructors,
  onSave,
  isSaving,
  onQuickAddInstructor,
}: CourseWizardProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'media' | 'materials' | 'instructor'>('basic');
  const [showAddInstructor, setShowAddInstructor] = useState(false);
  const [newInsName, setNewInsName] = useState('');
  const [newInsTitle, setNewInsTitle] = useState('Senior Lecturer');

  const upd = (patch: Partial<Course>) => setCourse({ ...course, ...patch });

  const tabs = [
    { id: 'basic' as const, label: '1. Basic Details' },
    { id: 'pricing' as const, label: '2. Pricing' },
    { id: 'media' as const, label: '3. Media' },
    { id: 'materials' as const, label: '4. Notes & Documents' },
    { id: 'instructor' as const, label: '5. Instructor' },
  ];

  const handleCreateInstructor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInsName.trim()) return;
    onQuickAddInstructor(newInsName.trim(), newInsTitle.trim());
    setNewInsName('');
    setShowAddInstructor(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={course.id && course.title ? `Edit Course: ${course.title}` : 'Create New Course'}
      subtitle="Configure course parameters, pricing, media, and instructor assignment"
      size="lg"
      footer={
        <>
          <button className="btn-outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={onSave}
            disabled={!course.title.trim() || isSaving}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <RefreshCw size={15} className="animate-spin" /> Saving to Supabase…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Check size={16} /> Save Course
              </span>
            )}
          </button>
        </>
      }
    >
      {/* Wizard Tabs */}
      <div className="mb-6 flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 dark:bg-ink-700/60">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 rounded-lg py-2.5 px-3 text-xs font-bold transition ${
              activeTab === t.id
                ? 'bg-white text-brand-800 shadow-sm dark:bg-ink-800 dark:text-brand-300'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: BASIC DETAILS */}
      {activeTab === 'basic' && (
        <div className="space-y-4">
          <div>
            <label className="label">Course Title *</label>
            <input
              required
              className="input font-semibold"
              value={course.title}
              onChange={(e) => upd({ title: e.target.value })}
              placeholder="e.g. Advanced Java & Spring Boot Mastery"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Subject Category</label>
              <select
                className="input"
                value={course.category}
                onChange={(e) => upd({ category: e.target.value as CourseCategory })}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Target Proficiency Level</label>
              <select
                className="input"
                value={course.level}
                onChange={(e) => upd({ level: e.target.value as CourseLevel })}
              >
                {levels.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Short Headline Summary (1-2 sentences)</label>
            <input
              className="input"
              value={course.shortDescription || ''}
              onChange={(e) => upd({ shortDescription: e.target.value })}
              placeholder="e.g. Build enterprise-ready applications with microservices and containerization."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-3.5 hover:bg-slate-50 transition dark:border-ink-700">
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  Completion Certificate
                </p>
                <p className="text-xs text-slate-400">Award students a certificate upon completion</p>
              </div>
              <input
                type="checkbox"
                checked={course.certificate}
                onChange={(e) => upd({ certificate: e.target.checked })}
                className="h-5 w-5 rounded text-brand-600 focus:ring-brand-500"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-3.5 hover:bg-slate-50 transition dark:border-ink-700">
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  Assessments & Quizzes
                </p>
                <p className="text-xs text-slate-400">Enable tests and grading in syllabus</p>
              </div>
              <input
                type="checkbox"
                checked={course.assessmentsEnabled}
                onChange={(e) => upd({ assessmentsEnabled: e.target.checked })}
                className="h-5 w-5 rounded text-brand-600 focus:ring-brand-500"
              />
            </label>
          </div>
        </div>
      )}

      {/* TAB 2: PRICING */}
      {activeTab === 'pricing' && (
        <div className="space-y-4">
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4 hover:bg-slate-50 transition dark:border-ink-700">
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">Free Course</p>
              <p className="text-xs text-slate-400">Make this course free for all enrolled students</p>
            </div>
            <input
              type="checkbox"
              checked={course.free}
              onChange={(e) =>
                upd({ free: e.target.checked, price: e.target.checked ? 0 : course.price || 50000 })
              }
              className="h-5 w-5 rounded text-brand-600 focus:ring-brand-500"
            />
          </label>

          {!course.free && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Regular Price (Rwf) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      className="input font-semibold"
                      value={course.price}
                      onChange={(e) => upd({ price: Math.max(0, +e.target.value) })}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      Rwf
                    </span>
                  </div>
                </div>

                <div>
                  <label className="label">Discounted / Offer Price (Optional)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      className="input font-semibold"
                      value={course.discountPrice ?? ''}
                      onChange={(e) =>
                        upd({
                          discountPrice: e.target.value ? Math.max(0, +e.target.value) : undefined,
                        })
                      }
                      placeholder="Leave blank for regular price"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      Rwf
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Preview Card */}
              <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-4 text-sm text-brand-900 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-200">
                <div className="flex items-center justify-between">
                  <span>Student Checkout Price:</span>
                  <span className="font-display text-xl font-extrabold text-brand-800 dark:text-brand-300">
                    {formatRwf(course.discountPrice ?? course.price)}
                  </span>
                </div>
                {course.discountPrice && course.discountPrice < course.price && (
                  <p className="mt-1 text-xs text-brand-700 dark:text-brand-400">
                    Saves student {formatRwf(course.price - course.discountPrice)} (
                    {Math.round((1 - course.discountPrice / course.price) * 100)}% discount)
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MEDIA & OVERVIEW */}
      {activeTab === 'media' && (
        <div className="space-y-5">
          <MediaUploader
            type="image"
            label="Course Thumbnail Image *"
            helperText="Upload an image from your computer (PNG, JPG, WEBP) or paste a web URL. Max size: 5 MB."
            value={course.thumbnail}
            onChange={(url) => upd({ thumbnail: url })}
            folder="thumbnails"
          />

          {/* Quick preset selector */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Or pick a curated image preset:
            </p>
            <div className="flex flex-wrap gap-2">
              {thumbnailPresets.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => upd({ thumbnail: preset.url })}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                    course.thumbnail === preset.url
                      ? 'border-brand-600 bg-brand-50 text-brand-800'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <MediaUploader
            type="video"
            label="Promo Video (Teaser / Preview)"
            helperText="Upload an MP4/WebM video from your computer (Max 50 MB) or paste a YouTube embed link."
            value={course.promoVideoUrl ?? ''}
            onChange={(url) => upd({ promoVideoUrl: url })}
            folder="videos"
            placeholder="https://www.youtube.com/embed/… or video storage URL"
          />

        </div>
      )}

      {/* TAB 4: NOTES & DOCUMENTS */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          <RichTextEditor
            label="In-depth Course Syllabus & Notes"
            helperText="Provide structured lecture modules, reading schedule, or sketch diagrams"
            value={course.overview || ''}
            onChange={(html) => upd({ overview: html })}
            placeholder="Write full syllabus notes, prerequisites, cohort expectations, or draw diagrams…"
            minHeight="220px"
          />

          <LectureMaterialsManager
            materials={course.materials || []}
            onChange={(mats) => upd({ materials: mats })}
            label="Course Handbooks & Materials (PDF, Word, Slides)"
            helperText="Upload course-wide syllabus, cheat sheets, or downloadable reference documents for students"
          />
        </div>
      )}

      {/* TAB 4: INSTRUCTOR */}
      {activeTab === 'instructor' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="label mb-0">Assigned Instructor *</label>
            <button
              type="button"
              onClick={() => setShowAddInstructor(!showAddInstructor)}
              className="text-xs font-bold text-brand-700 hover:text-brand-900 transition flex items-center gap-1"
            >
              <Plus size={14} /> {showAddInstructor ? 'Cancel' : 'Quick Add Instructor'}
            </button>
          </div>

          {/* Quick Add Instructor Form */}
          {showAddInstructor && (
            <form
              onSubmit={handleCreateInstructor}
              className="rounded-xl border border-brand-200 bg-brand-50/50 p-4 space-y-3"
            >
              <p className="text-xs font-bold text-brand-900 uppercase">New Instructor Profile</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  required
                  placeholder="Full Name (e.g. Dr. Aline Uwase)"
                  value={newInsName}
                  onChange={(e) => setNewInsName(e.target.value)}
                  className="input !bg-white"
                />
                <input
                  placeholder="Title (e.g. Lead English Coach)"
                  value={newInsTitle}
                  onChange={(e) => setNewInsTitle(e.target.value)}
                  className="input !bg-white"
                />
              </div>
              <button type="submit" className="btn-primary !py-2 text-xs">
                Save & Assign Instructor
              </button>
            </form>
          )}

          {/* Instructors list */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 max-h-72 overflow-y-auto pr-1">
            {instructors.map((ins) => {
              const selected = course.instructorId === ins.id;
              return (
                <button
                  type="button"
                  key={ins.id}
                  onClick={() => upd({ instructorId: ins.id })}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                    selected
                      ? 'border-brand-600 bg-brand-50/80 ring-2 ring-brand-200 dark:bg-brand-900/30'
                      : 'border-slate-200 hover:border-slate-300 dark:border-ink-700'
                  }`}
                >
                  <img
                    src={ins.avatar}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                      {ins.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate dark:text-slate-400">
                      {ins.title}
                    </p>
                  </div>
                  {selected && <Check size={18} className="text-brand-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          {instructors.length === 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-xs text-amber-800">
              No instructors found. Click <strong>Quick Add Instructor</strong> above to add one.
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
