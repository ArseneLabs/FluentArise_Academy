import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Course } from '@/types';

type CartItem = Course;

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  add: (course: Course) => boolean;
  remove: (id: string) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  has: (id: string) => boolean;
  total: () => number;
  count: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      add: (course) => {
        if (get().items.some((i) => i.id === course.id)) return false;
        set({ items: [...get().items, course], isOpen: true });
        return true;
      },
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      clear: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      has: (id) => get().items.some((i) => i.id === id),
      total: () => get().items.reduce((sum, i) => sum + i.price, 0),
      count: () => get().items.length,
    }),
    { name: 'fluentarise-cart' }
  )
);
