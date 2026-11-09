/**
 * Generates a human-readable, sequential-looking order number.
 * Format: FR-YYYY-NNNN where NNNN is a random 4-digit number.
 * Uniqueness is enforced at the database level by the unique constraint on order_number.
 * On a rare collision, the insert fails and the caller retries.
 */
export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `FR-${year}-${random}`;
}

export interface OrderRecord {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: { id: string; title: string; price: number; thumbnail: string; category: string }[];
  total_amount: number;
  payment_method: 'bank' | 'momo';
  payment_reference: string | null;
  status: string;
  created_at: string;
}
