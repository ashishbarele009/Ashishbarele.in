import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PAGES_DIR = path.resolve(__dirname, '../src/pages');
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const DIST_DIR = path.resolve(__dirname, '../dist');
const SITE_URL = 'https://ashishbarele.in';

// Helper to recursively find all page files
function getPages(dir, baseDir = PAGES_DIR) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip admin/private/temporary directories completely
      const lowerDirName = file.toLowerCase();
      if (
        lowerDirName.includes('admin') || 
        lowerDirName.includes('dashboard') || 
        lowerDirName.includes('login') || 
        lowerDirName.includes('private') || 
        lowerDirName.includes('temp')
      ) {
        continue;
      }
      results = results.concat(getPages(filePath, baseDir));
    } else {
      // Only process .tsx, .ts, .jsx, .js files
      if (/\.(tsx|ts|jsx|js)$/.test(file)) {
        const lowerFile = file.toLowerCase();
        
        // Skip files that are not actual page components or are administrative/private
        if (
          lowerFile.startsWith('_') ||
          lowerFile.includes('login') ||
          lowerFile.includes('dashboard') ||
          lowerFile.includes('admin') ||
          lowerFile.includes('protected') ||
          lowerFile.includes('notfound') ||
          lowerFile.includes('404')
        ) {
          continue;
        }
        
        results.push({
          filePath,
          relative: path.relative(baseDir, filePath),
          stat
        });
      }
    }
  }
  return results;
}

// Convert file path to SEO-friendly route URL
function relativeToRoute(relativePath) {
  // Remove extension
  let cleanPath = relativePath.replace(/\.(tsx|ts|jsx|js)$/, '');
  
  // Normalize Windows paths if applicable
  cleanPath = cleanPath.replace(/\\/g, '/');
  
  const parts = cleanPath.split('/');
  const lastPart = parts[parts.length - 1].toLowerCase();
  
  // If it's a home or index file, drop the last segment
  if (lastPart === 'home' || lastPart === 'index') {
    parts.pop();
  }
  
  // Convert PascalCase/camelCase parts to kebab-case
  const routeParts = parts.map(part => {
    return part
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
      .toLowerCase();
  });
  
  let route = '/' + routeParts.join('/');
  
  // Remove trailing slash for canonical consistency, except for root '/'
  if (route.length > 1 && route.endsWith('/')) {
    route = route.slice(0, -1);
  }
  
  return route;
}

async function run() {
  console.log('Generating production sitemap and robots.txt...');
  
  // Ensure public directory exists
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  // Attempt to fetch the latest profile image URL from Firestore with a resilient 2-second timeout
  let profileImageUrl = '';
  let imageUpdatedAt = Date.now();
  try {
    const configPath = path.resolve(__dirname, '../firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
      
      // Wrap database fetch in a promise so we can enforce a fast build-time timeout
      const fetchImagePromise = (async () => {
        const q = query(
          collection(db, 'images'),
          where('pageName', '==', 'Biography'),
          where('sectionName', '==', 'Profile')
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          if (docData.secure_url) {
            return {
              url: docData.secure_url,
              updatedAt: docData.updatedAt?.seconds 
                ? docData.updatedAt.seconds * 1000 
                : new Date(docData.updatedAt).getTime() || Date.now()
            };
          }
        }
        
        // Fallback to biography collection
        const bioQ = query(collection(db, 'biography'));
        const bioSnapshot = await getDocs(bioQ);
        if (!bioSnapshot.empty) {
          const bioData = bioSnapshot.docs[0].data();
          if (bioData.profileImageUrl) {
            return {
              url: bioData.profileImageUrl,
              updatedAt: bioData.updatedAt?.seconds
                ? bioData.updatedAt.seconds * 1000
                : new Date(bioData.updatedAt).getTime() || Date.now()
            };
          }
        }
        return null;
      })();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firestore fetch timed out (1.5s limit)')), 1500)
      );

      const result = await Promise.race([fetchImagePromise, timeoutPromise]);
      if (result) {
        profileImageUrl = result.url;
        imageUpdatedAt = result.updatedAt;
        console.log(`Successfully fetched Cloudinary Profile Image URL for sitemap: ${profileImageUrl}`);
      }
    }
  } catch (err) {
    console.warn('Could not fetch dynamic profile image from Firestore for sitemap. Falling back to default tags. Error:', err.message);
  }

  // Resolve versioned URL to avoid Google caching
  let versionedProfileImageUrl = '';
  if (profileImageUrl) {
    let secureUrl = profileImageUrl.replace(/^http:/i, 'https:');
    secureUrl = secureUrl.split('?')[0];
    if (secureUrl.includes('/image/upload/')) {
      const parts = secureUrl.split('/image/upload/');
      const pathAfterUpload = parts[1];
      const versionMatch = pathAfterUpload.match(/^v\d+\//);
      if (versionMatch) {
        const newPath = pathAfterUpload.replace(/^v\d+\//, `v${imageUpdatedAt}/`);
        versionedProfileImageUrl = `${parts[0]}/image/upload/${newPath}`;
      } else {
        versionedProfileImageUrl = `${parts[0]}/image/upload/v${imageUpdatedAt}/${pathAfterUpload}`;
      }
    } else {
      versionedProfileImageUrl = `${secureUrl}?v=${imageUpdatedAt}`;
    }
  }

  // Scan pages
  const pageFiles = getPages(PAGES_DIR);
  
  // Define default/mandatory public routes as standard fallback
  const defaultRoutes = [
    '/',
    '/about',
    '/music',
    '/videos',
    '/gallery',
    '/contact'
  ];

  // Map scanned files to routes and build a unique set of items
  const routeMap = new Map();
  
  // Start with default routes
  for (const route of defaultRoutes) {
    routeMap.set(route, {
      route,
      lastmod: new Date().toISOString().split('T')[0], // default to today
      stat: null
    });
  }

  // Add and override with scanned pages (utilizes real file timestamps)
  for (const item of pageFiles) {
    const route = relativeToRoute(item.relative);
    const lastmod = new Date(item.stat.mtime).toISOString().split('T')[0];
    routeMap.set(route, {
      route,
      lastmod,
      stat: item.stat
    });
  }

  // Convert to sorted array
  const sitemapItems = Array.from(routeMap.values()).sort((a, b) => {
    if (a.route === '/') return -1;
    if (b.route === '/') return 1;
    return a.route.localeCompare(b.route);
  });

  // Build the XML content with Google Image namespace
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">`;

  for (const item of sitemapItems) {
    let priority = '0.5';
    let changefreq = 'monthly';
    
    // Assign SEO-friendly priorities & frequencies
    if (item.route === '/') {
      priority = '1.0';
      changefreq = 'daily';
    } else if (['/music', '/videos', '/gallery'].includes(item.route)) {
      priority = '0.9';
      changefreq = 'weekly';
    } else if (['/about', '/contact'].includes(item.route)) {
      priority = '0.7';
      changefreq = 'monthly';
    } else {
      priority = '0.6';
      changefreq = 'weekly';
    }

    xml += `
  <url>
    <loc>${SITE_URL}${item.route}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>`;

    // If root route and we have a versioned profile image, include Google Image Extension
    if (item.route === '/' && versionedProfileImageUrl) {
      xml += `
    <image:image>
      <image:loc>${versionedProfileImageUrl}</image:loc>
      <image:title>Ashish Barele (ASHISHBARELE) – Independent Indian Music Artist</image:title>
      <image:caption>Ashish Barele (ASHISHBARELE) – Independent Indian Music Artist</image:caption>
    </image:image>`;
    }

    xml += `
  </url>`;
  }

  xml += '\n</urlset>\n';

  // Write sitemap.xml
  const sitemapPath = path.join(PUBLIC_DIR, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml, 'utf8');
  console.log(`✓ Generated sitemap.xml at ${sitemapPath} with ${sitemapItems.length} public URLs.`);

  const distSitemapPath = path.join(DIST_DIR, 'sitemap.xml');
  if (fs.existsSync(DIST_DIR)) {
    fs.writeFileSync(distSitemapPath, xml, 'utf8');
    console.log(`✓ Copied sitemap.xml to ${distSitemapPath}`);
  }

  // Write robots.txt with search engine guidelines and dynamic sitemap reference
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /admin-panel/
Disallow: /admin-login/
Disallow: /login/
Disallow: /dashboard/

Sitemap: ${SITE_URL}/sitemap.xml
`;

  const robotsPath = path.join(PUBLIC_DIR, 'robots.txt');
  fs.writeFileSync(robotsPath, robotsTxt, 'utf8');
  console.log(`✓ Generated robots.txt at ${robotsPath}`);

  const distRobotsPath = path.join(DIST_DIR, 'robots.txt');
  if (fs.existsSync(DIST_DIR)) {
    fs.writeFileSync(distRobotsPath, robotsTxt, 'utf8');
    console.log(`✓ Copied robots.txt to ${distRobotsPath}`);
  }
}

run().catch(err => {
  console.error('Error generating sitemap/robots.txt:', err);
  process.exit(1);
});
