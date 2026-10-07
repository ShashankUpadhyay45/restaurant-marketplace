import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  LayoutDashboard, 
  ChefHat, 
  UtensilsCrossed, 
  CalendarDays, 
  Tag, 
  Sparkles, 
  Bike, 
  Star, 
  BarChart3, 
  Bot, 
  FileCheck2,
  ChevronRight,
  Menu,
  X,
  Store
} from 'lucide-react';

interface OwnerLayoutProps {
  children: React.ReactNode;
}

export const OwnerLayout: React.FC<OwnerLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const navItems = [
    { label: 'Overview Hub', path: '/owner/dashboard', icon: LayoutDashboard },
    { label: 'Kitchen KDS / Orders', path: '/owner/orders', icon: ChefHat },
    { label: 'Table Reservations', path: '/owner/reservations', icon: CalendarDays },
    { label: 'Menu Inventory', path: '/owner/menu', icon: UtensilsCrossed },
    { label: 'Promotions & Coupons', path: '/owner/promotions', icon: Tag },
    { label: 'Culinary Events', path: '/owner/events', icon: Sparkles },
    { label: 'Delivery & Riders', path: '/owner/delivery', icon: Bike },
    { label: 'Customer Reviews', path: '/owner/reviews', icon: Star },
    { label: 'Business Analytics', path: '/owner/analytics', icon: BarChart3 },
    { label: 'Owner AI Copilot', path: '/owner/ai-reports', icon: Bot, badge: 'AI' },
    { label: 'FSSAI & KYC Status', path: '/owner/application', icon: FileCheck2 }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-stone-900 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2">
          <Store className="w-5 h-5 text-amber-500" />
          <span className="font-bold text-sm">Restaurant Owner Ops</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:text-white"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop / Collapsible Sidebar */}
      <aside className={`
        ${sidebarOpen ? 'block' : 'hidden'} 
        md:block w-full md:w-64 bg-stone-900 text-stone-200 shrink-0 border-r border-stone-800 z-30
      `}>
        <div className="p-5 border-b border-stone-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-rose-600 flex items-center justify-center text-white shadow-md">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white leading-tight">Doon Bistro</h2>
              <p className="text-[11px] text-amber-400 font-medium">Rajpur Road • Dehradun</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] bg-stone-800/80 px-2.5 py-1.5 rounded-lg border border-stone-700">
            <span className="text-stone-400">Operating Mode:</span>
            <span className="text-emerald-400 font-bold">HYBRID</span>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active 
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20' 
                    : 'text-stone-400 hover:text-white hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-stone-800 text-[11px] text-stone-500">
          <p className="font-semibold text-stone-400">GourmetFleet Merchant</p>
          <p>FSSAI: 10022013000849</p>
          <p>Commission: 10% Ethical Tier</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-x-hidden min-h-screen">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
