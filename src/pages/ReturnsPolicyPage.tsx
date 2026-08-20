import { useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';
import SEO from '../components/SEO';

export default function ReturnsPolicyPage() {
  const { locale, t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 pb-16 min-h-screen bg-stone-50">
      <SEO title={t('seo.returnsTitle')} description={t('seo.returnsDescription')} />
      <div className="max-w-3xl mx-auto px-6 bg-white p-10 rounded-2xl shadow-sm">
        <h1 className="text-3xl font-bold mb-8 text-stone-800" style={{ fontFamily: "'Playfair Display', serif" }}>
          {locale === 'en' ? 'Returns & Exchanges' : 'Retourneren & Ruilen'}
        </h1>
        
        <div className="space-y-6 text-stone-600 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-3" style={{ fontFamily: "'Raleway', sans-serif" }}>
              {locale === 'en' ? 'Return Policy' : 'Retourbeleid'}
            </h2>
            <p>
              {locale === 'en' 
                ? 'We accept returns up to 14 days after delivery, if the item is unused and in its original condition, and we will refund the full order amount minus the shipping costs for the return.' 
                : 'Wij accepteren retouren tot 14 dagen na levering, mits het artikel ongebruikt en in de oorspronkelijke staat is, en we vergoeden het volledige bestelbedrag minus de verzendkosten voor de retour.'}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-3" style={{ fontFamily: "'Raleway', sans-serif" }}>
              {locale === 'en' ? 'Custom Made Items' : 'Artikelen op maat'}
            </h2>
            <p className="font-semibold text-stone-800">
              {locale === 'en' 
                ? 'Please note that custom-made items cannot be returned or exchanged.' 
                : 'Houd er rekening mee dat artikelen op maat niet kunnen worden geretourneerd of geruild.'}
            </p>
            <p className="mt-2">
              {locale === 'en'
                ? 'Because these items are tailored specifically to your measurements, we cannot restock or resell them. Please ensure your measurements are accurate before submitting your order.'
                : 'Omdat deze artikelen specifiek op uw maten zijn afgestemd, kunnen we ze niet terug in voorraad nemen of doorverkopen. Zorg ervoor dat uw maten nauwkeurig zijn voordat u uw bestelling plaatst.'}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-3" style={{ fontFamily: "'Raleway', sans-serif" }}>
              {locale === 'en' ? 'How to Return' : 'Hoe retourneert u een artikel'}
            </h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>{locale === 'en' ? 'Contact our customer service at maisontislit@gmail.com with your order number.' : 'Neem contact op met onze klantenservice via maisontislit@gmail.com met uw bestelnummer.'}</li>
              <li>{locale === 'en' ? 'Pack the item securely in its original packaging.' : 'Verpak het artikel veilig in de oorspronkelijke verpakking.'}</li>
              <li>{locale === 'en' ? 'Ship to the address provided by our support team.' : 'Verstuur naar het adres dat door ons supportteam is verstrekt.'}</li>
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
