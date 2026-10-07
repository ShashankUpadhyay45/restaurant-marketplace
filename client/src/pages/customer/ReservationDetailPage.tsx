import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { reservationService } from '../../services/reservationService';
import { useToastStore } from '../../store/useToastStore';
import { Reservation } from '../../types';
import { 
  ArrowLeft, 
  QrCode, 
  Clock, 
  MapPin, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Navigation,
  AlertTriangle,
  X
} from 'lucide-react';

export const ReservationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToastStore();

  useEffect(() => {
    async function loadData() {
      if (id) {
        const data = await reservationService.getReservationById(id);
        setReservation(data);
      }
      setIsLoading(false);
    }
    loadData();
  }, [id]);

  if (isLoading || !reservation) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-stone-500">
        <p>Loading reservation boarding pass...</p>
      </div>
    );
  }

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      const updated = await reservationService.cancelReservation(reservation._id);
      setReservation(updated);
      showToast({
        type: 'info',
        title: 'Reservation Cancelled',
        message: 'Your table booking has been released.'
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/reservations"
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Bookings</span>
      </Link>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 bg-stone-900 text-white text-center">
          <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block mb-1">
            Digital Dine-In Boarding Pass
          </span>
          <h1 className="text-2xl font-bold font-display text-white">
            {reservation.restaurantName}
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Reference: <strong className="font-mono text-stone-200">{reservation.qrCodeToken}</strong>
          </p>
        </div>

        {/* QR Code Section */}
        <div className="p-8 text-center bg-stone-50 border-b border-stone-200">
          <div className="w-48 h-48 bg-white p-4 rounded-2xl border border-stone-300 mx-auto flex flex-col items-center justify-center shadow-md mb-4">
            <QrCode className="w-36 h-36 text-stone-900" />
            <span className="text-[10px] font-mono text-stone-500 font-bold mt-1">SCAN AT HOST STAND</span>
          </div>

          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>15-Minute Grace Window Enforced</span>
          </div>
        </div>

        {/* Details List */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100">
              <span className="text-stone-400 font-semibold block mb-0.5">Date & Slot</span>
              <span className="font-bold text-stone-900 text-sm">
                {reservation.reservationDate} at {reservation.timeSlot}
              </span>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100">
              <span className="text-stone-400 font-semibold block mb-0.5">Party Size</span>
              <span className="font-bold text-stone-900 text-sm">
                {reservation.guestCount} Guests
              </span>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100">
              <span className="text-stone-400 font-semibold block mb-0.5">Table Allocated</span>
              <span className="font-bold text-stone-900 text-sm">
                {reservation.tableNumber || 'Table T-02 (Garden)'}
              </span>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100">
              <span className="text-stone-400 font-semibold block mb-0.5">Booking Status</span>
              <span className={`font-bold text-sm ${
                reservation.status === 'CONFIRMED' ? 'text-emerald-600' : 'text-stone-500'
              }`}>
                {reservation.status}
              </span>
            </div>
          </div>

          {reservation.specialRequests && (
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 text-xs">
              <span className="text-stone-400 font-semibold block mb-1">Special Requests:</span>
              <p className="text-stone-700 italic">{reservation.specialRequests}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(reservation.restaurantName || 'Doon Bistro')}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-1.5"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Get Directions</span>
            </a>

            {reservation.status === 'CONFIRMED' && (
              <button
                onClick={handleCancel}
                className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all border border-rose-200 cursor-pointer"
              >
                Cancel Booking
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
