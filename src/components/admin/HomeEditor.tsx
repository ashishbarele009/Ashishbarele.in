/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { HeroContent } from '../../types';
import { Save, Loader2, Layout, Type, AlignLeft } from 'lucide-react';
import { 
  collection, 
  updateDoc, 
  doc, 
  setDoc
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import ImageUpload from './ImageUpload';

export default function HomeEditor() {
  const { data: heroData, loading } = useFirestoreCollection<HeroContent>('hero');
  const [hero, setHero] = useState<Partial<HeroContent>>({
    title: 'ASHISHBARELE',
    subtitle: 'Independent Music Artist | Songwriter | Rapper',
    description: '',
    imageUrl: '',
    backgroundUrl: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (heroData.length > 0) {
      setHero(heroData[0]);
    }
  }, [heroData]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (hero.id) {
        const { id, ...rest } = hero;
        await updateDoc(doc(db, 'hero', id as string), rest as any);
      } else {
        const heroRef = doc(collection(db, 'hero'));
        await setDoc(heroRef, hero);
      }
      alert('Hero section updated successfully!');
    } catch (err) {
      console.error('Error saving hero:', err);
      alert('Failed to save hero content.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && heroData.length === 0) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-yellow-500" /></div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-12 max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-gray-500 font-bold tracking-widest text-sm mb-2">LANDING PAGE</h3>
          <h1 className="text-3xl font-black text-white">Home Editor</h1>
        </div>
        <button 
          disabled={saving}
          className="px-10 py-3 bg-yellow-500 text-black font-black tracking-widest rounded-xl hover:bg-yellow-400 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          SAVE CHANGES
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
            <h4 className="text-lg font-bold flex items-center gap-2">
              <Type className="text-yellow-500" size={20} /> Text Content
            </h4>
            
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">HERO TITLE</label>
              <input 
                type="text"
                value={hero.title}
                onChange={(e) => setHero({ ...hero, title: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">SUBTITLE</label>
              <input 
                type="text"
                value={hero.subtitle}
                onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">DESCRIPTION</label>
              <textarea 
                rows={4}
                value={hero.description}
                onChange={(e) => setHero({ ...hero, description: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50 resize-none text-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
            <h4 className="text-lg font-bold flex items-center gap-2">
              <Layout className="text-yellow-500" size={20} /> Hero Media
            </h4>
            
            <ImageUpload 
              label="Hero Background Image"
              currentImageUrl={hero.imageUrl}
              pageName="Home"
              sectionName="Hero"
              onUploadSuccess={(url) => setHero({ ...hero, imageUrl: url })}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
