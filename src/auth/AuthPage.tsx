import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
  Shield,
  GraduationCap,
  Sparkles,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { DEMO_PASSWORD, useAuth } from './AuthProvider';
import type { UserRole } from './types';

export default function AuthPage() {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState<'signin' | 'signup'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@fluentarise.com');
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [role, setRole] = useState<'student' | 'instructor'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [isPendingError, setIsPendingError] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // If already authenticated, redirect to appropriate role portal
  useEffect(() => {
    if (user && user.status === 'active') {
      const from = (location.state as { from?: string })?.from;
      if (from && from !== '/login') {
        navigate(from, { replace: true });
        return;
      }
      if (user.role === 'super_admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'instructor') {
        navigate('/instructor', { replace: true });
      } else {
        navigate('/student', { replace: true });
      }
    }
  }, [user, navigate, location]);

  const handleRoleQuickFill = (targetRole: UserRole | 'pending') => {
    setError('');
    setIsPendingError(false);
    setRegistrationSuccess(false);
    setPassword(DEMO_PASSWORD);

    if (targetRole === 'super_admin') {
      setEmail('admin@fluentarise.com');
    } else if (targetRole === 'instructor') {
      setEmail('instructor@fluentarise.com');
    } else if (targetRole === 'student') {
      setEmail('student@fluentarise.com');
    } else if (targetRole === 'pending') {
      setEmail('pending@fluentarise.com');
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setIsPendingError(false);

    if (mode === 'signin') {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error);
        setIsPendingError(Boolean(result.isPending));
      } else if (result.user) {
        // Redirection handled by useEffect or here
        if (result.user.role === 'super_admin') {
          navigate('/admin');
        } else if (result.user.role === 'instructor') {
          navigate('/instructor');
        } else {
          navigate('/student');
        }
      }
    } else {
      // Sign up flow
      const result = await signUp(name, email, password, role);
      if (result.error) {
        setError(result.error);
      } else {
        setRegistrationSuccess(true);
        // Pre-fill email in sign-in for when it's activated
        setEmail(email);
      }
    }
    setBusy(false);
  };

  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      {/* Left Marketing Banner */}
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16 text-white">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />

        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/Gemini_Generated_Image_77j82y77j82y77j8.jpg"
              alt="FluentaRise"
              className="h-12 w-12 rounded-xl object-cover shadow-lg border border-white/10"
            />
            <span className="text-2xl font-extrabold tracking-tight text-white">
              Fluenta<span className="text-accent-400">Rise</span>
            </span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur hover:bg-white/20 transition"
          >
            <ArrowLeft size={14} /> Back to Website
          </Link>
        </div>

        <div className="relative z-10 max-w-xl my-auto py-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.18em] text-accent-300 backdrop-blur border border-white/10">
            <Sparkles size={14} /> Unified Academy Gateway
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl xl:text-6xl text-white">
            Transforming education through role-focused clarity.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
            Dedicated portals tailored for Students, Instructors, and Super Administrators. Everything you need to learn, teach, and govern.
          </p>

          <div className="mt-10 grid gap-3.5 sm:grid-cols-2">
            {[
              'Super Admin account approval verification',
              'Tailored Student learning hub & classroom',
              'Instructor grading & course management',
              'Quizzes, assignments & certificates',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-sm font-semibold text-slate-200">
                <CheckCircle2 size={18} className="text-accent-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-slate-400">
          <p>FluentaRise Academy · Kigali, Rwanda</p>
          <p>Secure Role-Based Access Control</p>
        </div>
      </section>

      {/* Right Form Section */}
      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10 bg-slate-50 lg:bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/Gemini_Generated_Image_77j82y77j82y77j8.jpg"
                alt="FluentaRise"
                className="h-10 w-10 rounded-lg object-cover"
              />
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                Fluenta<span className="text-accent-500">Rise</span>
              </span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              <ArrowLeft size={13} /> Back to Web
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800">
              <Shield size={13} /> Secure Academy Access
            </div>
            <h2 className="mt-3 font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
              {mode === 'signin' ? 'Sign in to your account' : 'Create your academy account'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {mode === 'signin'
                ? 'Sign in to access your role-based dashboard (Student, Instructor, or Super Admin).'
                : 'Join FluentaRise as a Student or Instructor. Accounts are activated upon Super Admin approval.'}
            </p>
          </div>

          {/* Registration Success Banner */}
          {registrationSuccess && (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-emerald-900">
                    Registration Submitted Successfully!
                  </h3>
                  <p className="mt-1 text-sm text-emerald-800 leading-relaxed">
                    Your account has been registered and is{' '}
                    <strong className="font-semibold underline">pending approval by the Super Admin</strong>.
                    As soon as an administrator activates your account, you will be able to log in.
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRegistrationSuccess(false);
                        setMode('signin');
                      }}
                      className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition"
                    >
                      Go to Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoleQuickFill('super_admin')}
                      className="rounded-xl border border-emerald-300 bg-white px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
                    >
                      Login as Super Admin to Approve
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Demo Selector for seamless testing */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Quick Demo Role Logins
              </p>
              <span className="text-[11px] font-semibold text-sky-600">Click to fill</span>
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <button
                type="button"
                onClick={() => handleRoleQuickFill('super_admin')}
                className={`flex flex-col items-center justify-center rounded-xl border p-2 text-center transition ${
                  email === 'admin@fluentarise.com'
                    ? 'border-sky-600 bg-sky-50 text-sky-900 ring-2 ring-sky-200'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Shield size={16} className="text-sky-600" />
                <span className="mt-1 text-xs font-bold">Super Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickFill('instructor')}
                className={`flex flex-col items-center justify-center rounded-xl border p-2 text-center transition ${
                  email === 'instructor@fluentarise.com'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-200'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <GraduationCap size={16} className="text-emerald-600" />
                <span className="mt-1 text-xs font-bold">Instructor</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickFill('student')}
                className={`flex flex-col items-center justify-center rounded-xl border p-2 text-center transition ${
                  email === 'student@fluentarise.com'
                    ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-200'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <UserRound size={16} className="text-purple-600" />
                <span className="mt-1 text-xs font-bold">Student</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickFill('pending')}
                className={`flex flex-col items-center justify-center rounded-xl border p-2 text-center transition ${
                  email === 'pending@fluentarise.com'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-200'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                title="Tests the blocked pending activation state"
              >
                <Clock size={16} className="text-amber-600" />
                <span className="mt-1 text-xs font-bold">Pending Demo</span>
              </button>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError('');
                setIsPendingError(false);
                setRegistrationSuccess(false);
              }}
              className={`rounded-lg px-3 py-2.5 text-sm font-bold transition ${
                mode === 'signin' ? 'bg-white text-brand-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
                setIsPendingError(false);
                setRegistrationSuccess(false);
              }}
              className={`rounded-lg px-3 py-2.5 text-sm font-bold transition ${
                mode === 'signup' ? 'bg-white text-brand-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Register (New Account)
            </button>
          </div>

          {/* Main Form */}
          <form onSubmit={submit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <Field
                  icon={<UserRound size={17} />}
                  label="Full name"
                  type="text"
                  value={name}
                  onChange={setName}
                  placeholder="e.g. Marie Claire Mukamana"
                />

                {/* Role Selection on Register */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    I am registering as:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className={`flex cursor-pointer flex-col rounded-xl border p-3 transition ${
                        role === 'student'
                          ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-200'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                          <UserRound size={16} className="text-brand-600" /> Student
                        </span>
                        <input
                          type="radio"
                          name="role"
                          checked={role === 'student'}
                          onChange={() => setRole('student')}
                          className="h-4 w-4 text-brand-600"
                        />
                      </div>
                      <span className="mt-1 text-[11px] text-slate-500">
                        Enroll in courses, take quizzes, earn certificates.
                      </span>
                    </label>

                    <label
                      className={`flex cursor-pointer flex-col rounded-xl border p-3 transition ${
                        role === 'instructor'
                          ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-200'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                          <GraduationCap size={16} className="text-emerald-600" /> Instructor
                        </span>
                        <input
                          type="radio"
                          name="role"
                          checked={role === 'instructor'}
                          onChange={() => setRole('instructor')}
                          className="h-4 w-4 text-brand-600"
                        />
                      </div>
                      <span className="mt-1 text-[11px] text-slate-500">
                        Manage course syllabus, create tests, grade students.
                      </span>
                    </label>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-start gap-2">
                  <Clock size={16} className="shrink-0 mt-0.5 text-amber-600" />
                  <span>
                    <strong>Approval Policy:</strong> All registered accounts require approval and activation by a Super Admin before they can log in.
                  </span>
                </div>
              </>
            )}

            <Field
              icon={<Mail size={17} />}
              label="Email address"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@fluentarise.com"
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                {mode === 'signin' && (
                  <span className="text-xs text-slate-400">Default demo: FluentaRise2026!</span>
                )}
              </div>
              <div className="relative">
                <LockKeyhole
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  required
                  minLength={6}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-slate-200 bg-white px-11 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className={`rounded-xl p-4 text-sm font-medium ${
                  isPendingError
                    ? 'border border-amber-300 bg-amber-50 text-amber-900'
                    : 'border border-red-200 bg-red-50 text-red-700'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {isPendingError ? (
                    <Clock size={18} className="mt-0.5 shrink-0 text-amber-600" />
                  ) : (
                    <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-600" />
                  )}
                  <div>
                    <p className="font-bold">
                      {isPendingError ? 'Account Pending Super Admin Activation' : 'Authentication Error'}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed">{error}</p>
                    {isPendingError && (
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRoleQuickFill('super_admin')}
                          className="rounded-lg bg-amber-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-900 transition"
                        >
                          Sign in as Super Admin to Activate
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-800 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-900/20 transition hover:bg-brand-900 disabled:cursor-wait disabled:opacity-60"
            >
              {busy ? (
                'Processing…'
              ) : mode === 'signin' ? (
                <>
                  Sign in to Dashboard <ArrowRight size={17} />
                </>
              ) : (
                <>
                  Submit for Approval <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-xs font-semibold text-slate-500 hover:text-brand-800 transition"
            >
              ← Return to public website
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({
  icon,
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
        <input
          required
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-white px-11 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
        />
      </div>
    </div>
  );
}
