import { Request, Response } from 'express';
import { Restaurant } from '../models/Restaurant.js';
import { MenuItem } from '../models/MenuItem.js';
import { Table } from '../models/Table.js';
import { Review } from '../models/Review.js';
import { AuthRequest } from '../middleware/auth.js';
import { calculateHaversineDistanceKm } from '../data/indianLocations.js';

export class RestaurantController {
  public static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { 
        search, 
        cuisine, 
        mode, 
        minRating, 
        city, 
        locality, 
        lat, 
        lng, 
        deliversOnly, 
        sortBy 
      } = req.query;

      const query: any = { isActive: true };

      // Optional verification filter
      if (req.query.approvedOnly === 'true') {
        query.verificationStatus = 'APPROVED';
      }

      if (mode && typeof mode === 'string' && mode !== 'ALL') {
        query.operatingMode = mode.toUpperCase();
      }

      if (cuisine && typeof cuisine === 'string' && cuisine !== 'ALL') {
        query.cuisineTypes = { $in: [new RegExp(cuisine, 'i')] };
      }

      if (minRating && typeof minRating === 'string') {
        query.averageRating = { $gte: parseFloat(minRating) };
      }

      if (city && typeof city === 'string' && city !== 'ALL') {
        query['address.city'] = { $regex: new RegExp(`^${city}$`, 'i') };
      }

      if (locality && typeof locality === 'string' && locality !== 'ALL') {
        query['address.locality'] = { $regex: new RegExp(locality, 'i') };
      }

      if (search && typeof search === 'string' && search.trim()) {
        const s = search.trim();
        query.$or = [
          { name: { $regex: s, $options: 'i' } },
          { cuisineTypes: { $in: [new RegExp(s, 'i')] } },
          { description: { $regex: s, $options: 'i' } },
          { 'address.locality': { $regex: s, $options: 'i' } },
          { 'address.city': { $regex: s, $options: 'i' } }
        ];
      }

      const restaurants = await Restaurant.find(query).lean();

      // If user coordinates provided, calculate distance and delivery eligibility
      const userLat = lat ? parseFloat(lat as string) : undefined;
      const userLng = lng ? parseFloat(lng as string) : undefined;
      const hasUserCoords = userLat !== undefined && !isNaN(userLat) && userLng !== undefined && !isNaN(userLng);

      let enrichedRestaurants = restaurants.map(r => {
        let computedDistanceKm: number | undefined = undefined;
        let isDeliveringToUser: boolean = true;

        if (hasUserCoords) {
          // MongoDB GeoJSON coordinates ordering is [longitude, latitude]
          const rLng = r.location?.coordinates?.[0] ?? r.address?.coordinates?.longitude;
          const rLat = r.location?.coordinates?.[1] ?? r.address?.coordinates?.latitude;

          if (rLat !== undefined && rLng !== undefined) {
            computedDistanceKm = calculateHaversineDistanceKm(userLat!, userLng!, rLat, rLng);
            const maxRadius = r.maxDeliveryRadiusKm || 12;
            isDeliveringToUser = computedDistanceKm <= maxRadius;
          }
        }

        return {
          ...r,
          computedDistanceKm,
          isDeliveringToUser
        };
      });

      // Filter by delivery boundary if requested
      if (deliversOnly === 'true' && hasUserCoords) {
        enrichedRestaurants = enrichedRestaurants.filter(r => r.isDeliveringToUser);
      }

      // Sort
      if (sortBy === 'distance' && hasUserCoords) {
        enrichedRestaurants.sort((a, b) => (a.computedDistanceKm || 9999) - (b.computedDistanceKm || 9999));
      } else if (sortBy === 'rating') {
        enrichedRestaurants.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
      } else {
        // Default: Sort delivering restaurants first, then by rating
        enrichedRestaurants.sort((a, b) => {
          if (a.isDeliveringToUser !== b.isDeliveringToUser) {
            return a.isDeliveringToUser ? -1 : 1;
          }
          return (b.averageRating || 0) - (a.averageRating || 0);
        });
      }

      res.json({
        success: true,
        count: enrichedRestaurants.length,
        restaurants: enrichedRestaurants
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch restaurants.' });
    }
  }

  public static async getNearby(req: Request, res: Response): Promise<void> {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      const radiusKm = parseFloat((req.query.radiusKm as string) || '15');

      if (isNaN(lat) || isNaN(lng)) {
        res.status(400).json({ success: false, message: 'Valid lat and lng query parameters are required.' });
        return;
      }

      // Find all active restaurants
      const all = await Restaurant.find({ isActive: true }).lean();

      const nearby = all.map(r => {
        const rLng = r.location?.coordinates?.[0] ?? r.address?.coordinates?.longitude ?? 78.0322;
        const rLat = r.location?.coordinates?.[1] ?? r.address?.coordinates?.latitude ?? 30.3165;
        const distKm = calculateHaversineDistanceKm(lat, lng, rLat, rLng);
        const isDelivering = distKm <= (r.maxDeliveryRadiusKm || 12);

        return {
          ...r,
          computedDistanceKm: distKm,
          isDeliveringToUser: isDelivering
        };
      })
      .filter(r => r.computedDistanceKm <= radiusKm)
      .sort((a, b) => a.computedDistanceKm - b.computedDistanceKm);

      res.json({
        success: true,
        count: nearby.length,
        restaurants: nearby
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch nearby restaurants.' });
    }
  }

  public static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const restaurant = await Restaurant.findById(id).lean();

      if (!restaurant) {
        res.status(404).json({ success: false, message: 'Restaurant not found.' });
        return;
      }

      // If user coords passed in query, attach distance
      const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
      const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;
      let computedDistanceKm: number | undefined = undefined;
      let isDeliveringToUser: boolean = true;

      if (lat !== undefined && !isNaN(lat) && lng !== undefined && !isNaN(lng)) {
        const rLng = restaurant.location?.coordinates?.[0] ?? restaurant.address?.coordinates?.longitude;
        const rLat = restaurant.location?.coordinates?.[1] ?? restaurant.address?.coordinates?.latitude;
        if (rLat !== undefined && rLng !== undefined) {
          computedDistanceKm = calculateHaversineDistanceKm(lat, lng, rLat, rLng);
          isDeliveringToUser = computedDistanceKm <= (restaurant.maxDeliveryRadiusKm || 12);
        }
      }

      // Fetch active menu items
      const menuItems = await MenuItem.find({ restaurantId: restaurant._id, isAvailable: true }).lean();

      // Group menu items by category
      const menuByCategory: Record<string, typeof menuItems> = {};
      for (const item of menuItems) {
        if (!menuByCategory[item.category]) {
          menuByCategory[item.category] = [];
        }
        menuByCategory[item.category].push(item);
      }

      // Fetch tables if dining is supported
      let tables: any[] = [];
      if (restaurant.operatingMode !== 'DELIVERY_ONLY') {
        tables = await Table.find({ restaurantId: restaurant._id, isActive: true }).lean();
      }

      // Fetch recent reviews
      const reviews = await Review.find({ restaurantId: restaurant._id })
        .populate('userId', 'fullName')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      res.json({
        success: true,
        restaurant: {
          ...restaurant,
          computedDistanceKm,
          isDeliveringToUser
        },
        menuByCategory,
        tables,
        reviews
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch restaurant details.' });
    }
  }

  public static async addReview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { rating, comment, orderId, reservationId } = req.body;

      if (!rating || !comment) {
        res.status(400).json({ success: false, message: 'Rating and comment are required.' });
        return;
      }

      const review = new Review({
        restaurantId: id,
        userId: req.user!._id,
        rating: Math.min(5, Math.max(1, Number(rating))),
        comment,
        orderId,
        reservationId,
        isVerifiedDiner: true
      });

      await review.save();

      // Recalculate average rating for restaurant
      const allReviews = await Review.find({ restaurantId: id });
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await Restaurant.findByIdAndUpdate(id, {
        averageRating: parseFloat(avg.toFixed(1)),
        totalReviews: allReviews.length
      });

      res.status(201).json({
        success: true,
        message: 'Review recorded successfully.',
        review
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to add review.' });
    }
  }
}
