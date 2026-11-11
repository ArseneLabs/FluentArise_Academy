import { Calendar, Clock, Users, Video } from 'lucide-react';
import { useAdminStore } from '../../admin/store/adminStore';

export default function InstructorSessions() {
  const { events } = useAdminStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950">
            Live Classes & Workshops
          </h1>
          <p className="text-sm text-slate-500">
            Schedule of your interactive workshops, webinars, and coaching sessions.
          </p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          <Calendar size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-display text-base font-bold text-slate-800">
            No live sessions scheduled
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Live workshops, webinars, and class sessions scheduled by the academy will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800">
                  {event.type}
                </span>
                <span className="text-xs font-semibold text-slate-400">{event.date}</span>
              </div>

              <h3 className="mt-3 font-display text-base font-bold text-slate-900 line-clamp-2">
                {event.title}
              </h3>

              <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-slate-400" />
                  <span>
                    {event.startTime} - {event.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-slate-400" />
                  <span>
                    {event.enrolled} Enrolled (Max {event.capacity})
                  </span>
                </div>
              </div>

              <div className="mt-auto pt-5">
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition">
                  <Video size={14} /> Start / Join Room
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
