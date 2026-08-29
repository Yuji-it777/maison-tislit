import { SITE_URL } from '../config';
import { localizePath, type Locale } from '../context/LanguageContext';
import { CategoryPage } from '../config/categories';

export function buildBreadcrumbJsonLd(
  locale: Locale,
  category?: CategoryPage,
  productName?: string,
  productUrl?: string
) {
  const items: Array<{ '@type': 'ListItem'; position: number; name: string; item: string }> = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Shop', item: `${SITE_URL}${localizePath('/shop', locale)}` },
  ];

  let position = 3;

  if (category) {
    items.push({
      '@type': 'ListItem',
      position,
      name: category.name,
      item: `${SITE_URL}${localizePath(`/shop/${category.slug}`, locale)}`,
    });
    position++;
  }

  if (productName && productUrl) {
    items.push({
      '@type': 'ListItem',
      position,
      name: productName,
      item: productUrl,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}