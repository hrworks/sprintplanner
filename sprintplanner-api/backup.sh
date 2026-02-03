#!/bin/bash
# SQLite Backup Script for Sprint Planner
# Add to crontab: 0 2 * * * /path/to/backup.sh

BACKUP_DIR="/backups/sprintplanner"
DB_PATH="/data/data.db"
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/data_$TIMESTAMP.db"

# Create backup using SQLite's backup command
sqlite3 "$DB_PATH" ".backup '$BACKUP_FILE'"

# Compress backup
gzip "$BACKUP_FILE"

# Remove old backups
find "$BACKUP_DIR" -name "*.db.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
