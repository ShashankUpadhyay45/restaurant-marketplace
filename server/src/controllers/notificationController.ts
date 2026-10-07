import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { NotificationService } from '../services/notificationService.js';
import { Order } from '../models/Order.js';
import { Reservation } from '../models/Reservation.js';
import { Restaurant } from '../models/Restaurant.js';

export class NotificationController {
  /**
   * Retrieves recent notification delivery logs for audit / sandbox inspection
   */
  public static async getRecentLogs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const recipient = (req.query.recipient as string) || (req.user?.phone || req.user?.email);

      const logs = NotificationService.getLogs(limit, recipient);
      res.json({
        success: true,
        count: logs.length,
        logs
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch logs.' });
    }
  }

  /**
   * Generates a real-time preview of formatted WhatsApp & SMS confirmation messages
   */
  public static async getPreview(req: Request, res: Response): Promise<void> {
    try {
      const type = (req.params.type || 'ORDER_CONFIRMATION').toUpperCase();
      const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;

      if (type === 'ORDER_CONFIRMATION') {
        const previewOrder = {
          orderNumber: 'GF-98421',
          customerName: 'Aarav Sharma',
          restaurantName: 'Doon Bistro & Craft Kitchen',
          restaurantLocality: 'Rajpur Road',
          restaurantCity: 'Dehradun',
          items: [
            { name: 'Kumaoni Pahadi Mutton Curry', quantity: 1, variant: 'Half Handi', totalPrice: 450.00 },
            { name: 'Himalayan Truffle Risotto', quantity: 1, totalPrice: 380.00 },
            { name: 'Garlic Butter Chur Chur Naan', quantity: 2, totalPrice: 180.00 }
          ],
          subtotal: 1010.00,
          taxesAndFees: 122.50,
          discount: 100.00,
          totalAmount: 1032.50,
          deliveryAddress: 'Flat 402, Pine Crest Apartments, Rajpur Road, Dehradun - 248001',
          trackingUrl: `${origin}/orders?orderId=mock_order_123`,
          restaurantPhone: '+91 98765 43210'
        };

        const whatsAppMessage = NotificationService.formatOrderWhatsAppMessage(previewOrder);
        const smsMessage = NotificationService.formatOrderSMSMessage({
          orderNumber: previewOrder.orderNumber,
          restaurantName: previewOrder.restaurantName,
          totalAmount: previewOrder.totalAmount,
          trackingUrl: previewOrder.trackingUrl
        });

        const normalizedPhone = '+919876543210';
        const whatsAppShareUrl = NotificationService.generateWhatsAppShareUrl(normalizedPhone, whatsAppMessage);

        res.json({
          success: true,
          type: 'ORDER_CONFIRMATION',
          normalizedPhone,
          whatsAppMessage,
          smsMessage,
          whatsAppShareUrl
        });
        return;
      }

      if (type === 'RESERVATION_CONFIRMATION') {
        const previewReservation = {
          bookingId: 'TB-7842',
          customerName: 'Priya Joshi',
          restaurantName: 'Mussoorie View Grill & Terrace',
          restaurantLocality: 'Jakhan',
          restaurantCity: 'Dehradun',
          reservationDate: '2026-09-29',
          timeSlot: '20:00 (Dinner)',
          guestCount: 4,
          tableNumber: '12 (Mountain Terrace)',
          qrPassUrl: `${origin}/reservations?token=mock_qr_token_7842`,
          directionsUrl: `https://maps.google.com/?q=${encodeURIComponent('Mussoorie View Grill, Jakhan, Dehradun')}`,
          restaurantPhone: '+91 98765 43211'
        };

        const whatsAppMessage = NotificationService.formatReservationWhatsAppMessage(previewReservation);
        const smsMessage = NotificationService.formatReservationSMSMessage({
          bookingId: previewReservation.bookingId,
          restaurantName: previewReservation.restaurantName,
          reservationDate: previewReservation.reservationDate,
          timeSlot: previewReservation.timeSlot,
          guestCount: previewReservation.guestCount,
          qrPassUrl: previewReservation.qrPassUrl
        });

        const normalizedPhone = '+919876543210';
        const whatsAppShareUrl = NotificationService.generateWhatsAppShareUrl(normalizedPhone, whatsAppMessage);

        res.json({
          success: true,
          type: 'RESERVATION_CONFIRMATION',
          normalizedPhone,
          whatsAppMessage,
          smsMessage,
          whatsAppShareUrl
        });
        return;
      }

      res.status(400).json({ success: false, message: 'Invalid preview type. Use ORDER_CONFIRMATION or RESERVATION_CONFIRMATION.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to generate preview.' });
    }
  }

  /**
   * Resends confirmation on WhatsApp and SMS for an order or reservation
   */
  public static async resendConfirmation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { entityType, entityId, phone } = req.body;
      const targetPhone = phone || req.user?.phone || '+919876543210';
      const clientOrigin = req.headers.origin || `${req.protocol}://${req.get('host')}`;

      if (entityType === 'ORDER') {
        const order = await Order.findById(entityId);
        if (!order) {
          res.status(404).json({ success: false, message: 'Order not found.' });
          return;
        }
        const restaurant = await Restaurant.findById(order.restaurantId);
        if (!restaurant) {
          res.status(404).json({ success: false, message: 'Restaurant not found.' });
          return;
        }

        const dispatchResult = await NotificationService.dispatchOrderConfirmation({
          order,
          restaurant,
          customerName: req.user?.fullName || 'Valued Guest',
          customerPhone: targetPhone,
          customerEmail: req.user?.email,
          baseUrl: clientOrigin
        });

        res.json({
          success: true,
          message: `Confirmation successfully resent to ${dispatchResult.normalizedPhone} via WhatsApp & SMS.`,
          dispatchResult
        });
        return;
      }

      if (entityType === 'RESERVATION') {
        const reservation = await Reservation.findById(entityId);
        if (!reservation) {
          res.status(404).json({ success: false, message: 'Reservation not found.' });
          return;
        }
        const restaurant = await Restaurant.findById(reservation.restaurantId);
        if (!restaurant) {
          res.status(404).json({ success: false, message: 'Restaurant not found.' });
          return;
        }

        const dispatchResult = await NotificationService.dispatchReservationConfirmation({
          reservation,
          restaurant,
          customerName: req.user?.fullName || 'Valued Guest',
          customerPhone: targetPhone,
          customerEmail: req.user?.email,
          baseUrl: clientOrigin
        });

        res.json({
          success: true,
          message: `Table confirmation successfully resent to ${dispatchResult.normalizedPhone} via WhatsApp & SMS.`,
          dispatchResult
        });
        return;
      }

      res.status(400).json({ success: false, message: 'entityType must be either ORDER or RESERVATION.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to resend confirmation.' });
    }
  }
}
