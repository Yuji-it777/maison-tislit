import { supabase } from './client';
import type { ProductRow, OrderRow, OrderItemRow, MessageRow, ProfileRow, ReviewRow, NewsletterSubscriberRow } from './types';

/* ───── Products ───── */
export async function getProducts(): Promise<ProductRow[]> {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getProduct(id: number): Promise<ProductRow | null> {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
  if (error) return null;
  return data;
}

export async function getProductBySlug(slug: string): Promise<ProductRow | null> {
  const { data, error } = await supabase.from('products').select('*').eq('slug', slug).maybeSingle();
  if (error) return null;
  return data;
}

export async function createProduct(product: Partial<ProductRow>): Promise<ProductRow> {
  const { data, error } = await supabase.from('products').insert(product).select().single();
  if (error) throw error;
  if (!data) throw new Error('Failed to create product');
  return data;
}

export async function updateProduct(id: number, product: Partial<ProductRow>): Promise<ProductRow> {
  const { data, error } = await supabase.from('products').update(product).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: number): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

/* ───── Orders ───── */
export async function getOrders(): Promise<OrderRow[]> {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getOrdersByUser(userId: string): Promise<OrderRow[]> {
  const { data, error } = await supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createOrder(order: Partial<OrderRow>): Promise<OrderRow> {
  const { data, error } = await supabase.from('orders').insert(order).select().single();
  if (error) throw error;
  if (!data) throw new Error('Failed to create order');
  return data;
}

export async function getOrder(id: number): Promise<OrderRow | null> {
  const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
  if (error) return null;
  return data;
}

export async function updateOrderStatus(id: number, status: string): Promise<void> {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) throw error;
}

/* ───── Order Items ───── */
export async function createOrderItems(items: Partial<OrderItemRow>[]): Promise<void> {
  const { error } = await supabase.from('order_items').insert(items);
  if (error) throw error;
}

export async function getOrderItems(orderId: number): Promise<OrderItemRow[]> {
  const { data, error } = await supabase.from('order_items').select('*').eq('order_id', orderId);
  if (error) throw error;
  return data || [];
}

/* ───── Messages ───── */
export async function getMessages(): Promise<MessageRow[]> {
  const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createMessage(msg: Partial<MessageRow>): Promise<MessageRow> {
  const { data, error } = await supabase.from('messages').insert(msg).select().single();
  if (error) throw error;
  if (!data) throw new Error('Failed to create message');
  return data;
}

export async function updateMessage(id: number, msg: Partial<MessageRow>): Promise<void> {
  const { error } = await supabase.from('messages').update(msg).eq('id', id);
  if (error) throw error;
}

export async function deleteMessage(id: number): Promise<void> {
  const { error } = await supabase.from('messages').delete().eq('id', id);
  if (error) throw error;
}

/* ───── Profile ───── */
export async function getProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).limit(1);
  if (error) {
    console.error('getProfile error:', error);
    return null;
  }
  return data?.[0] ?? null;
}

export async function getProfiles(): Promise<ProfileRow[]> {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateProfile(id: string, profile: Partial<ProfileRow>): Promise<void> {
  const { error } = await supabase.from('profiles').update(profile).eq('id', id);
  if (error) throw error;
}

/* ───── Newsletter Subscribers ───── */
export async function getNewsletterSubscribers(): Promise<NewsletterSubscriberRow[]> {
  const { data, error } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function deleteNewsletterSubscriber(id: number): Promise<void> {
  const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
  if (error) throw error;
}

/* ───── Reviews ───── */
export async function getProductReviews(productId: number): Promise<ReviewRow[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createReview(review: Partial<ReviewRow>): Promise<ReviewRow> {
  const { data, error } = await supabase.from('reviews').insert(review).select().single();
  if (error) throw error;
  if (!data) throw new Error('Failed to create review');
  return data;
}
