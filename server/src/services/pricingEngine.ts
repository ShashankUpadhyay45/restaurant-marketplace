import { MenuItem, IMenuItem } from '../models/MenuItem.js';
import { Restaurant, IRestaurant } from '../models/Restaurant.js';
import mongoose from 'mongoose';

export interface OrderItemInput {
  menuItemId: string;
  quantity: number;
  variantName?: string;
  modifierOptionNames?: string[];
  notes?: string;
}

export interface CalculatedOrderResult {
  items: Array<{
    menuItemId: mongoose.Types.ObjectId;
    name: string;
    quantity: number;
    unitPrice: number;
    variant?: string;
    modifiers: Array<{ groupName: string; optionName: string; price: number }>;
    totalPrice: number;
    notes?: string;
  }>;
  subtotal: number;
  deliveryFee: number;
  packagingFee: number;
  platformFee: number;
  gstAmount: number;
  tip: number;
  discountAmount: number;
  totalAmount: number;
  breakdown: {
    foodSubtotal: number;
    foodGst: number; // 5%
    platformServicesGst: number; // 18% on platformFee + deliveryFee
    platformCommission: number;
    netToRestaurant: number;
  };
}

export class PricingEngine {
  public static async calculateOrder(
    restaurantId: string,
    rawItems: OrderItemInput[],
    options: {
      orderType?: 'DELIVERY' | 'TAKEOUT';
      deliveryDistanceKm?: number;
      tip?: number;
      couponCode?: string;
    } = {}
  ): Promise<CalculatedOrderResult> {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    if (!restaurant.isActive) {
      throw new Error('This restaurant is currently not accepting orders.');
    }

    if (!rawItems || rawItems.length === 0) {
      throw new Error('Cannot calculate order with empty cart.');
    }

    const calculatedItems = [];
    let subtotal = 0;

    for (const itemInput of rawItems) {
      const menuItem = await MenuItem.findById(itemInput.menuItemId);
      if (!menuItem) {
        throw new Error(`Item ${itemInput.menuItemId} was not found in the restaurant catalog.`);
      }

      if (menuItem.restaurantId.toString() !== restaurantId) {
        throw new Error(`Item "${menuItem.name}" does not belong to this restaurant.`);
      }

      if (!menuItem.isAvailable) {
        throw new Error(`Item "${menuItem.name}" is currently out of stock.`);
      }

      if (itemInput.quantity <= 0) {
        throw new Error(`Quantity for "${menuItem.name}" must be at least 1.`);
      }

      let unitPrice = menuItem.basePrice;
      let chosenVariant: string | undefined = undefined;

      // Handle variant pricing
      if (itemInput.variantName && menuItem.variants && menuItem.variants.length > 0) {
        const variant = menuItem.variants.find(v => v.name.toLowerCase() === itemInput.variantName?.toLowerCase());
        if (variant) {
          unitPrice += variant.priceDelta;
          chosenVariant = variant.name;
        }
      }

      // Handle modifier addons
      const chosenModifiers: Array<{ groupName: string; optionName: string; price: number }> = [];
      if (itemInput.modifierOptionNames && itemInput.modifierOptionNames.length > 0) {
        for (const modName of itemInput.modifierOptionNames) {
          for (const group of menuItem.modifierGroups) {
            const foundOpt = group.options.find(o => o.name.toLowerCase() === modName.toLowerCase());
            if (foundOpt) {
              unitPrice += foundOpt.price;
              chosenModifiers.push({
                groupName: group.name,
                optionName: foundOpt.name,
                price: foundOpt.price
              });
            }
          }
        }
      }

      const itemTotalPrice = parseFloat((unitPrice * itemInput.quantity).toFixed(2));
      subtotal += itemTotalPrice;

      calculatedItems.push({
        menuItemId: menuItem._id as mongoose.Types.ObjectId,
        name: menuItem.name,
        quantity: itemInput.quantity,
        unitPrice: parseFloat(unitPrice.toFixed(2)),
        variant: chosenVariant,
        modifiers: chosenModifiers,
        totalPrice: itemTotalPrice,
        notes: itemInput.notes
      });
    }

    subtotal = parseFloat(subtotal.toFixed(2));

    // Indian Logistics & Packaging (in INR ₹)
    const isTakeout = options.orderType === 'TAKEOUT';
    let deliveryFee = 0;
    if (!isTakeout) {
      const distance = options.deliveryDistanceKm || 3.5;
      // ₹35 base for first 2 km + ₹12 per additional km
      deliveryFee = 35 + Math.max(0, distance - 2) * 12;
      deliveryFee = parseFloat(deliveryFee.toFixed(2));
    }

    const packagingFee = isTakeout ? 15 : 20; // ₹20 delivery packaging, ₹15 takeout
    const platformFee = 10; // Transparent fixed Indian platform convenience fee (₹10)

    // Indian GST: 5% on restaurant food, 18% GST on platform convenience & delivery logistics
    const foodGst = parseFloat((subtotal * 0.05).toFixed(2));
    const platformServicesGst = parseFloat(((platformFee + deliveryFee) * 0.18).toFixed(2));
    const gstAmount = parseFloat((foodGst + platformServicesGst).toFixed(2));

    // Discounts & Coupons
    let discountAmount = 0;
    if (options.couponCode) {
      const code = options.couponCode.toUpperCase().trim();
      if (code === 'GOURMET10') {
        discountAmount = Math.min(150, parseFloat((subtotal * 0.10).toFixed(2))); // 10% off up to ₹150
      } else if (code === 'FREEDELIVERY' && !isTakeout) {
        discountAmount = deliveryFee;
      } else if (code === 'WELCOME50' && subtotal >= 199) {
        discountAmount = 50; // ₹50 off on orders above ₹199
      } else if (code === 'WELCOME20') {
        discountAmount = Math.min(100, parseFloat((subtotal * 0.20).toFixed(2))); // 20% off up to ₹100
      }
    }

    const tip = options.tip ? Math.max(0, parseFloat(options.tip.toFixed(2))) : 0;
    const totalAmount = parseFloat(
      (subtotal + deliveryFee + packagingFee + platformFee + gstAmount + tip - discountAmount).toFixed(2)
    );

    // Platform Commission (e.g. 10% of subtotal)
    const commissionPercent = restaurant.commissionRate || 10.0;
    const platformCommission = parseFloat(((subtotal * commissionPercent) / 100).toFixed(2));
    const netToRestaurant = parseFloat((subtotal + packagingFee - platformCommission).toFixed(2));

    return {
      items: calculatedItems,
      subtotal,
      deliveryFee,
      packagingFee,
      platformFee,
      gstAmount,
      tip,
      discountAmount,
      totalAmount,
      breakdown: {
        foodSubtotal: subtotal,
        foodGst,
        platformServicesGst,
        platformCommission,
        netToRestaurant
      }
    };
  }
}
