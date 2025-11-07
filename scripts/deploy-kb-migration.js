const https = require('https');
const fs = require('fs');

const SUPABASE_URL = 'mdccswzjwfyrzahbhduu.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kY2Nzd3pqd2Z5cnphaGJoZHV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM3MzMzNiwiZXhwIjoyMDc3OTQ5MzM2fQ.WhkvI7y3q3-KpRH94FUDWEJ2Wv-AS7xHAUs8ATvAmTE';
const MIGRATION_FILE = './database/migrations/006_create_knowledge_base.sql';

// Force IPv4
https.globalAgent = new https.Agent({
  family: 4,
  keepAlive: true
});

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
        'Content-Length': Buffer.byteLength(payload),
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(payload);
    req.end();
  });
}

async function runMigration() {
  console.log('🚀 Creating knowledge_base table...\n');

  if (!fs.existsSync(MIGRATION_FILE)) {
    console.error(`❌ Migration file not found: ${MIGRATION_FILE}`);
    process.exit(1);
  }

  console.log('📖 Reading migration file...');
  const migrationSQL = fs.readFileSync(MIGRATION_FILE, 'utf8');
  console.log(`✅ Loaded ${migrationSQL.length} bytes\n`);

  const payload = JSON.stringify({ query: migrationSQL });

  try {
    console.log('📡 Executing migration via exec_sql (IPv4)...');
    const response = await makeRequest(payload);

    console.log(`HTTP Status: ${response.statusCode}\n`);

    if (response.statusCode === 200 || response.statusCode === 201 || response.statusCode === 204) {
      console.log('✅ Migration completed successfully!\n');

      try {
        const result = JSON.parse(response.body);
        console.log('Response:', JSON.stringify(result, null, 2));
      } catch (e) {
        console.log('Response:', response.body || '(no response body)');
      }

      console.log('\n✅ Knowledge base table created successfully!');
      process.exit(0);

    } else {
      console.error(`❌ Migration failed: HTTP ${response.statusCode}`);
      console.error('Response:', response.body);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message);
    console.error('\n💡 Please run the migration manually in Supabase SQL Editor:');
    console.error(`   File: ${MIGRATION_FILE}`);
    console.error('   URL: https://supabase.com/dashboard/project/mdccswzjwfyrzahbhduu/sql');
    process.exit(1);
  }
}

runMigration();
