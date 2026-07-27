import { existsSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migrationVersion = "093-materialize-catalog-logo-paths";
const migrationUrl = new URL(
  "../scripts/migrations/093-materialize-catalog-logo-paths.sql",
  import.meta.url,
);
const migrationExists = existsSync(migrationUrl);
const sql = migrationExists ? readFileSync(migrationUrl, "utf8") : "";
const normalizedSql = sql.replace(/\s+/g, " ").trim();
const executableSql = sql.replace(/--.*$/gm, "").replace(/\s+/g, " ").trim();

const expectedSlugsByStatus = {
  alternative: [
    "agora-cosmica",
    "argos-translate",
    "artfol",
    "asyntai",
    "buddy",
    "bulwark-webmail",
    "captchaapi.eu",
    "clesk-uptime",
    "codecks",
    "deezer",
    "degoog",
    "deutschlandgpt",
    "euro-office",
    "eusend",
    "faugus-launcher",
    "fotocommunity",
    "friv",
    "gamex-games",
    "glitchtip",
    "habicht-ai",
    "heimdall",
    "hilbertraum",
    "hydra-launcher",
    "irys",
    "kanidm",
    "keytrace",
    "maptoolkit",
    "melious-ai",
    "murena-workspace",
    "nebula",
    "oeffi",
    "ohhi",
    "oshu",
    "oxid-eshop",
    "paas.build",
    "parsehawk",
    "rare",
    "rethinkdns",
    "retroachievements",
    "sifa-id",
    "silex",
    "silverbullet",
    "softmaker-office-2024",
    "stammhausplus",
    "tangled",
    "the-wolfs-stash",
    "tymeslot",
    "upscrolled",
    "viewbook",
    "weasyl",
    "websidian",
    "whisper-web",
    "zeiterfassungplus",
  ],
  us: [
    "bluehost",
    "character-ai",
    "chatbase",
    "cloudflare-turnstile",
    "deviantart",
    "drift",
    "epic-games-launcher",
    "flickr",
    "google-document-ai",
    "google-recaptcha",
    "hcaptcha",
    "intercom",
    "itch-io",
    "keybase",
    "lemon-squeezy",
    "newgrounds",
    "otter.ai",
    "pingdom",
    "sentry",
    "squarespace",
    "tailscale",
    "tawk-to",
    "webflow",
    "wix",
    "wordpress-com",
    "wp-engine",
    "zendesk",
  ],
  denied: [
    "affine",
    "anki",
    "brave-browser",
    "calyxos",
    "crdroid",
    "cryptostorm",
    "currents",
    "deepdna",
    "docufluxia",
    "flute-cms",
    "free-games-utopia",
    "ginlo-private",
    "gitlab",
    "hubitat-elevation",
    "hugging-face",
    "kagi",
    "mammouth-ai",
    "not-doppler",
    "obsidian",
    "onlyoffice",
    "pangolin",
    "peggy",
    "pixiv",
    "sheezy-art",
    "skunkyart",
    "solaar",
    "startpage",
    "thaura",
  ],
} as const;

function extractGuardedSlugs(status: keyof typeof expectedSlugsByStatus) {
  const isActive = status === "denied" ? "0" : "1";
  const match = sql.match(
    new RegExp(
      "`status` = '" +
        status +
        "'[\\s\\S]*?`is_active` = " +
        isActive +
        "[\\s\\S]*?`slug` IN \\(([\\s\\S]*?)\\)",
    ),
  );

  expect(match, `Expected a guarded ${status} slug group`).not.toBeNull();
  return [...(match?.[1] ?? "").matchAll(/0x([A-Fa-f0-9]+)|'([^']+)'/g)].map(
    (slugMatch) =>
      slugMatch[2] ?? Buffer.from(slugMatch[1], "hex").toString("utf8"),
  );
}

describe("catalog logo path materialization migration", () => {
  it("contains exactly the audited NULL-path rows in guarded status groups", () => {
    expect(migrationExists).toBe(true);

    for (const status of Object.keys(expectedSlugsByStatus) as Array<
      keyof typeof expectedSlugsByStatus
    >) {
      expect(extractGuardedSlugs(status)).toEqual(
        expectedSlugsByStatus[status],
      );
    }

    const allExpectedSlugs = Object.values(expectedSlugsByStatus).flat();
    expect(allExpectedSlugs).toHaveLength(108);
    expect(new Set(allExpectedSlugs).size).toBe(allExpectedSlugs.length);
  });

  it("materializes paths only while logo_path is NULL", () => {
    expect(normalizedSql).toContain(
      "SET `logo_path` = CONCAT('/logos/', `slug`, '.svg')",
    );
    expect(normalizedSql).toContain("WHERE `logo_path` IS NULL");
    expect(sql.match(/UPDATE\s+`catalog_entries`/gi)).toHaveLength(1);
    expect(sql).not.toMatch(/SET\s+`logo_path`[\s\S]*?ELSE/i);
  });

  it("has a checked-in SVG for every path the migration materializes", () => {
    for (const slug of Object.values(expectedSlugsByStatus).flat()) {
      const logoUrl = new URL(`../public/logos/${slug}.svg`, import.meta.url);
      expect(existsSync(logoUrl), `Expected /logos/${slug}.svg`).toBe(true);
    }
  });

  it("runs atomically and records an idempotent migration version", () => {
    expect(executableSql).toMatch(/^START TRANSACTION;/i);
    expect(executableSql).toMatch(/COMMIT;$/i);
    expect(executableSql).toMatch(
      new RegExp(
        `INSERT\\s+INTO\\s+\`schema_migrations\`\\s+\\(\`version\`\\)` +
          `\\s+VALUES\\s+\\('${migrationVersion}'\\)` +
          `\\s+ON DUPLICATE KEY UPDATE`,
        "i",
      ),
    );
  });
});
