import { useState, useEffect } from 'react';
import { Settings, Globe, Coins, Bell, Shield, Palette, Mail, Save, CheckCircle2 } from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { PageHeader } from '../components/AdminLayout';
import Toggle from '../components/ui/Toggle';
import type { PlatformSettingsData } from '../types';

function SectionCard({ icon, title, desc, children }: { icon: React.ReactNode; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-coral-50 text-coral-600 dark:bg-coral-500/15 dark:text-coral-400">
          {icon}
        </div>
        <div>
          <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">{title}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default function PlatformSettings() {
  const { theme, toggleTheme, platformSettings, updatePlatformSettings } = useAdminStore();

  const [currency, setCurrency] = useState(platformSettings.currency || 'Rwandan Franc (Rwf)');
  const [language, setLanguage] = useState(platformSettings.language || 'English');
  const [timezone, setTimezone] = useState(platformSettings.timezone || 'Africa/Kigali');
  const [emailNotifs, setEmailNotifs] = useState(platformSettings.emailNotifications ?? true);
  const [submissionAlerts, setSubmissionAlerts] = useState(platformSettings.submissionAlerts ?? true);
  const [enrollmentAlerts, setEnrollmentAlerts] = useState(platformSettings.enrollmentAlerts ?? true);

  const [paymentMethods, setPaymentMethods] = useState({
    momo: platformSettings.paymentMethods?.momo ?? true,
    airtel: platformSettings.paymentMethods?.airtel ?? true,
    card: platformSettings.paymentMethods?.card ?? true,
    bank: platformSettings.paymentMethods?.bank ?? true,
  });

  const [twoFactor, setTwoFactor] = useState(false);
  const [autoGrade, setAutoGrade] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (platformSettings) {
      setCurrency(platformSettings.currency || 'Rwandan Franc (Rwf)');
      setLanguage(platformSettings.language || 'English');
      setTimezone(platformSettings.timezone || 'Africa/Kigali');
      setEmailNotifs(platformSettings.emailNotifications ?? true);
      setSubmissionAlerts(platformSettings.submissionAlerts ?? true);
      setEnrollmentAlerts(platformSettings.enrollmentAlerts ?? true);
      if (platformSettings.paymentMethods) {
        setPaymentMethods(platformSettings.paymentMethods);
      }
    }
  }, [platformSettings]);

  const handleSave = () => {
    const updated: PlatformSettingsData = {
      currency,
      language,
      timezone,
      emailNotifications: emailNotifs,
      submissionAlerts,
      enrollmentAlerts,
      paymentMethods,
    };

    updatePlatformSettings(updated);
    setToastMessage('Platform settings saved and synchronized successfully!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <>
      <PageHeader
        title="Platform Settings"
        subtitle="Configure global preferences, payment methods, and automated notifications"
        icon={<Settings size={20} />}
        actions={
          <button className="btn-primary" onClick={handleSave}>
            <Save size={16} /> Save Changes
          </button>
        }
      />

      {toastMessage && (
        <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900 shadow-sm">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard icon={<Globe size={18} />} title="Localization" desc="Language, regional format, and time standard">
          <div>
            <label className="label">Default Language</label>
            <select className="input" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option>English</option>
              <option>Kinyarwanda</option>
              <option>French</option>
            </select>
          </div>
          <div>
            <label className="label">Timezone</label>
            <select className="input" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
              <option value="Africa/Kigali">Africa/Kigali (CAT)</option>
              <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </SectionCard>

        <SectionCard icon={<Coins size={18} />} title="Currency & Payment Gateways" desc="Accepted checkout payment channels">
          <div>
            <label className="label">Display Currency</label>
            <select className="input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option>Rwandan Franc (Rwf)</option>
              <option>US Dollar (USD)</option>
              <option>Euro (EUR)</option>
            </select>
          </div>
          <div className="space-y-2 pt-2">
            <Toggle
              label="MTN Mobile Money (MoMo)"
              checked={paymentMethods.momo}
              onChange={(val) => setPaymentMethods((prev) => ({ ...prev, momo: val }))}
            />
            <Toggle
              label="Airtel Money"
              checked={paymentMethods.airtel}
              onChange={(val) => setPaymentMethods((prev) => ({ ...prev, airtel: val }))}
            />
            <Toggle
              label="Credit & Debit Card (Pesapal)"
              checked={paymentMethods.card}
              onChange={(val) => setPaymentMethods((prev) => ({ ...prev, card: val }))}
            />
            <Toggle
              label="Bank Transfer (Bank of Kigali)"
              checked={paymentMethods.bank}
              onChange={(val) => setPaymentMethods((prev) => ({ ...prev, bank: val }))}
            />
          </div>
        </SectionCard>

        <SectionCard icon={<Bell size={18} />} title="Automated Notifications" desc="System alerts & transactional emails">
          <Toggle label="Student transactional emails" checked={emailNotifs} onChange={setEmailNotifs} />
          <Toggle label="Instructor submission alerts" checked={submissionAlerts} onChange={setSubmissionAlerts} />
          <Toggle label="Admin order alerts" checked={enrollmentAlerts} onChange={setEnrollmentAlerts} />
        </SectionCard>

        <SectionCard icon={<Palette size={18} />} title="Appearance" desc="Theme and styling">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-ink-700">
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Dark Mode</p>
              <p className="text-xs text-slate-400">Toggle dark mode interface</p>
            </div>
            <Toggle label="" checked={theme === 'dark'} onChange={toggleTheme} />
          </div>
        </SectionCard>

        <SectionCard icon={<Shield size={18} />} title="Security & Evaluations" desc="Access control and assessment rules">
          <Toggle label="Require two-factor authentication" checked={twoFactor} onChange={setTwoFactor} />
          <Toggle label="Auto-grade objective quizzes and tests" checked={autoGrade} onChange={setAutoGrade} />
        </SectionCard>

        <SectionCard icon={<Mail size={18} />} title="Email Templates" desc="Active automated email workflows">
          <div className="space-y-2">
            {[
              'Order Placed Confirmation',
              'Account Approved Notification',
              'Live Class Scheduled Invitation',
              'Assignment Graded with Feedback',
            ].map((t) => (
              <div key={t} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-ink-700">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{t}</span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Active
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </>
  );
}
