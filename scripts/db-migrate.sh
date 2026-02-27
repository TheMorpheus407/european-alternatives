#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== Step 1: Export TS data to JSON ==="
cd "$PROJECT_DIR"
npx tsx scripts/export-to-json.mjs

echo "=== Step 2: Create/update schema ==="
if [ "${APPLY_SCHEMA:-0}" = "1" ]; then
  mysql -u "$EUROALT_DB_USER" -p"$EUROALT_DB_PASS" -h "${EUROALT_DB_HOST:-127.0.0.1}" "$EUROALT_DB_NAME" < scripts/db-schema.sql
else
  echo "    Skipped (set APPLY_SCHEMA=1 to apply)"
fi

echo "=== Step 3: Import JSON into MySQL ==="
php scripts/db-import.php --source tmp/export/catalog.json

echo "=== Step 4: Run parity tests ==="
npx tsx scripts/parity-tests.mjs --skip-api

echo "=== Done ==="
