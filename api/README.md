# European Alternatives — API & Database

Developer reference for the PHP read API and MySQL database.

---

## Quick Start

### Prerequisites

- PHP 8.1+ (CLI)
- MySQL 8.0+ (InnoDB, utf8mb4)
- Database credentials configured (see [Production Secrets](#production-secrets) below)

### npm Scripts

| npm script   | Command                                                      | Description                                                                  |
| ------------ | ------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `db:import`  | `php scripts/db-import.php --source tmp/export/catalog.json` | Seed catalog and matrix MySQL tables from exported JSON (single transaction) |
| `db:backup`  | `bash scripts/db-backup.sh`                                  | Backup the database                                                          |
| `db:restore` | `bash scripts/db-restore.sh`                                 | Restore a database backup                                                    |

---

## API Endpoints

Catalog endpoints are read-only, return JSON, and are cached for 5 minutes (`Cache-Control: public, max-age=300`). Operational health endpoints are uncached and may require authentication.

| Method | URL                            | Query Params                                                           | Description                                                                                                                       |
| ------ | ------------------------------ | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/catalog/entries`         | `status` (alternative\|us\|denied\|draft\|archived), `locale` (en\|de) | List all active entries for a given status. Default: `status=alternative`, `locale=en`.                                           |
| GET    | `/api/catalog/entry`           | `slug`, `locale` (en\|de)                                              | Fetch a single entry by slug with full detail (reservations, signals, comparisons).                                               |
| GET    | `/api/catalog/matrix`          | `category`, `locale` (en\|de)                                          | Fetch one category's matrix groups, criteria, options, active alternatives, and public fact states. Default: `locale=en`.         |
| GET    | `/api/catalog/categories`      | `locale` (en\|de)                                                      | List all categories with i18n names and descriptions.                                                                             |
| GET    | `/api/catalog/countries`       | `locale` (en\|de)                                                      | List all countries with i18n labels.                                                                                              |
| GET    | `/api/catalog/tags`            | --                                                                     | List all tags with slugs and optional labels.                                                                                     |
| GET    | `/api/catalog/further-reading` | --                                                                     | List curated further-reading resources.                                                                                           |
| GET    | `/api/catalog/landing-groups`  | `locale` (en\|de)                                                      | Landing page category groups with nested category IDs.                                                                            |
| GET    | `/api/health/db`               | --                                                                     | Operational database readiness check (no caching, requires admin Bearer token, includes transport probe metadata when available). |

Response envelope for list endpoints:

```json
{
  "data": [ ... ],
  "meta": { "count": 234, "locale": "en" }
}
```

### Catalog Matrix Response

`GET /api/catalog/matrix?category=messaging&locale=en` returns the comparison matrix for exactly one category. `category` is required and must match an existing category ID. `locale` defaults to `en` and must be `en` or `de`.

Success responses use the catalog `{ "data": ..., "meta": ... }` envelope. `meta` includes the requested `category`, resolved `locale`, `groupCount`, `criterionCount`, and `alternativeCount`.

The response includes:

- `data.category` with localized category metadata
- `data.groups[]` in matrix sort order, each with nested `criteria[]` and ordered `options[]`
- `data.alternatives[]` for active alternatives assigned to the requested category, including secondary category assignments
- `alternatives[].facts`, keyed by criterion ID, with one fact cell for every returned criterion

Fact cells use a public status and value:

```json
{
  "status": "verified",
  "value": true,
  "source": {
    "url": "https://example.com/source",
    "title": "Source title",
    "accessedDate": "2026-05-24"
  }
}
```

Missing, open, researching, rejected, or otherwise unresolved facts are returned as `{ "status": "unverified", "value": null }`. Facts that do not apply are returned as `{ "status": "not_applicable", "value": null }`. Verified facts expose public source metadata when available, but never audit quotes or raw agent/verifier output.

Facts that have been verified at least once retain their last verified value and public source for the duration of any subsequent recheck. The cell stays `verified` even while the internal pipeline is re-researching or has failed a recheck — the prior value is only replaced when a new verification succeeds. This means the public matrix never flickers to `Unverified` mid-recheck.

Locale fallback: when `locale=de` and no German translation exists for a field, the English value is returned via `COALESCE(column_de, column_en)`.

### Category Matrix Concepts

Category matrix criteria are category-native product-fit facts, not Trust Score inputs. Category matrix facts do not affect Trust Score. Criterion groups, criteria, and enum options belong to one category; the API and UI load them only when exactly one category is selected. The `other` category is a catch-all bucket and non-matrix: it does not have matrix criteria, matrix view mode, or category-specific fit filters.

Criteria describe comparison rows for a category:

- `value_type` defines the stored value shape: `boolean`, `enum`, `multi_enum`, `number`, `text`, `url`, or `date`.
- `semantics` describes how maintainers should interpret the row for display and review: `beneficial`, `harmful`, `neutral`, `tradeoff`, `informational`, or `risk`.
- `filter_mode` controls whether the criterion can become a category-specific fit filter: `none`, `optional`, `must_match`, `range`, or `multi_select`.

Fit filters are browsing aids for product-fit comparisons. They compose with the normal browse filters, are active only in a single matrix-enabled category, and include `Unverified` results by default so unknown/open facts do not disappear from browse results. Unknown/open facts appear as `Unverified` and are included by default by fit filters. Matrix facts and fit filters do not change the Trust Score formula; Trust Score remains computed only from reservations, positive signals, and scoring metadata.

Public fact state is intentionally narrower than internal research state:

| Internal state                                                                                                          | Public API/UI state                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `verified`                                                                                                              | `verified` with the typed value and optional public source metadata                                 |
| `researching` or `needs-deeper-research` on a fact that was previously verified (recheck in progress or recheck failed) | `verified` with the prior typed value and public source metadata, until a new verification succeeds |
| `not-applicable`                                                                                                        | `not_applicable` with `value: null`                                                                 |
| Missing fact, `open`, `researching`, `rejected`, `needs-deeper-research` on a fact that was never verified              | `unverified` / `Unverified` with `value: null`                                                      |

Public source links may be displayed in normal UI for verified facts. Audit quotes, raw researcher output, raw verifier output, and verifier notes are stored in `matrix_fact_attempts` or `matrix_fact_verifications` for review and audit only; the public matrix API does not return them. In short: public source links are UI-safe, while audit-only quotes and raw agent output are private review records.

---

## Database Schema

23 tables on MySQL 8.0+ (InnoDB, utf8mb4_unicode_ci). Full DDL in `scripts/db-schema.sql`.

### Core Entities

| Table               | PK                     | Purpose                                                                   |
| ------------------- | ---------------------- | ------------------------------------------------------------------------- |
| `catalog_entries`   | Auto ID, unique `slug` | Unified entity table for alternatives, US vendors, denied entries, drafts |
| `categories`        | Slug ID                | Category definitions with emoji, i18n name/description                    |
| `countries`         | ISO alpha-2 code       | Country lookup with i18n labels                                           |
| `tags`              | Auto ID, unique `slug` | Normalized tag slugs                                                      |
| `schema_migrations` | Version string         | Tracks applied schema versions                                            |

### Relationships

| Table                | Purpose                                                                         |
| -------------------- | ------------------------------------------------------------------------------- |
| `entry_categories`   | M:N entries-to-categories (with `is_primary` flag)                              |
| `entry_tags`         | M:N entries-to-tags (ordered)                                                   |
| `entry_replacements` | Which US vendors an alternative replaces (ordered, with optional FK resolution) |

### Matrix Criteria & Facts

| Table                       | Purpose                                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| `matrix_criterion_groups`   | Category-owned groups for comparison matrix rows                                         |
| `matrix_criteria`           | Category-specific matrix criteria, value types, filter modes, and sort order             |
| `matrix_criterion_options`  | Allowed enum or multi-enum options for matrix criteria                                   |
| `matrix_facts`              | Current public fact value per entry and criterion, with public source metadata           |
| `matrix_fact_attempts`      | Audit trail of research attempts, proposed values, audit quotes, and raw model responses |
| `matrix_fact_verifications` | Independent audit verification records for research attempts                             |

### Display & Mapping

| Table                 | Purpose                                       |
| --------------------- | --------------------------------------------- |
| `category_us_vendors` | Per-category "Replaces X, Y, Z" display order |

### Trust & Scoring

| Table              | Purpose                                                                     |
| ------------------ | --------------------------------------------------------------------------- |
| `reservations`     | Trust penalty evidence per entry (severity, penalty tier/amount, i18n text) |
| `positive_signals` | Trust-positive evidence per entry (dimension, amount, i18n text)            |
| `scoring_metadata` | Per-entry scoring config (base class override, ad-surveillance flag)        |

Trust scores are dynamically computed on every API request by `api/catalog/scoring.php` from reservations, positive signals, and scoring metadata. No scores are stored in the database.

### Editorial & Landing

| Table                       | Purpose                                                               |
| --------------------------- | --------------------------------------------------------------------- |
| `denied_decisions`          | Denial reasoning for rejected alternatives (failed gateways, sources) |
| `further_reading_resources` | Curated external resource links                                       |
| `landing_category_groups`   | Groups for landing page display                                       |
| `landing_group_categories`  | M:N landing groups-to-categories                                      |

### Key Constraints

- `catalog_entries.chk_openness`: `is_open_source` and `open_source_level` must be mutually consistent.
- `entry_categories`: at most one primary category per entry (enforced via generated column + unique index).
- All i18n columns use column-based storage (`_en` / `_de` suffixes), not a separate translations table.

---

## Scripts Reference

| Script                                      | Language | Purpose                                                                                                                                                                                                          |
| ------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/db-schema.sql`                     | SQL      | Full DDL for all 23 tables (run via `mysql` CLI)                                                                                                                                                                 |
| `scripts/db-import.php`                     | PHP      | Read `catalog.json`, seed catalog and matrix tables in a single transaction with advisory lock                                                                                                                   |
| `scripts/matrix-research-select.php`        | PHP      | Select and claim one open, retry, or stale verified matrix fact for the external research loop, with targeting and dry-run support                                                                               |
| `scripts/matrix-research-run.mjs`           | Node.js  | Run one `codex` or `claude` researcher against one selected fact, with mock response support                                                                                                                     |
| `scripts/matrix-verify-run.mjs`             | Node.js  | Run three independent `codex` or `claude` verifier slots for one pending attempt, with mock response support                                                                                                     |
| `scripts/matrix-research-persist.php`       | PHP      | Persist one research attempt, optional verifier decision, audit rows, and final fact status                                                                                                                      |
| `scripts/matrix-research-loop.mjs`          | Node.js  | Repeatedly drive the one-fact matrix research pipeline until a limit fires or the queue is empty                                                                                                                 |
| `scripts/process-suggestion-issue-codex.sh` | Bash     | Run one catalog suggestion issue through classification, catalog snapshot, fact research, verification, apply, and finalization                                                                                  |
| `scripts/score-deep-research-folder.sh`     | Bash     | Autonomous batch runner that walks a folder of deep-research Markdown documents and scores each catalog entry through the five-stage pipeline (match → extract → verify → worksheet → DB write + API post-check) |
| `scripts/db-backup.sh`                      | Bash     | Backup the MySQL database                                                                                                                                                                                        |
| `scripts/db-restore.sh`                     | Bash     | Restore a database backup                                                                                                                                                                                        |

### Catalog Suggestion Issue Pipeline

Use the single-issue orchestrator when an issue suggests a new catalog alternative or a correction to an existing catalog fact:

```bash
bash scripts/process-suggestion-issue-codex.sh 516 --dry-run
bash scripts/process-suggestion-issue-codex.sh 516 --max-verification-attempts 3
```

The orchestrator runs the issue through classification, a catalog snapshot, fact research, source-class-aware verification, apply, and GitHub finalization. It writes stage artifacts and `result.json` under `tmp/issues/<issue-number>/`. `--dry-run` is propagated to every stage; in dry-run mode the pipeline can research and verify, but it does not write to the database and does not mutate GitHub.

Verification attempts are capped by `--max-verification-attempts <n>`, or by `EUROALT_MAX_VERIFICATION_ATTEMPTS` when the CLI flag is omitted. The default is 2 total attempts. The count includes the first research/verify pass, so `1` preserves the no-retry behavior and `2` allows one corrective pass.

For pending `new_alternative` imports, the verifier independently evaluates every sourced catalog fact and records the evidence source class. Independent different-domain corroboration is preferred and uses `sourceClass: "independent"`, but basic pending imports can also pass with authoritative `official`, `legal`, or `registry` evidence when the source directly supports the fact and no contradiction is found. Legal/operator jurisdiction fields such as `country_code` must be supported by `legal`, `registry`, or truly independent evidence; a generic product page is not enough. Catalog fact corrections keep the stricter independent-domain verification standard because they update existing facts rather than creating a pending entry.

Verifier evidence `sourceUrl` values must be public `https://` URLs. Public `http://`, localhost, loopback, private, and reserved hosts fail closed instead of becoming retry feedback. Successful new-alternative finalization comments list verifier evidence under `Verifier sources` and include `[source class: ...]` on each verifier source, so authoritative official/legal/registry evidence is not described as independent corroboration.

If the verifier returns a structurally valid review with a non-supporting verdict (`inconclusive`, `contradicts`, or `source-inaccessible`), the pipeline writes structured feedback and retries research while the attempt budget remains. The next research pass receives the original issue, the catalog snapshot, the previous research payload, and the verifier feedback. Apply/finalize only run after a verifier pass where every required evidence record is `supports`.

If research parsing fails with retryable parser feedback, such as a missing source entry for a source-backed field, the pipeline writes `research-parser-feedback-<attempt>.json` and retries research while the attempt budget remains. The next research pass receives the parser feedback, plus the previous valid research payload and verifier feedback when those artifacts exist.

Non-retryable research and verifier failures still fail closed immediately. Malformed output, banned scoring/trust/reservation keys, action mismatches, missing required blocks, invalid evidence shapes, unsafe URLs, and same-domain verifier evidence marked as `sourceClass: "independent"` do not become retry feedback.

Per-attempt artifacts are preserved for debugging:

- `research-1.json`, `research-2.json`, ...
- `research-raw-1.txt`, `research-raw-2.txt`, ...
- `research-fact-1.stderr.log`, `research-fact-2.stderr.log`, ...
- `research-parser-feedback-1.json`, `research-parser-feedback-2.json`, ...
- `verified-action-1.json`, `verified-action-2.json`, ...
- `verify-raw-1.txt`, `verify-raw-2.txt`, ...
- `verify-fact-1.stderr.log`, `verify-fact-2.stderr.log`, ...
- `verification-feedback-1.json`, `verification-feedback-2.json`, ...

Raw `research-raw-*.txt` and `verify-raw-*.txt` files contain the model response before parsing. They are local diagnostics under `tmp/issues/<issue-number>/`; parsed JSON artifacts remain the compatibility inputs for downstream stages.

The latest selected research payload is also copied to `research.json`. The successful verified action is copied to `verified-action.json` before apply/finalize so existing downstream scripts can keep using the compatibility filenames.

Verifier feedback artifacts contain the failed field or change, verdict, verifier source metadata, optional reasoning, and `auditQuote` only when the verifier supplied a non-empty quote. For example, `source-inaccessible` feedback may have no `auditQuote`:

```json
{
  "issueNumber": 516,
  "action": "new_alternative",
  "retryable": true,
  "failedEvidence": [
    {
      "path": "newAlternative.evidence.country_code",
      "field": "country_code",
      "verdict": "inconclusive",
      "sourceClass": "legal",
      "sourceUrl": "https://example.com/source",
      "sourceTitle": "Source title",
      "accessedDate": "2026-06-11",
      "auditQuote": "Short quote from the verifier source.",
      "reasoning": "Why the source did not support the researched fact."
    }
  ]
}
```

For fact-correction issues, feedback entries also identify the failed change with `changeIndex`, `table`, `column`, `field`, and `proposedValue` when those values are available.

`result.json` keeps the batch-readable outcome. When retryable verifier feedback persists through the full budget, the orchestrator records:

```json
{
  "writes_applied": false,
  "outcome": "verification_retries_exhausted"
}
```

Verifier failures that do not produce feedback keep the existing `verify_failed_rc_<code>` outcome and are not retried.

When running the stage scripts directly instead of the orchestrator, `scripts/verify-fact-codex.sh` accepts `--raw-output-file <path>` to preserve raw verifier output and `--feedback-output-file <path>` to write retry feedback. `scripts/research-fact-codex.sh` accepts `--raw-output-file <path>` to preserve raw researcher output, `--parser-feedback-output-file <path>` to write retryable parser feedback, and `--previous-research-file <path>`, `--verification-feedback-file <path>`, and `--parser-feedback-file <path>` to build a corrective retry prompt.

For new-alternative research payloads, every non-null scalar source-backed field and every non-empty source-backed array must have a matching source entry. Optional arrays such as `tags` and `replaces_us` should be `[]` with no source entry when unsupported or empty.

### Matrix Research Selector

Use the selector when an operator or automation loop needs exactly one matrix fact to research:

```bash
php scripts/matrix-research-select.php [--mode initial|deeper-research] [--category messaging] [--entry primary-chat] [--criterion e2ee] [--include-stale] [--dry-run]
```

Selection mode:

- `--mode initial` (default) picks only `open` matrix facts. `needs-deeper-research` facts are **never** picked in this mode. With `--include-stale`, stale verified facts are appended after the open queue.
- `--mode deeper-research` picks only `needs-deeper-research` facts whose backoff timer has elapsed (see [Deeper Research Policy](#deeper-research-policy)). Stale verified facts are not eligible in this mode; `--include-stale` has no effect when combined with deeper-research mode.

Target options can be combined with either mode:

- `--category <category_id>` selects within one matrix category.
- `--entry <entry_slug>` or `--entry-slug <entry_slug>` selects within one catalog entry.
- `--criterion <criterion_key>` selects within one criterion key.
- `--include-stale` (initial mode only) also considers verified facts whose selected verification attempt is older than the stale threshold (see [Stale Fact Recheck Policy](#stale-fact-recheck-policy)). Without this flag the selector ignores already-verified facts, regardless of age.

Partial targets choose the next eligible fact within that scope. A real run marks the selected fact as `researching`; `--dry-run` prints the target that would be selected without writing to the database. When a stale verified fact is claimed for recheck, its prior typed value and public source metadata are preserved on the row so the public API continues to show the cell as `verified` until a new verification succeeds.

Successful selections print JSON to stdout:

```json
{
  "factId": 123,
  "categoryId": "messaging",
  "categoryName": "Messaging",
  "entrySlug": "primary-chat",
  "entryName": "Primary Chat",
  "criterionKey": "e2ee",
  "criterionLabel": "End-to-end encryption",
  "valueType": "boolean",
  "previousStatus": "open",
  "status": "researching",
  "dryRun": false
}
```

In dry-run mode, `dryRun` is `true` and `status` remains the previous fact status.

| Exit code | Meaning                                                                                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `0`       | A fact was selected, or dry-run found the fact that would be selected.                                                                     |
| `2`       | No matrix fact matched the requested scope and mode. The script prints `No open matrix fact available for the requested scope.` to stderr. |
| `64`      | Invalid CLI usage, such as an unknown option, an unknown `--mode` value, or a missing option value.                                        |
| `1`       | Database or unexpected runtime failure.                                                                                                    |

### Stale Fact Recheck Policy

Verified matrix facts are not trusted forever. A fact becomes **stale** when its selected verification attempt is older than the configured age threshold and is then eligible for an automated recheck through the normal one-fact pipeline.

- **Threshold:** controlled by the `MATRIX_FACT_STALE_AFTER_DAYS` environment variable. The default is **180 days**. The value is a single positive integer applied globally — there is no per-category or per-criterion override. Invalid or unset values fall back to the default.
- **Opt-in:** the selector ignores verified facts unless invoked with `--include-stale` (or the loop runner is invoked with `--include-stale`). The stale queue is appended after open facts, so unverified facts are still drained first. `--include-stale` only applies in initial mode; the deeper-research queue (see [Deeper Research Policy](#deeper-research-policy)) is independent.
- **Recheck contract:** rechecks use the same one-fact / one-researcher / three-independent-verifier pipeline as initial research. The selector claims the stale fact (its status flips to `researching`), the researcher and verifiers run, and the persister settles the outcome.
- **Value preservation:** a failed recheck — for example, when the original source is no longer accessible or the verifiers do not converge — does **not** erase the previously verified value. The row keeps its prior typed value, public source, and selected attempt ID, and only the status changes (typically to `needs-deeper-research`). The public matrix API continues to render the cell as `verified` until a new verification succeeds. Source-access failure thus moves the fact toward deeper re-research without taking the cell offline.

### Deeper Research Policy

When initial research cannot resolve a matrix fact — sources disagree, no class 1–5 source qualifies, or verifiers do not converge — the fact settles to `needs-deeper-research` and enters a separate, backoff-gated queue. Deeper-research passes apply stricter source rules and run only when explicitly requested.

- **Explicit selection only.** The default `--mode initial` selector never picks `needs-deeper-research` facts. Use `--mode deeper-research` (selector or loop runner) to drain the deeper-research queue. The normal open-fact queue and the deeper-research queue stay separate.
- **One fact per invocation.** Deeper research preserves the same one-fact / one-researcher / three-independent-verifier contract as initial research.
- **Stricter source rules.** Deeper-research prompts forbid class 6 reputable-third-party fallback sources. Only class 1–5 sources may be used; if no class 1–5 source qualifies, the attempt settles back to `needs-deeper-research`.
- **Backoff schedule (no retry ceiling).** After each `needs-deeper-research` settlement, the fact is suppressed from the deeper-research queue until the backoff window elapses:

  | Failure count | Next eligible after  |
  | ------------- | -------------------- |
  | 1             | 1 day                |
  | 2             | 3 days               |
  | 3             | 7 days               |
  | 4 and beyond  | 30 days indefinitely |

  Facts are never locked as "unresolvable" by the automated pipeline — the queue stays open forever, just paced.

- **Audit preserved.** Every attempt, verifier record, and verifier decision is kept. Prior attempt history is never rewritten or deleted across retries.
- **Reset on success.** When a deeper-research attempt verifies, the fact's backoff counter and next-eligible timestamp reset to zero / NULL.
- **Public surface unchanged.** A fact in `needs-deeper-research` that was previously verified continues to render as `verified` in the public API with its prior typed value and public source. A fact that has never been verified renders as `Unverified` regardless of its internal deeper-research state.

### One-Fact Matrix Research Workflow

The matrix research loop is deliberately one fact at a time. One script invocation researches one fact only and must not batch multiple categories, entries, criteria, products, or adjacent facts.

1. Select and claim one target:

   ```bash
   php scripts/matrix-research-select.php --category messaging --entry primary-chat --criterion e2ee
   ```

   Store the selected target JSON for the next step. The target includes the fact ID, category, entry slug, criterion key, value type, previous status, and current `researching` status.

2. Research exactly that selected fact:

   ```bash
   node scripts/matrix-research-run.mjs --researcher codex --target-file ./tmp/matrix-target.json
   ```

   `--researcher` supports `codex` and `claude`. The researcher output must answer one fact only and include an accessible source URL, source title when available, accessed date, one short audit quote copied from the source, confidence, and raw response metadata. A sourced proposed value becomes a `needs-verification` attempt. No evidence, an inaccessible source, or an unsuitable answer becomes `needs-deeper-research`.

   Deterministic tests can pass `--mock-response-file <path>` instead of invoking a live CLI. Mock files are test fixtures, not live research evidence.

3. If the attempt status is `needs-verification`, run three independent verifier slots:

   ```bash
   node scripts/matrix-verify-run.mjs --verifier codex --attempt-bundle-file ./tmp/matrix-attempt-bundle.json
   ```

   `--verifier` supports `codex` and `claude`. The three independent verifier rule requires each verifier slot to independently verify the same one pending attempt without relying on other verifier outputs. To count, each verifier record must satisfy the accessible-source quote requirement: it must use an accessible source and include its own source URL, accessed date, audit quote, verdict, notes, and raw response. Verified persistence requires three countable verifier records, one from each slot. Missing, inaccessible, or non-counting verifier evidence leaves the fact unresolved and normally returns it to `needs-deeper-research`.

   Tests can use `--mock-response-file` three times, `--mock-response-files <paths>`, or `--mock-response-dir <path>` containing `response-1.txt`, `response-2.txt`, and `response-3.txt`.

4. Persist the one-fact outcome:

   ```bash
   php scripts/matrix-research-persist.php --attempt-file ./tmp/matrix-attempt.json --decision-file ./tmp/matrix-decision.json
   ```

   Persistence writes the attempt, optional verifier decision, verifier audit rows, and final `matrix_facts` status in one transaction. A `needs-deeper-research` research attempt can be persisted without verifier rows. Pending verification attempts require a verifier decision. Verified outcomes publish the typed value and public source metadata to `matrix_facts`; rejected and retry outcomes keep the public value and public source fields empty so the API continues to show `Unverified`.

### Matrix Research Loop Runner

`scripts/matrix-research-loop.mjs` is an automation wrapper around the one-fact workflow above. It calls the selector, researcher, verifier, and persister in sequence, one fact per iteration, and continues until either a configured limit fires or the selector reports no eligible facts remain. The wrapper never bypasses the one-fact-per-invocation contract of the inner scripts; every stage is spawned as a separate subprocess.

```bash
node scripts/matrix-research-loop.mjs [options]
```

Default behavior with no flags: process eligible facts until the selector returns exit `2` ("no open matrix fact available").

Options (all opt-in; no implicit defaults are applied when a flag is absent):

- `--max-facts N` — stop after `N` processed iterations.
- `--max-runtime MIN` — stop when wall-clock elapsed reaches `MIN` minutes (fractional minutes accepted).
- `--max-consecutive-failures N` — stop after `N` failed iterations in a row. A successful iteration resets the streak.
- `--category SLUG` — forwarded to the selector as `--category SLUG` so only facts in that category are processed.
- `--include-stale` — forwarded to the selector as `--include-stale` so stale verified facts also enter the queue (see [Stale Fact Recheck Policy](#stale-fact-recheck-policy)). Only valid in initial mode.
- `--mode <initial|deeper-research>` — forwarded to the selector as `--mode <value>`. Defaults to the selector's own default (`initial`). Use `--mode deeper-research` to drive the backoff-gated deeper-research queue (see [Deeper Research Policy](#deeper-research-policy)).
- `--selector-cmd <cmd>`, `--researcher-cmd <cmd>`, `--verifier-cmd <cmd>`, `--persister-cmd <cmd>` — override the shell command for each stage. Used by tests; production runs leave these unset.

Both `--flag value` and `--flag=value` forms are accepted for every option.

The runner's default stage wiring matches the manual workflow above. The verifier and persister each take their structured inputs through the file-based flags the inner scripts already expose: the runner writes the `{ target, attempt }` bundle to a per-iteration temp file under `tmp/` and appends `--attempt-bundle-file <path>` to the verifier command, and writes the attempt and decision to two separate temp files and appends `--attempt-file <path> --decision-file <path>` to the persister command. Temp files are cleaned up after each iteration. When `--verifier-cmd` or `--persister-cmd` is supplied, the runner does not inject any file flags — the operator owns the full command and receives the bundle on stdin instead.

The runner prints one compact line per completed iteration to stdout (`[iter 12] fact=987 status=verified`) and a final end summary with counts for `verified`, `rejected`, `needs-deeper-research`, `skipped`, `failed`, `no-open`, plus `processed` and `elapsed-ms`. `skipped` covers persister outcomes that fall outside the three real fact statuses; `failed` covers any non-zero exit, empty stdout, or invalid JSON from selector, researcher, verifier, or persister.

| Exit code | Meaning                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------- |
| `0`       | The loop reached a stop condition cleanly (queue empty, limit hit, or consecutive-failure cap reached). |
| `1`       | The selector reported invalid usage (exit `64`), or the runner itself encountered an unexpected error.  |
| `64`      | Invalid runner CLI usage, such as an unknown option or a non-positive value for a numeric flag.         |

### Deep-Research Folder Scoring Runner

`scripts/score-deep-research-folder.sh` is the top-level operator entrypoint for the deep-research trust-scoring pipeline. Point it at a folder of deep-research Markdown documents and it processes each one end-to-end, one document at a time, through the five stages built up by `vet-deep-research-codex.sh`, `vet-deep-research-extract-codex.sh`, `vet-deep-research-verify-codex.sh`, `vet-deep-research-worksheet.sh`, and `apply-deep-research-scoring-run.mjs`.

```bash
bash scripts/score-deep-research-folder.sh \
  --input-dir tmp/deep-research-inbox \
  --catalog-snapshot-file tmp/catalog-snapshot.json \
  --api-base-url https://european-alternatives.cloud \
  --output-dir tmp/score-run-2026-05-27 \
  [--entry primary-chat] [--limit 5] \
  [--dry-run] [--continue-on-error] [--replace-existing] \
  [--accessed-date 2026-05-27] [--php /usr/bin/php8.1]
```

Documents are processed sequentially with no parallel DB writes. A per-document failure in any stage (match, extract, verify, worksheet, or apply) leaves the database untouched for that document — only stage 5 writes, and it wraps its write in a single transaction. The batch as a whole stops on the first failure unless `--continue-on-error` is set.

Options:

- `--input-dir <path>` (required) — folder of deep-research Markdown documents.
- `--catalog-snapshot-file <path>` — pre-fetched catalog snapshot forwarded to stage 1 (match).
- `--api-base-url <url>` (required outside `--dry-run`) — forwarded to stage 5 for the post-write API readback.
- `--output-dir <path>` (required) — per-batch artifact root. Each processed document gets its own `<entrySlug>/` subdirectory.
- `--entry <slug>` — restrict the batch to the one document whose stage-1 match resolves to this entry slug.
- `--limit <n>` — cap the number of post-match documents processed, after sorted-filename ordering.
- `--dry-run` — propagated to every stage; performs discovery/matching and prints planned actions without DB mutation.
- `--continue-on-error` — do not abort on the first failed document; finish the batch and report every outcome.
- `--replace-existing` — forwarded **only** to stage 5. Allows re-scoring an entry that already has stored scoring rows. Without this flag, an already-scored entry is counted as `skipped`, not failed.
- `--accessed-date YYYY-MM-DD` — forwarded to stages 2 and 3 (extract and verify) so source-accessed dates are reproducible.
- `--php <bin>` — forwarded to the stage-5 PHP wrapper for non-default PHP binaries.

Both `--flag value` and `--flag=value` forms are accepted for every option.

Per-document artifacts are written under `<output-dir>/<entrySlug>/`:

- `match.json` — stage-1 match record for the document.
- `entry.json` — minimal catalog entry record passed to stages 2 and 3.
- `extraction.json` — stage-2 (extract) output.
- `verified-action.json` — stage-3 (verify) output, used as input to stages 4 and 5.
- `worksheet-meta.json` — stage-4 (worksheet) metadata, including the worksheet path.
- `apply-outcome.json` — stage-5 (apply) outcome.
- `status.json` — final per-document status (`ready`, `skipped`, or `failed`, with `failedStage` and `exitCode` on failure).
- `stage-*.stderr.log` — captured stderr from any stage that wrote to stderr.

A batch-level `<output-dir>/summary.json` aggregates the run:

```json
{
  "inputDir": "/abs/path/to/inbox",
  "outputDir": "/abs/path/to/output",
  "dryRun": false,
  "counts": { "processed": 7, "ready": 5, "skipped": 1, "failed": 1 },
  "documents": [
    {
      "entrySlug": "primary-chat",
      "documentPath": "...",
      "status": "ready",
      "worksheetPath": "tmp/scoring-worksheets/primary-chat.md"
    },
    {
      "entrySlug": "secure-mail",
      "documentPath": "...",
      "status": "skipped",
      "reason": "already_scored_no_replace_flag"
    },
    {
      "entrySlug": "...",
      "status": "failed",
      "failedStage": "verify",
      "exitCode": 2
    }
  ]
}
```

`processed` counts only documents the runner actually attempted post-match. Documents that stage 1 reports as `no_match` or `ambiguous_match` are counted toward `skipped`, never toward `processed`.

| Exit code | Meaning                                                                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `0`       | All matched documents reached `ready` (or were intentionally `skipped`, including already-scored entries without `--replace-existing`).                      |
| `1`       | One or more documents failed. Only reachable when `--continue-on-error` is set; without that flag the first failure's exit code propagates verbatim instead. |
| `64`      | Invalid CLI usage (missing required option, unknown option, non-numeric `--limit`).                                                                          |
| `65`      | Pre-flight failed (input directory unreadable or not a directory; catalog snapshot file missing).                                                            |

---

## Production Secrets

Database credentials are stored outside the web root on Hostinger:

```
/home/u688914453/.secrets/euroalt-db-env.php
```

Uses `putenv(...)` format.

Required variables:

- `EUROALT_DB_HOST`
- `EUROALT_DB_PORT`
- `EUROALT_DB_NAME`
- `EUROALT_DB_USER`
- `EUROALT_DB_PASS`
- `EUROALT_DB_CHARSET`

Optional TLS variables for remote MySQL:

- `EUROALT_DB_SSL_CA`
- `EUROALT_DB_SSL_CAPATH`
- `EUROALT_DB_SSL_CERT`
- `EUROALT_DB_SSL_KEY`
- `EUROALT_DB_SSL_CIPHER`
- `EUROALT_DB_SSL_VERIFY_SERVER_CERT`
- `EUROALT_DB_REQUIRE_TLS`

Loopback development (`localhost`, `127.0.0.1`, `::1`) may leave these unset, empty, or `0`.

Remote database hosts must set `EUROALT_DB_REQUIRE_TLS=1`, must provide `EUROALT_DB_SSL_CA` (or `EUROALT_DB_SSL_CAPATH`), and must set `EUROALT_DB_SSL_VERIFY_SERVER_CERT=1`. The app rejects non-loopback DB configs that do not meet that contract.

Remote deployments should also keep MySQL secure transport mandatory on the server or account side (`require_secure_transport=ON`, `REQUIRE SSL`, or `REQUIRE X509`). PDO's TLS attributes add the client materials and verification settings, while the server-side requirement prevents fallback to plaintext if encrypted transport cannot be established.

See `api/config/db.env.example.php` for the template.

For local development, `api/config/db.env.php` is loaded automatically when present. That file is gitignored and uses the same `putenv(...)` format as `api/config/db.env.example.php`. Bash wrappers that need DB credentials, such as `scripts/db-backup.sh` and `scripts/db-restore.sh`, also load the same local PHP env file before validating `EUROALT_DB_*`. You can still override this by exporting `EUROALT_DB_*` variables directly or by setting `EUROALT_ENV_LOADER` to an approved secrets-loader path.

The local admin bearer token may be kept in gitignored `api/config/admin-token.php`. Local PHP admin endpoints and the `scripts/insert-verified-alternative.sh` wrapper load it automatically when `EUROALT_ADMIN_TOKEN` is not already exported. Non-dry-run API clients still require an explicit `EUROALT_API_BASE` unless that value is also supplied by the local PHP env file.

---

## Architecture Overview

```
MySQL 8.0  <---  PHP API endpoints (read-only, batch queries, 5min cache)
                        |
                        v
                  React Frontend (fetches on mount via CatalogContext)
```

Import is idempotent: each run deletes all rows (in reverse FK order) and re-inserts within the same transaction. Concurrent imports are prevented by a MySQL advisory lock.
