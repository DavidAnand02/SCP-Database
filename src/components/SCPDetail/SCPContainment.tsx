import React from 'react';
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';
import { SCPEntry } from '../../types';

interface SCPContainmentProps {
  scp: SCPEntry;
}

export const SCPContainment: React.FC<SCPContainmentProps> = ({ scp }) => {
  const renderField = (label: string, value: string | number | undefined | null) => (
    <div className="space-y-1">
      <label className="text-[9px] font-mono text-foundation-muted uppercase tracking-widest">{label}</label>
      <p className="text-[11px] font-black text-foundation-ink uppercase tracking-tight">
        {value || 'Null'}
      </p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-12"
    >
      <div className="space-y-8">
        <div className="flex items-center gap-3 text-foundation-accent border-b border-white/5 pb-4">
          <Lock className="w-4 h-4" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em]">Containment Protocol</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
          {renderField('Facility', scp.containment_facility)}
          {renderField('Facility Type', scp.containment_facility_type)}
          {renderField('Containment Status', scp.containment_status)}
          {renderField('Department', scp.respective_department)}
          {renderField('Challenge Type', scp.challenges_to_containment_type)}
        </div>

        <div className="space-y-8 pt-4">
          <div className="space-y-2">
            <label className="text-[9px] font-mono text-foundation-muted uppercase tracking-widest">Challenges Detail</label>
            <p className="text-xs font-mono text-foundation-ink leading-relaxed">
              {scp.challenges_to_containment_detail || 'Standard containment protocols apply.'}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-mono text-foundation-muted uppercase tracking-widest">Protocol</label>
            <p className="text-xs font-mono text-foundation-ink leading-relaxed">
              {scp.special_containment_protocol || 'Procedures classified. Level 4 clearance required.'}
            </p>
          </div>

          {renderField('Termination Attempts', scp.termination_attempts)}
        </div>
      </div>
    </motion.div>
  );
};
