import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Tag,
  Star,
  MoreVertical
} from 'lucide-react';
import { getImageUrl } from '@/app/api';

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  is_active: boolean;
  brand: string;
  rating: number;
  review_count: number;
  primary_image: string;
  categories: Array<{ id: number; name: string }>;
}

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/admin/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleProductStatus = async (productId: number, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !currentStatus
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update product status');
      }

      // Update local state
      setProducts(products.map(product =>
        product.id === productId ? { ...product, is_active: !currentStatus } : product
      ));
    } catch (error) {
      console.error('Error updating product status:', error);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      // Remove from local state
      setProducts(products.filter(product => product.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your product catalog, inventory, and pricing
          </p>
        </div>
        <button
          onClick={() => alert('Product creation feature coming soon! Check the new version in the codebase.')}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition shadow-lg shadow-orange-500/50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name, SKU, or brand..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            <option value="cleaning_agents">Cleaning Agents</option>
            <option value="detergents">Detergents & Soaps</option>
            <option value="tools">Cleaning Tools</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" aria-label="Filter by status">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
            {/* Product Image */}
            <div className="aspect-w-1 aspect-h-1 bg-gray-200 relative">
              {product.primary_image ? (
                <img
                  src={getImageUrl(product.primary_image)}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 flex items-center justify-center bg-gray-100">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <button className="p-1 bg-white rounded-full shadow-sm hover:shadow-md" aria-label="Product options">
                  <MoreVertical className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              {!product.is_active && (
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                    Inactive
                  </span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                  {product.name}
                </h3>
              </div>

              <p className="text-xs text-gray-500 mb-2">SKU: {product.sku}</p>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="text-lg font-semibold text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">
                    {product.rating.toFixed(1)} ({product.review_count})
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                {product.stock < 10 && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                    Low Stock
                  </span>
                )}
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-1 mb-4">
                {product.categories.slice(0, 2).map((category) => (
                  <span
                    key={category.id}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {category.name}
                  </span>
                ))}
                {product.categories.length > 2 && (
                  <span className="text-xs text-gray-500">
                    +{product.categories.length - 2} more
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  <button
                    disabled
                    className="p-2 text-gray-400 cursor-not-allowed rounded-md"
                    title="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    disabled
                    className="p-2 text-gray-400 cursor-not-allowed rounded-md"
                    title="Edit product"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleToggleProductStatus(product.id, product.is_active)}
                    className={`px-3 py-1 text-xs font-medium rounded ${product.is_active
                        ? 'bg-red-100 text-red-800 hover:bg-red-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                  >
                    {product.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    title="Delete product"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding your first product.'}
          </p>
          <button
            disabled
            className="mt-4 inline-flex items-center px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </button>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {filteredProducts.length} of {products.length} products
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
            Previous
          </button>
          <button className="px-3 py-1 bg-orange-500 text-white rounded-md text-sm hover:bg-orange-600">
            1
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;