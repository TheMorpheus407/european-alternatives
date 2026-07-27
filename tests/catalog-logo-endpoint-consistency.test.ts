import { readFileSync } from "node:fs";

import { loadNodeRuntime } from "@php-wasm/node";
import { PHP } from "@php-wasm/universal";
import { afterAll, describe, expect, it } from "vitest";

type EndpointContract = {
  name: string;
  rowVariable: string;
  source: string;
};

const endpointContracts: EndpointContract[] = [
  {
    name: "catalog list",
    rowVariable: "row",
    source: readFileSync(
      new URL("../api/catalog/entries.php", import.meta.url),
      "utf8",
    ),
  },
  {
    name: "catalog detail",
    rowVariable: "row",
    source: readFileSync(
      new URL("../api/catalog/entry.php", import.meta.url),
      "utf8",
    ),
  },
  {
    name: "catalog matrix",
    rowVariable: "entryRow",
    source: readFileSync(
      new URL("../api/catalog/matrix.php", import.meta.url),
      "utf8",
    ),
  },
];

let phpPromise: Promise<PHP> | undefined;

function getPhp(): Promise<PHP> {
  phpPromise ??= loadNodeRuntime("8.3").then((runtime) => new PHP(runtime));

  return phpPromise;
}

function responseLogoExpression(contract: EndpointContract): string {
  const match = contract.source.match(/'logo'\s*=>\s*([^,\r\n]+)\s*,/u);

  if (match?.[1] === undefined) {
    throw new Error(
      `Expected ${contract.name} to expose a logo field in its response.`,
    );
  }

  return match[1].trim();
}

async function evaluateResponseLogo(
  contract: EndpointContract,
  persistedLogoPath: string | null,
): Promise<Record<string, unknown>> {
  const php = await getPhp();
  const logoPathLiteral =
    persistedLogoPath === null ? "null" : JSON.stringify(persistedLogoPath);
  const response = await php.runStream({
    code: `<?php
$row = [
    'slug' => 'logo-contract-fixture',
    'logo_path' => ${logoPathLiteral},
];
$entryRow = $row;
$response = [
    'logo' => ${responseLogoExpression(contract)},
];
echo json_encode($response, JSON_THROW_ON_ERROR);
`,
  });
  const stdout = await response.stdoutText;
  const stderr = await response.stderrText;
  const exitCode = await response.exitCode;

  if (exitCode !== 0) {
    throw new Error(
      `${contract.name} logo expression failed with ${exitCode}: ${stderr}`,
    );
  }

  return JSON.parse(stdout) as Record<string, unknown>;
}

afterAll(async () => {
  if (phpPromise) {
    const php = await phpPromise;
    php.exit(0);
  }
});

describe("catalog endpoint logo consistency", () => {
  it.each(endpointContracts)(
    "$name reads the response logo from the persisted logo_path column",
    (contract) => {
      const expression = responseLogoExpression(contract);
      const persistedPathExpression = new RegExp(
        String.raw`^\$${contract.rowVariable}\['logo_path'\](?:\s*\?\?\s*null)?$`,
        "u",
      );

      expect(expression).toMatch(persistedPathExpression);
      expect(contract.source).toMatch(/\bce\.logo_path\b/u);
    },
  );

  it("passes an explicit persisted path through unchanged in every response", async () => {
    const persistedLogoPath = "/media/catalog/persisted-logo.avif?v=7";

    for (const contract of endpointContracts) {
      await expect(
        evaluateResponseLogo(contract, persistedLogoPath),
      ).resolves.toEqual({
        logo: persistedLogoPath,
      });
    }
  });

  it("keeps the logo key present and null without synthesizing a slug path", async () => {
    for (const contract of endpointContracts) {
      const response = await evaluateResponseLogo(contract, null);

      expect(response).toHaveProperty("logo", null);
      expect(response.logo).not.toBe("/logos/logo-contract-fixture.svg");
    }
  });

  it("contains no slug-derived logo fallback in any response builder", () => {
    const expressions = endpointContracts.map(responseLogoExpression);

    expect(expressions).toEqual([
      "$row['logo_path']",
      "$row['logo_path']",
      "$entryRow['logo_path'] ?? null",
    ]);

    for (const contract of endpointContracts) {
      expect(contract.source).not.toContain(
        "'/logos/' . $row['slug'] . '.svg'",
      );
      expect(contract.source).not.toContain(
        "'/logos/' . $entryRow['slug'] . '.svg'",
      );
    }
  });
});
