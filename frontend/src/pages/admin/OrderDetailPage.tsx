/**
 * OrderDetailPage - View and manage individual order
 */
import { Fragment, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Printer,
  Download,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { adminService, formatCurrency, formatDateTime, type AdminOrder } from '@/services/adminService';

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', icon: Clock, color: 'amber' },
  { value: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: 'blue' },
  { value: 'processing', label: 'Processing', icon: Package, color: 'purple' },
  { value: 'shipped', label: 'Shipped', icon: Truck, color: 'cyan' },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'emerald' },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'red' },
];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [showTrackingInput, setShowTrackingInput] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.ordersAPI.getById(Number(id));
      setOrder(data);
      setTrackingNumber(data.tracking_number || '');
    } catch {
      showToast('Failed to load order', 'error');
      navigate('/admin/orders');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return;

    setIsUpdating(true);
    try {
      const updatedOrder = await adminService.ordersAPI.updateStatus(order.id, newStatus);
      setOrder(updatedOrder);
      showToast(`Order status updated to ${newStatus}`, 'success');
    } catch {
      showToast('Failed to update order status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    await updateOrderStatus('cancelled');
    setCancelConfirm(false);
  };

  const handleUpdateTracking = async () => {
    if (!order || !trackingNumber.trim()) return;

    setIsUpdating(true);
    try {
      // Update order status to shipped if not already, and add tracking as notes
      const newStatus = order.status === 'processing' ? 'shipped' : order.status;
      const updatedOrder = await adminService.ordersAPI.updateStatus(order.id, newStatus, `Tracking: ${trackingNumber}`);
      setOrder(updatedOrder);
      setShowTrackingInput(false);
      showToast('Tracking number updated', 'success');
    } catch {
      showToast('Failed to update tracking number', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      processing: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      shipped: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
    };
    return colors[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-emerald-500/10 text-emerald-400',
      pending: 'bg-amber-500/10 text-amber-400',
      failed: 'bg-red-500/10 text-red-400',
      refunded: 'bg-slate-500/10 text-slate-400',
    };
    return colors[status] || 'bg-slate-500/10 text-slate-400';
  };

  const getCurrentStatusIndex = () => {
    return ORDER_STATUSES.findIndex((s) => s.value === order?.status);
  };

  const getNextStatus = () => {
    const currentIndex = getCurrentStatusIndex();
    if (currentIndex < ORDER_STATUSES.length - 2 && order?.status !== 'cancelled') {
      return ORDER_STATUSES[currentIndex + 1];
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <AlertTriangle className="h-12 w-12 text-amber-400" />
        <h3 className="mt-4 text-lg font-semibold text-white">Order not found</h3>
        <button
          onClick={() => navigate('/admin/orders')}
          className="mt-4 text-emerald-400 hover:text-emerald-300"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const nextStatus = getNextStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
            aria-label="Go back to orders"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">Order #{order.id}</h1>
              <span
                className={clsx(
                  'rounded-full border px-3 py-1 text-sm font-medium capitalize',
                  getStatusColor(order.status)
                )}
              >
                {order.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Placed on {formatDateTime(order.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700">
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700">
            <Download className="h-4 w-4" />
            Invoice
          </button>
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <button
              onClick={() => setCancelConfirm(true)}
              className="flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10"
            >
              <XCircle className="h-4 w-4" />
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Status Timeline */}
      {order.status !== 'cancelled' && (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Order Progress</h3>
          <div className="relative flex justify-between">
            {ORDER_STATUSES.filter((s) => s.value !== 'cancelled').map((status, index) => {
              const currentIndex = getCurrentStatusIndex();
              const isCompleted = index <= currentIndex;
              const isCurrent = index === currentIndex;
              const Icon = status.icon;

              return (
                <Fragment key={status.value}>
                  <div className="relative flex flex-col items-center">
                    <div
                      className={clsx(
                        'flex h-10 w-10 items-center justify-center rounded-full border-2 transition',
                        isCompleted
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-slate-600 bg-slate-800 text-slate-500'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={clsx(
                        'mt-2 text-xs font-medium',
                        isCurrent ? 'text-emerald-400' : isCompleted ? 'text-white' : 'text-slate-500'
                      )}
                    >
                      {status.label}
                    </span>
                  </div>

                  {index < ORDER_STATUSES.length - 2 && (
                    <div className="relative top-5 flex-1">
                      <div
                        className={clsx(
                          'h-0.5 w-full',
                          index < currentIndex ? 'bg-emerald-500' : 'bg-slate-600'
                        )}
                      />
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>

          {/* Next Action */}
          {nextStatus && (
            <div className="mt-6 flex items-center justify-center gap-4">
              {nextStatus.value === 'shipped' && !showTrackingInput && (
                <button
                  onClick={() => setShowTrackingInput(true)}
                  className="text-sm text-emerald-400 hover:text-emerald-300"
                >
                  Add Tracking Number
                </button>
              )}
              {showTrackingInput && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    onClick={handleUpdateTracking}
                    disabled={isUpdating}
                    className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              )}
              <button
                onClick={() => updateOrderStatus(nextStatus.value)}
                disabled={isUpdating}
                className="flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Mark as {nextStatus.label}
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-lg border border-slate-700 p-4"
                >
                  {item.product_image ? (
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-700">
                      <Package className="h-8 w-8 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-white">{item.product_name}</p>
                    <p className="text-sm text-slate-400">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">{formatCurrency(item.total)}</p>
                    <p className="text-sm text-slate-400">{formatCurrency(item.unit_price)} each</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 border-t border-slate-700 pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="text-white">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Shipping</span>
                  <span className="text-white">{formatCurrency(order.shipping_cost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tax</span>
                  <span className="text-white">{formatCurrency(order.tax_amount)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-700 pt-2 text-base font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-emerald-400">{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
              <h3 className="mb-2 text-lg font-semibold text-white">Order Notes</h3>
              <p className="text-slate-300">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <User className="h-5 w-5 text-emerald-400" />
              Customer
            </h3>
            <div className="space-y-3">
              <p className="font-medium text-white">{order.user?.full_name || order.user?.username || 'Guest'}</p>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Mail className="h-4 w-4" />
                {order.user?.email || 'N/A'}
              </div>
              {order.user?.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Phone className="h-4 w-4" />
                  {order.user.phone}
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <MapPin className="h-5 w-5 text-emerald-400" />
              Shipping Address
            </h3>
            <div className="space-y-1 text-sm text-slate-300">
              <p className="font-medium text-white">{order.shipping_address.full_name}</p>
              <p>{order.shipping_address.street}</p>
              <p>
                {order.shipping_address.city}, {order.shipping_address.state}{' '}
                {order.shipping_address.zip_code}
              </p>
              <p>{order.shipping_address.country}</p>
              {order.shipping_address.phone && (
                <p className="text-slate-400">{order.shipping_address.phone}</p>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <CreditCard className="h-5 w-5 text-emerald-400" />
              Payment
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status</span>
                <span
                  className={clsx(
                    'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                    getPaymentStatusColor(order.payment_status)
                  )}
                >
                  {order.payment_status}
                </span>
              </div>
              {order.payment_method && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Method</span>
                  <span className="text-white capitalize">{order.payment_method}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tracking Info */}
          {order.tracking_number && (
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <Truck className="h-5 w-5 text-emerald-400" />
                Tracking
              </h3>
              <div className="space-y-2 text-sm">
                <p className="font-mono text-white">{order.tracking_number}</p>
                {order.status === 'shipped' && (
                  <p className="text-slate-400">Status: Shipped</p>
                )}
                {order.status === 'delivered' && (
                  <p className="text-slate-400">Status: Delivered</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={cancelConfirm}
        onClose={() => setCancelConfirm(false)}
        onConfirm={handleCancelOrder}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone and the customer will be notified."
        variant="danger"
        confirmLabel="Cancel Order"
      />
    </div>
  );
}
