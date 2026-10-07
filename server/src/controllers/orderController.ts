import { Request, Response } from 'express';
import { Order } from '../models/Order.js';
import { Restaurant } from '../models/Restaurant.js';
import { User } from '../models/User.js';
import { LoyaltyLedger } from '../models/LoyaltyLedger.js';
import { PricingEngine } from '../services/pricingEngine.js';
import { NotificationService } from '../services/notificationService.js';
import { AuthRequest } from '../middleware/auth.js';
import { getSocketIO } from '../sockets/socketHandler.js';
import crypto from 'crypto';

export class OrderController {
  public static async calculate(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId, items, orderType, deliveryDistanceKm, tip, couponCode } = req.body;

      if (!restaurantId || !items || !Array.isArray(items)) {
        res.status(400).json({ success: false, message: 'Invalid payload: restaurantId and items are required.' });
        return;
      }

      const calculation = await PricingEngine.calculateOrder(restaurantId, items, {
        orderType,
        deliveryDistanceKm,
        tip,
        couponCode
      });

      res.json({
        success: true,
        calculation
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Pricing calculation failed.' });
    }
  }

  public static async createOrder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { 
        restaurantId, 
        items, 
        orderType, 
        deliveryAddress, 
        deliveryDistanceKm, 
        tip, 
        couponCode,
        specialInstructions 
      } = req.body;

      if (!req.user) {
        res.status(401).json({ success: false, message: 'Must be logged in to place an order.' });
        return;
      }

      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        res.status(404).json({ success: false, message: 'Restaurant not found.' });
        return;
      }

      if (orderType === 'DELIVERY' && restaurant.operatingMode === 'DINING_ONLY') {
        res.status(400).json({ 
          success: false, 
          message: 'This restaurant operates in Dining-Only mode and does not accept delivery orders.' 
        });
        return;
      }

      // 1. Calculate price deterministically on server (never trust client total)
      const calculation = await PricingEngine.calculateOrder(restaurantId, items, {
        orderType,
        deliveryDistanceKm,
        tip,
        couponCode
      });

      // 2. Generate unique human-readable order number
      const orderNumber = `GF-${Date.now().toString().slice(-5)}${Math.floor(10 + Math.random() * 90)}`;

      // Estimated prep + delivery time: 35-45 minutes
      const estimatedDeliveryTime = new Date(Date.now() + 35 * 60 * 1000);

      // Determine contact phone for SMS and WhatsApp
      const customerPhone = req.body.customerPhone || req.user.phone || '+919876543210';
      const whatsappOptIn = req.body.whatsappOptIn !== false;

      const order = new Order({
        orderNumber,
        restaurantId: restaurant._id,
        customerId: req.user._id,
        customerPhone,
        whatsappOptIn,
        orderType: orderType || 'DELIVERY',
        items: calculation.items,
        subtotal: calculation.subtotal,
        deliveryFee: calculation.deliveryFee,
        packagingFee: calculation.packagingFee,
        platformFee: calculation.platformFee,
        gstAmount: calculation.gstAmount,
        tip: calculation.tip,
        discountAmount: calculation.discountAmount,
        totalAmount: calculation.totalAmount,
        paymentStatus: 'PAID', // Simulated instant checkout
        paymentIntentId: `pi_mock_${crypto.randomBytes(8).toString('hex')}`,
        orderStatus: 'PLACED',
        deliveryAddress: deliveryAddress || (req.user.savedAddresses && req.user.savedAddresses[0]),
        estimatedDeliveryTime,
        cancellationReason: specialInstructions
      });

      await order.save();

      // 3. Award loyalty points (5% of subtotal)
      const pointsEarned = Math.round(calculation.subtotal * 5);
      if (pointsEarned > 0) {
        const newBalance = (req.user.loyaltyPointsBalance || 0) + pointsEarned;
        await User.findByIdAndUpdate(req.user._id, { loyaltyPointsBalance: newBalance });

        const ledgerEntry = new LoyaltyLedger({
          userId: req.user._id,
          points: pointsEarned,
          transactionType: 'EARNED',
          referenceType: 'ORDER',
          referenceId: order._id,
          balanceAfter: newBalance,
          notes: `Loyalty points earned from Order #${order.orderNumber}`
        });
        await ledgerEntry.save();
      }

      // 4. Emit real-time Socket.IO notification to restaurant kitchen display
      const io = getSocketIO();
      if (io) {
        io.to(`restaurant:${restaurantId}`).emit('order:new', {
          orderId: order._id,
          orderNumber: order.orderNumber,
          customerName: req.user.fullName,
          customerPhone,
          itemsCount: order.items.length,
          totalAmount: order.totalAmount,
          orderType: order.orderType,
          createdAt: order.createdAt
        });
      }

      // 5. Send automated confirmation notification via WhatsApp and SMS
      const clientOrigin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
      const notificationDelivery = await NotificationService.dispatchOrderConfirmation({
        order,
        restaurant,
        customerName: req.user.fullName,
        customerPhone,
        customerEmail: req.user.email,
        baseUrl: clientOrigin
      });

      res.status(201).json({
        success: true,
        message: 'Order placed successfully. Confirmation sent on WhatsApp and SMS.',
        order,
        pointsEarned,
        notificationDelivery
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Failed to place order.' });
    }
  }

  public static async getMyOrders(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const orders = await Order.find({ customerId: req.user._id })
        .populate('restaurantId', 'name heroImage cuisineTypes address')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        orders
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch orders.' });
    }
  }

  public static async getOrderById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await Order.findById(id).populate('restaurantId', 'name heroImage phone address');

      if (!order) {
        res.status(404).json({ success: false, message: 'Order not found.' });
        return;
      }

      // Ensure customer owns order or user is owner/admin
      if (
        req.user && 
        req.user.role === 'customer' && 
        order.customerId.toString() !== req.user._id.toString()
      ) {
        res.status(403).json({ success: false, message: 'Access denied.' });
        return;
      }

      res.json({
        success: true,
        order
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch order.' });
    }
  }

  public static async cancelOrder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const order = await Order.findById(id);
      if (!order) {
        res.status(404).json({ success: false, message: 'Order not found.' });
        return;
      }

      if (['READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.orderStatus)) {
        res.status(400).json({ 
          success: false, 
          message: `Order cannot be cancelled in state '${order.orderStatus}'. Please contact restaurant directly.` 
        });
        return;
      }

      order.orderStatus = 'CANCELLED';
      order.cancellationReason = reason || 'Customer requested cancellation';
      order.paymentStatus = 'REFUNDED';
      await order.save();

      // Reverse loyalty points if previously awarded
      const user = await User.findById(order.customerId);
      if (user) {
        const pointsReversed = Math.round(order.subtotal * 5);
        const newBal = Math.max(0, (user.loyaltyPointsBalance || 0) - pointsReversed);
        await User.findByIdAndUpdate(user._id, { loyaltyPointsBalance: newBal });

        const reversalEntry = new LoyaltyLedger({
          userId: user._id,
          points: -pointsReversed,
          transactionType: 'REVERSED',
          referenceType: 'REFUND',
          referenceId: order._id,
          balanceAfter: newBal,
          notes: `Reversal of loyalty points due to cancellation of Order #${order.orderNumber}`
        });
        await reversalEntry.save();
      }

      // Notify kitchen room
      const io = getSocketIO();
      if (io) {
        io.to(`restaurant:${order.restaurantId}`).emit('order:cancelled', {
          orderId: order._id,
          orderNumber: order.orderNumber,
          reason: order.cancellationReason
        });
        io.to(`order:${order._id}`).emit('order:status_update', {
          orderId: order._id,
          orderStatus: 'CANCELLED'
        });
      }

      res.json({
        success: true,
        message: 'Order has been cancelled and refund initiated.',
        order
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to cancel order.' });
    }
  }
}
