import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Video,
  Calendar,
  Clock,
  Users,
  ExternalLink,
  Sparkles,
  BookOpen,
  ArrowRight,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { useAdminStore } from '../../admin/store/adminStore';
import { useAuth } from '../../auth/AuthProvider';
import Modal from '../../admin/components/ui/Modal';
import type { CalendarEvent } from '../../admin/types';

export default function StudentLiveClasses() {
  const { events, courses, orders } = useAdminStore();
  const { user } = useAuth();
  const [activeMeetingModal, setActiveMeetingModal] = useState<CalendarEvent | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Keep current time updated every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const userEmail = user?.email?.toLowerCase() || '';

  // Enrolled courses for this student
  const enrolledCourseIds = useMemo(() => {
    if (!userEmail) return new Set<string>();

    const paidOrders = orders.filter(
      (o) => o.status === 'paid' && o.studentEmail.toLowerCase() === userEmail
    );

    const paidCourseIds = paidOrders.flatMap((o) => o.courseIds || []);
    const userEnrolledIds = user?.enrolledCourseIds || [];
    const freeCourseIds = courses.filter((c) => c.free).map((c) => c.id);

    return new Set([...paidCourseIds, ...userEnrolledIds, ...freeCourseIds]);
  }, [orders, courses, user, userEmail]);

  // Live classes for enrolled courses (or general academy webinars)
  const myLiveClasses = useMemo(() => {
    return events.filter(
      (e) => !e.courseId || enrolledCourseIds.has(e.courseId)
    );
  }, [events, enrolledCourseIds]);

  // Status calculation
  const getSessionStatus = (e: CalendarEvent) => {
    try {
      const eventDateStr = e.date.split('T')[0];
      const [startHour, startMin] = e.startTime.split(':').map(Number);
      const [endHour, endMin] = e.endTime.split(':').map(Number);

      const eventStart = new Date(eventDateStr);
      eventStart.setHours(startHour, startMin, 0, 0);

      // 15-minute early check-in window
      const earlyWindow = new Date(eventStart.getTime() - 15 * 60000);

      const eventEnd = new Date(eventDateStr);
      eventEnd.setHours(endHour, endMin, 0, 0);

      const now = currentTime.getTime();

      if (now >= earlyWindow.getTime() && now <= eventEnd.getTime()) {
        return { state: 'live', label: 'LIVE NOW — ROOM OPEN', canJoin: true };
      } else if (now < earlyWindow.getTime()) {
        const diffMs = eventStart.getTime() - now;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        let countdown = '';
        if (diffHours > 24) {
          const days = Math.floor(diffHours / 24);
          countdown = `Starts in ${days} day${days > 1 ? 's' : ''}`;
        } else if (diffHours > 0) {
          countdown = `Starts in ${diffHours}h ${diffMins}m`;
        } else {
          countdown = `Starts in ${diffMins} minutes`;
        }

        return { state: 'upcoming', label: countdown, canJoin: false };
      } else {
        return { state: 'completed', label: 'Session Concluded', canJoin: false };
      }
    } catch {
      return { state: 'upcoming', label: 'Scheduled', canJoin: false };
    }
  };

  const handleJoinClass = (e: CalendarEvent) => {
    const defaultRoom = `https://meet.jit.si/FluentaRise-${(e.courseTitle || 'Academy').replace(/[^a-zA-Z0-9]/g, '')}-${e.id.slice(-4)}`;
    const url = e.meetingUrl || defaultRoom;

    // If external (e.g. meet.google.com, zoom.us, or jit.si), open in modal or clean window
    if (url.startsWith('http')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      setActiveMeetingModal(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950">
            Live Classes & Workshops
          </h1>
          <p className="text-sm text-slate-500">
            Join scheduled interactive live streams, code walk-throughs, and group mentoring sessions.
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
              Interactive Live Classroom
            </span>
          </div>
          <h2 className="mt-2 font-display text-lg sm:text-xl font-bold">
            Real-Time Sessions with Lead Instructors
          </h2>
          <p className="mt-1 text-xs text-purple-200/90 leading-relaxed">
            When your instructor schedules a live class for your course, you receive an automated email invitation. The <strong>"Join Live Class"</strong> button automatically unlocks on this page 15 minutes prior to the start time.
          </p>
        </div>
      </div>

      {/* Live Classes Grid */}
      {myLiveClasses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          <Video size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-display text-base font-bold text-slate-800">
            No live classes currently scheduled
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Your course instructors will schedule live Q&A, exam preparations, and code reviews here. Keep an eye on your email inbox for session reminders!
          </p>
          <div className="mt-4">
            <Link
              to="/student/courses"
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 transition"
            >
              <BookOpen size={14} /> Back to My Courses
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {myLiveClasses.map((ev) => {
            const status = getSessionStatus(ev);
            const isLive = status.state === 'live';

            return (
              <div
                key={ev.id}
                className={`flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                  isLive ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        isLive
                          ? 'bg-rose-500 text-white animate-pulse'
                          : status.state === 'completed'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {isLive && <Radio size={12} />}
                      {status.label}
                    </span>

                    <span className="text-xs font-bold text-slate-500">{ev.type}</span>
                  </div>

                  <h3 className="mt-3.5 font-display text-base font-bold text-slate-900 line-clamp-2">
                    {ev.title}
                  </h3>

                  {ev.courseTitle && (
                    <p className="text-xs font-semibold text-purple-700 mt-1 line-clamp-1">
                      {ev.courseTitle}
                    </p>
                  )}

                  {ev.description && (
                    <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {ev.description}
                    </p>
                  )}

                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400" />
                      <span>{new Date(ev.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-400" />
                      <span>{ev.startTime} — {ev.endTime} (CAT)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-slate-400" />
                      <span>Instructor: <strong>{ev.instructor}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  {status.canJoin ? (
                    <button
                      onClick={() => handleJoinClass(ev)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-purple-700 shadow-md transition"
                    >
                      <Video size={15} /> Join Live Class Now
                    </button>
                  ) : status.state === 'completed' ? (
                    <button
                      disabled
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-400 cursor-not-allowed"
                    >
                      <CheckCircle2 size={14} /> Class Ended
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-500 cursor-not-allowed"
                    >
                      <Clock size={14} /> Unlocks at {ev.startTime}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
