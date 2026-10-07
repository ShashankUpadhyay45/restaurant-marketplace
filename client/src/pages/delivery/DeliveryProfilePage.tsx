import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Phone, Mail, FileText, Settings, ShieldAlert, LogOut, ChevronRight, CheckCircle, ShieldCheck
} from 'lucide-react';
import { deliveryService } from '../../services/deliveryService';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const DeliveryProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { showToast } = useToastStore();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const riderId = user?.id || 'rider_01';
        const data = await deliveryService.getRiderProfile(riderId);
        setProfile(data);
      } catch (error) {
        console.error('Failed to load profile', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [user?.id]);

  const handleActionClick = (actionName: string) => {
    showToast({ message: `${actionName} will be available soon`, type: 'info' });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    showToast({ message: 'Logged out successfully', type: 'success' });
  };

  const handleDeactivate = () => {
    setShowDeactivateDialog(false);
    showToast({ message: 'Account deactivation requested. Support will contact you.', type: 'info' });
  };

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse" />
          <div className="flex-1">
            <div className="h-6 w-1/3 bg-gray-200 rounded mb-2 animate-pulse" />
            <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6 pb-24">
      <h1 className="text-2xl font-bold">My Profile</h1>

      {/* Header Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 border-2 border-gray-200">
          {profile?.avatar ? (
            <img src={profile.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
          ) : (
            <User size={40} />
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">{profile?.name || 'Rider Name'}</h2>
          <div className="flex items-center gap-2 text-gray-500 mt-1 text-sm">
            <Phone size={14} />
            <span>{profile?.phone || '+91 98765 43210'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 mt-1 text-sm">
            <Mail size={14} />
            <span>rider@example.com</span>
          </div>
        </div>
        <button 
          onClick={() => handleActionClick('Edit Profile')}
          className="text-orange-500 text-sm font-medium hover:bg-orange-50 px-3 py-1.5 rounded-lg"
        >
          Edit
        </button>
      </div>

      {/* Vehicle Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <ShieldCheck size={18} className="text-green-500" />
            Vehicle Details
          </h3>
          <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
            {profile?.vehicleType || 'BIKE'}
          </span>
        </div>
        <div className="p-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Vehicle Number</p>
            <p className="font-medium">{profile?.vehicleNumber || 'MH 12 AB 3456'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">License Plate</p>
            <p className="font-medium">Verified <CheckCircle size={14} className="inline text-green-500" /></p>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <FileText size={18} className="text-gray-500" />
            Documents
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {[
            { name: 'Driving License', status: 'Verified' },
            { name: 'Aadhaar Card', status: 'Verified' },
            { name: 'Vehicle RC', status: 'Verified' },
            { name: 'Bank Account Details', status: 'Verified' },
          ].map((doc, idx) => (
            <div key={idx} className="p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer" onClick={() => handleActionClick(`View ${doc.name}`)}>
              <span className="text-sm font-medium text-gray-700">{doc.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">{doc.status}</span>
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Settings size={18} className="text-gray-500" />
            Settings & Support
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          <button 
            onClick={() => handleActionClick('Emergency Contact')}
            className="w-full p-4 flex justify-between items-center hover:bg-gray-50 text-left"
          >
            <span className="text-sm font-medium text-gray-700">Emergency Contact</span>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
          <button 
            onClick={() => handleActionClick('Help & Support')}
            className="w-full p-4 flex justify-between items-center hover:bg-gray-50 text-left"
          >
            <span className="text-sm font-medium text-gray-700">Help & Support</span>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
          <button 
            onClick={handleLogout}
            className="w-full p-4 flex justify-between items-center hover:bg-gray-50 text-left text-red-600"
          >
            <span className="text-sm font-medium flex items-center gap-2">
              <LogOut size={18} /> Logout
            </span>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="pt-4 flex justify-center">
        <button 
          onClick={() => setShowDeactivateDialog(true)}
          className="text-red-500 text-sm font-medium flex items-center gap-2 hover:underline"
        >
          <ShieldAlert size={16} /> Deactivate Account
        </button>
      </div>

      <ConfirmDialog
        isOpen={showDeactivateDialog}
        onClose={() => setShowDeactivateDialog(false)}
        onConfirm={handleDeactivate}
        title="Deactivate Account"
        message="Are you sure you want to deactivate your delivery account? You will no longer receive delivery requests."
        confirmText="Deactivate"
        isDestructive={true}
      />
    </div>
  );
};
