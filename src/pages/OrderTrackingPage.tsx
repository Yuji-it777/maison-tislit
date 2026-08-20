import { useState } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { supabase } from '../supabase/client';
import { useApp } from '../context/AppContext';
import SEO from '../components/SEO';
import { CheckCircle, Package, Truck, MapPin, Clock, XCircle } from 'lucide-react';

const STEPS = ['pending', 'processing', 'shipped', 'delivered'] as const;
type Step = typeof STEPS[number];

function StepIcon({ step, active, completed }: { step: Step; active: boolean; completed: boolean }) {
  const icons: Record<Step, React.ReactNode> = {
    pending: <Clock size={20} />,
    processing: <Package size={20} />,
    shipped: <Truck size={20} />,
    delivered: <MapPin size={20} />,
  };
  return (
    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
      completed
        ? 'bg-brand border-brand text-white'
        : active
        ? 'border-brand text-brand bg-amber-50'
        : 'border-stone-200 text-stone-300 bg-white'
    }`}>
      {completed ? <CheckCircle size={20} /> : icons[step]}
    </div>
  );
}

export default function OrderTrackingPage() {
  const { t, locale } = useTranslation();
  const { formatPrice } = useApp();
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const { data: orderData, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (fetchError || !orderData) throw new Error('Order not found');

      let emailMatches = false;
      if (orderData.user_id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', orderData.user_id)
          .single();
        emailMatches = !!profileData && profileData.email === email;
      }
      if (!emailMatches && orderData.customer_email !== email) {
        throw new Error('Email does not match');
      }

      setOrder(orderData);
    } catch (err: any) {
      setError(locale === 'en' ? 'Order not found. Please check your ID and email.' : 'Bestelling niet gevonden. Controleer uw nummer en e-mail.');
    } finally {
      setLoading(false);
    }
  };

  const statusMap: Record<string, string> = {
    pending: locale === 'en' ? 'Pending' : 'In afwachting',
    processing: locale === 'en' ? 'Processing' : 'In behandeling',
    shipped: locale === 'en' ? 'Shipped' : 'Verzonden',
    delivered: locale === 'en' ? 'Delivered' : 'Geleverd',
    cancelled: locale === 'en' ? 'Cancelled' : 'Geannuleerd'
  };

  return (
    <div className="pt-20 min-h-screen bg-stone-50 flex flex-col items-center py-16 px-6">
      <SEO title={t('seo.trackingTitle')} description={t('seo.trackingDescription')} />
      <div className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
        <h1 className="text-3xl font-bold text-center mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          {locale === 'en' ? 'Track Your Order' : 'Bestelling Volgen'}
        </h1>
        <p className="text-center text-stone-500 mb-8 text-sm">
          {locale === 'en' ? 'Enter your order ID and email to see the current status.' : 'Voer uw bestelnummer en e-mail in om de huidige status te zien.'}
        </p>

        <form onSubmit={handleTrack} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
              {locale === 'en' ? 'Order ID' : 'Bestelnummer'}
            </label>
            <input 
              type="text" 
              required
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand"
              placeholder="Ex: 123"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
              {t('checkout.email')}
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand"
              placeholder="Ex: you@example.com"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-stone-800 hover:bg-brand text-white py-3 rounded-lg text-sm tracking-widest uppercase font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? '...' : (locale === 'en' ? 'Track Order' : 'Bestelling volgen')}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-600 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        {order && (
          <div className="mt-8 border-t border-stone-100 pt-8">
            <h3 className="text-lg font-bold mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
              {locale === 'en' ? 'Order Details' : 'Besteldetails'} #{order.id}
            </h3>

            {/* Visual stepper */}
            {order.status !== 'cancelled' ? (
              <div className="mb-8">
                <div className="flex items-center justify-between relative">
                  {/* Connector line */}
                  <div className="absolute top-5 left-5 right-5 h-0.5 bg-stone-200" />
                  <div
                    className="absolute top-5 left-5 h-0.5 bg-brand transition-all duration-500"
                    style={{
                      width: `${(STEPS.indexOf(order.status as Step) / (STEPS.length - 1)) * 100}%`,
                    }}
                  />
                  {STEPS.map((step, i) => {
                    const currentIdx = STEPS.indexOf(order.status as Step);
                    const completed = i < currentIdx;
                    const active = i === currentIdx;
                    return (
                      <div key={step} className="relative z-10 flex flex-col items-center gap-1.5">
                        <StepIcon step={step} active={active} completed={completed} />
                        <span className={`text-[10px] tracking-wider uppercase font-medium ${active || completed ? 'text-brand' : 'text-stone-400'}`}>
                          {statusMap[step] || step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mb-8 flex items-center justify-center gap-3 p-4 bg-red-50 rounded-lg">
                <XCircle size={22} className="text-red-500" />
                <span className="text-red-600 font-semibold text-sm">{statusMap.cancelled}</span>
              </div>
            )}

            {/* Details grid */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between p-3 bg-stone-50 rounded">
                <span className="text-stone-500">{locale === 'en' ? 'Status' : 'Status'}</span>
                <span className="font-bold text-brand">{statusMap[order.status] || order.status}</span>
              </div>
              <div className="flex justify-between p-3 bg-stone-50 rounded">
                <span className="text-stone-500">{locale === 'en' ? 'Date' : 'Date'}</span>
                <span>{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between p-3 bg-stone-50 rounded">
                <span className="text-stone-500">{locale === 'en' ? 'Total' : 'Total'}</span>
                <span className="font-semibold">{formatPrice(order.total)}</span>
              </div>
            </div>
            {order.status === 'shipped' && (
              <div className="mt-4 p-4 bg-blue-50 text-blue-700 text-sm rounded text-center">
                {locale === 'en' ? 'Your order is on the way! It should arrive soon.' : 'Uw bestelling is onderweg! Deze zou spoedig moeten aankomen.'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
