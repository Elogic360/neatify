import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Minus,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  RefreshCw,
  Download
} from 'lucide-react';
import { getImageUrl } from '@/app/api';
import { useToast } from '@/components/admin/Toast';

interface InventoryLog {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  change_quantity: number;
  new_stock: number;
  reason: string;
  admin_username: string | null;
  order_id: number | null;
  created_at: string;
}

interface LowStockItem {
  id: number;
  name: string;
  sku: string;
  stock: number;
  primary_image: string;
  price: number;
}

const AdminInventory: React.FC = () => {
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'logs' | 'low-stock'>('logs');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<LowStockItem | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch inventory logs
      const logsResponse = await fetch('/api/v1/inventory/logs?limit=50', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Fetch low stock items
      const lowStockResponse = await fetch('/api/v1/inventory/low-stock', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (logsResponse.ok) {
        const logsData = await logsResponse.json();
        setInventoryLogs(logsData.logs || []);
      }

      if (lowStockResponse.ok) {
        const lowStockData = await lowStockResponse.json();
        setLowStockItems(lowStockData);
      }
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = async (productId: number, quantityChange: number, reason: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/inventory/adjust', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          quantity_change: quantityChange,
          reason: reason
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to adjust stock');
      }

      // Refresh data
      fetchInventoryData();

      // Close modal
      setShowAdjustModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error adjusting stock:', error);
      showToast('Failed to adjust stock. Please try again.', 'error');
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'order_reservation':
        return 'text-blue-600 bg-blue-100';
      case 'order_cancellation':
        return 'text-green-600 bg-green-100';
      case 'admin_adjustment':
        return 'text-orange-600 bg-orange-100';
      case 'initial_stock':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
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
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Monitor stock levels, track changes, and manage inventory adjustments
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchInventoryData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-900">{lowStockItems.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Stock Changes Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {inventoryLogs.filter(log =>
                  new Date(log.created_at).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Logs</p>
              <p className="text-2xl font-bold text-gray-900">{inventoryLogs.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'logs'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Inventory Logs
            </button>
            <button
              onClick={() => setActiveTab('low-stock')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'low-stock'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Low Stock Alerts
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'logs' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Change
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      New Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventoryLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {log.product_name}
                        </div>
                        <div className="text-sm text-gray-500">SKU: {log.product_sku}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          log.change_quantity > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {log.change_quantity > 0 ? (
                            <Plus className="h-3 w-3 mr-1" />
                          ) : (
                            <Minus className="h-3 w-3 mr-1" />
                          )}
                          {Math.abs(log.change_quantity)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.new_stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReasonColor(log.reason)}`}>
                          {log.reason.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.admin_username || 'System'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {inventoryLogs.length === 0 && (
                <div className="text-center py-12">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No inventory logs found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Inventory changes will appear here as they occur.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'low-stock' && (
            <div className="space-y-4">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {item.primary_image ? (
                        <img
                          src={getImageUrl(item.primary_image)}
                          alt={item.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                      <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-red-600">{item.stock}</p>
                      <p className="text-xs text-gray-500">in stock</p>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedProduct(item);
                          setShowAdjustModal(true);
                        }}
                        className="px-3 py-1 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 transition-colors"
                      >
                        Adjust Stock
                      </button>
                      <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {lowStockItems.length === 0 && (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-green-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">All items are well stocked!</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No products are currently running low on inventory.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {showAdjustModal && selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowAdjustModal(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Adjust Stock: {selectedProduct.name}
                </h3>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const quantityChange = parseInt(formData.get('quantityChange') as string);
                  const reason = formData.get('reason') as string;
                  handleAdjustStock(selectedProduct.id, quantityChange, reason);
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity Change
                      </label>
                      <input
                        type="number"
                        name="quantityChange"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Enter positive or negative number"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Current stock: {selectedProduct.stock}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason
                      </label>
                      <select
                        name="reason"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                        aria-label="Select adjustment reason"
                      >
                        <option value="">Select a reason</option>
                        <option value="received_shipment">Received Shipment</option>
                        <option value="damaged_goods">Damaged Goods</option>
                        <option value="returned_item">Returned Item</option>
                        <option value="inventory_count">Inventory Count</option>
                        <option value="admin_adjustment">Admin Adjustment</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAdjustModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm font-medium"
                    >
                      Adjust Stock
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;