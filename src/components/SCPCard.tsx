import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertTriangle, Skull, ChevronRight, Bookmark, BookmarkCheck } from 'lucide-react';
import { SCPEntry } from '../types';
import { SurveillanceImage } from './SurveillanceImage';
import { useUI } from '../context/UIContext';

interface SCPCardProps {
  scp: SCPEntry;
  onClick: () => void;
}

export const SCPCard = ({ scp, onClick }: SCPCardProps) => {
  const { bookmarks, toggleBookmark } = useUI();
  const isBookmarked = bookmarks.includes(scp.scp_designation);

  const getObjectClassColor = (cls: string) => {
    switch (cls?.toLowerCase()) {
      case 'safe': return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5';
      case 'euclid': return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/5';
      case 'keter': return 'text-red-500 border-red-500/30 bg-red-500/5';
      case 'thaumiel': return 'text-purple-500 border-purple-500/30 bg-purple-500/5';
      default: return 'text-foundation-muted border-foundation-border bg-white/5';
    }
  };

  const handleToggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(scp.scp_designation);
  };

  return (
    <Link to={`/scp/${scp.scp_designation}`}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ 
          opacity: { duration: 0.3 }
        }}
        className="glass-panel p-4 cursor-pointer scp-card-hover group flex flex-col h-full min-h-[200px] relative"
      >
        <div className="flex justify-between items-start mb-4">
          <span className="text-[11px] font-mono text-foundation-muted tracking-widest uppercase">Designation</span>
          <div className="flex items-center gap-2">
            {isBookmarked && (
              <div className="text-foundation-accent">
                <BookmarkCheck className="w-3.5 h-3.5" />
              </div>
            )}
            <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${getObjectClassColor(scp.object_containment_class)}`}>
              {scp.object_containment_class}
            </div>
          </div>
        </div>

        <div className="flex gap-4 flex-1 min-h-0">
          <div className="flex-1 min-w-0 flex flex-col pt-0.5">
            <div className="mb-3">
              <h3 className="text-lg font-bold text-white tracking-tight leading-none mb-1.5 truncate">
                {scp.scp_designation}
              </h3>
              <p className="text-[10px] font-mono text-white uppercase tracking-[0.1em] block font-bold line-clamp-2">
                {scp.code_name || 'CLASSIFIED'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-1.5 mt-auto pb-1">
              <div className="flex items-center gap-2 text-[11px] uppercase font-mono text-foundation-muted">
                <AlertTriangle className="w-2.5 h-2.5" />
                <span>Risk: <span className="text-foundation-ink font-bold uppercase">{scp.risk_class || 'Unknown'}</span></span>
              </div>
              <div className="flex items-center gap-2 text-[11px] uppercase font-mono text-foundation-muted">
                <Skull className="w-2.5 h-2.5" />
                <span>Disruption: <span className="text-foundation-ink font-bold uppercase">{scp.disruption_class ? scp.disruption_class.split(/[-–]/)[0].trim() : 'Unknown'}</span></span>
              </div>
            </div>
          </div>

          <div className="relative w-24 h-24 flex-shrink-0 bg-black/40 rounded overflow-hidden group-hover:border-foundation-accent/30 transition-colors mt-2">
            {scp.scp_image_url && scp.scp_image_url !== 'Null' && scp.scp_image_url !== 'missing' ? (
              <SurveillanceImage 
                src={scp.scp_image_url} 
                alt={scp.scp_designation}
                showViewfinder={false}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a] p-2 text-center">
                <div className="text-[8px] font-mono text-foundation-muted uppercase leading-tight font-bold">
                  No Visual Data
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="mt-auto flex justify-end items-center">
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-mono text-foundation-accent uppercase tracking-wider">Access File</span>
            <ChevronRight className="w-3 h-3 text-foundation-accent" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
