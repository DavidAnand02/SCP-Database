import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { SCPEntry } from '../types';
import { SCPHeader } from './SCPDetail/SCPHeader';
import { useNavigate, useLocation } from 'react-router-dom';
import { SCPSidebar } from './SCPDetail/SCPSidebar';
import { SimilarAnomalies } from './SimilarAnomalies';
import { SCPForensicReport } from './SCPDetail/SCPForensicReport';

interface SCPDetailViewProps {
  scp: SCPEntry;
  allScps?: SCPEntry[];
  onBack: () => void;
  backLabel?: string;
}

export const SCPDetailView = ({ scp, allScps = [], onBack, backLabel }: SCPDetailViewProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [activeTab, setActiveTab] = useState<'overview' | 'description' | 'containment' | 'addenda'>('overview');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsAuthorized(true), 800);
    return () => clearTimeout(timer);
  }, [scp.id]);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-150px 0px -70% 0px',
      threshold: 0
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveTab(entry.target.id as any);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    const sections = ['overview', 'description', 'containment', 'addenda'];
    
    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [scp]);

  const handleSelectSimilar = (newScp: SCPEntry) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (pathname.startsWith('/scp/')) {
      navigate(`/scp/${newScp.scp_designation}`);
    } else {
      onBack();
      navigate(`/scp/${newScp.scp_designation}`);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveTab(id as any);
    }
  };

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto space-y-12 pb-20 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>{scp.scp_designation} | {scp.code_name || 'Classified'} | SCP Foundation</title>
      </Helmet>

      <SCPHeader scp={scp} onBack={onBack} backLabel={backLabel} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-8 space-y-12 w-full overflow-hidden">
          {/* Navigation Tabs */}
          <div className="bg-foundation-bg border-b border-foundation-border py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {(['overview', 'description', 'containment', 'addenda'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => scrollToSection(tab)}
                  className={`px-3 sm:px-6 py-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.25em] transition-all relative whitespace-nowrap rounded-sm ${activeTab === tab ? 'text-foundation-accent bg-foundation-accent/5' : 'text-foundation-muted hover:text-white hover:bg-white/5'}`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-foundation-accent" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!isAuthorized ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-32 flex flex-col items-center justify-center gap-6"
              >
                <div className="w-16 h-16 border-2 border-foundation-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-mono text-foundation-muted uppercase tracking-[0.4em] animate-pulse">Decrypting Secure Record...</p>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="min-h-[600px]"
              >
                <SCPForensicReport scp={scp} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-4 w-full sticky top-16 lg:-mt-32">
          <SCPSidebar scp={scp} allScps={allScps} />
        </div>
      </div>

      {/* Related Anomalies at the bottom */}
      <div className="pt-24 border-t border-foundation-border">
        <div className="flex items-center justify-between mb-12">
          <h3 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4">
            <span className="w-12 h-px bg-foundation-accent" />
            Related Anomalies
          </h3>
          <div className="flex items-center gap-3 text-xs font-mono text-foundation-muted uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full">
            Cross-Reference Active <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>
        <SimilarAnomalies currentScp={scp} allScps={allScps} onSelectScp={handleSelectSimilar} />
      </div>
    </div>
  );
};
