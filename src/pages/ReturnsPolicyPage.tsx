import { useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';

export default function ReturnsPolicyPage() {
  const { locale } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 pb-16 min-h-screen bg-stone-50">
      <div className="max-w-3xl mx-auto px-6 bg-white p-10 rounded-2xl shadow-sm">
        <h1 className="text-3xl font-bold mb-8 text-stone-800" style={{ fontFamily: "'Playfair Display', serif" }}>
          {locale === 'en' ? 'Returns & Exchanges' : 'Retours & Échanges'}
        </h1>
        
        <div className="space-y-6 text-stone-600 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-3" style={{ fontFamily: "'Raleway', sans-serif" }}>
              {locale === 'en' ? 'Return Policy' : 'Politique de Retour'}
            </h2>
            <p>
              {locale === 'en' 
                ? 'We accept returns up to 14 days after delivery, if the item is unused and in its original condition, and we will refund the full order amount minus the shipping costs for the return.' 
                : 'Nous acceptons les retours jusqu\'à 14 jours après la livraison, si l\'article est inutilisé et dans son état d\'origine, et nous rembourserons le montant total de la commande moins les frais d\'expédition pour le retour.'}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-3" style={{ fontFamily: "'Raleway', sans-serif" }}>
              {locale === 'en' ? 'Custom Made Items' : 'Articles sur-mesure'}
            </h2>
            <p className="font-semibold text-stone-800">
              {locale === 'en' 
                ? 'Please note that custom-made items cannot be returned or exchanged.' 
                : 'Veuillez noter que les articles sur-mesure ne peuvent être ni retournés ni échangés.'}
            </p>
            <p className="mt-2">
              {locale === 'en'
                ? 'Because these items are tailored specifically to your measurements, we cannot restock or resell them. Please ensure your measurements are accurate before submitting your order.'
                : 'Parce que ces articles sont adaptés spécifiquement à vos mesures, nous ne pouvons pas les remettre en stock ou les revendre. Veuillez vous assurer que vos mesures sont précises avant de soumettre votre commande.'}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-3" style={{ fontFamily: "'Raleway', sans-serif" }}>
              {locale === 'en' ? 'How to Return' : 'Comment retourner un article'}
            </h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>{locale === 'en' ? 'Contact our customer service at maisontislit@gmail.com with your order number.' : 'Contactez notre service client à maisontislit@gmail.com avec votre numéro de commande.'}</li>
              <li>{locale === 'en' ? 'Pack the item securely in its original packaging.' : 'Emballez l\'article de manière sécurisée dans son emballage d\'origine.'}</li>
              <li>{locale === 'en' ? 'Ship to the address provided by our support team.' : 'Expédiez à l\'adresse fournie par notre équipe d\'assistance.'}</li>
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
