/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useFirestoreCollection, useImage } from '../hooks/useFirestore';
import { Song, Video, HeroContent, BiographyData, GalleryItem } from '../types';
import { ArrowRight, Play, ExternalLink, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { orderBy, limit } from 'firebase/firestore';
import SEO from '../components/SEO';

export default function Home() {
  const { data: heroData } = useFirestoreCollection<HeroContent>('hero');
  const { data: latestSongs } = useFirestoreCollection<Song>('songs', orderBy('releaseDate', 'desc'), limit(3));
  const { data: latestVideos } = useFirestoreCollection<Video>('videos', orderBy('releaseDate', 'desc'), limit(2));
  const { data: bioData } = useFirestoreCollection<BiographyData>('biography');
  const { data: galleryItems } = useFirestoreCollection<GalleryItem>('gallery', orderBy('createdAt', 'desc'));
  
  // Real-time image listeners for persistence
  const { data: heroImage } = useImage('Home', 'Hero');
  const { data: bioPreviewImage } = useImage('Biography', 'Profile');

  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1); // 1 = next, -1 = prev

  useEffect(() => {
    if (galleryItems.length <= 1) return;
    const timer = setInterval(() => {
      setSlideDirection(1);
      setCurrentSlide((prev) => (prev + 1) % galleryItems.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [galleryItems.length]);

  const handlePrevSlide = () => {
    if (galleryItems.length === 0) return;
    setSlideDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
  };

  const handleNextSlide = () => {
    if (galleryItems.length === 0) return;
    setSlideDirection(1);
    setCurrentSlide((prev) => (prev + 1) % galleryItems.length);
  };

  const hero = heroData[0] || {
    title: 'ASHISHBARELE',
    subtitle: 'Independent Music Artist | Songwriter | Rapper',
    description: 'A young independent artist from Maharashtra creating emotional Hindi and Hinglish music inspired by real-life emotions, hope, faith and personal experiences.',
    imageUrl: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop',
    backgroundUrl: ''
  };

  const bio = bioData[0];

  const heroDisplayImage = heroImage?.secure_url || hero.imageUrl;
  const bioDisplayImage = bioPreviewImage?.secure_url || bio?.profileImageUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop';

  return (
    <div className="space-y-32 pb-32">
      <SEO />
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-80px)] flex flex-col overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroDisplayImage} 
            alt="Artist Hero" 
            className="w-full h-full object-cover opacity-20 scale-105"
          />
          <div className="absolute inset-0 bg-[#050505]/60 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-10">
          {/* Subtle Decorative Line Top Left */}
          <div className="absolute top-0 left-10 w-[1px] h-32 bg-gradient-to-b from-[#FACC15]/40 to-transparent hidden lg:block"></div>
          
          <div className="flex-1 flex flex-col lg:flex-row items-center lg:items-stretch gap-12 lg:gap-0">
            {/* Hero Left */}
            <div className="flex-1 flex flex-col justify-center py-20 lg:py-0">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="mb-4 flex items-center gap-4">
                  <div className="w-8 h-[1px] bg-[#FACC15]/40"></div>
                  <span className="text-[#FACC15] text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase opacity-80">Official Artist Website</span>
                </div>
                <h1 className="text-[40px] xs:text-[50px] md:text-[100px] lg:text-[120px] leading-[0.85] font-black tracking-tighter text-white uppercase mb-8">
                  {hero.title.substring(0, hero.title.length / 2)}<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/20">
                    {hero.title.substring(hero.title.length / 2)}
                  </span>
                </h1>
                <p className="text-white/40 text-lg md:text-xl font-light max-w-lg mb-12 leading-relaxed">
                  {hero.subtitle}<br/>
                  <span className="text-sm italic mt-4 block opacity-60 font-serif">"Translating raw emotions into sonic landscapes."</span>
                </p>
                <div className="flex flex-wrap gap-8">
                  <Link
                    to="/music"
                    className="px-10 py-5 bg-[#FACC15] text-black font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white transition-all shadow-[0_0_30px_rgba(250,204,21,0.2)] rounded-sm"
                  >
                    Listen Latest
                  </Link>
                  <Link
                    to="/about"
                    className="px-10 py-5 border border-white/10 uppercase tracking-[0.2em] text-[10px] font-black hover:bg-white/5 transition-all backdrop-blur-sm text-white rounded-sm"
                  >
                    The Story
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Hero Right - Featured Card */}
            <div className="w-full lg:w-1/3 flex flex-col justify-center lg:pl-12 pb-20 lg:pb-0">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-white/5 border border-white/10 p-6 rounded-sm backdrop-blur-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase tracking-widest text-white/40">Featured Track</span>
                  <div className="w-2 h-2 rounded-full bg-[#FACC15] animate-pulse"></div>
                </div>
                <div className="w-full aspect-square bg-[#111] border border-white/5 overflow-hidden mb-4 relative group">
                  <img 
                    src={latestSongs[0]?.coverUrl || heroDisplayImage} 
                    alt="Featured" 
                    className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white/10 text-8xl font-black italic select-none">AB</div>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white">{latestSongs[0]?.title || 'Latest Track'}</h3>
                <p className="text-xs text-white/50 mt-1">Release Year: {latestSongs[0]?.releaseDate?.toDate ? new Date(latestSongs[0].releaseDate.toDate()).getFullYear() : '2024'}</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {latestSongs[0]?.spotifyUrl ? (
                    <a 
                      href={latestSongs[0].spotifyUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bg-black/50 py-3 text-center text-[10px] uppercase tracking-widest border border-white/5 hover:bg-[#FACC15] hover:text-black transition-colors"
                    >
                      Spotify
                    </a>
                  ) : (
                    <button disabled className="bg-black/20 py-3 text-center text-[10px] uppercase tracking-widest border border-white/5 opacity-50 cursor-not-allowed">Spotify</button>
                  )}
                  {latestSongs[0]?.youtubeUrl ? (
                    <a 
                      href={latestSongs[0].youtubeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bg-black/50 py-3 text-center text-[10px] uppercase tracking-widest border border-white/5 hover:bg-[#FACC15] hover:text-black transition-colors"
                    >
                      YouTube
                    </a>
                  ) : (
                    <button disabled className="bg-black/20 py-3 text-center text-[10px] uppercase tracking-widest border border-white/5 opacity-50 cursor-not-allowed">YouTube</button>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="h-auto lg:h-32 grid grid-cols-2 lg:grid-cols-4 border-t border-white/5 items-center py-8 lg:py-0 gap-8 lg:gap-0">
            <div className="flex flex-col">
              <span className="text-[#FACC15] text-2xl font-bold tracking-tighter">2023</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">Journey Began</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white text-2xl font-bold tracking-tighter">Hindi Pop</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">Primary Genre</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white text-2xl font-bold tracking-tighter">Lo-Fi / Rap</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">Style Focus</span>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex gap-4">
                <a href="https://www.youtube.com/@ASHISHBARELE" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <span className="text-[10px] text-white">YT</span>
                </a>
                <a href="https://www.instagram.com/ashish__barele" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <span className="text-[10px] text-white">IG</span>
                </a>
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 mt-2">Social Identity</span>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-[80px] h-[1px] bg-white/5"></div>
      </div>

      {/* Latest Releases */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-16 border-l-4 border-[#FACC15] pl-6">
          <div>
            <h2 className="text-[#FACC15] text-xs font-bold tracking-[0.3em] mb-2">DISCOGRAPHY</h2>
            <h3 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">Latest Releases</h3>
          </div>
          <Link to="/music" className="text-white/40 hover:text-[#FACC15] transition-colors flex items-center gap-2 mb-2 text-[10px] font-bold tracking-widest uppercase">
            VIEW ALL <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {latestSongs.map((song, i) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <div className="relative aspect-square overflow-hidden mb-6 rounded-sm bg-[#111] border border-white/5">
                <img 
                  src={song.coverUrl} 
                  alt={song.title} 
                  className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <Play className="text-[#FACC15] fill-[#FACC15]" size={48} />
                </div>
              </div>
              <h4 className="text-xl font-bold mb-2 group-hover:text-[#FACC15] transition-colors">{song.title}</h4>
              <p className="text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase">
                {song.releaseDate?.toDate ? new Date(song.releaseDate.toDate()).getFullYear() : '2024'} &bull; SINGLE
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Decorative Divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-end">
        <div className="w-[80px] h-[1px] bg-white/5"></div>
      </div>

      {/* Featured Videos */}
      <section className="bg-black/40 border-y border-white/5 py-32 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-20">
            <h2 className="text-[#FACC15] text-xs font-bold tracking-[0.3em] mb-2 text-center">VISUALS</h2>
            <h3 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-center">Cinematic Journey</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {latestVideos.map((video) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="group"
              >
                <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="block relative aspect-video overflow-hidden rounded-sm border border-white/10 bg-[#111]">
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title} 
                    className="w-full h-full object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105 group-hover:opacity-80"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
                    <div className="w-16 h-16 border border-white/20 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-[#FACC15] group-hover:bg-[#FACC15] group-hover:text-black transition-all">
                      <Play className="fill-current" size={24} />
                    </div>
                  </div>
                </a>
                <div className="mt-8 flex justify-between items-start border-b border-white/5 pb-6">
                  <div>
                    <h4 className="text-2xl font-bold mb-3 group-hover:text-[#FACC15] transition-colors">{video.title}</h4>
                    <p className="text-white/40 text-sm line-clamp-2 max-w-md">{video.description}</p>
                  </div>
                  <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-[#FACC15] transition-colors">
                    <ExternalLink size={20} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Biography Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[#FACC15] text-xs font-bold tracking-[0.3em] mb-4">THE STORY</h2>
            <h3 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-8">Sonic Narrative</h3>
            <p className="text-white/50 text-lg leading-relaxed mb-10 font-light">
              {bio?.content ? bio.content.substring(0, 300) + '...' : 'Ashish Barele, professionally known as ASHISHBARELE, is an independent Indian music artist, songwriter, rapper, composer and lyricist from Dharni, Maharashtra.'}
            </p>
            <Link to="/about" className="inline-flex items-center gap-4 px-8 py-4 border border-white/10 text-white text-[10px] font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all">
              About The Artist <ArrowRight size={14} />
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] bg-gray-900 rounded-sm overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <img 
                src={bioDisplayImage} 
                alt="Ashish Barele" 
                className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 transition-all duration-1000"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 bg-[#080808] border border-white/10 text-white p-10 rounded-sm hidden md:block backdrop-blur-xl">
              <div className="text-5xl font-black mb-1 text-[#FACC15]">2023</div>
              <div className="font-bold tracking-[0.3em] text-[10px] text-white/40 uppercase">Year Zero</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Decorative Divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-[80px] h-[1px] bg-white/5"></div>
      </div>

      {/* Live Gallery Slider Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12 border-l-4 border-[#FACC15] pl-6">
          <div>
            <h2 className="text-[#FACC15] text-xs font-bold tracking-[0.3em] mb-2">LIVE DIARY</h2>
            <h3 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">Stills in Motion</h3>
          </div>
          <Link to="/gallery" className="text-white/40 hover:text-[#FACC15] transition-colors flex items-center gap-2 mb-2 text-[10px] font-bold tracking-widest uppercase">
            VIEW GALLERY <ArrowRight size={14} />
          </Link>
        </div>

        {/* Slider Container */}
        {galleryItems.length === 0 ? (
          <div className="w-full h-80 bg-black/40 border border-white/5 rounded-sm flex flex-col items-center justify-center text-gray-500">
            <ImageIcon size={40} className="mb-4 opacity-20 text-[#FACC15]" />
            <p className="text-sm font-light uppercase tracking-widest text-white/40">The gallery is currently empty</p>
          </div>
        ) : (
          <div className="relative w-full aspect-[4/3] sm:aspect-video lg:aspect-[21/9] bg-[#111] border border-white/5 rounded-sm overflow-hidden group">
            {/* Slides using AnimatePresence */}
            <div className="absolute inset-0 w-full h-full">
              <AnimatePresence initial={false} custom={slideDirection} mode="wait">
                <motion.div
                  key={currentSlide}
                  custom={slideDirection}
                  initial={{ x: slideDirection > 0 ? '100%' : '-100%', opacity: 0 }}
                  animate={{ x: '0%', opacity: 1 }}
                  exit={{ x: slideDirection > 0 ? '-100%' : '100%', opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 25, opacity: { duration: 0.4 } }}
                  className="absolute inset-0 w-full h-full"
                >
                  <img 
                    src={galleryItems[currentSlide]?.imageUrl} 
                    alt={galleryItems[currentSlide]?.altText || 'Artist Moment'} 
                    className="w-full h-full object-cover opacity-80"
                  />
                  {/* Vignette Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Caption Info */}
                  <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-left z-10 max-w-md pr-6">
                    <span className="inline-block px-3 py-1 bg-[#FACC15] text-black text-[9px] font-black tracking-widest uppercase rounded-sm mb-3">
                      {galleryItems[currentSlide]?.category || 'MOMENT'}
                    </span>
                    <h4 className="text-white text-lg md:text-2xl font-black uppercase tracking-tight line-clamp-1">
                      {galleryItems[currentSlide]?.altText || 'Live on Stage'}
                    </h4>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Arrows */}
            {galleryItems.length > 1 && (
              <>
                <button 
                  onClick={handlePrevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/60 border border-white/10 hover:border-[#FACC15] hover:bg-black/90 text-white hover:text-[#FACC15] flex items-center justify-center transition-all cursor-pointer opacity-100 md:opacity-0 md:group-hover:opacity-100"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={handleNextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/60 border border-white/10 hover:border-[#FACC15] hover:bg-black/90 text-white hover:text-[#FACC15] flex items-center justify-center transition-all cursor-pointer opacity-100 md:opacity-0 md:group-hover:opacity-100"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Pagination Indicators / Dots */}
            {galleryItems.length > 1 && (
              <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-20 flex gap-2">
                {galleryItems.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSlideDirection(idx > currentSlide ? 1 : -1);
                      setCurrentSlide(idx);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx === currentSlide 
                        ? 'bg-[#FACC15] w-6' 
                        : 'bg-white/30 hover:bg-white/60'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Contact CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="bg-[#080808] border border-white/5 rounded-sm p-12 md:p-24 text-center relative overflow-hidden group">
          <div className="relative z-10">
            <span className="text-[#FACC15] text-[10px] font-black tracking-[0.4em] uppercase mb-6 block">Ready for the next chapter</span>
            <h2 className="text-white text-4xl md:text-7xl font-black mb-12 leading-none uppercase tracking-tighter">
              Let's build a<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/20">masterpiece</span>
            </h2>
            <Link 
              to="/contact" 
              className="inline-block bg-[#FACC15] text-black px-12 py-5 font-black tracking-widest text-xs uppercase hover:bg-white transition-all shadow-[0_0_30px_rgba(250,204,21,0.2)]"
            >
              Collaborate Now
            </Link>
          </div>
          {/* Decorative background circle */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FACC15]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-[#FACC15]/10 transition-all duration-1000" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        </div>
      </section>
    </div>
  );
}
