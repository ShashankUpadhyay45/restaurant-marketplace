import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bike, DollarSign, Star, Power, Clock, 
  MapPin, CheckCircle, ChevronRight, Activity, Bell 
} from 'lucide-react';
import { deliveryService } from '../../services/deliveryService';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { EmptyState } from '../../components/common/EmptyState';

export const DeliveryDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showToast } = useToastStore();
  
  const [profile, setProfile] = useState<any>(null);
  const [activeDelivery, setActiveDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const riderId = user?.id || 'rider_01';
        const profileData = await deliveryService.getRiderProfile(riderId);
        setProfile(profileData);
        
        try {
          const active = await deliveryService.getActiveDelivery(riderId);
          setActiveDelivery(active ? active.order : null);
        } catch (e) {
          setActiveDelivery(null);
        }
      } catch (error) {
        showToast({ message: 'Failed to load dashboard data', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user?.id, showToast]);

  const toggleStatus = async () => {
    try {
      if (profile) {
        const newStatus = !profile.isOnline;
        await deliveryService.updateOnlineStatus(profile._id, newStatus);
        setProfile({ ...profile, isOnline: newStatus });
        showToast({ message: `You are now ${newStatus ? 'online' : 'offline'}`, type: 'success' });
      }
    } catch (error) {
      showToast({ message: 'Failed to update status', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Hello, {profile?.name || 'Rider'}!</h1>
          <p className="text-gray-500">Ready for today's deliveries?</p>
        </div>
        <button
          onClick={toggleStatus}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
            profile?.isOnline 
              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Power size={18} />
          {profile?.isOnline ? 'Online' : 'Offline'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <DollarSign size={18} className="text-emerald-500" />
            <span className="text-sm font-medium">Earnings</span>
          </div>
          <p className="text-2xl font-bold">₹{profile?.earningsToday || 850}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Bike size={18} className="text-blue-500" />
            <span className="text-sm font-medium">Trips</span>
          </div>
          <p className="text-2xl font-bold">{profile?.tripsToday || 12}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Star size={18} className="text-amber-500" />
            <span className="text-sm font-medium">Rating</span>
          </div>
          <p className="text-2xl font-bold">{profile?.rating || 4.8}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Clock size={18} className="text-purple-500" />
            <span className="text-sm font-medium">Online Hours</span>
          </div>
          <p className="text-2xl font-bold">4.5h</p>
        </div>
      </div>

      {activeDelivery ? (
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
          <div className="bg-orange-50 px-4 py-3 border-b border-orange-100 flex justify-between items-center">
            <div className="flex items-center gap-2 text-orange-600 font-medium">
              <Activity size={18} />
              Active Delivery
            </div>
            <span className="text-sm font-medium text-orange-700 bg-orange-100 px-2 py-1 rounded">
              {(activeDelivery.orderStatus || 'ACTIVE').replace(/_/g, ' ')}
            </span>
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">{activeDelivery.restaurantName || (typeof activeDelivery.restaurantId === 'string' ? activeDelivery.restaurantId : activeDelivery.restaurantId?.name) || 'Restaurant'}</h3>
                <p className="text-gray-500 text-sm">Order #{activeDelivery._id?.slice(0, 8)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">₹{activeDelivery.deliveryFee + (activeDelivery.tip || 0) || 45}</p>
                <p className="text-sm text-gray-500">Payout</p>
              </div>
            </div>
            
            <div className="relative pl-6 pb-4 border-l-2 border-dashed border-gray-200 ml-2 space-y-4">
              <div className="relative">
                <div className="absolute -left-8 bg-blue-100 text-blue-600 p-1 rounded-full">
                  <MapPin size={16} />
                </div>
                <p className="font-medium text-sm">Pickup</p>
                <p className="text-sm text-gray-500 truncate">{activeDelivery.restaurantName || 'Restaurant Kitchen'}</p>
              </div>
              
              <div className="relative">
                <div className="absolute -left-8 bg-green-100 text-green-600 p-1 rounded-full">
                  <CheckCircle size={16} />
                </div>
                <p className="font-medium text-sm">Drop-off</p>
                <p className="text-sm text-gray-500 truncate">{activeDelivery.deliveryAddress?.addressLine1 || activeDelivery.deliveryAddress?.street || 'Customer Address'}</p>
              </div>
            </div>

            <button 
              onClick={() => navigate('/delivery/active')}
              className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
            >
              View Details <ChevronRight size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
            <Bell size={24} className="text-gray-500" />
          </div>
          <h3 className="font-medium text-gray-900 mb-1">No Active Delivery</h3>
          <p className="text-sm text-gray-500 mb-4">You don't have any ongoing orders right now.</p>
          <button 
            onClick={() => navigate('/delivery/requests')}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Find Orders
          </button>
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y">
          {[
            { id: 1, type: 'delivery', amount: 55, time: '10:30 AM', title: 'Delivered to John D.' },
            { id: 2, type: 'delivery', amount: 42, time: '09:15 AM', title: 'Delivered to Sarah M.' },
            { id: 3, type: 'tip', amount: 20, time: '09:15 AM', title: 'Tip received' },
            { id: 4, type: 'delivery', amount: 65, time: '08:45 AM', title: 'Delivered to Mike R.' },
            { id: 5, type: 'status', time: '08:00 AM', title: 'Went online' },
          ].map(activity => (
            <div key={activity.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  activity.type === 'delivery' ? 'bg-blue-50 text-blue-600' :
                  activity.type === 'tip' ? 'bg-green-50 text-green-600' :
                  'bg-gray-50 text-gray-600'
                }`}>
                  {activity.type === 'delivery' && <CheckCircle size={16} />}
                  {activity.type === 'tip' && <DollarSign size={16} />}
                  {activity.type === 'status' && <Power size={16} />}
                </div>
                <div>
                  <p className="font-medium text-sm">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
              {activity.amount && (
                <span className="font-semibold text-sm text-gray-900">+₹{activity.amount}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
