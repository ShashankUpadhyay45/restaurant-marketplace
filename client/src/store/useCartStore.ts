import { create } from 'zustand';
import { CartItem, OrderType } from '../types';

interface CartState {
  restaurantId: string | null;
  restaurantName: string | null;
  items: CartItem[];
  orderType: OrderType;
  tip: number;
  couponCode: string;
  isDrawerOpen: boolean;

  setDrawerOpen: (open: boolean) => void;
  setOrderType: (type: OrderType) => void;
  setTip: (tip: number) => void;
  applyCoupon: (code: string) => void;
  
  addItem: (
    restaurantId: string,
    restaurantName: string,
    item: Omit<CartItem, 'totalPrice'>
  ) => boolean;
  
  updateQuantity: (index: number, quantity: number) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  
  getSubtotal: () => number;
  getTotalItemsCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  restaurantId: null,
  restaurantName: null,
  items: [],
  orderType: 'DELIVERY',
  tip: 30,
  couponCode: '',
  isDrawerOpen: false,

  setDrawerOpen: (open: boolean) => set({ isDrawerOpen: open }),
  setOrderType: (type: OrderType) => set({ orderType: type }),
  setTip: (tip: number) => set({ tip }),
  applyCoupon: (code: string) => set({ couponCode: code }),

  addItem: (restaurantId, restaurantName, item) => {
    const current = get();

    // Check if adding from different restaurant
    if (current.restaurantId && current.restaurantId !== restaurantId && current.items.length > 0) {
      const confirmSwitch = window.confirm(
        `Your cart contains items from "${current.restaurantName}". Starting an order with "${restaurantName}" will reset your cart. Proceed?`
      );
      if (!confirmSwitch) return false;
      
      // Reset cart with new restaurant
      const newItem: CartItem = {
        ...item,
        totalPrice: parseFloat((item.unitPrice * item.quantity).toFixed(2))
      };
      set({
        restaurantId,
        restaurantName,
        items: [newItem],
        isDrawerOpen: true
      });
      return true;
    }

    // Same restaurant or empty cart
    const existingIndex = current.items.findIndex(
      i => i.menuItemId === item.menuItemId && 
           i.selectedVariant === item.selectedVariant &&
           JSON.stringify(i.selectedModifiers) === JSON.stringify(item.selectedModifiers)
    );

    let updatedItems = [...current.items];
    if (existingIndex > -1) {
      const existing = updatedItems[existingIndex];
      const newQty = existing.quantity + item.quantity;
      updatedItems[existingIndex] = {
        ...existing,
        quantity: newQty,
        totalPrice: parseFloat((existing.unitPrice * newQty).toFixed(2))
      };
    } else {
      updatedItems.push({
        ...item,
        totalPrice: parseFloat((item.unitPrice * item.quantity).toFixed(2))
      });
    }

    set({
      restaurantId,
      restaurantName,
      items: updatedItems,
      isDrawerOpen: true
    });
    return true;
  },

  updateQuantity: (index, quantity) => {
    const currentItems = [...get().items];
    if (quantity <= 0) {
      currentItems.splice(index, 1);
    } else {
      const item = currentItems[index];
      currentItems[index] = {
        ...item,
        quantity,
        totalPrice: parseFloat((item.unitPrice * quantity).toFixed(2))
      };
    }

    if (currentItems.length === 0) {
      set({ items: [], restaurantId: null, restaurantName: null });
    } else {
      set({ items: currentItems });
    }
  },

  removeItem: (index) => {
    const currentItems = [...get().items];
    currentItems.splice(index, 1);
    if (currentItems.length === 0) {
      set({ items: [], restaurantId: null, restaurantName: null });
    } else {
      set({ items: currentItems });
    }
  },

  clearCart: () => {
    set({ items: [], restaurantId: null, restaurantName: null, couponCode: '' });
  },

  getSubtotal: () => {
    const total = get().items.reduce((sum, item) => sum + item.totalPrice, 0);
    return parseFloat(total.toFixed(2));
  },

  getTotalItemsCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  }
}));
