import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Restaurant } from '../../types';
import { useLocationStore } from '../../store/useLocationStore';
import { HeroFoodCanvas } from '../../components/3d/HeroFoodCanvas';
import { RestaurantCard } from '../../components/customer/RestaurantCard';
import { TableBookingModal } from '../../components/customer/TableBookingModal';
import { ReservationPassModal } from '../../components/customer/ReservationPassModal';
import { UnifiedSearchBar } from '../../components/search/UnifiedSearchBar';
import { RestaurantMapView } from '../../components/map/RestaurantMapView';
import { 
  Sparkles, 
  Filter, 
  UtensilsCrossed, 
  ShieldCheck, 
  Award, 
  Flame, 
  CheckCircle2,
  ChevronRight,
  MapPin,
  Compass,
  Map as MapIcon,
  LayoutGrid,
  Check
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { currentLocation, setModalOpen, detectCurrentLocation, isDetecting } = useLocationStore();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<string>('ALL');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('ALL');
  const [deliversOnly, setDeliversOnly] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'grid' | 'map'>('grid');

  // Modals state
  const [selectedRestaurantForBooking, setSelectedRestaurantForBooking] = useState<Restaurant | null>(null);
  const [confirmedReservationData, setConfirmedReservationData] = useState<any>(null);

  const INDIAN_CUISINES = [
    'ALL', 
    'North Indian', 
    'Bakery & Cafe', 
    'Tibetan & Momos', 
    'Pahari & Garhwali', 
    'Mughlai', 
    'Biryani', 
    'South Indian', 
    'Coastal Seafood', 
    'Continental', 
    'Italian'
  ];

  useEffect(() => {
    async function loadRestaurants() {
      setIsLoading(true);
      try {
        let endpoint = '/restaurants';
        const params = new URLSearchParams();

        if (selectedMode !== 'ALL') params.append('mode', selectedMode);
        if (selectedCuisine !== 'ALL') params.append('cuisine', selectedCuisine);
        if (searchQuery.trim()) params.append('search', searchQuery.trim());
        
        // Pass user's real GPS coordinates and active city for server-side Haversine distance
        params.append('lat', currentLocation.latitude.toString());
        params.append('lng', currentLocation.longitude.toString());
        params.append('city', currentLocation.city);

        if (deliversOnly) params.append('deliversOnly', 'true');

        const queryString = params.toString();
        if (queryString) endpoint += `?${queryString}`;

        const data = await api.get(endpoint);
        setRestaurants(data.restaurants || []);
      } catch (err) {
        console.error('Failed to load restaurants', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadRestaurants();
  }, [selectedMode, selectedCuisine, searchQuery, currentLocation, deliversOnly]);

  const deliveringCount = restaurants.filter(r => r.isDeliveringToUser).length;

  return (
    <div className="space-y-12 pb-20">
      
      {/* 3D Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 text-white pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          
          {/* Left Column: Headlines & Search */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-amber-300 text-xs font-semibold tracking-wide shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>India Multi-City Restaurant Marketplace</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Artisanal Meals Delivered. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-amber-100">
                Reserved Dining Tables.
              </span>
            </h1>

            <p className="text-stone-300 text-sm sm:text-base max-w-xl leading-relaxed">
              Experience transparent, chef-first dining with zero stealth surcharges. Discover verified kitchens, reserve instant QR table passes, and enjoy authentic regional cuisine with full delivery fee clarity.
            </p>

            {/* Unified Search Bar */}
            <div className="max-w-xl">
              <UnifiedSearchBar 
                onSearchSubmit={q => setSearchQuery(q)}
                placeholder="Search sourdough, biryani, galouti kebabs, Jakhan, Indiranagar..."
              />
            </div>

            {/* Trust Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-stone-400">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Transparent Fees (Base ₹35 + ₹12/km)</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Instant QR Table Passes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-rose-400" />
                <span>5% Unified Food Rewards</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 3D Canvas */}
          <div className="lg:col-span-5 h-[340px] sm:h-[420px] relative">
            <HeroFoodCanvas />
            <div className="absolute bottom-2 right-4 text-[10px] text-stone-400 bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
              ✨ Interactive 3D • Move cursor to explore
            </div>
          </div>

        </div>
      </section>

      {/* Active Location Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center border border-brand-100 flex-shrink-0">
              <MapPin className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Active Delivery Location</span>
                {currentLocation.source === 'DETECTED' && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                    GPS Verified
                  </span>
                )}
              </div>
              <div className="text-sm font-bold text-stone-900">
                {currentLocation.displayText}
                <span className="text-xs font-normal text-stone-500 ml-2">
                  ({deliveringCount} venues deliver to this area)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <button
              onClick={() => detectCurrentLocation()}
              disabled={isDetecting}
              className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Compass className={`w-3.5 h-3.5 text-brand-600 ${isDetecting ? 'animate-spin' : ''}`} />
              <span>{isDetecting ? 'Locating...' : 'Auto-Detect'}</span>
            </button>

            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-brand-600 text-white text-xs font-semibold transition-all shadow-sm"
            >
              Change City / Locality
            </button>
          </div>
        </div>
      </section>

      {/* Discovery & Marketplace Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Filter Controls Bar */}
        <div className="space-y-4 mb-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">
                Culinary Discovery in {currentLocation.city}
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Handcrafted menus from fine bistros, heritage grills, and artisanal cloud kitchens
              </p>
            </div>

            {/* View Switcher & Operating Mode Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Delivery Zone Toggle */}
              <button
                onClick={() => setDeliversOnly(!deliversOnly)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
                  deliversOnly
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400'
                }`}
              >
                <span>Delivers to me</span>
                {deliversOnly && <Check className="w-3.5 h-3.5 text-white" />}
              </button>

              {/* Grid / Map View Switcher */}
              <div className="inline-flex p-1 bg-stone-200/80 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setActiveView('grid')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 ${
                    activeView === 'grid' ? 'bg-white shadow text-stone-900' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>
                <button
                  onClick={() => setActiveView('map')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 ${
                    activeView === 'map' ? 'bg-white shadow text-stone-900' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Map</span>
                </button>
              </div>

              {/* Operating Mode Toggle */}
              <div className="inline-flex p-1 bg-stone-200/80 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setSelectedMode('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedMode === 'ALL' ? 'bg-white shadow text-stone-900' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedMode('HYBRID')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedMode === 'HYBRID' ? 'bg-white shadow text-stone-900' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  ✨ Hybrid
                </button>
                <button
                  onClick={() => setSelectedMode('DELIVERY_ONLY')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedMode === 'DELIVERY_ONLY' ? 'bg-white shadow text-stone-900' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  🚀 Delivery
                </button>
                <button
                  onClick={() => setSelectedMode('DINING_ONLY')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedMode === 'DINING_ONLY' ? 'bg-white shadow text-stone-900' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  🍷 Dine-In
                </button>
              </div>

            </div>
          </div>

          {/* Indian Cuisine Pill Filters */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {INDIAN_CUISINES.map(cuisine => (
              <button
                key={cuisine}
                onClick={() => setSelectedCuisine(cuisine)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCuisine === cuisine
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-white border border-stone-200 text-stone-700 hover:border-stone-400'
                }`}
              >
                {cuisine === 'ALL' ? 'All Cuisines' : cuisine}
              </button>
            ))}
          </div>

        </div>

        {/* View Content: Grid vs Map */}
        {activeView === 'map' ? (
          <RestaurantMapView 
            restaurants={restaurants} 
            userLocation={currentLocation} 
          />
        ) : (
          <>
            {/* Loading Skeleton */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-80 bg-stone-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : restaurants.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4 max-w-lg mx-auto my-12">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                  <UtensilsCrossed className="w-8 h-8" />
                </div>
                <h3 className="font-display text-xl font-bold text-stone-900">
                  No venues found in {currentLocation.city}
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  We are rapidly onboarding top artisanal kitchens across India. Try searching another city like Dehradun, Delhi NCR, or Bengaluru, or clear your filters.
                </p>
                <div className="flex items-center justify-center space-x-2 pt-2">
                  <button
                    onClick={() => {
                      setSelectedMode('ALL');
                      setSelectedCuisine('ALL');
                      setSearchQuery('');
                      setDeliversOnly(false);
                    }}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-all"
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="px-4 py-2 bg-stone-900 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold transition-all"
                  >
                    Switch City
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {restaurants.map(restaurant => (
                  <RestaurantCard
                    key={restaurant._id}
                    restaurant={restaurant}
                    onBookTable={r => setSelectedRestaurantForBooking(r)}
                  />
                ))}
              </div>
            )}
          </>
        )}

      </section>

      {/* Table Booking Modal */}
      {selectedRestaurantForBooking && (
        <TableBookingModal
          restaurant={selectedRestaurantForBooking}
          onClose={() => setSelectedRestaurantForBooking(null)}
          onBookingSuccess={reservationData => {
            setSelectedRestaurantForBooking(null);
            setConfirmedReservationData(reservationData);
          }}
        />
      )}

      {/* Reservation Pass QR Modal */}
      {confirmedReservationData && (
        <ReservationPassModal
          reservationData={confirmedReservationData}
          onClose={() => setConfirmedReservationData(null)}
        />
      )}

    </div>
  );
};
