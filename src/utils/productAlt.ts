import type { Locale } from '../context/LanguageContext';
import type { Product } from '../types';

const CATEGORY_ALT: Partial<Record<Product['category'], Record<Locale, string>>> = {
  djellaba: { en: 'handmade Moroccan djellaba', nl: 'handgemaakte Marokkaanse djellaba' },
  takchita: { en: 'handmade Moroccan takchita', nl: 'handgemaakte Marokkaanse takchita' },
  gandoura: { en: 'handmade Moroccan gandoura', nl: 'handgemaakte Marokkaanse gandoura' },
  Caftan: { en: 'handmade Moroccan caftan', nl: 'handgemaakte Marokkaanse kaftan' },
  Jabador: { en: 'handmade Moroccan jabador', nl: 'handgemaakte Marokkaanse jabador' },
  Accessoire: { en: 'handmade Moroccan accessory', nl: 'handgemaakt Marokkaans accessoire' },
};

export function productName(p: Pick<Product, 'name' | 'nameEn'>, locale: Locale): string {
  return locale === 'en' && p.nameEn ? p.nameEn : p.name;
}

export function productAlt(p: Pick<Product, 'name' | 'nameEn' | 'category'>, locale: Locale): string {
  const desc = CATEGORY_ALT[p.category]?.[locale]
    ?? (locale === 'en' ? 'handmade Moroccan piece' : 'handgemaakt Marokkaans kledingstuk');
  return `${productName(p, locale)} – ${desc}`;
}
