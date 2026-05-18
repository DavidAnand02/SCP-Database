import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Info } from 'lucide-react';
import { SCPEntry } from '../types';
import { SurveillanceImage } from './SurveillanceImage';

interface SimilarAnomaliesProps {
  currentScp: SCPEntry;
  allScps: SCPEntry[];
  onSelectScp: (scp: SCPEntry) => void;
}

const SimilarScpCard = ({ scp, reason, onSelectScp }: { scp: SCPEntry, reason: string, onSelectScp: (scp: SCPEntry) => void }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showBelow, setShowBelow] = useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      // If there's less than 250px above the card, show the popup below it
      setShowBelow(rect.top < 250);
    }
    setIsHovered(true);
  };

  return (
    <div className="relative h-full" ref={cardRef}>
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={() => onSelectScp(scp)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex flex-col bg-[#0f0f0f] border border-[#222] rounded-xl overflow-hidden hover:border-foundation-accent/50 transition-all duration-300 text-left h-full w-full"
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] bg-[#0a0a0a] overflow-hidden m-3 rounded-lg">
          {scp.scp_image_url && scp.scp_image_url !== 'Null' && scp.scp_image_url !== 'missing' ? (
            <SurveillanceImage 
              src={scp.scp_image_url} 
              alt={scp.scp_designation} 
              showViewfinder={false}
              className="w-full h-full" 
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a] p-2 text-center">
              <div className="text-[10px] font-mono text-foundation-muted uppercase leading-tight font-bold">
                No Visual Data
              </div>
            </div>
          )}
          
          {/* Class Badge */}
          {scp.object_containment_class && (
            <div className="absolute top-2 right-2">
              <span className="px-2 py-1 bg-black/90 text-white text-[10px] font-mono font-bold uppercase tracking-widest rounded">
                {scp.object_containment_class}
              </span>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="px-5 pb-5 pt-2 flex-grow flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-mono text-foundation-accent font-bold tracking-widest">{scp.scp_designation}</span>
            <ChevronRight className="w-4 h-4 text-foundation-muted group-hover:text-foundation-accent group-hover:translate-x-1 transition-all" />
          </div>
          
          <h5 className="text-sm font-black text-white uppercase tracking-tight leading-tight">
            {scp.code_name || 'Classified'}
          </h5>
        </div>
      </motion.button>

      {/* Popup Reason Card */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: showBelow ? -10 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: showBelow ? -10 : 10 }}
            className={`absolute ${showBelow ? 'top-full mt-4' : 'bottom-full mb-4'} left-0 w-full z-[100] pointer-events-none`}
          >
            <div className="p-4 border-foundation-accent/40 shadow-[0_10px_40px_rgba(0,0,0,0.9)] bg-[#0a0a0a] border-2 rounded-lg">
              <div className="flex items-center gap-2 mb-2 text-foundation-accent">
                <Info className="w-3 h-3" />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold">Cross-Reference Analysis</span>
              </div>
              <div className="pl-3 border-l-2 border-foundation-accent/50">
                <p className="text-[11px] font-mono text-gray-200 italic leading-relaxed whitespace-pre-line">
                  {reason}
                </p>
              </div>
              {/* Arrow */}
              <div className={`absolute ${showBelow ? '-top-2 border-l border-t' : '-bottom-2 border-r border-b'} left-8 w-4 h-4 bg-[#0a0a0a] border-foundation-accent/40 rotate-45`} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SimilarAnomalies: React.FC<SimilarAnomaliesProps> = ({ currentScp, allScps, onSelectScp }) => {
  const similarScps = useMemo(() => {
    return allScps
      .filter(scp => scp.id !== currentScp.id)
      .map(scp => {
        const getList = (str: string | undefined | null) => 
          (str || '').toLowerCase().split(/[,/]+/).map(s => s.trim()).filter(Boolean);

        const currentOnto = getList(currentScp.ontological_category);
        const scpOnto = getList(scp.ontological_category);
        // Match if any item in current is a substring of any item in scp, or vice versa
        const matchOnto = currentOnto.length > 0 && scpOnto.length > 0 && 
          currentOnto.some(o => scpOnto.some(so => so.includes(o) || o.includes(so)));

        const currentMorph = getList(currentScp.morphology);
        const scpMorph = getList(scp.morphology);
        const matchMorph = currentMorph.length > 0 && scpMorph.length > 0 && 
          currentMorph.some(m => scpMorph.some(sm => sm.includes(m) || m.includes(sm)));

        const currentType = getList(currentScp.anomaly_type);
        const scpType = getList(scp.anomaly_type);
        const matchType = currentType.length > 0 && scpType.length > 0 && 
          currentType.some(t => scpType.some(st => st.includes(t) || t.includes(st)));

        if (matchOnto && matchMorph && matchType) {
          const matchedOnto = currentOnto.find(o => scpOnto.some(so => so.includes(o) || o.includes(so))) || currentOnto[0];
          const matchedMorph = currentMorph.find(m => scpMorph.some(sm => sm.includes(m) || m.includes(sm))) || currentMorph[0];
          const matchedType = currentType.find(t => scpType.some(st => st.includes(t) || t.includes(st))) || currentType[0];

          return {
            scp,
            reason: `Critical match:\nBoth are ${matchedMorph} (morphology), ${matchedOnto} (ontology), and ${matchedType} (anomaly type).`
          };
        }
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .slice(0, 8);
  }, [currentScp, allScps]);

  if (allScps.length <= 1) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border border-dashed border-foundation-border rounded-xl bg-black/20">
        <div className="w-6 h-6 border-2 border-foundation-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono text-foundation-muted uppercase tracking-widest">Cross-Referencing Database...</p>
      </div>
    );
  }

  if (similarScps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border border-dashed border-foundation-border rounded-xl bg-black/20">
        <p className="text-xs font-mono text-foundation-muted uppercase tracking-widest">No Cross-References Found</p>
        <p className="text-[10px] font-mono text-foundation-muted/50 mt-2 max-w-md text-center">
          Insufficient data to establish a definitive link based on Ontology, Morphology, and Anomaly Type.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {similarScps.map(({ scp, reason }) => (
        <SimilarScpCard key={scp.id} scp={scp} reason={reason} onSelectScp={onSelectScp} />
      ))}
    </div>
  );
};
