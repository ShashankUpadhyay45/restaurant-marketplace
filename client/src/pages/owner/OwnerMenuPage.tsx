import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, ChefHat, EyeOff, Eye, ChevronDown, ChevronRight } from 'lucide-react';
import { menuService } from '../../services/menuService';
import { MenuItem, DietaryTag } from '../../types';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';

export const OwnerMenuPage: React.FC = () => {
  const [menu, setMenu] = useState<Record<string, MenuItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Expanded categories
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const RESTAURANT_ID = 'rest_dehradun_01';

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const data = await menuService.getMenuByCategory(RESTAURANT_ID);
      setMenu(data);
      if (Object.keys(data).length > 0 && expandedCats.size === 0) {
        setExpandedCats(new Set(Object.keys(data))); // expand all by default initially
      }
    } catch (error) {
      console.error('Failed to load menu', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await menuService.toggleAvailability(item._id, !item.isAvailable);
      fetchMenu();
    } catch (error) {
      console.error('Failed to toggle availability', error);
    }
  };

  const handleDelete = async () => {
    if (selectedItem) {
      try {
        await menuService.deleteMenuItem(selectedItem._id);
        fetchMenu();
      } catch (error) {
        console.error('Failed to delete item', error);
      } finally {
        setDialogOpen(false);
        setSelectedItem(null);
      }
    }
  };

  const toggleCategory = (cat: string) => {
    const newExpanded = new Set(expandedCats);
    if (newExpanded.has(cat)) newExpanded.delete(cat);
    else newExpanded.add(cat);
    setExpandedCats(newExpanded);
  };

  // Stats calculation
  const allItems = Object.values(menu).flat();
  const stats = {
    total: allItems.length,
    available: allItems.filter(i => i.isAvailable).length,
    unavailable: allItems.filter(i => !i.isAvailable).length,
    specials: allItems.filter(i => i.isSpecial).length,
  };

  const getDietaryBadge = (tag: DietaryTag) => {
    const styles: Record<string, string> = {
      VEG: 'bg-green-100 text-green-800 border-green-200',
      NON_VEG: 'bg-red-100 text-red-800 border-red-200',
      VEGAN: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      GLUTEN_FREE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      HALAL: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return (
      <span key={tag} className={`px-2 py-0.5 text-[10px] font-bold border rounded-sm ${styles[tag] || 'bg-gray-100'}`}>
        {tag.replace('_', ' ')}
      </span>
    );
  };

  const filteredMenu = Object.entries(menu).reduce((acc, [cat, items]) => {
    const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase()));
    if (filtered.length > 0) acc[cat] = filtered;
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-500 text-sm">Manage inventory and prices</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Items</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Available</p>
            <p className="text-2xl font-bold text-green-600">{stats.available}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Unavailable</p>
            <p className="text-2xl font-bold text-red-600">{stats.unavailable}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Chef Specials</p>
            <p className="text-2xl font-bold text-purple-600">{stats.specials}</p>
          </div>
          <ChefHat className="w-8 h-8 text-purple-100" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search menu items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading menu...</div>
        ) : Object.keys(filteredMenu).length === 0 ? (
          <EmptyState
            icon={Search}
            title="No items found"
            description="No menu items matched your search criteria."
          />
        ) : (
          Object.entries(filteredMenu).map(([category, items]) => (
            <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-200 focus:outline-none"
                onClick={() => toggleCategory(category)}
              >
                <div className="flex items-center">
                  {expandedCats.has(category) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400 mr-2" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400 mr-2" />
                  )}
                  <h2 className="text-lg font-bold text-gray-900">{category}</h2>
                  <span className="ml-3 bg-gray-200 text-gray-700 py-0.5 px-2 rounded-full text-xs font-medium">
                    {items.length}
                  </span>
                </div>
              </button>
              
              {expandedCats.has(category) && (
                <ul className="divide-y divide-gray-100">
                  {items.map(item => (
                    <li key={item._id} className={`p-6 flex items-center justify-between hover:bg-gray-50 transition-colors ${!item.isAvailable ? 'opacity-75' : ''}`}>
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className={`text-base font-bold truncate ${!item.isAvailable ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                            {item.name}
                          </h3>
                          {item.isSpecial && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              <ChefHat className="w-3 h-3 mr-1" /> Special
                            </span>
                          )}
                          <div className="flex space-x-1">
                            {item.dietaryTags.map(getDietaryBadge)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-2">{item.description}</p>
                        <div className="flex items-center space-x-4 text-sm font-medium">
                          <span className="text-gray-900">₹{item.basePrice}</span>
                          <span className="text-gray-400">|</span>
                          <span className="text-gray-500">{item.preparationTimeMinutes} mins prep</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 flex-shrink-0">
                        <button
                          onClick={() => handleToggleAvailability(item)}
                          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                            item.isAvailable 
                              ? 'text-green-600 hover:bg-green-50' 
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                        >
                          {item.isAvailable ? <Eye className="w-5 h-5 mb-1" /> : <EyeOff className="w-5 h-5 mb-1" />}
                          <span className="text-[10px] font-medium">{item.isAvailable ? 'Available' : 'Hidden'}</span>
                        </button>
                        
                        <div className="w-px h-8 bg-gray-200"></div>
                        
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => { setSelectedItem(item); setDialogOpen(true); }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Menu Item"
        message={`Are you sure you want to delete "${selectedItem?.name}"? This action cannot be undone.`}
        confirmText="Delete Item"
        isDestructive={true}
      />
    </div>
  );
};
