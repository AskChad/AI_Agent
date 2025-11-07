const https = require('https');

const SUPABASE_URL = 'mdccswzjwfyrzahbhduu.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kY2Nzd3pqd2Z5cnphaGJoZHV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM3MzMzNiwiZXhwIjoyMDc3OTQ5MzM2fQ.WhkvI7y3q3-KpRH94FUDWEJ2Wv-AS7xHAUs8ATvAmTE';

https.globalAgent = new https.Agent({ family: 4 });

function makeRequest(payload) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SUPABASE_URL,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      family: 4,
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function checkKnowledgeBase() {
  console.log('🔍 Checking knowledge_base table...\n');

  // Check if table exists
  const checkTableSQL = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'knowledge_base'
    ) as table_exists;
  `;

  const payload1 = JSON.stringify({ query: checkTableSQL });
  const response1 = await makeRequest(payload1);

  console.log('Table existence check:', response1.body);
  console.log('');

  // Check table structure
  const checkStructureSQL = `
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'knowledge_base'
    ORDER BY ordinal_position;
  `;

  const payload2 = JSON.stringify({ query: checkStructureSQL });
  const response2 = await makeRequest(payload2);

  console.log('Table structure:', response2.body);
  console.log('');

  // Check for any existing data
  const checkDataSQL = `
    SELECT COUNT(*) as total_documents FROM knowledge_base;
  `;

  const payload3 = JSON.stringify({ query: checkDataSQL });
  const response3 = await makeRequest(payload3);

  console.log('Data check:', response3.body);
}

checkKnowledgeBase().catch(console.error);
