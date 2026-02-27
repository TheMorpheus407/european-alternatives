#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# European Alternatives — Rollback Verification Test
# =============================================================================
# Simulates and verifies the rollback procedure without making production
# changes. Run this before any migration phase go-live to confirm that a
# rollback would succeed.
#
# Usage:
#   bash scripts/rollback-test.sh
#
# Exit codes:
#   0  All tests passed
#   1  One or more tests failed
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

PASS=0
FAIL=0

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

pass() {
    PASS=$((PASS + 1))
    echo "    PASS: $1"
}

fail() {
    FAIL=$((FAIL + 1))
    echo "    FAIL: $1" >&2
}

# ---------------------------------------------------------------------------
echo "=== Rollback Verification Test ==="
echo ""
echo "This script verifies the rollback procedure works correctly."
echo "It does NOT make any changes to production."
echo ""

# ---------------------------------------------------------------------------
# Test 1: Feature flag file exists and is valid JSON
# ---------------------------------------------------------------------------
echo "Test 1: Feature flag toggle..."

FLAGS_FILE="$PROJECT_DIR/api/config/flags.json"

if [ ! -f "$FLAGS_FILE" ]; then
    fail "flags.json does not exist at $FLAGS_FILE"
else
    # Verify the file is writable
    if [ ! -w "$FLAGS_FILE" ]; then
        fail "flags.json is not writable"
    else
        pass "flags.json exists and is writable"
    fi

    # Verify it parses as valid JSON
    if ! python3 -c "import json, sys; json.load(open(sys.argv[1]))" "$FLAGS_FILE" 2>/dev/null; then
        fail "flags.json is not valid JSON"
    else
        pass "flags.json is valid JSON"
    fi

    # Verify the dataBackend field exists and has a valid value
    BACKEND_VALUE="$(python3 -c "
import json, sys
data = json.load(open(sys.argv[1]))
if 'dataBackend' not in data:
    print('MISSING')
elif data['dataBackend'] not in ('ts', 'db'):
    print('INVALID')
else:
    print(data['dataBackend'])
" "$FLAGS_FILE" 2>/dev/null || echo "ERROR")"

    case "$BACKEND_VALUE" in
        ts|db)
            pass "dataBackend field is present (current value: '$BACKEND_VALUE')"
            ;;
        MISSING)
            fail "dataBackend field is missing from flags.json"
            ;;
        INVALID)
            fail "dataBackend has an invalid value (must be 'ts' or 'db')"
            ;;
        *)
            fail "Could not parse dataBackend from flags.json"
            ;;
    esac

    # Simulate toggle: write ts -> verify -> restore original
    ORIGINAL_CONTENT="$(cat "$FLAGS_FILE")"
    echo '{ "dataBackend": "ts" }' > "$FLAGS_FILE"
    TOGGLED_VALUE="$(python3 -c "import json; print(json.load(open('$FLAGS_FILE'))['dataBackend'])" 2>/dev/null || echo "ERROR")"
    # Restore original content
    echo "$ORIGINAL_CONTENT" > "$FLAGS_FILE"

    if [ "$TOGGLED_VALUE" = "ts" ]; then
        pass "Feature flag toggle simulation succeeded (wrote 'ts', read back 'ts')"
    else
        fail "Feature flag toggle simulation failed (expected 'ts', got '$TOGGLED_VALUE')"
    fi
fi

echo ""

# ---------------------------------------------------------------------------
# Test 2: TS data file integrity
# ---------------------------------------------------------------------------
echo "Test 2: TS data file integrity..."

CRITICAL_FILES=(
    "src/data/alternatives.ts"
    "src/data/manualAlternatives.ts"
    "src/data/researchAlternatives.ts"
    "src/data/categories.ts"
    "src/data/trustOverrides.ts"
    "src/data/positiveSignals.ts"
    "src/data/scoringData.ts"
    "src/data/scoringConfig.ts"
    "src/data/usVendors.ts"
    "src/data/furtherReading.ts"
    "src/data/landingCategoryGroups.ts"
    "src/data/index.ts"
    "src/data/provider.ts"
    "src/contexts/CatalogContext.tsx"
)

ALL_FILES_OK=true
for rel_path in "${CRITICAL_FILES[@]}"; do
    full_path="$PROJECT_DIR/$rel_path"
    if [ ! -f "$full_path" ]; then
        fail "Missing critical file: $rel_path"
        ALL_FILES_OK=false
    elif [ ! -s "$full_path" ]; then
        fail "Empty critical file: $rel_path"
        ALL_FILES_OK=false
    fi
done

if [ "$ALL_FILES_OK" = true ]; then
    pass "All ${#CRITICAL_FILES[@]} critical TS data files exist and are non-empty"
fi

# Quick import check: verify TS data modules can be loaded
echo "    Checking TS data module imports..."
if cd "$PROJECT_DIR" && npx tsx -e "
import { alternatives } from './src/data/alternatives';
import { categories } from './src/data/categories';
import { furtherReadingResources } from './src/data/furtherReading';
import { landingCategoryGroups } from './src/data/landingCategoryGroups';

if (alternatives.length === 0) throw new Error('alternatives is empty');
if (categories.length === 0) throw new Error('categories is empty');

console.log('  alternatives: ' + alternatives.length);
console.log('  categories: ' + categories.length);
console.log('  furtherReading: ' + furtherReadingResources.length);
console.log('  landingGroups: ' + landingCategoryGroups.length);
" 2>/dev/null; then
    pass "TS data modules load successfully"
else
    fail "TS data modules failed to load (import error)"
fi

echo ""

# ---------------------------------------------------------------------------
# Test 3: App builds in TS mode
# ---------------------------------------------------------------------------
echo "Test 3: App build verification..."

# Ensure flags.json is set to 'ts' for the build test
ORIGINAL_FLAGS="$(cat "$FLAGS_FILE")"
echo '{ "dataBackend": "ts" }' > "$FLAGS_FILE"

if cd "$PROJECT_DIR" && npm run build --silent 2>/dev/null; then
    pass "App builds successfully in TS mode"
else
    fail "App build failed in TS mode"
fi

# Restore original flags
echo "$ORIGINAL_FLAGS" > "$FLAGS_FILE"

echo ""

# ---------------------------------------------------------------------------
# Test 4: Snapshot baseline
# ---------------------------------------------------------------------------
echo "Test 4: Snapshot baseline..."

SNAPSHOT_DIR="$PROJECT_DIR/tmp/snapshots"
LATEST_SNAPSHOT="$SNAPSHOT_DIR/latest.json"

if [ ! -d "$SNAPSHOT_DIR" ]; then
    fail "Snapshot directory does not exist: tmp/snapshots/"
elif [ ! -f "$LATEST_SNAPSHOT" ]; then
    fail "latest.json snapshot does not exist (run: npx tsx scripts/snapshot-baseline.mjs)"
else
    # Verify it is valid JSON with expected structure
    SNAPSHOT_CHECK="$(python3 -c "
import json, sys
data = json.load(open(sys.argv[1]))
errors = []
if 'capturedAt' not in data:
    errors.append('missing capturedAt')
if 'counts' not in data:
    errors.append('missing counts')
else:
    for key in ['alternatives', 'categories', 'tags', 'reservations', 'positiveSignals']:
        if key not in data['counts']:
            errors.append(f'missing counts.{key}')
if 'alternatives' not in data or not isinstance(data['alternatives'], list):
    errors.append('missing or invalid alternatives array')
if 'categories' not in data or not isinstance(data['categories'], list):
    errors.append('missing or invalid categories array')
if errors:
    print('ERRORS: ' + '; '.join(errors))
else:
    alt_count = len(data['alternatives'])
    cat_count = len(data['categories'])
    captured = data['capturedAt']
    print(f'OK|{alt_count}|{cat_count}|{captured}')
" "$LATEST_SNAPSHOT" 2>/dev/null || echo "PARSE_ERROR")"

    case "$SNAPSHOT_CHECK" in
        OK*)
            IFS='|' read -r _ alt_count cat_count captured_at <<< "$SNAPSHOT_CHECK"
            pass "latest.json is valid (captured: $captured_at, $alt_count alternatives, $cat_count categories)"
            ;;
        ERRORS*)
            fail "latest.json has structural issues: ${SNAPSHOT_CHECK#ERRORS: }"
            ;;
        *)
            fail "latest.json could not be parsed as JSON"
            ;;
    esac

    # Verify at least one timestamped backup exists
    TIMESTAMPED_COUNT="$(find "$SNAPSHOT_DIR" -name 'baseline-*.json' -type f 2>/dev/null | wc -l)"
    if [ "$TIMESTAMPED_COUNT" -gt 0 ]; then
        pass "Found $TIMESTAMPED_COUNT timestamped snapshot(s)"
    else
        fail "No timestamped snapshots found in tmp/snapshots/"
    fi
fi

echo ""

# ---------------------------------------------------------------------------
# Test 5: CatalogContext fallback behavior
# ---------------------------------------------------------------------------
echo "Test 5: CatalogContext fallback verification..."

CONTEXT_FILE="$PROJECT_DIR/src/contexts/CatalogContext.tsx"

if [ -f "$CONTEXT_FILE" ]; then
    # Verify DEFAULT_FLAGS defaults to 'ts'
    if grep -q "dataBackend: 'ts'" "$CONTEXT_FILE"; then
        pass "CatalogContext defaults to 'ts' backend on flag fetch failure"
    else
        fail "CatalogContext does not default to 'ts' backend"
    fi

    # Verify there is a catch block that falls back
    if grep -q "return DEFAULT_FLAGS" "$CONTEXT_FILE"; then
        pass "CatalogContext has fallback on fetch error"
    else
        fail "CatalogContext missing fallback on fetch error"
    fi
else
    fail "CatalogContext.tsx not found"
fi

echo ""

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
TOTAL=$((PASS + FAIL))
echo "==========================================="
echo "  Results: $PASS/$TOTAL passed, $FAIL failed"
echo "==========================================="

if [ "$FAIL" -gt 0 ]; then
    echo ""
    echo "WARNING: Some rollback prerequisites are not met."
    echo "Fix the failures above before proceeding with migration."
    exit 1
fi

echo ""
echo "All rollback prerequisites verified."
echo ""

# ---------------------------------------------------------------------------
# Print rollback instructions
# ---------------------------------------------------------------------------
echo "=== Rollback Procedure ==="
echo ""
echo "Phase 1 (Schema + Import only, no frontend switch):"
echo "  1. DROP all migration tables (frontend is unaffected)"
echo "  2. Verify: the app continues to serve from TS data files"
echo ""
echo "Phase 2 (Shadow Validation + Controlled Switch):"
echo "  1. SSH into Hostinger"
echo "  2. Edit api/config/flags.json: change 'db' to 'ts'"
echo "  3. Verify: curl https://european-alternatives.cloud/api/config/flags.json"
echo "  4. The app will immediately use TS data files (no rebuild needed)"
echo ""
echo "Phase 3 (DB as Source of Truth):"
echo "  1. SSH into Hostinger"
echo "  2. Edit api/config/flags.json: change 'db' to 'ts'"
echo "  3. Verify: curl https://european-alternatives.cloud/api/config/flags.json"
echo "  4. Restore last TS export commit: git checkout <last-ts-export-sha> -- src/data/"
echo "  5. If DB schema needs reset: bash scripts/db-restore.sh tmp/backups/<latest>.sql.gz"
echo ""
