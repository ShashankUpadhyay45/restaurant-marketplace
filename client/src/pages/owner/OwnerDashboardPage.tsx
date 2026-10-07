import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { getClientSocket } from '../../services/socket';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  BarChart3, 
  CookingPot, 
  CalendarDays, 
  BookOpen, 
  Bot, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Sparkles, 
  Send,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Volume2
} from 'lucide-react';

export const OwnerDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'reservations' | 'menu' | 'ai'>('overview');

  // State
  const [metricsData, setMetricsData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiConversation, setAiConversation] = useState<Array<{ role: 'user' | 'assistant'; content: any }>>([
    {
      role: 'assistant',
      content: {
        summary: "Hello Chef! I am your GourmetFleet Operations Copilot. I analyze your kitchen's real sales, table occupancy, and dish popularity. Ask me about peak staffing hours, margin optimizations, or promotional ideas.",
        citedPeriod: "Connected to live restaurant database"
      }
    }
  ]);

  // Load Initial Metrics
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [mRes, oRes, rRes, menuRes] = await Promise.all([
        api.get('/owner/metrics'),
        api.get('/owner/orders'),
        api.get('/owner/reservations'),
        api.get('/owner/menu')
      ]);
      setMetricsData(mRes);
      setOrders(oRes.orders || []);
      setReservations(rRes.reservations || []);
      setMenuItems(menuRes.items || []);
    } catch (err) {
      console.error('Failed to load owner data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Real-time Socket.IO room subscription for kitchen display
  useEffect(() => {
    if (!user?.restaurantId) return;

    const socket = getClientSocket();
    socket.emit('join:restaurant', user.restaurantId);

    const handleNewOrder = (data: any) => {
      // Play subtle chime sound
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {});
      } catch {}

      // Refresh orders
      api.get('/owner/orders').then(res => setOrders(res.orders || []));
      api.get('/owner/metrics').then(res => setMetricsData(res));
    };

    const handleNewReservation = () => {
      api.get('/owner/reservations').then(res => setReservations(res.reservations || []));
    };

    socket.on('order:new', handleNewOrder);
    socket.on('reservation:new', handleNewReservation);

    return () => {
      socket.off('order:new', handleNewOrder);
      socket.off('reservation:new', handleNewReservation);
    };
  }, [user]);

  // Order status transition
  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    try {
      await api.patch(`/owner/orders/${orderId}/status`, { status: nextStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: nextStatus } : o));
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  // Reservation status transition
  const handleUpdateReservationStatus = async (resId: string, status: string) => {
    try {
      await api.patch(`/owner/reservations/${resId}/status`, { status });
      setReservations(prev => prev.map(r => r._id === resId ? { ...r, status } : r));
    } catch (err: any) {
      alert(err.message || 'Failed to update reservation');
    }
  };

  // Toggle item stock
  const handleToggleStock = async (itemId: string) => {
    try {
      const res = await api.patch(`/owner/menu/${itemId}/toggle-stock`);
      setMenuItems(prev => prev.map(m => m._id === itemId ? { ...m, isAvailable: res.item.isAvailable } : m));
    } catch (err: any) {
      alert(err.message || 'Failed to update item stock');
    }
  };

  // AI Assistant Query
  const handleSendAiPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || isAiLoading) return;

    const queryText = aiPrompt.trim();
    setAiPrompt('');
    setAiConversation(prev => [...prev, { role: 'user', content: queryText }]);
    setIsAiLoading(true);

    try {
      const res = await api.post('/owner/ai/query', { query: queryText });
      if (res.success) {
        setAiConversation(prev => [...prev, { role: 'assistant', content: res.aiResponse }]);
      }
    } catch (err: any) {
      setAiConversation(prev => [
        ...prev,
        {
          role: 'assistant',
          content: {
            summary: "I encountered an error querying your restaurant's analytics. Please try again.",
            citedPeriod: "Error"
          }
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 space-y-8">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-brand-600">Restaurateur Portal</span>
            <span className="text-stone-300">•</span>
            <span className="text-xs text-stone-500 font-semibold">{metricsData?.restaurant?.name || 'My Kitchen'}</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-stone-900 mt-1">Kitchen & Floor Operations</h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-stone-100 rounded-2xl overflow-x-auto text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-all ${
              activeTab === 'overview' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-all ${
              activeTab === 'orders' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <CookingPot className="w-4 h-4 text-brand-600" />
            <span>Kitchen Display ({orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.orderStatus)).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reservations')}
            className={`px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-all ${
              activeTab === 'reservations' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <CalendarDays className="w-4 h-4 text-blue-600" />
            <span>Reservations</span>
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-all ${
              activeTab === 'menu' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>Stock & Menu</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-all ${
              activeTab === 'ai' ? 'bg-brand-600 text-white shadow-sm' : 'text-brand-700 hover:bg-brand-50'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AI Copilot</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-2">
              <span className="text-xs uppercase font-bold text-stone-500">Gross Sales Volume</span>
              <h3 className="font-display text-3xl font-bold text-stone-900">
                ₹{metricsData?.metrics?.grossSales?.toLocaleString('en-IN') || '0.00'}
              </h3>
              <p className="text-[11px] text-stone-400">Total processed through platform</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-stone-500">Net Restaurant Payout</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="font-display text-3xl font-bold text-emerald-700">
                ₹{metricsData?.metrics?.netPayout?.toLocaleString('en-IN') || '0.00'}
              </h3>
              <p className="text-[11px] text-stone-400">After capped {metricsData?.restaurant?.commissionRate || 10}% commission</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-2">
              <span className="text-xs uppercase font-bold text-stone-500">Average Order Value</span>
              <h3 className="font-display text-3xl font-bold text-stone-900">
                ₹{metricsData?.metrics?.aov?.toFixed(2) || '0.00'}
              </h3>
              <p className="text-[11px] text-stone-400">{metricsData?.metrics?.totalOrdersCount || 0} lifetime orders fulfilled</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-2">
              <span className="text-xs uppercase font-bold text-stone-500">Table Bookings & No-Shows</span>
              <h3 className="font-display text-3xl font-bold text-blue-700">
                {metricsData?.metrics?.totalReservationsCount || 0} <span className="text-sm font-normal text-stone-400">reservations</span>
              </h3>
              <p className="text-[11px] text-stone-400">No-show rate: <strong>{metricsData?.metrics?.noShowRate || '0%'}</strong></p>
            </div>
          </div>

          {/* Top Selling Dishes Table */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="font-display text-xl font-bold text-stone-900">Top Performing Dishes</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 uppercase text-[10px]">
                    <th className="pb-3 font-bold">Dish Name</th>
                    <th className="pb-3 font-bold">Units Fulfilled</th>
                    <th className="pb-3 font-bold">Gross Revenue Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {metricsData?.metrics?.topDishes?.map((dish: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-3 font-bold text-stone-900">{dish.name}</td>
                      <td className="py-3 font-semibold text-stone-700">{dish.count} orders</td>
                      <td className="py-3 font-bold text-emerald-700">₹{dish.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: LIVE KITCHEN DISPLAY (KANBAN) */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-bold text-stone-900 flex items-center space-x-2">
              <CookingPot className="w-5 h-5 text-brand-600" />
              <span>Live Order Management Board</span>
            </h3>
            <div className="flex items-center space-x-2 text-xs text-stone-500">
              <Volume2 className="w-4 h-4 text-brand-600 animate-pulse" />
              <span>Real-Time Kitchen Alerts Active</span>
            </div>
          </div>

          {/* Columnar Kanban */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Column 1: Incoming / Placed */}
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs font-bold text-amber-900">
                <span>1. Incoming Placed</span>
                <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-[10px]">
                  {orders.filter(o => o.orderStatus === 'PLACED').length}
                </span>
              </div>
              <div className="space-y-3">
                {orders.filter(o => o.orderStatus === 'PLACED').map(ord => (
                  <div key={ord._id} className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-sm space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-900">#{ord.orderNumber}</span>
                      <span className="text-[10px] text-stone-400">{new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-xs text-stone-700 space-y-1">
                      {ord.items.map((it: any, i: number) => (
                        <div key={i} className="flex justify-between">
                          <span>{it.quantity}x {it.name}</span>
                          <span className="font-bold">₹{it.totalPrice.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => handleUpdateOrderStatus(ord._id, 'CONFIRMED')}
                      className="w-full py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors"
                    >
                      Accept Order
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Cooking / Preparing */}
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-xs font-bold text-blue-900">
                <span>2. Cooking on Line</span>
                <span className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-[10px]">
                  {orders.filter(o => ['CONFIRMED', 'PREPARING'].includes(o.orderStatus)).length}
                </span>
              </div>
              <div className="space-y-3">
                {orders.filter(o => ['CONFIRMED', 'PREPARING'].includes(o.orderStatus)).map(ord => (
                  <div key={ord._id} className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-sm space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-900">#{ord.orderNumber}</span>
                      <span className="text-[10px] text-blue-600 font-bold uppercase">{ord.orderStatus}</span>
                    </div>
                    <div className="text-xs text-stone-700 space-y-1">
                      {ord.items.map((it: any, i: number) => (
                        <div key={i} className="flex justify-between">
                          <span>{it.quantity}x {it.name}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => handleUpdateOrderStatus(ord._id, 'READY_FOR_PICKUP')}
                      className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors"
                    >
                      Mark Boxed & Ready
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Out for Delivery / Ready */}
            <div className="space-y-3">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between text-xs font-bold text-purple-900">
                <span>3. Dispatched / In Transit</span>
                <span className="w-5 h-5 rounded-full bg-purple-200 flex items-center justify-center text-[10px]">
                  {orders.filter(o => ['READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'].includes(o.orderStatus)).length}
                </span>
              </div>
              <div className="space-y-3">
                {orders.filter(o => ['READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'].includes(o.orderStatus)).map(ord => (
                  <div key={ord._id} className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-sm space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-900">#{ord.orderNumber}</span>
                      <span className="text-[10px] text-purple-600 font-bold uppercase">{ord.orderStatus.replace(/_/g, ' ')}</span>
                    </div>
                    <button
                      onClick={() => handleUpdateOrderStatus(ord._id, 'DELIVERED')}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                    >
                      Confirm Delivered
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 4: Delivered Completed */}
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-900">
                <span>4. Completed Today</span>
                <span className="w-5 h-5 rounded-full bg-emerald-200 flex items-center justify-center text-[10px]">
                  {orders.filter(o => o.orderStatus === 'DELIVERED').length}
                </span>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {orders.filter(o => o.orderStatus === 'DELIVERED').map(ord => (
                  <div key={ord._id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-stone-800">#{ord.orderNumber}</span>
                      <span className="text-[10px] text-stone-400 block">{ord.items.length} items</span>
                    </div>
                    <span className="font-bold text-emerald-700">₹{ord.totalAmount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 3: RESERVATIONS & FLOOR STATUS */}
      {activeTab === 'reservations' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-bold text-stone-900">Dining Room Table Reservations</h3>
            <span className="text-xs text-stone-500">{reservations.length} total bookings on file</span>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-400 uppercase text-[10px]">
                    <th className="p-4 font-bold">Guest Name</th>
                    <th className="p-4 font-bold">Date & Time</th>
                    <th className="p-4 font-bold">Party Size</th>
                    <th className="p-4 font-bold">Table / Zone</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold">Host Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {reservations.map(res => (
                    <tr key={res._id} className="hover:bg-stone-50/50">
                      <td className="p-4 font-bold text-stone-900">
                        {res.customerId?.fullName || 'Guest'}
                        <span className="text-[10px] text-stone-400 block font-normal">{res.customerId?.phone}</span>
                      </td>
                      <td className="p-4 text-stone-700 font-medium">
                        {res.reservationDate} • {res.timeSlot}
                      </td>
                      <td className="p-4 font-bold text-stone-900">{res.guestCount} Guests</td>
                      <td className="p-4 text-stone-600">{res.tableId?.tableNumber || 'Assigned'} ({res.tableId?.zone || 'Indoor'})</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          res.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                          res.status === 'SEATED' ? 'bg-amber-100 text-amber-800' :
                          res.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-stone-100 text-stone-700'
                        }`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          {res.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleUpdateReservationStatus(res._id, 'SEATED')}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-bold"
                            >
                              Seat Guests
                            </button>
                          )}
                          {res.status === 'SEATED' && (
                            <button
                              onClick={() => handleUpdateReservationStatus(res._id, 'COMPLETED')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold"
                            >
                              Table Cleared
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MENU & STOCK CONTROLS */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl font-bold text-stone-900">Menu Catalog & Instant Stock Toggles</h3>
              <p className="text-xs text-stone-500">Toggle items out of stock instantly if ingredients are depleted during rush hours.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map(item => (
              <div key={item._id} className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{item.category}</span>
                    <button
                      onClick={() => handleToggleStock(item._id)}
                      className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                        item.isAvailable
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <span>{item.isAvailable ? 'IN STOCK' : 'OUT OF STOCK'}</span>
                    </button>
                  </div>
                  <h4 className="font-display text-base font-bold text-stone-900 mt-2">{item.name}</h4>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-1">{item.description}</p>
                </div>

                <div className="pt-4 border-t border-stone-100 mt-4 flex items-center justify-between">
                  <span className="font-display text-lg font-bold text-stone-900">₹{item.basePrice.toFixed(2)}</span>
                  <button
                    onClick={() => handleToggleStock(item._id)}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-800"
                  >
                    {item.isAvailable ? 'Mark Sold Out' : 'Restore Stock'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: OWNER AI BUSINESS COPILOT */}
      {activeTab === 'ai' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-6 flex flex-col justify-between min-h-[550px]">
            <div>
              <div className="flex items-center space-x-2 border-b border-stone-100 pb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-stone-900">GourmetFleet Operations AI Copilot</h3>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                    Tenant-Isolated Database Tools Active
                  </span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="space-y-4 pt-4 max-h-[380px] overflow-y-auto pr-2">
                {aiConversation.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xl p-4 rounded-2xl text-xs space-y-2.5 ${
                        msg.role === 'user'
                          ? 'bg-stone-900 text-white rounded-br-none'
                          : 'bg-stone-50 border border-stone-200/80 text-stone-800 rounded-bl-none'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <p>{msg.content}</p>
                      ) : (
                        <div>
                          <p className="leading-relaxed">{msg.content.summary}</p>
                          {msg.content.citedPeriod && (
                            <span className="text-[10px] text-stone-400 block pt-1 italic">
                              Citing: {msg.content.citedPeriod}
                            </span>
                          )}

                          {/* Render Structured AI Recommendations */}
                          {msg.content.recommendations?.map((rec: any, rIdx: number) => (
                            <div key={rIdx} className="mt-2.5 p-3 rounded-xl bg-white border border-stone-200 text-stone-800 space-y-1">
                              <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block">
                                {rec.category} Recommendation
                              </span>
                              <p className="font-bold text-stone-900">{rec.actionableProposal}</p>
                              <p className="text-[11px] text-emerald-700 font-medium">Impact: {rec.impactEstimation}</p>
                              {rec.requiresOwnerConfirmation && (
                                <button
                                  onClick={() => alert(`Confirmed! Changes queued: ${rec.actionableProposal}`)}
                                  className="mt-2 py-1 px-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg text-[10px] transition-colors"
                                >
                                  Confirm & Apply Suggestion
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isAiLoading && (
                  <div className="flex justify-start">
                    <div className="p-3 rounded-2xl bg-stone-100 text-stone-500 text-xs animate-pulse">
                      Analyzing authenticated restaurant database records...
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendAiPrompt} className="pt-4 border-t border-stone-100 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Ask about revenue trends, staffing for Friday rush, or menu pricing..."
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                disabled={isAiLoading || !aiPrompt.trim()}
                className="py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs disabled:opacity-50 transition-colors flex items-center space-x-1"
              >
                <span>Query</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Quick Prompts Panel */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm space-y-4">
            <h4 className="font-display text-sm font-bold text-stone-900">Suggested AI Inquiries</h4>
            <div className="space-y-2">
              {[
                "What were our top selling dishes and revenue this week?",
                "How can I optimize our average order value on delivery?",
                "Do we need extra staff during evening peak hours?",
                "Which menu item has the highest customer satisfaction?"
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => { setAiPrompt(suggestion); }}
                  className="w-full text-left p-3 rounded-xl border border-stone-200/80 hover:border-brand-500 hover:bg-brand-50/50 text-xs text-stone-700 transition-all block"
                >
                  "{suggestion}"
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
