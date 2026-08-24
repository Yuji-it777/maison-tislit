import { useState, FormEvent } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';
import { createOrder, createOrderItems } from '../supabase/queries';
import { buildWhatsAppOrderUrl } from '../utils/whatsappOrder';
import { productAlt } from '../utils/productAlt';
import SEO from '../components/SEO';

const COUNTRIES_NL = ['Marokko', 'Frankrijk', 'België', 'Zwitserland', 'Spanje', 'Italië', 'Duitsland', 'Nederland', 'Verenigd Koninkrijk'];
const COUNTRIES_EN = ['Morocco', 'France', 'Belgium', 'Switzerland', 'Spain', 'Italy', 'Germany', 'Netherlands', 'United Kingdom'];
const CITIES = [
  'Casablanca', 'Rabat', 'Fès', 'Marrakech', 'Tanger', 'Agadir', 'Meknès',
  'Oujda', 'Kénitra', 'Tétouan', 'Salé', 'Témara', 'Nador', 'Khénifra', 'Béni Mellal',
];

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart, setCurrentPage, setOrderPlaced, setOrderDetails, showToast, formatPrice, formatShipping } = useApp();
  const { t, locale } = useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    country: '',
    city: '',
    zip: '',
    note: '',
  });

  const isMorocco = form.country === 'Maroc' || form.country === 'Morocco';
  const shipping = isMorocco ? (cartTotal >= 2000 ? 0 : 60) : 200;
  const total = cartTotal + shipping;

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  /* Create order in DB, then open WhatsApp with the pre-filled order message */
  const handleOrderSuccess = async () => {
    setLoading(true);
    const popup = window.open('', '_blank');
    try {
      const order = await createOrder({
        user_id: null,
        customer_name: form.name,
        customer_email: form.email,
        total,
        address: form.address,
        city: form.city,
        phone: form.phone,
        payment_method: 'whatsapp',
        note: form.note,
      });
      await createOrderItems(cart.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
        size: item.selectedSize,
        color: item.selectedColor,
        custom_measurements: item.customMeasurements ? JSON.stringify(item.customMeasurements) : null,
      })));

      const whatsappUrl = buildWhatsAppOrderUrl({
        orderId: order.id,
        cart,
        form,
        subtotal: cartTotal,
        shipping,
        total,
        formatPrice,
        locale,
      });

      if (popup) popup.location.href = whatsappUrl;
      else window.open(whatsappUrl, '_blank');

      setOrderDetails({ id: order.id, name: form.name, email: form.email, address: form.address, city: form.city, phone: form.phone, whatsappUrl });
      setOrderPlaced(true);
      clearCart();
      setCurrentPage('confirmation');
    } catch (err: any) {
      if (popup) popup.close();
      showToast(err.message || 'Erreur lors de la commande', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* Move to step 2 */
  const handleContinueToReview = (e: FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const inputClass = 'w-full border border-stone-200 px-4 py-3 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand transition-all';

  return (
    <div className="pt-20 min-h-screen bg-stone-50">
      <SEO noindex />
      {/* Header */}
      <div className="bg-stone-800 text-white py-12 px-6 text-center">
        <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: "'Cinzel', serif" }}>
          {t('checkout.title')}
        </h1>
        <div className="flex items-center justify-center gap-2 mt-4">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 flex items-center justify-center text-xs font-bold transition-all
                ${step >= s ? 'bg-brand text-white' : 'bg-stone-600 text-stone-400'}`}>
                {s}
              </div>
              <span className={`text-xs ${step >= s ? 'text-brand' : 'text-stone-500'}`}>
                {s === 1 ? t('checkout.step1') : t('checkout.step2')}
              </span>
              {s < 2 && <div className="w-12 h-px bg-stone-600 mx-1" />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Steps */}
        <div className="lg:col-span-2">
          {/* Step 1 — Delivery */}
          {step === 1 && (
            <form onSubmit={handleContinueToReview} className="bg-white p-8">
              <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2"
                style={{ fontFamily: "'Cinzel', serif" }}>
                <span className="w-7 h-7 bg-brand text-white flex items-center justify-center text-sm">1</span>
                {t('checkout.deliveryInfo')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">{t('checkout.fullName')}</label>
                  <input value={form.name} onChange={e => update('name', e.target.value)} required className={inputClass} placeholder={t('checkout.namePlaceholder')} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">{t('checkout.email')}</label>
                  <input type="email" value={form.email} onChange={e => update('email', e.target.value)} className={inputClass} placeholder={t('checkout.emailPlaceholder')} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">{t('checkout.phone')}</label>
                  <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} required className={inputClass} placeholder={t('checkout.phonePlaceholder')} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">{t('checkout.address')}</label>
                  <input value={form.address} onChange={e => update('address', e.target.value)} required className={inputClass} placeholder={t('checkout.addressPlaceholder')} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">{t('checkout.country')}</label>
                  <select value={form.country} onChange={e => update('country', e.target.value)} required className={inputClass}>
                    <option value="">{t('checkout.countryPlaceholder')}</option>
                    {(locale === 'nl' ? COUNTRIES_NL : COUNTRIES_EN).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">{t('checkout.city')}</label>
                  {isMorocco ? (
                    <select value={form.city} onChange={e => update('city', e.target.value)} required className={inputClass}>
                      <option value="">{t('checkout.cityPlaceholder')}</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  ) : (
                    <input value={form.city} onChange={e => update('city', e.target.value)} required className={inputClass} placeholder={t('checkout.cityPlaceholder')} />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">{t('checkout.zipCode')}</label>
                  <input value={form.zip} onChange={e => update('zip', e.target.value)} className={inputClass} placeholder={t('checkout.zipPlaceholder')} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">{t('checkout.orderNote')}</label>
                  <textarea value={form.note} onChange={e => update('note', e.target.value)} rows={3}
                    className={inputClass + ' resize-none'} placeholder={t('checkout.notePlaceholder')} />
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button type="button" onClick={() => setCurrentPage('cart')}
                  className="border border-stone-300 text-stone-600 px-6 py-3 text-sm hover:bg-stone-50 transition-colors">
                  {t('checkout.backToCart')}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-stone-800 hover:bg-brand text-white py-3 text-sm tracking-widest uppercase transition-colors"
                >
                  {t('checkout.continueToPayment')}
                </button>
              </div>
            </form>
          )}

          {/* Step 2 — Review & WhatsApp */}
          {step === 2 && (
            <div className="bg-white p-8">
              <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2"
                style={{ fontFamily: "'Cinzel', serif" }}>
                <span className="w-7 h-7 bg-brand text-white flex items-center justify-center text-sm">2</span>
                {t('checkout.step2')}
              </h2>

              {/* Delivery recap */}
              <div className="bg-stone-50 p-4 mb-6 text-sm">
                <h3 className="font-semibold text-stone-700 mb-2">{t('checkout.deliveryAddress')}</h3>
                <p className="text-stone-600">{form.name}</p>
                <p className="text-stone-500">{form.address}, {form.city} {form.zip} {form.country && `• ${form.country}`}</p>
                <p className="text-stone-500">{form.phone}</p>
                <button type="button" onClick={() => setStep(1)}
                  className="text-xs text-brand hover:underline mt-2">
                  {t('checkout.edit')}
                </button>
              </div>

              {/* Order items recap */}
              <div className="border-t border-stone-100 pt-4 mb-6 space-y-3">
                {cart.map(item => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex items-center gap-3 text-sm">
                    <img src={item.image} alt={productAlt(item, locale)} loading="lazy" width={48} height={56} className="w-12 h-14 object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-stone-700 truncate">{item.name}</p>
                      <p className="text-xs text-stone-400">{item.selectedSize} • {item.selectedColor} × {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-stone-800">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-stone-100 pt-4 space-y-2 text-sm mb-6">
                <div className="flex justify-between text-stone-500">
                  <span>{t('checkout.subtotal')}</span><span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>{t('checkout.shipping')}</span>
                  <span className={shipping === 0 ? 'text-emerald-600 font-medium' : ''}>
                    {shipping === 0 ? t('checkout.free') : formatShipping(shipping)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-stone-900 text-base pt-2 border-t border-stone-100">
                  <span>{t('checkout.total')}</span><span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* WhatsApp confirmation */}
              <div className="bg-brand/10 border border-brand/40 p-5 mb-6">
                <div className="flex items-center gap-2 text-[#45381e] font-medium text-sm mb-1">
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {t('checkout.whatsappTitle')}
                </div>
                <p className="text-xs text-[#45381e]">{t('checkout.whatsappHint')}</p>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(1)}
                  className="border border-stone-300 text-stone-600 px-6 py-3 text-sm hover:bg-stone-50 transition-colors">
                  {t('checkout.back')}
                </button>
                <button
                  type="button"
                  onClick={handleOrderSuccess}
                  disabled={loading}
                  className="flex-1 bg-brand hover:bg-brand-dark disabled:opacity-50 text-white py-4 text-sm tracking-widest uppercase transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {t('checkout.processing')}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      {t('checkout.sendViaWhatsApp')}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 sticky top-28">
            <h2 className="text-lg font-bold text-stone-800 mb-5 pb-4 border-b border-stone-100"
              style={{ fontFamily: "'Cinzel', serif" }}>
              {t('checkout.summary')}
            </h2>
            <div className="space-y-4 mb-5">
              {cart.map(item => (
                <div key={`${item.id}-${item.selectedSize}`} className="flex gap-3">
                  <img src={item.image} alt={productAlt(item, locale)} loading="lazy" width={56} height={64} className="w-14 h-16 object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-stone-700 truncate">{item.name}</p>
                    <p className="text-xs text-stone-400">{item.selectedSize} • {item.selectedColor}</p>
                    <p className="text-xs text-stone-400">Qté: {item.quantity}</p>
                    <p className="text-sm font-bold text-stone-800">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-stone-500">
                <span>{t('checkout.subtotal')}</span><span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>{t('checkout.shipping')}</span>
                <span className={shipping === 0 ? 'text-emerald-600 font-medium' : ''}>
                  {shipping === 0 ? t('checkout.free') : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-stone-900 text-base pt-2 border-t border-stone-100">
                <span>{t('checkout.total')}</span><span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}