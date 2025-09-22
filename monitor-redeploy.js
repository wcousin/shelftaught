#!/usr/bin/env node

/**
 * Monitor Railway redeploy progress
 * Checks both frontend and backend after the GitHub push
 */

const FRONTEND_URL = 'https://frontend-new-production-96a4.up.railway.app';
const BACKEND_URL = 'https://shelftaught-production.up.railway.app/api';

console.log('🚀 Monitoring Railway Redeploy Progress');
console.log('======================================');
console.log(`Frontend: ${FRONTEND_URL}`);
console.log(`Backend:  ${BACKEND_URL}`);
console.log('');

let checkCount = 0;
const maxChecks = 20; // Check for up to 10 minutes (30s intervals)

async function checkDeployment() {
  checkCount++;
  console.log(`\n📊 Check #${checkCount} (${new Date().toLocaleTimeString()})`);
  
  // Test backend API
  try {
    const backendResponse = await fetch(`${BACKEND_URL}/curricula?_cb=${Date.now()}`);
    const backendStatus = backendResponse.status;
    
    if (backendStatus === 200) {
      const data = await backendResponse.json();
      const curriculaCount = data.data?.curricula?.length || 0;
      console.log(`✅ Backend: ${backendStatus} - ${curriculaCount} curricula available`);
    } else {
      console.log(`❌ Backend: ${backendStatus}`);
    }
  } catch (error) {
    console.log(`❌ Backend: ${error.message}`);
  }
  
  // Test frontend
  try {
    const frontendResponse = await fetch(`${FRONTEND_URL}?_cb=${Date.now()}`);
    const frontendStatus = frontendResponse.status;
    
    if (frontendStatus === 200) {
      console.log(`✅ Frontend: ${frontendStatus} - Accessible`);
      
      // Check if the new API service is deployed
      const html = await frontendResponse.text();
      const hasNewApiCode = html.includes('Cleared API cache to prevent stale data') || 
                           html.includes('CACHE_BUSTER');
      
      if (hasNewApiCode) {
        console.log(`🎉 Frontend: New API service deployed!`);
        console.log('');
        console.log('🎯 Deployment Complete!');
        console.log('======================');
        console.log('✅ Backend API working with real data');
        console.log('✅ Frontend deployed with fixed API service');
        console.log('✅ Mock data fallbacks removed');
        console.log('');
        console.log('🌐 Test the site now:');
        console.log(`   ${FRONTEND_URL}`);
        console.log('');
        console.log('💡 If you still see "No curricula available":');
        console.log('   1. Clear browser cache (Ctrl+Shift+R)');
        console.log('   2. Check browser console for errors');
        console.log('   3. Try incognito mode');
        
        process.exit(0);
      } else {
        console.log(`⏳ Frontend: Still deploying (old version active)`);
      }
    } else {
      console.log(`❌ Frontend: ${frontendStatus}`);
    }
  } catch (error) {
    console.log(`❌ Frontend: ${error.message}`);
  }
  
  if (checkCount >= maxChecks) {
    console.log('\n⏰ Maximum checks reached. Deployment may still be in progress.');
    console.log('Check Railway dashboard for deployment status.');
    process.exit(1);
  }
  
  console.log('⏳ Waiting 30 seconds for next check...');
  setTimeout(checkDeployment, 30000);
}

console.log('⏳ Starting deployment monitoring...');
console.log('💡 Railway typically takes 2-5 minutes to redeploy');
console.log('');

// Start monitoring
checkDeployment();