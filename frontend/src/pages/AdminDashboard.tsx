import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { useStore } from '@/app/store';
import { adminDashboardAPI, getImageUrl } from '@/app/api';
import StatCard from '@/components/admin/StatCard';
/* =========================
   TYPES (UNCHANGED)
========================= */
interface DashboardStats {
  total_users: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  monthly_revenue: number;
  last_month_revenue: number;
  revenue_growth: number;
  monthly_orders: number;
  status_breakdown: Record<string, number>;
  top_products: Array<{
    id: number;
    name: string;
    primary_image: string;
    total_sold: number;
  }>;
  recent_orders: Array<{
    id: number;
    customer_name: string;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
  low_stock_products: Array<{
    id: number;
    name: string;
    stock: number;
  }>;
}
/* =========================
   COMPONENT
========================= */
const AdminDashboard: React.FC = () => {
  const { user } = useStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetchDashboardStats();
  }, []);
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await adminDashboardAPI.getStats();
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-indigo-500 mb-4" />
        <p className="text-slate-500 font-medium">Loading dashboard...</p>
      </div>
    );
  }
  /* =========================
     ERROR
  ========================= */
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md border border-slate-200 text-center">
          <div className="bg-red-100 rounded-full p-4 inline-flex mb-4">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Failed to load dashboard
          </h3>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={fetchDashboardStats}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 text-white font-semibold shadow-lg hover:from-black hover:to-slate-950 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  /* =========================
     MAIN UI
  ========================= */
  return (
    <div className="space-y-8">
      {/* WELCOME BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 rounded-2xl shadow-xl overflow-hidden">
        <div className="relative px-8 py-8">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-indigo-300 mb-2">
              Welcome back, {user?.username}! 👋
            </h1>
            <p className="text-slate-300 text-lg">
              Store performance overview for today
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400/10 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-400/10 rounded-full -mr-24 -mb-24" />
        </div>
      </div>
      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${stats?.total_revenue?.toLocaleString() || '0'}`}
          icon={<DollarSign className="h-6 w-6" />}
          trend={`${stats?.revenue_growth?.toFixed(1) || '0'}%`}
          trendUp={(stats?.revenue_growth || 0) >= 0}
        />
        <StatCard
          title="Total Orders"
          value={stats?.total_orders?.toString() || '0'}
          icon={<ShoppingCart className="h-6 w-6" />}
          trend="All time"
          trendUp
        />
        <StatCard
          title="Total Products"
          value={stats?.total_products?.toString() || '0'}
          icon={<Package className="h-6 w-6" />}
          trend="Catalog"
          trendUp
        />
        <StatCard
          title="Total Users"
          value={stats?.total_users?.toString() || '0'}
          icon={<Users className="h-6 w-6" />}
          trend="Registered"
          trendUp
        />
      </div>
      {/* QUICK ACTIONS */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
          <BarChart className="h-6 w-6 text-slate-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="group flex items-center justify-center px-6 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-800 text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition">
            <Package className="h-5 w-5 mr-3 group-hover:scale-110 transition" />
            Add Product
          </button>
          <button className="group flex items-center justify-center px-6 py-4 rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition">
            <Users className="h-5 w-5 mr-3 group-hover:scale-110 transition" />
            Manage Users
          </button>
          <button className="group flex items-center justify-center px-6 py-4 rounded-xl bg-gradient-to-r from-violet-500 to-violet-700 text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition">
            <ShoppingCart className="h-5 w-5 mr-3 group-hover:scale-110 transition" />
            View Orders
          </button>
        </div>
      </div>
      {/* ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RECENT ORDERS */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Orders</h2>
          <div className="space-y-4">
            {stats?.recent_orders?.slice(0, 5).map(order => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Order #{order.id}
                  </p>
                  <p className="text-sm text-slate-500">{order.customer_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">
                    ${order.total_amount}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* LOW STOCK */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Low Stock Alert
          </h2>
          <div className="space-y-4">
            {stats?.low_stock_products?.slice(0, 5).map(product => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-red-50 transition"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {product.name}
                  </p>
                  <p className="text-xs text-slate-500">ID: {product.id}</p>
                </div>
                <span className="font-bold text-red-700">
                  {product.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* TOP PRODUCTS */}
      {stats?.top_products && stats.top_products.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Top Selling Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.top_products.slice(0, 6).map(product => (
              <div
                key={product.id}
                className="group flex items-center space-x-4 p-4 border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-lg transition"
              >
                <img
                  src={getImageUrl(product.primary_image) || '/placeholder-product.jpg'}
                  alt={product.name}
                  className="w-16 h-16 rounded-lg object-cover group-hover:scale-110 transition"
                />
                <div>
                  <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition">
                    {product.name}
                  </p>
                  <p className="text-sm text-indigo-600 font-medium">
                    Sold: {product.total_sold}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminDashboard;