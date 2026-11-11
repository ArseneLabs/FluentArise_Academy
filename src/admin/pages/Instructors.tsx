import { Users, Mail, Star, BookOpen, Plus, Pencil } from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { PageHeader } from '../components/AdminLayout';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { useState } from 'react';
import type { Instructor } from '../types';

export default function Instructors() {
  const { instructors, courses } = useAdminStore();
  const [editing, setEditing] = useState<Instructor | null>(null);

  const getInstructorCourses = (id: string) => courses.filter((c) => c.instructorId === id);

  return (
    <>
      <PageHeader
        title="Instructors"
        subtitle="Manage teaching staff and course assignments"
        icon={<Users size={20} />}
        actions={
          <button className="btn-primary" onClick={() => setEditing({ id: `ins_${Date.now()}`, name: '', title: '', bio: '', avatar: 'https://i.pravatar.cc/120?img=60', email: '', courseIds: [], rating: 0, students: 0 })}>
            <Plus size={16} /> Add Instructor
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {instructors.map((ins) => {
          const insCourses = getInstructorCourses(ins.id);
          return (
            <div key={ins.id} className="card p-5 transition hover:shadow-card-hover">
              <div className="flex items-start gap-4">
                <img src={ins.avatar} alt={ins.name} className="h-16 w-16 rounded-2xl object-cover ring-2 ring-coral-500/20" />
                <div className="flex-1">
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">{ins.name}</h3>
                  <p className="text-sm text-coral-600 dark:text-coral-400">{ins.title}</p>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Star size={12} className="text-amber-500 fill-amber-500" /> {ins.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} /> {ins.students}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen size={12} /> {insCourses.length}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setEditing(ins)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-coral-600 dark:hover:bg-ink-700"
                >
                  <Pencil size={14} />
                </button>
              </div>

              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{ins.bio}</p>

              <div className="mt-4 border-t border-slate-100 pt-3 dark:border-ink-700">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Assigned Courses</p>
                <div className="flex flex-wrap gap-1.5">
                  {insCourses.length > 0 ? (
                    insCourses.map((c) => (
                      <Badge key={c.id} tone="coral">{c.title}</Badge>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No courses assigned</span>
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                <Mail size={12} /> {ins.email}
              </div>
            </div>
          );
        })}
      </div>

      {editing && (
        <Modal
          open
          onClose={() => setEditing(null)}
          title={editing.name ? `Edit: ${editing.name}` : 'Add Instructor'}
          size="md"
          footer={
            <>
              <button className="btn-outline" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn-primary" onClick={() => setEditing(null)} disabled={!editing.name}>
                <Plus size={16} /> Save
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img src={editing.avatar} alt="" className="h-16 w-16 rounded-2xl object-cover" />
              <div className="flex-1">
                <label className="label">Avatar URL</label>
                <input className="input" value={editing.avatar} onChange={(e) => setEditing({ ...editing, avatar: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Name</label>
                <input className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Full name" />
              </div>
              <div>
                <label className="label">Title</label>
                <input className="input" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="e.g. Lead Instructor" />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} placeholder="name@fluentarise.rw" />
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea className="input min-h-[80px]" value={editing.bio} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
