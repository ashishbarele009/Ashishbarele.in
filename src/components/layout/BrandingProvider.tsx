/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface BrandingData {
  siteName: string;
  logoUrl: string;
  faviconUrl: string;
  browserTitle: string;
  updatedAt?: number;
}

const defaultBranding: BrandingData = {
  siteName: 'ASHISHBARELE',
  logoUrl: '',
  faviconUrl: '',
  browserTitle: 'Official Artist Website',
};

const BrandingContext = createContext<{
  branding: BrandingData;
  loading: boolean;
}>({
  branding: defaultBranding,
  loading: true,
});

export const useBranding = () => useContext(BrandingContext);

export default function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<BrandingData>(defaultBranding);
  const [loading, setLoading] = useState(true);
  const initialFaviconRef = useRef<string | null>(null);

  useEffect(() => {
    const docRef = doc(db, 'settings', 'branding');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const fUrl = data.faviconUrl || '';
        
        if (initialFaviconRef.current === null) {
          initialFaviconRef.current = fUrl;
        }

        setBranding({
          siteName: data.siteName || 'ASHISHBARELE',
          logoUrl: data.logoUrl || '',
          faviconUrl: fUrl,
          browserTitle: data.browserTitle || 'Official Artist Website',
          updatedAt: data.updatedAt,
        });
      } else {
        setBranding(defaultBranding);
      }
      setLoading(false);
    }, (err) => {
      console.error('Error fetching branding:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Dynamically update favicon and icons when they change in Firestore
  useEffect(() => {
    if (branding.siteName) {
      const fullTitle = branding.browserTitle 
        ? `${branding.siteName} | ${branding.browserTitle}` 
        : `${branding.siteName} | Official Artist Website`;
      document.title = fullTitle;
    }
  }, [branding.siteName, branding.browserTitle]);

  useEffect(() => {
    // Only update dynamically if branding has loaded and the faviconUrl has ACTUALLY changed from the initial Firestore value
    if (
      branding.faviconUrl &&
      initialFaviconRef.current !== null &&
      branding.faviconUrl !== initialFaviconRef.current
    ) {
      const cacheBustedFavicon = `${branding.faviconUrl}?t=${branding.updatedAt || Date.now()}`;
      
      const updateLinkRelationInPlace = (rel: string, href: string) => {
        const existingLinks = document.querySelectorAll(`link[rel="${rel}"]`);
        
        if (existingLinks.length > 0) {
          // Update the first link's href in-place so there is no flicker or blank moment
          const mainLink = existingLinks[0] as HTMLLinkElement;
          mainLink.href = href;
          
          if (rel === 'apple-touch-icon') {
            mainLink.setAttribute('sizes', '180x180');
          } else if (rel === 'icon') {
            if (href.includes('.png')) {
              mainLink.type = 'image/png';
            } else if (href.includes('.ico')) {
              mainLink.type = 'image/x-icon';
            } else if (href.includes('.svg')) {
              mainLink.type = 'image/svg+xml';
            }
          }
          
          // Remove any duplicate or extra link tags of the same relation to keep exactly ONE
          for (let i = 1; i < existingLinks.length; i++) {
            existingLinks[i].remove();
          }
        } else {
          // If no link exists, create a brand-new one
          const link = document.createElement('link');
          link.rel = rel;
          link.href = href;

          if (rel === 'apple-touch-icon') {
            link.setAttribute('sizes', '180x180');
          } else if (rel === 'icon') {
            if (href.includes('.png')) {
              link.type = 'image/png';
            } else if (href.includes('.ico')) {
              link.type = 'image/x-icon';
            } else if (href.includes('.svg')) {
              link.type = 'image/svg+xml';
            }
          }

          document.head.appendChild(link);
        }
      };

      // Handle standard icon, shortcut icon, and apple touch icon in-place with zero flicker
      updateLinkRelationInPlace('icon', cacheBustedFavicon);
      updateLinkRelationInPlace('shortcut icon', cacheBustedFavicon);
      updateLinkRelationInPlace('apple-touch-icon', cacheBustedFavicon);
    }
  }, [branding.faviconUrl, branding.updatedAt]);

  return (
    <BrandingContext.Provider value={{ branding, loading }}>
      {children}
    </BrandingContext.Provider>
  );
}
