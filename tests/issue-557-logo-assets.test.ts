import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migrationVersion = "087-correct-reported-logo-assets";
const migrationUrl = new URL(
  "../scripts/migrations/087-correct-reported-logo-assets.sql",
  import.meta.url,
);
const migrationExists = existsSync(migrationUrl);
const sql = migrationExists ? readFileSync(migrationUrl, "utf8") : "";
const normalizedSql = sql.replace(/\s+/g, " ").trim();

const expectedLogoPaths = new Map([
  ["plankton", "/logos/plankton-icon.png"],
  ["insteady", "/logos/insteady-icon.png"],
  ["qobuz", "/logos/qobuz-icon.svg"],
  ["bigbluebutton", "/logos/bigbluebutton-logo.svg"],
]);

const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
const expectedAssetSha256 = new Map([
  [
    "/logos/plankton-icon.png",
    "b07939cf86bafe507b49c28e9b66fbd6f94081eeb41d17da2d29b48960582c92",
  ],
  [
    "/logos/insteady-icon.png",
    "bb286743a471fd1b57c55bcc34489dd9d11292fb38775539d6af85ecbd0f4c29",
  ],
  [
    "/logos/qobuz-icon.svg",
    "59f10306a0b221bb0ab7dc6e6972426ddfdbe8ca536b8860fd62c31de6926837",
  ],
  [
    "/logos/bigbluebutton-logo.svg",
    "1fb879663e8f37e75d4a0ccdc393db752e569cb3c32a934c23c57f256c3c9c2b",
  ],
]);

describe("issue #557 logo asset corrections", () => {
  it("updates only the four reported catalog entries", () => {
    expect(migrationExists).toBe(true);
    expect(normalizedSql).toContain("UPDATE `catalog_entries`");

    const updates = [
      ...sql.matchAll(/WHEN '([^']+)' THEN '([^']+)'/g),
    ].map((match) => [match[1], match[2]]);

    expect(new Map(updates)).toEqual(expectedLogoPaths);
    expect(updates).toHaveLength(expectedLogoPaths.size);
  });

  it("checks in native raster assets for Plankton and insteady", () => {
    const plankton = readFileSync(
      new URL("../public/logos/plankton-icon.png", import.meta.url),
    );
    const insteady = readFileSync(
      new URL("../public/logos/insteady-icon.png", import.meta.url),
    );

    expect(plankton.subarray(0, pngSignature.length)).toEqual(pngSignature);
    expect(insteady.subarray(0, pngSignature.length)).toEqual(pngSignature);
    expect([plankton.readUInt32BE(16), plankton.readUInt32BE(20)]).toEqual([
      192, 192,
    ]);
    expect([insteady.readUInt32BE(16), insteady.readUInt32BE(20)]).toEqual([
      512, 512,
    ]);
  });

  it("checks in self-contained, square SVG marks for Qobuz and BigBlueButton", () => {
    for (const logoPath of [
      "/logos/qobuz-icon.svg",
      "/logos/bigbluebutton-logo.svg",
    ]) {
      const logoUrl = new URL(`../public${logoPath}`, import.meta.url);
      expect(existsSync(logoUrl), `Expected ${logoPath} to exist`).toBe(true);

      const svg = readFileSync(logoUrl, "utf8");
      const viewBox = svg.match(
        /\bviewBox=["']\s*[\d.-]+\s+[\d.-]+\s+([\d.]+)\s+([\d.]+)\s*["']/i,
      );

      expect(svg).toContain("<svg");
      expect(svg).not.toMatch(/<image\b/i);
      expect(viewBox, `Expected ${logoPath} to have a viewBox`).not.toBeNull();
      expect(viewBox?.[1]).toBe(viewBox?.[2]);
    }
  });

  it("pins the reviewed first-party artwork", () => {
    for (const [logoPath, expectedSha256] of expectedAssetSha256) {
      const bytes = readFileSync(
        new URL(`../public${logoPath}`, import.meta.url),
      );
      const sha256 = createHash("sha256").update(bytes).digest("hex");

      expect(sha256, `Unexpected artwork for ${logoPath}`).toBe(expectedSha256);
    }
  });

  it("keeps card logos proportional", () => {
    const css = readFileSync(new URL("../src/index.css", import.meta.url), "utf8");
    const logoRule = css.match(/\.alt-card-logo\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(logoRule).toMatch(/\bobject-fit:\s*contain\s*;/);
  });

  it("records the schema migration version", () => {
    expect(normalizedSql).toContain(`'${migrationVersion}'`);
  });
});
