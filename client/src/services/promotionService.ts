import { Promotion } from '../types';
import { getMockDatabase, saveMockDatabase } from '../data/mockData';

const delay = (ms: number = 150) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Promotions & Discounts Service Interface
 * 
 * Future Backend Integration:
 * - GET  /api/promotions
 * - POST /api/promotions
 * - POST /api/promotions/apply
 * - PATCH /api/promotions/:id/toggle
 */
export const promotionService = {
  // TODO: Backend Integration Point: GET /api/promotions
  async getPromotions(restaurantId?: string): Promise<Promotion[]> {
    await delay();
    const db = getMockDatabase();
    if (!restaurantId) return db.promotions;
    return db.promotions.filter(p => p.scope === 'ALL_RESTAURANTS' || p.restaurantId === restaurantId);
  },

  // TODO: Backend Integration Point: GET /api/promotions/offers
  async getOffers(): Promise<Promotion[]> {
    await delay();
    const db = getMockDatabase();
    return db.promotions.filter(p => p.isActive);
  },

  // TODO: Backend Integration Point: POST /api/promotions/apply
  async applyCoupon(code: string, subtotal: number): Promise<{
    valid: boolean;
    discountAmount: number;
    message: string;
    coupon?: Promotion;
  }> {
    await delay();
    const db = getMockDatabase();
    const upper = code.trim().toUpperCase();
    const promo = db.promotions.find(p => p.code === upper && p.isActive);

    if (!promo) {
      return { valid: false, discountAmount: 0, message: `Coupon code '${upper}' is invalid or expired.` };
    }

    if (subtotal < promo.minOrderAmount) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Add items worth ₹${(promo.minOrderAmount - subtotal).toFixed(0)} more to apply ${promo.code}.`
      };
    }

    let discount = 0;
    if (promo.discountType === 'PERCENTAGE') {
      discount = (subtotal * promo.discountValue) / 100;
      if (promo.maxDiscount && discount > promo.maxDiscount) {
        discount = promo.maxDiscount;
      }
    } else {
      discount = promo.discountValue;
    }

    discount = Math.min(discount, subtotal);
    discount = Math.round(discount);

    return {
      valid: true,
      discountAmount: discount,
      message: `Coupon '${promo.code}' applied! Saved ₹${discount}.`,
      coupon: promo
    };
  },

  // TODO: Backend Integration Point: POST /api/promotions
  async createPromotion(promo: Omit<Promotion, '_id' | 'usageCount'>): Promise<Promotion> {
    await delay();
    const db = getMockDatabase();
    const newPromo: Promotion = {
      ...promo,
      _id: `promo_${Date.now()}`,
      code: promo.code.toUpperCase(),
      usageCount: 0
    };
    db.promotions.unshift(newPromo);
    saveMockDatabase(db);
    return newPromo;
  },

  // TODO: Backend Integration Point: PATCH /api/promotions/:id/toggle
  async togglePromotion(promoId: string, isActive: boolean): Promise<Promotion> {
    await delay();
    const db = getMockDatabase();
    const idx = db.promotions.findIndex(p => p._id === promoId);
    if (idx === -1) throw new Error('Promotion not found');

    db.promotions[idx].isActive = isActive;
    saveMockDatabase(db);
    return db.promotions[idx];
  }
};
