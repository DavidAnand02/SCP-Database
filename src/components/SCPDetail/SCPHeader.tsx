import React from 'react';
import { ChevronLeft, Lock, ShieldAlert, Fingerprint, Activity, Bookmark, BookmarkCheck } from 'lucide-react';
import { SCPEntry } from '../../types';
import { useUI } from '../../context/UIContext';

interface SCPHeaderProps {
  scp: SCPEntry;
  onBack: () => void;
  backLabel?: string;
}

export const SCPHeader: React.FC<SCPHeaderProps> = ({ scp, onBack, backLabel }) => {
  const { bookmarks, toggleBookmark } = useUI();
  const isBookmarked = bookmarks.includes(scp.scp_designation);

  const getNumber = (designation: string) => {
    const match = designation.match(/\d+/);
    return match ? match[0] : '';
  };

  const getClassColor = (cls: string | undefined) => {
    const c = cls?.toLowerCase() || '';
    if (c.includes('safe')) return 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]';
    if (c.includes('euclid')) return 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]';
    if (c.includes('keter')) return 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]';
    if (c.includes('thaumiel')) return 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]';
    return 'bg-foundation-accent text-white shadow-[0_0_15px_rgba(185,28,28,0.3)]';
  };

  return (
    <div className="relative pt-8 md:pt-16 pb-8 md:pb-12 border-b border-white/5">
      {/* Background Large Number */}
      <div className="absolute top-0 left-0 text-[120px] md:text-[240px] font-black text-white/[0.02] leading-none select-none pointer-events-none tracking-tighter -translate-x-6 md:-translate-x-12 -translate-y-4 md:-translate-y-8">
        {getNumber(scp.scp_designation)}
      </div>

      <div className="relative z-10 space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <button 
              onClick={onBack}
              className="group flex items-center gap-2 md:gap-3 text-[10px] md:text-xs font-mono text-foundation-muted hover:text-white transition-all uppercase tracking-[0.2em] md:tracking-[0.4em] bg-white/5 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/5"
            >
              <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> 
              <span className="group-hover:opacity-100">{backLabel || "Return"}</span>
            </button>

            <button 
              onClick={() => toggleBookmark(scp.scp_designation)}
              className={`flex items-center gap-2 text-[9px] md:text-[10px] font-mono uppercase tracking-widest px-3 md:px-4 py-1.5 md:py-2 rounded-full border transition-all ${
                isBookmarked 
                  ? 'bg-foundation-accent/20 border-foundation-accent text-foundation-accent' 
                  : 'bg-white/5 border-white/10 text-foundation-muted hover:text-white hover:border-white/20'
              }`}
            >
              {isBookmarked ? (
                <>
                  <BookmarkCheck className="w-3 h-3" />
                  <span>Monitored</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3 h-3" />
                  <span className="hidden xs:inline">Flag for Monitoring</span>
                  <span className="xs:hidden">Flag</span>
                </>
              )}
            </button>
          </div>
          
          <div className="flex items-center gap-4 text-[9px] md:text-[11px] font-mono text-foundation-muted uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-3 h-3 text-foundation-accent" />
              <span>ID: Verified</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-3 h-3 text-yellow-500" />
              <span>Enc: Active</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              <div className={`px-2 md:px-3 py-0.5 md:py-1 rounded-sm text-[10px] md:text-xs font-black uppercase tracking-[0.15em] md:tracking-[0.2em] ${getClassColor(scp.object_containment_class)}`}>
                {scp.object_containment_class || 'Classified'}
              </div>
              <div className="h-px w-8 md:w-12 bg-white/20" />
              <div className="text-[10px] md:text-xs font-mono text-foundation-muted uppercase tracking-[0.2em] md:tracking-[0.3em]">
                Object Class
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-8">
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] leading-none">
                {scp.scp_designation}
              </h1>
              <div className="sm:pb-2">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif italic text-foundation-accent tracking-tight leading-none">
                  {scp.code_name || 'CLASSIFIED'}
                </h2>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 text-[10px] md:text-xs font-mono text-foundation-muted uppercase tracking-[0.15em] md:tracking-[0.3em]">
              <Lock className="w-3 h-3 md:w-4 md:h-4 text-foundation-accent shrink-0" /> 
              <span className="whitespace-nowrap">Security Clearance <span className="text-white font-bold">{scp.security_clearance_level?.toLowerCase().startsWith('level') ? scp.security_clearance_level : `Level ${scp.security_clearance_level || '4'}`}</span> Required</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] md:text-xs font-mono text-foundation-muted uppercase tracking-[0.15em] md:tracking-[0.3em]">
              <Activity className="w-3 h-3 md:w-4 md:h-4 text-foundation-terminal shrink-0" /> 
              <span>Status: <span className="text-foundation-terminal font-bold">{scp.containment_status || 'SECURED'}</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
