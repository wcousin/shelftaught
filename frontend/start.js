const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Starting frontend deployment script...');

// Set NODE_ENV if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
console.log('📂 Working directory:', __dirname);
console.log('🌐 Port:', process.env.PORT || 'not set');

const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

// Check if dist directory exists, if not build it
if (!fs.existsSync(distPath)) {
    console.log('📦 Dist directory not found, building...');
    
    try {
        // Build the frontend
        console.log('🔨 Building frontend...');
        execSync('npm run build', { stdio: 'inherit' });
        
        // Check if build was successful
        if (!fs.existsSync(distPath)) {
            console.error('❌ Build failed - dist directory still doesn\'t exist');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Build process failed:', error.message);
        process.exit(1);
    }
} else {
    console.log('✅ Dist directory found');
}

// List contents for debugging
console.log('📂 Current directory contents:');
try {
    const files = fs.readdirSync(__dirname);
    files.forEach(file => console.log('  -', file));
} catch (error) {
    console.error('❌ Error listing directory:', error.message);
}

console.log('📂 Dist directory contents:');
try {
    const files = fs.readdirSync(distPath);
    files.forEach(file => console.log('  -', file));
} catch (error) {
    console.error('❌ No dist directory or error listing:', error.message);
}

// Verify index.html exists
if (!fs.existsSync(indexPath)) {
    console.error('❌ index.html not found in dist directory');
    process.exit(1);
}

// Start the Express server
console.log('🚀 Starting Express server...');
try {
    require('./server.cjs');
} catch (error) {
    console.error('❌ Failed to start Express server:', error.message);
    process.exit(1);
}