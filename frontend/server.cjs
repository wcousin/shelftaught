const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

console.log('🚀 Starting frontend server...');
console.log('🌐 Port:', port);
console.log('📁 Dist path:', distPath);
console.log('🔍 NODE_ENV:', process.env.NODE_ENV);

// Verify build files exist
if (!fs.existsSync(distPath)) {
  console.error('❌ Dist directory missing:', distPath);
  process.exit(1);
}

if (!fs.existsSync(indexPath)) {
  console.error('❌ index.html missing:', indexPath);
  process.exit(1);
}

console.log('✅ Build files verified');

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} from ${req.ip}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    port: port
  });
});

// Serve static files
app.use(express.static(distPath));

// SPA fallback - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(indexPath);
});

// Start server
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${port}`);
  console.log(`🔗 Health check: http://0.0.0.0:${port}/health`);
  console.log(`🌍 Environment variables:`);
  console.log(`   PORT: ${process.env.PORT}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${port} is already in use`);
  }
  process.exit(1);
});

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} from ${req.ip}`);
  next();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 Shutting down...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('🔄 Shutting down...');
  server.close(() => process.exit(0));
});