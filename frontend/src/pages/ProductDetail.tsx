import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, X, ShoppingCart, Heart, Share2, Check, Truck, Shield, Package, Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import Badge from '@/components/ui/Badge';
import Rating from '@/components/ui/Rating';
import {
  ProductReviews,
  ProductCard,
} from '@/components/products';
import { useProductDetail } from '@/hooks/useProductDetail';
import { useCart } from '@/app/store/cart';
import { useStore } from '@/app/store';
import { cartAPI, getImageUrl } from '@/app/api';
import { useToast } from '@/components/admin/Toast';
import type { Product as CartProduct } from '@/app/types';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { add: addToLocalCart } = useCart();
  const { token, setCart } = useStore();
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'details'>('description');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const {
    product,
    reviews,
    relatedProducts,
    isLoading,
    reviewsLoading,
    error,
    submitReview,
    effectivePrice,
  } = useProductDetail(id);
  const { showToast } = useToast();
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate(-1);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [navigate]);
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  const handleAddToCart = async () => {
    if (!product) return;
    
    // Prevent adding out-of-stock products
    if (product.stock === 0) {
      showToast('This product is out of stock', 'warning');
      return;
    }
    
    // Prevent adding more than available stock
    if (quantity > product.stock) {
      showToast(`Only ${product.stock} items available in stock`, 'warning');
      return;
    }
    
    setIsAddingToCart(true);
    // If user is logged in, use API cart
    if (token) {
      try {
        await cartAPI.add({ product_id: product.id, quantity });
        // Reload cart and update store
        const cartResponse = await cartAPI.get();
        const cartData = cartResponse.data;
        if (cartData && cartData.items) {
          setCart(cartData.items.map((item: any) => ({
            id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            product: item.product
          })));
        }
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
      } catch (error: any) {
        // If 401, clear token and retry as guest
        if (error?.response?.status === 401) {
          setCart([]); // clear API cart
          useStore.getState().setToken(null); // clear token (log out)
          // Retry as guest/local cart
          const cartProduct: CartProduct = {
            id: product.id,
            name: product.name,
            description: product.description,
            price: String(effectivePrice),
            stock_quantity: product.stock,
            is_active: product.is_active,
            image_url: product.primary_image || product.images?.[0]?.url,
          };
          addToLocalCart(cartProduct, quantity);
          setAddedToCart(true);
          setTimeout(() => setAddedToCart(false), 2000);
          showToast('Session expired. Added to local cart.', 'warning');
        } else {
          console.error('Error adding to cart:', error);
          showToast('Failed to add product to cart', 'error');
        }
      }
    } else {
      // Use local cart for anonymous users
      const cartProduct: CartProduct = {
        id: product.id,
        name: product.name,
        description: product.description,
        price: String(effectivePrice),
        stock_quantity: product.stock,
        is_active: product.is_active,
        image_url: product.primary_image || product.images?.[0]?.url,
      };
      addToLocalCart(cartProduct, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
    setIsAddingToCart(false);
  };
  const handleSubmitReview = async (reviewData: { rating: number; title: string; content: string }) => {
    await submitReview({
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.content,
    });
  };
  const handleClose = () => {
    navigate(-1);
  };
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };
  // Calculate discount
  const hasDiscount = product?.original_price && product.original_price > product.price;
  const discountPercentage = hasDiscount
    ? Math.round((1 - product!.price / product!.original_price!) * 100)
    : 0;
  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-slate-900 rounded-2xl p-8 max-w-5xl w-full mx-4 max-h-[90vh] overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4 rounded" />
              <Skeleton className="h-6 w-1/2 rounded" />
              <Skeleton className="h-10 w-32 rounded" />
              <Skeleton className="h-24 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  // Error state
  if (error || !product) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={handleBackdropClick}>
        <div className="bg-slate-900 rounded-2xl p-8 max-w-md mx-4 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-white mb-2">Product Not Found</h1>
          <p className="text-slate-400 mb-6">
            {error || "We couldn't find the product you're looking for."}
          </p>
          <Button onClick={handleClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }
  // Get primary image
  const primaryImage = product.primary_image || product.images?.[0]?.url || '/placeholder-product.png';
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-auto"
      onClick={handleBackdropClick}
    >
      <div className="bg-slate-900 rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl border border-slate-700 relative animate-in fade-in zoom-in-95 duration-300">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>
        <div className="overflow-auto max-h-[95vh]">
          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left: Image Gallery */}
            <div className="bg-slate-800/50 p-6 lg:p-8">
              <div className="sticky top-0">
                {/* Main Image */}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-800 mb-4">
                  <img
                    src={getImageUrl(primaryImage)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Badges on image */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.is_featured && (
                      <Badge variant="warning" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {hasDiscount && (
                      <Badge variant="danger" className="text-xs font-bold">
                        {discountPercentage}% OFF
                      </Badge>
                    )}
                  </div>
                </div>
                {/* Thumbnail images */}
                {product.images && product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {product.images.map((img, idx) => (
                      <div
                        key={img.id || idx}
                        className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 border-slate-600 hover:border-emerald-500 cursor-pointer transition-colors"
                      >
                        <img
                          src={getImageUrl(img.url)}
                          alt={`${product.name} ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Right: Product Info */}
            <div className="p-6 lg:p-8 space-y-6">
              {/* Category breadcrumb */}
              {product.category && (
                <nav className="text-sm">
                  <span className="text-emerald-400 font-medium">{product.category.name}</span>
                </nav>
              )}
              {/* Product Name */}
              <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
                {product.name}
              </h1>
              {/* Rating */}
              {product.rating_average !== undefined && (
                <div className="flex items-center gap-3">
                  <Rating value={product.rating_average} size="md" showValue />
                  <span className="text-slate-400 text-sm">
                    ({product.rating_count || reviews.total} reviews)
                  </span>
                </div>
              )}
              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl lg:text-4xl font-bold text-emerald-400">
                  ${effectivePrice.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-slate-500 line-through">
                    ${product.original_price!.toFixed(2)}
                  </span>
                )}
              </div>
              {/* Stock status */}
              <div className="flex items-center gap-2">
                {product.stock === 0 ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-red-400 text-sm font-semibold">Out of Stock</span>
                  </>
                ) : product.stock <= 5 ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-amber-400 text-sm font-semibold">
                      Low Stock - Only {product.stock} left!
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-emerald-400 text-sm font-medium">
                      In Stock ({product.stock} available)
                    </span>
                  </>
                )}
              </div>
              {/* Short description */}
              {product.description && (
                <p className="text-slate-300 leading-relaxed">
                  {product.description.length > 200
                    ? product.description.substring(0, 200) + '...'
                    : product.description}
                </p>
              )}
              {/* Quantity & Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-700">
                {/* Quantity selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">Qty:</span>
                  <div className={`flex items-center border rounded-lg ${product.stock === 0 ? 'border-slate-700 opacity-50' : 'border-slate-600'}`}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-l-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={quantity <= 1 || product.stock === 0}
                    >
                      −
                    </button>
                    <span className="px-4 py-2 text-white font-medium min-w-[3rem] text-center">
                      {product.stock === 0 ? 0 : quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                      className="px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-r-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={quantity >= (product.stock || 0) || product.stock === 0}
                    >
                      +
                    </button>
                  </div>
                </div>
                {/* Add to cart button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || product.stock === 0}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all ${
                    addedToCart
                      ? 'bg-emerald-600'
                      : product.stock === 0
                      ? 'bg-slate-700 cursor-not-allowed opacity-60'
                      : 'bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98]'
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <Check className="h-5 w-5" />
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </>
                  )}
                </button>
              </div>
              {/* Quick actions */}
              <div className="flex gap-4 pt-2">
                <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
                  <Heart className="h-4 w-4" />
                  Add to Wishlist
                </button>
                <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
              {/* Shipping & Guarantees */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-700">
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 rounded-lg bg-slate-800">
                    <Truck className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Free Delivery</p>
                    <p className="text-slate-400 text-xs">On orders over $50</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 rounded-lg bg-slate-800">
                    <Shield className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Secure Payment</p>
                    <p className="text-slate-400 text-xs">100% protected</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 rounded-lg bg-slate-800">
                    <Package className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Easy Returns</p>
                    <p className="text-slate-400 text-xs">30-day policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Tabs Section */}
          <div className="border-t border-slate-700 p-6 lg:p-8">
            <div className="flex gap-6 border-b border-slate-700 mb-6">
              {(['description', 'details', 'reviews'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 font-semibold capitalize transition-colors border-b-2 -mb-px ${
                    activeTab === tab
                      ? 'text-emerald-400 border-emerald-400'
                      : 'text-slate-400 border-transparent hover:text-white'
                  }`}
                >
                  {tab}
                  {tab === 'reviews' && reviews.total > 0 && (
                    <span className="ml-2 text-sm">({reviews.total})</span>
                  )}
                </button>
              ))}
            </div>
            {activeTab === 'description' && (
              <div className="prose prose-invert prose-slate max-w-none">
                <p className="text-slate-300 leading-relaxed">
                  {product.description || 'No description available.'}
                </p>
              </div>
            )}
            {activeTab === 'details' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.sku && (
                  <div className="flex justify-between py-3 border-b border-slate-700">
                    <span className="text-slate-400">SKU</span>
                    <span className="text-white font-medium">{product.sku}</span>
                  </div>
                )}
                {product.brand && (
                  <div className="flex justify-between py-3 border-b border-slate-700">
                    <span className="text-slate-400">Brand</span>
                    <span className="text-white font-medium">{product.brand}</span>
                  </div>
                )}
                {product.category && (
                  <div className="flex justify-between py-3 border-b border-slate-700">
                    <span className="text-slate-400">Category</span>
                    <span className="text-white font-medium">{product.category.name}</span>
                  </div>
                )}
                {product.weight && (
                  <div className="flex justify-between py-3 border-b border-slate-700">
                    <span className="text-slate-400">Weight</span>
                    <span className="text-white font-medium">{product.weight}g</span>
                  </div>
                )}
                <div className="flex justify-between py-3 border-b border-slate-700">
                  <span className="text-slate-400">Stock</span>
                  <span className={`font-medium ${
                    product.stock === 0 ? 'text-red-400' : 
                    product.stock <= 5 ? 'text-amber-400' : 
                    'text-emerald-400'
                  }`}>
                    {product.stock === 0 ? 'Out of Stock' : 
                     product.stock <= 5 ? `Low Stock (${product.stock} left)` : 
                     `${product.stock} units available`}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-700">
                  <span className="text-slate-400">Status</span>
                  <span className={`font-medium ${product.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            )}
            {activeTab === 'reviews' && (
              <ProductReviews
                reviews={reviews.items}
                averageRating={reviews.average_rating}
                reviewCount={reviews.total}
                isLoading={reviewsLoading}
                onSubmitReview={handleSubmitReview}
                canReview={true}
              />
            )}
          </div>
          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="border-t border-slate-700 p-6 lg:p-8">
              <h2 className="text-xl font-bold text-white mb-6">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.slice(0, 4).map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                    viewMode="grid"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}