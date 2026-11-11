export function formatRwf(n: number): string {
  if (n === 0) return 'Free';
  return `${n.toLocaleString('en-US')} Rwf`;
}

export function formatCompactRwf(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M Rwf`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K Rwf`;
  return `${n} Rwf`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function relativeDate(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  const days = Math.round(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days > 0) return `in ${days} days`;
  return `${Math.abs(days)} days ago`;
}
