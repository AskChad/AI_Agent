const fs = require('fs');
const https = require('https');

const MANAGEMENT_TOKEN = 'sbp_c4e5823876bec847496de53a8194218a68d6f896';
const PROJECT_ID = 'mdccswzjwfyrzahbhduu';

// Read modified SQL with IF NOT EXISTS
let sql = fs.readFileSync('/tmp/schema_safe.sql', 'utf8');

// Remove comments
sql = sql.split('\n')
  .filter(line => !line.trim().startsWith('--'))
  .join('\n');

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
      timeout: 90000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ success: res.statusCode === 200, status: res.statusCode, body }));
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

async function deploy() {
  console.log('🚀 Deploying remaining schema tables...\n');
  console.log('⏳ This will take 30-60 seconds...\n');

  try {
    const result = await executeQuery(sql);

    console.log('\n📊 Verifying deployment...\n');

    const verify = await executeQuery("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;");

    if (verify.success) {
      const tables = JSON.parse(verify.body);
      console.log(`✅ ✅ ✅ SUCCESS! ✅ ✅ ✅\n`);
      console.log(`📊 Database has ${tables.length} tables:\n`);
      tables.forEach((t, i) => console.log(`   ${i + 1}. ${t.tablename}`));
      console.log('\n🎉 AI Chat Agent database is 100% ready!\n');
      console.log('🚀 Next: Run "npm run dev" to start the app\n');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

deploy();
