# Rollback Procedure

## Quick Rollback (3 Steps)

1. SSH into Hostinger
2. Edit `api/config/flags.json` -- change `"dataBackend": "db"` to `"dataBackend": "ts"`
3. Verify: `curl https://european-alternatives.cloud/api/config/flags.json` shows `"ts"`

The app will immediately use TypeScript data files. No rebuild required. No downtime.

---

## Rollback by Phase

### Phase 1: Schema + Full Import (no frontend switch)

The frontend is not connected to the database in this phase. The DB is shadow-only.

**Rollback:**

```bash
# Nothing to do on the frontend side -- it still reads from TS files.
# If you want to clean up the database tables:
mysql -u "$EUROALT_DB_USER" -p"$EUROALT_DB_PASS" -h "$EUROALT_DB_HOST" "$EUROALT_DB_NAME" <<'SQL'
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS
    landing_group_categories, landing_category_groups,
    further_reading_resources, denied_decisions,
    scoring_metadata, positive_signals, reservations,
    entry_replacements, category_us_vendors,
    us_vendor_profile_reservations, us_vendor_profiles,
    us_vendor_aliases, us_vendors,
    entry_tags, entry_categories, catalog_entries,
    tags, categories, countries, schema_migrations;
SET FOREIGN_KEY_CHECKS = 1;
SQL
```

**Verification:** The site continues to work normally since it was never reading from the DB.

### Phase 2: Shadow Validation + Controlled Switch

The frontend reads from either TS or DB based on a runtime feature flag. The flag is a static JSON file served by the web server -- no code change or rebuild is needed to switch.

**Rollback:**

```bash
# SSH into Hostinger
ssh user@european-alternatives.cloud

# Flip the feature flag to TS
echo '{ "dataBackend": "ts" }' > api/config/flags.json

# Verify the flag is set
cat api/config/flags.json
# Expected: { "dataBackend": "ts" }
```

**Verification:**

1. `curl https://european-alternatives.cloud/api/config/flags.json` returns `{"dataBackend":"ts"}`
2. Open the site in a browser -- data loads instantly (no loading spinner)
3. Open browser DevTools Network tab -- no requests to `/api/catalog/*` endpoints

### Phase 3: DB as Source of Truth

The DB is the primary data source and TS files may have drifted. Rollback requires both flipping the flag and restoring the TS data files to a known-good state.

**Rollback:**

```bash
# Step 1: Flip the feature flag immediately (instant traffic switch)
ssh user@european-alternatives.cloud
echo '{ "dataBackend": "ts" }' > api/config/flags.json

# Step 2: Restore TS data files from last export commit
# Find the last commit that updated TS data files via the export pipeline:
git log --oneline --all -- src/data/manualAlternatives.ts src/data/researchAlternatives.ts | head -5
# Checkout the data files from that commit:
git checkout <commit-sha> -- src/data/

# Step 3 (if needed): Re-import into DB from the restored TS files
bash scripts/db-migrate.sh

# Step 4 (if DB is corrupted): Restore from backup
bash scripts/db-restore.sh tmp/backups/<latest-backup>.sql.gz
```

**Verification:**

1. Feature flag returns `"ts"`: `curl https://european-alternatives.cloud/api/config/flags.json`
2. Site loads with correct data (spot-check a few alternatives)
3. Run the snapshot comparison to verify parity: `npx tsx scripts/snapshot-compare.mjs`

---

## Why Rollback Is Safe

The rollback mechanism is designed around a **runtime feature flag**, not a build-time flag. This is a deliberate architectural choice documented in [DB_MIGRATION_PLAN.md](DB_MIGRATION_PLAN.md) (Appendix E).

Key properties:

- **No rebuild needed.** The flag is a JSON file fetched by the browser at runtime. Editing it on the server takes effect on the next page load.
- **Instant.** SSH + edit = sub-second rollback. No CI pipeline, no deploy wait.
- **Safe default.** If the flag file is missing, unreachable, or malformed, the app defaults to `"ts"` (see `CatalogContext.tsx` -- `DEFAULT_FLAGS`).
- **TS data is always present.** The TypeScript data files are committed to the repository and bundled into the built app. They are never removed during migration.

---

## Verification Script

Run the rollback verification test before any migration go-live:

```bash
bash scripts/rollback-test.sh
```

This script checks:

1. `flags.json` exists, is writable, and is valid JSON with a `dataBackend` field
2. All critical TS data files exist and are non-empty
3. TS data modules import successfully (alternatives, categories, etc.)
4. The app builds in TS mode
5. A snapshot baseline exists in `tmp/snapshots/latest.json` with correct structure
6. `CatalogContext.tsx` defaults to `"ts"` on flag fetch failure

All checks must pass before proceeding with a migration phase.

---

## Emergency Contacts

| Role | Contact | Notes |
|------|---------|-------|
| Project lead | Cedric Moessner | Primary decision-maker |
| Hostinger SSH access | (document separately, not in repo) | Server credentials |
| GitHub repo admin | TheMorpheus407 | Force-push / branch protection |

---

## Backup Locations

| What | Where | Retention |
|------|-------|-----------|
| DB backups | `tmp/backups/euroalt-*.sql.gz` | 30 days |
| TS data snapshots | `tmp/snapshots/baseline-*.json` | Indefinite |
| Latest snapshot | `tmp/snapshots/latest.json` | Overwritten each run |
| Exported catalog JSON | `tmp/export/catalog.json` | Overwritten each import |
| Git history | GitHub `main` branch | Permanent |
