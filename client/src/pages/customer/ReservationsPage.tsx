import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Reservation } from '../../types';
import { ReservationPassModal } from '../../components/customer/ReservationPassModal';
import { 
  CalendarDays, 
  Clock, 
  Users, 
  MapPin, 
  QrCode, 
  AlertCircle, 
  CheckCircle,
  ExternalLink,
  Utensils,
  MessageSquare
} from 'lucide-react';
import { NotificationConfirmationModal } from '../../components/notifications/NotificationConfirmationModal';

export const ReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activePassData, setActivePassData] = useState<any>(null);
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  const loadReservations = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/reservations/my-reservations');
      setReservations(res.reservations || []);
    } catch (err) {
      console.error('Failed to load reservations', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this dining reservation?')) return;
    try {
      await api.post(`/reservations/${id}/cancel`);
      loadReservations();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel reservation.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
      
      <div className="mb-8">
        <span className="text-[11px] font-bold uppercase tracking-widest text-brand-600">Table Host Stand</span>
        <h1 className="font-display text-3xl font-bold text-stone-900 mt-1">My Reserved Tables</h1>
        <p className="text-xs text-stone-500 mt-1">Guaranteed seating reservations with instant digital QR boarding passes</p>
      </div>

      {isLoading ? (
        <div className="h-64 bg-stone-100 rounded-3xl animate-pulse" />
      ) : reservations.length === 0 ? (
        <div className="max-w-md mx-auto my-12 p-8 text-center bg-white rounded-3xl border border-stone-200 space-y-4">
          <Utensils className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-display text-lg font-bold text-stone-900">No active dining reservations</h3>
          <p className="text-xs text-stone-500">Discover fine bistros and reserved tasting tables across your city.</p>
          <Link to="/" className="inline-block px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold">
            Explore Venues
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservations.map(res => {
            const rest = typeof res.restaurantId === 'object' ? res.restaurantId : null;
            const table = typeof res.tableId === 'object' ? res.tableId : null;
            const isCancelled = res.status === 'CANCELLED';

            return (
              <div
                key={res._id}
                className={`bg-white rounded-3xl border overflow-hidden shadow-sm flex flex-col justify-between transition-all ${
                  isCancelled ? 'opacity-60 border-stone-200' : 'border-stone-200/90 hover:shadow-lg'
                }`}
              >
                <div>
                  {/* Card Header with Restaurant Image */}
                  <div className="relative h-36 bg-stone-900">
                    {rest?.heroImage && (
                      <img src={rest.heroImage} alt="" className="w-full h-full object-cover opacity-80" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/40 to-transparent" />
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        res.status === 'CONFIRMED' ? 'bg-emerald-500 text-white' :
                        res.status === 'SEATED' ? 'bg-amber-500 text-white' :
                        res.status === 'COMPLETED' ? 'bg-stone-600 text-white' :
                        'bg-rose-500 text-white'
                      }`}>
                        {res.status}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-4 text-white">
                      <h3 className="font-display text-lg font-bold line-clamp-1">{rest?.name || 'Restaurant'}</h3>
                      <p className="text-[11px] text-stone-300 flex items-center mt-0.5">
                        <MapPin className="w-3 h-3 mr-1 text-brand-400" />
                        <span>
                          {rest?.address.locality ? `${rest.address.locality}, ${rest.address.city}` : (rest?.address.city || 'India')}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-5 space-y-3 text-xs text-stone-700">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500 flex items-center">
                        <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-brand-600" /> Date
                      </span>
                      <span className="font-bold text-stone-900">{res.reservationDate}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-stone-500 flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1.5 text-brand-600" /> Time Window
                      </span>
                      <span className="font-bold text-stone-900">{res.timeSlot} (90 mins)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-stone-500 flex items-center">
                        <Users className="w-3.5 h-3.5 mr-1.5 text-brand-600" /> Party Size
                      </span>
                      <span className="font-bold text-stone-900">{res.guestCount} Guests</span>
                    </div>

                    {table && (
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">Assigned Zone</span>
                        <span className="font-medium text-stone-800">{table.tableNumber} • {table.zone}</span>
                      </div>
                    )}

                    {res.specialRequests && (
                      <p className="text-[11px] text-stone-500 italic bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                        "{res.specialRequests}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-5 pt-0 space-y-2">
                  {!isCancelled && (
                    <>
                      <button
                        onClick={() => setActivePassData({
                          reservation: res,
                          qrCodeDataUrl: '',
                          mapsUrl: `https://maps.google.com/?q=${encodeURIComponent(rest?.name || '')}`
                        })}
                        className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-brand-600 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
                      >
                        <QrCode className="w-4 h-4 text-amber-400" />
                        <span>View Digital QR Pass</span>
                      </button>

                      <button
                        onClick={() => {
                          const bookingId = res._id.slice(-6).toUpperCase();
                          const restName = rest?.name || 'Restaurant';
                          const restLoc = rest?.address.locality || rest?.address.city || 'Dehradun';
                          const restCity = rest?.address.city || 'Dehradun';
                          const qrUrl = `${window.location.origin}/reservations?token=${res.qrCodeToken || res._id}`;
                          const dirUrl = `https://maps.google.com/?q=${encodeURIComponent(restName + ' ' + restLoc)}`;

                          setSelectedNotification({
                            type: 'RESERVATION_CONFIRMATION',
                            normalizedPhone: res.customerPhone || '+919876543210',
                            bookingId,
                            restaurantName: restName,
                            whatsAppMessage: `🥂 *GourmetFleet — Table Reservation Confirmed!*\n\nHi Valued Guest, your table at *${restName}* is confirmed!\n\n📅 *Booking Ref: #${bookingId}*\n• Date: *${res.reservationDate}*\n• Time: *${res.timeSlot}*\n• Party: *${res.guestCount} Guests*\n• Venue: *${restName}* (${restLoc}, ${restCity})\n\n🎟️ *Digital QR Pass:*\n${qrUrl}\n\n📍 *Directions:* ${dirUrl}\n\nWe look forward to hosting you! 🌟`,
                            smsMessage: `[GURMET] Table for ${res.guestCount} confirmed at ${restName} on ${res.reservationDate} at ${res.timeSlot} (Ref #${bookingId}). View QR pass: ${qrUrl} - GourmetFleet`,
                            whatsappShareUrl: `https://api.whatsapp.com/send?phone=${(res.customerPhone || '919876543210').replace(/[^0-9]/g, '')}&text=${encodeURIComponent(`Table confirmed at ${restName} for ${res.guestCount} guests!`)}`
                          });
                          setShowNotificationModal(true);
                        }}
                        className="w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors border border-emerald-200"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp & SMS Confirmation</span>
                      </button>
                    </>
                  )}

                  {!isCancelled && res.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleCancel(res._id)}
                      className="w-full py-2 rounded-xl text-stone-500 hover:text-red-600 hover:bg-red-50 text-[11px] font-semibold transition-colors"
                    >
                      Cancel Reservation
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Pass Modal */}
      {activePassData && (
        <ReservationPassModal
          reservationData={activePassData}
          onClose={() => setActivePassData(null)}
        />
      )}

      {/* WhatsApp & SMS Confirmation Modal */}
      <NotificationConfirmationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        defaultType="RESERVATION_CONFIRMATION"
        data={selectedNotification}
      />

    </div>
  );
};
