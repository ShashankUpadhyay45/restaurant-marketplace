export type UserRole = 'customer' | 'restaurant_owner' | 'delivery_partner' | 'admin';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
export type OperatingMode = 'DELIVERY_ONLY' | 'DINING_ONLY' | 'HYBRID';
export type DietaryTag = 'VEG' | 'NON_VEG' | 'VEGAN' | 'GLUTEN_FREE' | 'HALAL' | 'CHEF_SPECIAL';

export type OrderType = 'DELIVERY' | 'TAKEOUT';

export type OrderStatus = 
  | 'PLACED' 
  | 'CONFIRMED' 
  | 'PREPARING' 
  | 'READY_FOR_PICKUP' 
  | 'RIDER_ASSIGNED' 
  | 'PICKED_UP' 
  | 'OUT_FOR_DELIVERY' 
  | 'DELIVERED' 
  | 'CANCELLED'
  | 'REJECTED'
  | 'DELIVERY_FAILED'
  | 'REFUND_PENDING'
  | 'REFUNDED';

export type ReservationStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'SEATED' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'NO_SHOW';

export type TableZone = 'INDOOR' | 'OUTDOOR' | 'VIP_BOOTH' | 'TERRACE' | 'BAR';
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
  id?: string;
  label?: string;
  addressLine1?: string;
  addressLine2?: string;
  locality?: string;
  city: string;
  state?: string;
  postalCode: string;
  country?: string;
  street?: string; // Legacy compatibility
  landmark?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  location?: { lat: number; lng: number }; // Legacy compatibility
}

export interface User {
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
  avatarUrl?: string;
  preferences?: {
    pureVegOnly?: boolean;
    smsNotifications?: boolean;
    whatsappNotifications?: boolean;
  };
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

export interface MenuItem {
  _id: string;
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
  isSpecial?: boolean;
  preparationTimeMinutes: number;
  rating?: number;
  orderCount?: number;
}

export interface Restaurant {
  _id: string;
  name: string;
  slug: string;
  ownerId: string;
  operatingMode: OperatingMode;
  cuisineTypes: string[];
  description: string;
  heroImage: string;
  logoImage?: string;
  address: Address;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  maxDeliveryRadiusKm?: number;
  deliveryZones: Array<{
    maxDistanceKm: number;
    deliveryFee: number;
    minOrderAmount: number;
  }>;
  businessHours: Array<{
    day: number;
    open: string;
    close: string;
    isClosed: boolean;
  }>;
  fssaiLicenseNumber: string;
  gstinNumber?: string;
  commissionRate: number;
  averageRating: number;
  totalReviews: number;
  isActive: boolean;
  verificationStatus: VerificationStatus;
  computedDistanceKm?: number;
  isDeliveringToUser?: boolean;
  featured?: boolean;
  specialOffers?: string[];
  tableCapacity?: number;
  priceRange?: '₹' | '₹₹' | '₹₹₹' | '₹₹₹₹';
}

export interface Table {
  _id: string;
  restaurantId: string;
  tableNumber: string;
  capacity: number;
  zone: TableZone;
  minPartySize: number;
  isActive: boolean;
}

export interface CartItem {
  menuItemId: string;
  name: string;
  basePrice: number;
  unitPrice: number;
  quantity: number;
  selectedVariant?: string;
  selectedModifiers?: Array<{ groupName: string; optionName: string; price: number }>;
  totalPrice: number;
  notes?: string;
  dietaryTag?: DietaryTag;
  imageUrl?: string;
}

export interface PricingBreakdown {
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
    platformCommission: number;
    netToRestaurant: number;
  };
}

export interface RiderDetails {
  id: string;
  name: string;
  phone: string;
  photoUrl: string;
  vehicleType: 'BIKE' | 'SCOOTER' | 'EV';
  vehicleNumber: string;
  rating: number;
  totalTrips: number;
  currentLocation?: { lat: number; lng: number };
  etaMinutes?: number;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  title: string;
  description: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  restaurantId: Restaurant | string;
  restaurantName?: string;
  customerId: User | string;
  customerName?: string;
  orderType: OrderType;
  items: Array<{
    menuItemId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    variant?: string;
    modifiers?: Array<{ groupName: string; optionName: string; price: number }>;
    totalPrice: number;
    dietaryTag?: DietaryTag;
  }>;
  subtotal: number;
  deliveryFee: number;
  packagingFee: number;
  platformFee: number;
  gstAmount: number;
  tip: number;
  discountAmount: number;
  totalAmount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUND_PENDING' | 'REFUNDED';
  paymentMethod?: 'UPI' | 'CARD' | 'NETBANKING' | 'COD';
  orderStatus: OrderStatus;
  deliveryAddress?: Address;
  customerPhone?: string;
  whatsappOptIn?: boolean;
  estimatedDeliveryTime?: string;
  scheduledFor?: string;
  deliveryOtp?: string;
  assignedRider?: RiderDetails;
  timeline?: OrderTimelineEvent[];
  cancelReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Reservation {
  _id: string;
  restaurantId: Restaurant | string;
  restaurantName?: string;
  customerId: User | string;
  customerName?: string;
  tableId: Table | string;
  tableNumber?: string;
  guestCount: number;
  reservationDate: string;
  timeSlot: string;
  durationMinutes: number;
  status: ReservationStatus;
  depositAmount: number;
  qrCodeToken: string;
  customerPhone?: string;
  whatsappOptIn?: boolean;
  specialRequests?: string;
  createdAt: string;
}

export interface NotificationDeliveryLog {
  id: string;
  channel: 'WHATSAPP' | 'SMS' | 'EMAIL' | 'IN_APP';
  recipient: string;
  status: 'DELIVERED_SANDBOX' | 'FAILED' | 'SENT_LIVE';
  title: string;
  messageText: string;
  whatsappShareUrl?: string;
  timestamp: string;
  templateUsed: string;
}

export interface NotificationPreview {
  type: 'ORDER_CONFIRMATION' | 'RESERVATION_CONFIRMATION';
  normalizedPhone: string;
  whatsAppMessage: string;
  smsMessage: string;
  whatsappShareUrl: string;
}

export interface Review {
  _id: string;
  restaurantId: string;
  orderId?: string;
  userId: { _id: string; fullName: string; avatar?: string };
  foodRating: number;
  deliveryRating?: number;
  packagingRating?: number;
  rating: number; // overall
  comment: string;
  isVerifiedDiner: boolean;
  ownerResponse?: string;
  createdAt: string;
}

export interface CulinaryEvent {
  _id: string;
  restaurantId: string;
  restaurantName: string;
  title: string;
  description: string;
  bannerImage: string;
  eventDate: string;
  timeSlot: string;
  ticketPrice: number; // INR (₹)
  totalCapacity: number;
  bookedCount: number;
  cuisine: string;
  tags: string[];
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
  highlights: string[];
  chefName?: string;
}

export interface EventBooking {
  _id: string;
  eventId: string;
  eventTitle: string;
  restaurantName: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  ticketsCount: number;
  totalAmount: number;
  bookingDate: string;
  eventDate: string;
  timeSlot: string;
  status: 'CONFIRMED' | 'CANCELLED';
  qrCodeToken: string;
}

export interface Promotion {
  _id: string;
  restaurantId?: string; // Optional if platform-wide
  code: string;
  title: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  maxDiscount?: number;
  minOrderAmount: number;
  validUntil: string;
  isActive: boolean;
  usageCount: number;
  scope: 'ALL_RESTAURANTS' | 'SPECIFIC_RESTAURANT';
}

export interface DeliveryPartner {
  _id: string;
  name: string;
  phone: string;
  email: string;
  avatarUrl: string;
  vehicleType: 'BIKE' | 'SCOOTER' | 'EV';
  vehicleNumber: string;
  drivingLicenseNumber: string;
  aadhaarVerified: boolean;
  rating: number;
  totalTrips: number;
  isOnline: boolean;
  currentLocation: { lat: number; lng: number };
  activeOrderId?: string;
  earningsToday: number;
  earningsThisWeek: number;
  earningsThisMonth: number;
  status: 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE';
}

export interface DeliveryRequest {
  _id: string;
  orderId: string;
  orderNumber: string;
  restaurantId: string;
  restaurantName: string;
  restaurantAddress: Address;
  customerName: string;
  customerPhone: string;
  deliveryAddress: Address;
  restaurantDistanceKm: number;
  customerDistanceKm: number;
  totalDistanceKm: number;
  estimatedPayout: number; // In INR (₹)
  estimatedTimeMinutes: number;
  searchRadiusKm: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  createdAt: string;
  expiresAt: string;
  itemsCount: number;
}

export interface OwnerAIReport {
  reportType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  period: string;
  generatedAt: string;
  summary: string;
  revenue: number;
  ordersCount: number;
  averageOrderValue: number;
  peakHours: string;
  cancellationRate: number;
  topDishes: Array<{ name: string; salesCount: number; revenue: number }>;
  cancellationReasons: Array<{ reason: string; percentage: number }>;
  recommendations: string[];
}

export interface AdminKYCApplication {
  _id: string;
  restaurantName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  city: string;
  address: string;
  fssaiLicenseNumber: string;
  gstinNumber: string;
  operatingMode: OperatingMode;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
  adminNotes?: string;
  submittedAt: string;
  documents: {
    fssaiCertificate: string;
    gstinCertificate: string;
    kitchenHygieneProof: string;
  };
}

export interface AuditLog {
  _id: string;
  action: string;
  performedBy: string;
  userRole: UserRole;
  targetId?: string;
  targetType?: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
  status: 'SUCCESS' | 'WARNING' | 'CRITICAL';
}

export type SocketEventType =
  | 'order:statusChanged'
  | 'order:assigned'
  | 'delivery:request'
  | 'delivery:accepted'
  | 'delivery:pickedUp'
  | 'delivery:locationUpdated'
  | 'delivery:arrived'
  | 'delivery:delivered'
  | 'notification:new';

export interface AppNotification {
  id: string;
  userId?: string;
  targetRole: UserRole | 'all';
  title: string;
  message: string;
  type: 'order' | 'delivery' | 'reservation' | 'system' | 'promotion';
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}
