import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';

export default function ConfirmationPage() {
  const { setCurrentPage, orderDetails, user } = useApp();
  const { t } = useTranslation();
  const orderNumber = `MT-${Date.now().toString().slice(-6)}`;

  return (
    <div className="pt-20 min-h-screen bg-stone-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 p-10 text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              {t('confirmation.title')}
            </h1>
            <p className="text-emerald-100 text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {t('confirmation.thanks')}{user?.name?.split(' ')[0]}
            </p>
          </div>

          <div className="p-8">
            <div className="text-center mb-8 p-5 bg-brand rounded-xl border border-brand">
              <p className="text-xs text-black uppercase tracking-widest mb-1">{t('confirmation.orderNumber')}</p>
              <p className="text-2xl font-bold text-black" style={{ fontFamily: "'Playfair Display', serif" }}>{orderNumber}</p>
              <p className="text-xs text-black mt-2">{t('confirmation.saveNumber')}</p>
            </div>

            {orderDetails && (
              <div className="bg-stone-50 rounded-xl p-5 mb-8">
                <h3 className="font-semibold text-stone-700 text-sm uppercase tracking-wider mb-4">{t('confirmation.deliveryTo')}</h3>
                <div className="space-y-1.5 text-sm">
                  <div className="flex gap-2">
                    <span className="text-stone-400 w-20">{t('confirmation.name')}</span>
                    <span className="text-stone-700 font-medium">{orderDetails.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-stone-400 w-20">{t('confirmation.address')}</span>
                    <span className="text-stone-700 font-medium">{orderDetails.address}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-stone-400 w-20">{t('confirmation.city')}</span>
                    <span className="text-stone-700 font-medium">{orderDetails.city}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-stone-400 w-20">{t('confirmation.phone')}</span>
                    <span className="text-stone-700 font-medium">{orderDetails.phone}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-8">
              <h3 className="font-semibold text-stone-700 text-sm uppercase tracking-wider mb-4">{t('confirmation.tracking')}</h3>
              <div className="space-y-3">
                {[
                  { status: '\u2713', labelKey: 'confirmation.orderReceived', timeKey: 'confirmation.now', done: true },
                  { status: '\u23F3', labelKey: 'confirmation.preparing', timeKey: 'confirmation.h24_48', done: false },
                  { status: '\u27A1', labelKey: 'confirmation.inDelivery', timeKey: 'confirmation.h2_5', done: false },
                  { status: '\u25A0', labelKey: 'confirmation.delivered', timeKey: 'confirmation.dependingOnCity', done: false },
                ].map((step, i) => (
                  <div key={i} className={`flex items-center gap-4 p-3 rounded-lg ${step.done ? 'bg-emerald-50' : 'bg-stone-50'}`}>
                    <span className="text-2xl">{step.status}</span>
                    <div>
                      <p className={`text-sm font-medium ${step.done ? 'text-emerald-700' : 'text-stone-600'}`}>{t(step.labelKey)}</p>
                      <p className="text-xs text-stone-400">{t(step.timeKey)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mb-8 text-sm text-stone-500 bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p>{t('confirmation.emailNote')}<strong className="text-stone-700">{user?.email}</strong></p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setCurrentPage('shop')}
                className="flex-1 bg-stone-800 hover:bg-brand text-white py-4 text-sm tracking-widest uppercase rounded-lg transition-colors font-medium"
              >
                {t('confirmation.continueShopping')}
              </button>
              <button
                onClick={() => setCurrentPage('account')}
                className="flex-1 border border-stone-300 text-stone-600 hover:border-stone-500 py-4 text-sm tracking-widest uppercase rounded-lg transition-colors"
              >
                {t('confirmation.viewAccount')}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-stone-500 text-sm">
          {t('confirmation.support')}
          <span className="text-brand font-medium">maisontislit@gmail.com</span>
          {t('confirmation.orWhatsApp')}
        </div>
      </div>
    </div>
  );
}
