#!/usr/bin/env node

// Debug script to check user roles in the database
const https = require('https');

const BACKEND_URL = 'https://shelftaught-production.up.railway.app/api';

// Function to make API request
function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BACKEND_URL);
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function debugUserRole() {
  console.log('🔍 Debugging user role issue...\n');
  
  try {
    // First, let's try to login as admin to get a token
    console.log('1. Attempting admin login...');
    const loginResponse = await makeRequest('/auth/login', 'POST', {
      email: 'admin@example.com', // Assuming this is your admin email
      password: 'admin123' // Assuming this is your admin password
    });
    
    console.log('Login response:', loginResponse);
    
    if (loginResponse.status === 200 && loginResponse.data.success) {
      const token = loginResponse.data.data.token;
      const user = loginResponse.data.data.user;
      
      console.log('\n2. Login successful!');
      console.log('User from login:', user);
      console.log('Token received:', token ? 'Yes' : 'No');
      
      // Now try to fetch users from admin API
      console.log('\n3. Fetching users from admin API...');
      const usersResponse = await makeRequest('/admin/users', 'GET', null, token);
      
      console.log('Users API response:', usersResponse);
      
      if (usersResponse.status === 200 && usersResponse.data.success) {
        console.log('\n4. Users data:');
        usersResponse.data.data.users.forEach(user => {
          console.log(`- ${user.firstName} ${user.lastName} (${user.email}): ${user.role}`);
        });
      } else {
        console.log('❌ Failed to fetch users:', usersResponse.data);
      }
      
    } else {
      console.log('❌ Login failed:', loginResponse.data);
      
      // Try alternative login credentials
      console.log('\n🔄 Trying alternative credentials...');
      const altLoginResponse = await makeRequest('/auth/login', 'POST', {
        email: 'test@example.com',
        password: 'password123'
      });
      
      console.log('Alternative login response:', altLoginResponse);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the debug
debugUserRole();