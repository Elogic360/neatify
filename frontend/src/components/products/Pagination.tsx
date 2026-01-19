/**
 * Pagination - Page navigation component
 */
import React from 'react';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  showInfo?: boolean;
  showFirstLast?: boolean;
  siblingCount?: number;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems = 0,
  pageSize = 12,
  showInfo = true,
  showFirstLast = true,
  siblingCount = 1,
  className,
}) => {
  // Don't render if only one page
  if (totalPages <= 1) {
    return showInfo && totalItems > 0 ? (
      <div className={clsx('text-sm text-gray-500', className)}>
        Showing all {totalItems} items
      </div>
    ) : null;
  }

  // Calculate pagination range
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const totalNumbers = siblingCount * 2 + 3; // siblings + first + last + current
    const totalBlocks = totalNumbers + 2; // +2 for the ellipsis

    if (totalPages <= totalBlocks) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftEllipsis = leftSiblingIndex > 2;
    const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 1;

    if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, 'ellipsis', totalPages];
    }

    if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + 1 + i
      );
      return [1, 'ellipsis', ...rightRange];
    }

    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [1, 'ellipsis', ...middleRange, 'ellipsis', totalPages];
  };

  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const buttonBase = clsx(
    'flex items-center justify-center rounded-lg border transition-colors',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  );

  const pageButton = (isActive: boolean) =>
    clsx(
      buttonBase,
      'h-10 min-w-[40px] px-3 text-sm font-medium',
      isActive
        ? 'border-orange-500 bg-orange-500 text-white'
        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'
    );

  const navButton = clsx(
    buttonBase,
    'h-10 w-10 border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700'
  );

  return (
    <div className={clsx('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      {/* Info */}
      {showInfo && totalItems > 0 && (
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium text-gray-700">{startItem}</span> to{' '}
          <span className="font-medium text-gray-700">{endItem}</span> of{' '}
          <span className="font-medium text-gray-700">{totalItems}</span> results
        </div>
      )}

      {/* Pagination Controls */}
      <nav className="flex items-center gap-1" aria-label="Pagination">
        {/* First Page */}
        {showFirstLast && (
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className={navButton}
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        )}

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={navButton}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page Numbers */}
        <div className="hidden sm:flex sm:gap-1">
          {pageNumbers.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="flex h-10 w-10 items-center justify-center text-gray-400"
                >
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={pageButton(currentPage === page)}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Mobile Current Page */}
        <div className="flex items-center gap-1 sm:hidden">
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={navButton}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Last Page */}
        {showFirstLast && (
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={navButton}
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        )}
      </nav>
    </div>
  );
};

export default Pagination;
