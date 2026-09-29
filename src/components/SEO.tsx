import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useTranslation, stripLocale, localizePath } from '../context/LanguageContext';
import { SITE_URL } from '../config';

// Admin routes live outside the locale tree; keep them out of locale-aware
// canonical/hreflang derivation (localizePath already special-cases /admin).
function isNonLocalizable(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  productPrice?: string;
  noindex?: boolean;
}

export default function SEO({
  title,
  description,
  image,
  url,
  type = 'website',
  productPrice,
  noindex = false,
}: SEOProps) {
  const { t, locale } = useTranslation();
  const { pathname } = useLocation();
  const siteName = 'Maison Tislit';
  // Brand-first titles: "Maison Tislit | Page". If the supplied title already
  // starts with the brand (e.g. seo.homeTitle), use it verbatim to avoid
  // "Maison Tislit | Maison Tislit …".
  const fullTitle = title
    ? title.startsWith(siteName)
      ? title
      : `${siteName} | ${title}`
    : t('seo.homeTitle');
  const metaDescription = description || t('seo.homeDescription');
  const toAbsoluteUrl = (path: string) =>
    /^https?:\/\//i.test(path) ? path : `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  const metaImage = toAbsoluteUrl(image || '/images/hero-bg.webp');

  // Self-referencing canonical, absolute URL. Explicit `url` prop wins (product
  // pages); otherwise derive from the current location, normalized to the
  // canonical (slashed, locale-prefixed) form — query strings are dropped so
  // /en/shop?ref=x and /en/shop share one canonical, matching prerender.mjs.
  const canonical =
    url ||
    (isNonLocalizable(pathname)
      ? `${SITE_URL}${pathname}`
      : `${SITE_URL}${localizePath(stripLocale(pathname), locale)}`);

  const basePath = stripLocale(pathname);
  const alternateHref = (l: 'en' | 'nl') => `${SITE_URL}${localizePath(basePath, l)}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={canonical} />

      {/* hreflang alternates (indexable pages only; noindex pages excluded) — array, not fragment: react-helmet-async drops fragments */}
      {!noindex && [
        <link key="alt-en" rel="alternate" hrefLang="en" href={alternateHref('en')} />,
        <link key="alt-nl" rel="alternate" hrefLang="nl" href={alternateHref('nl')} />,
        <link key="alt-x-default" rel="alternate" hrefLang="x-default" href={alternateHref('en')} />,
      ]}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {productPrice && [
        <meta key="price-amount" property="product:price:amount" content={productPrice} />,
        <meta key="price-currency" property="product:price:currency" content="EUR" />,
      ]}
    </Helmet>
  );
}
