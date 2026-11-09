import { Star } from 'lucide-react';

export default function StarRating({
  rating,
  size = 'sm',
  showValue = false,
  count,
}: {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  count?: number;
}) {
  const sizes = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' };
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => {
          const filled = i < full;
          const half = i === full && hasHalf;
          return (
            <span key={i} className="relative">
              <Star className={`${sizes[size]} text-slate-200`} />
              {(filled || half) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: filled ? '100%' : '50%' }}
                >
                  <Star className={`${sizes[size]} fill-amber-400 text-amber-400`} />
                </span>
              )}
            </span>
          );
        })}
      </div>
      {showValue && <span className="text-sm font-semibold text-slate-700">{rating.toFixed(1)}</span>}
      {count !== undefined && <span className="text-xs text-slate-400">({count})</span>}
    </div>
  );
}
