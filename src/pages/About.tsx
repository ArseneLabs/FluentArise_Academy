import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Target, Eye, Heart, Rocket, Users, BookOpen, Award, ArrowRight, Sparkles } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { faqs } from '@/data/courses';

const possibilities = [
  { icon: Rocket, title: 'Flexible Learning', desc: 'Study anytime, anywhere with on-demand lessons and live classes that fit your schedule.' },
  { icon: Users, title: 'Expert Mentors', desc: 'Learn from industry professionals who have real experience and a passion for teaching.' },
  { icon: Award, title: 'Recognised Certificates', desc: 'Earn verifiable certificates that employers across East Africa trust and respect.' },
  { icon: BookOpen, title: 'Rich Resources', desc: 'Access downloadable materials, practice exercises and project templates for life.' },
  { icon: Heart, title: 'Supportive Community', desc: 'Join thousands of learners who motivate, help and celebrate each other every day.' },
  { icon: Sparkles, title: 'Career Coaching', desc: 'Get CV reviews, interview prep and access to our hiring partner network.' },
];

const stats = [
  { label: 'Active Students', value: 4680, suffix: '+' },
  { label: 'Expert Instructors', value: 45, suffix: '+' },
  { label: 'Courses Available', value: 330, suffix: '+' },
  { label: 'Graduate Success', value: 98, suffix: '%' },
];

export default function About() {
  return (
    <>
      {/* Hero */}
      <section className="gradient-hero py-16 lg:py-20">
        <div className="container-page text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/90 ring-1 ring-white/15">
            <Sparkles className="h-4 w-4 text-accent-400" /> About FluentaRise
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-5xl text-balance">
            We believe world-class skills should be within everyone's reach
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/75">
            FluentaRise is an East African learning movement on a mission to elevate communication and tech skills across the region.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-white py-16 lg:py-24">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading center={false} eyebrow="Our Mission" title="Education that actually changes lives" subtitle="We exist to close the gap between ambition and opportunity." />
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              For too long, world-class communication and tech training has been locked behind cost, geography and rigid
              schedules. FluentaRise breaks those barriers with live, mentor-led online classes and flexible, project-based
              courses that anyone in East Africa can access from a phone or laptop.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              We measure our success not by enrolments, but by outcomes — the jobs our graduates land, the exams they pass,
              and the conversations they now lead in English with total confidence.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 p-5 shadow-sm">
                <Target className="h-7 w-7 text-brand-700" />
                <h4 className="mt-3 text-sm font-bold text-brand-900">Our Mission</h4>
                <p className="mt-1 text-xs text-slate-500">Make premium skills accessible to every ambitious learner in East Africa.</p>
              </div>
              <div className="rounded-xl border border-slate-100 p-5 shadow-sm">
                <Eye className="h-7 w-7 text-accent-500" />
                <h4 className="mt-3 text-sm font-bold text-brand-900">Our Vision</h4>
                <p className="mt-1 text-xs text-slate-500">A region where talent — not background — decides who gets to grow.</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <img src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800" alt="FluentaRise mission" className="w-full rounded-3xl object-cover shadow-card" />
          </div>
        </div>
      </section>

      {/* Possibilities */}
      <section className="bg-slate-50 py-16 lg:py-24">
        <div className="container-page">
          <SectionHeading eyebrow="Unlimited Possibilities" title="Everything you need to succeed" subtitle="A complete learning ecosystem built around your growth." />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {possibilities.map((p) => (
              <div key={p.title} className="group rounded-2xl bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-cardHover">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl gradient-brand text-white transition-transform group-hover:scale-110">
                  <p.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-base font-bold text-brand-900">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="gradient-brand py-14">
        <div className="container-page grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-4xl font-extrabold text-white sm:text-5xl"><AnimatedCounter value={s.value} suffix={s.suffix} /></p>
              <p className="mt-2 text-sm font-medium uppercase tracking-wider text-white/65">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16 lg:py-24">
        <div className="container-page">
          <SectionHeading eyebrow="FAQ" title="Frequently asked questions" subtitle="Everything you need to know before joining FluentaRise." />
          <div className="mx-auto mt-10 max-w-3xl space-y-3">
            {faqs.map((faq, i) => (
              <FaqItem key={i} question={faq.question} answer={faq.answer} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-full gradient-accent px-6 py-3 text-sm font-bold text-white shadow-accent hover:opacity-95 transition">
              Still have questions? Contact us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-slate-50"
      >
        <span className="text-sm font-bold text-brand-900">{question}</span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="px-5 pb-4 text-sm leading-relaxed text-slate-600 animate-slide-down">{answer}</p>}
    </div>
  );
}
