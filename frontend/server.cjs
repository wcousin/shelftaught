const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');

console.log('🚀 Starting frontend server...');
console.log('📁 Serving from:', distPath);
console.log('🌐 Port:', port);

// Check if dist directory exists
if (!fs.existsSync(distPath)) {
  console.error('❌ Dist directory does not exist:', distPath);
  console.log('📂 Current directory contents:');
  fs.readdirSync(__dirname).forEach(file => {
    console.log('  -', file);
  });
  process.exit(1);
}

// Check if index.html exists
const indexPath = path.join(distPath, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('❌ index.html does not exist:', indexPath);
  console.log('📂 Dist directory contents:');
  fs.readdirSync(distPath).forEach(file => {
    console.log('  -', file);
  });
  process.exit(1);
}

console.log('✅ Build files found, starting server...');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    port: port 
  });
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1d', // Cache static assets for 1 day
  etag: true
}));

// Handle client-side routing - serve index.html for all routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  console.log('📄 Serving index.html for:', req.path);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('❌ Error serving index.html:', err);
      res.status(500).send('Internal Server Error');
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, '0.0.0.0', (err) => {
  if (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
  console.log(`✅ Frontend server running on http://0.0.0.0:${port}`);
  console.log(`🔗 Health check: http://0.0.0.0:${port}/health`);
});