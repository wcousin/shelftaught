#!/usr/bin/env node

const https = require('https');
const http = require('http');

console.log('🔍 Railway Deployment Debug Tool');
console.log('================================\n');

// Test URLs to check
const testUrls = [
  'https://shelftaught-production.up.railway.app/api/health',
  'https://backend-production-aeaaf.up.railway.app/api/health',
  'https://shelftaught-production.up.railway.app/health',
  'https://backend-production-aeaaf.up.railway.app/health',
];

// Function to test a URL
function testUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    console.log(`Testing: ${url}`);
    
    const req = protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ Status: ${res.statusCode}`);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            console.log(`📄 Response:`, parsed);
          } catch (e) {
            console.log(`📄 Response: ${data.substring(0, 200)}...`);
          }
        }
        console.log('');
        resolve({ url, status: res.statusCode, data });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Error: ${error.message}`);
      console.log('');
      resolve({ url, error: error.message });
    });
    
    req.setTimeout(10000, () => {
      console.log(`⏰ Timeout after 10 seconds`);
      console.log('');
      req.destroy();
      resolve({ url, error: 'Timeout' });
    });
  });
}

// Test all URLs
async function runTests() {
  console.log('Testing potential backend URLs...\n');
  
  for (const url of testUrls) {
    await testUrl(url);
  }
  
  console.log('🔍 Next Steps:');
  console.log('1. Check your Railway dashboard for actual service URLs');
  console.log('2. Verify both frontend and backend services are deployed');
  console.log('3. Check Railway logs for any deployment errors');
  console.log('4. Update frontend/.env.production with correct backend URL');
}

runTests().catch(console.error);