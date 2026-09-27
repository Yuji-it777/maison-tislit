import type { Locale } from '../context/LanguageContext';

const CATEGORY_ALT: Partial<Record<string, Record<Locale, string>>> = {
  djellaba: { en: 'handmade Moroccan djellaba', nl: 'handgemaakte Marokkaanse djellaba' },
  takchita: { en: 'handmade Moroccan takchita', nl: 'handgemaakte Marokkaanse takchita' },
  gandoura: { en: 'handmade Moroccan gandoura', nl: 'handgemaakte Marokkaanse gandoura' },
  Caftan: { en: 'handmade Moroccan caftan', nl: 'handgemaakte Marokkaanse kaftan' },
  Jabador: { en: 'handmade Moroccan jabador', nl: 'handgemaakte Marokkaanse jabador' },
  Accessoire: { en: 'handmade Moroccan accessory', nl: 'handgemaakt Marokkaans accessoire' },
};

/**
 * Minimal shape needed to localize a product name. Optional translations so
 * legacy cart items in localStorage (saved before nameNl existed) still work.
 */
interface LocalizableName {
  name: string;
  nameEn?: string | null;
  nameNl?: string | null;
}

interface LocalizableDescription {
  description: string;
  descriptionEn?: string | null;
  descriptionNl?: string | null;
}

/**
 * Localized product name. EN uses nameEn, NL uses nameNl (added by migration
 * 00031); falls back to the French base text when a translation is missing.
 */
export function productName(p: LocalizableName, locale: Locale): string {
  if (locale === 'nl') return p.nameNl || p.name;
  return p.nameEn || p.name;
}

/** Localized product description — same fallback chain as productName. */
export function productDescription(p: LocalizableDescription, locale: Locale): string {
  if (locale === 'nl') return p.descriptionNl || p.description;
  return p.descriptionEn || p.description;
}

export function productAlt(
  p: LocalizableName & { category: string },
  locale: Locale
): string {
  const desc = CATEGORY_ALT[p.category]?.[locale]
    ?? (locale === 'en' ? 'handmade Moroccan piece' : 'handgemaakt Marokkaans kledingstuk');
  return `${productName(p, locale)} – ${desc}`;
}
