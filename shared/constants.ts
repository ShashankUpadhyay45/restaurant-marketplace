export const PLATFORM_CONSTANTS = {
  APP_NAME: 'GourmetFleet',
  DEFAULT_PLATFORM_FEE: 1.50,
  DEFAULT_PACKAGING_FEE: 0.99,
  FOOD_GST_RATE: 0.05, // 5% GST on Restaurant Food
  SERVICES_GST_RATE: 0.18, // 18% GST on Platform Service Fee & Delivery
  DEFAULT_COMMISSION_RATE: 10.0, // 10% standard platform commission
  STANDARD_RESERVATION_DURATION_MINS: 90,
  RESERVATION_HOLD_TIMEOUT_MINS: 15,
  LOYALTY_POINTS_EARN_PERCENTAGE: 0.05, // 5% value back in loyalty points
  LOYALTY_POINT_REDEMPTION_VALUE: 0.01, // 1 point = $0.01
  BASE_DELIVERY_FEE: 2.00,
  DELIVERY_FEE_PER_KM: 0.80,
  ORDER_STATUS_FLOW: [
    'PLACED',
    'CONFIRMED',
    'PREPARING',
    'READY_FOR_PICKUP',
    'OUT_FOR_DELIVERY',
    'DELIVERED'
  ] as const,
  RESERVATION_STATUS_FLOW: [
    'PENDING',
    'CONFIRMED',
    'SEATED',
    'COMPLETED'
  ] as const,
  TIME_SLOTS: [
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00',
    '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
  ]
};
