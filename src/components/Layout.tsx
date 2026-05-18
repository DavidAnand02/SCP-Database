import React from 'react';
import { Header } from './Header';
import { SidebarNav } from './SidebarNav';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';

import { useUI } from '../context/UIContext';

interface LayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  onLogout: () => void;
  mainRef?: React.RefObject<HTMLElement>;
  mainClassName?: string;
}

export const Layout = ({ children, sidebar, onLogout, mainRef, mainClassName }: LayoutProps) => {
  const { isAdmin, isMenuOpen, setIsMenuOpen } = useUI();
  return (
    <div className="h-screen flex flex-col bg-foundation-bg overflow-hidden">
      <Header onLogout={onLogout} />
      
      {!supabase && (
        <div className="bg-red-500/20 border-b border-red-500/50 p-2 text-center">
          <p className="text-[10px] font-mono text-red-500 uppercase tracking-widest flex items-center justify-center gap-2">
            <AlertTriangle className="w-3 h-3" /> System Error: Supabase Credentials Missing. Database Offline.
          </p>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar - Desktop: fixed width, Mobile: absolute overlay */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-[70] w-72 border-r border-foundation-border p-6 bg-foundation-bg lg:bg-black/20 transform transition-transform duration-300 ease-in-out overflow-y-auto custom-scrollbar
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:pt-6 pt-24
        `}>
          <div className="mb-8">
            <SidebarNav />
          </div>

          <div className="h-px bg-foundation-border mb-8" />

          {sidebar && (
            <div className="mb-8">
              {sidebar}
            </div>
          )}

          <div className="pt-4">
            <div className="p-4 bg-foundation-accent/5 border border-foundation-accent/20 rounded-lg">
              <div className="flex items-center gap-2 text-foundation-accent mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase">Breach Warning</span>
              </div>
              <p className="text-[10px] text-foundation-muted leading-relaxed font-mono">
                Unauthorized access to level 4 data is punishable by immediate termination. 
                Memetic kill agents are active on this terminal.
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[65] lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main ref={mainRef} className={`flex-1 p-4 md:p-8 overflow-x-hidden overflow-y-auto ${mainClassName || ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};
