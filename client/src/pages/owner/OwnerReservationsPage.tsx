import React, { useEffect, useState } from 'react';
import { Calendar, Users, Clock, Check, X, LogIn, CheckCircle, Search } from 'lucide-react';
import { reservationService } from '../../services/reservationService';
import { Reservation, ReservationStatus } from '../../types';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';

export const OwnerReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [dialogAction, setDialogAction] = useState<'CANCEL' | 'NO_SHOW' | null>(null);

  const RESTAURANT_ID = 'rest_dehradun_01';

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const data = await reservationService.getReservations({ 
        restaurantId: RESTAURANT_ID,
        // In a real app we'd pass the date to the API
      });
      // Filter by selected date
      const filtered = data.filter(r => r.reservationDate === dateFilter);
      // Sort by time
      filtered.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
      setReservations(filtered);
    } catch (error) {
      console.error('Failed to load reservations', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [dateFilter]);

  const updateStatus = async (id: string, status: ReservationStatus) => {
    try {
      await reservationService.updateReservationStatus(id, status);
      fetchReservations();
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const handleAction = async () => {
    if (!selectedRes || !dialogAction) return;
    try {
      if (dialogAction === 'CANCEL') {
        await reservationService.cancelReservation(selectedRes._id);
      } else if (dialogAction === 'NO_SHOW') {
        await reservationService.updateReservationStatus(selectedRes._id, 'NO_SHOW');
      }
      fetchReservations();
    } catch (error) {
      console.error('Failed to process action', error);
    } finally {
      setDialogOpen(false);
      setSelectedRes(null);
      setDialogAction(null);
    }
  };

  const getStatusBadge = (status: ReservationStatus) => {
    const styles: Record<ReservationStatus, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      SEATED: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
      NO_SHOW: 'bg-orange-100 text-orange-800',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const stats = {
    total: reservations.length,
    confirmed: reservations.filter(r => r.status === 'CONFIRMED').length,
    pending: reservations.filter(r => r.status === 'PENDING').length,
    seated: reservations.filter(r => r.status === 'SEATED').length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservations</h1>
          <p className="text-gray-500 text-sm">Manage table bookings</p>
        </div>
        
        <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
          <Calendar className="w-5 h-5 text-gray-500 ml-2" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border-none focus:ring-0 text-sm font-medium text-gray-700 bg-transparent cursor-pointer"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Total Today</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Confirmed</p>
          <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Currently Seated</p>
          <p className="text-2xl font-bold text-blue-600">{stats.seated}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading...</div>
        ) : reservations.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No reservations"
            description="There are no reservations for this date."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Guest Details</th>
                  <th className="p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Party Size</th>
                  <th className="p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                  <th className="p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reservations.map(res => (
                  <tr key={res._id} className="hover:bg-gray-50">
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center text-gray-900 font-medium">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        {res.timeSlot}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{res.customerName}</div>
                      <div className="text-sm text-gray-500">{res.specialRequests || '-'}</div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center text-gray-700">
                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                        {res.guestCount} Guests
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap text-gray-700">
                      {res.tableNumber || 'Unassigned'}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {getStatusBadge(res.status)}
                    </td>
                    <td className="p-4 whitespace-nowrap text-right space-x-2">
                      {res.status === 'PENDING' && (
                        <>
                          <button onClick={() => updateStatus(res._id, 'CONFIRMED')} className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700" title="Confirm">
                            <Check className="h-4 w-4" />
                          </button>
                          <button onClick={() => { setSelectedRes(res); setDialogAction('CANCEL'); setDialogOpen(true); }} className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700" title="Cancel">
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {res.status === 'CONFIRMED' && (
                        <>
                          <button onClick={() => updateStatus(res._id, 'SEATED')} className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700" title="Seat Guest">
                            <LogIn className="h-4 w-4" />
                          </button>
                          <button onClick={() => { setSelectedRes(res); setDialogAction('NO_SHOW'); setDialogOpen(true); }} className="inline-flex items-center p-1.5 border border-gray-300 rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50" title="Mark No-Show">
                            <Users className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {res.status === 'SEATED' && (
                        <button onClick={() => updateStatus(res._id, 'COMPLETED')} className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-gray-600 hover:bg-gray-700" title="Complete">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleAction}
        title={dialogAction === 'CANCEL' ? 'Cancel Reservation' : 'Mark as No-Show'}
        message={dialogAction === 'CANCEL' 
          ? 'Are you sure you want to cancel this reservation? The customer will be notified.'
          : 'Are you sure you want to mark this reservation as a no-show?'}
        confirmText={dialogAction === 'CANCEL' ? 'Cancel Reservation' : 'Mark No-Show'}
        isDestructive={true}
      />
    </div>
  );
};
