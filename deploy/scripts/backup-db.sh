#!/bin/bash

# --- CONFIGURATION ---
DB_NAME="ingetin_db"
DB_USER="postgres"
BACKUP_DIR="/tmp/ingetin_backups"
REMOTE_NAME="gdrive"
REMOTE_DIR="Ingetin_Backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="backup_${DB_NAME}_${TIMESTAMP}.sql.gz"

# 1. Create backup directory
mkdir -p $BACKUP_DIR

# 2. Dump Database
echo "🚀 Starting database dump..."
pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/$FILENAME

# 3. Upload to Google Drive (using rclone)
echo "☁️ Uploading to Google Drive..."
rclone copy $BACKUP_DIR/$FILENAME $REMOTE_NAME:$REMOTE_DIR

# 4. Cleanup local backup
echo "🧹 Cleaning up local file..."
rm $BACKUP_DIR/$FILENAME

# 5. Optional: Keep only last 7 days on Drive
# rclone delete --min-age 7d $REMOTE_NAME:$REMOTE_DIR

echo "✅ Backup complete: $FILENAME"
