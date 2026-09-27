import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';
import { localizePath } from '../context/LanguageContext';
import { Scissors, Leaf, Package, Gem, Heart } from 'lucide-react';
import flyHeartToCart from '../utils/flyHeartToCart';
import { productAlt } from '../utils/productAlt';
import { useScrollReveal, useStaggerReveal } from '../utils/animations';
import SEO from '../components/SEO';

const badgeKey = (badge: string): string => {
  const map: Record<string, string> = {
    'Bestseller': 'badge.bestseller',
    'Nouveau': 'badge.nouveau',
    'Premium': 'badge.premium',
    'Collection Spéciale': 'badge.collectionSpeciale',
  };
  return map[badge] || badge;
};

export default function HomePage() {
  const { setCurrentPage, products, isInWishlist, toggleWishlist, showToast, formatPrice } = useApp();
  const { t, locale } = useTranslation();
  const storyRef = useScrollReveal<HTMLDivElement>();
  const categoriesRef = useStaggerReveal<HTMLDivElement>(0.15);
  const featuredRef = useStaggerReveal<HTMLDivElement>(0.12);
  const whyRef = useScrollReveal<HTMLDivElement>();
  const heroRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoBlocked, setVideoBlocked] = useState(false);

  // Preload hero poster image for fastest LCP (only on this page)
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = '/images/hero-bg.webp';
    link.fetchPriority = 'high';
    document.head.appendChild(link);
    return () => link.remove();
  }, []);

  // Handle video autoplay and muting (React bug workaround).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // React bug workaround: explicitly set muted before playing
    video.defaultMuted = true;
    video.muted = true;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn("Autoplay blocked by browser:", error);
        setVideoBlocked(true);
      });
    }
  }, []);

  const playVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {});
    setVideoBlocked(false);
  };

  // Tiles link to the indexable category pages (/en/shop/djellaba, ...)
  // objectPosition shifts the 600x400 center-crop window down from the
  // face so the frame starts at the neck (was cutting heads/necks off).
  const categories: { slug: string; name: string; description: string; image: string; objectPosition: string }[] = [
    {
      slug: 'djellaba',
      name: 'Djellaba',
      description: t('home.catDjellabaDesc'),
      image: '/images/jellaba.jpeg',
      objectPosition: '50% 20%',
    },
    {
      slug: 'caftan',
      name: 'Caftan',
      description: t('home.catCaftanDesc'),
      image: '/images/brides1.jpeg',
      objectPosition: '50% 22%',
    },
    {
      slug: 'gandoura',
      name: 'Gandoura',
      description: t('home.catGandouraDesc'),
      image: '/images/gandoura-bleu-majorelle.jpeg',
      objectPosition: '50% 12%',
    },
  ];

  const featured = products.filter(p => p.badge);

  return (
    <div className="pt-20">
      <SEO title={t('seo.homeTitle')} description={t('seo.homeDescription')} />
      {/* Hero Section */}
      <section className="relative min-h-[90vh] overflow-hidden">
        {/* Poster image shown immediately (preloaded) — drives LCP */}
        <img
          src="/images/hero-bg.webp"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          loading="eager"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Video plays automatically */}
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          autoPlay
          poster="/images/hero-bg.webp"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/images/HERO.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-900/50 to-transparent"         />

        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d97706' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Play button overlay — shown when browser blocks autoplay (e.g. Brave) */}
        {videoBlocked && (
          <button
            onClick={playVideo}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-sm cursor-pointer transition-opacity"
            aria-label="Play video"
          >
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/50 hover:bg-white/30 hover:scale-110 transition-all duration-300">
              <svg viewBox="0 0 24 24" className="w-10 h-10 text-white fill-current ml-1">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[90vh] flex items-center py-20" ref={heroRef}>
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12" style={{ backgroundColor: '#B4A180' }} />
              <span className="text-xs tracking-[0.4em] uppercase font-light" style={{ fontFamily: "'Raleway', sans-serif", color: '#B4A180' }}>
                {t('home.collection2025')}
              </span>
            </div>

            <h1 className="text-white mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              <span className="block text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                {t('home.heroTitle1')}
              </span>
              <span className="block text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight" style={{ color: '#B4A180' }}>
                {t('home.heroTitle2')}
              </span>
              <span className="block text-5xl sm:text-6xl lg:text-7xl font-bold italic leading-tight text-white">
                {t('home.heroTitle3')}
              </span>
            </h1>

            <p className="text-white/80 text-sm leading-relaxed mb-10 max-w-[420px] font-light"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {t('home.heroDesc')}
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setCurrentPage('shop')}
                className="hero-btn bg-[#1a1208] hover:bg-[#2a1f10] text-[#B4A180] px-8 py-4 text-sm tracking-widest uppercase font-medium transition-all duration-300 hover:shadow-lg hover:shadow-brand/30 hover:-translate-y-0.5"
                style={{ fontFamily: "'Raleway', sans-serif" }}
              >
                {t('home.discoverShop')}
              </button>
              <button
                onClick={() => setCurrentPage('shop')}
                className="hero-btn border border-white/30 text-white hover:border-brand hover:text-brand px-8 py-4 text-sm tracking-widest uppercase font-medium transition-all duration-300"
                style={{ fontFamily: "'Raleway', sans-serif" }}
              >
                {t('home.newCollection')}
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-stone-400">
          <span className="text-xs tracking-widest uppercase">{t('home.scroll')}</span>
          <div className="w-px h-10 bg-gradient-to-b from-stone-400 to-transparent animate-pulse" />
        </div>
      </section>

      {/* Brand Story */}
      <section className="bg-stone-50 py-20 px-6" ref={storyRef}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 bg-brand" />
            <span className="text-brand text-xs tracking-[0.4em] uppercase" style={{ fontFamily: "'Raleway', sans-serif" }}>{t('home.ourStory')}</span>
            <div className="h-px w-16 bg-brand" />
          </div>
          <h2 className="text-4xl font-bold text-stone-800 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            {t('home.storyTitle').split('_')[0]}<em className="italic text-brand">{t('home.storyTitle').split('_')[1] || ''}</em>
          </h2>
          <p className="text-stone-600 text-lg leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {t('home.storyLine1')}
          </p>
          <p className="text-stone-600 text-lg leading-relaxed mt-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {t('home.storyLine2')}
          </p>
          <p className="text-stone-600 text-lg leading-relaxed mt-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {t('home.storyLine3')}
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-16 bg-brand" />
              <span className="text-brand text-xs tracking-[0.4em] uppercase" style={{ fontFamily: "'Raleway', sans-serif" }}>{t('home.ourCategories')}</span>
              <div className="h-px w-16 bg-brand" />
            </div>
            <h2 className="text-4xl font-bold text-stone-800" style={{ fontFamily: "'Playfair Display', serif" }}>
              {t('home.chooseStyle')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" ref={categoriesRef}>
            {categories.map(cat => (
              <Link
                key={cat.slug}
                to={localizePath(`/shop/${cat.slug}`, locale)}
                className="relative overflow-hidden rounded-lg p-10 text-left group hover:scale-[1.02] transition-all duration-300 shadow-md hover:shadow-xl"
                style={{ minHeight: '280px' }}
              >
                {/* Real img tag enables lazy loading & prevents layout shift */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  width={600}
                  height={400}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ objectPosition: cat.objectPosition }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-900/50 to-stone-900/30 group-hover:from-stone-950/90 transition-all duration-300" />
                <div className="relative z-10">
                  <h3 className="text-white text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {cat.name}
                  </h3>
                  <p className="text-white/80 text-sm mb-6">{cat.description}</p>
                  <span className="text-white text-xs tracking-widest uppercase border border-white/40 px-4 py-2 rounded group-hover:bg-white/10 transition-colors">
                    {t('home.explore')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-6 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-16 bg-brand" />
              <span className="text-brand text-xs tracking-[0.4em] uppercase" style={{ fontFamily: "'Raleway', sans-serif" }}>{t('home.selection')}</span>
              <div className="h-px w-16 bg-brand" />
            </div>
            <h2 className="text-4xl font-bold text-stone-800" style={{ fontFamily: "'Playfair Display', serif" }}>
              {t('home.exceptionalPieces')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" ref={featuredRef}>
            {featured.map(product => (
              <div key={product.id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
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
                </div>
                <div className="p-5">
                  <span className="text-brand text-xs tracking-widest uppercase mb-1 block">{product.category}</span>
                  <h3 className="text-stone-800 font-semibold text-lg mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {locale === 'en' && product.nameEn ? product.nameEn : product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-stone-900 font-bold text-xl">{formatPrice(product.price)}</span>
                    </div>
                    <button
                      onClick={() => setCurrentPage('shop')}
                      className="bg-stone-800 hover:bg-brand text-white text-xs px-4 py-2 rounded tracking-wider transition-colors"
                    >
                      {t('home.view')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => setCurrentPage('shop')}
              className="border-2 border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-white px-10 py-4 text-sm tracking-widest uppercase font-medium transition-all duration-300"
              style={{ fontFamily: "'Raleway', sans-serif" }}
            >
              {t('home.seeAllCollection')}
            </button>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-20 px-6 bg-stone-800 text-white" ref={whyRef}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-brand mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              {t('home.excellence')}
            </h2>
            <p className="text-stone-300">{t('home.whatMakesUsUnique')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Scissors size={32} color="#B4A180" />, titleKey: 'why.artisanat.title', descKey: 'why.artisanat.desc' },
              { icon: <Leaf size={32} color="#B4A180" />, titleKey: 'why.matieres.title', descKey: 'why.matieres.desc' },
              { icon: <Package size={32} color="#B4A180" />, titleKey: 'why.livraison.title', descKey: 'why.livraison.desc' },
              { icon: <Gem size={32} color="#B4A180" />, titleKey: 'why.surMesure.title', descKey: 'why.surMesure.desc' },
            ].map(item => (
              <div key={item.titleKey} className="text-center p-6">
                <div className="mb-4 flex justify-center">{item.icon}</div>
                <h3 className="text-brand font-semibold text-lg mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {t(item.titleKey)}
                </h3>
                <p className="text-stone-400 text-sm leading-relaxed">{t(item.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
