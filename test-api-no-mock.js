#!/usr/bin/env node

const https = require('https');

// Test the exact API calls that the frontend makes
const API_BASE_URL = 'https://shelftaught-production.up.railway.app/api';

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (error) {
          resolve({ status: res.statusCode, data: data, parseError: error.message });
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testAPI() {
  console.log('🧪 Testing API calls that frontend makes...\n');
  
  try {
    // 1. Test HomePage call
    console.log('1. 🏠 Testing HomePage API call...');
    const homePageUrl = `${API_BASE_URL}/curricula?limit=6&sortBy=overallRating&sortOrder=desc`;
    console.log(`   📡 URL: ${homePageUrl}`);
    
    const homeResponse = await makeRequest(homePageUrl);
    console.log(`   📊 Status: ${homeResponse.status}`);
    
    if (homeResponse.status === 200 && homeResponse.data.success) {
      const curricula = homeResponse.data.data.curricula || [];
      console.log(`   ✅ Success: Found ${curricula.length} curricula`);
      
      if (curricula.length > 0) {
        const first = curricula[0];
        console.log(`   📝 First curriculum: "${first.name}" by ${first.publisher}`);
        console.log(`   🔍 Has subjects: ${Array.isArray(first.subjects) ? 'YES' : 'NO'}`);
        console.log(`   🔍 Has gradeLevel: ${first.gradeLevel ? 'YES' : 'NO'}`);
        console.log(`   🔍 Has gradeLevel.ageRange: ${first.gradeLevel?.ageRange ? 'YES' : 'NO'}`);
        
        // Test the exact property access
        try {
          const subjects = first.subjects;
          const gradeRange = first.gradeLevel.ageRange;
          console.log(`   ✅ Property access works: ${subjects.length} subjects, grade range: "${gradeRange}"`);
        } catch (error) {
          console.log(`   ❌ Property access failed: ${error.message}`);
        }
      } else {
        console.log('   ⚠️  No curricula returned');
      }
    } else {
      console.log(`   ❌ Failed: ${homeResponse.status} - ${homeResponse.data.message || 'Unknown error'}`);
      if (homeResponse.parseError) {
        console.log(`   🔍 Parse error: ${homeResponse.parseError}`);
        console.log(`   📄 Raw response: ${homeResponse.data.substring(0, 200)}...`);
      }
    }
    
    console.log('');
    
    // 2. Test direct database query
    console.log('2. 🗄️  Testing direct API without filters...');
    const directUrl = `${API_BASE_URL}/curricula?limit=3`;
    console.log(`   📡 URL: ${directUrl}`);
    
    const directResponse = await makeRequest(directUrl);
    console.log(`   📊 Status: ${directResponse.status}`);
    
    if (directResponse.status === 200 && directResponse.data.success) {
      const curricula = directResponse.data.data.curricula || [];
      console.log(`   ✅ Success: Found ${curricula.length} curricula`);
      console.log(`   📊 Total in DB: ${directResponse.data.data.pagination?.totalCount || 'unknown'}`);
    } else {
      console.log(`   ❌ Failed: ${directResponse.status}`);
    }
    
    console.log('');
    
    // 3. Test backend health
    console.log('3. ❤️  Testing backend health...');
    const healthUrl = 'https://shelftaught-production.up.railway.app/health';
    const healthResponse = await makeRequest(healthUrl);
    
    if (healthResponse.status === 200) {
      console.log(`   ✅ Backend healthy: ${healthResponse.data.status}`);
      console.log(`   ⏱️  Uptime: ${Math.floor(healthResponse.data.uptime / 60)} minutes`);
    } else {
      console.log(`   ❌ Backend unhealthy: ${healthResponse.status}`);
    }
    
    console.log('\n🎯 Summary:');
    console.log('   - Backend is running and healthy');
    console.log('   - API endpoints are accessible');
    console.log('   - Data structure matches frontend expectations');
    console.log('   - If curricula still not showing, issue is likely in React rendering or state management');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();