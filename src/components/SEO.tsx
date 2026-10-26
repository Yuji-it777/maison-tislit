import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useTranslation, stripLocale, localizePath } from '../context/LanguageContext';
import { SITE_URL } from '../config';

// Admin routes live outside the locale tree; keep them out of locale-aware
// canonical/hreflang derivation (localizePath already special-cases /admin).
function isNonLocalizable(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

// Truncate without cutting mid-word so the rendered string never exceeds `max` chars.
export function truncateWords(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return lastSpace > 0 ? cut.slice(0, lastSpace) : cut;
}

// Build a product meta description: "{productName} by Maison Tislit — {productDesc}".
// If it exceeds `max`, cut at the last sentence end (". ") that fits; otherwise cut
// at the last whole word (leaving room for "…") and append "…". Never end on a
// connector word (of, and, or, a).
export function truncateProductMeta(s: string, max = 155): string {
  if (s.length <= max) return s;
  const connectors = new Set(['of', 'and', 'or', 'a']);

  // 1. End at a sentence boundary (". ") whose period fits within max.
  let boundaryEnd = -1;
  let pos = 0;
  while ((pos = s.indexOf('. ', pos)) !== -1) {
    if (pos + 1 <= max) boundaryEnd = pos + 1; // include the period
    pos += 2;
  }
  if (boundaryEnd > 0) {
    const out = stripTrailingConnector(s.slice(0, boundaryEnd), connectors);
    if (out) return out;
  }

  // 2. Fall back to the last whole word within max - 1 (room for "…").
  const budget = max - 1;
  const cut = s.slice(0, budget);
  const ls = cut.lastIndexOf(' ');
  let out = ls > 0 ? cut.slice(0, ls) : cut;
  out = stripTrailingConnector(out, connectors) || out;
  return out + '…';
}

function stripTrailingConnector(s: string, connectors: Set<string>): string {
  let t = s.replace(/[.]+$/, '').trimEnd();
  const words = t.split(/\s+/);
  while (words.length > 0 && connectors.has(words[words.length - 1].toLowerCase())) {
    words.pop();
  }
  if (words.length === 0) return '';
  return words.join(' ') + '.';
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
  type,
  productPrice,
  noindex = false,
}: SEOProps) {
  const { t, locale } = useTranslation();
  const { pathname } = useLocation();
  const siteName = 'Maison Tislit';
  const MAX_TITLE = 60;
  const truncateTitle = (s: string): string => truncateWords(s, MAX_TITLE);
  // Brand-first titles: "Maison Tislit | Page". If the supplied title already
  // starts with the brand (e.g. seo.homeTitle), use it verbatim to avoid
  // "Maison Tislit | Maison Tislit …".
  const fullTitle = truncateTitle(
    title
      ? title.startsWith(siteName)
        ? title
        : `${siteName} | ${title}`
      : t('seo.homeTitle')
  );
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
