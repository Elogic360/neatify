/**
 * AnalyticsPage - Reports and analytics dashboard
 */
import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Download,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { SalesChart } from '@/components/admin/charts/SalesChart';
import { CategoryChart } from '@/components/admin/charts/CategoryChart';
import { useToast } from '@/components/admin/Toast';
import { adminService, formatCurrency } from '@/services/adminService';

interface AnalyticsData {
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  daily_sales: Array<{ date: string; revenue: number; orders: number }>;
}

const DATE_RANGES = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Last year' },
  { value: 'custom', label: 'Custom range' },
];

export default function AnalyticsPage() {
  const { showToast } = useToast();
  const [dateRange, setDateRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      // Convert date range string to actual dates
      const today = new Date();
      let dateFrom = new Date();
      
      switch (dateRange) {
        case '7d':
          dateFrom.setDate(today.getDate() - 7);
          break;
        case '30d':
          dateFrom.setDate(today.getDate() - 30);
          break;
        case '90d':
          dateFrom.setDate(today.getDate() - 90);
          break;
        case '1y':
          dateFrom.setFullYear(today.getFullYear() - 1);
          break;
        default:
          dateFrom.setDate(today.getDate() - 30);
      }
      
      const response = await adminService.analyticsAPI.getSalesReport(
        dateFrom.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      );
      setData(response);
    } catch {
      showToast('Failed to load analytics', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (type: 'csv' | 'pdf') => {
    setIsExporting(true);
    try {
      // Convert date range string to actual dates
      const today = new Date();
      let dateFrom = new Date();
      
      switch (dateRange) {
        case '7d':
          dateFrom.setDate(today.getDate() - 7);
          break;
        case '30d':
          dateFrom.setDate(today.getDate() - 30);
          break;
        case '90d':
          dateFrom.setDate(today.getDate() - 90);
          break;
        case '1y':
          dateFrom.setFullYear(today.getFullYear() - 1);
          break;
        default:
          dateFrom.setDate(today.getDate() - 30);
      }
      
      const blob = await adminService.analyticsAPI.exportReport(
        'sales',
        dateFrom.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${dateRange}.${type}`;
      a.click();
      window.URL.revokeObjectURL(url);
      showToast('Report exported successfully', 'success');
    } catch {
      showToast('Failed to export report', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Track your store performance and insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1">
            {DATE_RANGES.slice(0, 4).map((range) => (
              <button
                key={range.value}
                onClick={() => setDateRange(range.value)}
                className={clsx(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition',
                  dateRange === range.value
                    ? 'bg-emerald-500 text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:text-white'
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(data?.total_revenue || 0)}
          icon={<DollarSign className="h-5 w-5" />}
          color="emerald"
        />
        <MetricCard
          title="Total Orders"
          value={data?.total_orders || 0}
          icon={<ShoppingCart className="h-5 w-5" />}
          color="blue"
        />
        <MetricCard
          title="Average Order Value"
          value={formatCurrency(data?.average_order_value || 0)}
          icon={<BarChart3 className="h-5 w-5" />}
          color="purple"
        />
        <MetricCard
          title="Daily Average"
          value={formatCurrency((data?.total_revenue || 0) / (data?.daily_sales?.length || 1))}
          icon={<TrendingUp className="h-5 w-5" />}
          color="amber"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesChart
            data={data?.daily_sales || []}
            loading={isLoading}
          />
        </div>
        <div>
          <CategoryChart
            data={[]}
            loading={isLoading}
          />
        </div>
      </div>

      {/* Simple Summary */}
      <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Sales Summary</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 dark:border-slate-700 p-4 text-center">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data?.total_revenue || 0)}
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-400">Total Revenue</p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-slate-700 p-4 text-center">
            <p className="text-3xl font-bold text-emerald-400">
              {data?.total_orders || 0}
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-400">Total Orders</p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-slate-700 p-4 text-center">
            <p className="text-3xl font-bold text-blue-400">
              {formatCurrency(data?.average_order_value || 0)}
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-400">Average Order Value</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  change,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: 'emerald' | 'blue' | 'purple' | 'amber';
}) {
  const colorClasses = {
    emerald: 'bg-emerald-500/10 text-emerald-400',
    blue: 'bg-blue-500/10 text-blue-400',
    purple: 'bg-purple-500/10 text-purple-400',
    amber: 'bg-amber-500/10 text-amber-400',
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6">
      <div className="flex items-start justify-between">
        <div className={clsx('rounded-lg p-3', colorClasses[color])}>{icon}</div>
        {change !== undefined && (
          <div
            className={clsx(
              'flex items-center gap-1 text-sm font-medium',
              change >= 0 ? 'text-emerald-400' : 'text-red-400'
            )}
          >
            {change >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{title}</p>
    </div>
  );
}
