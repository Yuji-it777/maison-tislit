import { SITE_URL } from '../config';
import type { Product } from '../types';

/** Drop blanks: trim every entry, drop empty strings. Shared by photos/videos. */
export function cleanMediaList(paths: unknown): string[] {
  const list = Array.isArray(paths) ? paths : paths ? [paths] : [];
  return list.map(path => (typeof path === 'string' ? path : String(path ?? '')).trim()).filter(Boolean);
}

/**
 * Every photo for a product, cover first.
 *
 * `image` is the cover and always comes first; `gallery` holds any additional
 * photos in the order stored on the row. Blank paths are dropped, so a product
 * without a gallery still yields exactly one photo.
 */
export function productPhotos(product: Pick<Product, 'image' | 'gallery'>): string[] {
  return cleanMediaList([product.image, ...(product.gallery ?? [])]);
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
