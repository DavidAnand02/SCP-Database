import React from 'react';
import { motion } from 'motion/react';
import { X, Zap, Loader2 } from 'lucide-react';
import { SCPEntry } from '../types';
import { useRandomSCP } from '../hooks/useSCPHooks';

export const DiscoveryProtocol = ({ onSelect, onClose }: { onSelect: (scp: SCPEntry) => void, onClose: () => void }) => {
  const { refetch, isFetching } = useRandomSCP();

  const handleInitiate = async () => {
    const { data } = await refetch();
    if (data) {
      onSelect(data);
    }
  };

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="w-full max-w-md bg-foundation-bg border border-foundation-border rounded-lg shadow-2xl overflow-hidden"
    >
      <div className="p-4 bg-foundation-accent/10 border-b border-foundation-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-foundation-accent" />
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foundation-accent">Discovery Protocol</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/5 rounded transition-colors">
          <X className="w-4 h-4 text-foundation-muted" />
        </button>
      </div>
      
      <div className="p-8 space-y-6">
        <p className="text-[10px] font-mono text-foundation-muted leading-relaxed uppercase tracking-widest text-center">
          Initiate automated anomalous entity discovery across the global network.
        </p>

        <div className="pt-4">
          <button 
            onClick={handleInitiate}
            disabled={isFetching}
            className="w-full py-3 bg-foundation-accent text-white text-xs font-black uppercase tracking-[0.2em] rounded-sm hover:bg-foundation-accent/80 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isFetching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {isFetching ? 'Scanning...' : 'Initiate Discovery'}
          </button>
          <p className="text-[9px] font-mono text-center mt-3 text-foundation-muted uppercase">
            Automated selection protocol active
          </p>
        </div>
      </div>
    </motion.div>
  );
};
