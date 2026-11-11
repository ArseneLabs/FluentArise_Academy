import { Settings, Globe, Coins, Bell, Shield, Palette, Mail, Save } from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { PageHeader } from '../components/AdminLayout';
import Toggle from '../components/ui/Toggle';
import { useState } from 'react';

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
  const { theme, toggleTheme } = useAdminStore();
  const [currency, setCurrency] = useState('Rwandan Franc (Rwf)');
  const [language, setLanguage] = useState('English');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [submissionAlerts, setSubmissionAlerts] = useState(true);
  const [enrollmentAlerts, setEnrollmentAlerts] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [autoGrade, setAutoGrade] = useState(true);

  return (
    <>
      <PageHeader
        title="Platform Settings"
        subtitle="Configure global preferences for FluentaRise"
        icon={<Settings size={20} />}
        actions={<button className="btn-primary"><Save size={16} /> Save Changes</button>}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard icon={<Globe size={18} />} title="Localization" desc="Language and regional settings">
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
            <select className="input" defaultValue="Africa/Kigali">
              <option>Africa/Kigali (CAT)</option>
              <option>Africa/Nairobi (EAT)</option>
              <option>UTC</option>
            </select>
          </div>
        </SectionCard>

        <SectionCard icon={<Coins size={18} />} title="Currency & Payments" desc="Accepted payment methods">
          <div>
            <label className="label">Display Currency</label>
            <select className="input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option>Rwandan Franc (Rwf)</option>
              <option>US Dollar (USD)</option>
              <option>Euro (EUR)</option>
            </select>
          </div>
          <div className="space-y-2">
            <Toggle label="MTN Mobile Money" checked={true} onChange={() => {}} />
            <Toggle label="Airtel Money" checked={true} onChange={() => {}} />
            <Toggle label="Card payments (Visa/Mastercard)" checked={true} onChange={() => {}} />
            <Toggle label="Bank Transfer" checked={false} onChange={() => {}} />
          </div>
        </SectionCard>

        <SectionCard icon={<Bell size={18} />} title="Notifications" desc="Admin alert preferences">
          <Toggle label="Email notifications" checked={emailNotifs} onChange={setEmailNotifs} />
          <Toggle label="New submission alerts" checked={submissionAlerts} onChange={setSubmissionAlerts} />
          <Toggle label="New enrollment alerts" checked={enrollmentAlerts} onChange={setEnrollmentAlerts} />
        </SectionCard>

        <SectionCard icon={<Palette size={18} />} title="Appearance" desc="Theme and branding">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-ink-700">
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Dark Mode</p>
              <p className="text-xs text-slate-400">Toggle the admin console theme</p>
            </div>
            <Toggle label="" checked={theme === 'dark'} onChange={toggleTheme} />
          </div>
          <div>
            <label className="label">Brand Color</label>
            <div className="flex gap-2">
              {['#ff5722', '#f97316', '#3b82f6', '#10b981'].map((c) => (
                <button key={c} className={`h-9 w-9 rounded-xl ring-2 ring-offset-2 transition ${c === '#ff5722' ? 'ring-coral-500' : 'ring-transparent'}`} style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={<Shield size={18} />} title="Security" desc="Access control and grading">
          <Toggle label="Require two-factor authentication" checked={twoFactor} onChange={setTwoFactor} />
          <Toggle label="Auto-grade quizzes and tests" checked={autoGrade} onChange={setAutoGrade} />
        </SectionCard>

        <SectionCard icon={<Mail size={18} />} title="Email Templates" desc="Automated student emails">
          <div className="space-y-2">
            {['Enrollment confirmation', 'Submission received', 'Grade published', 'Course announcement'].map((t) => (
              <div key={t} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-ink-700">
                <span className="text-sm text-slate-700 dark:text-slate-200">{t}</span>
                <button className="text-xs font-semibold text-coral-600 hover:text-coral-700">Edit</button>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </>
  );
}
