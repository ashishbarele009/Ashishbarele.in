/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { useFirestoreCollection } from '../hooks/useFirestore';
import { Song } from '../types';
import { Music as MusicIcon, Youtube, ExternalLink, Play } from 'lucide-react';
import { orderBy } from 'firebase/firestore';
import SEO from '../components/SEO';

export default function Music() {
  const { data: songs, loading } = useFirestoreCollection<Song>('songs', orderBy('releaseDate', 'desc'));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-32">
      <SEO title="Music" description="Explore the latest tracks, singles and albums by ASHISHBARELE." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <h2 className="text-[#FACC15] font-bold tracking-[0.4em] mb-4 text-xs uppercase">Discography</h2>
          <h1 className="text-4xl xs:text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none">
            Sonic<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/20">Library</span>
          </h1>
        </motion.div>

        {songs.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            <MusicIcon size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-xl">No music found. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {songs.map((song, i) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-white/5 rounded-sm overflow-hidden border border-white/5 hover:border-[#FACC15]/30 transition-all duration-500"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src={song.coverUrl} 
                    alt={song.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    {song.spotifyUrl && (
                      <a href={song.spotifyUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-green-500 rounded-full text-white hover:scale-110 transition-transform">
                        <Play size={24} fill="currentColor" />
                      </a>
                    )}
                    {song.youtubeUrl && (
                      <a href={song.youtubeUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-red-600 rounded-full text-white hover:scale-110 transition-transform">
                        <Youtube size={24} />
                      </a>
                    )}
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold group-hover:text-[#FACC15] transition-colors uppercase tracking-tight">{song.title}</h3>
                    <span className="text-white/20 text-[10px] font-bold tracking-widest mt-1 uppercase">
                      {song.releaseDate?.toDate ? new Date(song.releaseDate.toDate()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'NEW'}
                    </span>
                  </div>
                  <p className="text-white/40 text-sm mb-8 line-clamp-3 leading-relaxed font-light">
                    {song.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 pt-6 border-t border-white/5">
                    {song.spotifyUrl && (
                      <a 
                        href={song.spotifyUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-[#FACC15] hover:text-black transition-all text-[10px] font-black tracking-[0.2em] rounded-sm uppercase"
                      >
                        SPOTIFY
                      </a>
                    )}
                    {song.youtubeUrl && (
                      <a 
                        href={song.youtubeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-[#FACC15] hover:text-black transition-all text-[10px] font-black tracking-[0.2em] rounded-sm uppercase"
                      >
                        YOUTUBE
                      </a>
                    )}
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
