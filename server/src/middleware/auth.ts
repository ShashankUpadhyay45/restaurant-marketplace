import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'gourmetfleet_super_secret_jwt_key_2026_dev_mode';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'gourmetfleet_super_refresh_secret_2026_dev_mode';

export function generateToken(user: IUser): string {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      role: user.role,
      restaurantId: user.restaurantId 
    },
    JWT_SECRET,
    { expiresIn: '2h' }
  );
}

export function generateRefreshToken(user: IUser): string {
  return jwt.sign(
    { id: user._id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };

    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401).json({ success: false, message: 'User account not found or token invalid.' });
      return;
    }

    if (user.verificationStatus === 'SUSPENDED') {
      res.status(403).json({ success: false, message: 'Account has been suspended. Please contact support.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

export function requireRole(...roles: Array<'customer' | 'restaurant_owner' | 'admin'>) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        message: `Forbidden. Role '${req.user.role}' is not authorized for this resource.` 
      });
      return;
    }

    next();
  };
}

export function verifyTenantIsolation(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  // Admins bypass tenant isolation
  if (req.user.role === 'admin') {
    next();
    return;
  }

  const targetRestaurantId = req.params.restaurantId || req.body.restaurantId || req.query.restaurantId;

  if (req.user.role === 'restaurant_owner') {
    if (!req.user.restaurantId || (targetRestaurantId && req.user.restaurantId.toString() !== targetRestaurantId.toString())) {
      res.status(403).json({ 
        success: false, 
        message: 'Security Violation: You are not authorized to access or modify data for another restaurant.' 
      });
      return;
    }
  }

  next();
};
