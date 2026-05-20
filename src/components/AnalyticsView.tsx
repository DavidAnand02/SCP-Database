import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, ExternalLink, Loader2 } from 'lucide-react';
import { SCPEntry } from '../types';
import { normalizeValue, splitMultiValue } from '../utils/formatters';
import { AnalyticsHeader } from './Analytics/AnalyticsHeader';
import { AnalyticsStats } from './Analytics/AnalyticsStats';
import { NetworkGraphView } from './Analytics/NetworkGraphView';
import { useAnalyticsData, EXCLUDED_VALUES } from '../hooks/useAnalyticsData';
import { SurveillanceImage } from './SurveillanceImage';
import {
  StrategicOverview,
  AnomalyClassification,
  BiologicalCognitiveProfiles,
  ContainmentLogistics,
  SecurityAccess,
  TemporalDiscoveryMetrics,
  GeographicDistribution,
  BehavioralCulturalImpact,
  ThreatRatingMetrics,
  PersonnelInvolvement,
  TacticalResponse,
  OriginInteraction,
  GeopoliticalLandscape,
  ContainmentBreachTermination
} from './Analytics/DashboardSections';

const ANALYTICS_STORAGE_KEY = 'scp_analytics_state';

const FilteredAnomalyCard = ({ scp, navigate }: { scp: SCPEntry; navigate: any }) => {
  const hasImage = scp.scp_image_url && 
                   scp.scp_image_url !== 'Null' && 
                   scp.scp_image_url !== 'missing';

  return (
    <a 
      key={scp.id} 
      href={`/scp/${scp.scp_designation}`}
      onClick={(e) => {
        e.preventDefault();
        navigate(`/scp/${scp.scp_designation}`, { state: { from: window.location.pathname + window.location.search } });
      }}
      className="group relative bg-[#0a0a0a] border border-white/10 hover:border-foundation-accent/50 rounded-xl overflow-hidden transition-all duration-500 hover:shadow-[0_0_25px_rgba(185,28,28,0.15)] flex flex-col"
    >
      {/* Image Preview */}
      <div className="relative h-32 overflow-hidden bg-[#0a0a0a]">
        {hasImage ? (
          <SurveillanceImage
            src={scp.scp_image_url!}
            alt={scp.scp_designation}
            showViewfinder={false}
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
            <div className="text-[10px] font-mono text-foundation-muted uppercase leading-tight text-center font-bold">
              No Visual Data
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-80" />
        
        <div className="absolute top-3 left-3">
          <span className="px-2 py-0.5 bg-foundation-accent/20 border border-foundation-accent/30 rounded text-xs font-mono font-bold text-foundation-accent uppercase tracking-wider">
            {scp.scp_designation}
          </span>
        </div>
        
        <div className="absolute top-3 right-3">
          <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <h3 className="text-sm font-bold text-white group-hover:text-foundation-accent transition-colors line-clamp-1">
          {scp.code_name || 'CLASSIFIED TITLE'}
        </h3>
        
        <div className="flex flex-wrap gap-1.5">
          {scp.object_containment_class && (
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-foundation-muted uppercase">
              {scp.object_containment_class}
            </span>
          )}
          {scp.disruption_class && (
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-foundation-muted uppercase">
              {scp.disruption_class}
            </span>
          )}
          {scp.risk_class && (
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-foundation-muted uppercase">
              {scp.risk_class}
            </span>
          )}
        </div>

        <p className="text-xs text-foundation-muted line-clamp-2 leading-relaxed flex-1">
          {scp.description || 'No description available in current clearance level.'}
        </p>
      </div>

      {/* Bottom Bar */}
      <div className="h-1 w-0 group-hover:w-full bg-foundation-accent transition-all duration-500" />
    </a>
  );
};

export const AnalyticsView = ({ data }: { data: SCPEntry[] }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Load initial state from sessionStorage
  const savedState = useMemo(() => {
    try {
      const saved = sessionStorage.getItem(ANALYTICS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }, []);

  const [activeView, setActiveView] = useState<'charts' | 'graph'>(savedState?.activeView || 'charts');
  const [isTransitioning, setIsTransitioning] = useState(savedState?.activeView === 'graph');
  const [valueThreshold, setValueThreshold] = useState(savedState?.valueThreshold || 0);
  const [scpRange, setScpRange] = useState<{ start: number | null; end: number | null }>(
    savedState?.scpRange || { start: null, end: null }
  );

  // Helper to extract number from SCP designation (e.g., "SCP-050" -> 50)
  const getScpNumber = (designation: string): number | null => {
    const match = designation.match(/\d+/);
    return match ? parseInt(match[0]) : null;
  };

  // Sync sessionStorage filters to searchParams on mount if searchParams is empty
  useEffect(() => {
    const hasFilters = Array.from(searchParams.keys()).some(k => k.startsWith('filter_'));
    if (!hasFilters && savedState?.filters) {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        Object.entries(savedState.filters).forEach(([key, value]) => {
          newParams.set(`filter_${key}`, value as string);
        });
        return newParams;
      }, { replace: true });
    }

    // Handle initial transition if starting on graph view
    if (savedState?.activeView === 'graph') {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 800); // Slightly longer for initial mount
      return () => clearTimeout(timer);
    }
  }, []);

  const activeFilters = useMemo(() => {
    const filters: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith('filter_')) {
        filters[key.replace('filter_', '')] = value;
      }
    });
    return filters;
  }, [searchParams]);

  // Persist state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify({
      activeView,
      valueThreshold,
      scpRange,
      filters: activeFilters
    }));
  }, [activeView, valueThreshold, scpRange, activeFilters]);

  // First filter by range
  const rangeFilteredData = useMemo(() => {
    if (scpRange.start === null && scpRange.end === null) return data;

    return data.filter(item => {
      const num = getScpNumber(item.scp_designation);
      if (num === null) return false;

      const startMatch = scpRange.start === null || num >= scpRange.start;
      const endMatch = scpRange.end === null || num <= scpRange.end;
      return startMatch && endMatch;
    });
  }, [data, scpRange]);

  const handleFilterSelect = (key: string, value: string) => {
    if (value === 'Other') return; // Don't filter by 'Other'
    
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      const paramKey = `filter_${key}`;
      if (newParams.get(paramKey) === value) {
        newParams.delete(paramKey);
      } else {
        newParams.set(paramKey, value);
      }
      return newParams;
    });
  };

  const clearFilters = () => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      Array.from(newParams.keys()).forEach(key => {
        if (key.startsWith('filter_')) {
          newParams.delete(key);
        }
      });
      return newParams;
    });
    // Also clear from storage
    sessionStorage.removeItem(ANALYTICS_STORAGE_KEY);
  };

  const filteredData = useMemo(() => {
    return rangeFilteredData.filter(item => {
      const matchesCategories = Object.entries(activeFilters).every(([key, value]) => {
        const itemVal = item[key as keyof SCPEntry];
        
        // Special case: Termination attempts chart is grouped by class
        if (key === 'termination_attempts') {
          const hasAttempts = item.termination_attempts && 
                             !EXCLUDED_VALUES.includes(item.termination_attempts.toLowerCase().trim());
          return hasAttempts && normalizeValue(item.object_containment_class).toLowerCase() === value.toLowerCase();
        }

        if (!itemVal) return false;
        
        // Handle multi-value fields (like tags, doctors, etc.)
        const values = splitMultiValue(String(itemVal));
        const normalizedFilterValue = value.toLowerCase();
        
        // Check if any of the values match the filter
        return values.some(v => normalizeValue(v, key as any).toLowerCase() === normalizedFilterValue);
      });
      return matchesCategories;
    });
  }, [rangeFilteredData, activeFilters]);

  const stats = useAnalyticsData(filteredData, valueThreshold);

  const avgRating = useMemo(() => {
    const ratings = filteredData
      .map(item => item.rating || 0)
      .filter(r => r !== 0);
    if (ratings.length === 0) return 0;
    return ratings.reduce((a, b) => a + b, 0) / ratings.length;
  }, [filteredData]);

  const topClass = stats.objectClassStats[0]?.name || 'N/A';

  const handleViewChange = (view: 'charts' | 'graph') => {
    if (view === activeView) return;
    
    setActiveView(view);

    if (view === 'graph') {
      setIsTransitioning(true);
      // Small delay to allow the loading UI to render before the heavy graph component mounts
      setTimeout(() => {
        setIsTransitioning(false);
      }, 600);
    }
  };

  return (
    <div className="space-y-8">
      <AnalyticsHeader 
        activeView={activeView} 
        setActiveView={handleViewChange}
        valueThreshold={valueThreshold}
        setValueThreshold={setValueThreshold}
        scpRange={scpRange}
        setScpRange={setScpRange}
      />

      {isTransitioning ? (
        <div className="flex flex-col items-center justify-center p-40 gap-6 animate-in fade-in duration-500">
          <div className="relative">
            <Loader2 className="w-16 h-16 text-foundation-accent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-foundation-accent/20 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="space-y-2 text-center">
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-[0.3em] animate-pulse">Decrypting</h3>
            <p className="text-[10px] font-mono text-foundation-muted uppercase tracking-widest">Mapping anomalous relational nodes...</p>
          </div>
        </div>
      ) : (
        <>
          {activeView === 'charts' && (
            <AnalyticsStats 
              totalCount={stats.totalCount}
              activeThreshold={valueThreshold}
              topClass={topClass}
              avgRating={avgRating}
            />
          )}

          {/* Active Filters & Range */}
          {(Object.keys(activeFilters).length > 0 || scpRange.start !== null || scpRange.end !== null) && (
            <div className="bg-[#111] border border-white/10 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold tracking-[0.2em] text-foundation-muted uppercase">Active Constraints</h3>
                <button 
                  onClick={() => {
                    clearFilters();
                    setScpRange({ start: null, end: null });
                  }}
                  className="text-xs font-mono text-foundation-accent hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Reset All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(scpRange.start !== null || scpRange.end !== null) && (
                  <div className="flex items-center gap-2 bg-foundation-accent/10 border border-foundation-accent/20 rounded-full px-3 py-1">
                    <span className="text-xs font-mono text-foundation-accent uppercase">Range:</span>
                    <span className="text-xs font-bold text-white">
                      {scpRange.start ?? '001'} - {scpRange.end ?? '∞'}
                    </span>
                    <button 
                      onClick={() => setScpRange({ start: null, end: null })}
                      className="ml-1 text-foundation-accent hover:text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {Object.entries(activeFilters).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                    <span className="text-xs font-mono text-foundation-muted uppercase">{key.replace(/_/g, ' ')}:</span>
                    <span className="text-xs font-bold text-white">{value}</span>
                    <button 
                      onClick={() => handleFilterSelect(key, value)}
                      className="ml-1 text-foundation-muted hover:text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === 'charts' ? (
            <div className="space-y-12">
              <StrategicOverview {...stats} onFilterSelect={handleFilterSelect} />
              <AnomalyClassification {...stats} onFilterSelect={handleFilterSelect} />
              <BiologicalCognitiveProfiles {...stats} onFilterSelect={handleFilterSelect} />
              <ContainmentLogistics {...stats} onFilterSelect={handleFilterSelect} />
              <SecurityAccess {...stats} onFilterSelect={handleFilterSelect} />
              <TemporalDiscoveryMetrics {...stats} onFilterSelect={handleFilterSelect} />
              <GeographicDistribution {...stats} onFilterSelect={handleFilterSelect} />
              <BehavioralCulturalImpact {...stats} onFilterSelect={handleFilterSelect} />
              <ThreatRatingMetrics {...stats} onFilterSelect={handleFilterSelect} />
              <PersonnelInvolvement {...stats} onFilterSelect={handleFilterSelect} />
              <TacticalResponse {...stats} onFilterSelect={handleFilterSelect} />
              <OriginInteraction {...stats} onFilterSelect={handleFilterSelect} />
              <GeopoliticalLandscape {...stats} onFilterSelect={handleFilterSelect} />
              <ContainmentBreachTermination {...stats} onFilterSelect={handleFilterSelect} />
            </div>
          ) : (
            <NetworkGraphView filteredData={filteredData} />
          )}

          {/* Filtered SCP List */}
          {Object.keys(activeFilters).length > 0 && (
            <div className="mt-12 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-foundation-accent animate-pulse" />
                  <h2 className="text-lg font-bold font-mono tracking-widest text-white uppercase">
                    Filtered Anomalies ({filteredData.length})
                  </h2>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredData.map(scp => (
                  <FilteredAnomalyCard key={scp.id} scp={scp} navigate={navigate} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
