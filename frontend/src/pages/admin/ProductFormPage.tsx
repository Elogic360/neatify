/**
 * ProductFormPage - Simplified Create/Edit product with image upload
 * Fields: Product Name, Category (optional), Image, Price, New Price (for discounts)
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';
import {
  ArrowLeft,
  Save,
  Package,
  DollarSign,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  Upload,
  X,
  Plus,
  FolderPlus,
} from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';
import { useToast } from '@/components/admin/Toast';
import { adminService } from '@/services/adminService';
import { getImageUrl, adminCategoriesAPI } from '@/app/api';

interface ProductFormData {
  name: string;
  category_id: string;
  price: string;
  new_price: string;
}

const initialFormData: ProductFormData = {
  name: '',
  category_id: '',
  price: '',
  new_price: '',
};

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { categories, fetchCategories } = useAdminStore();

  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  
  // Category creation modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch product data for edit
  useEffect(() => {
    if (id) {
      setIsFetching(true);
      adminService.productsAPI
        .getById(Number(id))
        .then((product) => {
          setFormData({
            name: product.name || '',
            category_id: product.category?.id?.toString() || '',
            price: product.original_price?.toString() || product.price?.toString() || '',
            new_price: product.price?.toString() || '',
          });
          if (product.primary_image) {
            setExistingImage(product.primary_image);
          }
        })
        .catch(() => {
          showToast('Failed to load product', 'error');
          navigate('/admin/products');
        })
        .finally(() => {
          setIsFetching(false);
        });
    }
  }, [id, navigate, showToast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error on change
    if (errors[name as keyof ProductFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image must be less than 5MB', 'error');
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setExistingImage(null);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setExistingImage(null);
  };

  // Handle creating a new category
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setCategoryError('Category name is required');
      return;
    }
    
    setIsCreatingCategory(true);
    setCategoryError('');
    
    try {
      const response = await adminCategoriesAPI.create({
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || undefined,
      });
      
      // Refresh categories list
      await fetchCategories();
      
      // Auto-select the new category
      const newCatId = response.data?.id;
      if (newCatId) {
        setFormData((prev) => ({ ...prev, category_id: newCatId.toString() }));
      }
      
      // Reset and close modal
      setNewCategoryName('');
      setNewCategoryDescription('');
      setShowCategoryModal(false);
      showToast('Category created successfully!', 'success');
    } catch (error: any) {
      const message = error?.response?.data?.detail || 'Failed to create category';
      setCategoryError(message);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProductFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (formData.new_price && parseFloat(formData.new_price) <= 0) {
      newErrors.new_price = 'New price must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      showToast('Please fix the form errors', 'error');
      return;
    }

    setIsLoading(true);

    try {
      let savedProduct;

      if (isEdit) {
        // Use the full update endpoint for editing
        const productData = {
          name: formData.name,
          category_ids: formData.category_id ? [parseInt(formData.category_id)] : [],
          price: parseFloat(formData.price),
          original_price: parseFloat(formData.price),
          sale_price: formData.new_price ? parseFloat(formData.new_price) : undefined,
        };
        savedProduct = await adminService.productsAPI.update(Number(id), productData);
        showToast('Product updated successfully', 'success');
      } else {
        // Use the simplified endpoint for creating
        const productData = {
          name: formData.name,
          category_id: formData.category_id ? parseInt(formData.category_id) : null,
          price: parseFloat(formData.price),
          new_price: formData.new_price ? parseFloat(formData.new_price) : null,
        };
        savedProduct = await adminService.productsAPI.createSimple(productData);
        showToast('Product created successfully', 'success');
      }

      // Upload image if selected
      if (selectedImage && savedProduct) {
        await adminService.productsAPI.uploadImage(savedProduct.id, selectedImage, true);
      }

      navigate('/admin/products');
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to save product';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/products')}
            className="rounded-lg p-2 text-gray-500 dark:text-slate-400 hover:bg-slate-700 hover:text-gray-900 dark:text-white"
            aria-label="Go back to products"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {isEdit ? 'Update product details' : 'Create a new product'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <section className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Package className="h-5 w-5 text-emerald-400" />
            Product Information
          </h2>
          <div className="space-y-4">
            {/* Product Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">
                Product Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={clsx(
                  'w-full rounded-lg border bg-slate-900 px-4 py-3 text-gray-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2',
                  errors.name
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-600 focus:border-emerald-500 focus:ring-emerald-500'
                )}
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="mt-1 flex items-center gap-1 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category_id" className="mb-1 block text-sm font-medium text-slate-300">
                Category <span className="text-slate-500">(Optional)</span>
              </label>
              <div className="flex gap-2">
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="flex-1 rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  aria-label="Product category"
                >
                  <option value="">Select category (optional)</option>
                  {categories.items.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="flex items-center gap-2 rounded-lg border border-emerald-500 bg-emerald-500/10 px-4 py-3 text-emerald-400 transition hover:bg-emerald-500/20"
                  title="Add new category"
                >
                  <Plus className="h-5 w-5" />
                  <span className="hidden sm:inline">Add</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Product Image */}
        <section className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <ImageIcon className="h-5 w-5 text-emerald-400" />
            Product Image
          </h2>
          
          {/* Image Preview */}
          {(imagePreview || existingImage) && (
            <div className="relative mb-4 inline-block">
              <img
                src={imagePreview || getImageUrl(existingImage || '')}
                alt="Product preview"
                className="h-48 w-48 rounded-lg object-cover border border-slate-600"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-gray-900 dark:text-white hover:bg-red-600"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Upload Button */}
          {!imagePreview && !existingImage && (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-600 bg-slate-900/50 p-8 transition hover:border-emerald-500 hover:bg-slate-900">
              <Upload className="mb-2 h-10 w-10 text-gray-500 dark:text-slate-400" />
              <span className="text-sm font-medium text-slate-300">Click to upload image</span>
              <span className="mt-1 text-xs text-slate-500">PNG, JPG up to 5MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          )}

          {(imagePreview || existingImage) && (
            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">
              <Upload className="h-4 w-4" />
              Change Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          )}
        </section>

        {/* Pricing */}
        <section className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <DollarSign className="h-5 w-5 text-emerald-400" />
            Pricing
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Price */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">
                Price <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400">$</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={clsx(
                    'w-full rounded-lg border bg-slate-900 pl-8 pr-4 py-3 text-gray-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2',
                    errors.price
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-600 focus:border-emerald-500 focus:ring-emerald-500'
                  )}
                  placeholder="0.00"
                />
              </div>
              {errors.price && (
                <p className="mt-1 flex items-center gap-1 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  {errors.price}
                </p>
              )}
            </div>

            {/* New Price (Discount) */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">
                New Price <span className="text-slate-500">(Sale/Discount)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400">$</span>
                <input
                  type="number"
                  name="new_price"
                  value={formData.new_price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={clsx(
                    'w-full rounded-lg border bg-slate-900 pl-8 pr-4 py-3 text-gray-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2',
                    errors.new_price
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-600 focus:border-emerald-500 focus:ring-emerald-500'
                  )}
                  placeholder="0.00"
                />
              </div>
              {errors.new_price && (
                <p className="mt-1 flex items-center gap-1 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  {errors.new_price}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                Leave empty if no discount. Original price will be shown crossed out.
              </p>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="rounded-lg border border-slate-600 px-6 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 text-sm font-medium text-gray-900 dark:text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                <FolderPlus className="h-5 w-5 text-emerald-400" />
                Add New Category
              </h3>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setNewCategoryName('');
                  setNewCategoryDescription('');
                  setCategoryError('');
                }}
                className="rounded-lg p-1 text-gray-500 dark:text-slate-400 hover:bg-slate-700 hover:text-gray-900 dark:text-white"
                aria-label="Close modal"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">
                  Category Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => {
                    setNewCategoryName(e.target.value);
                    setCategoryError('');
                  }}
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-gray-900 dark:text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., Electronics, Clothing, Home & Garden"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">
                  Description <span className="text-slate-500">(Optional)</span>
                </label>
                <textarea
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-gray-900 dark:text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Brief description of this category..."
                />
              </div>
              
              {categoryError && (
                <p className="flex items-center gap-1 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  {categoryError}
                </p>
              )}
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCategoryModal(false);
                  setNewCategoryName('');
                  setNewCategoryDescription('');
                  setCategoryError('');
                }}
                className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCategory}
                disabled={isCreatingCategory || !newCategoryName.trim()}
                className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-emerald-600 disabled:opacity-50"
              >
                {isCreatingCategory ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
