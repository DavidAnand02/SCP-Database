import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Database, BarChart3, Zap, Terminal, Bookmark, Trash2, AlertTriangle, X, ChevronDown, Folder } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { useUI } from '../context/UIContext';
import { useSCPAllEntries } from '../hooks/useSCPHooks';

export const SidebarNav = () => {
  const { isAdmin, setShowDiscovery, bookmarks, clearBookmarks, setIsMenuOpen } = useUI();
  const { data: allScps } = useSCPAllEntries();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);

  const bookmarkedScps = allScps?.filter(scp => bookmarks.includes(scp.scp_designation)) || [];

  const navItemClass = (isActive: boolean) => `
    w-full flex items-center gap-3 px-4 py-3 rounded text-xs font-mono uppercase tracking-widest transition-all border
    ${isActive 
      ? 'bg-foundation-accent text-white border-foundation-accent shadow-lg shadow-foundation-accent/20' 
      : 'text-foundation-muted hover:bg-white/5 border-white/10 hover:border-foundation-accent/30 hover:text-white'}
  `;

  return (
    <nav className="space-y-2">
      <NavLink 
        to="/"
        onClick={() => setIsMenuOpen(false)}
        className={({ isActive }) => navItemClass(isActive)}
      >
        <Database className="w-4 h-4" /> Secure Directory
      </NavLink>
      <NavLink 
        to="/analytics"
        onClick={() => setIsMenuOpen(false)}
        className={({ isActive }) => navItemClass(isActive)}
      >
        <BarChart3 className="w-4 h-4" /> Data Analytics
      </NavLink>
      <button 
        onClick={() => {
          setShowDiscovery(true);
          setIsMenuOpen(false);
        }}
        className={navItemClass(false)}
      >
        <Zap className="w-4 h-4" /> Discovery Protocol
      </button>

      {/* Monitored Anomalies Section */}
      <div className="relative group">
        <button 
          onClick={() => setIsBookmarksOpen(!isBookmarksOpen)}
          className={`${navItemClass(isBookmarksOpen)} justify-between`}
        >
          <div className="flex items-center gap-3">
            <Folder className={`w-4 h-4 ${isBookmarksOpen ? 'text-white' : 'text-foundation-muted'}`} />
            <span className="truncate">Monitored Anomalies</span>
          </div>
          <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isBookmarksOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {bookmarks.length > 0 && (
          <div className="px-4 pt-1">
            <button 
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 text-[8px] font-mono text-foundation-muted hover:text-red-500 transition-colors uppercase tracking-widest opacity-0 group-hover:opacity-100"
              title="Clear Watchlist"
            >
              <Trash2 className="w-2.5 h-2.5" /> Clear Watchlist
            </button>
          </div>
        )}
      </div>

      {isAdmin && (
        <NavLink 
          to="/admin"
          onClick={() => setIsMenuOpen(false)}
          className={({ isActive }) => navItemClass(isActive)}
        >
          <Terminal className="w-4 h-4" /> Admin Terminal
        </NavLink>
      )}

      <AnimatePresence initial={false}>
          {isBookmarksOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="space-y-1 max-h-[300px] overflow-y-auto no-scrollbar px-2 py-2">
                {bookmarkedScps.length > 0 ? (
                  bookmarkedScps.map((scp) => (
                    <Link
                      key={scp.id}
                      to={`/scp/${scp.scp_designation}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded hover:bg-white/5 group transition-all"
                    >
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-white group-hover:text-foundation-accent transition-colors">
                          {scp.scp_designation}
                        </span>
                        <span className="text-[9px] font-mono text-foundation-muted uppercase truncate max-w-[140px]">
                          {scp.code_name || 'Classified'}
                        </span>
                      </div>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        scp.object_containment_class?.toLowerCase().includes('keter') ? 'bg-red-500' :
                        scp.object_containment_class?.toLowerCase().includes('euclid') ? 'bg-yellow-500' :
                        'bg-emerald-500'
                      }`} />
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center space-y-2">
                    <p className="text-[10px] font-mono text-foundation-muted uppercase tracking-widest">No Active Monitoring</p>
                    <p className="text-[9px] text-white/20 leading-relaxed">Flag anomalies in the directory to track them here.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Clear Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-foundation-bg border border-red-500/30 p-8 rounded-sm max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-red-500">
                  <AlertTriangle className="w-8 h-8" />
                  <h2 className="text-xl font-black uppercase tracking-tighter">Security Protocol: Data Purge</h2>
                </div>
                
                <div className="space-y-4">
                  <p className="text-sm text-foundation-muted leading-relaxed">
                    You are about to clear all <span className="text-white font-bold">{bookmarks.length}</span> flagged anomalies from your local monitoring station.
                  </p>
                  <div className="bg-red-500/5 border border-red-500/20 p-4 rounded text-xs text-red-400 font-mono leading-relaxed">
                    WARNING: This action is permanent and cannot be undone. All local tracking data for these anomalies will be erased from this terminal.
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-mono uppercase tracking-widest transition-all rounded border border-white/10"
                  >
                    Abort Purge
                  </button>
                  <button
                    onClick={() => {
                      clearBookmarks();
                      setShowClearConfirm(false);
                    }}
                    className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white text-xs font-mono uppercase tracking-widest transition-all rounded shadow-lg shadow-red-500/20"
                  >
                    Confirm Purge
                  </button>
                </div>
              </div>
              
              <button 
                onClick={() => setShowClearConfirm(false)}
                className="absolute top-4 right-4 text-foundation-muted hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
};
