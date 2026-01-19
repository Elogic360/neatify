/**
 * SearchFilter - Search and filter bar component for admin tables
 */
import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Search, X, Filter, ChevronDown, Download } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string | number | boolean;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'daterange' | 'checkbox';
  options?: FilterOption[];
  placeholder?: string;
}

// Export FilterValue type for external use
export type FilterValue = Record<string, string | number | boolean | undefined>;

interface SearchFilterProps {
  // Search
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  
  // Filters
  filters?: FilterConfig[];
  filterValues?: Record<string, any>;
  onFilterChange?: (key: string, value: any) => void;
  onFiltersReset?: () => void;
  
  // Export
  onExport?: () => void;
  exportLabel?: string;
  
  // Custom actions
  actions?: React.ReactNode;
  
  // Debounce
  debounceMs?: number;
  
  // Styles
  className?: string;
}

export function SearchFilter({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  filterValues = {},
  onFilterChange,
  onFiltersReset,
  onExport,
  exportLabel = 'Export',
  actions,
  debounceMs = 300,
  className,
}: SearchFilterProps) {
  const [localSearch, setLocalSearch] = useState(searchValue);
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearchChange && localSearch !== searchValue) {
        onSearchChange(localSearch);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localSearch, debounceMs, onSearchChange, searchValue]);

  // Sync with external value
  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  const handleClearSearch = () => {
    setLocalSearch('');
    onSearchChange?.('');
  };

  const activeFilterCount = Object.values(filterValues).filter(
    (v) => v !== undefined && v !== null && v !== '' && v !== false
  ).length;

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Main bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        {onSearchChange && (
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-xl border border-slate-600 bg-slate-700 py-2 pl-10 pr-10 text-sm text-white placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {localSearch && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Filter toggle */}
        {filters.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition',
              showFilters || activeFilterCount > 0
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500'
            )}
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 rounded-full bg-emerald-500 px-2 py-0.5 text-xs text-white">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className={clsx('h-4 w-4 transition', showFilters && 'rotate-180')} />
          </button>
        )}

        {/* Export button */}
        {onExport && (
          <button
            onClick={onExport}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            <Download className="h-4 w-4" />
            {exportLabel}
          </button>
        )}

        {/* Custom actions */}
        {actions}
      </div>

      {/* Filter panel */}
      {showFilters && filters.length > 0 && (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex flex-wrap items-end gap-4">
            {filters.map((filter) => (
              <div key={filter.key} className="min-w-[150px]">
                <label className="mb-1 block text-xs font-medium text-slate-400">
                  {filter.label}
                </label>
                {filter.type === 'select' && (
                  <select
                    value={filterValues[filter.key] ?? ''}
                    onChange={(e) => onFilterChange?.(filter.key, e.target.value || undefined)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    aria-label={filter.label}
                  >
                    <option value="">{filter.placeholder || 'All'}</option>
                    {filter.options?.map((option) => (
                      <option key={String(option.value)} value={String(option.value)}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
                {filter.type === 'date' && (
                  <input
                    type="date"
                    value={filterValues[filter.key] ?? ''}
                    onChange={(e) => onFilterChange?.(filter.key, e.target.value || undefined)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    aria-label={filter.label}
                  />
                )}
                {filter.type === 'checkbox' && (
                  <label className="flex items-center gap-2 py-2">
                    <input
                      type="checkbox"
                      checked={filterValues[filter.key] ?? false}
                      onChange={(e) => onFilterChange?.(filter.key, e.target.checked || undefined)}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-800"
                    />
                    <span className="text-sm text-slate-300">{filter.placeholder}</span>
                  </label>
                )}
              </div>
            ))}

            {/* Reset filters */}
            {onFiltersReset && activeFilterCount > 0 && (
              <button
                onClick={onFiltersReset}
                className="rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-white"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchFilter;
