import { useState, useMemo } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';
import { localizePath, type Locale } from '../context/LanguageContext';
import { SITE_URL } from '../config';
import { CATEGORY_PAGES, categoryBySlug } from '../config/categories';
import { Product } from '../types';
import ProductModal from '../components/ProductModal';
import { ShoppingBag, Heart, Search } from 'lucide-react';
import flyHeartToCart from '../utils/flyHeartToCart';
import { productAlt } from '../utils/productAlt';
import { useStaggerReveal } from '../utils/animations';
import SEO from '../components/SEO';
import { buildBreadcrumbJsonLd } from '../utils/breadcrumbJsonLd';

// Filter chips: "all" (the /shop view) + one link per indexable category page
const FILTER_CHIPS: Array<{ slug: string; label: string }> = [
  { slug: 'all', label: 'shop.catAll' },
  ...CATEGORY_PAGES.map(c => ({ slug: c.slug, label: c.name })),
];

const badgeKey = (badge: string): string => {
  const map: Record<string, string> = {
    'Bestseller': 'badge.bestseller',
    'Nouveau': 'badge.nouveau',
    'Premium': 'badge.premium',
    'Collection Spéciale': 'badge.collectionSpeciale',
  };
  return map[badge] || badge;
};

export default function ShopPage() {
  const { products, formatPrice } = useApp();
  const { t, locale } = useTranslation();
  const { categorySlug } = useParams();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sortBy, setSortBy] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColor, setSelectedColor] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(5000);
  const gridRef = useStaggerReveal<HTMLDivElement>(0.1);

  // Category comes from the URL: /shop = everything, /shop/:slug = one collection.
  // Unknown slugs fall back to the all-products view instead of a soft 404
  // (the actual redirect happens after all hooks, see the guard below).
  const category = categorySlug ? categoryBySlug(categorySlug) : undefined;
  const dbCategory = category?.dbValue ?? 'all';

  const availableColors = useMemo(() => {
    const colors = new Set<string>();
    products.forEach(p => p.colors.forEach(c => colors.add(c)));
    return Array.from(colors).sort();
  }, [products]);

  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    products.forEach(p => p.sizes.forEach(s => sizes.add(s)));
    return Array.from(sizes).sort();
  }, [products]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return products
      .filter(p => (dbCategory === 'all' || p.category === dbCategory))
      .filter(p => selectedColor === 'all' || p.colors.includes(selectedColor))
      .filter(p => selectedSize === 'all' || p.sizes.includes(selectedSize))
      .filter(p => !inStockOnly || p.stock > 0)
      .filter(p => p.price <= maxPrice)
      .filter(p =>
        !q || p.name.toLowerCase().includes(q) ||
        (p.nameEn && p.nameEn.toLowerCase().includes(q)) ||
        p.description.toLowerCase().includes(q) ||
        (p.descriptionEn && p.descriptionEn.toLowerCase().includes(q))
      )
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return 0;
      });
  }, [products, dbCategory, sortBy, searchQuery, selectedColor, selectedSize, inStockOnly, maxPrice]);

  // Guard AFTER all hooks: unknown category slugs never render a soft-404 page
  if (categorySlug && !category) {
    return <Navigate to={localizePath('/shop', locale)} replace />;
  }

  // SEO copy: unique per-category title/description/H1, generic on /shop
  // Use slug (stable) for i18n keys, not name (human-readable, may change)
  const catKey = category?.slug ?? '';
  const pageTitle = category ? t(`seo.cat${catKey.charAt(0).toUpperCase() + catKey.slice(1)}Title`) : t('seo.shopTitle');
  const pageDescription = category ? t(`seo.cat${catKey.charAt(0).toUpperCase() + catKey.slice(1)}Description`) : t('seo.shopDescription');
  const heading = category ? t(`shop.cat${catKey.charAt(0).toUpperCase() + catKey.slice(1)}H1`) : t('shop.ourBoutique');
  const subheading = category ? t(`shop.cat${catKey.charAt(0).toUpperCase() + catKey.slice(1)}Intro`) : t('shop.subtitle');

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: filtered.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: locale === 'en' && p.nameEn ? p.nameEn : p.name,
      url: `${SITE_URL}${localizePath(`/product/${p.slug}`, locale)}`,
    })),
  };

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(locale, category);

  return (
    <div className="pt-20 min-h-screen bg-stone-50">
      <SEO title={pageTitle} description={pageDescription} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(itemListJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>
      {/* Page Header */}
      <div className="bg-stone-800 text-white py-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d97706' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3Ccircle cx='0' cy='0' r='2'/%3E%3Ccircle cx='80' cy='0' r='2'/%3E%3Ccircle cx='0' cy='80' r='2'/%3E%3Ccircle cx='80' cy='80' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="h-px w-12 bg-brand" />
            <span className="text-brand text-xs tracking-[0.4em] uppercase" style={{ fontFamily: "'Raleway', sans-serif" }}>{t('shop.collection2025')}</span>
            <div className="h-px w-12 bg-brand" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            {heading}
          </h1>
          <p className="text-stone-300 text-lg max-w-3xl mx-auto" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {subheading}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-stone-200 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {FILTER_CHIPS.map(chip => {
              const active = chip.slug === 'all' ? !category : category?.slug === chip.slug;
              const to = localizePath(chip.slug === 'all' ? '/shop' : `/shop/${chip.slug}`, locale);
              return (
                <Link
                  key={chip.slug}
                  to={to}
                  aria-current={active ? 'page' : undefined}
                  className={`px-5 py-2 text-xs font-medium tracking-wider uppercase rounded-full transition-all duration-200
                    ${active
                      ? 'bg-stone-800 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  style={{ fontFamily: "'Raleway', sans-serif" }}
                >
                  {chip.slug === 'all' ? t(chip.label) : chip.label}
                </Link>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 md:flex-nowrap">
            <div className="relative w-full md:w-44 lg:w-56">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('shop.search')}
                className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-brand bg-stone-50"
              />
            </div>
            
            <div className="flex items-center gap-2 border-l border-stone-200 pl-3 ml-1 w-full md:w-auto">
              <span className="text-xs text-stone-500 hidden md:inline">Couleur:</span>
              <select
                value={selectedColor}
                onChange={e => setSelectedColor(e.target.value)}
                aria-label="Filter by color"
                className="text-xs text-stone-700 border border-stone-200 rounded px-2 py-2 bg-white focus:outline-none focus:border-brand w-full md:w-24"
              >
                <option value="all">Toutes</option>
                {availableColors.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2 border-l border-stone-200 pl-3 ml-1 w-full md:w-auto">
              <span className="text-xs text-stone-500 hidden md:inline">Taille:</span>
              <select
                value={selectedSize}
                onChange={e => setSelectedSize(e.target.value)}
                aria-label="Filter by size"
                className="text-xs text-stone-700 border border-stone-200 rounded px-2 py-2 bg-white focus:outline-none focus:border-brand w-full md:w-24"
              >
                <option value="all">Toutes</option>
                {availableSizes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <label className="flex items-center gap-1.5 border-l border-stone-200 pl-3 ml-1 cursor-pointer w-full md:w-auto">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={e => setInStockOnly(e.target.checked)}
                className="accent-brand w-3.5 h-3.5 rounded"
              />
              <span className="text-xs text-stone-500 whitespace-nowrap">En stock</span>
            </label>

            <div className="flex flex-col gap-1 border-l border-stone-200 pl-3 ml-1 w-full md:w-auto">
              <span className="text-[10px] text-stone-500">Max: {formatPrice(maxPrice)}</span>
              <input 
                type="range" 
                min="0" 
                max="10000" 
                step="500" 
                value={maxPrice} 
                onChange={e => setMaxPrice(Number(e.target.value))}
                aria-label="Maximum price"
                className="w-full md:w-24 accent-brand"
              />
            </div>

            <span className="text-xs text-stone-500 border-l border-stone-200 pl-3 ml-1 hidden md:inline">{t('shop.sortBy')}</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              aria-label={t('shop.sortBy')}
              className="text-xs text-stone-700 border border-stone-200 rounded px-3 py-2 bg-white focus:outline-none focus:border-brand w-full md:w-auto"
            >
              <option value="default">{t('shop.sortDefault')}</option>
              <option value="price-asc">{t('shop.sortPriceAsc')}</option>
              <option value="price-desc">{t('shop.sortPriceDesc')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <p className="text-stone-500 text-sm mb-8">{filtered.length} {t('shop.itemsFound')}</p>
        <div key={(categorySlug ?? 'all') + searchQuery + sortBy} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" ref={gridRef}>
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} onOpen={() => setSelectedProduct(product)} t={t} locale={locale} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-20 text-stone-400">
            <div className="text-6xl mb-4">/</div>
            <p className="text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>{t('shop.noItems')}</p>
          </div>
        )}
      </div>

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}

function ProductCard({ product, onOpen, t, locale }: { product: Product; onOpen: () => void; t: (key: string) => string; locale: Locale }) {
  const { addToCart, isInWishlist, toggleWishlist, showToast, formatPrice } = useApp();
  const navigate = useNavigate();

  const outOfStock = product.stock <= 0;
  const productUrl = localizePath(`/product/${product.slug}`, locale);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (outOfStock) return;
    addToCart(product, product.sizes[0] || 'M', product.colors[0] || 'Default', 1);
  };

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={() => navigate(productUrl)}>
      <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
        <img
          src={product.image}
          alt={productAlt(product, locale)}
          loading="lazy"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
        />
        {product.badge && product.badge !== 'Promo' && (
          <span className="absolute top-4 left-4 bg-brand text-white text-xs font-semibold px-3 py-1 rounded-full tracking-wider">
            {t(badgeKey(product.badge))}
          </span>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-stone-700 text-xs font-bold px-4 py-2 tracking-widest uppercase rounded">
              {locale === 'en' ? 'Out of Stock' : 'Uitverkocht'}
            </span>
          </div>
        )}
        <button
          onClick={e => {
            e.stopPropagation();
            const wasInWishlist = isInWishlist(product.id);
            if (wasInWishlist) {
              toggleWishlist(product.id);
              showToast(t('wishlist.removed'), 'info');
            } else {
              flyHeartToCart(e.currentTarget, () => {
                toggleWishlist(product.id);
                showToast(t('wishlist.added'), 'info');
              });
            }
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all z-10"
          aria-label="Toggle wishlist"
        >
          <Heart size={16} className={isInWishlist(product.id) ? 'fill-brand text-brand' : 'text-stone-500'} />
        </button>
        <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white text-stone-800 text-xs font-semibold px-6 py-3 tracking-widest uppercase hover:bg-brand hover:text-white transition-colors">
            {t('shop.viewDetails')}
          </span>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onOpen(); }}
          className="absolute top-4 left-4 bg-white/80 backdrop-blur text-stone-800 text-[10px] font-semibold px-3 py-1.5 rounded-full tracking-widest uppercase hover:bg-white transition-colors z-10"
        >
          {t('shop.quickView')}
        </button>
        <button
          onClick={handleAddToCart}
          className={`absolute bottom-4 right-4 p-3 rounded-full transition-all duration-300 shadow-lg ${
            outOfStock
              ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
              : 'bg-[#1a1208] hover:bg-brand text-white opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'
          }`}
          aria-label="Add to cart"
        >
          <ShoppingBag size={20} />
        </button>
      </div>
      <div className="p-5">
        <span className="text-brand text-xs tracking-widest uppercase mb-1 block capitalize" style={{ fontFamily: "'Raleway', sans-serif" }}>
          {product.category}
        </span>
        <h2 className="text-stone-800 font-semibold text-lg mb-1 leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>
          {locale === 'en' && product.nameEn ? product.nameEn : product.name}
        </h2>
        <p className="text-stone-500 text-xs mb-3 line-clamp-2">{locale === 'en' && product.descriptionEn ? product.descriptionEn : product.description}</p>

        <div className="flex items-center gap-1 mb-3">
          {product.colors.slice(0, 3).map(c => (
            <span key={c} className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">{c}</span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-stone-600 font-medium">{formatPrice(product.price)}</p>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onOpen(); }}
            className="bg-stone-800 hover:bg-brand text-white text-xs px-5 py-2 rounded tracking-wider transition-colors"
          >
            {t('shop.add')}
          </button>
        </div>
      </div>
    </div>
  );
}
