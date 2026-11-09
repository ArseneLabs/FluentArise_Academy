import { Link, NavLink } from 'react-router-dom';
import { X, GraduationCap, LogIn, UserPlus, ArrowRight } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/courses', label: 'Courses' },
  { to: '/blog', label: 'Blog' },
  { to: '/events', label: 'Events' },
  { to: '/contact', label: 'Contact' },
];

export default function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-80 max-w-[85%] bg-white shadow-2xl animate-slide-in-right flex flex-col">
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
          <Link to="/" onClick={onClose} className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg gradient-brand text-white">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-brand-900">
              Fluenta<span className="text-accent-500">Rise</span>
            </span>
          </Link>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-3 text-base font-semibold transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-4 space-y-2">
          <Link to="/contact" onClick={onClose} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
            <LogIn className="h-4 w-4" /> Login
          </Link>
          <Link to="/contact" onClick={onClose} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
            <UserPlus className="h-4 w-4" /> Register
          </Link>
          <Link to="/courses" onClick={onClose} className="flex items-center justify-center gap-2 rounded-xl gradient-accent px-4 py-2.5 text-sm font-semibold text-white shadow-accent">
            Apply Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
