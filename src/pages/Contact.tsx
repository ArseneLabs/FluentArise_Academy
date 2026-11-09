import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/store/toast';
import SectionHeading from '@/components/ui/SectionHeading';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface Errors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const contactCards = [
  { icon: MapPin, title: 'Visit Us', lines: ['Opposite MIC Building, KN 2 Ave', 'Kigali, Rwanda'], color: 'brand' },
  { icon: Phone, title: 'Call Us', lines: ['0795041000', '+250 795 041 000'], color: 'accent' },
  { icon: Mail, title: 'Email Us', lines: ['kjmicheline@gmail.com'], color: 'brand' },
  { icon: Clock, title: 'Office Hours', lines: ['Mon – Fri: 8AM – 6PM', 'Sat: 9AM – 1PM'], color: 'accent' },
];

export default function Contact() {
  const push = useToast((s) => s.push);
  const [form, setForm] = useState<FormData>({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const e: Errors = {};
    if (!form.name.trim()) e.name = 'Please enter your name';
    if (!form.email.trim()) e.email = 'Please enter your email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email';
    if (!form.subject.trim()) e.subject = 'Please enter a subject';
    if (!form.message.trim()) e.message = 'Please enter your message';
    else if (form.message.trim().length < 10) e.message = 'Message must be at least 10 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setForm({ name: '', email: '', subject: '', message: '' });
      push('Your message has been sent! We will get back to you soon.', 'success');
    }, 900);
  };

  const field = (key: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  return (
    <>
      <section className="gradient-hero py-16 lg:py-20">
        <div className="container-page text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/90 ring-1 ring-white/15">
            <Mail className="h-4 w-4 text-accent-400" /> Get In Touch
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-5xl text-balance">
            We'd love to hear from you
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/75">
            Have a question about courses, partnerships or becoming an instructor? Reach out and our team will respond within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact info cards */}
      <section className="bg-white py-12 lg:py-16">
        <div className="container-page grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {contactCards.map((c) => (
            <div key={c.title} className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-card transition hover:-translate-y-1 hover:shadow-cardHover">
              <span className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${c.color === 'brand' ? 'gradient-brand' : 'gradient-accent'} text-white`}>
                <c.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-sm font-bold text-brand-900">{c.title}</h3>
              {c.lines.map((l) => (
                <p key={l} className="mt-1 text-sm text-slate-500">{l}</p>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Form + map */}
      <section className="bg-slate-50 py-12 lg:py-16">
        <div className="container-page grid gap-8 lg:grid-cols-2">
          {/* Form */}
          <div className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
            <SectionHeading center={false} eyebrow="Contact Form" title="Send us a message" subtitle="Fill out the form below and we'll get back to you shortly." />
            <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Full Name"
                  value={form.name}
                  onChange={(v) => field('name', v)}
                  error={errors.name}
                  placeholder="Jane Doe"
                />
                <Field
                  label="Email Address"
                  type="email"
                  value={form.email}
                  onChange={(v) => field('email', v)}
                  error={errors.email}
                  placeholder="jane@example.com"
                />
              </div>
              <Field
                label="Subject"
                value={form.subject}
                onChange={(v) => field('subject', v)}
                error={errors.subject}
                placeholder="How can we help?"
              />
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => field('message', e.target.value)}
                  rows={5}
                  placeholder="Tell us a bit more..."
                  className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-2 ${
                    errors.message ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-brand-400 focus:ring-brand-100'
                  }`}
                />
                {errors.message && <p className="mt-1 text-xs text-rose-500">{errors.message}</p>}
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl gradient-accent px-6 py-3.5 text-sm font-bold text-white shadow-accent hover:opacity-95 transition disabled:opacity-60"
              >
                {submitting ? (
                  <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Sending...</span>
                ) : (
                  <><Send className="h-4 w-4" /> Send Message</>
                )}
              </button>
              <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> We typically reply within 24 hours
              </p>
            </form>
          </div>

          {/* Map / info */}
          <div className="space-y-6">
            <div className="overflow-hidden rounded-2xl bg-white shadow-card">
              <iframe
                title="FluentaRise location"
                src="https://www.openstreetmap.org/export/embed.html?bbox=30.0588%2C-1.9577%2C30.0788%2C-1.9377&layer=mapnik&marker=-1.9477%2C30.0688"
                className="h-72 w-full border-0"
                loading="lazy"
              />
              <div className="p-5">
                <h3 className="text-base font-bold text-brand-900">FluentaRise Campus</h3>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-500"><MapPin className="h-4 w-4 text-accent-500" /> Opposite MIC Building, KN 2 Ave, Kigali, Rwanda</p>
              </div>
            </div>
            <div className="rounded-2xl gradient-brand p-6 text-white shadow-brand">
              <h3 className="text-lg font-bold">Why reach out?</h3>
              <ul className="mt-3 space-y-2.5 text-sm text-white/80">
                {['Course enrolment questions', 'Partnership & corporate training', 'Become an instructor', 'Technical support'].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Field({
  label, value, onChange, error, placeholder, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void; error?: string; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-2 ${
          error ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-brand-400 focus:ring-brand-100'
        }`}
      />
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}
