import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CartItem, User, Page, Product, Review, Currency } from '../types';
import { useTranslation, localizePath, stripLocale } from './LanguageContext';
import { supabase } from '../supabase/client';
import type { ProfileRow } from '../supabase/types';
import { getProducts, getProfile, createReview, getProductReviews } from '../supabase/queries';
import type { ReviewRow } from '../supabase/types';

const pageToPath: Record<Page, string> = {
  home: '/', shop: '/shop', about: '/about',
  cart: '/cart', login: '/login',
  checkout: '/checkout', confirmation: '/confirmation',
  account: '/account', favorites: '/favorites', admin: '/admin', contact: '/contact',
  shipping: '/shipping', returns: '/returns'
};

const pathToPage: Record<string, Page> = Object.fromEntries(
  Object.entries(pageToPath).map(([k, v]) => [v, k])
) as Record<string, Page>;

interface AppContextType {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;

  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;

  cart: CartItem[];
  addToCart: (product: Product, size: string, color: string, qty?: number, customMeasurements?: CartItem['customMeasurements']) => void;
  removeFromCart: (id: number, size: string, color: string) => void;
  updateQuantity: (id: number, size: string, color: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  wishlist: number[];
  toggleWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;

  orderPlaced: boolean;
  setOrderPlaced: (v: boolean) => void;
  orderDetails: { id?: number; name: string; email?: string; address: string; city: string; phone: string; whatsappUrl?: string } | null;
  setOrderDetails: (d: { id?: number; name: string; email?: string; address: string; city: string; phone: string; whatsappUrl?: string } | null) => void;

  products: Product[];
  loadingProducts: boolean;
  refreshProducts: () => Promise<void>;

  activeCategory: string;
  setActiveCategory: (cat: string) => void;

  reviews: Review[];
  fetchProductReviews: (productId: number) => Promise<void>;
  addReview: (productId: number, rating: number, comment: string, name: string) => void;

  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceInMAD: number) => string;
  subscribeToNewsletter: (email: string) => Promise<boolean>;

  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;

  calculateShipping: (subtotal: number, country?: string) => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function mapSupabaseProduct(row: any): Product {
  return {
    id: row.id,
    slug: row.slug || '',
    name: row.name,
    nameEn: row.name_en,
    category: row.category as Product['category'],
    price: row.price ?? 150,
    image: (row.image || '').trim(),
    description: row.description || '',
    descriptionEn: row.description_en || '',
    sizes: row.sizes || [],
    colors: row.colors || [],
    badge: row.badge || undefined,
    stock: row.stock ?? 0,
  };
}

function mapReviewRow(row: ReviewRow): Review {
  return {
    id: row.id,
    productId: row.product_id,
    userId: row.user_id || '',
    userName: row.user_name,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
  };
}

function safeLocalStorageSet(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch {}
}

export function AppProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage: Page = pathToPage[stripLocale(location.pathname)] ?? 'home';
  const setCurrentPage = (page: Page) => navigate(localizePath(pageToPath[page], locale));
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('maison-tislit-cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [loading, setLoading] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState<{ id?: number; name: string; email?: string; address: string; city: string; phone: string; whatsappUrl?: string } | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [currency, setCurrency] = useState<Currency>('MAD');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const formatPrice = (priceInMAD: number) => {
    if (currency === 'MAD') return `${Math.round(priceInMAD)} MAD`;
    if (currency === 'EUR') return `€${(priceInMAD / 10.8).toFixed(2)}`;
    if (currency === 'USD') return `$${(priceInMAD / 10.0).toFixed(2)}`;
    return `${priceInMAD} MAD`;
  };

  const subscribeToNewsletter = async (email: string) => {
    try {
      const { error } = await supabase.from('newsletter_subscribers').insert({ email });
      if (error && error.code !== '23505') throw error;
      showToast(t('footer.newsletterSuccess'), 'success');
      return true;
    } catch (err) {
      console.error(err);
      showToast(t('toast.newsletterError') || 'Failed to subscribe.', 'error');
      return false;
    }
  };
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const { t, locale } = useTranslation();
  const isAdmin = profile?.is_admin === true;

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  };

  /* ───── Session on mount ───── */
  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session?.user) {
        const uid = session.user.id;
        setUser({ id: uid, name: session.user.user_metadata?.name || session.user.email || '', email: session.user.email || '' });
        getProfile(uid).then(p => { if (!cancelled) { setProfile(p); setLoading(false); } });
      } else {
        setLoading(false);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      if (session?.user) {
        const uid = session.user.id;
        setUser({ id: uid, name: session.user.user_metadata?.name || session.user.email || '', email: session.user.email || '' });
        getProfile(uid).then(p => { if (!cancelled) setProfile(p); });
      } else {
        setUser(null);
        setProfile(null);
      }
    });
    return () => { cancelled = true; listener?.subscription.unsubscribe(); };
  }, []);

  /* ───── Auth ───── */
  const loginAttempts = useRef<{ count: number; firstAttempt: number }>({ count: 0, firstAttempt: 0 });

  const login = async (email: string, password: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase().slice(0, 254);
    const cleanPassword = password.slice(0, 128);

    const now = Date.now();
    const windowMs = 60000;
    if (now - loginAttempts.current.firstAttempt > windowMs) {
      loginAttempts.current = { count: 0, firstAttempt: now };
    }
    loginAttempts.current.count++;

    if (loginAttempts.current.count > 5) {
      const wait = Math.min(30000, (loginAttempts.current.count - 5) * 5000);
      showToast(`Too many attempts. Please wait ${Math.ceil(wait / 1000)}s.`, 'error');
      await new Promise(r => setTimeout(r, wait));
      loginAttempts.current = { count: 0, firstAttempt: Date.now() };
      return false;
    }

    const start = Date.now();
    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password: cleanPassword });
    const elapsed = Date.now() - start;
    if (elapsed < 1200) await new Promise(r => setTimeout(r, 1200 - elapsed));

    if (error) {
      showToast(t('toast.loginError'), 'error');
      return false;
    }
    if (data?.user) {
      const uid = data.user.id;
      setUser({ id: uid, name: data.user.user_metadata?.name || data.user.email || '', email: data.user.email || '' });
      const p = await getProfile(uid);
      setProfile(p);
    }
    showToast(t('toast.welcomeBack'), 'success');
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setCart([]);
    localStorage.removeItem('maison-tislit-cart');
    setCurrentPage('home');
    showToast(t('toast.loggedOut'), 'info');
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}${localizePath('/login', locale)}`,
    });
    if (error) {
      showToast(t('auth.resetError'), 'error');
      return false;
    }
    showToast(t('auth.resetEmailSent'), 'success');
    return true;
  };

  /* ───── Products ───── */
  const refreshProducts = async () => {
    setLoadingProducts(true);
    try {
      const rows = await getProducts();
      setProducts(rows.map(mapSupabaseProduct));
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingProducts(true);
      try {
        const rows = await getProducts();
        if (!cancelled) setProducts(rows.map(mapSupabaseProduct));
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* ───── Cart Persistence ───── */
  useEffect(() => {
    safeLocalStorageSet('maison-tislit-cart', JSON.stringify(cart));
  }, [cart]);

  /* ───── Shipping calculation ───── */
  const calculateShipping = useCallback((subtotal: number, country?: string): number => {
    const isMorocco = !country || country === 'Maroc' || country === 'Morocco';
    return isMorocco ? (subtotal >= 2000 ? 0 : 60) : 200;
  }, []);

  /* ───── Cart ───── */
  const addToCart = (product: Product, size: string, color: string, qty = 1, customMeasurements?: CartItem['customMeasurements']) => {
    setCart(prev => {
      if (size === 'Custom') {
        return [...prev, { ...product, quantity: qty, selectedSize: size, selectedColor: color, customMeasurements }];
      }
      const existing = prev.find(i => i.id === product.id && i.selectedSize === size && i.selectedColor === color && !i.customMeasurements);
      if (existing) {
        return prev.map(i =>
          i.id === product.id && i.selectedSize === size && i.selectedColor === color && !i.customMeasurements
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [...prev, { ...product, quantity: qty, selectedSize: size, selectedColor: color }];
    });
    const productName = locale === 'en' ? product.nameEn : product.name;
    showToast(`${productName}${t('toast.addedToCart')}`, 'success');
  };

  const removeFromCart = (id: number, size: string, color: string) => {
    setCart(prev => prev.filter(i => !(i.id === id && i.selectedSize === size && i.selectedColor === color)));
  };

  const updateQuantity = (id: number, size: string, color: string, qty: number) => {
    if (qty <= 0) { removeFromCart(id, size, color); return; }
    setCart(prev =>
      prev.map(i =>
        i.id === id && i.selectedSize === size && i.selectedColor === color
          ? { ...i, quantity: qty }
          : i
      )
    );
  };

  const clearCart = () => setCart([]);

  const [wishlist, setWishlist] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('maison-tislit-wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    safeLocalStorageSet('maison-tislit-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (productId: number) => {
    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: number) => wishlist.includes(productId);

  /* ───── Reviews (Supabase + localStorage cache) ───── */
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem('maison-tislit-reviews');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    safeLocalStorageSet('maison-tislit-reviews', JSON.stringify(reviews));
  }, [reviews]);

  const fetchProductReviews = async (productId: number) => {
    try {
      const rows = await getProductReviews(productId);
      const serverReviews = rows.map(mapReviewRow);
      setReviews(prev => {
        const otherReviews = prev.filter(r => r.productId !== productId);
        const existing = new Set(serverReviews.map(r => `${r.userId}-${r.comment}`));
        const localOnly = prev.filter(r => r.productId === productId && !existing.has(`${r.userId}-${r.comment}`));
        return [...otherReviews, ...serverReviews, ...localOnly];
      });
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  const addReview = async (productId: number, rating: number, comment: string, name: string) => {
    const reviewerName = (name || (user?.name) || 'Anonymous').trim() || 'Anonymous';
    try {
      const row = await createReview({
        product_id: productId,
        user_id: user?.id || null,
        user_name: reviewerName,
        rating,
        comment,
      });
      const review = mapReviewRow(row);
      setReviews(prev => [review, ...prev]);
    } catch {
      const review: Review = {
        id: Date.now(),
        productId,
        userId: user?.id || '',
        userName: reviewerName,
        rating,
        comment,
        createdAt: new Date().toISOString(),
      };
      setReviews(prev => [review, ...prev]);
    }
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <AppContext.Provider value={{
      currentPage, setCurrentPage,
      user, isAdmin, loading,
      login, logout, resetPassword,
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      cartTotal, cartCount,
      wishlist, toggleWishlist, isInWishlist,
      orderPlaced, setOrderPlaced,
      orderDetails, setOrderDetails,
      products, loadingProducts, refreshProducts,
      activeCategory, setActiveCategory,
      reviews, fetchProductReviews, addReview,
      currency, setCurrency,
      formatPrice,
      calculateShipping,
      subscribeToNewsletter,

      toast, showToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
