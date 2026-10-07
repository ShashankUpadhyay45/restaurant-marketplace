import { Review } from '../types';
import { getMockDatabase, saveMockDatabase } from '../data/mockData';

const delay = (ms: number = 150) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Reviews & Customer Feedback Service Interface
 * 
 * Future Backend Integration:
 * - GET  /api/reviews?restaurantId=:id
 * - POST /api/reviews
 * - POST /api/reviews/:id/respond
 */
export const reviewService = {
  // TODO: Backend Integration Point: GET /api/reviews?restaurantId=:id
  async getReviews(restaurantId: string): Promise<{
    reviews: Review[];
    averages: {
      overall: number;
      food: number;
      delivery: number;
      packaging: number;
      totalCount: number;
    };
  }> {
    await delay();
    const db = getMockDatabase();
    const reviews = db.reviews.filter(r => r.restaurantId === restaurantId);

    if (reviews.length === 0) {
      return {
        reviews: [],
        averages: { overall: 4.8, food: 4.9, delivery: 4.7, packaging: 4.8, totalCount: 0 }
      };
    }

    const foodSum = reviews.reduce((acc, r) => acc + (r.foodRating || r.rating), 0);
    const delivSum = reviews.reduce((acc, r) => acc + (r.deliveryRating || r.rating), 0);
    const packSum = reviews.reduce((acc, r) => acc + (r.packagingRating || r.rating), 0);
    const overallSum = reviews.reduce((acc, r) => acc + r.rating, 0);

    return {
      reviews,
      averages: {
        overall: parseFloat((overallSum / reviews.length).toFixed(1)),
        food: parseFloat((foodSum / reviews.length).toFixed(1)),
        delivery: parseFloat((delivSum / reviews.length).toFixed(1)),
        packaging: parseFloat((packSum / reviews.length).toFixed(1)),
        totalCount: reviews.length
      }
    };
  },

  // TODO: Backend Integration Point: POST /api/reviews
  async submitReview(data: {
    restaurantId: string;
    orderId?: string;
    userName: string;
    foodRating: number;
    deliveryRating?: number;
    packagingRating?: number;
    rating: number;
    comment: string;
  }): Promise<Review> {
    await delay();
    const db = getMockDatabase();
    const newRev: Review = {
      _id: `rev_${Date.now()}`,
      restaurantId: data.restaurantId,
      orderId: data.orderId,
      userId: {
        _id: `user_${Date.now()}`,
        fullName: data.userName,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
      },
      foodRating: data.foodRating,
      deliveryRating: data.deliveryRating || data.rating,
      packagingRating: data.packagingRating || data.rating,
      rating: data.rating,
      comment: data.comment,
      isVerifiedDiner: true,
      createdAt: new Date().toISOString()
    };

    db.reviews.unshift(newRev);
    saveMockDatabase(db);
    return newRev;
  },

  // TODO: Backend Integration Point: POST /api/reviews/:id/respond
  async respondToReview(reviewId: string, response: string): Promise<Review> {
    await delay();
    const db = getMockDatabase();
    const idx = db.reviews.findIndex(r => r._id === reviewId);
    if (idx === -1) throw new Error('Review not found');

    db.reviews[idx].ownerResponse = response;
    saveMockDatabase(db);
    return db.reviews[idx];
  }
};
