import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

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

function findChromium(): string | null {
  const candidates = [
    process.env.CHROMIUM_BIN,
    "chromium",
    "chromium-browser",
    "google-chrome",
    "google-chrome-stable",
  ].filter((candidate): candidate is string => Boolean(candidate));

  for (const candidate of candidates) {
    const result = spawnSync(candidate, ["--version"], {
      encoding: "utf8",
      timeout: 5_000,
    });
    if (result.status === 0) {
      return candidate;
    }
  }

  return null;
}

function captureSvg(
  browser: string,
  sourcePath: string,
  screenshotPath: string,
  profilePath: string,
): Buffer {
  const result = spawnSync(
    browser,
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-background-networking",
      "--disable-gpu",
      "--hide-scrollbars",
      "--no-first-run",
      `--user-data-dir=${profilePath}`,
      "--window-size=320,320",
      `--screenshot=${screenshotPath}`,
      new URL(`file://${sourcePath}`).href,
    ],
    {
      encoding: "utf8",
      timeout: 20_000,
    },
  );

  expect(result.error).toBeUndefined();
  expect(result.status, result.stderr).toBe(0);
  expect(existsSync(screenshotPath)).toBe(true);

  return readFileSync(screenshotPath);
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

  const chromium = findChromium();
  const chromiumIt = chromium === null ? it.skip : it;

  chromiumIt(
    "decodes both SVGs into nonblank Chromium screenshots",
    () => {
      const workspace = mkdtempSync(join(tmpdir(), "legacy-logo-render-"));

      try {
        const blankSvgPath = join(workspace, "blank.svg");
        writeFileSync(
          blankSvgPath,
          '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"/>',
        );
        const blankScreenshot = captureSvg(
          chromium ?? "",
          blankSvgPath,
          join(workspace, "blank.png"),
          join(workspace, "blank-profile"),
        );

        for (const [index, logoUrl] of logoUrls.entries()) {
          const screenshot = captureSvg(
            chromium ?? "",
            fileURLToPath(logoUrl),
            join(workspace, `logo-${index}.png`),
            join(workspace, `logo-${index}-profile`),
          );

          expect(screenshot.subarray(0, 8)).toEqual(
            Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
          );
          expect(screenshot.equals(blankScreenshot)).toBe(false);
        }
      } finally {
        rmSync(workspace, { force: true, recursive: true });
      }
    },
    60_000,
  );
});
