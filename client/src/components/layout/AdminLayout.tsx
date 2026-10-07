import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  Store, 
  FileCheck, 
  Users, 
  ShoppingBag, 
  CalendarDays, 
  Bike, 
  Sparkles, 
  Star, 
  Tag, 
  CreditCard, 
  FileSpreadsheet, 
  FileLock2, 
  Menu, 
  X,
  LayoutDashboard
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const navItems = [
    { label: 'Platform Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Restaurants (100+)', path: '/admin/restaurants', icon: Store },
    { label: 'Merchant KYC Queue', path: '/admin/applications', icon: FileCheck, badge: '2 Pending' },
    { label: 'Users & Roles', path: '/admin/users', icon: Users },
    { label: 'Global Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Global Reservations', path: '/admin/reservations', icon: CalendarDays },
    { label: 'Delivery Fleet', path: '/admin/delivery', icon: Bike },
    { label: 'Culinary Events', path: '/admin/events', icon: Sparkles },
    { label: 'Review Moderation', path: '/admin/reviews', icon: Star },
    { label: 'Platform Promotions', path: '/admin/promotions', icon: Tag },
    { label: 'Payments & Refunds', path: '/admin/payments', icon: CreditCard },
    { label: 'Platform Reports', path: '/admin/reports', icon: FileSpreadsheet },
    { label: 'Security & Audit Logs', path: '/admin/audit', icon: FileLock2 }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-stone-900 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-purple-400" />
          <span className="font-bold text-sm">GourmetFleet Superadmin</span>
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
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white leading-tight">Superadmin HQ</h2>
              <p className="text-[11px] text-purple-300 font-medium">Pan-India Operations</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] bg-stone-800/80 px-2.5 py-1.5 rounded-lg border border-stone-700">
            <span className="text-stone-400">Total Cities:</span>
            <span className="text-purple-300 font-bold">5 Active</span>
          </div>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  active 
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' 
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

        <div className="p-4 border-t border-stone-800 text-[11px] text-stone-500">
          <p className="font-semibold text-stone-400">DPDP Act 2023 Compliant</p>
          <p>Role-Based Access Control</p>
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
