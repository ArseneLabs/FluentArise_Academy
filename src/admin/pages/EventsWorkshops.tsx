import { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Clock,
  Users,
  Video,
  GraduationCap,
  ExternalLink,
  Edit2,
  Trash2,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { useAdminStore, uid } from '../store/adminStore';
import { PageHeader } from '../components/AdminLayout';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { relativeDate } from '../lib/format';
import { notifyLiveClassScheduled } from '../../lib/emailService';
import type { CalendarEvent, Course, Instructor } from '../types';

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
  '#0284c7': 'bg-sky-500',
  '#059669': 'bg-emerald-500',
  '#d97706': 'bg-amber-500',
};

const eventTypes: CalendarEvent['type'][] = ['Workshop', 'Webinar', 'Live Class', 'Exam Session'];

export default function EventsWorkshops() {
  const { events, instructors, courses, orders, addEvent, deleteEvent } = useAdminStore();
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<CalendarEvent | null>(null);

  const sorted = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const upcoming = sorted.filter((e) => new Date(e.date) >= new Date(new Date().toDateString()));

  const handleSave = (eventData: CalendarEvent) => {
    addEvent(eventData);
    setShowModal(false);

    // If it's linked to a course and is a live class/workshop, notify enrolled students
    if (eventData.courseId && (eventData.type === 'Live Class' || eventData.type === 'Workshop')) {
      const enrolledEmails = orders
        .filter(
          (o) =>
            o.status === 'paid' &&
            (o.courseIds?.includes(eventData.courseId!) ||
              o.courseTitle.toLowerCase().includes((eventData.courseTitle || '').toLowerCase()))
        )
        .map((o) => o.studentEmail)
        .filter(Boolean);

      if (enrolledEmails.length > 0) {
        notifyLiveClassScheduled({
          sessionTitle: eventData.title,
          courseTitle: eventData.courseTitle || 'FluentaRise Course',
          instructorName: eventData.instructor,
          date: eventData.date,
          startTime: eventData.startTime,
          endTime: eventData.endTime,
          meetingUrl: eventData.meetingUrl || '',
          studentEmails: enrolledEmails,
        }).catch((err) => console.warn('Could not send live class broadcast:', err));
      }
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove "${title}"?`)) {
      deleteEvent(id);
    }
  };

  return (
    <>
      <PageHeader
        title="Events & Workshops"
        subtitle="Schedule live classes, webinars, workshops and exam sessions with integrated video links"
        icon={<CalendarDays size={20} />}
        actions={
          <button
            className="btn-primary"
            onClick={() => {
              setSelected(null);
              setShowModal(true);
            }}
          >
            <Plus size={16} /> Schedule Event
          </button>
        }
      />

      {/* Mini calendar + list */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendar card */}
        <div className="card p-5 lg:col-span-1">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">Calendar Schedule</h2>
          <p className="mt-1 text-xs text-slate-500">Live sessions and academy workshops</p>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {Array.from({ length: 30 }).map((_, i) => {
              const day = i + 1;
              const hasEvent = events.some((e) => {
                const dt = new Date(e.date);
                return dt.getDate() === day;
              });
              const isToday = new Date().getDate() === day;
              return (
                <button
                  key={i}
                  className={`grid h-9 place-items-center rounded-lg text-xs transition ${
                    isToday
                      ? 'bg-purple-600 font-bold text-white'
                      : hasEvent
                        ? 'bg-purple-50 font-semibold text-purple-700 hover:bg-purple-100 dark:bg-purple-500/15 dark:text-purple-300'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-ink-700'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 dark:border-ink-700">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Event Categories</p>
            {eventTypes.map((t) => (
              <div key={t} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <Badge tone={typeTone[t]}>
                  {typeIcon[t]} {t}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Event list */}
        <div className="card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-ink-700">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">Upcoming Events</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{upcoming.length} scheduled</p>
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-ink-700/60">
            {upcoming.map((e) => (
              <div key={e.id} className="p-5 table-row-hover transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`h-12 w-1.5 shrink-0 rounded-full mt-1 ${colorBar[e.color] || 'bg-purple-500'}`}
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">{e.title}</h3>
                        <Badge tone={typeTone[e.type]}>
                          {typeIcon[e.type]} {e.type}
                        </Badge>
                        {e.courseTitle && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-ink-700 dark:text-slate-300">
                            <BookOpen size={11} /> {e.courseTitle}
                          </span>
                        )}
                      </div>

                      {e.description && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-xl">
                          {e.description}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-medium">
                          <CalendarDays size={13} className="text-slate-400" /> {relativeDate(e.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} className="text-slate-400" /> {e.startTime} — {e.endTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={13} className="text-slate-400" /> {e.enrolled}/{e.capacity} enrolled
                        </span>
                        <span>· Instructor: <strong className="text-slate-700 dark:text-slate-200">{e.instructor}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {e.meetingUrl && (
                      <a
                        href={e.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-300 transition"
                      >
                        <Video size={13} /> Join
                        <ExternalLink size={11} />
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setSelected(e);
                        setShowModal(true);
                      }}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-ink-700 dark:hover:text-white transition"
                      title="Edit Event"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(e.id, e.title)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition"
                      title="Delete Event"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {upcoming.length === 0 && (
              <div className="p-12 text-center text-sm text-slate-400">
                <CalendarDays size={32} className="mx-auto mb-2 text-slate-300" />
                No upcoming events or workshops. Click &quot;Schedule Event&quot; to plan one.
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <EventModal
          event={selected}
          instructors={instructors}
          courses={courses}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}

function EventModal({
  event,
  instructors,
  courses,
  onClose,
  onSave,
}: {
  event: CalendarEvent | null;
  instructors: Instructor[];
  courses: Course[];
  onClose: () => void;
  onSave: (e: CalendarEvent) => void;
}) {
  const [title, setTitle] = useState(event?.title ?? '');
  const [type, setType] = useState<CalendarEvent['type']>(event?.type ?? 'Live Class');
  const [date, setDate] = useState(
    event?.date.slice(0, 10) ?? new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  );
  const [startTime, setStartTime] = useState(event?.startTime ?? '18:00');
  const [endTime, setEndTime] = useState(event?.endTime ?? '20:00');
  const [instructor, setInstructor] = useState(event?.instructor ?? instructors[0]?.name ?? 'Lead Instructor');
  const [courseId, setCourseId] = useState(event?.courseId ?? '');
  const [meetingUrl, setMeetingUrl] = useState(event?.meetingUrl ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [capacity, setCapacity] = useState(event?.capacity ?? 100);

  const handleCourseChange = (selectedId: string) => {
    setCourseId(selectedId);
    if (selectedId) {
      const matched = courses.find((c) => c.id === selectedId);
      if (matched && matched.instructorId) {
        const inst = instructors.find((i) => i.id === matched.instructorId);
        if (inst) {
          setInstructor(inst.name);
        }
      }
    }
  };

  const generateJitsiMeeting = () => {
    const slug = (title || 'class')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .slice(0, 20);
    const generated = `https://meet.jit.si/fluentarise-${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    setMeetingUrl(generated);
  };

  const handleSave = () => {
    const matchedCourse = courses.find((c) => c.id === courseId);
    const matchedInst = instructors.find((i) => i.name === instructor);

    const savedEvent: CalendarEvent = {
      id: event?.id ?? uid('e'),
      title: title.trim(),
      type,
      date: new Date(date).toISOString(),
      startTime,
      endTime,
      instructor,
      instructorId: matchedInst?.id || event?.instructorId,
      courseId: courseId || undefined,
      courseTitle: matchedCourse?.title || event?.courseTitle || undefined,
      meetingUrl: meetingUrl.trim() || undefined,
      description: description.trim() || undefined,
      capacity,
      enrolled: event?.enrolled ?? 0,
      color:
        typeTone[type] === 'coral'
          ? 'coral'
          : typeTone[type] === 'info'
            ? 'info'
            : typeTone[type] === 'amber'
              ? 'amber'
              : 'success',
      status: event?.status || 'upcoming',
    };

    onSave(savedEvent);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={event ? 'Edit Academy Event' : 'Schedule New Event / Live Session'}
      size="lg"
      footer={
        <>
          <button className="btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" disabled={!title.trim()} onClick={handleSave}>
            <Plus size={16} /> {event ? 'Save Changes' : 'Schedule Event'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Event / Live Session Title *</label>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Full-Stack Web Development Live Workshop"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Event Type</label>
            <select
              className="input"
              value={type}
              onChange={(e) => setType(e.target.value as CalendarEvent['type'])}
            >
              {eventTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Linked Academy Course</label>
            <select
              className="input"
              value={courseId}
              onChange={(e) => handleCourseChange(e.target.value)}
            >
              <option value="">-- General / Academy-Wide (All Learners) --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-slate-400">
              Linking a course automatically notifies enrolled students and unlocks it in their portal.
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label mb-0">Meeting / Live Room URL</label>
            <button
              type="button"
              onClick={generateJitsiMeeting}
              className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700"
            >
              <Sparkles size={12} /> Auto-Generate Jitsi Link
            </button>
          </div>
          <input
            className="input"
            value={meetingUrl}
            onChange={(e) => setMeetingUrl(e.target.value)}
            placeholder="https://meet.google.com/xyz or https://meet.jit.si/fluentarise-room"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="label">Start Time</label>
            <input type="time" className="input" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div>
            <label className="label">End Time</label>
            <input type="time" className="input" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Lead Instructor</label>
            <select className="input" value={instructor} onChange={(e) => setInstructor(e.target.value)}>
              {instructors.map((i) => (
                <option key={i.id} value={i.name}>
                  {i.name} ({i.title})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Attendee Capacity</label>
            <input
              type="number"
              className="input"
              value={capacity}
              onChange={(e) => setCapacity(Math.max(1, +e.target.value))}
              min={1}
            />
          </div>
        </div>

        <div>
          <label className="label">Description & Preparation Agenda</label>
          <textarea
            className="input min-h-[80px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Outline prerequisites, class objectives, or software needed..."
          />
        </div>
      </div>
    </Modal>
  );
}
