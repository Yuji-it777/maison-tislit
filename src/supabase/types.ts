export interface ProductRow {
  id: number;
  name: string;
  name_en: string;
  name_ar: string;
  category: string;
  price: number;
  original_price: number | null;
  image: string;
  description: string;
  description_en: string;
  sizes: string[];
  colors: string[];
  badge: string | null;
  stock: number;
  created_at: string;
}

export interface OrderRow {
  id: number;
  user_id: string;
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

export interface ReviewRow {
  id: number;
  product_id: number;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}
