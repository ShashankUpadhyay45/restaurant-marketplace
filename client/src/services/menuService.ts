import { MenuItem } from '../types';
import { getMockDatabase, saveMockDatabase } from '../data/mockData';

const delay = (ms: number = 150) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Menu Inventory & Operations Service Interface
 * 
 * Future Backend Integration:
 * - GET    /api/restaurants/:restaurantId/menu
 * - PATCH  /api/menu/:id/availability
 * - POST   /api/menu
 * - PUT    /api/menu/:id
 * - DELETE /api/menu/:id
 */
export const menuService = {
  // TODO: Backend Integration Point: GET /api/restaurants/:restaurantId/menu
  async getMenu(restaurantId: string): Promise<MenuItem[]> {
    await delay();
    const db = getMockDatabase();
    return db.menuItems.filter(item => item.restaurantId === restaurantId);
  },

  // TODO: Backend Integration Point: GET /api/restaurants/:restaurantId/menu-grouped
  async getMenuByCategory(restaurantId: string): Promise<Record<string, MenuItem[]>> {
    const items = await this.getMenu(restaurantId);
    const grouped: Record<string, MenuItem[]> = {};
    items.forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    });
    return grouped;
  },

  // TODO: Backend Integration Point: PATCH /api/menu/:id/availability
  async toggleAvailability(itemId: string, isAvailable: boolean): Promise<MenuItem> {
    await delay();
    const db = getMockDatabase();
    const idx = db.menuItems.findIndex(m => m._id === itemId);
    if (idx === -1) throw new Error('Menu item not found');

    db.menuItems[idx].isAvailable = isAvailable;
    saveMockDatabase(db);
    return db.menuItems[idx];
  },

  // TODO: Backend Integration Point: PUT /api/menu/:id
  async updateMenuItem(itemId: string, updates: Partial<MenuItem>): Promise<MenuItem> {
    await delay();
    const db = getMockDatabase();
    const idx = db.menuItems.findIndex(m => m._id === itemId);
    if (idx === -1) throw new Error('Menu item not found');

    const updated = { ...db.menuItems[idx], ...updates };
    db.menuItems[idx] = updated;
    saveMockDatabase(db);
    return updated;
  },

  // TODO: Backend Integration Point: POST /api/menu
  async addMenuItem(item: Omit<MenuItem, '_id'>): Promise<MenuItem> {
    await delay();
    const db = getMockDatabase();
    const newItem: MenuItem = {
      ...item,
      _id: `item_${Date.now()}`
    };
    db.menuItems.unshift(newItem);
    saveMockDatabase(db);
    return newItem;
  },

  // TODO: Backend Integration Point: DELETE /api/menu/:id
  async deleteMenuItem(itemId: string): Promise<void> {
    await delay();
    const db = getMockDatabase();
    db.menuItems = db.menuItems.filter(m => m._id !== itemId);
    saveMockDatabase(db);
  }
};
