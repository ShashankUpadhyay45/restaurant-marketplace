import { create } from 'zustand';
import { User, UserRole } from '../types';

export const DEMO_USERS: Record<UserRole, User> = {
  customer: {
    id: 'user_cust_01',
    email: 'customer@gourmetfleet.com',
    fullName: 'Aarav Sharma',
    phone: '+919876543210',
    role: 'customer',
    verificationStatus: 'VERIFIED',
    loyaltyPointsBalance: 420,
    membershipTier: 'SILVER',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    savedAddresses: [
      {
        id: 'addr_1',
        label: 'Home',
        addressLine1: 'Flat 402, Pine Crest Apartments',
        addressLine2: 'Near Silver City Mall',
        locality: 'Rajpur Road',
        city: 'Dehradun',
        state: 'Uttarakhand',
        postalCode: '248001',
        coordinates: { latitude: 30.3340, longitude: 78.0580 }
      },
      {
        id: 'addr_2',
        label: 'Office',
        addressLine1: 'IT Park Phase 2, Tower B',
        locality: 'Sahastradhara Road',
        city: 'Dehradun',
        state: 'Uttarakhand',
        postalCode: '248013',
        coordinates: { latitude: 30.3480, longitude: 78.0820 }
      }
    ],
    preferences: {
      pureVegOnly: false,
      smsNotifications: true,
      whatsappNotifications: true
    }
  },
  restaurant_owner: {
    id: 'user_owner_01',
    email: 'vikram@doonbistro.com',
    fullName: 'Vikram Malhotra',
    phone: '+919811223344',
    role: 'restaurant_owner',
    verificationStatus: 'VERIFIED',
    restaurantId: 'rest_dehradun_01', // Doon Bistro & Craft Kitchen
    loyaltyPointsBalance: 1200,
    membershipTier: 'GOLD',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  delivery_partner: {
    id: 'rider_01',
    email: 'rider@gourmetfleet.com',
    fullName: 'Rajesh Kumar',
    phone: '+919822334455',
    role: 'delivery_partner',
    verificationStatus: 'VERIFIED',
    loyaltyPointsBalance: 350,
    membershipTier: 'STANDARD',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  },
  admin: {
    id: 'user_admin_01',
    email: 'admin@gourmetfleet.com',
    fullName: 'Platform Superadmin',
    phone: '+919800000000',
    role: 'admin',
    verificationStatus: 'VERIFIED',
    loyaltyPointsBalance: 5000,
    membershipTier: 'GOLD',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  }
};

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  switchDemoRole: (role: UserRole) => void;
  isCustomer: () => boolean;
  isOwner: () => boolean;
  isDelivery: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: (() => {
    try {
      const saved = localStorage.getItem('gourmetfleet_user');
      return saved ? JSON.parse(saved) : DEMO_USERS.customer;
    } catch {
      return DEMO_USERS.customer;
    }
  })(),
  token: localStorage.getItem('gourmetfleet_token') || 'demo_jwt_token_sample',
  isLoading: false,

  setAuth: (user: User, token: string) => {
    localStorage.setItem('gourmetfleet_user', JSON.stringify(user));
    localStorage.setItem('gourmetfleet_token', token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('gourmetfleet_user');
    localStorage.removeItem('gourmetfleet_token');
    set({ user: null, token: null });
  },

  updateUser: (updatedFields: Partial<User>) => {
    const current = get().user;
    if (current) {
      const merged = { ...current, ...updatedFields };
      localStorage.setItem('gourmetfleet_user', JSON.stringify(merged));
      set({ user: merged });
    }
  },

  switchDemoRole: (role: UserRole) => {
    const demoUser = DEMO_USERS[role];
    localStorage.setItem('gourmetfleet_user', JSON.stringify(demoUser));
    localStorage.setItem('gourmetfleet_token', `demo_token_${role}`);
    set({ user: demoUser, token: `demo_token_${role}` });
  },

  isCustomer: () => get().user?.role === 'customer',
  isOwner: () => get().user?.role === 'restaurant_owner',
  isDelivery: () => get().user?.role === 'delivery_partner',
  isAdmin: () => get().user?.role === 'admin'
}));
