/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFirestoreCollection } from '../hooks/useFirestore';
import { GalleryItem } from '../types';
import { Image as ImageIcon, X, Maximize2 } from 'lucide-react';
import { orderBy } from 'firebase/firestore';
import SEO from '../components/SEO';

export default function Gallery() {
  const { data: items, loading } = useFirestoreCollection<GalleryItem>('gallery', orderBy('createdAt', 'desc'));
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('ALL');

  const categories = ['ALL', ...Array.from(new Set(items.map(item => item.category?.toUpperCase() || 'GENERAL'))).filter(c => c !== 'GENERAL')];

  const filteredItems = activeCategory === 'ALL' 
    ? items 
    : items.filter(item => (item.category?.toUpperCase() || 'GENERAL') === activeCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-32">
      <SEO title="Gallery" description="Official photo gallery of ASHISHBARELE featuring live shows, studio sessions and more." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-[#FACC15] font-bold tracking-[0.4em] mb-4 text-xs uppercase">Memories</h2>
          <h1 className="text-4xl xs:text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none">
            <span className="stripe-text">Stills</span> in<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/20">Motion</span>
          </h1>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-4 mt-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-3 rounded-sm text-[10px] font-black tracking-[0.2em] border transition-all uppercase ${
                  activeCategory === cat 
                  ? 'bg-[#FACC15] border-[#FACC15] text-black shadow-[0_0_20px_rgba(250,204,21,0.2)]' 
                  : 'border-white/5 text-white/40 hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {items.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            <ImageIcon size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-xl">The gallery is currently empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[300px]">
            {filteredItems.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className={`relative group overflow-hidden rounded-sm border border-white/5 cursor-zoom-in bg-[#111] ${
                  i % 5 === 0 ? 'lg:col-span-2 lg:row-span-2' : ''
                }`}
                onClick={() => setSelectedImage(item.imageUrl)}
              >
                <img 
                  src={item.imageUrl} 
                  alt={item.altText} 
                  className="w-full h-full object-cover grayscale opacity-70 transition-all duration-1000 group-hover:scale-110 group-hover:grayscale-0 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <div className="p-4 bg-black/40 border border-white/20 rounded-full text-[#FACC15] scale-75 group-hover:scale-100 transition-transform">
                    <Maximize2 size={24} />
                  </div>
                  <div className="absolute bottom-8 left-8 text-left opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-500">
                    <p className="text-[#FACC15] text-[10px] font-black tracking-[0.3em] mb-2 uppercase">{item.category || 'GENERAL'}</p>
                    <p className="text-white text-lg font-bold uppercase tracking-tight leading-none">{item.altText}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-12"
            onClick={() => setSelectedImage(null)}
          >
            <button className="absolute top-8 right-8 text-white/50 hover:text-white">
              <X size={32} />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
