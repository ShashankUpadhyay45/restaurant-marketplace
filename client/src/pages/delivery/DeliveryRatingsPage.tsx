import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, Clock, CheckCircle, MessageSquare } from 'lucide-react';
import { deliveryService } from '../../services/deliveryService';
import { useAuthStore } from '../../store/useAuthStore';

export const DeliveryRatingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const riderId = user?.id || 'rider_01';
        const data = await deliveryService.getRiderProfile(riderId);
        setProfile(data);
      } catch (error) {
        console.error('Failed to load profile', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [user?.id]);

  const ratingBars = [
    { stars: 5, percentage: 75, count: 120 },
    { stars: 4, percentage: 15, count: 24 },
    { stars: 3, percentage: 5, count: 8 },
    { stars: 2, percentage: 3, count: 5 },
    { stars: 1, percentage: 2, count: 3 },
  ];

  const recentReviews = [
    { id: 1, name: 'Anjali S.', rating: 5, date: '2 days ago', text: 'Very polite and delivered on time.' },
    { id: 2, name: 'Rahul K.', rating: 5, date: '4 days ago', text: 'Fast delivery, food was hot.' },
    { id: 3, name: 'Priya M.', rating: 4, date: '1 week ago', text: 'Good service.' },
    { id: 4, name: 'Vikram B.', rating: 3, date: '1 week ago', text: 'Delivery was a bit late due to rain.' },
  ];

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 pb-24">
      <h1 className="text-2xl font-bold">Ratings & Feedback</h1>

      {/* Main Rating Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center">
        <div className="text-center flex-shrink-0">
          <h2 className="text-5xl font-bold text-gray-900 mb-2">{profile?.rating || 4.8}</h2>
          <div className="flex gap-1 justify-center mb-1 text-amber-500">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} size={20} fill={i <= 4 ? "currentColor" : "none"} strokeWidth={i <= 4 ? 0 : 2} />
            ))}
          </div>
          <p className="text-sm text-gray-500">Based on 160 ratings</p>
        </div>
        
        <div className="flex-1 w-full space-y-2">
          {ratingBars.map((bar) => (
            <div key={bar.stars} className="flex items-center gap-3 text-sm">
              <span className="w-4 font-medium">{bar.stars}</span>
              <Star size={14} className="text-gray-400" />
              <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${bar.percentage}%` }}
                />
              </div>
              <span className="w-8 text-right text-gray-500">{bar.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start gap-3">
          <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
            <ThumbsUp size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Acceptance Rate</p>
            <p className="text-xl font-bold text-gray-900">94%</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start gap-3">
          <div className="bg-green-50 p-2 rounded-lg text-green-600">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">On-Time Rate</p>
            <p className="text-xl font-bold text-gray-900">98%</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start gap-3">
          <div className="bg-purple-50 p-2 rounded-lg text-purple-600">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Completion Rate</p>
            <p className="text-xl font-bold text-gray-900">99%</p>
          </div>
        </div>
      </div>

      {/* Recent Reviews */}
      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <MessageSquare size={20} />
          Recent Customer Feedback
        </h2>
        <div className="space-y-4">
          {recentReviews.map((review) => (
            <div key={review.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-gray-900">{review.name}</p>
                  <p className="text-xs text-gray-500">{review.date}</p>
                </div>
                <div className="flex gap-0.5 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={i < review.rating ? 0 : 2} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-700">{review.text}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Tips */}
      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
        <h3 className="font-semibold text-orange-800 mb-2">Tips for 5-Star Ratings</h3>
        <ul className="text-sm text-orange-700 space-y-1 list-disc list-inside">
          <li>Always double-check the order items at pickup</li>
          <li>Handle food packages carefully to prevent spills</li>
          <li>Call the customer if you are delayed</li>
          <li>Be polite and professional during handoff</li>
        </ul>
      </div>
    </div>
  );
};
