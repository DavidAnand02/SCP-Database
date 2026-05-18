export const STANDARD_CATEGORIES = {
  ontological_category: [
    'Entity (living being)', 'Object / Artifact', 'Location / Structure', 
    'Phenomenon', 'Event', 'Concept / Abstract', 'Collective / System',
    'Digital', 'Pathogen', 'Record'
  ],
  anomaly_type: [
    'Biological', 'Mechanical / Technological', 'Chemical', 'Memetic', 
    'Antimemetic', 'Cognitohazard', 'Infohazard', 'Temporal', 'Spatial', 
    'Reality-Bending', 'Probability / Causality', 'Narrative / Meta', 
    'Thaumaturgic / Occult', 'Psionic', 'Dimensional / Extradimensional',
    'Mathematical', 'Transmutative', 'Energetic', 'Existential'
  ],
  morphology: [
    'Humanoid', 'Non-Humanoid', 'Botanical', '2D', 'Gargantuan', 'Amorphous', 
    'Metamorphic', 'Swarm', 'Distributed', 'Microscopic / Nanoscopic', 
    'Intangible', 'Natural Materials', 'Environmental', 'Geometric', 
    'Machine', 'Spatial', 'Biomechanical', 'Mineral', 'Multi-Dimensional'
  ],
  object_containment_class: [
    'Safe', 'Euclid', 'Keter', 'Thaumiel', 'Apollyon', 'Archon', 
    'Cernunnos', 'Ticonderoga', 'Explained', 'Neutralized', 
    'Decommissioned', 'Pending', 'Uncontained'
  ],
  disruption_class: [
    'Dark – Class 3', 'Vlam – Class 4', 'Keneq – Class 5', 
    'Ekhi – Class 6', 'Amida – Class 7'
  ],
  risk_class: [
    'Notice', 'Caution', 'Warning', 'Danger', 'Critical'
  ],
  sapience_level: [
    'Non-Sapient', 'Animal Level', 'Semi-Sapient', 'Emulated Personality', 
    'Alien Logic', 'Sapient', 'Superintelligent', 'Collective Hive Mind', 
    'Autonomous', 'Predictive / Prescient', 'Reactive Only'
  ],
  security_clearance_level: [
    'Level 1 – UR', 'Level 2 – RS', 'Level 3 – CF', 
    'Level 4 – SC', 'Level 5 – TS', 'Level 6 – CTS'
  ],
  emotional_tone: [
    'Terrifying', 'Eerie', 'Awe-Inspiring', 'Humorous', 
    'Tragic', 'Wholesome', 'Gross', 'Confusing'
  ],
  discovery_method: [
    'Civilian Incident', 'Law Enforcement or Military', 'Intelligence Agency Transfer', 
    'Scientific or Academic Research', 'Medical or Public Health Case', 
    'Archaeological or Historical Find', 'Field Exploration', 
    'Anomalous Event or Disaster', 'Information Leak or Media', 
    'Digital or Network Monitoring', 'Remote Sensing or Surveillance', 
    'Internal Foundation Activity', 'Cross-SCP Interaction', 
    'Temporal or Dimensional Event', 'Memetic or Infohazard Outbreak', 
    'Unknown or Classified'
  ],
  origin_type: [
    'Natural Anomaly', 'Human Made', 'Engineered or Experimental', 
    'Thaumaturgic or Ritual', 'Foundation Created or Modified', 
    'Extraterrestrial or Nonhuman', 'Extradimensional or Interdimensional', 
    'Temporal or Future Origin', 'Archaeological or Ancient', 
    'AI or Conceptual Emergence', 'Unknown or Conflicted'
  ],
  containment_facility_type: [
    'Armed', 'Biological', 'Containment', 'Dimensional', 'Humanoid', 
    'Exclusionary', 'Extrasolar', 'Lunar', 'Protected', 'Provisional', 
    'Reliquary', 'Research', 'Storage', 'Surveillance'
  ],
  containment_status: [
    'Active', 'Contained', 'Breached', 'Neutralized', 'Terminated', 
    'Pending Classification', 'Explained / Decommissioned'
  ],
  challenges_to_containment_type: [
    'Physical Threat', 'Regenerative or Adaptive', 'Self-Replication or Spread', 
    'Mobility or Escape', 'Information Hazard', 'Psychological or Cognitive Hazard', 
    'Reality or Causality Instability', 'Non-Physical or Abstract', 
    'Inherently Uncontainable', 'Ethical or Human Constraints', 
    'Resource Intensity', 'Unknown Variables'
  ],
  normal_behaviour_type: [
    'Passive', 'Conditional Aggression', 'Always Hostile', 'Predatory', 
    'Defensive', 'Ritual Dependent', 'Cyclical / Periodic', 'Escalatory'
  ],
  triggered_behaviour_type: [
    'Passive', 'Conditional Aggression', 'Always Hostile', 'Predatory', 
    'Defensive', 'Ritual Dependent', 'Cyclical / Periodic', 'Escalatory'
  ],
  respective_department: [
    'Scientific Department', 'Mobile Task Forces', 'Security Department', 
    'Medical Department', 'Engineering & Technical Service', 'Ethics Committee', 
    'Internal Security Department', 'RAISA', 'Antimemetics Division', 
    'Pataphysics Department', 'AIAD', 'Temporal Anomalies Department', 
    'Tactical Theology', 'Excursionary Department'
  ],
  affected_natural_laws: [
    'Thermal', 'Electromagnetic', 'Acoustic', 'Molecular', 'Radioactive', 
    'Gravitational', 'Light / Shadow', 'Biological Tissue', 'Probability', 
    'Quantum', 'Space-Time'
  ],
  interaction_type: [
    'Visual', 'Auditory', 'Tactile', 'Olfactory', 'Gustatory', 
    'Ingestion', 'Respiration', 'Telepathic', 'Linguistic', 'Symbolic', 
    'Subconscious', 'Cognitive / Knowledge-Based', 
    'Emotional / Psychological', 'Proximity-Based'
  ],
  spread_mechanism: [
    'None', 'Biological Infection', 'Memetic Transmission', 
    'Technological Replication', 'Environmental Contamination', 
    'Self-Replication', 'Assimilation', 'Infohazardous', 
    'Human-Mediated', 'Conceptual Spread', 'Spatio-Temporal Expansion'
  ],
  related_k_class_scenarios: [
    'AK-Class End-of-the-World Scenario', 'XK-Class End-of-Humanity Scenario', 
    'CK-Class Reality Restructuring Scenario', 'SK-Class Dominance Shift Scenario', 
    'ZK-Class Reality Failure Scenario', 'NK-Class Civilization Collapse Scenario', 
    'LK-Class Mass Casualty Scenario', 'HK-Class Narrative Collapse Scenario', 
    'FK-Class Containment Failure Scenario'
  ]
};

export const COUNTRY_COORDS: Record<string, [number, number]> = {
  'United States': [-95.7129, 37.0902],
  'Canada': [-106.3468, 56.1304],
  'Russia': [105.3188, 61.5240],
  'China': [104.1954, 35.8617],
  'Brazil': [-51.9253, -14.2350],
  'Australia': [133.7751, -25.2744],
  'India': [78.9629, 20.5937],
  'United Kingdom': [-3.4360, 55.3781],
  'Germany': [10.4515, 51.1657],
  'France': [2.2137, 46.2276],
  'Japan': [138.2529, 36.2048],
  'South Korea': [127.7669, 35.9078],
  'Italy': [12.5674, 41.8719],
  'Mexico': [-102.5528, 23.6345],
  'Egypt': [30.8025, 26.8206],
  'South Africa': [24.0594, -30.5595],
  'Argentina': [-63.6167, -38.4161],
  'Norway': [8.4689, 60.4720],
  'Sweden': [18.6435, 60.1282],
  'Finland': [25.7482, 61.9241],
  'Poland': [19.1451, 51.9194],
  'Spain': [-3.7492, 40.4637],
  'Portugal': [-8.2245, 39.3999],
  'Greece': [21.8243, 39.0742],
  'Turkey': [35.2433, 38.9637],
  'Iran': [53.6880, 32.4279],
  'Iraq': [43.6793, 33.2232],
  'Saudi Arabia': [45.0792, 23.8859],
  'Israel': [34.8516, 31.0461],
  'Ukraine': [31.1656, 48.3794],
  'Vietnam': [108.2772, 14.0583],
  'Thailand': [100.9925, 15.8700],
  'Indonesia': [113.9213, -0.7893],
  'Philippines': [121.7740, 12.8797],
  'Malaysia': [101.9758, 4.2105],
  'Singapore': [103.8198, 1.3521],
  'New Zealand': [174.8860, -40.9006],
  'Switzerland': [8.2275, 46.8182],
  'Austria': [14.5501, 47.5162],
  'Netherlands': [5.2913, 52.1326],
  'Belgium': [4.4699, 50.5039],
  'Denmark': [9.5018, 56.2639],
  'Ireland': [-8.2439, 53.4129],
  'Iceland': [-19.0208, 64.9631],
  'Chile': [-71.5430, -35.6751],
  'Colombia': [-74.2973, 4.5709],
  'Peru': [-75.0152, -9.1900],
  'Venezuela': [-66.5897, 6.4238],
  'Nigeria': [8.6753, 9.0820],
  'Kenya': [37.9062, -0.0236],
  'Ethiopia': [39.1225, 9.1450],
  'Morocco': [-7.0926, 31.7917],
  'Algeria': [1.6596, 28.0339],
};
