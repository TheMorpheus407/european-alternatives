import { existsSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migrationVersion = "089-kmeet-current-website";
const staleWebsite = "https://www.infomaniak.com/en/kmeet";
const currentWebsite = "https://www.infomaniak.com/en/ksuite/kmeet";
const migrationUrl = new URL(
  "../scripts/migrations/089-kmeet-current-website.sql",
  import.meta.url,
);
const migrationExists = existsSync(migrationUrl);
const sql = migrationExists ? readFileSync(migrationUrl, "utf8") : "";
const normalizedSql = sql.replace(/\s+/g, " ").trim();
const evidenceText = sql
  .replace(/^--\s?/gm, "")
  .replace(/\s+/g, " ")
  .trim();

describe("kMeet current website migration", () => {
  it("records the official canonical page and dated HTTP evidence", () => {
    expect(migrationExists).toBe(true);
    expect(sql).toContain("Official source (accessed 2026-07-27)");
    expect(sql).toContain(currentWebsite);
    expect(evidenceText).toContain(
      `404 for ${staleWebsite} and 200 for the canonical URL`,
    );
    expect(evidenceText).toContain("declares that same URL as canonical");
  });

  it("updates only the stale active alternative kMeet row", () => {
    expect(normalizedSql).toContain("UPDATE `catalog_entries`");
    expect(normalizedSql).toContain(
      `SET \`website_url\` = '${currentWebsite}'`,
    );
    expect(normalizedSql).toContain("WHERE `slug` = 'kmeet'");
    expect(normalizedSql).toContain("AND `status` = 'alternative'");
    expect(normalizedSql).toContain("AND `is_active` = 1");
    expect(normalizedSql).toContain(
      `AND \`website_url\` = '${staleWebsite}'`,
    );

    expect(sql.match(/UPDATE\s+`catalog_entries`/gi)).toHaveLength(1);
    expect(sql.match(/SET\s+`website_url`\s*=/gi)).toHaveLength(1);
    expect(sql.match(/`slug`\s*=\s*'[^']+'/gi)).toEqual([
      "`slug` = 'kmeet'",
    ]);
    expect(sql).not.toMatch(/\bDELETE\b|\bINSERT\s+INTO\s+`catalog_entries`/i);
  });

  it("runs atomically and records an idempotent migration version", () => {
    expect(normalizedSql).toMatch(/^-- .* START TRANSACTION;/);
    expect(normalizedSql).toMatch(/COMMIT;$/);
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
