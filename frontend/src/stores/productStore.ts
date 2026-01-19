/**
 * Product Store - Zustand state management for product catalog
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  ProductSummary,
  Product,
  ProductFilters,
  ProductQueryParams,
  SortOption,
  ViewMode,
  Category,
  ProductListResponse,
} from '../types/product';
import { productService, categoryService } from '../services/productService';

// =============================================================================
// STORE STATE INTERFACE
// =============================================================================

interface ProductState {
  // Product List
  products: ProductSummary[];
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  pageSize: number;
  totalProducts: number;
  totalPages: number;
  
  // Filters & Sorting
  filters: ProductFilters;
  sortBy: SortOption;
  viewMode: ViewMode;
  
  // Categories
  categories: Category[];
  categoriesLoading: boolean;
  
  // Product Detail
  currentProduct: Product | null;
  relatedProducts: ProductSummary[];
  productLoading: boolean;
  productError: string | null;
  
  // Recent searches
  recentSearches: string[];
  
  // Actions
  fetchProducts: (params?: Partial<ProductQueryParams>) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchProductById: (id: number) => Promise<void>;
  
  setFilters: (filters: Partial<ProductFilters>) => void;
  setSortBy: (sort: SortOption) => void;
  setViewMode: (mode: ViewMode) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  
  clearFilters: () => void;
  addRecentSearch: (search: string) => void;
  clearRecentSearches: () => void;
  
  reset: () => void;
}

// =============================================================================
// DEFAULT VALUES
// =============================================================================

const defaultFilters: ProductFilters = {
  search: '',
  category_id: undefined,
  min_price: undefined,
  max_price: undefined,
  in_stock_only: false,
  is_featured: undefined,
  rating_min: undefined,
  brand: undefined,
};

const initialState = {
  // Product List
  products: [] as ProductSummary[],
  isLoading: false,
  error: null as string | null,
  
  // Pagination
  currentPage: 1,
  pageSize: 12,
  totalProducts: 0,
  totalPages: 0,
  
  // Filters & Sorting
  filters: defaultFilters,
  sortBy: 'newest' as SortOption,
  viewMode: 'grid' as ViewMode,
  
  // Categories
  categories: [] as Category[],
  categoriesLoading: false,
  
  // Product Detail
  currentProduct: null as Product | null,
  relatedProducts: [] as ProductSummary[],
  productLoading: false,
  productError: null as string | null,
  
  // Recent searches
  recentSearches: [] as string[],
};

// =============================================================================
// STORE IMPLEMENTATION
// =============================================================================

export const useProductStore = create<ProductState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // =================================================================
        // FETCH ACTIONS
        // =================================================================

        fetchProducts: async (params = {}) => {
          const state = get();
          
          set({ isLoading: true, error: null });

          try {
            const queryParams: Partial<ProductQueryParams> = {
              page: params.page ?? state.currentPage,
              page_size: params.page_size ?? state.pageSize,
              sort_by: params.sort_by ?? state.sortBy,
              ...state.filters,
              ...params,
            };

            const response: ProductListResponse = await productService.getProducts(queryParams);

            set({
              products: response.items,
              totalProducts: response.total,
              totalPages: response.total_pages,
              currentPage: response.page,
              isLoading: false,
            });
          } catch (error: any) {
            set({
              error: error.message || 'Failed to fetch products',
              isLoading: false,
            });
          }
        },

        fetchCategories: async () => {
          set({ categoriesLoading: true });

          try {
            const categories = await categoryService.getCategories();
            set({ categories, categoriesLoading: false });
          } catch (error) {
            console.error('Failed to fetch categories:', error);
            set({ categoriesLoading: false });
          }
        },

        fetchProductById: async (id: number) => {
          set({ productLoading: true, productError: null, currentProduct: null });

          try {
            const { product, related_products } = await productService.getProductDetail(id);
            
            set({
              currentProduct: product,
              relatedProducts: related_products,
              productLoading: false,
            });
          } catch (error: any) {
            set({
              productError: error.message || 'Failed to fetch product',
              productLoading: false,
            });
          }
        },

        // =================================================================
        // FILTER & SORT ACTIONS
        // =================================================================

        setFilters: (newFilters) => {
          const state = get();
          set({
            filters: { ...state.filters, ...newFilters },
            currentPage: 1, // Reset to first page on filter change
          });
        },

        setSortBy: (sortBy) => {
          set({ sortBy, currentPage: 1 });
        },

        setViewMode: (viewMode) => {
          set({ viewMode });
        },

        setPage: (page) => {
          set({ currentPage: page });
        },

        setPageSize: (pageSize) => {
          set({ pageSize, currentPage: 1 });
        },

        clearFilters: () => {
          set({
            filters: defaultFilters,
            sortBy: 'newest',
            currentPage: 1,
          });
        },

        // =================================================================
        // SEARCH HISTORY
        // =================================================================

        addRecentSearch: (search) => {
          const state = get();
          const trimmed = search.trim();
          if (!trimmed) return;

          const filtered = state.recentSearches.filter((s) => s !== trimmed);
          const updated = [trimmed, ...filtered].slice(0, 10); // Keep last 10

          set({ recentSearches: updated });
        },

        clearRecentSearches: () => {
          set({ recentSearches: [] });
        },

        // =================================================================
        // RESET
        // =================================================================

        reset: () => {
          set(initialState);
        },
      }),
      {
        name: 'product-store',
        partialize: (state) => ({
          viewMode: state.viewMode,
          pageSize: state.pageSize,
          recentSearches: state.recentSearches,
        }),
      }
    ),
    { name: 'ProductStore' }
  )
);

// =============================================================================
// SELECTORS
// =============================================================================

export const selectProducts = (state: ProductState) => state.products;
export const selectIsLoading = (state: ProductState) => state.isLoading;
export const selectError = (state: ProductState) => state.error;
export const selectFilters = (state: ProductState) => state.filters;
export const selectSortBy = (state: ProductState) => state.sortBy;
export const selectViewMode = (state: ProductState) => state.viewMode;
export const selectPagination = (state: ProductState) => ({
  currentPage: state.currentPage,
  pageSize: state.pageSize,
  totalProducts: state.totalProducts,
  totalPages: state.totalPages,
});
export const selectCategories = (state: ProductState) => state.categories;
export const selectCurrentProduct = (state: ProductState) => state.currentProduct;

// Check if any filters are active
export const selectHasActiveFilters = (state: ProductState) => {
  const { filters } = state;
  return !!(
    filters.search ||
    filters.category_id ||
    filters.min_price ||
    filters.max_price ||
    filters.in_stock_only ||
    filters.is_featured ||
    filters.rating_min ||
    filters.brand
  );
};

// Get active filter badges
export const selectActiveFilterBadges = (state: ProductState) => {
  const badges: Array<{ key: string; label: string; value: string }> = [];
  const { filters, categories } = state;

  if (filters.search) {
    badges.push({ key: 'search', label: 'Search', value: filters.search });
  }
  if (filters.category_id) {
    const category = categories.find((c) => c.id === filters.category_id);
    badges.push({ key: 'category', label: 'Category', value: category?.name || 'Category' });
  }
  if (filters.min_price || filters.max_price) {
    const priceLabel = filters.min_price && filters.max_price
      ? `TZS ${filters.min_price} - ${filters.max_price}`
      : filters.min_price
      ? `From TZS ${filters.min_price}`
      : `Up to TZS ${filters.max_price}`;
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
};

export default useProductStore;
