import React, { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, CreditCard, XCircle, ChevronDown } from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { useToastStore } from '../../store/useToastStore';
import { EmptyState } from '../../components/common/EmptyState';

type Period = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

export const OwnerAnalyticsPage: React.FC = () => {
  const [period, setPeriod] = useState<Period>('MONTH');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToastStore();

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await analyticsService.getOwnerAnalytics('rest_dehradun_01', period);
      setData(result);
    } catch (error) {
      showToast({ message: 'Failed to load analytics', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 w-1/4 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
          </div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!data) return <EmptyState icon={TrendingUp} title="No data available" description="Could not load analytics." />;

  const maxRevenue = Math.max(...data.revenueChart.map((d: any) => d.value), 1);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Track your restaurant's performance</p>
        </div>
        <div className="mt-4 sm:mt-0 relative inline-block text-left">
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md shadow-sm border appearance-none bg-white"
          >
            <option value="DAY">Today</option>
            <option value="WEEK">This Week</option>
            <option value="MONTH">This Month</option>
            <option value="YEAR">This Year</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center text-gray-500 mb-2">
            <CreditCard className="w-5 h-5 mr-2 text-green-500" />
            <span className="text-sm font-medium">Total Revenue</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">₹{data.revenue.toLocaleString()}</div>
          <div className="text-xs text-green-600 mt-1 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" /> +12.5% vs last period
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center text-gray-500 mb-2">
            <ShoppingBag className="w-5 h-5 mr-2 text-blue-500" />
            <span className="text-sm font-medium">Total Orders</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{data.ordersCount}</div>
          <div className="text-xs text-green-600 mt-1 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" /> +5.2% vs last period
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center text-gray-500 mb-2">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
            <span className="text-sm font-medium">Avg Order Value</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">₹{data.averageOrderValue.toFixed(0)}</div>
          <div className="text-xs text-gray-500 mt-1">per order</div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center text-gray-500 mb-2">
            <XCircle className="w-5 h-5 mr-2 text-red-500" />
            <span className="text-sm font-medium">Cancellation Rate</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{(data.cancellationRate * 100).toFixed(1)}%</div>
          <div className="text-xs text-gray-500 mt-1">of total orders</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Revenue Trend</h2>
        <div className="h-64 flex items-end space-x-2 sm:space-x-4">
          {data.revenueChart.map((point: any, idx: number) => {
            const heightPct = (point.value / maxRevenue) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center group relative">
                <div 
                  className="w-full bg-orange-200 hover:bg-orange-400 rounded-t-sm transition-all duration-300 relative"
                  style={{ height: `${Math.max(heightPct, 2)}%` }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10 transition-opacity">
                    ₹{point.value}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2 truncate w-full text-center">
                  {point.label.slice(0, 3)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Dishes */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Item</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3 rounded-tr-lg">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.topDishes.map((dish: any, idx: number) => (
                  <tr key={dish.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 flex items-center">
                      <span className="w-5 text-gray-400 mr-2">{idx + 1}.</span>
                      {dish.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{dish.category}</td>
                    <td className="px-4 py-3">{dish.orderCount}</td>
                    <td className="px-4 py-3 font-medium">₹{dish.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Peak Hours</h2>
          <div className="space-y-4">
            {Object.entries(data.peakHours || {}).map(([hour, count]: [string, any]) => (
              <div key={hour}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{hour}</span>
                  <span className="font-medium">{count} orders</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${Math.min((count / 50) * 100, 100)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
