import React, { useState, useEffect, useRef } from 'react';
import { 
  Routes, 
  Route, 
  useNavigate, 
  useLocation
} from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { SCPEntry } from './types';
import { supabase } from './lib/supabase';
import { scpService } from './services/scpService';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { DiscoveryProtocol } from './components/DiscoveryProtocol';
import { SCPDetailView } from './components/SCPDetailView';
import { DirectoryPage } from './pages/DirectoryPage';
import { SCPDetailPage } from './pages/SCPDetailPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AdminPage } from './pages/AdminPage';
import { OfflineBanner } from './components/OfflineBanner';
import { Activity } from 'lucide-react';

import { UIProvider, useUI } from './context/UIContext';

import { useSCPAllEntries } from './hooks/useSCPHooks';

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const [isTransitioning, setIsTransitioning] = useState(true);
  const location = useLocation();

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 800);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {isTransitioning && (
          <motion.div
            key="transition-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center gap-6 pointer-events-none"
          >
            <div className="relative w-24 h-24">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-t-2 border-foundation-accent rounded-full opacity-40"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Activity className="w-6 h-6 text-foundation-accent animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-sm font-bold font-mono text-white uppercase tracking-[0.4em] animate-pulse">Neural Mapping</h2>
              <p className="text-[8px] font-mono text-foundation-muted uppercase tracking-widest">Synchronizing Foundation Database...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

function AppContent() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isAdmin, setIsAdmin, showDiscovery, setShowDiscovery } = useUI();
  const [selectedScp, setSelectedScp] = useState<SCPEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: allScps } = useSCPAllEntries();

  // Track page views for Google Analytics
  useEffect(() => {
    if ((window as any).gtag) {
      (window as any).gtag('config', 'G-BX510P3S8P', {
        page_path: pathname,
      });
    }
  }, [pathname]);

  useEffect(() => {
    if (isAdmin && pathname === '/login') {
      navigate('/admin');
    }
  }, [isAdmin, pathname, navigate]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Initial check
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
      const isUserAdmin = !!session?.user && !!adminEmail && session.user.email === adminEmail;
      setIsAdmin(isUserAdmin);
      
      // Clear cache on auth change to prevent RLS stale data issues
      const queryClient = (window as any).queryClient;
      if (queryClient) {
        queryClient.invalidateQueries();
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    if (!supabase) {
      setIsAdmin(false);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const isUserAdmin = !!user && !!adminEmail && user.email === adminEmail;
    setIsAdmin(isUserAdmin);
  };

  const handleLogout = async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
      setIsAdmin(false);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Force state update even if signOut fails
      setIsAdmin(false);
      navigate('/', { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-foundation-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-foundation-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-foundation-muted uppercase tracking-widest">Decrypting Database...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <OfflineBanner />
      <PageTransition>
        <Routes location={location} key={location.pathname}>
          <Route 
            path="/" 
            element={
              <DirectoryPage 
                onLogout={handleLogout} 
              />
            } 
          />
          <Route 
            path="/scp/:id" 
            element={
              <SCPDetailPage 
                onLogout={handleLogout} 
              />
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <AnalyticsPage 
                onLogout={handleLogout} 
              />
            } 
          />
          <Route 
            path="/login" 
            element={
              <AdminLogin onLogin={() => { setIsAdmin(true); navigate('/admin'); }} />
            } 
          />
          <Route 
            path="/admin" 
            element={
              isAdmin ? (
                <AdminPage 
                  onLogout={handleLogout}
                  onPreview={(scp) => setSelectedScp(scp)}
                />
              ) : (
                <AdminLogin onLogin={() => { setIsAdmin(true); navigate('/admin'); }} />
              )
            } 
          />
        </Routes>
      </PageTransition>

      {/* Discovery Protocol Modal */}
      <AnimatePresence>
        {showDiscovery && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <DiscoveryProtocol 
              onSelect={(scp) => {
                setShowDiscovery(false);
                navigate(`/scp/${scp.scp_designation}`);
              }} 
              onClose={() => setShowDiscovery(false)} 
            />
          </div>
        )}
      </AnimatePresence>

      {/* Global Preview Modal for Admin */}
      <AnimatePresence>
        {selectedScp && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto">
              <SCPDetailView 
                scp={selectedScp} 
                allScps={allScps || []}
                onBack={() => setSelectedScp(null)} 
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <UIProvider>
      <AppContent />
    </UIProvider>
  );
}
