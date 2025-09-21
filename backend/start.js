const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Starting backend deployment script...');

// Set NODE_ENV if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
console.log('🔍 NODE_ENV:', process.env.NODE_ENV);

const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.js');

// Check if dist directory exists, if not build it
if (!fs.existsSync(distPath)) {
    console.log('📦 Dist directory not found, building TypeScript...');
    
    try {
        // Generate Prisma client
        console.log('🔧 Generating Prisma client...');
        execSync('npx prisma generate', { stdio: 'inherit' });
        
        // Build TypeScript
        console.log('🔨 Building TypeScript...');
        execSync('npm run build', { stdio: 'inherit' });
        
        // Check if build was successful
        if (!fs.existsSync(distPath)) {
            console.error('❌ Build failed - dist directory still doesn\'t exist');
            process.exit(1);
        }
        
        // Run database migrations
        console.log('🗄️ Running database migrations...');
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
        
        // Seed the database
        console.log('🌱 Seeding database...');
        try {
            execSync('npx prisma db seed', { stdio: 'inherit' });
            console.log('✅ Database seeded successfully');
        } catch (seedError) {
            console.warn('⚠️ Database seeding failed (might already be seeded):', seedError.message);
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

// Verify index.js exists
if (!fs.existsSync(indexPath)) {
    console.error('❌ index.js not found in dist directory');
    process.exit(1);
}

// Start the server
console.log('🚀 Starting backend server...');
try {
    require('./dist/index.js');
} catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
}