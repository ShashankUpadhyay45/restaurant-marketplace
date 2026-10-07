import { CulinaryEvent, EventBooking } from '../types';
import { getMockDatabase, saveMockDatabase } from '../data/mockData';

const delay = (ms: number = 200) => new Promise(resolve => setTimeout(resolve, ms));

const STORAGE_EVENT_BOOKINGS = 'gourmetfleet_event_bookings';

function loadBookings(): EventBooking[] {
  try {
    const raw = localStorage.getItem(STORAGE_EVENT_BOOKINGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBookings(bookings: EventBooking[]): void {
  try {
    localStorage.setItem(STORAGE_EVENT_BOOKINGS, JSON.stringify(bookings));
  } catch {}
}

/**
 * Culinary Events & Masterclasses Service Interface
 * 
 * Future Backend Integration:
 * - GET  /api/events
 * - GET  /api/events/:id
 * - POST /api/events/:id/book
 * - GET  /api/events/:id/bookings
 * - POST /api/events
 */
export const eventService = {
  // TODO: Backend Integration Point: GET /api/events
  async getEvents(filters: { cuisine?: string; restaurantId?: string; status?: string } = {}): Promise<CulinaryEvent[]> {
    await delay();
    const db = getMockDatabase();
    let events = [...db.events];

    if (filters.cuisine && filters.cuisine !== 'ALL') {
      events = events.filter(e => e.cuisine.toLowerCase().includes(filters.cuisine!.toLowerCase()));
    }
    if (filters.restaurantId) {
      events = events.filter(e => e.restaurantId === filters.restaurantId);
    }
    if (filters.status) {
      events = events.filter(e => e.status === filters.status);
    }

    return events;
  },

  // TODO: Backend Integration Point: GET /api/events/:id
  async getEventById(id: string): Promise<CulinaryEvent | null> {
    await delay();
    const db = getMockDatabase();
    return db.events.find(e => e._id === id) || null;
  },

  // TODO: Backend Integration Point: POST /api/events/:id/book
  async bookEvent(
    eventId: string, 
    ticketsCount: number, 
    customer: { id?: string; name: string; phone: string; email?: string }
  ): Promise<EventBooking> {
    await delay();
    const db = getMockDatabase();
    const eventIdx = db.events.findIndex(e => e._id === eventId);
    if (eventIdx === -1) throw new Error('Event not found');

    const ev = db.events[eventIdx];
    const available = ev.totalCapacity - ev.bookedCount;
    if (ticketsCount > available) {
      throw new Error(`Only ${available} tickets remaining for this event.`);
    }

    // Increment booked count
    ev.bookedCount += ticketsCount;
    saveMockDatabase(db);

    const booking: EventBooking = {
      _id: `bk_${Date.now()}`,
      eventId: ev._id,
      eventTitle: ev.title,
      restaurantName: ev.restaurantName,
      customerId: customer.id || 'user_cust_01',
      customerName: customer.name,
      customerPhone: customer.phone,
      ticketsCount,
      totalAmount: ticketsCount * ev.ticketPrice,
      bookingDate: new Date().toISOString(),
      eventDate: ev.eventDate,
      timeSlot: ev.timeSlot,
      status: 'CONFIRMED',
      qrCodeToken: `GF-EVT-${Date.now().toString(36).toUpperCase()}`
    };

    const allBookings = loadBookings();
    allBookings.unshift(booking);
    saveBookings(allBookings);

    return booking;
  },

  // TODO: Backend Integration Point: GET /api/events/:id/bookings
  async getEventBookings(eventId: string): Promise<EventBooking[]> {
    await delay();
    const all = loadBookings();
    return all.filter(b => b.eventId === eventId);
  },

  // TODO: Backend Integration Point: POST /api/events
  async createEvent(eventData: Omit<CulinaryEvent, '_id' | 'bookedCount'>): Promise<CulinaryEvent> {
    await delay();
    const db = getMockDatabase();
    const newEvent: CulinaryEvent = {
      ...eventData,
      _id: `event_${Date.now()}`,
      bookedCount: 0
    };
    db.events.unshift(newEvent);
    saveMockDatabase(db);
    return newEvent;
  }
};
