import { Link } from 'react-router-dom';
import { Phone, Mail, LogIn, UserPlus, ArrowRight, Shield, GraduationCap, UserRound, LogOut } from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';

export default function AnnouncementBar() {
  const { user, signOut } = useAuth();

  const roleLink =
    user?.role === 'super_admin'
      ? '/admin'
      : user?.role === 'instructor'
      ? '/instructor'
      : '/student';

  const roleLabel =
    user?.role === 'super_admin'
      ? 'Admin Console'
      : user?.role === 'instructor'
      ? 'Instructor Portal'
      : 'My Learning';

  return (
    <div className="gradient-brand text-white text-sm">
      <div className="container-page flex h-10 items-center justify-between gap-4">
        <div className="hidden items-center gap-5 sm:flex">
          <a href="tel:+250795041000" className="flex items-center gap-1.5 text-white/85 hover:text-white transition-colors">
            <Phone className="h-3.5 w-3.5" />
            <span>0795041000</span>
          </a>
          <a href="mailto:kjmicheline@gmail.com" className="flex items-center gap-1.5 text-white/85 hover:text-white transition-colors">
            <Mail className="h-3.5 w-3.5" />
            <span>kjmicheline@gmail.com</span>
          </a>
        </div>

        <div className="flex items-center gap-4 sm:gap-5 ml-auto sm:ml-0">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to={roleLink}
                className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white hover:bg-white/25 transition-colors"
              >
                {user.role === 'super_admin' ? (
                  <Shield className="h-3 w-3 text-accent-300" />
                ) : user.role === 'instructor' ? (
                  <GraduationCap className="h-3 w-3 text-emerald-300" />
                ) : (
                  <UserRound className="h-3 w-3 text-sky-300" />
                )}
                <span>{roleLabel} ({user.name.split(' ')[0]})</span>
              </Link>
              <button
                onClick={() => void signOut()}
                className="hidden sm:flex items-center gap-1 text-xs text-white/70 hover:text-white transition-colors"
                title="Sign out"
              >
                <LogOut className="h-3 w-3" />
                <span>Sign out</span>
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="hidden items-center gap-1.5 text-white/85 hover:text-white transition-colors sm:flex">
                <LogIn className="h-3.5 w-3.5" />
                <span>Login</span>
              </Link>
              <Link to="/login?mode=signup" className="hidden items-center gap-1.5 text-white/85 hover:text-white transition-colors sm:flex">
                <UserPlus className="h-3.5 w-3.5" />
                <span>Register</span>
              </Link>
            </>
          )}

          <Link
            to="/courses"
            className="flex items-center gap-1.5 rounded-full bg-accent-500 px-3.5 py-1.5 font-semibold text-white hover:bg-accent-600 transition-colors"
          >
            Apply Now
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
