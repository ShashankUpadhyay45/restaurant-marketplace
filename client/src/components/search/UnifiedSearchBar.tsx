import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocationStore } from '../../store/useLocationStore';
import { api } from '../../services/api';
import { Restaurant } from '../../types';
import { 
  Search, 
  X, 
  Store, 
  Utensils, 
  MapPin, 
  Sparkles, 
  ArrowRight,
  Clock,
  Star
} from 'lucide-react';

interface UnifiedSearchBarProps {
  onSearchSubmit?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export const UnifiedSearchBar: React.FC<UnifiedSearchBarProps> = ({
  onSearchSubmit,
  placeholder = 'Search restaurants, dishes, cuisines, or localities (e.g. Sourdough, Biryani, Jakhan)...',
  className = ''
}) => {
  const navigate = useNavigate();
  const { currentLocation, selectLocality } = useLocationStore();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [matchedRestaurants, setMatchedRestaurants] = useState<Restaurant[]>([]);
  const [matchedLocalities, setMatchedLocalities] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // 300ms Debounce search effect
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setMatchedRestaurants([]);
      setMatchedLocalities([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/restaurants?search=${encodeURIComponent(query.trim())}&lat=${currentLocation.latitude}&lng=${currentLocation.longitude}`);
        if (res.success) {
          setMatchedRestaurants((res.restaurants || []).slice(0, 5));
        }

        // Search localities matching query in current city
        const locRes = await api.get(`/locations/search?q=${encodeURIComponent(query.trim())}`);
        if (locRes.success && locRes.results) {
          const locs = locRes.results
            .filter((r: any) => r.type === 'LOCALITY')
            .map((r: any) => r.localityName)
            .filter(Boolean)
            .slice(0, 3);
          setMatchedLocalities(locs);
        }

        setIsOpen(true);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, currentLocation.latitude, currentLocation.longitude]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    if (onSearchSubmit) {
      onSearchSubmit(query);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-4 pointer-events-none text-stone-400">
          <Search className="w-5 h-5" />
        </div>

        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => {
            if (matchedRestaurants.length > 0 || matchedLocalities.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white text-stone-900 placeholder-stone-400 text-sm border border-stone-200/90 shadow-lg shadow-stone-200/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setMatchedRestaurants([]);
              setIsOpen(false);
              if (onSearchSubmit) onSearchSubmit('');
            }}
            className="absolute right-4 p-1 rounded-full text-stone-400 hover:text-stone-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && (matchedRestaurants.length > 0 || matchedLocalities.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-stone-200/80 overflow-hidden z-50 divide-y divide-stone-100 max-h-96 overflow-y-auto animate-in fade-in duration-150">
          
          {/* Matched Localities */}
          {matchedLocalities.length > 0 && (
            <div className="p-3 bg-stone-50/80">
              <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 block px-2 mb-1.5">
                Localities & Areas
              </span>
              <div className="space-y-1">
                {matchedLocalities.map((loc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      selectLocality(loc);
                      setIsOpen(false);
                      setQuery('');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-stone-700 hover:bg-white hover:shadow-sm transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-brand-600" />
                      <span>{loc}, {currentLocation.city}</span>
                    </div>
                    <span className="text-[10px] text-stone-400 group-hover:text-brand-600">Switch Locality →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Restaurants */}
          {matchedRestaurants.length > 0 && (
            <div className="p-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 block px-2 mb-1.5">
                Culinary Venues
              </span>
              <div className="space-y-1">
                {matchedRestaurants.map(r => (
                  <button
                    key={r._id}
                    type="button"
                    onClick={() => {
                      navigate(`/restaurant/${r._id}`);
                      setIsOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-stone-50 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={r.heroImage}
                        alt={r.name}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <div className="text-xs font-bold text-stone-900 group-hover:text-brand-600 transition-colors">
                          {r.name}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {r.cuisineTypes.slice(0, 2).join(' • ')} • {r.address.locality || r.address.city}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-xs font-bold text-stone-800 justify-end">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{r.averageRating.toFixed(1)}</span>
                      </div>
                      {r.computedDistanceKm !== undefined && (
                        <div className={`text-[10px] font-semibold ${r.isDeliveringToUser ? 'text-emerald-600' : 'text-stone-400'}`}>
                          {r.computedDistanceKm.toFixed(1)} km away
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* View All Matches Footer */}
          <div className="p-3 bg-stone-50 flex items-center justify-between text-xs font-semibold text-stone-600">
            <span>Press Enter to explore all matching dishes & venues</span>
            <button
              type="button"
              onClick={handleSubmit}
              className="text-brand-600 hover:text-brand-700 flex items-center space-x-1"
            >
              <span>See All Results</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
