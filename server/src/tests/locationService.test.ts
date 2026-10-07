import { describe, it, expect } from 'vitest';
import { LocationService } from '../services/locationService.js';
import { calculateHaversineDistanceKm } from '../data/indianLocations.js';

describe('LocationService & Indian Geolocation Intelligence Tests', () => {
  it('correctly calculates Haversine distance between Dehradun coordinates', () => {
    // Rajpur Road (30.3340, 78.0580) to Jakhan (30.3620, 78.0720)
    const distanceKm = LocationService.calculateDistanceKm(30.3340, 78.0580, 30.3620, 78.0720);
    expect(distanceKm).toBeGreaterThan(3.0);
    expect(distanceKm).toBeLessThan(4.0);
  });

  it('resolves closest Indian city for Dehradun coordinates', () => {
    const { city, distanceKm } = LocationService.findClosestCity(30.3165, 78.0322);
    expect(city.name).toBe('Dehradun');
    expect(city.state).toBe('Uttarakhand');
    expect(distanceKm).toBeLessThan(1.0);
  });

  it('resolves closest Indian city for Bengaluru coordinates', () => {
    const { city, distanceKm } = LocationService.findClosestCity(12.9716, 77.5946);
    expect(city.name).toBe('Bengaluru');
    expect(city.state).toBe('Karnataka');
    expect(distanceKm).toBeLessThan(2.0);
  });

  it('searches Indian localities, cities, and 6-digit PIN codes accurately', () => {
    const localityResults = LocationService.search('Rajpur Road');
    expect(localityResults.length).toBeGreaterThan(0);
    expect(localityResults[0].displayText).toContain('Rajpur Road');

    const pincodeResults = LocationService.search('248001');
    expect(pincodeResults.length).toBeGreaterThan(0);
    expect(pincodeResults[0].cityName).toBe('Dehradun');

    const cityResults = LocationService.search('Mumbai');
    expect(cityResults.some(r => r.cityName === 'Mumbai')).toBe(true);
  });

  it('correctly reverse-geocodes GPS coordinates to an authentic Indian locality', () => {
    const reverse = LocationService.reverseGeocode(30.3340, 78.0580);
    expect(reverse.city).toBe('Dehradun');
    expect(reverse.state).toBe('Uttarakhand');
    expect(reverse.locality).toBe('Rajpur Road');
    expect(reverse.postalCode).toBe('248001');
    expect(reverse.country).toBe('India');
  });

  it('evaluates delivery radius eligibility accurately', () => {
    // Within 12 km radius
    const eligibleCheck = LocationService.isWithinDeliveryZone(30.3340, 78.0580, 30.3620, 78.0720, 12);
    expect(eligibleCheck.isEligible).toBe(true);
    expect(eligibleCheck.distanceKm).toBeLessThan(12);

    // Far distance (> 12 km) e.g. Dehradun to Mussoorie hills (> 15 km)
    const outsideCheck = LocationService.isWithinDeliveryZone(30.3340, 78.0580, 30.4598, 78.0644, 12);
    expect(outsideCheck.isEligible).toBe(false);
    expect(outsideCheck.distanceKm).toBeGreaterThan(12);
  });
});
