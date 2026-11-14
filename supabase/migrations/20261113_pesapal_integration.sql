-- ==============================================================================
-- FluentaRise Academy - Pesapal Payment Gateway Integration Migration
-- Description: Expands payment_method and status constraints on public.orders
--              to natively support Pesapal API 3.0 payments.
-- ==============================================================================

-- 1. Relax or expand payment_method check constraint to accept 'pesapal' and 'card'
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('bank', 'momo', 'card', 'pesapal'));

-- 2. Ensure status constraint supports completed and paid states
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending', 'confirmed', 'paid', 'cancelled', 'failed'));

-- 3. Create index on payment_reference for fast webhook & callback lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_reference ON public.orders(payment_reference);
