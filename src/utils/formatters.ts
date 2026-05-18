import { STANDARD_CATEGORIES } from '../constants';

export const splitMultiValue = (val: string | null | undefined): string[] => {
  if (!val) return [];
  // Split by common delimiters: comma, semicolon, pipe, or forward slash/dash with spaces
  return val.split(/[,;|]|\s+[\/–-]\s+/).map(v => v.trim()).filter(Boolean);
};

export const normalizeValue = (val: string | null | undefined, category?: string): string => {
  if (!val) return 'Unknown';
  
  const raw = val.toLowerCase().trim();
  
  // Specific normalization for facilities (Site 19 vs Site-19)
  if (category === 'containment_facility') {
    let normalized = val.trim();
    // Match any sequence of words followed by space or dash and then digits at the end
    const match = normalized.match(/^(.+?)[\s-]+(\d+)$/i);
    if (match) {
      let prefix = match[1].trim();
      // Capitalize each word and join with dash
      prefix = prefix.split(/[\s-]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('-');
      return `${prefix}-${match[2]}`;
    }
    // Handle cases where it's just "Site-19" already but maybe lowercase
    if (normalized.includes('-')) {
       return normalized.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('-');
    }
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  // Specific normalization for locations
  if (raw === 'usa' || raw === 'u.s.a.' || raw === 'united states of america' || raw === 'united states') return 'United States';
  if (raw === 'uk' || raw === 'u.k.' || raw === 'united kingdom') return 'United Kingdom';

  // Specific normalization for security clearance levels
  if (category === 'security_clearance_level') {
    const standards = (STANDARD_CATEGORIES as any).security_clearance_level as string[];
    const normRaw = raw.replace(/[^a-z0-9]/g, '');
    
    // 1. Try exact match on code (e.g., "UR", "RS", "SC")
    const codeMatch = standards.find(s => {
      const parts = s.split(/[–-]/);
      if (parts.length > 1) {
        const code = parts[1].trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        return code === normRaw;
      }
      return false;
    });
    if (codeMatch) return codeMatch;
    
    // 2. Try match on level number (e.g., "1", "2", "3")
    const levelNumMatch = raw.match(/\d+/);
    if (levelNumMatch) {
      const num = levelNumMatch[0];
      const match = standards.find(s => {
        const sNum = s.match(/\d+/);
        return sNum && sNum[0] === num;
      });
      if (match) return match;
    }
  }
  
  // If we have a specific standard list for this category, try to find a match
  if (category && (STANDARD_CATEGORIES as any)[category]) {
    const standards = (STANDARD_CATEGORIES as any)[category] as string[];
    
    const normalizeString = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedRaw = normalizeString(raw);
    
    // 1. Try exact match (ignoring punctuation/spaces)
    const exactMatch = standards.find(s => normalizeString(s) === normalizedRaw);
    if (exactMatch) return exactMatch;
    
    // 2. Try substring match (e.g., "level 1" matches "Level 1 - UR", "object" matches "Object / Artifact")
    const substringMatch = standards.find(s => {
      const normS = normalizeString(s);
      if (normalizedRaw.length > 3 && (normS.includes(normalizedRaw) || normalizedRaw.includes(normS))) {
        // Prevent generic words from matching too broadly
        const genericWords = [
          'class', 'level', 'type', 'department', 'division', 'site', 'area', 
          'unit', 'sector', 'committee', 'service', 'forces', 'task', 'internal', 'anomalies'
        ];
        if (genericWords.includes(normalizedRaw)) return false;
        return true;
      }
      return false;
    });
    if (substringMatch) return substringMatch;

    // 3. Try keyword match as a fallback
    const keywordMatch = standards.find(s => {
      const keywords = s.toLowerCase().split(/[^a-z0-9]+/).filter(k => k.length > 3);
      
      // Filter out generic keywords that cause false positives
      const genericKeywords = ['department', 'division', 'committee', 'service', 'forces', 'task', 'internal', 'anomalies'];
      const specificKeywords = keywords.filter(k => !genericKeywords.includes(k));
      
      // If we have specific keywords, use them. Otherwise, fall back to all keywords but be more strict.
      const keywordsToUse = specificKeywords.length > 0 ? specificKeywords : keywords;
      
      return keywordsToUse.some(k => raw.includes(k));
    });
    if (keywordMatch) return keywordMatch;
  }

  // Fallback to general normalization for other fields (Classes, etc.)
  let normalized = val.split(/[(\[/]/)[0].trim();
  normalized = normalized.replace(/\s*-?class$/i, '');
  
  if (!normalized) return 'Unknown';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};
