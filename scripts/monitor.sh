#!/bin/bash

# Simple Monitoring Dashboard for Shelf Taught

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
HEALTH_URL=${HEALTH_URL:-"http://localhost/health"}
DETAILED_HEALTH_URL=${DETAILED_HEALTH_URL:-"http://localhost/health/detailed"}
LOG_DIR=${LOG_DIR:-"logs"}
BACKUP_DIR=${BACKUP_DIR:-"backups"}

# Helper functions
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Shelf Taught Monitoring Dashboard${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

print_section() {
    echo -e "${YELLOW}$1${NC}"
    echo "----------------------------------------"
}

check_service_health() {
    print_section "🏥 Service Health"
    
    if curl -s --max-time 5 "$HEALTH_URL" > /dev/null 2>&1; then
        echo -e "✅ Health endpoint: ${GREEN}OK${NC}"
        
        # Get detailed health info
        health_response=$(curl -s --max-time 5 "$DETAILED_HEALTH_URL" 2>/dev/null || echo '{}')
        
        # Parse health response
        status=$(echo "$health_response" | grep -o '"status":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "unknown")
        uptime=$(echo "$health_response" | grep -o '"uptime":[0-9.]*' | cut -d':' -f2 2>/dev/null || echo "0")
        
        if [ "$status" = "healthy" ]; then
            echo -e "✅ Service status: ${GREEN}$status${NC}"
        else
            echo -e "❌ Service status: ${RED}$status${NC}"
        fi
        
        if [ "$uptime" != "0" ]; then
            uptime_hours=$(echo "scale=2; $uptime / 3600" | bc 2>/dev/null || echo "0")
            echo -e "⏱️  Uptime: ${GREEN}${uptime_hours} hours${NC}"
        fi
        
    else
        echo -e "❌ Health endpoint: ${RED}FAILED${NC}"
    fi
    echo ""
}

check_docker_services() {
    print_section "🐳 Docker Services"
    
    if command -v docker-compose &> /dev/null; then
        # Check if production compose file exists
        if [ -f "docker-compose.prod.yml" ]; then
            compose_file="docker-compose.prod.yml"
        else
            compose_file="docker-compose.yml"
        fi
        
        echo "Using compose file: $compose_file"
        echo ""
        
        # Get service status
        services=$(docker-compose -f "$compose_file" ps --services 2>/dev/null || echo "")
        
        if [ -n "$services" ]; then
            for service in $services; do
                status=$(docker-compose -f "$compose_file" ps "$service" 2>/dev/null | tail -n +3 | awk '{print $4}' || echo "unknown")
                
                if [[ "$status" == *"Up"* ]]; then
                    echo -e "✅ $service: ${GREEN}$status${NC}"
                else
                    echo -e "❌ $service: ${RED}$status${NC}"
                fi
            done
        else
            echo -e "⚠️  No Docker services found"
        fi
    else
        echo -e "⚠️  Docker Compose not available"
    fi
    echo ""
}

check_system_resources() {
    print_section "💻 System Resources"
    
    # Memory usage
    if command -v free &> /dev/null; then
        memory_info=$(free -h | grep '^Mem:')
        memory_used=$(echo $memory_info | awk '{print $3}')
        memory_total=$(echo $memory_info | awk '{print $2}')
        memory_percent=$(free | grep '^Mem:' | awk '{printf "%.1f", ($3/$2) * 100.0}')
        
        if (( $(echo "$memory_percent > 80" | bc -l) )); then
            echo -e "⚠️  Memory: ${YELLOW}$memory_used/$memory_total (${memory_percent}%)${NC}"
        else
            echo -e "✅ Memory: ${GREEN}$memory_used/$memory_total (${memory_percent}%)${NC}"
        fi
    fi
    
    # Disk usage
    if command -v df &> /dev/null; then
        disk_usage=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
        disk_info=$(df -h . | tail -1 | awk '{print $3"/"$2}')
        
        if [ "$disk_usage" -gt 85 ]; then
            echo -e "⚠️  Disk: ${YELLOW}$disk_info (${disk_usage}%)${NC}"
        else
            echo -e "✅ Disk: ${GREEN}$disk_info (${disk_usage}%)${NC}"
        fi
    fi
    
    # Load average
    if command -v uptime &> /dev/null; then
        load_avg=$(uptime | awk -F'load average:' '{print $2}' | sed 's/^ *//')
        echo -e "📊 Load average: ${BLUE}$load_avg${NC}"
    fi
    echo ""
}

check_logs() {
    print_section "📋 Recent Logs"
    
    if [ -d "$LOG_DIR" ]; then
        # Check for recent errors
        error_count=$(find "$LOG_DIR" -name "*.log" -mtime -1 -exec grep -i "error" {} \; 2>/dev/null | wc -l)
        warning_count=$(find "$LOG_DIR" -name "*.log" -mtime -1 -exec grep -i "warn" {} \; 2>/dev/null | wc -l)
        
        if [ "$error_count" -gt 0 ]; then
            echo -e "❌ Errors (24h): ${RED}$error_count${NC}"
        else
            echo -e "✅ Errors (24h): ${GREEN}$error_count${NC}"
        fi
        
        if [ "$warning_count" -gt 10 ]; then
            echo -e "⚠️  Warnings (24h): ${YELLOW}$warning_count${NC}"
        else
            echo -e "✅ Warnings (24h): ${GREEN}$warning_count${NC}"
        fi
        
        # Show recent log files
        echo ""
        echo "Recent log files:"
        ls -lht "$LOG_DIR"/*.log 2>/dev/null | head -5 | while read line; do
            echo "  $line"
        done
        
    else
        echo -e "⚠️  Log directory not found: $LOG_DIR"
    fi
    echo ""
}

check_backups() {
    print_section "💾 Backup Status"
    
    if [ -d "$BACKUP_DIR" ]; then
        # Find latest backup
        latest_backup=$(find "$BACKUP_DIR" -name "shelftaught_backup_*.sql" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)
        
        if [ -n "$latest_backup" ]; then
            backup_age=$(find "$BACKUP_DIR" -name "$(basename "$latest_backup")" -mtime +1 2>/dev/null)
            backup_size=$(du -h "$latest_backup" 2>/dev/null | cut -f1)
            backup_date=$(stat -c %y "$latest_backup" 2>/dev/null | cut -d' ' -f1)
            
            if [ -z "$backup_age" ]; then
                echo -e "✅ Latest backup: ${GREEN}$(basename "$latest_backup")${NC}"
            else
                echo -e "⚠️  Latest backup: ${YELLOW}$(basename "$latest_backup") (older than 24h)${NC}"
            fi
            
            echo -e "📅 Date: ${BLUE}$backup_date${NC}"
            echo -e "📦 Size: ${BLUE}$backup_size${NC}"
            
            # Count total backups
            backup_count=$(find "$BACKUP_DIR" -name "shelftaught_backup_*.sql" -type f | wc -l)
            echo -e "📊 Total backups: ${BLUE}$backup_count${NC}"
        else
            echo -e "❌ No backups found"
        fi
    else
        echo -e "⚠️  Backup directory not found: $BACKUP_DIR"
    fi
    echo ""
}

check_ssl_certificates() {
    print_section "🔒 SSL Certificates"
    
    if [ -f "ssl/cert.pem" ]; then
        # Check certificate expiry
        expiry_date=$(openssl x509 -in ssl/cert.pem -noout -enddate 2>/dev/null | cut -d= -f2)
        
        if [ -n "$expiry_date" ]; then
            expiry_timestamp=$(date -d "$expiry_date" +%s 2>/dev/null || echo "0")
            current_timestamp=$(date +%s)
            days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
            
            if [ "$days_until_expiry" -lt 30 ]; then
                echo -e "⚠️  Certificate expires in: ${YELLOW}$days_until_expiry days${NC}"
            else
                echo -e "✅ Certificate expires in: ${GREEN}$days_until_expiry days${NC}"
            fi
            
            echo -e "📅 Expiry date: ${BLUE}$expiry_date${NC}"
        else
            echo -e "❌ Could not read certificate expiry"
        fi
    else
        echo -e "⚠️  SSL certificate not found: ssl/cert.pem"
    fi
    echo ""
}

show_quick_actions() {
    print_section "🚀 Quick Actions"
    
    echo "View logs:"
    echo "  tail -f logs/combined.log"
    echo "  tail -f logs/error.log"
    echo ""
    echo "Service management:"
    echo "  docker-compose -f docker-compose.prod.yml restart"
    echo "  docker-compose -f docker-compose.prod.yml logs -f"
    echo ""
    echo "Backup management:"
    echo "  ./scripts/backup.sh"
    echo "  ./scripts/restore.sh --list"
    echo ""
    echo "Health checks:"
    echo "  curl $HEALTH_URL"
    echo "  curl $DETAILED_HEALTH_URL"
    echo ""
}

# Main execution
main() {
    clear
    print_header
    
    check_service_health
    check_docker_services
    check_system_resources
    check_logs
    check_backups
    check_ssl_certificates
    show_quick_actions
    
    echo -e "${BLUE}Last updated: $(date)${NC}"
}

# Run monitoring dashboard
if [ "$1" = "--watch" ]; then
    # Watch mode - refresh every 30 seconds
    while true; do
        main
        sleep 30
    done
else
    # Single run
    main
fi