import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const endpointUrls = [
  new URL("../api/catalog/entries.php", import.meta.url),
  new URL("../api/catalog/entry.php", import.meta.url),
];
const catalogTypesUrl = new URL("../src/types/index.ts", import.meta.url);

describe("catalog API nullable logo semantics", () => {
  it.each(endpointUrls)(
    "%s returns the persisted nullable logo_path without fabricating a URL",
    (endpointUrl) => {
      const php = readFileSync(endpointUrl, "utf8");

      expect(php).toMatch(/'logo'\s*=>\s*\$row\['logo_path'\]/);
      expect(php).not.toMatch(
        /\$row\['logo_path'\]\s*\?\?\s*'\/logos\/'/,
      );
      expect(php).not.toContain("'/logos/' . $row['slug'] . '.svg'");
    },
  );

  it("represents the persisted NULL value in the client contract", () => {
    const types = readFileSync(catalogTypesUrl, "utf8");

    expect(types).toMatch(/\blogo\?:\s*string\s*\|\s*null;/);
  });
});
