/**
 * DataTable - Reusable data table component with sorting, pagination, and selection
 */
import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField?: string;
  isLoading?: boolean;
  emptyMessage?: string;
  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string, order: 'asc' | 'desc') => void;
  // Pagination
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  // Selection
  selectable?: boolean;
  selectedIds?: (string | number)[];
  onSelectionChange?: (ids: (string | number)[]) => void;
  // Row actions
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  // Styles
  className?: string;
  compact?: boolean;
  striped?: boolean;
  bordered?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField = 'id',
  isLoading = false,
  emptyMessage = 'No data found',
  sortBy,
  sortOrder = 'asc',
  onSort,
  page = 1,
  pageSize = 20,
  total = 0,
  totalPages = 1,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  onRowClick,
  rowClassName,
  className,
  compact = false,
  striped = true,
  bordered: _bordered = false,
}: DataTableProps<T>) {
  const [localSort, setLocalSort] = useState<{ key: string; order: 'asc' | 'desc' } | null>(null);
  // Ensure data is always an array (protect against undefined/null)
  const safeData = data ?? [];
  const handleSort = (key: string) => {
    const newOrder = sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc';
    if (onSort) {
      onSort(key, newOrder);
    } else {
      setLocalSort({ key, order: newOrder });
    }
  };
  const sortedData = useMemo(() => {
    if (onSort || !localSort) return safeData;
    return [...safeData].sort((a, b) => {
      const aVal = a[localSort.key];
      const bVal = b[localSort.key];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      const comparison = aVal < bVal ? -1 : 1;
      return localSort.order === 'asc' ? comparison : -comparison;
    });
  }, [safeData, localSort, onSort]);
  const allSelected = safeData.length > 0 && safeData.every((row) => selectedIds.includes(row[keyField]));
  const someSelected = safeData.some((row) => selectedIds.includes(row[keyField])) && !allSelected;
  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange(selectedIds.filter((id) => !safeData.some((row) => row[keyField] === id)));
    } else {
      const newIds = safeData.map((row) => row[keyField]);
      onSelectionChange([...new Set([...selectedIds, ...newIds])]);
    }
  };
  const handleSelectRow = (row: T) => {
    if (!onSelectionChange) return;
    const id = row[keyField];
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };
  const currentSortKey = sortBy || localSort?.key;
  const currentSortOrder = sortBy ? sortOrder : localSort?.order;
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);
  return (
    <div className={clsx('overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50', className)}>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800">
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => el && (el.indeterminate = someSelected)}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-800"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={clsx(
                    'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400',
                    column.sortable && 'cursor-pointer select-none hover:text-white',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.width && `w-[${column.width}]`
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <span className="flex flex-col">
                        <ChevronUp
                          className={clsx(
                            'h-3 w-3 -mb-1',
                            currentSortKey === column.key && currentSortOrder === 'asc'
                              ? 'text-emerald-400'
                              : 'text-slate-600'
                          )}
                        />
                        <ChevronDown
                          className={clsx(
                            'h-3 w-3',
                            currentSortKey === column.key && currentSortOrder === 'desc'
                              ? 'text-emerald-400'
                              : 'text-slate-600'
                          )}
                        />
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="py-12 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-400" />
                  <p className="mt-2 text-sm text-slate-400">Loading...</p>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="py-12 text-center text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, index) => {
                const isSelected = selectedIds.includes(row[keyField]);
                return (
                  <tr
                    key={row[keyField]}
                    className={clsx(
                      'transition-colors',
                      striped && index % 2 === 1 && 'bg-slate-800/30',
                      isSelected && 'bg-emerald-500/10',
                      onRowClick && 'cursor-pointer hover:bg-slate-700/50',
                      rowClassName?.(row)
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <td className="w-12 px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(row)}
                          className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-800"
                          aria-label="Select row"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={clsx(
                          'px-4 text-sm text-slate-300',
                          compact ? 'py-2' : 'py-3',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right'
                        )}
                      >
                        {column.render
                          ? column.render(row[column.key], row, index)
                          : row[column.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {(onPageChange || onPageSizeChange) && total > 0 && (
        <div className="flex items-center justify-between border-t border-slate-700 bg-slate-800/50 px-4 py-3">
          <div className="flex items-center gap-4">
            {onPageSizeChange && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  className="rounded-lg border border-slate-600 bg-slate-700 px-2 py-1 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  aria-label="Items per page"
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <span>entries</span>
              </div>
            )}
            <div className="text-sm text-slate-400">
              Showing {startItem} to {endItem} of {total} entries
            </div>
          </div>
          {onPageChange && totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(1)}
                disabled={page === 1}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="First page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {/* Page numbers */}
              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={clsx(
                        'min-w-[2rem] rounded-lg px-3 py-1 text-sm font-medium',
                        page === pageNum
                          ? 'bg-emerald-500 text-white'
                          : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => onPageChange(totalPages)}
                disabled={page === totalPages}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Last page"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DataTable;





