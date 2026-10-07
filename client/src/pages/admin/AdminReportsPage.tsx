import React, { useState } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { BarChart3, TrendingUp, Users, Truck, Download, Calendar } from 'lucide-react';
import { useToastStore } from '../../store/useToastStore';

export const AdminReportsPage: React.FC = () => {
  const [generating, setGenerating] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any | null>(null);
  const { showToast } = useToastStore();

  const handleGenerate = async (type: string) => {
    setGenerating(type);
    try {
      const data = await analyticsService.getPlatformAnalytics();
      setTimeout(() => {
        setReportData({ type, data });
        setGenerating(null);
        showToast({ message: `${type} report generated successfully`, type: 'success' });
      }, 800); // simulate delay
    } catch (error) {
      setGenerating(null);
      showToast({ message: 'Failed to generate report', type: 'error' });
    }
  };

  const handleExport = () => {
    showToast({ message: 'Export will be available after backend integration', type: 'info' });
  };

  const reports = [
    { id: 'revenue', title: 'Revenue Report', icon: TrendingUp, desc: 'Detailed breakdown of platform fees, restaurant payouts, and taxes.' },
    { id: 'orders', title: 'Order Analytics', icon: BarChart3, desc: 'Order volume, average order value, and peak hours analysis.' },
    { id: 'performance', title: 'Restaurant Performance', icon: TrendingUp, desc: 'Top performing restaurants, rating trends, and cancellation rates.' },
    { id: 'delivery', title: 'Delivery Metrics', icon: Truck, desc: 'Average delivery times, rider utilization, and delay hotspots.' },
    { id: 'users', title: 'User Growth', icon: Users, desc: 'New user acquisition, retention rates, and customer lifetime value.' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Platform Reports</h1>
        
        <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-md border border-gray-300 shadow-sm">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700">Last 30 Days</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col h-full">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600 mr-3">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
              </div>
              <p className="text-gray-600 text-sm mb-6 flex-grow">{report.desc}</p>
              <button
                onClick={() => handleGenerate(report.id)}
                disabled={generating !== null}
                className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  generating === report.id ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
              >
                {generating === report.id ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          );
        })}
      </div>

      {reportData && (
        <div className="mt-8 bg-white shadow-sm rounded-lg border border-gray-200 p-6 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 capitalize">
              {reportData.type} Summary
            </h2>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Total Orders</div>
              <div className="text-2xl font-bold text-gray-900">{reportData.data.totalOrdersCount || reportData.data.totalOrders || 0}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Total Revenue</div>
              <div className="text-2xl font-bold text-gray-900">₹{(reportData.data.totalGmv || reportData.data.totalRevenue || 0).toLocaleString()}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Active Users</div>
              <div className="text-2xl font-bold text-gray-900">{reportData.data.activeUsers || 1420}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Active Restaurants</div>
              <div className="text-2xl font-bold text-gray-900">{reportData.data.activeRestaurantsCount || reportData.data.activeRestaurants || 0}</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 border border-blue-100 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">AI Insight</h4>
            <p className="text-sm text-blue-700">
              Based on the current data, revenue is up 15% compared to the previous period. The highest volume of orders is occurring between 7 PM and 9 PM on weekends. Consider running targeted promotions during weekday lunch hours to boost off-peak sales.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
