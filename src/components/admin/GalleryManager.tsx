/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { GalleryItem } from '../../types';
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Save, 
  X, 
  Loader2,
  Tag
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import ImageUpload from './ImageUpload';
import { motion } from 'motion/react';

export default function GalleryManager() {
  const { data: items, loading } = useFirestoreCollection<GalleryItem>('gallery', orderBy('createdAt', 'desc'));
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<Partial<GalleryItem>>({
    imageUrl: '',
    altText: '',
    category: 'General'
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!newItem.imageUrl) return;
    setSaving(true);

    try {
      await addDoc(collection(db, 'gallery'), {
        ...newItem,
        createdAt: serverTimestamp(),
        order: items.length
      });
      setIsAdding(false);
      setNewItem({ imageUrl: '', altText: '', category: 'General' });
    } catch (err) {
      console.error('Error saving gallery item:', err);
      alert('Failed to save gallery item.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    try {
      await deleteDoc(doc(db, 'gallery', id));
    } catch (err) {
      console.error('Error deleting gallery item:', err);
    }
  };

  if (loading && items.length === 0) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-yellow-500" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Manage Gallery</h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-6 py-3 bg-yellow-500 text-black font-bold tracking-widest rounded-xl hover:bg-yellow-400 transition-all flex items-center gap-2"
        >
          <Plus size={20} /> ADD NEW IMAGE
        </button>
      </div>

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-8 max-w-2xl mx-auto"
        >
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-lg font-bold">Upload New Image</h4>
            <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/10 rounded-full">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <ImageUpload 
              currentImageUrl={newItem.imageUrl}
              pageName="Gallery"
              sectionName={newItem.category || 'General'}
              mode="collection"
              title={newItem.altText}
              altText={newItem.altText}
              onUploadSuccess={(url) => setNewItem({ ...newItem, imageUrl: url })}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">CATEGORY</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="text"
                    placeholder="e.g. Studio, Live, Behind the Scenes"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-4 focus:outline-none focus:border-yellow-500/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">ALT TEXT</label>
                <input 
                  type="text"
                  placeholder="Describe the image..."
                  value={newItem.altText}
                  onChange={(e) => setNewItem({ ...newItem, altText: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:outline-none focus:border-yellow-500/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-6 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-all"
              >
                CANCEL
              </button>
              <button 
                disabled={saving || !newItem.imageUrl}
                className="px-8 py-2 bg-yellow-500 text-black font-bold tracking-widest rounded-lg hover:bg-yellow-400 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                UPLOAD
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item) => (
          <div key={item.id} className="relative aspect-square group rounded-xl overflow-hidden border border-white/10">
            <img src={item.imageUrl} alt={item.altText} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-4">
              <p className="text-[10px] text-yellow-500 font-bold tracking-widest mb-2 uppercase">{item.category}</p>
              <button 
                onClick={() => handleDelete(item.id!)}
                className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && !isAdding && (
          <div className="col-span-full py-20 text-center bg-white/5 border border-dashed border-white/10 rounded-3xl">
            <ImageIcon className="mx-auto mb-4 text-gray-700" size={48} />
            <p className="text-gray-500">Your gallery is empty.</p>
          </div>
        )}
      </div>
    </div>
  );
}
