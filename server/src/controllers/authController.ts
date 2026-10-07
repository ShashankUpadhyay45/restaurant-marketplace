import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Restaurant } from '../models/Restaurant.js';
import { generateToken, generateRefreshToken, AuthRequest } from '../middleware/auth.js';
import { AuditLog } from '../models/AuditLog.js';

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, fullName, phone, role, restaurantDetails } = req.body;

      if (!email || !password || !fullName) {
        res.status(400).json({ success: false, message: 'Email, password, and full name are required.' });
        return;
      }

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const targetRole = role === 'restaurant_owner' ? 'restaurant_owner' : 'customer';
      const user = new User({
        email: email.toLowerCase(),
        passwordHash,
        fullName,
        phone,
        role: targetRole,
        verificationStatus: targetRole === 'restaurant_owner' ? 'PENDING' : 'VERIFIED',
        loyaltyPointsBalance: 100, // 100 welcome bonus points
        membershipTier: 'STANDARD'
      });

      // If registering as restaurant owner, initialize their restaurant profile
      if (targetRole === 'restaurant_owner' && restaurantDetails) {
        const slug = restaurantDetails.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.floor(Math.random() * 1000);
        
        const restaurant = new Restaurant({
          name: restaurantDetails.name,
          slug,
          ownerId: user._id,
          operatingMode: restaurantDetails.operatingMode || 'HYBRID',
          cuisineTypes: restaurantDetails.cuisineTypes || ['Continental', 'Contemporary'],
          description: restaurantDetails.description || 'Welcome to an exceptional dining and culinary experience.',
          heroImage: restaurantDetails.heroImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
          address: restaurantDetails.address || {
            street: '100 Culinary Boulevard',
            city: 'Metro City',
            state: 'State',
            postalCode: '110001'
          },
          deliveryZones: [
            { maxDistanceKm: 5, deliveryFee: 2.00, minOrderAmount: 15.00 },
            { maxDistanceKm: 12, deliveryFee: 4.50, minOrderAmount: 25.00 }
          ],
          businessHours: [0, 1, 2, 3, 4, 5, 6].map(day => ({
            day,
            open: '11:00',
            close: '23:00',
            isClosed: false
          })),
          fssaiLicenseNumber: restaurantDetails.fssaiLicenseNumber || 'FSSAI-100240009988',
          gstinNumber: restaurantDetails.gstinNumber || '07AAAAA0000A1Z5',
          commissionRate: 10.0,
          verificationStatus: 'PENDING'
        });

        await restaurant.save();
        user.restaurantId = restaurant._id as any;
      }

      await user.save();

      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        token,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          verificationStatus: user.verificationStatus,
          restaurantId: user.restaurantId,
          loyaltyPointsBalance: user.loyaltyPointsBalance,
          membershipTier: user.membershipTier
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Registration failed.' });
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, message: 'Email and password are required.' });
        return;
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      res.json({
        success: true,
        message: 'Authentication successful.',
        token,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          verificationStatus: user.verificationStatus,
          restaurantId: user.restaurantId,
          loyaltyPointsBalance: user.loyaltyPointsBalance,
          membershipTier: user.membershipTier,
          savedAddresses: user.savedAddresses
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Login failed.' });
    }
  }

  public static async getMe(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        fullName: req.user.fullName,
        phone: req.user.phone,
        role: req.user.role,
        verificationStatus: req.user.verificationStatus,
        restaurantId: req.user.restaurantId,
        loyaltyPointsBalance: req.user.loyaltyPointsBalance,
        membershipTier: req.user.membershipTier,
        savedAddresses: req.user.savedAddresses
      }
    });
  }
}
