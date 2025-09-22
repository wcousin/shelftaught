#!/usr/bin/env node

/**
 * Clear cache and test deployment script
 * This script helps debug the flashing data issue by clearing caches and testing the API
 */

const https = require('https');
const http = require('http');

const FRONTEND_URL = 'https://shelftaught-frontend-production.up.railway.app';
const BACKEND_URL = 'https://shelftaught-production.up.railway.app';

console.log('🧹 Cache Clearing and Deployment Test');
console.log('=====================================');

// Test backend API endpoints
async function testBackendAPI() {
  console.log('\n📡 Testing Backend API...');
  
  const endpoints = [
    '/api/health',
    '/api/curricula',
    '/api/categories'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const url = `${BACKEND_URL}${endpoint}`;
      console.log(`Testing: ${url}`);
      
      const response = await fetch(url);
      const status = response.status;
      const statusText = response.statusText;
      
      if (status === 200) {
        console.log(`✅ ${endpoint}: ${status} ${statusText}`);
        
        // For curricula endpoint, check if we get real data
        if (endpoint === '/api/curricula') {
          const data = await response.json();
          if (data.curricula && data.curricula.length > 0) {
            console.log(`   📚 Found ${data.curricula.length} curricula`);
            console.log(`   📖 First curriculum: ${data.curricula[0].name}`);
          } else {
            console.log('   ⚠️  No curricula data found');
          }
        }
      } else {
        console.log(`❌ ${endpoint}: ${status} ${statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
}

// Test frontend accessibility
async function testFrontend() {
  console.log('\n🌐 Testing Frontend...');
  
  try {
    const response = await fetch(FRONTEND_URL);
    const status = response.status;
    const statusText = response.statusText;
    
    if (status === 200) {
      console.log(`✅ Frontend: ${status} ${statusText}`);
      
      const html = await response.text();
      
      // Check for common issues
      if (html.includes('mock-')) {
        console.log('⚠️  Warning: HTML contains mock references');
      }
      
      if (html.includes('VITE_API_URL')) {
        console.log('⚠️  Warning: HTML contains unresolved environment variables');
      }
      
      console.log('✅ Frontend HTML looks clean');
    } else {
      console.log(`❌ Frontend: ${status} ${statusText}`);
    }
  } catch (error) {
    console.log(`❌ Frontend: ${error.message}`);
  }
}

// Instructions for manual cache clearing
function printCacheClearingInstructions() {
  console.log('\n🧹 Manual Cache Clearing Instructions:');
  console.log('=====================================');
  console.log('1. Open browser developer tools (F12)');
  console.log('2. Right-click the refresh button');
  console.log('3. Select "Empty Cache and Hard Reload"');
  console.log('4. Or use Ctrl+Shift+R (Cmd+Shift+R on Mac)');
  console.log('');
  console.log('Alternative methods:');
  console.log('- Clear browser data for the site');
  console.log('- Open in incognito/private mode');
  console.log('- Disable cache in DevTools Network tab');
}

// Main execution
async function main() {
  await testBackendAPI();
  await testFrontend();
  printCacheClearingInstructions();
  
  console.log('\n🎯 Next Steps:');
  console.log('==============');
  console.log('1. Clear browser cache using instructions above');
  console.log('2. Visit the frontend URL in a fresh browser session');
  console.log('3. Check browser console for any remaining mock data references');
  console.log('4. Verify data loads without flashing');
  
  console.log(`\n🔗 Frontend URL: ${FRONTEND_URL}`);
  console.log(`🔗 Backend URL: ${BACKEND_URL}`);
}

// Handle both Node.js and browser environments
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  main().catch(console.error);
} else {
  // Browser environment - just export the functions
  window.clearCacheAndTest = { testBackendAPI, testFrontend, main };
}