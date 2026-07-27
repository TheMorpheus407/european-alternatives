import { createElement } from "react";
import type { ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";

import { describe, expect, it, vi } from "vitest";

import AlternativeCard from "../src/components/AlternativeCard";
import { logoNeedsDarkChip } from "../src/utils/logoPresentation";
import type { Alternative, CardViewMode } from "../src/types";

vi.mock("../src/contexts/CatalogContext", () => ({
  useCatalog: () => ({ categories: [] }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, string>) =>
      key === "common:logoSuffix" ? `${values?.name ?? ""} logo` : key,
    i18n: { language: "en" },
  }),
}));

const reviewedWhiteLogoIds = [
  "anytype",
  "authentik",
  "deltamaster",
  "fountain",
  "jitsi",
  "jolla-phone",
  "mangopay",
  "mapy-com",
  "opendesk",
  "opentalk",
  "papra",
  "penneo",
  "penpot",
  "posteo",
  "qwant",
  "safing-portmaster",
  "shift-phone",
  "stability-ai",
  "strato-mail",
  "tauschebanner",
  "wero",
] as const;

function makeAlternative(id: string): Alternative {
  return {
    id,
    name: id,
    description: "",
    website: "https://example.com",
    logo: `/logos/${id}.svg`,
    country: "de",
    category: "other",
    replacesUS: [],
    isOpenSource: false,
    pricing: "free",
    tags: [],
    trustScoreStatus: "pending",
  };
}

const CardForTest = AlternativeCard as unknown as ComponentType<{
  alternative: Alternative;
  viewMode: CardViewMode;
  usVendorLookup: Map<string, Alternative>;
}>;

function renderLogo(id: string): string {
  return renderToStaticMarkup(
    createElement(CardForTest, {
      alternative: makeAlternative(id),
      viewMode: "grid",
      usVendorLookup: new Map(),
    }),
  );
}

describe("low-contrast logo presentation", () => {
  it("uses the reviewed, exact 21-entry allowlist", () => {
    expect(reviewedWhiteLogoIds).toHaveLength(21);
    for (const id of reviewedWhiteLogoIds) {
      expect(logoNeedsDarkChip(id), id).toBe(true);
    }

    for (const id of ["signal", "proton-mail", "Anytype", "wero-preview"]) {
      expect(logoNeedsDarkChip(id), id).toBe(false);
    }
  });

  it("adds the dark-chip class only to reviewed logo images", () => {
    expect(renderLogo("anytype")).toContain(
      'class="alt-card-logo alt-card-logo-dark-chip"',
    );
    expect(renderLogo("signal")).toContain('class="alt-card-logo"');
    expect(renderLogo("signal")).not.toContain("alt-card-logo-dark-chip");
  });

  it("defines a theme-independent dark neutral chip with a visible edge", () => {
    const css = readFileSync(
      new URL("../src/index.css", import.meta.url),
      "utf8",
    );
    const rule =
      css.match(/\.alt-card-logo-dark-chip\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(rule).toMatch(/\bbackground:\s*#252831\s*;/);
    expect(rule).toMatch(/\bbox-shadow:/);
  });
});
