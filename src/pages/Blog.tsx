import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, Calendar, ArrowRight } from 'lucide-react';
import { blogPosts } from '@/data/courses';

export default function Blog() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(blogPosts.map((p) => p.category)))],
    []
  );

  const filtered = useMemo(() => {
    return blogPosts.filter((p) => {
      const matchCat = category === 'All' || p.category === category;
      const q = query.toLowerCase();
      const matchQuery =
        !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [query, category]);

  return (
    <>
      <section className="gradient-hero py-16 lg:py-20">
        <div className="container-page text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/90 ring-1 ring-white/15">
            <Calendar className="h-4 w-4 text-accent-400" /> FluentaRise Blog
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-5xl text-balance">
            Insights, tutorials & learning guides
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/75">
            Guidance from our coaches on English fluency, international exams, and software engineering.
          </p>
        </div>
      </section>

      <section className="bg-slate-50 py-12 lg:py-16">
        <div className="container-page">
          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center max-w-2xl mx-auto shadow-sm">
              <Newspaper size={48} className="mx-auto text-slate-300 mb-4" />
              <h2 className="font-display text-xl font-bold text-slate-900">
                No Blog Articles Published Yet
              </h2>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Our educational articles, IELTS tips, and coding guides are currently being prepared. Check back soon for new publications.
              </p>
              <div className="mt-6">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-full gradient-accent px-6 py-2.5 text-sm font-bold text-white shadow-accent hover:opacity-95 transition"
                >
                  Return to Home <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((post) => (
                <div
                  key={post.id}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-cardHover"
                >
                  <img
                    src={post.image}
                    alt={post.title}
                    className="aspect-[16/10] w-full object-cover"
                  />
                  <div className="flex flex-1 flex-col p-5">
                    <span className="inline-flex w-fit rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                      {post.category}
                    </span>
                    <h3 className="mt-3 text-lg font-bold leading-snug text-brand-900">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">{post.excerpt}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
