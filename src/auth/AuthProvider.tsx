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
  addUserDirect: (userData: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    status?: AccountStatus;
    headline?: string;
  }) => Promise<{ error: string | null; user?: AppUser }>;
  deleteUser: (userId: string) => Promise<{ error: string | null }>;
  refreshUsers: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<AppUser[]>(() => getStoredUsers());
  const [user, setUser] = useState<AppUser | null>(() => getActiveSessionUser());
  const [loading, setLoading] = useState(true);

  // Sync users from Supabase and local cache on mount
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      let currentList = getStoredUsers();

      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && Array.isArray(data)) {
            const dbUsers: AppUser[] = data.map((d) => ({
              id: d.id,
              name: d.name,
              email: d.email,
              phone: d.phone,
              password: d.password_hash,
              role: (d.role as UserRole) || 'student',
              status: (d.status as AccountStatus) || 'pending',
              createdAt: d.created_at,
              approvedAt: d.approved_at,
              approvedBy: d.approved_by,
              headline: d.headline,
              avatar: d.avatar,
              bio: d.bio,
              enrolledCourseIds: d.enrolled_course_ids || [],
            }));

            currentList = dbUsers;
            saveStoredUsers(currentList);
          }
        } catch (err) {
          console.warn('Could not sync profiles from Supabase on mount:', err);
        }
      }

      if (!isMounted) return;
      setUsers(currentList);

      const activeSession = getActiveSessionUser();
      if (activeSession) {
        const fresh = currentList.find(
          (u) =>
            u.id === activeSession.id ||
            u.email.toLowerCase() === activeSession.email.toLowerCase()
        );
        if (fresh) {
          if (fresh.status !== 'active') {
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
    }

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshUsers = useCallback(async () => {
    let list = getStoredUsers();
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          const dbUsers: AppUser[] = data.map((d) => ({
            id: d.id,
            name: d.name,
            email: d.email,
            phone: d.phone,
            password: d.password_hash,
            role: (d.role as UserRole) || 'student',
            status: (d.status as AccountStatus) || 'pending',
            createdAt: d.created_at,
            approvedAt: d.approved_at,
            approvedBy: d.approved_by,
            headline: d.headline,
            avatar: d.avatar,
            bio: d.bio,
            enrolledCourseIds: d.enrolled_course_ids || [],
          }));

          list = dbUsers;
          saveStoredUsers(list);
        }
      } catch {
        // fallback
      }
    }
    setUsers([...list]);
  }, []);

  const pendingUsersCount = useMemo(() => {
    return users.filter((u) => u.status === 'pending').length;
  }, [users]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const normalizedEmail = email.trim().toLowerCase();

      // Check in Supabase profiles database
      if (isSupabaseConfigured) {
        try {
          const { data: dbUser, error: dbError } = await supabase
            .from('profiles')
            .select('*')
            .ilike('email', normalizedEmail)
            .maybeSingle();

          if (dbUser && !dbError) {
            const passwordMatches = dbUser.password_hash === password;

            if (!passwordMatches) {
              return { error: 'Invalid password. Please check your credentials and try again.' };
            }

            if (dbUser.status === 'pending') {
              return {
                error:
                  'Your account is pending Super Admin activation. You cannot log in until an administrator reviews and approves your account.',
                isPending: true,
              };
            }

            if (dbUser.status === 'suspended') {
              return {
                error:
                  'Your account has been suspended. Please contact FluentaRise administration for assistance.',
              };
            }

            const appUser: AppUser = {
              id: dbUser.id,
              name: dbUser.name,
              email: dbUser.email,
              phone: dbUser.phone,
              password: dbUser.password_hash,
              role: (dbUser.role as UserRole) || 'student',
              status: (dbUser.status as AccountStatus) || 'active',
              createdAt: dbUser.created_at,
              approvedAt: dbUser.approved_at,
              approvedBy: dbUser.approved_by,
              headline: dbUser.headline,
              avatar: dbUser.avatar,
              bio: dbUser.bio,
              enrolledCourseIds: dbUser.enrolled_course_ids || [],
            };

            setActiveSessionUser(appUser);
            setUser(appUser);
            return { error: null, user: appUser };
          }
        } catch (err) {
          console.warn('Supabase auth query error:', err);
        }
      }

      // Offline / local cache fallback
      const currentUsers = getStoredUsers();
      const matched = currentUsers.find(
        (u) => u.email.toLowerCase() === normalizedEmail
      );

      if (!matched) {
        return { error: 'No account found with this email address. Please register first.' };
      }

      const validPassword = matched.password && matched.password === password;
      if (!validPassword) {
        return { error: 'Invalid password. Please check your credentials and try again.' };
      }

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

      setActiveSessionUser(matched);
      setUser(matched);
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

      // Check local cache
      if (currentUsers.some((u) => u.email.toLowerCase() === normalizedEmail)) {
        return { error: 'An account with this email address already exists. Please sign in instead.' };
      }

      // Check Supabase if configured
      if (isSupabaseConfigured) {
        try {
          const { data: existing } = await supabase
            .from('profiles')
            .select('id')
            .ilike('email', normalizedEmail)
            .maybeSingle();

          if (existing) {
            return { error: 'An account with this email address already exists. Please sign in instead.' };
          }
        } catch {
          // ignore
        }
      }

      const newUser: AppUser = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: name.trim(),
        email: normalizedEmail,
        password,
        role,
        status: 'pending', // Requires Super Admin approval!
        createdAt: new Date().toISOString(),
        headline: role === 'instructor' ? 'Instructor Candidate' : 'Registered Student',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=0284c7`,
      };

      if (isSupabaseConfigured) {
        try {
          await supabase.from('profiles').insert([
            {
              id: newUser.id,
              name: newUser.name,
              email: newUser.email,
              password_hash: password,
              phone: '',
              role: newUser.role,
              status: 'pending',
              headline: newUser.headline,
              avatar: newUser.avatar,
              created_at: newUser.createdAt,
            },
          ]);
        } catch (err) {
          console.warn('Could not insert profile to Supabase:', err);
        }
      }

      const updated = [newUser, ...currentUsers];
      saveStoredUsers(updated);
      setUsers(updated);

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
      const approvedAt = new Date().toISOString();
      const approvedBy = user?.name || 'Super Admin';

      if (isSupabaseConfigured) {
        try {
          await supabase
            .from('profiles')
            .update({
              status: 'active',
              approved_at: approvedAt,
              approved_by: approvedBy,
            })
            .eq('id', userId);
        } catch (err) {
          console.warn('Could not update profile in Supabase:', err);
        }
      }

      const currentUsers = getStoredUsers();
      const updated = currentUsers.map((u) =>
        u.id === userId
          ? {
              ...u,
              status: 'active' as AccountStatus,
              approvedAt,
              approvedBy,
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
    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').delete().eq('id', userId);
      } catch (err) {
        console.warn('Could not delete profile in Supabase:', err);
      }
    }

    const currentUsers = getStoredUsers();
    const updated = currentUsers.filter((u) => u.id !== userId);
    saveStoredUsers(updated);
    setUsers(updated);
    return { error: null };
  }, []);

  const updateUserRole = useCallback(
    async (userId: string, newRole: UserRole) => {
      if (isSupabaseConfigured) {
        try {
          await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
        } catch (err) {
          console.warn('Could not update role in Supabase:', err);
        }
      }

      const currentUsers = getStoredUsers();
      const updated = currentUsers.map((u) =>
        u.id === userId ? { ...u, role: newRole } : u
      );
      saveStoredUsers(updated);
      setUsers(updated);

      if (user?.id === userId) {
        const updatedSelf = { ...user, role: newRole };
        setActiveSessionUser(updatedSelf);
        setUser(updatedSelf);
      }
      return { error: null };
    },
    [user]
  );

  const updateUserStatus = useCallback(
    async (userId: string, newStatus: AccountStatus) => {
      if (isSupabaseConfigured) {
        try {
          await supabase.from('profiles').update({ status: newStatus }).eq('id', userId);
        } catch (err) {
          console.warn('Could not update status in Supabase:', err);
        }
      }

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
    },
    [user]
  );

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
        password: userData.password,
        role: userData.role,
        status: userData.status || 'active',
        createdAt: new Date().toISOString(),
        approvedAt: userData.status === 'active' ? new Date().toISOString() : undefined,
        approvedBy: user?.name || 'Super Admin',
        headline: userData.headline || `${userData.role} at FluentaRise`,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name.trim())}&backgroundColor=0284c7`,
      };

      if (isSupabaseConfigured) {
        try {
          await supabase.from('profiles').insert([
            {
              id: newUser.id,
              name: newUser.name,
              email: newUser.email,
              password_hash: newUser.password,
              phone: '',
              role: newUser.role,
              status: newUser.status,
              headline: newUser.headline,
              avatar: newUser.avatar,
              created_at: newUser.createdAt,
              approved_at: newUser.approvedAt,
              approved_by: newUser.approvedBy,
            },
          ]);
        } catch (err) {
          console.warn('Could not insert direct profile to Supabase:', err);
        }
      }

      const updated = [newUser, ...currentUsers];
      saveStoredUsers(updated);
      setUsers(updated);
      return { error: null, user: newUser };
    },
    [user]
  );

  const deleteUser = useCallback(
    async (userId: string) => {
      if (isSupabaseConfigured) {
        try {
          await supabase.from('profiles').delete().eq('id', userId);
        } catch (err) {
          console.warn('Could not delete profile in Supabase:', err);
        }
      }

      const currentUsers = getStoredUsers();
      const updated = currentUsers.filter((u) => u.id !== userId);
      saveStoredUsers(updated);
      setUsers(updated);
      if (user?.id === userId) {
        setActiveSessionUser(null);
        setUser(null);
      }
      return { error: null };
    },
    [user]
  );

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
