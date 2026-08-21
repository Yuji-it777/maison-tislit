export interface Product {
  id: number;
  slug: string;
  name: string;
  nameEn: string;
  category: 'djellaba' | 'takchita' | 'gandoura';
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  descriptionEn: string;
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

export type Page = 'home' | 'shop' | 'about' | 'cart' | 'login' | 'checkout' | 'confirmation' | 'account' | 'admin' | 'contact' | 'tracking' | 'shipping' | 'returns';

export type Currency = 'MAD' | 'EUR' | 'USD';
