import { useState, useMemo } from 'react';
import {
  Users,
  UserCheck,
  Clock,
  Shield,
  GraduationCap,
  UserRound,
  Search,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  AlertCircle,
  Pencil,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
  Phone,
  Mail,
  ShieldAlert,
  Save,
  Check,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { PageHeader } from '../components/AdminLayout';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import type { AppUser, UserRole, AccountStatus } from '../../auth/types';

export default function UserManagement() {
  const {
    user: currentLoggedInUser,
    allUsers,
    pendingUsersCount,
    approveUser,
    rejectUser,
    updateUserRole,
    updateUserStatus,
    updateUser,
    addUserDirect,
    deleteUser,
    refreshUsers,
  } = useAuth();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | AccountStatus>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AppUser | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; tone: 'success' | 'info' | 'error' } | null>(
    null
  );

  // New User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('student');
  const [newStatus, setNewStatus] = useState<AccountStatus>('active');
  const [newHeadline, setNewHeadline] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Edit User Form State
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('student');
  const [editStatus, setEditStatus] = useState<AccountStatus>('active');
  const [editHeadline, setEditHeadline] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to generate a strong random password
  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Pending users queue
  const pendingUsers = useMemo(
    () => allUsers.filter((u) => u.status === 'pending'),
    [allUsers]
  );

  // Filtered directory
  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.phone && u.phone.includes(search));
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [allUsers, search, roleFilter, statusFilter]);

  const handleApprove = async (u: AppUser) => {
    await approveUser(u.id);
    setFeedback({
      message: `Account for ${u.name} (${u.email}) has been approved and activated! An automated approval email has been sent to them.`,
      tone: 'success',
    });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleReject = async (u: AppUser) => {
    if (confirm(`Are you sure you want to reject and remove registration for ${u.name}?`)) {
      await rejectUser(u.id);
      setFeedback({
        message: `Registration for ${u.name} has been rejected.`,
        tone: 'info',
      });
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    const res = await addUserDirect({
      name: newName,
      email: newEmail,
      phone: newPhone,
      password: newPassword,
      role: newRole,
      status: newStatus,
      headline: newHeadline,
    });
    setIsSubmitting(false);

    if (res.error) {
      alert(res.error);
      return;
    }

    setAddModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewPassword('');
    setNewHeadline('');
    setFeedback({
      message: `User ${newName} successfully created as ${newRole}!`,
      tone: 'success',
    });
    setTimeout(() => setFeedback(null), 5000);
  };

  const openEditModal = (u: AppUser) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditPhone(u.phone || '');
    setEditRole(u.role);
    setEditStatus(u.status);
    setEditHeadline(u.headline || '');
    setEditBio(u.bio || '');
    setEditNewPassword('');
    setShowEditPassword(false);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (editNewPassword && editNewPassword.length < 6) {
      alert('New password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    const res = await updateUser(editingUser.id, {
      name: editName,
      email: editEmail,
      phone: editPhone,
      role: editRole,
      status: editStatus,
      headline: editHeadline,
      bio: editBio,
      ...(editNewPassword ? { password: editNewPassword } : {}),
    });
    setIsSubmitting(false);

    if (res.error) {
      alert(res.error);
      return;
    }

    setEditingUser(null);
    setFeedback({
      message: `User profile for ${editName} updated successfully!`,
      tone: 'success',
    });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setIsSubmitting(true);
    const res = await deleteUser(deletingUser.id);
    setIsSubmitting(false);

    if (res.error) {
      alert(res.error);
      return;
    }

    const deletedName = deletingUser.name;
    setDeletingUser(null);
    setFeedback({
      message: `Account for ${deletedName} has been permanently deleted.`,
      tone: 'info',
    });
    setTimeout(() => setFeedback(null), 5000);
  };

  const superAdminCount = allUsers.filter((u) => u.role === 'super_admin').length;
  const instructorCount = allUsers.filter((u) => u.role === 'instructor' && u.status === 'active').length;
  const studentCount = allUsers.filter((u) => u.role === 'student' && u.status === 'active').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users & Approvals"
        subtitle="Manage academy user accounts, control roles, review registrations, and enforce security policies."
        icon={<Users size={22} />}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshUsers()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
              title="Refresh from Supabase"
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <button
              onClick={() => {
                setNewPassword(generateStrongPassword());
                setAddModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-brand-800 px-4 py-2 text-xs font-bold text-white shadow hover:bg-brand-900 transition"
            >
              <Plus size={15} /> Add User Directly
            </button>
          </div>
        }
      />

      {feedback && (
        <div
          className={`flex items-center gap-3 rounded-2xl p-4 text-sm font-medium shadow-sm transition animate-fade-in ${
            feedback.tone === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-900'
              : feedback.tone === 'error'
              ? 'border border-rose-200 bg-rose-50 text-rose-900'
              : 'border border-sky-200 bg-sky-50 text-sky-900'
          }`}
        >
          <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
          <p>{feedback.message}</p>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Users
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-600">
              <Users size={18} />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold text-slate-900">
            {allUsers.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Across all platform roles</p>
        </div>

        <div
          className={`rounded-2xl border p-5 shadow-sm transition ${
            pendingUsersCount > 0
              ? 'border-amber-300 bg-amber-50/50 ring-2 ring-amber-200'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                pendingUsersCount > 0 ? 'text-amber-800' : 'text-slate-500'
              }`}
            >
              Pending Activation
            </span>
            <div
              className={`grid h-9 w-9 place-items-center rounded-xl ${
                pendingUsersCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Clock size={18} />
            </div>
          </div>
          <p
            className={`mt-3 font-display text-3xl font-extrabold ${
              pendingUsersCount > 0 ? 'text-amber-900' : 'text-slate-900'
            }`}
          >
            {pendingUsersCount}
          </p>
          <p
            className={`mt-1 text-xs ${
              pendingUsersCount > 0 ? 'font-semibold text-amber-800' : 'text-slate-500'
            }`}
          >
            {pendingUsersCount > 0 ? 'Action required to allow login' : 'Zero pending approvals'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Instructors
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <GraduationCap size={18} />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold text-slate-900">
            {instructorCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">Course leaders & mentors</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Students
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-purple-50 text-purple-600">
              <UserRound size={18} />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold text-slate-900">
            {studentCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">Enrolled & learning</p>
        </div>
      </div>

      {/* PENDING APPROVALS QUEUE */}
      <section className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-700">
              <Clock size={20} />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Pending Account Approvals Queue
              </h2>
              <p className="text-xs text-slate-500">
                New accounts must be approved by Super Admin before they can log in to the system.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
            {pendingUsers.length} waiting for review
          </span>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="py-10 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
            <p className="mt-3 font-display text-base font-bold text-slate-900">
              All caught up!
            </p>
            <p className="mt-1 text-xs text-slate-500">
              There are no pending accounts waiting for Super Admin activation.
            </p>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-slate-100">
            {pendingUsers.map((pending) => (
              <div
                key={pending.id}
                className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={
                      pending.avatar ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(pending.name)}`
                    }
                    alt={pending.name}
                    className="h-11 w-11 rounded-xl object-cover border border-slate-200 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900">{pending.name}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                          pending.role === 'instructor'
                            ? 'bg-emerald-100 text-emerald-800'
                            : pending.role === 'super_admin'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        Applied as {pending.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>{pending.email}</span>
                      {pending.phone && <span>· {pending.phone}</span>}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Registered: {new Date(pending.createdAt).toLocaleDateString()} at{' '}
                      {new Date(pending.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(pending)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 transition"
                  >
                    <UserCheck size={15} /> Approve & Activate
                  </button>
                  <button
                    onClick={() => openEditModal(pending)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                  >
                    <Pencil size={14} /> Review / Edit
                  </button>
                  <button
                    onClick={() => handleReject(pending)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition"
                  >
                    <XCircle size={15} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ALL USERS DIRECTORY */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">All Academy Accounts</h2>
            <p className="text-xs text-slate-500">
              Full directory of Super Admins, Instructors, and Students.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative min-w-56">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search name, email, phone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs outline-none focus:border-brand-500 focus:bg-white transition"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-brand-500"
            >
              <option value="all">All Roles ({allUsers.length})</option>
              <option value="super_admin">Super Admins ({superAdminCount})</option>
              <option value="instructor">Instructors ({instructorCount})</option>
              <option value="student">Students ({studentCount})</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-brand-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="pending">Pending Approval</option>
              <option value="suspended">Suspended Only</option>
            </select>
          </div>
        </div>

        {/* Directory Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">User & Profile</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Joined Date</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const isSelf = currentLoggedInUser?.id === u.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            u.avatar ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`
                          }
                          alt={u.name}
                          className="h-10 w-10 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-slate-900">{u.name}</p>
                            {isSelf && (
                              <span className="rounded bg-sky-100 px-1.5 py-0.2 text-[10px] font-bold text-sky-800">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">{u.headline || 'Member'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-xs">
                        <p className="font-medium text-slate-800">{u.email}</p>
                        {u.phone && <p className="text-slate-400 mt-0.5">{u.phone}</p>}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <select
                        value={u.role}
                        disabled={isSelf}
                        onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                        className={`rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold outline-none focus:border-brand-500 ${
                          isSelf ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white text-slate-700'
                        }`}
                      >
                        <option value="super_admin">Super Admin</option>
                        <option value="instructor">Instructor</option>
                        <option value="student">Student</option>
                      </select>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          u.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : u.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            u.status === 'active'
                              ? 'bg-emerald-500'
                              : u.status === 'pending'
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                        />
                        {u.status === 'active'
                          ? 'Active'
                          : u.status === 'pending'
                          ? 'Pending Approval'
                          : 'Suspended'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-xs text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {u.status === 'pending' ? (
                          <button
                            onClick={() => handleApprove(u)}
                            className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition"
                          >
                            Approve
                          </button>
                        ) : u.status === 'active' ? (
                          <button
                            disabled={isSelf}
                            onClick={() => updateUserStatus(u.id, 'suspended')}
                            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-amber-50 hover:text-amber-700 transition disabled:opacity-30 disabled:cursor-not-allowed"
                            title={isSelf ? 'Cannot suspend your own account' : 'Suspend user access'}
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => updateUserStatus(u.id, 'active')}
                            className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition"
                            title="Reactivate user access"
                          >
                            Reactivate
                          </button>
                        )}

                        <button
                          onClick={() => openEditModal(u)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-800 transition"
                          title="Edit profile & reset password"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          disabled={isSelf}
                          onClick={() => setDeletingUser(u)}
                          className={`rounded-lg p-1.5 transition ${
                            isSelf
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-slate-400 hover:bg-red-50 hover:text-red-600'
                          }`}
                          title={isSelf ? 'Cannot delete your own account' : 'Delete user'}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No users match the search criteria.
            </div>
          )}
        </div>
      </section>

      {/* 1. ADD USER DIRECTLY MODAL */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add User Directly"
        subtitle="Create a new authenticated account in Supabase database."
        size="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input
              required
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Samuel Kayiranga"
              className="input font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Email Address *</label>
              <input
                required
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="samuel@fluentarise.com"
                className="input"
              />
            </div>

            <div>
              <label className="label">Phone Number (Optional)</label>
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+250780000000"
                className="input"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="label mb-0">Initial Password *</label>
              <button
                type="button"
                onClick={() => setNewPassword(generateStrongPassword())}
                className="text-xs font-bold text-brand-700 hover:underline flex items-center gap-1"
              >
                <KeyRound size={12} /> Generate Strong Password
              </button>
            </div>
            <div className="relative">
              <input
                required
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="input pr-10 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Assigned Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="input"
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            <div>
              <label className="label">Account Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as AccountStatus)}
                className="input"
              >
                <option value="active">Active (Immediate Login)</option>
                <option value="pending">Pending Approval</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Headline / Title (Optional)</label>
            <input
              type="text"
              value={newHeadline}
              onChange={(e) => setNewHeadline(e.target.value)}
              placeholder="e.g. Lead Java Instructor or Web Dev Student"
              className="input"
            />
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !newName.trim() || !newEmail.trim()}
              className="btn-primary"
            >
              {isSubmitting ? 'Saving to Database…' : 'Save & Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. EDIT USER & RESET PASSWORD MODAL */}
      <Modal
        open={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        title={editingUser ? `Edit Account: ${editingUser.name}` : 'Edit User'}
        subtitle="Update profile details, contact information, role, or reset password."
        size="md"
      >
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input
              required
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="input font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Email Address *</label>
              <input
                required
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="label">Phone Number</label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="+250780000000"
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Role</label>
              <select
                value={editRole}
                disabled={currentLoggedInUser?.id === editingUser?.id}
                onChange={(e) => setEditRole(e.target.value as UserRole)}
                className="input"
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            <div>
              <label className="label">Status</label>
              <select
                value={editStatus}
                disabled={currentLoggedInUser?.id === editingUser?.id}
                onChange={(e) => setEditStatus(e.target.value as AccountStatus)}
                className="input"
              >
                <option value="active">Active (Can Log In)</option>
                <option value="pending">Pending Approval</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Reset Password Field */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <KeyRound size={13} className="text-brand-700" /> Reset Password (Optional)
              </label>
              <button
                type="button"
                onClick={() => setEditNewPassword(generateStrongPassword())}
                className="text-[11px] font-bold text-brand-700 hover:underline"
              >
                Generate Password
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Leave blank to keep the current password unchanged. Enter a new password to reset it.
            </p>
            <div className="relative">
              <input
                type={showEditPassword ? 'text' : 'password'}
                value={editNewPassword}
                onChange={(e) => setEditNewPassword(e.target.value)}
                placeholder="Enter new password (optional)"
                className="input pr-10 font-mono text-xs bg-white"
              />
              <button
                type="button"
                onClick={() => setShowEditPassword(!showEditPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showEditPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="label">Headline / Title</label>
            <input
              type="text"
              value={editHeadline}
              onChange={(e) => setEditHeadline(e.target.value)}
              placeholder="e.g. Lead Java Instructor"
              className="input"
            />
          </div>

          <div>
            <label className="label">Bio</label>
            <textarea
              rows={2}
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              placeholder="Brief biography or instructor credentials…"
              className="input text-xs"
            />
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !editName.trim() || !editEmail.trim()}
              className="btn-primary"
            >
              <Save size={15} /> {isSubmitting ? 'Saving Changes…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 3. DELETE CONFIRMATION MODAL */}
      <Modal
        open={Boolean(deletingUser)}
        onClose={() => setDeletingUser(null)}
        title="Delete User Account"
        subtitle="Permanently remove user credentials and profile."
        size="sm"
        footer={
          <>
            <button className="btn-outline" onClick={() => setDeletingUser(null)}>
              Cancel
            </button>
            <button
              disabled={isSubmitting || currentLoggedInUser?.id === deletingUser?.id}
              className="btn-danger"
              onClick={handleDeleteUser}
            >
              <Trash2 size={15} /> Delete Account
            </button>
          </>
        }
      >
        <div className="space-y-3">
          {currentLoggedInUser?.id === deletingUser?.id ? (
            <div className="rounded-xl bg-amber-50 p-3.5 text-xs text-amber-800 border border-amber-200">
              <ShieldAlert size={18} className="text-amber-600 mb-1" />
              <strong>Protected Account:</strong> You cannot delete your own Super Admin account while signed in.
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              Are you sure you want to permanently delete the account for{' '}
              <strong className="text-slate-900">{deletingUser?.name}</strong> ({deletingUser?.email})? This action cannot be undone.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
