import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useParams, Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AppProvider } from './context/AppContext';
import { LanguageProvider, DEFAULT_LOCALE } from './context/LanguageContext';
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
const CheckoutPage    = lazy(() => import('./pages/CheckoutPage'));
const ConfirmationPage = lazy(() => import('./pages/ConfirmationPage'));
const AccountPage     = lazy(() => import('./pages/AccountPage'));
const AdminPage       = lazy(() => import('./pages/AdminPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const ContactPage     = lazy(() => import('./pages/ContactPage'));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage'));
const ShippingPolicyPage = lazy(() => import('./pages/ShippingPolicyPage'));
const ReturnsPolicyPage = lazy(() => import('./pages/ReturnsPolicyPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
import { AdminGuard } from './components/AdminGuard';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

/** Redirects an unprefixed path to the same path under the default locale */
function LocaleRedirect() {
  const { pathname } = useLocation();
  return <Navigate to={`/${DEFAULT_LOCALE}${pathname}`} replace />;
}

/** Validates the locale segment; anything other than en/nl falls back to the default locale */
function LocaleGate() {
  const { locale } = useParams();
  if (locale !== 'en' && locale !== 'nl') {
    return <Navigate to={`/${DEFAULT_LOCALE}/`} replace />;
  }
  return <Outlet />;
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
              {/* Unprefixed public paths redirect to the default locale */}
              <Route path="/" element={<Navigate to={`/${DEFAULT_LOCALE}/`} replace />} />
              <Route path="/shop" element={<LocaleRedirect />} />
              <Route path="/product/:slug" element={<LocaleRedirect />} />
              <Route path="/about" element={<LocaleRedirect />} />
              <Route path="/contact" element={<LocaleRedirect />} />
              <Route path="/cart" element={<LocaleRedirect />} />
              <Route path="/login" element={<LocaleRedirect />} />
              <Route path="/checkout" element={<LocaleRedirect />} />
              <Route path="/confirmation" element={<LocaleRedirect />} />
              <Route path="/account" element={<LocaleRedirect />} />
              <Route path="/tracking" element={<LocaleRedirect />} />
              <Route path="/shipping" element={<LocaleRedirect />} />
              <Route path="/returns" element={<LocaleRedirect />} />

              {/* Locale-prefixed routes */}
              <Route path="/:locale" element={<LocaleGate />}>
                <Route index element={<HomePage />} />
                <Route path="shop" element={<ShopPage />} />
                <Route path="product/:slug" element={<ProductDetailPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="confirmation" element={<ConfirmationPage />} />
                <Route path="account" element={<AccountPage />} />
                <Route path="tracking" element={<OrderTrackingPage />} />
                <Route path="shipping" element={<ShippingPolicyPage />} />
                <Route path="returns" element={<ReturnsPolicyPage />} />
              </Route>

              {/* Admin — unprefixed */}
              <Route path="/admin" element={<AdminGuard><AdminPage /></AdminGuard>} />
              <Route path="/admin/orders/:id" element={<AdminGuard><OrderDetailPage /></AdminGuard>} />

              <Route path="*" element={<Navigate to={`/${DEFAULT_LOCALE}/`} replace />} />
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

