import React, { useEffect, useState } from 'react';
import { reservationService } from '../../services/reservationService';
import { Reservation } from '../../types';
import { useToastStore } from '../../store/useToastStore';
import { Calendar, Users, Clock } from 'lucide-react';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';

export const AdminReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const [confirmCancel, setConfirmCancel] = useState<{isOpen: boolean, resId: string}>({isOpen: false, resId: ''});
  const { showToast } = useToastStore();

  useEffect(() => {
    const fetchRes = async () => {
      try {
        const data = await reservationService.getReservations({});
        setReservations(data);
      } catch (err) {
        showToast({ message: 'Failed to load reservations', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchRes();
  }, [showToast]);

  const filtered = reservations.filter(r => statusFilter === 'ALL' || r.status === statusFilter);

  const handleCancel = async () => {
    try {
      await reservationService.cancelReservation(confirmCancel.resId);
      setReservations(reservations.map(r => r._id === confirmCancel.resId ? { ...r, status: 'CANCELLED' } : r));
      showToast({ message: 'Reservation cancelled', type: 'success' });
    } catch (err) {
      showToast({ message: 'Error cancelling', type: 'error' });
    } finally {
      setConfirmCancel({ isOpen: false, resId: '' });
    }
  };

  const stats = {
    total: reservations.length,
    confirmed: reservations.filter(r => r.status === 'CONFIRMED').length,
    cancelled: reservations.filter(r => r.status === 'CANCELLED').length,
    completed: reservations.filter(r => r.status === 'COMPLETED').length,
  };

  if (loading) return <div className="p-6">Loading reservations...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Manage Reservations</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total" value={stats.total} icon={<Calendar className="w-5 h-5" />} />
        <StatCard title="Confirmed" value={stats.confirmed} icon={<Users className="w-5 h-5 text-blue-500" />} />
        <StatCard title="Completed" value={stats.completed} icon={<Clock className="w-5 h-5 text-green-500" />} />
        <StatCard title="Cancelled" value={stats.cancelled} icon={<Clock className="w-5 h-5 text-red-500" />} />
      </div>

      <div className="flex bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <select
          className="border rounded-md px-4 py-2 w-full md:w-64"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="NO_SHOW">No Show</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Calendar} title="No reservations" description="No matching reservations found" />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-500 text-sm">
                <th className="py-3 px-4 font-medium">Guest / Res ID</th>
                <th className="py-3 px-4 font-medium">Restaurant</th>
                <th className="py-3 px-4 font-medium">Date & Time</th>
                <th className="py-3 px-4 font-medium">Details</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(res => (
                <tr key={res._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{res.customerName || 'Guest'}</div>
                    <div className="text-xs text-gray-500">#{res._id.substring(0, 6)}</div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {typeof res.restaurantId === 'string' ? res.restaurantName || res.restaurantId : res.restaurantId.name}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    <div>{res.reservationDate}</div>
                    <div className="text-gray-500">{res.timeSlot}</div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {res.guestCount} Guests
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded-full">{res.status}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {['PENDING', 'CONFIRMED'].includes(res.status) && (
                      <button 
                        onClick={() => setConfirmCancel({ isOpen: true, resId: res._id })}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmCancel.isOpen}
        title="Cancel Reservation"
        message="Are you sure you want to cancel this reservation?"
        confirmText="Yes, Cancel"
        isDestructive={true}
        onClose={() => setConfirmCancel({ isOpen: false, resId: '' })}
        onConfirm={handleCancel}
      />
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

export default AdminReservationsPage;
