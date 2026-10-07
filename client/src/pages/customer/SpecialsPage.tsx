import React, { useState, useEffect } from 'react';
import { restaurantService } from '../../services/restaurantService';
import { useCartStore } from '../../store/useCartStore';
import { useToastStore } from '../../store/useToastStore';
import { useLocationStore } from '../../store/useLocationStore';
import { getMockDatabase } from '../../data/mockData';
import { MenuItem } from '../../types';
import { Sparkles, Plus, Star, MapPin, Flame } from 'lucide-react';

export const SpecialsPage: React.FC = () => {
  const { currentLocation } = useLocationStore();
  const [specials, setSpecials] = useState<Array<{ dish: MenuItem; restaurantName: string; city: string }>>([]);
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { addItem } = useCartStore();
  const { showToast } = useToastStore();

  const CITIES = ['ALL', 'Dehradun', 'Delhi NCR', 'Mumbai', 'Bengaluru', 'Jaipur'];

  useEffect(() => {
    setIsLoading(true);
    const db = getMockDatabase();
    const list: Array<{ dish: MenuItem; restaurantName: string; city: string }> = [];

    db.menuItems.filter(m => m.isSpecial).forEach(dish => {
      const rest = db.restaurants.find(r => r._id === dish.restaurantId);
      if (rest) {
        if (selectedCity === 'ALL' || rest.address.city.toLowerCase() === selectedCity.toLowerCase()) {
          list.push({
            dish,
            restaurantName: rest.name,
            city: rest.address.city
          });
        }
      }
    });

    setSpecials(list);
    setIsLoading(false);
  }, [selectedCity]);

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
        title: 'Special Added',
        message: `${dish.name} added to your cart.`
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200 mb-8">
        <div>
          <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Curated Daily Selections</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Today's Chef Specials
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Signature heirloom gravies, slow-tandoor roasts, and rare regional dishes curated for today.
          </p>
        </div>

        {/* City Filter */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {CITIES.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCity(c)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCity === c
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {c === 'ALL' ? 'All Cities' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {specials.map(({ dish, restaurantName, city }) => (
          <div
            key={dish._id}
            className="flex flex-col justify-between bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all group"
          >
            <div className="relative h-48 overflow-hidden bg-stone-100">
              <img
                src={dish.imageUrl}
                alt={dish.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-xs text-amber-300 text-[11px] font-bold">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Chef's Choice</span>
              </div>
              <div className="absolute top-3 right-3 flex items-center space-x-1 px-2 py-0.5 rounded-full bg-white/90 text-stone-800 text-[11px] font-bold">
                <MapPin className="w-3 h-3 text-brand-600" />
                <span>{city}</span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    dish.dietaryTags.includes('VEG') ? 'bg-emerald-600' : 'bg-rose-600'
                  }`} />
                  <span className="text-xs font-semibold text-stone-400 truncate">
                    {restaurantName}
                  </span>
                </div>
                <h3 className="text-base font-bold text-stone-900 group-hover:text-brand-600 transition-colors">
                  {dish.name}
                </h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed line-clamp-2">
                  {dish.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-stone-100">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">Price in INR</span>
                  <span className="text-lg font-extrabold text-stone-900">₹{dish.basePrice}</span>
                </div>

                <button
                  onClick={() => handleAddToCart(dish, restaurantName)}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-600/20 cursor-pointer flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
