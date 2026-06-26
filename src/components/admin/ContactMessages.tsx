/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useFirestoreCollection } from '../../hooks/useFirestore';
import { ContactMessage } from '../../types';
import { 
  Trash2, 
  Mail, 
  CheckCircle, 
  Clock, 
  User, 
  AtSign, 
  MessageSquare,
  Loader2,
  X
} from 'lucide-react';
import { 
  deleteDoc, 
  doc, 
  updateDoc, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useState, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function ContactMessages() {
  const { data: messages, loading } = useFirestoreCollection<ContactMessage>('contact', orderBy('createdAt', 'desc'));
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const handleDelete = async (id: string, e: MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await deleteDoc(doc(db, 'contact', id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  const toggleReadStatus = async (msg: ContactMessage, e: MouseEvent) => {
    e.stopPropagation();
    try {
      await updateDoc(doc(db, 'contact', msg.id!), {
        status: msg.status === 'read' ? 'unread' : 'read'
      });
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const openMessage = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (msg.status === 'unread') {
      try {
        await updateDoc(doc(db, 'contact', msg.id!), { status: 'read' });
      } catch (err) {
        console.error('Error marking as read:', err);
      }
    }
  };

  if (loading && messages.length === 0) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-yellow-500" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Messages List */}
        <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              onClick={() => openMessage(msg)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer relative group ${
                selectedMessage?.id === msg.id 
                ? 'bg-yellow-500 border-yellow-500 text-black' 
                : msg.status === 'unread' 
                  ? 'bg-white/10 border-white/20 text-white' 
                  : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/[0.07]'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <p className={`font-bold tracking-tight ${selectedMessage?.id === msg.id ? 'text-black' : 'text-white'}`}>
                  {msg.name}
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => toggleReadStatus(msg, e)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <CheckCircle size={16} className={msg.status === 'read' ? 'text-green-500' : 'opacity-20'} />
                  </button>
                  <button 
                    onClick={(e) => handleDelete(msg.id!, e)}
                    className="p-1 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-xs font-bold truncate mb-1">{msg.subject}</p>
              <p className="text-[10px] opacity-60 flex items-center gap-1">
                <Clock size={10} /> {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleString() : 'Just now'}
              </p>
              {msg.status === 'unread' && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-500 rounded-full -translate-y-1/2 translate-x-1/2" />
              )}
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-center py-20 opacity-20">
              <Mail size={48} className="mx-auto mb-4" />
              <p>Inbox is empty</p>
            </div>
          )}
        </div>

        {/* Message View */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedMessage ? (
              <motion.div
                key={selectedMessage.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-12 min-h-full space-y-10"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <h3 className="text-3xl font-black text-white">{selectedMessage.subject}</h3>
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div className="flex items-center gap-2 text-yellow-500">
                        <User size={16} /> <span className="font-bold">{selectedMessage.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <AtSign size={16} /> <span className="font-medium">{selectedMessage.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock size={16} /> <span>{selectedMessage.createdAt?.toDate ? new Date(selectedMessage.createdAt.toDate()).toLocaleString() : 'Just now'}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedMessage(null)} className="lg:hidden p-2 bg-white/10 rounded-full">
                    <X size={20} />
                  </button>
                </div>

                <div className="bg-white/5 p-8 rounded-2xl border border-white/5 min-h-[300px]">
                  <div className="flex gap-4 mb-6 opacity-30">
                    <MessageSquare size={24} />
                    <span className="text-xs font-bold tracking-widest uppercase">MESSAGE CONTENT</span>
                  </div>
                  <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>

                <div className="flex justify-end gap-4">
                  <a 
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    className="px-8 py-3 bg-yellow-500 text-black font-black tracking-widest rounded-xl hover:bg-yellow-400 transition-all flex items-center gap-2"
                  >
                    <Mail size={18} /> REPLY BY EMAIL
                  </a>
                  <button 
                    onClick={(e) => handleDelete(selectedMessage.id!, e as any)}
                    className="px-8 py-3 bg-white/5 text-red-500 border border-red-500/20 font-bold tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
                  >
                    <Trash2 size={18} /> DELETE MESSAGE
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white/5 border border-dashed border-white/10 rounded-3xl p-20 text-center min-h-[500px] flex flex-col items-center justify-center space-y-6">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-gray-700">
                  <Mail size={40} />
                </div>
                <h4 className="text-2xl font-bold text-gray-500">Select a message to read</h4>
                <p className="text-gray-600 max-w-xs">New inquiries and collaboration requests from your website will appear here.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
