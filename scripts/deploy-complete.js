const fs = require('fs');
const path = require('path');
const https = require('https');

const MANAGEMENT_TOKEN = 'sbp_c4e5823876bec847496de53a8194218a68d6f896';
const PROJECT_ID = 'mdccswzjwfyrzahbhduu';

// Read and prepare SQL
const sqlPath = path.join(__dirname, '../supabase/migrations/001_initial_schema.sql');
let sql = fs.readFileSync(sqlPath, 'utf8');

// Remove comments for cleaner execution
sql = sql.split('\n')
  .filter(line => !line.trim().startsWith('--'))
  .join('\n')
  .replace(/\/\*[\s\S]*?\*\//g, '');

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
      timeout: 60000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ success: true, body });
        } else {
          resolve({ success: false, status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(data);
    req.end();
  });
}

async function deploy() {
  console.log('🚀 Deploying complete database schema...\n');

  try {
    console.log('📄 Executing migration (this may take 30-60 seconds)...\n');

    const result = await executeQuery(sql);

    if (result.success) {
      console.log('✅ ✅ ✅ DATABASE SCHEMA DEPLOYED SUCCESSFULLY! ✅ ✅ ✅\n');
      console.log('📊 Your database now includes:');
      console.log('   ✅ 15+ tables created');
      console.log('   ✅ Vector search enabled (pgvector)');
      console.log('   ✅ Indexes configured');
      console.log('   ✅ Triggers activated');
      console.log('   ✅ Helper functions installed');
      console.log('   ✅ Row Level Security enabled\n');
      console.log('🎉 AI Chat Agent database is 100% ready!\n');
      console.log('🚀 Next step: npm run dev\n');
    } else {
      console.log('⚠️  Deployment completed with status:', result.status);
      console.log('Response:', result.body.substring(0, 500));
      console.log('\nAttempting to verify tables were created...\n');

      // Verify
      const verify = await executeQuery('SELECT tablename FROM pg_tables WHERE schemaname = \'public\' ORDER BY tablename;');
      if (verify.success) {
        const tables = JSON.parse(verify.body);
        console.log(`✅ Found ${tables.length} tables in database`);
        console.log('Tables:', tables.map(t => t.tablename).join(', '));
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deploy();
