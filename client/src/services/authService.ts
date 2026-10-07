import { User, UserRole } from '../types';
import { DEMO_USERS } from '../store/useAuthStore';

// Simulated latency helper
const delay = (ms: number = 250) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Authentication Service Interface & Mock Provider
 * 
 * Future Backend Integration:
 * - POST /api/auth/login
 * - POST /api/auth/register
 * - GET  /api/auth/me
 * - PATCH /api/auth/profile
 */
export const authService = {
  // TODO: Backend Integration Point: POST /api/auth/login
  async login(email: string, _password?: string): Promise<{ user: User; token: string }> {
    await delay();
    
    // Check if matching any of the demo users
    const matchedRole = Object.keys(DEMO_USERS).find(
      key => DEMO_USERS[key as UserRole].email.toLowerCase() === email.toLowerCase()
    ) as UserRole | undefined;

    const user = matchedRole ? DEMO_USERS[matchedRole] : {
      ...DEMO_USERS.customer,
      id: `user_${Date.now()}`,
      email,
      fullName: email.split('@')[0]
    };

    const token = `jwt_mock_${user.role}_${Date.now()}`;
    return { user, token };
  },

  // TODO: Backend Integration Point: POST /api/auth/register
  async register(data: { email: string; fullName: string; phone?: string; role?: UserRole }): Promise<{ user: User; token: string }> {
    await delay();
    const role = data.role || 'customer';
    const user: User = {
      id: `user_${Date.now()}`,
      email: data.email,
      fullName: data.fullName,
      phone: data.phone || '+919876543210',
      role,
      verificationStatus: 'VERIFIED',
      loyaltyPointsBalance: 100, // 100 bonus signup points
      membershipTier: 'STANDARD',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      savedAddresses: []
    };
    const token = `jwt_mock_${role}_${Date.now()}`;
    return { user, token };
  },

  // TODO: Backend Integration Point: GET /api/auth/me
  async getCurrentUser(): Promise<User | null> {
    await delay(100);
    try {
      const saved = localStorage.getItem('gourmetfleet_user');
      return saved ? JSON.parse(saved) : DEMO_USERS.customer;
    } catch {
      return DEMO_USERS.customer;
    }
  },

  // TODO: Backend Integration Point: PATCH /api/auth/profile
  async updateProfile(updates: Partial<User>): Promise<User> {
    await delay();
    const current = await this.getCurrentUser();
    const merged = { ...current, ...updates } as User;
    localStorage.setItem('gourmetfleet_user', JSON.stringify(merged));
    return merged;
  },

  // TODO: Backend Integration Point: POST /api/auth/logout
  async logout(): Promise<void> {
    await delay(50);
    localStorage.removeItem('gourmetfleet_user');
    localStorage.removeItem('gourmetfleet_token');
  }
};
