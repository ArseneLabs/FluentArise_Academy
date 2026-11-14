/**
 * FluentaRise Academy Email Dispatch Client Service
 * Dispatches automated transactional emails via /api/email
 */

interface SendEmailResponse {
  success: boolean;
  error?: string;
  [key: string]: any;
}

export async function sendEmailAction(
  action: string,
  payload: Record<string, any>
): Promise<SendEmailResponse> {
  try {
    const origin =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://fluentarise.com';

    const res = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        payload,
        origin,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.warn(`[Email API] Request returned status ${res.status}:`, data);
      return { success: false, error: data?.error || `HTTP ${res.status}` };
    }

    return data;
  } catch (err: any) {
    console.warn(`[Email API Dispatch Error] Action "${action}":`, err.message || err);
    return { success: false, error: err.message || 'Network error dispatching email' };
  }
}

/**
 * 1. Notify both customer (Order confirmation) and admin (New order alert)
 */
export async function notifyOrderPlaced(params: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: Array<{ id: string; title: string; price: number; [key: string]: any }>;
  totalAmount: number;
  paymentMethod: string;
  paymentReference?: string | null;
  status?: string;
}): Promise<SendEmailResponse> {
  return sendEmailAction('order_placed', params);
}

/**
 * 2. Notify customer when order status changes (paid, failed, cancelled, refunded)
 */
export async function notifyOrderStatusChanged(params: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  newStatus: string;
  totalAmount?: number;
  items?: Array<{ id: string; title: string; price: number; [key: string]: any }>;
  paymentReference?: string | null;
  note?: string;
}): Promise<SendEmailResponse> {
  return sendEmailAction('order_status', params);
}

/**
 * 3. Notify user (welcome email) and admin (new user alert) upon registration
 */
export async function notifyAccountCreated(params: {
  name: string;
  email: string;
  phone?: string;
  role: 'student' | 'instructor' | 'admin';
  status?: string;
  userId?: string;
}): Promise<SendEmailResponse> {
  return sendEmailAction('account_created', params);
}

/**
 * 4. Notify user when super admin approves their student or instructor account
 */
export async function notifyAccountApproved(params: {
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
}): Promise<SendEmailResponse> {
  return sendEmailAction('account_approved', params);
}

/**
 * 5. Notify visitor and admin when contact form is submitted
 */
export async function notifyContactSubmitted(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<SendEmailResponse> {
  return sendEmailAction('contact_form', params);
}

/**
 * 6. Notify student when instructor grades an assignment or quiz submission
 */
export async function notifyAssignmentGraded(params: {
  studentName: string;
  studentEmail: string;
  taskTitle: string;
  courseTitle: string;
  score: number;
  maxScore?: number;
  feedback?: string;
  improvementTips?: string;
}): Promise<SendEmailResponse> {
  return sendEmailAction('assignment_graded', params);
}

/**
 * 7. Notify students when instructor schedules a live class
 */
export async function notifyLiveClassScheduled(params: {
  sessionTitle: string;
  courseTitle: string;
  instructorName: string;
  date: string;
  startTime: string;
  endTime: string;
  meetingUrl?: string;
  description?: string;
  studentEmails: string[];
}): Promise<SendEmailResponse> {
  return sendEmailAction('live_class_scheduled', params);
}
