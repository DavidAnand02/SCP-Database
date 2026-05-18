import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Activity, AlertTriangle, Database, Zap, Eye, Lock, Users, 
  Search, BarChart2, FileText, Skull, UserCheck, User, Link,
  Maximize2, Minimize2, Globe, Users2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { ChartCard, SectionHeader, SafeResponsiveContainer, CustomPieLabel, CustomPieTooltip, CustomBarTooltip, ScrollableBarChart } from './ChartComponents';
import { GlobalDiscoveryMap } from './GlobalDiscoveryMap';

import { getChartColor } from '../../utils/chartColors';

// Helper for Custom Legend
export const CustomLegend = ({ data, category }: { data: any[], category?: string }) => (
  <div className="flex flex-wrap gap-x-6 gap-y-4 justify-center mt-8">
    {data.map((entry, index) => (
      <div key={`legend-${index}`} className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getChartColor(category || '', entry.name, index) }} />
        <span className="text-xs font-mono text-foundation-muted uppercase tracking-wider">
          {entry.name}
        </span>
        <span className="text-xs font-mono text-white font-bold ml-1">
          {entry.value}%
        </span>
      </div>
    ))}
  </div>
);

// We need to calculate percentages for the legend
export const calculatePercentages = (data: any[]) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return data.map(item => ({
    ...item,
    percent: total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0'
  }));
};

// 1. STRATEGIC OVERVIEW
export const StrategicOverview = ({ objectClassStats, disruptionClassStats, riskClassStats, onFilterSelect }: any) => {
  const disruptionData = calculatePercentages(disruptionClassStats);
  const riskData = calculatePercentages(riskClassStats);
  
  return (
    <div className="space-y-6">
      <SectionHeader title="STRATEGIC OVERVIEW" icon={Shield} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ChartCard title="OBJECT CONTAINMENT CLASS" icon={Shield}>
          <ScrollableBarChart data={objectClassStats} onFilterSelect={onFilterSelect} filterCategory="object_containment_class" colorCategory="object_containment_class" yAxisWidth={80} />
        </ChartCard>

        <ChartCard title="DISRUPTION CLASS DISTRIBUTION" icon={Activity}>
          <div className="flex flex-col h-full">
            <div className="flex-1 min-h-[200px]">
              <SafeResponsiveContainer>
                <PieChart>
                  <Pie onClick={(data) => onFilterSelect && onFilterSelect('disruption_class', data.name)} cursor="pointer" data={disruptionClassStats} cx="50%" cy="50%" innerRadius="50%" outerRadius="80%" paddingAngle={2} dataKey="value" stroke="none">
                    {disruptionClassStats.map((entry, index) => <Cell key={`cell-${index}`} fill={getChartColor('disruption_class', entry.name, index)} />)}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip total={disruptionClassStats.reduce((a: any, b: any) => a + b.value, 0)} />} />
                </PieChart>
              </SafeResponsiveContainer>
            </div>
            <CustomLegend data={disruptionData.map(d => ({ name: d.name, value: d.percent }))} category="disruption_class" />
          </div>
        </ChartCard>

        <ChartCard title="RISK CLASS ANALYSIS" icon={AlertTriangle}>
          <div className="flex flex-col h-full">
            <div className="flex-1 min-h-[200px]">
              <SafeResponsiveContainer>
                <PieChart>
                  <Pie onClick={(data) => onFilterSelect && onFilterSelect('risk_class', data.name)} cursor="pointer" data={riskClassStats} cx="50%" cy="50%" innerRadius="50%" outerRadius="80%" paddingAngle={2} dataKey="value" stroke="none">
                    {riskClassStats.map((entry, index) => <Cell key={`cell-${index}`} fill={getChartColor('risk_class', entry.name, index)} />)}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip total={riskClassStats.reduce((a: any, b: any) => a + b.value, 0)} />} />
                </PieChart>
              </SafeResponsiveContainer>
            </div>
            <CustomLegend data={riskData.map(d => ({ name: d.name, value: d.percent }))} category="risk_class" />
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

// 2. ANOMALY CLASSIFICATION
export const AnomalyClassification = ({ ontologicalStats, anomalyTypeStats, onFilterSelect }: any) => (
  <div className="space-y-6 mt-12">
    <SectionHeader title="ANOMALY CLASSIFICATION" icon={Database} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ChartCard title="ONTOLOGICAL CATEGORIES" icon={Database}>
        <ScrollableBarChart data={ontologicalStats} onFilterSelect={onFilterSelect} filterCategory="ontological_category" fill="#ff4500" />
      </ChartCard>

      <ChartCard title="ANOMALY TYPES" icon={Zap}>
        <ScrollableBarChart data={anomalyTypeStats} onFilterSelect={onFilterSelect} filterCategory="anomaly_type" fill="#00ffff" />
      </ChartCard>
    </div>
  </div>
);

// 3. BIOLOGICAL & COGNITIVE PROFILES
export const BiologicalCognitiveProfiles = ({ morphologyStats, sapienceStats, onFilterSelect }: any) => {
  const sapienceData = calculatePercentages(sapienceStats);
  return (
    <div className="space-y-6 mt-12">
      <SectionHeader title="BIOLOGICAL & COGNITIVE PROFILES" icon={Eye} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="MORPHOLOGY DISTRIBUTION" icon={Eye}>
          <ScrollableBarChart data={morphologyStats} onFilterSelect={onFilterSelect} filterCategory="morphology" fill="#ff00ff" />
        </ChartCard>

        <ChartCard title="SAPIENCE LEVEL ANALYSIS" icon={Activity}>
          <div className="flex flex-col h-full">
            <div className="flex-1 min-h-[200px]">
              <SafeResponsiveContainer>
                <PieChart>
                  <Pie onClick={(data) => onFilterSelect && onFilterSelect('sapience_level', data.name)} cursor="pointer" data={sapienceStats} cx="50%" cy="50%" innerRadius="50%" outerRadius="80%" paddingAngle={2} dataKey="value" stroke="none">
                    {sapienceStats.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={getChartColor('sapience_level', entry.name, index)} />)}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip total={sapienceStats.reduce((a: any, b: any) => a + b.value, 0)} />} />
                </PieChart>
              </SafeResponsiveContainer>
            </div>
            <CustomLegend data={sapienceData.map((d: any) => ({ name: d.name, value: d.percent }))} category="sapience_level" />
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

// 4. CONTAINMENT & LOGISTICS
export const ContainmentLogistics = ({ containmentStatusStats, facilityStats, departmentStats, onFilterSelect }: any) => {
  const statusData = calculatePercentages(containmentStatusStats);
  return (
    <div className="space-y-6 mt-12">
      <SectionHeader title="CONTAINMENT & LOGISTICS" icon={Lock} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ChartCard title="CONTAINMENT STATUS" icon={Lock}>
          <div className="flex flex-col h-full">
            <div className="flex-1 min-h-[200px]">
              <SafeResponsiveContainer>
                <PieChart>
                  <Pie onClick={(data) => onFilterSelect && onFilterSelect('containment_status', data.name)} cursor="pointer" data={containmentStatusStats} cx="50%" cy="50%" innerRadius="50%" outerRadius="80%" paddingAngle={2} dataKey="value" stroke="none">
                    {containmentStatusStats.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={getChartColor('containment_status', entry.name, index)} />)}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip total={containmentStatusStats.reduce((a: any, b: any) => a + b.value, 0)} />} />
                </PieChart>
              </SafeResponsiveContainer>
            </div>
            <CustomLegend data={statusData.map((d: any) => ({ name: d.name, value: d.percent }))} category="containment_status" />
          </div>
        </ChartCard>

        <ChartCard title="FACILITY DISTRIBUTION" icon={Database}>
          <ScrollableBarChart data={facilityStats} onFilterSelect={onFilterSelect} filterCategory="containment_facility" fill="#ff4500" />
        </ChartCard>

        <ChartCard title="DEPARTMENTAL WORKLOAD" icon={Users}>
          <ScrollableBarChart data={departmentStats} onFilterSelect={onFilterSelect} filterCategory="respective_department" fill="#ffff00" />
        </ChartCard>
      </div>
    </div>
  );
};

// 5. SECURITY & ACCESS
export const SecurityAccess = ({ clearanceStats, onFilterSelect }: any) => (
  <div className="space-y-6 mt-12">
    <SectionHeader title="SECURITY & ACCESS" icon={Lock} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ChartCard title="SECURITY CLEARANCE DISTRIBUTION" icon={Shield}>
        <ScrollableBarChart data={clearanceStats} onFilterSelect={onFilterSelect} filterCategory="security_clearance_level" colorCategory="security_clearance_level" />
      </ChartCard>
    </div>
  </div>
);

// 6. TEMPORAL & DISCOVERY METRICS
export const TemporalDiscoveryMetrics = ({ timelineStats, discoveryMethodStats, onFilterSelect }: any) => {
  const [isFullView, setIsFullView] = React.useState(false);

  return (
    <div className="space-y-6 mt-12">
      <SectionHeader title="TEMPORAL & DISCOVERY METRICS" icon={Search} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard 
          title="DISCOVERY TIMELINE" 
          icon={Activity}
          className={isFullView ? "md:col-span-2" : ""}
        >
          <div className="absolute top-[-52px] right-0">
            <button 
              onClick={() => setIsFullView(!isFullView)}
              className="px-3 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-foundation-muted hover:text-foundation-accent hover:border-foundation-accent/30 transition-all flex items-center gap-2 uppercase tracking-widest"
            >
              {isFullView ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
              {isFullView ? 'Scroll View' : 'Full View'}
            </button>
          </div>

          <div className="flex w-full h-full min-h-[300px] relative">
            {/* Sticky Y-Axis - Only show in scroll view */}
            {!isFullView && (
              <div className="w-[40px] flex-shrink-0 z-10 bg-black/40 backdrop-blur-md border-r border-white/10 absolute left-0 top-0 bottom-0">
                <SafeResponsiveContainer>
                  <LineChart data={timelineStats} margin={{ top: 10, right: 0, left: 0, bottom: 10 }}>
                    <XAxis dataKey="name" hide height={30} />
                    <YAxis type="number" domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fill: '#d1d5db', fontSize: 12 }} width={40} />
                    <Line type="monotone" dataKey="value" stroke="transparent" isAnimationActive={false} dot={false} />
                  </LineChart>
                </SafeResponsiveContainer>
              </div>
            )}
            
            {/* Chart Area */}
            <div className={`flex-1 ${!isFullView ? 'overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-foundation-accent/20 scrollbar-track-transparent ml-[40px]' : ''}`}>
              <div style={{ 
                width: isFullView ? '100%' : Math.max(100, timelineStats.length * 40), 
                minWidth: '100%', 
                height: '100%' 
              }}>
                <SafeResponsiveContainer>
                  <LineChart data={timelineStats} margin={{ top: 10, right: 30, left: isFullView ? 10 : 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#d1d5db', fontSize: 10 }} 
                      height={30}
                      interval={isFullView ? 'preserveStartEnd' : 0}
                    />
                    <YAxis 
                      type="number" 
                      hide={!isFullView} 
                      domain={['auto', 'auto']} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#d1d5db', fontSize: 10 }}
                      width={isFullView ? 40 : 0}
                    />
                    <Tooltip content={<CustomBarTooltip />} cursor={false} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#00ff00" 
                      strokeWidth={2} 
                      dot={isFullView ? false : { fill: '#00ff00', r: 4 }} 
                      activeDot={{ r: 6, fill: '#fff' }} 
                    />
                  </LineChart>
                </SafeResponsiveContainer>
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="DISCOVERY METHODS" icon={Search} className={isFullView ? "hidden md:flex" : ""}>
          <ScrollableBarChart data={discoveryMethodStats} onFilterSelect={onFilterSelect} filterCategory="discovery_method" fill="#00ff00" />
        </ChartCard>
      </div>
    </div>
  );
};

// 7. GEOGRAPHIC DISTRIBUTION
export const GeographicDistribution = ({ locationStats, allLocationStats, locationTypeStats, onFilterSelect }: any) => (
  <div className="space-y-6 mt-12">
    <SectionHeader title="GEOGRAPHIC DISTRIBUTION" icon={Database} />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <ChartCard title="GLOBAL DISCOVERY MAP" icon={Database}>
          <GlobalDiscoveryMap data={allLocationStats} onFilterSelect={onFilterSelect} />
        </ChartCard>
      </div>
      <div className="lg:col-span-1 flex flex-col gap-6">
        <ChartCard title="TOP DISCOVERY REGIONS" icon={Database}>
          <ScrollableBarChart data={locationStats} onFilterSelect={onFilterSelect} filterCategory="country_of_discovery" fill="#8b5cf6" />
        </ChartCard>
        <ChartCard title="LOCATION OF INTEREST TYPES" icon={Globe}>
          <ScrollableBarChart data={locationTypeStats} onFilterSelect={onFilterSelect} filterCategory="locations_of_interest_types" fill="#06b6d4" />
        </ChartCard>
      </div>
    </div>
  </div>
);

// 8. BEHAVIORAL & CULTURAL IMPACT
export const BehavioralCulturalImpact = ({ toneStats, tagStats, authorStats, onFilterSelect }: any) => {
  const toneData = calculatePercentages(toneStats);
  return (
    <div className="space-y-6 mt-12">
      <SectionHeader title="BEHAVIORAL & CULTURAL IMPACT" icon={Activity} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ChartCard title="EMOTIONAL TONE DISTRIBUTION" icon={Activity}>
          <div className="flex flex-col h-full">
            <div className="flex-1 min-h-[200px]">
              <SafeResponsiveContainer>
                <PieChart>
                  <Pie onClick={(data) => onFilterSelect && onFilterSelect('emotional_tone', data.name)} cursor="pointer" data={toneStats} cx="50%" cy="50%" innerRadius="50%" outerRadius="80%" paddingAngle={2} dataKey="value" stroke="none">
                    {toneStats.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={getChartColor('emotional_tone', entry.name, index)} />)}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip total={toneStats.reduce((a: any, b: any) => a + b.value, 0)} />} />
                </PieChart>
              </SafeResponsiveContainer>
            </div>
            <CustomLegend data={toneData.map((d: any) => ({ name: d.name, value: d.percent }))} category="emotional_tone" />
          </div>
        </ChartCard>

        <ChartCard title="TOP TAGS FREQUENCY" icon={Database}>
          <ScrollableBarChart data={tagStats} onFilterSelect={onFilterSelect} filterCategory="tag_list" fill="#ec4899" />
        </ChartCard>

        <ChartCard title="PROLIFIC AUTHORS" icon={User}>
          <ScrollableBarChart data={authorStats} onFilterSelect={onFilterSelect} filterCategory="original_scp_article_author" fill="#ff00ff" />
        </ChartCard>
      </div>
    </div>
  );
};

// 9. THREAT & RATING METRICS
export const ThreatRatingMetrics = ({ topRated, bottomRated, kClassStats, onFilterSelect }: any) => {
  const navigate = useNavigate();
  const kClassData = calculatePercentages(kClassStats);
  return (
    <div className="space-y-6 mt-12">
      <SectionHeader title="THREAT & RATING METRICS" icon={AlertTriangle} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ChartCard title="HIGHEST RATED ENTITIES" icon={BarChart2}>
          <div className="space-y-2 mt-4">
            {topRated.map((item: any, i: number) => (
              <div 
                key={i} 
                onClick={() => navigate(`/scp/${item.scp_designation}`, { state: { from: window.location.pathname + window.location.search } })}
                className="flex justify-between items-center border-b border-white/5 pb-2 cursor-pointer hover:bg-white/5 transition-colors px-2 -mx-2 rounded group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                  <span className="text-xs font-mono text-white/20 w-4 shrink-0">{i + 1}</span>
                  <span className="text-sm font-mono text-white group-hover:text-foundation-accent transition-colors shrink-0">{item.scp_designation}</span>
                  <span className="text-xs font-mono text-foundation-muted truncate">{item.code_name || 'CLASSIFIED'}</span>
                </div>
                <span className="text-sm font-mono text-green-400 shrink-0">+{item.rating}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="LOWEST RATED ENTITIES" icon={BarChart2}>
          <div className="space-y-2 mt-4">
            {bottomRated.map((item: any, i: number) => (
              <div 
                key={i} 
                onClick={() => navigate(`/scp/${item.scp_designation}`, { state: { from: window.location.pathname + window.location.search } })}
                className="flex justify-between items-center border-b border-white/5 pb-2 cursor-pointer hover:bg-white/5 transition-colors px-2 -mx-2 rounded group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                  <span className="text-xs font-mono text-white/20 w-4 shrink-0">{i + 1}</span>
                  <span className="text-sm font-mono text-white group-hover:text-foundation-accent transition-colors shrink-0">{item.scp_designation}</span>
                  <span className="text-xs font-mono text-foundation-muted truncate">{item.code_name || 'CLASSIFIED'}</span>
                </div>
                <span className="text-sm font-mono text-red-400 shrink-0">{item.rating}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="K-CLASS SCENARIO RISK" icon={AlertTriangle}>
          <div className="flex flex-col h-full">
            <div className="flex-1 min-h-[200px]">
              <SafeResponsiveContainer>
                <PieChart>
                  <Pie onClick={(data) => onFilterSelect && onFilterSelect('related_k_class_scenarios', data.name)} cursor="pointer" data={kClassStats} cx="50%" cy="50%" innerRadius="50%" outerRadius="80%" paddingAngle={2} dataKey="value" stroke="none">
                    {kClassStats.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={getChartColor('related_k_class_scenarios', entry.name, index)} />)}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip total={kClassStats.reduce((a: any, b: any) => a + b.value, 0)} />} />
                </PieChart>
              </SafeResponsiveContainer>
            </div>
            <CustomLegend data={kClassData.map((d: any) => ({ name: d.name, value: d.percent }))} category="related_k_class_scenarios" />
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

// 10. PERSONNEL INVOLVEMENT
export const PersonnelInvolvement = ({ doctorWorkload, researcherWorkload, agentWorkload, onFilterSelect }: any) => (
  <div className="space-y-6 mt-12">
    <SectionHeader title="PERSONNEL INVOLVEMENT" icon={Users} />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <ChartCard title="TOP INVOLVED DOCTORS" icon={UserCheck}>
        <ScrollableBarChart data={doctorWorkload} onFilterSelect={onFilterSelect} filterCategory="involved_doctors" fill="#3b82f6" />
      </ChartCard>

      <ChartCard title="TOP INVOLVED RESEARCHERS" icon={UserCheck}>
        <ScrollableBarChart data={researcherWorkload} onFilterSelect={onFilterSelect} filterCategory="involved_researchers" fill="#10b981" />
      </ChartCard>

      <ChartCard title="FIELD AGENT ACTIVITY" icon={UserCheck}>
        <ScrollableBarChart data={agentWorkload} onFilterSelect={onFilterSelect} filterCategory="involved_agents" fill="#eab308" />
      </ChartCard>
    </div>
  </div>
);

// 11. TACTICAL RESPONSE
export const TacticalResponse = ({ mtfWorkload, onFilterSelect }: any) => (
  <div className="space-y-6 mt-12">
    <SectionHeader title="TACTICAL RESPONSE" icon={Shield} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ChartCard title="MTF DEPLOYMENT FREQUENCY" icon={Shield}>
        <ScrollableBarChart data={mtfWorkload} onFilterSelect={onFilterSelect} filterCategory="involved_mobile_task_force" fill="#ef4444" />
      </ChartCard>
    </div>
  </div>
);

// 12. ORIGIN & INTERACTION
export const OriginInteraction = ({ originStats, interactionStats, naturalLawsStats, onFilterSelect }: any) => {
  const originData = calculatePercentages(originStats);
  return (
    <div className="space-y-6 mt-12">
      <SectionHeader title="ORIGIN & INTERACTION" icon={Zap} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ChartCard title="ANOMALY ORIGIN ANALYSIS" icon={Database}>
          <div className="flex flex-col h-full">
            <div className="flex-1 min-h-[200px]">
              <SafeResponsiveContainer>
                <PieChart>
                  <Pie onClick={(data) => onFilterSelect && onFilterSelect('origin_type', data.name)} cursor="pointer" data={originStats} cx="50%" cy="50%" innerRadius="50%" outerRadius="80%" paddingAngle={2} dataKey="value" stroke="none">
                    {originStats.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={getChartColor('origin_type', entry.name, index)} />)}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip total={originStats.reduce((a: any, b: any) => a + b.value, 0)} />} />
                </PieChart>
              </SafeResponsiveContainer>
            </div>
            <CustomLegend data={originData.map((d: any) => ({ name: d.name, value: d.percent }))} category="origin_type" />
          </div>
        </ChartCard>

        <ChartCard title="INTERACTION TYPE PROFILE" icon={Activity}>
          <ScrollableBarChart data={interactionStats} onFilterSelect={onFilterSelect} filterCategory="interaction_type" fill="#ff00ff" />
        </ChartCard>

        <ChartCard title="AFFECTED NATURAL LAWS" icon={Zap}>
          <ScrollableBarChart data={naturalLawsStats} onFilterSelect={onFilterSelect} filterCategory="affected_natural_laws" fill="#00ffff" />
        </ChartCard>
      </div>
    </div>
  );
};

// 14. GEOPOLITICAL LANDSCAPE
export const GeopoliticalLandscape = ({ poiStats, goiStats, onFilterSelect }: any) => {
  // Calculate a shared max value for consistent scaling between the two charts
  const maxPoi = Math.max(...poiStats.map((d: any) => d.value), 0);
  const maxGoi = Math.max(...goiStats.map((d: any) => d.value), 0);
  const sharedMax = Math.max(maxPoi, maxGoi, 1);

  return (
    <div className="space-y-6 mt-12">
      <SectionHeader title="GEOPOLITICAL LANDSCAPE" icon={Users2} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="PERSONS OF INTEREST" icon={User}>
          <ScrollableBarChart 
            data={poiStats} 
            onFilterSelect={onFilterSelect} 
            filterCategory="persons_of_interest" 
            fill="#f59e0b" 
            maxValue={sharedMax}
          />
        </ChartCard>

        <ChartCard title="GROUPS OF INTEREST" icon={Users2}>
          <ScrollableBarChart 
            data={goiStats} 
            onFilterSelect={onFilterSelect} 
            filterCategory="groups_of_interest" 
            fill="#ef4444" 
            maxValue={sharedMax}
          />
        </ChartCard>
      </div>
    </div>
  );
};
export const ContainmentBreachTermination = ({ spreadStats, terminationStats, onFilterSelect }: any) => (
  <div className="space-y-6 mt-12">
    <SectionHeader title="CONTAINMENT BREACH & TERMINATION" icon={AlertTriangle} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ChartCard title="SPREAD MECHANISMS" icon={Activity}>
        <ScrollableBarChart data={spreadStats} onFilterSelect={onFilterSelect} filterCategory="spread_mechanism" fill="#ff00ff" />
      </ChartCard>

      <ChartCard title="TERMINATION ATTEMPTS BY CLASS" icon={Skull}>
        <ScrollableBarChart data={terminationStats} onFilterSelect={onFilterSelect} filterCategory="termination_attempts" fill="#ff4500" />
      </ChartCard>
    </div>
  </div>
);
