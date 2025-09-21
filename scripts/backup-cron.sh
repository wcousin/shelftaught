#!/bin/bash

# Cron Job Setup Script for Automated Backups

set -e

CRON_SCHEDULE=${BACKUP_SCHEDULE:-"0 2 * * *"}  # Default: Daily at 2 AM
BACKUP_SCRIPT="/app/scripts/backup.sh"
CRON_USER=${CRON_USER:-"root"}

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "Setting up automated backup cron job..."
log "Schedule: $CRON_SCHEDULE"
log "Script: $BACKUP_SCRIPT"
log "User: $CRON_USER"

# Create cron job entry
CRON_JOB="$CRON_SCHEDULE cd /app && $BACKUP_SCRIPT >> /var/log/backup.log 2>&1"

# Add cron job
echo "$CRON_JOB" | crontab -u $CRON_USER -

log "Cron job installed successfully"

# Create log rotation for backup logs
cat > /etc/logrotate.d/backup << EOF
/var/log/backup.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
}
EOF

log "Log rotation configured"

# Display current cron jobs
log "Current cron jobs for user $CRON_USER:"
crontab -u $CRON_USER -l

log "Automated backup setup completed"
log ""
log "Backup schedule: $CRON_SCHEDULE"
log "Log file: /var/log/backup.log"
log ""
log "To manually run backup: $BACKUP_SCRIPT"
log "To view backup logs: tail -f /var/log/backup.log"