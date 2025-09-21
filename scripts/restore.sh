#!/bin/bash

# Database Restore Script for Shelf Taught

set -e

# Configuration
BACKUP_DIR="/backups"
DB_HOST=${POSTGRES_HOST:-"postgres"}
DB_NAME=${POSTGRES_DB:-"shelftaught_prod"}
DB_USER=${POSTGRES_USER:-"shelftaught_user"}
DB_PASSWORD=${POSTGRES_PASSWORD}

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Usage function
usage() {
    echo "Usage: $0 [OPTIONS] BACKUP_FILE"
    echo ""
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -l, --list          List available backups"
    echo "  -f, --force         Force restore without confirmation"
    echo "  -c, --clean         Clean database before restore"
    echo ""
    echo "Examples:"
    echo "  $0 --list"
    echo "  $0 shelftaught_backup_20231220_120000.sql"
    echo "  $0 --force --clean shelftaught_backup_20231220_120000.sql"
}

# List available backups
list_backups() {
    log "Available backups in $BACKUP_DIR:"
    echo ""
    
    if [ ! -d "$BACKUP_DIR" ]; then
        log "Backup directory does not exist: $BACKUP_DIR"
        exit 1
    fi
    
    # Find backup files and their metadata
    for backup in $(find $BACKUP_DIR -name "shelftaught_backup_*.sql" -type f | sort -r); do
        backup_name=$(basename $backup)
        meta_file="${backup}.meta"
        
        if [ -f "$meta_file" ]; then
            # Extract metadata
            size=$(grep '"backup_size"' $meta_file | cut -d'"' -f4)
            created=$(grep '"created_at"' $meta_file | cut -d'"' -f4)
            echo "📁 $backup_name"
            echo "   Size: $size"
            echo "   Created: $created"
        else
            # Fallback to file stats
            size=$(du -h $backup | cut -f1)
            created=$(stat -c %y $backup 2>/dev/null || stat -f %Sm $backup)
            echo "📁 $backup_name"
            echo "   Size: $size"
            echo "   Created: $created"
        fi
        echo ""
    done
}

# Verify backup file
verify_backup() {
    local backup_file=$1
    
    log "Verifying backup file: $backup_file"
    
    if [ ! -f "$backup_file" ]; then
        log "ERROR: Backup file not found: $backup_file"
        exit 1
    fi
    
    # Check if it's a valid PostgreSQL backup
    if ! pg_restore --list "$backup_file" > /dev/null 2>&1; then
        log "ERROR: Invalid PostgreSQL backup file"
        exit 1
    fi
    
    log "Backup file verification passed"
}

# Restore database
restore_database() {
    local backup_file=$1
    local clean_db=$2
    
    log "Starting database restore..."
    log "Backup file: $backup_file"
    log "Target database: $DB_NAME"
    log "Host: $DB_HOST"
    log "User: $DB_USER"
    
    # Set password for PostgreSQL commands
    export PGPASSWORD=$DB_PASSWORD
    
    # Clean database if requested
    if [ "$clean_db" = "true" ]; then
        log "Cleaning existing database..."
        
        # Drop and recreate database
        psql -h $DB_HOST -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
        psql -h $DB_HOST -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;"
        
        log "Database cleaned and recreated"
    fi
    
    # Restore database
    log "Restoring database from backup..."
    if pg_restore -h $DB_HOST -U $DB_USER -d $DB_NAME \
        --verbose \
        --no-password \
        --clean \
        --if-exists \
        --no-owner \
        --no-privileges \
        "$backup_file"; then
        
        log "Database restore completed successfully"
        
        # Run post-restore checks
        log "Running post-restore verification..."
        
        # Check if tables exist
        table_count=$(psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
        log "Tables restored: $table_count"
        
        # Check curriculum count
        curriculum_count=$(psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM \"Curriculum\";" 2>/dev/null | xargs || echo "0")
        log "Curriculum records: $curriculum_count"
        
        # Check user count
        user_count=$(psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM \"User\";" 2>/dev/null | xargs || echo "0")
        log "User records: $user_count"
        
    else
        log "ERROR: Database restore failed"
        exit 1
    fi
    
    # Unset password
    unset PGPASSWORD
}

# Parse command line arguments
FORCE=false
CLEAN=false
BACKUP_FILE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            exit 0
            ;;
        -l|--list)
            list_backups
            exit 0
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -c|--clean)
            CLEAN=true
            shift
            ;;
        -*)
            log "ERROR: Unknown option $1"
            usage
            exit 1
            ;;
        *)
            BACKUP_FILE=$1
            shift
            ;;
    esac
done

# Check if backup file is provided
if [ -z "$BACKUP_FILE" ]; then
    log "ERROR: Backup file not specified"
    usage
    exit 1
fi

# Check if required environment variables are set
if [ -z "$DB_PASSWORD" ]; then
    log "ERROR: POSTGRES_PASSWORD environment variable is not set"
    exit 1
fi

# Convert relative path to absolute path
if [[ "$BACKUP_FILE" != /* ]]; then
    BACKUP_FILE="$BACKUP_DIR/$BACKUP_FILE"
fi

# Verify backup file
verify_backup "$BACKUP_FILE"

# Confirmation prompt (unless forced)
if [ "$FORCE" != "true" ]; then
    echo ""
    log "⚠️  WARNING: This will restore the database from backup"
    if [ "$CLEAN" = "true" ]; then
        log "⚠️  WARNING: The existing database will be completely replaced"
    fi
    echo ""
    read -p "Are you sure you want to continue? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log "Restore cancelled by user"
        exit 0
    fi
fi

# Perform restore
restore_database "$BACKUP_FILE" "$CLEAN"

log "Restore process completed successfully!"
log ""
log "Next steps:"
log "1. Verify application functionality"
log "2. Check data integrity"
log "3. Update any necessary configurations"