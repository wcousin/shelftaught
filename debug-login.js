// Debug script to test login from frontend perspective
const axios = require('axios');

const API_BASE_URL = 'https://shelftaught-production.up.railway.app/api';

async function testLogin() {
  console.log('Testing login with frontend configuration...');
  console.log('API Base URL:', API_BASE_URL);
  
  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    withCredentials: false,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  try {
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await axios.get('https://shelftaught-production.up.railway.app/health');
    console.log('✅ Health check:', healthResponse.status, healthResponse.data);

    console.log('\n2. Testing API base endpoint...');
    const apiResponse = await apiClient.get('/');
    console.log('✅ API base:', apiResponse.status, apiResponse.data);

    console.log('\n3. Testing login endpoint...');
    const loginResponse = await apiClient.post('/auth/login', {
      email: 'wcousin@gmail.com',
      password: 'TestPass@321'
    });
    console.log('✅ Login successful:', loginResponse.status);
    console.log('Response data:', JSON.stringify(loginResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error occurred:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    console.error('Full error:', error);
  }
}

testLogin();