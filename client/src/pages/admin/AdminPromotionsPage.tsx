import React, { useState, useEffect } from 'react';
import { promotionService } from '../../services/promotionService';
import { Promotion } from '../../types';
import { Tag, Plus, CheckCircle, XCircle, Percent, IndianRupee } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { useToastStore } from '../../store/useToastStore';

export const AdminPromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToastStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPromo, setNewPromo] = useState<Partial<Promotion>>({
    discountType: 'PERCENTAGE',
    isActive: true,
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const data = await promotionService.getPromotions();
      setPromotions(data);
    } catch (err) {
      showToast({ message: 'Failed to load promotions', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePromo = async (id: string, currentStatus: boolean) => {
    try {
      await promotionService.togglePromotion(id, !currentStatus);
      setPromotions(promotions.map(p => p._id === id ? { ...p, isActive: !currentStatus } : p));
      showToast({ message: `Promotion ${!currentStatus ? 'activated' : 'deactivated'}`, type: 'success' });
    } catch (err) {
      showToast({ message: 'Failed to update promotion', type: 'error' });
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromo.code || !newPromo.title || !newPromo.discountValue) {
      showToast({ message: 'Please fill all required fields', type: 'error' });
      return;
    }
    
    try {
      const promoToCreate: Omit<Promotion, '_id' | 'usageCount'> = {
        code: newPromo.code,
        title: newPromo.title,
        description: newPromo.description || '',
        discountType: (newPromo.discountType as 'PERCENTAGE' | 'FLAT') || 'PERCENTAGE',
        discountValue: Number(newPromo.discountValue),
        minOrderAmount: Number(newPromo.minOrderAmount || 0),
        maxDiscount: newPromo.maxDiscount ? Number(newPromo.maxDiscount) : undefined,
        validUntil: newPromo.validUntil || new Date(Date.now() + 30*24*60*60*1000).toISOString(),
        isActive: true,
        scope: 'ALL_RESTAURANTS'
      };
      
      const created = await promotionService.createPromotion(promoToCreate);
      setPromotions([...promotions, created]);
      setShowCreateModal(false);
      setNewPromo({ discountType: 'PERCENTAGE', isActive: true });
      showToast({ message: 'Promotion created successfully', type: 'success' });
    } catch (err) {
      showToast({ message: 'Failed to create promotion', type: 'error' });
    }
  };

  const stats = {
    active: promotions.filter(p => p.isActive).length,
    totalUsage: promotions.reduce((sum, p) => sum + p.usageCount, 0),
    platformWide: promotions.filter(p => !p.restaurantId).length,
    restaurantSpecific: promotions.filter(p => p.restaurantId).length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Promotions & Offers</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Promotion
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="text-gray-500 mb-1 text-sm">Active Promotions</div>
          <div className="text-2xl font-bold text-green-600">{stats.active} / {promotions.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="text-gray-500 mb-1 text-sm">Total Usage</div>
          <div className="text-2xl font-bold">{stats.totalUsage}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="text-gray-500 mb-1 text-sm">Platform-wide</div>
          <div className="text-2xl font-bold text-blue-600">{stats.platformWide}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="text-gray-500 mb-1 text-sm">Restaurant Specific</div>
          <div className="text-2xl font-bold text-orange-600">{stats.restaurantSpecific}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading promotions...</div>
        ) : promotions.length === 0 ? (
          <EmptyState icon={Tag} title="No promotions found" description="Create a new promotion to get started." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Promo Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scope</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {promotions.map((promo) => (
                  <tr key={promo._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-bold text-gray-900">{promo.code}</div>
                          <div className="text-xs text-gray-500">{promo.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        {promo.discountType === 'PERCENTAGE' ? (
                          <>{promo.discountValue}<Percent className="w-3 h-3 ml-1" /></>
                        ) : (
                          <><IndianRupee className="w-3 h-3 mr-1" />{promo.discountValue}</>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">Min: ₹{promo.minOrderAmount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        !promo.restaurantId ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {!promo.restaurantId ? 'Platform' : 'Restaurant'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {promo.usageCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {promo.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleTogglePromo(promo._id, promo.isActive)}
                        className={`text-sm ${promo.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                      >
                        {promo.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCreateModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreatePromo}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Create Platform Promotion</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Promo Code</label>
                      <input type="text" required value={newPromo.code || ''} onChange={e => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm" placeholder="e.g. SUMMER50" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <input type="text" required value={newPromo.title || ''} onChange={e => setNewPromo({...newPromo, title: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm" placeholder="50% off on all orders" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Discount Type</label>
                        <select value={newPromo.discountType} onChange={e => setNewPromo({...newPromo, discountType: e.target.value as any})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm">
                          <option value="PERCENTAGE">Percentage (%)</option>
                          <option value="FLAT">Flat Amount (₹)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Discount Value</label>
                        <input type="number" required min="1" value={newPromo.discountValue || ''} onChange={e => setNewPromo({...newPromo, discountValue: Number(e.target.value)})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Min Order Amount (₹)</label>
                        <input type="number" required min="0" value={newPromo.minOrderAmount || ''} onChange={e => setNewPromo({...newPromo, minOrderAmount: Number(e.target.value)})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm" />
                      </div>
                      {newPromo.discountType === 'PERCENTAGE' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Max Discount (₹)</label>
                          <input type="number" min="0" value={newPromo.maxDiscount || ''} onChange={e => setNewPromo({...newPromo, maxDiscount: Number(e.target.value)})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-black text-base font-medium text-white hover:bg-gray-800 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                    Create
                  </button>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
