// Debug script to check localStorage auth data
console.log('=== Auth Storage Debug ===');

// Check what's in localStorage
const token = localStorage.getItem('authToken');
const userData = localStorage.getItem('userData');

console.log('Stored token:', token);
console.log('Stored userData:', userData);

if (userData) {
  try {
    const parsedUser = JSON.parse(userData);
    console.log('Parsed user data:', parsedUser);
    console.log('User role:', parsedUser.role);
    console.log('User name:', parsedUser.firstName, parsedUser.lastName);
  } catch (error) {
    console.error('Error parsing user data:', error);
  }
}

// Clear auth data (uncomment to clear)
// localStorage.removeItem('authToken');
// localStorage.removeItem('userData');
// console.log('Auth data cleared');

// Test API call with current token
if (token) {
  fetch('https://shelftaught-production.up.railway.app/api/user/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => console.log('Profile API response:', data))
  .catch(error => console.error('Profile API error:', error));
}