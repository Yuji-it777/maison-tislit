import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useTranslation, stripLocale, localizePath } from '../context/LanguageContext';
import { SITE_URL } from '../config';

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
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const siteName = 'Maison Tislit';
  const fullTitle = title ? `${title} | ${siteName}` : t('seo.homeTitle');
  const metaDescription = description || t('seo.homeDescription');
  const metaImage = image || '/images/hero-bg.webp';

  const canonical =
    url || (typeof window !== 'undefined'
      ? `${SITE_URL}${window.location.pathname}${window.location.search}`
      : SITE_URL);

  const basePath = stripLocale(pathname);
  const alternateHref = (l: 'en' | 'nl') => `${SITE_URL}${localizePath(basePath, l)}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={canonical} />

      {/* hreflang alternates (indexable pages only) — array, not fragment: react-helmet-async drops fragments */}
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
