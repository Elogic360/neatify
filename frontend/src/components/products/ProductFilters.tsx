/**
 * ProductFilters - Sidebar filters for product catalog
 */
import React, { useState } from 'react';
import clsx from 'clsx';
import { X, ChevronDown, ChevronUp, Filter, RotateCcw } from 'lucide-react';
import type { Category, ProductFilters as FiltersType } from '../../types/product';
import Button from '../ui/Button';

interface FilterSection {
  id: string;
  title: string;
  isOpen: boolean;
}

interface ProductFiltersProps {
  filters: FiltersType;
  categories: Category[];
  onFilterChange: (filters: Partial<FiltersType>) => void;
  onClearFilters: () => void;
  onRemoveFilter: (key: keyof FiltersType) => void;
  hasActiveFilters: boolean;
  activeFilterBadges: Array<{ key: string; label: string; value: string }>;
  isLoading?: boolean;
  className?: string;
  isMobile?: boolean;
  onClose?: () => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  categories,
  onFilterChange,
  onClearFilters,
  onRemoveFilter,
  hasActiveFilters,
  activeFilterBadges,
  isLoading: _isLoading = false,
  className,
  isMobile = false,
  onClose,
}) => {
  const [sections, setSections] = useState<FilterSection[]>([
    { id: 'category', title: 'Category', isOpen: true },
    { id: 'price', title: 'Price Range', isOpen: true },
    { id: 'availability', title: 'Availability', isOpen: true },
    { id: 'rating', title: 'Rating', isOpen: false },
  ]);

  const [priceMin, setPriceMin] = useState<string>(filters.min_price?.toString() || '');
  const [priceMax, setPriceMax] = useState<string>(filters.max_price?.toString() || '');

  const toggleSection = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isOpen: !s.isOpen } : s))
    );
  };

  const handlePriceApply = () => {
    const min = priceMin ? parseFloat(priceMin) : undefined;
    const max = priceMax ? parseFloat(priceMax) : undefined;
    onFilterChange({ min_price: min, max_price: max });
  };

  const handlePriceClear = () => {
    setPriceMin('');
    setPriceMax('');
    onFilterChange({ min_price: undefined, max_price: undefined });
  };

  const SectionHeader: React.FC<{ section: FilterSection }> = ({ section }) => (
    <button
      onClick={() => toggleSection(section.id)}
      className="flex w-full items-center justify-between py-3 text-left"
      aria-expanded={section.isOpen ? 'true' : 'false'}
    >
      <span className="text-sm font-semibold text-gray-900">{section.title}</span>
      {section.isOpen ? (
        <ChevronUp className="h-4 w-4 text-gray-500" />
      ) : (
        <ChevronDown className="h-4 w-4 text-gray-500" />
      )}
    </button>
  );

  const getSection = (id: string) => sections.find((s) => s.id === id);

  return (
    <div
      className={clsx(
        'bg-white',
        isMobile ? 'h-full overflow-y-auto' : 'rounded-xl border border-gray-200 p-4',
        className
      )}
    >
      {/* Mobile Header */}
      {isMobile && (
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <span className="text-lg font-semibold">Filters</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
            aria-label="Close filters"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className={clsx(isMobile && 'px-4 pb-24')}>
        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Active Filters</span>
              <button
                onClick={onClearFilters}
                className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600"
              >
                <RotateCcw className="h-3 w-3" />
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeFilterBadges.map((badge) => (
                <span
                  key={badge.key}
                  className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700"
                >
                  {badge.value}
                  <button
                    onClick={() => onRemoveFilter(badge.key as keyof FiltersType)}
                    className="ml-1 rounded-full p-0.5 hover:bg-orange-100"
                    aria-label={`Remove ${badge.label} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="border-b border-gray-200">
          <SectionHeader section={getSection('category')!} />
          {getSection('category')?.isOpen && (
            <div className="pb-4 space-y-1">
              <button
                onClick={() => onFilterChange({ category_id: undefined })}
                className={clsx(
                  'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  !filters.category_id
                    ? 'bg-orange-50 font-medium text-orange-700'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => onFilterChange({ category_id: category.id })}
                  className={clsx(
                    'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    filters.category_id === category.id
                      ? 'bg-orange-50 font-medium text-orange-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{category.name}</span>
                    {category.product_count !== undefined && (
                      <span className="text-xs text-gray-400">
                        ({category.product_count})
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price Range Filter */}
        <div className="border-b border-gray-200">
          <SectionHeader section={getSection('price')!} />
          {getSection('price')?.isOpen && (
            <div className="pb-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="sr-only">Minimum price</label>
                  <input
                    type="number"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    placeholder="Min"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    min="0"
                  />
                </div>
                <span className="text-gray-400">-</span>
                <div className="flex-1">
                  <label className="sr-only">Maximum price</label>
                  <input
                    type="number"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    placeholder="Max"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePriceApply}
                  className="flex-1 rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600"
                >
                  Apply
                </button>
                {(priceMin || priceMax) && (
                  <button
                    onClick={handlePriceClear}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    Clear
                  </button>
                )}
              </div>
              {/* Quick price ranges */}
              <div className="flex flex-wrap gap-1">
                {[
                  { label: 'Under TZS 25K', min: 0, max: 25000 },
                  { label: 'TZS 25K-50K', min: 25000, max: 50000 },
                  { label: 'TZS 50K-100K', min: 50000, max: 100000 },
                  { label: 'Over TZS 100K', min: 100000, max: undefined },
                ].map((range) => (
                  <button
                    key={range.label}
                    onClick={() => {
                      setPriceMin(range.min?.toString() || '');
                      setPriceMax(range.max?.toString() || '');
                      onFilterChange({ min_price: range.min, max_price: range.max });
                    }}
                    className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-200"
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Availability Filter */}
        <div className="border-b border-gray-200">
          <SectionHeader section={getSection('availability')!} />
          {getSection('availability')?.isOpen && (
            <div className="pb-4 space-y-2">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={filters.in_stock_only}
                  onChange={() => onFilterChange({ in_stock_only: !filters.in_stock_only })}
                  className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">In Stock Only</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={filters.is_featured || false}
                  onChange={() => onFilterChange({ is_featured: !filters.is_featured })}
                  className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Featured Products</span>
              </label>
            </div>
          )}
        </div>

        {/* Rating Filter */}
        <div>
          <SectionHeader section={getSection('rating')!} />
          {getSection('rating')?.isOpen && (
            <div className="pb-4 space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => onFilterChange({ rating_min: rating })}
                  className={clsx(
                    'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                    filters.rating_min === rating
                      ? 'bg-orange-50 text-orange-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={clsx(
                          'h-4 w-4',
                          i < rating ? 'text-yellow-400' : 'text-gray-300'
                        )}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span>& up</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Footer */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4">
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClearFilters} className="flex-1">
              Clear All
            </Button>
            <Button variant="primary" onClick={onClose} className="flex-1">
              Show Results
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
