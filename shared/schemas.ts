export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: 'customer' | 'restaurant_owner';
  restaurantDetails?: {
    name: string;
    cuisineTypes: string[];
    operatingMode: 'DELIVERY_ONLY' | 'DINING_ONLY' | 'HYBRID';
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
    };
    fssaiLicenseNumber: string;
  };
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CalculateOrderInput {
  restaurantId: string;
  items: {
    menuItemId: string;
    quantity: number;
    variantName?: string;
    modifierOptionNames?: string[];
  }[];
  deliveryDistanceKm?: number;
  tip?: number;
  couponCode?: string;
}

export interface CreateOrderInput extends CalculateOrderInput {
  orderType: 'DELIVERY' | 'TAKEOUT';
  deliveryAddress?: {
    street: string;
    city: string;
    state?: string;
    postalCode: string;
  };
  specialInstructions?: string;
}

export interface CreateReservationInput {
  restaurantId: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm
  guestCount: number;
  tableId?: string;
  specialRequests?: string;
}

export interface UpdateOrderStatusInput {
  status: 'CONFIRMED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  cancellationReason?: string;
}

export interface UpdateReservationStatusInput {
  status: 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
}

export interface AIQueryInput {
  query: string;
  contextWindow?: string; // 'TODAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS'
}
