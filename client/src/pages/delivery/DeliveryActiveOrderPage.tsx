import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Navigation2, Phone, CheckCircle, Package, ArrowLeft 
} from 'lucide-react';
import { deliveryService } from '../../services/deliveryService';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { EmptyState } from '../../components/common/EmptyState';

export const DeliveryActiveOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showToast } = useToastStore();
  
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState('');

  const loadActiveOrder = async () => {
    setLoading(true);
    try {
      const riderId = user?.id || 'rider_01';
      const res = await deliveryService.getActiveDelivery(riderId);
      setActiveOrder(res ? res.order : null);
    } catch (error) {
      setActiveOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveOrder();
  }, []);

  const handleAction = async () => {
    if (!activeOrder) return;
    
    try {
      if (activeOrder.orderStatus === 'RIDER_ASSIGNED') {
        await deliveryService.arrivedAtRestaurant(activeOrder._id);
        showToast({ message: 'Marked as arrived at restaurant', type: 'success' });
      } else if (activeOrder.orderStatus === 'PREPARING' || activeOrder.orderStatus === 'READY_FOR_PICKUP') {
        await deliveryService.confirmPickup(activeOrder._id);
        showToast({ message: 'Order picked up successfully', type: 'success' });
      } else if (activeOrder.orderStatus === 'OUT_FOR_DELIVERY') {
        await deliveryService.arrivedAtCustomer(activeOrder._id);
        showToast({ message: 'Marked as arrived at destination', type: 'success' });
      }
      
      loadActiveOrder();
    } catch (error) {
      showToast({ message: 'Failed to update status', type: 'error' });
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      showToast({ message: 'Please enter a valid OTP', type: 'warning' });
      return;
    }
    
    try {
      const riderId = user?.id || 'rider_01';
      await deliveryService.verifyDeliveryOtp(activeOrder._id, otp, riderId);
      showToast({ message: 'Delivery completed successfully!', type: 'success' });
      navigate('/delivery');
    } catch (error: any) {
      showToast({ message: error.message || 'Invalid OTP', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="h-40 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!activeOrder) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <EmptyState
          icon={Package}
          title="No Active Delivery"
          description="You don't have any ongoing deliveries at the moment."
          actionText="Find Orders"
          onAction={() => navigate('/delivery/requests')}
        />
      </div>
    );
  }

  const steps = [
    { status: 'RIDER_ASSIGNED', label: 'To Restaurant' },
    { status: 'READY_FOR_PICKUP', label: 'Pickup' },
    { status: 'OUT_FOR_DELIVERY', label: 'To Customer' },
    { status: 'ARRIVED_CUSTOMER', label: 'Complete' }
  ];

  let currentStepIndex = steps.findIndex(s => s.status === activeOrder.orderStatus);
  if (currentStepIndex === -1) {
    if (activeOrder.orderStatus === 'PREPARING') currentStepIndex = 1;
    else currentStepIndex = 0; // Default fallback
  }
  
  if (activeOrder.orderStatus === 'ARRIVED_CUSTOMER') currentStepIndex = 3;

  return (
    <div className="pb-24">
      {/* Map placeholder */}
      <div className="h-48 bg-gray-200 w-full relative flex items-center justify-center">
        <MapPin size={48} className="text-gray-400" />
        <button 
          onClick={() => navigate('/delivery')}
          className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-md text-gray-700"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-10 space-y-4">
        {/* Progress Card */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
          <div className="flex justify-between mb-2">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center relative z-10">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1
                  ${idx < currentStepIndex ? 'bg-green-500 text-white' : 
                    idx === currentStepIndex ? 'bg-orange-500 text-white ring-2 ring-orange-200' : 
                    'bg-gray-200 text-gray-500'}`}
                >
                  {idx < currentStepIndex ? <CheckCircle size={14} /> : idx + 1}
                </div>
                <span className="text-[10px] text-center font-medium text-gray-500 w-16">{step.label}</span>
              </div>
            ))}
            {/* Progress line */}
            <div className="absolute top-[1.35rem] left-10 right-10 h-0.5 bg-gray-200 -z-0">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-lg font-bold mb-4">Current Task</h2>
          
          {activeOrder.orderStatus === 'ARRIVED_CUSTOMER' ? (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">Ask the customer for the 4-digit PIN to complete the delivery.</p>
              <div className="flex gap-3">
                <input 
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={4}
                  className="flex-1 p-3 border border-gray-300 rounded-lg text-center text-xl tracking-widest font-bold"
                />
              </div>
              <button 
                onClick={handleVerifyOtp}
                className="w-full py-4 bg-green-500 text-white rounded-lg font-bold text-lg hover:bg-green-600 transition-colors"
              >
                Verify & Complete Order
              </button>
            </div>
          ) : (
            <button 
              onClick={handleAction}
              className="w-full py-4 bg-orange-500 text-white rounded-lg font-bold text-lg hover:bg-orange-600 transition-colors"
            >
              {activeOrder.orderStatus === 'RIDER_ASSIGNED' && 'Arrived at Restaurant'}
              {(activeOrder.orderStatus === 'PREPARING' || activeOrder.orderStatus === 'READY_FOR_PICKUP') && 'Confirm Pickup'}
              {activeOrder.orderStatus === 'OUT_FOR_DELIVERY' && 'Arrived at Customer'}
            </button>
          )}
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Order Details</h3>
            <p className="text-sm text-gray-500">ID: {activeOrder._id}</p>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-orange-100 p-2 rounded-full text-orange-600 mt-1">
                <Package size={20} />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{activeOrder.restaurantName || 'Restaurant'}</p>
                <p className="text-sm text-gray-500">{activeOrder.pickupAddress || '123 Main St, City'}</p>
                <button className="text-orange-500 text-sm font-medium mt-1 flex items-center gap-1">
                  <Navigation2 size={14} /> Navigate
                </button>
              </div>
            </div>
            
            <div className="h-px bg-gray-100 w-full ml-12" />
            
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-full text-green-600 mt-1">
                <MapPin size={20} />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{activeOrder.customerName || 'Customer'}</p>
                <p className="text-sm text-gray-500">
                  {typeof activeOrder.deliveryAddress === 'string'
                    ? activeOrder.deliveryAddress
                    : activeOrder.deliveryAddress
                    ? `${activeOrder.deliveryAddress.street || ''}, ${activeOrder.deliveryAddress.city || ''}`
                    : '456 Oak Ave, City'}
                </p>
                <div className="flex gap-4 mt-2">
                  <button className="text-orange-500 text-sm font-medium flex items-center gap-1">
                    <Navigation2 size={14} /> Navigate
                  </button>
                  <button className="text-blue-500 text-sm font-medium flex items-center gap-1">
                    <Phone size={14} /> Call
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
