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
          {locale === 'en' ? 'Shipping Policy' : 'Politique de Livraison'}
        </h1>
        
        <div className="space-y-6 text-stone-600 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-3" style={{ fontFamily: "'Raleway', sans-serif" }}>
              {locale === 'en' ? 'Processing Time' : 'Délai de traitement'}
            </h2>
            <p>
              {locale === 'en' 
                ? 'All orders are processed within 2 to 5 business days (excluding weekends and holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped.' 
                : 'Toutes les commandes sont traitées dans un délai de 2 à 5 jours ouvrés (hors week-ends et jours fériés) après réception de l\'e-mail de confirmation de votre commande. Vous recevrez une autre notification lorsque votre commande aura été expédiée.'}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-3" style={{ fontFamily: "'Raleway', sans-serif" }}>
              {locale === 'en' ? 'Domestic Shipping Rates and Estimates' : 'Tarifs et estimations des expéditions nationales (Maroc)'}
            </h2>
            <p className="mb-2">
              {locale === 'en' 
                ? 'For calculated shipping rates: Shipping charges for your order will be calculated and displayed at checkout.' 
                : 'Pour les tarifs d\'expédition calculés : Les frais d\'expédition de votre commande seront calculés et affichés lors de la validation de la commande.'}
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{locale === 'en' ? 'Standard Shipping (3-5 business days): 60 MAD' : 'Livraison Standard (3-5 jours ouvrés) : 60 MAD'}</li>
              <li>{locale === 'en' ? 'Free Standard Shipping on orders over 2000 MAD' : 'Livraison Standard Gratuite pour les commandes supérieures à 2000 MAD'}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-3" style={{ fontFamily: "'Raleway', sans-serif" }}>
              {locale === 'en' ? 'International Shipping' : 'Expédition Internationale'}
            </h2>
            <p className="mb-2">
              {locale === 'en'
                ? 'We offer international shipping to most countries in Europe (France, Belgium, Netherlands, etc.).'
                : 'Nous proposons l\'expédition internationale vers la plupart des pays d\'Europe (France, Belgique, Pays-Bas, etc.).'}
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{locale === 'en' ? 'Flat Rate International Shipping: ~200 MAD' : 'Frais d\'expédition internationale forfaitaires : ~200 MAD'}</li>
            </ul>
            <p className="mt-2 text-xs italic">
              {locale === 'en' 
                ? 'Your order may be subject to import duties and taxes (including VAT), which are incurred once a shipment reaches your destination country. Maison Tislit is not responsible for these charges if they are applied and are your responsibility as the customer.'
                : 'Votre commande peut être soumise à des droits et taxes d\'importation (y compris la TVA), qui sont encourus une fois qu\'un envoi atteint votre pays de destination. Maison Tislit n\'est pas responsable de ces frais s\'ils sont appliqués et ils sont à votre charge en tant que client.'}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
