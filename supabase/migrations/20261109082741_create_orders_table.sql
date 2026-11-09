/*
# Create orders table for FluentaRise checkout

## Purpose
Stores checkout orders placed by learners through the FluentaRise cart.
This is a single-tenant app (no sign-in / accounts), so orders are intentionally
public/shared and writable by the anon-key frontend.

## New Tables
- `orders`
  - `id` (uuid, primary key, default gen_random_uuid())
  - `order_number` (text, unique, human-readable order reference e.g. "FR-2026-0001")
  - `customer_name` (text, not null) — full name of the buyer
  - `customer_email` (text, not null) — contact email
  - `customer_phone` (text, not null) — phone used for MoMo / contact
  - `items` (jsonb, not null) — array of cart items at time of purchase {id, title, price, thumbnail, category}
  - `total_amount` (integer, not null) — total in Rwf
  - `payment_method` (text, not null) — 'bank' or 'momo'
  - `payment_reference` (text) — transaction reference / confirmation number provided by buyer
  - `status` (text, not null, default 'pending') — order status: pending, confirmed, cancelled
  - `created_at` (timestamptz, default now())

## Security
- Enable RLS on `orders`.
- Grant SELECT, INSERT, UPDATE to `anon` + `authenticated` (no-auth single-tenant app).
- SELECT: anyone can read orders (needed so the buyer can view their confirmation by order number).
- INSERT: anyone can create an order (checkout flow).
- UPDATE: anyone can update order status (e.g. mark confirmed after payment verification).
- DELETE: not granted — orders are never deleted to preserve an audit trail.
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_amount integer NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('bank', 'momo')),
  payment_reference text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON orders TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_orders" ON orders;
CREATE POLICY "anon_update_orders" ON orders FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Index for faster lookups by order number (the confirmation flow)
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders (order_number);
