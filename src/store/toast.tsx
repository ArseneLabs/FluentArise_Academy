import { create } from 'zustand';
import { useEffect } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: Toast[];
  push: (message: string, type?: ToastType) => void;
  dismiss: (id: string) => void;
}

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  push: (message, type = 'success') => {
    const id = Math.random().toString(36).slice(2);
    set({ toasts: [...useToast.getState().toasts, { id, message, type }] });
    setTimeout(() => useToast.getState().dismiss(id), 3200);
  },
  dismiss: (id) => set({ toasts: useToast.getState().toasts.filter((t) => t.id !== id) }),
}));

export function useToastHelper() {
  const push = useToast((s) => s.push);
  return { push };
}

const toastConfig = {
  success: { icon: CheckCircle2, ring: 'ring-emerald-200', accent: 'text-emerald-600' },
  error: { icon: XCircle, ring: 'ring-rose-200', accent: 'text-rose-600' },
  info: { icon: Info, ring: 'ring-brand-200', accent: 'text-brand-700' },
} as const;

export function ToastContainer() {
  const toasts = useToast((s) => s.toasts);
  const dismiss = useToast((s) => s.dismiss);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const { icon: Icon, ring, accent } = toastConfig[toast.type];
  useEffect(() => {}, []);
  return (
    <div className={`pointer-events-auto flex items-start gap-3 rounded-xl bg-white px-4 py-3 shadow-cardHover ring-1 ${ring} animate-slide-down max-w-sm`}>
      <Icon className={`h-5 w-5 shrink-0 ${accent}`} />
      <p className="text-sm font-medium text-slate-700 flex-1">{toast.message}</p>
      <button onClick={() => onDismiss(toast.id)} className="text-slate-400 hover:text-slate-600 transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
