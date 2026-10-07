import { AppNotification, UserRole } from '../types';
import { socketBus } from './socket';

const delay = (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms));

const STORAGE_KEY = 'gourmetfleet_app_notifications';

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_01',
    targetRole: 'customer',
    title: 'Order Delivered! 🎉',
    message: 'Your order #GF-93108 from Doon Bistro & Craft Kitchen was delivered safely.',
    type: 'order',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'notif_02',
    targetRole: 'customer',
    title: 'Table Reservation Confirmed 🍽️',
    message: 'Your table T-04 for 4 guests is booked at Doon Bistro for Oct 02 at 08:30 PM.',
    type: 'reservation',
    isRead: false,
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'notif_03',
    targetRole: 'restaurant_owner',
    title: 'Order Delivered & Customer Satisfied ✨',
    message: 'Order #GF-93108 was marked DELIVERED by rider Rajesh Kumar. Payout credited.',
    type: 'order',
    isRead: false,
    createdAt: new Date(Date.now() - 3500000).toISOString()
  },
  {
    id: 'notif_04',
    targetRole: 'delivery_partner',
    title: 'Trip Payout Credited 💰',
    message: '₹95 payout + ₹30 tip for order #GF-93108 has been credited to your daily wallet.',
    type: 'delivery',
    isRead: false,
    createdAt: new Date(Date.now() - 3500000).toISOString()
  },
  {
    id: 'notif_05',
    targetRole: 'admin',
    title: 'New Merchant Application Submitted 📄',
    message: 'Saffron Courtyard & Grill submitted FSSAI license & GSTIN for onboarding verification.',
    type: 'system',
    isRead: false,
    createdAt: new Date(Date.now() - 14400000).toISOString()
  }
];

function loadStoredNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

function saveStoredNotifications(notifs: AppNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
  } catch {}
}

/**
 * Notifications & Communications Service Interface
 * 
 * Future Backend Integration:
 * - GET  /api/notifications?role=:role
 * - POST /api/notifications/:id/read
 * - POST /api/notifications/trigger
 * - GET  /api/notifications/preview/:type
 */
export const notificationService = {
  // TODO: Backend Integration Point: GET /api/notifications?role=:role
  async getNotifications(role?: UserRole): Promise<AppNotification[]> {
    await delay();
    const notifs = loadStoredNotifications();
    if (!role) return notifs;
    return notifs.filter(n => n.targetRole === role || n.targetRole === 'all');
  },

  // TODO: Backend Integration Point: POST /api/notifications/:id/read
  async markAsRead(notificationId: string): Promise<void> {
    await delay(50);
    const notifs = loadStoredNotifications();
    const idx = notifs.findIndex(n => n.id === notificationId);
    if (idx !== -1) {
      notifs[idx].isRead = true;
      saveStoredNotifications(notifs);
    }
  },

  // TODO: Backend Integration Point: POST /api/notifications/mark-all-read
  async markAllAsRead(role?: UserRole): Promise<void> {
    await delay(50);
    const notifs = loadStoredNotifications();
    notifs.forEach(n => {
      if (!role || n.targetRole === role || n.targetRole === 'all') {
        n.isRead = true;
      }
    });
    saveStoredNotifications(notifs);
  },

  // Trigger simulated local notification
  triggerNotification(data: Omit<AppNotification, 'id' | 'isRead' | 'createdAt'>): AppNotification {
    const notifs = loadStoredNotifications();
    const newNotif: AppNotification = {
      ...data,
      id: `notif_${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    notifs.unshift(newNotif);
    saveStoredNotifications(notifs);

    // Emit real-time socket event
    socketBus.emit('notification:new', newNotif);

    return newNotif;
  }
};
