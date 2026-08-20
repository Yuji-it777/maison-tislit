export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '31620813588';

export const WHATSAPP_LINK = (text?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined) || 'https://maisontislit.com';