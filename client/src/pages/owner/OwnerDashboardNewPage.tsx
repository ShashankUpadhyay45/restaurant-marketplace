import React, { useEffect, useState } from 'react';
import { 
  BarChart, Activity, DollarSign, ShoppingBag, Users, Clock, ArrowRight,
  UtensilsCrossed, Star, FileText
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { orderService } from '../../services/orderService';
import { Order, OwnerAIReport } from '../../types';

export const OwnerDashboardNewPage: React.FC = () => {
  const [period, setPeriod] = useState<'DAY' | 'WEEK' | 'MONTH' | 'YEAR'>('DAY');
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const RESTAURANT_ID = 'rest_dehradun_01';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const analyticsData = await analyticsService.getOwnerAnalytics(RESTAURANT_ID, period);
        setAnalytics(analyticsData);
        
        const ordersData = await orderService.getOrders({ restaurantId: RESTAURANT_ID });
        // Take last 5 orders, sorting by time (assuming placedAt exists)
        const sortedOrders = [...ordersData].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, 5);
        
        setRecentOrders(sortedOrders);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [period]);

  if (loading) {
    return <div className="p-8 text-center"><Activity className="w-8 h-8 animate-spin mx-auto text-blue-500" /></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {(['DAY', 'WEEK', 'MONTH', 'YEAR'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                period === p ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Revenue</p>
            <p className="text-2xl font-bold text-gray-900">₹{analytics?.revenue || 0}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Orders</p>
            <p className="text-2xl font-bold text-gray-900">{analytics?.ordersCount || 0}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Avg Order Value</p>
            <p className="text-2xl font-bold text-gray-900">
              ₹{analytics?.ordersCount ? Math.round(analytics.revenue / analytics.ordersCount) : 0}
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Tables</p>
            <p className="text-2xl font-bold text-gray-900">{analytics?.activeTables || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart Placeholder */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <BarChart className="w-5 h-5 mr-2 text-gray-500" />
            Revenue Overview
          </h2>
          <div className="h-64 flex items-end justify-between gap-2 px-2">
            {/* Simple bar visualization */}
            {analytics?.revenueChartData?.map((item: any, idx: number) => {
              const maxVal = Math.max(...(analytics.revenueChartData.map((d: any) => d.value) || [1]));
              const heightPct = Math.max((item.value / maxVal) * 100, 5);
              return (
                <div key={idx} className="flex flex-col items-center flex-1 group">
                  <div className="w-full relative bg-blue-100 rounded-t-md hover:bg-blue-200 transition-colors" style={{ height: `${heightPct}%` }}>
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                      ₹{item.value}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2 truncate max-w-full">{item.label}</span>
                </div>
              );
            }) || (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No chart data available
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a href="/owner/orders" className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center text-gray-700">
                <UtensilsCrossed className="w-5 h-5 mr-3 text-blue-500" />
                <span className="font-medium">View KDS</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </a>
            <a href="/owner/menu" className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center text-gray-700">
                <ShoppingBag className="w-5 h-5 mr-3 text-green-500" />
                <span className="font-medium">Manage Menu</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </a>
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center text-gray-700">
                <Star className="w-5 h-5 mr-3 text-yellow-500" />
                <span className="font-medium">Check Reviews</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center text-gray-700">
                <FileText className="w-5 h-5 mr-3 text-purple-500" />
                <span className="font-medium">AI Report</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Orders & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <a href="/owner/orders" className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</a>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-sm font-medium text-gray-500">Order ID</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Customer</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Items</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Status</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.length > 0 ? recentOrders.map(order => (
                  <tr key={order._id}>
                    <td className="py-4 text-sm font-medium text-gray-900">#{order._id.slice(-6).toUpperCase()}</td>
                    <td className="py-4 text-sm text-gray-600">{order.customerName || 'Guest'}</td>
                    <td className="py-4 text-sm text-gray-600">{order.items.length} items</td>
                    <td className="py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {order.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 text-sm font-medium text-gray-900">₹{order.totalAmount}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500 text-sm">
                      No recent orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-gray-500" />
            Today's Timeline
          </h2>
          <div className="space-y-6">
            {recentOrders.length > 0 ? recentOrders.slice(0, 4).map((order, i) => (
              <div key={order._id} className="flex relative">
                {i !== recentOrders.slice(0, 4).length - 1 && (
                  <div className="absolute top-8 left-2.5 w-0.5 h-12 bg-gray-200" />
                )}
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 mt-1" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">New Order #{order._id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-500 text-center">No activity today</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
