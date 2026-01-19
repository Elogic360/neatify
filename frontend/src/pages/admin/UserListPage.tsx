/**
 * UserListPage - User management with role management
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  User,
  UserPlus,
  Shield,
  ShieldCheck,
  MoreHorizontal,
  Eye,
  Edit2,
  Ban,
  CheckCircle,
  Download,
  Calendar,
} from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';
import { DataTable, Column } from '@/components/admin/DataTable';
import { SearchFilter, FilterOption } from '@/components/admin/SearchFilter';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/Toast';
import { formatDateTime, adminService } from '@/services/adminService';

interface UserData {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  orders_count: number;
  total_spent: number;
  last_login?: string;
  created_at: string;
}

export default function UserListPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    users,
    fetchUsers,
  } = useAdminStore();

  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [actionMenu, setActionMenu] = useState<number | null>(null);
  const [statusConfirm, setStatusConfirm] = useState<{
    open: boolean;
    user?: UserData;
    action?: 'activate' | 'deactivate';
  }>({ open: false });
  const [roleConfirm, setRoleConfirm] = useState<{
    open: boolean;
    user?: UserData;
    newRole?: string;
  }>({ open: false });

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Search and filter handlers
  const handleSearch = (query: string) => {
    fetchUsers({ search: query, page: 1 });
  };

  const handleFilterChange = (key: string, value: unknown) => {
    const filters: Record<string, unknown> = { page: 1 };
    if (key === 'role') {
      filters.role = value as string || undefined;
    } else if (key === 'status') {
      if (value === 'active') filters.is_active = true;
      else if (value === 'inactive') filters.is_active = false;
      // verified/unverified would need is_verified field if supported
    }
    fetchUsers(filters);
  };

  const handlePageChange = (page: number) => {
    fetchUsers({ page });
  };

  // Filter options
  const roleFilterOptions: FilterOption[] = [
    { label: 'All Roles', value: '' },
    { label: 'Customer', value: 'customer' },
    { label: 'Admin', value: 'admin' },
  ];

  const statusFilterOptions: FilterOption[] = [
    { label: 'All Status', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Verified', value: 'verified' },
    { label: 'Unverified', value: 'unverified' },
  ];

  // Actions
  const handleStatusChange = (user: UserData, action: 'activate' | 'deactivate') => {
    setStatusConfirm({ open: true, user, action });
    setActionMenu(null);
  };

  const handleRoleChange = (user: UserData, newRole: string) => {
    setRoleConfirm({ open: true, user, newRole });
    setActionMenu(null);
  };

  const confirmStatusChange = async () => {
    if (!statusConfirm.user || !statusConfirm.action) return;

    try {
      const isActive = statusConfirm.action === 'activate';
      await adminService.usersAPI.update(statusConfirm.user.id, { is_active: isActive });
      showToast(`User ${statusConfirm.action}d successfully`, 'success');
      fetchUsers();
    } catch {
      showToast(`Failed to ${statusConfirm.action} user`, 'error');
    }
    setStatusConfirm({ open: false });
  };

  const confirmRoleChange = async () => {
    if (!roleConfirm.user || !roleConfirm.newRole) return;

    try {
      await adminService.usersAPI.updateRole(roleConfirm.user.id, roleConfirm.newRole);
      showToast(`User role updated to ${roleConfirm.newRole}`, 'success');
      fetchUsers();
    } catch {
      showToast('Failed to update user role', 'error');
    }
    setRoleConfirm({ open: false });
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  // Table columns
  const columns: Column<UserData>[] = [
    {
      key: 'email',
      header: 'User',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div
            className={clsx(
              'flex h-10 w-10 items-center justify-center rounded-full',
              row.role === 'admin' ? 'bg-purple-500/20' : 'bg-slate-700'
            )}
          >
            {row.role === 'admin' ? (
              <ShieldCheck className="h-5 w-5 text-purple-400" />
            ) : (
              <User className="h-5 w-5 text-slate-400" />
            )}
          </div>
          <div>
            <p className="font-medium text-white">
              {row.first_name && row.last_name
                ? `${row.first_name} ${row.last_name}`
                : value}
            </p>
            <p className="text-xs text-slate-400">{value}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      align: 'center',
      render: (value) => (
        <span
          className={clsx(
            'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
            value === 'admin'
              ? 'bg-purple-500/10 text-purple-400'
              : 'bg-slate-500/10 text-slate-400'
          )}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'orders_count',
      header: 'Orders',
      sortable: true,
      align: 'center',
      render: (value) => (
        <span className="text-white">{value}</span>
      ),
    },
    {
      key: 'total_spent',
      header: 'Total Spent',
      sortable: true,
      align: 'right',
      render: (value) => (
        <span className="font-medium text-white">{formatCurrency(value)}</span>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      align: 'center',
      render: (value, row) => (
        <div className="flex flex-col items-center gap-1">
          <span
            className={clsx(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              value
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-red-500/10 text-red-400'
            )}
          >
            {value ? 'Active' : 'Inactive'}
          </span>
          {!row.email_verified && (
            <span className="text-xs text-amber-400">Unverified</span>
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Joined',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1 text-sm text-slate-400">
          <Calendar className="h-3 w-3" />
          {formatDateTime(value).split(',')[0]}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (_, row) => (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActionMenu(actionMenu === row.id ? null : row.id);
            }}
            className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white"
            aria-label="User actions"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>

          {actionMenu === row.id && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setActionMenu(null)}
              />
              <div className="absolute right-0 top-8 z-20 w-48 rounded-lg border border-slate-700 bg-slate-800 py-1 shadow-lg">
                <Link
                  to={`/admin/users/${row.id}`}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </Link>
                <Link
                  to={`/admin/users/${row.id}/edit`}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Link>
                <div className="my-1 border-t border-slate-700" />
                {row.role === 'customer' ? (
                  <button
                    onClick={() => handleRoleChange(row, 'admin')}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-purple-400 hover:bg-slate-700"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Make Admin
                  </button>
                ) : (
                  <button
                    onClick={() => handleRoleChange(row, 'customer')}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                  >
                    <Shield className="h-4 w-4" />
                    Remove Admin
                  </button>
                )}
                <div className="my-1 border-t border-slate-700" />
                {row.is_active ? (
                  <button
                    onClick={() => handleStatusChange(row, 'deactivate')}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
                  >
                    <Ban className="h-4 w-4" />
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange(row, 'activate')}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-emerald-400 hover:bg-slate-700"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Activate
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-sm text-slate-400">
            Manage customers and admin users ({users.total} users)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700">
            <Download className="h-4 w-4" />
            Export
          </button>
          <Link
            to="/admin/users/new"
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchFilter
        searchPlaceholder="Search users by name, email..."
        onSearchChange={handleSearch}
        onFilterChange={handleFilterChange}
        filters={[
          { key: 'role', label: 'Role', type: 'select', options: roleFilterOptions },
          { key: 'status', label: 'Status', type: 'select', options: statusFilterOptions },
        ]}
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={users.items as unknown as UserData[]}
        isLoading={users.isLoading}
        page={users.page}
        pageSize={users.pageSize}
        total={users.total}
        totalPages={users.totalPages}
        onPageChange={handlePageChange}
        selectable
        selectedIds={selectedUsers}
        onSelectionChange={(ids) => setSelectedUsers(ids.map(id => Number(id)))}
        onRowClick={(row: UserData) => navigate(`/admin/users/${row.id}`)}
        emptyMessage="No users found. Users will appear here when they sign up."
      />

      {/* Status Change Confirmation */}
      <ConfirmDialog
        open={statusConfirm.open}
        onClose={() => setStatusConfirm({ open: false })}
        onConfirm={confirmStatusChange}
        title={statusConfirm.action === 'activate' ? 'Activate User' : 'Deactivate User'}
        message={
          statusConfirm.action === 'activate'
            ? `Are you sure you want to activate "${statusConfirm.user?.email}"? They will be able to log in and access the platform.`
            : `Are you sure you want to deactivate "${statusConfirm.user?.email}"? They will not be able to log in until reactivated.`
        }
        variant={statusConfirm.action === 'activate' ? 'info' : 'warning'}
        confirmLabel={statusConfirm.action === 'activate' ? 'Activate' : 'Deactivate'}
      />

      {/* Role Change Confirmation */}
      <ConfirmDialog
        open={roleConfirm.open}
        onClose={() => setRoleConfirm({ open: false })}
        onConfirm={confirmRoleChange}
        title="Change User Role"
        message={
          roleConfirm.newRole === 'admin'
            ? `Are you sure you want to make "${roleConfirm.user?.email}" an admin? They will have full access to the admin dashboard.`
            : `Are you sure you want to remove admin privileges from "${roleConfirm.user?.email}"? They will only have customer access.`
        }
        variant="warning"
        confirmLabel="Change Role"
      />
    </div>
  );
}
