export default function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button onClick={() => onChange(!checked)} className="flex items-center gap-3" type="button">
      <span className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-coral-500' : 'bg-slate-200 dark:bg-ink-600'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
    </button>
  );
}
