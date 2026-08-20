import { useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';

export default function ShippingPolicyPage() {
  const { locale } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 pb-16 min-h-screen bg-stone-50">
      <div className="max-w-3xl mx-auto px-6 bg-white p-10 rounded-2xl shadow-sm">
        <h1 className="text-3xl font-bold mb-8 text-stone-800" style={{ fontFamily: "'Playfair Display', serif" }}>
          {locale === 'en' ? 'Shipping Policy' : 'Verzendbeleid'}
        </h1>
        
        <div className="space-y-6 text-stone-600 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-3" style={{ fontFamily: "'Raleway', sans-serif" }}>
              {locale === 'en' ? 'Processing Time' : 'Verwerkingstijd'}
            </h2>
            <p>
              {locale === 'en' 
                ? 'All orders are processed within 2 to 5 business days (excluding weekends and holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped.' 
                : 'Alle bestellingen worden verwerkt binnen 2 tot 5 werkdagen (exclusief weekends en feestdagen) na ontvangst van uw orderbevestigingsmail. U ontvangt een nieuwe melding zodra uw bestelling is verzonden.'}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-3" style={{ fontFamily: "'Raleway', sans-serif" }}>
              {locale === 'en' ? 'Domestic Shipping Rates and Estimates' : 'Nationale verzendtarieven en schattingen (Marokko)'}
            </h2>
            <p className="mb-2">
              {locale === 'en' 
                ? 'For calculated shipping rates: Shipping charges for your order will be calculated and displayed at checkout.' 
                : 'Voor berekende verzendtarieven: de verzendkosten van uw bestelling worden berekend en getoond bij het afrekenen.'}
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{locale === 'en' ? 'Standard Shipping (3-5 business days): 60 MAD' : 'Standaard verzending (3-5 werkdagen): 60 MAD'}</li>
              <li>{locale === 'en' ? 'Free Standard Shipping on orders over 2000 MAD' : 'Gratis standaard verzending voor bestellingen boven 2000 MAD'}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-3" style={{ fontFamily: "'Raleway', sans-serif" }}>
              {locale === 'en' ? 'International Shipping' : 'Internationale verzending'}
            </h2>
            <p className="mb-2">
              {locale === 'en'
                ? 'We offer international shipping to most countries in Europe (France, Belgium, Netherlands, etc.).'
                : 'Wij bieden internationale verzending naar de meeste landen in Europa (Frankrijk, België, Nederland, enz.).'}
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{locale === 'en' ? 'Flat Rate International Shipping: ~200 MAD' : 'Vast internationaal verzendtarief: ~200 MAD'}</li>
            </ul>
            <p className="mt-2 text-xs italic">
              {locale === 'en' 
                ? 'Your order may be subject to import duties and taxes (including VAT), which are incurred once a shipment reaches your destination country. Maison Tislit is not responsible for these charges if they are applied and are your responsibility as the customer.'
                : 'Uw bestelling kan onderworpen zijn aan invoerrechten en belastingen (inclusief btw), die worden geheven zodra een zending uw bestemmingsland bereikt. Maison Tislit is niet verantwoordelijk voor deze kosten als deze worden toegepast en deze zijn voor uw rekening als klant.'}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
