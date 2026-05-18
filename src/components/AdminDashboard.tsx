import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { SCPEntry } from '../types';
import { scpService } from '../services/scpService';
import { useSCPAllEntries, useSCPMutations } from '../hooks/useSCPHooks';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Upload, 
  Music, 
  Image as ImageIcon,
  Database,
  Search,
  ArrowLeft,
  Eye,
  FileText,
  Check,
  Camera,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminDashboardProps {
  onPreview: (scp: SCPEntry) => void;
  onDataChange?: () => void;
}

export const AdminDashboard = ({ onPreview, onDataChange }: AdminDashboardProps) => {
  const { data: allEntries = [], isLoading: isFetching, refetch } = useSCPAllEntries();
  const { upsertMutation, deleteMutation } = useSCPMutations();
  
  const [loading, setLoading] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Partial<SCPEntry> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [sortField, setSortField] = useState<keyof SCPEntry>('scp_designation');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const entries = useMemo(() => {
    let sortedData = [...allEntries];
    
    sortedData.sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      
      if (sortField === 'rating') {
        const numA = parseFloat(valA.toString()) || 0;
        const numB = parseFloat(valB.toString()) || 0;
        return sortOrder === 'asc' ? numA - numB : numB - numA;
      }
      
      if (sortField === 'scp_designation') {
        return sortOrder === 'asc' 
          ? valA.toString().localeCompare(valB.toString(), undefined, { numeric: true, sensitivity: 'base' })
          : valB.toString().localeCompare(valA.toString(), undefined, { numeric: true, sensitivity: 'base' });
      }
      
      const strA = valA.toString().toLowerCase();
      const strB = valB.toString().toLowerCase();
      
      if (strA < strB) return sortOrder === 'asc' ? -1 : 1;
      if (strA > strB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sortedData;
  }, [allEntries, sortField, sortOrder]);

  const handleSave = async () => {
    if (!editingEntry?.scp_designation) return;
    
    try {
      setLoading(true);
      
      let entryToSave = { ...editingEntry };
      
      entryToSave.image_urls = entryToSave.image_urls || [];
      entryToSave.image_sources = entryToSave.image_sources || [];
      entryToSave.audio_urls = entryToSave.audio_urls || [];
      entryToSave.audio_sources = entryToSave.audio_sources || [];
      entryToSave.video_urls = entryToSave.video_urls || [];
      entryToSave.video_sources = entryToSave.video_sources || [];
      
      // Removed queue logic - all uploads are now handled immediately via handleMediaArchiveUpload

      await upsertMutation.mutateAsync(entryToSave);
      setEditingEntry(null);
      onDataChange?.();
      alert('Entry committed to Foundation Database.');
    } catch (err: any) {
      console.error('Error saving entry:', err);
      alert(`Failed to save entry: ${err.message || 'Internal database error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaArchiveUpload = async (file: File, type: 'image' | 'audio', primaryField?: keyof SCPEntry) => {
    try {
      setIsUploading(true);
      setUploadingType(primaryField ? `primary-${String(primaryField)}` : `extended-${type}`);
      const bucket = type === 'image' ? 'scp-images' : 'scp-audio';
      
      const url = await scpService.uploadFile(file, bucket);
      
      if (editingEntry) {
        if (primaryField) {
          setEditingEntry({
            ...editingEntry,
            [primaryField]: url
          });
        } else {
          const field = type === 'image' ? 'image_urls' : 'audio_urls';
          const sourceField = type === 'image' ? 'image_sources' : 'audio_sources';
          const currentUrls = editingEntry[field] || [];
          const currentSources = editingEntry[sourceField] || [];
          setEditingEntry({
            ...editingEntry,
            [field]: [...currentUrls, url],
            [sourceField]: [...currentSources, '']
          });
        }
      }
    } catch (err: any) {
      console.error('Media archive upload failed:', err);
      alert(`Upload Failed: ${err.message}`);
    } finally {
      setIsUploading(false);
      setUploadingType(null);
    }
  };

  const handleDelete = async (id: string, designation?: string) => {
    if (!id && !designation) {
      alert('Error: No identifier (ID or Designation) found for deletion.');
      return;
    }

    const entryToDelete = entries.find(e => e.id === id || e.scp_designation === designation);
    if (!entryToDelete) {
      console.error('Entry not found in local state:', { id, designation, entriesCount: entries.length });
      alert('Error: Entry not found in local state. Please refresh the page.');
      return;
    }

    // Instead of confirm(), we set the state to show our custom modal
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    
    const entryToDelete = entries.find(e => e.id === deleteConfirmId);
    if (!entryToDelete) {
      setDeleteConfirmId(null);
      return;
    }

    try {
      setLoading(true);
      
      // 1. Delete media from storage first
      if (entryToDelete.scp_image_url) {
        await scpService.deleteFile(entryToDelete.scp_image_url, 'scp-images');
      }
      if (entryToDelete.scp_image2_url) {
        await scpService.deleteFile(entryToDelete.scp_image2_url, 'scp-images');
      }
      if (entryToDelete.scp_audio_url) {
        await scpService.deleteFile(entryToDelete.scp_audio_url, 'scp-audio');
      }

      // 2. Delete from database
      await deleteMutation.mutateAsync(entryToDelete.id);
      
      onDataChange?.();
      setDeleteConfirmId(null);
      alert('Entry and all associated media deleted successfully.');
    } catch (err: any) {
      console.error('Error deleting entry:', err);
      alert(`Delete failed: ${err.message || 'An internal error occurred or permissions were denied.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewClick = (entry: SCPEntry) => {
    if (!entry) {
      alert('Error: No entry data to preview.');
      return;
    }
    if (!entry.id) {
      alert('Warning: Entry has no ID. Preview might be unstable.');
    }
    onPreview(entry);
  };

  const toggleSort = (field: keyof SCPEntry) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const ListInput = ({ 
    label, 
    items, 
    sources,
    onUpdate,
    placeholder, 
    icon: Icon,
    onFileUpload,
    isUploading = false
  }: { 
    label: string; 
    items: string[] | null | undefined; 
    sources?: string[] | null | undefined;
    onUpdate: (items: string[], sources: string[]) => void; 
    placeholder: string;
    icon?: any;
    onFileUpload?: (file: File) => void;
    isUploading?: boolean;
  }) => {
    const [newUrl, setNewUrl] = useState('');
    const currentItems = items || [];
    const currentSources = sources || [];

    const addItem = () => {
      if (newUrl.trim()) {
        const nextItems = [...currentItems, newUrl.trim()];
        const nextSources = [...currentSources, ''];
        onUpdate(nextItems, nextSources);
        setNewUrl('');
      }
    };

    const removeItem = (index: number) => {
      const nextItems = currentItems.filter((_, i) => i !== index);
      const nextSources = currentSources.filter((_, i) => i !== index);
      onUpdate(nextItems, nextSources);
    };

    const updateSource = (index: number, source: string) => {
      const nextSources = [...currentSources];
      // Ensure array is long enough
      while (nextSources.length < currentItems.length) {
        nextSources.push('');
      }
      nextSources[index] = source;
      onUpdate(currentItems, nextSources);
    };

    return (
      <div className="space-y-3 p-4 bg-white/5 border border-foundation-border rounded">
        <label className="text-[10px] font-mono text-foundation-muted uppercase flex items-center gap-2">
          {Icon && <Icon className="w-3 h-3" />} {label}
        </label>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input 
              type="text"
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem())}
              placeholder={placeholder}
              className="flex-1 bg-black border border-foundation-border rounded px-3 py-2 text-xs font-mono"
            />
            <button 
              type="button"
              onClick={addItem}
              className="px-4 py-2 bg-foundation-accent text-white text-[10px] font-mono uppercase rounded hover:bg-foundation-accent/80 transition-all"
            >
              Add
            </button>
          </div>
          
          {onFileUpload && (
            <div className="relative">
              <input 
                type="file"
                onChange={e => e.target.files?.[0] && onFileUpload(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                accept={label.includes('Image') ? 'image/*' : 'audio/*'}
                disabled={isUploading}
              />
              <div className={`w-full py-2 border border-dashed border-foundation-border rounded flex items-center justify-center gap-2 text-[9px] font-mono text-foundation-muted hover:text-foundation-accent transition-colors ${isUploading ? 'opacity-50' : ''}`}>
                <Upload className="w-3 h-3" /> {isUploading ? 'Uploading...' : `Upload ${label.includes('Image') ? 'Image' : 'Audio'}`}
              </div>
            </div>
          )}
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
          {currentItems.map((url, i) => (
            <div key={i} className="space-y-1 p-2 bg-black/40 border border-white/5 rounded">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="truncate flex-1 mr-4">{url}</span>
                <button 
                  type="button"
                  onClick={() => removeItem(i)}
                  className="text-red-500 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              {onUpdate && (
                <input 
                  type="text"
                  placeholder="Source/Credit"
                  value={currentSources[i] || ''}
                  onChange={e => updateSource(i, e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-[8px] font-mono text-foundation-muted focus:text-white transition-colors"
                />
              )}
            </div>
          ))}
          {currentItems.length === 0 && (
            <p className="text-[8px] font-mono text-foundation-muted italic uppercase">No additional {label.toLowerCase()} linked.</p>
          )}
        </div>
      </div>
    );
  };

  const SortIcon = ({ field }: { field: keyof SCPEntry }) => {
    const isActive = sortField === field;
    return (
      <div className="flex flex-col -space-y-1 ml-1">
        <ChevronUp className={`w-2.5 h-2.5 ${isActive && sortOrder === 'asc' ? 'text-foundation-accent' : 'text-foundation-muted opacity-30'}`} />
        <ChevronDown className={`w-2.5 h-2.5 ${isActive && sortOrder === 'desc' ? 'text-foundation-accent' : 'text-foundation-muted opacity-30'}`} />
      </div>
    );
  };

  const ImageWithBlur = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    return (
      <div className="relative w-full h-full">
        {!isLoaded && (
          <div className="absolute inset-0 bg-white/5 animate-pulse flex items-center justify-center">
            <div className="w-4 h-4 border border-foundation-muted/30 rounded-full animate-spin border-t-foundation-accent" />
          </div>
        )}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={`${className} transition-all duration-700 ${isLoaded ? 'blur-0 opacity-100' : 'blur-sm opacity-0'}`}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  };

  const filteredEntries = entries.filter(e => 
    e.scp_designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.code_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if ((isFetching || loading) && entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-8 h-8 text-foundation-accent animate-spin" />
        <p className="text-[10px] font-mono text-foundation-muted uppercase tracking-widest">Synchronizing Terminal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black terminal-text uppercase tracking-tighter">Admin Terminal</h2>
          <div className="flex items-center gap-2">
            <p className="text-xs text-foundation-muted font-mono uppercase">Database Management Protocol Active</p>
            {user && (
              <span className="text-[8px] font-mono text-foundation-terminal bg-foundation-terminal/10 px-2 py-0.5 rounded border border-foundation-terminal/20">
                USER: {user.email}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setEditingEntry({
              scp_designation: 'SCP-',
              code_name: '',
              description: '',
              ontological_category: '',
              morphology: '',
              object_containment_class: 'Safe',
              disruption_class: 'Dark',
              risk_class: 'Notice',
              rating: 0,
              sapience_level: '',
              security_clearance_level: '1',
              emotional_tone: '',
              year_discovered: '',
              date_discovered: '',
              country_of_discovery: '',
              city_location_details: '',
              discovery_details: '',
              discovery_method: '',
              origin_type: '',
              origin_detail: '',
              historical_real_world_associations: '',
              original_scp_article_author: '',
              special_containment_protocol: '',
              containment_facility: '',
              containment_facility_type: '',
              containment_status: 'Contained',
              challenges_to_containment_detail: '',
              challenges_to_containment_type: '',
              termination_attempts: '',
              trigger_detail: '',
              normal_behaviour_type: '',
              normal_behaviour_detail: '',
              triggered_behaviour_type: '',
              triggered_behaviour_detail: '',
              respective_department: '',
              involved_doctors: '',
              involved_researchers: '',
              involved_agents: '',
              involved_directors: '',
              other_involved_staff: '',
              involved_mobile_task_force: '',
              involved_mobile_task_force_codename: '',
              related_groups: '',
              o5_or_administrator_involvement: '',
              anomaly_type: '',
              affected_natural_laws: '',
              anomalous_effects: '',
              anomalous_effects_types: '',
              anomalous_secondary_manifestations: '',
              interaction_type: '',
              ability_types: '',
              ability_details: '',
              spread_mechanism: '',
              weaknesses: '',
              resistances: '',
              physical_attributes: '',
              psychological_traits: '',
              speed_of_pursuit: '',
              time_till_effect: '',
              range_of_effects: '',
              fatality_rate: '',
              casualty_records: '',
              related_k_class_scenarios: '',
              related_scps: '',
              locations_of_interest: '',
              locations_of_interest_types: '',
              persons_of_interest: '',
              groups_of_interest: '',
              experiment_logs: '',
              exploration_logs: '',
              incident_reports: '',
              interviews: '',
              witness_disposition_records: '',
              associated_artifacts: '',
              associated_documents: '',
              total_number_of_anomalous_entities: '1',
              anomalies_spawned: '',
              image_source: '',
              image2_source: '',
              audio_source: '',
              official_cover_story: '',
              tag_list: '',
              image_urls: [],
              audio_urls: [],
              video_urls: []
            })}
            className="flex items-center gap-2 px-4 py-2 bg-foundation-accent text-white text-[10px] font-mono uppercase tracking-widest rounded-sm hover:bg-foundation-accent/80 transition-all"
          >
            <Plus className="w-4 h-4" /> New Entry
          </button>
        </div>
      </div>

      <AnimatePresence>
        {editingEntry && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass-panel border-foundation-accent/30 max-h-[85vh] flex flex-col overflow-hidden"
          >
            {/* Sticky Header */}
            <div className="flex justify-between items-center border-b border-white/10 p-6 bg-black/60 backdrop-blur-xl z-20 shrink-0">
              <h3 className="text-xl font-bold terminal-text uppercase">
                {editingEntry.id ? 'Edit Entry' : 'Create New Entry'}
              </h3>
              <button onClick={() => setEditingEntry(null)} className="text-foundation-muted hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">

            {/* Section 1: Core Identification */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono text-foundation-accent uppercase border-b border-foundation-accent/20 pb-1">Core Identification</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Designation</label>
                  <input 
                    value={editingEntry.scp_designation || ''}
                    onChange={e => setEditingEntry({...editingEntry, scp_designation: e.target.value})}
                    className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                    placeholder="SCP-XXX"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Code Name</label>
                  <input 
                    value={editingEntry.code_name || ''}
                    onChange={e => setEditingEntry({...editingEntry, code_name: e.target.value})}
                    className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Clearance Level</label>
                  <select 
                    value={editingEntry.security_clearance_level || ''}
                    onChange={e => setEditingEntry({...editingEntry, security_clearance_level: e.target.value})}
                    className="w-full bg-black border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  >
                    <option value="Level 1 – UR">Level 1 – UR</option>
                    <option value="Level 2 – RS">Level 2 – RS</option>
                    <option value="Level 3 – CF">Level 3 – CF</option>
                    <option value="Level 4 – SC">Level 4 – SC</option>
                    <option value="Level 5 – TS">Level 5 – TS</option>
                    <option value="Level 6 – CTS">Level 6 – CTS</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Rating</label>
                  <input 
                    type="number"
                    value={editingEntry.rating || 0}
                    onChange={e => setEditingEntry({...editingEntry, rating: parseInt(e.target.value) || 0})}
                    className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Classification */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono text-foundation-accent uppercase border-b border-foundation-accent/20 pb-1">Classification</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Containment Class</label>
                  <select 
                    value={editingEntry.object_containment_class || ''}
                    onChange={e => setEditingEntry({...editingEntry, object_containment_class: e.target.value})}
                    className="w-full bg-black border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  >
                    <option>Safe</option>
                    <option>Euclid</option>
                    <option>Keter</option>
                    <option>Thaumiel</option>
                    <option>Apollyon</option>
                    <option>Archon</option>
                    <option>Cernunnos</option>
                    <option>Ticonderoga</option>
                    <option>Explained</option>
                    <option>Neutralized</option>
                    <option>Decommissioned</option>
                    <option>Pending</option>
                    <option>Uncontained</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Disruption Class</label>
                  <select 
                    value={editingEntry.disruption_class || ''}
                    onChange={e => setEditingEntry({...editingEntry, disruption_class: e.target.value})}
                    className="w-full bg-black border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  >
                    <option>Dark – Class 3</option>
                    <option>Vlam – Class 4</option>
                    <option>Keneq – Class 5</option>
                    <option>Ekhi – Class 6</option>
                    <option>Amida – Class 7</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Risk Class</label>
                  <select 
                    value={editingEntry.risk_class || ''}
                    onChange={e => setEditingEntry({...editingEntry, risk_class: e.target.value})}
                    className="w-full bg-black border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  >
                    <option>Notice</option>
                    <option>Caution</option>
                    <option>Warning</option>
                    <option>Danger</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Ontological Category</label>
                  <select 
                    value={editingEntry.ontological_category || ''}
                    onChange={e => setEditingEntry({...editingEntry, ontological_category: e.target.value})}
                    className="w-full bg-black border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  >
                    <option value="">Select Category</option>
                    <option>Entity (living being)</option>
                    <option>Object / Artifact</option>
                    <option>Location / Structure</option>
                    <option>Phenomenon</option>
                    <option>Event</option>
                    <option>Concept / Abstract</option>
                    <option>Collective / System</option>
                    <option>Digital</option>
                    <option>Pathogen</option>
                    <option>Record</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Morphology</label>
                  <input 
                    value={editingEntry.morphology || ''}
                    onChange={e => setEditingEntry({...editingEntry, morphology: e.target.value})}
                    className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Anomaly Type</label>
                  <select 
                    value={editingEntry.anomaly_type || ''}
                    onChange={e => setEditingEntry({...editingEntry, anomaly_type: e.target.value})}
                    className="w-full bg-black border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  >
                    <option value="">Select Type</option>
                    <option>biological</option>
                    <option>mechanical_technological</option>
                    <option>chemical</option>
                    <option>memetic</option>
                    <option>antimemetic</option>
                    <option>cognitohazard</option>
                    <option>infohazard</option>
                    <option>temporal</option>
                    <option>spatial</option>
                    <option>reality_bending</option>
                    <option>probability_causality</option>
                    <option>narrative_meta</option>
                    <option>thaumaturgic_occult</option>
                    <option>psionic</option>
                    <option>dimensional_extradimensional</option>
                    <option>mathematical</option>
                    <option>transmutative</option>
                    <option>energetic</option>
                    <option>existential</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Sapience Level</label>
                  <select 
                    value={editingEntry.sapience_level || ''}
                    onChange={e => setEditingEntry({...editingEntry, sapience_level: e.target.value})}
                    className="w-full bg-black border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  >
                    <option value="">Select Level</option>
                    <option>non_sapient</option>
                    <option>animal_level</option>
                    <option>semi_sapient</option>
                    <option>emulated_personality</option>
                    <option>alien_logic</option>
                    <option>sapient</option>
                    <option>superintelligent</option>
                    <option>collective_hive_mind</option>
                    <option>autonomous</option>
                    <option>predictive_prescient</option>
                    <option>reactive_only</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Emotional Tone</label>
                  <select 
                    value={editingEntry.emotional_tone || ''}
                    onChange={e => setEditingEntry({...editingEntry, emotional_tone: e.target.value})}
                    className="w-full bg-black border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  >
                    <option value="">Select Tone</option>
                    <option>terrifying</option>
                    <option>eerie</option>
                    <option>awe_inspiring</option>
                    <option>humorous</option>
                    <option>tragic</option>
                    <option>wholesome</option>
                    <option>gross</option>
                    <option>confusing</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Discovery & Origin */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono text-foundation-accent uppercase border-b border-foundation-accent/20 pb-1">Discovery & Origin</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Year Discovered</label>
                  <input 
                    value={editingEntry.year_discovered || ''}
                    onChange={e => setEditingEntry({...editingEntry, year_discovered: e.target.value})}
                    className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Date Discovered</label>
                  <input 
                    value={editingEntry.date_discovered || ''}
                    onChange={e => setEditingEntry({...editingEntry, date_discovered: e.target.value})}
                    className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Country</label>
                  <input 
                    value={editingEntry.country_of_discovery || ''}
                    onChange={e => setEditingEntry({...editingEntry, country_of_discovery: e.target.value})}
                    className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Discovery Method</label>
                  <select 
                    value={editingEntry.discovery_method || ''}
                    onChange={e => setEditingEntry({...editingEntry, discovery_method: e.target.value})}
                    className="w-full bg-black border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  >
                    <option value="">Select Method</option>
                    <option>civilian_incident</option>
                    <option>law_enforcement_or_military</option>
                    <option>intelligence_agency_transfer</option>
                    <option>scientific_or_academic_research</option>
                    <option>medical_or_public_health_case</option>
                    <option>archaeological_or_historical_find</option>
                    <option>field_exploration</option>
                    <option>anomalous_event_or_disaster</option>
                    <option>information_leak_or_media</option>
                    <option>digital_or_network_monitoring</option>
                    <option>remote_sensing_or_surveillance</option>
                    <option>internal_foundation_activity</option>
                    <option>cross_scp_interaction</option>
                    <option>temporal_or_dimensional_event</option>
                    <option>memetic_or_infohazard_outbreak</option>
                    <option>unknown_or_classified</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Origin Type</label>
                  <select 
                    value={editingEntry.origin_type || ''}
                    onChange={e => setEditingEntry({...editingEntry, origin_type: e.target.value})}
                    className="w-full bg-black border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  >
                    <option value="">Select Type</option>
                    <option>natural_anomaly</option>
                    <option>human_made</option>
                    <option>engineered_or_experimental</option>
                    <option>thaumaturgic_or_ritual</option>
                    <option>foundation_created_or_modified</option>
                    <option>extraterrestrial_or_nonhuman</option>
                    <option>extradimensional_or_interdimensional</option>
                    <option>temporal_or_future_origin</option>
                    <option>archaeological_or_ancient</option>
                    <option>AI_or_conceptual_emergence</option>
                    <option>unknown_or_conflicted</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Author</label>
                  <input 
                    value={editingEntry.original_scp_article_author || ''}
                    onChange={e => setEditingEntry({...editingEntry, original_scp_article_author: e.target.value})}
                    className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-foundation-muted uppercase">Origin Detail</label>
                <textarea 
                  value={editingEntry.origin_detail || ''}
                  onChange={e => setEditingEntry({...editingEntry, origin_detail: e.target.value})}
                  className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono h-20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-foundation-muted uppercase">Discovery Details</label>
                <textarea 
                  value={editingEntry.discovery_details || ''}
                  onChange={e => setEditingEntry({...editingEntry, discovery_details: e.target.value})}
                  className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono h-20"
                />
              </div>
            </div>

            {/* Section 4: Containment Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono text-foundation-accent uppercase border-b border-foundation-accent/20 pb-1">Containment Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Facility</label>
                  <input 
                    value={editingEntry.containment_facility || ''}
                    onChange={e => setEditingEntry({...editingEntry, containment_facility: e.target.value})}
                    className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Facility Type</label>
                  <select 
                    value={editingEntry.containment_facility_type || ''}
                    onChange={e => setEditingEntry({...editingEntry, containment_facility_type: e.target.value})}
                    className="w-full bg-black border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  >
                    <option value="">Select Type</option>
                    <option>armed</option>
                    <option>biological</option>
                    <option>containment</option>
                    <option>dimensional</option>
                    <option>humanoid</option>
                    <option>exclusionary</option>
                    <option>extrasolar</option>
                    <option>lunar</option>
                    <option>protected</option>
                    <option>provisional</option>
                    <option>reliquary</option>
                    <option>research</option>
                    <option>storage</option>
                    <option>surveillance</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Status</label>
                  <select 
                    value={editingEntry.containment_status || ''}
                    onChange={e => setEditingEntry({...editingEntry, containment_status: e.target.value})}
                    className="w-full bg-black border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  >
                    <option>active</option>
                    <option>contained</option>
                    <option>breached</option>
                    <option>neutralized</option>
                    <option>terminated</option>
                    <option>pending_classification</option>
                    <option>explained_decommissioned</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Department</label>
                  <select 
                    value={editingEntry.respective_department || ''}
                    onChange={e => setEditingEntry({...editingEntry, respective_department: e.target.value})}
                    className="w-full bg-black border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  >
                    <option value="">Select Department</option>
                    <option>scientific_department</option>
                    <option>mobile_task_forces</option>
                    <option>security_department</option>
                    <option>medical_department</option>
                    <option>engineering_technical_service</option>
                    <option>ethics_committee</option>
                    <option>internal_security_department</option>
                    <option>raisa</option>
                    <option>antimemetics_division</option>
                    <option>pataphysics_department</option>
                    <option>aiad</option>
                    <option>temporal_anomalies_department</option>
                    <option>tactical_theology</option>
                    <option>excursionary_department</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-foundation-muted uppercase">Special Containment Protocol</label>
                <textarea 
                  value={editingEntry.special_containment_protocol || ''}
                  onChange={e => setEditingEntry({...editingEntry, special_containment_protocol: e.target.value})}
                  className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono h-24"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Challenge Type</label>
                  <select 
                    value={editingEntry.challenges_to_containment_type || ''}
                    onChange={e => setEditingEntry({...editingEntry, challenges_to_containment_type: e.target.value})}
                    className="w-full bg-black border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  >
                    <option value="">Select Type</option>
                    <option>physical_threat</option>
                    <option>regenerative_or_adaptive</option>
                    <option>self_replication_or_spread</option>
                    <option>mobility_or_escape</option>
                    <option>information_hazard</option>
                    <option>psychological_or_cognitive_hazard</option>
                    <option>reality_or_causality_instability</option>
                    <option>non_physical_or_abstract</option>
                    <option>inherently_uncontainable</option>
                    <option>ethical_or_human_constraints</option>
                    <option>resource_intensity</option>
                    <option>unknown_variables</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Challenges Detail</label>
                  <input 
                    value={editingEntry.challenges_to_containment_detail || ''}
                    onChange={e => setEditingEntry({...editingEntry, challenges_to_containment_detail: e.target.value})}
                    className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Personnel & Groups */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono text-foundation-accent uppercase border-b border-foundation-accent/20 pb-1">Personnel & Groups</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Doctors</label>
                  <input 
                    value={editingEntry.involved_doctors || ''}
                    onChange={e => setEditingEntry({...editingEntry, involved_doctors: e.target.value})}
                    className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Researchers</label>
                  <input 
                    value={editingEntry.involved_researchers || ''}
                    onChange={e => setEditingEntry({...editingEntry, involved_researchers: e.target.value})}
                    className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Agents</label>
                  <input 
                    value={editingEntry.involved_agents || ''}
                    onChange={e => setEditingEntry({...editingEntry, involved_agents: e.target.value})}
                    className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">MTF</label>
                  <input 
                    value={editingEntry.involved_mobile_task_force || ''}
                    onChange={e => setEditingEntry({...editingEntry, involved_mobile_task_force: e.target.value})}
                    className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">MTF Codename</label>
                  <input 
                    value={editingEntry.involved_mobile_task_force_codename || ''}
                    onChange={e => setEditingEntry({...editingEntry, involved_mobile_task_force_codename: e.target.value})}
                    className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Related Groups</label>
                  <input 
                    value={editingEntry.related_groups || ''}
                    onChange={e => setEditingEntry({...editingEntry, related_groups: e.target.value})}
                    className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">O5 Involvement</label>
                  <input 
                    value={editingEntry.o5_or_administrator_involvement || ''}
                    onChange={e => setEditingEntry({...editingEntry, o5_or_administrator_involvement: e.target.value})}
                    className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section 6: Anomalous Properties */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono text-foundation-accent uppercase border-b border-foundation-accent/20 pb-1">Anomalous Properties</h4>
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-foundation-muted uppercase">Description</label>
                <textarea 
                  value={editingEntry.description || ''}
                  onChange={e => setEditingEntry({...editingEntry, description: e.target.value})}
                  className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-serif h-32"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-foundation-muted uppercase">Anomalous Effects</label>
                <textarea 
                  value={editingEntry.anomalous_effects || ''}
                  onChange={e => setEditingEntry({...editingEntry, anomalous_effects: e.target.value})}
                  className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono h-24"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Anomalous Effects Types</label>
                  <input 
                    value={editingEntry.anomalous_effects_types || ''}
                    onChange={e => setEditingEntry({...editingEntry, anomalous_effects_types: e.target.value})}
                    className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Ability Types</label>
                  <input 
                    value={editingEntry.ability_types || ''}
                    onChange={e => setEditingEntry({...editingEntry, ability_types: e.target.value})}
                    className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Ability Details</label>
                  <input 
                    value={editingEntry.ability_details || ''}
                    onChange={e => setEditingEntry({...editingEntry, ability_details: e.target.value})}
                    className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Weaknesses</label>
                  <input 
                    value={editingEntry.weaknesses || ''}
                    onChange={e => setEditingEntry({...editingEntry, weaknesses: e.target.value})}
                    className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Spread Mechanism</label>
                  <select 
                    value={editingEntry.spread_mechanism || ''}
                    onChange={e => setEditingEntry({...editingEntry, spread_mechanism: e.target.value})}
                    className="w-full bg-black border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  >
                    <option value="">Select Mechanism</option>
                    <option>none</option>
                    <option>biological_infection</option>
                    <option>memetic_transmission</option>
                    <option>technological_replication</option>
                    <option>environmental_contamination</option>
                    <option>self_replication</option>
                    <option>assimilation</option>
                    <option>infohazardous</option>
                    <option>human_mediated</option>
                    <option>conceptual_spread</option>
                    <option>spatio_temporal_expansion</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Interaction Type</label>
                  <select 
                    value={editingEntry.interaction_type || ''}
                    onChange={e => setEditingEntry({...editingEntry, interaction_type: e.target.value})}
                    className="w-full bg-black border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  >
                    <option value="">Select Type</option>
                    <option>visual</option>
                    <option>auditory</option>
                    <option>tactile</option>
                    <option>olfactory</option>
                    <option>gustatory</option>
                    <option>ingestion</option>
                    <option>respiration</option>
                    <option>telepathic</option>
                    <option>linguistic</option>
                    <option>symbolic</option>
                    <option>subconscious</option>
                    <option>cognitive_knowledge_based</option>
                    <option>emotional_psychological</option>
                    <option>proximity_based</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 7: Behavior & Effects */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono text-foundation-accent uppercase border-b border-foundation-accent/20 pb-1">Behavior & Effects</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Trigger Detail</label>
                  <input 
                    value={editingEntry.trigger_detail || ''}
                    onChange={e => setEditingEntry({...editingEntry, trigger_detail: e.target.value})}
                    className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Fatality Rate</label>
                  <input 
                    value={editingEntry.fatality_rate || ''}
                    onChange={e => setEditingEntry({...editingEntry, fatality_rate: e.target.value})}
                    className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Range</label>
                  <input 
                    value={editingEntry.range_of_effects || ''}
                    onChange={e => setEditingEntry({...editingEntry, range_of_effects: e.target.value})}
                    className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Normal Behaviour Type</label>
                  <select 
                    value={editingEntry.normal_behaviour_type || ''}
                    onChange={e => setEditingEntry({...editingEntry, normal_behaviour_type: e.target.value})}
                    className="w-full bg-black border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  >
                    <option value="">Select Type</option>
                    <option>passive</option>
                    <option>conditional_aggression</option>
                    <option>always_hostile</option>
                    <option>predatory</option>
                    <option>defensive</option>
                    <option>ritual_dependent</option>
                    <option>cyclical_periodic</option>
                    <option>escalatory</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Triggered Behaviour Type</label>
                  <select 
                    value={editingEntry.triggered_behaviour_type || ''}
                    onChange={e => setEditingEntry({...editingEntry, triggered_behaviour_type: e.target.value})}
                    className="w-full bg-black border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  >
                    <option value="">Select Type</option>
                    <option>passive</option>
                    <option>conditional_aggression</option>
                    <option>always_hostile</option>
                    <option>predatory</option>
                    <option>defensive</option>
                    <option>ritual_dependent</option>
                    <option>cyclical_periodic</option>
                    <option>escalatory</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-foundation-muted uppercase">Normal Behaviour Detail</label>
                <textarea 
                  value={editingEntry.normal_behaviour_detail || ''}
                  onChange={e => setEditingEntry({...editingEntry, normal_behaviour_detail: e.target.value})}
                  className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono h-20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-foundation-muted uppercase">Triggered Behaviour Detail</label>
                <textarea 
                  value={editingEntry.triggered_behaviour_detail || ''}
                  onChange={e => setEditingEntry({...editingEntry, triggered_behaviour_detail: e.target.value})}
                  className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono h-20"
                />
              </div>
            </div>

            {/* Section 8: Logs & Reports */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono text-foundation-accent uppercase border-b border-foundation-accent/20 pb-1">Logs & Reports</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Incident Reports</label>
                  <textarea 
                    value={editingEntry.incident_reports || ''}
                    onChange={e => setEditingEntry({...editingEntry, incident_reports: e.target.value})}
                    className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono h-20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Interviews</label>
                  <textarea 
                    value={editingEntry.interviews || ''}
                    onChange={e => setEditingEntry({...editingEntry, interviews: e.target.value})}
                    className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono h-20"
                  />
                </div>
              </div>
            </div>

            {/* Section 9: Related Data & Classification */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono text-foundation-accent uppercase border-b border-foundation-accent/20 pb-1">Related Data & Classification</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Related SCPs</label>
                  <input 
                    value={editingEntry.related_scps || ''}
                    onChange={e => setEditingEntry({...editingEntry, related_scps: e.target.value})}
                    className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                    placeholder="SCP-XXX, SCP-YYY"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Time Till Effect</label>
                  <input 
                    value={editingEntry.time_till_effect || ''}
                    onChange={e => setEditingEntry({...editingEntry, time_till_effect: e.target.value})}
                    className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Classification Tags</label>
                  <input 
                    value={editingEntry.tag_list || ''}
                    onChange={e => setEditingEntry({...editingEntry, tag_list: e.target.value})}
                    placeholder="tag1, tag2, tag3"
                    className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase">Official Cover Story</label>
                  <input 
                    value={editingEntry.official_cover_story || ''}
                    onChange={e => setEditingEntry({...editingEntry, official_cover_story: e.target.value})}
                    placeholder="Standard cover story for redacted data..."
                    className="w-full bg-white/5 border border-foundation-border rounded px-3 py-2 text-xs font-mono italic"
                  />
                </div>
              </div>
            </div>

            {/* Section 10: Media Archive & Surveillance */}
            <div className="space-y-6">
              <h4 className="text-xs font-mono text-foundation-accent uppercase border-b border-foundation-accent/20 pb-1">Media Archive & Surveillance</h4>
              
              {/* Primary Assets Subsection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Primary Image */}
                <div className="space-y-3 p-4 bg-white/5 border border-foundation-border rounded group relative">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase flex items-center gap-2">
                    <ImageIcon className="w-3 h-3" /> Featured Image (Visual-01)
                  </label>
                  <div className="aspect-video bg-black rounded overflow-hidden relative border border-white/5">
                    {editingEntry.scp_image_url ? (
                      <>
                        <ImageWithBlur src={editingEntry.scp_image_url} className="w-full h-full object-cover" alt="Primary" />
                        <button 
                          onClick={() => setEditingEntry({...editingEntry, scp_image_url: ''})}
                          className="absolute top-2 right-2 p-1.5 bg-black/80 rounded hover:bg-red-500 transition-colors z-10"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-foundation-muted">
                        <Camera className="w-6 h-6 opacity-20" />
                        <span className="text-[8px] font-mono uppercase">No Primary Feed</span>
                      </div>
                    )}
                    {isUploading && uploadingType === 'primary-scp_image_url' && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-foundation-accent border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={editingEntry.scp_image_url || ''}
                        onChange={e => setEditingEntry({...editingEntry, scp_image_url: e.target.value})}
                        placeholder="Direct URL..."
                        className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-[9px] font-mono"
                      />
                      <input 
                        type="file" 
                        id="primary-upload" 
                        hidden 
                        accept="image/*"
                        onChange={e => e.target.files?.[0] && handleMediaArchiveUpload(e.target.files[0], 'image', 'scp_image_url')} 
                      />
                      <button 
                        onClick={() => document.getElementById('primary-upload')?.click()}
                        className="p-1 px-2 border border-foundation-accent/30 text-foundation-accent hover:bg-foundation-accent/10 rounded"
                      >
                        <Upload className="w-3 h-3" />
                      </button>
                    </div>
                    <input 
                      value={editingEntry.image_source || ''}
                      onChange={e => setEditingEntry({...editingEntry, image_source: e.target.value})}
                      placeholder="IMAGE SOURCE / CREDITS"
                      className="w-full bg-transparent border-b border-white/5 px-1 py-1 text-[8px] font-mono text-foundation-muted focus:text-white"
                    />
                  </div>
                </div>

                {/* Secondary Image */}
                <div className="space-y-3 p-4 bg-white/5 border border-foundation-border rounded group relative">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase flex items-center gap-2">
                    <ImageIcon className="w-3 h-3" /> Supporting Visual (Visual-02)
                  </label>
                  <div className="aspect-video bg-black rounded overflow-hidden relative border border-white/5">
                    {editingEntry.scp_image2_url ? (
                      <>
                        <ImageWithBlur src={editingEntry.scp_image2_url} className="w-full h-full object-cover" alt="Secondary" />
                        <button 
                          onClick={() => setEditingEntry({...editingEntry, scp_image2_url: ''})}
                          className="absolute top-2 right-2 p-1.5 bg-black/80 rounded hover:bg-red-500 transition-colors z-10"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-foundation-muted">
                        <Camera className="w-6 h-6 opacity-20" />
                        <span className="text-[8px] font-mono uppercase">No Secondary Feed</span>
                      </div>
                    )}
                    {isUploading && uploadingType === 'primary-scp_image2_url' && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-foundation-accent border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={editingEntry.scp_image2_url || ''}
                        onChange={e => setEditingEntry({...editingEntry, scp_image2_url: e.target.value})}
                        placeholder="Direct URL..."
                        className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-[9px] font-mono"
                      />
                      <input 
                        type="file" 
                        id="secondary-upload" 
                        hidden 
                        accept="image/*"
                        onChange={e => e.target.files?.[0] && handleMediaArchiveUpload(e.target.files[0], 'image', 'scp_image2_url')} 
                      />
                      <button 
                        onClick={() => document.getElementById('secondary-upload')?.click()}
                        className="p-1 px-2 border border-foundation-accent/30 text-foundation-accent hover:bg-foundation-accent/10 rounded"
                      >
                        <Upload className="w-3 h-3" />
                      </button>
                    </div>
                    <input 
                      value={editingEntry.image2_source || ''}
                      onChange={e => setEditingEntry({...editingEntry, image2_source: e.target.value})}
                      placeholder="IMAGE SOURCE / CREDITS"
                      className="w-full bg-transparent border-b border-white/5 px-1 py-1 text-[8px] font-mono text-foundation-muted focus:text-white"
                    />
                  </div>
                </div>

                {/* Main Audio */}
                <div className="space-y-3 p-4 bg-white/5 border border-foundation-border rounded group relative">
                  <label className="text-[10px] font-mono text-foundation-muted uppercase flex items-center gap-2">
                    <Music className="w-3 h-3" /> Primary Audio Log (Audio-01)
                  </label>
                  <div className="aspect-video bg-black rounded overflow-hidden relative border border-white/5 flex flex-col items-center justify-center p-4">
                    {editingEntry.scp_audio_url ? (
                      <div className="w-full space-y-2">
                        <Music className="w-8 h-8 text-foundation-terminal animate-pulse mx-auto" />
                        <audio 
                          key={editingEntry.scp_audio_url}
                          src={editingEntry.scp_audio_url} 
                          controls 
                          className="w-full h-8 accent-foundation-terminal foundation-audio" 
                        />
                        <button 
                          onClick={() => setEditingEntry({...editingEntry, scp_audio_url: ''})}
                          className="absolute top-2 right-2 p-1.5 bg-black/80 rounded hover:bg-red-500 transition-colors z-10"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-foundation-muted">
                        <Music className="w-6 h-6 opacity-20" />
                        <span className="text-[8px] font-mono uppercase">No Audio Feed</span>
                      </div>
                    )}
                    {isUploading && uploadingType === 'primary-scp_audio_url' && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-foundation-terminal border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={editingEntry.scp_audio_url || ''}
                        onChange={e => setEditingEntry({...editingEntry, scp_audio_url: e.target.value})}
                        placeholder="Direct URL..."
                        className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-[9px] font-mono"
                      />
                      <input 
                        type="file" 
                        id="audio-upload" 
                        hidden 
                        accept="audio/*"
                        onChange={e => e.target.files?.[0] && handleMediaArchiveUpload(e.target.files[0], 'audio', 'scp_audio_url')} 
                      />
                      <button 
                        onClick={() => document.getElementById('audio-upload')?.click()}
                        className="p-1 px-2 border border-foundation-terminal/30 text-foundation-terminal hover:bg-foundation-terminal/10 rounded"
                      >
                        <Upload className="w-3 h-3" />
                      </button>
                    </div>
                    <input 
                      value={editingEntry.audio_source || ''}
                      onChange={e => setEditingEntry({...editingEntry, audio_source: e.target.value})}
                      placeholder="AUDIO SOURCE / LOG INFO"
                      className="w-full bg-transparent border-b border-white/5 px-1 py-1 text-[8px] font-mono text-foundation-muted focus:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Extended Library Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border-t border-white/5 pt-6">
                <ListInput 
                  label="Additional Visual Archives" 
                  items={editingEntry.image_urls} 
                  sources={editingEntry.image_sources}
                  onUpdate={(urls, sources) => setEditingEntry(prev => prev ? {...prev, image_urls: urls, image_sources: sources} : null)}
                  placeholder="https://visuals.foundation.sc..."
                  icon={ImageIcon}
                  onFileUpload={(file) => handleMediaArchiveUpload(file, 'image')}
                  isUploading={isUploading && uploadingType === 'extended-image'}
                />
                <ListInput 
                  label="Extended Audio Surveillance" 
                  items={editingEntry.audio_urls} 
                  sources={editingEntry.audio_sources}
                  onUpdate={(urls, sources) => setEditingEntry(prev => prev ? {...prev, audio_urls: urls, audio_sources: sources} : null)}
                  placeholder="https://audio.foundation.sc..."
                  icon={Music}
                  onFileUpload={(file) => handleMediaArchiveUpload(file, 'audio')}
                  isUploading={isUploading && uploadingType === 'extended-audio'}
                />
                <ListInput 
                  label="YouTube Surveillance Integrations" 
                  items={editingEntry.video_urls} 
                  sources={editingEntry.video_sources}
                  onUpdate={(urls, sources) => setEditingEntry(prev => prev ? {...prev, video_urls: urls, video_sources: sources} : null)}
                  placeholder="https://youtube.com/watch?v=..."
                  icon={ExternalLink}
                />
              </div>
            </div>

            </div>

            {/* Sticky Footer */}
            <div className="flex justify-end gap-4 p-6 border-t border-white/10 bg-black/60 backdrop-blur-xl z-20 shrink-0">
              <button 
                onClick={() => setEditingEntry(null)}
                className="px-6 py-2 border border-foundation-border text-[10px] font-mono uppercase text-foundation-muted hover:text-white transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={loading || isUploading}
                className="px-8 py-2 bg-foundation-accent text-white text-[10px] font-mono uppercase tracking-widest rounded-sm hover:bg-foundation-accent/80 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Commit to Database'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black border border-red-500/50 p-8 max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.2)]"
            >
              <div className="flex items-center gap-4 mb-6 text-red-500">
                <AlertCircle className="w-8 h-8" />
                <h3 className="text-lg font-mono uppercase tracking-widest">Critical Warning</h3>
              </div>
              <p className="text-xs font-mono text-foundation-muted leading-relaxed mb-8">
                YOU ARE ABOUT TO PERMANENTLY DELETE THIS RECORD AND ALL ASSOCIATED MEDIA FROM THE DATABASE AND STORAGE. THIS ACTION IS IRREVERSIBLE.
              </p>
              <div className="flex justify-end gap-4">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-6 py-2 border border-foundation-border text-[10px] font-mono uppercase text-foundation-muted hover:text-white transition-all"
                >
                  Abort
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={loading}
                  className="px-8 py-2 bg-red-600 text-white text-[10px] font-mono uppercase tracking-widest rounded-sm hover:bg-red-500 transition-all disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Confirm Deletion'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="glass-panel p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foundation-muted" />
            <input 
              type="text" 
              placeholder="SEARCH DATABASE..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-foundation-border rounded px-10 py-2 text-xs font-mono focus:outline-none focus:border-foundation-accent transition-colors"
            />
          </div>
          <div className="text-[10px] font-mono text-foundation-muted uppercase">
            Total Records: {entries.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[10px] font-mono text-foundation-muted uppercase">
                <th 
                  className="py-3 px-4 cursor-pointer hover:bg-white/5 transition-colors group"
                  onClick={() => toggleSort('id')}
                >
                  <div className="flex items-center justify-between">
                    <span>ID (Partial)</span>
                    <SortIcon field="id" />
                  </div>
                </th>
                <th 
                  className="py-3 px-4 cursor-pointer hover:bg-white/5 transition-colors group"
                  onClick={() => toggleSort('scp_designation')}
                >
                  <div className="flex items-center justify-between">
                    <span>Designation</span>
                    <SortIcon field="scp_designation" />
                  </div>
                </th>
                <th className="py-3 px-4">Code Name</th>
                <th 
                  className="py-3 px-4 cursor-pointer hover:bg-white/5 transition-colors group"
                  onClick={() => toggleSort('object_containment_class')}
                >
                  <div className="flex items-center justify-between">
                    <span>Class</span>
                    <SortIcon field="object_containment_class" />
                  </div>
                </th>
                <th 
                  className="py-3 px-4 cursor-pointer hover:bg-white/5 transition-colors group"
                  onClick={() => toggleSort('rating')}
                >
                  <div className="flex items-center justify-between">
                    <span>Rating</span>
                    <SortIcon field="rating" />
                  </div>
                </th>
                <th className="py-3 px-4">Media</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs font-mono">
              {filteredEntries.map(entry => (
                <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4 text-[8px] text-foundation-muted font-mono">{entry.id?.substring(0, 8)}...</td>
                  <td className="py-4 px-4 font-bold text-foundation-ink">{entry.scp_designation}</td>
                  <td className="py-4 px-4 text-foundation-ink truncate max-w-[200px]">{entry.code_name}</td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-0.5 rounded-sm bg-white/5 border border-white/10 text-[10px]">
                      {entry.object_containment_class}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-foundation-terminal font-bold">{entry.rating || 'N/A'}</td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      {entry.scp_image_url && <ImageIcon className="w-3 h-3 text-foundation-accent" />}
                      {entry.scp_audio_url && <Music className="w-3 h-3 text-foundation-terminal" />}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handlePreviewClick(entry)}
                        className="p-1.5 text-foundation-muted hover:text-foundation-terminal transition-colors"
                        title="Preview as Viewer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setEditingEntry(entry)}
                        className="p-1.5 text-foundation-muted hover:text-foundation-accent transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(entry.id, entry.scp_designation)}
                        className="p-1.5 text-foundation-muted hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
