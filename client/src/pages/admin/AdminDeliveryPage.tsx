import React, { useEffect, useState } from 'react';
import { getMockDatabase } from '../../data/mockData';
import { DeliveryPartner } from '../../types';
import { useToastStore } from '../../store/useToastStore';
import { Bike, Navigation, Map } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';

export const AdminDeliveryPage: React.FC = () => {
  const [riders, setRiders] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { showToast } = useToastStore();

  useEffect(() => {
    const db = getMockDatabase();
    setRiders(db.riders || []);
    setLoading(false);
  }, []);

  const filteredRiders = riders.filter(r => statusFilter === 'ALL' || r.status === statusFilter);

  const handleSuspend = (id: string) => {
    setRiders(riders.map(r => r._id === id ? { ...r, status: 'OFFLINE' } : r));
    showToast({ message: 'Rider suspended and forced offline', type: 'success' });
  };

  const stats = {
    total: riders.length,
    online: riders.filter(r => r.status === 'AVAILABLE').length,
    onTrip: riders.filter(r => r.status === 'ON_TRIP').length,
    offline: riders.filter(r => r.status === 'OFFLINE').length,
  };

  if (loading) return <div className="p-6">Loading delivery fleet...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Delivery Fleet</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Riders" value={stats.total} icon={<Bike className="w-5 h-5 text-gray-500" />} />
        <StatCard title="Available" value={stats.online} icon={<Navigation className="w-5 h-5 text-green-500" />} />
        <StatCard title="On Delivery" value={stats.onTrip} icon={<Map className="w-5 h-5 text-blue-500" />} />
        <StatCard title="Offline" value={stats.offline} icon={<Bike className="w-5 h-5 text-red-500" />} />
      </div>

      <div className="flex bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <select
          className="border rounded-md px-4 py-2 w-full md:w-64"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="ON_DELIVERY">On Delivery</option>
          <option value="OFFLINE">Offline</option>
        </select>
      </div>

      {filteredRiders.length === 0 ? (
        <EmptyState icon={Bike} title="No riders found" description="No riders match the current filter." />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-500 text-sm">
                <th className="py-3 px-4 font-medium">Rider Info</th>
                <th className="py-3 px-4 font-medium">Vehicle</th>
                <th className="py-3 px-4 font-medium">Rating</th>
                <th className="py-3 px-4 font-medium">Total Trips</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRiders.map(rider => (
                <tr key={rider._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{rider.name}</div>
                    <div className="text-xs text-gray-500">{rider.phone}</div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 uppercase">{rider.vehicleType}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{(rider.rating ?? 5.0).toFixed(1)} ★</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{rider.totalTrips}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${rider.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : rider.status === 'ON_TRIP' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {rider.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button 
                      onClick={() => handleSuspend(rider._id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Suspend
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold mt-1 text-gray-900">{value}</p>
    </div>
    <div className="p-2 bg-gray-50 rounded-full">{icon}</div>
  </div>
);

export default AdminDeliveryPage;
