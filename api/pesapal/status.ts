import { getPesapalTransactionStatus, fulfillOrder } from '../_pesapal.ts';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || 'https://xllcoqawlxgcadjynuea.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_A5IXdPXJcMPIiPYezzbMMg_5UTb5Ipr';

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const orderTrackingId =
      req.query?.orderTrackingId ||
      req.query?.OrderTrackingId ||
      (req.body && (req.body.orderTrackingId || req.body.OrderTrackingId));

    if (!orderTrackingId) {
      return res.status(400).json({ error: 'Missing orderTrackingId parameter' });
    }

    const pesapalStatus = await getPesapalTransactionStatus(orderTrackingId);
    const statusCode = Number(pesapalStatus.status_code);
    const isCompleted = statusCode === 1; // 1 = COMPLETED
    const isFailed = statusCode === 2;    // 2 = FAILED

    let updatedOrder = null;

    if (isCompleted) {
      updatedOrder = await fulfillOrder(orderTrackingId, pesapalStatus);
    } else if (isFailed) {
      // Mark as cancelled in Supabase if found
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      if (pesapalStatus.merchant_reference) {
        await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('order_number', pesapalStatus.merchant_reference);
      }
    }

    return res.status(200).json({
      success: true,
      statusCode,
      statusDescription: pesapalStatus.payment_status_description || 'PENDING',
      completed: isCompleted,
      failed: isFailed,
      pending: !isCompleted && !isFailed,
      details: {
        paymentMethod: pesapalStatus.payment_method,
        amount: pesapalStatus.amount,
        confirmationCode: pesapalStatus.confirmation_code,
        merchantReference: pesapalStatus.merchant_reference,
        createdDate: pesapalStatus.created_date,
      },
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('Pesapal status check error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to verify transaction status',
    });
  }
}
