import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Menu, Search, Bell, ChevronDown, UserCircle, LogOut, Coins, Shield } from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { relativeDate } from '../lib/format';
import { useAuth } from '../../auth/AuthProvider';

export default function Header({ onMenu }: { onMenu: () => void }) {
  const { submissions, orders } = useAdminStore();
  const { user, signOut, pendingUsersCount } = useAuth();
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) setBellOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const pendingSubs = submissions.filter((s) => s.status === 'needs_grading' || s.status === 'submitted');
  const alerts = [
    ...(pendingUsersCount > 0
      ? [
          {
            id: 'alert_pending_users',
            text: `${pendingUsersCount} account registration(s) pending Super Admin approval`,
            sub: 'Click Users & Approvals to review',
            tone: 'amber',
          },
        ]
      : []),
    ...pendingSubs.map((s) => ({
      id: s.id,
      text: `${s.studentName} submitted ${s.taskTitle}`,
      sub: relativeDate(s.submittedDate),
      tone: 'sky',
    })),
    ...orders.slice(0, 3).map((o) => ({
      id: o.id,
      text: `New enrollment: ${o.studentName}`,
      sub: `${o.courseTitle} · ${relativeDate(o.date)}`,
      tone: 'green',
    })),
  ];

  const initials = (user?.name || user?.email || 'Admin').slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6">
      <button onClick={onMenu} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden">
        <Menu size={20} />
      </button>

      <div className="relative hidden flex-1 sm:block">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="h-10 w-full max-w-md rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
          placeholder="Search courses, users, tasks…"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 md:flex">
          <Shield size={14} className="text-sky-600" /> Super Admin
        </div>

        <div className="hidden items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 md:flex">
          <Coins size={14} className="text-emerald-600" /> Rwf
        </div>

        {/* Notifications */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setBellOpen((value) => !value)}
            className="relative rounded-xl p-2.5 text-slate-500 hover:bg-sky-50 hover:text-sky-700 transition"
            aria-label="View notifications"
          >
            <Bell size={18} />
            {alerts.length > 0 && (
              <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white">
                {alerts.length}
              </span>
            )}
          </button>

          {bellOpen && (
            <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-100 px-4 py-3 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">Notifications</p>
                <span className="text-xs text-slate-400">{alerts.length} total</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex gap-3 border-b border-slate-50 px-4 py-3 last:border-0 hover:bg-slate-50 transition">
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        alert.tone === 'amber'
                          ? 'bg-amber-500'
                          : alert.tone === 'sky'
                          ? 'bg-sky-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <div>
                      <p className="text-sm text-slate-700">{alert.text}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{alert.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((value) => !value)}
            className="flex items-center gap-2 rounded-xl p-1 pr-2 hover:bg-slate-100 transition"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-sky-100 text-xs font-bold text-sky-700">
              {initials}
            </span>
            <div className="hidden text-left sm:block">
              <p className="max-w-32 truncate text-sm font-bold text-slate-800">
                {user?.name || 'Super Admin'}
              </p>
              <p className="max-w-32 truncate text-xs text-slate-400">{user?.email}</p>
            </div>
            <ChevronDown size={16} className="text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-xl">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                <span className="mt-1.5 inline-block rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 uppercase">
                  Super Admin
                </span>
              </div>
              <button
                onClick={() => void signOut()}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
