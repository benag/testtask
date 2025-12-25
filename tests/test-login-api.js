const http = require('http');

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function testLogin(email, password, accountType = 'user') {
  try {
    console.log(`\n🧪 Testing ${accountType} login...`);
    console.log(`📧 Email: ${email}`);
    
    const loginData = JSON.stringify({ email, password });
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };

    const response = await makeRequest(options, loginData);
    
    if (response.status === 200) {
      console.log('✅ Login successful!');
      console.log(`👤 User ID: ${response.data.data.user.id}`);
      console.log(`🔑 Role: ${response.data.data.user.role}`);
      console.log(`🌐 Language: ${response.data.data.user.preferred_language}`);
      console.log(`🎫 Token: ${response.data.data.token.substring(0, 50)}...`);
    } else {
      console.log('❌ Login failed!');
      console.log(`Status: ${response.status}`);
      console.log(`Response:`, response.data);
    }
    
    return response;
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return null;
  }
}

async function runLoginTests() {
  console.log('🚀 Starting login API tests...');
  
  // Test user account
  await testLogin('user@test.com', 'user123', 'regular user');
  
  // Test admin account  
  await testLogin('admin@test.com', 'admin123', 'admin');
  
  // Test invalid credentials
  console.log('\n🧪 Testing invalid credentials...');
  const invalidResponse = await testLogin('invalid@test.com', 'wrongpassword', 'invalid');
  
  console.log('\n✨ Login tests completed!');
}

// Check if servers are running first
async function checkServerStatus() {
  try {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/health',
      method: 'GET'
    };
    
    await makeRequest(options);
    console.log('✅ Backend server is running on port 3000');
    return true;
  } catch (error) {
    console.log('❌ Backend server is not running on port 3000');
    console.log('💡 Start the server with: npm run dev:backend');
    return false;
  }
}

async function main() {
  const serverRunning = await checkServerStatus();
  if (serverRunning) {
    await runLoginTests();
  }
}

main();
