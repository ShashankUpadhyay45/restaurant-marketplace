import { Order, OrderStatus, RiderDetails, OrderTimelineEvent } from '../types';
import { getMockDatabase, saveMockDatabase } from '../data/mockData';
import { socketBus } from './socket';

const delay = (ms: number = 200) => new Promise(resolve => setTimeout(resolve, ms));

const STATUS_TITLES: Record<OrderStatus, { title: string; desc: string }> = {
  PLACED: { title: 'Order Placed', desc: 'Your order was submitted and awaiting kitchen confirmation.' },
  CONFIRMED: { title: 'Order Confirmed', desc: 'The kitchen has accepted your culinary order.' },
  PREPARING: { title: 'Cooking in Progress', desc: 'Chefs are carefully preparing your artisanal dishes.' },
  READY_FOR_PICKUP: { title: 'Ready for Pickup', desc: 'Food is packed in spill-safe thermal packaging.' },
  RIDER_ASSIGNED: { title: 'Delivery Partner Assigned', desc: 'A dedicated rider is en-route to the restaurant.' },
  PICKED_UP: { title: 'Order Picked Up', desc: 'Rider collected package and is heading towards you.' },
  OUT_FOR_DELIVERY: { title: 'Out for Delivery', desc: 'Rider is in your neighborhood.' },
  DELIVERED: { title: 'Delivered Safely', desc: 'Delivered and verified via OTP. Bon appétit!' },
  CANCELLED: { title: 'Order Cancelled', desc: 'Order was cancelled.' },
  REJECTED: { title: 'Order Rejected', desc: 'Restaurant was unable to accept this order.' },
  DELIVERY_FAILED: { title: 'Delivery Failed', desc: 'Customer was unreachable at delivery address.' },
  REFUND_PENDING: { title: 'Refund Pending', desc: 'Payment reversal is being processed.' },
  REFUNDED: { title: 'Refund Completed', desc: 'Refund has been credited back to original payment method.' }
};

/**
 * Order Lifecycle Service Interface
 * 
 * Future Backend Integration:
 * - POST /api/orders
 * - GET  /api/orders
 * - GET  /api/orders/:id
 * - PATCH /api/orders/:id/status
 * - POST /api/orders/:id/cancel
 * - POST /api/orders/:id/assign-rider
 */
export const orderService = {
  // TODO: Backend Integration Point: POST /api/orders
  async createOrder(orderData: Partial<Order>): Promise<Order> {
    await delay();
    const db = getMockDatabase();
    const orderNumber = `GF-${Math.floor(10000 + Math.random() * 90000)}`;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const initialTimeline: OrderTimelineEvent[] = [
      {
        status: 'PLACED',
        timestamp: new Date().toISOString(),
        title: STATUS_TITLES.PLACED.title,
        description: STATUS_TITLES.PLACED.desc
      }
    ];

    const newOrder: Order = {
      _id: `order_${Date.now()}`,
      orderNumber,
      restaurantId: orderData.restaurantId || 'rest_dehradun_01',
      restaurantName: orderData.restaurantName || 'Doon Bistro & Craft Kitchen',
      customerId: orderData.customerId || 'user_cust_01',
      customerName: orderData.customerName || 'Aarav Sharma',
      customerPhone: orderData.customerPhone || '+919876543210',
      orderType: orderData.orderType || 'DELIVERY',
      orderStatus: 'PLACED',
      paymentStatus: 'PAID',
      paymentMethod: orderData.paymentMethod || 'UPI',
      deliveryOtp: otp,
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      deliveryFee: orderData.deliveryFee || 35,
      packagingFee: orderData.packagingFee || 20,
      platformFee: orderData.platformFee || 10,
      gstAmount: orderData.gstAmount || 0,
      tip: orderData.tip || 30,
      discountAmount: orderData.discountAmount || 0,
      totalAmount: orderData.totalAmount || 0,
      deliveryAddress: orderData.deliveryAddress,
      whatsappOptIn: orderData.whatsappOptIn ?? true,
      estimatedDeliveryTime: '35–45 mins',
      scheduledFor: orderData.scheduledFor,
      timeline: initialTimeline,
      createdAt: new Date().toISOString()
    };

    db.orders.unshift(newOrder);

    // Also generate a matching delivery request for delivery partners
    if (newOrder.orderType === 'DELIVERY') {
      const rest = db.restaurants.find(r => r._id === newOrder.restaurantId);
      db.deliveryRequests.unshift({
        _id: `req_${Date.now()}`,
        orderId: newOrder._id,
        orderNumber: newOrder.orderNumber,
        restaurantId: rest?._id || 'rest_dehradun_01',
        restaurantName: rest?.name || newOrder.restaurantName || 'Restaurant Outlet',
        restaurantAddress: rest?.address || {
          city: 'Dehradun',
          postalCode: '248001',
          addressLine1: 'Heritage Boulevard'
        },
        customerName: newOrder.customerName || 'Customer',
        customerPhone: newOrder.customerPhone || '+919876543210',
        deliveryAddress: newOrder.deliveryAddress || {
          city: 'Dehradun',
          postalCode: '248001',
          addressLine1: 'Customer Residence'
        },
        restaurantDistanceKm: 1.4,
        customerDistanceKm: 2.8,
        totalDistanceKm: 4.2,
        estimatedPayout: 85,
        estimatedTimeMinutes: 28,
        searchRadiusKm: 2.0,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 180000).toISOString(),
        itemsCount: newOrder.items.length
      });
    }

    saveMockDatabase(db);

    // Emit real-time creation event
    socketBus.emit('order:statusChanged', { orderId: newOrder._id, status: 'PLACED' });

    // Trigger auto-simulation for interactive demoing
    socketBus.simulateOrderProgression(newOrder._id, (nextStatus) => {
      this.updateOrderStatus(newOrder._id, nextStatus);
    });

    return newOrder;
  },

  // TODO: Backend Integration Point: GET /api/orders
  async getOrders(filters: { customerId?: string; restaurantId?: string; status?: OrderStatus } = {}): Promise<Order[]> {
    await delay();
    const db = getMockDatabase();
    let orders = [...db.orders];

    if (filters.customerId) {
      orders = orders.filter(o => o.customerId === filters.customerId || (typeof o.customerId === 'object' && (o.customerId as any).id === filters.customerId));
    }
    if (filters.restaurantId) {
      orders = orders.filter(o => o.restaurantId === filters.restaurantId || (typeof o.restaurantId === 'object' && (o.restaurantId as any)._id === filters.restaurantId));
    }
    if (filters.status) {
      orders = orders.filter(o => o.orderStatus === filters.status);
    }

    return orders;
  },

  // TODO: Backend Integration Point: GET /api/orders/:id
  async getOrderById(orderId: string): Promise<Order | null> {
    await delay();
    const db = getMockDatabase();
    return db.orders.find(o => o._id === orderId || o.orderNumber === orderId) || null;
  },

  // TODO: Backend Integration Point: PATCH /api/orders/:id/status
  async updateOrderStatus(orderId: string, status: OrderStatus, notes?: string): Promise<Order> {
    const db = getMockDatabase();
    const idx = db.orders.findIndex(o => o._id === orderId || o.orderNumber === orderId);
    if (idx === -1) throw new Error('Order not found');

    const order = db.orders[idx];
    const info = STATUS_TITLES[status] || { title: status, desc: notes || '' };

    const newEvent: OrderTimelineEvent = {
      status,
      timestamp: new Date().toISOString(),
      title: info.title,
      description: notes || info.desc
    };

    const updatedTimeline = [...(order.timeline || []), newEvent];

    // If rider assigned, attach rider details
    let assignedRider = order.assignedRider;
    if (status === 'RIDER_ASSIGNED' && !assignedRider) {
      assignedRider = {
        id: 'rider_01',
        name: 'Rajesh Kumar',
        phone: '+919822334455',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        vehicleType: 'BIKE',
        vehicleNumber: 'UK 07 AF 4821',
        rating: 4.9,
        totalTrips: 482,
        etaMinutes: 14,
        currentLocation: { lat: 30.3340, lng: 78.0580 }
      };
    }

    const updatedOrder: Order = {
      ...order,
      orderStatus: status,
      timeline: updatedTimeline,
      assignedRider,
      updatedAt: new Date().toISOString()
    };

    db.orders[idx] = updatedOrder;
    saveMockDatabase(db);

    socketBus.emit('order:statusChanged', { orderId: order._id, status });
    return updatedOrder;
  },

  // TODO: Backend Integration Point: POST /api/orders/:id/assign-rider
  async assignRider(orderId: string, rider?: RiderDetails): Promise<Order> {
    await delay();
    const db = getMockDatabase();
    const idx = db.orders.findIndex(o => o._id === orderId);
    if (idx === -1) throw new Error('Order not found');

    const assignedRider: RiderDetails = rider || {
      id: 'rider_01',
      name: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      vehicleType: 'BIKE',
      vehicleNumber: 'UK 07 AF 4821',
      rating: 4.8,
      totalTrips: 342,
      etaMinutes: 12
    };

    const updated = {
      ...db.orders[idx],
      assignedRider,
      orderStatus: 'RIDER_ASSIGNED' as OrderStatus
    };
    db.orders[idx] = updated;
    saveMockDatabase(db);

    socketBus.emit('order:assigned', { orderId, rider });
    return updated;
  },

  // TODO: Backend Integration Point: POST /api/orders/:id/cancel
  async cancelOrder(orderId: string, reason: string = 'User requested cancellation'): Promise<Order> {
    return this.updateOrderStatus(orderId, 'CANCELLED', reason);
  },

  // TODO: Backend Integration Point: POST /api/orders/:id/reorder
  async reorder(orderId: string): Promise<Order> {
    const existing = await this.getOrderById(orderId);
    if (!existing) throw new Error('Order not found');
    return this.createOrder({
      restaurantId: existing.restaurantId,
      restaurantName: existing.restaurantName,
      items: existing.items,
      subtotal: existing.subtotal,
      deliveryFee: existing.deliveryFee,
      packagingFee: existing.packagingFee,
      platformFee: existing.platformFee,
      gstAmount: existing.gstAmount,
      totalAmount: existing.totalAmount,
      deliveryAddress: existing.deliveryAddress,
      orderType: existing.orderType
    });
  }
};
