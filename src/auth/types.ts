export type UserRole = 'super_admin' | 'instructor' | 'student';
export type AccountStatus = 'active' | 'pending' | 'suspended';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  status: AccountStatus;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  phone?: string;
  avatar?: string;
  headline?: string;
  bio?: string;
  instructorId?: string;
  enrolledCourseIds?: string[];
}

export interface AuthSession {
  user: AppUser;
  token: string;
  expiresAt: number;
}
