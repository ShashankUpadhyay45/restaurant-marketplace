import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { CulinaryEvent, EventBooking } from '../../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Ticket, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft, 
  ShieldCheck,
  QrCode
} from 'lucide-react';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showToast } = useToastStore();

  const [event, setEvent] = useState<CulinaryEvent | null>(null);
  const [ticketsCount, setTicketsCount] = useState<number>(2);
  const [guestName, setGuestName] = useState<string>(user?.fullName || '');
  const [guestPhone, setGuestPhone] = useState<string>(user?.phone || '+919876543210');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<EventBooking | null>(null);

  useEffect(() => {
    async function loadEvent() {
      if (id) {
        const ev = await eventService.getEventById(id);
        setEvent(ev);
      }
    }
    loadEvent();
  }, [id]);

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-stone-500">Loading event details...</p>
      </div>
    );
  }

  const remainingTickets = event.totalCapacity - event.bookedCount;
  const totalPrice = ticketsCount * event.ticketPrice;

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestPhone) {
      showToast({ type: 'error', message: 'Please provide full name and phone number.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const booking = await eventService.bookEvent(event._id, ticketsCount, {
        id: user?.id,
        name: guestName,
        phone: guestPhone,
        email: user?.email
      });
      setConfirmedBooking(booking);
      showToast({
        type: 'success',
        title: 'Event Passes Confirmed! 🎟️',
        message: `Reserved ${ticketsCount} tickets for ${event.title}.`
      });
    } catch (err: any) {
      showToast({ type: 'error', message: err.message || 'Failed to book tickets.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/events"
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Events</span>
      </Link>

      {confirmedBooking ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-xl max-w-xl mx-auto text-center animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-1">Reservation Confirmed!</h2>
          <p className="text-xs text-stone-500 mb-6">
            Your digital pass is verified. Show this QR code at the reception desk upon arrival.
          </p>

          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 inline-block mb-6">
            <div className="w-44 h-44 bg-white p-3 rounded-xl border border-stone-300 mx-auto flex flex-col items-center justify-center shadow-inner">
              <QrCode className="w-32 h-32 text-stone-900" />
              <span className="text-[10px] font-mono text-stone-500 mt-2 font-bold">{confirmedBooking.qrCodeToken}</span>
            </div>
          </div>

          <div className="text-left text-xs bg-stone-50 p-4 rounded-xl space-y-2 border border-stone-100 mb-6">
            <div className="flex justify-between">
              <span className="text-stone-500">Event:</span>
              <span className="font-bold text-stone-900">{confirmedBooking.eventTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Date & Slot:</span>
              <span className="font-bold text-stone-900">{confirmedBooking.eventDate} ({confirmedBooking.timeSlot})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Tickets Count:</span>
              <span className="font-bold text-stone-900">{confirmedBooking.ticketsCount} Guests</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Total Paid:</span>
              <span className="font-bold text-brand-700 text-sm">₹{confirmedBooking.totalAmount}</span>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-3">
            <Link
              to="/events"
              className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md"
            >
              Browse More Events
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Event details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl overflow-hidden shadow-md">
              <img
                src={event.bannerImage}
                alt={event.title}
                className="w-full h-80 object-cover"
              />
            </div>

            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 mb-2">
                <span>{event.cuisine}</span>
                <span>•</span>
                <span className="text-stone-500">{event.restaurantName}</span>
              </div>
              <h1 className="font-display text-3xl font-extrabold text-stone-900 mb-3">
                {event.title}
              </h1>
              <p className="text-sm text-stone-600 leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Highlights */}
            {event.highlights && event.highlights.length > 0 && (
              <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200">
                <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Experience Highlights</span>
                </h3>
                <ul className="space-y-2">
                  {event.highlights.map((h, i) => (
                    <li key={i} className="flex items-center text-xs text-stone-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xl sticky top-28">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">Ticket Price</span>
                  <span className="text-2xl font-extrabold text-stone-900">₹{event.ticketPrice}</span>
                  <span className="text-xs text-stone-400"> / guest</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-emerald-600 block">Available</span>
                  <span className="text-xs text-stone-500">{remainingTickets} tickets left</span>
                </div>
              </div>

              <form onSubmit={handleBook} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Number of Tickets</label>
                  <div className="flex items-center space-x-3">
                    {[1, 2, 4, 6].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setTicketsCount(num)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          ticketsCount === num
                            ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-indigo-500"
                    placeholder="Guest name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number (for SMS & WhatsApp)</label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-indigo-500"
                    placeholder="+919876543210"
                  />
                </div>

                <div className="pt-3 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>{ticketsCount} × ₹{event.ticketPrice}</span>
                    <span>₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between font-bold text-stone-900 pt-1 text-sm">
                    <span>Total Amount</span>
                    <span className="text-indigo-600 font-extrabold">₹{totalPrice}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || remainingTickets <= 0}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Confirming...' : `Confirm & Pay ₹${totalPrice}`}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
