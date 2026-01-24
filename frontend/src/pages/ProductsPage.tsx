import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, X, ShoppingCart } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  SearchBar,
  ProductFilters,
  ProductGrid,
  Pagination,
  SortSelect,
} from '@/components/products';
import { useProducts } from '@/hooks/useProducts';
import { useWishlistStore } from '../stores/featuresStore';
import { useCart } from '@/app/store/cart';
import { useStore } from '@/app/store';
import type { ProductSummary } from '../types/product';
import type { Product } from '@/app/types';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();

  // Cart integration
  const { lines: cartLines, add: addToCart } = useCart();
  const cartItemCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);

  // Handle adding product to cart
  const handleAddToCart = (product: ProductSummary) => {
    if (product.stock === 0) return;

    // Convert ProductSummary to Product type for cart
    const cartProduct: Product = {
      id: product.id,
      name: product.name,
      description: '',
      price: String(product.price),
      stock_quantity: product.stock,
      is_active: product.is_active,
      image_url: product.primary_image || product.thumbnail,
    };
    addToCart(cartProduct, 1);
  };

  // V1.5: Wishlist integration
  const { token } = useStore();
  const { items: wishlistItems, addToWishlist, removeFromWishlist, fetchWishlist } = useWishlistStore();
  const wishlistIds = wishlistItems.map(item => item.product_id);

  useEffect(() => {
    // Only fetch wishlist if user is logged in
    if (token) {
      fetchWishlist();
    }
  }, [fetchWishlist, token]);

  const handleWishlistToggle = async (product: ProductSummary) => {
    if (wishlistIds.includes(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
    }
  };

  const {
    products,
    categories,
    isLoading,
    error,
    filters,
    pagination,
    viewMode,
    sortBy,
    hasActiveFilters,
    activeFilterBadges,
    setSearch,
    submitSearch,
    setCategory,
    setPriceRange,
    setFilters,
    clearFilters,
    removeFilter,
    setPage,
    setSortBy,
    setViewMode,
    refresh,
    recentSearches,
    clearRecentSearches,
  } = useProducts();

  // Sync search value with filters
  useEffect(() => {
    setSearchValue(filters.search);
  }, [filters.search]);

  // Sync URL params with filters on initial load
  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort');
    const page = searchParams.get('page');

    if (category) setCategory(Number(category));
    if (search) {
      setSearch(search);
      setSearchValue(search);
    }
    if (minPrice || maxPrice) {
      setPriceRange(
        minPrice ? Number(minPrice) : undefined,
        maxPrice ? Number(maxPrice) : undefined
      );
    }
    if (sort) setSortBy(sort as any);
    if (page) setPage(Number(page));
  }, []); // Only run on mount

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.search) params.set('search', filters.search);
    if (filters.category_id) params.set('category', String(filters.category_id));
    if (filters.min_price) params.set('minPrice', String(filters.min_price));
    if (filters.max_price) params.set('maxPrice', String(filters.max_price));
    if (sortBy !== 'newest') params.set('sort', sortBy);
    if (pagination.currentPage > 1) params.set('page', String(pagination.currentPage));

    setSearchParams(params, { replace: true });
  }, [filters, sortBy, pagination.currentPage, setSearchParams]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setSearch(value);
  };

  const handleSearchSubmit = (value: string) => {
    submitSearch(value);
    setPage(1);
  };

  const handlePageChange = (page: number) => {
    setPage(page);
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort as any);
    setPage(1);
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Products</h1>
          <p className="text-slate-400">
            Browse our collection of high-quality products
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            value={searchValue}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
            recentSearches={recentSearches}
            onClearRecent={clearRecentSearches}
            placeholder="Search products..."
          />
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <Button
            variant="secondary"
            onClick={() => setShowMobileFilters(true)}
            className="w-full"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge variant="success" className="ml-2">
                {activeFilterBadges.length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Active Filters (shown separately on mobile) */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6 lg:hidden">
            <span className="text-sm text-slate-400">Active filters:</span>
            {activeFilterBadges.map((badge) => (
              <Badge
                key={badge.key}
                variant="default"
                className="flex items-center gap-1"
              >
                {badge.label}
                <button
                  onClick={() => removeFilter(badge.key as keyof typeof filters)}
                  className="ml-1 hover:text-white"
                  aria-label={`Remove ${badge.key} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <button
              onClick={clearFilters}
              className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-4">
              <ProductFilters
                filters={filters}
                categories={categories}
                onFilterChange={setFilters}
                onClearFilters={clearFilters}
                onRemoveFilter={removeFilter}
                hasActiveFilters={hasActiveFilters}
                activeFilterBadges={activeFilterBadges}
                isLoading={isLoading}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Sort & View Controls */}
            <div className="mb-6">
              <SortSelect
                sortBy={sortBy}
                viewMode={viewMode}
                totalProducts={pagination.totalProducts}
                onSortChange={handleSortChange}
                onViewModeChange={handleViewModeChange}
              />
            </div>

            {/* Error State */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                <p className="font-medium">Error loading products</p>
                <p className="text-sm mt-1">
                  {error instanceof Error ? error.message : (typeof error === 'string' ? error : 'A network error occurred')}
                </p>
                <Button
                  variant="secondary"
                  onClick={refresh}
                  className="mt-3"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Product Grid */}
            <ProductGrid
              products={products}
              viewMode={viewMode}
              isLoading={isLoading}
              onAddToCart={handleAddToCart}
              onWishlist={handleWishlistToggle}
              wishlistIds={wishlistIds}
            />

            {/* Pagination */}
            {pagination.totalPages > 1 && !isLoading && (
              <div className="mt-8">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </main>
        </div>

        {/* Floating Cart Button */}
        <button
          onClick={() => navigate('/cart')}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="font-semibold">Cart</span>
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-orange-600 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-md">
              {cartItemCount > 99 ? '99+' : cartItemCount}
            </span>
          )}
        </button>

        {/* Mobile Filter Drawer */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowMobileFilters(false)}
            />

            {/* Drawer */}
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl overflow-hidden">
              <ProductFilters
                filters={filters}
                categories={categories}
                onFilterChange={setFilters}
                onClearFilters={clearFilters}
                onRemoveFilter={removeFilter}
                hasActiveFilters={hasActiveFilters}
                activeFilterBadges={activeFilterBadges}
                isLoading={isLoading}
                isMobile
                onClose={() => setShowMobileFilters(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}