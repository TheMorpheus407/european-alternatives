#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# European Alternatives — Database Restore
# =============================================================================
# Restores a MySQL database from a backup file (.sql.gz or .sql).
#
# Usage:
#   bash scripts/db-restore.sh path/to/backup.sql.gz
#   bash scripts/db-restore.sh path/to/backup.sql.gz --force
#
# Environment variables:
#   EUROALT_DB_HOST   (required) MySQL host
#   EUROALT_DB_PORT   (optional, default: 3306)
#   EUROALT_DB_NAME   (required) Database name
#   EUROALT_DB_USER   (required) MySQL user
#   EUROALT_DB_PASS   (required) MySQL password
# =============================================================================

# ---------------------------------------------------------------------------
# Parse arguments
# ---------------------------------------------------------------------------
BACKUP_FILE=""
FORCE=false

for arg in "$@"; do
    case "$arg" in
        --force)
            FORCE=true
            ;;
        -*)
            echo "ERROR: Unknown option: $arg" >&2
            echo "Usage: $0 <backup-file> [--force]" >&2
            exit 1
            ;;
        *)
            if [ -z "$BACKUP_FILE" ]; then
                BACKUP_FILE="$arg"
            else
                echo "ERROR: Unexpected argument: $arg" >&2
                echo "Usage: $0 <backup-file> [--force]" >&2
                exit 1
            fi
            ;;
    esac
done

if [ -z "$BACKUP_FILE" ]; then
    echo "ERROR: Backup file path is required." >&2
    echo "Usage: $0 <backup-file> [--force]" >&2
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: File not found: $BACKUP_FILE" >&2
    exit 1
fi

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

# ---------------------------------------------------------------------------
# Determine file type
# ---------------------------------------------------------------------------
case "$BACKUP_FILE" in
    *.sql.gz)
        FILE_TYPE="compressed"
        ;;
    *.sql)
        FILE_TYPE="uncompressed"
        ;;
    *)
        echo "ERROR: Unsupported file type. Expected .sql.gz or .sql" >&2
        exit 1
        ;;
esac

FILE_SIZE="$(du -h "$BACKUP_FILE" | cut -f1)"

# ---------------------------------------------------------------------------
# Safety confirmation
# ---------------------------------------------------------------------------
echo "=== European Alternatives — Database Restore ==="
echo ""
echo "    WARNING: This will DROP all tables and restore from backup."
echo ""
echo "    Host:      $DB_HOST:$DB_PORT"
echo "    Database:  $DB_NAME"
echo "    Backup:    $BACKUP_FILE ($FILE_SIZE, $FILE_TYPE)"
echo ""

if [ "$FORCE" != true ]; then
    echo -n "    Are you sure you want to proceed? [y/N] "
    read -r CONFIRM
    if [ "${CONFIRM,,}" != "y" ]; then
        echo "    Restore cancelled."
        exit 0
    fi
fi

echo ""

# ---------------------------------------------------------------------------
# Drop all existing tables (reverse FK order from db-schema.sql)
# ---------------------------------------------------------------------------
echo "Dropping existing tables..."

mysql \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --user="$DB_USER" \
    --password="$DB_PASS" \
    "$DB_NAME" <<'SQL'
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS
    landing_group_categories,
    landing_category_groups,
    further_reading_resources,
    denied_decisions,
    scoring_metadata,
    positive_signals,
    reservations,
    entry_replacements,
    category_us_vendors,
    entry_tags,
    entry_categories,
    catalog_entries,
    tags,
    categories,
    countries,
    schema_migrations;
SET FOREIGN_KEY_CHECKS = 1;
SQL

echo "    Tables dropped."

# ---------------------------------------------------------------------------
# Import the backup
# ---------------------------------------------------------------------------
echo "Importing backup..."

if [ "$FILE_TYPE" = "compressed" ]; then
    gunzip -c "$BACKUP_FILE" \
        | mysql \
            --host="$DB_HOST" \
            --port="$DB_PORT" \
            --user="$DB_USER" \
            --password="$DB_PASS" \
            "$DB_NAME"
else
    mysql \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --user="$DB_USER" \
        --password="$DB_PASS" \
        "$DB_NAME" < "$BACKUP_FILE"
fi

echo "    Import complete."

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
TABLE_COUNT="$(mysql \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --user="$DB_USER" \
    --password="$DB_PASS" \
    --skip-column-names \
    --batch \
    -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$DB_NAME';" \
    2>/dev/null || echo "unknown")"

echo ""
echo "=== Restore Complete ==="
echo "    Database:  $DB_NAME"
echo "    Source:    $BACKUP_FILE"
echo "    Tables:    $TABLE_COUNT"
