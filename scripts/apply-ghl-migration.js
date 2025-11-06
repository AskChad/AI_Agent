const fs = require('fs');
const https = require('https');

const MANAGEMENT_TOKEN = 'sbp_c4e5823876bec847496de53a8194218a68d6f896';
const PROJECT_ID = 'mdccswzjwfyrzahbhduu';

// Read migration SQL
const sql = fs.readFileSync('supabase/migrations/002_add_ghl_fields.sql', 'utf8');

async function executeQuery(query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query });

    const options = {
      hostname: 'api.supabase.com',
      port: 443,
      path: `/v1/projects/${PROJECT_ID}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MANAGEMENT_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      },
      timeout: 30000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ success: res.statusCode === 200 || res.statusCode === 201, status: res.statusCode, body }));
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.write(data);
    req.end();
  });
}

async function applyMigration() {
  console.log('🔄 Applying GHL integration fields migration...\n');

  try {
    const result = await executeQuery(sql);

    if (result.success) {
      console.log('✅ Migration applied successfully!\n');
      console.log('Added fields:');
      console.log('  - conversations.ghl_contact_id');
      console.log('  - conversations.ghl_conversation_id');
      console.log('  - conversations.channel');
      console.log('  - messages.ghl_message_id');
      console.log('  - messages.channel');
      console.log('  - account_settings.ghl_conversation_provider_id\n');
    } else {
      console.log('⚠️  Migration completed with status:', result.status);
      console.log('Response:', result.body.substring(0, 500));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

applyMigration();
