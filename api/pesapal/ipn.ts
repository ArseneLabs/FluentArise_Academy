import { getPesapalTransactionStatus, fulfillOrder } from '../_pesapal.ts';

export default async function handler(req: any, res: any) {
  // Always acknowledge Pesapal webhooks with HTTP 200 and standard JSON
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const trackingId =
    req.query?.OrderTrackingId ||
    req.query?.orderTrackingId ||
    req.body?.OrderTrackingId ||
    req.body?.orderTrackingId;

  const merchantRef =
    req.query?.OrderMerchantReference ||
    req.query?.orderMerchantReference ||
    req.body?.OrderMerchantReference ||
    req.body?.orderMerchantReference;

  const notificationType =
    req.query?.OrderNotificationType ||
    req.body?.OrderNotificationType ||
    'IPNCHANGE';

  console.log(`[PESAPAL IPN RECEIVED] TrackingID: ${trackingId}, Ref: ${merchantRef}`);

  if (!trackingId) {
    return res.status(200).json({
      orderNotificationType: notificationType,
      orderTrackingId: trackingId || '',
      orderMerchantReference: merchantRef || '',
      status: 200,
    });
  }

  try {
    const pesapalStatus = await getPesapalTransactionStatus(trackingId);
    console.log(`[PESAPAL IPN STATUS]`, pesapalStatus);

    if (Number(pesapalStatus.status_code) === 1) {
      await fulfillOrder(trackingId, pesapalStatus);
      console.log(`[PESAPAL IPN FULFILLED] Order ${merchantRef} marked confirmed`);
    }

    return res.status(200).json({
      orderNotificationType: notificationType,
      orderTrackingId: trackingId,
      orderMerchantReference: merchantRef || pesapalStatus.merchant_reference || '',
      status: 200,
    });
  } catch (err: any) {
    console.error('[PESAPAL IPN ERROR]', err);
    // Return status 500 in body while keeping HTTP 200 so Pesapal retries properly
    return res.status(200).json({
      orderNotificationType: notificationType,
      orderTrackingId: trackingId,
      orderMerchantReference: merchantRef || '',
      status: 500,
      message: err.message,
    });
  }
}
