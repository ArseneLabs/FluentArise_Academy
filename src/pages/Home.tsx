import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, PlayCircle, Sparkles, GraduationCap, Users, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { courses, testimonials, partnerLogos, pricingPlans, getLiveCourses } from '@/data/courses';
import { formatRwf } from '@/data/courses';
import CourseCard from '@/components/ui/CourseCard';
import SectionHeading from '@/components/ui/SectionHeading';
import StarRating from '@/components/ui/StarRating';
import { useState, useEffect } from 'react';

const heroImg = 'https://images.pexels.com/photos/5896750/pexels-photo-5896750.jpeg?auto=compress&cs=tinysrgb&w=900';

const features = [
  {
    icon: Users,
    title: 'Live Online English Classes',
    desc: 'Join real-time, interactive English sessions with expert coaches who correct, guide and challenge you every step.',
  },
  {
    icon: BookOpen,
    title: 'Flexible Online Courses',
    desc: 'Learn at your own pace with on-demand lessons, live classes and a schedule that fits around your work and life.',
  },
  {
    icon: Award,
    title: 'Career-Ready Skills',
    desc: 'Every course is built around the skills employers actually hire for — from fluency to full-stack development.',
  },
];

const pillars = [
  { icon: Users, label: 'Live Online Coaching', desc: 'Real-time mentorship & speaking practice' },
  { icon: BookOpen, label: 'Practical Curriculum', desc: 'Hands-on projects and capstone tasks' },
  { icon: ShieldCheck, label: 'Verified Certificates', desc: 'Official completion credentials' },
  { icon: Award, label: 'Flexible Schedules', desc: 'Evening and weekend cohort classes' },
];

export default function Home() {
  const live = getLiveCourses();
  const map = new Map<string, (typeof courses)[0]>();
  for (const c of courses) map.set(c.id, c);
  for (const c of live) map.set(c.id, c);
  const allCourses = Array.from(map.values());
  const popularCourses = allCourses.slice(0, 6);

  return (
    <>
      <Hero />
      <Features />
      <PillarsBanner />
      <PopularCourses courses={popularCourses} />
      <StorySection />
      <PricingSection />
      {testimonials.length > 0 && <TestimonialsSection />}
      {partnerLogos.length > 0 && <PartnersSection />}
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden gradient-hero">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-brand-400/20 blur-3xl" />

      <div className="container-page relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/90 ring-1 ring-white/15">
            <Sparkles className="h-4 w-4 text-accent-400" />
            Elevating Communication & Tech Skills
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl text-balance">
            Take The First Step To{' '}
            <span className="bg-gradient-to-r from-accent-400 to-accent-500 bg-clip-text text-transparent">Knowledge</span>{' '}
            With Us
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/75">
            Live online English classes, flexible tech courses and career-ready training — designed to take you from
            where you are to where you want to be.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 rounded-full gradient-accent px-7 py-3.5 text-base font-bold text-white shadow-accent hover:opacity-95 transition"
            >
              Get Started Now <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-7 py-3.5 text-base font-bold text-white ring-1 ring-white/20 hover:bg-white/15 transition"
            >
              <PlayCircle className="h-5 w-5" /> View Courses
            </Link>
          </div>
        </div>

        <div className="relative animate-fade-in lg:flex lg:justify-end">
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-accent-500/20 blur-2xl" />
            <img
              src={heroImg}
              alt="Student learning with FluentaRise"
              className="relative w-full max-w-md rounded-[2rem] object-cover shadow-2xl ring-1 ring-white/10 animate-float"
            />
            {/* floating card */}
            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl bg-white p-4 shadow-cardHover sm:block">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <GraduationCap className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-base font-extrabold text-brand-900">FluentaRise Academy</p>
                  <p className="text-xs text-slate-500">Live Mentorship & Certifications</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Why FluentaRise"
          title="Learning built around your goals"
          subtitle="Three pillars that make FluentaRise the trusted online learning platform in East Africa."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-slate-100 bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-cardHover"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-brand text-white transition-transform group-hover:scale-110">
                <f.icon className="h-7 w-7" />
              </span>
              <h3 className="mt-5 text-xl font-bold text-brand-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PillarsBanner() {
  return (
    <section className="gradient-brand py-14">
      <div className="container-page grid grid-cols-2 gap-8 lg:grid-cols-4">
        {pillars.map((p) => (
          <div key={p.label} className="text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-accent-300">
              <p.icon size={22} />
            </span>
            <p className="mt-3 font-bold text-white text-base">{p.label}</p>
            <p className="mt-1 text-xs text-white/70">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PopularCourses({ courses: list }: { courses: typeof courses }) {
  return (
    <section className="bg-slate-50 py-16 lg:py-24">
      <div className="container-page">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading
            center={false}
            eyebrow="Courses"
            title="Academy Programs"
            subtitle="Explore our comprehensive learning tracks across English Fluency and Software Development."
          />
          <Link
            to="/courses"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-brand-200 px-5 py-2.5 text-sm font-semibold text-brand-800 hover:bg-brand-50 transition"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {list.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <BookOpen size={44} className="mx-auto text-slate-300 mb-3" />
            <h3 className="font-display text-lg font-bold text-slate-900">
              New Cohort Schedules Coming Soon
            </h3>
            <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
              Our upcoming course terms and curriculum modules are currently being prepared. Apply today or reach out to secure your spot.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/contact"
                className="rounded-full gradient-accent px-6 py-2.5 text-sm font-bold text-white shadow-accent hover:opacity-95 transition"
              >
                Contact Admissions
              </Link>
              <Link
                to="/courses"
                className="rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function StorySection() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2">
        <div className="relative">
          <div className="absolute -inset-3 rounded-3xl gradient-accent opacity-10 blur-2xl" />
          <img
            src="https://images.pexels.com/photos/4145190/pexels-photo-4145190.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="FluentaRise community"
            className="relative w-full rounded-3xl object-cover shadow-card"
          />
        </div>

        <div>
          <SectionHeading
            center={false}
            eyebrow="Our Story"
            title="A learning movement built in East Africa"
            subtitle="FluentaRise started with a simple belief: world-class communication and tech skills should be accessible to everyone, everywhere."
          />
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            Based in Kigali, Rwanda, our platform connects learners with dedicated instructors focused on practical outcomes. Our students master clear spoken English, excel in international proficiency exams, and build production-ready software systems.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              'Live, mentor-led classes with actionable feedback',
              'Project-based learning you can showcase to employers',
              'Fast-track preparation for IELTS and Duolingo certifications',
              'Flexible schedules that fit working professionals',
            ].map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-slate-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={14} />
                </span>
                {point}
              </li>
            ))}
          </ul>
          <Link
            to="/about"
            className="mt-8 inline-flex items-center gap-2 rounded-full gradient-brand px-6 py-3 text-sm font-bold text-white shadow-brand hover:opacity-95 transition"
          >
            Learn More About Us <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section className="bg-slate-50 py-16 lg:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Pricing Plans"
          title="Course packages for every learner"
          subtitle="Choose the plan that matches your ambition. Switch or upgrade anytime."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-cardHover ${
                plan.highlighted ? 'ring-2 ring-accent-500 lg:scale-[1.03]' : 'border border-slate-100'
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full gradient-accent px-4 py-1 text-xs font-bold text-white shadow-accent">
                  Recommended
                </span>
              )}
              <h3 className="text-lg font-bold text-brand-900">{plan.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-brand-900">{formatRwf(plan.price)}</span>
                <span className="text-sm text-slate-400">/package</span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <CheckCircle2 size={14} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/contact"
                className={`mt-7 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition ${
                  plan.highlighted
                    ? 'gradient-accent text-white shadow-accent hover:opacity-95'
                    : 'border border-brand-200 text-brand-800 hover:bg-brand-50'
                }`}
              >
                Choose {plan.name} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const [index, setIndex] = useState(0);
  const count = testimonials.length;

  useEffect(() => {
    if (count === 0) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 5000);
    return () => clearInterval(id);
  }, [count]);

  if (count === 0) return null;
  const active = testimonials[index];

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Testimonials"
          title="What our students say"
          subtitle="Real stories from learners who leveled up their skills with FluentaRise."
        />
        <div className="mx-auto mt-12 max-w-3xl">
          <div className="rounded-3xl gradient-brand p-8 text-center shadow-brand sm:p-12">
            <StarRating rating={active.rating} size="lg" />
            <p className="mt-5 text-lg leading-relaxed text-white/90 sm:text-xl text-balance">"{active.quote}"</p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <img src={active.avatar} alt={active.name} className="h-12 w-12 rounded-full border-2 border-white/30 object-cover" />
              <div className="text-left">
                <p className="font-bold text-white">{active.name}</p>
                <p className="text-sm text-white/65">{active.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PartnersSection() {
  if (partnerLogos.length === 0) return null;

  return (
    <section className="bg-slate-50 py-14">
      <div className="container-page">
        <p className="text-center text-sm font-bold uppercase tracking-wider text-slate-400">Trusted by partners across East Africa</p>
        <div className="mt-8 grid grid-cols-3 items-center gap-6 sm:grid-cols-6">
          {partnerLogos.map((p) => (
            <div
              key={p.name}
              className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white p-5 shadow-sm transition hover:shadow-card"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg gradient-brand text-sm font-extrabold text-white">
                {p.logo}
              </span>
              <span className="text-center text-xs font-medium text-slate-500">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
