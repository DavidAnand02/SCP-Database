import React from 'react';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';
import { SCPEntry } from '../../types';

interface SCPDescriptionProps {
  scp: SCPEntry;
}

export const SCPDescription: React.FC<SCPDescriptionProps> = ({ scp }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-12"
    >
      <div className="space-y-8">
        <div className="flex items-center gap-3 text-foundation-accent border-b border-white/5 pb-4">
          <Zap className="w-4 h-4" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em]">Anomalous Properties</h3>
        </div>

        <div className="space-y-8">
          <div className="space-y-2">
            <label className="text-[9px] font-mono text-foundation-muted uppercase tracking-widest">Description</label>
            <p className="text-xs font-mono text-foundation-ink leading-relaxed">
              {scp.description || 'Detailed description pending decryption.'}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-mono text-foundation-muted uppercase tracking-widest">Anomalous Effects</label>
            <p className="text-xs font-mono text-foundation-ink leading-relaxed">
              {scp.anomalous_effects || 'Decryption of anomalous effects in progress.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-1">
              <label className="text-[9px] font-mono text-foundation-muted uppercase tracking-widest">Anomaly Type</label>
              <p className="text-[11px] font-black text-foundation-ink uppercase tracking-tight">{scp.anomaly_type || 'Unknown'}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-mono text-foundation-muted uppercase tracking-widest">Morphology</label>
              <p className="text-[11px] font-black text-foundation-ink uppercase tracking-tight">{scp.morphology || 'Unknown'}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-mono text-foundation-muted uppercase tracking-widest">Sapience</label>
              <p className="text-[11px] font-black text-foundation-ink uppercase tracking-tight">{scp.sapience_level || 'Unknown'}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
