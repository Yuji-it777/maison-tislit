import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { useApp, MAD_PER_EUR } from '../context/AppContext';
import { useTranslation, localizePath } from '../context/LanguageContext';
import { productAlt, productName, productDescription } from '../utils/productAlt';
import { productMedia, mediaKindIndexes } from '../utils/productMedia';
import { Play } from 'lucide-react';
import SizeGuide from './SizeGuide';
import StarRating from './StarRating';
import SEO from './SEO';

interface Props {
  product: Product;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: Props) {
  const navigate = useNavigate();
  const { addToCart, products, reviews, fetchProductReviews, addReview, showToast, formatPrice } = useApp();
  const { t, locale } = useTranslation();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [customMeasurements, setCustomMeasurements] = useState({
    shoulders: '', bust: '', waist: '', hips: '', length: ''
  });

  const productReviews = reviews.filter(r => r.productId === product.id);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [newName, setNewName] = useState('');

  useEffect(() => { fetchProductReviews(product.id); }, [product.id, fetchProductReviews]);

  useEffect(() => { setMediaIndex(0); }, [product.id]);

  const outOfStock = product.stock <= 0;
  const media = productMedia(product);
  const mediaNumbers = mediaKindIndexes(media);
  const activeMedia = media[mediaIndex] ?? { type: 'photo' as const, src: product.image };

  const avgRating = productReviews.length
    ? Math.round((productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length) * 10) / 10
    : 0;

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
    
    // Check if custom measurements are required and filled
    if (selectedSize === 'Custom') {
      if (!customMeasurements.shoulders || !customMeasurements.bust || !customMeasurements.waist || !customMeasurements.hips || !customMeasurements.length) {
        showToast(locale === 'en' ? 'Please fill all custom measurements' : 'Vul alle persoonlijke maten in', 'error');
        return;
      }
      addToCart(product, selectedSize, selectedColor, quantity, customMeasurements);
    } else {
      addToCart(product, selectedSize, selectedColor, quantity);
    }
    onClose();
  };

  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return createPortal(
    <>
      <SEO
        title={productName(product, locale)}
        description={productDescription(product, locale)}
        image={product.image}
        type="product"
        productPrice={(product.price / MAD_PER_EUR).toFixed(2)}
      />
      <div
        className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm overflow-y-auto"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="min-h-full flex items-center justify-center p-4 py-8">
        <div className="bg-white max-w-4xl w-full" onClick={e => e.stopPropagation()}>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="bg-stone-100 md:min-h-[500px] flex flex-col">
              <div className="relative flex-1 aspect-[3/4] md:aspect-auto overflow-hidden">
                {activeMedia.type === 'video' ? (
                  <video
                    key={activeMedia.src}
                    src={activeMedia.src}
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img src={activeMedia.src} alt={productAlt(product, locale)} loading="lazy" width={600} height={800} className="w-full h-full object-contain" />
                )}
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

              {media.length > 1 && (
                <div role="group" aria-label={t('product.mediaGroup')} className="flex gap-2 p-3 overflow-x-auto">
                  {media.map((item, i) => (
                    <button
                      key={`${item.src}-${i}`}
                      type="button"
                      onClick={() => setMediaIndex(i)}
                      aria-label={item.type === 'video'
                        ? `${t('product.videoLabel')} ${mediaNumbers[i]}: ${productName(product, locale)}`
                        : `${t('product.photoLabel')} ${mediaNumbers[i]}: ${productName(product, locale)}`}
                      aria-current={i === mediaIndex}
                      className={`relative w-14 aspect-[3/4] flex-shrink-0 overflow-hidden border transition-all ${
                        i === mediaIndex
                          ? 'border-brand ring-1 ring-brand'
                          : 'border-stone-200 opacity-80 hover:opacity-100 hover:border-stone-400'
                      }`}
                    >
                      {item.type === 'video' ? (
                        <>
                          <video src={`${item.src}#t=0.1`} preload="metadata" muted playsInline className="w-full h-full object-contain bg-stone-100" />
                          <span className="absolute inset-0 flex items-center justify-center bg-stone-900/30" aria-hidden="true">
                            <Play size={14} className="text-white" />
                          </span>
                        </>
                      ) : (
                        <img src={item.src} alt="" width={56} height={75} loading="lazy" className="w-full h-full object-contain bg-stone-100" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-8 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div />
                <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <span className="text-brand text-xs tracking-[0.3em] uppercase mb-2 capitalize" style={{ fontFamily: "'EB Garamond', serif" }}>
                {product.category}
              </span>
              <h2 className="text-2xl font-bold text-stone-800 mb-1" style={{ fontFamily: "'Cinzel', serif" }}>
                {productName(product, locale)}
              </h2>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-stone-900">{formatPrice(product.price)}</span>
              </div>

              <p className="text-stone-600 text-sm leading-relaxed mb-6">
                {productDescription(product, locale)}
              </p>

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
                            onChange={e => setCustomMeasurements(prev => ({...prev, [measure]: e.target.value}))}
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
          <div className="border-t border-stone-100 px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-semibold text-stone-700 tracking-wider uppercase" style={{ fontFamily: "'EB Garamond', serif" }}>
                  {t('review.sectionTitle')}
                </h3>
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
                  className="text-xs tracking-widest uppercase text-brand hover:text-brand border border-brand px-4 py-2 hover:bg-brand transition-all"
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
              <div className="space-y-4 max-h-[300px] overflow-y-auto">
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

          {related.length > 0 && (
            <div className="border-t border-stone-100 px-8 py-6">
              <h3 className="text-sm font-semibold text-stone-700 mb-4 tracking-wider uppercase" style={{ fontFamily: "'EB Garamond', serif" }}>
                {locale === 'en' ? 'You May Also Like' : 'Dit vindt u misschien ook leuk'}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {related.map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      onClose();
                      navigate(localizePath(`/product/${r.slug}`, locale));
                    }}
                    className="group text-left"
                  >
                    <div className="aspect-[3/4] bg-stone-100 overflow-hidden mb-2">
                      <img src={r.image} alt={productAlt(r, locale)} loading="lazy" width={600} height={800} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <p className="text-xs font-medium text-stone-700 truncate">{productName(r, locale)}</p>
                    <p className="text-xs text-stone-500">{formatPrice(r.price)}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

      {showSizeGuide && <SizeGuide onClose={() => setShowSizeGuide(false)} />}
    </>,
    document.body
  );
}
