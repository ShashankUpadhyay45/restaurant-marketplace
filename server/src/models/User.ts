import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string;
  role: 'customer' | 'restaurant_owner' | 'admin';
  verificationStatus: 'PENDING' | 'VERIFIED' | 'SUSPENDED';
  restaurantId?: mongoose.Types.ObjectId;
  loyaltyPointsBalance: number;
  membershipTier: 'STANDARD' | 'BRONZE' | 'SILVER' | 'GOLD';
  savedAddresses: Array<{
    label?: string;
    addressLine1?: string;
    addressLine2?: string;
    locality?: string;
    city: string;
    state?: string;
    postalCode: string;
    country?: string;
    street?: string; // Legacy fallback
    location?: { lat: number; lng: number };
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String, required: true, trim: true },
  phone: { type: String }, // e.g. +91 98110 23456
  role: { 
    type: String, 
    enum: ['customer', 'restaurant_owner', 'admin'], 
    default: 'customer',
    index: true 
  },
  verificationStatus: { 
    type: String, 
    enum: ['PENDING', 'VERIFIED', 'SUSPENDED'], 
    default: 'VERIFIED' 
  },
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant' },
  loyaltyPointsBalance: { type: Number, default: 0, min: 0 },
  membershipTier: { 
    type: String, 
    enum: ['STANDARD', 'BRONZE', 'SILVER', 'GOLD'], 
    default: 'STANDARD' 
  },
  savedAddresses: [{
    label: String,
    addressLine1: String,
    addressLine2: String,
    locality: String,
    city: { type: String, required: true },
    state: { type: String, default: 'Uttarakhand' },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'India' },
    street: String, // Legacy fallback
    location: {
      lat: Number,
      lng: Number
    }
  }]
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', UserSchema);
