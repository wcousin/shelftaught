#!/usr/bin/env node

const https = require('https');

console.log('🔍 Railway Deployment Verification');
console.log('==================================\n');

const tests = [
  {
    name: 'Backend Health Check',
    url: 'https://shelftaught-production.up.railway.app/health',
    expected: 200
  },
  {
    name: 'Backend API Root',
    url: 'https://shelftaught-production.up.railway.app/api',
    expected: 200
  },
  {
    name: 'Frontend Health Check',
    url: 'https://frontend-production-aeaaf.up.railway.app/health',
    expected: 200
  },
  {
    name: 'Frontend Root',
    url: 'https://frontend-production-aeaaf.up.railway.app/',
    expected: 200
  }
];

function testEndpoint(test) {
  return new Promise((resolve) => {
    console.log(`Testing: ${test.name}`);
    console.log(`URL: ${test.url}`);
    
    const req = https.get(test.url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const success = res.statusCode === test.expected;
        console.log(`Status: ${res.statusCode} ${success ? '✅' : '❌'}`);
        
        if (data && res.headers['content-type']?.includes('application/json')) {
          try {
            const parsed = JSON.parse(data);
            console.log('Response:', JSON.stringify(parsed, null, 2));
          } catch (e) {
            console.log('Response (first 200 chars):', data.substring(0, 200));
          }
        } else if (data) {
          console.log('Response (first 200 chars):', data.substring(0, 200));
        }
        
        console.log('');
        resolve({ ...test, status: res.statusCode, success, data });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Error: ${error.message}`);
      console.log('');
      resolve({ ...test, error: error.message, success: false });
    });
    
    req.setTimeout(15000, () => {
      console.log('⏰ Timeout after 15 seconds');
      console.log('');
      req.destroy();
      resolve({ ...test, error: 'Timeout', success: false });
    });
  });
}

async function runVerification() {
  console.log('Running deployment verification tests...\n');
  
  const results = [];
  
  for (const test of tests) {
    const result = await testEndpoint(test);
    results.push(result);
  }
  
  console.log('📊 Summary:');
  console.log('===========');
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.name}`);
    if (!result.success && result.error) {
      console.log(`    Error: ${result.error}`);
    }
  });
  
  console.log(`\n${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('\n🎉 All services are working correctly!');
  } else {
    console.log('\n⚠️  Some services need attention. Check the Railway dashboard for logs.');
    console.log('\nNext steps:');
    console.log('1. Check Railway deployment logs');
    console.log('2. Verify environment variables are set');
    console.log('3. Ensure database service is running');
    console.log('4. Try redeploying failed services');
  }
}

runVerification().catch(console.error);