import { createClient } from '@supabase/supabase-js';
import { submitPesapalOrder } from '../_pesapal.ts';

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || 'https://xllcoqawlxgcadjynuea.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_A5IXdPXJcMPIiPYezzbMMg_5UTb5Ipr';

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `FR-${year}-${random}`;
}

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { customerName, customerEmail, customerPhone, items, totalAmount, origin } = body || {};

    if (!customerName || !customerEmail || !customerPhone || !totalAmount) {
      return res.status(400).json({ error: 'Missing required customer or order details' });
    }

    const orderNumber = generateOrderNumber();
    const courseTitles = Array.isArray(items) && items.length > 0
      ? items.map((i: any) => i.title).join(', ')
      : 'Course Enrollment';

    // 1. Insert pending order into Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: dbOrder, error: dbError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        customer_phone: customerPhone.trim(),
        items: Array.isArray(items) ? items : [],
        total_amount: Number(totalAmount),
        payment_method: 'momo',
        payment_reference: 'PENDING_PESAPAL',
        status: 'pending',
      })
      .select()
      .maybeSingle();

    if (dbError) {
      console.error('Supabase pending order insert error:', dbError);
    }

    // 2. Submit order to Pesapal API 3.0
    const siteOrigin = origin || (req.headers && req.headers.origin) || 'https://fluentarise.com';
    const callbackUrl = `${siteOrigin}/checkout/callback`;

    const pesapalRes = await submitPesapalOrder({
      orderNumber,
      amount: Number(totalAmount),
      description: `FluentaRise: ${courseTitles}`,
      callbackUrl,
      customerName,
      customerEmail,
      customerPhone,
    });

    // 3. Update order in Supabase with orderTrackingId as temporary reference
    if (dbOrder?.id) {
      await supabase
        .from('orders')
        .update({ payment_reference: pesapalRes.orderTrackingId })
        .eq('id', dbOrder.id);
    }

    // 4. Send Order Placed Notifications (Client & Admin)
    try {
      const { sendMailSafe, renderEmailLayout, formatRwfEmail, ADMIN_NOTIFICATION_EMAIL } = await import('../_email.ts');

      // Client notification
      const clientHtml = renderEmailLayout({
        title: 'Order Initiated - Complete Your Payment',
        badge: 'PAYMENT PENDING',
        badgeColor: '#0284c7',
        contentHtml: `
          <p>Hello <strong>${customerName}</strong>,</p>
          <p>Thank you for choosing FluentaRise Academy! Your enrollment order has been created, and your secure payment session via Pesapal has been initialized.</p>
          <div class="card-box">
            <table class="table-details">
              <tr><td class="td-label">Order Number</td><td class="td-val"><code>#${orderNumber}</code></td></tr>
              <tr><td class="td-label">Total Amount</td><td class="td-val" style="color: #0284c7; font-weight: bold;">${formatRwfEmail(Number(totalAmount))}</td></tr>
              <tr><td class="td-label">Selected Courses</td><td class="td-val">${courseTitles}</td></tr>
              <tr><td class="td-label">Tracking ID</td><td class="td-val"><code>${pesapalRes.orderTrackingId}</code></td></tr>
            </table>
          </div>
          <p style="font-size: 14px; color: #475569;">
            If your browser window closed before completing payment, click the button below to resume payment.
          </p>
        `,
        cta: {
          label: 'Complete Payment Now',
          url: pesapalRes.redirectUrl,
        },
      });

      // Admin notification
      const adminHtml = renderEmailLayout({
        title: `Online Order Initiated: #${orderNumber}`,
        badge: 'PESAPAL ORDER INITIATED',
        badgeColor: '#0284c7',
        contentHtml: `
          <p>A student has initiated an online payment checkout on FluentaRise.</p>
          <div class="card-box">
            <table class="table-details">
              <tr><td class="td-label">Customer Name</td><td class="td-val"><strong>${customerName}</strong></td></tr>
              <tr><td class="td-label">Email</td><td class="td-val"><a href="mailto:${customerEmail}">${customerEmail}</a></td></tr>
              <tr><td class="td-label">Phone</td><td class="td-val">${customerPhone}</td></tr>
              <tr><td class="td-label">Order Number</td><td class="td-val"><code>#${orderNumber}</code></td></tr>
              <tr><td class="td-label">Total Amount</td><td class="td-val" style="color: #0284c7; font-weight: bold;">${formatRwfEmail(Number(totalAmount))}</td></tr>
              <tr><td class="td-label">Courses</td><td class="td-val">${courseTitles}</td></tr>
              <tr><td class="td-label">Tracking ID</td><td class="td-val"><code>${pesapalRes.orderTrackingId}</code></td></tr>
            </table>
          </div>
        `,
        cta: {
          label: 'View in Admin Orders',
          url: `${siteOrigin}/admin/orders`,
        },
      });

      Promise.all([
        sendMailSafe({
          to: customerEmail,
          subject: `🎓 Order Initiated: #${orderNumber} - FluentaRise Academy`,
          html: clientHtml,
        }),
        sendMailSafe({
          to: ADMIN_NOTIFICATION_EMAIL,
          subject: `🔔 Pesapal Order #${orderNumber} from ${customerName} (${formatRwfEmail(Number(totalAmount))})`,
          html: adminHtml,
        }),
      ]).catch(console.warn);
    } catch (mailErr) {
      console.warn('Initiate email notification note:', mailErr);
    }

    return res.status(200).json({
      success: true,
      orderNumber,
      orderTrackingId: pesapalRes.orderTrackingId,
      redirectUrl: pesapalRes.redirectUrl,
    });
  } catch (error: any) {
    console.error('Pesapal initiate error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to initiate Pesapal transaction',
    });
  }
}
