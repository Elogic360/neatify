import { useEffect, useState } from 'react'
import { adminProductsAPI as adminApi, type ProductCreate, type ProductUpdate, getImageUrl } from '../../app/api'
import type { Product } from '../../app/types'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { Moon, Sun } from 'lucide-react'

type ProductFormData = {
  name: string
  description: string
  image_url: string
  price: string
  stock_quantity: string
  is_active: boolean
}

const emptyForm: ProductFormData = {
  name: '',
  description: '',
  image_url: '',
  price: '',
  stock_quantity: '0',
  is_active: true
}

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark') // Default to dark

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductFormData>(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await adminApi.getAll()
      const data = response.data?.items || response.data || []
      setProducts(data)
      setError(null)
    } catch (e: any) {
      setError(e.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const openCreateModal = () => {
    setEditingProduct(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setForm({
      name: product.name,
      description: product.description || '',
      image_url: product.image_url || '',
      price: String(product.price),
      stock_quantity: String(product.stock_quantity),
      is_active: product.is_active
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingProduct(null)
    setForm(emptyForm)
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const payload: ProductCreate | ProductUpdate = {
        name: form.name,
        description: form.description || undefined,
        price: parseFloat(form.price),
        stock: parseInt(form.stock_quantity, 10),
        is_active: form.is_active
      }

      if (editingProduct) {
        await adminApi.update(editingProduct.id, payload)
      } else {
        await adminApi.create(payload as ProductCreate)
      }

      closeModal()
      await fetchProducts()
    } catch (e: any) {
      setError(e.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      await adminApi.delete(id)
      await fetchProducts()
    } catch (e: any) {
      setError(e.message || 'Failed to delete product')
    }
  }

  const toggleActive = async (product: Product) => {
    try {
      await adminApi.update(product.id, { is_active: !product.is_active })
      await fetchProducts()
    } catch (e: any) {
      setError(e.message || 'Failed to update product')
    }
  }

  const isDark = theme === 'dark'

  return (
    <div className={`space-y-4 min-h-screen p-8 ${isDark ? 'bg-black text-gray-900 dark:text-white' : 'bg-white text-gray-900'}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Products</h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Manage your product catalog</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={openCreateModal}>+ Add Product</Button>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full ${isDark ? 'bg-gray-800 text-gray-900 dark:text-white' : 'bg-gray-200 text-gray-900'}`}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {error && (
        <div className={`rounded-xl border p-4 text-sm ${isDark ? 'border-red-800 bg-red-900 text-red-200' : 'border-red-200 bg-red-50 text-red-800'}`}>
          {error}
        </div>
      )}

      {loading ? (
        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading products…</div>
      ) : (
        <Card className={`${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b text-left ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-600'}`}>
                  <th className="pb-3 pr-4 font-medium">Product</th>
                  <th className="pb-3 pr-4 font-medium">Price</th>
                  <th className="pb-3 pr-4 font-medium">Stock</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        {product.image_url && (
                          <img
                            src={getImageUrl(product.image_url)}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <div className={`font-medium ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>{product.name}</div>
                          <div className={`text-xs line-clamp-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {product.description || 'No description'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`py-3 pr-4 ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>${Number(product.price).toFixed(2)}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={product.stock_quantity > 5 ? 'success' : product.stock_quantity > 0 ? 'warning' : 'danger'}>
                        {product.stock_quantity}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <button
                        onClick={() => toggleActive(product)}
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${product.is_active
                            ? (isDark ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-800')
                            : (isDark ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-800')
                          }`}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => openEditModal(product)}>
                          Edit
                        </Button>
                        <Button variant="ghost" onClick={() => handleDelete(product.id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} className={`py-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      No products yet. Add your first product!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        className={`${isDark ? 'bg-gray-900 text-gray-900 dark:text-white' : 'bg-white text-gray-900'}`}
      >
        <div className="space-y-4">
          <div>
            <div className={`text-xs mb-1 font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Name *</div>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Product name"
              className={`${isDark ? 'bg-gray-900 text-gray-900 dark:text-white border-gray-700 focus:border-indigo-500 focus:ring-indigo-500' : 'bg-white text-gray-900 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
            />
          </div>
          <div>
            <div className={`text-xs mb-1 font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Description</div>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Product description"
              className={`w-full rounded-xl border px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 ${isDark ? 'bg-gray-900 text-gray-900 dark:text-white border-gray-700 focus:border-indigo-500 focus:ring-indigo-500' : 'bg-white text-gray-900 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
              rows={3}
            />
          </div>
          <div>
            <div className={`text-xs mb-1 font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Image URL</div>
            <Input
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://..."
              className={`${isDark ? 'bg-gray-900 text-gray-900 dark:text-white border-gray-700 focus:border-indigo-500 focus:ring-indigo-500' : 'bg-white text-gray-900 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className={`text-xs mb-1 font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Price *</div>
              <Input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="29.99"
                step="0.01"
                min="0"
                className={`${isDark ? 'bg-gray-900 text-gray-900 dark:text-white border-gray-700 focus:border-indigo-500 focus:ring-indigo-500' : 'bg-white text-gray-900 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
              />
            </div>
            <div>
              <div className={`text-xs mb-1 font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Stock Quantity</div>
              <Input
                type="number"
                value={form.stock_quantity}
                onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                placeholder="0"
                min="0"
                className={`${isDark ? 'bg-gray-900 text-gray-900 dark:text-white border-gray-700 focus:border-indigo-500 focus:ring-indigo-500' : 'bg-white text-gray-900 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className={`rounded focus:ring-indigo-500 ${isDark ? 'border-gray-700 text-indigo-600 bg-gray-900' : 'border-gray-300 text-indigo-600'}`}
            />
            <label htmlFor="is_active" className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Active (visible to customers)
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving || !form.name || !form.price}>
              {saving ? 'Saving…' : editingProduct ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}