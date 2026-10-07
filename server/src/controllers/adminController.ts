import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Restaurant } from '../models/Restaurant.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';

export class AdminController {
  public static async getPlatformMetrics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const totalRestaurants = await Restaurant.countDocuments();
      const approvedRestaurants = await Restaurant.countDocuments({ verificationStatus: 'APPROVED' });
      const pendingKyc = await Restaurant.countDocuments({ verificationStatus: 'PENDING' });

      const totalUsers = await User.countDocuments();
      const totalOrders = await Order.countDocuments();

      const orders = await Order.find({ orderStatus: { $ne: 'CANCELLED' } });
      const gmv = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const totalPlatformFees = orders.reduce((sum, o) => sum + (o.platformFee || 1.50), 0);
      const estimatedCommissions = orders.reduce((sum, o) => sum + (o.subtotal * 0.10), 0);

      res.json({
        success: true,
        metrics: {
          gmv: parseFloat(gmv.toFixed(2)),
          platformNetRevenue: parseFloat((totalPlatformFees + estimatedCommissions).toFixed(2)),
          totalOrders,
          totalUsers,
          totalRestaurants,
          approvedRestaurants,
          pendingKyc
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch admin metrics.' });
    }
  }

  public static async getAllRestaurants(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status } = req.query;
      const filter: any = {};
      if (status && typeof status === 'string') {
        filter.verificationStatus = status;
      }

      const restaurants = await Restaurant.find(filter)
        .populate('ownerId', 'fullName email phone')
        .sort({ createdAt: -1 });

      res.json({ success: true, restaurants });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch restaurants.' });
    }
  }

  public static async verifyRestaurant(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, notes } = req.body; // 'APPROVED' | 'REJECTED'

      const restaurant = await Restaurant.findById(id);
      if (!restaurant) {
        res.status(404).json({ success: false, message: 'Restaurant not found.' });
        return;
      }

      restaurant.verificationStatus = status;
      if (status === 'APPROVED') {
        restaurant.isActive = true;
      }
      await restaurant.save();

      // Log administrative action
      const log = new AuditLog({
        action: `RESTAURANT_${status}`,
        performedBy: req.user!._id,
        role: req.user!.role,
        targetResource: 'Restaurant',
        targetId: restaurant._id.toString(),
        details: { restaurantName: restaurant.name, status, notes }
      });
      await log.save();

      res.json({
        success: true,
        message: `Restaurant verification set to ${status}.`,
        restaurant
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to verify restaurant.' });
    }
  }

  public static async updateCommission(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { commissionRate } = req.body;

      if (commissionRate === undefined || Number(commissionRate) < 0 || Number(commissionRate) > 30) {
        res.status(400).json({ success: false, message: 'Commission rate must be between 0% and 30%.' });
        return;
      }

      const restaurant = await Restaurant.findByIdAndUpdate(
        id,
        { commissionRate: Number(commissionRate) },
        { new: true }
      );

      if (!restaurant) {
        res.status(404).json({ success: false, message: 'Restaurant not found.' });
        return;
      }

      const log = new AuditLog({
        action: 'UPDATE_COMMISSION_RATE',
        performedBy: req.user!._id,
        role: req.user!.role,
        targetResource: 'Restaurant',
        targetId: restaurant._id.toString(),
        details: { restaurantName: restaurant.name, newRate: commissionRate }
      });
      await log.save();

      res.json({
        success: true,
        message: `Commission rate updated to ${commissionRate}%.`,
        restaurant
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to update commission.' });
    }
  }

  public static async getUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
      res.json({ success: true, users });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch users.' });
    }
  }

  public static async getAuditLogs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const logs = await AuditLog.find()
        .populate('performedBy', 'fullName email')
        .sort({ createdAt: -1 })
        .limit(50);

      res.json({ success: true, logs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch audit logs.' });
    }
  }
}
