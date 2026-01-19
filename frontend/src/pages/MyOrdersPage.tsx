import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ordersAPI } from '../app/api'
import { useStore } from '../app/store'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

interface OrderItem {
  id: number
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

interface Order {
  id: number
  order_number: string
  status: string
  payment_status: string
  total_amount: number
  created_at: string
  items: OrderItem[]
}

export default function MyOrdersPage() {
  const navigate = useNavigate()
  const { token } = useStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    loadOrders()
  }, [token, navigate])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await ordersAPI.getAll()
      const data = response.data
      // Handle both array and paginated response formats
      const ordersList = Array.isArray(data) ? data : (data?.items || [])
      setOrders(ordersList)
      setError(null)
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'success'
      case 'shipped':
      case 'processing':
        return 'info'
      case 'pending':
      case 'confirmed':
        return 'warning'
      case 'cancelled':
      case 'failed':
        return 'danger'
      default:
        return 'default'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse text-center py-12">Loading your orders...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Orders</h1>
            <p className="text-slate-400 mt-1">Track and manage your orders</p>
          </div>
          <Link to="/">
            <Button variant="secondary">← Continue Shopping</Button>
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
            {error}
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <svg className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-lg">No orders yet</p>
              <p className="text-sm mt-2">Start shopping to see your orders here</p>
            </div>
            <Link to="/">
              <Button>Browse Products</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Order Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{order.order_number}</h3>
                      <Badge variant={getStatusColor(order.status) as any}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400">
                      Placed on {formatDate(order.created_at)}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-300">
                        {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="font-medium text-orange-400">
                        TZS {order.total_amount?.toLocaleString() || '0.00'}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className={`text-sm ${
                        order.payment_status === 'paid' ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        Payment: {order.payment_status}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link to={`/order-confirmation/${order.id}`}>
                      <Button variant="secondary">View Details</Button>
                    </Link>
                  </div>
                </div>

                {/* Order Items Preview */}
                {order.items && order.items.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="flex flex-wrap gap-2 text-sm text-slate-400">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <span key={item.id}>
                          {item.product_name || `Product #${item.product_id}`} (x{item.quantity})
                          {idx < Math.min(order.items.length - 1, 2) && ', '}
                        </span>
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-slate-500">+{order.items.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
