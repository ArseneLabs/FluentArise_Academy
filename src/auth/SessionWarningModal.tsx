import { Clock, ShieldAlert, LogOut, CheckCircle2 } from 'lucide-react';

interface SessionWarningModalProps {
  open: boolean;
  secondsRemaining: number;
  onStayLoggedIn: () => void;
  onLogoutNow: () => void;
}

export default function SessionWarningModal({
  open,
  secondsRemaining,
  onStayLoggedIn,
  onLogoutNow,
}: SessionWarningModalProps) {
  if (!open) return null;

  const percentage = Math.max(0, Math.min(100, (secondsRemaining / 60) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10 dark:bg-ink-800">
        {/* Header Banner */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shrink-0 shadow">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-amber-900 dark:text-amber-200">
              Session Inactivity Warning
            </h3>
            <p className="text-xs text-amber-700/90 dark:text-amber-300/80">
              Automatic security lockout
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            You have been inactive for <strong>9 minutes</strong>. To protect your account and
            sensitive student records, you will be automatically logged out in:
          </p>

          {/* Countdown Display */}
          <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 p-4 dark:bg-ink-700/50">
            <div className="flex items-center gap-2 text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
              <Clock size={24} className="animate-pulse" />
              <span>{secondsRemaining}s</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Remaining before automatic logout</p>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden dark:bg-ink-600">
              <div
                className="bg-amber-500 h-full transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center">
            Click <strong>Stay Signed In</strong> below or move your mouse to extend your session.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 dark:bg-ink-900/40 dark:border-ink-700">
          <button
            onClick={onLogoutNow}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition dark:border-ink-700 dark:text-slate-300"
          >
            <LogOut size={14} /> Log Out Now
          </button>
          <button
            onClick={onStayLoggedIn}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-800 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-900/20 hover:bg-brand-900 transition"
          >
            <CheckCircle2 size={14} /> Stay Signed In
          </button>
        </div>
      </div>
    </div>
  );
}
