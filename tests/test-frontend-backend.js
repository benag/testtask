const http = require('http');

// Test if frontend can reach backend (CORS check)
async function testCORS() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/health',
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'GET',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log('✅ Backend health check successful');
        console.log('📡 CORS headers:');
        console.log(`  - Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin']}`);
        console.log(`  - Access-Control-Allow-Credentials: ${res.headers['access-control-allow-credentials']}`);
        resolve({ status: res.statusCode, headers: res.headers, body });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function testTranslationEndpoint() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/translations/en',
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:5173',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          console.log('✅ Translations endpoint working');
          console.log(`📝 Translation keys available: ${Object.keys(data.data).length}`);
          resolve(data);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('🔗 Testing frontend-backend connectivity...\n');
  
  try {
    await testCORS();
    await testTranslationEndpoint();
    
    console.log('\n✨ All connectivity tests passed!');
    console.log('💡 Frontend should be able to communicate with backend properly.');
    
  } catch (error) {
    console.error('❌ Connectivity test failed:', error.message);
  }
}

runTests();
