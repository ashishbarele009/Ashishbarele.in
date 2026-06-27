import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../dist');
const SITE_URL = 'https://ashishbarele.in';

// Helper to get versioned Cloudinary URL
function getVersionedCloudinaryUrl(url, updatedAt) {
  if (!url) return '';
  let secureUrl = url.replace(/^http:/i, 'https:');
  secureUrl = secureUrl.split('?')[0]; // Strip existing queries

  let t = Date.now();
  if (updatedAt) {
    if (typeof updatedAt.toDate === 'function') {
      t = updatedAt.toDate().getTime();
    } else if (updatedAt.seconds) {
      t = updatedAt.seconds * 1000;
    } else if (updatedAt instanceof Date) {
      t = updatedAt.getTime();
    } else {
      const parsed = new Date(updatedAt).getTime();
      if (!isNaN(parsed)) t = parsed;
    }
  }

  if (secureUrl.includes('/image/upload/')) {
    const parts = secureUrl.split('/image/upload/');
    const pathAfterUpload = parts[1];
    const versionMatch = pathAfterUpload.match(/^v\d+\//);
    if (versionMatch) {
      const newPath = pathAfterUpload.replace(/^v\d+\//, `v${t}/`);
      return `${parts[0]}/image/upload/${newPath}`;
    } else {
      return `${parts[0]}/image/upload/v${t}/${pathAfterUpload}`;
    }
  }
  return `${secureUrl}?v=${t}`;
}

async function runPrerender() {
  console.log('--- Starting SEO Static Prerendering ---');
  
  const templatePath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error(`Error: Base index.html not found at ${templatePath}. Ensure "vite build" runs before prerendering.`);
    process.exit(1);
  }
  
  const templateHtml = fs.readFileSync(templatePath, 'utf8');

  // 1. Initialize Firebase & Fetch Latest Data
  let firebaseConfig = {};
  let db;
  let profileImageUrl = '';
  let imageUpdatedAt = Date.now();
  let dbSeo = {};
  let branding = {
    siteName: 'ASHISHBARELE',
    browserTitle: 'Official Artist Website'
  };

  try {
    const configPath = path.resolve(__dirname, '../firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const app = initializeApp(firebaseConfig);
      db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

      console.log('Firebase initialized for static prerendering.');

      // Fetch Profile Image
      const q = query(
        collection(db, 'images'),
        where('pageName', '==', 'Biography'),
        where('sectionName', '==', 'Profile')
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        if (docData.secure_url) {
          profileImageUrl = docData.secure_url;
          if (docData.updatedAt) {
            imageUpdatedAt = docData.updatedAt.seconds 
              ? docData.updatedAt.seconds * 1000 
              : new Date(docData.updatedAt).getTime() || Date.now();
          }
          console.log(`Prerender: Fetched profile image from 'images' collection: ${profileImageUrl}`);
        }
      } else {
        // Fallback biography
        const bioQ = query(collection(db, 'biography'));
        const bioSnapshot = await getDocs(bioQ);
        if (!bioSnapshot.empty) {
          const bioData = bioSnapshot.docs[0].data();
          if (bioData.profileImageUrl) {
            profileImageUrl = bioData.profileImageUrl;
            if (bioData.updatedAt) {
              imageUpdatedAt = bioData.updatedAt.seconds
                ? bioData.updatedAt.seconds * 1000
                : new Date(bioData.updatedAt).getTime() || Date.now();
            }
            console.log(`Prerender: Fetched profile image from 'biography' collection: ${profileImageUrl}`);
          }
        }
      }

      // Fetch Branding settings
      const brandingDoc = await getDoc(doc(db, 'settings', 'branding'));
      if (brandingDoc.exists()) {
        const brandingData = brandingDoc.data();
        branding.siteName = brandingData.siteName || 'ASHISHBARELE';
        branding.browserTitle = brandingData.browserTitle || 'Official Artist Website';
        console.log(`Prerender: Fetched branding settings:`, branding);
      }

      // Fetch SEO settings
      const seoSnapshot = await getDocs(collection(db, 'seo'));
      if (!seoSnapshot.empty) {
        dbSeo = seoSnapshot.docs[0].data();
        console.log(`Prerender: Fetched SEO settings:`, dbSeo);
      }
    }
  } catch (err) {
    console.warn('Prerender Warning: Could not fetch data from Firestore. Using fallbacks. Error:', err.message);
  }

  // Use fallback if still empty
  const secureProfileImageUrl = profileImageUrl 
    ? getVersionedCloudinaryUrl(profileImageUrl, imageUpdatedAt)
    : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop';

  console.log(`Using Cloudinary secure versioned URL for all SEO items: ${secureProfileImageUrl}`);

  // 2. Define SEO Configurations per page
  const pages = [
    {
      route: '/',
      title: `${branding.siteName} | ${branding.browserTitle}`,
      description: dbSeo.metaDescription || 'Official Artist Website of ASHISHBARELE - Independent Indian Music Artist, Songwriter and Rapper.',
      keywords: dbSeo.keywords || 'Ashish Barele, ASHISHBARELE, Music, Rap, Hip Hop, Indian Artist',
      canonical: SITE_URL
    },
    {
      route: '/about',
      title: `About | ${branding.siteName}`,
      description: 'The journey, mission and values behind the music of independent artist ASHISHBARELE.',
      keywords: 'Ashish Barele, Biography, Indian Rapper, Dharni Maharashtra, Independent Artist',
      canonical: `${SITE_URL}/about`
    },
    {
      route: '/music',
      title: `Music | ${branding.siteName}`,
      description: 'Explore the latest tracks, singles and albums by ASHISHBARELE.',
      keywords: 'Ashish Barele songs, ASHISHBARELE rap tracks, independent Indian music releases',
      canonical: `${SITE_URL}/music`
    },
    {
      route: '/videos',
      title: `Videos | ${branding.siteName}`,
      description: 'Watch official music videos, live performances and behind the scenes of ASHISHBARELE.',
      keywords: 'Ashish Barele music video, YouTube rap video, live show performance, ASHISHBARELE video',
      canonical: `${SITE_URL}/videos`
    },
    {
      route: '/gallery',
      title: `Gallery | ${branding.siteName}`,
      description: 'Official photo gallery of ASHISHBARELE featuring live shows, studio sessions and more.',
      keywords: 'Ashish Barele photos, live performance gallery, studio session pictures',
      canonical: `${SITE_URL}/gallery`
    },
    {
      route: '/contact',
      title: `Contact | ${branding.siteName}`,
      description: 'Get in touch with ASHISHBARELE for bookings, collaborations, and inquiries.',
      keywords: 'Ashish Barele contact, book ASHISHBARELE, collaboration booking',
      canonical: `${SITE_URL}/contact`
    }
  ];

  // 3. Generate pages
  for (const page of pages) {
    const isRoot = page.route === '/';
    const pageTitle = page.title;
    const pageDesc = page.description;
    const pageKeys = page.keywords;
    const pageCanonical = page.canonical;
    const pageImage = secureProfileImageUrl;
    const imageAltText = "Ashish Barele (ASHISHBARELE) – Independent Indian Music Artist";

    // Build structured data schemas
    const schemas = [
      {
        "@context": "https://schema.org",
        "@type": "MusicArtist",
        "name": branding.siteName || "ASHISHBARELE",
        "alternateName": "Ashish Barele",
        "url": SITE_URL,
        "description": pageDesc,
        "image": pageImage,
        "genre": ["Hindi Pop", "Hindi Rap", "Hip-Hop", "Lo-fi"],
        "sameAs": [
          "https://www.instagram.com/ashishbarele09",
          "https://www.youtube.com/@ASHISHBARELE"
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        "name": "Ashish Barele",
        "alternateName": "ASHISHBARELE",
        "url": SITE_URL,
        "image": {
          "@type": "ImageObject",
          "url": pageImage,
          "caption": imageAltText
        },
        "description": pageDesc,
        "jobTitle": "Independent Indian Music Artist, Songwriter and Rapper",
        "sameAs": [
          "https://www.instagram.com/ashishbarele09",
          "https://www.youtube.com/@ASHISHBARELE"
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        "name": branding.siteName || "ASHISHBARELE",
        "url": SITE_URL,
        "logo": {
          "@type": "ImageObject",
          "url": pageImage,
          "caption": imageAltText
        },
        "sameAs": [
          "https://www.instagram.com/ashishbarele09",
          "https://www.youtube.com/@ASHISHBARELE"
        ]
      }
    ];

    // Construct the head SEO block
    const seoBlock = `
    <!-- Server-Rendered SEO Metadata -->
    <title>${pageTitle}</title>
    <meta name="description" content="${pageDesc}" />
    <meta name="keywords" content="${pageKeys}" />
    <link rel="canonical" href="${pageCanonical}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${pageCanonical}" />
    <meta property="og:title" content="${pageTitle}" />
    <meta property="og:description" content="${pageDesc}" />
    <meta property="og:image" content="${pageImage}" />
    <meta property="og:image:secure_url" content="${pageImage}" />
    <meta property="og:image:alt" content="${imageAltText}" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${pageCanonical}" />
    <meta name="twitter:title" content="${pageTitle}" />
    <meta name="twitter:description" content="${pageDesc}" />
    <meta name="twitter:image" content="${pageImage}" />
    <meta name="twitter:image:alt" content="${imageAltText}" />
    
    <!-- Structured Data (JSON-LD) -->
    <script type="application/ld+json">
    ${JSON.stringify(schemas, null, 2)}
    </script>
    `;

    // Inject SEO block into the template HTML by replacing the old <title>
    let modifiedHtml = templateHtml;
    
    // Clean out any existing tags if present
    modifiedHtml = modifiedHtml.replace(/<title>.*?<\/title>/gi, '');
    modifiedHtml = modifiedHtml.replace(/<meta name="description".*?>/gi, '');
    modifiedHtml = modifiedHtml.replace(/<meta name="keywords".*?>/gi, '');
    modifiedHtml = modifiedHtml.replace(/<link rel="canonical".*?>/gi, '');

    // Insert new SEO block right after <head>
    modifiedHtml = modifiedHtml.replace(/<head>/i, `<head>${seoBlock}`);

    // Determine target output directory and path
    if (isRoot) {
      fs.writeFileSync(path.join(DIST_DIR, 'index.html'), modifiedHtml, 'utf8');
      console.log(`Prerender: Generated root index.html with server-rendered SEO.`);
    } else {
      const pageDir = path.join(DIST_DIR, page.route);
      if (!fs.existsSync(pageDir)) {
        fs.mkdirSync(pageDir, { recursive: true });
      }
      fs.writeFileSync(path.join(pageDir, 'index.html'), modifiedHtml, 'utf8');
      console.log(`Prerender: Generated pre-rendered page for ${page.route} at ${pageDir}/index.html.`);
    }
  }

  console.log('--- SEO Static Prerendering Completed Successfully ---');
}

runPrerender().catch(err => {
  console.error('Fatal Prerender Error:', err);
  process.exit(1);
});
