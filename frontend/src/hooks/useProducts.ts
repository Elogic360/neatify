/**
 * useProducts - Custom hook for product catalog operations with React Query caching
 */
import { useQuery } from '@tanstack/react-query';
import { useEffect, useCallback, useMemo } from 'react';
import { useProductStore } from '../stores/productStore';
import { useDebounce } from './useDebounce';
import { productService } from '../services/productService';
import type { ProductFilters } from '../types/product';

// Query keys for consistent caching
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: Record<string, any>) => [...productKeys.lists(), params] as const,
};

export function useProducts() {
  const {
    filters,
    sortBy,
    currentPage,
    pageSize,
    viewMode,
    categories,
    categoriesLoading,
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
  const hasActiveFilters = useMemo(() => {
    const { search, category_id, min_price, max_price, in_stock_only, is_featured, rating_min, brand } = filters;
    return !!(search || category_id || min_price || max_price || in_stock_only || is_featured || rating_min || brand);
  }, [filters]);

  const activeFilterBadges = useMemo(() => {
    const badges: Array<{ key: string; label: string; value: string }> = [];

    if (filters.search) {
      badges.push({ key: 'search', label: 'Search', value: filters.search });
    }
    if (filters.category_id) {
      const category = categories.find(c => c.id === filters.category_id);
      badges.push({ key: 'category', label: 'Category', value: category?.name || 'Unknown' });
    }
    if (filters.min_price || filters.max_price) {
      const priceLabel = filters.min_price && filters.max_price
        ? `$${filters.min_price} - $${filters.max_price}`
        : filters.min_price
          ? `From $${filters.min_price}`
          : `Up to $${filters.max_price}`;
      badges.push({ key: 'price', label: 'Price', value: priceLabel });
    }
    if (filters.in_stock_only) {
      badges.push({ key: 'stock', label: 'Stock', value: 'In Stock Only' });
    }
    if (filters.is_featured) {
      badges.push({ key: 'featured', label: 'Featured', value: 'Yes' });
    }
    if (filters.rating_min) {
      badges.push({ key: 'rating', label: 'Rating', value: `${filters.rating_min}+ Stars` });
    }
    if (filters.brand) {
      badges.push({ key: 'brand', label: 'Brand', value: filters.brand });
    }

    return badges;
  }, [filters, categories]);

  // Build query parameters
  const queryParams = useMemo(() => ({
    search: debouncedSearch,
    page: currentPage,
    page_size: pageSize,
    sort_by: sortBy,
    category_id: filters.category_id,
    brand: filters.brand,
    min_price: filters.min_price,
    max_price: filters.max_price,
    is_featured: filters.is_featured,
    in_stock: filters.in_stock_only,
    min_rating: filters.rating_min,
  }), [debouncedSearch, currentPage, pageSize, sortBy, filters]);

  // Use React Query for data fetching with caching
  const {
    data: productsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: productKeys.list(queryParams),
    queryFn: () => productService.getProducts(queryParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error instanceof Error && 'status' in error && typeof error.status === 'number') {
        return error.status >= 500 && failureCount < 3;
      }
      return failureCount < 3;
    },
  });

  // Extract data from React Query response
  const products = productsData?.items || [];
  const totalProducts = productsData?.meta?.total || 0;
  const totalPages = productsData?.meta?.totalPages || 1;

  // Fetch categories on mount (keeping Zustand for categories)
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
    refetch();
  }, [refetch]);

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
