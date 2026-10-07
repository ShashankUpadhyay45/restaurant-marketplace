import mongoose, { Schema, Document } from 'mongoose';

export interface IRestaurant extends Document {
  name: string;
  slug: string;
  ownerId: mongoose.Types.ObjectId;
  operatingMode: 'DELIVERY_ONLY' | 'DINING_ONLY' | 'HYBRID';
  cuisineTypes: string[];
  description: string;
  heroImage: string;
  logoImage?: string;
  address: {
    addressLine1: string;
    addressLine2?: string;
    locality: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    street?: string; // Legacy fallback
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  maxDeliveryRadiusKm: number;
  deliveryZones: Array<{
    maxDistanceKm: number;
    deliveryFee: number;
    minOrderAmount: number;
  }>;
  businessHours: Array<{
    day: number; // 0 = Sunday, 1 = Monday, etc.
    open: string;
    close: string;
    isClosed: boolean;
  }>;
  fssaiLicenseNumber: string;
  gstinNumber?: string;
  commissionRate: number; // Transparent capped commission % (e.g. 9.5)
  averageRating: number;
  totalReviews: number;
  isActive: boolean;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

const RestaurantSchema = new Schema<IRestaurant>({
  name: { type: String, required: true, trim: true, index: true },
  slug: { type: String, required: true, unique: true, lowercase: true, index: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  operatingMode: { 
    type: String, 
    enum: ['DELIVERY_ONLY', 'DINING_ONLY', 'HYBRID'], 
    default: 'HYBRID',
    index: true 
  },
  cuisineTypes: [{ type: String, index: true }],
  description: { type: String, required: true },
  heroImage: { type: String, required: true },
  logoImage: { type: String },
  address: {
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    locality: { type: String, required: true, index: true },
    city: { type: String, required: true, index: true },
    state: { type: String, required: true, default: 'Uttarakhand' },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'India' },
    street: { type: String }, // Legacy compatibility
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      default: [78.0322, 30.3165] // Dehradun default
    }
  },
  maxDeliveryRadiusKm: { type: Number, default: 12, min: 1, max: 35 },
  deliveryZones: [{
    maxDistanceKm: { type: Number, required: true },
    deliveryFee: { type: Number, required: true }, // In INR (₹)
    minOrderAmount: { type: Number, default: 0 }    // In INR (₹)
  }],
  businessHours: [{
    day: { type: Number, required: true },
    open: { type: String, required: true },
    close: { type: String, required: true },
    isClosed: { type: Boolean, default: false }
  }],
  fssaiLicenseNumber: { type: String, required: true },
  gstinNumber: { type: String },
  commissionRate: { type: Number, default: 10.0 }, // Capped, transparent commission %
  averageRating: { type: Number, default: 4.5, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true, index: true },
  verificationStatus: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED'], 
    default: 'APPROVED',
    index: true 
  }
}, {
  timestamps: true
});

// Geospatial 2dsphere index for location queries
RestaurantSchema.index({ location: '2dsphere' });
// Compound index for fast city and locality filtering
RestaurantSchema.index({ 'address.city': 1, 'address.locality': 1 });

export const Restaurant = mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);
