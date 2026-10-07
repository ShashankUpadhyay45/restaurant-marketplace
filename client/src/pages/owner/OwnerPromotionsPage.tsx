import React, { useState, useEffect } from 'react';
import { Tag, Plus, CheckCircle, XCircle, Search, Edit2 } from 'lucide-react';
import { promotionService } from '../../services/promotionService';
import { Promotion } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToastStore } from '../../store/useToastStore';

export const OwnerPromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToastStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newPromo, setNewPromo] = useState<Partial<Promotion>>({
    discountType: 'PERCENTAGE',
    restaurantId: 'rest_dehradun_01',
    isActive: true,
  });

  const loadPromotions = async () => {
    try {
      const data = await promotionService.getPromotions('rest_dehradun_01');
      setPromotions(data || []);
    } catch (error) {
      showToast({ message: 'Failed to load promotions', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await promotionService.togglePromotion(id, !currentStatus);
      showToast({ message: 'Promotion status updated', type: 'success' });
      loadPromotions();
    } catch (error) {
      showToast({ message: 'Failed to update status', type: 'error' });
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromo.code || !newPromo.discountValue || !newPromo.validUntil) {
      showToast({ message: 'Please fill all required fields', type: 'error' });
      return;
    }

    try {
      await promotionService.createPromotion(newPromo as Promotion);
      showToast({ message: 'Promotion created successfully', type: 'success' });
      setShowAddForm(false);
      loadPromotions();
      setNewPromo({ discountType: 'PERCENTAGE', restaurantId: 'rest_dehradun_01', isActive: true });
    } catch (error) {
      showToast({ message: 'Failed to create promotion', type: 'error' });
    }
  };

  const activeCount = promotions.filter(p => p.isActive).length;
  const totalUsage = promotions.reduce((sum, p) => sum + (p.usageCount || 0), 0);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotions & Offers</h1>
          <p className="text-gray-500 text-sm mt-1">Manage discount codes and special offers</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Promotion
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Active Promotions</p>
            <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
          </div>
          <div className="bg-green-100 p-3 rounded-full text-green-600">
            <Tag className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Redemptions</p>
            <p className="text-2xl font-bold text-gray-900">{totalUsage}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full text-blue-600">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-semibold mb-4">Create New Promotion</h2>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none uppercase"
                  placeholder="e.g., WELCOME50"
                  value={newPromo.code || ''}
                  onChange={e => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="e.g., Welcome Discount"
                  value={newPromo.title || ''}
                  onChange={e => setNewPromo({ ...newPromo, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                <select
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={newPromo.discountType}
                  onChange={e => setNewPromo({ ...newPromo, discountType: e.target.value as any })}
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FLAT">Flat Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={newPromo.discountValue || ''}
                  onChange={e => setNewPromo({ ...newPromo, discountValue: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Value (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={newPromo.minOrderAmount || ''}
                  onChange={e => setNewPromo({ ...newPromo, minOrderAmount: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount Amount (₹)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={newPromo.maxDiscount || ''}
                  onChange={e => setNewPromo({ ...newPromo, maxDiscount: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={newPromo.validUntil || ''}
                  onChange={e => setNewPromo({ ...newPromo, validUntil: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Create Promotion
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      ) : promotions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map(promo => (
            <div key={promo._id} className={`bg-white rounded-xl shadow-sm border p-5 ${!promo.isActive ? 'opacity-75 bg-gray-50' : 'border-gray-200'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="bg-orange-100 text-orange-700 font-bold px-3 py-1 rounded-md text-lg tracking-wider">
                  {promo.code}
                </div>
                <button
                  onClick={() => handleToggleActive(promo._id, promo.isActive)}
                  className={`text-sm px-3 py-1 rounded-full font-medium ${
                    promo.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {promo.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-1">{promo.title}</h3>
              {promo.description && <p className="text-gray-500 text-sm mb-3">{promo.description}</p>}
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span className="font-medium text-gray-900">
                    {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}%` : `₹${promo.discountValue}`}
                    {promo.maxDiscount ? ` (up to ₹${promo.maxDiscount})` : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Min. Order:</span>
                  <span className="font-medium text-gray-900">₹{promo.minOrderAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Valid Until:</span>
                  <span className="font-medium text-gray-900">{new Date(promo.validUntil).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Redemptions:</span>
                  <span className="font-medium text-gray-900">{promo.usageCount || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Tag}
          title="No promotions found"
          description="Create your first promotion to attract more customers."
          actionText="Create Promotion"
          onAction={() => setShowAddForm(true)}
        />
      )}
    </div>
  );
};
