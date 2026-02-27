#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# European Alternatives — Database Backup
# =============================================================================
# Creates a compressed MySQL dump with 30-day retention.
#
# Usage:
#   bash scripts/db-backup.sh
#
# Environment variables:
#   EUROALT_DB_HOST   (required) MySQL host
#   EUROALT_DB_PORT   (optional, default: 3306)
#   EUROALT_DB_NAME   (required) Database name
#   EUROALT_DB_USER   (required) MySQL user
#   EUROALT_DB_PASS   (required) MySQL password
#   RETENTION_DAYS    (optional, default: 30) Delete backups older than N days
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/tmp/backups"

# ---------------------------------------------------------------------------
# Validate required environment variables
# ---------------------------------------------------------------------------
missing=()
for var in EUROALT_DB_HOST EUROALT_DB_NAME EUROALT_DB_USER EUROALT_DB_PASS; do
    if [ -z "${!var:-}" ]; then
        missing+=("$var")
    fi
done

if [ "${#missing[@]}" -gt 0 ]; then
    echo "ERROR: Missing required environment variables: ${missing[*]}" >&2
    echo "Set them before running this script." >&2
    exit 1
fi

DB_HOST="$EUROALT_DB_HOST"
DB_PORT="${EUROALT_DB_PORT:-3306}"
DB_NAME="$EUROALT_DB_NAME"
DB_USER="$EUROALT_DB_USER"
DB_PASS="$EUROALT_DB_PASS"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# ---------------------------------------------------------------------------
# Create backup directory if needed
# ---------------------------------------------------------------------------
mkdir -p "$BACKUP_DIR"

# ---------------------------------------------------------------------------
# Generate backup filename with timestamp
# ---------------------------------------------------------------------------
TIMESTAMP="$(date +%Y-%m-%d-%H%M%S)"
BACKUP_FILE="$BACKUP_DIR/euroalt-${TIMESTAMP}.sql.gz"

echo "=== European Alternatives — Database Backup ==="
echo "    Host:      $DB_HOST:$DB_PORT"
echo "    Database:  $DB_NAME"
echo "    Target:    $BACKUP_FILE"
echo ""

# ---------------------------------------------------------------------------
# Create compressed dump (InnoDB-consistent via --single-transaction)
# ---------------------------------------------------------------------------
echo "Creating backup..."

mysqldump \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --user="$DB_USER" \
    --password="$DB_PASS" \
    --single-transaction \
    --routines \
    --triggers \
    --set-gtid-purged=OFF \
    "$DB_NAME" \
    | gzip > "$BACKUP_FILE"

# Verify the file was created and is non-empty
if [ ! -s "$BACKUP_FILE" ]; then
    echo "ERROR: Backup file is empty or was not created." >&2
    rm -f "$BACKUP_FILE"
    exit 1
fi

BACKUP_SIZE="$(du -h "$BACKUP_FILE" | cut -f1)"
echo "    Backup created: $BACKUP_FILE ($BACKUP_SIZE)"

# ---------------------------------------------------------------------------
# Clean up old backups beyond retention period
# ---------------------------------------------------------------------------
echo ""
echo "Cleaning backups older than $RETENTION_DAYS days..."

DELETED_COUNT=0
while IFS= read -r -d '' old_file; do
    rm -f "$old_file"
    echo "    Deleted: $(basename "$old_file")"
    DELETED_COUNT=$((DELETED_COUNT + 1))
done < <(find "$BACKUP_DIR" -name 'euroalt-*.sql.gz' -type f -mtime +"$RETENTION_DAYS" -print0 2>/dev/null)

if [ "$DELETED_COUNT" -eq 0 ]; then
    echo "    No old backups to clean up."
else
    echo "    Deleted $DELETED_COUNT old backup(s)."
fi

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
TOTAL_BACKUPS="$(find "$BACKUP_DIR" -name 'euroalt-*.sql.gz' -type f 2>/dev/null | wc -l)"

echo ""
echo "=== Backup Complete ==="
echo "    File:            $BACKUP_FILE"
echo "    Size:            $BACKUP_SIZE"
echo "    Retention:       $RETENTION_DAYS days"
echo "    Total backups:   $TOTAL_BACKUPS"
