import type { AppUser, UserRole, AccountStatus } from './types';

const STORAGE_USERS_KEY = 'fluentarise_users_v2';
const STORAGE_SESSION_KEY = 'fluentarise_active_session_v2';

export const INITIAL_USERS: AppUser[] = [
  {
    id: 'usr_superadmin',
    name: 'FluentaRise Super Admin',
    email: 'admin@fluentarise.com',
    password: 'FluentaRise2026!',
    role: 'super_admin',
    status: 'active',
    createdAt: '2026-01-01T08:00:00.000Z',
    approvedAt: '2026-01-01T08:00:00.000Z',
    approvedBy: 'System Init',
    headline: 'Academy Platform Super Administrator',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'usr_instructor_prince',
    name: 'Prince Dimpoz',
    email: 'instructor@fluentarise.com',
    password: 'FluentaRise2026!',
    role: 'instructor',
    status: 'active',
    instructorId: 'ins_prince',
    createdAt: '2026-01-15T09:30:00.000Z',
    approvedAt: '2026-01-15T10:00:00.000Z',
    approvedBy: 'FluentaRise Super Admin',
    headline: 'Senior English & Communication Coach',
    bio: 'Lead coach with over 10 years instructing English fluency and public speaking across East Africa.',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 'usr_instructor_aline',
    name: 'Aline Uwase',
    email: 'aline@fluentarise.com',
    password: 'FluentaRise2026!',
    role: 'instructor',
    status: 'active',
    instructorId: 'i2',
    createdAt: '2026-01-20T10:00:00.000Z',
    approvedAt: '2026-01-20T11:00:00.000Z',
    approvedBy: 'FluentaRise Super Admin',
    headline: 'Backend Engineer & Java Mentor',
    bio: 'Mentoring future developers into production-ready software engineers.',
    avatar: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 'usr_student_jean',
    name: 'Jean Eric Mugabo',
    email: 'student@fluentarise.com',
    password: 'FluentaRise2026!',
    role: 'student',
    status: 'active',
    createdAt: '2026-02-01T11:00:00.000Z',
    approvedAt: '2026-02-01T14:20:00.000Z',
    approvedBy: 'FluentaRise Super Admin',
    headline: 'Full-Stack Software Engineering Learner',
    enrolledCourseIds: ['c_java', 'c_english', 'c_web'],
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'usr_pending_clarisse',
    name: 'Clarisse Uwera',
    email: 'pending@fluentarise.com',
    password: 'FluentaRise2026!',
    role: 'student',
    status: 'pending',
    createdAt: '2026-03-10T16:45:00.000Z',
    headline: 'Registered Candidate — Awaiting Super Admin Review',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'usr_pending_emmanuel',
    name: 'Emmanuel Nsengiyumva',
    email: 'emmanuel.teacher@fluentarise.com',
    password: 'FluentaRise2026!',
    role: 'instructor',
    status: 'pending',
    createdAt: '2026-03-11T09:15:00.000Z',
    headline: 'Java & Cloud Systems Instructor Applicant',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
];

export function getStoredUsers(): AppUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to parse users from localStorage', err);
  }
  return INITIAL_USERS;
}

export function saveStoredUsers(users: AppUser[]): void {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users to localStorage', err);
  }
}

export function getActiveSessionUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppUser;
  } catch {
    return null;
  }
}

export function setActiveSessionUser(user: AppUser | null): void {
  try {
    if (!user) {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    } else {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
    }
  } catch (err) {
    console.error('Failed to update active session', err);
  }
}
