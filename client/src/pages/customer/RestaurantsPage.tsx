import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { restaurantService } from '../../services/restaurantService';
import { Restaurant } from '../../types';
import { useLocationStore } from '../../store/useLocationStore';
import { RestaurantCard } from '../../components/customer/RestaurantCard';
import { RestaurantMapView } from '../../components/map/RestaurantMapView';
import { TableBookingModal } from '../../components/customer/TableBookingModal';
import { ReservationPassModal } from '../../components/customer/ReservationPassModal';
import { RestaurantCardSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { 
  Filter, 
  Map as MapIcon, 
  LayoutGrid, 
  Search, 
  Compass, 
  MapPin, 
  UtensilsCrossed,
  SlidersHorizontal,
  Check
} from 'lucide-react';

export const RestaurantsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentLocation } = useLocationStore();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Filters
  const [selectedCity, setSelectedCity] = useState<string>(searchParams.get('city') || currentLocation.city || 'ALL');
  const [selectedMode, setSelectedMode] = useState<string>(searchParams.get('mode') || 'ALL');
  const [selectedCuisine, setSelectedCuisine] = useState<string>(searchParams.get('cuisine') || 'ALL');
  const [deliversOnly, setDeliversOnly] = useState<boolean>(searchParams.get('deliversOnly') === 'true');
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'reviews'>('rating');

  // Modals
  const [bookingRestaurant, setBookingRestaurant] = useState<Restaurant | null>(null);
  const [confirmedReservation, setConfirmedReservation] = useState<any>(null);

  const CITIES = ['ALL', 'Dehradun', 'Delhi NCR', 'Mumbai', 'Bengaluru', 'Jaipur'];
  const MODES = [
    { label: 'All Modes', value: 'ALL' },
    { label: 'Delivery & Dine-In (Hybrid)', value: 'HYBRID' },
    { label: 'Delivery Only (Cloud Kitchen)', value: 'DELIVERY_ONLY' },
    { label: 'Fine Dining Only', value: 'DINING_ONLY' }
  ];
  const CUISINES = [
    'ALL', 'North Indian', 'Rajasthani', 'Awadhi', 'Mughlai', 'Biryani', 
    'South Indian', 'Coastal Seafood', 'Continental', 'Italian', 'Pan-Asian', 'Bakery & Cafe'
  ];

  useEffect(() => {
    async function fetchRestaurants() {
      setIsLoading(true);
      try {
        const res = await restaurantService.getRestaurants({
          city: selectedCity,
          mode: selectedMode,
          cuisine: selectedCuisine,
          deliversOnly,
          lat: currentLocation.latitude,
          lng: currentLocation.longitude,
          sortBy
        });
        setRestaurants(res.restaurants);
      } catch (err) {
        console.error('Error fetching restaurants', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRestaurants();
  }, [selectedCity, selectedMode, selectedCuisine, deliversOnly, sortBy, currentLocation]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Modals */}
      {bookingRestaurant && (
        <TableBookingModal
          restaurant={bookingRestaurant}
          onClose={() => setBookingRestaurant(null)}
          onBookingSuccess={(resData) => {
            setBookingRestaurant(null);
            setConfirmedReservation(resData);
          }}
        />
      )}

      {confirmedReservation && (
        <ReservationPassModal
          reservationData={confirmedReservation}
          onClose={() => setConfirmedReservation(null)}
        />
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
            <Compass className="w-4 h-4" />
            <span>Pan-India Culinary Directory</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Artisanal Dining & Cloud Kitchens
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Browse 100+ vetted dining spots across {selectedCity === 'ALL' ? '5 major Indian culinary hubs' : selectedCity} with server-verified INR pricing.
          </p>
        </div>

        {/* View Switcher: Grid vs Map */}
        <div className="flex items-center space-x-2 bg-stone-200/80 p-1 rounded-xl self-start md:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'grid' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid View</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'map' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Radar Map</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="py-6 space-y-4">
        {/* City Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mr-2 shrink-0">City:</span>
          {CITIES.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCity(c)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCity === c
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {c === 'ALL' ? 'All 5 Cities' : c}
            </button>
          ))}
        </div>

        {/* Second Row Filters: Operating Mode, Cuisine, Sort, DeliversOnly */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Mode Dropdown */}
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              aria-label="Filter by operating mode"
              className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-700 shadow-2xs focus:outline-none focus:border-brand-500"
            >
              {MODES.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>

            {/* Cuisine Dropdown */}
            <select
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              aria-label="Filter by cuisine"
              className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-700 shadow-2xs focus:outline-none focus:border-brand-500"
            >
              {CUISINES.map(cu => (
                <option key={cu} value={cu}>{cu === 'ALL' ? 'All Cuisines' : cu}</option>
              ))}
            </select>

            {/* Delivers Only Checkbox */}
            <button
              onClick={() => setDeliversOnly(!deliversOnly)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                deliversOnly
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                deliversOnly ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-300'
              }`}>
                {deliversOnly && <Check className="w-2.5 h-2.5" />}
              </div>
              <span>Delivers to me</span>
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-stone-400 font-semibold">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort restaurants by"
              className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-700 shadow-2xs focus:outline-none focus:border-brand-500"
            >
              <option value="rating">Top Rated (★)</option>
              <option value="distance">Proximity / Distance</option>
              <option value="reviews">Most Reviewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'map' ? (
        <div className="my-6">
          <RestaurantMapView restaurants={restaurants} userLocation={currentLocation} />
        </div>
      ) : (
        <>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <RestaurantCardSkeleton key={i} />
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <EmptyState
              icon={UtensilsCrossed}
              title="No Restaurants Found"
              description="No dining spots matched your selected city, cuisine or delivery boundary filters. Try clearing filters to see all venues."
              actionText="Reset All Filters"
              onAction={() => {
                setSelectedCity('ALL');
                setSelectedMode('ALL');
                setSelectedCuisine('ALL');
                setDeliversOnly(false);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
              {restaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant._id}
                  restaurant={restaurant}
                  onBookTable={() => setBookingRestaurant(restaurant)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
