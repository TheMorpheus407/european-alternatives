import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const logoUrl = new URL("../public/logos/ph24.svg", import.meta.url);
const svg = readFileSync(logoUrl, "utf8");

describe("ph24 self-contained logo", () => {
  it("preserves the official dimensions and brand artwork", () => {
    expect(svg).toMatch(/\bwidth="143\.143mm"/);
    expect(svg).toMatch(/\bheight="37\.4456mm"/);
    expect(svg).toMatch(/\bviewBox="0 0 3880\.56 1015\.13"/);
    expect(svg).toContain(".fil0 {fill:#0B64E0}");
    expect(svg).toContain(".fil1 {fill:#0097E3}");
    expect(svg).toContain(".fil2 {fill:#00A8FF}");
    expect(svg).toContain(".fil3 {fill:#000}");
    expect(svg).toMatch(
      /<rect class="fil2" x="639\.16" y="274\.16" width="740\.98" height="740\.98" rx="63\.02" ry="63\.02"\/>/,
    );
  });

  it("stores the complete ph24 wordmark as fitted vector outlines", () => {
    const wordmark = svg.match(
      /<path id="ph24-wordmark"[\s\S]*?\bd="([^"]+)"[\s\S]*?\/>/,
    );

    expect(wordmark).not.toBeNull();
    expect(wordmark?.[0]).toContain('aria-label="ph24"');
    expect(wordmark?.[0]).toContain(
      'transform="matrix(0.896 0 0 1 148.45272 0)"',
    );
    expect(wordmark?.[1].length).toBeGreaterThan(2_000);
    expect(svg).toContain(
      "google/fonts commit fd60a948760465ea72ad844667bbf0799828a7fa",
    );
  });

  it("has no font, image, script, or external-resource dependency", () => {
    expect(svg).not.toMatch(/<text\b|@font-face|font-family/i);
    expect(svg).not.toMatch(/\.woff2?\b|assets\/fonts/i);
    expect(svg).not.toMatch(/<image\b|<script\b|<foreignObject\b/i);
    expect(svg).not.toMatch(/\son[a-z]+\s*=|\bjavascript:/i);
    expect(svg).not.toMatch(/\burl\s*\(/i);
    expect(svg).not.toMatch(/\b(?:href|xlink:href)\s*=/i);
  });

  it("uses only declared or XML-standard namespace prefixes", () => {
    const rootTag = svg.match(/<svg\b[\s\S]*?>/)?.[0] ?? "";
    const declaredPrefixes = new Set(
      [...rootTag.matchAll(/\bxmlns:([A-Za-z_][\w.-]*)\s*=/g)].map(
        (match) => match[1],
      ),
    );
    const usedPrefixes = new Set(
      [
        ...svg.matchAll(/<\/?([A-Za-z_][\w.-]*):[A-Za-z_][\w.-]*/g),
        ...svg.matchAll(/\s([A-Za-z_][\w.-]*):[A-Za-z_][\w.-]*\s*=/g),
      ]
        .map((match) => match[1])
        .filter((prefix) => !["xml", "xmlns"].includes(prefix)),
    );

    for (const prefix of usedPrefixes) {
      expect(declaredPrefixes.has(prefix), `Missing xmlns:${prefix}`).toBe(
        true,
      );
    }
  });

});
