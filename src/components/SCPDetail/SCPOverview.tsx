import React from 'react';
import { motion } from 'motion/react';
import { Shield, Activity, Users, Terminal } from 'lucide-react';
import { SCPEntry } from '../../types';

interface SCPOverviewProps {
  scp: SCPEntry;
}

export const SCPOverview: React.FC<SCPOverviewProps> = ({ scp }) => {
  const renderField = (label: string, value: string | number | undefined | null, icon?: React.ReactNode) => (
    <div className="space-y-1">
      <label className="text-[9px] font-mono text-foundation-muted uppercase tracking-widest flex items-center gap-1.5">
        {icon}
        {label}
      </label>
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
      {/* Core Classification */}
      <div className="glass-panel p-8 space-y-8 border-l-2 border-l-foundation-accent">
        <div className="flex items-center gap-3 text-foundation-accent border-b border-white/5 pb-4">
          <Shield className="w-4 h-4" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em]">Core Classification</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
          {renderField('Containment Class', scp.object_containment_class)}
          {renderField('Disruption Class', scp.disruption_class)}
          {renderField('Risk Class', scp.risk_class)}
          {renderField('Rating', scp.rating)}
          {renderField('Security Clearance', `Level ${scp.security_clearance_level || '4'}`)}
          {renderField('Sapience Level', scp.sapience_level)}
          {renderField('Ontological Category', scp.ontological_category)}
          {renderField('Morphology', scp.morphology)}
          {renderField('Anomaly Type', scp.anomaly_type)}
          {renderField('Emotional Tone', scp.emotional_tone)}
        </div>
      </div>

      {/* Discovery & Origin */}
      <div className="space-y-8">
        <div className="flex items-center gap-3 text-foundation-accent border-b border-white/5 pb-4">
          <Terminal className="w-4 h-4" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em]">Discovery & Origin</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
          {renderField('Year Discovered', scp.year_discovered)}
          {renderField('Date Discovered', scp.date_discovered)}
          {renderField('Country of Discovery', scp.country_of_discovery)}
          {renderField('City/Location Details', scp.city_location_details)}
          {renderField('Discovery Method', scp.discovery_method)}
          {renderField('Origin Type', scp.origin_type)}
        </div>

        <div className="space-y-8 pt-4">
          <div className="space-y-2">
            <label className="text-[9px] font-mono text-foundation-muted uppercase tracking-widest">Origin Detail</label>
            <p className="text-xs font-mono text-foundation-ink leading-relaxed">
              {scp.origin_detail || 'No detailed origin record available.'}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-mono text-foundation-muted uppercase tracking-widest">Discovery Details</label>
            <p className="text-xs font-mono text-foundation-ink leading-relaxed">
              {scp.discovery_details || 'Discovery circumstances remain classified.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
            {renderField('Author', scp.original_scp_article_author)}
            {renderField('Real World Associations', scp.historical_real_world_associations)}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
