import { Award, Download, CheckCircle2, ShieldCheck, Printer, Calendar } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';

export default function StudentCertificates() {
  const { user } = useAuth();

  const certificates = [
    {
      id: 'cert_ielts_2026',
      courseTitle: 'IELTS Academic Examination Masterclass',
      category: 'Exam Preparation & English Excellence',
      instructor: 'Diane Mukamana',
      issueDate: 'October 14, 2026',
      credentialId: 'FA-CERT-2026-89421',
      grade: 'Distinction (Band 8.0 Equivalent)',
    },
  ];

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

      <div className="grid gap-6 lg:grid-cols-2">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="relative overflow-hidden rounded-3xl border-2 border-amber-200 bg-white p-6 sm:p-8 shadow-xl"
          >
            {/* Elegant Certificate Border Accent */}
            <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <img
                  src="/Gemini_Generated_Image_77j82y77j82y77j8.jpg"
                  alt="FluentaRise"
                  className="h-10 w-10 rounded-lg object-cover"
                />
                <div>
                  <span className="text-sm font-extrabold tracking-tight text-slate-900">
                    Fluenta<span className="text-accent-500">Rise</span> Academy
                  </span>
                  <p className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">
                    Official Certificate of Completion
                  </p>
                </div>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-100 text-amber-700 shadow-inner">
                <Award size={22} />
              </div>
            </div>

            <div className="py-6 text-center">
              <p className="text-xs uppercase tracking-widest text-slate-400">
                This certifies that
              </p>
              <h2 className="mt-2 font-display text-2xl font-extrabold text-slate-950 sm:text-3xl">
                {user?.name || 'Jean Eric Mugabo'}
              </h2>
              <p className="mt-3 text-xs text-slate-600">
                has successfully completed all lectures, curriculum assessments, and practical capstones for
              </p>
              <p className="mt-2 font-display text-lg font-bold text-purple-900">
                {cert.courseTitle}
              </p>
              <span className="mt-2 inline-block rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800">
                {cert.grade}
              </span>
            </div>

            <div className="border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between text-xs text-slate-500">
              <div>
                <p className="text-[11px] font-bold text-slate-800">Instructor: {cert.instructor}</p>
                <p className="text-[10px] text-slate-400">Issued on {cert.issueDate}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[11px] font-bold text-slate-700">
                  ID: {cert.credentialId}
                </p>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                  <ShieldCheck size={12} /> Verified Credential
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <Printer size={14} /> Print Certificate
              </button>
              <button
                onClick={() => alert(`Certificate ${cert.credentialId} ready for download.`)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 transition shadow-sm"
              >
                <Download size={14} /> Download PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
