import { useState, useMemo, useEffect } from 'react';
import { SCPEntry } from '../types';
import { normalizeValue, splitMultiValue } from '../utils/formatters';

const STORAGE_KEY = 'scp_directory_filters';

export const useSCPFilters = (scpData: SCPEntry[]) => {
  // Load initial state from sessionStorage if available
  const savedFilters = useMemo(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }, []);

  const [searchQuery, setSearchQuery] = useState(savedFilters?.searchQuery || '');
  const [filterClass, setFilterClass] = useState<string>(savedFilters?.filterClass || 'All');
  const [filterDisruption, setFilterDisruption] = useState<string>(savedFilters?.filterDisruption || 'All');
  const [filterRisk, setFilterRisk] = useState<string>(savedFilters?.filterRisk || 'All');
  const [filterOntological, setFilterOntological] = useState<string>(savedFilters?.filterOntological || 'All');
  const [filterAnomalyType, setFilterAnomalyType] = useState<string>(savedFilters?.filterAnomalyType || 'All');
  const [filterMorphology, setFilterMorphology] = useState<string>(savedFilters?.filterMorphology || 'All');
  const [filterTone, setFilterTone] = useState<string>(savedFilters?.filterTone || 'All');
  const [filterTag, setFilterTag] = useState<string>(savedFilters?.filterTag || 'All');
  const [filterSapience, setFilterSapience] = useState<string>(savedFilters?.filterSapience || 'All');
  const [filterClearance, setFilterClearance] = useState<string>(savedFilters?.filterClearance || 'All');
  const [filterDiscoveryMethod, setFilterDiscoveryMethod] = useState<string>(savedFilters?.filterDiscoveryMethod || 'All');
  const [filterOriginType, setFilterOriginType] = useState<string>(savedFilters?.filterOriginType || 'All');
  const [filterFacilityType, setFilterFacilityType] = useState<string>(savedFilters?.filterFacilityType || 'All');
  const [filterStatus, setFilterStatus] = useState<string>(savedFilters?.filterStatus || 'All');
  const [filterChallenges, setFilterChallenges] = useState<string>(savedFilters?.filterChallenges || 'All');
  const [filterNormalBehaviour, setFilterNormalBehaviour] = useState<string>(savedFilters?.filterNormalBehaviour || 'All');
  const [filterTriggeredBehaviour, setFilterTriggeredBehaviour] = useState<string>(savedFilters?.filterTriggeredBehaviour || 'All');
  const [filterDepartment, setFilterDepartment] = useState<string>(savedFilters?.filterDepartment || 'All');
  const [filterNaturalLaws, setFilterNaturalLaws] = useState<string>(savedFilters?.filterNaturalLaws || 'All');
  const [filterInteractionType, setFilterInteractionType] = useState<string>(savedFilters?.filterInteractionType || 'All');
  const [filterSpreadMechanism, setFilterSpreadMechanism] = useState<string>(savedFilters?.filterSpreadMechanism || 'All');
  const [filterKClass, setFilterKClass] = useState<string>(savedFilters?.filterKClass || 'All');
  const [sortBy, setSortBy] = useState<'designation' | 'rating'>(savedFilters?.sortBy || 'designation');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(savedFilters?.sortOrder || 'asc');
  const [openSections, setOpenSections] = useState<string[]>(savedFilters?.openSections || []);

  const activeFilters = useMemo(() => ({
    searchQuery,
    filterClass,
    filterDisruption,
    filterRisk,
    filterOntological,
    filterAnomalyType,
    filterMorphology,
    filterTone,
    filterTag,
    filterSapience,
    filterClearance,
    filterDiscoveryMethod,
    filterOriginType,
    filterFacilityType,
    filterStatus,
    filterChallenges,
    filterNormalBehaviour,
    filterTriggeredBehaviour,
    filterDepartment,
    filterNaturalLaws,
    filterInteractionType,
    filterSpreadMechanism,
    filterKClass,
    sortBy,
    sortOrder,
    openSections
  }), [
    searchQuery, filterClass, filterDisruption, filterRisk, 
    filterOntological, filterAnomalyType, filterMorphology, filterTone, 
    filterTag, filterSapience, filterClearance, filterDiscoveryMethod, 
    filterOriginType, filterFacilityType, filterStatus, filterChallenges, 
    filterNormalBehaviour, filterTriggeredBehaviour, filterDepartment, 
    filterNaturalLaws, filterInteractionType, filterSpreadMechanism, 
    filterKClass, sortBy, sortOrder, openSections
  ]);

  // Persist filters to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(activeFilters));
  }, [activeFilters]);

  const toggleSection = (label: string) => {
    setOpenSections(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label) 
        : [...prev, label]
    );
  };

  const filterOptions = useMemo(() => {
    const getOptions = (key: keyof SCPEntry, category?: any) => {
      const values = new Set<string>();
      scpData.forEach(item => {
        const val = item[key] as string;
        if (val) {
          splitMultiValue(val).forEach(v => {
            const normalized = normalizeValue(v, category);
            if (normalized && normalized !== 'Unknown') {
              values.add(normalized);
            }
          });
        }
      });
      return ['All', ...Array.from(values).sort()];
    };

    const allTags = new Set<string>();
    scpData.forEach(item => {
      if (item.tag_list) {
        splitMultiValue(item.tag_list).forEach(t => {
          if (t) allTags.add(t);
        });
      }
    });

    return {
      objectClasses: getOptions('object_containment_class', 'object_containment_class'),
      disruptionClasses: getOptions('disruption_class', 'disruption_class'),
      riskClasses: getOptions('risk_class', 'risk_class'),
      ontologicalCategories: getOptions('ontological_category', 'ontological_category'),
      anomalyTypes: getOptions('anomaly_type', 'anomaly_type'),
      morphologies: getOptions('morphology', 'morphology'),
      tones: getOptions('emotional_tone', 'emotional_tone'),
      sapienceLevels: getOptions('sapience_level', 'sapience_level'),
      clearanceLevels: getOptions('security_clearance_level', 'security_clearance_level'),
      discoveryMethods: getOptions('discovery_method', 'discovery_method'),
      originTypes: getOptions('origin_type', 'origin_type'),
      facilityTypes: getOptions('containment_facility_type', 'containment_facility_type'),
      statuses: getOptions('containment_status', 'containment_status'),
      challenges: getOptions('challenges_to_containment_type', 'challenges_to_containment_type'),
      normalBehaviours: getOptions('normal_behaviour_type', 'normal_behaviour_type'),
      triggeredBehaviours: getOptions('triggered_behaviour_type', 'triggered_behaviour_type'),
      departments: getOptions('respective_department', 'respective_department'),
      naturalLaws: getOptions('affected_natural_laws', 'affected_natural_laws'),
      interactionTypes: getOptions('interaction_type', 'interaction_type'),
      spreadMechanisms: getOptions('spread_mechanism', 'spread_mechanism'),
      kClasses: getOptions('related_k_class_scenarios', 'related_k_class_scenarios'),
      tags: ['All', ...Array.from(allTags).sort()]
    };
  }, [scpData]);

  const resetFilters = () => {
    setSearchQuery('');
    setFilterClass('All');
    setFilterDisruption('All');
    setFilterRisk('All');
    setFilterOntological('All');
    setFilterAnomalyType('All');
    setFilterMorphology('All');
    setFilterTone('All');
    setFilterTag('All');
    setFilterSapience('All');
    setFilterClearance('All');
    setFilterDiscoveryMethod('All');
    setFilterOriginType('All');
    setFilterFacilityType('All');
    setFilterStatus('All');
    setFilterChallenges('All');
    setFilterNormalBehaviour('All');
    setFilterTriggeredBehaviour('All');
    setFilterDepartment('All');
    setFilterNaturalLaws('All');
    setFilterInteractionType('All');
    setFilterSpreadMechanism('All');
    setFilterKClass('All');
    setSortBy('designation');
    setSortOrder('asc');
    setOpenSections([]);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return {
    ...activeFilters,
    setSearchQuery,
    setFilterClass,
    setFilterDisruption,
    setFilterRisk,
    setFilterOntological,
    setFilterAnomalyType,
    setFilterMorphology,
    setFilterTone,
    setFilterTag,
    setFilterSapience,
    setFilterClearance,
    setFilterDiscoveryMethod,
    setFilterOriginType,
    setFilterFacilityType,
    setFilterStatus,
    setFilterChallenges,
    setFilterNormalBehaviour,
    setFilterTriggeredBehaviour,
    setFilterDepartment,
    setFilterNaturalLaws,
    setFilterInteractionType,
    setFilterSpreadMechanism,
    setFilterKClass,
    setSortBy,
    setSortOrder,
    toggleSection,
    activeFilters,
    filterOptions,
    resetFilters
  };
};
