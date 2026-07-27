import { existsSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migrationVersion = "090-dedupe-itch-io";
const migrationUrl = new URL(
  "../scripts/migrations/090-dedupe-itch-io.sql",
  import.meta.url,
);
const laterLogoMigrationUrl = new URL(
  "../scripts/migrations/093-materialize-catalog-logo-paths.sql",
  import.meta.url,
);
const migrationExists = existsSync(migrationUrl);
const sql = migrationExists ? readFileSync(migrationUrl, "utf8") : "";
const laterLogoSql = existsSync(laterLogoMigrationUrl)
  ? readFileSync(laterLogoMigrationUrl, "utf8")
  : "";
const normalizedSql = sql.replace(/\s+/g, " ").trim();
const evidenceText = sql
  .replace(/^--\s?/gm, "")
  .replace(/\s+/g, " ")
  .trim();

describe("itch.io duplicate merge migration", () => {
  it("records official identity evidence and the audited live row shape", () => {
    expect(migrationExists).toBe(true);
    expect(evidenceText).toContain("Official sources (accessed 2026-07-27)");
    expect(evidenceText).toContain(
      "Live database and public EN/DE API audit on 2026-07-27",
    );
    expect(evidenceText).toContain(
      "both locales exposed two active US entries named itch.io",
    );
    expect(sql).toContain("https://itch.io/docs/general/about");
    expect(sql).toContain("https://itch.io/app");
    expect(evidenceText).toContain(
      "Both live catalog rows point to exactly https://itch.io/",
    );
    expect(evidenceText).toContain("same 37 untouched open matrix facts");
    expect(evidenceText).toContain("criterion ids 2819..2855");
  });

  it("keeps the richer id 969 row and exactly identifies sparse id 931", () => {
    expect(normalizedSql).toContain("SET @itch_canonical_id := (");
    expect(normalizedSql).toContain("WHERE `id` = 969");
    expect(normalizedSql).toContain("AND `slug` = 'itch-io'");
    expect(normalizedSql).toContain("AND `pricing` = 'freemium'");
    expect(normalizedSql).toContain("AND `is_open_source` = 1");
    expect(normalizedSql).toContain("AND `open_source_level` = 'partial'");
    expect(normalizedSql).toContain(
      "AND `source_code_url` = 'https://github.com/itchio/itch'",
    );
    expect(
      sql.match(/`open_source_audit_url`\s+IS\s+NULL/gi)?.length,
    ).toBeGreaterThanOrEqual(2);
    expect(normalizedSql).toContain("AND `founded_year` = 2013");
    expect(normalizedSql).toContain("AND `license_text` = 'MIT License'");
    expect(
      sql.match(/`action_links_json`\s+IS\s+NULL/gi)?.length,
    ).toBeGreaterThanOrEqual(2);

    expect(normalizedSql).toContain("SET @itch_duplicate_id := (");
    expect(normalizedSql).toContain("WHERE `id` = 931");
    expect(normalizedSql).toContain("AND `slug` = 'itch.io'");
    expect(normalizedSql).toContain("AND `pricing` IS NULL");
    expect(normalizedSql).toContain("AND `is_open_source` IS NULL");
    expect(normalizedSql).toContain(
      "AND `logo_path` = '/logos/itch.io.svg'",
    );
  });

  it("gates the merge on every direct catalog-entry relation", () => {
    const directRelationTables = [
      "entry_categories",
      "matrix_facts",
      "entry_tags",
      "category_us_vendors",
      "entry_replacements",
      "us_vendor_aliases",
      "reservations",
      "positive_signals",
      "scoring_metadata",
      "denied_decisions",
    ];

    for (const table of directRelationTables) {
      expect(
        normalizedSql,
        `Expected a strict ${table} precondition`,
      ).toContain(`\`${table}\``);
    }

    expect(normalizedSql).toContain(
      "`entry_id` IN (@itch_canonical_id, @itch_duplicate_id)",
    );
    expect(normalizedSql).toContain(
      "`replaced_entry_id` IN (@itch_canonical_id, @itch_duplicate_id)",
    );
    expect(normalizedSql).toContain(
      "`criterion_id` NOT BETWEEN 2819 AND 2855",
    );
    expect(normalizedSql).toContain("`status` <> 'open'");
    expect(normalizedSql).toContain("`selected_attempt_id` IS NOT NULL");
    expect(normalizedSql).toContain("`matrix_fact_attempts`");
    expect(normalizedSql).toContain("t.`slug` = 'game-store'");
    expect(normalizedSql).toContain("t.`slug` = 'launcher'");
  });

  it("preserves canonical relations and narrowly removes only redundant rows", () => {
    expect(normalizedSql).toContain(
      "SET `date_added` = '2026-06-12', `logo_path` = '/logos/itch-io.svg'",
    );
    expect(
      existsSync(new URL("../public/logos/itch-io.svg", import.meta.url)),
    ).toBe(true);

    const deletedTables = [
      ...sql.matchAll(/DELETE(?:\s+\w+)?\s+FROM\s+`([^`]+)`/gi),
    ].map((match) => match[1]);
    expect(deletedTables).toEqual([
      "matrix_facts",
      "entry_categories",
      "catalog_entries",
    ]);

    expect(sql.match(/UPDATE\s+`catalog_entries`/gi)).toHaveLength(1);
    expect(sql).not.toMatch(/UPDATE\s+`entry_tags`/i);
    expect(normalizedSql).toContain(
      "WHERE duplicate_entry.`id` = @itch_duplicate_id",
    );
    expect(normalizedSql).toContain(
      "AND duplicate_entry.`slug` = 'itch.io'",
    );
    expect(
      sql.match(/@itch_should_merge\s*=\s*1/gi)?.length,
    ).toBeGreaterThanOrEqual(4);
  });

  it("fails closed on drift and verifies every fresh-merge mutation", () => {
    expect(normalizedSql).toContain("SET @itch_final_state := (");
    expect(normalizedSql).toContain(
      "CREATE TEMPORARY TABLE `_dedupe_itch_io_assert`",
    );
    expect(normalizedSql).toContain("PRIMARY KEY (`singleton`)");
    expect(normalizedSql).toContain(
      "COALESCE(@itch_merge_ready, 0) + COALESCE(@itch_final_state, 0) <> 1",
    );
    expect(normalizedSql).toContain(
      "SET @itch_should_merge := COALESCE(@itch_merge_ready, 0)",
    );
    expect(normalizedSql).toContain(
      "SET @itch_updated_row_count := ROW_COUNT()",
    );
    expect(normalizedSql).toContain(
      "SET @itch_deleted_fact_count := ROW_COUNT()",
    );
    expect(normalizedSql).toContain(
      "SET @itch_deleted_category_count := ROW_COUNT()",
    );
    expect(normalizedSql).toContain(
      "SET @itch_deleted_entry_count := ROW_COUNT()",
    );
    expect(normalizedSql).toContain("@itch_deleted_fact_count = 37");
    expect(normalizedSql).toContain(
      "COALESCE(@itch_merge_completed, 0) <> 1",
    );
  });

  it("aborts before migration 093 can materialize a skipped itch.io logo", () => {
    expect(laterLogoSql).toContain("'itch-io'");
    expect(normalizedSql).toContain("AND `logo_path` IS NULL");
    expect(normalizedSql).toContain(
      "A SQL error prevents later migrations such as",
    );
    expect(normalizedSql.indexOf("@itch_merge_completed")).toBeLessThan(
      normalizedSql.indexOf("INSERT INTO `schema_migrations`"),
    );
  });

  it("is atomic and records exact initial and final states idempotently", () => {
    expect(normalizedSql).toMatch(/^-- .* START TRANSACTION;/);
    expect(normalizedSql).toMatch(/COMMIT;$/);
    expect(normalizedSql).toMatch(
      new RegExp(
        "INSERT\\s+INTO\\s+`schema_migrations`\\s+\\(`version`\\)" +
          `\\s+VALUES\\s+\\('${migrationVersion}'\\)` +
          "\\s+ON DUPLICATE KEY UPDATE",
        "i",
      ),
    );
    expect(normalizedSql).toContain(
      "WHEN @itch_should_merge = 0 THEN COALESCE(@itch_final_state, 0)",
    );
    expect(normalizedSql).toContain(
      "WHERE `id` = 931 OR `slug` = 'itch.io'",
    );
    expect(normalizedSql).toContain(
      "DROP TEMPORARY TABLE IF EXISTS `_dedupe_itch_io_assert`",
    );
  });
});
