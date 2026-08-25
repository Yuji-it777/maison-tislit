import { Product } from '../types';

// Extracts a schema.org `material` value from product copy (EN + FR terms).
// Returns null when no fabric is stated — structured data must never guess.
const FABRIC_TERMS: Array<[RegExp, string]> = [
  [/silk|soie/i, 'Silk'],
  [/velvet|velours/i, 'Velvet'],
  [/cr[eê]pe/i, 'Crepe'],
  [/cotton|coton/i, 'Cotton'],
  [/satin/i, 'Satin'],
  [/linen|\blin\b/i, 'Linen'],
];

export function productMaterial(product: Pick<Product, 'description' | 'descriptionEn'>): string | null {
  const text = `${product.descriptionEn || ''} ${product.description || ''}`;
  for (const [pattern, label] of FABRIC_TERMS) {
    if (pattern.test(text)) return label;
  }
  return null;
}
