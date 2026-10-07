import React, { useState, useEffect, useMemo } from 'react';
import { useLocationStore } from '../../store/useLocationStore';
import { 
  INDIAN_CITIES, 
  searchIndianLocations, 
  IndianCity 
} from '../../data/indianLocations';
import { 
  MapPin, 
  Navigation, 
  Search, 
  X, 
  Check, 
  AlertCircle, 
  Building2, 
  Compass,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const LocationSelectorModal: React.FC = () => {
  const { 
    currentLocation, 
    isModalOpen, 
    setModalOpen, 
    detectCurrentLocation, 
    isDetecting, 
    permissionState, 
    errorMessage, 
    selectCity, 
    selectLocality 
  } = useLocationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState<'All' | 'North' | 'South' | 'West' | 'East'>('All');

  // Debounced search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchIndianLocations(searchQuery);
  }, [searchQuery]);

  // Current active city object
  const currentCityObj = useMemo(() => {
    return INDIAN_CITIES.find(c => c.name.toLowerCase() === currentLocation.city.toLowerCase());
  }, [currentLocation.city]);

  // Filtered cities list by region
  const filteredCities = useMemo(() => {
    if (activeRegion === 'All') return INDIAN_CITIES;
    return INDIAN_CITIES.filter(c => c.region === activeRegion);
  }, [activeRegion]);

  const POPULAR_HUBS = [
    'Dehradun', 
    'Delhi NCR', 
    'Gurugram', 
    'Noida', 
    'Bengaluru', 
    'Mumbai', 
    'Pune', 
    'Hyderabad', 
    'Jaipur', 
    'Kolkata'
  ];

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200/80 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-6 border-b border-stone-200/80 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center border border-brand-100">
              <MapPin className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-stone-900">Select Your Location</h3>
              <p className="text-xs text-stone-500">
                Discover culinary venues delivering right to your door
              </p>
            </div>
          </div>
          <button
            onClick={() => setModalOpen(false)}
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Use Current Location Action */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-brand-600/20">
                <Navigation className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <span className="font-bold text-stone-900 text-sm block">Auto-Detect via GPS</span>
                <span className="text-xs text-stone-500">
                  Current: <strong className="text-stone-800">{currentLocation.displayText}</strong>
                  {currentLocation.source === 'DETECTED' && ' (GPS Verified)'}
                </span>
              </div>
            </div>

            <button
              onClick={() => detectCurrentLocation()}
              disabled={isDetecting}
              className="px-4 py-2 bg-stone-900 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50 self-start sm:self-auto"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{isDetecting ? 'Locating...' : 'Use My Current Location'}</span>
            </button>
          </div>

          {/* Error / Permission Warning */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Search Input */}
          <div className="relative">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-stone-400 absolute left-4" />
              <input
                type="text"
                placeholder="Search city, locality, or 6-digit PIN code (e.g. Rajpur Road, Koramangala, 248001)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3 rounded-2xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-stone-50/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1 rounded-full text-stone-400 hover:text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Instant Search Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-stone-200 divide-y divide-stone-100 z-20 max-h-60 overflow-y-auto">
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      selectCity(item.cityName, item.localityName);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-3.5 hover:bg-stone-50 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-brand-600 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="font-semibold text-xs text-stone-900">{item.displayText}</div>
                        <div className="text-[11px] text-stone-400">{item.state}, India</div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                      {item.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Hubs */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Popular Metropolitan & Regional Hubs
            </span>
            <div className="flex flex-wrap gap-2">
              {POPULAR_HUBS.map(cityName => {
                const isSelected = currentLocation.city.toLowerCase() === cityName.toLowerCase();
                return (
                  <button
                    key={cityName}
                    onClick={() => selectCity(cityName)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                      isSelected 
                        ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30' 
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    <span>{cityName}</span>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active City Localities */}
          {currentCityObj && currentCityObj.popularLocalities.length > 0 && (
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5 text-brand-600" />
                  <span>Localities in {currentCityObj.name}</span>
                </span>
                <span className="text-[11px] text-stone-400">{currentCityObj.popularLocalities.length} neighborhood areas</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {currentCityObj.popularLocalities.map(loc => {
                  const isCurrentLoc = currentLocation.locality?.toLowerCase() === loc.name.toLowerCase();
                  return (
                    <button
                      key={loc.name}
                      onClick={() => selectLocality(loc.name)}
                      className={`text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                        isCurrentLoc
                          ? 'border-brand-600 bg-brand-50/60 text-brand-900 font-bold'
                          : 'border-stone-200 bg-white hover:border-stone-400 text-stone-700'
                      }`}
                    >
                      <div className="truncate pr-1">
                        <div className="truncate">{loc.name}</div>
                        <div className="text-[10px] text-stone-400 font-normal">{loc.pincode}</div>
                      </div>
                      {isCurrentLoc && <Check className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* All 35+ Cities by Region */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Explore All 35+ Covered Cities
              </span>

              {/* Region Tabs */}
              <div className="inline-flex p-0.5 bg-stone-100 rounded-lg text-[11px] font-semibold text-stone-600">
                {(['All', 'North', 'South', 'West', 'East'] as const).map(region => (
                  <button
                    key={region}
                    onClick={() => setActiveRegion(region)}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      activeRegion === region ? 'bg-white shadow text-stone-900' : 'hover:text-stone-900'
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
              {filteredCities.map(city => {
                const isSelected = currentLocation.city.toLowerCase() === city.name.toLowerCase();
                return (
                  <button
                    key={city.id}
                    onClick={() => selectCity(city.name)}
                    className={`p-2 rounded-xl text-left border text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50 text-brand-900 font-bold'
                        : 'border-stone-200 bg-white hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <div className="truncate">
                      <div className="truncate font-semibold">{city.name}</div>
                      <div className="text-[10px] text-stone-400">{city.state}</div>
                    </div>
                    {isSelected && <Check className="w-3 h-3 text-brand-600 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Real-time Haversine distance calculations applied</span>
          </div>
          <button
            onClick={() => setModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold transition-all"
          >
            Confirm & Browse
          </button>
        </div>

      </div>
    </div>
  );
};
