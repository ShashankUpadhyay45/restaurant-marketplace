import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { UserRole } from '../../types';
import { Users, UtensilsCrossed, Bike, ShieldCheck } from 'lucide-react';

export const RoleSwitcherBanner: React.FC = () => {
  const { user, switchDemoRole } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleRoleSelect = (role: UserRole) => {
    switchDemoRole(role);
    if (role === 'customer') {
      if (!location.pathname.startsWith('/restaurant') && !location.pathname.startsWith('/search') && !location.pathname.startsWith('/offers')) {
        navigate('/');
      }
    } else if (role === 'restaurant_owner') {
      navigate('/owner/dashboard');
    } else if (role === 'delivery_partner') {
      navigate('/delivery/dashboard');
    } else if (role === 'admin') {
      navigate('/admin/dashboard');
    }
  };

  const currentRole = user?.role || 'customer';

  return (
    <div className="bg-stone-900 text-stone-200 border-b border-stone-800 text-xs py-1.5 px-4 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            DEMO MODE
          </span>
          <span className="hidden sm:inline text-stone-400 font-medium">Switch Active Role Ecosystem:</span>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto pb-0.5">
          {/* Customer */}
          <button
            onClick={() => handleRoleSelect('customer')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              currentRole === 'customer'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Customer</span>
          </button>

          {/* Restaurant Owner */}
          <button
            onClick={() => handleRoleSelect('restaurant_owner')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              currentRole === 'restaurant_owner'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Owner</span>
          </button>

          {/* Delivery Partner */}
          <button
            onClick={() => handleRoleSelect('delivery_partner')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              currentRole === 'delivery_partner'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Delivery</span>
          </button>

          {/* Admin */}
          <button
            onClick={() => handleRoleSelect('admin')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              currentRole === 'admin'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
};
