import { createClient } from '@supabase/supabase-js';

const PESAPAL_CONSUMER_KEY =
  process.env.PESAPAL_CONSUMER_KEY || 'hr51kH3NOZxXdaZbCIvv80iThvrJfqJM';
const PESAPAL_CONSUMER_SECRET =
  process.env.PESAPAL_CONSUMER_SECRET || 'PFiCnB/iXtJzH4EwbLtjDUeZyqg=';
const PESAPAL_ENV = process.env.PESAPAL_ENV || 'live';
const PESAPAL_IPN_ID =
  process.env.PESAPAL_IPN_ID || 'f183ff20-3fc2-4e1f-ad55-dc61a32efa23';

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || 'https://xllcoqawlxgcadjynuea.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_A5IXdPXJcMPIiPYezzbMMg_5UTb5Ipr';

const PESAPAL_BASE_URL =
  PESAPAL_ENV === 'sandbox'
    ? 'https://cybqa.pesapal.com/pesapalv3'
    : 'https://pay.pesapal.com/v3';

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Obtain a valid JWT Bearer token from Pesapal API 3.0.
 * Reuses the in-memory token until 60 seconds before its expiry.
 */
export async function getPesapalToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60000) {
    return cachedToken.token;
  }

  const res = await fetch(`${PESAPAL_BASE_URL}/api/Auth/RequestToken`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      consumer_key: PESAPAL_CONSUMER_KEY,
      consumer_secret: PESAPAL_CONSUMER_SECRET,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pesapal Auth Failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  if (!data.token) {
    throw new Error(
      `Pesapal Auth did not return a token: ${JSON.stringify(data)}`
    );
  }

  const expiresAt = data.expiryDate
    ? new Date(data.expiryDate).getTime()
    : now + 5 * 60 * 1000;
  cachedToken = { token: data.token, expiresAt };
  return data.token;
}

export interface SubmitOrderParams {
  orderNumber: string;
  amount: number;
  description: string;
  callbackUrl: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface PesapalOrderResult {
  orderTrackingId: string;
  merchantReference: string;
  redirectUrl: string;
}

/**
 * Submit an order request to Pesapal API 3.0.
 */
export async function submitPesapalOrder(
  params: SubmitOrderParams
): Promise<PesapalOrderResult> {
  const token = await getPesapalToken();

  const nameParts = params.customerName.trim().split(/\s+/);
  const firstName = nameParts[0] || 'Learner';
  const lastName = nameParts.slice(1).join(' ') || 'Student';

  // Format phone number cleanly for East Africa / Rwanda (2507XXXXXXXX)
  let cleanPhone = params.customerPhone.replace(/[\s\-\+]/g, '');
  if (cleanPhone.startsWith('07') && cleanPhone.length === 10) {
    cleanPhone = '250' + cleanPhone.slice(1);
  } else if (cleanPhone.startsWith('7') && cleanPhone.length === 9) {
    cleanPhone = '250' + cleanPhone;
  }

  const payload = {
    id: params.orderNumber,
    currency: 'RWF',
    amount: Number(params.amount),
    description: (params.description || 'FluentaRise Course Enrollment').slice(0, 100),
    callback_url: params.callbackUrl,
    notification_id: PESAPAL_IPN_ID,
    billing_address: {
      email_address: params.customerEmail.trim(),
      phone_number: cleanPhone,
      country_code: 'RW',
      first_name: firstName,
      last_name: lastName,
      line_1: 'KN 2 Ave, Kigali',
      city: 'Kigali',
      state: 'Kigali',
      postal_code: '00000',
    },
  };

  const res = await fetch(
    `${PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await res.json();
  if (data.status !== '200' && data.status !== 200) {
    throw new Error(
      data.message ||
        data.error?.message ||
        'Failed to submit order request to Pesapal'
    );
  }

  return {
    orderTrackingId: data.order_tracking_id,
    merchantReference: data.merchant_reference,
    redirectUrl: data.redirect_url,
  };
}

/**
 * Query the transaction status for an orderTrackingId.
 */
export async function getPesapalTransactionStatus(orderTrackingId: string) {
  const token = await getPesapalToken();

  const res = await fetch(
    `${PESAPAL_BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(
      orderTrackingId
    )}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();
  return data;
}

/**
 * Update order and student profile in Supabase upon successful payment.
 */
export async function fulfillOrder(
  orderTrackingId: string,
  pesapalData: any
) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 1. Locate order by order_number or payment_reference
  let query = supabase.from('orders').select('*');
  if (pesapalData.merchant_reference) {
    query = query.eq('order_number', pesapalData.merchant_reference);
  } else {
    query = query.eq('payment_reference', orderTrackingId);
  }

  const { data: orders, error: findError } = await query;
  if (findError || !orders || orders.length === 0) {
    console.warn(
      'Order lookup failed for reference:',
      pesapalData.merchant_reference,
      orderTrackingId
    );
    return null;
  }

  const order = orders[0];

  // 2. Map payment method (momo vs bank) to satisfy DB check constraint
  const paymentMethod = (pesapalData.payment_method || '')
    .toLowerCase()
    .includes('card')
    ? 'bank'
    : 'momo';
  const confirmationCode = pesapalData.confirmation_code || orderTrackingId;

  // 3. Mark as confirmed
  await supabase
    .from('orders')
    .update({
      status: 'confirmed',
      payment_reference: confirmationCode,
      payment_method: paymentMethod,
    })
    .eq('id', order.id);

  // 4. Enroll student into courses in `profiles` table if student profile exists
  try {
    const studentEmail = order.customer_email.toLowerCase();
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, enrolled_course_ids')
      .ilike('email', studentEmail)
      .maybeSingle();

    if (profile && Array.isArray(order.items)) {
      const existing = Array.isArray(profile.enrolled_course_ids)
        ? profile.enrolled_course_ids
        : [];
      const purchased = order.items.map((i: any) => i.id).filter(Boolean);
      const updated = Array.from(new Set([...existing, ...purchased]));

      await supabase
        .from('profiles')
        .update({
          enrolled_course_ids: updated,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);
    }
  } catch (err) {
    console.warn('Auto profile enrollment note:', err);
  }

  // 5. Send automated confirmation email to student
  try {
    const { sendMailSafe, renderEmailLayout, formatRwfEmail, SITE_URL } = await import('./_email.ts');
    const clientHtml = renderEmailLayout({
      title: 'Payment Confirmed! Your Learning Journey Begins 🚀',
      badge: 'PAYMENT VERIFIED & ACTIVE',
      badgeColor: '#059669',
      contentHtml: `
        <p>Hello <strong>${order.customer_name || 'Valued Student'}</strong>,</p>
        <p>Your payment has been successfully confirmed! All curriculum modules, lessons, and assignments in your enrolled courses are now unlocked in your Student Portal.</p>
        <div class="card-box">
          <table class="table-details">
            <tr>
              <td class="td-label">Order Reference</td>
              <td class="td-val"><code>#${order.order_number}</code></td>
            </tr>
            <tr>
              <td class="td-label">Total Amount</td>
              <td class="td-val" style="color: #059669; font-weight: bold; font-size: 16px;">${formatRwfEmail(order.total_amount)}</td>
            </tr>
            <tr>
              <td class="td-label">Confirmation Code</td>
              <td class="td-val"><code>${confirmationCode}</code></td>
            </tr>
            <tr>
              <td class="td-label">Status</td>
              <td class="td-val" style="color: #059669; font-weight: bold;">CONFIRMED & ACTIVE</td>
            </tr>
          </table>
        </div>
        <p style="font-size: 14px; color: #475569;">
          You can immediately access your video lessons, quizzes, and live classes by clicking the button below.
        </p>
      `,
      cta: {
        label: 'Start Learning Now (My Courses)',
        url: `${SITE_URL}/student/courses`,
      },
      footerNote: 'Need any assistance? Contact us at fluentarisee@gmail.com or +250 795 041 000.',
    });

    await sendMailSafe({
      to: order.customer_email,
      subject: `🎉 Payment Confirmed: Your Courses Are Unlocked! (Order #${order.order_number})`,
      html: clientHtml,
    });
  } catch (mailErr) {
    console.warn('Pesapal email dispatch note:', mailErr);
  }

  return { ...order, status: 'confirmed', payment_reference: confirmationCode };
}
