/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
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

  useEffect(() => {
    const docRef = doc(db, 'settings', 'branding');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBranding({
          siteName: data.siteName || 'ASHISHBARELE',
          logoUrl: data.logoUrl || '',
          faviconUrl: data.faviconUrl || '',
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
    if (branding.faviconUrl) {
      const cacheBustedFavicon = `${branding.faviconUrl}?t=${branding.updatedAt || Date.now()}`;
      
      const updateLinkRelation = (rel: string, href: string) => {
        let link: HTMLLinkElement | null = document.querySelector(`link[rel="${rel}"]`);
        if (!link) {
          link = document.createElement('link');
          link.rel = rel;
          document.head.appendChild(link);
        }
        link.href = href;
      };

      // Handle standard icon, shortcut icon, and apple touch icon for full compatibility
      updateLinkRelation('icon', cacheBustedFavicon);
      updateLinkRelation('shortcut icon', cacheBustedFavicon);
      updateLinkRelation('apple-touch-icon', cacheBustedFavicon);
    }
  }, [branding.faviconUrl, branding.updatedAt]);

  return (
    <BrandingContext.Provider value={{ branding, loading }}>
      {children}
    </BrandingContext.Provider>
  );
}
