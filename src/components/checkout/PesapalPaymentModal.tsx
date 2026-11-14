import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  RefreshCw,
  BookOpen,
  ArrowRight,
  AlertCircle,
  CreditCard,
  Maximize2,
  Minimize2,
  ArrowDown,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { checkPesapalStatus, type CheckStatusResponse } from '@/lib/pesapalClient';
import { formatRwf } from '@/data/courses';
import { useCart } from '@/store/cart';
import { useAdminStore } from '@/admin/store/adminStore';

interface PesapalPaymentModalProps {
  isOpen: boolean;
  redirectUrl: string;
  orderTrackingId: string;
  orderNumber: string;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  onClose: () => void;
  onSuccess: (data: CheckStatusResponse) => void;
}

export default function PesapalPaymentModal({
  isOpen,
  redirectUrl,
  orderTrackingId,
  orderNumber,
  totalAmount,
  customerName,
  customerEmail,
  onClose,
  onSuccess,
}: PesapalPaymentModalProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [paymentState, setPaymentState] = useState<'paying' | 'success' | 'failed'>('paying');
  const [statusData, setStatusData] = useState<CheckStatusResponse | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const clearCart = useCart((s) => s.clear);
  const syncFromSupabase = useAdminStore((s) => s.syncFromSupabase);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const isFinishedRef = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Poll Pesapal status every 3.5 seconds while modal is active and payment is in progress
  useEffect(() => {
    if (!isOpen || !orderTrackingId || isFinishedRef.current) return;

    const pollStatus = async () => {
      try {
        const res = await checkPesapalStatus(orderTrackingId);
        if (res.completed && !isFinishedRef.current) {
          isFinishedRef.current = true;
          setStatusData(res);
          setPaymentState('success');
          clearCart();
          syncFromSupabase().catch(() => {});
          onSuccess(res);
          if (pollingRef.current) clearInterval(pollingRef.current);
        } else if (res.failed && !isFinishedRef.current) {
          setStatusData(res);
        }
      } catch (err) {
        // Silently ignore background polling errors
      }
    };

    const initialTimer = setTimeout(pollStatus, 3000);
    pollingRef.current = setInterval(pollStatus, 3500);

    return () => {
      clearTimeout(initialTimer);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isOpen, orderTrackingId, clearCart, syncFromSupabase, onSuccess]);

  // Listen to postMessage from iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      try {
        if (typeof e.data === 'string' && e.data.includes('pesapal')) {
          const parsed = JSON.parse(e.data);
          if (parsed.status === 'COMPLETED' || parsed.status === 'SUCCESS') {
            manualStatusCheck();
          }
        }
      } catch {
        // Ignore non-json
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [orderTrackingId]);

  const manualStatusCheck = async () => {
    if (!orderTrackingId || isChecking) return;
    setIsChecking(true);
    try {
      const res = await checkPesapalStatus(orderTrackingId);
      setStatusData(res);
      if (res.completed) {
        isFinishedRef.current = true;
        setPaymentState('success');
        clearCart();
        syncFromSupabase().catch(() => {});
        onSuccess(res);
      }
    } catch (err) {
      console.warn('Manual status check error:', err);
    } finally {
      setIsChecking(false);
    }
  };

  const handleAttemptClose = () => {
    if (paymentState === 'success') {
      onClose();
    } else {
      setShowCloseConfirm(true);
    }
  };

  const confirmClose = () => {
    setShowCloseConfirm(false);
    onClose();
  };

  const scrollToCardDetails = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 360,
        behavior: 'smooth',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md transition-all ${
        isMaximized ? 'p-0' : 'p-2 sm:p-4 md:p-6'
      }`}
    >
      {/* Modal Card Container */}
      <div
        className={`relative flex flex-col bg-white shadow-2xl transition-all duration-200 ${
          isMaximized
            ? 'h-screen w-screen rounded-none'
            : 'h-[94vh] max-h-[920px] w-full max-w-4xl rounded-2xl sm:rounded-3xl border border-slate-200/80'
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 via-purple-50/30 to-indigo-50/20 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md shadow-purple-200">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm font-bold text-slate-900 sm:text-base">
                  Pesapal Payment Checkout
                </h3>
                <span className="hidden items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 sm:inline-flex">
                  <ShieldCheck className="h-3 w-3" /> 256-Bit Encrypted
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Order <span className="font-mono font-medium text-slate-700">{orderNumber}</span> · Safe & Verified
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-right">
              <span className="hidden text-[10px] uppercase font-bold text-slate-400 sm:block">Amount</span>
              <p className="text-xs sm:text-sm font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200/60">
                {formatRwf(totalAmount)}
              </p>
            </div>

            {/* Maximize / Minimize toggle */}
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              title={isMaximized ? 'Exit Full Screen' : 'Full Screen'}
            >
              {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            {/* Close button */}
            <button
              onClick={handleAttemptClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Helpful Quick Scroll Banner */}
        {paymentState === 'paying' && (
          <div className="flex shrink-0 items-center justify-between border-b border-purple-100/80 bg-purple-50 px-4 py-2 text-xs text-purple-900">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-purple-700 shrink-0" />
              <span>
                <strong>Card fields & Proceed button</strong> are below the billing section. Scroll down inside the window to complete payment.
              </span>
            </div>
            <button
              onClick={scrollToCardDetails}
              className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-purple-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-purple-700 shadow-sm transition"
            >
              Scroll Down <ArrowDown className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div
          ref={scrollContainerRef}
          className="relative flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 overscroll-contain"
        >
          {paymentState === 'paying' && (
            <div className="relative w-full min-h-[880px] bg-white">
              {/* Loading Skeleton */}
              {!iframeLoaded && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 shadow-inner">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                  <h4 className="mt-4 font-display text-base font-bold text-slate-900">
                    Connecting to Pesapal...
                  </h4>
                  <p className="mt-1 text-xs text-slate-500 max-w-xs text-center">
                    Setting up secure card payment session for {customerName}...
                  </p>
                </div>
              )}

              {/* Seamless Full-Height Iframe */}
              {redirectUrl && (
                <iframe
                  src={redirectUrl}
                  title="Pesapal Secure Payment"
                  className="w-full min-h-[880px] h-[920px] border-0 bg-white"
                  onLoad={() => setIframeLoaded(true)}
                  allow="payment"
                />
              )}
            </div>
          )}

          {/* Payment Success View */}
          {paymentState === 'success' && (
            <div className="flex min-h-[500px] flex-col items-center justify-center p-8 text-center sm:p-12">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 shadow-xl shadow-emerald-100/60">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" /> Payment Confirmed
              </span>
              <h2 className="mt-2 font-display text-2xl font-black text-slate-950 sm:text-3xl">
                Course Access Unlocked!
              </h2>
              <p className="mt-2 max-w-md text-sm text-slate-600">
                Your payment was received and verified by Pesapal. You are now officially enrolled in FluentaRise Academy.
              </p>

              <div className="mt-6 w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-5 text-left text-xs shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Order Number:</span>
                  <span className="font-mono font-bold text-slate-900">{orderNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="font-bold text-slate-900">{formatRwf(totalAmount)}</span>
                </div>
                {statusData?.details?.confirmationCode && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Receipt Code:</span>
                    <span className="font-mono font-medium text-purple-700">
                      {statusData.details.confirmationCode}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Account:</span>
                  <span className="font-medium text-slate-700">{customerEmail}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-emerald-600">Active & Ready to Learn</span>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/student/courses"
                  onClick={onClose}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-200 hover:bg-purple-700 transition"
                >
                  <BookOpen className="h-4 w-4" /> Go to My Classroom
                </Link>
                <Link
                  to="/student/orders"
                  onClick={onClose}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  View Receipts
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Bar */}
        {paymentState === 'paying' && (
          <div className="flex shrink-0 flex-col gap-2.5 border-t border-slate-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>Waiting for payment authorization...</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={manualStatusCheck}
                disabled={isChecking}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition disabled:opacity-60"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                {isChecking ? 'Checking...' : 'Check Status'}
              </button>
              <button
                onClick={handleAttemptClose}
                className="rounded-xl px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Close Confirmation Dialog */}
        {showCloseConfirm && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h4 className="mt-3 font-display text-base font-bold text-slate-900">
                Leave payment session?
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                If you have already entered your card details, please wait a few seconds so we can confirm the transaction.
              </p>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => setShowCloseConfirm(false)}
                  className="flex-1 rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white hover:bg-purple-700 transition"
                >
                  Stay on Payment
                </button>
                <button
                  onClick={confirmClose}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
