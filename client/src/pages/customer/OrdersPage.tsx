import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { getClientSocket } from '../../services/socket';
import { Order, OrderStatus } from '../../types';
import { 
  Package, 
  CheckCircle2, 
  Clock, 
  Bike, 
  CookingPot, 
  AlertCircle, 
  ChevronRight,
  ShieldCheck,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import { NotificationConfirmationModal } from '../../components/notifications/NotificationConfirmationModal';

export const OrdersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const highlightedOrderId = searchParams.get('orderId');

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);

  const STAGES: OrderStatus[] = [
    'PLACED',
    'CONFIRMED',
    'PREPARING',
    'READY_FOR_PICKUP',
    'OUT_FOR_DELIVERY',
    'DELIVERED'
  ];

  const getStageIndex = (status: OrderStatus) => {
    return STAGES.indexOf(status);
  };

  const getStageIcon = (stage: OrderStatus) => {
    switch (stage) {
      case 'PLACED': return <Package className="w-4 h-4" />;
      case 'CONFIRMED': return <CheckCircle2 className="w-4 h-4" />;
      case 'PREPARING': return <CookingPot className="w-4 h-4" />;
      case 'READY_FOR_PICKUP': return <Clock className="w-4 h-4" />;
      case 'OUT_FOR_DELIVERY': return <Bike className="w-4 h-4" />;
      case 'DELIVERED': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    async function loadOrders() {
      setIsLoading(true);
      try {
        const res = await api.get('/orders/my-orders');
        const list = res.orders || [];
        setOrders(list);

        if (highlightedOrderId) {
          const match = list.find((o: Order) => o._id === highlightedOrderId);
          if (match) setSelectedOrder(match);
        } else if (list.length > 0) {
          setSelectedOrder(list[0]);
        }
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();
  }, [highlightedOrderId]);

  // Socket.IO real-time order status subscription
  useEffect(() => {
    const socket = getClientSocket();

    if (selectedOrder) {
      socket.emit('join:order', selectedOrder._id);
    }

    const handleStatusUpdate = (data: { orderId: string; orderStatus: OrderStatus }) => {
      setOrders(prev => prev.map(o => o._id === data.orderId ? { ...o, orderStatus: data.orderStatus } : o));
      if (selectedOrder?._id === data.orderId) {
        setSelectedOrder(prev => prev ? { ...prev, orderStatus: data.orderStatus } : null);
      }
    };

    socket.on('order:status_update', handleStatusUpdate);

    return () => {
      socket.off('order:status_update', handleStatusUpdate);
    };
  }, [selectedOrder]);

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order? An instant refund will be processed.')) return;
    try {
      const res = await api.post(`/orders/${orderId}/cancel`, { reason: 'Customer requested cancellation' });
      if (res.success) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: 'CANCELLED' } : o));
        if (selectedOrder?._id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, orderStatus: 'CANCELLED' } : null);
        }
      }
    } catch (err: any) {
      alert(err.message || 'Could not cancel order.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
      
      <div className="mb-8">
        <span className="text-[11px] font-bold uppercase tracking-widest text-brand-600">Fulfillment Center</span>
        <h1 className="font-display text-3xl font-bold text-stone-900 mt-1">Live Order Tracking</h1>
        <p className="text-xs text-stone-500 mt-1">Real-time status synced directly with the restaurant kitchen</p>
      </div>

      {isLoading ? (
        <div className="h-64 bg-stone-100 rounded-3xl animate-pulse" />
      ) : orders.length === 0 ? (
        <div className="max-w-md mx-auto my-12 p-8 text-center bg-white rounded-3xl border border-stone-200 space-y-4">
          <Package className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-display text-lg font-bold text-stone-900">No active or past orders found</h3>
          <p className="text-xs text-stone-500">Order handcrafted meals from top local culinary destinations.</p>
          <Link to="/" className="inline-block px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold">
            Browse Restaurants
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Order History List */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 px-1">Order History</h3>
            <div className="space-y-3">
              {orders.map(order => {
                const restName = typeof order.restaurantId === 'object' ? order.restaurantId.name : 'Restaurant';
                const isSelected = selectedOrder?._id === order._id;
                return (
                  <div
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-brand-600 bg-white shadow-md ring-1 ring-brand-500/20'
                        : 'border-stone-200/80 bg-white/70 hover:bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-900">#{order.orderNumber}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        order.orderStatus === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                        order.orderStatus === 'CANCELLED' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800 animate-pulse'
                      }`}>
                        {order.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-stone-700 mt-1">{restName}</p>
                    <div className="flex items-center justify-between text-[11px] text-stone-400 mt-2">
                      <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="font-bold text-stone-900">₹{order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Live Status & Breakdown */}
          {selectedOrder && (
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-sm space-y-8">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Active Tracker</span>
                    <span className="text-xs text-stone-400">•</span>
                    <span className="text-xs font-mono font-bold text-stone-700">#{selectedOrder.orderNumber}</span>
                  </div>
                  <h2 className="font-display text-2xl font-bold text-stone-900 mt-1">
                    {typeof selectedOrder.restaurantId === 'object' ? selectedOrder.restaurantId.name : 'Restaurant'}
                  </h2>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-stone-400 block uppercase font-bold">Estimated Arrival</span>
                  <span className="font-display text-lg font-bold text-emerald-600">30–45 mins</span>
                </div>
              </div>

              {/* WhatsApp & SMS Confirmation Dispatched Banner */}
              <div className="p-4 bg-emerald-50/90 border border-emerald-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-emerald-950">WhatsApp & SMS Confirmation Dispatched</h4>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                        DELIVERED
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Dispatched to <strong>{selectedOrder.customerPhone || '+91 98765 43210'}</strong> with live order tracking & ₹ itemized receipt.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowNotificationModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-xs shrink-0"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>View Message</span>
                </button>
              </div>

              {/* Progress Timeline Bar */}
              {selectedOrder.orderStatus !== 'CANCELLED' ? (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">Preparation & Dispatch Journey</h4>
                  <div className="grid grid-cols-6 gap-2">
                    {STAGES.map((stage, idx) => {
                      const currentIdx = getStageIndex(selectedOrder.orderStatus);
                      const isComplete = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div key={stage} className="flex flex-col items-center text-center space-y-2">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                            isCurrent ? 'bg-brand-600 text-white ring-4 ring-brand-100 scale-110 shadow-md' :
                            isComplete ? 'bg-emerald-600 text-white' :
                            'bg-stone-100 text-stone-400'
                          }`}>
                            {getStageIcon(stage)}
                          </div>
                          <span className={`text-[10px] leading-tight font-medium ${
                            isCurrent ? 'font-bold text-brand-600' :
                            isComplete ? 'text-stone-800' :
                            'text-stone-400'
                          }`}>
                            {stage.replace(/_/g, ' ')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-800 text-xs">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <strong>Order Cancelled</strong>
                    <p className="text-[11px] text-rose-600">Refund has been processed and returned to your original payment method.</p>
                  </div>
                </div>
              )}

              {/* Itemized Order Content */}
              <div className="space-y-3 pt-4 border-t border-stone-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">Ordered Selections</h4>
                <div className="divide-y divide-stone-100">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-stone-900">{item.quantity}x {item.name}</span>
                        {item.variant && <span className="text-brand-600 text-[11px] ml-2">({item.variant})</span>}
                      </div>
                      <span className="font-bold text-stone-800">₹{item.totalPrice.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Food Subtotal</span>
                  <span className="font-semibold text-stone-900">₹{selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-stone-900">₹{selectedOrder.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Eco Packaging</span>
                  <span className="font-semibold text-stone-900">₹{selectedOrder.packagingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span className="font-semibold text-stone-900">₹{selectedOrder.platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes (GST)</span>
                  <span className="font-semibold text-stone-900">₹{selectedOrder.gstAmount.toFixed(2)}</span>
                </div>
                {selectedOrder.tip > 0 && (
                  <div className="flex justify-between">
                    <span>Driver Tip</span>
                    <span className="font-semibold text-stone-900">₹{selectedOrder.tip.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-sm text-stone-900">
                  <span>Total Paid</span>
                  <span className="text-brand-600 font-display text-lg">₹{selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              {['PLACED', 'CONFIRMED'].includes(selectedOrder.orderStatus) && (
                <div className="pt-2">
                  <button
                    onClick={() => handleCancelOrder(selectedOrder._id)}
                    className="w-full py-2.5 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors"
                  >
                    Cancel Order & Initiate Refund
                  </button>
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* WhatsApp & SMS Confirmation Modal */}
      <NotificationConfirmationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        defaultType="ORDER_CONFIRMATION"
        data={selectedOrder ? {
          type: 'ORDER_CONFIRMATION',
          normalizedPhone: selectedOrder.customerPhone || '+919876543210',
          orderNumber: selectedOrder.orderNumber,
          restaurantName: typeof selectedOrder.restaurantId === 'object' ? selectedOrder.restaurantId.name : 'Restaurant'
        } : null}
      />

    </div>
  );
};
