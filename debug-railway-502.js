#!/usr/bin/env node

const https = require('https');
const http = require('http');

console.log('🔍 Deep Railway 502 Debug Analysis');
console.log('===================================\n');

// Test different endpoints and methods
const tests = [
  {
    name: 'Frontend Root (GET)',
    url: 'https://frontend-production-aeaaf.up.railway.app/',
    method: 'GET'
  },
  {
    name: 'Frontend Health (GET)',
    url: 'https://frontend-production-aeaaf.up.railway.app/health',
    method: 'GET'
  },
  {
    name: 'Frontend with different path',
    url: 'https://frontend-production-aeaaf.up.railway.app/test',
    method: 'GET'
  },
  {
    name: 'Frontend HEAD request',
    url: 'https://frontend-production-aeaaf.up.railway.app/',
    method: 'HEAD'
  }
];

function testEndpoint(test) {
  return new Promise((resolve) => {
    console.log(`Testing: ${test.name}`);
    console.log(`URL: ${test.url}`);
    console.log(`Method: ${test.method}`);
    
    const url = new URL(test.url);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: test.method,
      headers: {
        'User-Agent': 'Railway-Debug-Tool/1.0',
        'Accept': '*/*',
        'Connection': 'close'
      },
      timeout: 15000
    };

    const protocol = url.protocol === 'https:' ? https : http;
    
    const req = protocol.request(options, (res) => {
      let data = '';
      
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers:`, JSON.stringify(res.headers, null, 2));
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Response length: ${data.length} bytes`);
        if (data && data.length < 1000) {
          console.log(`Response body:`, data);
        } else if (data) {
          console.log(`Response body (first 200 chars):`, data.substring(0, 200));
        }
        console.log('');
        resolve({ ...test, status: res.statusCode, headers: res.headers, data });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Error: ${error.message}`);
      console.log(`Error code: ${error.code}`);
      console.log('');
      resolve({ ...test, error: error.message, errorCode: error.code });
    });
    
    req.on('timeout', () => {
      console.log('⏰ Request timeout');
      console.log('');
      req.destroy();
      resolve({ ...test, error: 'Timeout' });
    });
    
    req.end();
  });
}

async function runDeepAnalysis() {
  console.log('Running deep 502 error analysis...\n');
  
  const results = [];
  
  for (const test of tests) {
    const result = await testEndpoint(test);
    results.push(result);
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('📊 Analysis Summary:');
  console.log('===================');
  
  results.forEach(result => {
    console.log(`\n${result.name}:`);
    if (result.status) {
      console.log(`  Status: ${result.status}`);
      if (result.headers) {
        console.log(`  Server: ${result.headers.server || 'Unknown'}`);
        console.log(`  Content-Type: ${result.headers['content-type'] || 'Unknown'}`);
        console.log(`  Content-Length: ${result.headers['content-length'] || 'Unknown'}`);
      }
    } else if (result.error) {
      console.log(`  Error: ${result.error}`);
      if (result.errorCode) {
        console.log(`  Error Code: ${result.errorCode}`);
      }
    }
  });
  
  console.log('\n🔍 Diagnosis:');
  console.log('=============');
  
  const hasAnyResponse = results.some(r => r.status);
  const allSame502 = results.filter(r => r.status).every(r => r.status === 502);
  const hasConnectionErrors = results.some(r => r.errorCode);
  
  if (!hasAnyResponse) {
    console.log('❌ CRITICAL: No responses received at all');
    console.log('   - Service is completely down');
    console.log('   - Check Railway dashboard for deployment status');
    console.log('   - Service may have failed to start');
  } else if (allSame502) {
    console.log('❌ CONSISTENT 502 ERRORS: Application is not responding');
    console.log('   - Service is deployed but not running properly');
    console.log('   - Check Railway logs for application startup errors');
    console.log('   - Port binding issues are likely');
    console.log('   - Application may be crashing on startup');
  } else {
    console.log('⚠️  MIXED RESPONSES: Intermittent issues');
    console.log('   - Service is partially working');
    console.log('   - May be resource constraints or startup delays');
  }
  
  console.log('\n🛠️  Recommended Actions:');
  console.log('1. Check Railway dashboard → Frontend service → Logs');
  console.log('2. Look for application startup errors');
  console.log('3. Verify PORT environment variable is set correctly');
  console.log('4. Check if the serve command is binding to 0.0.0.0');
  console.log('5. Try manual redeploy if logs show no obvious errors');
}

runDeepAnalysis().catch(console.error);