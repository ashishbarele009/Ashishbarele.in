import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.resolve(__dirname, '../public');
const DIST_DIR = path.resolve(__dirname, '../dist');

// Safe download with timeout to prevent hanging
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const req = https.get(url, (response) => {
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(destPath, () => {});
        reject(new Error(`Failed to download: Status Code ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    });

    req.on('error', (err) => {
      file.close();
      fs.unlink(destPath, () => {});
      reject(err);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      file.close();
      fs.unlink(destPath, () => {});
      reject(new Error('Download timed out after 5s'));
    });
  });
}

// Lightweight fetch helper for Firestore document
function getFirestoreDocument(projectId, databaseId, docPath) {
  return new Promise((resolve, reject) => {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/${docPath}`;
    console.log(`Fetching from REST API: ${url}`);
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`Firestore REST API status ${res.statusCode}: ${data}`));
          return;
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Firestore fetch timed out after 5s'));
    });
  });
}

async function run() {
  console.log('--- Syncing Active Branding Assets ---');
  
  let projectId = '';
  let databaseId = '(default)';

  // 1. Try to read from src/firebase.ts
  const srcFirebasePath = path.resolve(__dirname, '../src/firebase.ts');
  if (fs.existsSync(srcFirebasePath)) {
    const srcContent = fs.readFileSync(srcFirebasePath, 'utf8');
    const projectMatch = srcContent.match(/projectId:\s*["']([^"']+)["']/);
    if (projectMatch) {
      projectId = projectMatch[1];
      console.log(`Parsed production projectId from src/firebase.ts: ${projectId}`);
    }
  }

  // 2. Fall back to firebase-applet-config.json if not found
  if (!projectId) {
    const configPath = path.resolve(__dirname, '../firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      projectId = config.projectId;
      databaseId = config.firestoreDatabaseId || '(default)';
      console.log(`Parsed fallback projectId from firebase-applet-config.json: ${projectId}`);
    }
  }

  if (!projectId) {
    console.warn('Could not determine projectId. Skipping active asset sync.');
    process.exit(0);
  }

  try {
    const docData = await getFirestoreDocument(projectId, databaseId, 'settings/branding');
    const fields = docData.fields || {};
    const faviconUrl = fields.faviconUrl?.stringValue || '';

    if (faviconUrl) {
      console.log(`Found active favicon URL in Firestore: ${faviconUrl}`);
      
      const targets = [
        'favicon.ico',
        'favicon-16x16.png',
        'favicon-32x32.png',
        'apple-touch-icon.png',
        'android-chrome-192x192.png',
        'android-chrome-512x512.png'
      ];

      for (const target of targets) {
        const publicPath = path.join(PUBLIC_DIR, target);
        console.log(`Downloading static fallback ${target}...`);
        await downloadFile(faviconUrl, publicPath);
        console.log(`✓ Updated /public/${target}`);

        // If dist folder exists, copy there too
        const distPath = path.join(DIST_DIR, target);
        if (fs.existsSync(DIST_DIR)) {
          fs.copyFileSync(publicPath, distPath);
          console.log(`✓ Copied to /dist/${target}`);
        }
      }
      console.log('--- Branding Asset Sync Successful ---');
    } else {
      console.warn('No active faviconUrl found in Firestore settings/branding.');
    }
  } catch (err) {
    console.warn('Could not sync active branding assets:', err.message);
  }

  process.exit(0);
}

run();
