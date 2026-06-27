/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-yellow-500">
        <div className="animate-pulse text-2xl font-bold tracking-widest">ASHISHBARELE</div>
      </div>
    );
  }

  return (
    <HelmetProvider>
      <BrandingProvider>
        <Router>
          <div className="min-h-screen bg-black text-gray-100 flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
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
            </main>
            <Footer />
          </div>
        </Router>
      </BrandingProvider>
    </HelmetProvider>
  );
}
