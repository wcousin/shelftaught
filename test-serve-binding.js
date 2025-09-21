#!/usr/bin/env node

const { spawn } = require('child_process');
const http = require('http');

console.log('🧪 Testing serve command binding...\n');

// Test different serve configurations
const tests = [
  {
    name: 'Default serve (localhost only)',
    cmd: 'npx',
    args: ['serve', '-s', 'frontend/dist', '-l', '3001']
  },
  {
    name: 'Serve with -H 0.0.0.0 (all interfaces)',
    cmd: 'npx', 
    args: ['serve', '-s', 'frontend/dist', '-l', '3002', '-H', '0.0.0.0']
  }
];

async function testServeConfig(test) {
  console.log(`Testing: ${test.name}`);
  console.log(`Command: ${test.cmd} ${test.args.join(' ')}`);
  
  return new Promise((resolve) => {
    const proc = spawn(test.cmd, test.args, {
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    let output = '';
    proc.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    proc.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    // Give it time to start
    setTimeout(() => {
      console.log('Output:', output);
      proc.kill();
      resolve();
    }, 3000);
  });
}

async function runTests() {
  // First check if dist exists
  const fs = require('fs');
  if (!fs.existsSync('frontend/dist')) {
    console.log('❌ frontend/dist does not exist. Building first...');
    
    const buildProc = spawn('npm', ['run', 'build'], {
      cwd: 'frontend',
      stdio: 'inherit'
    });
    
    await new Promise((resolve) => {
      buildProc.on('close', resolve);
    });
  }
  
  console.log('✅ frontend/dist exists\n');
  
  for (const test of tests) {
    await testServeConfig(test);
    console.log('');
  }
  
  console.log('🔍 Key Insight:');
  console.log('Railway requires applications to bind to 0.0.0.0 (all interfaces)');
  console.log('The -H 0.0.0.0 flag should fix the 502 error');
}

runTests().catch(console.error);