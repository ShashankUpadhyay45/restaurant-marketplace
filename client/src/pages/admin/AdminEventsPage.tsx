import React, { useState, useEffect } from 'react';
import { eventService } from '../../services/eventService';
import { CulinaryEvent, EventBooking } from '../../types';
import { Calendar, Users, IndianRupee, XCircle, Search, AlertTriangle, Eye, CheckCircle, Clock } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToastStore } from '../../store/useToastStore';

export const AdminEventsPage: React.FC = () => {
  const [events, setEvents] = useState<CulinaryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('ALL');
  
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, eventId?: string}>({ isOpen: false });
  const [bookingsModal, setBookingsModal] = useState<{isOpen: boolean, event?: CulinaryEvent, bookings: EventBooking[]}>({ isOpen: false, bookings: [] });
  const { showToast } = useToastStore();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const data = await eventService.getEvents();
        setEvents(data);
      } catch (err) {
        showToast({ message: 'Failed to load events', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [showToast]);

  const filteredEvents = events.filter(e => filter === 'ALL' || e.status === filter);

  const stats = {
    total: events.length,
    upcoming: events.filter(e => e.status === 'UPCOMING').length,
    completed: events.filter(e => e.status === 'COMPLETED').length,
    totalBookings: events.reduce((sum, e) => sum + (e.bookedCount || 0), 0),
  };

  const handleCancelEvent = async () => {
    if (confirmDialog.eventId) {
      try {
        // Mock cancel
        setEvents(events.map(e => e._id === confirmDialog.eventId ? { ...e, status: 'CANCELLED' } : e));
        showToast({ message: 'Event cancelled successfully', type: 'success' });
      } catch (err) {
        showToast({ message: 'Failed to cancel event', type: 'error' });
      }
    }
    setConfirmDialog({ isOpen: false });
  };

  const handleViewBookings = async (event: CulinaryEvent) => {
    try {
      const bookings = await eventService.getEventBookings(event._id);
      setBookingsModal({ isOpen: true, event, bookings });
    } catch (err) {
      showToast({ message: 'Failed to load bookings', type: 'error' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UPCOMING': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Upcoming</span>;
      case 'COMPLETED': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Completed</span>;
      case 'CANCELLED': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Cancelled</span>;
      default: return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Events Management</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center text-gray-500 mb-2">
            <Calendar className="w-5 h-5 mr-2" /> Total Events
          </div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center text-blue-500 mb-2">
            <Clock className="w-5 h-5 mr-2" /> Upcoming
          </div>
          <div className="text-2xl font-bold">{stats.upcoming}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center text-green-500 mb-2">
            <CheckCircle className="w-5 h-5 mr-2" /> Completed
          </div>
          <div className="text-2xl font-bold">{stats.completed}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center text-purple-500 mb-2">
            <Users className="w-5 h-5 mr-2" /> Total Bookings
          </div>
          <div className="text-2xl font-bold">{stats.totalBookings}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {['ALL', 'UPCOMING', 'COMPLETED', 'CANCELLED'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === f ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <EmptyState icon={Calendar} title="No events found" description="There are no events matching your filters." />
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.map((event) => (
                <tr key={event._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{event.title}</div>
                    <div className="text-sm text-gray-500">{event.cuisine}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.restaurantName || event.restaurantId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(event.eventDate).toLocaleDateString()}<br />
                    {event.timeSlot}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.bookedCount || 0} / {event.totalCapacity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{event.ticketPrice}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(event.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleViewBookings(event)} className="text-blue-600 hover:text-blue-900 mr-4" title="View Bookings">
                      <Eye className="w-5 h-5 inline" />
                    </button>
                    {event.status === 'UPCOMING' && (
                      <button onClick={() => setConfirmDialog({ isOpen: true, eventId: event._id })} className="text-red-600 hover:text-red-900" title="Cancel Event">
                        <XCircle className="w-5 h-5 inline" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false })}
        onConfirm={handleCancelEvent}
        title="Cancel Event"
        message="Are you sure you want to cancel this event? This action cannot be undone and will refund all bookings."
        confirmText="Cancel Event"
        isDestructive={true}
      />

      {/* Bookings Modal */}
      {bookingsModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setBookingsModal({ isOpen: false, bookings: [] })}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Bookings for {bookingsModal.event?.title}
                    </h3>
                    <div className="mt-4 max-h-96 overflow-y-auto">
                      {bookingsModal.bookings.length === 0 ? (
                        <p className="text-gray-500 py-4">No bookings yet.</p>
                      ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tickets</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {bookingsModal.bookings.map(b => (
                              <tr key={b._id}>
                                <td className="px-4 py-2 text-sm text-gray-900">{b.customerName}</td>
                                <td className="px-4 py-2 text-sm text-gray-500">{b.ticketsCount}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">₹{b.totalAmount}</td>
                                <td className="px-4 py-2 text-sm text-gray-500">{b.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" onClick={() => setBookingsModal({ isOpen: false, bookings: [] })}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
