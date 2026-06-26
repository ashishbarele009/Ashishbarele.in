/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { SEOData } from '../../types';
import { Save, Loader2, Globe, Search, Facebook, Twitter, Code } from 'lucide-react';
import { 
  collection, 
  updateDoc, 
  doc, 
  setDoc
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import ImageUpload from './ImageUpload';

export default function SEOManager() {
  const { data: seoData, loading } = useFirestoreCollection<SEOData>('seo');
  const [seo, setSeo] = useState<Partial<SEOData>>({
    metaTitle: 'ASHISHBARELE | Official Website',
    metaDescription: 'Independent Music Artist, Songwriter and Rapper from Maharashtra.',
    keywords: 'Ashish Barele, ASHISHBARELE, Hindi Rap, Hip Hop, Independent Artist',
    ogImage: '',
    twitterCard: 'summary_large_image',
    robots: 'index, follow',
    canonicalUrl: 'https://ashishbarele.in'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (seoData.length > 0) {
      setSeo(seoData[0]);
    }
  }, [seoData]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (seo.id) {
        const { id, ...rest } = seo;
        await updateDoc(doc(db, 'seo', id as string), rest as any);
      } else {
        const seoRef = doc(collection(db, 'seo'));
        await setDoc(seoRef, seo);
      }
      alert('SEO settings updated successfully!');
    } catch (err) {
      console.error('Error saving SEO:', err);
      alert('Failed to save SEO settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && seoData.length === 0) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-yellow-500" /></div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-12 max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-gray-500 font-bold tracking-widest text-sm mb-2">SEARCH OPTIMIZATION</h3>
          <h1 className="text-3xl font-black text-white">SEO Manager</h1>
        </div>
        <button 
          disabled={saving}
          className="px-10 py-3 bg-yellow-500 text-black font-black tracking-widest rounded-xl hover:bg-yellow-400 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          SAVE SETTINGS
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
            <h4 className="text-lg font-bold flex items-center gap-2">
              <Search className="text-yellow-500" size={20} /> General Tags
            </h4>
            
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">META TITLE</label>
              <input 
                type="text"
                value={seo.metaTitle}
                onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">META DESCRIPTION</label>
              <textarea 
                rows={4}
                value={seo.metaDescription}
                onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50 resize-none text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">KEYWORDS (COMMA SEPARATED)</label>
              <input 
                type="text"
                value={seo.keywords}
                onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50"
              />
            </div>
          </div>

          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
            <h4 className="text-lg font-bold flex items-center gap-2">
              <Globe className="text-yellow-500" size={20} /> Advanced
            </h4>
            
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">CANONICAL URL</label>
              <input 
                type="url"
                value={seo.canonicalUrl}
                onChange={(e) => setSeo({ ...seo, canonicalUrl: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">ROBOTS TAG</label>
              <input 
                type="text"
                value={seo.robots}
                onChange={(e) => setSeo({ ...seo, robots: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50"
              />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
            <h4 className="text-lg font-bold flex items-center gap-2">
              <Facebook className="text-yellow-500" size={20} /> Social Preview
            </h4>
            
            <ImageUpload 
              label="OG Image (1200x630)"
              currentImageUrl={seo.ogImage}
              pageName="SEO"
              sectionName="OGImage"
              onUploadSuccess={(url) => setSeo({ ...seo, ogImage: url })}
            />

            <div className="space-y-2 pt-4">
              <label className="text-xs font-bold tracking-widest text-gray-500 uppercase flex items-center gap-2">
                <Twitter size={14} /> TWITTER CARD TYPE
              </label>
              <select 
                value={seo.twitterCard}
                onChange={(e) => setSeo({ ...seo, twitterCard: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50 text-gray-300 appearance-none"
              >
                <option value="summary">Summary</option>
                <option value="summary_large_image">Summary Large Image</option>
                <option value="app">App</option>
                <option value="player">Player</option>
              </select>
            </div>
          </div>

          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
            <h4 className="text-lg font-bold flex items-center gap-2">
              <Code className="text-yellow-500" size={20} /> JSON-LD Schema
            </h4>
            <div className="bg-black/50 p-6 rounded-2xl border border-white/5 font-mono text-[10px] text-gray-500 whitespace-pre-wrap overflow-x-auto">
{`{
  "@context": "https://schema.org",
  "@type": "MusicArtist",
  "name": "ASHISHBARELE",
  "url": "${seo.canonicalUrl}",
  "description": "${seo.metaDescription}",
  "genre": "Hindi Pop, Rap, Hip-Hop"
}`}
            </div>
            <p className="text-xs text-gray-600 italic">This schema is automatically injected into the frontend for better indexing.</p>
          </div>
        </div>
      </div>
    </form>
  );
}
