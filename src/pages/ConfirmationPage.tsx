import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';
import { WHATSAPP_LINK } from '../config';

export default function ConfirmationPage() {
  const { setCurrentPage, orderDetails } = useApp();
  const { t } = useTranslation();
  const [fallbackOrderNumber] = useState(() => `MT-${Date.now().toString().slice(-6)}`);
  const orderNumber = orderDetails?.id ? `MT-${String(orderDetails.id).padStart(6, '0')}` : fallbackOrderNumber;
  const whatsappUrl = orderDetails?.whatsappUrl || WHATSAPP_LINK();
  const customerName = orderDetails?.name?.split(' ')[0];

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
              {t('confirmation.thanks')}{customerName}
            </p>
          </div>

          <div className="p-8">
            <div className="text-center mb-8 p-5 bg-brand rounded-xl border border-brand">
              <p className="text-xs text-black uppercase tracking-widest mb-1">{t('confirmation.orderNumber')}</p>
              <p className="text-2xl font-bold text-black" style={{ fontFamily: "'Playfair Display', serif" }}>{orderNumber}</p>
              <p className="text-xs text-black mt-2">{t('confirmation.saveNumber')}</p>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 rounded-lg mb-6 flex items-center justify-center gap-2 text-sm tracking-widest uppercase font-medium transition-colors"
            >
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {t('confirmation.sendViaWhatsApp')}
            </a>
            <p className="text-center text-xs text-stone-400 mb-8">{t('confirmation.whatsappHint')}</p>

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
              <p>{t('confirmation.whatsappNote')}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setCurrentPage('shop')}
                className="flex-1 bg-stone-800 hover:bg-brand text-white py-4 text-sm tracking-widest uppercase rounded-lg transition-colors font-medium"
              >
                {t('confirmation.continueShopping')}
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 border-2 border-[#25D366] text-[#128C7E] hover:bg-[#25D366]/10 py-4 text-sm tracking-widest uppercase rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {t('confirmation.openWhatsApp')}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-stone-500 text-sm">
          {t('confirmation.support')}
          <a href="mailto:maisontislit@gmail.com" className="text-brand font-medium">maisontislit@gmail.com</a>
          <a href={WHATSAPP_LINK()} target="_blank" rel="noopener noreferrer" className="text-[#128C7E] font-medium hover:underline">
            {t('confirmation.orWhatsApp')}
          </a>
        </div>
      </div>
    </div>
  );
}