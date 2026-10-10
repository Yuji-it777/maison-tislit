// Indexable category pages: URL slug <-> products.category value in the DB.
// Note the DB stores 'Caftan' capitalized (legacy CHECK constraint),
// while URL slugs are lowercase. Takchita and Jabador were removed as
// categories (no indexable pages); old URLs 301 to their closest collection.
// 'Accessoire' deliberately has no page —
// a single-product accessory collection would read as thin content; it
// remains filterable on /shop only.
export interface CategoryPage {
  slug: string;
  dbValue: string;
  name: string;
}

export const CATEGORY_PAGES: CategoryPage[] = [
  { slug: 'djellaba', dbValue: 'djellaba', name: 'Djellaba' },
  { slug: 'gandoura', dbValue: 'gandoura', name: 'Gandoura' },
  { slug: 'caftan', dbValue: 'Caftan', name: 'Caftan' },
];

export function categoryBySlug(slug: string | undefined): CategoryPage | undefined {
  return CATEGORY_PAGES.find(c => c.slug === slug);
}

export function categoryByDbValue(dbValue: string): CategoryPage | undefined {
  return CATEGORY_PAGES.find(c => c.dbValue === dbValue);
}

// Categories that currently have at least one product. Empty collections
// (e.g. djellaba while no djellaba product exists) are hidden from the shop
// chips, home tiles and sitemap until a product is added — the route itself
// stays valid and renders a noindexed empty state for direct visits.
export function availableCategories(products: Array<{ category: string }>): CategoryPage[] {
  return CATEGORY_PAGES.filter(c => products.some(p => p.category === c.dbValue));
}
