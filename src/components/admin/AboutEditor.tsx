/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { AboutData, BiographyData, TimelineItem } from '../../types';
import { Save, Loader2, Target, Eye, Rocket, Star, History, Plus, Trash2, Briefcase, Music, Globe } from 'lucide-react';
import { 
  collection, 
  updateDoc, 
  doc, 
  setDoc
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import ImageUpload from './ImageUpload';

export default function AboutEditor() {
  const { data: aboutData, loading: aboutLoading } = useFirestoreCollection<AboutData>('about');
  const { data: bioData, loading: bioLoading } = useFirestoreCollection<BiographyData>('biography');
  
  const [about, setAbout] = useState<Partial<AboutData>>({
    mission: '',
    vision: '',
    story: '',
    goals: '',
    future: '',
    lyricistTitle: 'Lyricist',
    lyricistContent: 'Crafting emotional storytelling through Hindi and Hinglish lyrics inspired by personal life experiences.',
    digitalTitle: 'Digital Presence',
    digitalContent: 'Independently building a digital brand as a web developer, graphic designer, and video editor.'
  });

  const [bio, setBio] = useState<Partial<BiographyData>>({
    content: '',
    profileImageUrl: '',
    timeline: [],
    occupation: [],
    genres: [],
    languages: [],
    achievements: []
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (aboutData.length > 0) {
      setAbout(aboutData[0]);
    }
  }, [aboutData]);

  useEffect(() => {
    if (bioData.length > 0) {
      setBio(bioData[0]);
    }
  }, [bioData]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Save About Data
      if (about.id) {
        const { id, ...rest } = about;
        await updateDoc(doc(db, 'about', id as string), rest as any);
      } else {
        const aboutRef = doc(collection(db, 'about'));
        await setDoc(aboutRef, about);
      }

      // Save Bio Data
      if (bio.id) {
        const { id, ...rest } = bio;
        await updateDoc(doc(db, 'biography', id as string), rest as any);
      } else {
        const bioRef = doc(collection(db, 'biography'));
        await setDoc(bioRef, bio);
      }

      alert('About & Biography content updated successfully!');
    } catch (err) {
      console.error('Error saving content:', err);
      alert('Failed to save content.');
    } finally {
      setSaving(false);
    }
  };

  const addTimelineItem = () => {
    setBio({
      ...bio,
      timeline: [...(bio.timeline || []), { year: '', event: '' }]
    });
  };

  const removeTimelineItem = (index: number) => {
    const newTimeline = [...(bio.timeline || [])];
    newTimeline.splice(index, 1);
    setBio({ ...bio, timeline: newTimeline });
  };

  const updateTimelineItem = (index: number, field: keyof TimelineItem, value: string) => {
    const newTimeline = [...(bio.timeline || [])];
    newTimeline[index] = { ...newTimeline[index], [field]: value };
    setBio({ ...bio, timeline: newTimeline });
  };

  if ((aboutLoading || bioLoading) && (aboutData.length === 0 || bioData.length === 0)) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-yellow-500" /></div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-12 max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-gray-500 font-bold tracking-widest text-sm mb-2">PAGE CONTENT</h3>
          <h1 className="text-3xl font-black text-white">About & Bio Editor</h1>
        </div>
        <button 
          disabled={saving}
          className="px-10 py-3 bg-yellow-500 text-black font-black tracking-widest rounded-xl hover:bg-yellow-400 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          SAVE EVERYTHING
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column - Image & Meta */}
        <div className="lg:col-span-1 space-y-8">
          <ImageUpload 
            label="Artist Photo"
            currentImageUrl={bio.profileImageUrl}
            pageName="Biography"
            sectionName="Profile"
            onUploadSuccess={(url) => setBio({ ...bio, profileImageUrl: url })}
          />

          <div className="space-y-6 bg-white/5 p-6 rounded-2xl border border-white/10">
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase flex items-center gap-2">
                <Briefcase size={14} /> OCCUPATION (COMMA SEPARATED)
              </label>
              <input 
                type="text"
                value={bio.occupation?.join(', ')}
                onChange={(e) => setBio({ ...bio, occupation: e.target.value.split(',').map(s => s.trim()) })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50 text-sm text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase flex items-center gap-2">
                <Music size={14} /> GENRES (COMMA SEPARATED)
              </label>
              <input 
                type="text"
                value={bio.genres?.join(', ')}
                onChange={(e) => setBio({ ...bio, genres: e.target.value.split(',').map(s => s.trim()) })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50 text-sm text-white"
              />
            </div>
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Biography Content */}
          <div className="space-y-4">
            <label className="text-xs font-bold tracking-widest text-gray-500 uppercase flex items-center gap-2">
              <History size={16} /> ARTIST BIOGRAPHY / STORY
            </label>
            <textarea 
              rows={12}
              value={bio.content}
              onChange={(e) => setBio({ ...bio, content: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 focus:outline-none focus:border-yellow-500/50 resize-none leading-relaxed text-gray-300"
              placeholder="Tell your story here..."
            />
          </div>

          {/* Timeline */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold tracking-widest text-gray-500 uppercase flex items-center gap-2">
                <History size={16} /> CAREER TIMELINE
              </label>
              <button 
                type="button" 
                onClick={addTimelineItem}
                className="text-xs text-yellow-500 font-bold hover:text-yellow-400 flex items-center gap-1"
              >
                <Plus size={14} /> ADD EVENT
              </button>
            </div>
            
            <div className="space-y-4">
              {bio.timeline?.map((item, index) => (
                <div key={index} className="flex gap-4 items-start bg-white/5 p-4 rounded-xl border border-white/5 group">
                  <input 
                    type="text" 
                    placeholder="Year" 
                    value={item.year}
                    onChange={(e) => updateTimelineItem(index, 'year', e.target.value)}
                    className="w-24 bg-white/10 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-500 text-center font-bold text-white"
                  />
                  <input 
                    type="text" 
                    placeholder="Event Description" 
                    value={item.event}
                    onChange={(e) => updateTimelineItem(index, 'event', e.target.value)}
                    className="flex-grow bg-white/10 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-500 text-white"
                  />
                  <button 
                    type="button"
                    onClick={() => removeTimelineItem(index)}
                    className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Values Section */}
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-8">
            <h4 className="text-xs font-bold tracking-widest text-gray-500 uppercase">Artistic Framework (Values)</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-xs font-bold tracking-widest text-gray-400 uppercase flex items-center gap-2">
                  <Target size={16} /> MISSION
                </label>
                <textarea 
                  rows={4}
                  value={about.mission}
                  onChange={(e) => setAbout({ ...about, mission: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-yellow-500/50 resize-none text-gray-300"
                  placeholder="What drives you?"
                />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-bold tracking-widest text-gray-400 uppercase flex items-center gap-2">
                  <Eye size={16} /> VISION
                </label>
                <textarea 
                  rows={4}
                  value={about.vision}
                  onChange={(e) => setAbout({ ...about, vision: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-yellow-500/50 resize-none text-gray-300"
                  placeholder="Where do you see yourself?"
                />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-bold tracking-widest text-gray-400 uppercase flex items-center gap-2">
                  <Rocket size={16} /> GOALS
                </label>
                <textarea 
                  rows={4}
                  value={about.goals}
                  onChange={(e) => setAbout({ ...about, goals: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-yellow-500/50 resize-none text-gray-300"
                  placeholder="Short-term milestones..."
                />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-bold tracking-widest text-gray-400 uppercase flex items-center gap-2">
                  <Star size={16} /> FUTURE
                </label>
                <textarea 
                  rows={4}
                  value={about.future}
                  onChange={(e) => setAbout({ ...about, future: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-yellow-500/50 resize-none text-gray-300"
                  placeholder="Upcoming projects..."
                />
              </div>
            </div>
          </div>

          {/* Identity Blocks */}
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-8">
            <h4 className="text-xs font-bold tracking-widest text-gray-500 uppercase">Identity Blocks (Bottom of page)</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">LEFT BLOCK TITLE</label>
                <input 
                  type="text"
                  value={about.lyricistTitle}
                  onChange={(e) => setAbout({ ...about, lyricistTitle: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-3 focus:outline-none focus:border-yellow-500/50 text-gray-300"
                />
                <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">LEFT BLOCK CONTENT</label>
                <textarea 
                  rows={4}
                  value={about.lyricistContent}
                  onChange={(e) => setAbout({ ...about, lyricistContent: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-yellow-500/50 resize-none text-gray-300"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">RIGHT BLOCK TITLE</label>
                <input 
                  type="text"
                  value={about.digitalTitle}
                  onChange={(e) => setAbout({ ...about, digitalTitle: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-3 focus:outline-none focus:border-yellow-500/50 text-gray-300"
                />
                <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">RIGHT BLOCK CONTENT</label>
                <textarea 
                  rows={4}
                  value={about.digitalContent}
                  onChange={(e) => setAbout({ ...about, digitalContent: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-yellow-500/50 resize-none text-gray-300"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
