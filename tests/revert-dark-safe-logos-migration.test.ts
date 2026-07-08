import { existsSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migrationVersion = "081-revert-dark-safe-logos-for-light-chip";
const migrationUrl = new URL(
  "../scripts/migrations/081-revert-dark-safe-logos-for-light-chip.sql",
  import.meta.url,
);
const migrationExists = existsSync(migrationUrl);
const sql = migrationExists ? readFileSync(migrationUrl, "utf8") : "";
const normalizedSql = sql.replace(/\s+/g, " ").trim();

const revertedSlugs = [
  "bluecode",
  "collabora-online",
  "deepl",
  "disroot",
  "duplicati",
  "filen",
  "freebsd",
  "gnu-taler",
  "hedgedoc",
  "hostinger",
  "internxt",
  "ionos",
  "matomo",
  "mattermost",
  "mullvad-browser",
  "mullvad-vpn",
  "netcup",
  "opencloud",
  "opensearch",
  "organic-maps",
  "ovhcloud",
  "paperless-ngx",
  "pexip",
  "piper",
  "qobuz",
  "sailfish-os",
  "scaleway",
  "tor-browser",
  "tuta",
  "xmpp",
  "zen-browser",
];

describe("revert dark-safe logos migration", () => {
  it("points each low-contrast entry back at its plain SVG sibling", () => {
    expect(migrationExists).toBe(true);
    expect(normalizedSql).toContain("UPDATE `catalog_entries`");

    for (const slug of revertedSlugs) {
      expect(normalizedSql).toContain(`WHEN '${slug}' THEN '/logos/${slug}.svg'`);
    }
  });

  it("does not point any entry at a -dark-safe asset", () => {
    expect(normalizedSql).not.toMatch(/THEN '[^']*-dark-safe[^']*'/);
  });

  it("has a checked-in SVG asset for every reverted logo path", () => {
    for (const slug of revertedSlugs) {
      const logoUrl = new URL(`../public/logos/${slug}.svg`, import.meta.url);
      expect(existsSync(logoUrl), `Expected /logos/${slug}.svg to exist`).toBe(
        true,
      );
    }
  });

  it("records the schema migration version", () => {
    expect(normalizedSql).toContain(`'${migrationVersion}'`);
  });
});
