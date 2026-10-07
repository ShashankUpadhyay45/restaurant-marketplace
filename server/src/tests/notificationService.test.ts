import { describe, it, expect, beforeEach } from 'vitest';
import { NotificationService } from '../services/notificationService.js';

describe('NotificationService — India WhatsApp & SMS Confirmation Engine', () => {
  beforeEach(() => {
    NotificationService.clearLogs();
  });

  describe('Indian Phone Number Normalization', () => {
    it('normalizes 10-digit mobile number to E.164 +91 format', () => {
      const result = NotificationService.normalizeIndianPhone('9876543210');
      expect(result).toBe('+919876543210');
    });

    it('normalizes phone number with leading 0', () => {
      const result = NotificationService.normalizeIndianPhone('09876543210');
      expect(result).toBe('+919876543210');
    });

    it('normalizes phone number with 91 prefix without plus', () => {
      const result = NotificationService.normalizeIndianPhone('919876543210');
      expect(result).toBe('+919876543210');
    });

    it('handles formatted numbers with spaces and dashes', () => {
      const result = NotificationService.normalizeIndianPhone('+91 98765-43210');
      expect(result).toBe('+919876543210');
    });

    it('falls back gracefully to standard Indian demo number when undefined', () => {
      const result = NotificationService.normalizeIndianPhone(undefined);
      expect(result).toBe('+919876543210');
    });
  });

  describe('Order Confirmation Message Builders', () => {
    const mockOrder = {
      orderNumber: 'GF-55101',
      customerName: 'Aarav Sharma',
      restaurantName: 'Doon Bistro & Craft Kitchen',
      restaurantLocality: 'Rajpur Road',
      restaurantCity: 'Dehradun',
      items: [
        { name: 'Kumaoni Pahadi Mutton Curry', quantity: 1, variant: 'Half Handi', totalPrice: 450 },
        { name: 'Garlic Butter Chur Chur Naan', quantity: 2, totalPrice: 180 }
      ],
      totalAmount: 742.50,
      subtotal: 630.00,
      taxesAndFees: 112.50,
      discount: 0,
      deliveryAddress: 'Flat 402, Rajpur Road, Dehradun',
      trackingUrl: 'http://localhost:5173/orders?orderId=12345',
      restaurantPhone: '+91 98765 43210'
    };

    it('formats authentic rich WhatsApp message with emojis, items, and INR pricing', () => {
      const message = NotificationService.formatOrderWhatsAppMessage(mockOrder);
      expect(message).toContain('🍽️ *GourmetFleet — Order Confirmed!*');
      expect(message).toContain('Hi *Aarav Sharma*');
      expect(message).toContain('Doon Bistro & Craft Kitchen');
      expect(message).toContain('Rajpur Road, Dehradun');
      expect(message).toContain('Order #GF-55101');
      expect(message).toContain('*Kumaoni Pahadi Mutton Curry* (Half Handi) — ₹450.00');
      expect(message).toContain('*Total Paid:* *₹742.50*');
      expect(message).toContain('Live Order Tracking');
      expect(message).toContain(mockOrder.trackingUrl);
    });

    it('formats DLT-compliant Indian SMS within compact length', () => {
      const sms = NotificationService.formatOrderSMSMessage({
        orderNumber: mockOrder.orderNumber,
        restaurantName: mockOrder.restaurantName,
        totalAmount: mockOrder.totalAmount,
        trackingUrl: mockOrder.trackingUrl
      });
      expect(sms).toContain('[GURMET]');
      expect(sms).toContain('Order #GF-55101 confirmed');
      expect(sms).toContain('₹742.50');
      expect(sms).toContain('Track live: http://localhost:5173/orders?orderId=12345');
      expect(sms).toContain('- GourmetFleet');
    });
  });

  describe('Reservation Confirmation Message Builders', () => {
    const mockReservation = {
      bookingId: 'TB-9912',
      customerName: 'Priya Joshi',
      restaurantName: 'Mussoorie View Grill & Terrace',
      restaurantLocality: 'Jakhan',
      restaurantCity: 'Dehradun',
      reservationDate: '2026-09-30',
      timeSlot: '20:00',
      guestCount: 4,
      tableNumber: '4',
      qrPassUrl: 'http://localhost:5173/reservations?token=qr_token_9912',
      directionsUrl: 'https://maps.google.com/?q=Mussoorie+View+Grill',
      restaurantPhone: '+91 98765 43211'
    };

    it('formats authentic WhatsApp table reservation confirmation with QR pass & directions', () => {
      const message = NotificationService.formatReservationWhatsAppMessage(mockReservation);
      expect(message).toContain('🥂 *GourmetFleet — Table Reservation Confirmed!*');
      expect(message).toContain('Hi *Priya Joshi*');
      expect(message).toContain('Mussoorie View Grill & Terrace');
      expect(message).toContain('Booking Reference: #TB-9912');
      expect(message).toContain('2026-09-30');
      expect(message).toContain('20:00');
      expect(message).toContain('4 Guests');
      expect(message).toContain('Table 4');
      expect(message).toContain('Digital QR Boarding Pass');
      expect(message).toContain(mockReservation.qrPassUrl);
      expect(message).toContain(mockReservation.directionsUrl);
    });

    it('formats DLT-compliant Indian SMS for table reservation', () => {
      const sms = NotificationService.formatReservationSMSMessage({
        bookingId: mockReservation.bookingId,
        restaurantName: mockReservation.restaurantName,
        reservationDate: mockReservation.reservationDate,
        timeSlot: mockReservation.timeSlot,
        guestCount: mockReservation.guestCount,
        qrPassUrl: mockReservation.qrPassUrl
      });
      expect(sms).toContain('[GURMET]');
      expect(sms).toContain('Table for 4 confirmed');
      expect(sms).toContain('Mussoorie View Grill & Terrace');
      expect(sms).toContain('2026-09-30 at 20:00');
      expect(sms).toContain('Ref #TB-9912');
      expect(sms).toContain('View QR pass:');
    });
  });

  describe('Direct WhatsApp Click-to-Chat Link Generation', () => {
    it('generates properly URI-encoded WhatsApp web/app link', () => {
      const phone = '+919876543210';
      const text = '🍽️ *Test Order* for ₹500';
      const url = NotificationService.generateWhatsAppShareUrl(phone, text);
      expect(url).toContain('https://api.whatsapp.com/send?phone=919876543210&text=');
      expect(url).toContain(encodeURIComponent(text));
    });
  });

  describe('Multi-Channel Dispatch & Log Tracking', () => {
    it('dispatches to both WhatsApp and SMS channels in sandbox mode and logs events', async () => {
      const result = await NotificationService.dispatchMultiChannel({
        recipientPhone: '9876543210',
        recipientEmail: 'diner@example.com',
        type: 'ORDER_CONFIRMATION',
        title: 'Order Confirmed: #GF-1234',
        whatsAppMessage: 'WhatsApp test content',
        smsMessage: '[GURMET] SMS test content'
      });

      expect(result.normalizedPhone).toBe('+919876543210');
      expect(result.whatsAppStatus).toBe('DELIVERED_SANDBOX');
      expect(result.smsStatus).toBe('DELIVERED_SANDBOX');
      expect(result.emailStatus).toBe('DELIVERED_SANDBOX');
      expect(result.logs.length).toBe(3);

      const savedLogs = NotificationService.getLogs();
      expect(savedLogs.length).toBe(3);
      expect(savedLogs.some(l => l.channel === 'WHATSAPP')).toBe(true);
      expect(savedLogs.some(l => l.channel === 'SMS')).toBe(true);
      expect(savedLogs.some(l => l.channel === 'EMAIL')).toBe(true);
    });
  });
});
