import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { StickyCartDrawer } from './components/customer/StickyCartDrawer';
import { RoleSwitcherBanner } from './components/common/RoleSwitcherBanner';
import { ToastContainer } from './components/common/ToastContainer';

// Layout Components
import { OwnerLayout } from './components/layout/OwnerLayout';
import { DeliveryLayout } from './components/layout/DeliveryLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// ─── Customer Pages ──────────────────────────────────────────────
import { HomePage } from './pages/customer/HomePage';
import { RestaurantsPage } from './pages/customer/RestaurantsPage';
import { RestaurantDetailPage } from './pages/customer/RestaurantDetailPage';
import { SearchPage } from './pages/customer/SearchPage';
import { OffersPage } from './pages/customer/OffersPage';
import { SpecialsPage } from './pages/customer/SpecialsPage';
import { EventsPage } from './pages/customer/EventsPage';
import { EventDetailPage } from './pages/customer/EventDetailPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { OrdersPage } from './pages/customer/OrdersPage';
import { OrderDetailPage } from './pages/customer/OrderDetailPage';
import { OrderTrackPage } from './pages/customer/OrderTrackPage';
import { ReservationsPage } from './pages/customer/ReservationsPage';
import { ReservationDetailPage } from './pages/customer/ReservationDetailPage';
import { LoyaltyWalletPage } from './pages/customer/LoyaltyWalletPage';
import { FavoritesPage } from './pages/customer/FavoritesPage';
import { ProfilePage } from './pages/customer/ProfilePage';

// ─── Owner Pages ─────────────────────────────────────────────────
import { OwnerDashboardNewPage } from './pages/owner/OwnerDashboardNewPage';
import { OwnerOrdersPage } from './pages/owner/OwnerOrdersPage';
import { OwnerReservationsPage } from './pages/owner/OwnerReservationsPage';
import { OwnerMenuPage } from './pages/owner/OwnerMenuPage';
import { OwnerPromotionsPage } from './pages/owner/OwnerPromotionsPage';
import { OwnerEventsPage } from './pages/owner/OwnerEventsPage';
import { OwnerDeliveryPage } from './pages/owner/OwnerDeliveryPage';
import { OwnerReviewsPage } from './pages/owner/OwnerReviewsPage';
import { OwnerAnalyticsPage } from './pages/owner/OwnerAnalyticsPage';
import { OwnerAIReportsPage } from './pages/owner/OwnerAIReportsPage';
import { OwnerApplicationPage } from './pages/owner/OwnerApplicationPage';

// ─── Delivery Partner Pages ──────────────────────────────────────
import { DeliveryDashboardPage } from './pages/delivery/DeliveryDashboardPage';
import { DeliveryRequestsPage } from './pages/delivery/DeliveryRequestsPage';
import { DeliveryActiveOrderPage } from './pages/delivery/DeliveryActiveOrderPage';
import { DeliveryEarningsPage } from './pages/delivery/DeliveryEarningsPage';
import { DeliveryRatingsPage } from './pages/delivery/DeliveryRatingsPage';
import { DeliveryProfilePage } from './pages/delivery/DeliveryProfilePage';

// ─── Admin Pages ─────────────────────────────────────────────────
import { AdminDashboardNewPage } from './pages/admin/AdminDashboardNewPage';
import { AdminRestaurantsPage } from './pages/admin/AdminRestaurantsPage';
import { AdminApplicationsPage } from './pages/admin/AdminApplicationsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminReservationsPage } from './pages/admin/AdminReservationsPage';
import { AdminDeliveryPage } from './pages/admin/AdminDeliveryPage';
import { AdminEventsPage } from './pages/admin/AdminEventsPage';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';
import { AdminPromotionsPage } from './pages/admin/AdminPromotionsPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminAuditPage } from './pages/admin/AdminAuditPage';

// ─── Auth ────────────────────────────────────────────────────────
import { AuthPage } from './pages/auth/AuthPage';

export const App: React.FC = () => {
  const location = useLocation();
  const isAuthPage = location.pathname.startsWith('/auth');
  const isOwnerRoute = location.pathname.startsWith('/owner');
  const isDeliveryRoute = location.pathname.startsWith('/delivery');
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isRoleRoute = isOwnerRoute || isDeliveryRoute || isAdminRoute;

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-stone-800">
      {/* Global Demo Role Switcher Banner */}
      <RoleSwitcherBanner />

      {/* Global Toast Notifications */}
      <ToastContainer />

      {/* Show Navbar only for customer routes (not auth/owner/delivery/admin) */}
      {!isAuthPage && !isRoleRoute && <Navbar />}
      
      <main className="flex-1">
        <Routes>
          {/* ─── Customer Routes ─────────────────────────────── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/restaurants" element={<RestaurantsPage />} />
          <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/specials" element={<SpecialsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/event/:id" element={<EventDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/orders/:id/track" element={<OrderTrackPage />} />
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/reservations/:id" element={<ReservationDetailPage />} />
          <Route path="/loyalty" element={<LoyaltyWalletPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* ─── Owner Routes (wrapped in OwnerLayout) ──────── */}
          <Route path="/owner/dashboard" element={<OwnerLayout><OwnerDashboardNewPage /></OwnerLayout>} />
          <Route path="/owner/orders" element={<OwnerLayout><OwnerOrdersPage /></OwnerLayout>} />
          <Route path="/owner/reservations" element={<OwnerLayout><OwnerReservationsPage /></OwnerLayout>} />
          <Route path="/owner/menu" element={<OwnerLayout><OwnerMenuPage /></OwnerLayout>} />
          <Route path="/owner/promotions" element={<OwnerLayout><OwnerPromotionsPage /></OwnerLayout>} />
          <Route path="/owner/events" element={<OwnerLayout><OwnerEventsPage /></OwnerLayout>} />
          <Route path="/owner/delivery" element={<OwnerLayout><OwnerDeliveryPage /></OwnerLayout>} />
          <Route path="/owner/reviews" element={<OwnerLayout><OwnerReviewsPage /></OwnerLayout>} />
          <Route path="/owner/analytics" element={<OwnerLayout><OwnerAnalyticsPage /></OwnerLayout>} />
          <Route path="/owner/ai-reports" element={<OwnerLayout><OwnerAIReportsPage /></OwnerLayout>} />
          <Route path="/owner/application" element={<OwnerLayout><OwnerApplicationPage /></OwnerLayout>} />

          {/* ─── Delivery Partner Routes (wrapped in DeliveryLayout) ── */}
          <Route path="/delivery/dashboard" element={<DeliveryLayout><DeliveryDashboardPage /></DeliveryLayout>} />
          <Route path="/delivery/requests" element={<DeliveryLayout><DeliveryRequestsPage /></DeliveryLayout>} />
          <Route path="/delivery/active" element={<DeliveryLayout><DeliveryActiveOrderPage /></DeliveryLayout>} />
          <Route path="/delivery/earnings" element={<DeliveryLayout><DeliveryEarningsPage /></DeliveryLayout>} />
          <Route path="/delivery/ratings" element={<DeliveryLayout><DeliveryRatingsPage /></DeliveryLayout>} />
          <Route path="/delivery/profile" element={<DeliveryLayout><DeliveryProfilePage /></DeliveryLayout>} />

          {/* ─── Admin Routes (wrapped in AdminLayout) ──────── */}
          <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboardNewPage /></AdminLayout>} />
          <Route path="/admin/restaurants" element={<AdminLayout><AdminRestaurantsPage /></AdminLayout>} />
          <Route path="/admin/applications" element={<AdminLayout><AdminApplicationsPage /></AdminLayout>} />
          <Route path="/admin/users" element={<AdminLayout><AdminUsersPage /></AdminLayout>} />
          <Route path="/admin/orders" element={<AdminLayout><AdminOrdersPage /></AdminLayout>} />
          <Route path="/admin/reservations" element={<AdminLayout><AdminReservationsPage /></AdminLayout>} />
          <Route path="/admin/delivery" element={<AdminLayout><AdminDeliveryPage /></AdminLayout>} />
          <Route path="/admin/events" element={<AdminLayout><AdminEventsPage /></AdminLayout>} />
          <Route path="/admin/reviews" element={<AdminLayout><AdminReviewsPage /></AdminLayout>} />
          <Route path="/admin/promotions" element={<AdminLayout><AdminPromotionsPage /></AdminLayout>} />
          <Route path="/admin/payments" element={<AdminLayout><AdminPaymentsPage /></AdminLayout>} />
          <Route path="/admin/reports" element={<AdminLayout><AdminReportsPage /></AdminLayout>} />
          <Route path="/admin/audit" element={<AdminLayout><AdminAuditPage /></AdminLayout>} />

          {/* ─── Auth & Shortcuts ───────────────────────────── */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route path="/delivery" element={<Navigate to="/delivery/dashboard" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/owner" element={<Navigate to="/owner/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Cart drawer and Footer only for customer routes */}
      {!isAuthPage && !isRoleRoute && <StickyCartDrawer />}
      {!isAuthPage && !isRoleRoute && <Footer />}
    </div>
  );
};
export default App;
