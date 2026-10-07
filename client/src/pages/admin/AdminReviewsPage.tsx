import React, { useState, useEffect } from 'react';
import { getMockDatabase } from '../../data/mockData';
import { Review } from '../../types';
import { MessageSquare, Star, Shield, Flag, Trash2, CheckCircle, Search } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToastStore } from '../../store/useToastStore';

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | 'ALL'>('ALL');
  const [filterFlagged, setFilterFlagged] = useState<boolean>(false);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, reviewId?: string}>({ isOpen: false });
  const { showToast } = useToastStore();

  useEffect(() => {
    const fetchReviews = () => {
      setLoading(true);
      try {
        const db = getMockDatabase();
        setReviews(db.reviews || []);
      } catch (err) {
        showToast({ message: 'Failed to load reviews', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [showToast]);

  const filteredReviews = reviews.filter(r => {
    if (filterRating !== 'ALL' && r.rating !== filterRating) return false;
    // mock flag property since it's not in standard type, using length > 0 or fake logic for demo
    if (filterFlagged && !r.comment.toLowerCase().includes('bad')) return false; 
    return true;
  });

  const avgRating = reviews.length ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0;

  const handleRemoveReview = () => {
    if (confirmDialog.reviewId) {
      setReviews(reviews.filter(r => r._id !== confirmDialog.reviewId));
      showToast({ message: 'Review removed successfully', type: 'success' });
    }
    setConfirmDialog({ isOpen: false });
  };

  const handleFlagReview = (id: string) => {
    showToast({ message: 'Review flagged for manual review', type: 'success' });
  };

  const handleFeatureReview = (id: string) => {
    showToast({ message: 'Review featured on platform', type: 'success' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reviews & Moderation</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-gray-500 mb-1">Total Reviews</div>
            <div className="text-2xl font-bold">{reviews.length}</div>
          </div>
          <MessageSquare className="w-8 h-8 text-blue-500 opacity-20" />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-gray-500 mb-1">Average Rating</div>
            <div className="text-2xl font-bold flex items-center">
              {avgRating} <Star className="w-5 h-5 text-yellow-400 ml-2 fill-current" />
            </div>
          </div>
          <Star className="w-8 h-8 text-yellow-500 opacity-20" />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-gray-500 mb-1">Flagged for Review</div>
            <div className="text-2xl font-bold text-red-600">
               {reviews.filter(r => r.comment.toLowerCase().includes('bad')).length}
            </div>
          </div>
          <Flag className="w-8 h-8 text-red-500 opacity-20" />
        </div>
      </div>

      <div className="flex space-x-4 bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Rating:</label>
          <select 
            value={filterRating} 
            onChange={(e) => setFilterRating(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Ratings</option>
            {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={filterFlagged} 
              onChange={(e) => setFilterFlagged(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Show Flagged Only</span>
          </label>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading reviews...</div>
        ) : filteredReviews.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No reviews found" description="No reviews match your current filters." />
        ) : (
          filteredReviews.map(review => (
            <div key={review._id} className="bg-white rounded-lg border border-gray-200 p-5 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">{review.userId?.fullName}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{review.restaurantId}</span>
                    <span title="Verified Order"><Shield className="w-4 h-4 text-green-500" /></span>
                  </div>
                  <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-gray-700 text-sm">{review.comment}</p>
                {review.isVerifiedDiner && (
                  <div className="mt-3 flex gap-2">
                    <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full font-medium">Verified Diner</span>
                  </div>
                )}
              </div>
              <div className="flex md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-4">
                <button onClick={() => handleFeatureReview(review._id)} className="flex items-center justify-center px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md border border-transparent hover:border-blue-200 transition-colors">
                  <CheckCircle className="w-4 h-4 mr-1.5" /> Feature
                </button>
                <button onClick={() => handleFlagReview(review._id)} className="flex items-center justify-center px-3 py-1.5 text-sm text-yellow-600 hover:bg-yellow-50 rounded-md border border-transparent hover:border-yellow-200 transition-colors">
                  <Flag className="w-4 h-4 mr-1.5" /> Flag
                </button>
                <button onClick={() => setConfirmDialog({ isOpen: true, reviewId: review._id })} className="flex items-center justify-center px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md border border-transparent hover:border-red-200 transition-colors">
                  <Trash2 className="w-4 h-4 mr-1.5" /> Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false })}
        onConfirm={handleRemoveReview}
        title="Remove Review"
        message="Are you sure you want to completely remove this review? This action cannot be undone."
        confirmText="Remove"
        isDestructive={true}
      />
    </div>
  );
};
