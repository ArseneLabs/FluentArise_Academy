import type { AppUser, UserSession } from './types';

const STORAGE_USERS_KEY = 'fluentarise_users_v6';
const STORAGE_SESSION_KEY = 'fluentarise_session_v6';
export const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
export const WARNING_BEFORE_TIMEOUT_MS = 60 * 1000; // 60 seconds warning (at 9 minutes)
export const ABSOLUTE_SESSION_TIMEOUT_MS = 12 * 60 * 60 * 1000; // 12 hours max

export const authBroadcast =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('fluentarise_auth_sync')
    : null;

/**
 * Remove sensitive password data from user object before persisting to session
 */
export function sanitizeUser(user: AppUser): AppUser {
  const { password, ...safe } = user;
  return safe as AppUser;
}

export function getStoredUsers(): AppUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse users from localStorage', err);
  }
  return [];
}

export function saveStoredUsers(users: AppUser[]): void {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users to localStorage', err);
  }
}

export function createSession(user: AppUser): UserSession {
  const now = Date.now();
  const safeUser = sanitizeUser(user);
  const session: UserSession = {
    sessionId: `sess_${now}_${Math.random().toString(36).substring(2, 9)}`,
    user: safeUser,
    createdAt: now,
    lastActiveAt: now,
    expiresAt: now + ABSOLUTE_SESSION_TIMEOUT_MS,
  };
  setActiveSession(session);
  return session;
}

export function getActiveSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as UserSession;
    const now = Date.now();

    // Check absolute expiration (12 hours)
    if (session.expiresAt && now > session.expiresAt) {
      clearActiveSession();
      return null;
    }

    // Check inactivity timeout (10 minutes)
    if (session.lastActiveAt && now - session.lastActiveAt > INACTIVITY_TIMEOUT_MS) {
      clearActiveSession();
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function setActiveSession(session: UserSession | null): void {
  try {
    if (!session) {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    } else {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
    }
  } catch (err) {
    console.error('Failed to update active session', err);
  }
}

export function clearActiveSession(): void {
  try {
    localStorage.removeItem(STORAGE_SESSION_KEY);
    authBroadcast?.postMessage({ type: 'LOGOUT' });
  } catch {
    // ignore
  }
}

export function updateSessionActivity(): void {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return;
    const session = JSON.parse(raw) as UserSession;
    session.lastActiveAt = Date.now();
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
    authBroadcast?.postMessage({ type: 'ACTIVITY', timestamp: session.lastActiveAt });
  } catch {
    // ignore
  }
}

export function getActiveSessionUser(): AppUser | null {
  const session = getActiveSession();
  return session?.user ?? null;
}

export function setActiveSessionUser(user: AppUser | null): void {
  if (!user) {
    clearActiveSession();
  } else {
    createSession(user);
  }
}
