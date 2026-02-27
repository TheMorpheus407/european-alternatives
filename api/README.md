# European Alternatives API & Database Migration

Developer reference for the PHP read API and the TS-to-MySQL migration tooling.
For the full migration rationale and design decisions, see [`DB_MIGRATION_PLAN.md`](../DB_MIGRATION_PLAN.md).

---

## Quick Start

### Prerequisites

- Node.js 20+ with npm
- PHP 8.1+ (CLI)
- MySQL 8.0+ (InnoDB, utf8mb4)
- npm dependencies installed (`npm ci`)
- Database credentials configured (see [Production Secrets](#production-secrets) below)

### Full Migration Pipeline

```bash
npm run db:migrate
```

This single command runs all four steps in sequence:

1. Export TS data to JSON (`scripts/export-to-json.mjs`)
2. Apply schema if `APPLY_SCHEMA=1` is set (`scripts/db-schema.sql`)
3. Import JSON into MySQL (`scripts/db-import.php`)
4. Run parity tests (`scripts/parity-tests.mjs --skip-api`)

To also apply the schema on first run:

```bash
APPLY_SCHEMA=1 npm run db:migrate
```

### Individual Steps

| npm script | Command | Description |
|---|---|---|
| `db:export` | `tsx scripts/export-to-json.mjs` | Export all TS data + computed trust scores to `tmp/export/catalog.json` |
| `db:import` | `php scripts/db-import.php --source tmp/export/catalog.json` | Seed all 20 MySQL tables from the exported JSON (single transaction) |
| `db:migrate` | `bash scripts/db-migrate.sh` | Run the full pipeline: export, schema, import, parity tests |
| `db:test` | `tsx scripts/parity-tests.mjs` | Run 15 parity tests against `catalog.json` and optionally the live API |
| `db:shadow` | `tsx scripts/shadow-diff.mjs` | Shadow validation: compare live API responses against TS source data |
| `db:snapshot` | `tsx scripts/snapshot-baseline.mjs` | Capture current TS data as a deterministic JSON baseline |
| `db:snapshot:compare` | `tsx scripts/snapshot-compare.mjs` | Compare two snapshots or a snapshot against the live API |

---

## API Endpoints

All endpoints are read-only, return JSON, and are cached for 5 minutes (`Cache-Control: public, max-age=300`).

| Method | URL | Query Params | Description |
|---|---|---|---|
| GET | `/api/catalog/entries` | `status` (alternative\|us\|denied\|draft\|archived), `locale` (en\|de) | List all active entries for a given status. Default: `status=alternative`, `locale=en`. |
| GET | `/api/catalog/entry` | `slug`, `locale` (en\|de) | Fetch a single entry by slug with full detail (reservations, signals, comparisons). |
| GET | `/api/catalog/categories` | `locale` (en\|de) | List all categories with i18n names and descriptions. |
| GET | `/api/catalog/countries` | `locale` (en\|de) | List all countries with i18n labels. |
| GET | `/api/catalog/tags` | -- | List all tags with slugs and optional labels. |
| GET | `/api/catalog/further-reading` | -- | List curated further-reading resources. |
| GET | `/api/catalog/landing-groups` | `locale` (en\|de) | Landing page category groups with nested category IDs. |
| GET | `/api/health/db` | -- | Database health check (no caching). |

Response envelope for list endpoints:

```json
{
  "data": [ ... ],
  "meta": { "count": 234, "locale": "en" }
}
```

Locale fallback: when `locale=de` and no German translation exists for a field, the English value is returned via `COALESCE(column_de, column_en)`.

---

## Database Schema

20 tables on MySQL 8.0+ (InnoDB, utf8mb4_unicode_ci). Full DDL in `scripts/db-schema.sql`.

### Core Entities

| Table | PK | Purpose |
|---|---|---|
| `catalog_entries` | Auto ID, unique `slug` | Unified entity table for alternatives, US vendors, denied entries, drafts |
| `categories` | Slug ID | Category definitions with emoji, i18n name/description |
| `countries` | ISO alpha-2 code | Country lookup with i18n labels |
| `tags` | Auto ID, unique `slug` | Normalized tag slugs |
| `schema_migrations` | Version string | Tracks applied schema versions |

### Relationships

| Table | Purpose |
|---|---|
| `entry_categories` | M:N entries-to-categories (with `is_primary` flag) |
| `entry_tags` | M:N entries-to-tags (ordered) |
| `entry_replacements` | Which US vendors an alternative replaces (ordered, with optional FK resolution) |

### US Vendor System

| Table | Purpose |
|---|---|
| `us_vendors` | Canonical US vendor identities, linked to `catalog_entries` |
| `us_vendor_aliases` | Normalized alias strings for fuzzy matching |
| `us_vendor_profiles` | Extended profile: description, trust score override, score status |
| `us_vendor_profile_reservations` | Trust reservations specific to US vendors |
| `category_us_vendors` | Per-category "Replaces X, Y, Z" display order |

### Trust & Scoring

| Table | Purpose |
|---|---|
| `reservations` | Trust penalty evidence per entry (severity, penalty tier/amount, i18n text) |
| `positive_signals` | Trust-positive evidence per entry (dimension, amount, i18n text) |
| `scoring_metadata` | Per-entry scoring config (base class override, ad-surveillance flag) |

Trust scores are pre-computed during import and cached on `catalog_entries` (`trust_score_100`, `trust_score_10_display`, `trust_score_status`, `trust_score_breakdown_json`).

### Editorial & Landing

| Table | Purpose |
|---|---|
| `denied_decisions` | Denial reasoning for rejected alternatives (failed gateways, sources) |
| `further_reading_resources` | Curated external resource links |
| `landing_category_groups` | Groups for landing page display |
| `landing_group_categories` | M:N landing groups-to-categories |

### Key Constraints

- `catalog_entries.chk_openness`: `is_open_source` and `open_source_level` must be mutually consistent.
- `catalog_entries.chk_score_range`: `trust_score_100` must be 0-100 or NULL.
- `entry_categories`: at most one primary category per entry (enforced via generated column + unique index).
- All i18n columns use column-based storage (`_en` / `_de` suffixes), not a separate translations table.

---

## Scripts Reference

| Script | Language | Purpose |
|---|---|---|
| `scripts/db-schema.sql` | SQL | Full DDL for all 20 tables (run via `mysql` CLI) |
| `scripts/export-to-json.mjs` | Node/TS | Import all TS modules, compute trust scores, write `tmp/export/catalog.json` |
| `scripts/db-import.php` | PHP | Read `catalog.json`, seed all 20 tables in a single transaction with advisory lock |
| `scripts/db-migrate.sh` | Bash | Orchestrator: export -> schema -> import -> parity tests |
| `scripts/parity-tests.mjs` | Node/TS | 15 parity tests validating DB/JSON data against TS source of truth |
| `scripts/shadow-diff.mjs` | Node/TS | 5 shadow validation tests comparing live API against TS data |
| `scripts/snapshot-baseline.mjs` | Node/TS | Capture deterministic TS data snapshot to `tmp/snapshots/` |
| `scripts/snapshot-compare.mjs` | Node/TS | Diff two snapshots or a snapshot vs. live API |

---

## Feature Flag

The frontend data source is controlled by a runtime feature flag (not build-time):

```
GET /api/config/flags.json  ->  { "dataBackend": "ts" }
```

| Value | Behavior |
|---|---|
| `ts` | Frontend reads from bundled TypeScript data files (current default) |
| `db` | Frontend fetches from the PHP API endpoints above |

To switch: edit the JSON file on the server. No rebuild required. Sub-second rollback.

---

## Rollback

```bash
# 1. Switch frontend back to TS data (instant, no rebuild)
ssh hostinger 'echo '"'"'{"dataBackend":"ts"}'"'"' > /path/to/flags.json'

# 2. (Optional) Drop all DB tables if needed
mysql -u $EUROALT_DB_USER -p$EUROALT_DB_PASS $EUROALT_DB_NAME < scripts/db-schema-drop.sql

# 3. Frontend is unaffected -- it reads from TS files when dataBackend=ts
```

Phase 1 rollback: drop all tables; frontend is unaffected (still reads TS).
Phase 2 rollback: flip `dataBackend` to `ts`. No downtime.
Phase 3 rollback: flip `dataBackend` to `ts` + restore last TS export commit.

---

## Parity Testing

### Phase 1: Import Parity (15 tests)

```bash
# Against catalog.json only (no running API needed)
npm run db:test -- --skip-api

# Against catalog.json + live API
npm run db:test -- --api-base https://european-alternatives.cloud
```

Tests validate:

| # | Test |
|---|---|
| 1 | Entry count parity (alternatives, US vendors, denied) |
| 2 | Trust score parity (vetted + pending match TS engine output) |
| 3 | Tag parity per entry |
| 4 | Category assignment parity (primary + secondary) |
| 5 | US vendor alias resolution |
| 6 | US vendor comparison dedup |
| 7 | Reservation/signal count per entry |
| 8 | Translation fallback (EN exists for every entry) |
| 9 | Denied entry parity |
| 10 | Landing groups + further reading |
| 11 | Schema constraints on catalog.json structure |
| 12 | Open-source field consistency |
| 13 | Manual-over-research dedup |
| 14 | API payload spot-check (requires `--api-base`) |
| 15 | Full API contract test (requires `--api-base`) |

### Phase 2: Shadow Validation (5 tests)

```bash
npm run db:shadow -- --api-base https://european-alternatives.cloud/api/catalog
```

Tests validate:

| # | Test |
|---|---|
| 1 | Full payload snapshot (field-by-field comparison of all entries) |
| 2 | Locale parity (EN + DE descriptions, reservation text, fallback) |
| 3 | Scoring stability (identical trust scores across 3 repeated fetches) |
| 4 | Browse ordering parity (name ASC sort matches TS order) |
| 5 | Edge cases (dual-role entries, unresolved replacements, inline reservations, missing logos, secondary categories, non-vetted) |

### Snapshot Comparison

```bash
# Capture baseline from current TS data
npm run db:snapshot

# Compare two snapshot files
npm run db:snapshot:compare -- --base tmp/snapshots/latest.json --compare tmp/snapshots/other.json

# Compare snapshot against live API
npm run db:snapshot:compare -- --base tmp/snapshots/latest.json --api https://european-alternatives.cloud
```

Exit codes: `0` = identical, `1` = differences found, `2` = usage error.

---

## Production Secrets

Database credentials are stored outside the web root on Hostinger:

```
/home/u688914453/.secrets/euroalt-db-env.php
```

Uses `putenv(...)` format. Required variables: `EUROALT_DB_HOST`, `EUROALT_DB_PORT`, `EUROALT_DB_NAME`, `EUROALT_DB_USER`, `EUROALT_DB_PASS`, `EUROALT_DB_CHARSET`.

See `api/config/db.env.example.php` for the template. The `api/config/` directory is blocked by `.htaccess` deny-all.

For local development, set environment variables or point `EUROALT_ENV_LOADER` to a local env loader file.

---

## Architecture Overview

```
TS data files (source of truth)
        |
        v
  export-to-json.mjs  (Node: imports TS, computes trust scores)
        |
        v
  tmp/export/catalog.json  (flat, snake_case, DB-ready)
        |
        v
  db-import.php  (PHP: single transaction, advisory lock, seeds 20 tables)
        |
        v
  MySQL 8.0  <---  PHP API endpoints (read-only, batch queries, 5min cache)
                          |
                          v
                    Frontend (when dataBackend=db)
```

Import is idempotent: each run deletes all rows (in reverse FK order) and re-inserts within the same transaction. Concurrent imports are prevented by a MySQL advisory lock.
