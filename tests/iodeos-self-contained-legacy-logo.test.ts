import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const legacyLogoUrl = new URL("../public/logos/iodeos.svg", import.meta.url);
const intendedArtworkUrl = new URL(
  "../public/logos/iodeos.png",
  import.meta.url,
);
const svg = readFileSync(legacyLogoUrl, "utf8");
const intendedArtwork = readFileSync(intendedArtworkUrl);
const embeddedPng = svg.match(
  /\bhref=["']data:image\/png;base64,([^"']+)["']/i,
)?.[1];

describe("iodéOS self-contained legacy logo", () => {
  it("has no external subresource references", () => {
    const references = [
      ...svg.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi),
    ].map((match) => match[1]);

    expect(svg).toContain("<svg");
    expect(svg).toContain('viewBox="0 0 1600 583"');
    expect(references).toHaveLength(1);
    expect(references[0]).toMatch(/^data:image\/png;base64,/);
    expect(svg).not.toContain('href="iodeos.png"');
  });

  it("embeds the exact intended PNG artwork", () => {
    expect(embeddedPng).toBeDefined();

    const decodedArtwork = Buffer.from(embeddedPng ?? "", "base64");
    expect(decodedArtwork).toEqual(intendedArtwork);
    expect(decodedArtwork.subarray(0, 8)).toEqual(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    );
    expect([
      decodedArtwork.readUInt32BE(16),
      decodedArtwork.readUInt32BE(20),
    ]).toEqual([1000, 364]);
    expect(createHash("sha256").update(decodedArtwork).digest("hex")).toBe(
      "1284f7ed989db4f82b95f9e1865046280f011d080314d4e8b011434eb0f25ea2",
    );
  });

});
