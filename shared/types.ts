export type UserRole = 'customer' | 'restaurant_owner' | 'admin';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'APPROVED' | 'REJECTED';
export type OperatingMode = 'DELIVERY_ONLY' | 'DINING_ONLY' | 'HYBRID';
export type DietaryTag = 'VEG' | 'NON_VEG' | 'VEGAN' | 'GLUTEN_FREE' | 'HALAL' | 'CHEF_SPECIAL';

export type OrderType = 'DELIVERY' | 'TAKEOUT';
export type OrderStatus = 
  | 'PLACED' 
  | 'CONFIRMED' 
  | 'PREPARING' 
  | 'READY_FOR_PICKUP' 
  | 'OUT_FOR_DELIVERY' 
  | 'DELIVERED' 
  | 'CANCELLED' 
  | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';

export type ReservationStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'SEATED' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'NO_SHOW';

export type TableZone = 'INDOOR' | 'OUTDOOR' | 'VIP_BOOTH' | 'TERRACE' | 'BAR';

export type LoyaltyTransactionType = 'EARNED' | 'REDEEMED' | 'REVERSED' | 'BONUS';
export type MembershipTier = 'STANDARD' | 'BRONZE' | 'SILVER' | 'GOLD';

export interface UserLocation {
  source: 'DETECTED' | 'MANUAL' | 'DEFAULT';
  city: string;
  state: string;
  locality?: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  displayText: string;
}

export interface Address {
  label?: string;
  addressLine1: string;
  addressLine2?: string;
  locality: string;
  city: string;
  state: string;
  postalCode: string;
  country: 'India';
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface UserDTO {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  restaurantId?: string;
  loyaltyPointsBalance: number;
  membershipTier: MembershipTier;
  savedAddresses?: Address[];
  createdAt: string;
}

export interface MenuItemVariant {
  name: string;
  priceDelta: number; // In INR (₹)
}

export interface ModifierOption {
  name: string;
  price: number; // In INR (₹)
}

export interface ModifierGroup {
  name: string;
  minSelection: number;
  maxSelection: number;
  options: ModifierOption[];
}

export interface MenuItemDTO {
  id: string;
  restaurantId: string;
  category: string;
  name: string;
  description: string;
  basePrice: number; // In INR (₹)
  imageUrl?: string;
  dietaryTags: DietaryTag[];
  variants: MenuItemVariant[];
  modifierGroups: ModifierGroup[];
  isAvailable: boolean;
  preparationTimeMinutes: number;
}

export interface RestaurantDTO {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  operatingMode: OperatingMode;
  cuisineTypes: string[];
  description: string;
  heroImage: string;
  logoImage?: string;
  address: Address;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  maxDeliveryRadiusKm: number;
  deliveryZones: {
    maxDistanceKm: number;
    deliveryFee: number;
    minOrderAmount: number;
  }[];
  businessHours: {
    day: number;
    open: string;
    close: string;
    isClosed: boolean;
  }[];
  fssaiLicenseNumber: string;
  gstinNumber?: string;
  commissionRate: number;
  averageRating: number;
  totalReviews: number;
  isActive: boolean;
  verificationStatus: VerificationStatus;
  computedDistanceKm?: number;
  isDeliveringToUser?: boolean;
}

export interface TableDTO {
  id: string;
  restaurantId: string;
  tableNumber: string;
  capacity: number;
  zone: TableZone;
  minPartySize: number;
  isActive: boolean;
}

export interface ReservationDTO {
  id: string;
  restaurantId: string;
  restaurantName?: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  tableId: string;
  tableNumber?: string;
  guestCount: number;
  reservationDate: string;
  timeSlot: string;
  durationMinutes: number;
  status: ReservationStatus;
  depositAmount: number;
  qrCodeToken: string;
  specialRequests?: string;
  createdAt: string;
}

export interface OrderItemDTO {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number; // In INR (₹)
  variant?: string;
  modifiers?: { groupName: string; optionName: string; price: number }[];
  totalPrice: number; // In INR (₹)
  notes?: string;
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  restaurantId: string;
  restaurantName?: string;
  customerId: string;
  customerName?: string;
  orderType: OrderType;
  items: OrderItemDTO[];
  subtotal: number; // In INR (₹)
  deliveryFee: number;
  packagingFee: number;
  platformFee: number;
  gstAmount: number;
  tip: number;
  discountAmount: number;
  totalAmount: number; // In INR (₹)
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  deliveryAddress?: Address;
  estimatedDeliveryTime?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PricingCalculationResult {
  subtotal: number;
  deliveryFee: number;
  packagingFee: number;
  platformFee: number;
  gstAmount: number;
  tip: number;
  discountAmount: number;
  totalAmount: number;
  breakdown: {
    foodSubtotal: number;
    foodGst: number;
    platformServicesGst: number;
    netToRestaurant: number;
    platformCommission: number;
  };
}
