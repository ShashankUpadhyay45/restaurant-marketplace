import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Restaurant, MenuItem, Review } from '../../types';
import { useLocationStore } from '../../store/useLocationStore';
import { MenuModal } from '../../components/customer/MenuModal';
import { TableBookingModal } from '../../components/customer/TableBookingModal';
import { ReservationPassModal } from '../../components/customer/ReservationPassModal';
import { 
  Star, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Utensils, 
  Bike, 
  Sparkles, 
  Plus, 
  ChevronLeft,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const RestaurantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentLocation } = useLocationStore();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuByCategory, setMenuByCategory] = useState<Record<string, MenuItem[]>>({});
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('');

  // Modals
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [confirmedReservationData, setConfirmedReservationData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (currentLocation.latitude && currentLocation.longitude) {
          queryParams.append('lat', currentLocation.latitude.toString());
          queryParams.append('lng', currentLocation.longitude.toString());
        }

        const res = await api.get(`/restaurants/${id}?${queryParams.toString()}`);
        setRestaurant(res.restaurant);
        setMenuByCategory(res.menuByCategory || {});
        setReviews(res.reviews || []);

        const categories = Object.keys(res.menuByCategory || {});
        if (categories.length > 0) {
          setActiveCategory(categories[0]);
        }
      } catch (err) {
        console.error('Failed to load restaurant profile', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (id) loadData();
  }, [id, currentLocation]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-64 bg-stone-200 rounded-3xl" />
        <div className="h-8 bg-stone-200 rounded w-1/3" />
        <div className="h-4 bg-stone-200 rounded w-1/4" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white rounded-3xl border border-stone-200 space-y-4">
        <h3 className="font-display text-xl font-bold text-stone-900">Restaurant not found</h3>
        <p className="text-xs text-stone-500">The culinary venue you are searching for might be temporarily unavailable.</p>
        <Link to="/" className="inline-block px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold">
          Return to Discovery
        </Link>
      </div>
    );
  }

  const categories = Object.keys(menuByCategory);
  const fullAddress = `${restaurant.address.addressLine1 || restaurant.address.street}, ${restaurant.address.locality ? restaurant.address.locality + ', ' : ''}${restaurant.address.city} - ${restaurant.address.postalCode}`;

  return (
    <div className="pb-24">
      
      {/* Hero Banner */}
      <div className="relative h-72 sm:h-96 w-full bg-stone-900 overflow-hidden">
        <img
          src={restaurant.heroImage}
          alt={restaurant.name}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/50 to-transparent" />
        
        {/* Navigation Breadcrumb */}
        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-md transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>All Restaurants</span>
          </Link>
        </div>

        {/* Floating Details */}
        <div className="absolute bottom-6 left-4 sm:left-8 right-4 sm:right-8 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand-600/90 text-white backdrop-blur-sm">
                {restaurant.operatingMode.replace('_', ' ')}
              </span>
              <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{restaurant.averageRating.toFixed(1)}</span>
                <span className="text-stone-300 font-normal">({restaurant.totalReviews} verified reviews)</span>
              </div>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              {restaurant.name}
            </h1>

            <p className="text-xs sm:text-sm text-stone-200 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0" />
              <span>{fullAddress}</span>
            </p>

            {/* Distance & Delivery Eligibility Badge */}
            {restaurant.computedDistanceKm !== undefined && (
              <div className="inline-flex items-center space-x-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-xl text-xs border border-white/10">
                <span className="font-semibold text-amber-300">
                  {restaurant.computedDistanceKm.toFixed(1)} km from your location ({currentLocation.displayText})
                </span>
                <span>•</span>
                {restaurant.isDeliveringToUser ? (
                  <span className="text-emerald-400 font-bold flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Delivers to you
                  </span>
                ) : (
                  <span className="text-rose-400 font-bold flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" /> Outside delivery radius
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Table Booking Callout Button */}
          {restaurant.operatingMode !== 'DELIVERY_ONLY' && (
            <button
              onClick={() => setIsBookingOpen(true)}
              className="py-3 px-6 rounded-2xl bg-white text-stone-950 font-bold text-xs uppercase tracking-wider hover:bg-brand-600 hover:text-white shadow-xl transition-all self-start sm:self-auto flex items-center space-x-2"
            >
              <Utensils className="w-4 h-4" />
              <span>Reserve a Dining Table</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Info & Hygiene Strip */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-brand-600 flex-shrink-0" />
            <div>
              <span className="font-bold text-stone-900 block">Service Hours</span>
              <span className="text-stone-500">11:00 AM – 11:30 PM • Mon-Sun</span>
            </div>
          </div>
          <div className="flex items-center space-x-3 border-t md:border-t-0 md:border-l border-stone-100 pt-3 md:pt-0 md:pl-4">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="font-bold text-stone-900 block">Food Safety & Hygiene</span>
              <span className="text-stone-500">FSSAI Lic: {restaurant.fssaiLicenseNumber}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3 border-t md:border-t-0 md:border-l border-stone-100 pt-3 md:pt-0 md:pl-4">
            <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <span className="font-bold text-stone-900 block">Transparent Delivery Fees</span>
              <span className="text-stone-500">₹35 flat base (first 2 km) + ₹12/km</span>
            </div>
          </div>
        </div>

        {/* Menu Section */}
        <div className="mt-12">
          <h2 className="font-display text-2xl font-bold text-stone-900 mb-6">Culinary Catalog</h2>

          {/* Sticky Category Tabs */}
          <div className="sticky top-20 z-20 bg-white/95 backdrop-blur-md border-b border-stone-200 py-3 mb-8 flex space-x-2 overflow-x-auto scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat} ({menuByCategory[cat]?.length || 0})
              </button>
            ))}
          </div>

          {/* Category Items Grid */}
          {categories.map(cat => (
            <div
              key={cat}
              className={`space-y-4 mb-12 ${activeCategory === cat ? 'block' : 'hidden'}`}
            >
              <h3 className="font-display text-xl font-bold text-stone-800 border-l-4 border-brand-600 pl-3">
                {cat}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {menuByCategory[cat]?.map(item => (
                  <div
                    key={item._id}
                    onClick={() => item.isAvailable && setSelectedMenuItem(item)}
                    className={`bg-white rounded-2xl border border-stone-200/80 p-5 flex justify-between gap-4 transition-all duration-200 ${
                      item.isAvailable 
                        ? 'hover:shadow-md hover:border-brand-300 cursor-pointer' 
                        : 'opacity-60 bg-stone-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        {item.dietaryTags.map(tag => (
                          <span key={tag} className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {tag.replace('_', ' ')}
                          </span>
                        ))}
                      </div>

                      <h4 className="font-display text-base font-bold text-stone-900">{item.name}</h4>
                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">{item.description}</p>
                      
                      <div className="pt-2 flex items-center justify-between">
                        <span className="font-display text-base font-bold text-stone-900">
                          ₹{item.basePrice.toFixed(2)}
                        </span>
                        
                        {item.isAvailable ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMenuItem(item);
                            }}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-brand-600 text-white text-xs font-bold transition-colors shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
                            Sold Out Today
                          </span>
                        )}
                      </div>
                    </div>

                    {item.imageUrl && (
                      <div className="w-28 h-28 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Verified Reviews Section */}
        {reviews.length > 0 && (
          <div className="mt-16 pt-12 border-t border-stone-200">
            <h3 className="font-display text-2xl font-bold text-stone-900 mb-6">Verified Diner Impressions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map(rev => (
                <div key={rev._id} className="bg-white p-5 rounded-2xl border border-stone-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900">{rev.userId?.fullName || 'Verified Guest'}</span>
                    <div className="flex items-center space-x-1 text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-stone-600 italic leading-relaxed">"{rev.comment}"</p>
                  <div className="flex items-center space-x-1 text-[10px] text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified Completed Order</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Menu Customization Modal */}
      {selectedMenuItem && (
        <MenuModal
          item={selectedMenuItem}
          restaurant={restaurant}
          onClose={() => setSelectedMenuItem(null)}
        />
      )}

      {/* Table Booking Modal */}
      {isBookingOpen && (
        <TableBookingModal
          restaurant={restaurant}
          onClose={() => setIsBookingOpen(false)}
          onBookingSuccess={(resData) => {
            setIsBookingOpen(false);
            setConfirmedReservationData(resData);
          }}
        />
      )}

      {/* Digital QR Pass Modal */}
      {confirmedReservationData && (
        <ReservationPassModal
          reservationData={confirmedReservationData}
          onClose={() => setConfirmedReservationData(null)}
        />
      )}

    </div>
  );
};
