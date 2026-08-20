import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';
import SEO from '../components/SEO';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, setCurrentPage, formatPrice, calculateShipping } = useApp();
  const { t, locale } = useTranslation();

  if (cart.length === 0) {
    return (
      <div className="pt-20 min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <SEO title={t('seo.cartTitle')} description={t('seo.cartDescription')} />
        <div className="text-center">
          <div className="text-6xl mb-6">/</div>
          <h2 className="text-3xl font-bold text-stone-800 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            {t('cart.emptyTitle')}
          </h2>
          <p className="text-stone-500 mb-8" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem' }}>
            {t('cart.emptyText')}
          </p>
          <button
            onClick={() => setCurrentPage('shop')}
            className="bg-stone-800 hover:bg-brand text-white px-10 py-4 text-sm tracking-widest uppercase transition-colors"
          >
            {t('cart.seeShop')}
          </button>
        </div>
      </div>
    );
  }

  const shipping = calculateShipping(cartTotal);
  const total = cartTotal + shipping;

  return (
    <div className="pt-20 min-h-screen bg-stone-50">
      <SEO title={t('seo.cartTitle')} description={t('seo.cartDescription')} />
      <div className="bg-stone-800 text-white py-12 px-6 text-center">
        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{t('cart.myCart')}</h1>
        <p className="text-stone-300 text-sm">{cart.length} {cart.length > 1 ? t('cart.items') : t('cart.item')}</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          {cart.map(item => (
            <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
              className="bg-white rounded-xl overflow-hidden shadow-sm flex gap-0">
              <div className="w-28 sm:w-36 flex-shrink-0">
                <img src={item.image} alt={item.name} loading="lazy" width={224} height={280} className="w-full h-full object-cover" style={{ minHeight: 140 }} />
              </div>
              <div className="flex-1 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-brand text-xs tracking-wider uppercase capitalize" style={{ fontFamily: "'Raleway', sans-serif" }}>
                        {item.category}
                      </span>
                      <h3 className="text-stone-800 font-semibold text-base leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {item.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                      className="text-stone-300 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded">{t('cart.size')} {item.selectedSize}</span>
                    <span className="text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded">{t('cart.color')} {item.selectedColor}</span>
                  </div>
                  {item.customMeasurements && (
                    <div className="mt-2 text-[10px] text-stone-500 bg-stone-50 p-2 rounded border border-stone-100">
                      <span className="font-semibold block mb-1">{locale === 'en' ? 'Custom measurements (cm):' : 'Maten op maat (cm):'}</span>
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        <span>{locale === 'en' ? 'Shoulders' : 'Schouders'}: {item.customMeasurements.shoulders}</span>
                        <span>{locale === 'en' ? 'Bust' : 'Borst'}: {item.customMeasurements.bust}</span>
                        <span>{locale === 'en' ? 'Waist' : 'Taille'}: {item.customMeasurements.waist}</span>
                        <span>{locale === 'en' ? 'Hips' : 'Heupen'}: {item.customMeasurements.hips}</span>
                        <span>{locale === 'en' ? 'Length' : 'Lengte'}: {item.customMeasurements.length}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center border border-stone-200 rounded overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-100"
                    >−</button>
                    <span className="w-8 text-center text-sm font-semibold text-stone-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-100"
                    >+</button>
                  </div>
                  <span className="text-stone-800 font-bold text-lg">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-28">
            <h2 className="text-xl font-bold text-stone-800 mb-6 pb-4 border-b border-stone-100" style={{ fontFamily: "'Playfair Display', serif" }}>
              {t('cart.orderSummary')}
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-stone-600">
                <span>{t('cart.subtotal')}</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-stone-600">
                <span>{t('cart.shipping')}</span>
                <span className={shipping === 0 ? 'text-emerald-600 font-medium' : ''}>
                  {shipping === 0 ? t('cart.free') : formatPrice(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-white bg-brand p-2 rounded">
                  {t('cart.freeShippingNote')}
                </p>
              )}
            </div>

            <div className="border-t border-stone-200 pt-4 mb-8">
              <div className="flex justify-between font-bold text-lg text-stone-900">
                <span>{t('cart.total')}</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button
              onClick={() => setCurrentPage('checkout')}
              className="w-full bg-brand hover:bg-brand text-white py-4 text-sm tracking-widest uppercase font-medium transition-all duration-300 rounded hover:shadow-lg mb-3"
            >
              {t('cart.checkout')}
            </button>

            <button
              onClick={() => setCurrentPage('shop')}
              className="w-full border border-stone-300 text-stone-600 hover:border-stone-500 py-3 text-xs tracking-widest uppercase transition-colors rounded"
            >
              {t('cart.continueShopping')}
            </button>

            <div className="mt-6 flex items-center justify-center gap-3 text-stone-400 text-xs">
              <span>{t('cart.orderViaWhatsApp')}</span>
              <span>•</span>
              <span>{t('cart.shippingMorocco')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
