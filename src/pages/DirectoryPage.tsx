import React, { useRef, useMemo } from 'react';
import { Search, ChevronRight, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Grid } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import { SCPCard } from '../components/SCPCard';
import { Layout } from '../components/Layout';
import { CollapsibleFilter, FilterGroup } from '../components/DirectoryFilters';
import { useSCPFilters } from '../hooks/useSCPFilters';
import { useSCPEntries, useSCPAllEntries } from '../hooks/useSCPHooks';

interface DirectoryPageProps {
  onLogout: () => void;
}

const PAGE_SIZE = 40;
const ROW_HEIGHT = 200;

// Cell component for virtualization
const Cell = ({ columnIndex, rowIndex, style, scpData, columnCount }: any) => {
  const index = rowIndex * columnCount + columnIndex;
  const scp = scpData[index];

  if (!scp) return null;

  return (
    <div style={{ ...style, padding: '12px' }}>
      <SCPCard scp={scp} onClick={() => {}} />
    </div>
  );
};

export const DirectoryPage = ({ onLogout }: DirectoryPageProps) => {
  const mainRef = useRef<HTMLElement>(null);
  
  // Fetch all entries for filter options (cached for 5 mins)
  const { 
    data: allEntriesForOptions = [], 
    isError: isOptionsError,
    error: optionsError
  } = useSCPAllEntries();

  if (isOptionsError) {
    console.warn('[DIRECTORY] Failed to load filter options:', optionsError);
  }

  const {
    searchQuery, setSearchQuery,
    filterClass, setFilterClass,
    filterDisruption, setFilterDisruption,
    filterRisk, setFilterRisk,
    filterOntological, setFilterOntological,
    filterAnomalyType, setFilterAnomalyType,
    filterMorphology, setFilterMorphology,
    filterTone, setFilterTone,
    filterTag, setFilterTag,
    filterSapience, setFilterSapience,
    filterClearance, setFilterClearance,
    filterDiscoveryMethod, setFilterDiscoveryMethod,
    filterOriginType, setFilterOriginType,
    filterFacilityType, setFilterFacilityType,
    filterStatus, setFilterStatus,
    filterChallenges, setFilterChallenges,
    filterNormalBehaviour, setFilterNormalBehaviour,
    filterTriggeredBehaviour, setFilterTriggeredBehaviour,
    filterDepartment, setFilterDepartment,
    filterNaturalLaws, setFilterNaturalLaws,
    filterInteractionType, setFilterInteractionType,
    filterSpreadMechanism, setFilterSpreadMechanism,
    filterKClass, setFilterKClass,
    sortBy, setSortBy,
    sortOrder, setSortOrder,
    openSections, toggleSection,
    activeFilters,
    filterOptions,
    resetFilters
  } = useSCPFilters(allEntriesForOptions);

  // Use Infinite Query for paginated data
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useSCPEntries(activeFilters, PAGE_SIZE);

  // Flatten the pages into a single array for the virtualized grid
  const scpData = useMemo(() => {
    return data?.pages.flatMap(page => page.data) || [];
  }, [data]);

  const totalCount = data?.pages[0]?.count || 0;

  const getColumnCount = (width: number) => {
    if (width < 640) return 1;
    if (width < 768) return 2;
    if (width < 1280) return 3;
    if (width < 1536) return 4;
    return 5;
  };

  const sidebar = (
    <div className="w-full">
      <div className="space-y-4 mb-6">
        <div>
          <label className="text-[10px] font-mono text-foundation-muted uppercase tracking-widest mb-2 block">Search Database</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foundation-muted" />
            <input 
              type="text" 
              placeholder="DESIGNATION..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-foundation-border rounded px-10 py-2 text-xs font-mono focus:outline-none focus:border-foundation-accent transition-colors"
            />
          </div>
        </div>
        
        <button 
          onClick={resetFilters}
          className="w-full py-2 border border-white/10 rounded text-[10px] font-mono text-foundation-muted hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest"
        >
          Reset All Filters
        </button>

        {isOptionsError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded">
            <p className="text-[9px] font-mono text-red-400 uppercase leading-relaxed">
              Security Protocol: Failed to retrieve category indices. Some filters may be restricted.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <CollapsibleFilter 
          label="Classification" 
          isOpen={openSections.includes('Classification')} 
          onToggle={() => toggleSection('Classification')}
        >
          <FilterGroup label="Object Class" options={filterOptions.objectClasses} current={filterClass} onChange={setFilterClass} />
          <FilterGroup label="Disruption Class" options={filterOptions.disruptionClasses} current={filterDisruption} onChange={setFilterDisruption} />
          <FilterGroup label="Risk Class" options={filterOptions.riskClasses} current={filterRisk} onChange={setFilterRisk} />
          <FilterGroup label="Security Clearance" options={filterOptions.clearanceLevels} current={filterClearance} onChange={setFilterClearance} />
          <FilterGroup label="Containment Status" options={filterOptions.statuses} current={filterStatus} onChange={setFilterStatus} />
        </CollapsibleFilter>

        <CollapsibleFilter 
          label="Anomalous Properties" 
          isOpen={openSections.includes('Anomalous Properties')} 
          onToggle={() => toggleSection('Anomalous Properties')}
        >
          <FilterGroup label="Ontological Category" options={filterOptions.ontologicalCategories} current={filterOntological} onChange={setFilterOntological} />
          <FilterGroup label="Anomaly Type" options={filterOptions.anomalyTypes} current={filterAnomalyType} onChange={setFilterAnomalyType} />
          <FilterGroup label="Morphology" options={filterOptions.morphologies} current={filterMorphology} onChange={setFilterMorphology} />
          <FilterGroup label="Sapience Level" options={filterOptions.sapienceLevels} current={filterSapience} onChange={setFilterSapience} />
          <FilterGroup label="Interaction Type" options={filterOptions.interactionTypes} current={filterInteractionType} onChange={setFilterInteractionType} />
          <FilterGroup label="Affected Natural Laws" options={filterOptions.naturalLaws} current={filterNaturalLaws} onChange={setFilterNaturalLaws} />
          <FilterGroup label="K-Class Risk" options={filterOptions.kClasses} current={filterKClass} onChange={setFilterKClass} />
        </CollapsibleFilter>

        <CollapsibleFilter 
          label="Containment & Operations" 
          isOpen={openSections.includes('Containment & Operations')} 
          onToggle={() => toggleSection('Containment & Operations')}
        >
          <FilterGroup label="Facility Type" options={filterOptions.facilityTypes} current={filterFacilityType} onChange={setFilterFacilityType} />
          <FilterGroup label="Respective Department" options={filterOptions.departments} current={filterDepartment} onChange={setFilterDepartment} />
          <FilterGroup label="Containment Challenges" options={filterOptions.challenges} current={filterChallenges} onChange={setFilterChallenges} />
          <FilterGroup label="Spread Mechanism" options={filterOptions.spreadMechanisms} current={filterSpreadMechanism} onChange={setFilterSpreadMechanism} />
        </CollapsibleFilter>

        <CollapsibleFilter 
          label="Behavioral Analysis" 
          isOpen={openSections.includes('Behavioral Analysis')} 
          onToggle={() => toggleSection('Behavioral Analysis')}
        >
          <FilterGroup label="Normal Behaviour" options={filterOptions.normalBehaviours} current={filterNormalBehaviour} onChange={setFilterNormalBehaviour} />
          <FilterGroup label="Triggered Behaviour" options={filterOptions.triggeredBehaviours} current={filterTriggeredBehaviour} onChange={setFilterTriggeredBehaviour} />
          <FilterGroup label="Emotional Tone" options={filterOptions.tones} current={filterTone} onChange={setFilterTone} />
        </CollapsibleFilter>

        <CollapsibleFilter 
          label="Discovery & Origin" 
          isOpen={openSections.includes('Discovery & Origin')} 
          onToggle={() => toggleSection('Discovery & Origin')}
        >
          <FilterGroup label="Discovery Method" options={filterOptions.discoveryMethods} current={filterDiscoveryMethod} onChange={setFilterDiscoveryMethod} />
          <FilterGroup label="Origin Type" options={filterOptions.originTypes} current={filterOriginType} onChange={setFilterOriginType} />
          <FilterGroup label="Tags" options={filterOptions.tags} current={filterTag} onChange={setFilterTag} />
        </CollapsibleFilter>
      </div>
    </div>
  );

  return (
    <Layout 
      onLogout={onLogout} 
      sidebar={sidebar}
      mainRef={mainRef}
      mainClassName="overflow-hidden h-full"
    >
      <Helmet>
        <title>SCP Foundation Directory | Secure. Contain. Protect.</title>
        <meta name="description" content="Access the most comprehensive SCP Foundation directory. Explore thousands of anomalous entries, containment protocols, and network maps." />
        <link rel="canonical" href={window.location.origin} />
        <meta property="og:url" content={window.location.origin} />
      </Helmet>

      <div className="h-full flex flex-col space-y-6">
        <div className="flex justify-between items-end shrink-0">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter terminal-text mb-1">Secure Directory</h1>
            <p className="text-xs text-foundation-muted font-mono uppercase tracking-[0.2em]">
              Showing {scpData.length} of {totalCount} records
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                if (sortBy === 'designation') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy('designation');
                  setSortOrder('asc');
                }
              }}
              className={`px-3 py-1.5 rounded text-[10px] font-mono uppercase border transition-all flex items-center gap-2 ${sortBy === 'designation' ? 'bg-foundation-accent/20 border-foundation-accent text-foundation-accent' : 'bg-white/5 border-foundation-border text-foundation-muted'}`}
            >
              Sort by ID
              {sortBy === 'designation' && (
                sortOrder === 'asc' ? <ChevronRight className="w-3 h-3 rotate-90" /> : <ChevronRight className="w-3 h-3 -rotate-90" />
              )}
            </button>
            <button 
              onClick={() => {
                if (sortBy === 'rating') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy('rating');
                  setSortOrder('desc');
                }
              }}
              className={`px-3 py-1.5 rounded text-[10px] font-mono uppercase border transition-all flex items-center gap-2 ${sortBy === 'rating' ? 'bg-foundation-accent/20 border-foundation-accent text-foundation-accent' : 'bg-white/5 border-foundation-border text-foundation-muted'}`}
            >
              Sort by Rating
              {sortBy === 'rating' && (
                sortOrder === 'asc' ? <ChevronRight className="w-3 h-3 rotate-90" /> : <ChevronRight className="w-3 h-3 -rotate-90" />
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <AutoSizer renderProp={({ height, width }) => {
            if (height === undefined || width === undefined) return null;
            
            const columnCount = getColumnCount(width);
            const columnWidth = width / columnCount;
            const rowCount = Math.ceil(scpData.length / columnCount);

            const onCellsRendered = (visibleCells: any) => {
              if (visibleCells.rowStopIndex >= rowCount - 2 && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            };

            return (
              <Grid
                columnCount={columnCount}
                columnWidth={columnWidth}
                rowCount={rowCount}
                rowHeight={ROW_HEIGHT}
                cellComponent={Cell}
                cellProps={{ scpData, columnCount }}
                onCellsRendered={onCellsRendered}
                className="custom-scrollbar"
                style={{ height, width }}
              />
            );
          }} />
        </div>

        {scpData.length === 0 && !isLoading && (
          <div className="py-20 text-center space-y-4">
            <Search className="w-12 h-12 text-foundation-muted mx-auto opacity-20" />
            <p className="text-foundation-muted font-mono uppercase text-sm">No records match your current search parameters.</p>
          </div>
        )}

        {isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 text-foundation-accent animate-spin" />
            <p className="text-[10px] font-mono text-foundation-muted uppercase tracking-[0.3em]">Establishing Secure Connection...</p>
          </div>
        )}

        {isError && (
          <div className="py-20 text-center space-y-4">
            <p className="text-red-500 font-mono uppercase text-sm">Error Synchronizing Database. Connection Lost.</p>
          </div>
        )}

        {/* License Notice Footer */}
        <div className="shrink-0 pt-4 border-t border-white/5 text-center">
          <p className="text-[10px] font-mono text-foundation-muted uppercase tracking-wider leading-relaxed">
            This work is licensed under a <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer" className="text-foundation-accent hover:underline font-semibold">Creative Commons Attribution-ShareAlike 3.0 International License</a>.
          </p>
        </div>
      </div>
    </Layout>
  );
};
