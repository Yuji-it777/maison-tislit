import type { Product } from '../types';
import { productPhotos, cleanMediaList } from './productPhotos';

/** Video URLs stored on the product; a scalar/wrong-type value yields no videos. */
export function productVideos(product: Pick<Product, 'videos'>): string[] {
  if (!Array.isArray(product.videos)) return [];
  return cleanMediaList(product.videos);
}

export interface ProductMediaItem {
  type: 'photo' | 'video';
  src: string;
}

/**
 * One-based position of every item within its own kind: photos count 1..n,
 * videos count 1..m independently, so a single clip is always "Video 1"
 * regardless of how many photos precede it.
 */
export function mediaKindIndexes(media: ProductMediaItem[]): number[] {
  const counters: Record<ProductMediaItem['type'], number> = { photo: 0, video: 0 };
  return media.map(item => (counters[item.type] += 1));
}

/**
 * Everything shown in the product viewer, in order: photos first (cover, then
 * gallery), then videos. One list keeps the detail page and the quick-view
 * modal in sync.
 */
export function productMedia(product: Pick<Product, 'image' | 'gallery' | 'videos'>): ProductMediaItem[] {
  return [
    ...productPhotos(product).map(src => ({ type: 'photo' as const, src })),
    ...productVideos(product).map(src => ({ type: 'video' as const, src })),
  ];
}
