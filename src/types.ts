export interface Product {
  id: number;
  slug: string;
  name: string;
  nameEn: string;
  /** Dutch name — auto-translated by the admin on save. */
  nameNl: string;
  category: 'djellaba' | 'takchita' | 'gandoura' | 'Caftan' | 'Jabador' | 'Accessoire';
  price: number;
  /** Cover photo — used by shop cards, cart, checkout, wishlist and og:image. */
  image: string;
  /** Additional photos beyond the cover, shown as a thumbnail strip. */
  gallery?: string[];
  /** Short product clips (mp4/webm), shown after the photos in the same strip. */
  videos?: string[];
  description: string;
  descriptionEn: string;
  /** Dutch description — auto-translated by the admin on save. */
  descriptionNl: string;
  sizes: string[];
  colors: string[];
  badge?: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  customMeasurements?: {
    shoulders: string;
    bust: string;
    waist: string;
    hips: string;
    length: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Review {
  id: number;
  productId: number;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export type Page = 'home' | 'shop' | 'about' | 'cart' | 'login' | 'checkout' | 'confirmation' | 'account' | 'favorites' | 'admin' | 'contact' | 'shipping' | 'returns';

export type Currency = 'MAD' | 'EUR' | 'USD';
