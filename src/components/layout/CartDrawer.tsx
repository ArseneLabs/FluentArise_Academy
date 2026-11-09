import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingCart, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '@/store/cart';
import { formatRwf } from '@/data/courses';

export default function CartDrawer() {
  const navigate = useNavigate();
  const isOpen = useCart((s) => s.isOpen);
  const closeCart = useCart((s) => s.closeCart);
  const items = useCart((s) => s.items);
  const remove = useCart((s) => s.remove);
  const total = useCart((s) => s.total());

  if (!isOpen) return null;

  const checkout = () => {
    if (items.length === 0) return;
    closeCart();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={closeCart} />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-brand-800" />
            <h2 className="text-lg font-bold text-brand-900">Your Cart</h2>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
              {items.length}
            </span>
          </div>
          <button onClick={closeCart} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <ShoppingCart className="h-8 w-8 text-slate-400" />
              </div>
              <p className="mt-4 text-base font-semibold text-slate-700">Your cart is empty</p>
              <p className="mt-1 text-sm text-slate-500">Browse our courses and add some to get started.</p>
              <Link
                to="/courses"
                onClick={closeCart}
                className="mt-5 inline-flex items-center gap-2 rounded-full gradient-brand px-5 py-2.5 text-sm font-semibold text-white"
              >
                Explore Courses <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-3 rounded-xl border border-slate-100 p-3 shadow-sm"
                >
                  <img src={item.thumbnail} alt={item.title} className="h-16 w-20 shrink-0 rounded-lg object-cover" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link to={`/courses/${item.slug}`} onClick={closeCart} className="line-clamp-2 text-sm font-semibold text-slate-800 hover:text-brand-700">
                      {item.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-500">{item.category}</p>
                    <p className="mt-auto text-sm font-bold text-brand-800">{formatRwf(item.price)}</p>
                  </div>
                  <button
                    onClick={() => remove(item.id)}
                    className="flex h-8 w-8 items-center justify-center self-start rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-4 space-y-3">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold">{formatRwf(total)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Platform fee</span>
              <span className="font-semibold text-emerald-600">Free</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-base">
              <span className="font-bold text-slate-800">Total</span>
              <span className="font-extrabold text-brand-900">{formatRwf(total)}</span>
            </div>
            <button
              onClick={checkout}
              className="flex w-full items-center justify-center gap-2 rounded-xl gradient-accent px-5 py-3 text-sm font-bold text-white shadow-accent hover:opacity-95 transition"
            >
              Checkout <ArrowRight className="h-4 w-4" />
            </button>
            <Link to="/checkout" onClick={closeCart} className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-brand-600 transition">
              <ShieldCheck className="h-3.5 w-3.5" /> Secure checkout with Bank & MoMo payment
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
