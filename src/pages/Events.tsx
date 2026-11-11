import { MapPin, Clock, ArrowRight, Calendar } from 'lucide-react';
import { events } from '@/data/courses';
import { useToast } from '@/store/toast';
import { Link } from 'react-router-dom';

export default function Events() {
  const push = useToast((s) => s.push);

  const register = (title: string) =>
    push(`You are registered for "${title}". We'll email you the details!`, 'success');

  return (
    <>
      <section className="gradient-hero py-16 lg:py-20">
        <div className="container-page text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/90 ring-1 ring-white/15">
            <Calendar className="h-4 w-4 text-accent-400" /> Upcoming Events
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-5xl text-balance">
            Workshops, masterclasses & career sessions
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/75">
            Join our live sessions to learn, connect and grow with the FluentaRise community.
          </p>
        </div>
      </section>

      <section className="bg-slate-50 py-12 lg:py-16">
        <div className="container-page">
          {events.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center max-w-2xl mx-auto shadow-sm">
              <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
              <h2 className="font-display text-xl font-bold text-slate-900">
                No Public Events Currently Scheduled
              </h2>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                We are actively planning our upcoming interactive webinars and workshops. To arrange a private cohort or team session, please contact our team.
              </p>
              <div className="mt-6">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full gradient-accent px-6 py-2.5 text-sm font-bold text-white shadow-accent hover:opacity-95 transition"
                >
                  Contact Us <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((e) => (
                <div
                  key={e.id}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-cardHover"
                >
                  <div className="flex gap-4 p-5">
                    <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl gradient-brand text-white">
                      <span className="text-3xl font-extrabold leading-none">{e.day}</span>
                      <span className="mt-1 text-xs font-semibold uppercase">{e.month}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                        {e.category}
                      </span>
                      <h3 className="mt-2 text-base font-bold leading-snug text-brand-900">
                        {e.title}
                      </h3>
                    </div>
                  </div>
                  <div className="px-5">
                    <p className="text-sm leading-relaxed text-slate-500">{e.description}</p>
                    <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                      <p className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-accent-500" /> {e.venue}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-accent-500" /> {e.time}
                      </p>
                    </div>
                  </div>
                  <div className="mt-auto p-5 pt-4">
                    <button
                      onClick={() => register(e.title)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl gradient-accent px-5 py-2.5 text-sm font-bold text-white shadow-accent hover:opacity-95 transition"
                    >
                      Register Now <ArrowRight className="h-4 w-4" />
                    </button>
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
