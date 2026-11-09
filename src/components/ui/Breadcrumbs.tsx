import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface Crumb {
  label: string;
  to?: string;
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          {item.to ? (
            <Link to={item.to} className="text-white/70 hover:text-white transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-white">{item.label}</span>
          )}
          {i < items.length - 1 && <ChevronRight className="h-4 w-4 text-white/40" />}
        </div>
      ))}
    </nav>
  );
}
