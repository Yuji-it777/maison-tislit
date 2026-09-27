export interface ProductRow {
  id: number;
  name: string;
  name_en: string;
  /** Dutch name — auto-translated by the admin (migration 00031). */
  name_nl: string;
  category: string;
  price: number;
  image: string;
  gallery: string[];
  /** Nullable: migration 00030 adds the column without a NOT NULL default. */
  videos: string[] | null;
  description: string;
  description_en: string;
  /** Dutch description — auto-translated by the admin (migration 00031). */
  description_nl: string;
  sizes: string[];
  colors: string[];
  badge: string | null;
  stock: number;
  slug: string | null;
  created_at: string;
}

export interface OrderRow {
  id: number;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  status: 'pending' | 'shipped' | 'delivered';
  total: number;
  address: string;
  city: string;
  phone: string;
  payment_method: string;
  note: string;
  created_at: string;
}

export interface OrderItemRow {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  size: string;
  color: string;
  custom_measurements?: string | null;
}

export interface MessageRow {
  id: number;
  name: string;
  email: string;
  subject: string;
  body: string;
  is_read: boolean;
  reply: string;
  created_at: string;
}

export interface ProfileRow {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export interface NewsletterSubscriberRow {
  id: number;
  email: string;
  created_at: string;
}

export interface ReviewRow {
  id: number;
  product_id: number;
  user_id: string | null;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}
