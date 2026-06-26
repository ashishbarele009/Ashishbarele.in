/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  const [clickCount, setClickCount] = useState(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  const handleSecretClick = () => {
    setClickCount((prev) => prev + 1);

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    clickTimeoutRef.current = setTimeout(() => {
      setClickCount(0);
    }, 2000);
  };

  useEffect(() => {
    if (clickCount >= 6) {
      navigate('/admin-login');
      setClickCount(0);
    }
  }, [clickCount, navigate]);

  return (
    <footer className="bg-[#080808] border-t border-white/5 py-10">
      <div className="max-w-7xl mx-auto px-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0">
          <div 
            onClick={handleSecretClick}
            className="text-[10px] text-white/30 uppercase tracking-[0.1em] cursor-pointer select-none"
          >
            &copy; {new Date().getFullYear()} <span className="text-[#FACC15] font-bold">ASHISHBARELE</span>. ALL RIGHTS RESERVED.
          </div>

          <div className="flex gap-8">
            <a 
              href="https://www.instagram.com/ashish__barele" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/20 hover:text-[#FACC15] transition-colors"
            >
              <Instagram size={18} />
            </a>
            <a 
              href="https://www.youtube.com/@ASHISHBARELE" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/20 hover:text-[#FACC15] transition-colors"
            >
              <Youtube size={18} />
            </a>
          </div>

          <div className="flex gap-6">
            <span className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-bold">Songwriter</span>
            <span className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-bold">Rapper</span>
            <span className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-bold">Composer</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
