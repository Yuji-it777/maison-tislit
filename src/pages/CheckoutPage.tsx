import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';
import { createOrder, createOrderItems } from '../supabase/queries';
import { supabase } from '../supabase/client';

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const isDemoMode = !stripeKey || stripeKey === 'demo' || stripeKey === 'pk_test_REPLACE_WITH_YOUR_KEY';
const stripePromise = isDemoMode ? null : loadStripe(stripeKey);

const COUNTRIES = ['Maroc', 'France', 'Belgique', 'Suisse', 'Espagne', 'Italie', 'Allemagne', 'Pays-Bas', 'Royaume-Uni'];
const COUNTRIES_EN = ['Morocco', 'France', 'Belgium', 'Switzerland', 'Spain', 'Italy', 'Germany', 'Netherlands', 'United Kingdom'];
const CITIES = [
  'Casablanca', 'Rabat', 'Fès', 'Marrakech', 'Tanger', 'Agadir', 'Meknès',
  'Oujda', 'Kénitra', 'Tétouan', 'Salé', 'Témara', 'Nador', 'Khénifra', 'Béni Mellal',
];

type PaymentMethod = 'stripe' | 'cod';

/* ─────────── Inner Payment Form (uses Stripe hooks) ─────────── */
function StripePaymentForm({
  form, total, onBack, onSuccess, formatPrice,
}: {
  form: Record<string, string>;
  total: number;
  onBack: () => void;
  onSuccess: () => void;
  formatPrice: (price: number) => string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setStripeError(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      setStripeError(error.message || 'Payment failed.');
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          <span className="w-7 h-7 bg-brand text-white rounded-full flex items-center justify-center text-sm">2</span>
          {t('checkout.paymentMethod')}
        </h2>

        {/* Delivery recap */}
        <div className="bg-stone-50 rounded-xl p-4 mb-6 text-sm">
          <h3 className="font-semibold text-stone-700 mb-2">{t('checkout.deliveryAddress')}</h3>
          <p className="text-stone-600">{form.name}</p>
          <p className="text-stone-500">{form.address}, {form.city} {form.zip} {form.country && `• ${form.country}`}</p>
          <p className="text-stone-500">{form.phone}</p>
          <button type="button" onClick={onBack}
            className="text-xs text-brand hover:underline mt-2">
            {t('checkout.edit')}
          </button>
        </div>

        {/* Stripe Payment Element */}
        <div className="mb-6">
          <PaymentElement
            options={{
              layout: 'tabs',
              fields: { billingDetails: { address: 'never' } },
            }}
          />
        </div>

        {stripeError && (
          <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
            ⚠️ {stripeError}
          </p>
        )}

        <div className="flex gap-4">
          <button type="button" onClick={onBack}
            className="border border-stone-300 text-stone-600 px-6 py-3 text-sm rounded hover:bg-stone-50 transition-colors">
            {t('checkout.back')}
          </button>
          <button type="submit" disabled={loading || !stripe}
            className="flex-1 bg-brand hover:bg-brand disabled:opacity-50 text-white py-4 text-sm tracking-widest uppercase rounded transition-colors flex items-center justify-center gap-2">
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t('checkout.processing')}
              </>
            ) : (
              `${t('checkout.confirmOrder')} ${formatPrice(total)}`
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

/* ─────────── Main Checkout Page ─────────── */
export default function CheckoutPage() {
  const { cart, cartTotal, user, clearCart, setCurrentPage, setOrderPlaced, setOrderDetails, showToast, formatPrice } = useApp();
  const { t, locale } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!user) navigate('/login', { replace: true });
  }, [user, navigate]);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    country: '',
    city: '',
    zip: '',
    note: '',
  });

  const isMorocco = form.country === 'Maroc' || form.country === 'Morocco';
  const shipping = isMorocco ? (cartTotal >= 2000 ? 0 : 60) : 200;
  const codFee = Math.round(cartTotal * 0.05);
  const total = cartTotal + shipping + (paymentMethod === 'cod' ? codFee : 0);

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  /* Create order in DB after successful payment */
  const handleOrderSuccess = async () => {
    setLoading(true);
    try {
      const order = await createOrder({
        user_id: user?.id || '',
        total,
        address: form.address,
        city: form.city,
        phone: form.phone,
        payment_method: paymentMethod || 'stripe',
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
      })));
      setOrderDetails({ name: form.name, address: form.address, city: form.city, phone: form.phone });
      setOrderPlaced(true);
      clearCart();
      setCurrentPage('confirmation');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la commande', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* Move to step 2 */
  const handleContinueToPayment = async () => {
    if (!form.name || !form.phone || !form.address || !form.country || !form.city) return;
    setPaymentMethod(null);
    setStep(2);
  };

  /* User selects Stripe → create PaymentIntent */
  const handleChooseStripe = async () => {
    if (isDemoMode) {
      showToast(t('checkout.demoDisabled') || 'This is a demo environment — checkout is disabled', 'info');
      return;
    }
    if (!stripePromise) {
      showToast(t('checkout.stripeNotAvailable') || 'Stripe is not configured', 'error');
      return;
    }
    setPaymentMethod('stripe');
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { amount: Math.round(total * 100), currency: 'eur' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setClientSecret(data.clientSecret);
    } catch (err: any) {
      showToast(err.message || 'Impossible de créer la session de paiement', 'error');
      setPaymentMethod(null);
    } finally {
      setLoading(false);
    }
  };

  /* User selects COD → confirm immediately */
  const handleChooseCod = () => {
    setPaymentMethod('cod');
  };

  const inputClass = 'w-full border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand transition-all';

  return (
    <div className="pt-20 min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-stone-800 text-white py-12 px-6 text-center">
        <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
          {t('checkout.title')}
        </h1>
        <div className="flex items-center justify-center gap-2 mt-4">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
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
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                <span className="w-7 h-7 bg-brand text-white rounded-full flex items-center justify-center text-sm">1</span>
                {t('checkout.deliveryInfo')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">{t('checkout.fullName')}</label>
                  <input value={form.name} onChange={e => update('name', e.target.value)} required className={inputClass} placeholder={t('checkout.namePlaceholder')} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">{t('checkout.email')}</label>
                  <input type="email" value={form.email} onChange={e => update('email', e.target.value)} required className={inputClass} placeholder={t('checkout.emailPlaceholder')} />
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
                    {(locale === 'fr' ? COUNTRIES : COUNTRIES_EN).map(c => <option key={c} value={c}>{c}</option>)}
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
                  className="border border-stone-300 text-stone-600 px-6 py-3 text-sm rounded hover:bg-stone-50 transition-colors">
                  {t('checkout.backToCart')}
                </button>
                <button
                  type="button"
                  onClick={handleContinueToPayment}
                  disabled={loading || !form.name || !form.phone || !form.address || !form.country || !form.city}
                  className="flex-1 bg-stone-800 hover:bg-brand disabled:opacity-50 text-white py-3 text-sm tracking-widest uppercase rounded transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Préparation...
                    </>
                  ) : t('checkout.continueToPayment')}
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Payment */}
          {step === 2 && (
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                <span className="w-7 h-7 bg-brand text-white rounded-full flex items-center justify-center text-sm">2</span>
                {t('checkout.paymentMethod')}
              </h2>

              {/* Delivery recap */}
              <div className="bg-stone-50 rounded-xl p-4 mb-6 text-sm">
                <h3 className="font-semibold text-stone-700 mb-2">{t('checkout.deliveryAddress')}</h3>
                <p className="text-stone-600">{form.name}</p>
                <p className="text-stone-500">{form.address}, {form.city} {form.zip} {form.country && `• ${form.country}`}</p>
                <p className="text-stone-500">{form.phone}</p>
                <button type="button" onClick={() => setStep(1)}
                  className="text-xs text-brand hover:underline mt-2">
                  {t('checkout.edit')}
                </button>
              </div>

              {paymentMethod === null && (
                <>
                  {isDemoMode ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6 text-center">
                      <p className="text-base font-semibold text-amber-900 mb-1">
                        {t('checkout.demoDisabled') || 'This is a demo environment — checkout is disabled'}
                      </p>
                      <p className="text-xs text-amber-700">
                        {t('checkout.demoDisabledHint') || 'Payment is unavailable in this demo deployment. Browse the catalog and explore the admin dashboard instead.'}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Payment method selection */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <button
                          onClick={handleChooseStripe}
                          disabled={loading}
                          className="border-2 border-stone-200 hover:border-brand rounded-xl p-5 text-left transition-all disabled:opacity-50 text-center"
                        >
                          <div className="flex justify-center mb-3">
                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor" color="#635bff">
                              <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
                            </svg>
                          </div>
                          <p className="text-sm font-semibold text-stone-800">{t('checkout.card')}</p>
                          <p className="text-xs text-stone-500 mt-1">{t('checkout.cardDesc')}</p>
                        </button>

                        <button
                          onClick={handleChooseCod}
                          className="border-2 border-stone-200 hover:border-brand rounded-xl p-5 text-left transition-all text-center"
                        >
                          <div className="flex justify-center mb-3">
                            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125V9.75M3.75 6v9m0 0h18" />
                            </svg>
                          </div>
                          <p className="text-sm font-semibold text-stone-800">{t('checkout.cod')}</p>
                          <p className="text-xs text-stone-500 mt-1">{t('checkout.codDesc')}</p>
                        </button>
                      </div>
                    </>
                  )}

                  <div className="flex gap-4">
                    <button type="button" onClick={() => setStep(1)}
                      className="border border-stone-300 text-stone-600 px-6 py-3 text-sm rounded hover:bg-stone-50 transition-colors">
                      {t('checkout.back')}
                    </button>
                  </div>
                </>
              )}

              {/* Stripe Payment */}
              {paymentMethod === 'stripe' && clientSecret && (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#92400e',
                        colorBackground: '#ffffff',
                        colorText: '#1c1917',
                        fontFamily: "'Raleway', sans-serif",
                        borderRadius: '8px',
                      },
                    },
                  }}
                >
                  <StripePaymentForm
                    form={form}
                    total={total}
                    onBack={() => { setPaymentMethod(null); setClientSecret(null); }}
                    onSuccess={handleOrderSuccess}
                    formatPrice={formatPrice}
                  />
                </Elements>
              )}

              {/* Stripe loading */}
              {paymentMethod === 'stripe' && !clientSecret && (
                <div className="flex items-center justify-center h-48">
                  <svg className="w-8 h-8 animate-spin text-brand" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              )}

              {/* COD Confirmation */}
              {paymentMethod === 'cod' && (
                <div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-2 text-emerald-700 font-medium text-sm mb-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t('checkout.cod')}
                    </div>
                    <p className="text-xs text-emerald-600">{t('checkout.codInfo')}</p>
                  </div>

                  <div className="border-t border-stone-100 pt-4 space-y-2 text-sm mb-6">
                    <div className="flex justify-between text-stone-500">
                      <span>{t('checkout.subtotal')}</span><span>{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-stone-500">
                      <span>{t('checkout.shipping')}</span>
                      <span className={shipping === 0 ? 'text-emerald-600 font-medium' : ''}>
                        {shipping === 0 ? t('checkout.free') : formatPrice(shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between text-stone-500">
                      <span>Frais COD (5%)</span><span>{formatPrice(codFee)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-stone-900 text-base pt-2 border-t border-stone-100">
                      <span>{t('checkout.total')}</span><span>{formatPrice(total)}</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button type="button" onClick={() => setPaymentMethod(null)}
                      className="border border-stone-300 text-stone-600 px-6 py-3 text-sm rounded hover:bg-stone-50 transition-colors">
                      {t('checkout.back')}
                    </button>
                    <button
                      type="button"
                      onClick={handleOrderSuccess}
                      disabled={loading}
                      className="flex-1 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white py-4 text-sm tracking-widest uppercase rounded transition-colors flex items-center justify-center gap-2"
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
                        `${t('checkout.confirmOrder')} ${formatPrice(total)}`
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-28">
            <h2 className="text-lg font-bold text-stone-800 mb-5 pb-4 border-b border-stone-100"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              {t('checkout.summary')}
            </h2>
            <div className="space-y-4 mb-5">
              {cart.map(item => (
                <div key={`${item.id}-${item.selectedSize}`} className="flex gap-3">
                  <img src={item.image} alt={item.name} loading="lazy" width={56} height={64} className="w-14 h-16 object-cover rounded-lg flex-shrink-0" />
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
              {paymentMethod === 'cod' && (
                <div className="flex justify-between text-stone-500">
                  <span>COD (5%)</span><span>{formatPrice(codFee)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-stone-900 text-base pt-2 border-t border-stone-100">
                <span>{t('checkout.total')}</span><span>{formatPrice(total)}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-stone-400 text-xs">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
              </svg>
              Powered by Stripe — Secure payment
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
