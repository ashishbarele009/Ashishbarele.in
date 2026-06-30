/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Music from './pages/Music';
import Videos from './pages/Videos';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedLayout from './components/admin/ProtectedLayout';
import { useEffect, useState } from 'react';
import { auth } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import BrandingProvider from './components/layout/BrandingProvider';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <HelmetProvider>
      <BrandingProvider>
        {loading ? (
          <div className="flex items-center justify-center min-h-screen bg-black text-yellow-500">
            <div className="stripe-text text-3xl font-bold tracking-[0.3em] uppercase">ASHISHBARELE</div>
          </div>
        ) : (
          <Router>
            <div className="min-h-screen bg-black text-gray-100 flex flex-col overflow-x-hidden">
              <Navbar />
              <main className="flex-grow flex flex-col">
                <AnimatedRoutes user={user} />
              </main>
              <Footer />
            </div>
          </Router>
        )}
      </BrandingProvider>
    </HelmetProvider>
  );
}

function AnimatedRoutes({ user }: { user: User | null }) {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex-grow flex flex-col"
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/music" element={<Music />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route 
            path="/admin-login" 
            element={user && user.email === 'ashishbarele09@gmail.com' ? <Navigate to="/admin-panel" /> : <AdminLogin />} 
          />
          
          <Route element={<ProtectedLayout user={user} />}>
            <Route path="/admin-panel" element={<AdminDashboard />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
