import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';

import { useUI } from '../context/UIContext';

interface HeaderProps {
  onLogout: () => void;
}

export const Header = ({ onLogout }: HeaderProps) => {
  const { isAdmin, isMenuOpen, setIsMenuOpen } = useUI();
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);

  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    if (newCount === 3) {
      setClickCount(0);
      navigate('/login');
    } else {
      setClickCount(newCount);
      // Reset count after 1 second of inactivity
      setTimeout(() => setClickCount(0), 1000);
    }
  };

  return (
    <header className="border-b border-foundation-border p-4 md:p-6 flex justify-between items-center bg-black/40 backdrop-blur-md sticky top-0 z-[60]">
      <div className="flex items-center gap-3 md:gap-4">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden p-2 text-foundation-muted hover:text-white transition-colors"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <button 
          onClick={handleLogoClick}
          className="w-10 h-10 md:w-12 md:h-12 border border-white/10 rounded-full flex items-center justify-center overflow-hidden hover:scale-105 transition-transform active:scale-95 shrink-0"
          title="Foundation Seal"
        >
          <img 
            src="https://jvibllpldifuhgnargtt.supabase.co/storage/v1/object/public/scp-images/SCP_Foundation_Logo_White.png" 
            alt="SCP Foundation Logo"
            className="w-full h-full object-contain p-1.5"
            referrerPolicy="no-referrer"
          />
        </button>
        <div>
          <Link to="/">
            <h1 className="text-xl md:text-2xl font-bold tracking-tighter terminal-text uppercase relative group">
              S.C.P. Foundation
              <span className="absolute top-0 left-0 -ml-1 text-red-500 opacity-0 group-hover:opacity-50 group-hover:animate-pulse pointer-events-none">S.C.P. Foundation</span>
              <span className="absolute top-0 left-0 ml-1 text-blue-500 opacity-0 group-hover:opacity-50 group-hover:animate-pulse pointer-events-none">S.C.P. Foundation</span>
            </h1>
          </Link>
          <p className="text-[10px] md:text-xs text-foundation-muted font-mono uppercase tracking-widest">Secure, Contain, Protect</p>
        </div>
      </div>
      <div className="flex items-center gap-6 text-xs font-mono text-foundation-muted">
        <div className="hidden md:flex flex-col items-end whitespace-nowrap">
          <span>SECURITY CLEARANCE: <span className="text-foundation-accent">{isAdmin ? 'LEVEL 5 (ADMIN)' : 'LEVEL 4'}</span></span>
          <span>TERMINAL ID: <span className="text-foundation-terminal">SITE-19-A</span></span>
        </div>
        <div className="h-8 w-px bg-foundation-border hidden md:block" />
        <div className="flex items-center gap-4">
          {isAdmin && (
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 text-foundation-accent hover:text-white transition-colors uppercase tracking-widest"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
