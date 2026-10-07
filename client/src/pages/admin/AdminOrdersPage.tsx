import React, { useEffect, useState } from 'react';
import { orderService } from '../../services/orderService';
import { Order } from '../../types';
import { useToastStore } from '../../store/useToastStore';
import { Search, Filter, ShoppingBag, AlertTriangle } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const [confirmCancel, setConfirmCancel] = useState<{isOpen: boolean, orderId: string}>({isOpen: false, orderId: ''});
  const { showToast } = useToastStore();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getOrders({});
        setOrders(data);
      } catch (error) {
        showToast({ message: 'Failed to load orders', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [showToast]);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o._id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleForceCancel = async () => {
    try {
      await orderService.cancelOrder(confirmCancel.orderId, 'Force cancelled by admin');
      setOrders(orders.map(o => o._id === confirmCancel.orderId ? { ...o, orderStatus: 'CANCELLED' } : o));
      showToast({ message: 'Order cancelled successfully', type: 'success' });
    } catch (e) {
      showToast({ message: 'Failed to cancel order', type: 'error' });
    } finally {
      setConfirmCancel({ isOpen: false, orderId: '' });
    }
  };

  const handleRefund = (id: string) => {
    showToast({ message: `Refund initiated for order ${id.substring(0,6)}`, type: 'success' });
  };

  if (loading) return <div className="p-6">Loading orders...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Monitor Orders</h1>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by Order ID..."
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="border rounded-md px-4 py-2 bg-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="PLACED">Placed</option>
          <option value="PREPARING">Preparing</option>
          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="No orders found" description="Try adjusting your filters" />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-500 text-sm">
                <th className="py-3 px-4 font-medium">Order ID</th>
                <th className="py-3 px-4 font-medium">Restaurant</th>
                <th className="py-3 px-4 font-medium">Total</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <React.Fragment key={order._id}>
                  <tr className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">#{order._id.substring(0, 8)}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {typeof order.restaurantId === 'string' ? order.restaurantName || order.restaurantId : order.restaurantId.name}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium">₹{order.totalAmount.toLocaleString()}</td>
                    <td className="py-3 px-4"><span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded-full">{order.orderStatus}</span></td>
                    <td className="py-3 px-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <button 
                        onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-4"
                      >
                        {expandedId === order._id ? 'Close' : 'Details'}
                      </button>
                      {['PLACED', 'PREPARING', 'CONFIRMED'].includes(order.orderStatus) && (
                        <button 
                          onClick={() => setConfirmCancel({ isOpen: true, orderId: order._id })}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedId === order._id && (
                    <tr className="bg-gray-50 border-b">
                      <td colSpan={6} className="p-4">
                        <div className="bg-white p-4 rounded border text-sm grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Order Items</h4>
                            <ul className="space-y-1 text-gray-600">
                              {order.items.map((item, idx) => (
                                <li key={idx}>{item.quantity}x Item {item.menuItemId}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Delivery Details</h4>
                            <p className="text-gray-600">Address: {order.deliveryAddress?.addressLine1 || order.deliveryAddress?.street || 'Local delivery'}</p>
                            <p className="text-gray-600 mt-2">Payment: {order.paymentStatus}</p>
                            {order.paymentStatus === 'PAID' && order.orderStatus === 'CANCELLED' && (
                              <button 
                                onClick={() => handleRefund(order._id)}
                                className="mt-3 bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 text-xs font-semibold"
                              >
                                Initiate Refund
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmCancel.isOpen}
        title="Force Cancel Order"
        message="Are you sure you want to force cancel this order? This action cannot be undone."
        confirmText="Force Cancel"
        isDestructive={true}
        onClose={() => setConfirmCancel({ isOpen: false, orderId: '' })}
        onConfirm={handleForceCancel}
      />
    </div>
  );
};

export default AdminOrdersPage;
