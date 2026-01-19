/**
 * MetricsCards - Dashboard metrics cards component
 */
import React from 'react';
import clsx from 'clsx';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users } from 'lucide-react';

interface MetricCard {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  iconBg?: string;
  loading?: boolean;
}

interface MetricsCardsProps {
  metrics: MetricCard[];
  className?: string;
  loading?: boolean;
}

export function MetricsCards({ metrics, className, loading = false }: MetricsCardsProps) {
  return (
    <div className={clsx('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {metrics.map((metric, index) => (
        <MetricCardItem key={index} {...metric} loading={loading || metric.loading} />
      ))}
    </div>
  );
}

function MetricCardItem({ label, value, change, changeLabel, icon, iconBg = 'bg-emerald-500/10', loading }: MetricCard) {
  const isPositive = change !== undefined && change >= 0;

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <div className="animate-pulse">
          <div className="h-4 w-24 rounded bg-slate-700" />
          <div className="mt-3 h-8 w-32 rounded bg-slate-700" />
          <div className="mt-2 h-4 w-20 rounded bg-slate-700" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 transition hover:border-slate-600">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-white">{value}</p>
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
              <span className={clsx('text-sm font-medium', isPositive ? 'text-emerald-400' : 'text-red-400')}>
                {isPositive ? '+' : ''}{change}%
              </span>
              {changeLabel && <span className="text-xs text-slate-500">{changeLabel}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div className={clsx('flex h-12 w-12 items-center justify-center rounded-xl', iconBg)}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// Preset metrics for common use cases
export function DashboardMetrics({
  totalRevenue,
  totalOrders,
  totalProducts,
  totalUsers,
  revenueChange,
  ordersChange,
  loading = false,
}: {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  revenueChange?: number;
  ordersChange?: number;
  loading?: boolean;
}) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  const metrics: MetricCard[] = [
    {
      label: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      change: revenueChange,
      changeLabel: 'vs last month',
      icon: <DollarSign className="h-6 w-6 text-emerald-400" />,
      iconBg: 'bg-emerald-500/10',
    },
    {
      label: 'Total Orders',
      value: (Number(totalOrders) || 0).toLocaleString(),
      change: ordersChange,
      changeLabel: 'vs last month',
      icon: <ShoppingCart className="h-6 w-6 text-blue-400" />,
      iconBg: 'bg-blue-500/10',
    },
    {
      label: 'Products',
      value: (Number(totalProducts) || 0).toLocaleString(),
      icon: <Package className="h-6 w-6 text-purple-400" />,
      iconBg: 'bg-purple-500/10',
    },
    {
      label: 'Users',
      value: (Number(totalUsers) || 0).toLocaleString(),
      icon: <Users className="h-6 w-6 text-amber-400" />,
      iconBg: 'bg-amber-500/10',
    },
  ];

  return <MetricsCards metrics={metrics} loading={loading} />;
}

export default MetricsCards;
