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
