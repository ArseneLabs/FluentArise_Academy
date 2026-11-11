import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { AppUser, UserRole, AccountStatus } from './types';
import {
  getActiveSessionUser,
  getStoredUsers,
  saveStoredUsers,
  setActiveSessionUser,
} from './userStore';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export const DEMO_EMAIL = 'admin@fluentarise.com';
export const DEMO_PASSWORD = 'FluentaRise2026!';

export interface AuthContextValue {
  user: AppUser | null;
  role: UserRole | null;
  loading: boolean;
  allUsers: AppUser[];
  pendingUsersCount: number;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: string | null; user?: AppUser; isPending?: boolean }>;
  signUp: (
    name: string,
    email: string,
    password: string,
    role?: 'student' | 'instructor'
  ) => Promise<{ error: string | null; pendingApproval?: boolean }>;
  signOut: () => Promise<void>;
  approveUser: (userId: string) => Promise<{ error: string | null }>;
  rejectUser: (userId: string) => Promise<{ error: string | null }>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<{ error: string | null }>;
  updateUserStatus: (userId: string, newStatus: AccountStatus) => Promise<{ error: string | null }>;
  addUserDirect: (
    userData: {
      name: string;
      email: string;
      password?: string;
      role: UserRole;
      status?: AccountStatus;
      headline?: string;
    }
  ) => Promise<{ error: string | null; user?: AppUser }>;
  deleteUser: (userId: string) => Promise<{ error: string | null }>;
  refreshUsers: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<AppUser[]>(() => getStoredUsers());
  const [user, setUser] = useState<AppUser | null>(() => getActiveSessionUser());
  const [loading, setLoading] = useState(true);

  // Sync users from storage on mount
  useEffect(() => {
    const stored = getStoredUsers();
    setUsers(stored);

    const activeSession = getActiveSessionUser();
    if (activeSession) {
      // Refresh user details from stored users in case status or role changed
      const fresh = stored.find((u) => u.id === activeSession.id);
      if (fresh) {
        if (fresh.status !== 'active') {
          // If account is no longer active, log out
          setActiveSessionUser(null);
          setUser(null);
        } else {
          setActiveSessionUser(fresh);
          setUser(fresh);
        }
      } else {
        setUser(activeSession);
      }
    }
    setLoading(false);
  }, []);

  const refreshUsers = useCallback(() => {
    const list = getStoredUsers();
    setUsers([...list]);
  }, []);

  const pendingUsersCount = useMemo(() => {
    return users.filter((u) => u.status === 'pending').length;
  }, [users]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const normalizedEmail = email.trim().toLowerCase();

      // Legacy fallback: treat demo@fluentarise.com as super admin
      const lookupEmail = normalizedEmail === 'demo@fluentarise.com' ? 'admin@fluentarise.com' : normalizedEmail;

      const currentUsers = getStoredUsers();
      const matched = currentUsers.find(
        (u) => u.email.toLowerCase() === lookupEmail
      );

      if (!matched) {
        return { error: 'No account found with this email address. Please register first.' };
      }

      // Check password (allow default demo password for preloaded accounts or matched password)
      const validPassword =
        password === DEMO_PASSWORD ||
        (matched.password && matched.password === password);

      if (!validPassword) {
        return { error: 'Invalid password. Please check your credentials and try again.' };
      }

      // Check activation status: Super Admin must activate before login!
      if (matched.status === 'pending') {
        return {
          error:
            'Your account is pending Super Admin activation. You cannot log in until an administrator reviews and approves your account.',
          isPending: true,
        };
      }

      if (matched.status === 'suspended') {
        return {
          error:
            'Your account has been suspended. Please contact FluentaRise administration for assistance.',
        };
      }

      // Successful login
      setActiveSessionUser(matched);
      setUser(matched);

      // If Supabase is configured, optionally sign in there in the background
      if (isSupabaseConfigured) {
        try {
          await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
        } catch {
          // Non-blocking fallback
        }
      }

      return { error: null, user: matched };
    },
    []
  );

  const signUp = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      role: 'student' | 'instructor' = 'student'
    ) => {
      const normalizedEmail = email.trim().toLowerCase();
      const currentUsers = getStoredUsers();

      if (currentUsers.some((u) => u.email.toLowerCase() === normalizedEmail)) {
        return { error: 'An account with this email address already exists. Please sign in instead.' };
      }

      // All self-registered accounts are created in PENDING status.
      // Super Admin must approve/activate before they can log in!
      const newUser: AppUser = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: name.trim(),
        email: normalizedEmail,
        password,
        role,
        status: 'pending', // Pending approval!
        createdAt: new Date().toISOString(),
        headline: role === 'instructor' ? 'Instructor Candidate' : 'Registered Student',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=0284c7`,
      };

      const updated = [newUser, ...currentUsers];
      saveStoredUsers(updated);
      setUsers(updated);

      // Also register to Supabase if configured (as pending metadata)
      if (isSupabaseConfigured) {
        try {
          await supabase.auth.signUp({
            email: normalizedEmail,
            password,
            options: {
              data: {
                full_name: name.trim(),
                role,
                status: 'pending',
              },
            },
          });
        } catch {
          // Gracefully fallback
        }
      }

      return { error: null, pendingApproval: true };
    },
    []
  );

  const signOut = useCallback(async () => {
    setActiveSessionUser(null);
    setUser(null);
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
  }, []);

  const approveUser = useCallback(
    async (userId: string) => {
      const currentUsers = getStoredUsers();
      const target = currentUsers.find((u) => u.id === userId);
      if (!target) return { error: 'User not found.' };

      const updated = currentUsers.map((u) =>
        u.id === userId
          ? {
              ...u,
              status: 'active' as AccountStatus,
              approvedAt: new Date().toISOString(),
              approvedBy: user?.name || 'Super Admin',
            }
          : u
      );

      saveStoredUsers(updated);
      setUsers(updated);
      return { error: null };
    },
    [user]
  );

  const rejectUser = useCallback(async (userId: string) => {
    const currentUsers = getStoredUsers();
    const updated = currentUsers.filter((u) => u.id !== userId);
    saveStoredUsers(updated);
    setUsers(updated);
    return { error: null };
  }, []);

  const updateUserRole = useCallback(async (userId: string, newRole: UserRole) => {
    const currentUsers = getStoredUsers();
    const updated = currentUsers.map((u) =>
      u.id === userId ? { ...u, role: newRole } : u
    );
    saveStoredUsers(updated);
    setUsers(updated);

    // If current logged-in user changed their own role, update active session
    if (user?.id === userId) {
      const updatedSelf = { ...user, role: newRole };
      setActiveSessionUser(updatedSelf);
      setUser(updatedSelf);
    }
    return { error: null };
  }, [user]);

  const updateUserStatus = useCallback(async (userId: string, newStatus: AccountStatus) => {
    const currentUsers = getStoredUsers();
    const updated = currentUsers.map((u) =>
      u.id === userId ? { ...u, status: newStatus } : u
    );
    saveStoredUsers(updated);
    setUsers(updated);

    if (user?.id === userId && newStatus !== 'active') {
      setActiveSessionUser(null);
      setUser(null);
    }
    return { error: null };
  }, [user]);

  const addUserDirect = useCallback(
    async (userData: {
      name: string;
      email: string;
      password?: string;
      role: UserRole;
      status?: AccountStatus;
      headline?: string;
    }) => {
      const currentUsers = getStoredUsers();
      const normalizedEmail = userData.email.trim().toLowerCase();

      if (currentUsers.some((u) => u.email.toLowerCase() === normalizedEmail)) {
        return { error: 'An account with this email address already exists.' };
      }

      const newUser: AppUser = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: userData.name.trim(),
        email: normalizedEmail,
        password: userData.password || DEMO_PASSWORD,
        role: userData.role,
        status: userData.status || 'active',
        createdAt: new Date().toISOString(),
        approvedAt: userData.status === 'active' ? new Date().toISOString() : undefined,
        approvedBy: user?.name || 'Super Admin',
        headline: userData.headline || `${userData.role} at FluentaRise`,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name.trim())}&backgroundColor=0284c7`,
      };

      const updated = [newUser, ...currentUsers];
      saveStoredUsers(updated);
      setUsers(updated);
      return { error: null, user: newUser };
    },
    [user]
  );

  const deleteUser = useCallback(async (userId: string) => {
    const currentUsers = getStoredUsers();
    const updated = currentUsers.filter((u) => u.id !== userId);
    saveStoredUsers(updated);
    setUsers(updated);
    if (user?.id === userId) {
      setActiveSessionUser(null);
      setUser(null);
    }
    return { error: null };
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? null,
      loading,
      allUsers: users,
      pendingUsersCount,
      signIn,
      signUp,
      signOut,
      approveUser,
      rejectUser,
      updateUserRole,
      updateUserStatus,
      addUserDirect,
      deleteUser,
      refreshUsers,
    }),
    [
      user,
      loading,
      users,
      pendingUsersCount,
      signIn,
      signUp,
      signOut,
      approveUser,
      rejectUser,
      updateUserRole,
      updateUserStatus,
      addUserDirect,
      deleteUser,
      refreshUsers,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
