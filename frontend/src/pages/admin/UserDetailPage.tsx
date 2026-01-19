/**
 * UserDetailPage - View and manage individual user
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ShoppingCart,
  DollarSign,
  Shield,
  ShieldCheck,
  CheckCircle,
  Ban,
  Edit2,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { adminService, formatCurrency, formatDateTime, type AdminUser } from '@/services/adminService';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusConfirm, setStatusConfirm] = useState<{
    open: boolean;
    action?: 'activate' | 'deactivate';
  }>({ open: false });
  const [roleConfirm, setRoleConfirm] = useState<{
    open: boolean;
    newRole?: string;
  }>({ open: false });

  useEffect(() => {
    if (id) {
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.usersAPI.getById(Number(id));
      setUser(data);
    } catch {
      showToast('Failed to load user', 'error');
      navigate('/admin/users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!user || !statusConfirm.action) return;

    setIsUpdating(true);
    try {
      const isActive = statusConfirm.action === 'activate';
      await adminService.usersAPI.update(user.id, { is_active: isActive });
      setUser({ ...user, is_active: isActive });
      showToast(`User ${statusConfirm.action}d successfully`, 'success');
    } catch {
      showToast(`Failed to ${statusConfirm.action} user`, 'error');
    } finally {
      setIsUpdating(false);
      setStatusConfirm({ open: false });
    }
  };

  const handleRoleChange = async () => {
    if (!user || !roleConfirm.newRole) return;

    setIsUpdating(true);
    try {
      await adminService.usersAPI.updateRole(user.id, roleConfirm.newRole);
      setUser({ ...user, role: roleConfirm.newRole as AdminUser['role'] });
      showToast(`User role updated to ${roleConfirm.newRole}`, 'success');
    } catch {
      showToast('Failed to update user role', 'error');
    } finally {
      setIsUpdating(false);
      setRoleConfirm({ open: false });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <AlertTriangle className="h-12 w-12 text-amber-400" />
        <h3 className="mt-4 text-lg font-semibold text-white">User not found</h3>
        <button
          onClick={() => navigate('/admin/users')}
          className="mt-4 text-emerald-400 hover:text-emerald-300"
        >
          Back to Users
        </button>
      </div>
    );
  }

  const fullName = user.full_name || user.email;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/admin/users')}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
            aria-label="Go back to users"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-4">
            <div
              className={clsx(
                'flex h-16 w-16 items-center justify-center rounded-full',
                user.role === 'admin' ? 'bg-purple-500/20' : 'bg-slate-700'
              )}
            >
              {user.role === 'admin' ? (
                <ShieldCheck className="h-8 w-8 text-purple-400" />
              ) : (
                <User className="h-8 w-8 text-slate-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">{fullName}</h1>
                <span
                  className={clsx(
                    'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                    user.role === 'admin'
                      ? 'bg-purple-500/10 text-purple-400'
                      : 'bg-slate-500/10 text-slate-400'
                  )}
                >
                  {user.role}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-400">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/admin/users/${user.id}/edit`)}
            className="flex items-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700"
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </button>
          {user.is_active ? (
            <button
              onClick={() => setStatusConfirm({ open: true, action: 'deactivate' })}
              disabled={isUpdating}
              className="flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50"
            >
              <Ban className="h-4 w-4" />
              Deactivate
            </button>
          ) : (
            <button
              onClick={() => setStatusConfirm({ open: true, action: 'activate' })}
              disabled={isUpdating}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              Activate
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <ShoppingCart className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{user.orders_count}</p>
                  <p className="text-sm text-slate-400">Orders</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                  <DollarSign className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(user.total_spent)}
                  </p>
                  <p className="text-sm text-slate-400">Total Spent</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                  <Calendar className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">
                    {formatDateTime(user.created_at).split(',')[0]}
                  </p>
                  <p className="text-sm text-slate-400">Member Since</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Order Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-slate-700 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700">
                    <ShoppingCart className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Total Orders</p>
                    <p className="text-sm text-slate-400">{user.orders_count} orders placed</p>
                  </div>
                </div>
                <p className="font-medium text-emerald-400">
                  {formatCurrency(user.total_spent)}
                </p>
              </div>
              <button
                onClick={() => navigate('/admin/orders')}
                className="w-full rounded-lg border border-slate-700 p-3 text-center text-sm text-slate-400 hover:bg-slate-700/50 hover:text-white"
              >
                View All Orders
              </button>
            </div>
          </div>

          {/* Addresses */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Saved Addresses</h3>
            <div className="py-8 text-center">
              <MapPin className="mx-auto h-12 w-12 text-slate-500" />
              <p className="mt-2 text-slate-400">Address information not available</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Info */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-slate-400" />
                <span className="text-slate-300">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-300">{user.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Account Status */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Account Status</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status</span>
                <span
                  className={clsx(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    user.is_active
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-red-500/10 text-red-400'
                  )}
                >
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Email Verified</span>
                <span
                  className={clsx(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    user.is_verified
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-amber-500/10 text-amber-400'
                  )}
                >
                  {user.is_verified ? 'Verified' : 'Pending'}
                </span>
              </div>
              {user.last_login && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Last Login</span>
                  <span className="text-slate-300">
                    {formatDateTime(user.last_login)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Role Management */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Role & Permissions</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Role</span>
                <span
                  className={clsx(
                    'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                    user.role === 'admin'
                      ? 'bg-purple-500/10 text-purple-400'
                      : 'bg-slate-500/10 text-slate-400'
                  )}
                >
                  {user.role}
                </span>
              </div>
              {user.role === 'customer' ? (
                <button
                  onClick={() => setRoleConfirm({ open: true, newRole: 'admin' })}
                  disabled={isUpdating}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-500/10 py-2 text-sm font-medium text-purple-400 hover:bg-purple-500/20 disabled:opacity-50"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Promote to Admin
                </button>
              ) : (
                <button
                  onClick={() => setRoleConfirm({ open: true, newRole: 'customer' })}
                  disabled={isUpdating}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-700 py-2 text-sm font-medium text-slate-300 hover:bg-slate-600 disabled:opacity-50"
                >
                  <Shield className="h-4 w-4" />
                  Demote to Customer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Confirmation Dialog */}
      <ConfirmDialog
        open={statusConfirm.open}
        onClose={() => setStatusConfirm({ open: false })}
        onConfirm={handleStatusChange}
        title={statusConfirm.action === 'activate' ? 'Activate User' : 'Deactivate User'}
        message={
          statusConfirm.action === 'activate'
            ? `Are you sure you want to activate "${user.email}"? They will be able to log in and access the platform.`
            : `Are you sure you want to deactivate "${user.email}"? They will not be able to log in until reactivated.`
        }
        variant={statusConfirm.action === 'activate' ? 'info' : 'warning'}
        confirmLabel={statusConfirm.action === 'activate' ? 'Activate' : 'Deactivate'}
      />

      {/* Role Confirmation Dialog */}
      <ConfirmDialog
        open={roleConfirm.open}
        onClose={() => setRoleConfirm({ open: false })}
        onConfirm={handleRoleChange}
        title="Change User Role"
        message={
          roleConfirm.newRole === 'admin'
            ? `Are you sure you want to promote "${user.email}" to admin? They will have full access to the admin dashboard.`
            : `Are you sure you want to demote "${user.email}" to customer? They will lose admin access.`
        }
        variant="warning"
        confirmLabel="Change Role"
      />
    </div>
  );
}
