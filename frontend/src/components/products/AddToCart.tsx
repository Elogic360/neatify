import { useState } from 'react';
import { ShoppingCart, Heart, Share2, Check, Minus, Plus, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { Product, ProductVariation } from '@/types/product';

interface AddToCartProps {
  product: Product & { reviewCount?: number; averageRating?: number };
  onAddToCart: (quantity: number, variationId?: number) => Promise<void>;
  onToggleWishlist?: () => void;
  isInWishlist?: boolean;
  maxQuantity?: number;
}

export function AddToCart({
  product,
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false,
  maxQuantity = 99,
}: AddToCartProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(
    product.variations?.[0] || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOutOfStock = product.stock === 0 || selectedVariation?.stock === 0;
  const availableStock = selectedVariation?.stock ?? product.stock ?? maxQuantity;
  const effectiveMaxQuantity = Math.min(maxQuantity, availableStock);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const newValue = prev + delta;
      return Math.max(1, Math.min(effectiveMaxQuantity, newValue));
    });
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setQuantity(Math.max(1, Math.min(effectiveMaxQuantity, value)));
    }
    setError(null);
  };

  const handleAddToCart = async () => {
    if (isOutOfStock) return;

    setIsLoading(true);
    setError(null);

    try {
      await onAddToCart(quantity, selectedVariation?.id);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVariationChange = (variation: ProductVariation) => {
    setSelectedVariation(variation);
    if (quantity > (variation.stock || effectiveMaxQuantity)) {
      setQuantity(variation.stock || 1);
    }
    setError(null);
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: product.description || '',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        // Could add toast notification here
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const currentPrice = product.price;
  const originalPrice = product.original_price;
  const hasDiscount = originalPrice && originalPrice > currentPrice;

  return (
    <div className="space-y-6">
      {/* Variations */}
      {product.variations && product.variations.length > 0 && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-300">
            Options
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variations.map((variation: ProductVariation) => (
              <button
                key={variation.id}
                onClick={() => handleVariationChange(variation)}
                disabled={variation.stock === 0}
                className={`
                  px-4 py-2 rounded-lg border text-sm font-medium transition-all
                  ${
                    selectedVariation?.id === variation.id
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : variation.stock === 0
                      ? 'border-slate-700 bg-slate-800/50 text-slate-500 cursor-not-allowed'
                      : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'
                  }
                `}
              >
                {variation.name}
                {variation.stock === 0 && (
                  <span className="ml-2 text-xs text-slate-500">(Out of stock)</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-white">
          ${currentPrice.toFixed(2)}
        </span>
        {hasDiscount && (
          <>
            <span className="text-lg text-slate-500 line-through">
              ${originalPrice.toFixed(2)}
            </span>
            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-sm font-medium rounded">
              {Math.round((1 - currentPrice / originalPrice) * 100)}% OFF
            </span>
          </>
        )}
      </div>

      {/* Stock status */}
      <div className="flex items-center gap-2">
        {isOutOfStock ? (
          <span className="text-red-400 font-medium">Out of Stock</span>
        ) : availableStock <= 10 ? (
          <span className="text-amber-400 font-medium">
            Only {availableStock} left in stock
          </span>
        ) : (
          <span className="text-emerald-400 font-medium flex items-center gap-1.5">
            <Check className="h-4 w-4" />
            In Stock
          </span>
        )}
      </div>

      {/* Quantity selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          Quantity
        </label>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1 || isOutOfStock}
              className="p-3 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="number"
              value={quantity}
              onChange={handleInputChange}
              disabled={isOutOfStock}
              min={1}
              max={effectiveMaxQuantity}
              className="w-16 text-center bg-transparent text-white font-medium border-0 focus:ring-0 focus:outline-none"
              aria-label="Quantity"
            />
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= effectiveMaxQuantity || isOutOfStock}
              className="p-3 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <span className="text-sm text-slate-500">
            {effectiveMaxQuantity} available
          </span>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isLoading}
          className="flex-1 py-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Adding...
            </>
          ) : isAdded ? (
            <>
              <Check className="h-5 w-5 mr-2" />
              Added to Cart!
            </>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart
            </>
          )}
        </Button>

        <div className="flex gap-2">
          {onToggleWishlist && (
            <Button
              variant="secondary"
              onClick={onToggleWishlist}
              className={`py-3 ${isInWishlist ? 'text-red-400 border-red-500/50' : ''}`}
              aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart
                className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`}
              />
            </Button>
          )}

          <Button
            variant="secondary"
            className="py-3"
            onClick={handleShare}
            aria-label="Share product"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Additional info */}
      <div className="pt-4 border-t border-slate-800 space-y-2 text-sm text-slate-400">
        <p className="flex items-center gap-2">
          <span className="text-emerald-400">✓</span>
          Free shipping on orders over $50
        </p>
        <p className="flex items-center gap-2">
          <span className="text-emerald-400">✓</span>
          30-day return policy
        </p>
        <p className="flex items-center gap-2">
          <span className="text-emerald-400">✓</span>
          Secure checkout
        </p>
      </div>
    </div>
  );
}

export default AddToCart;
