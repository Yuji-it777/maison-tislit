import { useTranslation } from '../context/LanguageContext';

interface Props {
  onClose: () => void;
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const MEASUREMENTS: Record<string, { bust: number[]; waist: number[]; hips: number[]; length: number[] }> = {
  djellaba: {
    bust: [82, 88, 94, 100, 108, 116],
    waist: [64, 70, 76, 82, 90, 98],
    hips: [88, 94, 100, 106, 114, 122],
    length: [140, 142, 144, 146, 148, 150],
  },
  takchita: {
    bust: [80, 86, 92, 98, 106, 114],
    waist: [62, 68, 74, 80, 88, 96],
    hips: [86, 92, 98, 104, 112, 120],
    length: [145, 147, 149, 151, 153, 155],
  },
  gandoura: {
    bust: [84, 90, 96, 102, 110, 118],
    waist: [66, 72, 78, 84, 92, 100],
    hips: [90, 96, 102, 108, 116, 124],
    length: [130, 132, 134, 136, 138, 140],
  },
};

export default function SizeGuide({ onClose }: Props) {
  const { locale } = useTranslation();

  const HEADERS = ['Taille', 'Buste (cm)', 'Taille (cm)', 'Hanches (cm)', 'Longueur (cm)'];
  const HEADERS_EN = ['Size', 'Bust (cm)', 'Waist (cm)', 'Hips (cm)', 'Length (cm)'];
  const headers = locale === 'en' ? HEADERS_EN : HEADERS;
  const data = MEASUREMENTS.djellaba;

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-stone-800" style={{ fontFamily: "'Playfair Display', serif" }}>
            {locale === 'en' ? 'Size Guide' : 'Guide des Tailles'}
          </h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-stone-500 mb-4">
          {locale === 'en'
            ? 'Measurements are in centimeters. If you are between sizes, we recommend choosing the larger size.'
            : 'Les mesures sont en centimètres. Si vous êtes entre deux tailles, nous recommandons de choisir la taille supérieure.'}
        </p>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200">
              {headers.map(h => (
                <th key={h} className="py-2 px-1 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SIZES.map((size, i) => (
              <tr key={size} className="border-b border-stone-100 last:border-0">
                <td className="py-2.5 px-1 font-semibold text-stone-800">{size}</td>
                <td className="py-2.5 px-1 text-stone-600">{data.bust[i]}</td>
                <td className="py-2.5 px-1 text-stone-600">{data.waist[i]}</td>
                <td className="py-2.5 px-1 text-stone-600">{data.hips[i]}</td>
                <td className="py-2.5 px-1 text-stone-600">{data.length[i]}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="text-[10px] text-stone-400 mt-4">
          {locale === 'en'
            ? '* Length may vary depending on the model. Contact us for precise measurements.'
            : '* La longueur peut varier selon le modèle. Contactez-nous pour des mesures précises.'}
        </p>
      </div>
    </div>
  );
}
