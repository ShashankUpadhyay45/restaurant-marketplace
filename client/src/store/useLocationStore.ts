import { create } from 'zustand';
import { UserLocation } from '../types';
import { 
  INDIAN_CITIES, 
  IndianCity, 
  calculateHaversineDistanceKm, 
  findClosestIndianCity 
} from '../data/indianLocations';
import { api } from '../services/api';

const STORAGE_KEY = 'gourmetfleet_user_location';

const DEFAULT_LOCATION: UserLocation = {
  source: 'DEFAULT',
  city: 'Dehradun',
  state: 'Uttarakhand',
  locality: 'Rajpur Road',
  postalCode: '248001',
  latitude: 30.3340,
  longitude: 78.0580,
  displayText: 'Rajpur Road, Dehradun'
};

function loadStoredLocation(): UserLocation {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.city && parsed.latitude && parsed.longitude) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse cached location', err);
  }
  return DEFAULT_LOCATION;
}

interface LocationStoreState {
  currentLocation: UserLocation;
  isDetecting: boolean;
  permissionState: 'prompt' | 'granted' | 'denied' | 'timeout' | 'unavailable';
  errorMessage: string | null;
  isModalOpen: boolean;

  setModalOpen: (open: boolean) => void;
  setLocation: (location: UserLocation) => void;
  detectCurrentLocation: () => Promise<void>;
  selectCity: (cityName: string, localityName?: string) => void;
  selectLocality: (localityName: string) => void;
}

export const useLocationStore = create<LocationStoreState>((set, get) => ({
  currentLocation: loadStoredLocation(),
  isDetecting: false,
  permissionState: 'prompt',
  errorMessage: null,
  isModalOpen: false,

  setModalOpen: (open: boolean) => set({ isModalOpen: open }),

  setLocation: (location: UserLocation) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
    } catch {}
    set({ currentLocation: location, errorMessage: null });
  },

  detectCurrentLocation: async () => {
    if (!('geolocation' in navigator)) {
      set({ 
        permissionState: 'unavailable', 
        errorMessage: 'Geolocation is not supported by your browser. Please select a city manually.' 
      });
      return;
    }

    set({ isDetecting: true, errorMessage: null });

    return new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          try {
            // Attempt reverse geocoding via server API first
            const res = await api.get(`/locations/reverse-geocode?lat=${lat}&lng=${lng}`);
            if (res.success && res.location) {
              const detectedLoc: UserLocation = {
                source: 'DETECTED',
                city: res.location.city,
                state: res.location.state,
                locality: res.location.locality,
                postalCode: res.location.postalCode,
                latitude: lat,
                longitude: lng,
                displayText: res.location.displayText
              };
              get().setLocation(detectedLoc);
              set({ permissionState: 'granted', isDetecting: false, isModalOpen: false });
              resolve();
              return;
            }
          } catch (apiErr) {
            // Fallback to local Indian city resolver
            console.log('Using client fallback for reverse geocode:', apiErr);
          }

          const { city } = findClosestIndianCity(lat, lng);
          let closestLocality = city.popularLocalities[0];
          let minDist = calculateHaversineDistanceKm(lat, lng, closestLocality.latitude, closestLocality.longitude);

          for (const loc of city.popularLocalities) {
            const d = calculateHaversineDistanceKm(lat, lng, loc.latitude, loc.longitude);
            if (d < minDist) {
              minDist = d;
              closestLocality = loc;
            }
          }

          const resolvedLoc: UserLocation = {
            source: 'DETECTED',
            city: city.name,
            state: city.state,
            locality: closestLocality.name,
            postalCode: closestLocality.pincode,
            latitude: lat,
            longitude: lng,
            displayText: `${closestLocality.name}, ${city.name}`
          };

          get().setLocation(resolvedLoc);
          set({ permissionState: 'granted', isDetecting: false, isModalOpen: false });
          resolve();
        },
        (error) => {
          let pState: LocationStoreState['permissionState'] = 'denied';
          let msg = 'Location access was denied. You can select your Indian city from the list below.';

          if (error.code === error.TIMEOUT) {
            pState = 'timeout';
            msg = 'Location detection timed out. Please select your city manually.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            pState = 'unavailable';
            msg = 'Location information is currently unavailable.';
          }

          set({ 
            isDetecting: false, 
            permissionState: pState, 
            errorMessage: msg 
          });
          resolve();
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    });
  },

  selectCity: (cityName: string, localityName?: string) => {
    const city = INDIAN_CITIES.find(c => c.name.toLowerCase() === cityName.toLowerCase());
    if (!city) return;

    let targetLocality = city.popularLocalities[0];
    if (localityName) {
      const match = city.popularLocalities.find(l => l.name.toLowerCase() === localityName.toLowerCase());
      if (match) targetLocality = match;
    }

    const newLocation: UserLocation = {
      source: 'MANUAL',
      city: city.name,
      state: city.state,
      locality: targetLocality.name,
      postalCode: targetLocality.pincode,
      latitude: targetLocality.latitude,
      longitude: targetLocality.longitude,
      displayText: `${targetLocality.name}, ${city.name}`
    };

    get().setLocation(newLocation);
    set({ isModalOpen: false, errorMessage: null });
  },

  selectLocality: (localityName: string) => {
    const current = get().currentLocation;
    const city = INDIAN_CITIES.find(c => c.name.toLowerCase() === current.city.toLowerCase());
    if (!city) return;

    const loc = city.popularLocalities.find(l => l.name.toLowerCase() === localityName.toLowerCase());
    if (!loc) return;

    const newLocation: UserLocation = {
      ...current,
      source: 'MANUAL',
      locality: loc.name,
      postalCode: loc.pincode,
      latitude: loc.latitude,
      longitude: loc.longitude,
      displayText: `${loc.name}, ${city.name}`
    };

    get().setLocation(newLocation);
    set({ isModalOpen: false, errorMessage: null });
  }
}));
