import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, MessageCircle, Clock, ArrowRight, Calendar } from 'lucide-react';
import { blogPosts } from '@/data/courses';
import SectionHeading from '@/components/ui/SectionHeading';

export default function Blog() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const categories = useMemo(() => ['All', ...Array.from(new Set(blogPosts.map((p) => p.category)))], []);

  const filtered = useMemo(() => {
    return blogPosts.filter((p) => {
      const matchCat = category === 'All' || p.category === category;
      const q = query.toLowerCase();
      const matchQuery = !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [query, category]);

  const recent = blogPosts.slice(0, 3);

  return (
    <>
      <section className="gradient-hero py-16 lg:py-20">
        <div className="container-page text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/90 ring-1 ring-white/15">
            <Calendar className="h-4 w-4 text-accent-400" /> FluentaRise Blog
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-5xl text-balance">
            Insights, tips & stories from our community
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/75">
            Learn from our instructors and graduates about English fluency, tech careers and exam prep.
          </p>
        </div>
      </section>

      <section className="bg-slate-50 py-12 lg:py-16">
        <div className="container-page grid gap-8 lg:grid-cols-3">
          {/* Main list */}
          <div className="lg:col-span-2">
            {/* Featured post */}
            {filtered[0] && (
              <Link to="#" className="group mb-8 block overflow-hidden rounded-2xl bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-cardHover">
                <div className="grid sm:grid-cols-2">
                  <img src={filtered[0].image} alt={filtered[0].title} className="h-full w-full object-cover" />
                  <div className="p-6 flex flex-col">
                    <span className="inline-flex w-fit rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-600">{filtered[0].category}</span>
                    <h2 className="mt-3 text-xl font-bold leading-snug text-brand-900 group-hover:text-brand-700 transition">{filtered[0].title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">{filtered[0].excerpt}</p>
                    <div className="mt-auto flex items-center gap-3 pt-4">
                      <img src={filtered[0].authorAvatar} alt={filtered[0].author} className="h-9 w-9 rounded-full object-cover" />
                      <div>
                        <p className="text-xs font-semibold text-slate-700">{filtered[0].author}</p>
                        <p className="text-xs text-slate-400">{new Date(filtered[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Rest */}
            <div className="grid gap-6 sm:grid-cols-2">
              {filtered.slice(1).map((post) => (
                <Link key={post.id} to="#" className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-cardHover">
                  <img src={post.image} alt={post.title} className="aspect-[16/10] w-full object-cover" />
                  <div className="flex flex-1 flex-col p-5">
                    <span className="inline-flex w-fit rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">{post.category}</span>
                    <h3 className="mt-2 line-clamp-2 text-base font-bold leading-snug text-brand-900 group-hover:text-brand-700 transition">{post.title}</h3>
                    <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">{post.excerpt}</p>
                    <div className="mt-auto flex items-center justify-between pt-4 text-xs text-slate-400">
                      <span>{post.author}</span>
                      <span className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {post.views.toLocaleString()}</span>
                        <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {post.comments}</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
                <p className="text-sm font-semibold text-slate-600">No articles found.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Search */}
            <div className="rounded-2xl bg-white p-5 shadow-card">
              <h3 className="text-sm font-bold text-brand-900">Search</h3>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 transition"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="rounded-2xl bg-white p-5 shadow-card">
              <h3 className="text-sm font-bold text-brand-900">Categories</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      category === cat ? 'gradient-brand text-white' : 'bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent posts */}
            <div className="rounded-2xl bg-white p-5 shadow-card">
              <h3 className="text-sm font-bold text-brand-900">Recent Posts</h3>
              <ul className="mt-4 space-y-4">
                {recent.map((p) => (
                  <li key={p.id}>
                    <Link to="#" className="group flex gap-3">
                      <img src={p.image} alt={p.title} className="h-14 w-16 shrink-0 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-semibold text-slate-800 group-hover:text-brand-700 transition">{p.title}</p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400"><Clock className="h-3 w-3" /> {p.readTime} read</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="rounded-2xl gradient-brand p-6 text-white shadow-brand">
              <h3 className="text-lg font-bold">Ready to start learning?</h3>
              <p className="mt-2 text-sm text-white/70">Browse our courses and take the first step today.</p>
              <Link to="/courses" className="mt-4 inline-flex items-center gap-2 rounded-full gradient-accent px-5 py-2.5 text-sm font-bold text-white shadow-accent">
                View Courses <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
