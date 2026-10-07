import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Clock, DollarSign, Package, Check, X, SlidersHorizontal, Map 
} from 'lucide-react';
import { deliveryService } from '../../services/deliveryService';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { EmptyState } from '../../components/common/EmptyState';

export const DeliveryRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showToast } = useToastStore();
  
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(5);
  const [showFilters, setShowFilters] = useState(false);
  
  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await deliveryService.getRequests(radius);
      setRequests(data);
    } catch (error) {
      showToast({ message: 'Failed to load requests', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, [radius]);

  const handleAccept = async (id: string) => {
    try {
      const riderId = user?.id || 'rider_01';
      await deliveryService.acceptRequest(id, riderId);
      showToast({ message: 'Order accepted successfully', type: 'success' });
      navigate('/delivery/active');
    } catch (error: any) {
      showToast({ message: error.message || 'Failed to accept order', type: 'error' });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await deliveryService.rejectRequest(id);
      showToast({ message: 'Order rejected', type: 'info' });
      setRequests(prev => prev.filter(req => req._id !== id));
    } catch (error) {
      showToast({ message: 'Failed to reject order', type: 'error' });
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4 pb-24">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Delivery Requests</h1>
          <p className="text-sm text-gray-500">Finding orders near you</p>
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-lg border ${showFilters ? 'bg-orange-50 border-orange-200 text-orange-600' : 'border-gray-200 text-gray-600'}`}
        >
          <SlidersHorizontal size={20} />
        </button>
      </div>

      {showFilters && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
          <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
            <Map size={16} /> Search Radius: {radius} km
          </div>
          <input 
            type="range" 
            min="1" 
            max="15" 
            value={radius} 
            onChange={(e) => setRadius(parseInt(e.target.value))}
            className="w-full accent-orange-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1 km</span>
            <span>15 km</span>
          </div>
        </div>
      )}

      {loading && requests.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{request.restaurantName}</h3>
                    <p className="text-xs text-gray-500">Order #{request._id.slice(0, 8)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-green-600">₹{request.estimatedPayout}</p>
                    <p className="text-xs text-gray-500">Est. Payout</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-3 mb-4 text-sm bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{request.pickupDistance} km to pickup</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{request.deliveryDistance} km to drop</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={16} className="text-gray-400" />
                    <span>~{request.estimatedTime} mins</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Package size={16} className="text-gray-400" />
                    <span>{request.itemsCount || 2} items</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => handleReject(request._id)}
                    className="flex-1 py-3 rounded-lg font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                  >
                    <X size={18} /> Reject
                  </button>
                  <button 
                    onClick={() => handleAccept(request._id)}
                    className="flex-[2] py-3 rounded-lg font-medium bg-orange-500 text-white hover:bg-orange-600 flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <Check size={18} /> Accept Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={MapPin}
          title="No delivery requests nearby"
          description="Expand your search radius or wait for new orders. We automatically refresh every 30 seconds."
          actionText="Refresh Now"
          onAction={loadRequests}
        />
      )}
    </div>
  );
};
