# GourmetFleet India — Multi-City Food Delivery & Dining Reservation Marketplace

> **A production-grade, highly localized multi-role culinary marketplace and food-delivery platform built for Indian urban ecosystems using React, TypeScript, Tailwind CSS, Vite, and Node.js.**

GourmetFleet combines artisanal food delivery, cloud kitchen dispatch, table reservations, driver dispatch, and administrative governance under an ethical commission framework (capped at 8–12%). It features four complete role ecosystems:
1. **Customer Marketplace** (18 screens: Discovery, 3D Cloche, Multi-Entity Search, Offers, Specials, Events, Order Radar GPS, QR Boarding Passes, Loyalty Wallet)
2. **Restaurant Owner Operations Portal** (11 screens: Overview Hub, Kitchen KDS Kanban, Table Reservations, Menu Inventory, Promotions, Events, Delivery Dispatch, Multi-Factor Reviews, Analytics, AI Copilot, FSSAI KYC)
3. **Delivery Partner Fleet Hub** (6 screens: Rider Dashboard, Nearby Requests with search radius expansion, Active 4-Step Delivery Stepper with Doorstep OTP, Earnings & Tips Ledger, Performance Ratings, Fleet Profile)
4. **Platform Superadmin HQ** (13 screens: Platform Overview, 100+ Restaurants, Merchant KYC Queue, Users & RBAC, Global Orders, Global Reservations, Fleet Oversight, Events, Reviews, Promotions, Payments, Reports, Audit Logs)

---

## 🌟 Key Architecture & Product Highlights

1. **India Geolocation & Spatial Discovery Engine:**
   - **Centralized Location Authority:** 35+ major Indian cities across 4 geographic regions (North, West, South, East) with exact coordinates, representative localities, and 6-digit postal PIN codes. Default city is Dehradun (Rajpur Road, 248001).
   - **GeoJSON & MongoDB 2dsphere Indexing:** Strict `[longitude, latitude]` Point coordinates with spatial indexing supporting `$nearSphere` proximity searches and radius enforcement.
   - **Haversine Distance & Delivery Zone Boundaries:** Dynamic calculation of user-to-restaurant distances in kilometers, with visual status badges (`✓ Delivers to you` vs `Outside delivery zone`) and checkout boundary enforcement.
   - **Multi-State GPS Detection:** Robust handling of HTML5 Geolocation API permission states (`granted`, `denied`, `unavailable`, `timeout`, `prompt`), automated reverse-geocoding to the nearest Indian metropolis, and manual city/locality modal switcher.
   - **Unified Debounced Search Bar:** 300 ms debounced autocomplete querying across Restaurants, Dishes, Cuisines, Cities, and Localities simultaneously.
   - **Zero-Token Interactive SVG Radar Map:** Standalone responsive SVG cartography rendering user radar center, 4 km / 8 km / 12 km delivery radius rings, and interactive restaurant markers with clickable cards—zero external API billing or token failures.

2. **Transparent Indian Pricing Engine (`₹` / INR):**
   - Server-calculated, immutable pricing engine prevents client-side price tampering.
   - **Delivery Fee:** Base ₹35.00 for the first 3 km + ₹12.00/km thereafter.
   - **Restaurant Packaging:** Standardized ₹20.00 per order.
   - **Platform Convenience Fee:** Transparent flat ₹10.00 per order.
   - **Dual Indian GST Compliance:** 5.0% Food GST on edible items + 18.0% Services GST on delivery and platform fees.
   - **Indian Payment Methods:** UPI (Google Pay, PhonePe, Paytm, BHIM, VPA), Credit/Debit Cards (RuPay, Visa, Mastercard), NetBanking, and Cash on Delivery (COD).
   - **Regional Coupons:** `WELCOME50`, `FREEDELIVERY`, `GOURMET10`, `WELCOME20`.

3. **Automated WhatsApp & SMS Confirmation Message Engine:**
   - **Dual-Channel Dispatch:** Dispatches instantaneous confirmation messages upon order placement, kitchen status transitions, and dining table bookings.
   - **Rich WhatsApp Format:** Styled with emojis, itemized breakdown with variants, GST & packaging fee accounting, total paid in `₹`, and live GPS tracking link.
   - **DLT-Compliant Transactional SMS:** TRAI-compliant compact SMS with `[GURMET]` sender header, item count, ₹ amount, and tracking link.
   - **Indian Phone Normalization:** E.164 conversion supporting 10-digit mobile numbers, `0` prefixes, and standard `+91` format.
   - **1-Click WhatsApp Launch:** Direct Click-to-Chat URLs (`https://api.whatsapp.com/send?...`) allowing customers to open the formatted receipt directly on WhatsApp Web or mobile.
   - **Interactive Live Simulator:** In-app dual-tab WhatsApp chat and SMS preview modal with copy and share buttons.

4. **Modular Restaurant Operating Modes:**
   - **Hybrid:** Full-service venues offering both home food delivery and table reservations (e.g. *Doon Bistro & Craft Kitchen*, *Bukhara Heritage & Tandoor*).
   - **Delivery-Only (Cloud Kitchen):** Dark kitchens optimized solely for rapid food dispatch (e.g. *Indiranagar Craft Kitchen*).
   - **Dining-Only (Fine Dining):** Intimate dining rooms focused on table reservations and tasting experiences (e.g. *Mussoorie View Grill & Terrace*).

4. **Atomic Table Reservation Engine:**
   - Prevents double-booking race conditions through server-side atomic slot verification.
   - Generates digital QR boarding passes for host stand check-in, includes calendar sync, 15-minute grace window timers, and directions links.

5. **Restaurant Owner Operations Hub:**
   - **Live Kitchen Display (KDS):** 4-column Kanban board (*Placed*, *Cooking*, *Ready*, *Dispatched*) with audio/visual pings via Socket.IO.
   - **Instant Menu Stock Controls:** 1-click out-of-stock toggles to immediately prevent customer cart orders for depleted ingredients.
   - **Owner AI Business Copilot:** Tenant-isolated AI assistant querying real database metrics (sales in INR, AOV, peak hours 8:30 PM - 10:30 PM IST, top dishes) with required owner confirmation before applying actions.

6. **Platform Governance Admin Portal:**
   - Merchant onboarding queue with 14-digit FSSAI hygiene license and GSTIN verification.
   - Configurable per-restaurant commission rates (8% - 15%).
   - Immutable security and administrative audit trail.

7. **Unified Hospitality Loyalty Ledger:**
   - 5% value back in loyalty points earned across both delivery and dining bookings.
   - Full audited transaction history (*Earned*, *Redeemed*, *Reversed* upon cancellation).

8. **3D Web Graphics:**
   - High-performance Three.js interactive 3D hero showcase featuring a floating gourmet cloche, stylized ingredients (avocado, berry jewel, golden truffle, basil), and interactive mouse parallax.
   - Accessible fallbacks for `prefers-reduced-motion` and non-WebGL environments.

---

## 📁 Monorepo Directory Layout

```
restaurant-marketplace/
├── client/                           # React 18/19 + Vite + TypeScript + Tailwind CSS + Three.js
│   ├── src/
│   │   ├── components/
│   │   │   ├── 3d/                   # HeroFoodCanvas (Three.js 3D cloche & ingredients)
│   │   │   ├── customer/             # RestaurantCard, MenuModal, CartDrawer, BookingModal, PassModal
│   │   │   ├── location/             # LocationSelectorModal (35+ Indian cities, GPS auto-detect)
│   │   │   ├── map/                  # RestaurantMapView (Interactive SVG Radar Map & delivery rings)
│   │   │   ├── search/               # UnifiedSearchBar (300ms debounced multi-entity search)
│   │   │   └── layout/               # Navbar with dynamic city pill, Footer with legal compliance
│   │   ├── pages/
│   │   │   ├── customer/             # HomePage, RestaurantDetailPage, CheckoutPage, OrdersPage, etc.
│   │   │   ├── owner/                # OwnerDashboardPage (Kanban KDS, Menu editor, AI Copilot)
│   │   │   ├── admin/                # AdminDashboardPage (KYC Verification, Commissions, Audit)
│   │   │   └── auth/                 # AuthPage (1-click quick demo logins, owner onboarding)
│   │   ├── store/                    # Zustand stores (useAuthStore, useCartStore, useLocationStore)
│   │   ├── services/                 # API client with token injection, Socket.IO client
│   │   ├── data/                     # indianLocations.ts (Client copy of Indian geographic catalog)
│   │   └── types/                    # Shared TypeScript interfaces (GeoJSON, INR Address, UserLocation)
├── server/                           # Node.js 22 + Express + TypeScript + Mongoose + Socket.IO
│   ├── src/
│   │   ├── controllers/              # Auth, Restaurant, Order, Reservation, Owner, Admin, Location
│   │   ├── models/                   # User, Restaurant (GeoJSON 2dsphere), Order, Reservation, etc.
│   │   ├── services/                 # LocationService, PricingEngine (INR), ReservationEngine, AIService
│   │   ├── routes/                   # LocationRoutes (/api/locations), RestaurantRoutes, etc.
│   │   ├── data/                     # indianLocations.ts (35+ cities, Haversine helper, search)
│   │   ├── middleware/               # requireAuth, requireRole, verifyTenantIsolation, errorHandler
│   │   ├── sockets/                  # Socket.IO room routing (restaurant, order, user)
│   │   ├── seed/                     # Authentic Indian restaurant seed script with memory-server fallback
│   │   └── tests/                    # Automated Vitest test suites (18 tests, 100% pass rate)
├── shared/                           # Shared schemas, constants, and type definitions
│   └── data/                         # indianLocations.ts (Canonical Indian location dataset)
├── docs/                             # Deliverable analysis and architecture specifications (.docx)
├── docker-compose.yml                # Multi-container orchestration (Mongo, Redis, Server, Client)
├── IMPLEMENTATION_STATE.md           # Granular audit, status report, and verification summary
└── README.md                         # Complete operations and deployment guide
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v20 or v22+
- **npm**: v10+
- **MongoDB**: Local `mongod` service running on port `27017` OR automatic in-memory fallback (zero configuration required).

### 2. Local Setup
```bash
# Clone or navigate to the repository
cd restaurant-marketplace

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Seed Database with Authentic Indian Restaurants
```bash
cd ../server
npm run seed
```
*Seeds authentic Indian dining venues across Dehradun, Delhi NCR, Bengaluru, and Mumbai with real GeoJSON coordinates, menus in INR, +91 phone numbers, FSSAI numbers, tables, reviews, and test accounts.*

### 4. Run Development Servers
```bash
# Terminal 1: Backend Server (runs on http://localhost:5000)
cd server
npm run dev

# Terminal 2: Frontend Client (runs on http://localhost:5173)
cd client
npm run dev
```

### 5. Run Automated Test Suite
```bash
cd server
npm test
```
*Executes all 18 test cases across Location Services, Pricing Engine (INR), Reservation Concurrency, RBAC / Tenant Isolation, and Loyalty Ledger.*

### 6. Production Builds
```bash
# Build backend TypeScript
cd server
npm run build

# Build frontend SPA
cd ../client
npm run build
```

---

## 🐳 Docker Compose Deployment

Run the complete four-service stack (MongoDB, Redis, Node Backend, and Nginx Client) with a single command:
```bash
docker-compose up --build
```
- Frontend Application: `http://localhost:80`
- Backend API & Healthcheck: `http://localhost:5000/api/health`

---

## 🔑 Pre-Seeded Test Credentials & Instant Demo Switcher

The top of every page features a sticky **Role Switcher Banner** enabling instant persona switching without logging in or out:

| Role | Email | Password | Access & Capabilities |
|:---|:---|:---|:---|
| **Diner / Customer** | `customer@gourmetfleet.com` | `Password123!` | Multi-city discovery, INR checkout (UPI/Cards/COD), QR Table Passes, Loyalty Wallet |
| **Restaurant Owner** | `vikram@doonbistro.com` | `Password123!` | Doon Bistro KDS Kanban, Table Floor, Out-of-Stock Toggles, 8:30 PM Rush Copilot |
| **Delivery Partner** | `rider@gourmetfleet.com` | `Password123!` | Rider Radar, 2–5km radius dispatch, 4-step delivery stepper with 4-digit doorstep OTP |
| **Superadministrator** | `admin@gourmetfleet.com` | `Password123!` | Merchant KYC Approval (FSSAI/GSTIN), Commission Rates (8–15%), GMV Analytics |

*(Convenient 1-click role switcher buttons are available on the top banner and on `/auth`)*.

---

## 📚 Technical Documentation & Integration Guides

- [`BACKEND_INTEGRATION_MAP.md`](./BACKEND_INTEGRATION_MAP.md) — Comprehensive API contract mapping, WebSocket channels, payloads, and mock fallbacks for all 50+ screens.
- [`FEATURE_CHECKLIST.md`](./FEATURE_CHECKLIST.md) — Exhaustive feature matrix covering customer, merchant, delivery fleet, and superadmin ecosystems.
- [`IMPLEMENTATION_STATE.md`](./IMPLEMENTATION_STATE.md) — Production build logs, verification runs, and architectural state.

---

## 🔒 Security, Compliance & Safeguards

- **Digital Personal Data Protection (DPDP) Act 2023:** Role-based access control, bcrypt password hashing, and strict tenant isolation preventing cross-restaurant data leakage.
- **Consumer Protection (E-Commerce) Rules 2020:** Transparent, upfront fee breakdowns with zero hidden surcharges at checkout.
- **FSSAI Food Safety Compliance:** Verified 14-digit license numbers displayed on every restaurant profile and admin review queue.
- **Two-Layer Concurrency Control:** Server-side atomic validation prevents table double-booking race conditions during peak hours.

---

## 📄 Downloadable Project Deliverables

1. `GourmetFleet_India_Final.zip` — Complete runnable monorepo with seed scripts, tests, assets, and Docker configurations.
2. `GourmetFleet_India_Audit_Report.docx` — Full-stack audit report detailing localization, architecture, security, and benchmarking.
3. `GourmetFleet_India_Implementation_Plan.docx` — Comprehensive implementation blueprint, component hierarchy, and database schemas.
4. `Technical_Architecture_and_API_Documentation.docx` — System topology, MongoDB schemas, Socket.IO channels, and REST contracts.
5. `Competitor_Research_and_Business_Analysis.docx` — In-depth benchmarking of Zomato, Swiggy, OpenTable, and unit economics.
6. `QA_Test_Report.docx` — Automated test suite results, security audits, viewport responsiveness, and production build checks.
