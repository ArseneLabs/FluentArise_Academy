import { useState, type ReactNode } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  Award,
  ShoppingCart,
  Compass,
  LogOut,
  X,
  Menu,
  GraduationCap,
  Globe,
  ChevronDown,
  Sparkles,
  Video,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
}

const navItems: NavItem[] = [
  { to: '/student', label: 'My Learning Hub', icon: <LayoutDashboard size={18} />, end: true },
  { to: '/student/courses', label: 'My Enrolled Courses', icon: <BookOpen size={18} /> },
  { to: '/student/tasks', label: 'Tasks & Quizzes', icon: <HelpCircle size={18} /> },
  { to: '/student/live-classes', label: 'Live Classes & Workshops', icon: <Video size={18} /> },
  { to: '/student/certificates', label: 'My Certificates', icon: <Award size={18} /> },
  { to: '/student/orders', label: 'Order History', icon: <ShoppingCart size={18} /> },
];

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, signOut } = useAuth();

  const initials = (user?.name || user?.email || 'Student').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <Link to="/student" className="flex items-center gap-2.5">
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
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Role Identity */}
        <div className="border-b border-slate-100 bg-purple-50/60 px-5 py-3.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-800">
            <GraduationCap size={15} />
            <span>Student Learning Portal</span>
          </div>
          <p className="mt-0.5 font-semibold text-xs text-slate-700 truncate">
            {user?.name || 'Enrolled Student'}
          </p>
          <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            My Learning
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                    : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                }`
              }
            >
              <span className="shrink-0 transition-transform group-hover:scale-110">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}

          <div className="pt-4">
            <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Explore More
            </p>
            <Link
              to="/courses"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              <Compass size={18} className="text-slate-400" />
              <span>Browse All Courses</span>
            </Link>
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-100 p-4 space-y-2 bg-slate-50/50">
          <Link
            to="/"
            className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-sm"
          >
            <Globe size={15} /> Public Academy Website
          </Link>
          <button
            onClick={() => void signOut()}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="rounded-full bg-purple-100 px-3 py-0.5 text-xs font-bold text-purple-800">
                Student Portal
              </span>
              <span className="text-xs text-slate-400">· Active Learner Session</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/courses"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-800 hover:bg-purple-100 transition"
            >
              <Sparkles size={13} /> Find New Courses
            </Link>

            <div className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl p-1 pr-2 hover:bg-slate-100 transition"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-purple-100 text-xs font-bold text-purple-700">
                  {initials}
                </span>
                <div className="hidden text-left sm:block">
                  <p className="max-w-32 truncate text-sm font-bold text-slate-800">
                    {user?.name || 'Student'}
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
                    <span className="mt-1.5 inline-block rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800 uppercase">
                      Student
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

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
