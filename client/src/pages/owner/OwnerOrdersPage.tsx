import React, { useEffect, useState, useCallback } from 'react';
import { Clock, Check, ChefHat, Bike, AlertCircle, X, Loader } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { Order, OrderStatus } from '../../types';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';

export const OwnerOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderTypeFilter, setOrderTypeFilter] = useState<'ALL' | 'DELIVERY' | 'TAKEOUT'>('ALL');
  
  // Confirm dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogAction, setDialogAction] = useState<'REJECT' | null>(null);

  const RESTAURANT_ID = 'rest_dehradun_01';

  const fetchOrders = useCallback(async () => {
    try {
      const data = await orderService.getOrders({ restaurantId: RESTAURANT_ID });
      // Only keep active/relevant orders for KDS
      const activeOrders = data.filter(o => 
        !['CANCELLED', 'REJECTED', 'DELIVERY_FAILED', 'REFUND_PENDING', 'REFUNDED'].includes(o.orderStatus)
      );
      setOrders(activeOrders);
    } catch (error) {
      console.error('Failed to load orders', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    // Simulate auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (id: string, newStatus: OrderStatus) => {
    try {
      await orderService.updateOrderStatus(id, newStatus, `Status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const handleReject = async () => {
    if (selectedOrder) {
      try {
        await orderService.cancelOrder(selectedOrder._id, 'Rejected by restaurant');
        fetchOrders();
      } catch (error) {
        console.error('Failed to reject order', error);
      } finally {
        setDialogOpen(false);
        setSelectedOrder(null);
        setDialogAction(null);
      }
    }
  };

  const getUrgencyColor = (createdAt: string) => {
    const mins = (new Date().getTime() - new Date(createdAt).getTime()) / 60000;
    if (mins > 45) return 'border-red-500 bg-red-50';
    if (mins > 30) return 'border-orange-500 bg-orange-50';
    return 'border-gray-200 bg-white';
  };

  const getFilteredOrders = () => {
    if (orderTypeFilter === 'ALL') return orders;
    return orders.filter(o => o.orderType === orderTypeFilter);
  };

  const columns = [
    { title: 'NEW', statuses: ['PLACED', 'CONFIRMED'], icon: AlertCircle },
    { title: 'PREPARING', statuses: ['PREPARING'], icon: ChefHat },
    { title: 'READY', statuses: ['READY_FOR_PICKUP'], icon: Check },
    { title: 'DISPATCHED', statuses: ['RIDER_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'], icon: Bike },
  ];

  const filteredOrders = getFilteredOrders();

  if (loading) {
    return <div className="p-8 text-center"><Loader className="w-8 h-8 animate-spin mx-auto text-blue-500" /></div>;
  }

  return (
    <div className="h-[calc(100vh-4rem)] p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kitchen Display System</h1>
          <p className="text-gray-500 text-sm">Manage live orders</p>
        </div>
        
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
          {(['ALL', 'DELIVERY', 'TAKEOUT'] as const).map(type => (
            <button
              key={type}
              onClick={() => setOrderTypeFilter(type)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                orderTypeFilter === type ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-6 h-full min-w-max pb-4">
          {columns.map(col => {
            const colOrders = filteredOrders.filter(o => col.statuses.includes(o.orderStatus));
            return (
              <div key={col.title} className="w-80 flex flex-col bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                <div className="p-4 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <col.icon className="w-5 h-5 text-gray-600" />
                    <h2 className="font-bold text-gray-800">{col.title}</h2>
                  </div>
                  <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">
                    {colOrders.length}
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {colOrders.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No orders
                    </div>
                  ) : (
                    colOrders.map(order => (
                      <div key={order._id} className={`p-4 rounded-lg border shadow-sm ${getUrgencyColor(order.createdAt)}`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-lg">#{order._id.slice(-4).toUpperCase()}</span>
                          <span className={`text-xs font-bold px-2 py-1 rounded ${order.orderType === 'DELIVERY' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                            {order.orderType}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-3 font-medium">
                          {order.customerName || 'Guest'}
                        </div>
                        
                        <ul className="text-sm space-y-1 mb-4">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="flex justify-between">
                              <span><span className="font-bold">{item.quantity}x</span> {item.name}</span>
                            </li>
                          ))}
                        </ul>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4 border-t pt-2">
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {Math.round((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000)} mins ago
                          </div>
                          <span className="font-bold text-gray-900">₹{order.totalAmount}</span>
                        </div>
                        
                        <div className="flex space-x-2">
                          {order.orderStatus === 'PLACED' && (
                            <>
                              <button 
                                onClick={() => updateStatus(order._id, 'CONFIRMED')}
                                className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 rounded hover:bg-blue-700"
                              >
                                Accept
                              </button>
                              <button 
                                onClick={() => { setSelectedOrder(order); setDialogAction('REJECT'); setDialogOpen(true); }}
                                className="px-3 bg-red-100 text-red-600 text-sm font-medium py-2 rounded hover:bg-red-200"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {order.orderStatus === 'CONFIRMED' && (
                            <button 
                              onClick={() => updateStatus(order._id, 'PREPARING')}
                              className="w-full bg-orange-500 text-white text-sm font-medium py-2 rounded hover:bg-orange-600"
                            >
                              Start Preparing
                            </button>
                          )}
                          {order.orderStatus === 'PREPARING' && (
                            <button 
                              onClick={() => updateStatus(order._id, 'READY_FOR_PICKUP')}
                              className="w-full bg-green-500 text-white text-sm font-medium py-2 rounded hover:bg-green-600"
                            >
                              Mark Ready
                            </button>
                          )}
                          {order.orderStatus === 'READY_FOR_PICKUP' && order.orderType === 'DELIVERY' && (
                            <button 
                              onClick={() => updateStatus(order._id, 'RIDER_ASSIGNED')}
                              className="w-full bg-purple-500 text-white text-sm font-medium py-2 rounded hover:bg-purple-600"
                            >
                              Assign Rider
                            </button>
                          )}
                          {order.orderStatus === 'READY_FOR_PICKUP' && order.orderType === 'TAKEOUT' && (
                            <button 
                              onClick={() => updateStatus(order._id, 'DELIVERED')}
                              className="w-full bg-gray-800 text-white text-sm font-medium py-2 rounded hover:bg-gray-900"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ConfirmDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleReject}
        title="Reject Order"
        message="Are you sure you want to reject this order? The customer will be refunded if they paid online."
        confirmText="Reject Order"
        isDestructive={true}
      />
    </div>
  );
};
