import { describe, it, expect, vi } from 'vitest';
import { PricingEngine } from '../services/pricingEngine.js';
import { Restaurant } from '../models/Restaurant.js';
import { MenuItem } from '../models/MenuItem.js';

describe('PricingEngine Unit & Security Tests (Indian INR Marketplace)', () => {
  it('calculates item subtotals, packaging, GST, platform fee, and net restaurant payout in INR', async () => {
    const mockRestaurantId = '507f1f77bcf86cd799439011';
    const mockItemId = '507f1f77bcf86cd799439022';

    // Mock Restaurant.findById
    vi.spyOn(Restaurant, 'findById').mockResolvedValue({
      _id: mockRestaurantId,
      name: 'The Great Doon Bistro & Bakery',
      isActive: true,
      commissionRate: 10.0
    } as any);

    // Mock MenuItem.findById
    vi.spyOn(MenuItem, 'findById').mockResolvedValue({
      _id: mockItemId,
      restaurantId: mockRestaurantId,
      name: 'Pahari Jhol Chicken',
      basePrice: 380.00, // INR
      isAvailable: true,
      variants: [{ name: 'Sharing Platter', priceDelta: 120.00 }],
      modifierGroups: [
        {
          name: 'Bread',
          minSelection: 0,
          maxSelection: 1,
          options: [{ name: 'Artisanal Bhature', price: 60.00 }]
        }
      ]
    } as any);

    const calculation = await PricingEngine.calculateOrder(
      mockRestaurantId,
      [
        {
          menuItemId: mockItemId,
          quantity: 2,
          variantName: 'Sharing Platter',
          modifierOptionNames: ['Artisanal Bhature']
        }
      ],
      {
        orderType: 'DELIVERY',
        deliveryDistanceKm: 4, // 2km base (₹35) + 2km extra * ₹12 = ₹59.00
        tip: 30.00
      }
    );

    // Unit price = 380 + 120 (variant) + 60 (modifier) = 560.00
    // Subtotal = 560.00 * 2 = 1120.00
    expect(calculation.subtotal).toBe(1120.00);
    expect(calculation.deliveryFee).toBe(59.00);
    expect(calculation.packagingFee).toBe(20.00);
    expect(calculation.platformFee).toBe(10.00);

    // Food GST = 5% of 1120.00 = 56.00
    expect(calculation.breakdown.foodGst).toBe(56.00);
    // Services GST = 18% of (platformFee ₹10 + deliveryFee ₹59 = ₹69) = ₹12.42
    expect(calculation.breakdown.platformServicesGst).toBe(12.42);
    expect(calculation.gstAmount).toBe(68.42);

    // Platform Commission = 10% of 1120.00 = 112.00
    expect(calculation.breakdown.platformCommission).toBe(112.00);
    // Net to restaurant = 1120.00 + 20.00 - 112.00 = 1028.00
    expect(calculation.breakdown.netToRestaurant).toBe(1028.00);

    // Final total check
    // 1120.00 + 59.00 + 20.00 + 10.00 + 68.42 + 30.00 (tip) = 1307.42
    expect(calculation.totalAmount).toBe(1307.42);
  });

  it('rejects order calculation when item is marked out of stock', async () => {
    const mockRestaurantId = '507f1f77bcf86cd799439011';
    const mockItemId = '507f1f77bcf86cd799439033';

    vi.spyOn(Restaurant, 'findById').mockResolvedValue({
      _id: mockRestaurantId,
      isActive: true,
      commissionRate: 10.0
    } as any);

    vi.spyOn(MenuItem, 'findById').mockResolvedValue({
      _id: mockItemId,
      restaurantId: mockRestaurantId,
      name: 'Sold Out Pahari Trout',
      basePrice: 450.00,
      isAvailable: false
    } as any);

    await expect(
      PricingEngine.calculateOrder(mockRestaurantId, [{ menuItemId: mockItemId, quantity: 1 }])
    ).rejects.toThrow('currently out of stock');
  });

  it('applies GOURMET10 coupon correctly for 10% food discount (capped at ₹150)', async () => {
    const mockRestaurantId = '507f1f77bcf86cd799439011';
    const mockItemId = '507f1f77bcf86cd799439044';

    vi.spyOn(Restaurant, 'findById').mockResolvedValue({
      _id: mockRestaurantId,
      isActive: true,
      commissionRate: 10.0
    } as any);

    vi.spyOn(MenuItem, 'findById').mockResolvedValue({
      _id: mockItemId,
      restaurantId: mockRestaurantId,
      name: 'Dal Makhani',
      basePrice: 320.00,
      isAvailable: true,
      variants: [],
      modifierGroups: []
    } as any);

    const calculation = await PricingEngine.calculateOrder(
      mockRestaurantId,
      [{ menuItemId: mockItemId, quantity: 2 }], // subtotal = 640.00
      { couponCode: 'GOURMET10', orderType: 'TAKEOUT' }
    );

    expect(calculation.subtotal).toBe(640.00);
    expect(calculation.discountAmount).toBe(64.00);
  });

  it('applies WELCOME50 coupon for ₹50 discount on orders above ₹199', async () => {
    const mockRestaurantId = '507f1f77bcf86cd799439011';
    const mockItemId = '507f1f77bcf86cd799439044';

    vi.spyOn(Restaurant, 'findById').mockResolvedValue({
      _id: mockRestaurantId,
      isActive: true,
      commissionRate: 10.0
    } as any);

    vi.spyOn(MenuItem, 'findById').mockResolvedValue({
      _id: mockItemId,
      restaurantId: mockRestaurantId,
      name: 'Galouti Kebab',
      basePrice: 420.00,
      isAvailable: true,
      variants: [],
      modifierGroups: []
    } as any);

    const calculation = await PricingEngine.calculateOrder(
      mockRestaurantId,
      [{ menuItemId: mockItemId, quantity: 1 }],
      { couponCode: 'WELCOME50', orderType: 'DELIVERY' }
    );

    expect(calculation.subtotal).toBe(420.00);
    expect(calculation.discountAmount).toBe(50.00);
  });
});
