/**
 * SalesChart - Sales trend chart component using native SVG
 */
import { useState, useMemo } from 'react';
import clsx from 'clsx';

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

interface SalesChartProps {
  data: SalesData[];
  loading?: boolean;
  className?: string;
}

type Period = 'daily' | 'weekly' | 'monthly';

export function SalesChart({ data, loading = false, className }: SalesChartProps) {
  const [period, setPeriod] = useState<Period>('daily');
  const [showOrders, setShowOrders] = useState(false);

  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    
    // For simplicity, just use the raw data
    // In production, you'd aggregate by period
    return data.slice(-30);
  }, [data, period]);

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1);
  const maxOrders = Math.max(...chartData.map((d) => d.orders), 1);
  const maxValue = showOrders ? maxOrders : maxRevenue;

  const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = chartData.reduce((sum, d) => sum + d.orders, 0);
  const avgRevenue = chartData.length > 0 ? totalRevenue / chartData.length : 0;

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toFixed(0)}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className={clsx('rounded-xl border border-slate-700 bg-slate-800/50 p-6', className)}>
        <div className="animate-pulse">
          <div className="h-6 w-32 rounded bg-slate-700" />
          <div className="mt-4 h-64 rounded bg-slate-700" />
        </div>
      </div>
    );
  }

  const chartHeight = 250;
  const chartWidth = 100; // percentage
  const barWidth = chartData.length > 0 ? Math.min(30, (chartWidth - 10) / chartData.length) : 30;
  const gap = 2;

  return (
    <div className={clsx('rounded-xl border border-slate-700 bg-slate-800/50 p-6', className)}>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Sales Overview</h3>
          <p className="mt-1 text-sm text-slate-400">Revenue trends over time</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle */}
          <div className="flex rounded-lg border border-slate-700 bg-slate-800 p-1">
            <button
              onClick={() => setShowOrders(false)}
              className={clsx(
                'rounded-md px-3 py-1.5 text-xs font-medium transition',
                !showOrders ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              Revenue
            </button>
            <button
              onClick={() => setShowOrders(true)}
              className={clsx(
                'rounded-md px-3 py-1.5 text-xs font-medium transition',
                showOrders ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              Orders
            </button>
          </div>

          {/* Period selector */}
          <div className="flex rounded-lg border border-slate-700 bg-slate-800 p-1">
            {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={clsx(
                  'rounded-md px-3 py-1.5 text-xs font-medium capitalize transition',
                  period === p ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-slate-400">Total Revenue</p>
          <p className="text-xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
        </div>
        <div>
          <p className="text-sm text-slate-400">Total Orders</p>
          <p className="text-xl font-bold text-white">{totalOrders}</p>
        </div>
        <div>
          <p className="text-sm text-slate-400">Avg. Daily Revenue</p>
          <p className="text-xl font-bold text-white">{formatCurrency(avgRevenue)}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        {chartData.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-slate-400">
            No data available
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${chartData.length * (barWidth + gap)} ${chartHeight + 40}`}
            className="h-64 w-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <g key={ratio}>
                <line
                  x1="0"
                  y1={chartHeight - ratio * chartHeight}
                  x2={chartData.length * (barWidth + gap)}
                  y2={chartHeight - ratio * chartHeight}
                  stroke="#334155"
                  strokeDasharray="4"
                />
                <text
                  x="-5"
                  y={chartHeight - ratio * chartHeight + 4}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="end"
                >
                  {showOrders
                    ? Math.round(maxValue * ratio)
                    : formatCurrency(maxValue * ratio)}
                </text>
              </g>
            ))}

            {/* Bars */}
            {chartData.map((d, i) => {
              const value = showOrders ? d.orders : d.revenue;
              const height = (value / maxValue) * chartHeight;
              const x = i * (barWidth + gap);
              const y = chartHeight - height;

              return (
                <g key={i}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={height}
                    rx="4"
                    className="fill-emerald-500 transition hover:fill-emerald-400"
                  />
                  {/* Show label for every nth item */}
                  {i % Math.ceil(chartData.length / 7) === 0 && (
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight + 20}
                      fill="#64748b"
                      fontSize="10"
                      textAnchor="middle"
                    >
                      {formatDate(d.date)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
}

export default SalesChart;
