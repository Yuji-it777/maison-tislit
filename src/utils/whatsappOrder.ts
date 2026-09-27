import { WHATSAPP_LINK } from '../config';
import type { CartItem } from '../types';
import { productName } from './productAlt';

export interface DeliveryForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  city: string;
  zip: string;
  note: string;
}

export function buildWhatsAppOrderUrl(params: {
  orderId: number;
  cart: CartItem[];
  form: DeliveryForm;
  subtotal: number;
  shipping: number;
  total: number;
  formatPrice: (n: number) => string;
  locale: string;
}): string {
  const { orderId, cart, form, subtotal, shipping, total, formatPrice, locale } = params;
  const isEn = locale === 'en';
  const lines: string[] = [];

  lines.push(isEn ? '🛍️ New Order — Maison Tislit' : '🛍️ Nieuwe bestelling — Maison Tislit');
  lines.push(`${isEn ? 'Order' : 'Nr. bestelling'}: MT-${String(orderId).padStart(6, '0')}`);
  lines.push(`${isEn ? 'Customer' : 'Klant'}: ${form.name}`);
  lines.push(`${isEn ? 'Phone' : 'Telefoon'}: ${form.phone}`);
  if (form.email) lines.push(`Email: ${form.email}`);
  const addr = [form.address, form.city, form.zip, form.country].filter(Boolean).join(', ');
  lines.push(`${isEn ? 'Address' : 'Adres'}: ${addr}`);
  if (form.note) lines.push(`${isEn ? 'Note' : 'Notitie'}: ${form.note}`);
  lines.push('──────────────');

  cart.forEach((item, i) => {
    const name = productName(item, isEn ? 'en' : 'nl');
    const opts = [item.selectedSize, item.selectedColor].filter(Boolean).join(', ');
    lines.push(`${i + 1}. ${name}${opts ? ` — ${opts}` : ''} ×${item.quantity}`);
    if (item.customMeasurements) {
      const m = item.customMeasurements;
      const parts = [
        `${isEn ? 'Shoulders' : 'Schouders'}: ${m.shoulders}`,
        `${isEn ? 'Bust' : 'Borst'}: ${m.bust}`,
        `${isEn ? 'Waist' : 'Taille'}: ${m.waist}`,
        `${isEn ? 'Hips' : 'Heupen'}: ${m.hips}`,
        `${isEn ? 'Length' : 'Lengte'}: ${m.length}`,
      ].filter(p => !p.endsWith(': '));
      if (parts.length) lines.push(`   (${parts.join(' • ')})`);
    }
    lines.push(`   → ${item.quantity} × ${formatPrice(item.price)} = ${formatPrice(item.price * item.quantity)}`);
  });

  lines.push('──────────────');
  lines.push(`${isEn ? 'Subtotal' : 'Subtotaal'}: ${formatPrice(subtotal)}`);
  lines.push(`${isEn ? 'Shipping' : 'Verzending'}: ${shipping === 0 ? (isEn ? 'Free' : 'Gratis') : formatPrice(shipping)}`);
  lines.push(`${isEn ? 'Total' : 'Totaal'}: ${formatPrice(total)}`);

  return WHATSAPP_LINK(lines.join('\n'));
}