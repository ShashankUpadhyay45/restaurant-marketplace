import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { useLocationStore } from '../../store/useLocationStore';
import { notificationService } from '../../services/notificationService';
import { socketBus } from '../../services/socket';
import { AppNotification } from '../../types';
import { LocationSelectorModal } from '../location/LocationSelectorModal';
import { NotificationConfirmationModal } from '../notifications/NotificationConfirmationModal';
import { 
  ShoppingBag, 
  User as UserIcon, 
  LogOut, 
  Award, 
  MapPin, 
  UtensilsCrossed,
  ChevronDown,
  MessageSquare,
  Search,
  Tag,
  Sparkles,
  Calendar,
  Heart,
  Bell,
  Clock,
  Menu,
  X
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { getTotalItemsCount, setDrawerOpen } = useCartStore();
  const { currentLocation, setModalOpen } = useLocationStore();
  const [notificationModalOpen, setNotificationModalOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const totalCartCount = getTotalItemsCount();

  useEffect(() => {
    async function loadNotifs() {
      const list = await notificationService.getNotifications(user?.role || 'customer');
      setNotifications(list);
      setUnreadCount(list.filter(n => !n.isRead).length);
    }
    loadNotifs();

    // Subscribe to new real-time notifications
    const unbind = socketBus.on('notification:new', (notif: AppNotification) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => unbind();
  }, [user]);

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead(user?.role || 'customer');
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <LocationSelectorModal />
      <NotificationConfirmationModal 
        isOpen={notificationModalOpen} 
        onClose={() => setNotificationModalOpen(false)} 
        defaultType="ORDER_CONFIRMATION"
      />

      <header className="sticky top-7 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-2xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Brand Logo & Dynamic Location Selector */}
            <div className="flex items-center space-x-4 lg:space-x-6">
              <Link to="/" className="flex items-center space-x-2.5 group">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-600 via-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-brand-600/20 group-hover:scale-105 transition-transform">
                  <UtensilsCrossed className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="font-display text-2xl font-bold tracking-tight text-stone-900 group-hover:text-brand-600 transition-colors">
                    Gourmet<span className="text-brand-600">Fleet</span>
                  </span>
                  <span className="block text-[10px] uppercase tracking-widest text-stone-400 font-semibold -mt-1">
                    India • Multi-City
                  </span>
                </div>
              </Link>

              {/* Dynamic Indian Location Selector Trigger */}
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="hidden md:flex items-center text-xs text-stone-700 bg-stone-100/90 hover:bg-stone-200/80 px-3.5 py-1.5 rounded-full border border-stone-200/70 hover:border-brand-300 transition-all cursor-pointer group shadow-2xs"
              >
                <MapPin className="w-3.5 h-3.5 text-brand-600 mr-1.5 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-stone-900 truncate max-w-[130px] lg:max-w-[180px]">
                  {currentLocation.displayText}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 ml-1.5 group-hover:text-brand-600 transition-colors" />
              </button>
            </div>

            {/* Desktop Center Navigation Links */}
            <nav className="hidden xl:flex items-center space-x-6 text-sm font-medium text-stone-600">
              <Link 
                to="/restaurants" 
                className={`hover:text-brand-600 transition-colors ${isActive('/restaurants') ? 'text-brand-600 font-bold' : ''}`}
              >
                Restaurants
              </Link>
              <Link 
                to="/search" 
                className={`flex items-center space-x-1 hover:text-brand-600 transition-colors ${isActive('/search') ? 'text-brand-600 font-bold' : ''}`}
              >
                <Search className="w-4 h-4 text-stone-400" />
                <span>Search</span>
              </Link>
              <Link 
                to="/offers" 
                className={`flex items-center space-x-1 hover:text-brand-600 transition-colors ${isActive('/offers') ? 'text-brand-600 font-bold' : ''}`}
              >
                <Tag className="w-4 h-4 text-rose-500" />
                <span>Offers</span>
              </Link>
              <Link 
                to="/specials" 
                className={`flex items-center space-x-1 hover:text-brand-600 transition-colors ${isActive('/specials') ? 'text-brand-600 font-bold' : ''}`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Specials</span>
              </Link>
              <Link 
                to="/events" 
                className={`flex items-center space-x-1 hover:text-brand-600 transition-colors ${isActive('/events') ? 'text-brand-600 font-bold' : ''}`}
              >
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>Events</span>
              </Link>
              <Link 
                to="/orders" 
                className={`hover:text-brand-600 transition-colors ${isActive('/orders') ? 'text-brand-600 font-bold' : ''}`}
              >
                Orders
              </Link>
              <Link 
                to="/reservations" 
                className={`hover:text-brand-600 transition-colors ${isActive('/reservations') ? 'text-brand-600 font-bold' : ''}`}
              >
                Dine-In
              </Link>
              <Link 
                to="/loyalty" 
                className={`flex items-center space-x-1 hover:text-amber-600 transition-colors ${isActive('/loyalty') ? 'text-amber-600 font-bold' : ''}`}
              >
                <Award className="w-4 h-4 text-amber-500" />
                <span>Club</span>
              </Link>
            </nav>

            {/* Right Action Icons & Controls */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              
              {/* WhatsApp & SMS Live Simulator Trigger */}
              <button
                type="button"
                onClick={() => setNotificationModalOpen(true)}
                title="Preview WhatsApp & SMS Order/Table Confirmation"
                className="hidden lg:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all cursor-pointer shadow-2xs group"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span>WhatsApp</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </button>

              {/* Notification Center Bell */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="p-2.5 rounded-xl text-stone-700 hover:text-brand-600 hover:bg-stone-100 transition-all relative cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-stone-200 p-4 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
                      <div className="flex items-center space-x-2">
                        <Bell className="w-4 h-4 text-brand-600" />
                        <span className="font-bold text-sm text-stone-900">Notifications</span>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-brand-600 hover:text-brand-700 font-semibold cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-stone-400 text-center py-6">No new notifications</p>
                      ) : (
                        notifications.slice(0, 5).map(n => (
                          <div 
                            key={n.id} 
                            className={`p-2.5 rounded-xl text-xs transition-colors ${
                              n.isRead ? 'bg-stone-50 text-stone-600' : 'bg-brand-50/50 border border-brand-100 text-stone-900 font-medium'
                            }`}
                          >
                            <div className="font-bold text-stone-900 mb-0.5">{n.title}</div>
                            <div className="text-stone-600 leading-snug">{n.message}</div>
                            <div className="flex items-center text-[10px] text-stone-400 mt-1">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Favorites Link */}
              <Link
                to="/favorites"
                title="Your Saved Favorites"
                className="hidden sm:inline-flex p-2.5 rounded-xl text-stone-700 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
              >
                <Heart className="w-5 h-5" />
              </Link>

              {/* Sticky Cart Drawer Button */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="relative p-2.5 rounded-xl text-stone-700 hover:text-brand-600 hover:bg-stone-100 transition-all cursor-pointer"
                aria-label="View Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                    {totalCartCount}
                  </span>
                )}
              </button>

              {/* User Profile or Sign In */}
              {user ? (
                <div className="flex items-center space-x-2 pl-2 border-l border-stone-200">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                      alt={user.fullName}
                      className="w-9 h-9 rounded-full object-cover border-2 border-brand-500/30"
                    />
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-bold text-stone-900 leading-tight">{user.fullName}</p>
                      <p className="text-[10px] text-amber-600 font-semibold">
                        {user.loyaltyPointsBalance} pts • {user.membershipTier}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={logout}
                    title="Log Out"
                    className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-brand-600 transition-colors shadow-sm"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              )}

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2.5 rounded-xl text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Flyout Navigation */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white border-b border-stone-200 px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-4">
            <button
              onClick={() => {
                setModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-800"
            >
              <div className="flex items-center space-x-2 truncate">
                <MapPin className="w-4 h-4 text-brand-600" />
                <span className="truncate">{currentLocation.displayText}</span>
              </div>
              <span className="text-brand-600 text-[11px] underline">Change</span>
            </button>

            <div className="grid grid-cols-2 gap-2 text-sm font-semibold">
              <Link 
                to="/restaurants" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 flex items-center space-x-2"
              >
                <UtensilsCrossed className="w-4 h-4 text-brand-600" />
                <span>Restaurants</span>
              </Link>
              <Link 
                to="/search" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 flex items-center space-x-2"
              >
                <Search className="w-4 h-4 text-brand-600" />
                <span>Search</span>
              </Link>
              <Link 
                to="/offers" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 flex items-center space-x-2"
              >
                <Tag className="w-4 h-4 text-rose-500" />
                <span>Offers</span>
              </Link>
              <Link 
                to="/specials" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Specials</span>
              </Link>
              <Link 
                to="/events" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 flex items-center space-x-2"
              >
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>Events</span>
              </Link>
              <Link 
                to="/orders" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 flex items-center space-x-2"
              >
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Orders</span>
              </Link>
              <Link 
                to="/reservations" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 flex items-center space-x-2"
              >
                <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                <span>Table Bookings</span>
              </Link>
              <Link 
                to="/loyalty" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 flex items-center space-x-2"
              >
                <Award className="w-4 h-4 text-amber-500" />
                <span>Rewards</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar (<640px) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-200 z-40 py-2 px-6 flex items-center justify-between text-stone-500 text-[10px] font-semibold shadow-lg">
        <Link 
          to="/" 
          className={`flex flex-col items-center space-y-1 ${isActive('/') ? 'text-brand-600 font-bold' : ''}`}
        >
          <UtensilsCrossed className="w-5 h-5" />
          <span>Discover</span>
        </Link>
        <Link 
          to="/search" 
          className={`flex flex-col items-center space-y-1 ${isActive('/search') ? 'text-brand-600 font-bold' : ''}`}
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </Link>
        <Link 
          to="/orders" 
          className={`flex flex-col items-center space-y-1 ${isActive('/orders') ? 'text-brand-600 font-bold' : ''}`}
        >
          <Clock className="w-5 h-5" />
          <span>Orders</span>
        </Link>
        <Link 
          to="/profile" 
          className={`flex flex-col items-center space-y-1 ${isActive('/profile') ? 'text-brand-600 font-bold' : ''}`}
        >
          <UserIcon className="w-5 h-5" />
          <span>Profile</span>
        </Link>
      </nav>
    </>
  );
};
