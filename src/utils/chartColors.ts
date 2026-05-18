
export const CATEGORY_COLORS: Record<string, Record<string, string>> = {
  object_containment_class: {
    'Safe': '#166534', // Green
    'Euclid': '#f59e0b', // Amber
    'Keter': '#b91c1c', // Red
    'Thaumiel': '#2563eb', // Blue
    'Apollyon': '#7c3aed', // Purple
    'Archon': '#4b5563', // Gray
    'Neutralized': '#9ca3af', // Light Gray
    'Explained': '#0ea5e9', // Sky
    'Pending': '#6b7280',
    'Uncontained': '#dc2626',
  },
  risk_class: {
    'Notice': '#166534', // Green
    'Caution': '#92400e', // Brown
    'Warning': '#2563eb', // Blue
    'Danger': '#4b5563', // Gray
    'Critical': '#7c3aed', // Purple
  },
  disruption_class: {
    'Dark': '#4b5563',
    'Vlam': '#2563eb',
    'Keneq': '#f59e0b',
    'Ekhi': '#b91c1c',
    'Amida': '#7c3aed',
  },
  security_clearance_level: {
    'Level 1': '#166534',
    'Level 2': '#2563eb',
    'Level 3': '#f59e0b',
    'Level 4': '#b91c1c',
    'Level 5': '#7c3aed',
    'Level 6': '#000000',
  }
};

export const DEFAULT_COLORS = ['#b91c1c', '#f59e0b', '#2563eb', '#166534', '#4b5563', '#92400e', '#7c3aed', '#0891b2'];

export const getChartColor = (category: string, value: string, index: number): string => {
  if (CATEGORY_COLORS[category]) {
    // Try exact match
    if (CATEGORY_COLORS[category][value]) return CATEGORY_COLORS[category][value];
    
    // Try partial match (e.g. "Dark – Class 3" matches "Dark")
    const key = Object.keys(CATEGORY_COLORS[category]).find(k => value.includes(k));
    if (key) return CATEGORY_COLORS[category][key];
  }
  
  return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
};
