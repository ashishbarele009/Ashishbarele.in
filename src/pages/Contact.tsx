/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Send, Mail, Instagram, Youtube, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Send to Formspree
      const response = await fetch('https://formspree.io/f/xgojkkpg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Formspree submission failed');
      }

      // 2. Backup to Firestore
      await addDoc(collection(db, 'contact'), {
        ...formData,
        createdAt: serverTimestamp(),
        status: 'unread'
      });

      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <h2 className="text-[#FACC15] font-bold tracking-[0.4em] mb-4 text-xs uppercase">Connection</h2>
          <h1 className="text-4xl xs:text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none">
            <span className="stripe-text">Drop</span> a<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/20">Message</span>
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Info Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <div>
              <h3 className="text-4xl font-black mb-6 uppercase tracking-tighter leading-none">Let's Create <br /> Something Together</h3>
              <p className="text-white/40 text-lg leading-relaxed font-light">
                Whether you have a question about my music, business inquiries, or just want to say hello, feel free to drop a message.
              </p>
            </div>

            <div className="space-y-6">
              <motion.a 
                whileHover={{ x: 10, scale: 1.02 }}
                href="mailto:ashishbarele09@gmail.com" 
                className="flex items-center gap-6 p-8 bg-black/40 rounded-sm border border-white/5 hover:border-[#FACC15]/30 transition-all group backdrop-blur-sm shadow-xl"
              >
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-[#FACC15] group-hover:bg-[#FACC15] group-hover:text-black transition-all">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-white/30 tracking-[0.2em] font-black uppercase mb-1">EMAIL ME</p>
                  <p className="text-xl font-bold uppercase tracking-tight">ashishbarele09@gmail.com</p>
                </div>
              </motion.a>
              
              <div className="flex gap-6">
                <motion.a 
                  whileHover={{ y: -5, scale: 1.02 }}
                  href="https://www.instagram.com/ashish__barele" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex-1 flex items-center gap-6 p-8 bg-black/40 rounded-sm border border-white/5 hover:border-[#FACC15]/30 transition-all group backdrop-blur-sm shadow-xl"
                >
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-[#FACC15] group-hover:bg-[#FACC15] group-hover:text-black transition-all">
                    <Instagram size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30 tracking-[0.2em] font-black uppercase mb-1">INSTAGRAM</p>
                    <p className="text-lg font-bold uppercase tracking-tight">@ashish__barele</p>
                  </div>
                </motion.a>
              </div>
            </div>
          </motion.div>

          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#080808] p-8 md:p-12 rounded-sm border border-white/5 shadow-2xl relative overflow-hidden"
          >
            {success ? (
              <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
                <CheckCircle2 size={80} className="text-[#FACC15] mx-auto mb-8" />
                <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter">Message Sent!</h3>
                <p className="text-white/40 mb-8 font-light">Thank you for reaching out. I'll get back to you as soon as possible.</p>
                <button 
                  onClick={() => setSuccess(false)}
                  className="px-8 py-3 bg-white text-black hover:bg-[#FACC15] rounded-sm transition-all text-[10px] font-black tracking-widest uppercase"
                >
                  SEND ANOTHER
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black tracking-[0.2em] text-white/30 uppercase ml-1">FULL NAME</label>
                    <input 
                      required
                      name="name"
                      type="text"
                      placeholder="Ashish Barele"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/5 rounded-sm px-6 py-4 focus:outline-none focus:border-[#FACC15]/50 transition-colors placeholder:text-white/10 font-light text-white"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black tracking-[0.2em] text-white/30 uppercase ml-1">EMAIL ADDRESS</label>
                    <input 
                      required
                      name="email"
                      type="email"
                      placeholder="hello@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/5 rounded-sm px-6 py-4 focus:outline-none focus:border-[#FACC15]/50 transition-colors placeholder:text-white/10 font-light text-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black tracking-[0.2em] text-white/30 uppercase ml-1">SUBJECT</label>
                  <input 
                    required
                    name="subject"
                    type="text"
                    placeholder="Inquiry about collaboration"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-white/5 border border-white/5 rounded-sm px-6 py-4 focus:outline-none focus:border-[#FACC15]/50 transition-colors placeholder:text-white/10 font-light text-white"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black tracking-[0.2em] text-white/30 uppercase ml-1">YOUR MESSAGE</label>
                  <textarea 
                    required
                    name="message"
                    rows={5}
                    placeholder="Write your message here..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-white/5 border border-white/5 rounded-sm px-6 py-4 focus:outline-none focus:border-[#FACC15]/50 transition-colors placeholder:text-white/10 font-light text-white resize-none"
                  />
                </div>

                {error && <p className="text-red-500 text-[10px] font-black tracking-widest uppercase">{error}</p>}

                <button 
                  disabled={loading}
                  className="w-full py-5 bg-white text-black font-black tracking-[0.3em] text-[10px] rounded-sm hover:bg-[#FACC15] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group uppercase"
                >
                  {loading ? 'SENDING...' : 'SEND MESSAGE'}
                  {!loading && <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
