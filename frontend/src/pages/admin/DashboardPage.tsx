/**
 * AdminDashboard - Enhanced dashboard page with metrics, charts, and alerts
 */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import {
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Clock
} from 'lucide-react';
import { useStore } from '@/app/store';
import { useAdminStore } from '@/stores/adminStore';
import { DashboardMetrics } from '@/components/admin/charts/MetricsCards';
import { SalesChart } from '@/components/admin/charts/SalesChart';
import { CategoryChart } from '@/components/admin/charts/CategoryChart';
import { formatCurrency, formatDateTime } from '@/services/adminService';

export default function AdminDashboard() {
  const { theme } = useStore();
  const { dashboard, fetchDashboardData } = useAdminStore();
  const { stats, salesData, categorySales, recentOrders, lowStockProducts, isLoading, error } = dashboard;

  const isDark = theme === 'dark';

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-500/10 text-amber-400',
      confirmed: 'bg-blue-500/10 text-blue-400',
      processing: 'bg-purple-500/10 text-purple-400',
      shipped: 'bg-cyan-500/10 text-cyan-400',
      delivered: 'bg-emerald-500/10 text-emerald-400',
      cancelled: 'bg-red-500/10 text-red-400',
    };
    return colors[status] || 'bg-slate-500/10 text-gray-500 dark:text-slate-400';
  };

  if (error) {
    return (
      <div className={`rounded-xl border p-6 text-center ${isDark
        ? 'border-red-500/30 bg-red-500/10'
        : 'border-red-300 bg-red-50'
        }`}>
        <AlertTriangle className={`mx-auto h-12 w-12 ${isDark ? 'text-red-400' : 'text-red-500'
          }`} />
        <h3 className={`mt-4 text-lg font-semibold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'
          }`}>Failed to load dashboard</h3>
        <p className={`mt-2 text-sm ${isDark ? 'text-gray-500 dark:text-slate-400' : 'text-gray-600'
          }`}>{error}</p>
        <button
          onClick={() => fetchDashboardData()}
          className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-red-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isDark ? 'bg-black text-gray-900 dark:text-white' : 'bg-white text-gray-900'}`}>
      {/* Metrics */}
      <DashboardMetrics
        totalRevenue={stats?.total_revenue || 0}
        totalOrders={stats?.total_orders || 0}
        totalProducts={stats?.total_products || 0}
        totalUsers={stats?.total_users || 0}
        revenueChange={stats?.revenue_change}
        ordersChange={stats?.orders_change}
        loading={isLoading}
      />

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesChart data={salesData} loading={isLoading} />
        </div>
        <div>
          <CategoryChart data={categorySales} loading={isLoading} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className={`rounded-xl border p-6 ${isDark
          ? 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50'
          : 'border-gray-200 bg-white'
          }`}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'
              }`}>Recent Orders</h3>
            <Link
              to="/admin/orders"
              className={`flex items-center gap-1 text-sm ${isDark
                ? 'text-emerald-400 hover:text-emerald-300'
                : 'text-emerald-600 hover:text-emerald-700'
                }`}
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-24 rounded bg-slate-700" />
                    <div className="h-4 w-16 rounded bg-slate-700" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <p className={`py-8 text-center ${isDark ? 'text-gray-500 dark:text-slate-400' : 'text-gray-500'
              }`}>No orders yet</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/admin/orders/${order.id}`}
                  className={`group flex items-center justify-between rounded-lg p-3 transition ${isDark
                    ? 'hover:bg-slate-700/50'
                    : 'hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isDark ? 'bg-slate-700' : 'bg-gray-100'
                      }`}>
                      <ShoppingCart className={`h-5 w-5 ${isDark ? 'text-gray-500 dark:text-slate-400' : 'text-gray-500'
                        }`} />
                    </div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'
                        }`}>Order #{order.id}</p>
                      <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-gray-500 dark:text-slate-400' : 'text-gray-500'
                        }`}>
                        <Clock className="h-3 w-3" />
                        {formatDateTime(order.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'
                      }`}>{formatCurrency(order.total_amount)}</p>
                    <span
                      className={clsx(
                        'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                        getStatusColor(order.status)
                      )}
                    >
                      {order.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className={`rounded-xl border p-6 ${isDark
          ? 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50'
          : 'border-gray-200 bg-white'
          }`}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'
                }`}>Low Stock Alerts</h3>
              {lowStockProducts.length > 0 && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${isDark
                  ? 'bg-amber-500/10 text-amber-400'
                  : 'bg-amber-100 text-amber-800'
                  }`}>
                  {lowStockProducts.length}
                </span>
              )}
            </div>
            <Link
              to="/admin/inventory"
              className={`flex items-center gap-1 text-sm ${isDark
                ? 'text-emerald-400 hover:text-emerald-300'
                : 'text-emerald-600 hover:text-emerald-700'
                }`}
            >
              View inventory
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded ${isDark ? 'bg-slate-700' : 'bg-gray-200'
                      }`} />
                    <div className="flex-1">
                      <div className={`h-4 w-32 rounded ${isDark ? 'bg-slate-700' : 'bg-gray-200'
                        }`} />
                      <div className={`mt-1 h-3 w-20 rounded ${isDark ? 'bg-slate-700' : 'bg-gray-200'
                        }`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : lowStockProducts.length === 0 ? (
            <div className="py-8 text-center">
              <Package className={`mx-auto h-12 w-12 ${isDark ? 'text-emerald-400' : 'text-emerald-500'
                }`} />
              <p className={`mt-2 ${isDark ? 'text-gray-500 dark:text-slate-400' : 'text-gray-500'
                }`}>All products are well stocked</p>
            </div>
          ) : (
            <div className="space-y-4">
              {lowStockProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/admin/products/${product.id}`}
                  className={`group flex items-center gap-4 rounded-lg p-3 transition ${isDark
                    ? 'hover:bg-slate-700/50'
                    : 'hover:bg-gray-50'
                    }`}
                >
                  {product.primary_image ? (
                    <img
                      src={product.primary_image}
                      alt={product.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${isDark ? 'bg-slate-700' : 'bg-gray-100'
                      }`}>
                      <Package className={`h-6 w-6 ${isDark ? 'text-gray-500 dark:text-slate-400' : 'text-gray-500'
                        }`} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`truncate font-medium ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'
                      }`}>{product.name}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-500 dark:text-slate-400' : 'text-gray-500'
                      }`}>SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={clsx(
                        'text-lg font-bold',
                        product.stock === 0
                          ? (isDark ? 'text-red-400' : 'text-red-500')
                          : (isDark ? 'text-amber-400' : 'text-amber-500')
                      )}
                    >
                      {product.stock}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'
                      }`}>in stock</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickActionCard
          to="/admin/products/new"
          icon={<Package className="h-6 w-6" />}
          title="Add Product"
          description="Create a new product listing"
          color="emerald"
        />
        <QuickActionCard
          to="/admin/orders?status=pending"
          icon={<ShoppingCart className="h-6 w-6" />}
          title="Process Orders"
          description={`${stats?.pending_orders || 0} orders pending`}
          color="blue"
        />
        <QuickActionCard
          to="/admin/users"
          icon={<Users className="h-6 w-6" />}
          title="Manage Users"
          description="View and manage customers"
          color="purple"
        />
        <QuickActionCard
          to="/admin/analytics"
          icon={<TrendingUp className="h-6 w-6" />}
          title="View Analytics"
          description="Detailed reports and insights"
          color="amber"
        />
      </div>
    </div>
  );
}

function QuickActionCard({
  to,
  icon,
  title,
  description,
  color,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'emerald' | 'blue' | 'purple' | 'amber';
}) {
  const colorClasses = {
    emerald: 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20',
    amber: 'bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20',
  };

  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4 transition hover:border-slate-600"
    >
      <div className={clsx('flex h-12 w-12 items-center justify-center rounded-xl transition', colorClasses[color])}>
        {icon}
      </div>
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{title}</p>
        <p className="text-sm text-gray-500 dark:text-slate-400">{description}</p>
      </div>
    </Link>
  );
}
