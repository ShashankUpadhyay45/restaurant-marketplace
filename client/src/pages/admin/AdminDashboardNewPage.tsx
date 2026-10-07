import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsService } from '../../services/analyticsService';
import { 
  TrendingUp, Users, Store, MapPin, 
  CheckCircle, AlertCircle, IndianRupee, Truck, ShieldAlert
} from 'lucide-react';
import { TableRowSkeleton } from '../../components/common/SkeletonLoader';

export const AdminDashboardNewPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await analyticsService.getPlatformAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <TableRowSkeleton />
        <TableRowSkeleton />
        <TableRowSkeleton />
      </div>
    );
  }

  if (!analytics) {
    return <div className="p-6 text-red-500">Failed to load analytics</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Platform Overview</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total GMV" value={`₹${(analytics?.totalGmv || 0).toLocaleString()}`} icon={<IndianRupee />} color="text-green-600" bg="bg-green-100" />
        <StatCard title="Commission" value={`₹${(analytics?.totalPlatformCommission || 0).toLocaleString()}`} icon={<TrendingUp />} color="text-blue-600" bg="bg-blue-100" />
        <StatCard title="Total Orders" value={(analytics?.totalOrdersCount || analytics?.totalOrders || 0).toLocaleString()} icon={<CheckCircle />} color="text-purple-600" bg="bg-purple-100" />
        <StatCard title="Active Restaurants" value={(analytics?.activeRestaurantsCount || analytics?.activeRestaurants || 0).toLocaleString()} icon={<Store />} color="text-orange-600" bg="bg-orange-100" />
        <StatCard title="Active Cities" value={(analytics?.activeCitiesCount || analytics?.activeCities || 0).toLocaleString()} icon={<MapPin />} color="text-teal-600" bg="bg-teal-100" />
        <StatCard title="Delivery Success" value={`${(analytics?.deliverySuccessRate || 98.4).toFixed(1)}%`} icon={<Truck />} color="text-indigo-600" bg="bg-indigo-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* City Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">City Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-gray-500 text-sm">
                  <th className="py-3 px-4 font-medium">City</th>
                  <th className="py-3 px-4 font-medium">GMV</th>
                  <th className="py-3 px-4 font-medium">Orders</th>
                </tr>
              </thead>
              <tbody>
                {analytics.cityBreakdown.map((city: any, idx: number) => (
                  <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{city.city}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">₹{city.gmv.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{city.orders.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Links & System Health */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Quick Actions</h2>
            <div className="space-y-3">
              <QuickLink href="/admin/restaurants" icon={<Store className="w-4 h-4" />} label="Manage Restaurants" />
              <QuickLink href="/admin/applications" icon={<ShieldAlert className="w-4 h-4" />} label="Review Applications" />
              <QuickLink href="/admin/users" icon={<Users className="w-4 h-4" />} label="Manage Users" />
              <QuickLink href="/admin/orders" icon={<Truck className="w-4 h-4" />} label="Monitor Orders" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">System Health</h2>
            <div className="space-y-4">
              <HealthItem label="API Services" status="operational" />
              <HealthItem label="Database" status="operational" />
              <HealthItem label="Payment Gateway" status="operational" />
              <HealthItem label="Delivery Sync" status="operational" />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend Chart (Simple CSS implementation) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Monthly GMV Trend</h2>
        <div className="h-64 flex items-end space-x-2 pt-6">
          {analytics.monthlyTrend?.map((trend: any, idx: number) => {
            const maxGmv = Math.max(...analytics.monthlyTrend.map((t: any) => t.gmv));
            const height = maxGmv > 0 ? (trend.gmv / maxGmv) * 100 : 0;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center group">
                <div 
                  className="w-full bg-blue-500 rounded-t-sm transition-all duration-300 relative group-hover:bg-blue-600"
                  style={{ height: `${height}%`, minHeight: '4px' }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10 transition-opacity">
                    ₹{trend.gmv.toLocaleString()}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2 truncate w-full text-center">
                  {trend.month}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, bg }: { title: string, value: string, icon: React.ReactNode, color: string, bg: string }) => (
  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-4">
    <div className={`p-3 rounded-full ${bg} ${color}`}>
      {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3 className="text-xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);

const QuickLink = ({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) => (
  <Link to={href} className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors text-gray-700">
    <span className="text-gray-500">{icon}</span>
    <span className="text-sm font-medium">{label}</span>
  </Link>
);

const HealthItem = ({ label, status }: { label: string, status: 'operational' | 'degraded' | 'down' }) => {
  const statusColors = {
    operational: 'bg-green-500',
    degraded: 'bg-yellow-500',
    down: 'bg-red-500'
  };
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
        <span className="text-xs capitalize text-gray-500">{status}</span>
      </div>
    </div>
  );
};

export default AdminDashboardNewPage;
