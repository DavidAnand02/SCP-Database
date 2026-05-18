import { useMemo } from 'react';
import { SCPEntry } from '../types';
import { normalizeValue, splitMultiValue } from '../utils/formatters';

export const EXCLUDED_VALUES = [
  'not in source', 
  'not found in sources', 
  'not mentioned', 
  '[redacted]', 
  '[data expunged]', 
  'n/a', 
  'none', 
  'none mentioned',
  'unknown', 
  'pending', 
  'missing', 
  'null', 
  'NULL', 
  'unknown author', 
  'site redacted'
];

export const useAnalyticsData = (data: SCPEntry[], valueThreshold: number) => {
  const getStats = (filteredData: SCPEntry[], key: keyof SCPEntry, limit = 10, groupOther = true) => {
    const counts: Record<string, number> = {};
    filteredData.forEach(item => {
      const rawVal = (item[key] as string);
      if (!rawVal) return;
      const values = splitMultiValue(rawVal);
      values.forEach(v => {
        const val = normalizeValue(v, key as any);
        if (val && !EXCLUDED_VALUES.includes(val.toLowerCase()) && !val.includes('█')) {
          counts[val] = (counts[val] || 0) + 1;
        }
      });
    });
    let sorted = Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value >= valueThreshold)
      .sort((a, b) => b.value - a.value);
    if (limit > 0 && sorted.length > limit && groupOther) {
      const top = sorted.slice(0, limit - 1);
      const otherValue = sorted.slice(limit - 1).reduce((acc, curr) => acc + curr.value, 0);
      return [...top, { name: 'Other', value: otherValue }];
    }
    return limit > 0 ? sorted.slice(0, limit) : sorted;
  };

  const getMultiValueStats = (filteredData: SCPEntry[], key: keyof SCPEntry, limit = 10, groupOther = true) => {
    const counts: Record<string, number> = {};
    filteredData.forEach(item => {
      const val = item[key] as string;
      if (val) {
        splitMultiValue(val).forEach(trimmed => {
          if (trimmed && !EXCLUDED_VALUES.includes(trimmed.toLowerCase()) && !trimmed.includes('█')) {
            const normalized = normalizeValue(trimmed, key as any);
            counts[normalized] = (counts[normalized] || 0) + 1;
          }
        });
      }
    });
    let sorted = Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value >= valueThreshold)
      .sort((a, b) => b.value - a.value);
    if (limit > 0 && sorted.length > limit && groupOther) {
      const top = sorted.slice(0, limit - 1);
      const otherValue = sorted.slice(limit - 1).reduce((acc, curr) => acc + curr.value, 0);
      return [...top, { name: 'Other', value: otherValue }];
    }
    return limit > 0 ? sorted.slice(0, limit) : sorted;
  };

  const objectClassStats = useMemo(() => getStats(data, 'object_containment_class', 8), [data, valueThreshold]);
  const disruptionClassStats = useMemo(() => getStats(data, 'disruption_class', 8), [data, valueThreshold]);
  const riskClassStats = useMemo(() => getStats(data, 'risk_class', 8), [data, valueThreshold]);
  const ontologicalStats = useMemo(() => getStats(data, 'ontological_category', 8), [data, valueThreshold]);
  const anomalyTypeStats = useMemo(() => getStats(data, 'anomaly_type', 10), [data, valueThreshold]);
  const morphologyStats = useMemo(() => getStats(data, 'morphology', 10), [data, valueThreshold]);
  const sapienceStats = useMemo(() => getStats(data, 'sapience_level', 6), [data, valueThreshold]);
  const containmentStatusStats = useMemo(() => getStats(data, 'containment_status', 6), [data, valueThreshold]);
  const facilityStats = useMemo(() => getStats(data, 'containment_facility', 8), [data, valueThreshold]);
  const discoveryMethodStats = useMemo(() => getStats(data, 'discovery_method', 8), [data, valueThreshold]);
  const tagStats = useMemo(() => getMultiValueStats(data, 'tag_list', 10), [data, valueThreshold]);
  const authorStats = useMemo(() => getStats(data, 'original_scp_article_author', 10), [data, valueThreshold]);
  const kClassStats = useMemo(() => getMultiValueStats(data, 'related_k_class_scenarios', 6), [data, valueThreshold]);
  const originStats = useMemo(() => getStats(data, 'origin_type', 6), [data, valueThreshold]);
  const interactionStats = useMemo(() => getMultiValueStats(data, 'interaction_type', 10), [data, valueThreshold]);
  const naturalLawsStats = useMemo(() => getMultiValueStats(data, 'affected_natural_laws', 10), [data, valueThreshold]);
  const spreadStats = useMemo(() => getMultiValueStats(data, 'spread_mechanism', 10), [data, valueThreshold]);

  const toneStats = useMemo(() => getStats(data, 'emotional_tone', 6), [data, valueThreshold]);
  const clearanceStats = useMemo(() => {
    const stats = getStats(data, 'security_clearance_level', 10, true);
    // getStats already sorts by value descending. 
    // We just need to ensure 'Other' is at the bottom if it exists.
    const otherIndex = stats.findIndex(s => s.name === 'Other');
    if (otherIndex !== -1) {
      const other = stats.splice(otherIndex, 1)[0];
      stats.push(other);
    }
    return stats;
  }, [data, valueThreshold]);
  const departmentStats = useMemo(() => getStats(data, 'respective_department', 8), [data, valueThreshold]);
  const doctorWorkload = useMemo(() => getMultiValueStats(data, 'involved_doctors'), [data, valueThreshold]);
  const researcherWorkload = useMemo(() => getMultiValueStats(data, 'involved_researchers'), [data, valueThreshold]);
  const agentWorkload = useMemo(() => getMultiValueStats(data, 'involved_agents'), [data, valueThreshold]);
  const mtfWorkload = useMemo(() => getMultiValueStats(data, 'involved_mobile_task_force'), [data, valueThreshold]);
  const locationTypeStats = useMemo(() => getMultiValueStats(data, 'locations_of_interest_types', 10), [data, valueThreshold]);
  const poiStats = useMemo(() => getMultiValueStats(data, 'persons_of_interest', 10), [data, valueThreshold]);
  const goiStats = useMemo(() => getMultiValueStats(data, 'groups_of_interest', 10), [data, valueThreshold]);

  const timelineStats = useMemo(() => {
    const counts: Record<string, number> = {};
    const years: number[] = [];
    data.forEach(item => {
      // Look for 4-digit years in multiple fields for better coverage
      const searchStr = `${item.year_discovered || ''} ${item.date_discovered || ''} ${item.discovery_details || ''}`;
      const yearMatches = searchStr.match(/\b(18|19|20)\d{2}\b/g);
      
      if (yearMatches) {
        // Use the first valid looking year
        const year = yearMatches[0];
        counts[year] = (counts[year] || 0) + 1;
        years.push(parseInt(year));
      }
    });

    if (years.length === 0) return [];
    
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const result = [];
    
    // Fill in all years in the range to show a continuous timeline
    for (let y = minYear; y <= maxYear; y++) {
      result.push({ 
        name: y.toString(), 
        value: counts[y.toString()] || 0 
      });
    }
    return result;
  }, [data]);

  const allLocationStats = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(item => {
      if (item.country_of_discovery) {
        const locs = item.country_of_discovery.split(',').map(l => l.trim());
        locs.forEach(rawLoc => {
          const loc = normalizeValue(rawLoc, 'country_of_discovery');
          if (loc && !EXCLUDED_VALUES.includes(loc.toLowerCase())) {
            counts[loc] = (counts[loc] || 0) + 1;
          }
        });
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value >= valueThreshold)
      .sort((a, b) => b.value - a.value);
  }, [data, valueThreshold]);

  const locationStats = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(item => {
      if (item.country_of_discovery) {
        const locs = item.country_of_discovery.split(',').map(l => l.trim());
        locs.forEach(rawLoc => {
          const loc = normalizeValue(rawLoc, 'country_of_discovery');
          if (loc && !EXCLUDED_VALUES.includes(loc.toLowerCase())) {
            counts[loc] = (counts[loc] || 0) + 1;
          }
        });
      }
    });
    const all = Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value >= valueThreshold)
      .sort((a, b) => b.value - a.value);
    
    const limit = 10;
    if (all.length > limit) {
      const top = all.slice(0, limit - 1);
      const otherValue = all.slice(limit - 1).reduce((acc, curr) => acc + curr.value, 0);
      return [...top, { name: 'Other Regions', value: otherValue }];
    }
    return all;
  }, [data, valueThreshold]);

  const terminationStats = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(item => {
      const hasAttempts = item.termination_attempts && 
                         item.termination_attempts.toLowerCase() !== 'none' && 
                         item.termination_attempts.toLowerCase() !== 'missing' &&
                         item.termination_attempts.toLowerCase() !== 'not in source' &&
                         item.termination_attempts.toLowerCase() !== '[redacted]';
      if (hasAttempts) {
        const cls = normalizeValue(item.object_containment_class);
        counts[cls] = (counts[cls] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value >= valueThreshold)
      .sort((a, b) => b.value - a.value);
  }, [data, valueThreshold]);

  const topRated = useMemo(() => {
    return data
      .filter(item => item.rating !== undefined && item.rating !== 0)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 10);
  }, [data]);

  const bottomRated = useMemo(() => {
    return data
      .filter(item => item.rating !== undefined && item.rating !== 0)
      .sort((a, b) => (a.rating || 0) - (b.rating || 0))
      .slice(0, 10);
  }, [data]);

  return {
    objectClassStats,
    disruptionClassStats,
    riskClassStats,
    ontologicalStats,
    anomalyTypeStats,
    morphologyStats,
    sapienceStats,
    containmentStatusStats,
    facilityStats,
    discoveryMethodStats,
    tagStats,
    authorStats,
    kClassStats,
    originStats,
    interactionStats,
    naturalLawsStats,
    spreadStats,
    toneStats,
    clearanceStats,
    departmentStats,
    doctorWorkload,
    researcherWorkload,
    agentWorkload,
    mtfWorkload,
    locationTypeStats,
    poiStats,
    goiStats,
    timelineStats,
    locationStats,
    allLocationStats,
    terminationStats,
    topRated,
    bottomRated,
    totalCount: data.length
  };
};
