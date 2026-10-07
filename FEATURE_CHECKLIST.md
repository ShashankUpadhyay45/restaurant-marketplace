# GourmetFleet — Multi-Role Feature & Ecosystem Checklist

## 1. Global Platform Capabilities
- [x] **Universal Persona Switcher**: Top-mounted sticky `<RoleSwitcherBanner />` enabling 1-click persona switching among `Customer`, `Restaurant Owner`, `Delivery Partner`, and `Admin`.
- [x] **Global Notification & Toast Engine**: `<ToastContainer />` with `useToastStore` supporting `success`, `error`, `warning`, and `info` with configurable durations.
- [x] **Offline Mock API Fallback Dispatcher**: Gracefully catches network failures and dispatches to local typed mock services when offline.
- [x] **Realistic Indian Geographic Mock Database**: 100 verified restaurants across 5 major Indian culinary hubs (Dehradun, Delhi NCR, Mumbai, Bengaluru, Jaipur) with 2,700+ menu items, authentic INR pricing, and dietary classification.
- [x] **Responsive Mobile-First Design**: Custom Tailwind breakpoints (`<640px`, `640-767px`, `768-1023px`, `1024-1279px`, `>=1280px`) with mobile bottom navigation bars.
- [x] **Accessibility & Motion**: Respects `prefers-reduced-motion` and keyboard accessibility with aria labeling.

---

## 2. Customer Ecosystem (18 Screens)
- [x] **HomePage (`/`)**:
  - Interactive 3D Food Cloche canvas (`HeroFoodCanvas.tsx` via Three.js).
  - City & locality selector with GPS auto-detection.
  - Indian regional culinary categories pill selector.
  - Featured restaurants grid and operating mode filters (`HYBRID`, `DELIVERY_ONLY`, `DINING_ONLY`).
- [x] **Restaurants Directory (`/restaurants`)**:
  - Multi-filter controls: City, Operating Mode, Cuisine, Sort Order, Delivery-Only toggle.
  - Switchable Grid vs. Interactive Radar Map View (`RestaurantMapView`).
  - Skeleton loading states and empty state indicators.
- [x] **Restaurant Detail Page (`/restaurant/:id`)**:
  - Hero banner with FSSAI badge, operating mode, distance, and rating breakdown.
  - Categorized menu display with dietary indicators (VEG, NON_VEG, VEGAN, GLUTEN_FREE).
  - Table booking CTA with party size and time slot selector modal.
- [x] **Unified Multi-Entity Search (`/search`)**:
  - Debounced search querying both restaurants and specific culinary dishes simultaneously.
  - Trending search pills and 1-click add to cart.
- [x] **Promotions & Offers (`/offers`)**:
  - Platform and venue coupon cards with 1-click copy-to-clipboard code.
- [x] **Chef Specials (`/specials`)**:
  - City-filtered showcase of signature recipes with direct cart addition.
- [x] **Culinary Events Listing (`/events`)**:
  - Food festivals, masterclasses, and tasting sessions with capacity badges.
- [x] **Culinary Event Detail & Booking (`/event/:id`)**:
  - Ticket quantity selector, price calculation, and digital QR event pass generator.
- [x] **Cart & Sticky Drawer**:
  - Multi-item management, add/subtract quantity, item-level dietary icons.
  - Multi-restaurant cart replacement confirmation dialog.
- [x] **Checkout (`/checkout`)**:
  - Itemized pricing breakdown with GST, packaging, delivery fee, platform fee, tip.
  - Coupon code entry with instant validation against minimum order constraints.
  - Simulated payment options (UPI, Credit/Debit Cards, NetBanking, COD).
  - WhatsApp & SMS notification opt-in checkboxes.
- [x] **Orders Listing (`/orders`)**:
  - Active vs. historical orders, live status badge pill indicators.
- [x] **Order Detail Page (`/orders/:id`)**:
  - Complete line-item breakdown, billing summary, invoice download trigger.
  - Multi-factor review modal (Food, Delivery, Packaging, Overall rating).
- [x] **Live Order Radar Tracking (`/orders/:id/track`)**:
  - Animated SVG delivery radar with parametric Bezier curve rider movement simulation.
  - 4-digit Delivery OTP card for doorstep verification.
  - Assigned rider card with vehicle details and direct phone call simulation.
- [x] **Table Reservations (`/reservations`)**:
  - Upcoming and completed table bookings.
- [x] **Reservation Boarding Pass (`/reservations/:id`)**:
  - High-contrast digital boarding pass with secure QR token and 15-minute grace period indicator.
- [x] **Loyalty Wallet (`/loyalty`)**:
  - Coin balance, membership tier progress (`BRONZE` / `SILVER` / `GOLD`), transaction ledger.
- [x] **Favorites (`/favorites`)**:
  - Saved restaurants stored in `localStorage` with city filtering and quick navigation.
- [x] **Customer Profile (`/profile`)**:
  - User details, tier badge, saved addresses list, communication preference toggles.

---

## 3. Restaurant Owner Ecosystem (`<OwnerLayout>`, 11 Screens)
- [x] **Overview Dashboard (`/owner/dashboard`)**:
  - KPI summary cards (Today's Revenue, Total Orders, Average Order Value, Active Tables).
  - Recent incoming orders feed and CSS bar chart for hourly sales.
- [x] **Kitchen Display System (KDS) Kanban (`/owner/orders`)**:
  - 5-column Kanban board (`NEW`, `PREPARING`, `READY`, `OUT_FOR_DELIVERY`, `COMPLETED`).
  - Stage advance buttons (`Accept` -> `Start Prep` -> `Mark Ready` -> `Assign Rider`).
  - Elapsed time urgency badges and order cancellation safeguards with `<ConfirmDialog>`.
- [x] **Table Reservations (`/owner/reservations`)**:
  - Table allocation roster with status management (`CONFIRMED`, `SEATED`, `COMPLETED`, `NO_SHOW`).
- [x] **Menu Inventory Management (`/owner/menu`)**:
  - Collapsible category groups, stock availability switches with real-time toggle.
  - Add new dish modal with dietary tags, price, and prep duration inputs.
  - Destructive item deletion with `<ConfirmDialog>`.
- [x] **Promotions & Coupons (`/owner/promotions`)**:
  - Venue promotional campaigns creation modal with discount types, minimum spend, caps.
- [x] **Culinary Events Hub (`/owner/events`)**:
  - Create and schedule masterclasses, monitor booking capacity and attendee list.
- [x] **Delivery & Fleet Dispatch (`/owner/delivery`)**:
  - Active outbound deliveries list, nearby available rider roster, manual rider assignment.
- [x] **Customer Reviews & Feedback (`/owner/reviews`)**:
  - Multi-factor rating averages (Food, Delivery, Packaging), review reply composer.
- [x] **Business Analytics (`/owner/analytics`)**:
  - Timeframe selector (`DAY`, `WEEK`, `MONTH`, `YEAR`).
  - Sales charts, top 5 dishes by revenue, and cancellation driver breakdown.
- [x] **Owner AI Copilot (`/owner/ai-reports`)**:
  - Automated business intelligence report generation with strategic operational insights and recommendations.
- [x] **FSSAI & KYC Compliance Status (`/owner/application`)**:
  - Verification badges, statutory document compliance checklist, license information.

---

## 4. Delivery Partner Ecosystem (`<DeliveryLayout>`, 6 Screens)
- [x] **Rider Operations Hub (`/delivery/dashboard`)**:
  - Online/Offline availability toggle, today's earnings pill, active order quick card.
- [x] **Nearby Delivery Requests (`/delivery/requests`)**:
  - Incoming pickup requests within configurable search radius (2 km to 5 km).
  - Pickup and drop distances, estimated payout in INR, 1-click Accept / Reject.
- [x] **Active Delivery Execution (`/delivery/active`)**:
  - 4-step progressive delivery stepper (`TO_RESTAURANT` -> `PICKUP` -> `TO_CUSTOMER` -> `ARRIVED_CUSTOMER`).
  - Customer contact trigger, map navigation placeholder.
  - Doorstep 4-digit OTP verification modal unlocking wallet credit.
- [x] **Earnings & Payouts (`/delivery/earnings`)**:
  - Daily, weekly, monthly earnings breakdown with tips, incentives, and trip history.
- [x] **Ratings & Performance Score (`/delivery/ratings`)**:
  - Overall rider rating score, customer feedback cards, acceptance & on-time delivery rates.
- [x] **Rider Profile & Fleet Documents (`/delivery/profile`)**:
  - Vehicle details (Bike/Scooter/EV), driving license, Aadhaar verification badge.

---

## 5. Superadmin HQ Ecosystem (`<AdminLayout>`, 13 Screens)
- [x] **Platform Executive Overview (`/admin/dashboard`)**:
  - Platform GMV, total commissions, active restaurants, active cities, delivery success rate.
  - City breakdown table and 5-month trend chart.
- [x] **Restaurant Directory (`/admin/restaurants`)**:
  - Searchable 100+ venue list with city, operating mode, rating, commission rate, and suspend controls.
- [x] **Merchant KYC Queue (`/admin/applications`)**:
  - FSSAI and GSTIN review workbench with Approve, Request Changes, and Reject actions.
- [x] **User & Access Governance (`/admin/users`)**:
  - Multi-role directory (Customer, Owner, Delivery, Admin), role modification, account status controls.
- [x] **Global Orders Ledger (`/admin/orders`)**:
  - Nationwide order stream with expandable line items, force cancellation, and instant refund simulation.
- [x] **Global Reservations (`/admin/reservations`)**:
  - Pan-India table bookings roster with status filtering and administrative cancellations.
- [x] **Delivery Fleet Oversight (`/admin/delivery`)**:
  - Rider status monitoring (`AVAILABLE`, `ON_TRIP`, `OFFLINE`) and disciplinary suspension tools.
- [x] **Culinary Events Moderation (`/admin/events`)**:
  - Platform-wide masterclasses, ticket sales tally, attendee audits.
- [x] **Review Moderation (`/admin/reviews`)**:
  - Flagged reviews queue, verified diner inspection, review removal.
- [x] **Platform Promotions Engine (`/admin/promotions`)**:
  - Universal coupon creation, usage limits, discount scope configuration.
- [x] **Payments & Financial Settlement (`/admin/payments`)**:
  - Transaction volumes, refund queue, settlement placeholders.
- [x] **Platform Intelligence & Reports (`/admin/reports`)**:
  - Exportable GMV, delivery speed, and customer retention reporting.
- [x] **Security & Audit Logs (`/admin/audit`)**:
  - Immutable audit trail recording actions, roles, timestamps, IP addresses, and severity levels.

---

## 6. Verification & Quality Assurance Summary
- [x] **Client Production Build**: `npm run build` completed with **0 errors** (built in 40.63s).
- [x] **TypeScript Strict Typing**: `npx tsc --noEmit` exited with code 0 (zero type errors).
- [x] **Server Test Suite**: `npm test` completed with **29/29 tests passed** across 6 test suites.
