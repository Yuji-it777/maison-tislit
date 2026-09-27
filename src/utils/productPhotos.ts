import { SITE_URL } from '../config';
import type { Product } from '../types';

/**
 * Every photo for a product, cover first.
 *
 * `image` is the cover and always comes first; `gallery` holds any additional
 * photos in the order stored on the row. Blank paths are dropped, so a product
 * without a gallery still yields exactly one photo.
 */
export function productPhotos(product: Pick<Product, 'image' | 'gallery'>): string[] {
  return [product.image, ...(product.gallery ?? [])]
    .map(path => (path || '').trim())
    .filter(Boolean);
}

/**
 * Absolute URL for a product photo: repo assets ('/images/...') get the site
 * URL prefixed, Supabase Storage URLs are already absolute.
 */
export function absolutePhotoUrl(path: string): string {
  const clean = (path || '').trim();
  if (/^https?:\/\//i.test(clean)) return clean;
  return `${SITE_URL}${clean.startsWith('/') ? '' : '/'}${clean}`;
}
