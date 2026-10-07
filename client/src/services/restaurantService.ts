import { Restaurant, MenuItem, Review } from '../types';
import { getMockDatabase, saveMockDatabase } from '../data/mockData';
import { calculateHaversineDistanceKm } from '../data/indianLocations';

const delay = (ms: number = 200) => new Promise(resolve => setTimeout(resolve, ms));

export interface RestaurantFilterParams {
  city?: string;
  locality?: string;
  mode?: string;
  cuisine?: string;
  search?: string;
  lat?: number;
  lng?: number;
  deliversOnly?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'distance' | 'reviews' | 'deliveryTime';
}

/**
 * Restaurant Discovery & Management Service Interface
 * 
 * Future Backend Integration:
 * - GET    /api/restaurants
 * - GET    /api/restaurants/:id
 * - POST   /api/restaurants
 * - PATCH  /api/restaurants/:id
 * - GET    /api/restaurants/specials
 */
export const restaurantService = {
  // TODO: Backend Integration Point: GET /api/restaurants?<query_params>
  async getRestaurants(params: RestaurantFilterParams = {}): Promise<{ restaurants: Restaurant[]; total: number }> {
    await delay();
    const db = getMockDatabase();
    let results = [...db.restaurants];

    // Filter by City
    if (params.city && params.city !== 'ALL') {
      const targetCity = params.city.toLowerCase().trim();
      results = results.filter(r => r.address.city.toLowerCase() === targetCity);
    }

    // Filter by Locality
    if (params.locality && params.locality !== 'ALL') {
      const targetLoc = params.locality.toLowerCase().trim();
      results = results.filter(r => r.address.locality?.toLowerCase() === targetLoc);
    }

    // Filter by Operating Mode (HYBRID, DELIVERY_ONLY, DINING_ONLY)
    if (params.mode && params.mode !== 'ALL') {
      results = results.filter(r => r.operatingMode === params.mode);
    }

    // Filter by Cuisine
    if (params.cuisine && params.cuisine !== 'ALL') {
      const targetCuisine = params.cuisine.toLowerCase();
      results = results.filter(r => 
        r.cuisineTypes.some(c => c.toLowerCase().includes(targetCuisine))
      );
    }

    // Search query (restaurant name, dish, cuisine, locality)
    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      results = results.filter(r => 
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.address.locality?.toLowerCase().includes(q) ||
        r.address.city.toLowerCase().includes(q) ||
        r.cuisineTypes.some(c => c.toLowerCase().includes(q))
      );
    }

    // Calculate dynamic distance if user GPS coordinates are provided
    if (params.lat && params.lng) {
      results = results.map(r => {
        const coords = r.address.coordinates;
        if (coords) {
          const dist = calculateHaversineDistanceKm(params.lat!, params.lng!, coords.latitude, coords.longitude);
          const maxRadius = r.maxDeliveryRadiusKm || 12;
          return {
            ...r,
            computedDistanceKm: parseFloat(dist.toFixed(1)),
            isDeliveringToUser: r.operatingMode !== 'DINING_ONLY' && dist <= maxRadius
          };
        }
        return r;
      });

      // Filter deliversOnly
      if (params.deliversOnly) {
        results = results.filter(r => r.isDeliveringToUser);
      }

      // Sort by distance if requested
      if (params.sortBy === 'distance') {
        results.sort((a, b) => (a.computedDistanceKm || 999) - (b.computedDistanceKm || 999));
      }
    }

    // Sort by rating or reviews
    if (params.sortBy === 'rating') {
      results.sort((a, b) => b.averageRating - a.averageRating);
    } else if (params.sortBy === 'reviews') {
      results.sort((a, b) => b.totalReviews - a.totalReviews);
    }

    const total = results.length;
    return { restaurants: results, total };
  },

  // TODO: Backend Integration Point: GET /api/restaurants/:id
  async getRestaurantById(id: string, coords?: { lat: number; lng: number }): Promise<{
    restaurant: Restaurant | null;
    menuByCategory: Record<string, MenuItem[]>;
    reviews: Review[];
  }> {
    await delay();
    const db = getMockDatabase();
    let rest = db.restaurants.find(r => r._id === id || r.slug === id) || null;

    if (rest && coords && rest.address.coordinates) {
      const dist = calculateHaversineDistanceKm(coords.lat, coords.lng, rest.address.coordinates.latitude, rest.address.coordinates.longitude);
      rest = {
        ...rest,
        computedDistanceKm: parseFloat(dist.toFixed(1)),
        isDeliveringToUser: rest.operatingMode !== 'DINING_ONLY' && dist <= (rest.maxDeliveryRadiusKm || 12)
      };
    }

    // Group menu items by category
    const items = db.menuItems.filter(m => m.restaurantId === id || (rest && m.restaurantId === rest._id));
    const menuByCategory: Record<string, MenuItem[]> = {};
    items.forEach(item => {
      if (!menuByCategory[item.category]) {
        menuByCategory[item.category] = [];
      }
      menuByCategory[item.category].push(item);
    });

    const reviews = db.reviews.filter(rv => rv.restaurantId === id || (rest && rv.restaurantId === rest._id));

    return { restaurant: rest, menuByCategory, reviews };
  },

  // TODO: Backend Integration Point: GET /api/restaurants/specials
  async getSpecials(city?: string): Promise<MenuItem[]> {
    await delay();
    const db = getMockDatabase();
    let items = db.menuItems.filter(m => m.isSpecial);

    if (city && city !== 'ALL') {
      const cityRests = new Set(
        db.restaurants.filter(r => r.address.city.toLowerCase() === city.toLowerCase()).map(r => r._id)
      );
      items = items.filter(m => cityRests.has(m.restaurantId));
    }

    return items.slice(0, 16);
  },

  // TODO: Backend Integration Point: GET /api/restaurants/featured
  async getFeatured(city?: string): Promise<Restaurant[]> {
    await delay();
    const db = getMockDatabase();
    let featured = db.restaurants.filter(r => r.featured || r.averageRating >= 4.7);
    if (city && city !== 'ALL') {
      featured = featured.filter(r => r.address.city.toLowerCase() === city.toLowerCase());
    }
    return featured.slice(0, 8);
  },

  // TODO: Backend Integration Point: PATCH /api/restaurants/:id
  async updateRestaurant(id: string, updates: Partial<Restaurant>): Promise<Restaurant> {
    await delay();
    const db = getMockDatabase();
    const idx = db.restaurants.findIndex(r => r._id === id);
    if (idx === -1) throw new Error('Restaurant not found');

    const updated = { ...db.restaurants[idx], ...updates };
    db.restaurants[idx] = updated;
    saveMockDatabase(db);
    return updated;
  }
};
