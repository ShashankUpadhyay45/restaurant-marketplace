import React from 'react';
import { Link } from 'react-router-dom';
import { Restaurant } from '../../types';
import { 
  Star, 
  Clock, 
  Bike, 
  Utensils, 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

interface Props {
  restaurant: Restaurant;
  onBookTable?: (restaurant: Restaurant) => void;
}

export const RestaurantCard: React.FC<Props> = ({ restaurant, onBookTable }) => {
  const getModeBadge = () => {
    switch (restaurant.operatingMode) {
      case 'DELIVERY_ONLY':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-stone-900/80 text-amber-300 backdrop-blur-md">
            <Bike className="w-3 h-3 mr-1" />
            Cloud Kitchen • Delivery Only
          </span>
        );
      case 'DINING_ONLY':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-950/80 text-rose-200 backdrop-blur-md">
            <Utensils className="w-3 h-3 mr-1" />
            Fine Dining • Table Bookings
          </span>
        );
      case 'HYBRID':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-200 backdrop-blur-md">
            <Sparkles className="w-3 h-3 mr-1" />
            Delivery & Reservations
          </span>
        );
    }
  };

  const localityText = restaurant.address.locality 
    ? `${restaurant.address.locality}, ${restaurant.address.city}`
    : restaurant.address.city;

  const minOrder = restaurant.deliveryZones?.[0]?.minOrderAmount || 199;
  const baseDelivery = restaurant.deliveryZones?.[0]?.deliveryFee || 35;

  return (
    <div className="group bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Hero Image Container */}
        <Link to={`/restaurant/${restaurant._id}`} className="block relative h-48 sm:h-52 overflow-hidden bg-stone-100">
          <img
            src={restaurant.heroImage}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Top Floating Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            {getModeBadge()}
            <div className="flex items-center space-x-1 bg-white/95 px-2.5 py-1 rounded-full text-xs font-bold text-stone-900 shadow-sm">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{restaurant.averageRating.toFixed(1)}</span>
              <span className="text-stone-400 font-normal text-[10px]">({restaurant.totalReviews})</span>
            </div>
          </div>

          {/* Delivery Time & Authentic INR Delivery Pricing */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
            <div className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-200" />
              <span>{restaurant.operatingMode === 'DINING_ONLY' ? 'Dinner Service' : '30-45 mins'}</span>
            </div>
            <span className="text-[11px] text-stone-200">
              {restaurant.operatingMode === 'DINING_ONLY' ? 'Exclusive Seating' : `₹${baseDelivery} delivery • Min ₹${minOrder}`}
            </span>
          </div>
        </Link>

        {/* Content Body */}
        <div className="p-5">
          <div className="flex items-start justify-between">
            <Link to={`/restaurant/${restaurant._id}`}>
              <h3 className="font-display text-lg font-bold text-stone-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                {restaurant.name}
              </h3>
            </Link>
          </div>

          {/* Locality & Distance Bar */}
          <div className="flex items-center justify-between mt-1 text-xs text-stone-500">
            <div className="flex items-center space-x-1 truncate max-w-[65%]">
              <MapPin className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
              <span className="truncate">{localityText}</span>
            </div>

            {restaurant.computedDistanceKm !== undefined && (
              <span className="font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded text-[11px]">
                {restaurant.computedDistanceKm.toFixed(1)} km away
              </span>
            )}
          </div>

          {/* Cuisine Tags */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {restaurant.cuisineTypes.slice(0, 3).map((cuisine, i) => (
              <span key={i} className="text-[11px] font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                {cuisine}
              </span>
            ))}
          </div>

          <p className="mt-2.5 text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {restaurant.description}
          </p>

          {/* Delivery Eligibility Pill */}
          {restaurant.operatingMode !== 'DINING_ONLY' && restaurant.computedDistanceKm !== undefined && (
            <div className="mt-3">
              {restaurant.isDeliveringToUser ? (
                <div className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                  <span>Delivers to your location</span>
                </div>
              ) : (
                <div className="inline-flex items-center text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                  <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
                  <span>Outside delivery zone (Max {restaurant.maxDeliveryRadiusKm || 12} km)</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-5 pt-0 border-t border-stone-100 mt-2 flex items-center gap-2">
        <Link
          to={`/restaurant/${restaurant._id}`}
          className="flex-1 py-2 text-center text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
        >
          View Menu
        </Link>

        {restaurant.operatingMode !== 'DELIVERY_ONLY' && (
          <button
            onClick={() => onBookTable && onBookTable(restaurant)}
            className="flex-1 py-2 text-center text-xs font-semibold text-white bg-stone-900 hover:bg-brand-600 rounded-xl transition-colors shadow-sm"
          >
            Reserve Table
          </button>
        )}
      </div>
    </div>
  );
};
