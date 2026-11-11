import { Award, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';

export default function StudentCertificates() {
  const { user } = useAuth();
  const certificates: any[] = [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950">My Certificates</h1>
          <p className="text-sm text-slate-500">
            Official verified graduation credentials from FluentaRise Academy.
          </p>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          <Award size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-display text-base font-bold text-slate-800">
            No certificates earned yet
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Complete all curriculum modules, quizzes, and project assignments in an accredited course to receive your official verified FluentaRise certificate.
          </p>
        </div>
      ) : null}
    </div>
  );
}
