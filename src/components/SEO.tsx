import { Helmet } from 'react-helmet-async';
import { useTranslation } from '../context/LanguageContext';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  productPrice?: string;
}

export default function SEO({
  title,
  description,
  image,
  url,
  type = 'website',
  productPrice,
}: SEOProps) {
  const { t } = useTranslation();
  const siteName = 'Maison Tislit';
  const fullTitle = title ? `${title} | ${siteName}` : t('seo.homeTitle');
  const metaDescription = description || t('seo.homeDescription');
  const metaImage = image || '/images/hero-bg.webp';
  const metaUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={metaUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {productPrice && (
        <meta property="product:price:amount" content={productPrice} />
      )}
    </Helmet>
  );
}
