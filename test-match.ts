import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: scps, error } = await supabase.from('scp_entries').select('scp_designation, ontological_category, morphology, anomaly_type');
  if (error) {
    console.error(error);
    return;
  }
  console.log(`Total SCPs: ${scps.length}`);
  
  const validScps = scps.filter(s => s.ontological_category && s.morphology && s.anomaly_type);
  console.log(`SCPs with all 3 fields: ${validScps.length}`);
  
  if (validScps.length > 0) {
    console.log('Sample valid SCP:', validScps[0]);
    
    // Test matching logic against the first valid SCP
    const currentScp = validScps[0];
    const getList = (str: string | undefined | null) => 
      (str || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);

    const currentOnto = getList(currentScp.ontological_category);
    const currentMorph = getList(currentScp.morphology);
    const currentType = getList(currentScp.anomaly_type);

    let matchCount = 0;
    for (const scp of scps) {
      if (scp.scp_designation === currentScp.scp_designation) continue;

      const scpOnto = getList(scp.ontological_category);
      const matchOnto = currentOnto.some(o => scpOnto.includes(o));

      const scpMorph = getList(scp.morphology);
      const matchMorph = currentMorph.some(m => scpMorph.includes(m));

      const scpType = getList(scp.anomaly_type);
      const matchType = currentType.some(t => scpType.includes(t));

      if (matchOnto && matchMorph && matchType) {
        matchCount++;
        console.log(`Match found! ${scp.scp_designation}`);
        console.log(`  Onto: ${scp.ontological_category}`);
        console.log(`  Morph: ${scp.morphology}`);
        console.log(`  Type: ${scp.anomaly_type}`);
      }
    }
    console.log(`Total matches for ${currentScp.scp_designation}: ${matchCount}`);
  }
}
test();
