import { useState } from 'react';
import { Newspaper, Plus, Pencil, Eye, Trash2, Search, Tag } from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { PageHeader } from '../components/AdminLayout';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { formatDate } from '../lib/format';
import type { BlogPost } from '../types';

function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/^(?!<[hul])(.+)$/gm, '<p>$1</p>')
    .replace(/<p><p>/g, '<p>')
    .replace(/<\/p><\/p>/g, '</p>');
}

export default function BlogContent() {
  const { blogPosts } = useAdminStore();
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [preview, setPreview] = useState(false);
  const [deletePost, setDeletePost] = useState<BlogPost | null>(null);

  const filtered = blogPosts.filter((p) => {
    if (query && !p.title.toLowerCase().includes(query.toLowerCase())) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    return true;
  });

  const openNew = () => {
    setEditing({
      id: `b_${Date.now()}`,
      title: '',
      excerpt: '',
      body: '# Title\n\nWrite your article in Markdown…',
      author: 'Amina Uwase',
      tags: [],
      status: 'Draft',
      publishedAt: new Date().toISOString(),
      cover: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80',
    });
    setPreview(false);
  };

  return (
    <>
      <PageHeader
        title="Blog & Content"
        subtitle="Publish academy news and announcements"
        icon={<Newspaper size={20} />}
        actions={
          <button className="btn-primary" onClick={openNew}>
            <Plus size={16} /> New Post
          </button>
        }
      />

      {/* Filters */}
      <div className="card mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-10" placeholder="Search posts…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select className="input sm:w-40" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
        </select>
      </div>

      {/* Posts grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => (
          <div key={p.id} className="card group overflow-hidden transition hover:shadow-card-hover">
            <div className="relative h-36 overflow-hidden">
              <img src={p.cover} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute left-3 top-3">
                <Badge tone={p.status === 'Published' ? 'success' : 'warning'} dot>{p.status}</Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {p.tags.map((t) => (
                  <span key={t} className="chip bg-slate-100 text-slate-500 dark:bg-ink-700 dark:text-slate-400">
                    <Tag size={10} /> {t}
                  </span>
                ))}
              </div>
              <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white line-clamp-2">{p.title}</h3>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{p.excerpt}</p>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-ink-700">
                <div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{p.author}</p>
                  <p className="text-xs text-slate-400">{formatDate(p.publishedAt)}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(p); setPreview(false); }} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-coral-600 dark:border-ink-700">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeletePost(p)} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-error-600 dark:border-ink-700">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-12 text-center">
          <Newspaper size={32} className="mx-auto text-slate-300" />
          <p className="mt-3 text-sm text-slate-400">No posts found.</p>
        </div>
      )}

      {/* Editor modal */}
      {editing && (
        <Modal
          open
          onClose={() => setEditing(null)}
          title={editing.title ? 'Edit Post' : 'New Blog Post'}
          subtitle="Markdown editor for FluentaRise academy news"
          size="xl"
          footer={
            <>
              <button className="btn-outline" onClick={() => setEditing(null)}>Cancel</button>
              <button
                className="btn-outline"
                onClick={() => setEditing({ ...editing, status: 'Draft' })}
              >
                Save Draft
              </button>
              <button
                className="btn-primary"
                disabled={!editing.title}
                onClick={() => setEditing({ ...editing, status: 'Published' })}
              >
                <Plus size={16} /> Publish
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="label">Title</label>
              <input className="input text-base font-semibold" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Article title" />
            </div>
            <div>
              <label className="label">Excerpt</label>
              <input className="input" value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} placeholder="Short summary shown on cards" />
            </div>
            <div>
              <label className="label">Cover Image URL</label>
              <input className="input" value={editing.cover} onChange={(e) => setEditing({ ...editing, cover: e.target.value })} />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="label !mb-0">Body (Markdown)</label>
                <button onClick={() => setPreview((p) => !p)} className="flex items-center gap-1 text-xs font-semibold text-coral-600">
                  <Eye size={12} /> {preview ? 'Edit' : 'Preview'}
                </button>
              </div>
              {preview ? (
                <div className="markdown-preview min-h-[200px] rounded-xl border border-slate-200 bg-white p-4 dark:border-ink-700 dark:bg-ink-900" dangerouslySetInnerHTML={{ __html: renderMarkdown(editing.body) }} />
              ) : (
                <textarea className="input min-h-[200px] font-mono text-xs" value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Author</label>
                <input className="input" value={editing.author} onChange={(e) => setEditing({ ...editing, author: e.target.value })} />
              </div>
              <div>
                <label className="label">Tags (comma separated)</label>
                <input className="input" value={editing.tags.join(', ')} onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} placeholder="IELTS, Study Tips" />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      <Modal
        open={!!deletePost}
        onClose={() => setDeletePost(null)}
        title="Delete post"
        size="sm"
        footer={
          <>
            <button className="btn-outline" onClick={() => setDeletePost(null)}>Cancel</button>
            <button className="btn-danger" onClick={() => setDeletePost(null)}>
              <Trash2 size={16} /> Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">Delete <strong>{deletePost?.title}</strong>?</p>
      </Modal>
    </>
  );
}
