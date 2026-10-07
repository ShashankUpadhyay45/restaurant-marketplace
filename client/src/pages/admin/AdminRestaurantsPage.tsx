import React, { useEffect, useState } from 'react';
import { restaurantService } from '../../services/restaurantService';
import { Restaurant } from '../../types';
import { useToastStore } from '../../store/useToastStore';
import { Search, Filter, Store, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';

export const AdminRestaurantsPage: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToastStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        const data = await restaurantService.getRestaurants({});
        setRestaurants(data.restaurants);
        setFilteredRestaurants(data.restaurants);
      } catch (error) {
        showToast({ message: 'Failed to fetch restaurants', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, [showToast]);

  useEffect(() => {
    let result = restaurants;
    if (searchTerm) {
      result = result.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (statusFilter !== 'ALL') {
      result = result.filter(r => r.verificationStatus === statusFilter);
    }
    setFilteredRestaurants(result);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, restaurants]);

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'SUSPENDED' ? 'VERIFIED' : 'SUSPENDED';
    setRestaurants(restaurants.map(r => r._id === id ? { ...r, verificationStatus: newStatus as any } : r));
    showToast({ message: `Restaurant status changed to ${newStatus}`, type: 'success' });
  };

  const paginatedData = filteredRestaurants.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);

  const stats = {
    total: restaurants.length,
    verified: restaurants.filter(r => r.verificationStatus === 'VERIFIED').length,
    pending: restaurants.filter(r => r.verificationStatus === 'PENDING').length,
    suspended: restaurants.filter(r => r.verificationStatus === 'SUSPENDED').length,
  };

  if (loading) {
    return <div className="p-6">Loading restaurants...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manage Restaurants</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Restaurants" value={stats.total} />
        <StatCard title="Verified" value={stats.verified} color="text-green-600" />
        <StatCard title="Pending" value={stats.pending} color="text-yellow-600" />
        <StatCard title="Suspended" value={stats.suspended} color="text-red-600" />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name..."
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="border rounded-md px-4 py-2 bg-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="VERIFIED">Verified</option>
          <option value="PENDING">Pending</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {/* Table */}
      {filteredRestaurants.length === 0 ? (
        <EmptyState icon={Store} title="No restaurants found" description="Adjust your filters or search term" />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-500 text-sm">
                  <th className="py-3 px-4 font-medium">Name</th>
                  <th className="py-3 px-4 font-medium">City</th>
                  <th className="py-3 px-4 font-medium">Mode</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((restaurant) => (
                  <React.Fragment key={restaurant._id}>
                    <tr className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{restaurant.name}</div>
                        <div className="text-xs text-gray-500">{restaurant.cuisineTypes.join(', ')}</div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{restaurant.address.city}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{restaurant.operatingMode}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={restaurant.verificationStatus} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <button 
                            onClick={() => setExpandedId(expandedId === restaurant._id ? null : restaurant._id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            {expandedId === restaurant._id ? 'Hide' : 'View'}
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(restaurant._id, restaurant.verificationStatus)}
                            className={`text-sm font-medium ${restaurant.verificationStatus === 'SUSPENDED' ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}`}
                          >
                            {restaurant.verificationStatus === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === restaurant._id && (
                      <tr className="bg-gray-50 border-b">
                        <td colSpan={5} className="p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="block text-gray-500">Rating</span>
                              <span className="font-medium">{restaurant.averageRating?.toFixed(1) || '4.5'} ({restaurant.totalReviews || 0} reviews)</span>
                            </div>
                            <div>
                              <span className="block text-gray-500">Commission Rate</span>
                              <span className="font-medium">15% (mock)</span>
                            </div>
                            <div>
                              <span className="block text-gray-500">Address</span>
                              <span className="font-medium">{restaurant.address.street}</span>
                            </div>
                            <div>
                              <button className="flex items-center text-blue-600 hover:underline">
                                <MapPin className="w-4 h-4 mr-1" /> View on Map
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="p-4 border-t flex justify-between items-center text-sm">
              <span className="text-gray-500">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredRestaurants.length)} of {filteredRestaurants.length}</span>
              <div className="space-x-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, color = "text-gray-900" }: { title: string, value: number, color?: string }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
    <p className="text-sm font-medium text-gray-500">{title}</p>
    <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    VERIFIED: 'bg-green-100 text-green-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    SUSPENDED: 'bg-red-100 text-red-800',
  }[status] || 'bg-gray-100 text-gray-800';
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles}`}>
      {status}
    </span>
  );
};

export default AdminRestaurantsPage;
