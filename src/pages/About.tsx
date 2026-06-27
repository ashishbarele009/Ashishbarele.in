/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { useFirestoreCollection, useImage } from '../hooks/useFirestore';
import { AboutData, BiographyData } from '../types';
import { Target, Eye, Rocket, Star, MapPin, Calendar, Music, Mic2, FileText, PenTool } from 'lucide-react';
import SEO from '../components/SEO';
import { getVersionedCloudinaryUrl } from '../lib/cloudinary';

export default function About() {
  const { data: aboutData, loading: aboutLoading } = useFirestoreCollection<AboutData>('about');
  const { data: bioData, loading: bioLoading } = useFirestoreCollection<BiographyData>('biography');
  const { data: profileImage } = useImage('Biography', 'Profile');
  
  const about = aboutData[0];
  const bio = bioData[0];

  const loading = aboutLoading || bioLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  const sections = [
    { 
      title: 'MISSION', 
      icon: <Target className="text-[#FACC15]" size={24} />, 
      content: about?.mission || 'To create music that resonates with real emotions, providing hope and faith to listeners through honest storytelling.'
    },
    { 
      title: 'VISION', 
      icon: <Eye className="text-[#FACC15]" size={24} />, 
      content: about?.vision || 'To become a leading independent voice in the Indian music industry, bridging the gap between mainstream pop and indie soul.'
    },
    { 
      title: 'GOALS', 
      icon: <Rocket className="text-[#FACC15]" size={24} />, 
      content: about?.goals || 'Releasing consistent original music, performing live, and building a community of listeners who connect deeply with emotional music.'
    },
    { 
      title: 'FUTURE', 
      icon: <Star className="text-[#FACC15]" size={24} />, 
      content: about?.future || 'Exploring new sonic landscapes in lo-fi and hip-hop while staying true to the melodic roots and emotional core of my music.'
    }
  ];

  const rawProfileUrl = profileImage?.secure_url || bio?.profileImageUrl || '';
  const displayImage = rawProfileUrl
    ? getVersionedCloudinaryUrl(rawProfileUrl, profileImage?.updatedAt || bio?.updatedAt)
    : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop';

  const defaultBioContent = `Ashish Barele, professionally known as ASHISHBARELE, is an independent Indian music artist, songwriter, rapper, composer and lyricist from Dharni, Maharashtra.

He began his musical journey in 2023 with the vision of creating meaningful Hindi and Hinglish music inspired by real emotions and personal experiences.

His music combines emotional storytelling, modern rap, melodic vocals and lo-fi production to create songs that connect deeply with listeners.

Alongside music, he is also a web developer, graphic designer and video editor, building his own digital identity independently.

As an emerging independent artist, he continues releasing original music while growing his audience across digital streaming platforms.`;

  return (
    <div className="min-h-screen pt-32 pb-32">
      <SEO title="About" description="The journey, mission and values behind the music of independent artist ASHISHBARELE." />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <h2 className="text-[#FACC15] font-bold tracking-[0.4em] mb-4 text-xs uppercase">Identity</h2>
          <h1 className="text-4xl xs:text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none">
            About the<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/20">Artist</span>
          </h1>
        </motion.div>

        {/* Bio Section - Merged from Biography */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 mb-40">
          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="aspect-[4/5] rounded-sm overflow-hidden border border-white/5 shadow-2xl bg-[#111]"
            >
              <img 
                src={displayImage} 
                alt="Ashish Barele (ASHISHBARELE) – Independent Indian Music Artist" 
                className="w-full h-full object-cover grayscale opacity-80"
              />
            </motion.div>

            <div className="space-y-8 bg-black/40 p-8 rounded-sm border border-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <MapPin className="text-[#FACC15]" size={20} />
                <div>
                  <p className="text-[10px] text-white/30 tracking-[0.2em] uppercase font-bold">BORN</p>
                  <p className="font-bold text-white/80">Dharni, Maharashtra, India</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Music className="text-[#FACC15]" size={20} />
                <div>
                  <p className="text-[10px] text-white/30 tracking-[0.2em] uppercase font-bold">GENRES</p>
                  <p className="font-bold text-white/80">{(bio?.genres || ['Hindi Pop', 'Hindi Rap', 'Hip-Hop', 'Lo-fi']).join(', ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Mic2 className="text-[#FACC15]" size={20} />
                <div>
                  <p className="text-[10px] text-white/30 tracking-[0.2em] uppercase font-bold">OCCUPATION</p>
                  <p className="font-bold text-white/80">{(bio?.occupation || ['Music Artist', 'Songwriter', 'Rapper']).join(', ')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-[#FACC15] font-bold tracking-[0.4em] mb-4 text-xs uppercase">The Story</h2>
              <h1 className="text-6xl md:text-[80px] font-black tracking-tighter mb-12 leading-[0.9] uppercase">ASHISH <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/20">BARELE</span></h1>
              <div className="prose prose-invert max-w-none">
                {(bio?.content || defaultBioContent).split('\n\n').map((para, i) => (
                  <p key={i} className="text-white/50 text-xl leading-relaxed mb-8 font-light">
                    {para}
                  </p>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-40">
          <div className="text-center mb-20">
            <h2 className="text-[#FACC15] font-bold tracking-[0.4em] mb-4 text-xs uppercase">Values</h2>
            <h3 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
              Artistic <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/20">Framework</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-black/40 p-12 rounded-sm border border-white/5 hover:border-[#FACC15]/20 transition-all group backdrop-blur-sm"
              >
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-all">
                  {section.icon}
                </div>
                <h3 className="text-2xl font-black mb-6 uppercase tracking-tight">{section.title}</h3>
                <p className="text-white/40 text-lg leading-relaxed font-light">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Journey Timeline */}
        <section className="mb-40">
          <h3 className="text-4xl md:text-6xl font-black mb-20 uppercase tracking-tighter text-center">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/20">Timeline</span>
          </h3>
          <div className="max-w-4xl mx-auto space-y-16">
            {(bio?.timeline || [
              { year: '2023', event: 'Started Music Journey' },
              { year: '2024', event: 'Improved Songwriting' },
              { year: '2025', event: 'Released Original Music' },
              { year: '2026', event: 'Official Website Launch' }
            ]).map((item, i) => (
              <div key={i} className="flex gap-10 group">
                <div className="text-3xl font-black text-white/20 group-hover:text-[#FACC15] transition-all pt-1 tracking-tighter w-24">
                  {item.year}
                </div>
                <div className="flex-1 pt-2 border-l border-white/5 pl-10 pb-4 group-last:border-transparent">
                  <p className="text-xl text-white/40 font-light group-hover:text-white transition-colors">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Identity Block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-black/40 p-10 rounded-sm border border-white/5 backdrop-blur-sm">
            <FileText className="text-[#FACC15] mb-8" size={32} />
            <h4 className="text-2xl font-black mb-4 uppercase tracking-tight">{about?.lyricistTitle || 'Lyricist'}</h4>
            <p className="text-white/40 font-light leading-relaxed">{about?.lyricistContent || 'Crafting emotional storytelling through Hindi and Hinglish lyrics inspired by personal life experiences.'}</p>
          </div>
          <div className="bg-black/40 p-10 rounded-sm border border-white/5 backdrop-blur-sm">
            <PenTool className="text-[#FACC15] mb-8" size={32} />
            <h4 className="text-2xl font-black mb-4 uppercase tracking-tight">{about?.digitalTitle || 'Digital Presence'}</h4>
            <p className="text-white/40 font-light leading-relaxed">{about?.digitalContent || 'Independently building a digital brand as a web developer, graphic designer, and video editor.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
