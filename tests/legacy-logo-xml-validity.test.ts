import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const sodipodiNamespace =
  "http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd";
const logoUrls = [
  new URL("../public/logos/codeberg.svg", import.meta.url),
  new URL("../public/logos/vaultwarden.svg", import.meta.url),
];

function getDeclaredPrefixes(svg: string): Map<string, string> {
  const rootTag = svg.match(/<svg\b[\s\S]*?>/)?.[0] ?? "";
  const declarations = new Map<string, string>();

  for (const match of rootTag.matchAll(
    /\bxmlns:([A-Za-z_][\w.-]*)\s*=\s*["']([^"']+)["']/g,
  )) {
    declarations.set(match[1], match[2]);
  }

  return declarations;
}

function getUsedPrefixes(svg: string): Set<string> {
  const prefixes = new Set<string>();
  const prefixedNamePatterns = [
    /<\/?([A-Za-z_][\w.-]*):[A-Za-z_][\w.-]*/g,
    /\s([A-Za-z_][\w.-]*):[A-Za-z_][\w.-]*\s*=/g,
  ];

  for (const pattern of prefixedNamePatterns) {
    for (const match of svg.matchAll(pattern)) {
      if (match[1] !== "xmlns") {
        prefixes.add(match[1]);
      }
    }
  }

  return prefixes;
}

describe("legacy logo XML validity", () => {
  it.each(logoUrls)("%s declares every namespace prefix it uses", (logoUrl) => {
    const svg = readFileSync(logoUrl, "utf8");
    const declaredPrefixes = getDeclaredPrefixes(svg);

    expect(declaredPrefixes.get("sodipodi")).toBe(sodipodiNamespace);
    for (const prefix of getUsedPrefixes(svg)) {
      expect(
        declaredPrefixes.has(prefix),
        `Expected ${logoUrl.pathname} to declare xmlns:${prefix}`,
      ).toBe(true);
    }
  });

  it.each(logoUrls)(
    "%s is self-contained and excludes active or unsafe content",
    (logoUrl) => {
      const svg = readFileSync(logoUrl, "utf8");

      expect(svg).not.toMatch(/<!DOCTYPE|<!ENTITY/i);
      expect(svg).not.toMatch(/<script\b|<foreignObject\b/i);
      expect(svg).not.toMatch(/\son[a-z]+\s*=/i);
      expect(svg).not.toMatch(/\bjavascript:/i);
      expect(svg).not.toMatch(/<image\b/i);

      for (const match of svg.matchAll(
        /\b(?:href|xlink:href)\s*=\s*["']([^"']+)["']/gi,
      )) {
        expect(match[1]).toMatch(/^(?:#|data:)/);
      }
      for (const match of svg.matchAll(/\burl\(\s*["']?([^"')\s]+)[^)]*\)/gi)) {
        expect(match[1]).toMatch(/^#/);
      }
    },
  );

  it.each(logoUrls)("%s retains painted vector content", (logoUrl) => {
    const svg = readFileSync(logoUrl, "utf8");

    expect(svg).toMatch(/<(?:rect|circle|path|polygon)\b/);
    expect(svg).toMatch(/\b(?:fill|stroke)\s*=/);
  });

});
