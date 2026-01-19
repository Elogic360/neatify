/**
 * CategoryChart - Category distribution pie chart using native SVG
 */

import clsx from 'clsx';

interface CategoryData {
  category: string;
  sales: number;
  percentage: number;
}

interface CategoryChartProps {
  data: CategoryData[];
  loading?: boolean;
  className?: string;
}

const COLORS = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#14b8a6', // teal
  '#6366f1', // indigo
];

export function CategoryChart({ data, loading = false, className }: CategoryChartProps) {
  if (loading) {
    return (
      <div className={clsx('rounded-xl border border-slate-700 bg-slate-800/50 p-6', className)}>
        <div className="animate-pulse">
          <div className="h-6 w-32 rounded bg-slate-700" />
          <div className="mt-4 flex items-center justify-center">
            <div className="h-48 w-48 rounded-full bg-slate-700" />
          </div>
        </div>
      </div>
    );
  }

  // Ensure data is a valid array
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className={clsx('rounded-xl border border-slate-700 bg-slate-800/50 p-6', className)}>
        <h3 className="text-lg font-semibold text-white">Sales by Category</h3>
        <p className="mt-1 text-sm text-slate-400">Revenue distribution</p>
        <div className="mt-6 flex items-center justify-center h-48 text-slate-500">
          No category data available
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + (Number(d.sales) || 0), 0);
  const sortedData = [...data].sort((a, b) => b.sales - a.sales).slice(0, 8);

  // Calculate pie chart segments
  let currentAngle = -90; // Start from top
  const segments = sortedData.map((d, i) => {
    const angle = (d.sales / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    // Convert to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // Calculate arc path
    const radius = 80;
    const cx = 100;
    const cy = 100;
    const largeArcFlag = angle > 180 ? 1 : 0;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const pathD =
      angle >= 360
        ? `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius} Z`
        : `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    return {
      ...d,
      path: pathD,
      color: COLORS[i % COLORS.length],
    };
  });

  const formatCurrency = (amount: number) => {
    const val = Number(amount) || 0;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return `$${val.toFixed(0)}`;
  };

  return (
    <div className={clsx('rounded-xl border border-slate-700 bg-slate-800/50 p-6', className)}>
      <h3 className="text-lg font-semibold text-white">Sales by Category</h3>
      <p className="mt-1 text-sm text-slate-400">Revenue distribution</p>

      <div className="mt-6 flex flex-col items-center gap-6 lg:flex-row">
        {/* Pie chart */}
        <div className="relative flex-shrink-0">
          <svg viewBox="0 0 200 200" className="h-48 w-48">
            {segments.map((segment, i) => (
              <path
                key={i}
                d={segment.path}
                fill={segment.color}
                className="transition hover:opacity-80"
                style={{ cursor: 'pointer' }}
              />
            ))}
            {/* Center hole for donut effect */}
            <circle cx="100" cy="100" r="50" fill="#1e293b" />
            {/* Center text */}
            <text x="100" y="95" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
              {formatCurrency(total)}
            </text>
            <text x="100" y="112" textAnchor="middle" fill="#94a3b8" fontSize="11">
              Total
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          {segments.map((segment, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-sm text-slate-300">{segment.category}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-white">{formatCurrency(segment.sales)}</span>
                <span className="ml-2 text-xs text-slate-400">({(Number(segment.percentage) || 0).toFixed(1)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryChart;
