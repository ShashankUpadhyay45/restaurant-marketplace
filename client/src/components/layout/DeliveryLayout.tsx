import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { deliveryService } from '../../services/deliveryService';
import { 
  Bike, 
  MapPin, 
  DollarSign, 
  Star, 
  User, 
  Layers, 
  Power, 
  Navigation, 
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';

interface DeliveryLayoutProps {
  children: React.ReactNode;
}

export const DeliveryLayout: React.FC<DeliveryLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [earningsToday, setEarningsToday] = useState<number>(780);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    async function loadStatus() {
      const profile = await deliveryService.getRiderProfile();
      setIsOnline(profile.isOnline);
      setEarningsToday(profile.earningsToday);
    }
    loadStatus();
  }, []);

  const handleToggleOnline = async () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    await deliveryService.updateOnlineStatus('rider_01', nextState);
  };

  const navItems = [
    { label: 'Rider Dashboard', path: '/delivery/dashboard', icon: Layers },
    { label: 'Nearby Requests', path: '/delivery/requests', icon: MapPin },
    { label: 'Active Delivery', path: '/delivery/active', icon: Navigation },
    { label: 'Earnings & Payouts', path: '/delivery/earnings', icon: DollarSign },
    { label: 'Ratings & Score', path: '/delivery/ratings', icon: Star },
    { label: 'Rider Profile', path: '/delivery/profile', icon: User }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* Top Header */}
      <header className="bg-stone-900 text-white border-b border-stone-800 sticky top-7 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm">Fleet Rider Ops</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
                  UK 07 AF 4821
                </span>
              </div>
              <p className="text-[11px] text-stone-400">Rajesh Kumar • Dehradun Zone</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Today's Earnings Pill */}
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-bold">
              <span>Today:</span>
              <span className="text-white">₹{earningsToday}</span>
            </div>

            {/* Online / Offline Toggle Button */}
            <button
              onClick={handleToggleOnline}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer ${
                isOnline 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-400 border border-stone-700'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-stone-500'}`} />
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-stone-800 text-stone-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Subnav */}
        <div className="hidden md:block bg-stone-950/80 border-t border-stone-800/60 px-4">
          <div className="max-w-7xl mx-auto flex items-center space-x-6 overflow-x-auto text-xs font-semibold py-2.5">
            {navItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1.5 pb-0.5 transition-colors whitespace-nowrap ${
                    active ? 'text-emerald-400 font-bold border-b-2 border-emerald-500' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-stone-950 border-t border-stone-800 p-4 space-y-2 animate-in slide-in-from-top-2">
            {navItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2.5 p-2.5 rounded-xl text-xs font-semibold ${
                    active ? 'bg-emerald-600 text-white' : 'text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
};
