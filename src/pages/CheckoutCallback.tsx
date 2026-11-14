import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Compass,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Home,
  BookOpen,
} from 'lucide-react';
import { checkPesapalStatus, type CheckStatusResponse } from '@/lib/pesapalClient';
import { useCart } from '@/store/cart';
import { useAdminStore } from '@/admin/store/adminStore';
import { formatRwf } from '@/data/courses';

type VerificationState = 'verifying' | 'success' | 'pending' | 'failed' | 'error';

export default function CheckoutCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const clearCart = useCart((s) => s.clear);
  const syncFromSupabase = useAdminStore((s) => s.syncFromSupabase);

  const orderTrackingId =
    searchParams.get('OrderTrackingId') || searchParams.get('orderTrackingId');
  const merchantReference =
    searchParams.get('OrderMerchantReference') ||
    searchParams.get('orderMerchantReference');

  const [state, setState] = useState<VerificationState>('verifying');
  const [statusResult, setStatusResult] = useState<CheckStatusResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  const hasClearedCartRef = useRef(false);

  const verifyPayment = async (isManualRetry = false) => {
    if (!orderTrackingId) {
      setState('error');
      setErrorMessage('Missing order tracking ID in payment return parameters.');
      return;
    }

    if (isManualRetry) {
      setState('verifying');
    }

    try {
      const res = await checkPesapalStatus(orderTrackingId);
      setStatusResult(res);

      if (res.completed) {
        setState('success');
        if (!hasClearedCartRef.current) {
          hasClearedCartRef.current = true;
          clearCart();
          syncFromSupabase().catch(() => {});
        }
      } else if (res.failed) {
        setState('failed');
      } else {
        // Pending state — mobile money USSD prompt may still be in flight
        setState('pending');
      }
    } catch (err: any) {
      console.error('Pesapal verification error:', err);
      // If we haven't exhausted auto-retries, keep in verifying/pending
      if (retryCount < 3) {
        setState('pending');
      } else {
        setState('error');
        setErrorMessage(
          err.message || 'Could not verify payment status. Please try checking again.'
        );
      }
    }
  };

  // Initial verification on mount
  useEffect(() => {
    verifyPayment();
  }, [orderTrackingId]);

  // Auto-retry polling up to 4 times if status is pending
  useEffect(() => {
    if (state === 'pending' && retryCount < 4) {
      const timer = setTimeout(() => {
        setRetryCount((c) => c + 1);
        verifyPayment();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [state, retryCount]);

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-xl shadow-slate-100/60">
          {/* ───────────────── Verifying State ───────────────── */}
          {state === 'verifying' && (
            <div className="text-center py-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
              <h2 className="mt-6 font-display text-2xl font-bold text-slate-900">
                Verifying Your Payment
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Please wait while we confirm your transaction with Pesapal and activate your enrollment...
              </p>

              <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-xs text-slate-500 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700">Order Reference:</span>
                  <span className="font-mono">{merchantReference || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700">Tracking ID:</span>
                  <span className="font-mono truncate max-w-[200px]">{orderTrackingId || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {/* ───────────────── Success State ───────────────── */}
          {state === 'success' && (
            <div className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 shadow-inner">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" /> Payment Confirmed
              </span>
              <h2 className="mt-2 font-display text-2xl font-black text-slate-950 sm:text-3xl">
                You're Officially Enrolled!
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Thank you for your payment. Your course curriculum, video lectures, and learning materials are now completely unlocked.
              </p>

              <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-left text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Order Number:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {merchantReference || statusResult?.details?.merchantReference || 'FR-ORDER'}
                  </span>
                </div>
                {statusResult?.details?.amount && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Amount Paid:</span>
                    <span className="font-bold text-slate-900">
                      {formatRwf(statusResult.details.amount)}
                    </span>
                  </div>
                )}
                {statusResult?.details?.confirmationCode && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Receipt Code:</span>
                    <span className="font-mono font-medium text-purple-700">
                      {statusResult.details.confirmationCode}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Access Status:</span>
                  <span className="font-bold text-emerald-600">Active & Unlocked</span>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/student/courses"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:bg-purple-700"
                >
                  <BookOpen className="h-4 w-4" /> Go to My Courses
                </Link>
                <Link
                  to="/student/orders"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  View Receipt
                </Link>
              </div>
            </div>
          )}

          {/* ───────────────── Pending State ───────────────── */}
          {state === 'pending' && (
            <div className="text-center py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <RefreshCw className={`h-8 w-8 ${retryCount < 4 ? 'animate-spin' : ''}`} />
              </div>
              <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                Processing with Provider
              </span>
              <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
                Waiting for Confirmation
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Your payment prompt was initiated. Mobile money networks (MTN / Airtel) can occasionally take 15–30 seconds to finalize the transaction.
              </p>

              <div className="mt-6 rounded-2xl bg-amber-50/60 border border-amber-200/60 p-4 text-left text-xs text-amber-900 space-y-1">
                <p className="font-semibold">Did you approve the prompt on your phone?</p>
                <p className="text-amber-800 text-[11px]">
                  Please enter your MoMo PIN on your mobile device to complete payment. Once approved, click the button below.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <button
                  onClick={() => verifyPayment(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-200 transition hover:bg-amber-700"
                >
                  <RefreshCw className="h-4 w-4" /> Check Status Now
                </button>
                <Link
                  to="/courses"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <Home className="h-4 w-4" /> Return to Academy
                </Link>
              </div>
            </div>
          )}

          {/* ───────────────── Failed / Cancelled State ───────────────── */}
          {state === 'failed' && (
            <div className="text-center py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <AlertCircle className="h-8 w-8" />
              </div>
              <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
                Transaction Incomplete
              </span>
              <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
                Payment Not Completed
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                The payment session was cancelled or declined by your provider. Your cart items are still saved so you can try again.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/checkout"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:bg-purple-700"
                >
                  <ArrowRight className="h-4 w-4" /> Return to Checkout
                </Link>
                <Link
                  to="/courses"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Browse Courses
                </Link>
              </div>
            </div>
          )}

          {/* ───────────────── Error State ───────────────── */}
          {state === 'error' && (
            <div className="text-center py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold text-slate-900">
                Verification Issue
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {errorMessage || 'We were unable to confirm the transaction status at this moment.'}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => verifyPayment(true)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-purple-700"
                >
                  <RefreshCw className="h-4 w-4" /> Retry Check
                </button>
                <Link
                  to="/checkout"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Back to Checkout
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
