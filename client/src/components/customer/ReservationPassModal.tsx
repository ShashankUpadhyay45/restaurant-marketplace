import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, MapPin, Calendar, Clock, Users, CheckCircle, ExternalLink, QrCode } from 'lucide-react';

interface Props {
  reservationData: {
    reservation: any;
    qrCodeDataUrl: string;
    mapsUrl: string;
  } | null;
  onClose: () => void;
}

export const ReservationPassModal: React.FC<Props> = ({ reservationData, onClose }) => {
  useEffect(() => {
    if (reservationData) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [reservationData]);

  if (!reservationData) return null;

  const { reservation, qrCodeDataUrl, mapsUrl } = reservationData;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-stone-200">
        
        {/* Pass Header */}
        <div className="bg-stone-900 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
            <CheckCircle className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Digital Reservation Pass</span>
          <h3 className="font-display text-lg font-bold mt-1 text-white">Table Confirmed</h3>
          <p className="text-[11px] text-stone-400">Show this pass to the restaurant host upon arrival</p>
        </div>

        {/* QR Code Presentation */}
        <div className="p-6 text-center bg-stone-50 border-b border-dashed border-stone-300">
          <div className="bg-white p-4 rounded-2xl shadow-inner inline-block border border-stone-200">
            {qrCodeDataUrl ? (
              <img src={qrCodeDataUrl} alt="Reservation QR Ticket" className="w-44 h-44 mx-auto" />
            ) : (
              <div className="w-44 h-44 flex items-center justify-center bg-stone-100 text-stone-400">
                <QrCode className="w-16 h-16" />
              </div>
            )}
          </div>
          <p className="text-[10px] text-stone-500 font-mono tracking-wider mt-3">
            {reservation.qrCodeToken}
          </p>
        </div>

        {/* Ticket Details Body */}
        <div className="p-6 space-y-3.5 text-xs text-stone-700">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <span className="text-stone-500 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-brand-600" /> Date:
            </span>
            <span className="font-bold text-stone-900">{reservation.reservationDate}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <span className="text-stone-500 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-brand-600" /> Time Slot:
            </span>
            <span className="font-bold text-stone-900">{reservation.timeSlot} (90 mins)</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <span className="text-stone-500 flex items-center">
              <Users className="w-3.5 h-3.5 mr-1 text-brand-600" /> Party Size:
            </span>
            <span className="font-bold text-stone-900">{reservation.guestCount} Guests</span>
          </div>

          {/* Action Links */}
          <div className="pt-2 flex flex-col space-y-2">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs text-center flex items-center justify-center space-x-1.5 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Get Google Maps Directions</span>
              <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
            </a>

            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-xs text-center transition-colors"
            >
              Done & Save to Passbook
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
