import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  restaurantId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  reservationId?: mongoose.Types.ObjectId;
  rating: number; // 1-5
  comment: string;
  isVerifiedDiner: boolean;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  reservationId: { type: Schema.Types.ObjectId, ref: 'Reservation' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  isVerifiedDiner: { type: Boolean, default: true }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
