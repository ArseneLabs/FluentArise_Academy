export interface InitiatePaymentParams {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: {
    id: string;
    title: string;
    price: number;
    thumbnail: string;
    category?: string;
  }[];
  totalAmount: number;
}

export interface InitiatePaymentResponse {
  success: boolean;
  orderNumber: string;
  orderTrackingId: string;
  redirectUrl: string;
  error?: string;
}

export interface CheckStatusResponse {
  success: boolean;
  statusCode: number;
  statusDescription: string;
  completed: boolean;
  failed: boolean;
  pending: boolean;
  details?: {
    paymentMethod: string;
    amount: number;
    confirmationCode: string;
    merchantReference: string;
    createdDate: string;
  };
  order?: any;
  error?: string;
}

/**
 * Initiates an online payment with Pesapal API 3.0 via the backend API.
 */
export async function initiatePesapalPayment(
  params: InitiatePaymentParams
): Promise<InitiatePaymentResponse> {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://fluentarise.com';

  const res = await fetch('/api/pesapal/initiate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      ...params,
      origin,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to initiate online payment with Pesapal.');
  }

  return data;
}

/**
 * Checks the status of a Pesapal payment using the orderTrackingId.
 */
export async function checkPesapalStatus(
  orderTrackingId: string
): Promise<CheckStatusResponse> {
  const res = await fetch(
    `/api/pesapal/status?orderTrackingId=${encodeURIComponent(orderTrackingId)}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    }
  );

  const data = await res.json();
  if (!res.ok && !data.statusCode) {
    throw new Error(data.error || 'Failed to check payment status.');
  }

  return data;
}
