/**
 * WishlistButton - Heart button for adding/removing products from wishlist
 */
import React from 'react';
import { Heart } from 'lucide-react';
import clsx from 'clsx';
import { useWishlistStore } from '../../stores/featuresStore';

interface WishlistButtonProps {
  productId: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button';
  className?: string;
  showLabel?: boolean;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  productId,
  size = 'md',
  variant = 'icon',
  className,
  showLabel = false,
}) => {
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const [isLoading, setIsLoading] = React.useState(false);

  const inWishlist = isInWishlist(productId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    await toggleWishlist(productId);
    setIsLoading(false);
  };

  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const buttonSizes = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  if (variant === 'button') {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={clsx(
          'flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors',
          inWishlist
            ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100'
            : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50',
          isLoading && 'opacity-50 cursor-not-allowed',
          className
        )}
        aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart
          className={clsx(sizes[size], inWishlist && 'fill-current')}
        />
        {showLabel && (
          <span className="text-sm font-medium">
            {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={clsx(
        'rounded-full transition-all',
        buttonSizes[size],
        inWishlist
          ? 'bg-red-100 text-red-500 hover:bg-red-200'
          : 'bg-white/80 text-gray-500 hover:bg-white hover:text-red-500',
        isLoading && 'opacity-50 cursor-not-allowed',
        className
      )}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        className={clsx(sizes[size], inWishlist && 'fill-current')}
      />
    </button>
  );
};

export default WishlistButton;
