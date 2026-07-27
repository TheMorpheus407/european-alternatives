import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migrationVersion = "088-fckaf-de-mail-visible-logo";
const brokenLogoPath = "/logos/fckaf-de-mail.svg";
const visibleLogoPath = "/logos/fckaf-de-mail.png";
const migrationUrl = new URL(
  "../scripts/migrations/088-fckaf-de-mail-visible-logo.sql",
  import.meta.url,
);
const migrationExists = existsSync(migrationUrl);
const sql = migrationExists ? readFileSync(migrationUrl, "utf8") : "";
const normalizedSql = sql.replace(/\s+/g, " ").trim();

const pngUrl = new URL(`../public${visibleLogoPath}`, import.meta.url);
const legacySvgUrl = new URL(`../public${brokenLogoPath}`, import.meta.url);

describe("fckaf.de Mail visible logo migration", () => {
  it("updates only the known broken logo path on the intended entry", () => {
    expect(migrationExists).toBe(true);
    expect(normalizedSql).toContain("UPDATE `catalog_entries`");
    expect(normalizedSql).toContain(`SET \`logo_path\` = '${visibleLogoPath}'`);
    expect(normalizedSql).toContain("WHERE `slug` = 'fckaf-de-mail'");
    expect(normalizedSql).toContain(`AND \`logo_path\` = '${brokenLogoPath}'`);

    expect(sql.match(/UPDATE\s+`catalog_entries`/gi)).toHaveLength(1);
    expect(sql.match(/`slug`\s*=\s*'[^']+'/gi)).toEqual([
      "`slug` = 'fckaf-de-mail'",
    ]);
  });

  it("uses the reviewed square PNG without modifying its artwork", () => {
    expect(existsSync(pngUrl)).toBe(true);

    const png = readFileSync(pngUrl);
    expect(png.subarray(0, 8)).toEqual(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    );
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([748, 748]);
    expect(createHash("sha256").update(png).digest("hex")).toBe(
      "779909ba1f74ef510519ed315ded9bdb208d5282a9968162580ee1102e1f9ac5",
    );
  });

  it("keeps the legacy SVG URL visible with the same embedded artwork", () => {
    expect(existsSync(legacySvgUrl)).toBe(true);

    const svg = readFileSync(legacySvgUrl, "utf8");
    const embeddedPng = svg.match(
      /\bhref=["']data:image\/png;base64,([^"']+)["']/i,
    )?.[1];

    expect(svg).toContain("<svg");
    expect(embeddedPng).toBeDefined();
    expect(Buffer.from(embeddedPng ?? "", "base64")).toEqual(
      readFileSync(pngUrl),
    );
    expect(svg).not.toContain('href="fckaf-de-mail.png"');
  });

  it("records the schema migration version", () => {
    expect(normalizedSql).toMatch(
      new RegExp(
        `INSERT\\s+INTO\\s+\`schema_migrations\`\\s+\\(\`version\`\\)` +
          `\\s+VALUES\\s+\\('${migrationVersion}'\\)`,
        "i",
      ),
    );
  });
});
