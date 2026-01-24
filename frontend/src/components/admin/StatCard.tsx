import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendUp = true }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              {trendUp ? (
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400 mr-1" />
              )}
              <span className={`text-sm font-medium ${trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {trend}
              </span>
            </div>
          )}
        </div>
        <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
          <div className="text-orange-600 dark:text-orange-400">{icon}</div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;