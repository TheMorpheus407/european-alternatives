# Database Migration Plan

Status: implemented (v2)
Date: 2026-02-27
Scope: move catalog data from TypeScript/Markdown files to a MySQL-backed read API, in phases.

## Implementation Notes

Delivered artifacts across Phases 1-3:

- **Phase 1 — Schema + Full Import:**
  - 20-table MySQL schema (`scripts/db-schema.sql`) with full FK/CHECK constraints
  - TS-to-JSON export pipeline (`scripts/export-to-json.mjs`) covering all 20 data tables
  - PHP import script (`scripts/db-import.php`) with transactional safety
  - Migration runner (`scripts/db-migrate.sh`)
  - 15-test parity suite (`scripts/parity-tests.mjs`) validating JSON export against TS source
  - Baseline snapshot capture (`scripts/snapshot-baseline.mjs`) + comparison (`scripts/snapshot-compare.mjs`)

- **Phase 2 — Shadow Validation + CI:**
  - Shadow diff script (`scripts/shadow-diff.mjs`) — 5 API-vs-TS validation tests
  - DB validation CI workflow (`.github/workflows/db-validate.yml`) — type check, lint, build, export, parity tests, round-trip verification, snapshot artifact upload
  - PHP read-only API endpoints under `api/catalog/` with locale support and caching

- **Phase 3 — CI Integration:**
  - Data drift detection workflow (`.github/workflows/data-drift-check.yml`) — active in warning mode; flags direct edits to 8 protected catalog data files, skips `[db-export]`-tagged PRs
  - TS export round-trip verification step in db-validate.yml — confirms export determinism
  - All CI checks pass (lint, type check, build)

## 1. Goals

- Create a normalized database model for: alternatives, US vendor profiles, denied alternatives, reservations, positive signals, trust scoring, tags, categories, i18n text, editorial data.
- Avoid a big-bang rewrite; migrate incrementally with rollback safety.
- Preserve current behavior while adding DB-backed APIs.
- Keep it simple: 20 tables, column-based i18n, transaction-based imports.

## 2. Current State Snapshot

Main source files:
- `src/data/manualAlternatives.ts`
- `src/data/researchAlternatives.ts`
- `src/data/trustOverrides.ts`
- `src/data/positiveSignals.ts`
- `src/data/usVendors.ts`
- `src/data/furtherReading.ts`
- `src/data/landingCategoryGroups.ts`
- `DENIED_ALTERNATIVES.md`
- i18n labels in `src/i18n/locales/{en,de}/data.json`

Approximate records right now:
- Alternatives: 234
- Denied alternatives: 10
- US trust profiles: 63
- Alternative reservations: 315
- US reservations: 847
- Positive signals: 432
- Further-reading resources: 5
- Landing category groups: 8
- Deep researches: 121 files
- Vetted worksheets: 117 files

## 3. Core Design Decision

Use one shared entity model with status instead of separate hard-silo models:
- `alternative`
- `us`
- `denied`
- `draft`
- `archived`

This matches the product requirement: same conceptual entity, different app status.
US-comparator identity is modeled as a linked profile (`us_vendors`) and can coexist with `status='alternative'` for dual-role entries (for example, `bitwarden`).

## 4. Schema (20 tables)

## 4.1 Entries

### `catalog_entries`

| Column | Type | Notes |
|---|---|---|
| `id` | bigint, PK | |
| `slug` | varchar, unique | Matches current `id` field (e.g. `tuta`, `mistral`) |
| `status` | enum: alternative / us / denied / draft / archived | |
| `source_file` | enum: manual / research / us / denied | Which source contributed this row |
| `is_active` | bool, default true | Soft-retire flag for reconciliation |
| `date_added` | date, not null, default current_date | Import date (historical tracking is out of scope) |
| `retired_at` | datetime, nullable | Set when row leaves active source set |
| `name` | varchar, not null | Canonical display name |
| `description_en` | text, nullable | English description |
| `description_de` | text, nullable | German description (partial coverage) |
| `country_code` | varchar, nullable, FK -> countries.code | |
| `website_url` | varchar, nullable | |
| `logo_path` | varchar, nullable | Falls back to `/logos/{slug}.svg` when null |
| `pricing` | enum: free / freemium / paid, nullable | |
| `is_open_source` | bool, nullable | Derived from `open_source_level` |
| `open_source_level` | enum: full / partial / none, nullable | |
| `open_source_audit_url` | varchar, nullable | |
| `source_code_url` | varchar, nullable | |
| `self_hostable` | bool, nullable | |
| `founded_year` | int, nullable | |
| `headquarters_city` | varchar, nullable | |
| `license_text` | text, nullable | |
| `action_links_json` | json, nullable | Array of `{label, url}` objects |
| `trust_score_100` | int, nullable | 0..100 computed score (cached, recomputed on import) |
| `trust_score_10_display` | decimal(3,1), nullable | 0.0..10.0 display score |
| `trust_score_status` | enum: pending / ready, nullable | |
| `trust_score_breakdown_json` | json, nullable | Full `TrustScoreBreakdown` object |
| `created_at` | datetime | |
| `updated_at` | datetime | |

Constraints:

- **Openness consistency (CHECK):** `is_open_source` and `open_source_level` must be either both null, or consistent: `open_source_level = 'none'` iff `is_open_source = false`; `open_source_level in ('full','partial')` iff `is_open_source = true`.
- **Openness normalization (import-time):** Resolve `open_source_level` first (if present, use it; else derive from `is_open_source` as `full`/`none`). Then set `is_open_source = (open_source_level != 'none')`. Null means unknown -- do not backfill defaults.
- **Public readiness:** Active `alternative` rows must have non-null `country_code`, `is_open_source`, and `open_source_level`. Incomplete rows stay `draft`/inactive.
- **Comparator readiness:** `status = 'us'` rows are publishable without openness fields.
- **Translation fallback (API-time):** Use `description_de` for German locale when non-null; otherwise fall back to `description_en`.

## 4.2 Taxonomy

### `categories`
- `id` (PK, slug; e.g. `cloud-storage`)
- `emoji` (text not null)
- `name_en` (text not null)
- `name_de` (text not null)
- `description_en` (text not null)
- `description_de` (text not null)
- `sort_order` (int not null)

### `countries`
- `code` (PK; lowercase ISO 3166-1 alpha-2, plus `eu` pseudo-code)
- `label_en` (text not null)
- `label_de` (text not null)
- `sort_order` (int not null)

### `category_us_vendors`
- `id` (PK)
- `category_id` (FK -> categories.id)
- `us_vendor_id` (nullable FK -> us_vendors.id)
- `raw_name` (text not null; original `usGiants` label)
- `sort_order` (int not null)
- unique (`category_id`, `sort_order`)
- unique (`category_id`, `raw_name`)
- purpose: preserve the exact "Replaces X, Y, Z" display order per category

### `entry_categories`
- `entry_id` (FK -> catalog_entries.id)
- `category_id` (FK -> categories.id)
- `is_primary` (bool not null default false)
- `sort_order` (int not null)
- PK (`entry_id`, `category_id`)
- uniqueness rule: at most one primary category per entry (enforced via generated column + unique index)
- validation rule: every active `alternative`/`denied` entry has exactly one primary category; `us`-only rows excluded

### `tags`
- `id` (PK, auto-increment)
- `slug` (unique, not null; the raw tag string, e.g. `encryption`, `gdpr`)
- `label_en` (text nullable; for future use -- tags are currently untranslated)
- `label_de` (text nullable)

### `entry_tags`
- `entry_id` (FK -> catalog_entries.id)
- `tag_id` (FK -> tags.id)
- `sort_order` (int not null; preserves frontend tag display order)
- PK (`entry_id`, `tag_id`)
- unique (`entry_id`, `sort_order`)

## 4.3 US Vendors & Replacements

### `us_vendors`
- `id` (PK)
- `slug` (unique)
- `name` (text not null; canonical display name, e.g. "Gmail")
- `entry_id` (unique FK -> catalog_entries.id; linked row may be `status='alternative'` or `status='us'`)
- dual-role rule: if a slug exists as both alternative and US comparator, bind to the same `catalog_entries` row

### `us_vendor_aliases`
- `id` (PK)
- `us_vendor_id` (FK -> us_vendors.id)
- `alias_normalized` (indexed)
- unique (`us_vendor_id`, `alias_normalized`)
- import rule: normalize + dedup before insert; emit collision report for duplicates

### `us_vendor_profiles`
- `us_vendor_id` (PK, FK -> us_vendors.id)
- `description_en` (text nullable)
- `description_de` (text nullable)
- `trust_score_override_10` (decimal(3,1), nullable; manual curated value)
- `trust_score_status` (enum: pending/ready)
- `score_source` (enum: manual_override/computed)
- rule: API uses `trust_score_override_10` when present; never overwrite via scoring jobs
- rule: descriptions only emitted when profile row exists; name-only comparators stay description-null

### `us_vendor_profile_reservations`
- `id` (PK)
- `us_vendor_id` (FK -> us_vendors.id)
- `reservation_key` (stable key)
- `sort_order` (int not null)
- `text_en` (text not null)
- `text_de` (text nullable)
- `severity` (enum: minor/moderate/major)
- `event_date` (nullable)
- `source_url` (text nullable)
- `penalty_tier` (enum: security/governance/reliability/contract, nullable)
- `penalty_amount` (decimal/int nullable)
- unique (`us_vendor_id`, `reservation_key`)
- unique (`us_vendor_id`, `sort_order`)

### `entry_replacements`
- `id` (PK)
- `entry_id` (FK -> catalog_entries.id)
- `raw_name` (original string from data source)
- `us_vendor_id` (nullable FK -> us_vendors.id, resolved if known)
- `sort_order`
- unique (`entry_id`, `sort_order`)
- output rule: dedupe resolved rows by `us_vendor_id` (keep lowest `sort_order`); unresolved rows emit fallback comparisons

## 4.4 Trust Evidence & Scoring

### `reservations`
- `id` (PK)
- `entry_id` (FK -> catalog_entries.id)
- `reservation_key` (stable key from code `id`)
- `sort_order` (int not null)
- `severity` (enum: minor/moderate/major)
- `event_date` (nullable)
- `penalty_tier` (enum: security/governance/reliability/contract, nullable)
- `penalty_amount` (decimal/int nullable)
- `is_structural` (bool default false; forward-looking -- used by scoring engine for penalties without dates that never decay)
- `text_en` (text not null)
- `text_de` (text nullable)
- `source_url` (text nullable)
- unique (`entry_id`, `reservation_key`)
- unique (`entry_id`, `sort_order`)

### `positive_signals`
- `id` (PK)
- `entry_id` (FK -> catalog_entries.id)
- `signal_key` (catalog key from code `id`)
- `sort_order` (int not null)
- `dimension` (enum: security/governance/reliability/contract)
- `amount` (numeric)
- `text_en` (text not null)
- `text_de` (text nullable)
- `source_url` (text nullable)
- unique (`entry_id`, `signal_key`)
- unique (`entry_id`, `sort_order`)

### `scoring_metadata`
- `entry_id` (PK, FK -> catalog_entries.id)
- `base_class_override` (enum: foss/eu/nonEU/rest/us/autocracy, nullable)
- `is_ad_surveillance` (bool nullable)
- `deep_research_path` (text nullable; repo-relative path to `tmp/deepresearches/<name>.md`)
- `worksheet_path` (text nullable; repo-relative path to `tmp/vetted/<id>-trust-score.md`)

Trust score caching rules:
- Scores are recomputed during each import cycle and written to `catalog_entries` trust columns.
- `trust_score_breakdown_json` stores the complete breakdown (baseClass, baseScore, dimensions, operationalTotal, penaltyTotal, signalTotal, capApplied, finalScore100).
- An entry is vetted when it has a `scoring_metadata` row OR has positive signals. Reservations alone do not confer vetted status.
- No separate `score_runs`, `entry_scores`, or `entry_score_dimensions` tables needed.

## 4.5 Denied Decisions

### `denied_decisions`
- `entry_id` (PK, FK -> catalog_entries.id where status=denied)
- `proposed_in` (text nullable)
- `claimed_origin` (nullable)
- `actual_origin` (nullable)
- `removed_in` (nullable)
- `raw_category_label` (nullable; original markdown category label)
- `failed_gateways_json` (json array; e.g. `["G1","G6"]`)
- `text_en` (text not null; denial reason in English)
- `text_de` (text nullable; denial reason in German)
- `sources_json` (json array of source URL strings)

## 4.6 Editorial & Landing Data

### `further_reading_resources`
- `id` (PK)
- `slug` (unique, not null; preserves original TS `id` field, e.g. `european-alternatives-eu`)
- `name`
- `website_url`
- `section` (enum: directories/publicCatalogues/migrationGuides)
- `focus` (enum: eu/global/public-sector-eu)
- `related_issues_json` (json array of issue numbers)
- `last_reviewed` (date nullable)
- `sort_order`

### `landing_category_groups`
- `id` (PK)
- `name_en` (text not null)
- `name_de` (text nullable)
- `description_en` (text nullable)
- `description_de` (text nullable)
- `sort_order`

### `landing_group_categories`
- `group_id` (FK -> landing_category_groups.id)
- `category_id` (FK -> categories.id)
- `sort_order`
- PK (`group_id`, `category_id`)
- unique (`group_id`, `sort_order`)

## 4.7 Import Safety

Imports run inside a single DB transaction. If any validation gate fails, the entire transaction rolls back. No snapshot versioning needed for ~234 entries.

Trust scores are deterministic: recomputed from reservations, signals, and scoring metadata during each import and cached on `catalog_entries`.

Git history is the provenance record. `catalog_entries.source_file` tracks which file contributed the row.

### `schema_migrations`
- standard migration history table

## 5. API Direction

All endpoints are PHP scripts under `/api/` on Hostinger (already set up).

Read-only endpoints:
- `GET /api/catalog/entries?status=alternative`
- `GET /api/catalog/entries?status=us`
- `GET /api/catalog/entries?status=denied`
- `GET /api/catalog/entry/{slug}`
- `GET /api/catalog/categories`
- `GET /api/catalog/countries`
- `GET /api/catalog/tags`
- `GET /api/catalog/further-reading`
- `GET /api/catalog/landing-category-groups`

All responses expose the current frontend shape (compat layer) during migration.

Key rules:
1. **Active only:** Return only `catalog_entries.is_active=true` rows.
2. **Locale fallback:** `requested locale` -> `en`. Never return null name/description.
3. **Trust scores from cached columns:** Read pre-computed scores from `catalog_entries` trust columns directly; no runtime score computation in PHP.
4. **US vendor comparisons built server-side:** Apply the same dedup logic as current `buildUSVendorComparisons` -- dedupe resolved replacements by `us_vendor_id` (keep first by `sort_order`), emit unresolved rows as pending fallback comparisons.

## 6. Phased Migration Strategy

### Phase 1: Schema + Full Import (no frontend switch)

**Deliver:**
- Create all 20 tables
- Single import script (`scripts/db-import`) that seeds everything in one pass:
  1. Categories from `categories.ts` (with emoji, `usGiants` mapped to `category_us_vendors`)
  2. Countries extracted from union of all entry `country` fields, with EN/DE labels from i18n
  3. Tags collected from all entry tag arrays, deduplicated
  4. Alternatives from `manualAlternatives.ts` + `researchAlternatives.ts` (manual-first dedup by `id`/`slug`), with categories, tags, replacements, action links
  5. US vendors from `usVendors.ts` (records, aliases, profiles, profile reservations, descriptions); bind dual-role slugs to existing `catalog_entries` rows
  6. Reservations from `trustOverrides.ts` (with inline-vs-override precedence)
  7. Positive signals from `positiveSignals.ts`
  8. Scoring metadata from `scoringData.ts`
  9. Denied decisions parsed from `DENIED_ALTERNATIVES.md`
  10. Further reading from `furtherReading.ts`
  11. Landing category groups from `landingCategoryGroups.ts`
- Compute and cache trust scores during import (replicating `trustScore.ts` logic)
- Build read-only API endpoints returning frontend-compatible JSON
- Run parity tests comparing API output vs current TS-computed payloads
- Frontend still reads from TS source files; DB is shadow-only

**Validation:**
1. **Count parity:** entry, category, tag, reservation, signal, US vendor counts match TS source totals
2. **Score parity:** trust scores (vetted + pending) match `trustScore.ts` output; US vendor override scores preserved
3. **Payload parity:** spot-check 30 random alternative detail payloads against current frontend JSON
4. **US comparator parity:** alias resolution, deduplication, fallback comparisons match `buildUSVendorComparisons` output
5. **Denied + editorial parity:** 10 denied entries match markdown; further-reading and landing-group payloads match

**Rollback:** Drop all tables; frontend is unaffected.

### Phase 2: Shadow Validation + Controlled Switch

**Deliver:**
- Runtime feature flag `DATA_BACKEND=db|ts` (see Appendix E -- runtime, not build-time, for instant rollback)
- Shadow mode: API runs alongside TS frontend; automated diff jobs compare responses
- Staging validation period (minimum 1 week)
- Production switch: flip `DATA_BACKEND=db`

**Validation:**
1. **Full payload snapshot test:** complete app payload from DB matches TS baseline
2. **Locale parity:** EN and DE responses return correct text
3. **Scoring stability:** trust scores remain stable across repeated API calls
4. **Browse ordering parity:** default sort order matches current TS-driven order
5. **Edge case coverage:** dual-role entries, unresolved replacements, inline reservations, missing logos

**Rollback:** Flip `DATA_BACKEND=ts`. No downtime.

### Phase 3: DB as Source of Truth

**Deliver:**
- Freeze TS data file edits; all changes go into DB first
- Optional: admin/editor workflows
- Periodic TS export job for transparency and git-tracked audit trail
- DB backup strategy: daily snapshots with 30-day retention

**Validation:**
1. **TS export round-trip:** exported TS files produce identical payloads to DB API
2. **Write workflow integrity:** new entries appear correctly in API
3. **Backup restoration test:** restore from backup, verify API returns identical data
4. **No TS drift:** CI fails if TS data files are edited manually
5. **Rollback drill:** full rollback tested in staging before go-live

**Rollback:** Flip `DATA_BACKEND=ts` + restore last TS export commit.

## 7. Data Quality and Test Gates

15 parity tests run after every import cycle. All must pass.

| # | Test | What it checks |
|---|------|----------------|
| 1 | Entry count parity | Alternative, US vendor, and denied counts match TS source totals |
| 2 | Trust score parity | Vetted scores match `trustScore.ts` output (score, status, breakdown) |
| 3 | Tag parity | Sanitized + derived openness tags match frontend payload per entry |
| 4 | Category assignment parity | Primary + secondary categories match TS merge output |
| 5 | US vendor alias resolution | Alias lookups resolve to same vendor IDs as `buildUSVendorComparisons` |
| 6 | US vendor comparison dedup | Deduplicated comparator lists match (count, order, identity) |
| 7 | Reservation/signal count | Per-entry counts match current TS data |
| 8 | Translation fallback | EN exists for every entry; locale fallback works correctly |
| 9 | Denied entry parity | Count matches markdown sections; failed gateways preserved |
| 10 | Landing + further reading | Group ordering, category assignments, resources match current data |
| 11 | Schema constraints | FK integrity, unique constraints, NOT NULL all pass |
| 12 | Open-source consistency | `is_open_source` and `open_source_level` mutually consistent |
| 13 | Manual-over-research dedup | Duplicate slugs resolved with manual-wins; no duplicate active entries |
| 14 | API payload spot-check | 20 random entries compared field-by-field against current app payload |
| 15 | Full API contract test | Every endpoint returns the shape the frontend expects |

## 8. Security and Operations

- DB credentials live outside web root (`/home/u688914453/.secrets/...`), loaded at runtime.
- Read-only MySQL user for all public API endpoints. Separate write-capable user for imports (SSH/CLI only).
- Rate limits on API endpoints (per-IP).
- Config directories blocked via `api/config/.htaccess` deny-all.

## 9. Immediate Next Steps

1. Write the import script that reads current TS exports and seeds all tables.
2. Build `GET /api/catalog/entries?status=alternative` and validate against current frontend payload.
3. Run the 15-test parity suite; fix mismatches until green.
4. Ship remaining read-only endpoints, each validated before merging.

## 10. Non-Goals for Initial Migration

- No admin UI in early phases.
- No write API for contributors initially.
- No scoring model redesign during migration (model stays as-is; only storage changes).

---

## Appendix A: Import Script Design

### A.1 Script Location and Invocation

The import script lives at `scripts/db-import.php`. It is CLI-only and must never be web-accessible.

```bash
# Step 1: Export TS data to JSON (Node reads TS, computes trust scores, writes JSON)
node scripts/export-to-json.mjs

# Step 2: Import JSON into MySQL (PHP reads JSON, seeds all tables)
php scripts/db-import.php --source tmp/export/catalog.json
```

The PHP script begins with a `php_sapi_name() === 'cli'` guard. It reuses `api/bootstrap.php` and `api/db.php` for config loading and PDO connection.

### A.2 Import Order (FK-safe)

| Step | Table(s) | Depends on |
|------|----------|------------|
| 1 | `countries` | — |
| 2 | `categories` | — |
| 3 | `tags` | — |
| 4 | `catalog_entries` (all statuses) | `countries` |
| 5 | `entry_categories`, `entry_tags` | `catalog_entries`, `categories`, `tags` |
| 6 | `us_vendors` + `us_vendor_aliases` | `catalog_entries` |
| 7 | `us_vendor_profiles` + `us_vendor_profile_reservations` | `us_vendors` |
| 8 | `category_us_vendors` | `categories`, `us_vendors` |
| 9 | `entry_replacements` | `catalog_entries`, `us_vendors` |
| 10 | `reservations` | `catalog_entries` |
| 11 | `positive_signals` | `catalog_entries` |
| 12 | `scoring_metadata` | `catalog_entries` |
| 13 | Write cached trust scores to `catalog_entries` | steps 10-12 |
| 14 | `denied_decisions` | `catalog_entries` (status=denied) |
| 15 | `further_reading_resources` | — |
| 16 | `landing_category_groups` + `landing_group_categories` | `categories` |

### A.3 Transaction Strategy

```php
$pdo->exec('SET FOREIGN_KEY_CHECKS = 0');
$pdo->beginTransaction();
try {
    deleteAllRows($pdo); // DELETE FROM in reverse FK order (not TRUNCATE — stays in transaction)
    importCountries($pdo, $data['countries']);
    // ... steps 2-16 ...
    $pdo->commit();
} catch (Throwable $e) {
    $pdo->rollBack();
    throw $e;
} finally {
    $pdo->exec('SET FOREIGN_KEY_CHECKS = 1');
}
```

Uses `DELETE FROM` (not `TRUNCATE TABLE`) because MySQL's `TRUNCATE` causes an implicit commit. `FOREIGN_KEY_CHECKS` is set at the session level (MySQL does not scope it to transactions), so the `finally` block ensures it is always restored regardless of success or failure.

### A.4 Source Reading: TS-to-JSON Pre-export

A Node script `scripts/export-to-json.mjs` imports all TS data modules, runs the trust scoring engine, and writes a single JSON file to `tmp/export/catalog.json`. PHP reads only this JSON.

This avoids porting ~300 lines of scoring logic to PHP. The TS engine is the source of truth; the DB stores its output.

### A.5 Trust Score Computation

Computed in the Node export step using the existing `trustScore.ts` engine (`calculateTrustScoreV11`, `calculateSimpleTrustScore`). The JSON output includes pre-computed `trust_score_100`, `trust_score_10_display`, `trust_score_status`, and `trust_score_breakdown_json` per entry. PHP writes these directly.

### A.6 Idempotency

Truncate-and-reinsert: each import deletes all rows (in reverse FK order) and re-inserts everything within the same transaction. Simple and correct for ~3,000 total rows.

### A.7 DENIED_ALTERNATIVES.md Parsing

The Node export script parses the markdown:
1. Split on `## ` headings — each is one denied entry
2. Extract metadata from bold-prefixed lines (`**Proposed in:**`, etc.)
3. Extract denial reason between `### Reason` and `### Sources`
4. Extract sources as markdown links under `### Sources`
5. Infer failed gateways by matching patterns like "fails G1"

---

## Appendix B: API Endpoint Design

### File Structure

```
api/catalog/
  entries.php              # GET /api/catalog/entries?status=alternative&locale=en
  entry.php                # GET /api/catalog/entry?slug=tuta&locale=en
  categories.php           # GET /api/catalog/categories?locale=en
  countries.php            # GET /api/catalog/countries?locale=en
  tags.php                 # GET /api/catalog/tags
  further-reading.php      # GET /api/catalog/further-reading
  landing-groups.php       # GET /api/catalog/landing-groups?locale=en
```

One file per endpoint. The existing `.htaccess` already passes `/api/*` through to PHP.

### Locale Handling

Passed as `?locale=de` (default: `en`). PHP selects the right column:
```php
$descCol = $locale === 'de' ? 'COALESCE(description_de, description_en)' : 'description_en';
```

### US Vendor Comparison Assembly

Single batch query per request (not N+1):
```sql
SELECT er.entry_id, er.raw_name, er.sort_order,
       uv.slug AS vendor_id, uv.name AS vendor_name,
       uvp.description_en, uvp.trust_score_override_10, uvp.trust_score_status,
       uvpr.reservation_key, uvpr.text_en, uvpr.severity, uvpr.penalty_tier, uvpr.penalty_amount
FROM entry_replacements er
LEFT JOIN us_vendors uv ON uv.id = er.us_vendor_id
LEFT JOIN us_vendor_profiles uvp ON uvp.us_vendor_id = uv.id
LEFT JOIN us_vendor_profile_reservations uvpr ON uvpr.us_vendor_id = uv.id
WHERE er.entry_id IN (:ids)
ORDER BY er.entry_id, er.sort_order, uvpr.sort_order
```

PHP post-processes: group by entry, dedupe by `us_vendor_id` (first by `sort_order`), nest reservations.

### Caching

```php
header('Cache-Control: public, max-age=300, stale-while-revalidate=60');
```

5-minute cache matches Hostinger auto-pull interval. Health endpoint stays `no-cache`.

### Pagination

Not needed for ~234 entries. Envelope includes `meta.count` for future threshold detection.

---

## Appendix C: Edge Cases & Import Rules

### C.1 Manual-over-Research Dedup

Merge order: `[...manualAlternatives, ...researchAlternatives]`. First writer wins (manual always takes precedence on ID collision).

### C.2 Tag Sanitization

| Step | Rule |
|------|------|
| Normalize | `tag.trim().toLowerCase().replace(/[\s_]+/g, '-')` |
| Drop pricing tags | `free`, `freemium`, `paid`, `free-and-paid` |
| Drop openness tags | `open-source`, `opensource`, `partial-open-source`, `partly-open-source`, `proprietary` |
| Drop duplicates | After normalization |
| Inject derived tag | Prepend: `full` -> `open-source`, `partial` -> `partly-open-source`, `none` -> `proprietary` |

### C.3 Outlook Normalization

| `replacesUS` value | Category | Transformed to |
|---------------------|----------|----------------|
| `Outlook` | `email` | `Outlook.com` |
| `Outlook` | `mail-client` | `Microsoft Outlook (Desktop)` |
| `Outlook` | any other | Unchanged |

### C.4 Reservation Precedence

```
effective = alternative.reservations ?? reservationsById[alternative.id] ?? []
```

Inline reservations (even if empty array) take priority over `trustOverrides.ts`.

### C.5 US Vendor Contextual Naming

When source name differs from canonical record name after normalization, context is appended: `"Microsoft (Outlook Desktop)"`.

Fallback comparisons (unresolved): ID becomes `us-{slugified-name}`, status `pending`.

Dedup: first occurrence of each `comparison.id` wins.

### C.6 Non-Vetted Heuristic Scoring

| Source | Signal/Penalty | Dimension | Amount |
|--------|---------------|-----------|--------|
| Tag `encryption`/`zero-knowledge` | E2E encryption | security | +2 |
| Tag `privacy`/`no-logs` | Data minimization | security | +1 |
| `openSourceLevel = full` | Full open-source | governance | +2 |
| `selfHostable = true` | Self-hostable | contract | +2 |
| Non-vetted discount | Virtual penalty | each | -25% of dimension max |

Severity-to-penalty: major=4, moderate=2, minor=1. Tier inferred by keyword match on reservation text.

### C.7 Recency Decay

| Age | Multiplier |
|-----|------------|
| < 1 year | 1.0 |
| 1-3 years | 0.5 |
| 3-5 years | 0.25 |
| >= 5 years | 0.1 |
| No date (structural) | 1.0 |

### C.8 Cumulative Penalty Cap

15-point ceiling across all tiers (after recency decay). If exceeded, proportionally scale each tier. Non-vetted discount penalties are exempt from cap.

### C.9 Ad-Surveillance Cap

Hard ceiling of 45 on the 0-100 raw score. Triggered by `scoringMetadata[id].isAdSurveillance === true`. `effective_cap = min(CLASS_CAPS[baseClass], 45)`.

### C.10 Logo Fallback

`logo = alternative.logo ?? /logos/${alternative.id}.svg`. Store `logo_path = NULL` in DB; API applies fallback at read time.

---

## Appendix D: SQL Schema

```sql
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE `schema_migrations` (
  `version`    VARCHAR(255) NOT NULL,
  `applied_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `countries` (
  `code`       VARCHAR(5)   NOT NULL,
  `label_en`   VARCHAR(100) NOT NULL,
  `label_de`   VARCHAR(100) NOT NULL,
  `sort_order` INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `categories` (
  `id`             VARCHAR(50)  NOT NULL,
  `emoji`          VARCHAR(20)  NOT NULL,
  `name_en`        VARCHAR(200) NOT NULL,
  `name_de`        VARCHAR(200) NOT NULL,
  `description_en` TEXT         NOT NULL,
  `description_de` TEXT         NOT NULL,
  `sort_order`     INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `tags` (
  `id`       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug`     VARCHAR(100)    NOT NULL,
  `label_en` VARCHAR(200)    DEFAULT NULL,
  `label_de` VARCHAR(200)    DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tags_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `catalog_entries` (
  `id`                          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug`                        VARCHAR(100)    NOT NULL,
  `status`                      ENUM('alternative','us','denied','draft','archived') NOT NULL,
  `source_file`                 ENUM('manual','research','us','denied') NOT NULL,
  `is_active`                   TINYINT(1)      NOT NULL DEFAULT 1,
  `date_added`                  DATE            NOT NULL DEFAULT (CURRENT_DATE),
  `retired_at`                  DATETIME        DEFAULT NULL,
  `name`                        VARCHAR(255)    NOT NULL,
  `description_en`              TEXT            DEFAULT NULL,
  `description_de`              TEXT            DEFAULT NULL,
  `country_code`                VARCHAR(5)      DEFAULT NULL,
  `website_url`                 VARCHAR(2048)   DEFAULT NULL,
  `logo_path`                   VARCHAR(512)    DEFAULT NULL,
  `pricing`                     ENUM('free','freemium','paid') DEFAULT NULL,
  `is_open_source`              TINYINT(1)      DEFAULT NULL,
  `open_source_level`           ENUM('full','partial','none') DEFAULT NULL,
  `open_source_audit_url`       VARCHAR(2048)   DEFAULT NULL,
  `source_code_url`             VARCHAR(2048)   DEFAULT NULL,
  `self_hostable`               TINYINT(1)      DEFAULT NULL,
  `founded_year`                SMALLINT UNSIGNED DEFAULT NULL,
  `headquarters_city`           VARCHAR(200)    DEFAULT NULL,
  `license_text`                TEXT            DEFAULT NULL,
  `action_links_json`           JSON            DEFAULT NULL,
  `trust_score_100`             TINYINT UNSIGNED DEFAULT NULL,
  `trust_score_10_display`      DECIMAL(3,1)    DEFAULT NULL,
  `trust_score_status`          ENUM('pending','ready') DEFAULT NULL,
  `trust_score_breakdown_json`  JSON            DEFAULT NULL,
  `created_at`                  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`                  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_slug` (`slug`),
  KEY `ix_status` (`status`),
  KEY `ix_active_status` (`is_active`, `status`),
  CONSTRAINT `fk_country` FOREIGN KEY (`country_code`) REFERENCES `countries` (`code`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_openness` CHECK (
    (`is_open_source` IS NULL AND `open_source_level` IS NULL)
    OR (`is_open_source` = 0 AND `open_source_level` = 'none')
    OR (`is_open_source` = 1 AND `open_source_level` IN ('full','partial'))
  ),
  CONSTRAINT `chk_score_range` CHECK (`trust_score_100` IS NULL OR `trust_score_100` BETWEEN 0 AND 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `entry_categories` (
  `entry_id`         BIGINT UNSIGNED NOT NULL,
  `category_id`      VARCHAR(50)     NOT NULL,
  `is_primary`       TINYINT(1)      NOT NULL DEFAULT 0,
  `sort_order`       INT             NOT NULL DEFAULT 0,
  `primary_entry_id` BIGINT UNSIGNED AS (IF(`is_primary`, `entry_id`, NULL)) STORED,
  PRIMARY KEY (`entry_id`, `category_id`),
  UNIQUE KEY `uq_primary` (`primary_entry_id`),
  CONSTRAINT `fk_ec_entry` FOREIGN KEY (`entry_id`) REFERENCES `catalog_entries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ec_cat`   FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `entry_tags` (
  `entry_id`   BIGINT UNSIGNED NOT NULL,
  `tag_id`     BIGINT UNSIGNED NOT NULL,
  `sort_order` INT             NOT NULL DEFAULT 0,
  PRIMARY KEY (`entry_id`, `tag_id`),
  UNIQUE KEY `uq_tag_order` (`entry_id`, `sort_order`),
  CONSTRAINT `fk_et_entry` FOREIGN KEY (`entry_id`) REFERENCES `catalog_entries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_et_tag`   FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `us_vendors` (
  `id`       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug`     VARCHAR(100)    NOT NULL,
  `name`     VARCHAR(255)    NOT NULL,
  `entry_id` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_uv_slug` (`slug`),
  UNIQUE KEY `uq_uv_entry` (`entry_id`),
  CONSTRAINT `fk_uv_entry` FOREIGN KEY (`entry_id`) REFERENCES `catalog_entries` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `us_vendor_aliases` (
  `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `us_vendor_id`     BIGINT UNSIGNED NOT NULL,
  `alias_normalized` VARCHAR(255)    NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_alias` (`us_vendor_id`, `alias_normalized`),
  KEY `ix_alias` (`alias_normalized`),
  CONSTRAINT `fk_uva_vendor` FOREIGN KEY (`us_vendor_id`) REFERENCES `us_vendors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `us_vendor_profiles` (
  `us_vendor_id`            BIGINT UNSIGNED NOT NULL,
  `description_en`          TEXT            DEFAULT NULL,
  `description_de`          TEXT            DEFAULT NULL,
  `trust_score_override_10` DECIMAL(3,1)    DEFAULT NULL,
  `trust_score_status`      ENUM('pending','ready') NOT NULL DEFAULT 'pending',
  `score_source`            ENUM('manual_override','computed') NOT NULL DEFAULT 'computed',
  PRIMARY KEY (`us_vendor_id`),
  CONSTRAINT `fk_uvp_vendor` FOREIGN KEY (`us_vendor_id`) REFERENCES `us_vendors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_us_score` CHECK (`trust_score_override_10` IS NULL OR `trust_score_override_10` BETWEEN 0.0 AND 10.0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `us_vendor_profile_reservations` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `us_vendor_id`    BIGINT UNSIGNED NOT NULL,
  `reservation_key` VARCHAR(100)    NOT NULL,
  `sort_order`      INT             NOT NULL,
  `text_en`         TEXT            NOT NULL,
  `text_de`         TEXT            DEFAULT NULL,
  `severity`        ENUM('minor','moderate','major') NOT NULL,
  `event_date`      DATE            DEFAULT NULL,
  `source_url`      TEXT            DEFAULT NULL,
  `penalty_tier`    ENUM('security','governance','reliability','contract') DEFAULT NULL,
  `penalty_amount`  DECIMAL(5,2)    DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_uspr_key` (`us_vendor_id`, `reservation_key`),
  UNIQUE KEY `uq_uspr_order` (`us_vendor_id`, `sort_order`),
  CONSTRAINT `fk_uspr_vendor` FOREIGN KEY (`us_vendor_id`) REFERENCES `us_vendors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `category_us_vendors` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id`  VARCHAR(50)     NOT NULL,
  `us_vendor_id` BIGINT UNSIGNED DEFAULT NULL,
  `raw_name`     VARCHAR(255)    NOT NULL,
  `sort_order`   INT             NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cuv_order` (`category_id`, `sort_order`),
  UNIQUE KEY `uq_cuv_name` (`category_id`, `raw_name`),
  CONSTRAINT `fk_cuv_cat` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cuv_vendor` FOREIGN KEY (`us_vendor_id`) REFERENCES `us_vendors` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `entry_replacements` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `entry_id`     BIGINT UNSIGNED NOT NULL,
  `raw_name`     VARCHAR(255)    NOT NULL,
  `us_vendor_id` BIGINT UNSIGNED DEFAULT NULL,
  `sort_order`   INT             NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_er_order` (`entry_id`, `sort_order`),
  CONSTRAINT `fk_er_entry` FOREIGN KEY (`entry_id`) REFERENCES `catalog_entries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_er_vendor` FOREIGN KEY (`us_vendor_id`) REFERENCES `us_vendors` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `reservations` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `entry_id`        BIGINT UNSIGNED NOT NULL,
  `reservation_key` VARCHAR(100)    NOT NULL,
  `sort_order`      INT             NOT NULL,
  `severity`        ENUM('minor','moderate','major') NOT NULL,
  `event_date`      DATE            DEFAULT NULL,
  `penalty_tier`    ENUM('security','governance','reliability','contract') DEFAULT NULL,
  `penalty_amount`  DECIMAL(5,2)    DEFAULT NULL,
  `is_structural`   TINYINT(1)      NOT NULL DEFAULT 0,
  `text_en`         TEXT            NOT NULL,
  `text_de`         TEXT            DEFAULT NULL,
  `source_url`      TEXT            DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_res_key` (`entry_id`, `reservation_key`),
  UNIQUE KEY `uq_res_order` (`entry_id`, `sort_order`),
  CONSTRAINT `fk_res_entry` FOREIGN KEY (`entry_id`) REFERENCES `catalog_entries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `positive_signals` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `entry_id`   BIGINT UNSIGNED NOT NULL,
  `signal_key` VARCHAR(100)    NOT NULL,
  `sort_order` INT             NOT NULL,
  `dimension`  ENUM('security','governance','reliability','contract') NOT NULL,
  `amount`     DECIMAL(5,2)    NOT NULL,
  `text_en`    TEXT            NOT NULL,
  `text_de`    TEXT            DEFAULT NULL,
  `source_url` TEXT            DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sig_key` (`entry_id`, `signal_key`),
  UNIQUE KEY `uq_sig_order` (`entry_id`, `sort_order`),
  CONSTRAINT `fk_sig_entry` FOREIGN KEY (`entry_id`) REFERENCES `catalog_entries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `scoring_metadata` (
  `entry_id`            BIGINT UNSIGNED NOT NULL,
  `base_class_override` ENUM('foss','eu','nonEU','rest','us','autocracy') DEFAULT NULL,
  `is_ad_surveillance`  TINYINT(1)      DEFAULT NULL,
  `deep_research_path`  VARCHAR(512)    DEFAULT NULL,
  `worksheet_path`      VARCHAR(512)    DEFAULT NULL,
  PRIMARY KEY (`entry_id`),
  CONSTRAINT `fk_sm_entry` FOREIGN KEY (`entry_id`) REFERENCES `catalog_entries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `denied_decisions` (
  `entry_id`             BIGINT UNSIGNED NOT NULL,
  `proposed_in`          VARCHAR(255)    DEFAULT NULL,
  `claimed_origin`       VARCHAR(100)    DEFAULT NULL,
  `actual_origin`        VARCHAR(100)    DEFAULT NULL,
  `removed_in`           VARCHAR(255)    DEFAULT NULL,
  `raw_category_label`   VARCHAR(200)    DEFAULT NULL,
  `failed_gateways_json` JSON            DEFAULT NULL,
  `text_en`              TEXT            NOT NULL,
  `text_de`              TEXT            DEFAULT NULL,
  `sources_json`         JSON            DEFAULT NULL,
  PRIMARY KEY (`entry_id`),
  CONSTRAINT `fk_dd_entry` FOREIGN KEY (`entry_id`) REFERENCES `catalog_entries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `further_reading_resources` (
  `id`                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug`                VARCHAR(100)    NOT NULL,
  `name`                VARCHAR(255)    NOT NULL,
  `website_url`         VARCHAR(2048)   NOT NULL,
  `section`             ENUM('directories','publicCatalogues','migrationGuides') NOT NULL,
  `focus`               ENUM('eu','global','public-sector-eu') NOT NULL,
  `related_issues_json` JSON            DEFAULT NULL,
  `last_reviewed`       DATE            DEFAULT NULL,
  `sort_order`          INT             NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_fr_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `landing_category_groups` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name_en`        VARCHAR(200)    NOT NULL,
  `name_de`        VARCHAR(200)    DEFAULT NULL,
  `description_en` TEXT            DEFAULT NULL,
  `description_de` TEXT            DEFAULT NULL,
  `sort_order`     INT             NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `landing_group_categories` (
  `group_id`    BIGINT UNSIGNED NOT NULL,
  `category_id` VARCHAR(50)     NOT NULL,
  `sort_order`  INT             NOT NULL DEFAULT 0,
  PRIMARY KEY (`group_id`, `category_id`),
  UNIQUE KEY `uq_lgc_order` (`group_id`, `sort_order`),
  CONSTRAINT `fk_lgc_group` FOREIGN KEY (`group_id`) REFERENCES `landing_category_groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lgc_cat`   FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
```

---

## Appendix E: Frontend Switch Design

### E.1 Runtime Feature Flag (not build-time)

**Critical insight from risk assessment:** A build-time flag (`VITE_DATA_BACKEND`) requires a full rebuild + redeploy to roll back (2-5 minutes). Instead, use a **runtime** flag for instant rollback:

Option: small JSON config file fetched at app startup:
```
GET /api/config/flags.json  ->  { "dataBackend": "ts" }
```

To roll back: SSH into Hostinger, edit one JSON file. Sub-second. No rebuild needed.

### E.2 Data Provider

Create `src/data/provider.ts` exposing a `useCatalogData()` hook:
- When `dataBackend === 'ts'`: synchronous import from TS files (current behavior, no loading state)
- When `dataBackend === 'db'`: async fetch from API endpoints (with loading/error states)

Components change from `import { alternatives } from '../data'` to `const { alternatives, loading } = useCatalogData()`.

### E.3 API Client

Minimal fetch wrapper at `src/api/client.ts`. Only loaded in the `db` code path.

### E.4 Fallback on API Failure

Show a user-facing error message ("Data temporarily unavailable"). Do not silently fall back — it masks outages.

### E.5 Testing the Switch

1. Snapshot parity: capture full `alternatives` array from TS, deep-diff against API response
2. Bundle content assertion: verify no TS data literals in `db` build, no API URLs in `ts` build
3. Manual smoke test in staging before production switch

---

## Appendix F: Migration Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **PHP max_execution_time exceeded** during import | Medium | High | Always run via SSH/CLI where `max_execution_time=0`. Never trigger via HTTP. |
| **Concurrent import corruption** | Low | Critical | Use MySQL advisory lock `GET_LOCK('euroalt_import', 0)`. Abort if not acquired. |
| **Data drift** between TS files and DB during shadow mode | High | Medium | CI check: if any `src/data/*.ts` changed, trigger re-import automatically. |
| **Feature flag rollback requires rebuild** | High | Medium | Use runtime flag (Appendix E), not build-time. SSH edit for instant rollback. |
| **PHP version incompatibility** on Hostinger | Low | High | Pin PHP 8.1+. Add version check in `bootstrap.php`. Avoid 8.3-only features. |
| **Missing deep research file** referenced by scoring_metadata | Medium | Low | Warn (don't fail) during import. Store path anyway — not runtime-critical. |
| **Category FK violation** (alternative references nonexistent category) | Low | High | Import categories first. Validate references before insert. Skip with warning, don't fail entire import. |
| **InnoDB undo log bloat** from single large transaction | Low | Medium | ~3,000 rows is modest. Monitor `SHOW ENGINE INNODB STATUS` after first import. |
| **Stale data during import** (reads see truncated tables) | Medium | High | Use `DELETE FROM` (not `TRUNCATE`) to stay in transaction. Reads see old data until commit. |
| **CI dist commit interaction** with API files | Negligible | None | Verified: `/api/` is outside `dist/`. No interaction. |
