import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  menuItemId: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  unitPrice: number;
  variant?: string;
  modifiers?: Array<{
    groupName: string;
    optionName: string;
    price: number;
  }>;
  totalPrice: number;
  notes?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  restaurantId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  orderType: 'DELIVERY' | 'TAKEOUT';
  items: IOrderItem[];
  subtotal: number;
  deliveryFee: number;
  packagingFee: number;
  platformFee: number;
  gstAmount: number;
  tip: number;
  discountAmount: number;
  totalAmount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';
  paymentIntentId?: string;
  idempotencyKey?: string;
  orderStatus: 'PLACED' | 'CONFIRMED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  deliveryAddress?: {
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    location?: { lat: number; lng: number };
  };
  customerPhone?: string;
  whatsappOptIn?: boolean;
  estimatedDeliveryTime?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  variant: String,
  modifiers: [{
    groupName: String,
    optionName: String,
    price: Number
  }],
  totalPrice: { type: Number, required: true, min: 0 },
  notes: String
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
  orderNumber: { type: String, required: true, unique: true, index: true },
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  orderType: { type: String, enum: ['DELIVERY', 'TAKEOUT'], default: 'DELIVERY' },
  items: [OrderItemSchema],
  subtotal: { type: Number, required: true, min: 0 },
  deliveryFee: { type: Number, default: 0, min: 0 },
  packagingFee: { type: Number, default: 0, min: 0 },
  platformFee: { type: Number, default: 10, min: 0 },
  gstAmount: { type: Number, default: 0, min: 0 },
  tip: { type: Number, default: 0, min: 0 },
  discountAmount: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  paymentStatus: { 
    type: String, 
    enum: ['PENDING', 'PAID', 'REFUNDED', 'FAILED'], 
    default: 'PAID',
    index: true 
  },
  paymentIntentId: String,
  idempotencyKey: { type: String, sparse: true, index: true },
  orderStatus: { 
    type: String, 
    enum: ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'], 
    default: 'PLACED',
    index: true 
  },
  deliveryAddress: {
    addressLine1: String,
    addressLine2: String,
    locality: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: 'India' },
    street: String, // Legacy compatibility
    location: {
      lat: Number,
      lng: Number
    }
  },
  customerPhone: { type: String },
  whatsappOptIn: { type: Boolean, default: true },
  estimatedDeliveryTime: Date,
  cancellationReason: String
}, {
  timestamps: true
});

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
