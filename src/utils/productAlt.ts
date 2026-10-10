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

/**
 * Display-side translation for product color names. The DB stores French
 * values (e.g. "ivoire"); this maps common ones to EN/NL for the storefront
 * without touching stored data. Unknown values fall back to the raw text.
 * Lookup is lowercase + trimmed; gender variants included where common.
 */
const COLOR_NAMES: Record<string, { en: string; nl: string }> = {
  // Values currently in the DB
  'ivoire': { en: 'ivory', nl: 'ivoor' },
  'sable': { en: 'sand', nl: 'zand' },
  'beige': { en: 'beige', nl: 'beige' },
  'doré': { en: 'gold', nl: 'goud' },
  'dore': { en: 'gold', nl: 'goud' },
  'bleu majorelle': { en: 'Majorelle blue', nl: 'Majorelleblauw' },
  'bleu roi': { en: 'royal blue', nl: 'koningsblauw' },
  'indigo': { en: 'indigo', nl: 'indigo' },
  // Common French color names (covers future admin entries)
  'blanc': { en: 'white', nl: 'wit' },
  'blanche': { en: 'white', nl: 'wit' },
  'noir': { en: 'black', nl: 'zwart' },
  'noire': { en: 'black', nl: 'zwart' },
  'gris': { en: 'grey', nl: 'grijs' },
  'grise': { en: 'grey', nl: 'grijs' },
  'rouge': { en: 'red', nl: 'rood' },
  'bordeaux': { en: 'bordeaux', nl: 'bordeaux' },
  'rose': { en: 'pink', nl: 'roze' },
  'corail': { en: 'coral', nl: 'koraal' },
  'orange': { en: 'orange', nl: 'oranje' },
  'jaune': { en: 'yellow', nl: 'geel' },
  'vert': { en: 'green', nl: 'groen' },
  'verte': { en: 'green', nl: 'groen' },
  'kaki': { en: 'khaki', nl: 'kaki' },
  'turquoise': { en: 'turquoise', nl: 'turquoise' },
  'bleu': { en: 'blue', nl: 'blauw' },
  'bleue': { en: 'blue', nl: 'blauw' },
  'bleu marine': { en: 'navy', nl: 'marineblauw' },
  'violet': { en: 'purple', nl: 'paars' },
  'violette': { en: 'purple', nl: 'paars' },
  'marron': { en: 'brown', nl: 'bruin' },
  'chocolat': { en: 'chocolate', nl: 'chocoladebruin' },
  'crème': { en: 'cream', nl: 'crème' },
  'creme': { en: 'cream', nl: 'crème' },
  'argent': { en: 'silver', nl: 'zilver' },
  'argenté': { en: 'silver', nl: 'zilver' },
  'argente': { en: 'silver', nl: 'zilver' },
  'or': { en: 'gold', nl: 'goud' },
  'dorée': { en: 'gold', nl: 'goud' },
  'doree': { en: 'gold', nl: 'goud' },
  'multicolore': { en: 'multicolor', nl: 'multicolor' },
};

export function colorName(color: string, locale: Locale): string {
  const hit = COLOR_NAMES[color.trim().toLowerCase()];
  if (!hit) return color;
  return locale === 'nl' ? hit.nl : hit.en;
}

export function productAlt(
  p: LocalizableName & { category: string },
  locale: Locale
): string {
  const desc = CATEGORY_ALT[p.category]?.[locale]
    ?? (locale === 'en' ? 'handmade Moroccan piece' : 'handgemaakt Marokkaans kledingstuk');
  return `${productName(p, locale)} – ${desc}`;
}
