import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';
import { productAlt, productName } from '../utils/productAlt';
import { getOrdersByUser } from '../supabase/queries';
import type { OrderRow } from '../supabase/types';
import { Heart, Package } from 'lucide-react';
import SEO from '../components/SEO';

const statusLabel: Record<string, string> = {
  pending: 'In afwachting',
  shipped: 'Verzonden',
  delivered: 'Geleverd',
};

const statusColor: Record<string, string> = {
  pending: 'bg-brand text-brand',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-emerald-100 text-emerald-700',
};

export default function AccountPage() {
  const { setCurrentPage, logout, user, wishlist, toggleWishlist, products, formatPrice } = useApp();
  const { t, locale } = useTranslation();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoadingOrders(true);
    getOrdersByUser(user.id)
      .then(data => { if (!cancelled) setOrders(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingOrders(false); });
    return () => { cancelled = true; };
  }, [user]);

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  const memberSince = (() => {
    try {
      const d = new Date();
      return d.toLocaleDateString(locale === 'nl' ? 'nl-NL' : 'en-US', { month: 'long', year: 'numeric' });
    } catch {
      return '—';
    }
  })();

  if (!user) {
    return (
<div className="pt-20 min-h-screen bg-stone-50">
      <SEO noindex />
        <div className="bg-stone-800 text-white py-16 px-6 text-center">
          <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            <Heart size={28} className="inline text-red-400 mr-2 -mt-1" />
            {t('account.favorites')}
          </h1>
        </div>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            {wishlistProducts.length === 0 ? (
              <div className="text-center py-8 text-stone-400">
                <p className="text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>{t('wishlist.empty')}</p>
                <button onClick={() => setCurrentPage('shop')} className="mt-3 text-xs text-brand hover:underline">
                  {t('wishlist.browse')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {wishlistProducts.map(p => (
                  <div key={p.id} className="relative group rounded-xl overflow-hidden border border-stone-100">
                    <img src={p.image} alt={productAlt(p, locale)} loading="lazy" width={600} height={800} className="w-full aspect-[3/4] object-contain bg-stone-100" />
                    <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/40 transition-all flex items-center justify-center gap-2">
                      <button
                        onClick={() => { toggleWishlist(p.id); }}
                        className="bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-stone-100"
                      >
                        <Heart size={16} className="fill-brand text-brand" />
                      </button>
                      <button
                        onClick={() => setCurrentPage('shop')}
                        className="bg-white text-stone-800 text-xs px-3 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-all font-medium"
                      >
                        Voir
                      </button>
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium text-stone-700 truncate">{productName(p, locale)}</p>
                      <p className="text-xs text-stone-500">{formatPrice(p.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-stone-50">
      <div className="bg-stone-800 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-brand flex items-center justify-center text-3xl font-bold text-black border-4 border-brand">
            {user.name[0]}
          </div>
          <div>
            <p className="text-brand text-xs tracking-[0.3em] uppercase mb-1">{t('account.myAccount')}</p>
            <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{user.name}</h1>
            <p className="text-stone-400 text-sm mt-1">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { icon: <Package size={32} className="text-brand" />, labelKey: 'account.orders', value: orders.length, color: 'bg-brand border-brand' },
            { icon: <Heart size={32} className="text-red-500" />, labelKey: 'account.favorites', value: wishlist.length, color: 'bg-rose-50 border-rose-200' },
          ].map(s => (
            <div key={s.labelKey} className={`${s.color} border rounded-xl p-6 text-center`}>
              <div className="text-3xl mb-2 flex justify-center">{typeof s.icon === 'string' ? s.icon : s.icon}</div>
              <div className="text-2xl font-bold text-stone-800 mb-1">{s.value}</div>
              <div className="text-xs text-stone-500 uppercase tracking-wider">{t(s.labelKey)}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-stone-800 mb-5 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            {t('account.myOrders')}
          </h2>
          {loadingOrders ? (
            <div className="text-center py-8">
              <svg className="w-6 h-6 animate-spin mx-auto text-brand" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-stone-400">
              <p className="text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>{t('wishlist.empty')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="border border-stone-100 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-stone-800 text-sm">#{order.id}</p>
                    <p className="text-xs text-stone-400">{new Date(order.created_at).toLocaleDateString(locale === 'nl' ? 'nl-NL' : 'en-US')} • {formatPrice(Number(order.total))}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-stone-800 font-bold">{formatPrice(Number(order.total))}</span>
                    <span className={`${statusColor[order.status] || 'bg-stone-100 text-stone-600'} text-xs font-semibold px-3 py-1 rounded-full`}>
                      {statusLabel[order.status] || order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => setCurrentPage('shop')}
            className="mt-5 w-full border border-stone-200 text-stone-600 hover:bg-stone-50 py-3 text-xs tracking-widest uppercase rounded-lg transition-colors"
          >
            {t('account.orderAgain')}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-stone-800 mb-5 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            <Heart size={20} className="text-red-500" /> {t('account.favorites')} ({wishlist.length})
          </h2>
          {wishlistProducts.length === 0 ? (
            <div className="text-center py-8 text-stone-400">
              <p className="text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>{t('wishlist.empty')}</p>
              <button onClick={() => setCurrentPage('shop')} className="mt-3 text-xs text-brand hover:underline">
                {t('wishlist.browse')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {wishlistProducts.map(p => (
                <div key={p.id} className="relative group rounded-xl overflow-hidden border border-stone-100">
                  <img src={p.image} alt={productAlt(p, locale)} loading="lazy" width={600} height={800} className="w-full aspect-[3/4] object-contain bg-stone-100" />
                  <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/40 transition-all flex items-center justify-center gap-2">
                    <button
                      onClick={() => { toggleWishlist(p.id); }}
                      className="bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                    >
                      <Heart size={16} className="fill-red-500 text-red-500" />
                    </button>
                    <button
                      onClick={() => setCurrentPage('shop')}
                      className="bg-white text-stone-800 text-xs px-3 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-all font-medium"
                    >
                      Voir
                    </button>
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-stone-700 truncate">{productName(p, locale)}</p>
                    <p className="text-xs text-stone-500">{formatPrice(p.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-stone-800 mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
            {t('account.accountInfo')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-stone-50 rounded-lg p-4">
              <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">{t('account.name')}</p>
              <p className="text-stone-800 font-medium">{user.name}</p>
            </div>
            <div className="bg-stone-50 rounded-lg p-4">
              <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">{t('account.email')}</p>
              <p className="text-stone-800 font-medium">{user.email}</p>
            </div>
            <div className="bg-stone-50 rounded-lg p-4">
              <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">{t('account.memberSince')}</p>
              <p className="text-stone-800 font-medium">{memberSince}</p>
            </div>
            <div className="bg-stone-50 rounded-lg p-4">
              <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">{t('account.status')}</p>
              <p className="text-brand font-semibold">{t('account.vip')}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setCurrentPage('shop')}
            className="flex-1 min-w-[140px] bg-stone-800 hover:bg-brand text-white py-3 text-sm tracking-widest uppercase rounded-lg transition-colors"
          >
            {t('account.shop')}
          </button>
          <button
            onClick={logout}
            className="flex-1 min-w-[140px] border border-red-200 text-red-600 hover:bg-red-50 py-3 text-sm tracking-widest uppercase rounded-lg transition-colors"
          >
            {t('account.logout')}
          </button>
        </div>
      </div>
    </div>
  );
}
