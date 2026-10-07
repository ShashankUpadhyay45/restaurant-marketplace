import { getMockDatabase } from '../data/mockData';

const delay = (ms: number = 200) => new Promise(resolve => setTimeout(resolve, ms));

export interface OwnerAnalyticsSummary {
  period: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  cancellationRate: number;
  peakHours: string;
  topDishes: Array<{ name: string; category: string; orderCount: number; revenue: number }>;
  revenueChart: Array<{ label: string; revenue: number; orders: number }>;
  cancellationBreakdown: Array<{ reason: string; percentage: number }>;
}

export interface PlatformAnalyticsSummary {
  totalGmv: number;
  totalPlatformCommission: number;
  totalOrdersCount: number;
  activeRestaurantsCount: number;
  activeCitiesCount: number;
  deliverySuccessRate: number;
  cityBreakdown: Array<{ city: string; gmv: number; orders: number }>;
  monthlyTrend: Array<{ month: string; gmv: number; commission: number }>;
}

/**
 * Operational & Business Intelligence Analytics Service Interface
 * 
 * Future Backend Integration:
 * - GET /api/analytics/owner?restaurantId=:id&period=:period
 * - GET /api/analytics/admin/platform
 */
export const analyticsService = {
  // TODO: Backend Integration Point: GET /api/analytics/owner
  async getOwnerAnalytics(restaurantId: string, period: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' = 'WEEK'): Promise<OwnerAnalyticsSummary> {
    await delay();
    const db = getMockDatabase();
    const items = db.menuItems.filter(m => m.restaurantId === restaurantId);

    // Multipliers based on timeframe
    let baseRevenue = 28450;
    let baseOrders = 38;
    let chartData: Array<{ label: string; revenue: number; orders: number }> = [];

    if (period === 'DAY') {
      baseRevenue = 32800;
      baseOrders = 44;
      chartData = [
        { label: '12 PM', revenue: 4200, orders: 6 },
        { label: '02 PM', revenue: 6800, orders: 9 },
        { label: '04 PM', revenue: 1900, orders: 3 },
        { label: '06 PM', revenue: 3100, orders: 4 },
        { label: '08 PM', revenue: 9400, orders: 13 },
        { label: '10 PM', revenue: 7400, orders: 9 }
      ];
    } else if (period === 'WEEK') {
      baseRevenue = 214500;
      baseOrders = 286;
      chartData = [
        { label: 'Mon', revenue: 24000, orders: 32 },
        { label: 'Tue', revenue: 22500, orders: 30 },
        { label: 'Wed', revenue: 28000, orders: 38 },
        { label: 'Thu', revenue: 31000, orders: 42 },
        { label: 'Fri', revenue: 39500, orders: 52 },
        { label: 'Sat', revenue: 48000, orders: 64 },
        { label: 'Sun', revenue: 44000, orders: 58 }
      ];
    } else if (period === 'MONTH') {
      baseRevenue = 892000;
      baseOrders = 1190;
      chartData = [
        { label: 'Week 1', revenue: 210000, orders: 280 },
        { label: 'Week 2', revenue: 225000, orders: 298 },
        { label: 'Week 3', revenue: 232000, orders: 312 },
        { label: 'Week 4', revenue: 225000, orders: 300 }
      ];
    } else {
      baseRevenue = 10450000;
      baseOrders = 13950;
      chartData = [
        { label: 'Q1', revenue: 2400000, orders: 3200 },
        { label: 'Q2', revenue: 2650000, orders: 3500 },
        { label: 'Q3', revenue: 2580000, orders: 3450 },
        { label: 'Q4', revenue: 2820000, orders: 3800 }
      ];
    }

    const aov = Math.round(baseRevenue / baseOrders);

    // Top dishes
    const topDishes = (items.length > 0 ? items.slice(0, 5) : [
      { name: 'Dal Bukhara Slow Simmer', category: 'Mains & Curries', orderCount: 142, basePrice: 380 },
      { name: 'Kumaoni Pahadi Mutton', category: 'Mains & Curries', orderCount: 98, basePrice: 520 },
      { name: 'Garlic Butter Chur Chur Naan', category: 'Biryani & Breads', orderCount: 310, basePrice: 110 },
      { name: 'Charcoal Paneer Tikka', category: 'Starters & Tandoor', orderCount: 88, basePrice: 320 },
      { name: 'Gulab Jamun Old Monk', category: 'Desserts & Drinks', orderCount: 76, basePrice: 220 }
    ]).map(it => ({
      name: it.name,
      category: it.category || 'Mains',
      orderCount: (it as any).orderCount || 45,
      revenue: ((it as any).orderCount || 45) * it.basePrice
    }));

    return {
      period,
      totalRevenue: baseRevenue,
      totalOrders: baseOrders,
      averageOrderValue: aov,
      cancellationRate: 1.8,
      peakHours: '8:30 PM – 10:30 PM IST',
      topDishes,
      revenueChart: chartData,
      cancellationBreakdown: [
        { reason: 'Customer changed address', percentage: 45 },
        { reason: 'Kitchen ingredient shortage', percentage: 25 },
        { reason: 'Delivery traffic delay', percentage: 20 },
        { reason: 'Other', percentage: 10 }
      ]
    };
  },

  // TODO: Backend Integration Point: GET /api/analytics/admin/platform
  async getPlatformAnalytics(): Promise<PlatformAnalyticsSummary> {
    await delay();
    const db = getMockDatabase();

    return {
      totalGmv: 4280500,
      totalRevenue: 4280500, // alias for totalGmv
      totalPlatformCommission: 470855, // ~11% average commission
      totalOrdersCount: 6842,
      totalOrders: 6842, // alias
      activeRestaurantsCount: db.restaurants.length,
      activeRestaurants: db.restaurants.length, // alias
      activeUsers: 1420,
      activeCitiesCount: 5,
      deliverySuccessRate: 98.4,
      cityBreakdown: [
        { city: 'Dehradun', gmv: 820000, orders: 1320 },
        { city: 'Delhi NCR', gmv: 1450000, orders: 2150 },
        { city: 'Mumbai', gmv: 1180000, orders: 1780 },
        { city: 'Bengaluru', gmv: 1090000, orders: 1640 },
        { city: 'Jaipur', gmv: 740500, orders: 952 }
      ],
      monthlyTrend: [
        { month: 'May', gmv: 3100000, commission: 341000 },
        { month: 'Jun', gmv: 3450000, commission: 379500 },
        { month: 'Jul', gmv: 3820000, commission: 420200 },
        { month: 'Aug', gmv: 4100000, commission: 451000 },
        { month: 'Sep', gmv: 4280500, commission: 470855 }
      ]
    } as any;
  }
};
