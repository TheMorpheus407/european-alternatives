import { spawnSync } from "node:child_process";
import { accessSync, constants, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, isAbsolute, join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

const chromiumSpawnTimeoutMs = 60_000;
const chromiumTestTimeoutMs = 75_000;

const renderCases = [
  {
    slug: "codeberg",
    width: 320,
    height: 320,
    regionStartX: 0,
  },
  {
    slug: "vaultwarden",
    width: 320,
    height: 320,
    regionStartX: 0,
  },
  {
    slug: "iodeos",
    width: 800,
    height: 292,
    regionStartX: 0,
  },
  {
    slug: "ph24",
    width: 800,
    height: 210,
    regionStartX: 300,
  },
].map((renderCase) => {
  const svg = readFileSync(
    new URL(`../public/logos/${renderCase.slug}.svg`, import.meta.url),
    "utf8",
  );

  return {
    ...renderCase,
    source: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
  };
});

type RenderResult = {
  slug: string;
  paintedPixels?: number;
  regionPixels?: number;
  error?: string;
};

function executablePath(candidate: string): string | null {
  const paths = candidate.includes("/")
    ? [isAbsolute(candidate) ? candidate : resolve(candidate)]
    : (process.env.PATH ?? "")
        .split(delimiter)
        .filter(Boolean)
        .map((directory) => join(directory, candidate));

  for (const path of paths) {
    try {
      accessSync(path, constants.X_OK);
      return path;
    } catch {
      // Keep looking for another executable candidate.
    }
  }

  return null;
}

function findChromium(): string | null {
  const candidates = [
    process.env.CHROMIUM_BIN,
    process.env.CHROME_BIN,
    "chromium",
    "chromium-browser",
    "google-chrome",
    "google-chrome-stable",
  ].filter((candidate): candidate is string => Boolean(candidate));

  for (const candidate of candidates) {
    const executable = executablePath(candidate);
    if (executable !== null) {
      return executable;
    }
  }

  return null;
}

function renderAllLogos(browser: string, profilePath: string): RenderResult[] {
  const html = `<!doctype html>
<html>
  <body data-result="pending">
    <pre id="results"></pre>
    <script>
      const renderCases = ${JSON.stringify(renderCases)};
      Promise.all(renderCases.map((renderCase) => new Promise((resolve) => {
        const image = new Image();
        image.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = renderCase.width;
            canvas.height = renderCase.height;
            const context = canvas.getContext("2d");
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            const pixels = context.getImageData(
              0,
              0,
              canvas.width,
              canvas.height,
            ).data;
            let paintedPixels = 0;
            let regionPixels = 0;
            for (let y = 0; y < canvas.height; y += 1) {
              for (let x = 0; x < canvas.width; x += 1) {
                if (pixels[(y * canvas.width + x) * 4 + 3] > 0) {
                  paintedPixels += 1;
                  if (x >= renderCase.regionStartX) {
                    regionPixels += 1;
                  }
                }
              }
            }
            resolve({
              slug: renderCase.slug,
              paintedPixels,
              regionPixels,
            });
          } catch (error) {
            resolve({ slug: renderCase.slug, error: String(error) });
          }
        };
        image.onerror = () => {
          resolve({ slug: renderCase.slug, error: "decode-error" });
        };
        image.src = renderCase.source;
      }))).then((results) => {
        document.querySelector("#results").textContent = JSON.stringify(results);
        document.body.dataset.result = "complete";
      });
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
      "--virtual-time-budget=5000",
      "--dump-dom",
      pageUrl,
    ],
    {
      encoding: "utf8",
      maxBuffer: 2 * 1024 * 1024,
      timeout: chromiumSpawnTimeoutMs,
    },
  );

  expect(result.error).toBeUndefined();
  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout).toContain('data-result="complete"');

  const serializedResults =
    result.stdout.match(/<pre id="results">([\s\S]*?)<\/pre>/)?.[1];
  expect(serializedResults).toBeDefined();

  return JSON.parse(serializedResults ?? "[]") as RenderResult[];
}

describe("logo rendering in Chromium", () => {
  const chromium = findChromium();
  const chromiumIt = chromium === null ? it.skip : it;

  chromiumIt(
    "decodes and visibly paints every browser-checked SVG in one process",
    () => {
      const workspace = mkdtempSync(join(tmpdir(), "logo-chromium-render-"));

      try {
        const results = renderAllLogos(
          chromium ?? "",
          join(workspace, "profile"),
        );

        expect(results.map(({ slug }) => slug)).toEqual(
          renderCases.map(({ slug }) => slug),
        );
        for (const result of results) {
          expect(result.error, result.slug).toBeUndefined();
          expect(result.paintedPixels, result.slug).toBeGreaterThan(1_000);
          expect(result.regionPixels, result.slug).toBeGreaterThan(1_000);
        }
      } finally {
        rmSync(workspace, { force: true, recursive: true });
      }
    },
    chromiumTestTimeoutMs,
  );
});
