# GourmetFleet — Frontend Architecture & Backend Integration Map

This document serves as the comprehensive contract guide for backend developers implementing real APIs, databases, authentication, WebSockets, payment gateways, and third-party integrations for the GourmetFleet marketplace frontend.

---

## 1. Architectural Overview

The frontend architecture follows a service-oriented separation of concerns:
- **UI Components & Pages**: Pure presentation and user interaction layer. Zero hardcoded `fetch` calls.
- **Typed Service Layer (`client/src/services/`)**: Centralized business logic, query normalization, simulation engines, and mock fallbacks.
- **Real-Time Event Bus (`client/src/services/socket.ts`)**: Event-driven architecture with fallback to internal broadcast for offline demoing.
- **State Stores (`client/src/store/`)**: Zustand stores for session auth, cart, location, and global toasts.
- **Mock Persistence Layer (`client/src/data/mockData.ts`)**: 100 restaurants across 5 major Indian cities, 2,700+ menu items, culinary events, promotions, delivery partners, and orders persisted in `localStorage`.

---

## 2. API Contract & Service Integration Matrix

### 2.1 Authentication & User Management (`authService.ts`)
| Frontend Service Call | Future Backend Endpoint | Method | Request Payload | Response Schema | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `authService.login(email, password)` | `/api/auth/login` | `POST` | `{ email, password }` | `{ token: string, user: User }` | Issues JWT in HTTP-only cookie or bearer token |
| `authService.register(data)` | `/api/auth/register` | `POST` | `Partial<User> & { password }` | `{ token: string, user: User }` | User creation with role assignment |
| `authService.getCurrentUser()` | `/api/auth/me` | `GET` | Headers: `Authorization` | `User` | Session rehydration on load |
| `authService.updateProfile(data)` | `/api/auth/profile` | `PATCH` | `Partial<User>` | `User` | DPDP 2023 compliance consent flags |

### 2.2 Restaurants & Discovery (`restaurantService.ts`)
| Frontend Service Call | Future Backend Endpoint | Method | Query Parameters | Response Schema | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `restaurantService.getRestaurants(filters)` | `/api/restaurants` | `GET` | `city`, `operatingMode`, `cuisine`, `search`, `deliversOnly`, `lat`, `lng`, `sortBy`, `page`, `limit` | `{ restaurants: Restaurant[], total: number }` | Haversine distance calculation on server |
| `restaurantService.getRestaurantById(id)` | `/api/restaurants/:id` | `GET` | — | `Restaurant` | Includes populated address & delivery zones |
| `restaurantService.getSpecials(city)` | `/api/restaurants/specials` | `GET` | `city` | `Array<{ restaurant: Restaurant, item: MenuItem }>` | Chef recommendations |
| `restaurantService.updateRestaurant(id, data)` | `/api/restaurants/:id` | `PUT` | — | `Restaurant` | Merchant dashboard settings update |

### 2.3 Menu Management (`menuService.ts`)
| Frontend Service Call | Future Backend Endpoint | Method | Request Body | Response Schema | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `menuService.getMenu(restaurantId)` | `/api/restaurants/:id/menu` | `GET` | — | `MenuItem[]` | Cached via Redis |
| `menuService.getMenuByCategory(id)` | `/api/restaurants/:id/menu/grouped` | `GET` | — | `Record<string, MenuItem[]>` | Pre-aggregated menu groups |
| `menuService.toggleAvailability(itemId, bool)` | `/api/menu/:id/availability` | `PATCH` | `{ isAvailable: boolean }` | `MenuItem` | Instantly notifies active carts via Socket |
| `menuService.addMenuItem(item)` | `/api/menu` | `POST` | `Omit<MenuItem, '_id'>` | `MenuItem` | Form validation for pricing & dietary tags |
| `menuService.deleteMenuItem(itemId)` | `/api/menu/:id` | `DELETE` | — | `{ success: boolean }` | Soft-delete / archiver |

### 2.4 Order Lifecycle & KDS Kanban (`orderService.ts`)
| Frontend Service Call | Future Backend Endpoint | Method | Request Body / Query | Response Schema | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `orderService.createOrder(payload)` | `/api/orders` | `POST` | `{ items, address, deliveryFee, tip, whatsappOptIn, ... }` | `Order` | 13-state machine; triggers auto delivery request |
| `orderService.getOrders(filters)` | `/api/orders` | `GET` | `customerId`, `restaurantId`, `status`, `page` | `Order[]` | Filtered by authenticated role |
| `orderService.getOrderById(id)` | `/api/orders/:id` | `GET` | — | `Order` | Includes timeline and rider details |
| `orderService.updateOrderStatus(id, status, desc)` | `/api/orders/:id/status` | `PATCH` | `{ orderStatus: OrderStatus, description?: string }` | `Order` | Broadcasts `order:statusChanged` WebSocket event |
| `orderService.assignRider(orderId, rider?)` | `/api/orders/:id/assign-rider` | `POST` | `{ riderId: string }` | `Order` | Dispatches rider coordinates & ETA |
| `orderService.cancelOrder(orderId, reason)` | `/api/orders/:id/cancel` | `POST` | `{ reason: string }` | `Order` | Triggers refund pending workflow |

### 2.5 Table Reservations & QR Pass (`reservationService.ts`)
| Frontend Service Call | Future Backend Endpoint | Method | Request Body | Response Schema | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `reservationService.createReservation(data)` | `/api/reservations` | `POST` | `{ restaurantId, tableId, guestCount, date, timeSlot, ... }` | `Reservation` | Generates unique encrypted QR token |
| `reservationService.getReservations(filters)` | `/api/reservations` | `GET` | `restaurantId`, `customerId`, `status` | `Reservation[]` | Populates table zone and guest details |
| `reservationService.updateReservationStatus(id, status)`| `/api/reservations/:id/status` | `PATCH` | `{ status: ReservationStatus }` | `Reservation` | Status: CONFIRMED, SEATED, COMPLETED, NO_SHOW |
| `reservationService.cancelReservation(id, reason)` | `/api/reservations/:id/cancel` | `POST` | `{ reason: string }` | `Reservation` | 15-minute grace period policy |

### 2.6 Delivery Fleet & Rider Management (`deliveryService.ts`)
| Frontend Service Call | Future Backend Endpoint | Method | Request Body | Response Schema | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `deliveryService.getRequests(radiusKm)` | `/api/delivery/requests` | `GET` | `radiusKm` | `DeliveryRequest[]` | Geospatial geoNear query with radius expansion |
| `deliveryService.acceptRequest(id, riderId)` | `/api/delivery/requests/:id/accept` | `POST` | `{ riderId }` | `{ request, order }` | Transitions order to `RIDER_ASSIGNED` |
| `deliveryService.rejectRequest(id)` | `/api/delivery/requests/:id/reject` | `POST` | `{ reason? }` | `{ success: boolean }` | Re-queues for other nearby riders |
| `deliveryService.getActiveDelivery(riderId)` | `/api/delivery/active` | `GET` | — | `{ order, step, distanceKm } \| null` | 4-step rider delivery lifecycle |
| `deliveryService.arrivedAtRestaurant(orderId)` | `/api/delivery/orders/:id/arrived-restaurant` | `POST` | — | `Order` | Notifies restaurant KDS of rider arrival |
| `deliveryService.confirmPickup(orderId)` | `/api/delivery/orders/:id/pickup` | `POST` | — | `Order` | Order moves to `OUT_FOR_DELIVERY` |
| `deliveryService.arrivedAtCustomer(orderId)` | `/api/delivery/orders/:id/arrived-customer` | `POST` | — | `Order` | Prompts customer app for 4-digit OTP |
| `deliveryService.verifyDeliveryOtp(orderId, otp)` | `/api/delivery/orders/:id/verify-otp` | `POST` | `{ otp: string }` | `{ success, message, order }` | Verifies secure OTP, marks `DELIVERED`, credits wallet |
| `deliveryService.updateOnlineStatus(riderId, isOnline)` | `/api/delivery/status` | `PATCH` | `{ isOnline: boolean }` | `DeliveryPartner` | Toggles rider fleet availability |
| `deliveryService.getEarnings(period)` | `/api/delivery/earnings` | `GET` | `period: 'DAY' \| 'WEEK' \| 'MONTH' \| 'YEAR'` | `{ totalEarnings, tripsCount, breakdown }` | Tip & incentive calculation breakdown |

### 2.7 AI Copilot & Business Intelligence (`aiReportService.ts`)
| Frontend Service Call | Future Backend Endpoint | Method | Request Body | Response Schema | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `aiReportService.generateReport(type, restaurantId)` | `/api/owner/ai/reports/generate` | `POST` | `{ reportType, restaurantId }` | `OwnerAIReport` | Connects to LLM (Gemini 2.5 / Claude) for menu & ops recommendations |

### 2.8 Promotions & Loyalty (`promotionService.ts`)
| Frontend Service Call | Future Backend Endpoint | Method | Request Body | Response Schema | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `promotionService.getPromotions(restaurantId?)` | `/api/promotions` | `GET` | `restaurantId?` | `Promotion[]` | Platform-wide or venue-specific |
| `promotionService.applyCoupon(code, subtotal)` | `/api/promotions/apply` | `POST` | `{ code, subtotal }` | `{ valid, discountAmount, coupon }` | Validates minimum spend & caps |
| `promotionService.createPromotion(promo)` | `/api/promotions` | `POST` | `Promotion` | `Promotion` | Merchant or admin promotion creation |
| `promotionService.togglePromotion(id, bool)` | `/api/promotions/:id/toggle` | `PATCH` | `{ isActive: boolean }` | `Promotion` | Active status toggle |

### 2.9 Culinary Events (`eventService.ts`)
| Frontend Service Call | Future Backend Endpoint | Method | Request Body | Response Schema | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `eventService.getEvents(filters)` | `/api/events` | `GET` | `cuisine`, `restaurantId`, `status` | `CulinaryEvent[]` | Masterclasses, wine tastings, banquets |
| `eventService.bookEvent(id, tickets, customer)` | `/api/events/:id/book` | `POST` | `{ ticketsCount, customer }` | `EventBooking` | Capacity check, generates event pass |
| `eventService.getEventBookings(eventId)` | `/api/events/:id/bookings` | `GET` | — | `EventBooking[]` | Attendee roster for owner & admin |

### 2.10 Multi-Factor Reviews (`reviewService.ts`)
| Frontend Service Call | Future Backend Endpoint | Method | Request Body | Response Schema | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `reviewService.getReviews(restaurantId)` | `/api/reviews` | `GET` | `restaurantId` | `{ reviews, averages: { overall, food, delivery, packaging } }` | Multi-factor rating breakdown |
| `reviewService.submitReview(payload)` | `/api/reviews` | `POST` | `{ restaurantId, orderId, foodRating, deliveryRating, ... }` | `Review` | Verified diner badge requirement |
| `reviewService.respondToReview(id, reply)` | `/api/reviews/:id/respond` | `POST` | `{ response: string }` | `Review` | Merchant official response |

---

## 3. Real-Time WebSocket Event Contracts (`socket.ts`)

| Event Name | Direction | Payload Structure | Purpose |
| :--- | :--- | :--- | :--- |
| `order:statusChanged` | Server → Client | `{ orderId: string, status: OrderStatus }` | Live status badge update across customer & owner views |
| `order:assigned` | Server → Client | `{ orderId: string, rider: RiderDetails }` | Informs customer that a rider accepted the order |
| `delivery:request` | Server → Rider | `DeliveryRequest` | Broadcasts new pickup to riders within search radius |
| `delivery:accepted` | Rider → Server | `{ requestId: string, riderId: string, orderId: string }` | Locks request for rider |
| `delivery:pickedUp` | Rider → Server | `{ orderId: string }` | Order moves to `OUT_FOR_DELIVERY` |
| `delivery:arrived` | Rider → Server | `{ orderId: string, target: 'RESTAURANT' \| 'CUSTOMER' }` | Notifies restaurant or customer of doorstep arrival |
| `delivery:delivered` | Rider → Server | `{ orderId: string, payout: number }` | Triggers final confirmation & credits wallet |
| `notification:new` | Server → Client | `AppNotification` | Real-time bell alert notification dropdown |

---

## 4. Frontend Route to Layout & Persona Mapping

| Route Pattern | Role Persona | Layout Container | Navigation Type |
| :--- | :--- | :--- | :--- |
| `/` | Customer | Root + Customer `Navbar` + `Footer` | Top Sticky Nav + Mobile Bottom Bar |
| `/restaurants`, `/restaurant/:id` | Customer | Root + Customer `Navbar` + `Footer` | Top Sticky Nav + Mobile Bottom Bar |
| `/search`, `/offers`, `/specials` | Customer | Root + Customer `Navbar` + `Footer` | Top Sticky Nav + Mobile Bottom Bar |
| `/events`, `/event/:id` | Customer | Root + Customer `Navbar` + `Footer` | Top Sticky Nav + Mobile Bottom Bar |
| `/orders`, `/orders/:id`, `/orders/:id/track` | Customer | Root + Customer `Navbar` + `Footer` | Top Sticky Nav + Mobile Bottom Bar |
| `/reservations`, `/reservations/:id` | Customer | Root + Customer `Navbar` + `Footer` | Top Sticky Nav + Mobile Bottom Bar |
| `/loyalty`, `/favorites`, `/profile` | Customer | Root + Customer `Navbar` + `Footer` | Top Sticky Nav + Mobile Bottom Bar |
| `/owner/*` (11 pages) | Restaurant Owner | `<OwnerLayout>` | Collapsible Left Sidebar + Mobile Flyout |
| `/delivery/*` (6 pages) | Delivery Partner | `<DeliveryLayout>` | Top Operations Bar with Online/Offline Toggle |
| `/admin/*` (13 pages) | Platform Admin | `<AdminLayout>` | Full Admin Sidebar + Metrics Header |
| `/auth` | Any | Standalone Screen | Dedicated Centered Card Layout |
