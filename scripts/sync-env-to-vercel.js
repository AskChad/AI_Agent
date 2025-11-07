const https = require('https');
const fs = require('fs');
const path = require('path');

// Vercel configuration
const VERCEL_TOKEN = process.env.VERCEL_TOKEN || 'AJOA89XSplE7O1v1iFRc5IDJ';
const VERCEL_PROJECT_ID = 'ai-agent';
const VERCEL_TEAM_ID = 'ask-chad-llc';

// Environment variables to sync (from .env.local)
const ENV_VARS = {
  'NEXT_PUBLIC_SUPABASE_URL': 'https://mdccswzjwfyrzahbhduu.supabase.co',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kY2Nzd3pqd2Z5cnphaGJoZHV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNzMzMzYsImV4cCI6MjA3Nzk0OTMzNn0.WV8tu4fnr-qHN9-83Y29Ly88GQFb5zMIRCzQg_sDdlg',
  'SUPABASE_SERVICE_ROLE_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kY2Nzd3pqd2Z5cnphaGJoZHV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM3MzMzNiwiZXhwIjoyMDc3OTQ5MzM2fQ.WhkvI7y3q3-KpRH94FUDWEJ2Wv-AS7xHAUs8ATvAmTE',
  'NEXT_PUBLIC_APP_URL': 'https://ai-agent-pi-one.vercel.app',
  'DB_PASSWORD': 'AiChatAgent2024!Secure#DB',
  'TOKEN_MANAGER_URL': 'http://localhost:3737',
  'TOKEN_MANAGER_PASSWORD': 'jpu7qbh-cgn9DQB8abyn'
};

function makeRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;

    const options = {
      hostname: 'api.vercel.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    if (payload) {
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function getExistingEnvVars() {
  console.log('📥 Fetching existing environment variables...');

  const response = await makeRequest(
    'GET',
    `/v9/projects/${VERCEL_PROJECT_ID}/env?teamId=${VERCEL_TEAM_ID}`
  );

  if (response.statusCode === 200) {
    console.log(`✅ Found ${response.body.envs?.length || 0} existing variables\n`);
    return response.body.envs || [];
  } else {
    console.error('❌ Failed to fetch existing variables:', response.body);
    return [];
  }
}

async function deleteEnvVar(envId) {
  const response = await makeRequest(
    'DELETE',
    `/v9/projects/${VERCEL_PROJECT_ID}/env/${envId}?teamId=${VERCEL_TEAM_ID}`
  );

  return response.statusCode === 200;
}

async function createEnvVar(key, value) {
  const data = {
    key: key,
    value: value,
    type: 'encrypted',
    target: ['production', 'preview', 'development']
  };

  const response = await makeRequest(
    'POST',
    `/v10/projects/${VERCEL_PROJECT_ID}/env?teamId=${VERCEL_TEAM_ID}`,
    data
  );

  if (response.statusCode === 200 || response.statusCode === 201) {
    console.log(`✅ Created: ${key}`);
    return true;
  } else {
    console.error(`❌ Failed to create ${key}:`, response.body);
    return false;
  }
}

async function syncEnvironmentVariables() {
  console.log('🚀 Syncing Environment Variables to Vercel\n');
  console.log(`Project: ${VERCEL_PROJECT_ID}`);
  console.log(`Team: ${VERCEL_TEAM_ID}\n`);

  try {
    // Get existing variables
    const existing = await getExistingEnvVars();
    const existingKeys = new Map(existing.map(env => [env.key, env.id]));

    let created = 0;
    let updated = 0;
    let skipped = 0;

    // Process each variable
    for (const [key, value] of Object.entries(ENV_VARS)) {
      console.log(`\n📝 Processing: ${key}`);

      // Check if variable exists
      if (existingKeys.has(key)) {
        console.log(`   Found existing variable, deleting old version...`);
        const deleted = await deleteEnvVar(existingKeys.get(key));

        if (!deleted) {
          console.log(`   ⚠️  Failed to delete, skipping...`);
          skipped++;
          continue;
        }

        console.log(`   Creating updated version...`);
        const success = await createEnvVar(key, value);
        if (success) {
          updated++;
        } else {
          skipped++;
        }
      } else {
        const success = await createEnvVar(key, value);
        if (success) {
          created++;
        } else {
          skipped++;
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log(`   ✅ Created: ${created}`);
    console.log(`   🔄 Updated: ${updated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   📦 Total: ${Object.keys(ENV_VARS).length}`);
    console.log('='.repeat(60));

    console.log('\n✅ Environment variables synced successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Go to: https://vercel.com/ask-chad-llc/ai-agent');
    console.log('   2. Trigger a new deployment or wait for the next push');
    console.log('   3. The new variables will be available in the next deployment\n');

  } catch (error) {
    console.error('\n❌ Error syncing environment variables:', error.message);
    process.exit(1);
  }
}

// Run the sync
syncEnvironmentVariables();
