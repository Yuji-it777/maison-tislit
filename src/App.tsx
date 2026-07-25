import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AppProvider } from './context/AppContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import Toast from './components/Toast';
// HomePage is always the landing page — keep it eager to avoid an extra lazy-load waterfall
import HomePage from './pages/HomePage';

// All other pages are code-split: only downloaded when the user navigates there
const ShopPage        = lazy(() => import('./pages/ShopPage'));
const AboutPage       = lazy(() => import('./pages/AboutPage'));
const CartPage        = lazy(() => import('./pages/CartPage'));
const LoginPage       = lazy(() => import('./pages/LoginPage'));
const RegisterPage    = lazy(() => import('./pages/RegisterPage'));
const CheckoutPage    = lazy(() => import('./pages/CheckoutPage'));
const ConfirmationPage = lazy(() => import('./pages/ConfirmationPage'));
const AccountPage     = lazy(() => import('./pages/AccountPage'));
const AdminPage       = lazy(() => import('./pages/AdminPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const ContactPage     = lazy(() => import('./pages/ContactPage'));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage'));
const ShippingPolicyPage = lazy(() => import('./pages/ShippingPolicyPage'));
const ReturnsPolicyPage = lazy(() => import('./pages/ReturnsPolicyPage'));
import { AdminGuard } from './components/AdminGuard';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

/** Minimal loading indicator shown while a lazy page chunk downloads */
function PageLoader() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '3px solid #B4A180', borderTopColor: 'transparent',
        animation: 'spin 0.7s linear infinite'
      }} />
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname === '/admin' || location.pathname.startsWith('/admin/');
  const showNavFooter = !isAdminRoute;

  return (
    <div className="font-sans antialiased" style={{ fontFamily: "'Raleway', sans-serif" }}>
      <ScrollToTop />
      {showNavFooter && <Navbar />}
      <main>
        {/* key={location.key} remounts the wrapper on every navigation, replaying the animation */}
        <div key={location.key} className={'page-transition'}>
          <Suspense fallback={<PageLoader />}>
            <Routes location={location}>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/tracking" element={<OrderTrackingPage />} />
              <Route path="/shipping" element={<ShippingPolicyPage />} />
              <Route path="/returns" element={<ReturnsPolicyPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/confirmation" element={<ConfirmationPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/admin" element={<AdminGuard><AdminPage /></AdminGuard>} />
              <Route path="/admin/orders/:id" element={<AdminGuard><OrderDetailPage /></AdminGuard>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </main>
      {showNavFooter && <Footer />}
      {showNavFooter && <WhatsAppButton />}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
}

