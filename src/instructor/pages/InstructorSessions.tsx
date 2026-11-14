import { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Video,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useAdminStore, uid } from '../../admin/store/adminStore';
import { useAuth } from '../../auth/AuthProvider';
import Modal from '../../admin/components/ui/Modal';
import { notifyLiveClassScheduled } from '../../lib/emailService';
import type { CalendarEvent } from '../../admin/types';

export default function InstructorSessions() {
  const { events, courses, orders, addEvent, deleteEvent } = useAdminStore();
  const { user } = useAuth();

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Instructor assigned courses
  const myCourses = useMemo(() => {
    return courses.filter(
      (c) => c.instructorId === user?.id || c.instructorId === user?.instructorId
    );
  }, [courses, user]);

  const myCourseIds = useMemo(() => new Set(myCourses.map((c) => c.id)), [myCourses]);

  // Filter events to sessions for this instructor's courses or instructor id
  const mySessions = useMemo(() => {
    return events.filter(
      (e) =>
        (e.instructorId && (e.instructorId === user?.id || e.instructorId === user?.instructorId)) ||
        (e.courseId && myCourseIds.has(e.courseId)) ||
        e.instructor?.toLowerCase() === (user?.name?.toLowerCase() || '')
    );
  }, [events, user, myCourseIds]);

  // Form State
  const [courseId, setCourseId] = useState(myCourses[0]?.id || '');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<CalendarEvent['type']>('Live Class');
  const [date, setDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('19:30');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCourse = myCourses.find((c) => c.id === courseId);

  const handleOpenModal = () => {
    setCourseId(myCourses[0]?.id || '');
    setTitle('');
    setType('Live Class');
    setDate(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
    setStartTime('18:00');
    setEndTime('19:30');
    setMeetingUrl('');
    setDescription('');
    setCapacity(100);
    setShowScheduleModal(true);
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !courseId) return;

    setIsSubmitting(true);

    const generatedRoom = `https://meet.jit.si/FluentaRise-${(selectedCourse?.title || 'Class').replace(/[^a-zA-Z0-9]/g, '')}-${uid('room').slice(-4)}`;
    const finalMeetingUrl = meetingUrl.trim() || generatedRoom;

    const newEvent: CalendarEvent = {
      id: uid('live'),
      title: title.trim(),
      type,
      date: new Date(date).toISOString(),
      startTime,
      endTime,
      instructor: user?.name || 'Lead Instructor',
      instructorId: user?.id,
      courseId,
      courseTitle: selectedCourse?.title || 'FluentaRise Course',
      meetingUrl: finalMeetingUrl,
      description: description.trim(),
      capacity,
      enrolled: 0,
      color: type === 'Live Class' ? '#0284c7' : type === 'Workshop' ? '#059669' : '#d97706',
      status: 'upcoming',
    };

    addEvent(newEvent);

    // Find enrolled student emails for this course
    const enrolledEmails = orders
      .filter(
        (o) =>
          o.status === 'paid' &&
          (o.courseIds?.includes(courseId) ||
            o.courseTitle.toLowerCase().includes((selectedCourse?.title || '').toLowerCase()))
      )
      .map((o) => o.studentEmail)
      .filter(Boolean);

    // Automated email notifications to enrolled students
    if (enrolledEmails.length > 0) {
      notifyLiveClassScheduled({
        sessionTitle: newEvent.title,
        courseTitle: newEvent.courseTitle || '',
        instructorName: newEvent.instructor,
        date: newEvent.date,
        startTime: newEvent.startTime,
        endTime: newEvent.endTime,
        meetingUrl: newEvent.meetingUrl,
        description: newEvent.description,
        studentEmails: enrolledEmails,
      }).catch(console.warn);
    }

    setIsSubmitting(false);
    setShowScheduleModal(false);
    setToastMessage(
      `Live Class "${newEvent.title}" scheduled! ${
        enrolledEmails.length > 0
          ? `${enrolledEmails.length} enrolled students notified via email.`
          : 'Ready for students.'
      }`
    );
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleDeleteSession = (id: string) => {
    deleteEvent(id);
    setToastMessage('Live class session cancelled and removed.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950">
            Live Classes & Sessions
          </h1>
          <p className="text-sm text-slate-500">
            Schedule interactive live classes, workshops, and coaching for your assigned courses.
          </p>
        </div>

        {myCourses.length > 0 && (
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md transition"
          >
            <Plus size={15} /> Schedule Live Class
          </button>
        )}
      </div>

      {toastMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-900 shadow-sm">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {myCourses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-display text-base font-bold text-slate-800">
            No courses assigned yet
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Live classes can be scheduled once you have assigned courses in your instructor portfolio.
          </p>
        </div>
      ) : mySessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          <Calendar size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-display text-base font-bold text-slate-800">
            No live sessions scheduled
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Click "Schedule Live Class" to organize a live session for your enrolled students.
          </p>
          <div className="mt-4">
            <button
              onClick={handleOpenModal}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
            >
              <Plus size={14} /> Schedule First Live Class
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {mySessions.map((event) => (
            <div
              key={event.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800">
                    {event.type}
                  </span>
                  <button
                    onClick={() => handleDeleteSession(event.id)}
                    className="p-1 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    title="Cancel session"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <h3 className="mt-3 font-display text-base font-bold text-slate-900 line-clamp-2">
                  {event.title}
                </h3>

                {event.courseTitle && (
                  <p className="text-xs text-emerald-800 font-medium mt-1 line-clamp-1">
                    {event.courseTitle}
                  </p>
                )}

                {event.description && (
                  <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                )}

                <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    <span>{event.startTime} - {event.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-slate-400" />
                    <span>Max {event.capacity} Attendees</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={event.meetingUrl || `https://meet.jit.si/FluentaRise-${event.id.slice(-4)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm"
                >
                  <Video size={14} /> Start / Host Room
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SCHEDULE LIVE CLASS MODAL */}
      {showScheduleModal && (
        <Modal
          open={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          title="Schedule Live Class or Workshop"
          subtitle="All students enrolled in this course will receive an automated email notification"
          size="md"
        >
          <form onSubmit={handleCreateSession} className="space-y-4">
            <div>
              <label className="label">Target Course *</label>
              <select
                required
                className="input"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
              >
                {myCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Session Title *</label>
              <input
                required
                className="input font-semibold"
                placeholder="e.g. Live Q&A & Code Walkthrough: Spring Boot API Architecture"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Session Type</label>
                <select
                  className="input"
                  value={type}
                  onChange={(e) => setType(e.target.value as CalendarEvent['type'])}
                >
                  <option value="Live Class">Live Class</option>
                  <option value="Workshop">Hands-on Workshop</option>
                  <option value="Webinar">Webinar</option>
                  <option value="Exam Session">Exam Prep Session</option>
                </select>
              </div>

              <div>
                <label className="label">Date *</label>
                <input
                  type="date"
                  required
                  className="input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">Start Time *</label>
                <input
                  type="time"
                  required
                  className="input"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              <div>
                <label className="label">End Time *</label>
                <input
                  type="time"
                  required
                  className="input"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>

              <div>
                <label className="label">Capacity</label>
                <input
                  type="number"
                  min={1}
                  className="input"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <label className="label">
                Meeting URL (Google Meet, Zoom, Jitsi, or leave blank to auto-generate)
              </label>
              <input
                className="input"
                placeholder="https://meet.google.com/xyz-abc or https://zoom.us/j/..."
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Session Agenda / Prerequisites</label>
              <textarea
                rows={3}
                className="input"
                placeholder="Describe what will be covered and what students should prepare beforehand…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                className="btn-outline"
                onClick={() => setShowScheduleModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="btn-primary"
              >
                {isSubmitting ? 'Scheduling…' : 'Schedule & Notify Students'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
