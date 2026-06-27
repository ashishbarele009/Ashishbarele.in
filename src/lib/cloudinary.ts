/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  original_filename: string;
  format: string;
  width: number;
  height: number;
  [key: string]: any;
}

export const uploadToCloudinary = async (file: File): Promise<CloudinaryResponse> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'doupwfrsw';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ashishbarele_upload';

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration is missing. Please check your environment variables.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload image to Cloudinary');
  }

  return await response.json();
};

export const deleteFromCloudinary = async (publicId: string) => {
  // Note: Deleting from client-side requires a signature or a backend proxy.
  // For security reasons, we do not expose API Secret in the frontend.
  // We will only remove the reference from Firestore in the frontend.
  console.log('Requesting deletion of image metadata for:', publicId);
};

/**
 * Generates a versioned and secure HTTPS Cloudinary URL to bypass aggressive search engine and CDN caching.
 * Always ensures the URL is delivered over HTTPS and embeds a dynamic version timestamp segment /v{timestamp}/.
 * 
 * @param url The input Cloudinary URL
 * @param updatedAt Firebase/Firestore timestamp or milliseconds
 * @returns Standard secure, versioned Cloudinary URL
 */
export function getVersionedCloudinaryUrl(url: string, updatedAt?: any): string {
  if (!url) return '';
  
  // Enforce secure HTTPS protocol for search engine indexability (HTTP 200)
  let secureUrl = url.replace(/^http:/i, 'https:');
  
  if (!secureUrl.includes('cloudinary.com')) return secureUrl;
  
  // Strip existing query params to ensure clean, standard-compliant URLs
  secureUrl = secureUrl.split('?')[0];
  
  // Resolve accurate numeric timestamp or fallback to Date.now()
  let t = Date.now();
  if (updatedAt) {
    if (typeof updatedAt.toDate === 'function') {
      t = updatedAt.toDate().getTime();
    } else if (updatedAt.seconds) {
      t = updatedAt.seconds * 1000;
    } else if (updatedAt instanceof Date) {
      t = updatedAt.getTime();
    } else if (typeof updatedAt === 'string' || typeof updatedAt === 'number') {
      const parsed = new Date(updatedAt).getTime();
      if (!isNaN(parsed)) t = parsed;
    }
  }
  
  // Inject standard version segment right before public path
  if (secureUrl.includes('/image/upload/')) {
    const parts = secureUrl.split('/image/upload/');
    const pathAfterUpload = parts[1];
    
    // Replace any pre-existing /vNNN/ version with our dynamic one
    const versionMatch = pathAfterUpload.match(/^v\d+\//);
    if (versionMatch) {
      const newPath = pathAfterUpload.replace(/^v\d+\//, `v${t}/`);
      return `${parts[0]}/image/upload/${newPath}`;
    } else {
      // Insert standard version
      return `${parts[0]}/image/upload/v${t}/${pathAfterUpload}`;
    }
  }
  
  return `${secureUrl}?v=${t}`;
}
