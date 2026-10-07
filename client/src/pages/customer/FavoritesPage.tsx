import React, { useState, useEffect, useMemo } from 'react';
import { Heart, MapPin, Store } from 'lucide-react';
import { Restaurant } from '../../types';
import { restaurantService } from '../../services/restaurantService';
import { EmptyState } from '../../components/common/EmptyState';
import { RestaurantCard } from '../../components/customer/RestaurantCard';
import { useToastStore } from '../../store/useToastStore';

export const FavoritesPage: React.FC = () => {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const showToast = useToastStore((state) => state.showToast);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setLoading(true);
        // Load favorite IDs from local storage
        const storedFavorites = JSON.parse(localStorage.getItem('gourmetfleet_favorites') || '[]');
        setFavoriteIds(storedFavorites);

        // Fetch all restaurants and filter
        // In a real app, we'd probably have an endpoint that takes an array of IDs
        const allRestaurantsResponse = await restaurantService.getRestaurants({});
        const favRestaurants = allRestaurantsResponse.restaurants.filter(r => storedFavorites.includes(r._id));
        
        setRestaurants(favRestaurants);
      } catch (error) {
        console.error('Error loading favorites:', error);
        showToast({ message: 'Failed to load favorite restaurants', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [showToast]);

  const uniqueCities = useMemo(() => {
    const cities = new Set(restaurants.map(r => r.address?.city).filter(Boolean));
    return ['All', ...Array.from(cities)] as string[];
  }, [restaurants]);

  const filteredRestaurants = useMemo(() => {
    if (selectedCity === 'All') return restaurants;
    return restaurants.filter(r => r.address?.city === selectedCity);
  }, [restaurants, selectedCity]);

  const handleToggleFavorite = (restaurantId: string) => {
    const updatedFavorites = favoriteIds.filter(id => id !== restaurantId);
    
    // Update state
    setFavoriteIds(updatedFavorites);
    setRestaurants(prev => prev.filter(r => r._id !== restaurantId));
    
    // Update local storage
    localStorage.setItem('gourmetfleet_favorites', JSON.stringify(updatedFavorites));
    
    showToast({ message: 'Removed from favorites', type: 'success' });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-100 h-64 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          description="You haven't saved any restaurants to your favorites yet. Start exploring to build your list!"
          actionText="Browse Restaurants"
          onAction={() => window.location.href = '/restaurants'}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            My Favorites
          </h1>
          <p className="text-gray-500 mt-2">
            You have {favoriteIds.length} saved restaurant{favoriteIds.length === 1 ? '' : 's'}
          </p>
        </div>

        {uniqueCities.length > 2 && (
          <div className="mt-4 md:mt-0 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {uniqueCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {filteredRestaurants.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No favorites in {selectedCity}</h3>
          <p className="text-gray-500 mt-1">Try selecting a different city or viewing all.</p>
          <button 
            onClick={() => setSelectedCity('All')}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            View All Favorites
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRestaurants.map(restaurant => (
            <div key={restaurant._id} className="relative group">
              <RestaurantCard restaurant={restaurant} />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleToggleFavorite(restaurant._id);
                }}
                className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md text-red-500 hover:bg-red-50 transition-colors z-10"
                title="Remove from favorites"
              >
                <Heart className="w-5 h-5 fill-current" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
