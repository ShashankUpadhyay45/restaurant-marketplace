import { 
  INDIAN_CITIES, 
  IndianCity, 
  calculateHaversineDistanceKm, 
  findClosestIndianCity, 
  searchIndianLocations 
} from '../data/indianLocations.js';
import { Restaurant } from '../models/Restaurant.js';

export interface LocationSearchResult {
  type: 'CITY' | 'LOCALITY' | 'PINCODE';
  cityName: string;
  state: string;
  localityName?: string;
  pincode?: string;
  latitude: number;
  longitude: number;
  displayText: string;
}

export interface ReverseGeocodeResult {
  city: string;
  state: string;
  locality: string;
  postalCode: string;
  country: 'India';
  latitude: number;
  longitude: number;
  displayText: string;
  distanceToCityCenterKm: number;
}

export class LocationService {
  /**
   * Returns all supported Indian cities grouped by region
   */
  public static getAllCities(): IndianCity[] {
    return INDIAN_CITIES;
  }

  /**
   * Returns cities with active restaurant counts
   */
  public static async getCitiesWithRestaurantCounts(): Promise<Array<{
    city: IndianCity;
    activeRestaurantsCount: number;
  }>> {
    const counts = await Restaurant.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$address.city', count: { $sum: 1 } } }
    ]);

    const countMap = new Map<string, number>();
    for (const c of counts) {
      if (c._id) {
        countMap.set(c._id.toLowerCase(), c.count);
      }
    }

    return INDIAN_CITIES.map(city => ({
      city,
      activeRestaurantsCount: countMap.get(city.name.toLowerCase()) || 0
    }));
  }

  /**
   * Search Indian cities, localities, and PIN codes
   */
  public static search(query: string): LocationSearchResult[] {
    return searchIndianLocations(query);
  }

  /**
   * Find closest Indian city for given GPS coordinates
   */
  public static findClosestCity(lat: number, lng: number): { city: IndianCity; distanceKm: number } {
    return findClosestIndianCity(lat, lng);
  }

  /**
   * Reverse-geocode coordinates to an authentic Indian locality, city, and PIN code
   */
  public static reverseGeocode(lat: number, lng: number): ReverseGeocodeResult {
    const { city, distanceKm } = findClosestIndianCity(lat, lng);

    // Find closest locality inside this city
    let closestLocality = city.popularLocalities[0];
    let minLocalityDist = calculateHaversineDistanceKm(lat, lng, closestLocality.latitude, closestLocality.longitude);

    for (let i = 1; i < city.popularLocalities.length; i++) {
      const loc = city.popularLocalities[i];
      const dist = calculateHaversineDistanceKm(lat, lng, loc.latitude, loc.longitude);
      if (dist < minLocalityDist) {
        minLocalityDist = dist;
        closestLocality = loc;
      }
    }

    return {
      city: city.name,
      state: city.state,
      locality: closestLocality.name,
      postalCode: closestLocality.pincode,
      country: 'India',
      latitude: lat,
      longitude: lng,
      displayText: `${closestLocality.name}, ${city.name}`,
      distanceToCityCenterKm: parseFloat(distanceKm.toFixed(1))
    };
  }

  /**
   * Calculate distance between two coordinates in kilometers using Haversine formula
   */
  public static calculateDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    return calculateHaversineDistanceKm(lat1, lng1, lat2, lng2);
  }

  /**
   * Checks whether a customer coordinate is within a restaurant's maximum delivery radius
   */
  public static isWithinDeliveryZone(
    restaurantLat: number,
    restaurantLng: number,
    customerLat: number,
    customerLng: number,
    maxRadiusKm: number = 12
  ): { isEligible: boolean; distanceKm: number } {
    const dist = calculateHaversineDistanceKm(restaurantLat, restaurantLng, customerLat, customerLng);
    return {
      isEligible: dist <= maxRadiusKm,
      distanceKm: dist
    };
  }
}
