/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useFirestoreCollection } from '../../hooks/useFirestore';
import { Song, Video, GalleryItem, ContactMessage } from '../../types';
import { Music, Video as VideoIcon, ImageIcon, Mail, TrendingUp, Clock, Settings } from 'lucide-react';
import { motion } from 'motion/react';

export default function DashboardOverview() {
  const { data: songs } = useFirestoreCollection<Song>('songs');
  const { data: videos } = useFirestoreCollection<Video>('videos');
  const { data: gallery } = useFirestoreCollection<GalleryItem>('gallery');
  const { data: messages } = useFirestoreCollection<ContactMessage>('contact');

  const unreadMessages = messages.filter(m => m.status === 'unread').length;

  const stats = [
    { label: 'Total Songs', value: songs.length, icon: Music, color: 'text-blue-500' },
    { label: 'Total Videos', value: videos.length, icon: VideoIcon, color: 'text-red-500' },
    { label: 'Gallery Images', value: gallery.length, icon: ImageIcon, color: 'text-purple-500' },
    { label: 'Messages', value: messages.length, icon: Mail, color: 'text-green-500', unread: unreadMessages },
  ];

  return (
    <div className="space-y-12">
      {/* Welcome Section */}
      <section>
        <h3 className="text-gray-500 font-bold tracking-widest text-sm mb-2">OVERVIEW</h3>
        <h1 className="text-4xl font-black text-white">Welcome back, Ashish</h1>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 border border-white/10 p-8 rounded-3xl group hover:border-yellow-500/30 transition-all"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl bg-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              {stat.unread !== undefined && stat.unread > 0 && (
                <span className="px-3 py-1 bg-yellow-500 text-black text-[10px] font-black rounded-full">
                  {stat.unread} UNREAD
                </span>
              )}
            </div>
            <p className="text-3xl font-black text-white mb-2">{stat.value}</p>
            <p className="text-gray-500 font-medium tracking-wide text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Messages */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-xl font-bold flex items-center gap-3">
              <Mail className="text-yellow-500" /> Recent Messages
            </h4>
            <span className="text-xs text-gray-500">LAST 5 ENTRIES</span>
          </div>
          <div className="space-y-4">
            {messages.slice(0, 5).map(msg => (
              <div key={msg.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold text-white">{msg.name}</p>
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest flex items-center gap-1">
                    <Clock size={10} /> {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                  </p>
                </div>
                <p className="text-sm text-gray-400 line-clamp-1">{msg.subject}</p>
              </div>
            ))}
            {messages.length === 0 && <p className="text-center py-8 text-gray-600">No messages yet.</p>}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="text-yellow-500" /> <h4 className="text-xl font-bold">Quick Actions</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-yellow-500 hover:text-black transition-all text-left font-bold group">
              <Music className="mb-4 text-yellow-500 group-hover:text-black" />
              Add New <br /> Song
            </button>
            <button className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-yellow-500 hover:text-black transition-all text-left font-bold group">
              <VideoIcon className="mb-4 text-yellow-500 group-hover:text-black" />
              Add New <br /> Video
            </button>
            <button className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-yellow-500 hover:text-black transition-all text-left font-bold group">
              <ImageIcon className="mb-4 text-yellow-500 group-hover:text-black" />
              Upload <br /> Gallery
            </button>
            <button className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-yellow-500 hover:text-black transition-all text-left font-bold group">
              <Settings className="mb-4 text-yellow-500 group-hover:text-black" />
              Site <br /> Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
