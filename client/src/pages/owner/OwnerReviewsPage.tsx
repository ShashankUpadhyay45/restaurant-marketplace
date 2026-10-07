import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, Filter, Search } from 'lucide-react';
import { reviewService } from '../../services/reviewService';
import { Review } from '../../types';
import { useToastStore } from '../../store/useToastStore';
import { EmptyState } from '../../components/common/EmptyState';

export const OwnerReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const { showToast } = useToastStore();

  const loadReviews = async () => {
    try {
      const data = await reviewService.getReviews('rest_dehradun_01');
      setReviews(data.reviews);
    } catch (error) {
      showToast({ message: 'Failed to load reviews', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleSubmitResponse = async (reviewId: string) => {
    if (!responseText.trim()) return;
    
    try {
      await reviewService.respondToReview(reviewId, responseText);
      showToast({ message: 'Response submitted successfully', type: 'success' });
      setRespondingTo(null);
      setResponseText('');
      loadReviews(); // Reload to get the new response
    } catch (error) {
      showToast({ message: 'Failed to submit response', type: 'error' });
    }
  };

  const filteredReviews = filterRating 
    ? reviews.filter(r => r.rating === filterRating)
    : reviews;

  // Calculate averages
  const avgRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;
  
  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
          <p className="text-gray-500 text-sm mt-1">Manage feedback and respond to customers</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Rating Overview</h2>
        <div className="flex flex-col md:flex-row items-center">
          <div className="text-center md:text-left md:pr-10 md:border-r border-gray-200 mb-6 md:mb-0">
            <p className="text-5xl font-bold text-gray-900 mb-2">{avgRating.toFixed(1)}</p>
            <div className="flex justify-center md:justify-start mb-1 text-yellow-400">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} className={`w-5 h-5 ${star <= Math.round(avgRating) ? 'fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
            <p className="text-sm text-gray-500">Based on {reviews.length} reviews</p>
          </div>
          
          <div className="flex-1 md:pl-10 w-full space-y-2">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = reviews.filter(r => r.rating === rating).length;
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={rating} className="flex items-center text-sm cursor-pointer hover:bg-gray-50 p-1 rounded" onClick={() => setFilterRating(rating)}>
                  <span className="w-12 flex items-center text-gray-600">{rating} <Star className="w-3 h-3 ml-1 fill-current text-yellow-400" /></span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full mx-3 overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <span className="w-8 text-right text-gray-500">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
        {filterRating && (
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <span className="text-sm text-gray-600">Filtering by {filterRating} stars</span>
            <button onClick={() => setFilterRating(null)} className="text-sm text-orange-600 hover:underline">Clear Filter</button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl"></div>)}
          </div>
        ) : filteredReviews.length > 0 ? (
          filteredReviews.map(review => (
            <div key={review._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600 mr-3">
                    {review.userId.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{review.userId.fullName}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="flex text-yellow-400 mr-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className={`w-3 h-3 ${star <= review.rating ? 'fill-current' : 'text-gray-300'}`} />
                        ))}
                      </span>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {review.orderId && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Verified Order</span>}
              </div>
              
              <p className="text-gray-700 mb-4">{review.comment}</p>
              
              {review.ownerResponse ? (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 ml-8">
                  <div className="flex items-center mb-2">
                    <span className="font-medium text-gray-900 text-sm">Owner Response</span>
                  </div>
                  <p className="text-sm text-gray-600">{review.ownerResponse}</p>
                </div>
              ) : respondingTo === review._id ? (
                <div className="ml-8 mt-4">
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                    rows={3}
                    placeholder="Write your response..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                  ></textarea>
                  <div className="flex justify-end space-x-2 mt-2">
                    <button 
                      onClick={() => { setRespondingTo(null); setResponseText(''); }}
                      className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleSubmitResponse(review._id)}
                      className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
                    >
                      Post Response
                    </button>
                  </div>
                </div>
              ) : (
                <div className="ml-8 mt-2">
                  <button 
                    onClick={() => setRespondingTo(review._id)}
                    className="flex items-center text-sm text-orange-600 hover:text-orange-700 font-medium"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Reply
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <EmptyState
            icon={MessageCircle}
            title="No reviews found"
            description="You don't have any reviews matching the current filters."
          />
        )}
      </div>
    </div>
  );
};
