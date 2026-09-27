import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTranslation, localizePath } from '../context/LanguageContext';
import { productAlt } from '../utils/productAlt';
import SEO from '../components/SEO';

export default function FavoritesPage() {
  const { setCurrentPage, wishlist, toggleWishlist, products, loadingProducts, formatPrice } = useApp();
  const { t, locale } = useTranslation();
  const navigate = useNavigate();

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="pt-20 min-h-screen bg-stone-50">
      <SEO title={t('account.favorites')} description={t('wishlist.emptyText')} noindex />
      <div className="bg-stone-800 text-white py-16 px-6 text-center">
        <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
          <Heart size={28} className="inline text-red-400 mr-2 -mt-1" />
          {t('account.favorites')}
        </h1>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-stone-800 mb-5 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            <Heart size={20} className="text-red-500" /> {t('account.favorites')} ({wishlist.length})
          </h2>

          {loadingProducts && wishlist.length > 0 ? (
            <div className="text-center py-8">
              <svg className="w-6 h-6 animate-spin mx-auto text-brand" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : wishlistProducts.length === 0 ? (
            <div className="text-center py-8 text-stone-400">
              <p className="text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>{t('wishlist.empty')}</p>
              <button onClick={() => setCurrentPage('shop')} className="mt-3 text-xs text-brand hover:underline">
                {t('wishlist.browse')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {wishlistProducts.map(p => {
                const productName = locale === 'en' && p.nameEn ? p.nameEn : p.name;

                return (
                  <div key={p.id} className="relative group rounded-xl overflow-hidden border border-stone-100">
                    <img src={p.image} alt={productAlt(p, locale)} loading="lazy" width={600} height={800} className="w-full aspect-[3/4] object-contain bg-stone-100" />
                    <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/40 transition-all flex items-center justify-center gap-2">
                      <button
                        onClick={() => { toggleWishlist(p.id); }}
                        className="bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-stone-100"
                        aria-label={t('wishlist.removed')}
                      >
                        <Heart size={16} className="fill-brand text-brand" />
                      </button>
                      <button
                        onClick={() => p.slug ? navigate(localizePath(`/product/${p.slug}`, locale)) : setCurrentPage('shop')}
                        className="bg-white text-stone-800 text-xs px-3 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-all font-medium"
                      >
                        {t('shop.viewDetails')}
                      </button>
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium text-stone-700 truncate">{productName}</p>
                      <p className="text-xs text-stone-500">{formatPrice(p.price)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
