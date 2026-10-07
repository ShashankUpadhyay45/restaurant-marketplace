import mongoose, { Schema, Document } from 'mongoose';

export interface ILoyaltyLedger extends Document {
  userId: mongoose.Types.ObjectId;
  points: number;
  transactionType: 'EARNED' | 'REDEEMED' | 'REVERSED' | 'BONUS';
  referenceType: 'ORDER' | 'RESERVATION' | 'PROMO' | 'REFUND';
  referenceId?: mongoose.Types.ObjectId;
  balanceAfter: number;
  notes?: string;
  createdAt: Date;
}

const LoyaltyLedgerSchema = new Schema<ILoyaltyLedger>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  points: { type: Number, required: true },
  transactionType: { 
    type: String, 
    enum: ['EARNED', 'REDEEMED', 'REVERSED', 'BONUS'], 
    required: true,
    index: true 
  },
  referenceType: { 
    type: String, 
    enum: ['ORDER', 'RESERVATION', 'PROMO', 'REFUND'], 
    required: true 
  },
  referenceId: { type: Schema.Types.ObjectId },
  balanceAfter: { type: Number, required: true, min: 0 },
  notes: String
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export const LoyaltyLedger = mongoose.model<ILoyaltyLedger>('LoyaltyLedger', LoyaltyLedgerSchema);
