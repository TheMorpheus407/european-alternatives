import { existsSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migrationVersion = "092-dedupe-doodle";
const migrationUrl = new URL(
  "../scripts/migrations/092-dedupe-doodle.sql",
  import.meta.url,
);
const migrationExists = existsSync(migrationUrl);
const sql = migrationExists ? readFileSync(migrationUrl, "utf8") : "";
const normalizedSql = sql.replace(/\s+/g, " ").trim();
const executableSql = sql.replace(/--.*$/gm, "").replace(/\s+/g, " ").trim();

describe("Doodle duplicate merge migration", () => {
  it("records current first-party Swiss ownership and jurisdiction evidence", () => {
    expect(migrationExists).toBe(true);
    expect(sql).toContain("Official evidence (accessed 2026-07-27)");
    expect(sql).toContain("https://doodle.com/en/website-imprint/");
    expect(sql).toContain("https://doodle.com/en/about-us/");
    expect(sql).toContain(
      "https://tx.group/fileadmin/user_upload/reports-and-publications/2025/en/Annual_Report_2025_ENG.pdf",
    );
    expect(sql).toContain("registered and governed by Swiss");
    expect(sql).toContain("Zurich-based TX Group");
    expect(sql).toContain("built in Europe / Switzerland");
  });

  it("keeps rich row 903 as the Swiss alternative with the canonical Doodle slug", () => {
    expect(normalizedSql).toContain("canonical.`id` = 903");
    expect(normalizedSql).toContain("canonical.`slug` = 'doodle-ch'");
    expect(normalizedSql).toContain("canonical.`status` = 'alternative'");
    expect(normalizedSql).toContain("canonical.`source_file` = 'research'");
    expect(normalizedSql).toContain("canonical.`country_code` = 'ch'");
    expect(normalizedSql).toContain(
      "canonical.`website_url` = 'https://doodle.com/'",
    );
    expect(normalizedSql).toContain(
      "canonical.`logo_path` = '/logos/doodle-ch.svg'",
    );
    expect(normalizedSql).toContain("canonical.`founded_year` = 2007");
    expect(normalizedSql).toContain(
      "canonical.`headquarters_city` = 'Zurich'",
    );

    expect(normalizedSql).toMatch(
      /UPDATE `catalog_entries` SET `slug` = 'doodle' WHERE `id` = 903 AND `slug` = 'doodle-ch'/,
    );
    expect(sql).not.toMatch(/SET\s+`id`\s*=/i);
  });

  it("guards and deletes only empty misclassified row 884", () => {
    for (const expected of [
      "duplicate.`id` = 884",
      "duplicate.`slug` = 'doodle'",
      "duplicate.`status` = 'us'",
      "duplicate.`source_file` = ''",
      "duplicate.`country_code` = 'us'",
      "duplicate.`website_url` IS NULL",
      "duplicate.`description_en` IS NULL",
      "duplicate.`pricing` IS NULL",
      "duplicate.`is_open_source` IS NULL",
    ]) {
      expect(normalizedSql).toContain(expected);
    }
    expect(sql).toContain("legacy source_file value is the zero-length string");

    expect(normalizedSql).toMatch(
      /DELETE FROM `catalog_entries` WHERE `id` = 884 AND `slug` = 'doodle' AND `status` = 'us'/,
    );
    expect(sql.match(/DELETE\s+FROM\s+`catalog_entries`/gi)).toHaveLength(1);
    expect(sql).not.toMatch(
      /DELETE\s+FROM\s+`catalog_entries`[\s\S]*?WHERE\s+`slug`\s*=\s*'doodle'\s*;/i,
    );
  });

  it("covers every direct catalog-entry relation found in the live schema", () => {
    for (const table of [
      "category_us_vendors",
      "denied_decisions",
      "entry_categories",
      "entry_replacements",
      "entry_tags",
      "matrix_facts",
      "positive_signals",
      "reservations",
      "scoring_metadata",
      "us_vendor_aliases",
    ]) {
      expect(sql, `Expected relation guard for ${table}`).toContain(
        `\`${table}\``,
      );
    }

    expect(sql).toContain("`matrix_fact_attempts`");
    expect(sql).toContain("`matrix_fact_verifications`");
  });

  it("preserves the rich row's complete audited relation set", () => {
    expect(normalizedSql).toContain(
      "FROM `entry_categories` WHERE `entry_id` IN (884, 903) ) = 1",
    );
    expect(normalizedSql).toContain(
      "FROM `entry_tags` WHERE `entry_id` IN (884, 903) ) = 4",
    );
    expect(normalizedSql).toContain(
      "FROM `matrix_facts` WHERE `entry_id` IN (884, 903) ) = 41",
    );
    expect(normalizedSql).toContain(
      "FROM `positive_signals` WHERE `entry_id` IN (884, 903) ) = 5",
    );
    expect(normalizedSql).toContain(
      "FROM `reservations` WHERE `entry_id` IN (884, 903) ) = 6",
    );
    expect(normalizedSql).toContain(
      "`base_class_override` = 'eu'",
    );
    expect(normalizedSql).toContain("`is_ad_surveillance` = 1");
    expect(normalizedSql).toContain(
      "`deep_research_path` = '/home/morpheus/Documents/Projects/european-alternatives/tmp/score-resume-input-2026-06-12-docx-121000/doodle-ch.md'",
    );

    for (const table of [
      "entry_categories",
      "entry_tags",
      "matrix_facts",
      "positive_signals",
      "reservations",
      "scoring_metadata",
    ]) {
      expect(sql).not.toMatch(new RegExp(`(?:DELETE|UPDATE)\\s+(?:FROM\\s+)?\`${table}\``, "i"));
    }
  });

  it("removes rather than rewires the two invalid US-semantic relations", () => {
    expect(normalizedSql).toMatch(
      /DELETE FROM `entry_replacements` WHERE `id` = 836 AND `entry_id` = 883 AND `raw_name` = 'Doodle' AND `replaced_entry_id` = 884 AND `sort_order` = 1/,
    );
    expect(normalizedSql).toMatch(
      /DELETE FROM `us_vendor_aliases` WHERE `id` = 281 AND `alias` = 'Doodle' AND `entry_id` = 884/,
    );
    expect(normalizedSql).toContain(
      "`id` = 847 AND `entry_id` = 903 AND `raw_name` = 'Calendly' AND `replaced_entry_id` = 640",
    );
    expect(normalizedSql).toContain(
      "FROM `category_us_vendors` WHERE `entry_id` IN (884, 903) OR LOWER(TRIM(`raw_name`)) = 'doodle'",
    );
    expect(normalizedSql).toContain(
      "FROM `entry_replacements` WHERE `entry_id` IN (884, 903) OR `replaced_entry_id` IN (884, 903) OR LOWER(TRIM(`raw_name`)) = 'doodle'",
    );
    expect(normalizedSql).toContain(
      "FROM `us_vendor_aliases` WHERE `entry_id` IN (884, 903) OR LOWER(TRIM(`alias`)) = 'doodle'",
    );
    expect(normalizedSql).toContain(
      "FROM `entry_replacements` WHERE LOWER(TRIM(`raw_name`)) = 'doodle' OR `entry_id` = 884",
    );

    expect(sql).not.toMatch(/UPDATE\s+`category_us_vendors`/i);
    expect(sql).not.toMatch(/UPDATE\s+`entry_replacements`/i);
    expect(sql).not.toMatch(/UPDATE\s+`us_vendor_aliases`/i);
    expect(sql).not.toMatch(/INSERT\s+INTO\s+`us_vendor_aliases`/i);
    expect(normalizedSql).toContain(
      "(`entry_id` = 903 AND `replaced_entry_id` = 903)",
    );
  });

  it("fails closed on drift, runs atomically, and is safely idempotent", () => {
    expect(executableSql).toMatch(/^START TRANSACTION;/i);
    expect(executableSql).toMatch(/COMMIT;$/i);
    expect(normalizedSql).toContain("@doodle_initial_state");
    expect(normalizedSql).toContain("@doodle_final_state");
    expect(normalizedSql).toContain(
      "COALESCE(@doodle_initial_state, 0) + COALESCE(@doodle_final_state, 0) <> 1",
    );
    expect(normalizedSql).toContain("PRIMARY KEY (`singleton`)");
    expect(normalizedSql).toContain("@doodle_should_merge = 1");
    expect(normalizedSql).toContain(
      "SET @doodle_post_state = ( SELECT COUNT(*) = 1",
    );
    expect(normalizedSql).toContain(
      "WHERE COALESCE(@doodle_post_state, 0) <> 1",
    );

    const finalMutationIndex = normalizedSql.indexOf(
      "UPDATE `catalog_entries` SET `slug` = 'doodle'",
    );
    const postStateIndex = normalizedSql.indexOf(
      "SET @doodle_post_state = (",
    );
    const postAssertionIndex = normalizedSql.indexOf(
      "WHERE COALESCE(@doodle_post_state, 0) <> 1",
    );
    const migrationRecordIndex = normalizedSql.indexOf(
      "INSERT INTO `schema_migrations`",
    );
    expect(finalMutationIndex).toBeGreaterThan(-1);
    expect(postStateIndex).toBeGreaterThan(finalMutationIndex);
    expect(postAssertionIndex).toBeGreaterThan(postStateIndex);
    expect(migrationRecordIndex).toBeGreaterThan(postAssertionIndex);

    expect(normalizedSql).toMatch(
      new RegExp(
        `INSERT\\s+INTO\\s+\`schema_migrations\`\\s+\\(\`version\`\\)` +
          `\\s+VALUES\\s+\\('${migrationVersion}'\\)` +
          "\\s+ON DUPLICATE KEY UPDATE",
        "i",
      ),
    );
  });
});
