const https = require('https');

const MANAGEMENT_TOKEN = 'sbp_c4e5823876bec847496de53a8194218a68d6f896';
const PROJECT_ID = 'mdccswzjwfyrzahbhduu';

async function testConnection() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      query: "SELECT current_database(), current_user, version();"
    });

    const options = {
      hostname: 'api.supabase.com',
      port: 443,
      path: `/v1/projects/${PROJECT_ID}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MANAGEMENT_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const result = JSON.parse(body);
          console.log('✅ Database Connection Test PASSED!\n');
          console.log('📊 Connection Details:');
          console.log('   Database:', result[0].current_database);
          console.log('   User:', result[0].current_user);
          console.log('   Version:', result[0].version.split(' on ')[0]);
          console.log('');
          resolve(true);
        } else {
          console.log('❌ Connection test failed:', res.statusCode);
          resolve(false);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

testConnection().catch(console.error);
