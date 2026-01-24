import { useEffect, useState } from 'react'
import { adminInventoryAPI as adminApi, type InventoryItem, type InventoryLog } from '../../app/api'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { Moon, Sun } from 'lucide-react'

export default function InventoryAdminPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [logs, setLogs] = useState<InventoryLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark') // Default to dark

  // Adjustment modal
  const [showAdjust, setShowAdjust] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null)
  const [adjustQty, setAdjustQty] = useState('')
  const [adjustReason, setAdjustReason] = useState('')
  const [adjusting, setAdjusting] = useState(false)

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const isDark = theme === 'dark'

  const fetchData = async () => {
    try {
      setLoading(true)
      const [invResp, logResp] = await Promise.all([
        adminApi.getAll(),
        adminApi.getLogs({ limit: 20 })
      ])
      const invData = invResp.data?.items || invResp.data || []
      const logData = logResp.data?.items || logResp.data || []
      setInventory(invData)
      setLogs(logData)
      setError(null)
    } catch (e: any) {
      setError(e.message || 'Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openAdjustModal = (item: InventoryItem) => {
    setSelectedProduct(item)
    setAdjustQty('')
    setAdjustReason('')
    setShowAdjust(true)
  }

  const handleAdjust = async () => {
    if (!selectedProduct || !adjustQty) return

    setAdjusting(true)
    try {
      await adminApi.adjust({
        product_id: selectedProduct.product_id,
        quantity_change: parseInt(adjustQty, 10),
        reason: adjustReason || 'Manual adjustment'
      })
      setShowAdjust(false)
      await fetchData()
    } catch (e: any) {
      setError(e.message || 'Failed to adjust inventory')
    } finally {
      setAdjusting(false)
    }
  }

  const lowStockItems = inventory.filter(i => i.low_stock)

  return (
    <div className={`space-y-6 ${isDark ? 'bg-black text-gray-900 dark:text-white' : 'bg-white text-gray-900'}`}>
      {/* Theme Toggle */}
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleTheme}
          className={`rounded-lg p-2 transition-colors ${
            isDark
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>

      <div>
        <h2 className={`text-xl font-semibold ${
          isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'
        }`}>Inventory</h2>
        <p className={`text-sm ${
          isDark ? 'text-gray-500 dark:text-slate-400' : 'text-gray-600'
        }`}>Monitor stock levels and adjust inventory</p>
      </div>

      {error && (
        <div className={`rounded-xl border p-4 text-sm ${
          isDark
            ? 'border-red-500/30 bg-red-500/10 text-red-200'
            : 'border-red-200 bg-red-50 text-red-800'
        }`}>
          {error}
        </div>
      )}

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className={`rounded-xl border p-4 ${
          isDark
            ? 'border-amber-500/30 bg-amber-500/10'
            : 'border-amber-200 bg-amber-50'
        }`}>
          <div className={`flex items-center gap-2 ${
            isDark ? 'text-amber-200' : 'text-amber-800'
          }`}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">Low Stock Alert</span>
          </div>
          <div className="mt-2 text-sm text-amber-700">
            {lowStockItems.length} product{lowStockItems.length > 1 ? 's' : ''} need restocking:
            {' '}
            {lowStockItems.map(i => i.product_name).join(', ')}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-500">Loading inventory…</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Inventory Table */}
          <div className="lg:col-span-2">
            <Card>
              <div className="text-sm font-semibold mb-4 text-gray-900">Stock Levels</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-600">
                      <th className="pb-3 pr-4 font-medium">Product</th>
                      <th className="pb-3 pr-4 font-medium">Stock</th>
                      <th className="pb-3 pr-4 font-medium">Status</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => (
                      <tr key={item.product_id} className="border-b border-gray-100">
                        <td className="py-3 pr-4">
                          <div className="font-medium text-gray-900">{item.product_name}</div>
                          <div className="text-xs text-gray-500">ID: {item.product_id}</div>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge
                            variant={
                              item.stock_quantity > 10 ? 'success' :
                                item.stock_quantity > 0 ? 'warning' : 'danger'
                            }
                          >
                            {item.stock_quantity}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4">
                          {item.low_stock ? (
                            <span className="text-amber-600 text-xs font-medium">Low Stock</span>
                          ) : item.stock_quantity === 0 ? (
                            <span className="text-red-600 text-xs font-medium">Out of Stock</span>
                          ) : (
                            <span className="text-emerald-600 text-xs font-medium">In Stock</span>
                          )}
                        </td>
                        <td className="py-3">
                          <Button variant="ghost" onClick={() => openAdjustModal(item)}>
                            Adjust
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {inventory.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500">
                          No products in inventory.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card>
              <div className="text-sm font-semibold mb-4 text-gray-900">Recent Activity</div>
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="border-b border-gray-100 pb-3 last:border-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Product #{log.product_id}</span>
                      <span className={`text-xs font-medium ${log.quantity > 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                        {log.quantity > 0 ? '+' : ''}{log.quantity}
                      </span>
                    </div>
                    <div className="text-sm mt-1 text-gray-900">{log.reason || 'No reason'}</div>
                    {log.new_stock !== null && (
                      <div className="text-xs text-gray-500">→ New stock: {log.new_stock}</div>
                    )}
                  </div>
                ))}
                {logs.length === 0 && (
                  <div className="text-sm text-gray-500">No activity yet.</div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Adjust Inventory Modal */}
      <Modal
        isOpen={showAdjust}
        onClose={() => setShowAdjust(false)}
        title={`Adjust Inventory: ${selectedProduct?.product_name}`}
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Current stock: <span className="text-gray-900 font-medium">{selectedProduct.stock_quantity}</span>
            </div>

            <div>
              <div className="text-xs text-gray-600 mb-1 font-medium">Quantity Change</div>
              <Input
                type="number"
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                placeholder="e.g., 10 or -5"
              />
              <div className="text-xs text-gray-500 mt-1">
                Use positive numbers to add, negative to remove
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-600 mb-1 font-medium">Reason</div>
              <Input
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="e.g., Restock, Damaged goods, Inventory count"
              />
            </div>

            {adjustQty && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
                New stock will be: <span className="font-medium text-blue-900">
                  {selectedProduct.stock_quantity + parseInt(adjustQty || '0', 10)}
                </span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setShowAdjust(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdjust} disabled={adjusting || !adjustQty}>
                {adjusting ? 'Adjusting…' : 'Confirm Adjustment'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}