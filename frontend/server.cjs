const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');

console.log('🚀 Starting frontend server...');
console.log('📁 Serving from:', distPath);
console.log('🌐 Port:', port);
console.log('📂 Working directory:', __dirname);
console.log('🔍 NODE_ENV:', process.env.NODE_ENV);

// Check if dist directory exists
if (!fs.existsSync(distPath)) {
  console.error('❌ Dist directory does not exist:', distPath);
  console.log('📂 Current directory contents:');
  try {
    fs.readdirSync(__dirname).forEach(file => {
      console.log('  -', file);
    });
  } catch (e) {
    console.error('❌ Cannot read directory:', e.message);
  }
  process.exit(1);
}

// Check if index.html exists
const indexPath = path.join(distPath, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('❌ index.html does not exist:', indexPath);
  console.log('📂 Dist directory contents:');
  try {
    fs.readdirSync(distPath).forEach(file => {
      console.log('  -', file);
    });
  } catch (e) {
    console.error('❌ Cannot read dist directory:', e.message);
  }
  process.exit(1);
}

console.log('✅ Build files found, starting server...');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    port: port,
    distPath: distPath,
    indexExists: fs.existsSync(indexPath)
  });
});

// Serve static files from the dist directory with proper headers
app.use(express.static(distPath, {
  maxAge: '1d',
  etag: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Handle client-side routing - serve index.html for all routes
app.get('*', (req, res) => {
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

// Start server with better error handling
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Frontend server running on http://0.0.0.0:${port}`);
  console.log(`🔗 Health check: http://0.0.0.0:${port}/health`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${port} is already in use`);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});