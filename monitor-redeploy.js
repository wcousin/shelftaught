#!/usr/bin/env node

const https = require('https');

const FRONTEND_URL = 'https://frontend-new-production-96a4.up.railway.app';
const BACKEND_URL = 'https://shelftaught-production.up.railway.app';

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function checkDeployment() {
  console.log('🔍 Monitoring Railway deployment status...\n');
  
  try {
    // Check backend health
    console.log('1. Testing backend health...');
    const backendHealth = await makeRequest(`${BACKEND_URL}/health`);
    console.log(`   ✅ Backend: ${backendHealth.status} - ${backendHealth.status === 200 ? 'Healthy' : 'Issues'}`);
    
    // Check backend API
    console.log('2. Testing backend API...');
    const backendAPI = await makeRequest(`${BACKEND_URL}/api/curricula?limit=1`);
    console.log(`   ${backendAPI.status === 200 ? '✅' : '❌'} Backend API: ${backendAPI.status}`);
    
    // Check frontend
    console.log('3. Testing frontend...');
    const frontend = await makeRequest(FRONTEND_URL);
    console.log(`   ${frontend.status === 200 ? '✅' : '❌'} Frontend: ${frontend.status}`);
    
    // Summary
    console.log('\n📊 Deployment Status Summary:');
    console.log(`   Backend Health: ${backendHealth.status === 200 ? '✅ Working' : '❌ Issues'}`);
    console.log(`   Backend API: ${backendAPI.status === 200 ? '✅ Working' : '❌ Issues'}`);
    console.log(`   Frontend: ${frontend.status === 200 ? '✅ Working' : '❌ Issues'}`);
    
    if (backendHealth.status === 200 && backendAPI.status === 200 && frontend.status === 200) {
      console.log('\n🎉 All services are working! The curricula should now display properly.');
      console.log(`\n🌐 Visit your site: ${FRONTEND_URL}`);
    } else {
      console.log('\n⚠️  Some services have issues. Check the Railway dashboard for deployment logs.');
    }
    
  } catch (error) {
    console.error('❌ Error checking deployment:', error.message);
  }
}

// Run the check
checkDeployment();

// If running with --watch flag, check every 30 seconds
if (process.argv.includes('--watch')) {
  console.log('\n👀 Watching deployment status (checking every 30 seconds)...');
  setInterval(checkDeployment, 30000);
}