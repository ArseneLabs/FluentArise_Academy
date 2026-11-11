import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  FileCheck2,
  ShoppingCart,
  Users,
  CalendarDays,
  Newspaper,
  Settings,
  LogOut,
  X,
  GraduationCap,
  Globe,
  UserCheck,
  Shield,
  Layers,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useAuth } from '../../auth/AuthProvider';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
  badge?: number;
}

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, signOut, pendingUsersCount } = useAuth();

  const mainNav: NavItem[] = [
    { to: '/admin', label: 'Overview', icon: <LayoutDashboard size={18} />, end: true },
    { to: '/admin/courses', label: 'Course Management', icon: <BookOpen size={18} /> },
    { to: '/admin/assessments', label: 'Tasks & Assessments', icon: <ClipboardList size={18} /> },
    { to: '/admin/submissions', label: 'Submissions & Grading', icon: <FileCheck2 size={18} /> },
    { to: '/admin/enrollments', label: 'Enrollments & Orders', icon: <ShoppingCart size={18} /> },
  ];

  const adminOpsNav: NavItem[] = [
    {
      to: '/admin/users',
      label: 'Users & Approvals',
      icon: <UserCheck size={18} />,
      badge: pendingUsersCount > 0 ? pendingUsersCount : undefined,
    },
    { to: '/admin/instructors', label: 'Instructors', icon: <Users size={18} /> },
    { to: '/admin/events', label: 'Events & Workshops', icon: <CalendarDays size={18} /> },
    { to: '/admin/blog', label: 'Blog & Content', icon: <Newspaper size={18} /> },
    { to: '/admin/settings', label: 'Platform Settings', icon: <Settings size={18} /> },
  ];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <Link to="/admin" className="flex items-center gap-2.5">
            <img
              src="/Gemini_Generated_Image_77j82y77j82y77j8.jpg"
              alt="FluentaRise"
              className="h-10 w-10 rounded-lg object-cover"
            />
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              Fluenta<span className="text-accent-500">Rise</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Role Banner */}
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700">
            <Shield size={14} />
            <span>Super Admin Workspace</span>
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-500">{user?.name || user?.email}</p>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <div>
            <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Learning
            </p>
            <div className="space-y-1">
              {mainNav.map((item) => (
                <NavRow key={item.to} item={item} onNavigate={onClose} />
              ))}
            </div>
          </div>

          <div>
            <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Administration & Approvals
            </p>
            <div className="space-y-1">
              {adminOpsNav.map((item) => (
                <NavRow key={item.to} item={item} onNavigate={onClose} />
              ))}
            </div>
          </div>

          <div>
            <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Portals Preview
            </p>
            <div className="space-y-1">
              <Link
                to="/instructor"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition"
              >
                <GraduationCap size={16} className="text-emerald-600" />
                <span>Instructor Portal</span>
              </Link>
              <Link
                to="/student"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition"
              >
                <Layers size={16} className="text-purple-600" />
                <span>Student Portal</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Footer actions */}
        <div className="border-t border-slate-100 p-4 space-y-2 bg-slate-50/50">
          <Link
            to="/"
            className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-sm"
          >
            <Globe size={15} /> View Public Website
          </Link>
          <button
            onClick={() => void signOut()}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

function NavRow({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
          isActive
            ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20'
            : 'text-slate-600 hover:bg-sky-50 hover:text-sky-700'
        }`
      }
    >
      <div className="flex items-center gap-3 truncate">
        <span className="shrink-0 transition-transform group-hover:scale-110">{item.icon}</span>
        <span className="truncate">{item.label}</span>
      </div>
      {typeof item.badge === 'number' && item.badge > 0 && (
        <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-extrabold text-white shadow-sm">
          {item.badge}
        </span>
      )}
    </NavLink>
  );
}
