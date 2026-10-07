import React, { useState, useEffect } from 'react';
import { User, MapPin, Settings, Star, Bell, LogOut, Edit, Trash2, Shield, Phone, Mail, Award, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { orderService } from '../../services/orderService';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const showToast = useToastStore((state) => state.showToast);
  
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Preferences State
  const [isPureVeg, setIsPureVeg] = useState(false);
  const [smsNotif, setSmsNotif] = useState(true);
  const [waNotif, setWaNotif] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        // Mock fetching order count
        const orders = await orderService.getOrders({ customerId: user.id });
        setOrderCount(orders.length);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-500">Please log in to view your profile.</p>
      </div>
    );
  }

  // Mock data for display purposes
  const loyaltyPoints = 1250;
  const membershipTier = 'GOLD';
  const joinDate = new Date('2023-01-15').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const mockAddresses = [
    { id: '1', type: 'Home', address: '123 Tech Park, Phase 1, Bangalore' },
    { id: '2', type: 'Work', address: 'Block C, Cyber City, Bangalore' }
  ];

  const getTierColor = (tier: string) => {
    switch(tier) {
      case 'GOLD': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SILVER': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'BRONZE': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const handleEditProfile = () => {
    showToast({ message: 'Profile editing will be available after backend integration', type: 'info' });
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(false);
    showToast({ message: 'Account deletion request submitted', type: 'success' });
    // In real app, call API to delete account and then logout
    // logout();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-32 bg-gray-200 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-gray-200 rounded-xl col-span-1"></div>
          <div className="h-64 bg-gray-200 rounded-xl col-span-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold uppercase shrink-0">
          {((user as any).name || 'U').charAt(0)}
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{(user as any).name}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTierColor(membershipTier)}`}>
              <Award className="w-3 h-3 mr-1" />
              {membershipTier} MEMBER
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center md:items-start gap-4 text-sm text-gray-500 mb-4">
            <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {user.email}</span>
            {user.phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {user.phone}</span>}
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Joined {joinDate}</span>
          </div>

          <button onClick={handleEditProfile} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Edit className="w-4 h-4" /> Edit Profile
          </button>
        </div>

        <div className="flex flex-row md:flex-col gap-4 w-full md:w-auto">
          <div className="flex-1 md:w-48 bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
            <p className="text-sm text-gray-500 font-medium mb-1">Loyalty Points</p>
            <p className="text-2xl font-bold text-blue-600">{loyaltyPoints}</p>
          </div>
          <div className="flex-1 md:w-48 bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
            <p className="text-sm text-gray-500 font-medium mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{orderCount}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Navigation/Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 font-medium text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-500" /> Account Settings
            </div>
            <div className="p-2">
              <button onClick={() => showToast({ message: 'Change password coming soon', type: 'info' })} className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                <Shield className="w-5 h-5 text-gray-400" /> Change Password
              </button>
              <button onClick={() => setShowDeleteConfirm(true)} className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 rounded-md">
                <Trash2 className="w-5 h-5 text-red-500" /> Delete Account
              </button>
              <button onClick={() => logout()} className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md border-t border-gray-100 mt-2">
                <LogOut className="w-5 h-5 text-gray-400" /> Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Saved Addresses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-500" /> Saved Addresses
              </h2>
              <button onClick={() => showToast({ message: 'Address management coming soon', type: 'info' })} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                + Add New
              </button>
            </div>
            <div className="space-y-4">
              {mockAddresses.map((addr) => (
                <div key={addr.id} className="flex items-start justify-between p-4 border border-gray-100 rounded-lg hover:border-blue-100 hover:bg-blue-50/50 transition-colors">
                  <div>
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded mb-2">
                      {addr.type}
                    </span>
                    <p className="text-sm text-gray-700">{addr.address}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => showToast({ message: 'Edit address clicked', type: 'info' })} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => showToast({ message: 'Delete address clicked', type: 'info' })} className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
              <Bell className="w-5 h-5 text-gray-500" /> Preferences
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Pure Veg Only</h4>
                  <p className="text-sm text-gray-500">Only show vegetarian restaurants and items</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={isPureVeg} onChange={(e) => setIsPureVeg(e.target.checked)} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                  <p className="text-sm text-gray-500">Receive order updates via SMS</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={smsNotif} onChange={(e) => setSmsNotif(e.target.checked)} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">WhatsApp Notifications</h4>
                  <p className="text-sm text-gray-500">Receive promotional offers on WhatsApp</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={waNotif} onChange={(e) => setWaNotif(e.target.checked)} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone and you will lose all your order history and loyalty points."
        confirmText="Delete My Account"
        isDestructive={true}
      />
    </div>
  );
};
