/**
 * useProducts - Custom hook for product catalog operations
 */
import { useEffect, useCallback, useMemo } from 'react';
import { useProductStore, selectActiveFilterBadges, selectHasActiveFilters } from '../stores/productStore';
import { useDebounce } from './useDebounce';
import type { ProductFilters } from '../types/product';

export function useProducts() {
  const {
    products,
    isLoading,
    error,
    currentPage,
    pageSize,
    totalProducts,
    totalPages,
    filters,
    sortBy,
    viewMode,
    categories,
    categoriesLoading,
    fetchProducts,
    fetchCategories,
    setFilters,
    setSortBy,
    setViewMode,
    setPage,
    setPageSize,
    clearFilters,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  } = useProductStore();

  // Debounce search input
  const debouncedSearch = useDebounce(filters.search, 400);

  // Check for active filters
  const hasActiveFilters = useProductStore(selectHasActiveFilters);
  const activeFilterBadges = useProductStore(selectActiveFilterBadges);

  // Fetch products when filters, sort, or pagination changes
  useEffect(() => {
    fetchProducts({
      search: debouncedSearch,
      page: currentPage,
      page_size: pageSize,
      sort_by: sortBy,
    });
  }, [debouncedSearch, currentPage, pageSize, sortBy, filters.category_id, 
      filters.min_price, filters.max_price, filters.in_stock_only, 
      filters.is_featured, filters.rating_min, filters.brand, fetchProducts]);

  // Fetch categories on mount
  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  // Update search with debounce tracking
  const setSearch = useCallback((search: string) => {
    setFilters({ search });
  }, [setFilters]);

  // Submit search (for explicit search actions)
  const submitSearch = useCallback((search: string) => {
    if (search.trim()) {
      addRecentSearch(search.trim());
    }
    setFilters({ search });
  }, [setFilters, addRecentSearch]);

  // Update category filter
  const setCategory = useCallback((categoryId: number | undefined) => {
    setFilters({ category_id: categoryId });
  }, [setFilters]);

  // Update price range
  const setPriceRange = useCallback((min?: number, max?: number) => {
    setFilters({ min_price: min, max_price: max });
  }, [setFilters]);

  // Toggle in-stock filter
  const toggleInStockOnly = useCallback(() => {
    setFilters({ in_stock_only: !filters.in_stock_only });
  }, [setFilters, filters.in_stock_only]);

  // Remove a specific filter
  const removeFilter = useCallback((key: keyof ProductFilters) => {
    const resetValue = key === 'in_stock_only' || key === 'is_featured' 
      ? false 
      : undefined;
    setFilters({ [key]: resetValue });
  }, [setFilters]);

  // Refresh products
  const refresh = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Pagination info
  const pagination = useMemo(() => ({
    currentPage,
    pageSize,
    totalProducts,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    startItem: (currentPage - 1) * pageSize + 1,
    endItem: Math.min(currentPage * pageSize, totalProducts),
  }), [currentPage, pageSize, totalProducts, totalPages]);

  return {
    // Data
    products,
    categories,
    
    // Loading states
    isLoading,
    error,
    categoriesLoading,
    
    // Pagination
    pagination,
    setPage,
    setPageSize,
    
    // Filters
    filters,
    setSearch,
    submitSearch,
    setCategory,
    setPriceRange,
    toggleInStockOnly,
    setFilters,
    clearFilters,
    removeFilter,
    hasActiveFilters,
    activeFilterBadges,
    
    // Sort & View
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    
    // Search history
    recentSearches,
    clearRecentSearches,
    
    // Actions
    refresh,
  };
}

export type UseProductsReturn = ReturnType<typeof useProducts>;

export default useProducts;
