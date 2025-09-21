#!/bin/bash

echo "🔍 Monitoring frontend deployment progress..."
echo "Frontend URL: https://frontend-production-aeaaf.up.railway.app/"
echo ""

# Function to check frontend status
check_frontend() {
    local response=$(curl -s -o /dev/null -w "%{http_code}" https://frontend-production-aeaaf.up.railway.app/ 2>/dev/null)
    echo "$response"
}

# Function to check health endpoint
check_health() {
    local response=$(curl -s https://frontend-production-aeaaf.up.railway.app/health 2>/dev/null)
    echo "$response"
}

echo "⏱️  Checking deployment status every 30 seconds..."
echo "Press Ctrl+C to stop monitoring"
echo ""

counter=0
while true; do
    counter=$((counter + 1))
    timestamp=$(date '+%H:%M:%S')
    
    echo "[$timestamp] Check #$counter:"
    
    # Check main endpoint
    status_code=$(check_frontend)
    if [ "$status_code" = "200" ]; then
        echo "  ✅ Frontend: HTTP $status_code - SUCCESS!"
        
        # Check health endpoint
        health_response=$(check_health)
        if [[ "$health_response" == *"healthy"* ]]; then
            echo "  ✅ Health check: PASSED"
            echo ""
            echo "🎉 DEPLOYMENT SUCCESSFUL!"
            echo "🌐 Frontend is now live at: https://frontend-production-aeaaf.up.railway.app/"
            break
        else
            echo "  ⚠️  Health check: No response"
        fi
    elif [ "$status_code" = "502" ]; then
        echo "  ❌ Frontend: HTTP $status_code - Still deploying..."
    else
        echo "  ⚠️  Frontend: HTTP $status_code - Unexpected response"
    fi
    
    echo ""
    sleep 30
done