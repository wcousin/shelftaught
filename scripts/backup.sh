#!/bin/bash

# Database Backup Script for Shelf Taught

set -e

# Configuration
BACKUP_DIR="/backups"
DB_HOST=${POSTGRES_HOST:-"postgres"}
DB_NAME=${POSTGRES_DB:-"shelftaught_prod"}
DB_USER=${POSTGRES_USER:-"shelftaught_user"}
DB_PASSWORD=${POSTGRES_PASSWORD}
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="shelftaught_backup_${TIMESTAMP}.sql"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Check if required environment variables are set
if [ -z "$DB_PASSWORD" ]; then
    log "ERROR: POSTGRES_PASSWORD environment variable is not set"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

log "Starting database backup..."
log "Database: $DB_NAME"
log "Host: $DB_HOST"
log "User: $DB_USER"
log "Backup file: $BACKUP_FILE"

# Set password for pg_dump
export PGPASSWORD=$DB_PASSWORD

# Create database backup
log "Creating database dump..."
if pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME \
    --verbose \
    --no-password \
    --format=custom \
    --compress=9 \
    --file=$BACKUP_PATH; then
    
    log "Database backup completed successfully"
    
    # Get backup file size
    BACKUP_SIZE=$(du -h $BACKUP_PATH | cut -f1)
    log "Backup size: $BACKUP_SIZE"
    
    # Create a compressed version for long-term storage
    COMPRESSED_BACKUP="${BACKUP_PATH}.gz"
    gzip -c $BACKUP_PATH > $COMPRESSED_BACKUP
    
    COMPRESSED_SIZE=$(du -h $COMPRESSED_BACKUP | cut -f1)
    log "Compressed backup size: $COMPRESSED_SIZE"
    
    # Create backup metadata
    cat > "${BACKUP_PATH}.meta" << EOF
{
  "timestamp": "$TIMESTAMP",
  "database": "$DB_NAME",
  "host": "$DB_HOST",
  "user": "$DB_USER",
  "backup_file": "$BACKUP_FILE",
  "backup_size": "$BACKUP_SIZE",
  "compressed_file": "$(basename $COMPRESSED_BACKUP)",
  "compressed_size": "$COMPRESSED_SIZE",
  "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "retention_days": $RETENTION_DAYS
}
EOF
    
    log "Backup metadata created"
    
else
    log "ERROR: Database backup failed"
    exit 1
fi

# Clean up old backups
log "Cleaning up old backups (older than $RETENTION_DAYS days)..."

# Find and remove old backup files
find $BACKUP_DIR -name "shelftaught_backup_*.sql" -type f -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "shelftaught_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "shelftaught_backup_*.sql.meta" -type f -mtime +$RETENTION_DAYS -delete

# Count remaining backups
BACKUP_COUNT=$(find $BACKUP_DIR -name "shelftaught_backup_*.sql" -type f | wc -l)
log "Cleanup completed. $BACKUP_COUNT backups remaining"

# Verify backup integrity
log "Verifying backup integrity..."
if pg_restore --list $BACKUP_PATH > /dev/null 2>&1; then
    log "Backup integrity verification passed"
else
    log "WARNING: Backup integrity verification failed"
    exit 1
fi

# Create backup report
REPORT_FILE="${BACKUP_DIR}/backup_report_${TIMESTAMP}.json"
cat > $REPORT_FILE << EOF
{
  "backup_id": "$TIMESTAMP",
  "status": "success",
  "database": "$DB_NAME",
  "backup_file": "$BACKUP_FILE",
  "backup_size": "$BACKUP_SIZE",
  "compressed_size": "$COMPRESSED_SIZE",
  "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "retention_days": $RETENTION_DAYS,
  "remaining_backups": $BACKUP_COUNT,
  "integrity_check": "passed"
}
EOF

log "Backup completed successfully!"
log "Report saved to: $REPORT_FILE"

# Optional: Send notification (webhook, email, etc.)
if [ ! -z "$BACKUP_WEBHOOK_URL" ]; then
    log "Sending backup notification..."
    curl -X POST "$BACKUP_WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d @$REPORT_FILE \
        --max-time 30 \
        --silent || log "WARNING: Failed to send backup notification"
fi

# Unset password
unset PGPASSWORD

log "Backup process completed"