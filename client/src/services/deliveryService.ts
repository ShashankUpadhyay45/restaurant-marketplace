import { DeliveryPartner, DeliveryRequest, Order } from '../types';
import { getMockDatabase, saveMockDatabase } from '../data/mockData';
import { orderService } from './orderService';
import { socketBus } from './socket';

const delay = (ms: number = 200) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Delivery Fleet & Rider Management Service Interface
 * 
 * Future Backend Integration:
 * - GET   /api/delivery/requests
 * - POST  /api/delivery/requests/:id/accept
 * - POST  /api/delivery/requests/:id/reject
 * - GET   /api/delivery/active
 * - POST  /api/delivery/orders/:id/arrived-restaurant
 * - POST  /api/delivery/orders/:id/pickup
 * - POST  /api/delivery/orders/:id/arrived-customer
 * - POST  /api/delivery/orders/:id/verify-otp
 * - GET   /api/delivery/earnings
 * - GET   /api/delivery/profile
 * - PATCH /api/delivery/status
 */
export const deliveryService = {
  // TODO: Backend Integration Point: GET /api/delivery/requests
  async getRequests(searchRadiusKm: number = 2): Promise<DeliveryRequest[]> {
    await delay();
    const db = getMockDatabase();
    
    // Simulate auto-expansion if no requests found within 2 km
    let requests = db.deliveryRequests.filter(r => r.status === 'PENDING');
    if (requests.length === 0 && searchRadiusKm < 5) {
      // expand search radius simulation
      return this.getRequests(searchRadiusKm + 2);
    }
    return requests;
  },

  // TODO: Backend Integration Point: POST /api/delivery/requests/:id/accept
  async acceptRequest(requestId: string, riderId: string = 'rider_01'): Promise<{ request: DeliveryRequest; order: Order }> {
    await delay();
    const db = getMockDatabase();
    const reqIdx = db.deliveryRequests.findIndex(r => r._id === requestId);
    if (reqIdx === -1) throw new Error('Delivery request expired or not found');

    const req = db.deliveryRequests[reqIdx];
    req.status = 'ACCEPTED';

    // Update Rider status to ON_TRIP
    const riderIdx = db.riders.findIndex(r => r._id === riderId);
    if (riderIdx !== -1) {
      db.riders[riderIdx].status = 'ON_TRIP';
      db.riders[riderIdx].activeOrderId = req.orderId;
    }

    // Update Order to RIDER_ASSIGNED
    const updatedOrder = await orderService.updateOrderStatus(req.orderId, 'RIDER_ASSIGNED', 'Rider accepted delivery request');
    
    saveMockDatabase(db);
    socketBus.emit('delivery:accepted', { requestId, riderId, orderId: req.orderId });

    return { request: req, order: updatedOrder };
  },

  // TODO: Backend Integration Point: POST /api/delivery/requests/:id/reject
  async rejectRequest(requestId: string): Promise<void> {
    await delay();
    const db = getMockDatabase();
    const req = db.deliveryRequests.find(r => r._id === requestId);
    if (req) {
      req.status = 'REJECTED';
      saveMockDatabase(db);
    }
  },

  // TODO: Backend Integration Point: GET /api/delivery/active
  async getActiveDelivery(riderId: string = 'rider_01'): Promise<{ order: Order; step: 'TO_RESTAURANT' | 'PICKUP' | 'TO_CUSTOMER' | 'ARRIVED_CUSTOMER'; distanceKm: number } | null> {
    await delay();
    const db = getMockDatabase();
    const rider = db.riders.find(r => r._id === riderId) || db.riders[0];
    
    // Find active order assigned to rider that isn't DELIVERED or CANCELLED
    const activeOrder = db.orders.find(o => 
      (o.assignedRider?.id === rider._id || o._id === rider.activeOrderId) &&
      !['DELIVERED', 'CANCELLED', 'REJECTED'].includes(o.orderStatus)
    );

    if (!activeOrder) return null;

    let step: 'TO_RESTAURANT' | 'PICKUP' | 'TO_CUSTOMER' | 'ARRIVED_CUSTOMER' = 'TO_RESTAURANT';
    let distanceKm = 1.4;

    if (activeOrder.orderStatus === 'RIDER_ASSIGNED') {
      step = 'TO_RESTAURANT';
      distanceKm = 1.2;
    } else if (activeOrder.orderStatus === 'READY_FOR_PICKUP') {
      step = 'PICKUP';
      distanceKm = 0.1;
    } else if (activeOrder.orderStatus === 'PICKED_UP' || activeOrder.orderStatus === 'OUT_FOR_DELIVERY') {
      step = 'TO_CUSTOMER';
      distanceKm = 2.4;
    }

    return { order: activeOrder, step, distanceKm };
  },

  // TODO: Backend Integration Point: POST /api/delivery/orders/:id/arrived-restaurant
  async arrivedAtRestaurant(orderId: string): Promise<Order> {
    await delay();
    socketBus.emit('delivery:arrived', { orderId, target: 'RESTAURANT' });
    return orderService.updateOrderStatus(orderId, 'READY_FOR_PICKUP', 'Rider arrived at restaurant location');
  },

  // TODO: Backend Integration Point: POST /api/delivery/orders/:id/pickup
  async confirmPickup(orderId: string): Promise<Order> {
    await delay();
    socketBus.emit('delivery:pickedUp', { orderId });
    return orderService.updateOrderStatus(orderId, 'OUT_FOR_DELIVERY', 'Order picked up and is out for delivery');
  },

  // TODO: Backend Integration Point: POST /api/delivery/orders/:id/arrived-customer
  async arrivedAtCustomer(orderId: string): Promise<Order> {
    await delay();
    socketBus.emit('delivery:arrived', { orderId, target: 'CUSTOMER' });
    return orderService.updateOrderStatus(orderId, 'OUT_FOR_DELIVERY', 'Rider arrived at customer doorstep');
  },

  // TODO: Backend Integration Point: POST /api/delivery/orders/:id/verify-otp
  async verifyDeliveryOtp(orderId: string, otp: string, riderId: string = 'rider_01'): Promise<{ success: boolean; message: string; order?: Order }> {
    await delay();
    const db = getMockDatabase();
    const order = db.orders.find(o => o._id === orderId);

    if (!order) return { success: false, message: 'Order not found' };

    // Valid check (allow correct OTP or demo fallback '1234' / actual OTP)
    if (order.deliveryOtp && order.deliveryOtp !== otp && otp !== '1234') {
      return { success: false, message: 'Invalid 4-digit Delivery OTP. Please ask customer to check SMS/app.' };
    }

    // Mark as delivered
    const updatedOrder = await orderService.updateOrderStatus(orderId, 'DELIVERED', 'Delivered safely and confirmed via customer OTP');

    // Update Rider Earnings and Status
    const rider = db.riders.find(r => r._id === riderId) || db.riders[0];
    const payout = Math.round(order.deliveryFee + (order.tip || 0) + 20); // base + tip + incentive
    rider.earningsToday += payout;
    rider.earningsThisWeek += payout;
    rider.totalTrips += 1;
    rider.status = 'AVAILABLE';
    rider.activeOrderId = undefined;
    saveMockDatabase(db);

    socketBus.emit('delivery:delivered', { orderId, payout });
    return { success: true, message: 'Delivery completed successfully! Payout credited to your wallet.', order: updatedOrder };
  },

  // TODO: Backend Integration Point: GET /api/delivery/profile
  async getRiderProfile(riderId: string = 'rider_01'): Promise<DeliveryPartner> {
    await delay();
    const db = getMockDatabase();
    return db.riders.find(r => r._id === riderId) || db.riders[0];
  },

  // TODO: Backend Integration Point: PATCH /api/delivery/status
  async updateOnlineStatus(riderId: string = 'rider_01', isOnline: boolean): Promise<DeliveryPartner> {
    await delay();
    const db = getMockDatabase();
    const rider = db.riders.find(r => r._id === riderId) || db.riders[0];
    rider.isOnline = isOnline;
    rider.status = isOnline ? 'AVAILABLE' : 'OFFLINE';
    saveMockDatabase(db);
    return rider;
  },

  // TODO: Backend Integration Point: GET /api/delivery/earnings
  async getEarnings(period: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR'): Promise<{
    totalEarnings: number;
    tripsCount: number;
    tipsTotal: number;
    incentives: number;
    breakdown: Array<{ date: string; amount: number; trips: number }>;
  }> {
    await delay();
    const profile = await this.getRiderProfile();

    let total = profile.earningsToday;
    let trips = 8;
    if (period === 'WEEK') { total = profile.earningsThisWeek; trips = 42; }
    if (period === 'MONTH') { total = profile.earningsThisMonth; trips = 186; }
    if (period === 'YEAR') { total = profile.earningsThisMonth * 10; trips = 1920; }

    return {
      totalEarnings: total,
      tripsCount: trips,
      tipsTotal: Math.round(total * 0.18),
      incentives: Math.round(total * 0.12),
      breakdown: [
        { date: 'Mon', amount: Math.round(total * 0.15), trips: Math.round(trips * 0.15) },
        { date: 'Tue', amount: Math.round(total * 0.12), trips: Math.round(trips * 0.12) },
        { date: 'Wed', amount: Math.round(total * 0.14), trips: Math.round(trips * 0.14) },
        { date: 'Thu', amount: Math.round(total * 0.16), trips: Math.round(trips * 0.16) },
        { date: 'Fri', amount: Math.round(total * 0.22), trips: Math.round(trips * 0.22) },
        { date: 'Sat', amount: Math.round(total * 0.28), trips: Math.round(trips * 0.28) },
        { date: 'Sun', amount: Math.round(total * 0.25), trips: Math.round(trips * 0.25) }
      ]
    };
  }
};
