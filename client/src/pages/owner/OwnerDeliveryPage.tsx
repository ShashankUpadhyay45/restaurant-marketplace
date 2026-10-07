import React, { useState, useEffect } from 'react';
import { Bike, Clock, MapPin, CheckCircle, Search, Star } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { Order, DeliveryPartner } from '../../types';
import { getMockDatabase } from '../../data/mockData';
import { useToastStore } from '../../store/useToastStore';
import { EmptyState } from '../../components/common/EmptyState';

export const OwnerDeliveryPage: React.FC = () => {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [availableRiders, setAvailableRiders] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToastStore();
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      // Get orders waiting for rider or in delivery
      const orders = await orderService.getOrders({ restaurantId: 'rest_dehradun_01' });
      const deliveryStates = ['READY_FOR_PICKUP', 'RIDER_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'];
      setActiveOrders(orders.filter(o => deliveryStates.includes(o.orderStatus)));

      // Mock getting available riders
      const db = getMockDatabase();
      const riders = (db.riders || []).filter(r => r.status === 'AVAILABLE');
      setAvailableRiders(riders);
    } catch (error) {
      showToast({ message: 'Failed to load delivery data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleAssignRider = async (orderId: string, riderId: string) => {
    try {
      await orderService.assignRider(orderId);
      showToast({ message: 'Rider assigned successfully', type: 'success' });
      setAssigningOrderId(null);
      loadData();
    } catch (error) {
      showToast({ message: 'Failed to assign rider', type: 'error' });
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Delivery Management</h1>
        <p className="text-gray-500 text-sm mt-1">Track active deliveries and assign riders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="bg-orange-100 p-3 rounded-full mr-4 text-orange-600">
            <Bike className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Active Deliveries</p>
            <p className="text-2xl font-bold text-gray-900">
              {activeOrders.filter(o => ['PICKED_UP', 'OUT_FOR_DELIVERY'].includes(o.orderStatus)).length}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="bg-blue-100 p-3 rounded-full mr-4 text-blue-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Avg Delivery Time</p>
            <p className="text-2xl font-bold text-gray-900">32 min</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="bg-green-100 p-3 rounded-full mr-4 text-green-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Success Rate</p>
            <p className="text-2xl font-bold text-gray-900">98.5%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Orders requiring attention */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Orders Ready for Pickup</h2>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2].map(i => <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>)}
            </div>
          ) : activeOrders.filter(o => o.orderStatus === 'READY_FOR_PICKUP').length > 0 ? (
            <div className="space-y-4">
              {activeOrders.filter(o => o.orderStatus === 'READY_FOR_PICKUP').map(order => (
                <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-gray-900">#{order._id.slice(-6)}</span>
                    <span className="text-orange-600 font-medium text-sm">Waiting for Rider</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{order.items.length} items • ₹{order.totalAmount}</p>
                  
                  {assigningOrderId === order._id ? (
                    <div className="bg-gray-50 p-3 rounded-lg border mt-2">
                      <p className="text-xs font-medium text-gray-500 mb-2 uppercase">Select a rider to assign</p>
                      {availableRiders.length > 0 ? (
                        <div className="space-y-2">
                          {availableRiders.map(rider => (
                            <div key={rider._id} className="flex justify-between items-center bg-white p-2 rounded border text-sm">
                              <div>
                                <p className="font-medium">{rider.name}</p>
                                <div className="flex items-center text-xs text-gray-500">
                                  <Star className="w-3 h-3 text-yellow-400 mr-1" />
                                  {rider.rating} • {rider.vehicleType}
                                </div>
                              </div>
                              <button 
                                onClick={() => handleAssignRider(order._id, rider._id)}
                                className="bg-orange-100 text-orange-700 px-3 py-1 rounded hover:bg-orange-200 font-medium text-xs"
                              >
                                Assign
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No riders currently available</p>
                      )}
                      <button 
                        onClick={() => setAssigningOrderId(null)}
                        className="mt-3 text-sm text-gray-500 underline"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAssigningOrderId(order._id)}
                      className="w-full bg-orange-50 text-orange-600 py-2 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors"
                    >
                      Assign Rider Manually
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">No orders waiting for pickup</p>
          )}
        </div>

        {/* On the way orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">In Transit</h2>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2].map(i => <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>)}
            </div>
          ) : activeOrders.filter(o => ['RIDER_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(o.orderStatus)).length > 0 ? (
            <div className="space-y-4">
              {activeOrders.filter(o => ['RIDER_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(o.orderStatus)).map(order => (
                <div key={order._id} className="border border-gray-200 rounded-lg p-4 flex items-center">
                  <div className="bg-blue-50 p-3 rounded-full mr-4 text-blue-600">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-900">#{order._id.slice(-6)}</span>
                      <span className="text-blue-600 font-medium text-xs bg-blue-50 px-2 py-1 rounded">
                        {order.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      To Customer
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">No orders currently in transit</p>
          )}
        </div>
      </div>
    </div>
  );
};
