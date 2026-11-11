import { useState, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return <div className="min-h-screen bg-slate-50"><Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /><div className="lg:pl-72"><Header onMenu={() => setSidebarOpen(true)} /><main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"><Outlet /></main></div></div>;
}

export function PageHeader({ title, subtitle, actions, icon }: { title: string; subtitle?: string; actions?: ReactNode; icon?: ReactNode }) {
  return <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3">{icon && <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-100 text-sky-700">{icon}</div>}<div><h1 className="font-display text-2xl font-bold tracking-tight text-slate-950">{title}</h1>{subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}</div></div>{actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}</div>;
}
