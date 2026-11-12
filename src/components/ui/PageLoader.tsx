import { Loader2 } from 'lucide-react';

export default function PageLoader() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
      <div className="relative flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-2 border-brand-200 border-t-brand-700 animate-spin" />
        <Loader2 className="absolute h-5 w-5 text-brand-700 animate-pulse" />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Loading experience...
      </p>
    </div>
  );
}
