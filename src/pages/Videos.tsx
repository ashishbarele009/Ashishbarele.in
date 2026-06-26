/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { useFirestoreCollection } from '../hooks/useFirestore';
import { Video } from '../types';
import { Play, Youtube, ExternalLink } from 'lucide-react';
import { orderBy } from 'firebase/firestore';
import SEO from '../components/SEO';

export default function Videos() {
  const { data: videos, loading } = useFirestoreCollection<Video>('videos', orderBy('releaseDate', 'desc'));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-32">
      <SEO title="Videos" description="Watch official music videos, live performances and behind the scenes of ASHISHBARELE." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <h2 className="text-[#FACC15] font-bold tracking-[0.4em] mb-4 text-xs uppercase">Visuals</h2>
          <h1 className="text-4xl xs:text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none">
            Motion<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/20">Pictures</span>
          </h1>
        </motion.div>

        {videos.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            <Youtube size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-xl">No videos found yet.</p>
          </div>
        ) : (
          <div className="space-y-32">
            {videos.map((video, i) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`flex flex-col lg:items-center gap-12 ${i % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}
              >
                <div className="flex-1 group">
                  <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="block relative aspect-video overflow-hidden rounded-sm shadow-2xl border border-white/5 bg-[#111]">
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title} 
                      className="w-full h-full object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all flex items-center justify-center">
                      <div className="w-20 h-20 bg-black/40 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-[#FACC15] group-hover:bg-[#FACC15] group-hover:text-black shadow-xl group-hover:scale-110 transition-all">
                        <Play fill="currentColor" size={32} className="ml-1" />
                      </div>
                    </div>
                  </a>
                </div>

                <div className="flex-1 space-y-6">
                  <div className="inline-block px-4 py-1 bg-[#FACC15]/10 text-[#FACC15] text-[10px] font-bold tracking-[0.2em] rounded-sm uppercase">
                    {video.releaseDate?.toDate ? new Date(video.releaseDate.toDate()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'FEATURED'}
                  </div>
                  <h3 className="text-4xl md:text-6xl font-black leading-none tracking-tighter uppercase">{video.title}</h3>
                  <p className="text-white/40 text-lg leading-relaxed font-light">
                    {video.description}
                  </p>
                  <div className="pt-4">
                    <a 
                      href={video.youtubeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-black tracking-widest text-[10px] rounded-sm hover:bg-[#FACC15] transition-colors uppercase"
                    >
                      WATCH ON YOUTUBE <Youtube size={16} />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
