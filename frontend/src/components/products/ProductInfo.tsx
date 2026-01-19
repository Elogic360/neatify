import { Truck, Shield, Package, Star, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '@/components/ui/Badge';
import Rating from '@/components/ui/Rating';
import type { Product, Category } from '@/types/product';

interface ProductInfoProps {
  product: Product;
  showBackLink?: boolean;
}

export function ProductInfo({ product, showBackLink = true }: ProductInfoProps) {
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPercentage = hasDiscount
    ? Math.round((1 - product.price / product.original_price!) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Back link */}
      {showBackLink && (
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>
      )}

      {/* Breadcrumb */}
      {product.category && (
        <nav className="text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-slate-400">
            <li>
              <Link to="/products" className="hover:text-white transition-colors">
                Products
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                to={`/products?category=${product.category.id}`}
                className="hover:text-white transition-colors"
              >
                {product.category.name}
              </Link>
            </li>
            <li>/</li>
            <li className="text-slate-300 font-medium truncate max-w-[200px]">
              {product.name}
            </li>
          </ol>
        </nav>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {product.is_featured && (
          <Badge variant="warning" className="text-xs">
            <Star className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        )}
        {hasDiscount && (
          <Badge variant="danger" className="text-xs">
            {discountPercentage}% OFF
          </Badge>
        )}
        {product.stock === 0 && (
          <Badge variant="default" className="text-xs">
            Out of Stock
          </Badge>
        )}
      </div>

      {/* Title */}
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
        {product.name}
      </h1>

      {/* Rating & Reviews */}
      {product.rating_average !== undefined && (
        <div className="flex items-center gap-3">
          <Rating value={product.rating_average} size="md" showValue />
          {product.rating_count !== undefined && (
            <Link
              to="#reviews"
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              ({product.rating_count} {product.rating_count === 1 ? 'review' : 'reviews'})
            </Link>
          )}
        </div>
      )}

      {/* SKU */}
      {product.sku && (
        <p className="text-sm text-slate-500">
          SKU: <span className="text-slate-400">{product.sku}</span>
        </p>
      )}

      {/* Description */}
      <div className="prose prose-invert prose-slate max-w-none">
        <p className="text-slate-300 leading-relaxed">{product.description}</p>
      </div>

      {/* Features list */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-t border-b border-slate-800">
        <div className="flex items-center gap-3 text-slate-300">
          <div className="p-2 bg-slate-800 rounded-lg">
            <Truck className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="font-medium text-sm">Free Shipping</p>
            <p className="text-xs text-slate-500">Orders over $50</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-slate-300">
          <div className="p-2 bg-slate-800 rounded-lg">
            <Shield className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="font-medium text-sm">Secure Checkout</p>
            <p className="text-xs text-slate-500">SSL encrypted</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-slate-300">
          <div className="p-2 bg-slate-800 rounded-lg">
            <Package className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="font-medium text-sm">Easy Returns</p>
            <p className="text-xs text-slate-500">30-day policy</p>
          </div>
        </div>
      </div>

      {/* Category info */}
      {product.category && (
        <div className="pt-4">
          <CategoryBadge category={product.category} />
        </div>
      )}
    </div>
  );
}

interface CategoryBadgeProps {
  category: Category;
}

function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <Link
      to={`/products?category=${category.id}`}
      className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
    >
      {category.image_url && (
        <img
          src={category.image_url}
          alt={category.name}
          className="w-6 h-6 rounded object-cover"
        />
      )}
      <span className="text-slate-300 font-medium">{category.name}</span>
      {category.product_count !== undefined && (
        <span className="text-xs text-slate-500">
          ({category.product_count} products)
        </span>
      )}
    </Link>
  );
}

export default ProductInfo;
