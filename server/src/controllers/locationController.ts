import { Request, Response } from 'express';
import { LocationService } from '../services/locationService.js';

export class LocationController {
  /**
   * Get all supported Indian cities
   */
  public static async getCities(req: Request, res: Response): Promise<void> {
    try {
      const withCounts = req.query.withCounts === 'true';
      if (withCounts) {
        const citiesWithCounts = await LocationService.getCitiesWithRestaurantCounts();
        res.json({ success: true, count: citiesWithCounts.length, cities: citiesWithCounts });
      } else {
        const cities = LocationService.getAllCities();
        res.json({ success: true, count: cities.length, cities });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch cities' });
    }
  }

  /**
   * Search Indian cities, localities, and PIN codes
   */
  public static search(req: Request, res: Response): Promise<void> {
    try {
      const query = (req.query.q as string) || '';
      const results = LocationService.search(query);
      res.json({ success: true, count: results.length, results });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to search locations' });
    }
    return Promise.resolve();
  }

  /**
   * Reverse-geocode coordinates to an authentic Indian locality/city
   */
  public static reverseGeocode(req: Request, res: Response): Promise<void> {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);

      if (isNaN(lat) || isNaN(lng)) {
        res.status(400).json({ success: false, message: 'Valid lat and lng query parameters are required.' });
        return Promise.resolve();
      }

      const result = LocationService.reverseGeocode(lat, lng);
      res.json({ success: true, location: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to reverse-geocode coordinates' });
    }
    return Promise.resolve();
  }

  /**
   * Find closest city to coordinates
   */
  public static getClosest(req: Request, res: Response): Promise<void> {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);

      if (isNaN(lat) || isNaN(lng)) {
        res.status(400).json({ success: false, message: 'Valid lat and lng query parameters are required.' });
        return Promise.resolve();
      }

      const closest = LocationService.findClosestCity(lat, lng);
      res.json({ success: true, closest });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to find closest city' });
    }
    return Promise.resolve();
  }
}
