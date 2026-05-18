import React from 'react';
import { motion } from 'motion/react';
import { Terminal, Clock, Skull, Activity } from 'lucide-react';
import { SCPEntry } from '../../types';

interface SCPAddendaProps {
  scp: SCPEntry;
}

export const SCPAddenda: React.FC<SCPAddendaProps> = ({ scp }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="glass-panel p-8 space-y-8">
        <div className="flex items-center gap-3 text-foundation-accent mb-2">
          <Terminal className="w-5 h-5" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em]">Supplemental Documentation</h3>
        </div>
        
        <div className="space-y-8">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase flex items-center gap-2">
              <Clock className="w-3 h-3 text-foundation-accent" /> Discovery Log
            </h4>
            <div className="p-4 bg-black/40 border border-white/5 rounded font-mono text-xs text-foundation-muted leading-relaxed">
              <span className="text-foundation-accent">DATE:</span> {scp.date_discovered || 'REDACTED'}<br/>
              <span className="text-foundation-accent">LOCATION:</span> {scp.country_of_discovery || 'REDACTED'}<br/>
              <span className="text-foundation-accent">METHOD:</span> {scp.discovery_method || 'REDACTED'}<br/><br/>
              {scp.discovery_details || 'No discovery log available for this entity.'}
            </div>
          </div>

          {scp.termination_attempts && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                <Skull className="w-3 h-3 text-red-500" /> Termination Log
              </h4>
              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded font-mono text-xs text-foundation-muted leading-relaxed">
                {scp.termination_attempts}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase flex items-center gap-2">
              <Activity className="w-3 h-3 text-foundation-accent" /> Behavioral Analysis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-black/40 border border-white/5 rounded">
                <label className="text-[11px] font-mono text-foundation-muted uppercase block mb-2">Normal Behaviour</label>
                <p className="text-xs font-mono text-white uppercase">{scp.normal_behaviour_type || 'Standard'}</p>
              </div>
              <div className="p-4 bg-black/40 border border-white/5 rounded">
                <label className="text-[11px] font-mono text-foundation-muted uppercase block mb-2">Triggered Behaviour</label>
                <p className="text-xs font-mono text-white uppercase">{scp.triggered_behaviour_type || 'None'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
