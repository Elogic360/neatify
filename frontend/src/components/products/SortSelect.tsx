/**
 * SortSelect - Dropdown for sorting products
 */
import React from 'react';
import clsx from 'clsx';
import { ArrowUpDown, Grid, List } from 'lucide-react';
import type { SortOption, ViewMode } from '../../types/product';

interface SortSelectProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalProducts?: number;
  className?: string;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'name_desc', label: 'Name: Z to A' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
];

const SortSelect: React.FC<SortSelectProps> = ({
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalProducts,
  className,
}) => {
  return (
    <div className={clsx('flex items-center justify-between gap-4', className)}>
      {/* Product Count */}
      {totalProducts !== undefined && (
        <div className="hidden text-sm text-gray-600 sm:block">
          <span className="font-semibold text-gray-900">{totalProducts}</span> products
        </div>
      )}
      <div className="flex items-center gap-3">
        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            aria-label="Sort products by"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {/* View Mode Toggle */}
        <div className="flex rounded-lg border border-gray-200 bg-white p-1">
          <button
            onClick={() => onViewModeChange('grid')}
            className={clsx(
              'rounded-md p-2 transition-colors',
              viewMode === 'grid'
                ? 'bg-orange-500 text-white'
                : 'text-gray-500 hover:text-gray-700'
            )}
            aria-label="Grid view"
            aria-pressed={viewMode === 'grid' ? 'true' : 'false'}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={clsx(
              'rounded-md p-2 transition-colors',
              viewMode === 'list'
                ? 'bg-orange-500 text-white'
                : 'text-gray-500 hover:text-gray-700'
            )}
            aria-pressed={viewMode === 'list' ? 'true' : 'false'}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SortSelect;