#!/usr/bin/env node

/**
 * Test script to verify the API is working without mock data
 * This helps debug the flashing data issue
 */

console.log('🧪 Testing API - No Mock Data');
console.log('==============================');

const BACKEND_URL = 'https://shelftaught-production.up.railway.app/api';
const FRONTEND_URL = 'https://frontend-new-production-96a4.up.railway.app';

// Test function using Node.js built-in fetch (Node 18+)
async function testAPI() {
  console.log('\n📡 Testing Backend API Endpoints...');
  
  const tests = [
    {
      name: 'Health Check',
      url: `${BACKEND_URL.replace('/api', '')}/health`,
      expectData: false
    },
    {
      name: 'Curricula List',
      url: `${BACKEND_URL}/curricula`,
      expectData: true,
      checkMock: true
    },
    {
      name: 'Categories',
      url: `${BACKEND_URL}/categories`,
      expectData: true,
      checkMock: true
    },
    {
      name: 'Search',
      url: `${BACKEND_URL}/search?q=math`,
      expectData: true,
      checkMock: true
    }
  ];
  
  for (const test of tests) {
    try {
      console.log(`\n🔍 Testing: ${test.name}`);
      console.log(`   URL: ${test.url}`);
      
      const response = await fetch(test.url);
      const status = response.status;
      
      if (status === 200) {
        console.log(`   ✅ Status: ${status}`);
        
        if (test.expectData) {
          const data = await response.json();
          
          // Check if response contains mock indicators
          const responseText = JSON.stringify(data);
          const hasMockData = responseText.includes('mock-') || 
                             responseText.includes('Mock') ||
                             responseText.includes('demo-') ||
                             responseText.includes('placeholder');
          
          if (test.checkMock && hasMockData) {
            console.log(`   ⚠️  WARNING: Response contains mock data indicators`);
            console.log(`   📄 Sample: ${responseText.substring(0, 100)}...`);
          } else {
            console.log(`   ✅ Real data confirmed`);
            
            // Show sample data
            if (data.curricula && data.curricula.length > 0) {
              console.log(`   📚 Found ${data.curricula.length} curricula`);
              console.log(`   📖 Sample: ${data.curricula[0].name}`);
            } else if (data.categories && data.categories.length > 0) {
              console.log(`   📂 Found ${data.categories.length} categories`);
            } else if (data.results && data.results.length > 0) {
              console.log(`   🔍 Found ${data.results.length} search results`);
            }
          }
        }
      } else {
        console.log(`   ❌ Status: ${status}`);
        const errorText = await response.text();
        console.log(`   📄 Error: ${errorText.substring(0, 100)}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
}

// Test frontend
async function testFrontend() {
  console.log('\n🌐 Testing Frontend...');
  
  try {
    const response = await fetch(FRONTEND_URL);
    const status = response.status;
    
    if (status === 200) {
      console.log(`✅ Frontend accessible: ${status}`);
      
      const html = await response.text();
      
      // Check for potential issues
      const issues = [];
      
      if (html.includes('mock-')) {
        issues.push('Contains mock data references');
      }
      
      if (html.includes('localhost:3001')) {
        issues.push('Contains localhost API references');
      }
      
      if (html.includes('VITE_API_URL')) {
        issues.push('Contains unresolved environment variables');
      }
      
      if (issues.length > 0) {
        console.log('⚠️  Potential issues found:');
        issues.forEach(issue => console.log(`   - ${issue}`));
      } else {
        console.log('✅ Frontend HTML looks clean');
      }
    } else {
      console.log(`❌ Frontend error: ${status}`);
    }
  } catch (error) {
    console.log(`❌ Frontend error: ${error.message}`);
  }
}

// Instructions for fixing flashing data
function printFixInstructions() {
  console.log('\n🔧 Fixing Flashing Data Issue:');
  console.log('==============================');
  console.log('1. Clear browser cache completely:');
  console.log('   - Open DevTools (F12)');
  console.log('   - Right-click refresh → "Empty Cache and Hard Reload"');
  console.log('   - Or use Ctrl+Shift+R (Cmd+Shift+R on Mac)');
  console.log('');
  console.log('2. Check browser console for errors:');
  console.log('   - Look for API request failures');
  console.log('   - Check for CORS errors');
  console.log('   - Verify API base URL is correct');
  console.log('');
  console.log('3. Test in incognito/private mode:');
  console.log('   - This bypasses all cached data');
  console.log('   - Helps isolate caching issues');
  console.log('');
  console.log('4. If data still flashes:');
  console.log('   - Check network tab in DevTools');
  console.log('   - Verify API responses don\'t contain mock data');
  console.log('   - Look for multiple rapid API calls');
}

// Main execution
async function main() {
  await testAPI();
  await testFrontend();
  printFixInstructions();
  
  console.log('\n🎯 Summary:');
  console.log('===========');
  console.log(`Frontend: ${FRONTEND_URL}`);
  console.log(`Backend:  ${BACKEND_URL}`);
  console.log('');
  console.log('If tests pass but data still flashes:');
  console.log('- Clear browser cache completely');
  console.log('- Check browser DevTools console');
  console.log('- Test in incognito mode');
}

// Run the tests
main().catch(console.error);