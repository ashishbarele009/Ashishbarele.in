/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { Video } from '../../types';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Search, 
  Video as VideoIcon, 
  Save, 
  X, 
  Loader2,
  Calendar,
  Youtube,
  Play
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import ImageUpload from './ImageUpload';
import { motion } from 'motion/react';
import { getYoutubeId, getYoutubeThumbnail } from '../../lib/youtube';

export default function VideoManager() {
  const { data: videos, loading } = useFirestoreCollection<Video>('videos', orderBy('releaseDate', 'desc'));
  const [isEditing, setIsEditing] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<Partial<Video> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleYoutubeUrlChange = (url: string) => {
    if (!currentVideo) return;
    
    const videoId = getYoutubeId(url);
    const updates: Partial<Video> = { youtubeUrl: url };
    
    if (videoId) {
      // Auto-populate thumbnail if it's empty or looks like a YouTube thumbnail
      if (!currentVideo.thumbnailUrl || currentVideo.thumbnailUrl.includes('img.youtube.com')) {
        updates.thumbnailUrl = getYoutubeThumbnail(videoId);
      }
    }
    
    setCurrentVideo({ ...currentVideo, ...updates });
  };

  const handleEdit = (video: Video) => {
    setCurrentVideo(video);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentVideo({
      title: '',
      thumbnailUrl: '',
      youtubeUrl: '',
      description: '',
      order: videos.length,
      releaseDate: null
    });
    setIsEditing(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentVideo) return;
    setSaving(true);

    try {
      const releaseDate = currentVideo.releaseDate;
      let processedDate = releaseDate;

      if (typeof releaseDate === 'string') {
        const date = new Date(releaseDate);
        processedDate = isNaN(date.getTime()) ? releaseDate : date;
      }

      const videoData = {
        ...currentVideo,
        releaseDate: processedDate || serverTimestamp()
      };

      if (currentVideo.id) {
        const { id, ...rest } = videoData;
        await updateDoc(doc(db, 'videos', id as string), rest as any);
      } else {
        await addDoc(collection(db, 'videos'), videoData);
      }
      setIsEditing(false);
      setCurrentVideo(null);
    } catch (err) {
      console.error('Error saving video:', err);
      alert('Failed to save video.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      await deleteDoc(doc(db, 'videos', id));
    } catch (err) {
      console.error('Error deleting video:', err);
    }
  };

  if (loading && videos.length === 0) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-yellow-500" /></div>;
  }

  return (
    <div className="space-y-8">
      {isEditing ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-8 max-w-4xl mx-auto"
        >
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-bold">{currentVideo?.id ? 'Edit Video' : 'Add New Video'}</h3>
            <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-white/10 rounded-full">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <ImageUpload 
                  label="Video Thumbnail" 
                  currentImageUrl={currentVideo?.thumbnailUrl}
                  pageName="Videos"
                  sectionName={currentVideo?.title || 'New Video'}
                  mode="collection"
                  onUploadSuccess={(url) => setCurrentVideo({ ...currentVideo, thumbnailUrl: url })}
                />
                
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">TITLE</label>
                  <input 
                    required
                    type="text"
                    value={currentVideo?.title}
                    onChange={(e) => setCurrentVideo({ ...currentVideo, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:outline-none focus:border-yellow-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">RELEASE DATE</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input 
                      type="date"
                      value={currentVideo?.releaseDate ? (typeof currentVideo.releaseDate === 'string' ? currentVideo.releaseDate : new Date(currentVideo.releaseDate.toDate ? currentVideo.releaseDate.toDate() : currentVideo.releaseDate).toISOString().split('T')[0]) : ''}
                      onChange={(e) => setCurrentVideo({ ...currentVideo, releaseDate: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-4 focus:outline-none focus:border-yellow-500/50 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">YOUTUBE URL</label>
                  <div className="relative">
                    <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input 
                      type="url"
                      value={currentVideo?.youtubeUrl}
                      onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-4 focus:outline-none focus:border-yellow-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">DESCRIPTION</label>
                  <textarea 
                    rows={6}
                    value={currentVideo?.description}
                    onChange={(e) => setCurrentVideo({ ...currentVideo, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:outline-none focus:border-yellow-500/50 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-8 border-t border-white/10">
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-8 py-3 rounded-xl border border-white/10 font-bold hover:bg-white/5 transition-all"
              >
                CANCEL
              </button>
              <button 
                disabled={saving}
                className="px-10 py-3 bg-yellow-500 text-black font-black tracking-widest rounded-xl hover:bg-yellow-400 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {currentVideo?.id ? 'UPDATE VIDEO' : 'SAVE VIDEO'}
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="relative flex-grow max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input 
                type="text" 
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-3 focus:outline-none focus:border-yellow-500/50"
              />
            </div>
            <button 
              onClick={handleAddNew}
              className="px-6 py-3 bg-yellow-500 text-black font-bold tracking-widest rounded-xl hover:bg-yellow-400 transition-all flex items-center gap-2 shadow-lg shadow-yellow-500/10"
            >
              <Plus size={20} /> ADD NEW VIDEO
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredVideos.map((video) => (
              <div 
                key={video.id} 
                className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden hover:bg-white/[0.07] transition-all group"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Play className="text-white fill-white" size={40} />
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-white mb-1">{video.title}</h4>
                      <p className="text-xs text-gray-500 tracking-widest uppercase">
                        {video.releaseDate?.toDate ? new Date(video.releaseDate.toDate()).toLocaleDateString() : 'NO DATE'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEdit(video)}
                        className="p-2 bg-white/5 hover:bg-yellow-500 hover:text-black rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(video.id!)}
                        className="p-2 bg-white/5 hover:bg-red-600 hover:text-white rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2">{video.description}</p>
                </div>
              </div>
            ))}
            {filteredVideos.length === 0 && (
              <div className="md:col-span-2 text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                <VideoIcon className="mx-auto mb-4 text-gray-700" size={48} />
                <p className="text-gray-500">No videos found in your library.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
