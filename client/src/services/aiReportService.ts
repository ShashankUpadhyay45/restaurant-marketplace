import { OwnerAIReport } from '../types';

const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Owner AI Business Copilot & Automated Intelligence Report Service
 * 
 * Future Backend Integration:
 * - POST /api/owner/ai/reports/generate
 * - GET  /api/owner/ai/reports/history
 */
export const aiReportService = {
  // TODO: Backend Integration Point: POST /api/owner/ai/reports/generate
  async generateReport(
    reportType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY', 
    _restaurantId: string = 'rest_dehradun_01'
  ): Promise<OwnerAIReport> {
    await delay(400); // Simulate AI LLM inference time

    const now = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    if (reportType === 'DAILY') {
      return {
        reportType: 'DAILY',
        period: `Daily Operational Report — ${now}`,
        generatedAt: new Date().toISOString(),
        summary: 'Strong dinner surge between 8:30 PM and 10:30 PM IST generated 62% of today\'s gross sales. Pahadi Mutton Curry ran out of stock 45 minutes prior to kitchen closing; increasing prep volume by 25% tomorrow is recommended.',
        revenue: 34850,
        ordersCount: 46,
        averageOrderValue: 757,
        peakHours: '8:30 PM – 10:30 PM IST',
        cancellationRate: 2.1,
        topDishes: [
          { name: 'Kumaoni Pahadi Mutton Curry', salesCount: 22, revenue: 11440 },
          { name: 'Dal Bukhara Slow Simmer', salesCount: 19, revenue: 7220 },
          { name: 'Garlic Butter Chur Chur Naan', salesCount: 38, revenue: 4180 }
        ],
        cancellationReasons: [
          { reason: 'Customer changed delivery address', percentage: 50 },
          { reason: 'Exceeded maximum prep time during surge', percentage: 50 }
        ],
        recommendations: [
          'Pre-marinate 15 additional portions of Pahadi Mutton for tomorrow\'s 8:30 PM dinner rush.',
          'Consider activating a 10% combo discount on Garlic Naan with Dal Bukhara to lift AOV above ₹800.',
          'Ensure 2 dedicated tandoori chefs are stationed between 8:00 PM and 10:00 PM to minimize wait times.'
        ]
      };
    }

    if (reportType === 'WEEKLY') {
      return {
        reportType: 'WEEKLY',
        period: 'Weekly Performance Intelligence (Past 7 Days)',
        generatedAt: new Date().toISOString(),
        summary: 'Total weekly revenue reached ₹2,14,500 across 286 completed orders with a 98.2% fulfillment rate. Friday and Saturday evenings accounted for 42% of weekly delivery volume. Customer ratings averaged 4.85/5.',
        revenue: 214500,
        ordersCount: 286,
        averageOrderValue: 750,
        peakHours: 'Friday & Saturday, 8:00 PM – 10:45 PM IST',
        cancellationRate: 1.8,
        topDishes: [
          { name: 'Kumaoni Pahadi Mutton Curry', salesCount: 142, revenue: 73840 },
          { name: 'Dal Bukhara Slow Simmer', salesCount: 124, revenue: 47120 },
          { name: 'Truffle Mushroom Galouti', salesCount: 88, revenue: 31680 }
        ],
        cancellationReasons: [
          { reason: 'Customer requested cancellation before prep', percentage: 40 },
          { reason: 'Weather/Rain delay in delivery dispatch', percentage: 35 },
          { reason: 'Other', percentage: 25 }
        ],
        recommendations: [
          'Launch a weekend family tandoor banquet bundle to capture larger party sizes on Saturdays.',
          'Rider assignment wait time averaged 3.2 minutes; keeping thermal bags ready at dispatch counter will shave 2 mins off delivery ETA.',
          'Customer sentiment analysis shows 94% positive praise for spill-safe packaging.'
        ]
      };
    }

    if (reportType === 'MONTHLY') {
      return {
        reportType: 'MONTHLY',
        period: 'Monthly Strategic Executive Summary (September 2026)',
        generatedAt: new Date().toISOString(),
        summary: 'Gross monthly culinary volume crossed ₹8,92,000, achieving a 14.5% month-on-month expansion. Customer repeat rate stands at 38%, bolstered by loyalty reward redemptions. Ethical commission framework saved your restaurant ₹1,07,000 compared to competitor platforms.',
        revenue: 892000,
        ordersCount: 1190,
        averageOrderValue: 749,
        peakHours: 'Weekends & Payday Evenings, 8:15 PM – 10:30 PM IST',
        cancellationRate: 1.5,
        topDishes: [
          { name: 'Kumaoni Pahadi Mutton Curry', salesCount: 580, revenue: 301600 },
          { name: 'Dal Bukhara Slow Simmer', salesCount: 510, revenue: 193800 },
          { name: 'Awadhi Gosht Dum Biryani', salesCount: 420, revenue: 201600 },
          { name: 'Garlic Butter Chur Chur Naan', salesCount: 1120, revenue: 123200 }
        ],
        cancellationReasons: [
          { reason: 'Delivery boundary out of range attempts', percentage: 55 },
          { reason: 'Customer changed plans', percentage: 30 },
          { reason: 'Late night stock depletion', percentage: 15 }
        ],
        recommendations: [
          'Consider expanding your delivery radius from 8 km to 12 km on Friday and Saturday evenings.',
          'Introduce a corporate lunch tasting thali between 12:30 PM and 3:00 PM to monetize off-peak kitchen capacity.',
          'Table reservations on terrace tables have an average dining duration of 110 minutes; implement 15-minute slot buffers.'
        ]
      };
    }

    // YEARLY
    return {
      reportType: 'YEARLY',
      period: 'Annual Strategic Horizon Report (FY 2025–2026)',
      generatedAt: new Date().toISOString(),
      summary: 'Annual Gross Merchandise Value (GMV) concluded at ₹1,04,50,000 across 13,950 dining and delivery transactions. Your venue retained a verified 4.9-star diner satisfaction score across 940 customer reviews. Repeat diner retention is in the top 5% of Himalayan culinary brands.',
      revenue: 10450000,
      ordersCount: 13950,
      averageOrderValue: 749,
      peakHours: 'Festive Quarter (Oct–Dec), 8:00 PM – 11:00 PM IST',
      cancellationRate: 1.4,
      topDishes: [
        { name: 'Kumaoni Pahadi Mutton Curry', salesCount: 6800, revenue: 3536000 },
        { name: 'Dal Bukhara Slow Simmer', salesCount: 5900, revenue: 2242000 },
        { name: 'Awadhi Gosht Dum Biryani', salesCount: 4800, revenue: 2304000 }
      ],
      cancellationReasons: [
        { reason: 'Address mismatch / outside delivery zone', percentage: 60 },
        { reason: 'Customer cancellation', percentage: 30 },
        { reason: 'Kitchen operational closure', percentage: 10 }
      ],
      recommendations: [
        'Plan a dedicated second cloud kitchen in South Dehradun / Clement Town to capture untapped suburban delivery volume.',
        'Institutionalize seasonal culinary festivals (Himalayan Wild Mushroom Fest, Winter Awadhi Daawat) during Q4.',
        'Offer VIP Gold diner tasting passes with priority table reservations for your top 100 patrons.'
      ]
    };
  }
};
