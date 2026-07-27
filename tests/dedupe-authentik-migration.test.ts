import { existsSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migrationVersion = "091-dedupe-authentik";
const migrationUrl = new URL(
  "../scripts/migrations/091-dedupe-authentik.sql",
  import.meta.url,
);
const migrationExists = existsSync(migrationUrl);
const sql = migrationExists ? readFileSync(migrationUrl, "utf8") : "";
const normalizedSql = sql.replace(/\s+/g, " ").trim();
const executableSql = sql.replace(/--.*$/gm, "").replace(/\s+/g, " ").trim();

describe("authentik duplicate merge migration", () => {
  it("records current first-party identity, jurisdiction, and source-model evidence", () => {
    expect(migrationExists).toBe(true);
    expect(sql).toContain("Official evidence (accessed 2026-07-27)");

    for (const source of [
      "https://docs.goauthentik.io/developer-docs/docs/style-guide/",
      "https://goauthentik.io/legal/terms/",
      "https://goauthentik.io/legal/privacy-policy",
      "https://docs.goauthentik.io/index.html",
      "https://docs.goauthentik.io/developer-docs/contributing/",
      "https://github.com/goauthentik/authentik",
      "https://goauthentik.io/blog/2022-11-02-the-next-step-for-authentik/",
    ]) {
      expect(sql).toContain(source);
    }

    expect(normalizedSql).toContain(
      "official spelling of the product is lowercase `authentik`",
    );
    expect(normalizedSql).toContain("Authentik Security, Inc.");
    expect(normalizedSql).toContain("Delaware corporation");
    expect(normalizedSql).toContain("Philadelphia, Pennsylvania");
    expect(normalizedSql).toContain(
      "source-available and explicitly not open source",
    );
    expect(normalizedSql).toContain(
      "DECISION_MATRIX.md requires a non-European Tier 2 alternative to be fully",
    );
    expect(normalizedSql).toContain(
      "therefore belongs in the US catalog, not the alternatives catalog",
    );
  });

  it("keeps rich id 325 under the canonical product slug and classifies it as US", () => {
    for (const exactInitialGuard of [
      "canonical.`id` = 325",
      "canonical.`slug` = 'authentik'",
      "canonical.`status` = 'alternative'",
      "canonical.`source_file` = 'research'",
      "canonical.`date_added` = '2026-02-27'",
      "canonical.`name` = 'Authentik'",
      "canonical.`country_code` = 'us'",
      "canonical.`website_url` = 'https://goauthentik.io'",
      "canonical.`logo_path` = '/logos/authentik.svg'",
      "canonical.`open_source_level` = 'partial'",
      "canonical.`created_at` = '2026-02-27 14:30:34'",
      "canonical.`updated_at` = '2026-06-12 08:57:38'",
    ]) {
      expect(normalizedSql).toContain(exactInitialGuard);
    }

    expect(normalizedSql).toMatch(
      /UPDATE `catalog_entries` SET `status` = 'us', `name` = 'authentik'/,
    );
    expect(normalizedSql).toContain("`founded_year` = 2018");
    expect(normalizedSql).toContain(
      "`headquarters_city` = 'Philadelphia, Pennsylvania'",
    );
    expect(normalizedSql).toContain(
      "`license_text` = 'MIT (open-source core); Enterprise features source-available under separate commercial terms'",
    );
    const catalogUpdateSetClause = sql.match(
      /UPDATE\s+`catalog_entries`\s+SET([\s\S]*?)WHERE/i,
    )?.[1];
    expect(catalogUpdateSetClause).toBeDefined();
    expect(catalogUpdateSetClause).not.toMatch(/`slug`\s*=/i);
    expect(sql).not.toMatch(/SET\s+`id`\s*=/i);
  });

  it("strictly identifies and deletes only sparse duplicate id 881", () => {
    for (const duplicateGuard of [
      "duplicate.`id` = 881",
      "duplicate.`slug` = 'goauthentik'",
      "duplicate.`status` = 'us'",
      "duplicate.`source_file` = 'research'",
      "duplicate.`date_added` = '2026-06-11'",
      "duplicate.`name` = 'authentik'",
      "duplicate.`description_de` IS NULL",
      "duplicate.`website_url` = 'https://goauthentik.io/'",
      "duplicate.`logo_path` = '/logos/goauthentik.svg'",
      "duplicate.`founded_year` IS NULL",
      "duplicate.`created_at` = '2026-06-11 18:44:22'",
      "duplicate.`updated_at` = '2026-06-12 08:57:38'",
    ]) {
      expect(normalizedSql).toContain(duplicateGuard);
    }

    expect(normalizedSql).toMatch(
      /DELETE FROM `catalog_entries` WHERE `id` = 881 AND `slug` = 'goauthentik' AND `status` = 'us'/,
    );
    expect(sql.match(/DELETE\s+FROM\s+`catalog_entries`/gi)).toHaveLength(1);
    expect(normalizedSql).toContain(
      "FROM `catalog_entries` WHERE `id` = 881 OR `slug` = 'goauthentik'",
    );
  });

  it("merges only the duplicate's useful unique tags and one redundant category", () => {
    expect(normalizedSql).toContain(
      "INSERT INTO `entry_tags` (`entry_id`, `tag_id`, `sort_order`) SELECT 325, 1190, 10",
    );
    expect(normalizedSql).toContain("UNION ALL SELECT 325, 1191, 11");
    expect(normalizedSql).toContain(
      "FROM `entry_tags` WHERE `entry_id` IN (325, 881) ) = 17",
    );
    expect(normalizedSql).toContain(
      "DELETE FROM `entry_tags` WHERE `entry_id` = 881 AND @authentik_should_merge = 1",
    );
    expect(normalizedSql).toContain(
      "DELETE FROM `entry_categories` WHERE `entry_id` = 881 AND `category_id` = 'iam' AND `is_primary` = 1 AND `sort_order` = 0 AND `primary_entry_id` = 881",
    );
    expect(normalizedSql).toContain(
      "SELECT COUNT(*) FROM `entry_tags` WHERE `entry_id` = 325 ) = 12",
    );
  });

  it("retains the rich trust data and one exact IAM placeholder set", () => {
    expect(normalizedSql).toContain(
      "FROM `matrix_facts` WHERE `entry_id` = 325 ) = 51",
    );
    expect(normalizedSql).toContain(
      "FROM `matrix_facts` WHERE `entry_id` = 881 ) = 51",
    );
    expect(normalizedSql).toContain(
      "`entry_id` = 325 AND `id` NOT BETWEEN 15702 AND 15752",
    );
    expect(normalizedSql).toContain(
      "`entry_id` = 881 AND `id` NOT BETWEEN 29097 AND 29147",
    );
    expect(normalizedSql).toContain(
      "DELETE FROM `matrix_facts` WHERE `entry_id` = 881 AND `id` BETWEEN 29097 AND 29147",
    );
    expect(normalizedSql).toContain("`criterion_id` BETWEEN 1859 AND 1909");
    expect(normalizedSql).toContain("`matrix_fact_attempts`");
    expect(normalizedSql).toContain("`matrix_fact_verifications`");
    expect(normalizedSql).toContain(
      "FROM `reservations` WHERE `entry_id` IN (325, 881) ) = 6",
    );
    expect(normalizedSql).toContain(
      "FROM `positive_signals` WHERE `entry_id` IN (325, 881) ) = 20",
    );
    expect(normalizedSql).toContain(
      "`deep_research_path` = 'tmp/deepresearches/Authentik.md'",
    );

    for (const preservedTable of [
      "reservations",
      "positive_signals",
      "scoring_metadata",
    ]) {
      expect(sql).not.toMatch(
        new RegExp(`(?:DELETE\\s+FROM|UPDATE)\\s+\`${preservedTable}\``, "i"),
      );
    }
  });

  it("removes contradictory outgoing replacements without inventing US benchmarks", () => {
    expect(normalizedSql).toContain(
      "FROM `entry_replacements` WHERE `entry_id` IN (325, 881) OR `replaced_entry_id` IN (325, 881)",
    );

    for (const replacementId of [34, 35, 36, 37, 38, 834]) {
      expect(normalizedSql).toContain(`\`id\` = ${replacementId}`);
    }

    expect(normalizedSql).toContain(
      "DELETE FROM `entry_replacements` WHERE @authentik_should_merge = 1",
    );
    expect(normalizedSql).toContain(
      "LOWER(REPLACE(TRIM(`raw_name`), ' ', '')) IN ('authentik', 'goauthentik')",
    );
    expect(normalizedSql).toContain(
      "LOWER(REPLACE(TRIM(`alias`), ' ', '')) IN ('authentik', 'goauthentik')",
    );
    expect(sql).not.toMatch(/UPDATE\s+`entry_replacements`/i);
    expect(sql).not.toMatch(/INSERT\s+INTO\s+`category_us_vendors`/i);
    expect(sql).not.toMatch(/INSERT\s+INTO\s+`us_vendor_aliases`/i);
  });

  it("covers every catalog-entry FK and keeps every mutation narrowly guarded", () => {
    for (const relation of [
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
      expect(sql, `Expected relation coverage for ${relation}`).toContain(
        `\`${relation}\``,
      );
    }

    expect(sql.match(/UPDATE\s+`catalog_entries`/gi)).toHaveLength(1);
    expect(sql).not.toMatch(
      /(?:DELETE\s+FROM|UPDATE)\s+`(?:category_us_vendors|denied_decisions|positive_signals|reservations|scoring_metadata|us_vendor_aliases)`/i,
    );

    for (const mutatedRelation of [
      "entry_replacements",
      "entry_tags",
      "matrix_facts",
      "entry_categories",
      "catalog_entries",
    ]) {
      const statement = normalizedSql.match(
        new RegExp(`DELETE FROM \`${mutatedRelation}\` ([\\s\\S]*?);`, "i"),
      )?.[0];
      expect(
        statement,
        `Expected guarded delete for ${mutatedRelation}`,
      ).toBeDefined();
      expect(statement).toContain("@authentik_should_merge = 1");
      expect(statement).toMatch(/(?:`id`|`entry_id`)\s*=/);
    }
  });

  it("fails closed on drift, is atomic and idempotent, and records migration 091", () => {
    expect(executableSql).toMatch(/^START TRANSACTION;/i);
    expect(executableSql).toMatch(/COMMIT;$/i);
    expect(normalizedSql).toContain("@authentik_initial_state");
    expect(normalizedSql).toContain("@authentik_final_state");
    expect(normalizedSql).toContain("@authentik_post_state");
    expect(normalizedSql).toContain(
      "COALESCE(@authentik_initial_state, 0) + COALESCE(@authentik_final_state, 0) <> 1",
    );
    expect(normalizedSql).toContain("PRIMARY KEY (`singleton`)");
    expect(normalizedSql).toContain("@authentik_should_merge = 1");
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
