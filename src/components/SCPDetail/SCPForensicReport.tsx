import React from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Activity, 
  Users, 
  Terminal, 
  Lock, 
  Zap, 
  Eye, 
  History, 
  MapPin, 
  FileText,
  AlertCircle,
  Dna,
  Brain,
  Crosshair,
  Skull,
  Globe,
  Clock,
  Calendar,
  ShieldAlert,
  Fingerprint,
  Box,
  Wrench,
  AlertTriangle,
  MessageSquare,
  Heart,
  Search,
  User,
  BookOpen,
  Tag,
  ClipboardList,
  FilePlus,
  Link2,
  Star,
  UserCheck,
  Database,
  Truck,
  Maximize,
  ShieldOff,
  Share2,
  CheckCircle
} from 'lucide-react';
import { SCPEntry } from '../../types';

interface SCPForensicReportProps {
  scp: SCPEntry;
}

const Redacted: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <span className="bg-foundation-ink text-foundation-ink hover:bg-transparent hover:text-foundation-ink transition-colors cursor-default px-1 rounded-sm select-none">
    {children || 'REDACTED'}
  </span>
);

const DetailItem: React.FC<{ label: string; value: string | number | undefined | null; icon?: React.ReactNode; fullWidth?: boolean }> = ({ label, value, icon, fullWidth }) => {
  const isMissing = !value || value === 'Null' || value === 'missing' || value === 'not mentioned';
  
  return (
    <div className={`space-y-1.5 ${fullWidth ? 'col-span-full' : ''}`}>
      <label className="text-[11px] font-mono text-foundation-muted uppercase tracking-[0.2em] flex items-center gap-2">
        {icon && <span className="text-foundation-accent/50">{icon}</span>}
        {label}
      </label>
      <div className="text-xs font-black text-foundation-ink uppercase tracking-tight leading-relaxed break-words min-w-0">
        {isMissing ? <Redacted /> : value}
      </div>
    </div>
  );
};

const SectionHeader: React.FC<{ title: string; icon: React.ReactNode; id?: string }> = ({ title, icon, id }) => (
  <div id={id} className="flex items-center gap-3 md:gap-4 text-foundation-accent border-b border-white/5 pb-4 mb-6 md:mb-8 scroll-mt-32">
    <div className="p-1.5 md:p-2 bg-foundation-accent/10 rounded-lg flex items-center justify-center w-8 h-8 md:w-9 md:h-9">
      {icon}
    </div>
    <h3 className="text-[11px] md:text-sm font-black uppercase tracking-[0.15em] md:tracking-[0.3em]">{title}</h3>
    <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
  </div>
);

export const SCPForensicReport: React.FC<SCPForensicReportProps> = ({ scp }) => {
  return (
    <div className="relative space-y-24">
      {/* Background Watermark */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.02] select-none z-0 overflow-hidden">
        <div className="text-[20vw] font-black uppercase tracking-tighter rotate-12 whitespace-nowrap">
          LEVEL {scp.security_clearance_level || '4'} CLEARANCE REQUIRED
        </div>
      </div>

      {/* 1. EXECUTIVE SUMMARY */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10"
      >
        <SectionHeader title="Executive Summary" icon={<Shield />} id="overview" />
        <div className="glass-panel p-4 sm:p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 border-l-2 border-l-foundation-accent">
          <DetailItem label="Designation" value={scp.scp_designation} />
          <DetailItem label="Code Name" value={scp.code_name} />
          <DetailItem label="Object Class" value={scp.object_containment_class} />
          <DetailItem label="Disruption Class" value={scp.disruption_class} />
          <DetailItem label="Risk Class" value={scp.risk_class} />
          <DetailItem label="Security Level" value={scp.security_clearance_level?.toLowerCase().startsWith('level') ? scp.security_clearance_level : `Level ${scp.security_clearance_level || '4'}`} />
          <DetailItem label="Current Status" value={scp.containment_status} />
          <DetailItem label="Database Rating" value={scp.rating} />
        </div>
      </motion.section>

      {/* 2. ANOMALOUS ANALYSIS */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10"
      >
        <SectionHeader title="Anomalous Analysis" icon={<Zap />} id="description" />
        <div className="space-y-8 md:space-y-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
            <DetailItem label="Ontological Category" value={scp.ontological_category} icon={<Dna className="w-3 h-3" />} />
            <DetailItem label="Morphology" value={scp.morphology} icon={<Activity className="w-3 h-3" />} />
            <DetailItem label="Anomaly Type" value={scp.anomaly_type} icon={<AlertCircle className="w-3 h-3" />} />
            <DetailItem label="Ability Types" value={scp.ability_types} icon={<Zap className="w-3 h-3" />} />
            <DetailItem label="Interaction Type" value={scp.interaction_type} />
            <DetailItem label="Affected Natural Laws" value={scp.affected_natural_laws} />
            <DetailItem label="Spread Mechanism" value={scp.spread_mechanism} />
            <DetailItem label="Anomalies Spawned" value={scp.anomalies_spawned} />
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-xs font-mono text-foundation-muted uppercase tracking-widest flex items-center gap-2">
                <Maximize className="w-3 h-3" /> Ability Details
              </label>
              <div className="text-xs font-mono text-foundation-ink leading-relaxed bg-white/5 p-4 rounded border border-white/5">
                {scp.ability_details || 'No advanced abilities recorded.'}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-mono text-foundation-muted uppercase tracking-widest flex items-center gap-2">
                <Eye className="w-3 h-3" /> Description & Properties
              </label>
              <div className="text-xs font-mono text-foundation-ink leading-relaxed bg-white/5 p-4 md:p-6 rounded-lg border border-white/5 break-words">
                {scp.description || <Redacted>Detailed description remains classified under Level 5 protocol.</Redacted>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-mono text-foundation-muted uppercase tracking-widest">Anomalous Effects</label>
                <div className="text-xs font-mono text-foundation-ink leading-relaxed p-4 border-l border-foundation-accent/30 bg-foundation-accent/5 break-words">
                  <span className="text-foundation-accent mr-2">[{scp.anomalous_effects_types || 'GENERAL'}]:</span>
                  {scp.anomalous_effects || 'Standard anomalous signature detected.'}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-mono text-foundation-muted uppercase tracking-widest">Secondary Manifestations</label>
                <div className="text-xs font-mono text-foundation-ink leading-relaxed p-4 border-l border-foundation-accent/30 bg-foundation-accent/5 break-words">
                  {scp.anomalous_secondary_manifestations || 'No secondary manifestations recorded.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 3. CONTAINMENT PROTOCOL */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10"
      >
        <SectionHeader title="Containment Protocol" icon={<Lock />} id="containment" />
        <div className="space-y-8 md:space-y-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            <DetailItem label="Assigned Facility" value={scp.containment_facility} icon={<MapPin className="w-3 h-3" />} />
            <DetailItem label="Facility Type" value={scp.containment_facility_type} />
            <DetailItem label="Respective Department" value={scp.respective_department} />
            <DetailItem label="Containment Challenge" value={scp.challenges_to_containment_type} />
            <DetailItem label="Termination Status" value={scp.termination_attempts} />
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-mono text-foundation-muted uppercase tracking-widest">Official Cover Story</label>
              <div className="text-xs font-mono text-foundation-muted leading-relaxed p-4 bg-white/5 border border-white/5 italic rounded">
                {scp.official_cover_story || 'No cover story assigned to this designation.'}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-mono text-foundation-muted uppercase tracking-widest">Special Containment Procedures</label>
              <div className="text-xs font-mono text-foundation-ink leading-relaxed bg-black/40 p-4 md:p-8 rounded-lg border border-white/10 shadow-inner break-words">
                {scp.special_containment_protocol || 'Procedures restricted to Site Directors only.'}
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-xs font-mono text-foundation-muted uppercase tracking-widest">Containment Challenges Detail</label>
              <div className="text-xs font-mono text-foundation-ink leading-relaxed p-4 border-l border-yellow-500/30 bg-yellow-500/5 break-words">
                {scp.challenges_to_containment_detail || 'No specific containment challenges recorded.'}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 4. BEHAVIORAL ANALYSIS */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10"
      >
        <SectionHeader title="Behavioral Analysis" icon={<Brain />} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <DetailItem label="Sapience Level" value={scp.sapience_level} />
            <DetailItem label="Emotional Tone" value={scp.emotional_tone} />
            <DetailItem label="Psychological Traits" value={scp.psychological_traits} />
            
            <div className="space-y-3">
              <label className="text-xs font-mono text-foundation-muted uppercase tracking-widest">Normal Behaviour</label>
              <div className="text-xs font-mono text-foundation-ink leading-relaxed p-4 bg-white/5 rounded break-words">
                <span className="text-foundation-muted mr-2">[{scp.normal_behaviour_type || 'GENERAL'}]:</span>
                {scp.normal_behaviour_detail || 'Behavioural patterns within expected parameters.'}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-xs font-mono text-foundation-muted uppercase tracking-widest">Trigger Mechanism</label>
              <div className="text-xs font-mono text-foundation-ink leading-relaxed p-4 border border-red-500/20 bg-red-500/5 rounded break-words">
                {scp.trigger_detail || 'No specific trigger identified.'}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-mono text-foundation-muted uppercase tracking-widest">Triggered Behaviour</label>
              <div className="text-xs font-mono text-foundation-ink leading-relaxed p-4 bg-red-500/10 rounded border-l-2 border-red-500 break-words">
                <span className="text-red-500 mr-2 font-bold">[{scp.triggered_behaviour_type || 'AGGRESSIVE'}]:</span>
                {scp.triggered_behaviour_detail || 'Anomalous activity spikes upon trigger.'}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 5. FORENSIC ORIGIN */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10"
      >
        <SectionHeader title="Forensic Origin" icon={<Globe />} />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
          <DetailItem label="Year Discovered" value={scp.year_discovered} icon={<Clock className="w-3 h-3" />} />
          <DetailItem label="Date Discovered" value={scp.date_discovered} />
          <DetailItem label="Country of Discovery" value={scp.country_of_discovery} />
          <DetailItem label="Origin Type" value={scp.origin_type} />
        </div>

        <div className="space-y-8">
          <DetailItem label="Location Details" value={scp.city_location_details} fullWidth />
          <DetailItem label="Discovery Method" value={scp.discovery_method} fullWidth />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-3">
              <label className="text-xs font-mono text-foundation-muted uppercase tracking-widest">Origin Detail</label>
              <div className="text-xs font-mono text-foundation-ink leading-relaxed break-words">
                {scp.origin_detail || 'Origin remains a subject of ongoing investigation.'}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-mono text-foundation-muted uppercase tracking-widest">Discovery Narrative</label>
              <div className="text-xs font-mono text-foundation-ink leading-relaxed break-words">
                {scp.discovery_details || 'Initial recovery logs are restricted.'}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
            <DetailItem label="Original Author" value={scp.original_scp_article_author} />
            <DetailItem label="Real World Associations" value={scp.historical_real_world_associations} />
          </div>
        </div>
      </motion.section>

      {/* 6. OPERATIONAL HISTORY */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10"
      >
        <SectionHeader title="Operational History" icon={<History />} id="addenda" />
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-xs font-mono text-foundation-muted uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-3 h-3" /> Experiment Logs
              </label>
              <div className="text-xs font-mono text-foundation-ink leading-relaxed bg-white/5 p-4 rounded border border-white/5">
                {scp.experiment_logs || 'No experiments authorized for this anomaly.'}
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-xs font-mono text-foundation-muted uppercase tracking-widest flex items-center gap-2">
                <Crosshair className="w-3 h-3" /> Exploration Logs
              </label>
              <div className="text-xs font-mono text-foundation-ink leading-relaxed bg-white/5 p-4 rounded border border-white/5">
                {scp.exploration_logs || 'Exploration protocols not applicable.'}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-mono text-foundation-muted uppercase tracking-widest flex items-center gap-2">
              <AlertCircle className="w-3 h-3 text-red-500" /> Incident Reports
            </label>
            <div className="text-xs font-mono text-red-500/80 leading-relaxed bg-red-500/5 p-6 rounded border border-red-500/10">
              {scp.incident_reports || 'No major containment breaches or incidents recorded.'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-xs font-mono text-foundation-muted uppercase tracking-widest">Interviews & Testimonies</label>
              <div className="text-xs font-mono text-foundation-ink leading-relaxed bg-white/5 p-4 rounded border border-white/5 italic">
                {scp.interviews || 'No direct interviews recorded.'}
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-xs font-mono text-foundation-muted uppercase tracking-widest">Witness Disposition</label>
              <div className="text-xs font-mono text-foundation-ink leading-relaxed bg-white/5 p-4 rounded border border-white/5">
                {scp.witness_disposition_records || 'Witnesses administered Class-A amnestics.'}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 7. PERSONNEL & LOGISTICS */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10"
      >
        <SectionHeader title="Personnel & Logistics" icon={<Users />} />
        <div className="glass-panel p-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <DetailItem label="Assigned Doctors" value={scp.involved_doctors} />
            <DetailItem label="Lead Researchers" value={scp.involved_researchers} />
            <DetailItem label="Field Agents" value={scp.involved_agents} />
            <DetailItem label="Directorial Oversight" value={scp.involved_directors} />
            <DetailItem label="Support Staff" value={scp.other_involved_staff} />
            <DetailItem label="O5/Admin Oversight" value={scp.o5_or_administrator_involvement} />
          </div>

          <div className="pt-8 border-t border-white/5 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <DetailItem label="Mobile Task Force" value={scp.involved_mobile_task_force} />
              <DetailItem label="MTF Code Name" value={scp.involved_mobile_task_force_codename} />
            </div>
            <DetailItem label="Related Groups" value={scp.related_groups} fullWidth />
          </div>
        </div>
      </motion.section>

      {/* 9. SUPPLEMENTARY ARCHIVES */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10"
      >
        <SectionHeader title="Supplementary Archives" icon={<FilePlus />} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="space-y-6">
            <DetailItem label="Locations of Interest" value={scp.locations_of_interest} icon={<MapPin className="w-3 h-3" />} />
            <DetailItem label="LOI Classifications" value={scp.locations_of_interest_types} />
          </div>
          <div className="space-y-6">
            <DetailItem label="Persons of Interest" value={scp.persons_of_interest} icon={<User className="w-3 h-3" />} />
            <DetailItem label="Groups of Interest" value={scp.groups_of_interest} icon={<Users className="w-3 h-3" />} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
          <DetailItem label="Associated Artifacts" value={scp.associated_artifacts} icon={<Box className="w-3 h-3" />} />
          <DetailItem label="Associated Documents" value={scp.associated_documents} icon={<BookOpen className="w-3 h-3" />} />
        </div>
      </motion.section>

      {/* 10. TECHNICAL METADATA */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10"
      >
        <SectionHeader title="Technical Metadata" icon={<Terminal />} />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
          <DetailItem label="Fatality Rate" value={scp.fatality_rate} icon={<Skull className="w-3 h-3" />} />
          <DetailItem label="Range of Effects" value={scp.range_of_effects} />
          <DetailItem label="Time Till Effect" value={scp.time_till_effect} />
          <DetailItem label="Speed of Pursuit" value={scp.speed_of_pursuit} />
          <DetailItem label="Weaknesses" value={scp.weaknesses} />
          <DetailItem label="Resistances" value={scp.resistances} />
          <DetailItem label="Anomalies Spawned" value={scp.anomalies_spawned} />
          <DetailItem label="Total Entities" value={scp.total_number_of_anomalous_entities} />
        </div>

        <div className="mt-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-mono text-foundation-muted uppercase tracking-widest">Physical Attributes</label>
              <div className="text-xs font-mono text-foundation-ink leading-relaxed p-4 bg-white/5 rounded">
                {scp.physical_attributes || 'Standard physical profile.'}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-mono text-foundation-muted uppercase tracking-widest">Casualty Records</label>
              <div className="text-xs font-mono text-foundation-ink leading-relaxed p-4 bg-white/5 rounded">
                {scp.casualty_records || 'No casualties recorded in current containment cycle.'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <DetailItem label="Related K-Class Scenarios" value={scp.related_k_class_scenarios} />
            <DetailItem label="Related SCPs" value={scp.related_scps} />
          </div>
        </div>
      </motion.section>
    </div>
  );
};
