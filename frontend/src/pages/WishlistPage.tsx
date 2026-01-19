/**
 * WishlistPage - Display user's wishlist with ability to manage items
 */
import React, { useEffect } from 'react';
import { Heart, ShoppingCart, Trash2, ArrowLeft, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { useWishlistStore } from '../stores/featuresStore';
import { useCart } from '../app/store/cart';
import { useStore } from '../app/store';
import { getImageUrl } from '../app/api';

const WishlistPage: React.FC = () => {
  const { items, isLoading, fetchWishlist, removeFromWishlist } = useWishlistStore();
  const addToCart = useCart((s) => s.add);
  const { token } = useStore();

  useEffect(() => {
    // Only fetch wishlist if user is logged in
    if (token) {
      fetchWishlist();
    }
  }, [fetchWishlist, token]);

  // Redirect to login if not authenticated
  if (!token) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Heart className="mx-auto h-16 w-16 text-gray-300" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Please log in</h2>
        <p className="mt-2 text-gray-500">You need to be logged in to view your wishlist.</p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Log In
        </Link>
      </div>
    );
  }

  const handleMoveToCart = async (productId: number, product: NonNullable<typeof items[0]['product']>) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.primary_image || '',
      description: '',
      stock: product.stock,
    } as any);
    await removeFromWishlist(productId);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 rounded-xl bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Heart className="h-6 w-6 text-red-500" fill="currentColor" />
            My Wishlist
          </h1>
        </div>
        <span className="text-gray-500">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="mt-16 text-center">
          <Heart className="mx-auto h-16 w-16 text-gray-300" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Your wishlist is empty
          </h2>
          <p className="mt-2 text-gray-500">
            Save items you love by clicking the heart icon on products.
          </p>
          <Link
            to="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            <Package className="h-5 w-5" />
            Browse Products
          </Link>
        </div>
      )}

      {/* Wishlist Grid */}
      {items.length > 0 && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.filter(item => item.product).map((item) => {
            const product = item.product!;
            return (
            <div
              key={item.id}
              className="group overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-lg"
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                {product.primary_image ? (
                  <img
                    src={getImageUrl(product.primary_image)}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-16 w-16 text-gray-300" />
                  </div>
                )}
                
                {/* Remove Button */}
                <button
                  onClick={() => removeFromWishlist(item.product_id)}
                  className="absolute right-2 top-2 rounded-full bg-white p-2 text-gray-600 shadow-md transition-colors hover:bg-red-50 hover:text-red-500"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {/* Stock Badge */}
                {product.stock <= 0 && (
                  <div className="absolute left-2 top-2 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                    Out of Stock
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <Link
                  to={`/products/${item.product_id}`}
                  className="block font-medium text-gray-900 hover:text-blue-600"
                >
                  {product.name}
                </Link>
                
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-gray-900">
                      TZS {product.price.toLocaleString()}
                    </span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="ml-2 text-sm text-gray-400 line-through">
                        TZS {product.original_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price Drop Alert */}
                {item.notify_on_price_drop && (
                  <p className="mt-2 text-xs text-green-600">
                    ✓ Price drop alerts enabled
                  </p>
                )}

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleMoveToCart(item.product_id, product)}
                  disabled={product.stock <= 0}
                  className={clsx(
                    'mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors',
                    product.stock <= 0
                      ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  )}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {product.stock <= 0
                    ? 'Out of Stock'
                    : 'Add to Cart'}
                </button>
              </div>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
