import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  auditLogoRepository,
  collectCatalogLogoPaths,
  discoverMigrationLogoPaths,
  validateLogoBytes,
} from "../scripts/lib/logo-integrity.mjs";

const tempDirectories: string[] = [];
const minimalPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

function tempDirectory() {
  const directory = mkdtempSync(join(tmpdir(), "euroalt-logo-integrity-"));
  tempDirectories.push(directory);
  return directory;
}

function svg(body: string, attributes = 'viewBox="0 0 16 16"') {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" ${attributes}>${body}</svg>`,
  );
}

afterEach(() => {
  for (const directory of tempDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true });
  }
});

describe("logo asset validation", () => {
  it("accepts self-contained vector and raster logos", () => {
    expect(
      validateLogoBytes("valid.svg", svg('<path d="M0 0h16v16H0z"/>')),
    ).toEqual([]);
    expect(validateLogoBytes("valid.png", minimalPng)).toEqual([]);
    expect(
      validateLogoBytes(
        "embedded.svg",
        svg(
          `<image width="1" height="1" href="data:image/png;base64,${minimalPng.toString(
            "base64",
          )}"/>`,
        ),
      ),
    ).toEqual([]);
  });

  it("rejects malformed XML and undeclared namespace prefixes", () => {
    const malformed = svg("<g><path></g>");
    const undeclaredPrefix = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" sodipodi:docname="logo"><path d="M0 0h1v1z"/></svg>',
    );

    expect(validateLogoBytes("malformed.svg", malformed)).toEqual(
      expect.arrayContaining([expect.stringMatching(/malformed SVG XML/i)]),
    );
    expect(validateLogoBytes("namespace.svg", undeclaredPrefix)).toContain(
      'uses undeclared XML namespace prefix "sodipodi"',
    );
  });

  it("rejects blank wrappers, external subresources, and active content", () => {
    expect(
      validateLogoBytes(
        "external.svg",
        svg('<image width="16" height="16" href="missing.png"/>'),
      ),
    ).toContain('depends on external subresource "missing.png"');
    expect(validateLogoBytes("blank.svg", svg("<defs/>"))).toContain(
      "does not contain a drawable SVG element",
    );
    expect(
      validateLogoBytes("script.svg", svg("<script>alert(1)</script>")),
    ).toEqual(
      expect.arrayContaining([
        "contains executable or embedded HTML content",
        "does not contain a drawable SVG element",
      ]),
    );
  });

  it("rejects truncated or mislabeled raster files", () => {
    expect(validateLogoBytes("truncated.png", minimalPng.subarray(0, 24))).not.toEqual(
      [],
    );
    expect(validateLogoBytes("wrong.webp", minimalPng)).toContain(
      "does not have a valid WebP RIFF header",
    );
  });
});

describe("catalog logo discovery", () => {
  it("collects local logo paths recursively from catalog API/export payloads", () => {
    const paths = collectCatalogLogoPaths({
      data: [
        { logo: "/logos/element.svg" },
        { details: { logo_path: "/logos/signal.png?v=20260727" } },
        { logo: "https://cdn.example/logo.svg" },
      ],
    });

    expect([...paths].sort()).toEqual([
      "/logos/element.svg",
      "/logos/signal.png",
    ]);
  });

  it("discovers literal, constant-CONCAT, and slug-generated migration paths", () => {
    const directory = tempDirectory();
    writeFileSync(
      join(directory, "001-logos.sql"),
      `
        UPDATE catalog_entries
        SET logo_path = CASE slug
          WHEN 'literal' THEN '/logos/literal.png'
          WHEN 'joined' THEN CONCAT('/logos/join', 'ed.svg')
          ELSE logo_path
        END;

        UPDATE catalog_entries
        SET logo_path = CONCAT('/logos/', slug, '.svg')
        WHERE slug IN (
          'generated-one',
          'generated.two',
          0x6F65666669,
          X'6865782D736C7567'
        );
      `,
    );

    expect([...discoverMigrationLogoPaths(directory)].sort()).toEqual([
      "/logos/generated-one.svg",
      "/logos/generated.two.svg",
      "/logos/hex-slug.svg",
      "/logos/joined.svg",
      "/logos/literal.png",
      "/logos/oeffi.svg",
    ]);
  });

  it("reports catalog paths whose checked-in asset is missing", () => {
    const projectRoot = tempDirectory();
    mkdirSync(join(projectRoot, "public", "logos"), { recursive: true });
    mkdirSync(join(projectRoot, "scripts", "migrations"), { recursive: true });
    writeFileSync(
      join(projectRoot, "scripts", "migrations", "001-missing-logo.sql"),
      "UPDATE catalog_entries SET logo_path = '/logos/missing.svg';",
    );

    const result = auditLogoRepository({ projectRoot });

    expect(result.errors).toContain(
      "/logos/missing.svg: advertised logo is missing from public/logos/missing.svg",
    );
  });
});

describe("repository logo contract", () => {
  it("keeps every persisted path resolvable and every checked-in asset safe", () => {
    const result = auditLogoRepository({ projectRoot: resolve(".") });

    expect(
      result.errors,
      result.errors.length > 0
        ? `Logo integrity failures:\n${result.errors.join("\n")}`
        : undefined,
    ).toEqual([]);
    expect(result.assetCount).toBeGreaterThan(600);
    expect(result.advertisedPathCount).toBeGreaterThan(600);
  });

  it("exposes the guard through the standard npm test and a focused CLI", () => {
    const packageJson = JSON.parse(
      readFileSync(new URL("../package.json", import.meta.url), "utf8"),
    ) as { scripts: Record<string, string> };

    expect(packageJson.scripts.test).toContain("vitest run");
    expect(packageJson.scripts["logos:check"]).toBe(
      "node scripts/check-logo-integrity.mjs",
    );
  });
});
