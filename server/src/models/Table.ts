import mongoose, { Schema, Document } from 'mongoose';

export interface ITable extends Document {
  restaurantId: mongoose.Types.ObjectId;
  tableNumber: string;
  capacity: number;
  zone: 'INDOOR' | 'OUTDOOR' | 'VIP_BOOTH' | 'TERRACE' | 'BAR';
  minPartySize: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TableSchema = new Schema<ITable>({
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
  tableNumber: { type: String, required: true },
  capacity: { type: Number, required: true, min: 1 },
  zone: { 
    type: String, 
    enum: ['INDOOR', 'OUTDOOR', 'VIP_BOOTH', 'TERRACE', 'BAR'], 
    default: 'INDOOR' 
  },
  minPartySize: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

TableSchema.index({ restaurantId: 1, tableNumber: 1 }, { unique: true });

export const Table = mongoose.model<ITable>('Table', TableSchema);
