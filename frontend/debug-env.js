// Debug environment variables
console.log('=== Environment Debug ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VITE_API_URL:', process.env.VITE_API_URL);
console.log('PORT:', process.env.PORT);
console.log('All env vars:', Object.keys(process.env).filter(key => key.startsWith('VITE_')));

// Check if we're in production mode
const isProd = process.env.NODE_ENV === 'production';
console.log('Is Production:', isProd);

const apiUrl = process.env.VITE_API_URL || 
  (isProd ? 'https://shelftaught-production.up.railway.app/api' : 'http://localhost:3001/api');
console.log('Resolved API URL:', apiUrl);