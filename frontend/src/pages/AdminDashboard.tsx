import React, { useState, useEffect } from 'react';
import { BarChart, Package, Users, ShoppingCart, DollarSign, TrendingUp, Activity, AlertTriangle } from 'lucide-react';
import { useStore } from '@/app/store';
import { adminDashboardAPI, getImageUrl } from '@/app/api';
import StatCard from '@/components/admin/StatCard';

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

const AdminDashboard: React.FC = () => {
  const { user, logout } = useStore();
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

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-orange-500 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="bg-red-100 rounded-full p-4 inline-block mb-4">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error loading dashboard</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchDashboardStats}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition shadow-lg font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-8 py-8 relative">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.username}! 👋
            </h1>
            <p className="text-white/90 text-lg">
              Here's what's happening with your store today
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mb-24"></div>
        </div>
      </div>
      {/* Stats Grid */}
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
          trendUp={true}
        />
        <StatCard
          title="Total Products"
          value={stats?.total_products?.toString() || '0'}
          icon={<Package className="h-6 w-6" />}
          trend="In catalog"
          trendUp={true}
        />
        <StatCard
          title="Total Users"
          value={stats?.total_users?.toString() || '0'}
          icon={<Users className="h-6 w-6" />}
          trend="Registered"
          trendUp={true}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          <BarChart className="h-6 w-6 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="group flex items-center justify-center px-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            <Package className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Add Product</span>
          </button>
          <button className="group flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            <Users className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Manage Users</span>
          </button>
          <button className="group flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            <ShoppingCart className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">View Orders</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <div className="bg-green-100 rounded-full p-2">
              <Activity className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="space-y-4">
            {stats?.recent_orders?.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition">
                <div className="flex-shrink-0">
                  <div className="bg-green-100 rounded-full p-2">
                    <ShoppingCart className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Order #{order.id}</p>
                  <p className="text-sm text-gray-600">{order.customer_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">${order.total_amount}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )) || (
              <div className="text-center py-8">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">No recent orders</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Low Stock Alert</h2>
            <div className="bg-red-100 rounded-full p-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <div className="space-y-4">
            {stats?.low_stock_products?.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-red-50 transition">
                <div className="flex items-center space-x-3">
                  <div className="bg-red-100 rounded-full p-2">
                    <Package className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">ID: {product.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">{product.stock} left</p>
                  <p className="text-xs text-gray-500">Low stock</p>
                </div>
              </div>
            )) || (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">All products well stocked</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Products */}
      {stats?.top_products && stats.top_products.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Top Selling Products</h2>
            <TrendingUp className="h-6 w-6 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.top_products.slice(0, 6).map((product) => (
              <div key={product.id} className="group flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:shadow-lg transition-all">
                <div className="flex-shrink-0">
                  <img
                    src={getImageUrl(product.primary_image) || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg group-hover:scale-110 transition-transform"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-orange-600 transition">
                    {product.name}
                  </p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm font-medium text-green-600">
                      Sold: {product.total_sold}
                    </span>
                  </div>
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