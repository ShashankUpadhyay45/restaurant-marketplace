import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Restaurant } from '../models/Restaurant.js';
import { Order } from '../models/Order.js';
import { Reservation } from '../models/Reservation.js';
import { MenuItem } from '../models/MenuItem.js';
import { Table } from '../models/Table.js';
import { AIAssistantService } from '../services/aiAssistantService.js';
import { NotificationService } from '../services/notificationService.js';
import { getSocketIO } from '../sockets/socketHandler.js';
import mongoose from 'mongoose';

export class OwnerController {
  public static async getDashboardMetrics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const restaurantId = req.user?.restaurantId;
      if (!restaurantId) {
        res.status(400).json({ success: false, message: 'User is not assigned to a restaurant.' });
        return;
      }

      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        res.status(404).json({ success: false, message: 'Restaurant not found.' });
        return;
      }

      // Fetch orders for this restaurant
      const orders = await Order.find({ restaurantId }).sort({ createdAt: -1 });
      const completedOrders = orders.filter(o => o.orderStatus === 'DELIVERED');
      const activeOrders = orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.orderStatus));

      const grossSales = orders.reduce((sum, o) => o.orderStatus !== 'CANCELLED' ? sum + o.totalAmount : sum, 0);
      const commissionRate = restaurant.commissionRate || 10.0;
      const totalCommission = parseFloat(((grossSales * commissionRate) / 100).toFixed(2));
      const netPayout = parseFloat((grossSales - totalCommission).toFixed(2));

      const aov = orders.length > 0 ? parseFloat((grossSales / orders.length).toFixed(2)) : 0;

      // Reservations metrics
      const reservations = await Reservation.find({ restaurantId }).sort({ createdAt: -1 });
      const activeReservations = reservations.filter(r => ['PENDING', 'CONFIRMED', 'SEATED'].includes(r.status));
      const completedReservations = reservations.filter(r => r.status === 'COMPLETED');
      const noShows = reservations.filter(r => r.status === 'NO_SHOW');

      // Top selling dishes
      const dishSales: Record<string, { name: string; count: number; revenue: number }> = {};
      for (const ord of orders) {
        for (const it of ord.items) {
          if (!dishSales[it.name]) {
            dishSales[it.name] = { name: it.name, count: 0, revenue: 0 };
          }
          dishSales[it.name].count += it.quantity;
          dishSales[it.name].revenue += it.totalPrice;
        }
      }
      const topDishes = Object.values(dishSales).sort((a, b) => b.count - a.count).slice(0, 5);

      res.json({
        success: true,
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          operatingMode: restaurant.operatingMode,
          commissionRate: restaurant.commissionRate,
          isActive: restaurant.isActive
        },
        metrics: {
          grossSales: parseFloat(grossSales.toFixed(2)),
          totalCommission,
          netPayout,
          aov,
          totalOrdersCount: orders.length,
          activeOrdersCount: activeOrders.length,
          completedOrdersCount: completedOrders.length,
          totalReservationsCount: reservations.length,
          activeReservationsCount: activeReservations.length,
          noShowRate: reservations.length > 0 ? `${Math.round((noShows.length / reservations.length) * 100)}%` : '0%',
          topDishes
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch owner metrics.' });
    }
  }

  public static async getOrders(req: AuthRequest, res: Response): Promise<void> {
    try {
      const restaurantId = req.user?.restaurantId;
      const { status } = req.query;

      const query: any = { restaurantId };
      if (status && typeof status === 'string') {
        query.orderStatus = status;
      }

      const orders = await Order.find(query)
        .populate('customerId', 'fullName phone email')
        .sort({ createdAt: -1 });

      res.json({ success: true, orders });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch orders.' });
    }
  }

  public static async updateOrderStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const restaurantId = req.user?.restaurantId;

      const order = await Order.findOne({ _id: id, restaurantId });
      if (!order) {
        res.status(404).json({ success: false, message: 'Order not found for your restaurant.' });
        return;
      }

      order.orderStatus = status;
      if (status === 'DELIVERED') {
        order.paymentStatus = 'PAID';
      }
      await order.save();

      // Emit real-time status update to customer room
      const io = getSocketIO();
      if (io) {
        io.to(`order:${order._id}`).emit('order:status_update', {
          orderId: order._id,
          orderStatus: status,
          updatedAt: order.updatedAt
        });
        io.to(`restaurant:${restaurantId}`).emit('order:modified', {
          orderId: order._id,
          orderStatus: status
        });
      }

      // If customer phone is present, dispatch WhatsApp & SMS status notification
      if (order.customerPhone) {
        const restaurant = await Restaurant.findById(restaurantId);
        const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
        const trackingUrl = `${origin}/orders?orderId=${order._id}`;
        const readableStatus = status.replace(/_/g, ' ');

        NotificationService.dispatchMultiChannel({
          recipientPhone: order.customerPhone,
          type: 'ORDER_STATUS_UPDATE',
          title: `Order Update: #${order.orderNumber} is ${readableStatus}`,
          whatsAppMessage: `🛵 *GourmetFleet — Order Status Update*\n\nYour order *#${order.orderNumber}* from *${restaurant?.name || 'Restaurant'}* is now *${readableStatus}*.\nTrack live: ${trackingUrl}\n\nThank you for dining with GourmetFleet! ✨`,
          smsMessage: `[GURMET] Order #${order.orderNumber} is now ${readableStatus}. Track live: ${trackingUrl} - GourmetFleet`,
          metadata: { orderId: order._id, orderStatus: status }
        }).catch(err => console.error('[Notification dispatch error]', err));
      }

      res.json({ success: true, message: `Order status updated to ${status}`, order });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to update order status.' });
    }
  }

  public static async getReservations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const restaurantId = req.user?.restaurantId;
      const { date } = req.query;

      const query: any = { restaurantId };
      if (date && typeof date === 'string') {
        query.reservationDate = date;
      }

      const reservations = await Reservation.find(query)
        .populate('customerId', 'fullName phone email')
        .populate('tableId', 'tableNumber capacity zone')
        .sort({ reservationDate: 1, timeSlot: 1 });

      res.json({ success: true, reservations });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch reservations.' });
    }
  }

  public static async updateReservationStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const restaurantId = req.user?.restaurantId;

      const reservation = await Reservation.findOne({ _id: id, restaurantId });
      if (!reservation) {
        res.status(404).json({ success: false, message: 'Reservation not found.' });
        return;
      }

      reservation.status = status;
      await reservation.save();

      res.json({ success: true, message: `Reservation marked as ${status}`, reservation });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to update reservation.' });
    }
  }

  public static async getMenuItems(req: AuthRequest, res: Response): Promise<void> {
    try {
      const restaurantId = req.user?.restaurantId;
      const items = await MenuItem.find({ restaurantId }).sort({ category: 1, name: 1 });
      res.json({ success: true, items });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch menu.' });
    }
  }

  public static async toggleStock(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const restaurantId = req.user?.restaurantId;

      const item = await MenuItem.findOne({ _id: id, restaurantId });
      if (!item) {
        res.status(404).json({ success: false, message: 'Menu item not found.' });
        return;
      }

      item.isAvailable = !item.isAvailable;
      await item.save();

      res.json({ 
        success: true, 
        message: `Item "${item.name}" is now ${item.isAvailable ? 'IN STOCK' : 'OUT OF STOCK'}.`, 
        item 
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to toggle stock.' });
    }
  }

  public static async createMenuItem(req: AuthRequest, res: Response): Promise<void> {
    try {
      const restaurantId = req.user?.restaurantId;
      const { category, name, description, basePrice, imageUrl, dietaryTags, variants, modifierGroups } = req.body;

      if (!category || !name || basePrice === undefined) {
        res.status(400).json({ success: false, message: 'Category, name, and basePrice are required.' });
        return;
      }

      const item = new MenuItem({
        restaurantId,
        category,
        name,
        description: description || '',
        basePrice: Number(basePrice),
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        dietaryTags: dietaryTags || ['VEG'],
        variants: variants || [],
        modifierGroups: modifierGroups || [],
        isAvailable: true
      });

      await item.save();
      res.status(201).json({ success: true, message: 'Menu item created successfully.', item });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to create menu item.' });
    }
  }

  public static async getTables(req: AuthRequest, res: Response): Promise<void> {
    try {
      const restaurantId = req.user?.restaurantId;
      const tables = await Table.find({ restaurantId }).sort({ tableNumber: 1 });
      res.json({ success: true, tables });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch tables.' });
    }
  }

  public static async createTable(req: AuthRequest, res: Response): Promise<void> {
    try {
      const restaurantId = req.user?.restaurantId;
      const { tableNumber, capacity, zone, minPartySize } = req.body;

      if (!tableNumber || !capacity) {
        res.status(400).json({ success: false, message: 'Table number and capacity are required.' });
        return;
      }

      const table = new Table({
        restaurantId,
        tableNumber,
        capacity: Number(capacity),
        zone: zone || 'INDOOR',
        minPartySize: Number(minPartySize || 1),
        isActive: true
      });

      await table.save();
      res.status(201).json({ success: true, message: 'Table created.', table });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to create table.' });
    }
  }

  public static async askAI(req: AuthRequest, res: Response): Promise<void> {
    try {
      const restaurantId = req.user?.restaurantId;
      const { query } = req.body;

      if (!restaurantId) {
        res.status(400).json({ success: false, message: 'User is not associated with any restaurant.' });
        return;
      }

      if (!query || typeof query !== 'string') {
        res.status(400).json({ success: false, message: 'A prompt query is required.' });
        return;
      }

      // Enforce strict tenant isolation: query restaurant intelligence only for this restaurant
      const aiResponse = await AIAssistantService.queryRestaurantIntelligence(
        restaurantId.toString(),
        query
      );

      res.json({
        success: true,
        aiResponse
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'AI Copilot query failed.' });
    }
  }
}
