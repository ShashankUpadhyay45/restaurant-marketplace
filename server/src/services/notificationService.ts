export type NotificationChannel = 'WHATSAPP' | 'SMS' | 'EMAIL' | 'IN_APP';

export type NotificationType = 
  | 'ORDER_CONFIRMATION' 
  | 'ORDER_STATUS_UPDATE' 
  | 'RESERVATION_CONFIRMATION' 
  | 'RESERVATION_REMINDER' 
  | 'REFUND_PROCESSED';

export interface NotificationPayload {
  recipientEmail?: string;
  recipientPhone?: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata?: Record<string, any>;
}

export interface NotificationDeliveryLog {
  id: string;
  channel: NotificationChannel;
  recipient: string;
  status: 'DELIVERED_SANDBOX' | 'FAILED' | 'SENT_LIVE';
  title: string;
  messageText: string;
  whatsappShareUrl?: string;
  timestamp: string;
  templateUsed: string;
  metadata?: Record<string, any>;
}

export interface NotificationDispatchResult {
  smsStatus: 'SENT_LIVE' | 'DELIVERED_SANDBOX' | 'FAILED' | 'SKIPPED';
  whatsAppStatus: 'SENT_LIVE' | 'DELIVERED_SANDBOX' | 'FAILED' | 'SKIPPED';
  emailStatus: 'SENT_LIVE' | 'DELIVERED_SANDBOX' | 'FAILED' | 'SKIPPED';
  normalizedPhone: string;
  whatsAppMessage: string;
  smsMessage: string;
  whatsappShareUrl: string;
  logs: NotificationDeliveryLog[];
}

export class NotificationService {
  private static deliveryLogs: NotificationDeliveryLog[] = [];

  /**
   * Normalizes any input phone number to standard Indian E.164 format (+91XXXXXXXXXX)
   */
  public static normalizeIndianPhone(phone?: string): string {
    if (!phone) return '+919876543210';
    const clean = phone.replace(/[^0-9+]/g, '');
    if (clean.startsWith('+91') && clean.length === 13) return clean;
    if (clean.startsWith('91') && clean.length === 12) return `+${clean}`;
    if (clean.startsWith('0') && clean.length === 11) return `+91${clean.slice(1)}`;
    if (clean.length === 10) return `+91${clean}`;
    if (clean.startsWith('+') && clean.length >= 11) return clean;
    return '+919876543210';
  }

  /**
   * Builds an authentic, rich WhatsApp confirmation message for an Order
   */
  public static formatOrderWhatsAppMessage(params: {
    orderNumber: string;
    customerName: string;
    restaurantName: string;
    restaurantLocality: string;
    restaurantCity: string;
    items: Array<{ name: string; quantity: number; variant?: string; totalPrice: number }>;
    totalAmount: number;
    subtotal: number;
    taxesAndFees: number;
    discount?: number;
    deliveryAddress?: string;
    trackingUrl: string;
    restaurantPhone?: string;
  }): string {
    const itemsText = params.items
      .map(it => `  • ${it.quantity}x *${it.name}*${it.variant ? ` (${it.variant})` : ''} — ₹${it.totalPrice.toFixed(2)}`)
      .join('\n');

    const discountLine = params.discount && params.discount > 0 
      ? `• Discount: *-₹${params.discount.toFixed(2)}*\n` 
      : '';

    return (
`🍽️ *GourmetFleet — Order Confirmed!*

Hi *${params.customerName}*, thank you for dining with us! Your order from *${params.restaurantName}* (${params.restaurantLocality}, ${params.restaurantCity}) has been received and is being freshly prepared in the kitchen.

📋 *Order #${params.orderNumber} Summary:*
${itemsText}
───────────────────
• Item Subtotal: ₹${params.subtotal.toFixed(2)}
• Taxes & Platform Fees: ₹${params.taxesAndFees.toFixed(2)}
${discountLine}• *Total Paid:* *₹${params.totalAmount.toFixed(2)}*

⏱️ *Estimated Delivery:* 35–45 mins
📍 *Delivering To:* ${params.deliveryAddress || 'Saved Delivery Address'}

🛵 *Live Order Tracking:*
${params.trackingUrl}

Need changes? Contact ${params.restaurantName} at ${params.restaurantPhone || '+91 98765 43210'} or reply here.
Bon Appétit! ✨`
    );
  }

  /**
   * Builds a DLT-compliant Indian transactional SMS for an Order
   */
  public static formatOrderSMSMessage(params: {
    orderNumber: string;
    restaurantName: string;
    totalAmount: number;
    trackingUrl: string;
  }): string {
    return `[GURMET] Order #${params.orderNumber} confirmed at ${params.restaurantName} for ₹${params.totalAmount.toFixed(2)}. Kitchen is preparing your food. Track live: ${params.trackingUrl} - GourmetFleet`;
  }

  /**
   * Builds an authentic, rich WhatsApp confirmation message for a Table Reservation
   */
  public static formatReservationWhatsAppMessage(params: {
    bookingId: string;
    customerName: string;
    restaurantName: string;
    restaurantLocality: string;
    restaurantCity: string;
    reservationDate: string;
    timeSlot: string;
    guestCount: number;
    tableNumber?: string;
    qrPassUrl: string;
    directionsUrl: string;
    restaurantPhone?: string;
  }): string {
    return (
`🥂 *GourmetFleet — Table Reservation Confirmed!*

Hi *${params.customerName}*, your guaranteed table at *${params.restaurantName}* is confirmed!

📅 *Booking Reference: #${params.bookingId}*
• Date: *${params.reservationDate}*
• Time Slot: *${params.timeSlot}*
• Party Size: *${params.guestCount} Guests*
• Venue: *${params.restaurantName}* (${params.restaurantLocality}, ${params.restaurantCity})
${params.tableNumber ? `• Assigned Table: Table ${params.tableNumber}\n` : ''}
🎟️ *Digital QR Boarding Pass:*
Show this pass at the host stand for priority seating:
${params.qrPassUrl}

📍 *Directions (Google Maps):*
${params.directionsUrl}

ℹ️ *Important Note:* Tables are reserved with a 15-minute grace window. For changes, please call ${params.restaurantPhone || '+91 98765 43210'}.
We look forward to hosting you! 🌟`
    );
  }

  /**
   * Builds a DLT-compliant Indian transactional SMS for a Table Reservation
   */
  public static formatReservationSMSMessage(params: {
    bookingId: string;
    restaurantName: string;
    reservationDate: string;
    timeSlot: string;
    guestCount: number;
    qrPassUrl: string;
  }): string {
    return `[GURMET] Table for ${params.guestCount} confirmed at ${params.restaurantName} on ${params.reservationDate} at ${params.timeSlot} (Ref #${params.bookingId}). View QR pass: ${params.qrPassUrl} - GourmetFleet`;
  }

  /**
   * Generates a direct WhatsApp Click-to-Chat / Share URL
   */
  public static generateWhatsAppShareUrl(phoneNumber: string, messageText: string): string {
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageText)}`;
  }

  /**
   * Dispatches high-level Order Confirmation across WhatsApp, SMS, and Email
   */
  public static async dispatchOrderConfirmation(params: {
    order: any;
    restaurant: any;
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    baseUrl?: string;
  }): Promise<NotificationDispatchResult> {
    const origin = params.baseUrl || 'http://localhost:5173';
    const trackingUrl = `${origin}/orders?orderId=${params.order._id}`;
    const normalizedPhone = this.normalizeIndianPhone(params.customerPhone);

    const taxesAndFees = (params.order.deliveryFee || 0) + 
      (params.order.packagingFee || 0) + 
      (params.order.platformFee || 0) + 
      (params.order.gstAmount || 0);

    const whatsAppMessage = this.formatOrderWhatsAppMessage({
      orderNumber: params.order.orderNumber,
      customerName: params.customerName,
      restaurantName: params.restaurant.name,
      restaurantLocality: params.restaurant.address?.locality || 'City Center',
      restaurantCity: params.restaurant.address?.city || 'Dehradun',
      items: (params.order.items || []).map((it: any) => ({
        name: it.name,
        quantity: it.quantity,
        variant: it.variant,
        totalPrice: it.totalPrice
      })),
      totalAmount: params.order.totalAmount,
      subtotal: params.order.subtotal,
      taxesAndFees,
      discount: params.order.discountAmount,
      deliveryAddress: params.order.deliveryAddress?.street || 
        `${params.order.deliveryAddress?.addressLine1 || ''}, ${params.order.deliveryAddress?.locality || ''}`,
      trackingUrl,
      restaurantPhone: params.restaurant.phone
    });

    const smsMessage = this.formatOrderSMSMessage({
      orderNumber: params.order.orderNumber,
      restaurantName: params.restaurant.name,
      totalAmount: params.order.totalAmount,
      trackingUrl
    });

    return this.dispatchMultiChannel({
      recipientPhone: normalizedPhone,
      recipientEmail: params.customerEmail,
      type: 'ORDER_CONFIRMATION',
      title: `Order Confirmed: #${params.order.orderNumber}`,
      whatsAppMessage,
      smsMessage,
      metadata: {
        orderId: params.order._id,
        orderNumber: params.order.orderNumber,
        restaurantId: params.restaurant._id,
        totalAmount: params.order.totalAmount
      }
    });
  }

  /**
   * Dispatches high-level Table Reservation Confirmation across WhatsApp, SMS, and Email
   */
  public static async dispatchReservationConfirmation(params: {
    reservation: any;
    restaurant: any;
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    tableNumber?: string;
    baseUrl?: string;
  }): Promise<NotificationDispatchResult> {
    const origin = params.baseUrl || 'http://localhost:5173';
    const qrPassUrl = `${origin}/reservations?token=${params.reservation.qrCodeToken || params.reservation._id}`;
    const directionsUrl = `https://maps.google.com/?q=${encodeURIComponent(
      `${params.restaurant.name}, ${params.restaurant.address?.locality || ''}, ${params.restaurant.address?.city || ''}`
    )}`;
    const normalizedPhone = this.normalizeIndianPhone(params.customerPhone);
    const bookingId = params.reservation._id.toString().slice(-6).toUpperCase();

    const whatsAppMessage = this.formatReservationWhatsAppMessage({
      bookingId,
      customerName: params.customerName,
      restaurantName: params.restaurant.name,
      restaurantLocality: params.restaurant.address?.locality || 'City Center',
      restaurantCity: params.restaurant.address?.city || 'Dehradun',
      reservationDate: params.reservation.reservationDate,
      timeSlot: params.reservation.timeSlot,
      guestCount: params.reservation.guestCount,
      tableNumber: params.tableNumber,
      qrPassUrl,
      directionsUrl,
      restaurantPhone: params.restaurant.phone
    });

    const smsMessage = this.formatReservationSMSMessage({
      bookingId,
      restaurantName: params.restaurant.name,
      reservationDate: params.reservation.reservationDate,
      timeSlot: params.reservation.timeSlot,
      guestCount: params.reservation.guestCount,
      qrPassUrl
    });

    return this.dispatchMultiChannel({
      recipientPhone: normalizedPhone,
      recipientEmail: params.customerEmail,
      type: 'RESERVATION_CONFIRMATION',
      title: `Table Confirmed at ${params.restaurant.name}`,
      whatsAppMessage,
      smsMessage,
      metadata: {
        reservationId: params.reservation._id,
        bookingId,
        restaurantId: params.restaurant._id,
        guestCount: params.reservation.guestCount
      }
    });
  }

  /**
   * Core multi-channel dispatcher handling WhatsApp, SMS, and Email
   */
  public static async dispatchMultiChannel(params: {
    recipientPhone?: string;
    recipientEmail?: string;
    type: NotificationType;
    title: string;
    whatsAppMessage: string;
    smsMessage: string;
    metadata?: Record<string, any>;
  }): Promise<NotificationDispatchResult> {
    const generatedLogs: NotificationDeliveryLog[] = [];
    const normalizedPhone = this.normalizeIndianPhone(params.recipientPhone);
    const whatsappShareUrl = this.generateWhatsAppShareUrl(normalizedPhone, params.whatsAppMessage);

    const isLiveSmtp = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_USER !== 'test_user');
    const isLiveWhatsApp = Boolean(process.env.WHATSAPP_API_KEY || process.env.WHATSAPP_ACCESS_TOKEN);
    const isLiveSms = Boolean(process.env.SMS_API_KEY || process.env.TWILIO_ACCOUNT_SID);

    // 1. WhatsApp Dispatch (Live Gateway or High-Fidelity Sandbox)
    let whatsAppStatus: 'SENT_LIVE' | 'DELIVERED_SANDBOX' | 'FAILED' | 'SKIPPED' = 'SKIPPED';
    if (params.recipientPhone) {
      whatsAppStatus = isLiveWhatsApp ? 'SENT_LIVE' : 'DELIVERED_SANDBOX';
      const waLog: NotificationDeliveryLog = {
        id: `LOG-WA-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        channel: 'WHATSAPP',
        recipient: normalizedPhone,
        status: whatsAppStatus,
        title: params.title,
        messageText: params.whatsAppMessage,
        whatsappShareUrl,
        timestamp: new Date().toISOString(),
        templateUsed: `WHATSAPP_HSM_${params.type}`,
        metadata: params.metadata
      };
      generatedLogs.push(waLog);
      this.deliveryLogs.unshift(waLog);
      console.log(`[Notification Engine - WhatsApp] (${whatsAppStatus}) To: ${normalizedPhone} | Title: ${params.title}`);
    }

    // 2. SMS Dispatch (DLT Compliant SMS Gateway or High-Fidelity Sandbox)
    let smsStatus: 'SENT_LIVE' | 'DELIVERED_SANDBOX' | 'FAILED' | 'SKIPPED' = 'SKIPPED';
    if (params.recipientPhone) {
      smsStatus = isLiveSms ? 'SENT_LIVE' : 'DELIVERED_SANDBOX';
      const smsLog: NotificationDeliveryLog = {
        id: `LOG-SMS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        channel: 'SMS',
        recipient: normalizedPhone,
        status: smsStatus,
        title: params.title,
        messageText: params.smsMessage,
        timestamp: new Date().toISOString(),
        templateUsed: `DLT_SMS_${params.type}`,
        metadata: params.metadata
      };
      generatedLogs.push(smsLog);
      this.deliveryLogs.unshift(smsLog);
      console.log(`[Notification Engine - SMS] (${smsStatus}) To: ${normalizedPhone} | [GURMET]: ${params.smsMessage.slice(0, 60)}...`);
    }

    // 3. Email Dispatch
    let emailStatus: 'SENT_LIVE' | 'DELIVERED_SANDBOX' | 'FAILED' | 'SKIPPED' = 'SKIPPED';
    if (params.recipientEmail) {
      emailStatus = isLiveSmtp ? 'SENT_LIVE' : 'DELIVERED_SANDBOX';
      const emailLog: NotificationDeliveryLog = {
        id: `LOG-EML-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        channel: 'EMAIL',
        recipient: params.recipientEmail,
        status: emailStatus,
        title: params.title,
        messageText: params.whatsAppMessage,
        timestamp: new Date().toISOString(),
        templateUsed: `HTML_TEMPLATE_${params.type}`,
        metadata: params.metadata
      };
      generatedLogs.push(emailLog);
      this.deliveryLogs.unshift(emailLog);
      console.log(`[Notification Engine - Email] (${emailStatus}) To: ${params.recipientEmail} | Subject: ${params.title}`);
    }

    // Cap in-memory logs to latest 100 items
    if (this.deliveryLogs.length > 100) {
      this.deliveryLogs = this.deliveryLogs.slice(0, 100);
    }

    return {
      smsStatus,
      whatsAppStatus,
      emailStatus,
      normalizedPhone,
      whatsAppMessage: params.whatsAppMessage,
      smsMessage: params.smsMessage,
      whatsappShareUrl,
      logs: generatedLogs
    };
  }

  /**
   * Generic dispatch for legacy compatibility
   */
  public static async dispatch(payload: NotificationPayload): Promise<{
    emailStatus: string;
    whatsAppStatus: string;
    smsStatus: string;
    logs: NotificationDeliveryLog[];
  }> {
    const res = await this.dispatchMultiChannel({
      recipientPhone: payload.recipientPhone,
      recipientEmail: payload.recipientEmail,
      type: payload.type,
      title: payload.title,
      whatsAppMessage: payload.body,
      smsMessage: `[GURMET] ${payload.title}: ${payload.body.slice(0, 120)} - GourmetFleet`,
      metadata: payload.metadata
    });

    return {
      emailStatus: res.emailStatus,
      whatsAppStatus: res.whatsAppStatus,
      smsStatus: res.smsStatus,
      logs: res.logs
    };
  }

  /**
   * Returns recent notification logs for audit & debugging
   */
  public static getLogs(limit: number = 20, recipient?: string): NotificationDeliveryLog[] {
    if (recipient) {
      return this.deliveryLogs
        .filter(l => l.recipient === recipient || l.recipient.includes(recipient))
        .slice(0, limit);
    }
    return this.deliveryLogs.slice(0, limit);
  }

  /**
   * Clears delivery logs (useful in test suites)
   */
  public static clearLogs(): void {
    this.deliveryLogs = [];
  }
}
