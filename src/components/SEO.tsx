/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Helmet } from 'react-helmet-async';
import { useFirestoreCollection } from '../hooks/useFirestore';
import { SEOData } from '../types';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
}

export default function SEO({ title, description, keywords, ogImage, canonical }: SEOProps) {
  const { data: seoData } = useFirestoreCollection<SEOData>('seo');
  const dbSeo = seoData[0];

  const siteTitle = title ? `${title} | ASHISHBARELE` : (dbSeo?.metaTitle || 'ASHISHBARELE | Official Website');
  const siteDescription = description || dbSeo?.metaDescription || 'Independent Music Artist, Songwriter and Rapper from Maharashtra.';
  const siteKeywords = keywords || dbSeo?.keywords || 'Ashish Barele, ASHISHBARELE, Music, Rap, Hip Hop';
  const siteOgImage = ogImage || dbSeo?.ogImage || '';
  const siteCanonical = canonical || dbSeo?.canonicalUrl || 'https://ashishbarele.in';

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "MusicArtist",
    "name": "ASHISHBARELE",
    "alternateName": "Ashish Barele",
    "url": siteCanonical,
    "description": siteDescription,
    "image": siteOgImage,
    "genre": ["Hindi Pop", "Hindi Rap", "Hip-Hop", "Lo-fi"],
    "sameAs": [
      "https://www.instagram.com/ashishbarele09",
      "https://www.youtube.com/@ASHISHBARELE"
    ]
  };

  return (
    <Helmet>
      <title>{siteTitle}</title>
      <meta name="description" content={siteDescription} />
      <meta name="keywords" content={siteKeywords} />
      <link rel="canonical" href={siteCanonical} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={siteOgImage} />
      <meta property="og:url" content={siteCanonical} />

      {/* Twitter */}
      <meta name="twitter:card" content={dbSeo?.twitterCard || "summary_large_image"} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={siteOgImage} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
}
