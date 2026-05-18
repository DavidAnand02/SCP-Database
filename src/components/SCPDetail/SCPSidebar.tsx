import React, { useState } from 'react';
import { ExternalLink, Terminal, Music, Video, Image as ImageIcon, ChevronLeft, ChevronRight, Activity, Shield, AlertTriangle } from 'lucide-react';
import { SCPEntry } from '../../types';
import { YouTubeEmbed } from '../YouTubeEmbed';
import { motion, AnimatePresence } from 'motion/react';
import { SurveillanceImage } from '../SurveillanceImage';

interface SCPSidebarProps {
  scp: SCPEntry;
  allScps: SCPEntry[];
}

export const SCPSidebar: React.FC<SCPSidebarProps> = ({ scp }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [
    ...(scp.scp_image_url ? [{ url: scp.scp_image_url, source: scp.image_source }] : []),
    ...(scp.scp_image2_url ? [{ url: scp.scp_image2_url, source: scp.image2_source }] : []),
    ...(scp.image_urls?.map((url, i) => ({ url, source: scp.image_sources?.[i] || 'Foundation Archive' })) || [])
  ];

  const audioLogs = [
    ...(scp.scp_audio_url ? [{ url: scp.scp_audio_url, source: scp.audio_source, label: 'Main Frequency' }] : []),
    ...(scp.audio_urls?.map((url, i) => ({ url, source: scp.audio_sources?.[i] || 'Extended Archive', label: `Log #${i + 1}` })) || [])
  ];

  const videos = scp.video_urls || [];

  const renderTechStat = (label: string, value: string | undefined | null) => {
    if (!value || value === 'Null' || value === 'missing') return null;
    return (
      <div className="grid grid-cols-[auto_1fr] gap-4 py-2 border-b border-white/5 last:border-0 items-start">
        <span className="text-[10px] font-mono text-foundation-muted uppercase tracking-widest whitespace-nowrap pt-0.5">{label}</span>
        <span className="text-xs font-black text-white uppercase tracking-tight text-right leading-tight break-words">{value}</span>
      </div>
    );
  };

  return (
    <aside className="w-full space-y-8">
      {/* Visual Data / Image Carousel */}
      {images.length > 0 && (
        <div className="glass-panel overflow-hidden group border-t-2 border-t-foundation-accent">
          <div className="relative aspect-[3/4] bg-black">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <SurveillanceImage
                  src={images[currentImageIndex].url}
                  alt={`${scp.scp_designation} visual data`}
                  className="w-full h-full"
                />
                
                {/* Image Source Link */}
                <div className="absolute bottom-4 left-4 z-30">
                  <a 
                    href={images[currentImageIndex].source || images[currentImageIndex].url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[10px] font-mono text-foundation-accent hover:underline flex items-center gap-1 uppercase"
                  >
                    <ExternalLink className="w-2 h-2" /> Source
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {images.length > 1 && (
              <>
                <button 
                  onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentImageIndex ? 'bg-foundation-accent w-4' : 'bg-white/30'}`} 
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Technical Forensic Analysis */}
      <div className="glass-panel p-6 space-y-6">
        <div className="flex items-center gap-3 text-foundation-accent border-b border-white/5 pb-3">
          <Terminal className="w-4 h-4" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em]">Technical Analysis</h3>
        </div>
        
        <div className="space-y-1">
          {renderTechStat('Ontology', scp.ontological_category)}
          {renderTechStat('Morphology', scp.morphology)}
          {renderTechStat('Anomaly Type', scp.anomaly_type)}
          {renderTechStat('Interaction', scp.interaction_type)}
          {renderTechStat('Spread', scp.spread_mechanism)}
          {renderTechStat('Sapience', scp.sapience_level)}
          {renderTechStat('Tone', scp.emotional_tone)}
        </div>

        <div className="pt-4 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[140px] p-3 bg-white/5 rounded border border-white/5 space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-mono text-foundation-muted uppercase">
              <Shield className="w-2.5 h-2.5" /> Stability
            </div>
            <div className={`text-xs font-black uppercase ${
              scp.containment_status === 'Contained' ? 'text-foundation-terminal' :
              scp.containment_status === 'Breached' ? 'text-foundation-accent animate-pulse' :
              scp.containment_status === 'Active' ? 'text-yellow-500' :
              scp.containment_status === 'Neutralized' || scp.containment_status === 'Terminated' ? 'text-blue-400' :
              'text-foundation-muted'
            }`}>
              {scp.containment_status === 'Contained' ? 'NOMINAL' :
               scp.containment_status === 'Breached' ? 'COMPROMISED' :
               scp.containment_status === 'Active' ? 'FLUCTUATING' :
               scp.containment_status === 'Neutralized' || scp.containment_status === 'Terminated' ? 'INACTIVE' :
               scp.containment_status === 'Pending Classification' ? 'UNSTABLE' :
               scp.containment_status === 'Explained / Decommissioned' ? 'DEFUNCT' :
               'MONITORED'}
            </div>
          </div>
          <div className="flex-1 min-w-[140px] p-3 bg-white/5 rounded border border-white/5 space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-mono text-foundation-muted uppercase">
              <Activity className="w-2.5 h-2.5" /> Activity
            </div>
            <div className={`text-xs font-black uppercase ${
              scp.risk_class === 'Critical' ? 'text-foundation-accent animate-pulse' :
              scp.risk_class === 'Danger' ? 'text-red-500' :
              scp.risk_class === 'Warning' ? 'text-orange-500' :
              scp.risk_class === 'Caution' ? 'text-yellow-500' :
              scp.risk_class === 'Notice' ? 'text-blue-400' :
              'text-foundation-muted'
            }`}>
              {scp.risk_class === 'Critical' ? 'EXTREME' :
               scp.risk_class === 'Danger' ? 'HIGH' :
               scp.risk_class === 'Warning' ? 'MODERATE' :
               scp.risk_class === 'Caution' ? 'LOW' :
               scp.risk_class === 'Notice' ? 'MINIMAL' :
               'DORMANT'}
            </div>
          </div>
        </div>
      </div>

      {/* Audio Logs */}
      {audioLogs.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-foundation-terminal">
            <Music className="w-4 h-4" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em]">Audio Surveillance</h3>
          </div>
          
          <div className="space-y-4">
            {audioLogs.map((log, i) => (
              <div key={i} className="glass-panel p-4 space-y-4 border-l-2 border-l-foundation-terminal">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <span className="text-[11px] font-mono text-foundation-muted uppercase tracking-widest">{log.label}</span>
                  <a href={log.source || log.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-foundation-terminal hover:underline flex items-center gap-1 uppercase">
                    <ExternalLink className="w-2 h-2" /> Source
                  </a>
                </div>
                <audio 
                  key={log.url}
                  controls 
                  src={log.url}
                  className="w-full h-8 accent-foundation-terminal foundation-audio"
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Surveillance / Videos */}
      {videos.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-foundation-accent">
            <Video className="w-4 h-4" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em]">Visual Surveillance</h3>
          </div>
          {videos.map((url, i) => (
            <div key={i} className="space-y-2">
              <div className="flex flex-wrap justify-between items-center gap-2 px-1">
                <span className="text-[11px] font-mono text-foundation-muted uppercase tracking-widest">Feed Alpha-{i + 1}</span>
                <a href={scp.video_sources?.[i] || url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-foundation-accent hover:underline flex items-center gap-1 uppercase">
                  <ExternalLink className="w-2 h-2" /> Source
                </a>
              </div>
              <YouTubeEmbed url={url} />
            </div>
          ))}
        </div>
      )}

      {/* External Resources */}
      <div className="glass-panel p-6 space-y-6 bg-foundation-accent/5 border-foundation-accent/10">
        <h3 className="text-xs font-black text-foundation-muted uppercase tracking-widest border-b border-white/5 pb-3">Archive Metadata</h3>
        
        {scp.official_cover_story && (
          <div className="space-y-2">
            <label className="text-[11px] font-mono text-foundation-muted uppercase tracking-widest">Cover Story</label>
            <p className="text-xs font-serif italic text-foundation-ink leading-relaxed">
              "{scp.official_cover_story}"
            </p>
          </div>
        )}

        <div className="space-y-3">
          <label className="text-[11px] font-mono text-foundation-muted uppercase tracking-widest">Original Record</label>
          <a 
            href={scp.source_link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 p-3 bg-foundation-accent/10 border border-foundation-accent/30 rounded text-xs font-black text-foundation-accent hover:bg-foundation-accent hover:text-white transition-all uppercase tracking-widest"
          >
            <ExternalLink className="w-3 h-3" /> Access Foundation Wiki
          </a>
        </div>

        <div className="space-y-3">
          <label className="text-[11px] font-mono text-foundation-muted uppercase tracking-widest">Classification Tags</label>
          <div className="flex flex-wrap gap-2">
            {scp.tag_list?.split(',').map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-foundation-muted uppercase">
                {tag.trim()}
              </span>
            ))}
          </div>
        </div>
      </div>

    </aside>
  );
};
