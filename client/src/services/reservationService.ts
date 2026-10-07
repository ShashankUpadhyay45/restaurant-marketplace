import { Reservation, ReservationStatus } from '../types';
import { getMockDatabase, saveMockDatabase } from '../data/mockData';

const delay = (ms: number = 200) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Table Reservation & Guest Management Service Interface
 * 
 * Future Backend Integration:
 * - POST /api/reservations
 * - GET  /api/reservations
 * - GET  /api/reservations/:id
 * - PATCH /api/reservations/:id/status
 * - POST /api/reservations/:id/cancel
 */
export const reservationService = {
  // TODO: Backend Integration Point: POST /api/reservations
  async createReservation(data: Partial<Reservation>): Promise<Reservation> {
    await delay();
    const db = getMockDatabase();
    const qrCodeToken = `GF-RES-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRes: Reservation = {
      _id: `res_${Date.now()}`,
      restaurantId: data.restaurantId || 'rest_dehradun_01',
      restaurantName: data.restaurantName || 'Doon Bistro & Craft Kitchen',
      customerId: data.customerId || 'user_cust_01',
      customerName: data.customerName || 'Aarav Sharma',
      customerPhone: data.customerPhone || '+919876543210',
      tableId: data.tableId || 'tbl_01',
      tableNumber: data.tableNumber || 'Table T-02 (Garden)',
      guestCount: data.guestCount || 2,
      reservationDate: data.reservationDate || new Date().toISOString().split('T')[0],
      timeSlot: data.timeSlot || '08:00 PM',
      durationMinutes: data.durationMinutes || 120,
      status: 'CONFIRMED',
      depositAmount: data.depositAmount || 0,
      qrCodeToken,
      whatsappOptIn: data.whatsappOptIn ?? true,
      specialRequests: data.specialRequests || '',
      createdAt: new Date().toISOString()
    };

    db.reservations.unshift(newRes);
    saveMockDatabase(db);
    return newRes;
  },

  // TODO: Backend Integration Point: GET /api/reservations
  async getReservations(filters: { customerId?: string; restaurantId?: string } = {}): Promise<Reservation[]> {
    await delay();
    const db = getMockDatabase();
    let results = [...db.reservations];

    if (filters.customerId) {
      results = results.filter(r => r.customerId === filters.customerId);
    }
    if (filters.restaurantId) {
      results = results.filter(r => r.restaurantId === filters.restaurantId);
    }

    return results;
  },

  // TODO: Backend Integration Point: GET /api/reservations/:id
  async getReservationById(id: string): Promise<Reservation | null> {
    await delay();
    const db = getMockDatabase();
    return db.reservations.find(r => r._id === id || r.qrCodeToken === id) || null;
  },

  // TODO: Backend Integration Point: PATCH /api/reservations/:id/status
  async updateReservationStatus(id: string, status: ReservationStatus): Promise<Reservation> {
    await delay();
    const db = getMockDatabase();
    const idx = db.reservations.findIndex(r => r._id === id);
    if (idx === -1) throw new Error('Reservation not found');

    db.reservations[idx].status = status;
    saveMockDatabase(db);
    return db.reservations[idx];
  },

  // TODO: Backend Integration Point: POST /api/reservations/:id/cancel
  async cancelReservation(id: string): Promise<Reservation> {
    return this.updateReservationStatus(id, 'CANCELLED');
  }
};
