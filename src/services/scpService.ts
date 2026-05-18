import { supabase } from '../lib/supabase';
import { SCPEntry } from '../types';
import { SCPSchema } from './validationSchemas';

export const scpService = {
  async getAllEntries(): Promise<SCPEntry[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('scps')
        .select('*')
        .order('scp_designation', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Database Error: [REDACTED]');
      throw new Error('Database Synchronisation Failure: Connection Lost.');
    }
  },

  async getPaginatedEntries(
    page: number, 
    pageSize: number = 20,
    filters?: any
  ): Promise<{ data: SCPEntry[], count: number }> {
    if (!supabase) return { data: [], count: 0 };
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('scps')
      .select('*', { count: 'exact' });

    if (filters) {
      if (filters.searchQuery) {
        query = query.or(`scp_designation.ilike.%${filters.searchQuery}%,code_name.ilike.%${filters.searchQuery}%`);
      }

      const applyFilter = (field: string, value: string) => {
        if (value && value !== 'All') {
          // Split by " / ", " - ", or " – " to handle combined categories
          const parts = value.split(/\s+[\/–-]\s+/).map(p => p.trim()).filter(Boolean);
          
          if (parts.length > 1) {
            const conditions = parts.map(part => {
              const searchPattern = part.split(/[^a-zA-Z0-9]+/).filter(Boolean).join('%');
              return `${field}.ilike.%${searchPattern}%`;
            }).join(',');
            query = query.or(conditions);
          } else {
            const searchPattern = value.split(/[^a-zA-Z0-9]+/).filter(Boolean).join('%');
            query = query.ilike(field, `%${searchPattern}%`);
          }
        }
      };

      applyFilter('object_containment_class', filters.filterClass);
      applyFilter('disruption_class', filters.filterDisruption);
      applyFilter('risk_class', filters.filterRisk);
      applyFilter('ontological_category', filters.filterOntological);
      applyFilter('anomaly_type', filters.filterAnomalyType);
      applyFilter('morphology', filters.filterMorphology);
      applyFilter('emotional_tone', filters.filterTone);
      applyFilter('sapience_level', filters.filterSapience);
      applyFilter('security_clearance_level', filters.filterClearance);
      applyFilter('discovery_method', filters.filterDiscoveryMethod);
      applyFilter('origin_type', filters.filterOriginType);
      applyFilter('containment_facility_type', filters.filterFacilityType);
      applyFilter('containment_status', filters.filterStatus);
      applyFilter('challenges_to_containment_type', filters.filterChallenges);
      applyFilter('normal_behaviour_type', filters.filterNormalBehaviour);
      applyFilter('triggered_behaviour_type', filters.filterTriggeredBehaviour);
      applyFilter('respective_department', filters.filterDepartment);
      applyFilter('affected_natural_laws', filters.filterNaturalLaws);
      applyFilter('interaction_type', filters.filterInteractionType);
      applyFilter('spread_mechanism', filters.filterSpreadMechanism);
      applyFilter('related_k_class_scenarios', filters.filterKClass);

      if (filters.filterTag && filters.filterTag !== 'All') {
        query = query.ilike('tag_list', `%${filters.filterTag}%`);
      }

      if (filters.sortBy === 'rating') {
        query = query.order('rating', { ascending: filters.sortOrder === 'asc' });
      } else {
        query = query.order('scp_designation', { ascending: filters.sortOrder === 'asc' });
      }
    } else {
      query = query.order('scp_designation', { ascending: true });
    }

    const { data, error, count } = await query.range(from, to);

    if (error) throw error;
    return { data: data || [], count: count || 0 };
  },

  async getRandomEntry(): Promise<SCPEntry | null> {
    if (!supabase) return null;
    const { count, error } = await supabase
      .from('scps')
      .select('*', { count: 'exact', head: true });
    
    if (error || count === null) return null;
    const randomIndex = Math.floor(Math.random() * count);
    
    const { data, error: randomError } = await supabase
      .from('scps')
      .select('*')
      .range(randomIndex, randomIndex)
      .single();
      
    if (randomError) return null;
    return data;
  },

  async getEntryByDesignation(designation: string): Promise<SCPEntry | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('scps')
      .select('*')
      .eq('scp_designation', designation)
      .single();

    if (error) return null;
    return data;
  },

  // Rate limiting & Audit Logging State
  _lastActionTime: 0,
  
  async _verifyAndLog(action: string, designation?: string, details?: any) {
    const now = Date.now();
    // 2-second rate limit for sensitive mutations
    if (now - this._lastActionTime < 2000) {
      throw new Error('Security Protocol: Rapid-fire mutations blocked. Please wait.');
    }
    this._lastActionTime = now;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Security Violation: Authentication required for this operation.');
    
    // In a prod environment, you would log this to a dedicated 'audit_logs' table
    console.log(`[AUDIT LOG] ${new Date().toISOString()} | USER: ${user.email} | ACTION: ${action} | TARGET: ${designation || 'N/A'}`, details || '');
    
    return user;
  },

  async upsertEntry(entry: Partial<SCPEntry>) {
    if (!navigator.onLine) throw new Error('Offline: Cannot save changes while disconnected.');
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const user = await this._verifyAndLog('SAVE_ENTRY', entry.scp_designation, { 
        isUpdate: !!entry.id 
      });

      // Zod Validation
      const validation = SCPSchema.safeParse(entry);
      if (!validation.success) {
        const errorMsg = validation.error.issues.map(e => e.message).join(', ');
        throw new Error(`Data Integrity Violation: ${errorMsg}`);
      }

      const { data, error } = await supabase
        .from('scps')
        .upsert({
          ...validation.data,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'scp_designation' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Write Error: [REDACTED]');
      throw new Error(err.message || 'Database Mutation Failure: Access Denied.');
    }
  },

  async deleteEntry(id: string) {
    if (!navigator.onLine) throw new Error('Offline: Cannot delete entries while disconnected.');
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      await this._verifyAndLog('DELETE_ENTRY', id);

      const { error } = await supabase
        .from('scps')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err: any) {
      console.error('Delete Error: [REDACTED]');
      throw new Error(err.message || 'Database Deletion Failure: Access Denied.');
    }
  },

  async uploadFile(file: File, bucket: 'scp-images' | 'scp-audio') {
    if (!navigator.onLine) throw new Error('Offline: Cannot upload files while disconnected.');
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      await this._verifyAndLog('UPLOAD_FILE', file.name, { 
        bucket, 
        size: file.size, 
        type: file.type 
      });

      // Security Validation: File Size (Max 50MB)
      const MAX_SIZE = 50 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        throw new Error('Security Violation: File size exceeds 50MB limit.');
      }

      // Security Validation: MIME Type
      const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
      const ALLOWED_AUDIO_TYPES = [
        'audio/mpeg', 
        'audio/mp3', 
        'audio/wav', 
        'audio/x-wav', 
        'audio/ogg', 
        'audio/webm', 
        'audio/aac',
        'audio/x-m4a',
        'audio/mp4'
      ];
      
      if (bucket === 'scp-images' && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
        throw new Error(`Security Violation: Invalid image format (${file.type}).`);
      }
      if (bucket === 'scp-audio' && !ALLOWED_AUDIO_TYPES.includes(file.type)) {
        throw new Error(`Security Violation: Invalid audio format (${file.type}).`);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw new Error('Storage Error: Failed to upload file.');

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err: any) {
      console.error('Upload Error: [REDACTED]');
      throw new Error(err.message || 'Storage Mutation Failure: Access Denied.');
    }
  },

  async deleteFile(url: string, bucket: 'scp-images' | 'scp-audio') {
    if (!navigator.onLine) return;
    if (!supabase || !url) return;
    try {
      // Extract file name from URL, handling potential query parameters
      // URL format: https://.../storage/v1/object/public/bucket-name/filename.ext?t=...
      const urlWithoutQuery = url.split('?')[0];
      const parts = urlWithoutQuery.split('/');
      const fileName = parts[parts.length - 1];
      
      if (!fileName) {
        return;
      }

      const { error } = await supabase.storage
        .from(bucket)
        .remove([fileName]);

      if (error) {
        console.error('Storage Error: [REDACTED]');
      }
    } catch (err) {
      console.error('Operation Failure: [REDACTED]');
    }
  }
};
