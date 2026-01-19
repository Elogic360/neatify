/**
 * OrderListPage - Enhanced order management with status filters
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import {
  ShoppingCart,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Package,
  User,
} from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';
import { DataTable, Column } from '@/components/admin/DataTable';
import { SearchFilter, FilterOption } from '@/components/admin/SearchFilter';
import { formatCurrency, formatDateTime } from '@/services/adminService';

interface Order {
  id: number;
  user_id: number;
  user_email?: string;
  user_name?: string;
  status: string;
  payment_status: string;
  total_amount: number;
  item_count: number;
  shipping_address?: string;
  created_at: string;
  updated_at: string;
}

const ORDER_STATUSES = [
  { value: '', label: 'All Orders', icon: ShoppingCart, count: 0 },
  { value: 'pending', label: 'Pending', icon: Clock, count: 0 },
  { value: 'confirmed', label: 'Confirmed', icon: CheckCircle, count: 0 },
  { value: 'processing', label: 'Processing', icon: Package, count: 0 },
  { value: 'shipped', label: 'Shipped', icon: Truck, count: 0 },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle, count: 0 },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle, count: 0 },
];

export default function OrderListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeStatus = searchParams.get('status') || '';

  const {
    orders,
    fetchOrders,
  } = useAdminStore();

  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);

  useEffect(() => {
    fetchOrders({ status: activeStatus || undefined });
  }, [fetchOrders, activeStatus]);

  // Status tab change
  const handleStatusChange = (status: string) => {
    if (status) {
      setSearchParams({ status });
    } else {
      setSearchParams({});
    }
    setSelectedOrders([]);
  };

  // Search and filter handlers
  const handleSearch = (query: string) => {
    fetchOrders({ search: query, page: 1, status: activeStatus || undefined });
  };

  const handleFilterChange = (key: string, value: unknown) => {
    const filters: Record<string, string | undefined> = {
      status: activeStatus || undefined,
      page: '1',
    };
    if (key === 'payment_status') {
      filters.payment_status = value as string || undefined;
    } else if (key === 'date_range' && value) {
      // Convert date_range to date_from/date_to
      const today = new Date();
      const dateMap: Record<string, () => { from: string; to: string }> = {
        today: () => ({
          from: today.toISOString().split('T')[0],
          to: today.toISOString().split('T')[0],
        }),
        week: () => {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return { from: weekAgo.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
        },
        month: () => {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return { from: monthAgo.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
        },
        '3months': () => {
          const threeMonthsAgo = new Date(today);
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          return { from: threeMonthsAgo.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
        },
      };
      const range = dateMap[value as string]?.();
      if (range) {
        filters.date_from = range.from;
        filters.date_to = range.to;
      }
    }
    fetchOrders(filters);
  };

  const handlePageChange = (page: number) => {
    fetchOrders({ page, status: activeStatus || undefined });
  };

  // Filter options
  const paymentFilterOptions: FilterOption[] = [
    { label: 'All Payment Status', value: '' },
    { label: 'Paid', value: 'paid' },
    { label: 'Pending', value: 'pending' },
    { label: 'Failed', value: 'failed' },
    { label: 'Refunded', value: 'refunded' },
  ];

  const dateFilterOptions: FilterOption[] = [
    { label: 'All Time', value: '' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'Last 3 Months', value: '3months' },
  ];

  // Get status styling
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      processing: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      shipped: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
    };
    return colors[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'text-emerald-400',
      pending: 'text-amber-400',
      failed: 'text-red-400',
      refunded: 'text-slate-400',
    };
    return colors[status] || 'text-slate-400';
  };

  // Table columns
  const columns: Column<Order>[] = [
    {
      key: 'id',
      header: 'Order',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-medium text-white">#{value}</p>
          <p className="text-xs text-slate-400">{formatDateTime(row.created_at)}</p>
        </div>
      ),
    },
    {
      key: 'user_name',
      header: 'Customer',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700">
            <User className="h-4 w-4 text-slate-400" />
          </div>
          <div>
            <p className="font-medium text-white">{value || 'Guest'}</p>
            <p className="text-xs text-slate-400">{row.user_email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'item_count',
      header: 'Items',
      align: 'center',
      render: (value) => (
        <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-white">
          {value} items
        </span>
      ),
    },
    {
      key: 'total_amount',
      header: 'Total',
      sortable: true,
      align: 'right',
      render: (value) => (
        <span className="font-medium text-white">{formatCurrency(value)}</span>
      ),
    },
    {
      key: 'payment_status',
      header: 'Payment',
      align: 'center',
      render: (value) => (
        <span className={clsx('text-sm font-medium capitalize', getPaymentStatusColor(value))}>
          {value}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      align: 'center',
      render: (value) => (
        <span
          className={clsx(
            'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium capitalize',
            getStatusColor(value)
          )}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (_, row) => (
        <Link
          to={`/admin/orders/${row.id}`}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-emerald-400 hover:bg-emerald-500/10"
        >
          <Eye className="h-4 w-4" />
          View
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-sm text-slate-400">
            Manage and track customer orders ({orders.total} orders)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-700 pb-4">
        {ORDER_STATUSES.map((status) => {
          const Icon = status.icon;
          const isActive = activeStatus === status.value;
          return (
            <button
              key={status.value}
              onClick={() => handleStatusChange(status.value)}
              className={clsx(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition',
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4" />
              {status.label}
            </button>
          );
        })}
      </div>

      {/* Search and Filters */}
      <SearchFilter
        searchPlaceholder="Search orders by ID, customer..."
        onSearchChange={handleSearch}
        onFilterChange={handleFilterChange}
        filters={[
          { key: 'payment_status', label: 'Payment', type: 'select', options: paymentFilterOptions },
          { key: 'date_range', label: 'Date', type: 'select', options: dateFilterOptions },
        ]}
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={orders.items as unknown as Order[]}
        isLoading={orders.isLoading}
        page={orders.page}
        pageSize={orders.pageSize}
        total={orders.total}
        totalPages={orders.totalPages}
        onPageChange={handlePageChange}
        selectable
        selectedIds={selectedOrders}
        onSelectionChange={(ids) => setSelectedOrders(ids.map(id => Number(id)))}
        onRowClick={(row: Order) => navigate(`/admin/orders/${row.id}`)}
        emptyMessage={activeStatus ? `No ${activeStatus} orders at the moment` : 'Orders will appear here when customers make purchases'}
      />
    </div>
  );
}
