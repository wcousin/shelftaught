#!/usr/bin/env node

const https = require('https');

console.log('🔍 Railway Deployment Monitor');
console.log('============================\n');

let attempts = 0;
const maxAttempts = 30; // 15 minutes with 30-second intervals
const interval = 30000; // 30 seconds

function testFrontend() {
  return new Promise((resolve) => {
    console.log(`Attempt ${attempts + 1}/${maxAttempts} - Testing frontend...`);
    
    const req = https.get('https://frontend-production-aeaaf.up.railway.app/health', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const success = res.statusCode === 200;
        console.log(`Status: ${res.statusCode} ${success ? '✅' : '❌'}`);
        
        if (success && data) {
          try {
            const parsed = JSON.parse(data);
            console.log('✅ Frontend is now responding!');
            console.log('Response:', JSON.stringify(parsed, null, 2));
            resolve(true);
          } catch (e) {
            console.log('✅ Frontend is responding (non-JSON response)');
            resolve(true);
          }
        } else {
          console.log('❌ Still not responding correctly');
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Error: ${error.message}`);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log('⏰ Timeout');
      req.destroy();
      resolve(false);
    });
  });
}

async function monitor() {
  console.log('Monitoring frontend deployment...');
  console.log('This will check every 30 seconds for up to 15 minutes.\n');
  
  while (attempts < maxAttempts) {
    const success = await testFrontend();
    attempts++;
    
    if (success) {
      console.log('\n🎉 SUCCESS! Frontend is now working!');
      console.log('\nRunning full verification...\n');
      
      // Run full verification
      const { spawn } = require('child_process');
      const verify = spawn('node', ['verify-deployment.js'], { stdio: 'inherit' });
      
      verify.on('close', (code) => {
        console.log('\n✅ Deployment monitoring complete!');
        process.exit(0);
      });
      
      return;
    }
    
    if (attempts < maxAttempts) {
      console.log(`Waiting 30 seconds before next attempt...\n`);
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
  
  console.log('\n⏰ Timeout reached. Frontend may still be deploying.');
  console.log('Check Railway dashboard for deployment status.');
  console.log('You can manually run: node verify-deployment.js');
}

monitor().catch(console.error);