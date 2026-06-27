/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { 
  Save, 
  Loader2, 
  Upload, 
  Image as ImageIcon, 
  X, 
  Globe, 
  Check, 
  AlertTriangle, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { db, storage } from '../../lib/firebase';

export interface BrandingData {
  siteName: string;
  logoUrl: string;
  faviconUrl: string;
  browserTitle: string;
  updatedAt?: number;
}

export default function BrandingManager() {
  const [branding, setBranding] = useState<BrandingData>({
    siteName: 'ASHISHBARELE',
    logoUrl: '',
    faviconUrl: '',
    browserTitle: 'Official Artist Website',
  });
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  // Upload states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [logoProgress, setLogoProgress] = useState<number | null>(null);

  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string>('');
  const [faviconProgress, setFaviconProgress] = useState<number | null>(null);

  // Status notifications
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // File input refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchBranding() {
      try {
        const docRef = doc(db, 'settings', 'branding');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as BrandingData;
          setBranding(data);
          if (data.logoUrl) setLogoPreview(data.logoUrl);
          if (data.faviconUrl) setFaviconPreview(data.faviconUrl);
        }
      } catch (err) {
        console.error('Error loading branding:', err);
        showFeedback('error', 'Failed to load website branding settings.');
      } finally {
        setLoadingData(false);
      }
    }
    fetchBranding();
  }, []);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage(null);
    }, 6000);
  };

  // Client-side automatic compression and conversion to WebP for standard images (excluding SVGs)
  const processImageFile = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (file.type === 'image/svg+xml') {
        resolve(file); // Keep vector files fully intact without conversion or compression
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Standard Max dimensions
          const MAX_SIZE = 1200;
          if (width > MAX_SIZE || height > MAX_SIZE) {
            if (width > height) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            } else {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to create Canvas 2D context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Canvas toBlob conversion failed'));
              }
            },
            'image/webp',
            0.85 // High quality compression
          );
        };
        img.onerror = () => reject(new Error('Failed to read image source'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file reader'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>, 
    type: 'logo' | 'favicon'
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Max size checking (5MB limit)
    const MAX_MB_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_MB_SIZE) {
      showFeedback('error', 'File size exceeds 5MB limit.');
      return;
    }

    // Supported formats
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon'];
    if (!allowedTypes.includes(file.type)) {
      showFeedback('error', 'Unsupported file type. Please upload PNG, JPG, WebP, SVG, or ICO.');
      return;
    }

    if (type === 'logo') {
      setLogoProgress(5);
      const objectUrl = URL.createObjectURL(file);
      setLogoPreview(objectUrl);
      
      try {
        const processedLogo = await processImageFile(file);
        const fileExt = file.type === 'image/svg+xml' ? 'svg' : 'webp';
        setLogoProgress(20);
        
        const uploadedUrl = await performUpload(
          processedLogo, 
          `branding/logo_${Date.now()}.${fileExt}`, 
          (progress) => setLogoProgress(20 + Math.round(progress * 0.75))
        );
        
        // Save to firestore immediately
        const brandingDocRef = doc(db, 'settings', 'branding');
        const updateData = {
          logoUrl: uploadedUrl,
          updatedAt: Date.now()
        };
        await setDoc(brandingDocRef, updateData, { merge: true });
        
        setBranding(prev => ({
          ...prev,
          ...updateData
        }));
        setLogoPreview(uploadedUrl);
        showFeedback('success', 'Logo uploaded and updated successfully!');
      } catch (err: any) {
        console.error('Logo upload failed:', err);
        showFeedback('error', `Logo upload failed: ${err.message || err}`);
        setLogoPreview(branding.logoUrl); // revert
      } finally {
        setLogoProgress(null);
      }
    } else {
      setFaviconProgress(5);
      const objectUrl = URL.createObjectURL(file);
      setFaviconPreview(objectUrl);
      
      try {
        const isIco = file.type.includes('icon') || file.name.endsWith('.ico');
        const processedFavicon = isIco ? file : await processImageFile(file);
        const fileExt = isIco ? 'ico' : (file.type === 'image/svg+xml' ? 'svg' : 'webp');
        setFaviconProgress(20);
        
        const uploadedUrl = await performUpload(
          processedFavicon, 
          `branding/favicon_${Date.now()}.${fileExt}`, 
          (progress) => setFaviconProgress(20 + Math.round(progress * 0.75))
        );
        
        // Save to firestore immediately
        const brandingDocRef = doc(db, 'settings', 'branding');
        const updateData = {
          faviconUrl: uploadedUrl,
          updatedAt: Date.now()
        };
        await setDoc(brandingDocRef, updateData, { merge: true });
        
        setBranding(prev => ({
          ...prev,
          ...updateData
        }));
        setFaviconPreview(uploadedUrl);
        showFeedback('success', 'Favicon uploaded and updated successfully!');
      } catch (err: any) {
        console.error('Favicon upload failed:', err);
        showFeedback('error', `Favicon upload failed: ${err.message || err}`);
        setFaviconPreview(branding.faviconUrl); // revert
      } finally {
        setFaviconProgress(null);
      }
    }
  };

  // Upload runner helper
  const performUpload = (
    blobOrFile: Blob | File, 
    pathName: string, 
    onProgress: (pct: number) => void
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileRef = ref(storage, pathName);
      const uploadTask = uploadBytesResumable(fileRef, blobOrFile);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(pct);
        },
        (error) => {
          console.error('Storage upload error:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const brandingDocRef = doc(db, 'settings', 'branding');
      const updatedData = {
        siteName: branding.siteName.trim(),
        browserTitle: branding.browserTitle.trim(),
        updatedAt: Date.now(), // Dynamic cache-busting
      };

      await setDoc(brandingDocRef, updatedData, { merge: true });
      setBranding(prev => ({
        ...prev,
        ...updatedData
      }));
      
      showFeedback('success', 'Text branding details updated successfully!');
    } catch (err: any) {
      console.error('Save changes failed:', err);
      showFeedback('error', `Branding update failed: ${err.message || 'Check connection or permissions.'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      setLogoPreview('');
      const brandingDocRef = doc(db, 'settings', 'branding');
      const updateData = {
        logoUrl: '',
        updatedAt: Date.now()
      };
      await setDoc(brandingDocRef, updateData, { merge: true });
      
      setBranding(prev => ({ 
        ...prev, 
        ...updateData
      }));
      showFeedback('success', 'Logo removed successfully.');
    } catch (err: any) {
      console.error('Failed to remove logo:', err);
      showFeedback('error', 'Failed to remove logo.');
    }
  };

  const handleRemoveFavicon = async () => {
    try {
      setFaviconPreview('');
      const brandingDocRef = doc(db, 'settings', 'branding');
      const updateData = {
        faviconUrl: '',
        updatedAt: Date.now()
      };
      await setDoc(brandingDocRef, updateData, { merge: true });
      
      setBranding(prev => ({ 
        ...prev, 
        ...updateData
      }));
      showFeedback('success', 'Favicon removed successfully.');
    } catch (err: any) {
      console.error('Failed to remove favicon:', err);
      showFeedback('error', 'Failed to remove favicon.');
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-yellow-500" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h3 className="text-gray-500 font-bold tracking-widest text-sm mb-2">IDENTITY & CUSTOMIZATION</h3>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Sparkles className="text-yellow-500" /> Website Branding
          </h1>
        </div>
        <button 
          onClick={handleSaveAll}
          disabled={saving}
          className="px-10 py-3 bg-yellow-500 text-black font-black tracking-widest rounded-xl hover:bg-yellow-400 transition-all flex items-center gap-2 disabled:opacity-50 shrink-0 w-full sm:w-auto justify-center"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          SAVE CHANGES
        </button>
      </div>

      {/* Dynamic Feedback Banner */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <Check size={20} /> : <AlertTriangle size={20} />}
          <span className="text-sm font-semibold">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSaveAll} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side: General Brand Information */}
        <div className="space-y-8">
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
            <h4 className="text-lg font-bold flex items-center gap-2 text-white">
              <Globe className="text-yellow-500" size={20} /> Brand Text Info
            </h4>
            
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">Website Name (Header text & Branding)</label>
              <input 
                type="text"
                required
                value={branding.siteName}
                onChange={(e) => setBranding({ ...branding, siteName: e.target.value })}
                placeholder="e.g. ASHISHBARELE"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50 text-white"
              />
              <p className="text-xs text-gray-500">
                This replaces the default header and layout names across the website.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">Browser Title Suffix / Homepage Title</label>
              <input 
                type="text"
                required
                value={branding.browserTitle}
                onChange={(e) => setBranding({ ...branding, browserTitle: e.target.value })}
                placeholder="e.g. Official Artist Website"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50 text-white"
              />
              <p className="text-xs text-gray-500">
                Determines browser tab naming. Homepage shows: <code className="text-[#FACC15]">{branding.siteName} | {branding.browserTitle}</code>
              </p>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="bg-yellow-500/5 p-8 rounded-3xl border border-yellow-500/10 space-y-4">
            <h5 className="text-sm font-bold text-yellow-500 tracking-wider flex items-center gap-2 uppercase">
              <Sparkles size={16} /> Instant Live Updates
            </h5>
            <p className="text-xs text-gray-400 leading-relaxed">
              Updating your branding does not require any website code redeployments. Changes write directly to Firestore and Firebase Storage, and are pushed in real-time to all live users on your site via snapshot listener syncing.
            </p>
          </div>
        </div>

        {/* Right Side: Visual Brand Files (Logo & Favicon) */}
        <div className="space-y-8">
          {/* Logo Uploader */}
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
            <h4 className="text-lg font-bold flex items-center gap-2 text-white">
              <ImageIcon className="text-yellow-500" size={20} /> Logo Image
            </h4>

            {logoPreview ? (
              <div className="space-y-4">
                <div className="bg-black/40 border border-white/5 p-6 rounded-2xl flex items-center justify-center min-h-[140px] relative">
                  <img 
                    src={logoPreview.startsWith('blob:') ? logoPreview : `${logoPreview}?t=${branding.updatedAt || Date.now()}`} 
                    alt="Logo Preview" 
                    className="max-h-[80px] w-auto object-contain"
                  />
                  {logoProgress !== null && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-2xl p-4">
                      <Loader2 className="animate-spin text-yellow-500 mb-2" size={24} />
                      <div className="w-40 bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-yellow-500 h-full transition-all duration-300" style={{ width: `${logoProgress}%` }}></div>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 font-mono">{logoProgress}% Uploaded</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold rounded-xl tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={14} /> REPLACE LOGO
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold rounded-xl tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <X size={14} /> REMOVE
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => logoInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 hover:border-yellow-500/40 bg-white/[0.02] hover:bg-yellow-500/[0.01] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-3"
              >
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-gray-400">
                  <Upload size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Upload Site Logo</p>
                  <p className="text-[10px] text-gray-500 mt-1">PNG, SVG, JPG, WebP up to 5MB</p>
                </div>
              </div>
            )}

            <input 
              ref={logoInputRef}
              type="file"
              accept=".png,.svg,.webp,.jpg,.jpeg"
              onChange={(e) => handleFileChange(e, 'logo')}
              className="hidden"
            />
          </div>

          {/* Favicon Uploader */}
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
            <h4 className="text-lg font-bold flex items-center gap-2 text-white">
              <Globe className="text-yellow-500" size={20} /> Browser Favicon (.ico / .png / .svg)
            </h4>

            {faviconPreview ? (
              <div className="space-y-4">
                <div className="bg-black/40 border border-white/5 p-6 rounded-2xl flex items-center justify-center min-h-[140px] relative">
                  <div className="flex flex-col items-center gap-2">
                    <img 
                      src={faviconPreview.startsWith('blob:') ? faviconPreview : `${faviconPreview}?t=${branding.updatedAt || Date.now()}`} 
                      alt="Favicon Preview" 
                      className="w-12 h-12 object-contain bg-black/80 p-2 rounded-lg border border-white/10"
                    />
                    <span className="text-[10px] text-gray-500 uppercase font-mono tracking-widest">Favicon Preview</span>
                  </div>
                  {faviconProgress !== null && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-2xl p-4">
                      <Loader2 className="animate-spin text-yellow-500 mb-2" size={24} />
                      <div className="w-40 bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-yellow-500 h-full transition-all duration-300" style={{ width: `${faviconProgress}%` }}></div>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 font-mono">{faviconProgress}% Uploaded</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => faviconInputRef.current?.click()}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold rounded-xl tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={14} /> REPLACE FAVICON
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveFavicon}
                    className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold rounded-xl tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <X size={14} /> REMOVE
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => faviconInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 hover:border-yellow-500/40 bg-white/[0.02] hover:bg-yellow-500/[0.01] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-3"
              >
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-gray-400">
                  <Upload size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Upload Browser Favicon</p>
                  <p className="text-[10px] text-gray-500 mt-1">ICO, PNG, SVG up to 5MB</p>
                </div>
              </div>
            )}

            <input 
              ref={faviconInputRef}
              type="file"
              accept=".ico,.png,.svg,.webp"
              onChange={(e) => handleFileChange(e, 'favicon')}
              className="hidden"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
