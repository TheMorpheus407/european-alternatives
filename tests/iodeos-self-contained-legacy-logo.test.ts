import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";

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

function findChromium(): string | null {
  const executableNames = [
    "chromium",
    "chromium-browser",
    "google-chrome",
    "google-chrome-stable",
  ];
  const pathDirectories = (process.env.PATH ?? "").split(delimiter);
  const candidates = [
    process.env.CHROME_BIN,
    ...pathDirectories.flatMap((directory) =>
      executableNames.map((name) => join(directory, name)),
    ),
  ];

  return candidates.find(
    (candidate): candidate is string =>
      typeof candidate === "string" &&
      candidate.length > 0 &&
      existsSync(candidate),
  ) ?? null;
}

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

  const chromium = findChromium();
  it.skipIf(chromium === null)(
    "decodes and paints non-transparent pixels as an img in Chromium",
    () => {
      const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
      const html = `<!doctype html>
<html>
  <body data-result="pending">
    <script>
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 292;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        let paintedPixels = 0;
        for (let index = 3; index < pixels.length; index += 4) {
          if (pixels[index] > 0) paintedPixels += 1;
        }
        document.body.dataset.paintedPixels = String(paintedPixels);
        document.body.dataset.result = paintedPixels > 1000 ? "ok" : "blank";
      };
      image.onerror = () => {
        document.body.dataset.result = "decode-error";
      };
      image.src = ${JSON.stringify(svgDataUrl)};
    </script>
  </body>
</html>`;
      const pageUrl = `data:text/html;base64,${Buffer.from(html).toString("base64")}`;
      const profileDirectory = mkdtempSync(
        join(tmpdir(), "iodeos-logo-chromium-"),
      );

      try {
        const result = spawnSync(
          chromium ?? "",
          [
            "--headless=new",
            "--no-sandbox",
            "--disable-gpu",
            "--disable-dev-shm-usage",
            `--user-data-dir=${profileDirectory}`,
            "--virtual-time-budget=3000",
            "--dump-dom",
            pageUrl,
          ],
          {
            encoding: "utf8",
            maxBuffer: 2 * 1024 * 1024,
            timeout: 15_000,
          },
        );

        expect(result.error).toBeUndefined();
        expect(result.status, result.stderr).toBe(0);
        expect(result.stdout).toContain('data-result="ok"');

        const paintedPixels = Number(
          result.stdout.match(/data-painted-pixels="(\d+)"/)?.[1] ?? 0,
        );
        expect(paintedPixels).toBeGreaterThan(1000);
      } finally {
        rmSync(profileDirectory, { recursive: true, force: true });
      }
    },
  );
});
