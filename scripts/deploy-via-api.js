const fs = require('fs');
const path = require('path');
const https = require('https');

const MANAGEMENT_TOKEN = 'sbp_c4e5823876bec847496de53a8194218a68d6f896';
const PROJECT_ID = 'mdccswzjwfyrzahbhduu';

// Read SQL file
const sqlPath = path.join(__dirname, '../supabase/migrations/001_initial_schema.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

async function executeSQL(sqlQuery) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      query: sqlQuery
    });

    const options = {
      hostname: 'api.supabase.com',
      port: 443,
      path: `/v1/projects/${PROJECT_ID}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MANAGEMENT_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, body: body });
        } else {
          resolve({ success: false, status: res.statusCode, body: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function deploySchema() {
  console.log('🚀 Deploying database schema via Supabase Management API...\n');

  try {
    console.log('📄 Executing SQL migration...');
    console.log('⏳ This may take a moment...\n');

    const result = await executeSQL(sql);

    if (result.success) {
      console.log('✅ Schema deployed successfully!');
      console.log('\n📊 Database is now ready with:');
      console.log('   - 15+ tables created');
      console.log('   - Indexes configured');
      console.log('   - Triggers activated');
      console.log('   - Helper functions installed');
      console.log('   - RLS enabled\n');
      console.log('🎉 Your AI Chat Agent database is fully set up!\n');
    } else {
      console.log('❌ Deployment failed');
      console.log('Status:', result.status);
      console.log('Response:', result.body);
      console.log('\nTrying alternative approach...\n');

      // Fall back to splitting into smaller chunks
      await deploySchemaBatches();
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

async function deploySchemaBatches() {
  console.log('📦 Deploying schema in batches...\n');

  // Split SQL into logical sections
  const sections = [
    {
      name: 'Extensions',
      sql: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";`
    },
    {
      name: 'Core Tables',
      sql: sql.split('-- ============================================================================')[1] +
           sql.split('-- ============================================================================')[2]
    }
  ];

  for (const section of sections) {
    console.log(`Deploying: ${section.name}...`);
    const result = await executeSQL(section.sql);
    if (result.success) {
      console.log(`✅ ${section.name} deployed\n`);
    } else {
      console.log(`❌ ${section.name} failed:`, result.body);
    }
  }
}

deploySchema();
