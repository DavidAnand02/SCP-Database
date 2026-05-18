import React, { useState, useEffect } from 'react';
import { BarChart as BarChartIcon, LinkIcon, RotateCcw, Hash, Check } from 'lucide-react';

interface AnalyticsHeaderProps {
  activeView: 'charts' | 'graph';
  setActiveView: (view: 'charts' | 'graph') => void;
  valueThreshold: number;
  setValueThreshold: (val: number) => void;
  scpRange: { start: number | null; end: number | null };
  setScpRange: (range: { start: number | null; end: number | null }) => void;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  activeView,
  setActiveView,
  valueThreshold,
  setValueThreshold,
  scpRange,
  setScpRange
}) => {
  const [localRange, setLocalRange] = useState(scpRange);

  useEffect(() => {
    setLocalRange(scpRange);
  }, [scpRange]);

  const handleLocalChange = (type: 'start' | 'end', val: string) => {
    const num = val === '' ? null : parseInt(val);
    setLocalRange(prev => ({ ...prev, [type]: num }));
  };

  const handleApply = () => {
    setScpRange(localRange);
  };

  const resetRange = () => {
    setScpRange({ start: null, end: null });
  };

  const hasChanges = localRange.start !== scpRange.start || localRange.end !== scpRange.end;

  return (
    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter terminal-text">Foundation Analytics</h1>
        <p className="text-xs text-foundation-muted font-mono uppercase mt-1">Global Anomaly Distribution & Statistical Analysis</p>
      </div>
      
      <div className="flex flex-wrap items-center gap-4">
        {/* View Toggle */}
        <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
          <button 
            onClick={() => setActiveView('charts')}
            className={`px-4 py-2 rounded text-xs font-mono uppercase tracking-widest transition-all flex items-center gap-2 ${activeView === 'charts' ? 'bg-foundation-accent text-white shadow-lg' : 'text-foundation-muted hover:text-white'}`}
          >
            <BarChartIcon className="w-3 h-3" /> Statistical
          </button>
          <button 
            onClick={() => setActiveView('graph')}
            className={`px-4 py-2 rounded text-xs font-mono uppercase tracking-widest transition-all flex items-center gap-2 ${activeView === 'graph' ? 'bg-foundation-accent text-white shadow-lg' : 'text-foundation-muted hover:text-white'}`}
          >
            <LinkIcon className="w-3 h-3" /> Relational
          </button>
        </div>

        {/* Range Filter */}
        <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-lg border border-white/5">
          <div className="flex items-center gap-2 text-foundation-muted">
            <Hash className="w-3 h-3" />
            <span className="text-[10px] font-mono uppercase tracking-widest">SCP Range:</span>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              placeholder="001"
              value={localRange.start ?? ''}
              onChange={(e) => handleLocalChange('start', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApply()}
              className="w-16 bg-black/60 border border-white/10 rounded px-2 py-1 text-xs font-mono text-white focus:border-foundation-accent outline-none transition-colors placeholder:text-white/20"
            />
            <span className="text-foundation-muted text-[10px] font-mono">TO</span>
            <input 
              type="number" 
              placeholder="999"
              value={localRange.end ?? ''}
              onChange={(e) => handleLocalChange('end', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApply()}
              className="w-16 bg-black/60 border border-white/10 rounded px-2 py-1 text-xs font-mono text-white focus:border-foundation-accent outline-none transition-colors placeholder:text-white/20"
            />
            
            <div className="flex items-center gap-1 ml-1 border-l border-white/10 pl-2">
              {hasChanges && (
                <button 
                  onClick={handleApply}
                  className="p-1.5 bg-foundation-accent/20 hover:bg-foundation-accent/40 rounded text-foundation-accent transition-all animate-in fade-in zoom-in duration-300"
                  title="Apply Range"
                >
                  <Check className="w-3 h-3" />
                </button>
              )}
              {(scpRange.start !== null || scpRange.end !== null) && (
                <button 
                  onClick={resetRange}
                  className="p-1.5 hover:bg-white/5 rounded text-foundation-muted hover:text-foundation-accent transition-colors"
                  title="Reset Range"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {activeView === 'charts' && (
          <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-lg border border-white/5">
            <span className="text-xs font-mono text-foundation-muted uppercase">Significance Threshold:</span>
            <input 
              type="number" 
              min="0" 
              max="100" 
              value={valueThreshold}
              onChange={(e) => setValueThreshold(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-16 bg-black/60 border border-white/10 rounded px-2 py-1 text-xs font-mono text-foundation-accent focus:border-foundation-accent outline-none transition-colors"
            />
          </div>
        )}
      </div>
    </div>
  );
};
