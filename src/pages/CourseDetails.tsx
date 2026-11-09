import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  Clock, PlayCircle, CheckCircle2, ChevronDown, ShoppingCart, Users, Star,
  BookOpen, Award, Languages, FileQuestion, BarChart3, ArrowRight, Play,
} from 'lucide-react';
import { getCourseBySlug, getInstructor, courses, formatRwf } from '@/data/courses';
import { useCart } from '@/store/cart';
import { useToast } from '@/store/toast';
import StarRating from '@/components/ui/StarRating';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import CourseCard from '@/components/ui/CourseCard';

type Tab = 'information' | 'curriculum' | 'instructor' | 'reviews';

export default function CourseDetails() {
  const { courseId } = useParams<{ courseId: string }>();
  const course = courseId ? getCourseBySlug(courseId) : undefined;
  const [tab, setTab] = useState<Tab>('information');
  const [previewLecture, setPreviewLecture] = useState<string | null>(null);

  if (!course) return <Navigate to="/courses" replace />;

  const instructor = getInstructor(course.instructorId);
  const add = useCart((s) => s.add);
  const inCart = useCart((s) => s.has(course.id));
  const push = useToast((s) => s.push);

  const handleAdd = () => {
    const added = add(course);
    if (added) push(`${course.title} added to cart`, 'success');
    else push('This course is already in your cart', 'info');
  };

  const related = courses.filter((c) => c.category === course.category && c.id !== course.id).slice(0, 3);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'information', label: 'Information' },
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'instructor', label: 'Instructor' },
    { id: 'reviews', label: 'Reviews' },
  ];

  // rating breakdown
  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = course.reviewList.filter((r) => Math.round(r.rating) === star).length;
    const pct = course.reviewList.length ? (count / course.reviewList.length) * 100 : 0;
    return { star, count, pct };
  });

  return (
    <>
      {/* Hero header */}
      <section className="gradient-hero py-10 lg:py-14">
        <div className="container-page">
          <Breadcrumbs
            items={[
              { label: 'Home', to: '/' },
              { label: 'Courses', to: '/courses' },
              { label: course.title },
            ]}
          />
          <div className="mt-6 grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/15">
                {course.category}
              </span>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-4xl text-balance">
                {course.title}
              </h1>
              <p className="mt-3 max-w-2xl text-white/75">{course.shortDescription}</p>

              <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <StarRating rating={course.rating} size="md" showValue />
                  <span className="text-white/60">({course.reviewsCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> {course.students.toLocaleString()} students
                </div>
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4" /> {course.level}
                </div>
              </div>

              {instructor && (
                <div className="mt-5 flex items-center gap-3">
                  <img src={instructor.photo} alt={instructor.name} className="h-11 w-11 rounded-full object-cover ring-2 ring-white/20" />
                  <div>
                    <p className="text-xs text-white/60">Created by</p>
                    <p className="text-sm font-semibold text-white">{instructor.name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="bg-slate-50 py-12 lg:py-16">
        <div className="container-page grid gap-8 lg:grid-cols-3">
          {/* Left: tabs */}
          <div className="lg:col-span-2">
            {/* tab buttons */}
            <div className="flex flex-wrap gap-1 rounded-xl bg-white p-1.5 shadow-card">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                    tab === t.id ? 'gradient-brand text-white shadow-brand' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-white p-6 shadow-card sm:p-8 animate-fade-in">
              {tab === 'information' && <InformationTab course={course} />}
              {tab === 'curriculum' && <CurriculumTab course={course} onPreview={setPreviewLecture} />}
              {tab === 'instructor' && instructor && <InstructorTab instructor={instructor} />}
              {tab === 'reviews' && <ReviewsTab course={course} breakdown={breakdown} />}
            </div>
          </div>

          {/* Right: sticky sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              <SidebarCard
                course={course}
                inCart={inCart}
                onAdd={handleAdd}
              />
              <RelatedCourses courses={related} />
            </div>
          </div>
        </div>
      </section>

      {/* Preview modal */}
      {previewLecture && (
        <PreviewModal title={previewLecture} onClose={() => setPreviewLecture(null)} />
      )}
    </>
  );
}

function InformationTab({ course }: { course: ReturnType<typeof getCourseBySlug> }) {
  if (!course) return null;
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-bold text-brand-900">Course Overview</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{course.overview}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h4 className="text-base font-bold text-brand-900">What you'll learn</h4>
          <ul className="mt-3 space-y-2.5">
            {course.takeaways.map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-base font-bold text-brand-900">Learning outcomes</h4>
          <ul className="mt-3 space-y-2.5">
            {course.outcomes.map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h4 className="text-base font-bold text-brand-900">Requirements</h4>
        <ul className="mt-3 space-y-2.5">
          {course.requirements.map((t) => (
            <li key={t} className="flex items-start gap-2.5 text-sm text-slate-700">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" /> {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CurriculumTab({ course, onPreview }: { course: ReturnType<typeof getCourseBySlug>; onPreview: (title: string) => void }) {
  const [open, setOpen] = useState<string | null>(course?.curriculum[0]?.id ?? null);

  if (!course) return null;
  const totalLectures = course.curriculum.reduce((sum, s) => sum + s.lectures.length, 0);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-brand-900">Curriculum</h3>
        <p className="text-sm text-slate-500">{course.curriculum.length} sections · {totalLectures} lectures</p>
      </div>
      <div className="mt-5 space-y-3">
        {course.curriculum.map((section, i) => {
          const isOpen = open === section.id;
          return (
            <div key={section.id} className="rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? null : section.id)}
                className="flex w-full items-center justify-between gap-3 bg-slate-50 px-5 py-4 text-left transition hover:bg-slate-100"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg gradient-brand text-xs font-bold text-white">{i + 1}</span>
                  <span className="text-sm font-bold text-brand-900">{section.title}</span>
                </span>
                <span className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{section.lectures.length} lectures</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </span>
              </button>
              {isOpen && (
                <ul className="divide-y divide-slate-100 animate-slide-down">
                  {section.lectures.map((lec) => (
                    <li key={lec.id} className="flex items-center justify-between gap-3 px-5 py-3">
                      <span className="flex items-center gap-3 text-sm text-slate-700">
                        <PlayCircle className="h-4 w-4 text-slate-400" />
                        {lec.title}
                      </span>
                      <span className="flex items-center gap-3">
                        {lec.preview && (
                          <button
                            onClick={() => onPreview(lec.title)}
                            className="rounded-md bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition"
                          >
                            Preview
                          </button>
                        )}
                        <span className="text-xs font-medium text-slate-400">{lec.duration}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InstructorTab({ instructor }: { instructor: NonNullable<ReturnType<typeof getInstructor>> }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <img src={instructor.photo} alt={instructor.name} className="h-28 w-28 rounded-2xl object-cover shadow-card" />
        <div>
          <h3 className="text-xl font-bold text-brand-900">{instructor.name}</h3>
          <p className="text-sm text-accent-600 font-semibold">{instructor.title}</p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {instructor.rating} rating</span>
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {instructor.students.toLocaleString()} students</span>
            <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> {instructor.coursesCount} courses</span>
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-base font-bold text-brand-900">About</h4>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{instructor.bio}</p>
      </div>
      <div>
        <h4 className="text-base font-bold text-brand-900">Expertise</h4>
        <div className="mt-3 flex flex-wrap gap-2">
          {instructor.expertise.map((e) => (
            <span key={e} className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">{e}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewsTab({ course, breakdown }: { course: ReturnType<typeof getCourseBySlug>; breakdown: { star: number; count: number; pct: number }[] }) {
  if (!course) return null;
  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl bg-brand-50 p-5 text-center">
          <p className="text-4xl font-extrabold text-brand-900">{course.rating.toFixed(1)}</p>
          <StarRating rating={course.rating} size="md" />
          <p className="mt-2 text-xs text-slate-500">{course.reviewsCount} reviews</p>
        </div>
        <div className="sm:col-span-2 space-y-2">
          {breakdown.map((b) => (
            <div key={b.star} className="flex items-center gap-3">
              <span className="flex w-12 items-center gap-1 text-xs font-medium text-slate-600">
                {b.star} <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${b.pct}%` }} />
              </div>
              <span className="w-8 text-right text-xs text-slate-500">{b.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-base font-bold text-brand-900">Student reviews</h4>
        <div className="mt-4 space-y-4">
          {course.reviewList.map((r) => (
            <div key={r.id} className="rounded-xl border border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <img src={r.avatar} alt={r.author} className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-bold text-slate-800">{r.author}</p>
                  <p className="text-xs text-slate-400">{new Date(r.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="ml-auto"><StarRating rating={r.rating} /></div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{r.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SidebarCard({ course, inCart, onAdd }: { course: NonNullable<ReturnType<typeof getCourseBySlug>>; inCart: boolean; onAdd: () => void }) {
  const features = [
    { icon: BookOpen, label: 'Lessons', value: `${course.lessons} lessons` },
    { icon: Clock, label: 'Duration', value: course.duration },
    { icon: Award, label: 'Certificate', value: course.certificate ? 'Included' : 'Not included' },
    { icon: Languages, label: 'Language', value: course.language },
    { icon: FileQuestion, label: 'Assessment', value: course.assessment ? 'Available' : 'N/A' },
    { icon: BarChart3, label: 'Level', value: course.level },
  ];

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card">
      <img src={course.thumbnail} alt={course.title} className="aspect-[16/9] w-full object-cover" />
      <div className="p-6">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-brand-900">{formatRwf(course.price)}</span>
          {course.oldPrice && <span className="text-sm text-slate-400 line-through">{formatRwf(course.oldPrice)}</span>}
        </div>

        <button
          onClick={onAdd}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition ${
            inCart ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'gradient-accent text-white shadow-accent hover:opacity-95'
          }`}
        >
          {inCart ? <><CheckCircle2 className="h-4 w-4" /> Added to Cart</> : <><ShoppingCart className="h-4 w-4" /> Add to Cart</>}
        </button>
        <Link
          to="/contact"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-brand-200 px-5 py-3 text-sm font-bold text-brand-800 hover:bg-brand-50 transition"
        >
          Buy Now <ArrowRight className="h-4 w-4" />
        </Link>

        <div className="mt-6 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">This course includes</p>
          {features.map((f) => (
            <div key={f.label} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-600">
                <f.icon className="h-4 w-4 text-brand-600" /> {f.label}
              </span>
              <span className="font-semibold text-slate-800">{f.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RelatedCourses({ courses: list }: { courses: ReturnType<typeof getCourseBySlug>[] }) {
  if (list.length === 0) return null;
  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <h3 className="text-base font-bold text-brand-900">Related Courses</h3>
      <ul className="mt-4 space-y-4">
        {list.map((c) => c && (
          <li key={c.id}>
            <Link to={`/courses/${c.slug}`} className="group flex gap-3">
              <img src={c.thumbnail} alt={c.title} className="h-14 w-20 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-semibold text-slate-800 group-hover:text-brand-700 transition">{c.title}</p>
                <p className="mt-1 text-xs text-slate-500">{formatRwf(c.price)}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PreviewModal({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl animate-scale-in">
        <div className="flex aspect-video items-center justify-center rounded-xl gradient-hero">
          <div className="text-center">
            <Play className="mx-auto h-14 w-14 text-white/80" />
            <p className="mt-3 text-sm text-white/70">Preview: {title}</p>
            <p className="text-xs text-white/50">This is a demo preview player.</p>
          </div>
        </div>
        <button onClick={onClose} className="mt-4 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
          Close
        </button>
      </div>
    </div>
  );
}
