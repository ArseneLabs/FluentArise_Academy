import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Target, Eye, Heart, Rocket, Users, BookOpen, Award, ArrowRight, Sparkles } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import { faqs } from '@/data/courses';

const possibilities = [
  { icon: Rocket, title: 'Flexible Learning', desc: 'Study anytime, anywhere with on-demand lessons and live classes that fit your schedule.' },
  { icon: Users, title: 'Expert Mentors', desc: 'Learn from industry professionals who have real experience and a passion for teaching.' },
  { icon: Award, title: 'Recognised Certificates', desc: 'Earn verifiable certificates that employers across East Africa trust and respect.' },
  { icon: BookOpen, title: 'Rich Resources', desc: 'Access downloadable materials, practice exercises and project templates for life.' },
  { icon: Heart, title: 'Supportive Community', desc: 'Join ambitious learners who motivate, help and celebrate each other every day.' },
  { icon: Sparkles, title: 'Career Guidance', desc: 'Get practical CV reviews, interview prep, and direct instructor feedback.' },
];

export default function About() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
              We measure our success not by inflated numbers, but by genuine outcomes — the skills our learners master, the exams they pass,
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

      {/* FAQs */}
      <section className="bg-white py-16 lg:py-24">
        <div className="container-page max-w-4xl">
          <SectionHeading eyebrow="Frequently Asked Questions" title="Got questions? We have answers" subtitle="Everything you need to know about learning with FluentaRise." />
          <div className="mt-12 space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={faq.question} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50 transition-colors">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-5 text-left text-base font-bold text-brand-900 hover:text-brand-700"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 bg-white p-5 text-sm leading-relaxed text-slate-600">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
