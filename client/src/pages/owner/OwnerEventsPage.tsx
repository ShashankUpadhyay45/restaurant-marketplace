import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Users, Clock, MapPin, Tag } from 'lucide-react';
import { eventService } from '../../services/eventService';
import { CulinaryEvent, EventBooking } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { useToastStore } from '../../store/useToastStore';

export const OwnerEventsPage: React.FC = () => {
  const [events, setEvents] = useState<CulinaryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const { showToast } = useToastStore();
  
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<EventBooking[]>([]);

  const [newEvent, setNewEvent] = useState<Partial<CulinaryEvent>>({
    restaurantId: 'rest_dehradun_01',
    status: 'UPCOMING',
    tags: []
  });

  const loadEvents = async () => {
    try {
      const data = await eventService.getEvents({ restaurantId: 'rest_dehradun_01' });
      setEvents(data);
    } catch (error) {
      showToast({ message: 'Failed to load events', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleViewBookings = async (eventId: string) => {
    try {
      const data = await eventService.getEventBookings(eventId);
      setBookings(data);
      setSelectedEventId(eventId);
    } catch (error) {
      showToast({ message: 'Failed to load bookings', type: 'error' });
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await eventService.createEvent(newEvent as CulinaryEvent);
      showToast({ message: 'Event created successfully', type: 'success' });
      setShowAddForm(false);
      loadEvents();
    } catch (error) {
      showToast({ message: 'Failed to create event', type: 'error' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">UPCOMING</span>;
      case 'COMPLETED':
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">COMPLETED</span>;
      case 'CANCELLED':
        return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">CANCELLED</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Culinary Events</h1>
          <p className="text-gray-500 text-sm mt-1">Manage food festivals, tastings, and special events</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-semibold mb-4">Create New Event</h2>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={newEvent.title || ''}
                  onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine / Theme</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={newEvent.cuisine || ''}
                  onChange={e => setNewEvent({ ...newEvent, cuisine: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  rows={3}
                  value={newEvent.description || ''}
                  onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={newEvent.eventDate || ''}
                  onChange={e => setNewEvent({ ...newEvent, eventDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={newEvent.timeSlot || ''}
                  onChange={e => setNewEvent({ ...newEvent, timeSlot: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Price (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={newEvent.ticketPrice || ''}
                  onChange={e => setNewEvent({ ...newEvent, ticketPrice: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={newEvent.totalCapacity || ''}
                  onChange={e => setNewEvent({ ...newEvent, totalCapacity: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Create Event
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map(event => (
            <div key={event._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-xl text-gray-900">{event.title}</h3>
                  <p className="text-gray-500 text-sm">{event.cuisine}</p>
                </div>
                {getStatusBadge(event.status)}
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600 text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(event.eventDate).toLocaleDateString()}
                  <Clock className="w-4 h-4 ml-4 mr-2" />
                  {event.timeSlot}
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Users className="w-4 h-4 mr-2" />
                  {event.bookedCount || 0} / {event.totalCapacity} Booked
                  <Tag className="w-4 h-4 ml-4 mr-2" />
                  ₹{event.ticketPrice} per ticket
                </div>
              </div>

              <div className="border-t pt-4 flex justify-between items-center">
                <div className="w-full bg-gray-200 rounded-full h-2 mr-4">
                  <div 
                    className="bg-orange-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, ((event.bookedCount || 0) / (event.totalCapacity || 1)) * 100)}%` }}
                  ></div>
                </div>
                <button
                  onClick={() => handleViewBookings(event._id)}
                  className="whitespace-nowrap text-orange-600 text-sm font-medium hover:text-orange-700"
                >
                  View Bookings
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No events created yet"
          description="Host special dining experiences to attract more customers."
          actionText="Create Event"
          onAction={() => setShowAddForm(true)}
        />
      )}

      {selectedEventId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Event Bookings</h2>
              <button onClick={() => setSelectedEventId(null)} className="text-gray-500 hover:text-gray-700">
                <Tag className="w-6 h-6 rotate-45" /> {/* Using Tag as close icon substitute if X is not available, but let's use XCircle or just close text */}
                Close
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map(booking => (
                    <div key={booking._id} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{booking.customerName}</p>
                        <p className="text-sm text-gray-500">Tickets: {booking.ticketsCount}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">₹{booking.totalAmount}</p>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No bookings for this event yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
