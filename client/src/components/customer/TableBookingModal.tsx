import React, { useState, useEffect } from 'react';
import { Restaurant, Table } from '../../types';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { X, Calendar, Clock, Users, CheckCircle2, AlertTriangle, Sparkles, MapPin, MessageSquare } from 'lucide-react';

interface Props {
  restaurant: Restaurant | null;
  onClose: () => void;
  onBookingSuccess: (reservationData: any) => void;
}

export const TableBookingModal: React.FC<Props> = ({ restaurant, onClose, onBookingSuccess }) => {
  const { user } = useAuthStore();

  const [date, setDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0] // default tomorrow
  );
  const [timeSlot, setTimeSlot] = useState<string>('19:30');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>(user?.phone || '+91 98765 43210');
  const [whatsappOptIn, setWhatsappOptIn] = useState<boolean>(true);

  const [isLoadingCheck, setIsLoadingCheck] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const TIME_SLOTS = [
    '12:00', '12:30', '13:00', '13:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
  ];

  // Perform real availability check whenever date, timeSlot, or guestCount changes
  useEffect(() => {
    if (!restaurant) return;
    
    let isCancelled = false;
    async function checkSlots() {
      setIsLoadingCheck(true);
      setErrorMsg(null);
      try {
        const res = await api.post('/reservations/check', {
          restaurantId: restaurant!._id,
          date,
          timeSlot,
          guestCount
        });
        if (!isCancelled) {
          if (res.isAvailable && res.availableTables.length > 0) {
            setAvailableTables(res.availableTables);
            setSelectedTableId(res.availableTables[0]._id);
          } else {
            setAvailableTables([]);
            setSelectedTableId('');
            setErrorMsg(res.message || 'No tables available for this slot.');
          }
        }
      } catch (err: any) {
        if (!isCancelled) {
          setAvailableTables([]);
          setSelectedTableId('');
          setErrorMsg(err.message || 'Could not verify table availability.');
        }
      } finally {
        if (!isCancelled) setIsLoadingCheck(false);
      }
    }

    checkSlots();
    return () => { isCancelled = true; };
  }, [restaurant, date, timeSlot, guestCount]);

  if (!restaurant) return null;

  const handleConfirmReservation = async () => {
    if (!user) {
      alert('Please sign in or create an account to confirm table reservations.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await api.post('/reservations', {
        restaurantId: restaurant._id,
        date,
        timeSlot,
        guestCount,
        customerPhone,
        whatsappOptIn,
        tableId: selectedTableId || undefined,
        specialRequests: specialRequests.trim() || undefined
      });

      if (res.success) {
        onBookingSuccess(res);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete reservation. Slot may have been claimed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="relative h-32 bg-stone-900 p-6 flex flex-col justify-end text-white">
          <div className="absolute inset-0 opacity-40 overflow-hidden">
            <img src={restaurant.heroImage} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/60 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Guaranteed Dining Reservation</span>
            <h2 className="font-display text-xl font-bold">{restaurant.name}</h2>
          </div>
        </div>

        {/* Booking Form Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          
          {/* Party Size Stepper */}
          <div>
            <label className="flex items-center text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              <Users className="w-3.5 h-3.5 mr-1.5 text-brand-600" />
              <span>Party Size</span>
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5, 6, 8].map(size => (
                <button
                  key={size}
                  onClick={() => setGuestCount(size)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    guestCount === size
                      ? 'border-brand-600 bg-brand-50 text-brand-900 shadow-sm'
                      : 'border-stone-200 text-stone-600 hover:border-stone-300'
                  }`}
                >
                  {size} {size === 1 ? 'Guest' : 'Guests'}
                </button>
              ))}
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="flex items-center text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-brand-600" />
              <span>Dining Date</span>
            </label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Time Slot Picker */}
          <div>
            <label className="flex items-center text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-brand-600" />
              <span>Seating Time Window</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map(slot => (
                <button
                  key={slot}
                  onClick={() => setTimeSlot(slot)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border text-center transition-all ${
                    timeSlot === slot
                      ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
                      : 'border-stone-200 text-stone-700 hover:border-stone-300 bg-stone-50/50'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Table Selection from Real DB Inventory */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700">Available Dining Zones</span>
              {isLoadingCheck && <span className="text-[10px] text-amber-600 animate-pulse font-medium">Checking live tables...</span>}
            </div>

            {errorMsg ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            ) : availableTables.length > 0 ? (
              <div className="space-y-2">
                {availableTables.map(tbl => (
                  <label
                    key={tbl._id}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedTableId === tbl._id
                        ? 'border-brand-600 bg-brand-50/60 text-brand-900 font-semibold'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="radio"
                        name="tableChoice"
                        checked={selectedTableId === tbl._id}
                        onChange={() => setSelectedTableId(tbl._id)}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      <span>{tbl.tableNumber} ({tbl.zone.replace('_', ' ')})</span>
                    </div>
                    <span className="text-[11px] text-stone-500">Seats up to {tbl.capacity}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400">Select a date and time to see real-time table availability.</p>
            )}
          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Special Requests (Optional)
            </label>
            <input
              type="text"
              value={specialRequests}
              onChange={e => setSpecialRequests(e.target.value)}
              placeholder="e.g. Quiet corner, anniversary seating, high chair needed"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Guest Mobile Number for WhatsApp & SMS */}
          <div className="pt-2 border-t border-stone-100 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center justify-between">
              <span>Guest Mobile Number</span>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center">
                <MessageSquare className="w-3 h-3 mr-1 inline" /> Instant WhatsApp & SMS Pass
              </span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs text-stone-500 font-bold">
                🇮🇳 +91
              </div>
              <input
                type="tel"
                value={customerPhone.replace('+91', '').trim()}
                onChange={e => setCustomerPhone(`+91 ${e.target.value.replace(/[^0-9]/g, '')}`)}
                placeholder="98765 43210"
                className="w-full pl-16 pr-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
            <label className="flex items-start space-x-2 cursor-pointer pt-0.5">
              <input
                type="checkbox"
                checked={whatsappOptIn}
                onChange={e => setWhatsappOptIn(e.target.checked)}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
              />
              <span className="text-[10px] text-stone-500 leading-tight">
                Send guaranteed table pass, host stand QR code, and Google Maps directions to <strong>WhatsApp & SMS</strong>.
              </span>
            </label>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <div className="text-xs text-stone-500">
            <span className="font-semibold text-stone-800">Zero Deposit</span>
            <p className="text-[10px]">15-min grace window</p>
          </div>
          <button
            onClick={handleConfirmReservation}
            disabled={isSubmitting || availableTables.length === 0}
            className="py-3 px-6 rounded-xl bg-stone-900 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSubmitting ? (
              <span>Securing Table...</span>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Confirm & Generate Pass</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
