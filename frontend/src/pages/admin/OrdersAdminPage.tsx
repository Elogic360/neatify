import { useEffect, useState } from 'react'
import { adminOrdersAPI } from '../../app/api'
import type { Order } from '../../app/types'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { Moon, Sun } from 'lucide-react'

const ORDER_STATUSES = ['new', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded']

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark') // Default to dark

  // Detail modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updating, setUpdating] = useState(false)

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const isDark = theme === 'dark'

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await adminOrdersAPI.getAll()
      setOrders(response.data)
      setError(null)
    } catch (e: any) {
      setError(e.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const updateStatus = async (orderId: number, orderStatus: string, paymentStatus?: string) => {
    setUpdating(true)
    try {
      const response = await adminOrdersAPI.update(orderId, {
        status: orderStatus,
        payment_status: paymentStatus
      })
      setOrders(orders.map(o => o.id === orderId ? response.data : o))
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(response.data)
      }
    } catch (e: any) {
      setError(e.message || 'Failed to update order')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'default' => {
    switch (status) {
      case 'confirmed':
      case 'paid':
      case 'delivered':
        return 'success'
      case 'processing':
      case 'shipped':
      case 'pending':
        return 'warning'
      case 'cancelled':
      case 'failed':
        return 'danger'
      default:
        return 'default'
    }
  }

  return (
    <div className={`space-y-4 ${isDark ? 'bg-black text-gray-900 dark:text-white' : 'bg-white text-gray-900'}`}>
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
        }`}>Orders</h2>
        <p className={`text-sm ${
          isDark ? 'text-gray-500 dark:text-slate-400' : 'text-gray-600'
        }`}>View and manage customer orders</p>
      </div>

      {error && (
        <div className={`rounded-xl border p-4 text-sm ${
          isDark
            ? 'border-rose-500/30 bg-rose-500/10 text-rose-200'
            : 'border-rose-300 bg-rose-50 text-rose-800'
        }`}>
          {error}
        </div>
      )}

      {loading ? (
        <div className={`text-sm ${
          isDark ? 'text-gray-500 dark:text-slate-400' : 'text-gray-600'
        }`}>Loading orders…</div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b text-left ${
                  isDark
                    ? 'border-white/10 text-gray-500 dark:text-slate-400'
                    : 'border-gray-200 text-gray-500'
                }`}>
                  <th className="pb-3 pr-4">Order ID</th>
                  <th className="pb-3 pr-4">Customer</th>
                  <th className="pb-3 pr-4">Items</th>
                  <th className="pb-3 pr-4">Total</th>
                  <th className="pb-3 pr-4">Order Status</th>
                  <th className="pb-3 pr-4">Payment</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className={`border-b ${
                    isDark ? 'border-white/5' : 'border-gray-100'
                  }`}>
                    <td className={`py-3 pr-4 font-mono ${
                      isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'
                    }`}>#{order.id}</td>
                    <td className={`py-3 pr-4 ${
                      isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'
                    }`}>Customer #{order.customer_id}</td>
                    <td className={`py-3 pr-4 ${
                      isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'
                    }`}>{order.items.length} items</td>
                    <td className={`py-3 pr-4 font-medium ${
                      isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'
                    }`}>${Number(order.total_amount).toFixed(2)}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={getStatusVariant(order.order_status)}>
                        {order.order_status}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={getStatusVariant(order.payment_status)}>
                        {order.payment_status}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Button variant="ghost" onClick={() => setSelectedOrder(order)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className={`py-8 text-center ${
                      isDark ? 'text-gray-500 dark:text-slate-400' : 'text-gray-500'
                    }`}>
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order #${selectedOrder?.id}`}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className={`${
                  isDark ? 'text-gray-500 dark:text-slate-400' : 'text-gray-500'
                }`}>Customer</div>
                <div className={`${
                  isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'
                }`}>#{selectedOrder.customer_id}</div>
              </div>
              <div>
                <div className={`${
                  isDark ? 'text-gray-500 dark:text-slate-400' : 'text-gray-500'
                }`}>Total</div>
                <div className={`font-semibold ${
                  isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'
                }`}>${Number(selectedOrder.total_amount).toFixed(2)}</div>
              </div>
            </div>

            <div>
              <div className={`text-sm mb-2 ${
                isDark ? 'text-gray-500 dark:text-slate-400' : 'text-gray-500'
              }`}>Items</div>
              <div className={`rounded-lg border p-3 space-y-2 ${
                isDark
                  ? 'border-white/10 bg-white/5'
                  : 'border-gray-200 bg-gray-50'
              }`}>
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className={`flex justify-between text-sm ${
                    isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'
                  }`}>
                    <span>Product #{item.product_id} × {item.quantity}</span>
                    <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className={`text-sm mb-2 ${
                  isDark ? 'text-gray-500 dark:text-slate-400' : 'text-gray-500'
                }`}>Order Status</div>
                <select
                  value={selectedOrder.order_status}
                  onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                  disabled={updating}
                  className={`w-full rounded-xl border px-3 py-2 text-sm focus:border-indigo-400/40 focus:outline-none ${
                    isDark
                      ? 'border-white/10 bg-white/5 text-gray-900 dark:text-white'
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                  aria-label="Order Status"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s} className={`${
                      isDark ? 'bg-slate-900' : 'bg-white'
                    }`}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className={`text-sm mb-2 ${
                  isDark ? 'text-gray-500 dark:text-slate-400' : 'text-gray-500'
                }`}>Payment Status</div>
                <select
                  value={selectedOrder.payment_status}
                  onChange={(e) => updateStatus(selectedOrder.id, selectedOrder.order_status, e.target.value)}
                  disabled={updating}
                  className={`w-full rounded-xl border px-3 py-2 text-sm focus:border-indigo-400/40 focus:outline-none ${
                    isDark
                      ? 'border-white/10 bg-white/5 text-gray-900 dark:text-white'
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                  aria-label="Payment Status"
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s} className={`${
                      isDark ? 'bg-slate-900' : 'bg-white'
                    }`}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button variant="secondary" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
