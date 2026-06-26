/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { 
  LayoutDashboard, 
  Music, 
  Video, 
  Image as ImageIcon, 
  User, 
  Info, 
  Mail, 
  Search, 
  Settings, 
  LogOut,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Placeholder sub-components (will create these next)
import MusicManager from '../../components/admin/MusicManager';
import VideoManager from '../../components/admin/VideoManager';
import GalleryManager from '../../components/admin/GalleryManager';
import AboutEditor from '../../components/admin/AboutEditor';
import ContactMessages from '../../components/admin/ContactMessages';
import SEOManager from '../../components/admin/SEOManager';
import DashboardOverview from '../../components/admin/DashboardOverview';
import HomeEditor from '../../components/admin/HomeEditor';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'home', label: 'Home Editor', icon: LayoutDashboard }, // Using LayoutDashboard for home too
  { id: 'music', label: 'Music Manager', icon: Music },
  { id: 'videos', label: 'Video Manager', icon: Video },
  { id: 'gallery', label: 'Gallery Manager', icon: ImageIcon },
  { id: 'about', label: 'About & Bio Editor', icon: Info },
  { id: 'contact', label: 'Contact Messages', icon: Mail },
  { id: 'seo', label: 'SEO Manager', icon: Search },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardOverview />;
      case 'home': return <HomeEditor />;
      case 'music': return <MusicManager />;
      case 'videos': return <VideoManager />;
      case 'gallery': return <GalleryManager />;
      case 'about': return <AboutEditor />;
      case 'contact': return <ContactMessages />;
      case 'seo': return <SEOManager />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex text-gray-300">
      {/* Sidebar */}
      <aside 
        className={`fixed lg:static z-[60] inset-y-0 left-0 bg-black border-r border-white/10 transition-all duration-300 ${
          isSidebarOpen ? 'w-72' : 'w-0 lg:w-20'
        } overflow-hidden`}
      >
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-black font-black">A</span>
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden whitespace-nowrap">
                <p className="text-white font-bold tracking-widest text-sm">ASHISHBARELE</p>
                <p className="text-gray-500 text-[10px] tracking-[0.2em]">ADMIN PANEL</p>
              </div>
            )}
          </div>

          <nav className="flex-grow space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id 
                  ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10 font-bold' 
                  : 'hover:bg-white/5 text-gray-500 hover:text-white'
                }`}
              >
                <tab.icon size={22} />
                {isSidebarOpen && <span className="text-sm tracking-wide">{tab.label}</span>}
              </button>
            ))}
          </nav>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all mt-auto"
          >
            <LogOut size={22} />
            {isSidebarOpen && <span className="text-sm tracking-wide">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow flex flex-col min-w-0">
        <header className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-black/50 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/10 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-white capitalize">
              {tabs.find(t => t.id === activeTab)?.label || 'Dashboard'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white">Ashish Barele</p>
              <p className="text-[10px] text-yellow-500 tracking-widest uppercase">SUPER ADMIN</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
              <User size={20} />
            </div>
          </div>
        </header>

        <main className="p-8 max-w-7xl w-full mx-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
