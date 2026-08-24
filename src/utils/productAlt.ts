import type { Locale } from '../context/LanguageContext';
import type { Product } from '../types';

const CATEGORY_ALT: Record<Product['category'], Record<Locale, string>> = {
  djellaba: { en: 'handmade Moroccan djellaba', nl: 'handgemaakte Marokkaanse djellaba' },
  takchita: { en: 'handmade Moroccan takchita', nl: 'handgemaakte Marokkaanse takchita' },
  gandoura: { en: 'handmade Moroccan gandoura', nl: 'handgemaakte Marokkaanse gandoura' },
};

export function productName(p: Pick<Product, 'name' | 'nameEn'>, locale: Locale): string {
  return locale === 'en' && p.nameEn ? p.nameEn : p.name;
}

export function productAlt(p: Pick<Product, 'name' | 'nameEn' | 'category'>, locale: Locale): string {
  const desc = CATEGORY_ALT[p.category]?.[locale]
    ?? (locale === 'en' ? 'handmade Moroccan piece' : 'handgemaakt Marokkaans kledingstuk');
  return `${productName(p, locale)} – ${desc}`;
}
