import { Request, Response } from 'express';
import { Reservation } from '../models/Reservation.js';
import { Restaurant } from '../models/Restaurant.js';
import { Table } from '../models/Table.js';
import { ReservationEngine } from '../services/reservationEngine.js';
import { NotificationService } from '../services/notificationService.js';
import { AuthRequest } from '../middleware/auth.js';
import { getSocketIO } from '../sockets/socketHandler.js';

export class ReservationController {
  public static async checkAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId, date, timeSlot, guestCount } = req.body;

      if (!restaurantId || !date || !timeSlot || !guestCount) {
        res.status(400).json({ 
          success: false, 
          message: 'restaurantId, date (YYYY-MM-DD), timeSlot (HH:mm), and guestCount are required.' 
        });
        return;
      }

      const result = await ReservationEngine.getAvailableTables(
        restaurantId,
        date,
        timeSlot,
        Number(guestCount)
      );

      res.json({
        success: true,
        ...result
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Availability check failed.' });
    }
  }

  public static async createReservation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { restaurantId, date, timeSlot, guestCount, tableId, specialRequests } = req.body;

      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        res.status(404).json({ success: false, message: 'Restaurant not found.' });
        return;
      }

      if (restaurant.operatingMode === 'DELIVERY_ONLY') {
        res.status(400).json({ 
          success: false, 
          message: 'This restaurant is a Delivery-Only cloud kitchen and does not accept table reservations.' 
        });
        return;
      }

      const { reservation, qrCodeDataUrl } = await ReservationEngine.bookTableAtomic(
        restaurantId,
        req.user._id.toString(),
        date,
        timeSlot,
        Number(guestCount),
        tableId,
        specialRequests
      );

      // Notify restaurant floor manager via Socket.IO
      const io = getSocketIO();
      if (io) {
        io.to(`restaurant:${restaurantId}`).emit('reservation:new', {
          reservationId: reservation._id,
          customerName: req.user.fullName,
          date: reservation.reservationDate,
          timeSlot: reservation.timeSlot,
          guestCount: reservation.guestCount,
          qrCodeToken: reservation.qrCodeToken
        });
      }

      const customerPhone = req.body.customerPhone || req.user.phone || '+919876543210';
      const whatsappOptIn = req.body.whatsappOptIn !== false;
      reservation.customerPhone = customerPhone;
      reservation.whatsappOptIn = whatsappOptIn;
      await reservation.save();

      // Dispatch automated notification with Google Maps link, QR pass, and WhatsApp & SMS
      const clientOrigin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
      const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(
        `${restaurant.name}, ${restaurant.address.locality || restaurant.address.street || ''}, ${restaurant.address.city}`
      )}`;

      const notificationDelivery = await NotificationService.dispatchReservationConfirmation({
        reservation,
        restaurant,
        customerName: req.user.fullName,
        customerPhone,
        customerEmail: req.user.email,
        baseUrl: clientOrigin
      });

      res.status(201).json({
        success: true,
        message: 'Table reservation confirmed successfully. Confirmation sent via WhatsApp and SMS.',
        reservation,
        qrCodeDataUrl,
        mapsUrl,
        notificationDelivery
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Failed to create reservation.' });
    }
  }

  public static async getMyReservations(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const reservations = await Reservation.find({ customerId: req.user._id })
        .populate('restaurantId', 'name heroImage address phone')
        .populate('tableId', 'tableNumber zone capacity')
        .sort({ reservationDate: -1, timeSlot: -1 });

      res.json({
        success: true,
        reservations
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch reservations.' });
    }
  }

  public static async cancelReservation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const reservation = await Reservation.findById(id);

      if (!reservation) {
        res.status(404).json({ success: false, message: 'Reservation not found.' });
        return;
      }

      reservation.status = 'CANCELLED';
      await reservation.save();

      // Notify restaurant room
      const io = getSocketIO();
      if (io) {
        io.to(`restaurant:${reservation.restaurantId}`).emit('reservation:cancelled', {
          reservationId: reservation._id,
          date: reservation.reservationDate,
          timeSlot: reservation.timeSlot
        });
      }

      res.json({
        success: true,
        message: 'Reservation cancelled successfully.',
        reservation
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to cancel reservation.' });
    }
  }
}
