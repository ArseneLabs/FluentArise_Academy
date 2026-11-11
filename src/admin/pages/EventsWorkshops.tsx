import { useState } from 'react';
import { CalendarDays, Plus, Clock, Users, Video, GraduationCap } from 'lucide-react';
import { useAdminStore, uid } from '../store/adminStore';
import { PageHeader } from '../components/AdminLayout';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { relativeDate } from '../lib/format';
import type { CalendarEvent } from '../types';

const typeIcon: Record<CalendarEvent['type'], React.ReactNode> = {
  Workshop: <Users size={14} />,
  Webinar: <Video size={14} />,
  'Live Class': <GraduationCap size={14} />,
  'Exam Session': <Clock size={14} />,
};

const typeTone: Record<CalendarEvent['type'], 'coral' | 'info' | 'amber' | 'success'> = {
  Workshop: 'coral',
  Webinar: 'success',
  'Live Class': 'info',
  'Exam Session': 'amber',
};

const colorBar: Record<string, string> = {
  coral: 'bg-coral-500',
  info: 'bg-info-500',
  amber: 'bg-amber-500',
  success: 'bg-success-500',
};

const eventTypes: CalendarEvent['type'][] = ['Workshop', 'Webinar', 'Live Class', 'Exam Session'];

export default function EventsWorkshops() {
  const { events, instructors } = useAdminStore();
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<CalendarEvent | null>(null);

  const sorted = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const upcoming = sorted.filter((e) => new Date(e.date) >= new Date(new Date().toDateString()));

  return (
    <>
      <PageHeader
        title="Events & Workshops"
        subtitle="Schedule live sessions, workshops and exam sessions"
        icon={<CalendarDays size={20} />}
        actions={
          <button className="btn-primary" onClick={() => { setSelected(null); setShowModal(true); }}>
            <Plus size={16} /> Schedule Event
          </button>
        }
      />

      {/* Mini calendar + list */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendar card */}
        <div className="card p-5 lg:col-span-1">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">November 2026</h2>
          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i}>{d}</div>)}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {Array.from({ length: 30 }).map((_, i) => {
              const day = i + 1;
              const hasEvent = events.some((e) => new Date(e.date).getDate() === day + 8 && new Date(e.date).getMonth() === 10);
              const isToday = day === 9;
              return (
                <button
                  key={i}
                  className={`grid h-9 place-items-center rounded-lg text-xs transition ${
                    isToday
                      ? 'bg-coral-500 font-bold text-white'
                      : hasEvent
                        ? 'bg-coral-50 font-semibold text-coral-700 hover:bg-coral-100 dark:bg-coral-500/15 dark:text-coral-300'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-ink-700'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 dark:border-ink-700">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Legend</p>
            {eventTypes.map((t) => (
              <div key={t} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <Badge tone={typeTone[t]}>{typeIcon[t]} {t}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Event list */}
        <div className="card overflow-hidden lg:col-span-2">
          <div className="border-b border-slate-100 px-5 py-4 dark:border-ink-700">
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">Upcoming Events</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{upcoming.length} scheduled</p>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-ink-700/60">
            {upcoming.map((e) => (
              <div key={e.id} className="flex items-center gap-4 px-5 py-4 table-row-hover">
                <div className={`h-12 w-1.5 shrink-0 rounded-full ${colorBar[e.color]}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">{e.title}</h3>
                    <Badge tone={typeTone[e.type]}>{typeIcon[e.type]} {e.type}</Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><CalendarDays size={12} /> {relativeDate(e.date)}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {e.startTime} — {e.endTime}</span>
                    <span className="flex items-center gap-1"><Users size={12} /> {e.enrolled}/{e.capacity}</span>
                    <span>· {e.instructor}</span>
                  </div>
                </div>
                <div className="hidden text-right sm:block">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-ink-600">
                    <div className={`h-full rounded-full ${colorBar[e.color]}`} style={{ width: `${(e.enrolled / e.capacity) * 100}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{Math.round((e.enrolled / e.capacity) * 100)}% full</p>
                </div>
              </div>
            ))}
            {upcoming.length === 0 && (
              <div className="p-10 text-center text-sm text-slate-400">No upcoming events.</div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <EventModal
          event={selected}
          instructors={instructors.map((i) => i.name)}
          onClose={() => setShowModal(false)}
          onSave={() => setShowModal(false)}
        />
      )}
    </>
  );
}

function EventModal({
  event,
  instructors,
  onClose,
  onSave,
}: {
  event: CalendarEvent | null;
  instructors: string[];
  onClose: () => void;
  onSave: (e: CalendarEvent) => void;
}) {
  const [title, setTitle] = useState(event?.title ?? '');
  const [type, setType] = useState<CalendarEvent['type']>('Workshop');
  const [date, setDate] = useState(event?.date.slice(0, 10) ?? new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState(event?.startTime ?? '18:00');
  const [endTime, setEndTime] = useState(event?.endTime ?? '20:00');
  const [instructor, setInstructor] = useState(event?.instructor ?? instructors[0] ?? '');
  const [capacity, setCapacity] = useState(event?.capacity ?? 100);

  return (
    <Modal
      open
      onClose={onClose}
      title={event ? 'Edit Event' : 'Schedule Event'}
      size="md"
      footer={
        <>
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            disabled={!title}
            onClick={() =>
              onSave({
                id: event?.id ?? uid('e'),
                title,
                type,
                date: new Date(date).toISOString(),
                startTime,
                endTime,
                instructor,
                capacity,
                enrolled: event?.enrolled ?? 0,
                color: typeTone[type] === 'coral' ? 'coral' : typeTone[type] === 'info' ? 'info' : typeTone[type] === 'amber' ? 'amber' : 'success',
              })
            }
          >
            <Plus size={16} /> Save Event
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Event Title</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Java OOP Live Workshop" />
        </div>
        <div>
          <label className="label">Event Type</label>
          <select className="input" value={type} onChange={(e) => setType(e.target.value as CalendarEvent['type'])}>
            {eventTypes.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="label">Start</label>
            <input type="time" className="input" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div>
            <label className="label">End</label>
            <input type="time" className="input" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Instructor</label>
            <select className="input" value={instructor} onChange={(e) => setInstructor(e.target.value)}>
              {instructors.map((i) => <option key={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Capacity</label>
            <input type="number" className="input" value={capacity} onChange={(e) => setCapacity(+e.target.value)} min={1} />
          </div>
        </div>
      </div>
    </Modal>
  );
}
