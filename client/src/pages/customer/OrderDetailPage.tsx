import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { reviewService } from '../../services/reviewService';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { Order, OrderStatus } from '../../types';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Repeat, 
  Star, 
  Navigation, 
  ShieldCheck, 
  Phone,
  Bike
} from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showToast } = useToastStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);

  // Multi-factor ratings
  const [foodRating, setFoodRating] = useState<number>(5);
  const [deliveryRating, setDeliveryRating] = useState<number>(5);
  const [packagingRating, setPackagingRating] = useState<number>(5);
  const [overallRating, setOverallRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isReviewSubmitted, setIsReviewSubmitted] = useState<boolean>(false);

  useEffect(() => {
    async function loadOrder() {
      if (id) {
        const data = await orderService.getOrderById(id);
        setOrder(data);
      }
      setIsLoading(false);
    }
    loadOrder();
  }, [id]);

  if (isLoading || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-stone-500">
        <p>Loading order breakdown...</p>
      </div>
    );
  }

  const handleReorder = async () => {
    try {
      const newOrder = await orderService.reorder(order._id);
      showToast({
        type: 'success',
        title: 'Reordered Successfully! 🛍️',
        message: `Order #${newOrder.orderNumber} placed.`
      });
      navigate(`/orders/${newOrder._id}`);
    } catch (err: any) {
      showToast({ type: 'error', message: err.message || 'Failed to reorder' });
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await reviewService.submitReview({
        restaurantId: typeof order.restaurantId === 'string' ? order.restaurantId : (order.restaurantId as any)._id,
        orderId: order._id,
        userName: user?.fullName || 'Verified Diner',
        foodRating,
        deliveryRating,
        packagingRating,
        rating: overallRating,
        comment: reviewComment || 'Delicious food and excellent delivery experience!'
      });
      setIsReviewSubmitted(true);
      setIsReviewOpen(false);
      showToast({
        type: 'success',
        title: 'Review Submitted',
        message: 'Thank you for rating your culinary experience!'
      });
    } catch (err: any) {
      showToast({ type: 'error', message: err.message || 'Failed to submit review' });
    }
  };

  const isDelivered = order.orderStatus === 'DELIVERED';
  const isOutForDelivery = ['RIDER_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <Link
        to="/orders"
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Order History</span>
      </Link>

      {/* Main Order Card */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden mb-8">
        {/* Header */}
        <div className="p-6 sm:p-8 bg-stone-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-stone-400 mb-1">
              <span>Order Number</span>
              <span>•</span>
              <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <h1 className="text-2xl font-bold font-mono tracking-tight text-white">
              #{order.orderNumber}
            </h1>
            <p className="text-sm font-semibold text-amber-400 mt-1">
              {order.restaurantName || 'Artisanal Restaurant'}
            </p>
          </div>

          <div className="flex flex-col sm:items-end space-y-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              {order.orderStatus}
            </span>
            <div className="text-xl font-extrabold text-white">₹{order.totalAmount}</div>
          </div>
        </div>

        {/* Live Tracking Banner if order is active */}
        {isOutForDelivery && (
          <div className="bg-emerald-50 border-b border-emerald-200 p-4 sm:px-8 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center animate-pulse">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-950">Rider is en-route with your food!</p>
                <p className="text-[11px] text-emerald-700">Delivery OTP: <strong>{order.deliveryOtp || '4829'}</strong></p>
              </div>
            </div>
            <Link
              to={`/orders/${order._id}/track`}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Track Live GPS</span>
            </Link>
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-8">
          {/* Itemized Dishes */}
          <div>
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4">
              Itemized Order Summary
            </h3>
            <div className="divide-y divide-stone-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded-md text-xs">
                      {item.quantity}×
                    </span>
                    <span className="font-medium text-stone-800">{item.name}</span>
                  </div>
                  <span className="font-bold text-stone-900">₹{item.totalPrice}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 text-xs space-y-2.5">
            <div className="flex justify-between text-stone-600">
              <span>Item Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Delivery Partner Fee</span>
              <span>₹{order.deliveryFee}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Restaurant Packaging</span>
              <span>₹{order.packagingFee}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Platform Convenience Fee</span>
              <span>₹{order.platformFee}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Taxes (5% Food GST + 18% Service GST)</span>
              <span>₹{order.gstAmount}</span>
            </div>
            {order.tip > 0 && (
              <div className="flex justify-between text-stone-600">
                <span>Delivery Partner Tip</span>
                <span>₹{order.tip}</span>
              </div>
            )}
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Promotional Discount</span>
                <span>-₹{order.discountAmount}</span>
              </div>
            )}
            <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-extrabold text-stone-900">
              <span>Total Paid via {order.paymentMethod || 'UPI'}</span>
              <span className="text-brand-700 text-base">₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Address & Delivery Info */}
          {order.deliveryAddress && (
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
              <span className="text-stone-400 font-bold uppercase tracking-wider block mb-1">
                Delivered To
              </span>
              <p className="font-bold text-stone-800">{order.customerName}</p>
              <p className="text-stone-600">{order.deliveryAddress.addressLine1}, {order.deliveryAddress.locality}</p>
              <p className="text-stone-600">{order.deliveryAddress.city} - {order.deliveryAddress.postalCode}</p>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-100">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleReorder}
                className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>Reorder Items</span>
              </button>

              <button
                onClick={() => showToast({ type: 'info', message: 'Downloading Tax Invoice PDF (Simulated)...' })}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-stone-500" />
                <span>Invoice PDF</span>
              </button>
            </div>

            {isDelivered && !isReviewSubmitted && (
              <button
                onClick={() => setIsReviewOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center space-x-1.5 cursor-pointer"
              >
                <Star className="w-3.5 h-3.5" />
                <span>Rate & Review Experience</span>
              </button>
            )}

            {isReviewSubmitted && (
              <span className="text-xs font-bold text-emerald-700 flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Review Submitted!</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {isReviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-stone-900 mb-1">Rate Your Culinary Experience</h3>
            <p className="text-xs text-stone-500 mb-6">
              Your feedback is verified and helps culinary artisans maintain exceptional standards.
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {/* Food Rating */}
              <div className="flex items-center justify-between bg-stone-50 p-3 rounded-xl">
                <span className="text-xs font-bold text-stone-700">Food Quality & Taste</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFoodRating(star)}
                      className="cursor-pointer"
                    >
                      <Star className={`w-5 h-5 ${star <= foodRating ? 'text-amber-500 fill-amber-500' : 'text-stone-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Rating */}
              <div className="flex items-center justify-between bg-stone-50 p-3 rounded-xl">
                <span className="text-xs font-bold text-stone-700">Delivery Speed & Courtesy</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setDeliveryRating(star)}
                      className="cursor-pointer"
                    >
                      <Star className={`w-5 h-5 ${star <= deliveryRating ? 'text-amber-500 fill-amber-500' : 'text-stone-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Packaging Rating */}
              <div className="flex items-center justify-between bg-stone-50 p-3 rounded-xl">
                <span className="text-xs font-bold text-stone-700">Spill-Proof Packaging</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setPackagingRating(star)}
                      className="cursor-pointer"
                    >
                      <Star className={`w-5 h-5 ${star <= packagingRating ? 'text-amber-500 fill-amber-500' : 'text-stone-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Your Comments</label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Tell others what you loved about this meal..."
                  className="w-full p-3 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsReviewOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
