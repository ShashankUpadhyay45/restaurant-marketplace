import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Restaurant, UserLocation } from '../../types';
import { 
  MapPin, 
  Navigation, 
  Star, 
  Bike, 
  Utensils, 
  Sparkles, 
  ExternalLink, 
  Plus, 
  Minus, 
  RotateCcw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface RestaurantMapViewProps {
  restaurants: Restaurant[];
  userLocation: UserLocation;
}

export const RestaurantMapView: React.FC<RestaurantMapViewProps> = ({
  restaurants,
  userLocation
}) => {
  const navigate = useNavigate();
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [filterDeliveringOnly, setFilterDeliveringOnly] = useState<boolean>(false);

  // Center coordinate is user's active latitude and longitude
  const centerLat = userLocation.latitude;
  const centerLng = userLocation.longitude;

  // Filter restaurants
  const displayRestaurants = useMemo(() => {
    if (!filterDeliveringOnly) return restaurants;
    return restaurants.filter(r => r.isDeliveringToUser);
  }, [restaurants, filterDeliveringOnly]);

  // Convert GPS (lat, lng) to canvas (x, y) relative to center
  // 1 degree lat is ~111km, 1 degree lng is ~111 * cos(lat)
  const scale = 32 * zoomLevel; // pixels per kilometer approximate scaling
  const mapWidth = 800;
  const mapHeight = 520;
  const originX = mapWidth / 2;
  const originY = mapHeight / 2;

  const latKmFactor = 110.574;
  const lngKmFactor = 111.320 * Math.cos((centerLat * Math.PI) / 180);

  const getCoordinatesOnMap = (lat: number, lng: number) => {
    const deltaLatKm = (lat - centerLat) * latKmFactor;
    const deltaLngKm = (lng - centerLng) * lngKmFactor;

    // In SVG canvas, +y is downwards, so positive deltaLat (North) means negative y
    const x = originX + deltaLngKm * scale;
    const y = originY - deltaLatKm * scale;
    return { x, y };
  };

  return (
    <div className="relative w-full h-[520px] bg-stone-950 rounded-3xl overflow-hidden border border-stone-800 shadow-2xl flex flex-col justify-between">
      
      {/* Top Map Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Active City / Locality Pill */}
        <div className="pointer-events-auto bg-stone-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-stone-700/80 text-white flex items-center space-x-2 shadow-lg">
          <Navigation className="w-4 h-4 text-brand-500 animate-pulse" />
          <span className="text-xs font-bold">{userLocation.displayText}</span>
          <span className="text-[10px] text-stone-400 bg-stone-800 px-2 py-0.5 rounded-full">
            Center of Discovery
          </span>
        </div>

        {/* Filters & Zoom controls */}
        <div className="pointer-events-auto flex items-center space-x-2">
          <button
            onClick={() => setFilterDeliveringOnly(!filterDeliveringOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all ${
              filterDeliveringOnly
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/30'
                : 'bg-stone-900/80 border-stone-700 text-stone-300 hover:text-white'
            }`}
          >
            ✓ Delivering to Me
          </button>

          <div className="flex items-center bg-stone-900/90 backdrop-blur-md rounded-xl border border-stone-700 p-1 space-x-1">
            <button
              onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.25))}
              className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800"
              title="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.25))}
              className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800"
              title="Zoom Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* SVG Canvas Map */}
      <svg 
        className="w-full h-full cursor-grab active:cursor-grabbing"
        viewBox={`0 0 ${mapWidth} ${mapHeight}`}
      >
        {/* Subtle grid pattern */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#262626" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width={mapWidth} height={mapHeight} fill="#0c0a09" />
        <rect width={mapWidth} height={mapHeight} fill="url(#grid)" />

        {/* User Location Radar Glow & Radius Rings */}
        <circle cx={originX} cy={originY} r={12 * scale} fill="none" stroke="#3f3f46" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
        <circle cx={originX} cy={originY} r={8 * scale} fill="none" stroke="#52525b" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
        <circle cx={originX} cy={originY} r={4 * scale} fill="none" stroke="#71717a" strokeWidth="1" opacity="0.7" />
        <circle cx={originX} cy={originY} r={4 * scale} fill="url(#centerGlow)" />

        {/* Distance Indicators on Rings */}
        <text x={originX + 4 * scale + 5} y={originY - 5} fill="#a1a1aa" fontSize="10" fontFamily="sans-serif">4 km</text>
        <text x={originX + 8 * scale + 5} y={originY - 5} fill="#71717a" fontSize="10" fontFamily="sans-serif">8 km</text>
        <text x={originX + 12 * scale + 5} y={originY - 5} fill="#52525b" fontSize="10" fontFamily="sans-serif">12 km Max Zone</text>

        {/* Connecting dotted lines from center to restaurants */}
        {displayRestaurants.map(r => {
          const rLng = r.location?.coordinates?.[0] ?? r.address?.coordinates?.longitude ?? centerLng;
          const rLat = r.location?.coordinates?.[1] ?? r.address?.coordinates?.latitude ?? centerLat;
          const { x, y } = getCoordinatesOnMap(rLat, rLng);

          return (
            <line
              key={`line-${r._id}`}
              x1={originX}
              y1={originY}
              x2={x}
              y2={y}
              stroke={r.isDeliveringToUser ? '#e11d48' : '#52525b'}
              strokeWidth={selectedRestaurant?._id === r._id ? '2' : '1'}
              strokeDasharray={r.isDeliveringToUser ? '2 3' : '1 4'}
              opacity={selectedRestaurant?._id === r._id ? 0.9 : 0.3}
            />
          );
        })}

        {/* User Location Pin */}
        <g transform={`translate(${originX}, ${originY})`}>
          <circle r="16" fill="#f43f5e" opacity="0.3" className="animate-ping" />
          <circle r="10" fill="#e11d48" stroke="#ffffff" strokeWidth="2.5" />
          <circle r="3" fill="#ffffff" />
          <text y="24" textAnchor="middle" fill="#fda4af" fontSize="11" fontWeight="bold">
            You are here
          </text>
        </g>

        {/* Restaurant Pins */}
        {displayRestaurants.map(r => {
          const rLng = r.location?.coordinates?.[0] ?? r.address?.coordinates?.longitude ?? centerLng;
          const rLat = r.location?.coordinates?.[1] ?? r.address?.coordinates?.latitude ?? centerLat;
          const { x, y } = getCoordinatesOnMap(rLat, rLng);
          const isSelected = selectedRestaurant?._id === r._id;

          return (
            <g
              key={r._id}
              transform={`translate(${x}, ${y})`}
              className="cursor-pointer group"
              onClick={() => setSelectedRestaurant(r)}
            >
              {/* Pulse if selected */}
              {isSelected && (
                <circle r="22" fill="#fbbf24" opacity="0.3" className="animate-ping" />
              )}

              {/* Pin marker */}
              <circle
                r={isSelected ? '14' : '11'}
                fill={r.isDeliveringToUser ? '#10b981' : '#f59e0b'}
                stroke="#ffffff"
                strokeWidth="2"
                className="transition-transform group-hover:scale-125"
              />

              {/* Icon badge */}
              <circle
                r="4"
                fill="#ffffff"
              />

              {/* Label */}
              <text
                y={isSelected ? '-20' : '-16'}
                textAnchor="middle"
                fill="#ffffff"
                fontSize={isSelected ? '12' : '10'}
                fontWeight={isSelected ? 'bold' : 'normal'}
                className="drop-shadow-md select-none"
              >
                {r.name.length > 20 ? `${r.name.slice(0, 18)}...` : r.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Selected Restaurant Floating Detail Card */}
      {selectedRestaurant && (
        <div className="absolute bottom-4 left-4 right-4 z-20 sm:left-auto sm:right-4 sm:w-80 bg-white rounded-2xl shadow-2xl border border-stone-200 p-4 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={selectedRestaurant.heroImage}
                alt={selectedRestaurant.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <h4 className="text-sm font-bold text-stone-900 line-clamp-1">
                  {selectedRestaurant.name}
                </h4>
                <div className="flex items-center space-x-1.5 text-xs text-stone-500 mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-stone-800">{selectedRestaurant.averageRating.toFixed(1)}</span>
                  <span>•</span>
                  <span>{selectedRestaurant.address.locality || selectedRestaurant.address.city}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedRestaurant(null)}
              className="text-stone-400 hover:text-stone-700 text-xs font-bold p-1"
            >
              ✕
            </button>
          </div>

          {/* Delivery & Distance Badges */}
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5">
              {selectedRestaurant.isDeliveringToUser ? (
                <span className="inline-flex items-center text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                  Delivers to you
                </span>
              ) : (
                <span className="inline-flex items-center text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                  <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
                  Outside radius
                </span>
              )}
            </div>

            <span className="font-semibold text-stone-700">
              {selectedRestaurant.computedDistanceKm !== undefined 
                ? `${selectedRestaurant.computedDistanceKm.toFixed(1)} km away` 
                : 'Proximity verified'}
            </span>
          </div>

          {/* Action Button */}
          <button
            onClick={() => navigate(`/restaurant/${selectedRestaurant._id}`)}
            className="w-full mt-3 py-2 bg-stone-900 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1.5"
          >
            <span>View Full Menu & Reserve</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Bottom Map Legend */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none hidden sm:flex items-center space-x-4 bg-stone-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-stone-800 text-[11px] text-stone-300">
        <div className="flex items-center space-x-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Delivers to you</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Dining / Outside zone</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Your Location</span>
        </div>
      </div>

    </div>
  );
};
