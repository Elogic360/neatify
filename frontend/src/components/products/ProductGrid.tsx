/**
 * ProductGrid - Grid/List layout for product cards
 */
import React, { memo } from 'react';
import clsx from 'clsx';
import type { ProductSummary, ViewMode } from '../../types/product';
import ProductCard from './ProductCard';
import { ProductGridSkeleton } from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';

interface ProductGridProps {
  products: ProductSummary[];
  viewMode: ViewMode;
  isLoading?: boolean;
  error?: string | null;
  onAddToCart?: (product: ProductSummary) => void;
  onQuickView?: (product: ProductSummary) => void;
  onWishlist?: (product: ProductSummary) => void;
  wishlistIds?: number[];
  onClearFilters?: () => void;
  onRetry?: () => void;
  className?: string;
}

const ProductGrid: React.FC<ProductGridProps> = memo(({
  products,
  viewMode,
  isLoading = false,
  error = null,
  onAddToCart,
  onQuickView,
  onWishlist,
  wishlistIds = [],
  onClearFilters,
  onRetry,
  className,
}) => {
  // Loading state
  if (isLoading && products.length === 0) {
    return (
      <ProductGridSkeleton
        count={viewMode === 'grid' ? 6 : 4}
        columns={viewMode === 'grid' ? 3 : 2}
      />
    );
  }

  // Error state
  if (error) {
    return (
      <EmptyState
        type="error"
        title="Failed to load products"
        description={error}
        action={onRetry ? { label: 'Try Again', onClick: onRetry } : undefined}
        className={className}
      />
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <EmptyState
        type="products"
        action={onClearFilters ? { label: 'Clear Filters', onClick: onClearFilters } : undefined}
        className={className}
      />
    );
  }

  // Grid view layout
  if (viewMode === 'grid') {
    return (
      <div
        className={clsx(
          'grid gap-4',
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
          className
        )}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            viewMode="grid"
            onAddToCart={onAddToCart}
            onQuickView={onQuickView}
            onWishlist={onWishlist}
            isInWishlist={wishlistIds.includes(product.id)}
          />
        ))}
        
        {/* Loading more skeleton */}
        {isLoading && (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`loading-${i}`}
                className="animate-pulse rounded-xl bg-gray-100"
                style={{ aspectRatio: '4/5' }}
              />
            ))}
          </>
        )}
      </div>
    );
  }

  // List view layout
  return (
    <div className={clsx('flex flex-col gap-4', className)}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          viewMode="list"
          onAddToCart={onAddToCart}
          onQuickView={onQuickView}
          onWishlist={onWishlist}
          isInWishlist={wishlistIds.includes(product.id)}
        />
      ))}
      
      {/* Loading more skeleton */}
      {isLoading && (
        <>
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={`loading-${i}`}
              className="h-40 animate-pulse rounded-xl bg-gray-100"
            />
          ))}
        </>
      )}
    </div>
  );
});

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid;
