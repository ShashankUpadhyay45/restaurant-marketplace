import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { restaurantService } from '../../services/restaurantService';
import { useCartStore } from '../../store/useCartStore';
import { useToastStore } from '../../store/useToastStore';
import { getMockDatabase } from '../../data/mockData';
import { Restaurant, MenuItem } from '../../types';
import { RestaurantCard } from '../../components/customer/RestaurantCard';
import { EmptyState } from '../../components/common/EmptyState';
import { 
  Search, 
  UtensilsCrossed, 
  MapPin, 
  Star, 
  Plus, 
  Sparkles, 
  Flame, 
  SlidersHorizontal,
  ChevronRight,
  Filter
} from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState<string>(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'restaurants' | 'dishes'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [matchedRestaurants, setMatchedRestaurants] = useState<Restaurant[]>([]);
  const [matchedDishes, setMatchedDishes] = useState<Array<{ dish: MenuItem; restaurantName: string }>>([]);

  const { addItem } = useCartStore();
  const { showToast } = useToastStore();

  const POPULAR_SEARCHES = [
    'Dal Bukhara', 'Butter Chicken', 'Biryani', 'Pahadi Mutton', 
    'Paneer Tikka', 'Benne Dosa', 'Laal Maas', 'Chur Chur Naan', 'Sourdough Pizza'
  ];

  useEffect(() => {
    if (!query.trim()) {
      setMatchedRestaurants([]);
      setMatchedDishes([]);
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(true);
      const db = getMockDatabase();
      const q = query.toLowerCase().trim();

      // Search Restaurants by Name, Cuisine, Address, City
      const restResults = db.restaurants.filter(r => 
        r.name.toLowerCase().includes(q) ||
        r.cuisineTypes.some(c => c.toLowerCase().includes(q)) ||
        r.address.city.toLowerCase().includes(q) ||
        r.address.locality?.toLowerCase().includes(q) ||
        r.address.addressLine1?.toLowerCase().includes(q)
      );

      // Search Dishes by Item Name, Category, Description
      const dishResults: Array<{ dish: MenuItem; restaurantName: string }> = [];
      db.menuItems.forEach(item => {
        if (
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        ) {
          const rest = db.restaurants.find(r => r._id === item.restaurantId);
          dishResults.push({
            dish: item,
            restaurantName: rest?.name || 'Artisanal Kitchen'
          });
        }
      });

      setMatchedRestaurants(restResults);
      setMatchedDishes(dishResults);
      setIsLoading(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleAddToCart = (dish: MenuItem, restaurantName: string) => {
    const success = addItem(dish.restaurantId, restaurantName, {
      menuItemId: dish._id,
      name: dish.name,
      basePrice: dish.basePrice,
      unitPrice: dish.basePrice,
      quantity: 1,
      dietaryTag: dish.dietaryTags[0],
      imageUrl: dish.imageUrl
    });

    if (success) {
      showToast({
        type: 'success',
        title: 'Added to Cart',
        message: `${dish.name} from ${restaurantName} added to your cart.`
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Header */}
      <div className="max-w-3xl mx-auto text-center mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mb-2">
          Discover Food & Restaurants
        </h1>
        <p className="text-sm text-stone-500 mb-6">
          Search across 100+ vetted dining spots, regional Indian delicacies, cuisines, and localities.
        </p>

        {/* Input Bar */}
        <div className="relative flex items-center shadow-lg rounded-2xl overflow-hidden border border-stone-200 bg-white">
          <div className="pl-4 text-stone-400">
            <Search className="w-6 h-6 text-brand-600" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchParams(e.target.value ? { q: e.target.value } : {});
            }}
            placeholder="Search by dish (e.g. Pahadi Mutton), restaurant, cuisine, or locality..."
            className="w-full py-4 pl-3 pr-4 text-sm sm:text-base text-stone-900 focus:outline-none placeholder:text-stone-400"
            autoFocus
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSearchParams({});
              }}
              className="pr-4 text-xs font-bold text-stone-400 hover:text-stone-700"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
          <span className="text-stone-400 font-semibold flex items-center">
            <Flame className="w-3.5 h-3.5 text-amber-500 mr-1" />
            Trending:
          </span>
          {POPULAR_SEARCHES.map((item) => (
            <button
              key={item}
              onClick={() => {
                setQuery(item);
                setSearchParams({ q: item });
              }}
              className="px-3 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors cursor-pointer"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      {query.trim() && (
        <div className="flex items-center justify-center space-x-2 border-b border-stone-200 pb-4 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all' ? 'bg-stone-900 text-white shadow-sm' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Results ({matchedRestaurants.length + matchedDishes.length})
          </button>
          <button
            onClick={() => setActiveTab('restaurants')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'restaurants' ? 'bg-stone-900 text-white shadow-sm' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Restaurants ({matchedRestaurants.length})
          </button>
          <button
            onClick={() => setActiveTab('dishes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'dishes' ? 'bg-stone-900 text-white shadow-sm' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Dishes ({matchedDishes.length})
          </button>
        </div>
      )}

      {/* Results Rendering */}
      {!query.trim() ? (
        <div className="text-center py-16 text-stone-400">
          <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 text-stone-300" />
          <p className="text-sm">Type a dish, cuisine, locality, or restaurant name above to begin exploring.</p>
        </div>
      ) : matchedRestaurants.length === 0 && matchedDishes.length === 0 ? (
        <EmptyState
          icon={Search}
          title={`No Results for "${query}"`}
          description="We couldn't find any matching dishes or restaurants. Try searching for broader terms like 'Biryani', 'Thali', or 'North Indian'."
          actionText="Browse All Restaurants"
          onAction={() => setQuery('')}
        />
      ) : (
        <div className="space-y-10">
          {/* Restaurants Section */}
          {(activeTab === 'all' || activeTab === 'restaurants') && matchedRestaurants.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-stone-900 flex items-center space-x-2">
                  <span>Matching Restaurants</span>
                  <span className="text-xs bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full font-bold">
                    {matchedRestaurants.length}
                  </span>
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {matchedRestaurants.slice(0, 6).map(r => (
                  <RestaurantCard key={r._id} restaurant={r} />
                ))}
              </div>
            </div>
          )}

          {/* Dishes Section */}
          {(activeTab === 'all' || activeTab === 'dishes') && matchedDishes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-stone-900 flex items-center space-x-2">
                  <span>Matching Dishes</span>
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                    {matchedDishes.length}
                  </span>
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matchedDishes.slice(0, 12).map(({ dish, restaurantName }) => (
                  <div
                    key={dish._id}
                    className="flex items-start justify-between p-4 bg-white rounded-2xl border border-stone-200 hover:border-brand-300 transition-all shadow-2xs group"
                  >
                    <div className="flex-1 pr-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          dish.dietaryTags.includes('VEG') ? 'bg-emerald-600' : 'bg-rose-600'
                        }`} />
                        <span className="text-[11px] font-semibold text-stone-400 truncate max-w-[180px]">
                          {restaurantName}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-stone-900 group-hover:text-brand-600 transition-colors leading-snug">
                        {dish.name}
                      </h4>
                      <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                        {dish.description}
                      </p>
                      <div className="mt-3 flex items-center space-x-3 text-xs">
                        <span className="font-extrabold text-stone-900 text-sm">₹{dish.basePrice}</span>
                        {dish.isSpecial && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center">
                            <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                            Chef Special
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-center shrink-0">
                      <img
                        src={dish.imageUrl}
                        alt={dish.name}
                        className="w-20 h-20 rounded-xl object-cover mb-2 border border-stone-100 shadow-inner"
                      />
                      <button
                        onClick={() => handleAddToCart(dish, restaurantName)}
                        className="px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>ADD</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
