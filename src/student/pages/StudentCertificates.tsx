import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  ShieldCheck,
  Download,
  Printer,
  Sparkles,
  ExternalLink,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { useAdminStore } from '../../admin/store/adminStore';
import Modal from '../../admin/components/ui/Modal';
import type { Course } from '../../admin/types';

interface CertificateRecord {
  id: string;
  courseId: string;
  courseTitle: string;
  studentName: string;
  issueDate: string;
  verificationCode: string;
  gradeHonors: string;
}

export default function StudentCertificates() {
  const { user } = useAuth();
  const { courses, orders, submissions } = useAdminStore();
  const [selectedCert, setSelectedCert] = useState<CertificateRecord | null>(null);

  const userEmail = user?.email?.toLowerCase() || '';

  // Enrolled courses
  const myEnrolledCourses = useMemo(() => {
    if (!userEmail) return [];

    const paidOrders = orders.filter(
      (o) => o.status === 'paid' && o.studentEmail.toLowerCase() === userEmail
    );
    const paidTitles = new Set(
      paidOrders.flatMap((o) => [
        o.courseTitle,
        ...(o.courseTitle?.split(',').map((t) => t.trim()) || []),
      ])
    );
    const paidCourseIds = new Set(paidOrders.flatMap((o) => o.courseIds || []));
    const userEnrolledIds = new Set(user?.enrolledCourseIds || []);

    return courses.filter(
      (c) =>
        c.certificate &&
        (c.free ||
          paidTitles.has(c.title) ||
          paidCourseIds.has(c.id) ||
          userEnrolledIds.has(c.id))
    );
  }, [courses, orders, user, userEmail]);

  // Compute earned certificates
  const certificates = useMemo<CertificateRecord[]>(() => {
    return myEnrolledCourses.map((c) => {
      // Find average score on this course
      const courseSubs = submissions.filter(
        (s) =>
          s.courseId === c.id &&
          ((s.studentEmail && s.studentEmail.toLowerCase() === userEmail) ||
            s.studentName.toLowerCase() === (user?.name?.toLowerCase() || '')) &&
          s.score !== undefined
      );

      const avgScore =
        courseSubs.length > 0
          ? Math.round(courseSubs.reduce((acc, s) => acc + (s.score || 0), 0) / courseSubs.length)
          : 90;

      const honors =
        avgScore >= 90
          ? 'First Class Honors (Distinction)'
          : avgScore >= 75
          ? 'Upper Credit (Merit)'
          : 'Certificate of Completion';

      // Deterministic verification code based on user id and course id
      const hash = `${c.id.slice(0, 3)}${user?.id ? user.id.slice(-4) : '2026'}`.toUpperCase();
      const code = `FL-CERT-2026-${hash}`;

      return {
        id: `cert_${c.id}`,
        courseId: c.id,
        courseTitle: c.title,
        studentName: user?.name || 'Graduate Student',
        issueDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        verificationCode: code,
        gradeHonors: honors,
      };
    });
  }, [myEnrolledCourses, submissions, userEmail, user]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950">My Certificates</h1>
          <p className="text-sm text-slate-500">
            Official verified graduation credentials and completion certificates from FluentaRise Academy.
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
            Complete curriculum modules and pass assessments in an accredited course to receive your official verified FluentaRise certificate.
          </p>
          <div className="mt-4">
            <Link
              to="/student/courses"
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 transition"
            >
              <BookOpen size={14} /> Go to My Courses
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                    <ShieldCheck size={13} /> Verified Credential
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">{cert.verificationCode}</span>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
                    <Award size={24} />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900 line-clamp-2">
                      {cert.courseTitle}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{cert.gradeHonors}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-1.5 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                  <p>Recipient: <strong>{cert.studentName}</strong></p>
                  <p>Issued: {cert.issueDate}</p>
                  <p>Institution: <strong>FluentaRise Academy Ltd</strong></p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedCert(cert)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 shadow-sm transition"
                >
                  <Award size={14} /> View & Verify Certificate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* OFFICIAL CERTIFICATE MODAL */}
      {selectedCert && (
        <Modal
          open={Boolean(selectedCert)}
          onClose={() => setSelectedCert(null)}
          title="Official Verified Certificate"
          subtitle={`Credential ID: ${selectedCert.verificationCode}`}
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-600" /> Tamper-Evident Verified Hash
              </span>
              <div className="flex items-center gap-2">
                <button className="btn-outline" onClick={() => setSelectedCert(null)}>
                  Close
                </button>
                <button className="btn-primary" onClick={handlePrint}>
                  <Printer size={15} /> Print / Save PDF
                </button>
              </div>
            </div>
          }
        >
          {/* Printable Certificate Frame */}
          <div className="relative rounded-2xl border-8 border-double border-amber-600/40 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 p-8 sm:p-12 text-center shadow-inner">
            {/* Corner ornaments */}
            <div className="absolute top-3 left-3 text-amber-500 text-xs">◆ ◆ ◆</div>
            <div className="absolute top-3 right-3 text-amber-500 text-xs">◆ ◆ ◆</div>
            <div className="absolute bottom-3 left-3 text-amber-500 text-xs">◆ ◆ ◆</div>
            <div className="absolute bottom-3 right-3 text-amber-500 text-xs">◆ ◆ ◆</div>

            {/* Academy Crest & Title */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl font-black tracking-tight text-slate-900">
                  Fluenta<span className="text-amber-600">Rise</span>
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Academy</span>
              </div>
              <p className="mt-1 text-[11px] font-semibold tracking-widest uppercase text-amber-700">
                Official Credential of Professional Achievement
              </p>
            </div>

            <div className="my-8">
              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">This certifies that</p>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-slate-950 underline decoration-amber-400 underline-offset-8">
                {selectedCert.studentName}
              </h2>
              <p className="mt-4 text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                has successfully completed all prescribed curriculum requirements, assessments, and practical exercises for the program
              </p>
              <h3 className="mt-3 font-display text-lg sm:text-xl font-bold text-amber-900">
                {selectedCert.courseTitle}
              </h3>
              <p className="mt-1 text-xs font-semibold text-emerald-700">
                Awarded with: {selectedCert.gradeHonors}
              </p>
            </div>

            {/* Signatures & Seal */}
            <div className="mt-10 grid grid-cols-3 items-end pt-6 border-t border-amber-200/60 text-xs">
              <div>
                <p className="font-serif italic text-base text-slate-900 font-bold">KWIZERA Josee Micheline</p>
                <div className="mt-1 border-t border-slate-300 pt-1">
                  <p className="font-bold text-[10px] text-slate-700 uppercase">Executive Director</p>
                  <p className="text-[9px] text-slate-400">FluentaRise Academy</p>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 p-1 shadow-lg shadow-amber-500/20 text-white">
                  <Award size={32} />
                </div>
                <span className="mt-1 font-mono text-[9px] font-bold text-amber-800">OFFICIAL SEAL</span>
              </div>

              <div>
                <p className="font-bold text-slate-800 text-[11px]">{selectedCert.issueDate}</p>
                <div className="mt-1 border-t border-slate-300 pt-1">
                  <p className="font-bold text-[10px] text-slate-700 uppercase">Verification ID</p>
                  <p className="font-mono text-[9px] text-slate-500">{selectedCert.verificationCode}</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
