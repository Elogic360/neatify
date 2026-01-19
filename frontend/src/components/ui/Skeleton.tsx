/**
 * Skeleton - Loading placeholder components
 */
import React from 'react';
import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  animate?: boolean;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, animate = true, style }) => {
  return (
    <div
      className={clsx(
        'rounded bg-gray-200',
        animate && 'animate-pulse',
        className
      )}
      style={style}
    />
  );
};

// Text line skeleton
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 1,
  className,
}) => {
  return (
    <div className={clsx('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={clsx(
            'h-4',
            i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
};

// Avatar/circle skeleton
export const SkeletonCircle: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className,
}) => {
  return (
    <Skeleton
      className={clsx('rounded-full', className)}
      style={{ width: size, height: size }}
    />
  );
};

// Image skeleton
export const SkeletonImage: React.FC<{ aspectRatio?: string; className?: string }> = ({
  aspectRatio = '4/3',
  className,
}) => {
  return (
    <div className={clsx('relative w-full overflow-hidden rounded-lg', className)}>
      <div style={{ paddingBottom: `${(1 / eval(aspectRatio)) * 100}%` }} />
      <Skeleton className="absolute inset-0 h-full w-full" />
    </div>
  );
};

// Product card skeleton
export const ProductCardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={clsx(
        'overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100',
        className
      )}
    >
      {/* Image */}
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton className="h-5 w-3/4" />
        
        {/* Category */}
        <Skeleton className="h-3 w-1/3" />
        
        {/* Description */}
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        
        {/* Price and button */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

// Product list item skeleton
export const ProductListItemSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={clsx(
        'flex gap-4 overflow-hidden rounded-xl bg-white p-4 shadow-sm border border-gray-100',
        className
      )}
    >
      {/* Image */}
      <Skeleton className="h-32 w-32 flex-shrink-0 rounded-lg" />
      
      {/* Content */}
      <div className="flex flex-1 flex-col justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/4" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

// Product grid skeleton
export const ProductGridSkeleton: React.FC<{
  count?: number;
  columns?: 2 | 3 | 4;
}> = ({ count = 6, columns = 3 }) => {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className={clsx('grid gap-4', gridCols[columns])}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

// Product detail skeleton
export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Images */}
      <div className="space-y-4">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-20 rounded-lg" />
          ))}
        </div>
      </div>
      
      {/* Info */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-5 w-24" />
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        
        <div className="flex gap-4 pt-4">
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 flex-1 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
