/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Lock, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ADMIN_EMAIL = 'ashishbarele09@gmail.com';

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      if (result.user.email === ADMIN_EMAIL) {
        navigate('/admin-panel');
      } else {
        await signOut(auth);
        setError('Unauthorized access. Only the administrator can login.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login with Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#080808] p-10 rounded-sm border border-white/5 shadow-2xl relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#FACC15]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#FACC15]/5 rounded-full blur-3xl" />

        <div className="relative z-10 text-center mb-12">
          <div className="w-16 h-16 bg-[#FACC15] rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(250,204,21,0.2)]">
            <Lock className="text-black" size={28} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-2 uppercase leading-none">Admin<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/20">Access</span></h1>
          <p className="text-white/20 text-[10px] font-bold tracking-[0.4em] uppercase mt-4">Security Protocol</p>
        </div>

        <div className="space-y-6 relative z-10">
          {error && (
            <div className="flex items-center gap-3 p-6 bg-red-500/5 border border-red-500/20 rounded-sm text-red-500 text-xs">
              <AlertCircle size={18} />
              <p className="font-bold tracking-tight">{error}</p>
            </div>
          )}

          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-5 bg-white text-black font-black tracking-[0.2em] text-[10px] rounded-sm hover:bg-[#FACC15] transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed uppercase shadow-2xl"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Authenticating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </>
            )}
          </button>

          <div className="flex items-center gap-4 py-4">
            <div className="flex-1 h-[1px] bg-white/5"></div>
            <span className="text-[9px] text-white/10 font-bold tracking-[0.3em] uppercase">Private</span>
            <div className="flex-1 h-[1px] bg-white/5"></div>
          </div>

          <p className="text-center text-[9px] text-white/20 tracking-[0.2em] uppercase font-bold">
            Authorized Personnel Only
          </p>
        </div>
      </motion.div>
    </div>
  );
}
