import { useState, useEffect, useCallback, useRef } from 'react';
import {
  INACTIVITY_TIMEOUT_MS,
  WARNING_BEFORE_TIMEOUT_MS,
  getActiveSession,
  updateSessionActivity,
  clearActiveSession,
  authBroadcast,
} from './userStore';

export interface SessionTimeoutState {
  showWarning: boolean;
  secondsRemaining: number;
  stayLoggedIn: () => void;
  logoutNow: () => void;
}

export function useSessionTimeout(
  isAuthenticated: boolean,
  onTimeoutLogout: () => void
): SessionTimeoutState {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  const lastActivityRef = useRef<number>(Date.now());
  const lastRecordedActivityRef = useRef<number>(Date.now());
  const onTimeoutLogoutRef = useRef(onTimeoutLogout);

  useEffect(() => {
    onTimeoutLogoutRef.current = onTimeoutLogout;
  }, [onTimeoutLogout]);

  const stayLoggedIn = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    lastRecordedActivityRef.current = now;
    updateSessionActivity();
    setShowWarning(false);
    setSecondsRemaining(60);
  }, []);

  const logoutNow = useCallback(() => {
    setShowWarning(false);
    clearActiveSession();
    onTimeoutLogoutRef.current();
  }, []);

  // 1. Throttled Activity Listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleUserActivity = () => {
      const now = Date.now();
      lastActivityRef.current = now;

      // Throttle activity updates to storage/broadcast (once every 15 seconds)
      if (now - lastRecordedActivityRef.current > 15000) {
        lastRecordedActivityRef.current = now;
        updateSessionActivity();
      }

      // If warning was showing, user activity dismisses it and extends session
      setShowWarning(false);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [isAuthenticated]);

  // 2. Multi-Tab Cross-Tab Sync via BroadcastChannel
  useEffect(() => {
    const channel = authBroadcast;
    if (!channel) return;

    const handleBroadcast = (event: MessageEvent) => {
      if (event.data?.type === 'LOGOUT') {
        setShowWarning(false);
        onTimeoutLogoutRef.current();
      } else if (event.data?.type === 'ACTIVITY') {
        const remoteTime = event.data.timestamp || Date.now();
        lastActivityRef.current = Math.max(lastActivityRef.current, remoteTime);
        setShowWarning(false);
      }
    };

    channel.addEventListener('message', handleBroadcast);
    return () => {
      channel.removeEventListener('message', handleBroadcast);
    };
  }, []);

  // 3. Periodic Inactivity Check Timer (runs every 3 seconds)
  useEffect(() => {
    if (!isAuthenticated) {
      setShowWarning(false);
      return;
    }

    const checkInterval = setInterval(() => {
      const session = getActiveSession();
      if (!session) {
        // Session was cleared or expired in another tab
        logoutNow();
        return;
      }

      const now = Date.now();
      const lastActive = Math.max(lastActivityRef.current, session.lastActiveAt || 0);
      const idleTime = now - lastActive;
      const timeLeft = INACTIVITY_TIMEOUT_MS - idleTime;

      if (timeLeft <= 0) {
        // 10 minutes exceeded: Auto Logout
        clearInterval(checkInterval);
        logoutNow();
      } else if (timeLeft <= WARNING_BEFORE_TIMEOUT_MS) {
        // Warning threshold reached (9 minutes of inactivity)
        setShowWarning(true);
        setSecondsRemaining(Math.max(1, Math.ceil(timeLeft / 1000)));
      } else {
        setShowWarning(false);
      }
    }, 3000);

    return () => clearInterval(checkInterval);
  }, [isAuthenticated, logoutNow]);

  return {
    showWarning,
    secondsRemaining,
    stayLoggedIn,
    logoutNow,
  };
}
