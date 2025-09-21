#!/bin/bash

echo "🚀 Deploying frontend fixes to Railway..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository. Please run from project root."
    exit 1
fi

# Add the changes
echo "📝 Adding frontend configuration changes..."
git add frontend/railway.json
git add frontend/nixpacks.toml
git add -u  # Add deleted Dockerfiles

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo "ℹ️  No changes to commit"
else
    # Commit the changes
    echo "💾 Committing changes..."
    git commit -m "Fix frontend 502 error: Switch to Nixpacks, remove Dockerfile conflicts

- Updated frontend/railway.json to use NIXPACKS builder
- Added frontend/nixpacks.toml with proper build configuration
- Removed conflicting Dockerfile and Dockerfile.prod
- Set explicit startCommand: node server.cjs"

    # Push to trigger Railway deployment
    echo "🚀 Pushing to trigger Railway deployment..."
    git push

    echo "✅ Changes pushed! Railway should start deploying automatically."
    echo ""
    echo "🔍 Monitor deployment at:"
    echo "   - Railway Dashboard: https://railway.app"
    echo "   - Frontend URL: https://frontend-production-aeaaf.up.railway.app/"
    echo ""
    echo "⏱️  Deployment typically takes 2-5 minutes"
    echo "🔄 You can check status with: curl -I https://frontend-production-aeaaf.up.railway.app/"
fi