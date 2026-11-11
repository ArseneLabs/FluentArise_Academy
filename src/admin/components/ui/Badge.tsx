import type { ReactNode } from 'react';

type Tone = 'coral' | 'amber' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'slate';

const tones: Record<Tone, string> = {
  coral: 'bg-coral-50 text-coral-700 dark:bg-coral-500/15 dark:text-coral-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  success: 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500',
  error: 'bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-400',
  info: 'bg-info-50 text-info-600 dark:bg-info-500/15 dark:text-info-400',
  neutral: 'bg-slate-100 text-slate-600 dark:bg-ink-700 dark:text-slate-300',
  slate: 'bg-slate-100 text-slate-600 dark:bg-ink-700 dark:text-slate-300',
};

const dots: Record<Tone, string> = {
  coral: 'bg-coral-500',
  amber: 'bg-amber-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
  info: 'bg-info-500',
  neutral: 'bg-slate-400',
  slate: 'bg-slate-400',
};

export default function Badge({
  tone = 'neutral',
  children,
  dot = false,
  className = '',
}: {
  tone?: Tone;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span className={`chip ${tones[tone]} ${className}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dots[tone]}`} />}
      {children}
    </span>
  );
}

export const toneForSubmissionStatus = (
  s: string,
): 'success' | 'warning' | 'info' | 'coral' | 'neutral' => {
  switch (s) {
    case 'graded':
      return 'success';
    case 'auto_graded':
      return 'info';
    case 'needs_grading':
    case 'submitted':
      return 'warning';
    case 'resubmission_requested':
      return 'coral';
    default:
      return 'neutral';
  }
};
