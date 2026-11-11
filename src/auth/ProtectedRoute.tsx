import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import type { ReactNode } from 'react';
import type { UserRole } from './types';
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-100 border-t-sky-600" />
          <p className="text-sm font-medium text-slate-500">Checking credentials…</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Role validation
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const roleHome =
      user.role === 'super_admin'
        ? '/admin'
        : user.role === 'instructor'
        ? '/instructor'
        : '/student';

    const roleName =
      user.role === 'super_admin'
        ? 'Super Admin'
        : user.role === 'instructor'
        ? 'Instructor'
        : 'Student';

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <ShieldAlert size={28} />
          </div>
          <h2 className="mt-4 font-display text-xl font-bold text-slate-900">
            Access Restricted
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            This section is restricted to{' '}
            <span className="font-semibold text-slate-900">
              {allowedRoles.map((r) => (r === 'super_admin' ? 'Super Admin' : r === 'instructor' ? 'Instructors' : 'Students')).join(' or ')}
            </span>
            . You are currently signed in as a{' '}
            <span className="inline-flex items-center rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-bold text-sky-800">
              {roleName}
            </span>
            .
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Link
              to={roleHome}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-600/20 hover:bg-sky-700 transition"
            >
              <LayoutDashboard size={16} /> Go to My {roleName} Portal
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <ArrowLeft size={16} /> Return to Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
