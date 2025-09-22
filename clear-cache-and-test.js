#!/usr/bin/env node

// This script will help us understand what's happening with the frontend

const https = require('https');

console.log('🧹 Frontend Debug & Cache Clear Test\n');

// Test the API directly first
async function testAPI() {
  console.log('1. 🔍 Testing API directly...');
  
  try {
    const response = await fetch('https://shelftaught-production.up.railway.app/api/curricula?limit=3');
    const data = await response.json();
    
    if (data.success && data.data.curricula) {
      console.log(`   ✅ API working: ${data.data.curricula.length} curricula found`);
      return true;
    } else {
      console.log('   ❌ API not returning expected data');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ API error: ${error.message}`);
    return false;
  }
}

// Check if the issue is browser cache
function generateCacheBustingHTML() {
  const timestamp = Date.now();
  
  return `<!DOCTYPE html>
<html>
<head>
    <title>Cache-Busted Frontend Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .log { margin: 5px 0; padding: 5px; border-left: 3px solid #ccc; }
        .success { border-color: green; background: #f0fff0; }
        .error { border-color: red; background: #fff0f0; }
        .info { border-color: blue; background: #f0f0ff; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>Frontend Debug Test (Cache-Busted)</h1>
    <p>Generated at: ${new Date().toISOString()}</p>
    <div id="logs"></div>

    <script>
        const logs = document.getElementById('logs');
        
        function log(message, type = 'info') {
            const div = document.createElement('div');
            div.className = 'log ' + type;
            div.innerHTML = \`[\${new Date().toLocaleTimeString()}] \${message}\`;
            logs.appendChild(div);
            console.log(message);
        }

        // Simulate exact frontend API configuration
        const hostname = window.location.hostname;
        const isOnRailway = hostname.includes('railway.app') || 
                           hostname.includes('frontend-new-production-96a4.up.railway.app');
        const API_BASE_URL = isOnRailway 
          ? 'https://shelftaught-production.up.railway.app/api'
          : 'http://localhost:3001/api';

        log(\`🔧 Hostname: \${hostname}\`, 'info');
        log(\`🔧 Is on Railway: \${isOnRailway}\`, 'info');
        log(\`🔧 API Base URL: \${API_BASE_URL}\`, 'info');

        // Test the exact HomePage API call with cache busting
        async function testHomePageCall() {
            log('🏠 Testing HomePage API call...', 'info');
            
            try {
                // Add cache busting parameter
                const url = \`\${API_BASE_URL}/curricula?limit=6&sortBy=overallRating&sortOrder=desc&_cb=\${Date.now()}\`;
                log(\`📡 Calling: \${url}\`, 'info');
                
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    cache: 'no-cache' // Force no cache
                });
                
                log(\`📊 Response status: \${response.status}\`, response.ok ? 'success' : 'error');
                
                if (!response.ok) {
                    throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
                }
                
                const data = await response.json();
                log(\`📦 Response received\`, 'success');
                
                if (data.success && data.data && data.data.curricula) {
                    const curricula = data.data.curricula;
                    log(\`✅ Success: Found \${curricula.length} curricula\`, 'success');
                    
                    if (curricula.length > 0) {
                        const first = curricula[0];
                        log(\`📝 First curriculum: "\${first.name}" by \${first.publisher}\`, 'success');
                        
                        // Test property access
                        const subjects = first.subjects;
                        const gradeRange = first.gradeLevel?.ageRange;
                        
                        if (subjects && gradeRange) {
                            log(\`✅ Data structure correct: \${subjects.length} subjects, grade: "\${gradeRange}"\`, 'success');
                            
                            // Show what the frontend would render
                            const curriculumHTML = curricula.map(c => \`
                                <div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 4px;">
                                    <h4>\${c.name}</h4>
                                    <p><strong>Publisher:</strong> \${c.publisher}</p>
                                    <p><strong>Rating:</strong> \${c.overallRating}/5</p>
                                    <p><strong>Subjects:</strong> \${c.subjects.map(s => s.name).join(', ')}</p>
                                    <p><strong>Grade Range:</strong> \${c.gradeLevel.ageRange}</p>
                                    <p><strong>Description:</strong> \${c.description.substring(0, 100)}...</p>
                                </div>
                            \`).join('');
                            
                            document.body.innerHTML += \`
                                <h2>✅ Curricula Data (What Frontend Should Show)</h2>
                                \${curriculumHTML}
                            \`;
                        } else {
                            log(\`❌ Data structure issue: subjects=\${!!subjects}, gradeRange=\${!!gradeRange}\`, 'error');
                        }
                    } else {
                        log(\`⚠️ No curricula in response\`, 'error');
                    }
                } else {
                    log(\`❌ Invalid response structure\`, 'error');
                    log(\`📄 Response: \${JSON.stringify(data, null, 2)}\`, 'error');
                }
                
            } catch (error) {
                log(\`❌ API call failed: \${error.message}\`, 'error');
            }
        }

        // Run test after page loads
        setTimeout(testHomePageCall, 1000);
    </script>
</body>
</html>`;
}

async function main() {
  // Test API first
  const apiWorking = await testAPI();
  
  if (apiWorking) {
    console.log('\n2. 📝 Generating cache-busted test page...');
    
    const fs = require('fs');
    const html = generateCacheBustingHTML();
    fs.writeFileSync('test-frontend-fresh.html', html);
    
    console.log('   ✅ Created test-frontend-fresh.html');
    console.log('   🌐 Open this file in your browser to test frontend behavior');
    console.log('   📍 This will help identify if the issue is:');
    console.log('      - Browser cache');
    console.log('      - API configuration');
    console.log('      - Data processing');
    console.log('      - React rendering');
  }
  
  console.log('\n3. 🎯 Next Steps:');
  console.log('   1. Open test-frontend-fresh.html in your browser');
  console.log('   2. Check browser console for any errors');
  console.log('   3. If test page shows curricula but React app doesn\'t, issue is in React');
  console.log('   4. If test page also fails, issue is in API configuration');
}

// Use node-fetch for older Node versions
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

main().catch(console.error);