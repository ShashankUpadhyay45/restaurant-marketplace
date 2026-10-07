import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, Calendar, ChevronRight } from 'lucide-react';
import { deliveryService } from '../../services/deliveryService';
import { useAuthStore } from '../../store/useAuthStore';

export const DeliveryEarningsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [earningsData, setEarningsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEarnings = async () => {
      setLoading(true);
      try {
        const riderId = user?.id || 'rider_01';
        const data = await deliveryService.getEarnings(period.toUpperCase() as any);
        setEarningsData(data);
      } catch (error) {
        console.error('Failed to load earnings', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadEarnings();
  }, [period, user?.id]);

  // Mock chart data if backend data isn't structured correctly
  const chartData = [
    { label: 'Mon', amount: 450 },
    { label: 'Tue', amount: 320 },
    { label: 'Wed', amount: 550 },
    { label: 'Thu', amount: 480 },
    { label: 'Fri', amount: 720 },
    { label: 'Sat', amount: 890 },
    { label: 'Sun', amount: 650 },
  ];
  
  const maxAmount = Math.max(...chartData.map(d => d.amount));

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">Earnings</h1>
          <p className="text-gray-500">Track your performance and payouts</p>
        </div>
      </div>

      <div className="bg-white p-1 rounded-lg border border-gray-200 inline-flex w-full md:w-auto overflow-x-auto">
        {(['day', 'week', 'month', 'year'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-6 py-2 rounded-md text-sm font-medium capitalize flex-shrink-0 ${
              period === p ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            This {p}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 col-span-2 md:col-span-1">
              <p className="text-sm text-gray-500 mb-1">Total Earnings</p>
              <h2 className="text-3xl font-bold text-gray-900">₹{earningsData?.total || 4060}</h2>
              <div className="flex items-center gap-1 text-green-600 text-xs mt-2 font-medium">
                <TrendingUp size={14} /> +12% from last {period}
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Trips</p>
              <h2 className="text-2xl font-bold text-gray-900">{earningsData?.trips || 42}</h2>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Tips</p>
              <h2 className="text-2xl font-bold text-gray-900">₹{earningsData?.tips || 350}</h2>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Incentives</p>
              <h2 className="text-2xl font-bold text-gray-900">₹{earningsData?.incentives || 200}</h2>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Earnings Breakdown</h3>
              <BarChart3 size={20} className="text-gray-400" />
            </div>
            
            <div className="h-48 flex items-end justify-between gap-2">
              {chartData.map((d, i) => (
                <div key={i} className="flex flex-col items-center flex-1 group">
                  <div className="w-full relative flex justify-center">
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap transition-opacity pointer-events-none z-10">
                      ₹{d.amount}
                    </div>
                    {/* Bar */}
                    <div 
                      className="w-full max-w-[2rem] bg-orange-200 hover:bg-orange-400 rounded-t-sm transition-colors"
                      style={{ height: `${(d.amount / maxAmount) * 100}%`, minHeight: '4px' }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 mt-2">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold">Payout History</h3>
            </div>
            <div className="p-8 text-center text-gray-500">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar size={24} className="text-gray-400" />
              </div>
              <p className="font-medium text-gray-900">No Recent Payouts</p>
              <p className="text-sm">Bank payouts will appear here after backend integration</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
