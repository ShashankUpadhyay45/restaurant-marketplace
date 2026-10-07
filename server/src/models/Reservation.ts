import mongoose, { Schema, Document } from 'mongoose';

export interface IReservation extends Document {
  restaurantId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  tableId: mongoose.Types.ObjectId;
  guestCount: number;
  reservationDate: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm e.g. "19:00"
  durationMinutes: number;
  status: 'PENDING' | 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  depositAmount: number;
  qrCodeToken: string;
  customerPhone?: string;
  whatsappOptIn?: boolean;
  specialRequests?: string;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReservationSchema = new Schema<IReservation>({
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tableId: { type: Schema.Types.ObjectId, ref: 'Table', required: true, index: true },
  guestCount: { type: Number, required: true, min: 1 },
  reservationDate: { type: String, required: true, index: true },
  timeSlot: { type: String, required: true, index: true },
  durationMinutes: { type: Number, default: 90 },
  status: { 
    type: String, 
    enum: ['PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'], 
    default: 'CONFIRMED',
    index: true 
  },
  depositAmount: { type: Number, default: 0 },
  qrCodeToken: { type: String, required: true, unique: true, index: true },
  customerPhone: { type: String },
  whatsappOptIn: { type: Boolean, default: true },
  specialRequests: { type: String },
  cancellationReason: { type: String }
}, {
  timestamps: true
});

// Compound index to help query bookings by slot
ReservationSchema.index({ 
  restaurantId: 1, 
  tableId: 1, 
  reservationDate: 1, 
  timeSlot: 1 
});

export const Reservation = mongoose.model<IReservation>('Reservation', ReservationSchema);
