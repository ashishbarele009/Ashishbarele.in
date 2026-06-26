/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { Song } from '../../types';
import { motion } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Search, 
  Music, 
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
import { getYoutubeId, getYoutubeThumbnail } from '../../lib/youtube';

export default function MusicManager() {
  const { data: songs, loading } = useFirestoreCollection<Song>('songs', orderBy('releaseDate', 'desc'));
  const [isEditing, setIsEditing] = useState(false);
  const [currentSong, setCurrentSong] = useState<Partial<Song> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredSongs = songs.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleYoutubeUrlChange = (url: string) => {
    if (!currentSong) return;
    
    const videoId = getYoutubeId(url);
    const updates: Partial<Song> = { youtubeUrl: url };
    
    if (videoId) {
      // Auto-populate cover if it's empty or looks like a YouTube thumbnail
      if (!currentSong.coverUrl || currentSong.coverUrl.includes('img.youtube.com')) {
        updates.coverUrl = getYoutubeThumbnail(videoId);
      }
    }
    
    setCurrentSong({ ...currentSong, ...updates });
  };

  const handleEdit = (song: Song) => {
    setCurrentSong(song);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentSong({
      title: '',
      coverUrl: '',
      description: '',
      spotifyUrl: '',
      youtubeUrl: '',
      lyrics: '',
      order: songs.length,
      releaseDate: null
    });
    setIsEditing(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentSong) return;
    setSaving(true);

    try {
      const releaseDate = currentSong.releaseDate;
      let processedDate = releaseDate;

      if (typeof releaseDate === 'string') {
        const date = new Date(releaseDate);
        processedDate = isNaN(date.getTime()) ? releaseDate : date;
      }

      const songData = {
        ...currentSong,
        releaseDate: processedDate || serverTimestamp()
      };

      if (currentSong.id) {
        const { id, ...rest } = songData;
        await updateDoc(doc(db, 'songs', id as string), rest as any);
      } else {
        await addDoc(collection(db, 'songs'), songData);
      }
      setIsEditing(false);
      setCurrentSong(null);
    } catch (err) {
      console.error('Error saving song:', err);
      alert('Failed to save song.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this song?')) return;
    try {
      await deleteDoc(doc(db, 'songs', id));
    } catch (err) {
      console.error('Error deleting song:', err);
    }
  };

  if (loading && songs.length === 0) {
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
            <h3 className="text-2xl font-bold">{currentSong?.id ? 'Edit Song' : 'Add New Song'}</h3>
            <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-white/10 rounded-full">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <ImageUpload 
                  label="Song Cover" 
                  currentImageUrl={currentSong?.coverUrl}
                  pageName="Music"
                  sectionName={currentSong?.title || 'New Song'}
                  mode="collection"
                  onUploadSuccess={(url) => setCurrentSong({ ...currentSong, coverUrl: url })}
                />
                
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">TITLE</label>
                  <input 
                    required
                    type="text"
                    value={currentSong?.title}
                    onChange={(e) => setCurrentSong({ ...currentSong, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:outline-none focus:border-yellow-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">RELEASE DATE</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input 
                      type="date"
                      value={currentSong?.releaseDate ? (typeof currentSong.releaseDate === 'string' ? currentSong.releaseDate : new Date(currentSong.releaseDate.toDate ? currentSong.releaseDate.toDate() : currentSong.releaseDate).toISOString().split('T')[0]) : ''}
                      onChange={(e) => setCurrentSong({ ...currentSong, releaseDate: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-4 focus:outline-none focus:border-yellow-500/50 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">SPOTIFY URL</label>
                  <div className="relative">
                    <Play className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input 
                      type="url"
                      value={currentSong?.spotifyUrl}
                      onChange={(e) => setCurrentSong({ ...currentSong, spotifyUrl: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-4 focus:outline-none focus:border-yellow-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">YOUTUBE URL</label>
                  <div className="relative">
                    <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input 
                      type="url"
                      value={currentSong?.youtubeUrl}
                      onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-4 focus:outline-none focus:border-yellow-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">DESCRIPTION</label>
                  <textarea 
                    rows={4}
                    value={currentSong?.description}
                    onChange={(e) => setCurrentSong({ ...currentSong, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:outline-none focus:border-yellow-500/50 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">LYRICS</label>
                  <textarea 
                    rows={6}
                    value={currentSong?.lyrics}
                    onChange={(e) => setCurrentSong({ ...currentSong, lyrics: e.target.value })}
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
                {currentSong?.id ? 'UPDATE SONG' : 'SAVE SONG'}
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
                placeholder="Search songs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-3 focus:outline-none focus:border-yellow-500/50"
              />
            </div>
            <button 
              onClick={handleAddNew}
              className="px-6 py-3 bg-yellow-500 text-black font-bold tracking-widest rounded-xl hover:bg-yellow-400 transition-all flex items-center gap-2 shadow-lg shadow-yellow-500/10"
            >
              <Plus size={20} /> ADD NEW SONG
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredSongs.map((song) => (
              <div 
                key={song.id} 
                className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-6 hover:bg-white/[0.07] transition-all group"
              >
                <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-white/10">
                  <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow text-center sm:text-left">
                  <h4 className="text-xl font-bold text-white mb-1">{song.title}</h4>
                  <p className="text-xs text-gray-500 tracking-widest uppercase">
                    {song.releaseDate?.toDate ? new Date(song.releaseDate.toDate()).toLocaleDateString() : 'NO DATE'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(song)}
                    className="p-3 bg-white/5 hover:bg-yellow-500 hover:text-black rounded-xl transition-all"
                    title="Edit Song"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(song.id!)}
                    className="p-3 bg-white/5 hover:bg-red-600 hover:text-white rounded-xl transition-all"
                    title="Delete Song"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {filteredSongs.length === 0 && (
              <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                <Music className="mx-auto mb-4 text-gray-700" size={48} />
                <p className="text-gray-500">No songs found in your library.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
