import {
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

import { describe, expect, it } from "vitest";

const logoUrl = new URL("../public/logos/ph24.svg", import.meta.url);
const svg = readFileSync(logoUrl, "utf8");

function findChromium(): string | null {
  const candidates = [
    process.env.CHROMIUM_BIN,
    "chromium",
    "chromium-browser",
    "google-chrome",
    "google-chrome-stable",
  ].filter((candidate): candidate is string => Boolean(candidate));

  for (const candidate of candidates) {
    if (
      spawnSync(candidate, ["--version"], {
        encoding: "utf8",
        timeout: 5_000,
      }).status === 0
    ) {
      return candidate;
    }
  }

  return null;
}

function renderSvg(browser: string, profilePath: string): string {
  const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  const html = `<!doctype html>
<html>
  <body data-result="pending">
    <script>
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 210;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        let wordmarkPixels = 0;
        const wordmarkStartX = 300;
        for (let y = 0; y < canvas.height; y += 1) {
          for (let x = wordmarkStartX; x < canvas.width; x += 1) {
            if (pixels[(y * canvas.width + x) * 4 + 3] > 0) {
              wordmarkPixels += 1;
            }
          }
        }
        document.body.dataset.wordmarkPixels = String(wordmarkPixels);
        document.body.dataset.result = wordmarkPixels > 1000 ? "ok" : "blank";
      };
      image.onerror = () => {
        document.body.dataset.result = "decode-error";
      };
      image.src = ${JSON.stringify(svgDataUrl)};
    </script>
  </body>
</html>`;
  const pageUrl = `data:text/html;base64,${Buffer.from(html).toString("base64")}`;
  const result = spawnSync(
    browser,
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-background-networking",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--no-first-run",
      `--user-data-dir=${profilePath}`,
      "--virtual-time-budget=3000",
      "--dump-dom",
      pageUrl,
    ],
    {
      encoding: "utf8",
      maxBuffer: 2 * 1024 * 1024,
      timeout: 45_000,
    },
  );

  expect(result.error).toBeUndefined();
  expect(result.status, result.stderr).toBe(0);

  return result.stdout;
}

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

  const chromium = findChromium();
  const chromiumIt = chromium === null ? it.skip : it;

  chromiumIt(
    "renders the wordmark visibly in Chromium without clipping it away",
    () => {
      const workspace = mkdtempSync(join(tmpdir(), "ph24-logo-render-"));

      try {
        const renderedDom = renderSvg(
          chromium ?? "",
          join(workspace, "profile"),
        );

        expect(renderedDom).toContain('data-result="ok"');
        const wordmarkPixels = Number(
          renderedDom.match(/data-wordmark-pixels="(\d+)"/)?.[1] ?? 0,
        );
        expect(wordmarkPixels).toBeGreaterThan(1000);
      } finally {
        rmSync(workspace, { force: true, recursive: true });
      }
    },
    60_000,
  );
});
