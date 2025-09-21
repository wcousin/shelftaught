#!/usr/bin/env node

// Simple script to test database connection and check if data exists
const axios = require('axios');

async function testDatabase() {
  console.log('🔍 Testing database connection and data...');
  
  try {
    // Test health endpoint
    console.log('Testing health endpoint...');
    const healthResponse = await axios.get('https://shelftaught-production.up.railway.app/api/health');
    console.log('✅ Health check:', healthResponse.data);
    
    // Test public curricula endpoint (doesn't require auth)
    console.log('Testing public curricula endpoint...');
    const curriculaResponse = await axios.get('https://shelftaught-production.up.railway.app/api/curricula');
    console.log('✅ Curricula count:', curriculaResponse.data.curricula?.length || 0);
    
    if (curriculaResponse.data.curricula?.length === 0) {
      console.log('⚠️  Database appears to be empty - may need seeding');
    } else {
      console.log('✅ Database has data');
      console.log('Sample curriculum:', curriculaResponse.data.curricula[0]?.name);
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 500) {
      console.log('💡 This might indicate a database connection issue');
    }
  }
}

testDatabase();