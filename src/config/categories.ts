// Indexable category pages: URL slug <-> products.category value in the DB.
// Note the DB stores 'Caftan'/'Jabador' capitalized (legacy CHECK constraint),
// while URL slugs are lowercase. 'Accessoire' deliberately has no page —
// a single-product accessory collection would read as thin content; it
// remains filterable on /shop only.
export interface CategoryPage {
  slug: string;
  dbValue: string;
  name: string;
}

export const CATEGORY_PAGES: CategoryPage[] = [
  { slug: 'djellaba', dbValue: 'djellaba', name: 'Djellaba' },
  { slug: 'takchita', dbValue: 'takchita', name: 'Takchita' },
  { slug: 'gandoura', dbValue: 'gandoura', name: 'Gandoura' },
  { slug: 'caftan', dbValue: 'Caftan', name: 'Caftan' },
  { slug: 'jabador', dbValue: 'Jabador', name: 'Jabador' },
];

export function categoryBySlug(slug: string | undefined): CategoryPage | undefined {
  return CATEGORY_PAGES.find(c => c.slug === slug);
}

export function categoryByDbValue(dbValue: string): CategoryPage | undefined {
  return CATEGORY_PAGES.find(c => c.dbValue === dbValue);
}
