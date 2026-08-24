import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useApp, MAD_PER_EUR } from '../context/AppContext';
import { useTranslation, localizePath } from '../context/LanguageContext';
import { getProductBySlug } from '../supabase/queries';
import type { ProductRow } from '../supabase/types';
import { Product } from '../types';
import SEO from '../components/SEO';
import SizeGuide from '../components/SizeGuide';
import StarRating from '../components/StarRating';
import { SITE_URL } from '../config';
import { productAlt } from '../utils/productAlt';

function mapRow(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug || '',
    name: row.name,
    nameEn: row.name_en,
    category: row.category as Product['category'],
    price: row.price ?? 150,
    image: (row.image || '').trim(),
    description: row.description || '',
    descriptionEn: row.description_en || '',
    sizes: row.sizes || [],
    colors: row.colors || [],
    badge: row.badge || undefined,
    stock: row.stock ?? 0,
  };
}

export default function ProductDetailPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, reviews, fetchProductReviews, addReview, showToast, formatPrice, setActiveCategory } = useApp();
  const { t, locale } = useTranslation();

  const [product, setProduct] = useState<Product | null>(() => {
    return products.find(p => p.slug === slug) || null;
  });
  const [loading, setLoading] = useState(!product);

  useEffect(() => {
    const found = products.find(p => p.slug === slug);
    if (found) {
      setProduct(found);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getProductBySlug(slug)
      .then(row => { if (!cancelled) setProduct(row ? mapRow(row) : null); })
      .catch(() => { if (!cancelled) setProduct(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug, products]);

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [customMeasurements, setCustomMeasurements] = useState({
    shoulders: '', bust: '', waist: '', hips: '', length: ''
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] || '');
      setSelectedColor(product.colors[0]);
      fetchProductReviews(product.id);
    }
  }, [product?.id]);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-stone-50 flex items-center justify-center">
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '3px solid #B4A180', borderTopColor: 'transparent',
          animation: 'spin 0.7s linear infinite'
        }} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-20 min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <SEO title={t('product.notFound')} noindex />
        <div className="text-center">
          <p className="text-5xl mb-4 text-stone-300">—</p>
          <h1 className="text-2xl font-bold text-stone-800 mb-2" style={{ fontFamily: "'Cinzel', serif" }}>
            {t('product.notFound')}
          </h1>
          <p className="text-stone-500 mb-6">{t('product.notFoundMessage')}</p>
          <button
            onClick={() => navigate(localizePath('/shop', locale))}
            className="bg-stone-800 hover:bg-brand text-white text-sm px-8 py-3 tracking-wider transition-colors"
          >
            {t('product.backToShop')}
          </button>
        </div>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;
  const productReviews = reviews.filter(r => r.productId === product.id);
  const avgRating = productReviews.length
    ? Math.round((productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length) * 10) / 10
    : 0;
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  const productName = locale === 'en' && product.nameEn ? product.nameEn : product.name;
  const productDesc = locale === 'en' && product.descriptionEn ? product.descriptionEn : product.description;
  const productPath = localizePath(`/product/${product.slug}`, locale);
  const canonical = `${SITE_URL}${productPath}`;

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName,
    image: [`${SITE_URL}${product.image}`],
    description: productDesc,
    sku: String(product.id),
    brand: { '@type': 'Brand', name: 'Maison Tislit' },
    offers: {
      '@type': 'Offer',
      url: canonical,
      priceCurrency: 'EUR',
      price: (product.price / MAD_PER_EUR).toFixed(2),
      availability: outOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
    },
    ...(productReviews.length > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating,
        reviewCount: productReviews.length,
      },
    } : {}),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: t('nav.shop'), item: `${SITE_URL}${localizePath('/shop', locale)}` },
      { '@type': 'ListItem', position: 3, name: productName, item: canonical },
    ],
  };

  const handleSubmitReview = () => {
    if (!newName.trim() || newRating === 0 || !newComment.trim()) return;
    addReview(product.id, newRating, newComment.trim(), newName.trim());
    setNewRating(0);
    setNewComment('');
    setNewName('');
    setShowReviewForm(false);
    showToast(t('review.submitted'), 'success');
  };

  const handleAdd = () => {
    if (outOfStock) return;
    if (selectedSize === 'Custom') {
      if (!customMeasurements.shoulders || !customMeasurements.bust || !customMeasurements.waist || !customMeasurements.hips || !customMeasurements.length) {
        showToast(locale === 'en' ? 'Please fill all custom measurements' : 'Vul alle persoonlijke maten in', 'error');
        return;
      }
      addToCart(product, selectedSize, selectedColor, quantity, customMeasurements);
    } else {
      addToCart(product, selectedSize, selectedColor, quantity);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-stone-50">
      <SEO
        title={productName}
        description={productDesc}
        image={product.image}
        url={canonical}
        type="product"
        productPrice={(product.price / MAD_PER_EUR).toFixed(2)}
      />
      <HelmetScripts productJsonLd={productJsonLd} breadcrumbJsonLd={breadcrumbJsonLd} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <nav className="text-xs text-stone-500 mb-6 flex items-center gap-2 flex-wrap" aria-label="Breadcrumb">
          <button onClick={() => navigate(localizePath('/', locale))} className="hover:text-brand transition-colors">{t('nav.home')}</button>
          <span>/</span>
          <button onClick={() => navigate(localizePath('/shop', locale))} className="hover:text-brand transition-colors">{t('nav.shop')}</button>
          <span>/</span>
          <span className="text-stone-700">{productName}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-6 md:p-10">
          <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
            <img src={product.image} alt={productAlt(product, locale)} width={600} height={800} className="w-full h-full object-cover" />
            {product.badge && (
              <span className="absolute top-4 left-4 bg-brand text-white text-xs font-semibold px-3 py-1">
                {product.badge}
              </span>
            )}
            {outOfStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-white text-stone-800 text-sm font-bold px-6 py-3 tracking-widest uppercase">
                  {locale === 'en' ? 'Out of Stock' : 'Uitverkocht'}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-brand text-xs tracking-[0.3em] uppercase mb-2 capitalize" style={{ fontFamily: "'EB Garamond', serif" }}>
              {product.category}
            </span>
            <h1 className="text-3xl font-bold text-stone-800 mb-1" style={{ fontFamily: "'Cinzel', serif" }}>
              {productName}
            </h1>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-stone-900">{formatPrice(product.price)}</span>
            </div>

            {productReviews.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={Math.round(avgRating)} size={14} />
                <span className="text-xs text-stone-500">{avgRating} ({productReviews.length})</span>
              </div>
            )}

            <p className="text-stone-600 text-sm leading-relaxed mb-6">{productDesc}</p>

            <div className="mb-5">
              <label className="text-xs font-semibold text-stone-700 tracking-widest uppercase block mb-2">
                {t('modal.color')} <span className="text-brand font-normal normal-case">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-3 py-1.5 text-xs border transition-all ${
                      selectedColor === c
                        ? 'bg-stone-800 text-white border-stone-800'
                        : 'border-stone-300 text-stone-600 hover:border-stone-500'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-stone-700 tracking-widest uppercase">
                  {t('modal.size')} <span className="text-brand font-normal normal-case">{selectedSize}</span>
                </label>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="text-[10px] text-brand hover:underline"
                >
                  {locale === 'en' ? 'Size Guide' : 'Maatgids'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {[...product.sizes, 'Custom'].map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`min-w-[44px] h-11 px-2 text-xs font-semibold border transition-all ${
                      selectedSize === s
                        ? 'bg-stone-800 text-white border-stone-800'
                        : 'border-stone-300 text-stone-600 hover:border-stone-600'
                    }`}
                  >
                    {s === 'Custom' ? (locale === 'en' ? 'Custom' : 'Op maat') : s}
                  </button>
                ))}
              </div>

              {selectedSize === 'Custom' && (
                <div className="mt-4 p-4 bg-stone-50 border border-stone-200">
                  <p className="text-xs text-stone-500 mb-3">{locale === 'en' ? 'Please provide your measurements in cm:' : 'Geef uw maten in cm:'}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {['shoulders', 'bust', 'waist', 'hips', 'length'].map(measure => (
                      <div key={measure}>
                        <label className="block text-[10px] uppercase tracking-widest text-stone-600 mb-1">{measure}</label>
                        <input
                          type="number"
                          value={(customMeasurements as any)[measure]}
                          onChange={e => setCustomMeasurements(prev => ({ ...prev, [measure]: e.target.value }))}
                          className="w-full border border-stone-300 px-2 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-brand"
                          placeholder="cm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 mb-6">
              <label className="text-xs font-semibold text-stone-700 tracking-widest uppercase">{t('modal.quantity')}</label>
              <div className="flex items-center border border-stone-300 overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                >−</button>
                <span className="w-10 text-center text-stone-800 font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                >+</button>
              </div>
              {!outOfStock && product.stock <= 5 && (
                <span className="text-[10px] text-brand">{product.stock} {locale === 'en' ? 'left' : 'over'}</span>
              )}
            </div>

            <button
              onClick={handleAdd}
              disabled={outOfStock}
              className={`w-full py-4 text-sm tracking-widest uppercase font-medium transition-all duration-300 ${
                outOfStock
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-stone-800 hover:bg-brand text-white'
              }`}
            >
              {outOfStock
                ? (locale === 'en' ? 'Out of Stock' : 'Uitverkocht')
                : t('modal.addToCart')}
            </button>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-10 bg-white p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-semibold text-stone-700 tracking-wider uppercase" style={{ fontFamily: "'EB Garamond', serif" }}>
                {t('review.sectionTitle')}
              </h2>
              {productReviews.length > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <StarRating rating={Math.round(avgRating)} size={14} />
                  <span className="text-xs text-stone-500">
                    {avgRating} ({productReviews.length})
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="text-xs tracking-widest uppercase text-brand border border-brand px-4 py-2 hover:bg-brand transition-all"
            >
              {showReviewForm ? t('review.cancel') : t('review.write')}
            </button>
          </div>

          {showReviewForm && (
            <div className="mb-6 p-4 bg-stone-50 border border-stone-200">
              <label className="block text-xs font-semibold text-stone-700 mb-2 tracking-wider uppercase">
                {t('review.yourName')}
              </label>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full border-0 border-b border-stone-300 bg-transparent px-0 py-2 text-sm text-stone-700 focus:outline-none focus:border-brand"
                placeholder={t('review.namePlaceholder')}
              />
              <label className="block text-xs font-semibold text-stone-700 mt-4 mb-2 tracking-wider uppercase">
                {t('review.yourRating')}
              </label>
              <StarRating rating={newRating} onChange={setNewRating} size={24} />
              <label className="block text-xs font-semibold text-stone-700 mt-4 mb-2 tracking-wider uppercase">
                {t('review.yourReview')}
              </label>
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                rows={3}
                className="w-full border border-stone-300 p-3 text-sm text-stone-700 focus:outline-none focus:border-brand resize-none"
                placeholder={t('review.placeholder')}
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleSubmitReview}
                  disabled={!newName.trim() || newRating === 0 || !newComment.trim()}
                  className="text-xs tracking-widest uppercase bg-brand text-white px-6 py-2.5 hover:bg-brand disabled:bg-stone-300 disabled:cursor-not-allowed transition-all"
                >
                  {t('review.submit')}
                </button>
              </div>
            </div>
          )}

          {productReviews.length === 0 ? (
            <p className="text-xs text-stone-400 text-center py-4">
              {t('review.empty')}
            </p>
          ) : (
            <div className="space-y-4">
              {productReviews.map(r => (
                <div key={r.id} className="border-b border-stone-100 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-stone-700">{r.userName}</span>
                    <span className="text-[10px] text-stone-400">{new Date(r.createdAt).toLocaleDateString(locale === 'nl' ? 'nl-NL' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <StarRating rating={r.rating} size={12} />
                  <p className="text-sm text-stone-600 mt-1 leading-relaxed">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="text-sm font-semibold text-stone-700 mb-4 tracking-wider uppercase" style={{ fontFamily: "'EB Garamond', serif" }}>
              {locale === 'en' ? 'You May Also Like' : 'Dit vindt u misschien ook leuk'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map(r => (
                <Link
                  key={r.id}
                  to={localizePath(`/product/${r.slug}`, locale)}
                  onClick={() => setActiveCategory(r.category)}
                  className="group bg-white overflow-hidden transition-all duration-300"
                >
                  <div className="aspect-[3/4] bg-stone-100 overflow-hidden">
                    <img src={r.image} alt={productAlt(r, locale)} loading="lazy" width={600} height={800} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-medium text-stone-700 truncate">{locale === 'en' && r.nameEn ? r.nameEn : r.name}</p>
                    <p className="text-xs text-stone-500">{formatPrice(r.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {showSizeGuide && <SizeGuide onClose={() => setShowSizeGuide(false)} />}
    </div>
  );
}

function HelmetScripts({ productJsonLd, breadcrumbJsonLd }: { productJsonLd: object; breadcrumbJsonLd: object }) {
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(productJsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
    </Helmet>
  );
}