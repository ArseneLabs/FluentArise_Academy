import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import CourseCard from '@/components/ui/CourseCard';
import { courses, getLiveCourses } from '@/data/courses';
import type { CourseCategory } from '@/types';
import SectionHeading from '@/components/ui/SectionHeading';

const categories: (CourseCategory | 'All')[] = [
  'All',
  'English Fluency',
  'Java & OOP',
  'Web Development',
  'Exam Prep',
];

const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

export default function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const initialCategory = (searchParams.get('cat') as CourseCategory | 'All') ?? 'All';

  const [query, setQuery] = useState(initialQuery);
  const [debounced, setDebounced] = useState(initialQuery);
  const [category, setCategory] = useState<CourseCategory | 'All'>(initialCategory);
  const [sort, setSort] = useState('popular');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (debounced) params.q = debounced;
    if (category !== 'All') params.cat = category;
    setSearchParams(params, { replace: true });
  }, [debounced, category, setSearchParams]);

  const filtered = useMemo(() => {
    const live = getLiveCourses();
    const map = new Map<string, (typeof courses)[0]>();
    for (const c of courses) map.set(c.id, c);
    for (const c of live) map.set(c.id, c);
    const combined = Array.from(map.values());

    let list = combined.filter((c) => {
      const matchCat = category === 'All' || c.category === category;
      const q = debounced.toLowerCase();
      const matchQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        (c.shortDescription && c.shortDescription.toLowerCase().includes(q)) ||
        c.category.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });

    switch (sort) {
      case 'price-low':
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      default:
        list = [...list].sort((a, b) => b.students - a.students);
    }
    return list;
  }, [debounced, category, sort]);

  return (
    <>
      {/* Header */}
      <section className="gradient-hero py-14">
        <div className="container-page">
          <SectionHeading
            light
            eyebrow="Course Catalog"
            title="Find your next course"
            subtitle="Browse our full catalog of live and on-demand courses across English, Java, web development and exam prep."
          />
        </div>
      </section>

      {/* Catalog */}
      <section className="bg-slate-50 py-12 lg:py-16">
        <div className="container-page">
          {/* Search + sort */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 lg:max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-slate-400" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category pills */}
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  category === cat
                    ? 'gradient-brand text-white shadow-brand'
                    : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-brand-200 hover:text-brand-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <p className="mt-6 text-sm text-slate-500">
            Showing <span className="font-semibold text-brand-800">{filtered.length}</span> course{filtered.length !== 1 ? 's' : ''}
          </p>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white py-20 px-6 text-center">
              <Search className="h-10 w-10 text-slate-300" />
              <p className="mt-4 text-base font-bold text-slate-800">
                {courses.length === 0 ? 'No courses currently published' : 'No courses found'}
              </p>
              <p className="mt-1 text-sm text-slate-500 max-w-sm">
                {courses.length === 0
                  ? 'Our upcoming cohort terms and curriculum modules are being prepared. Contact our team to join the priority waitlist.'
                  : 'Try a different search term or select another category.'}
              </p>
              {courses.length === 0 ? (
                <a
                  href="/contact"
                  className="mt-5 rounded-full gradient-accent px-6 py-2.5 text-sm font-bold text-white shadow-accent"
                >
                  Contact Admissions
                </a>
              ) : (
                <button
                  onClick={() => { setQuery(''); setCategory('All'); }}
                  className="mt-5 rounded-full gradient-brand px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
