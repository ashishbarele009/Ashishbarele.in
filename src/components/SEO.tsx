/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Helmet } from 'react-helmet-async';
import { useFirestoreCollection, useImage } from '../hooks/useFirestore';
import { SEOData, BiographyData } from '../types';
import { useBranding } from './layout/BrandingProvider';
import { getVersionedCloudinaryUrl } from '../lib/cloudinary';

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
  const { branding } = useBranding();

  // Fetch the latest profile image URL from Cloudinary (stored via Firebase)
  const { data: profileImage } = useImage('Biography', 'Profile');
  const { data: bioData } = useFirestoreCollection<BiographyData>('biography');
  const bio = bioData[0];

  const rawProfileUrl = profileImage?.secure_url || bio?.profileImageUrl || '';
  const profileImageUpdatedAt = profileImage?.updatedAt || bio?.updatedAt || null;
  const versionedProfileImage = rawProfileUrl ? getVersionedCloudinaryUrl(rawProfileUrl, profileImageUpdatedAt) : '';

  const siteTitle = title 
    ? `${title} | ${branding.siteName}` 
    : (branding.browserTitle 
        ? `${branding.siteName} | ${branding.browserTitle}` 
        : (dbSeo?.metaTitle || 'ASHISHBARELE | Official Artist Website')
      );
  const siteDescription = description || dbSeo?.metaDescription || 'Independent Music Artist, Songwriter and Rapper from Maharashtra.';
  const siteKeywords = keywords || dbSeo?.keywords || 'Ashish Barele, ASHISHBARELE, Music, Rap, Hip Hop';
  
  // Use the secure, versioned profile image by default for og:image and twitter:image
  const siteOgImage = ogImage || versionedProfileImage || dbSeo?.ogImage || branding.logoUrl || '';
  const siteCanonical = canonical || dbSeo?.canonicalUrl || 'https://ashishbarele.in';

  // Structured schemas to optimize Google Search, Google Images, and Google Knowledge Panel
  const schemaData = [
    {
      "@context": "https://schema.org",
      "@type": "MusicArtist",
      "name": branding.siteName || "ASHISHBARELE",
      "alternateName": "Ashish Barele",
      "url": siteCanonical,
      "description": siteDescription,
      "image": siteOgImage,
      "genre": ["Hindi Pop", "Hindi Rap", "Hip-Hop", "Lo-fi"],
      "sameAs": [
        "https://www.instagram.com/ashishbarele09",
        "https://www.youtube.com/@ASHISHBARELE"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": `${siteCanonical}/#person`,
      "name": "Ashish Barele",
      "alternateName": "ASHISHBARELE",
      "url": siteCanonical,
      "image": {
        "@type": "ImageObject",
        "url": siteOgImage,
        "caption": "Ashish Barele (ASHISHBARELE) – Independent Indian Music Artist"
      },
      "description": siteDescription,
      "jobTitle": "Independent Indian Music Artist, Songwriter and Rapper",
      "sameAs": [
        "https://www.instagram.com/ashishbarele09",
        "https://www.youtube.com/@ASHISHBARELE"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${siteCanonical}/#organization`,
      "name": branding.siteName || "ASHISHBARELE",
      "url": siteCanonical,
      "logo": {
        "@type": "ImageObject",
        "url": siteOgImage,
        "caption": "Ashish Barele (ASHISHBARELE) – Independent Indian Music Artist"
      },
      "sameAs": [
        "https://www.instagram.com/ashishbarele09",
        "https://www.youtube.com/@ASHISHBARELE"
      ]
    }
  ];

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
      <meta property="og:image:secure_url" content={siteOgImage} />
      <meta property="og:image:alt" content="Ashish Barele (ASHISHBARELE) – Independent Indian Music Artist" />
      <meta property="og:url" content={siteCanonical} />

      {/* Twitter */}
      <meta name="twitter:card" content={dbSeo?.twitterCard || "summary_large_image"} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={siteOgImage} />
      <meta name="twitter:image:alt" content="Ashish Barele (ASHISHBARELE) – Independent Indian Music Artist" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
}
