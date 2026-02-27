# European Alternatives — API & Database

Developer reference for the PHP read API and MySQL database.

---

## Quick Start

### Prerequisites

- PHP 8.1+ (CLI)
- MySQL 8.0+ (InnoDB, utf8mb4)
- Database credentials configured (see [Production Secrets](#production-secrets) below)

### npm Scripts

| npm script | Command | Description |
|---|---|---|
| `db:import` | `php scripts/db-import.php --source tmp/export/catalog.json` | Seed all 16 MySQL tables from exported JSON (single transaction) |
| `db:backup` | `bash scripts/db-backup.sh` | Backup the database |
| `db:restore` | `bash scripts/db-restore.sh` | Restore a database backup |

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

16 tables on MySQL 8.0+ (InnoDB, utf8mb4_unicode_ci). Full DDL in `scripts/db-schema.sql`.

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

### Display & Mapping

| Table | Purpose |
|---|---|
| `category_us_vendors` | Per-category "Replaces X, Y, Z" display order |

### Trust & Scoring

| Table | Purpose |
|---|---|
| `reservations` | Trust penalty evidence per entry (severity, penalty tier/amount, i18n text) |
| `positive_signals` | Trust-positive evidence per entry (dimension, amount, i18n text) |
| `scoring_metadata` | Per-entry scoring config (base class override, ad-surveillance flag) |

Trust scores are dynamically computed on every API request by `api/catalog/scoring.php` from reservations, positive signals, and scoring metadata. No scores are stored in the database.

### Editorial & Landing

| Table | Purpose |
|---|---|
| `denied_decisions` | Denial reasoning for rejected alternatives (failed gateways, sources) |
| `further_reading_resources` | Curated external resource links |
| `landing_category_groups` | Groups for landing page display |
| `landing_group_categories` | M:N landing groups-to-categories |

### Key Constraints

- `catalog_entries.chk_openness`: `is_open_source` and `open_source_level` must be mutually consistent.
- `entry_categories`: at most one primary category per entry (enforced via generated column + unique index).
- All i18n columns use column-based storage (`_en` / `_de` suffixes), not a separate translations table.

---

## Scripts Reference

| Script | Language | Purpose |
|---|---|---|
| `scripts/db-schema.sql` | SQL | Full DDL for all 16 tables (run via `mysql` CLI) |
| `scripts/db-import.php` | PHP | Read `catalog.json`, seed all 16 tables in a single transaction with advisory lock |
| `scripts/db-backup.sh` | Bash | Backup the MySQL database |
| `scripts/db-restore.sh` | Bash | Restore a database backup |

---

## Production Secrets

Database credentials are stored outside the web root on Hostinger:

```
/home/u688914453/.secrets/euroalt-db-env.php
```

Uses `putenv(...)` format. Required variables: `EUROALT_DB_HOST`, `EUROALT_DB_PORT`, `EUROALT_DB_NAME`, `EUROALT_DB_USER`, `EUROALT_DB_PASS`, `EUROALT_DB_CHARSET`.

See `api/config/db.env.example.php` for the template.

For local development, set environment variables or point `EUROALT_ENV_LOADER` to a local env loader file.

---

## Architecture Overview

```
MySQL 8.0  <---  PHP API endpoints (read-only, batch queries, 5min cache)
                        |
                        v
                  React Frontend (fetches on mount via CatalogContext)
```

Import is idempotent: each run deletes all rows (in reverse FK order) and re-inserts within the same transaction. Concurrent imports are prevented by a MySQL advisory lock.
