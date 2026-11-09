import { Link } from 'react-router-dom';
import { Clock, Users, ShoppingCart, Check } from 'lucide-react';
import type { Course } from '@/types';
import { getInstructor, formatRwf } from '@/data/courses';
import { useCart } from '@/store/cart';
import { useToast } from '@/store/toast';
import StarRating from './StarRating';

const categoryColors: Record<string, string> = {
  'English Fluency': 'bg-brand-50 text-brand-700',
  'Java & OOP': 'bg-sky-50 text-sky-700',
  'Web Development': 'bg-emerald-50 text-emerald-700',
  'Exam Prep': 'bg-amber-50 text-amber-700',
};

export default function CourseCard({ course }: { course: Course }) {
  const add = useCart((s) => s.add);
  const inCart = useCart((s) => s.has(course.id));
  const push = useToast((s) => s.push);
  const instructor = getInstructor(course.instructorId);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = add(course);
    if (added) push(`${course.title} added to cart`, 'success');
    else push('This course is already in your cart', 'info');
  };

  return (
    <Link
      to={`/courses/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-cardHover"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${categoryColors[course.category]}`}>
          {course.category}
        </span>
        {course.oldPrice && (
          <span className="absolute right-3 top-3 rounded-full bg-accent-500 px-2.5 py-1 text-xs font-bold text-white">
            -{Math.round((1 - course.price / course.oldPrice) * 100)}%
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="h-3.5 w-3.5" />
          <span>{course.duration}</span>
          <span className="mx-1">•</span>
          <span>{course.lessons} lessons</span>
        </div>

        <h3 className="mt-2 line-clamp-2 text-base font-bold leading-snug text-slate-800 group-hover:text-brand-700 transition-colors">
          {course.title}
        </h3>

        <p className="mt-1 text-sm text-slate-500">by {instructor?.name}</p>

        <div className="mt-3 flex items-center gap-2">
          <StarRating rating={course.rating} showValue />
          <span className="text-xs text-slate-400">({course.reviewsCount})</span>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          <Users className="h-3.5 w-3.5" />
          <span>{course.students.toLocaleString()} students enrolled</span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold text-brand-900">{formatRwf(course.price)}</span>
            {course.oldPrice && (
              <span className="text-sm text-slate-400 line-through">{formatRwf(course.oldPrice)}</span>
            )}
          </div>
          <button
            onClick={handleAdd}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
              inCart
                ? 'bg-emerald-50 text-emerald-700'
                : 'gradient-accent text-white hover:opacity-95 shadow-accent'
            }`}
          >
            {inCart ? (
              <>
                <Check className="h-3.5 w-3.5" /> Added
              </>
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5" /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
