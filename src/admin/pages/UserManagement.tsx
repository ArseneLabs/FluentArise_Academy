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
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { PageHeader } from '../components/AdminLayout';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import type { AppUser, UserRole, AccountStatus } from '../../auth/types';

export default function UserManagement() {
  const {
    allUsers,
    pendingUsersCount,
    approveUser,
    rejectUser,
    updateUserRole,
    updateUserStatus,
    addUserDirect,
    deleteUser,
  } = useAuth();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | AccountStatus>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; tone: 'success' | 'info' } | null>(
    null
  );

  // New User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('student');
  const [newStatus, setNewStatus] = useState<AccountStatus>('active');
  const [newHeadline, setNewHeadline] = useState('');

  // Pending users
  const pendingUsers = useMemo(
    () => allUsers.filter((u) => u.status === 'pending'),
    [allUsers]
  );

  // Filtered directory
  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [allUsers, search, roleFilter, statusFilter]);

  const handleApprove = async (u: AppUser) => {
    await approveUser(u.id);
    setFeedback({
      message: `Account for ${u.name} (${u.email}) has been approved and activated! They can now log in.`,
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
    const res = await addUserDirect({
      name: newName,
      email: newEmail,
      password: newPassword,
      role: newRole,
      status: newStatus,
      headline: newHeadline,
    });

    if (res.error) {
      alert(res.error);
      return;
    }

    setAddModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewHeadline('');
    setFeedback({
      message: `User ${newName} successfully created as ${newRole}!`,
      tone: 'success',
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
        subtitle="Review new registrations, approve accounts for login, manage user roles, and monitor academy access."
        icon={<Users size={22} />}
        actions={
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-600/20 hover:bg-sky-700 transition"
          >
            <Plus size={16} /> Add User Directly
          </button>
        }
      />

      {feedback && (
        <div
          className={`flex items-center gap-3 rounded-2xl p-4 text-sm font-medium shadow-sm transition animate-fade-in ${
            feedback.tone === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-900'
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
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        Applied as {pending.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{pending.email}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
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
                placeholder="Search name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs outline-none focus:border-sky-500 focus:bg-white transition"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-sky-500"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admins</option>
              <option value="instructor">Instructors</option>
              <option value="student">Students</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-sky-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="pending">Pending Only</option>
              <option value="suspended">Suspended Only</option>
            </select>
          </div>
        </div>

        {/* Directory Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">User</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Joined Date</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          u.avatar ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`
                        }
                        alt={u.name}
                        className="h-9 w-9 rounded-lg object-cover border border-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <select
                      value={u.role}
                      onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-sky-500"
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
                          onClick={() => updateUserStatus(u.id, 'suspended')}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-amber-50 hover:text-amber-700 transition"
                          title="Suspend user access"
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

                      {u.role !== 'super_admin' && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete account for ${u.name}?`)) {
                              deleteUser(u.id);
                            }
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                          title="Delete user"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No users match the selected filters.
            </div>
          )}
        </div>
      </section>

      {/* ADD USER DIRECTLY MODAL */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add User Directly"
        subtitle="Create an academy account with pre-approved active status."
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
              Full Name
            </label>
            <input
              required
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Samuel Kayiranga"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
              Email Address
            </label>
            <input
              required
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="samuel@fluentarise.com"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
              Temporary Password
            </label>
            <input
              required
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter initial password"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
                Assigned Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500"
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
                Initial Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as AccountStatus)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500"
              >
                <option value="active">Active (Can log in immediately)</option>
                <option value="pending">Pending Approval</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-600">
              Headline / Title (Optional)
            </label>
            <input
              type="text"
              value={newHeadline}
              onChange={(e) => setNewHeadline(e.target.value)}
              placeholder="e.g. Lead Java Instructor or Web Dev Student"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-sky-700 transition"
            >
              Save & Create Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
