const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing env vars');
  process.exit(1);
}

async function test() {
  const res = await fetch(`${url}/rest/v1/scp_entries?select=scp_designation,ontological_category,morphology,anomaly_type`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  const scps = await res.json();
  console.log(`Total SCPs: ${scps.length}`);
  
  const validScps = scps.filter(s => s.ontological_category && s.morphology && s.anomaly_type);
  console.log(`SCPs with all 3 fields: ${validScps.length}`);
  
  if (scps.length > 0) {
    console.log('Sample SCP 0:', scps[0]);
    console.log('Sample SCP 1:', scps[1]);
  }
}
test();
