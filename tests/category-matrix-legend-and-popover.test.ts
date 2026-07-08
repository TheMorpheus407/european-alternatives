import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { describe, expect, it, vi } from "vitest";

import browseDe from "../src/i18n/locales/de/browse.json";
import browseEn from "../src/i18n/locales/en/browse.json";
import type {
  CategoryMatrixApiResponse,
  MatrixAlternative,
  MatrixCriterion,
  MatrixFact,
  MatrixFilterMode,
} from "../src/types";

vi.mock("react-i18next", () => {
  const translations: Record<string, Record<string, string>> = {
    en: {
      "matrixView.title": "{{category}} comparison matrix",
      "matrixView.productColumn": "Product",
      "matrixView.criteriaColumn": "Criterion",
      "matrixView.yes": "Yes",
      "matrixView.no": "No",
      "matrixView.unverified": "Unverified",
      "matrixView.notApplicable": "Not applicable",
      "matrixView.source": "Source",
      "matrixView.accessedDate": "Accessed {{date}}",
      "matrixView.openSourceLabel":
        "Open source for {{product}} — {{criterion}}",
      "matrixView.legend.title": "Legend",
      "matrixView.legend.positive": "Positive / supported",
      "matrixView.legend.warning": "Caution",
      "matrixView.legend.negative": "Negative / not supported",
      "matrixView.legend.neutral": "Neutral / informational",
      "matrixView.legend.tradeoff": "Trade-off",
      "matrixView.legend.unverified": "Unverified",
      "matrixView.legend.notApplicable": "Not applicable",
      "matrixView.popover.title": "Cell details",
      "matrixView.popover.openLabel":
        "Show details for {{product}} — {{criterion}}",
      "matrixView.popover.close": "Close",
      "matrixView.popover.product": "Product",
      "matrixView.popover.criterion": "Criterion",
      "matrixView.popover.value": "Value",
      "matrixView.popover.source": "Source",
      "matrixView.popover.noSource": "No public source available",
    },
  };

  return {
    useTranslation: () => ({
      i18n: { language: "en" },
      t: (key: string, values?: Record<string, string | number>) => {
        const template = translations.en[key] ?? key;

        return template.replace(/\{\{(\w+)\}\}/gu, (_match, name: string) =>
          String(values?.[name] ?? ""),
        );
      },
    }),
  };
});

function criterion(
  id: string,
  filterMode: MatrixFilterMode,
  overrides: Partial<MatrixCriterion> = {},
): MatrixCriterion {
  return {
    id,
    label: overrides.label ?? id,
    helpText: overrides.helpText ?? null,
    valueType: overrides.valueType ?? "boolean",
    semantics: overrides.semantics ?? "informational",
    filterMode,
    displayMode: overrides.displayMode,
    options: overrides.options ?? [],
  };
}

function matrixAlternative(
  id: string,
  name: string,
  facts: Record<string, MatrixFact>,
): MatrixAlternative {
  return {
    id,
    name,
    website: `https://${id}.example`,
    logo: null,
    country: "de",
    category: "messaging",
    secondaryCategories: [],
    facts,
  };
}

function fixture(): CategoryMatrixApiResponse {
  const groups = [
    {
      id: "privacy",
      label: "Privacy",
      description: null,
      criteria: [
        criterion("e2ee", "must_match", {
          label: "End-to-end encryption",
          valueType: "boolean",
        }),
        criterion("hosting_region", "must_match", {
          label: "Hosting region",
          valueType: "enum",
          options: [
            { id: "eu", label: "EU hosted", displayTone: "positive" },
            { id: "global", label: "Global", displayTone: "warning" },
          ],
        }),
        criterion("export_formats", "none", {
          label: "Data export formats",
          valueType: "multi_enum",
          options: [
            { id: "csv", label: "CSV export", displayTone: "positive" },
            { id: "json", label: "JSON export", displayTone: "neutral" },
          ],
        }),
        criterion("privacy_policy", "none", {
          label: "Privacy policy",
          valueType: "url",
        }),
        criterion("supported_platforms", "multi_select", {
          label: "Supported platforms",
          valueType: "multi_enum",
          displayMode: "coverage",
          options: [
            { id: "android", label: "Android", displayTone: "neutral" },
            { id: "ios", label: "iOS", displayTone: "neutral" },
            { id: "linux", label: "Linux", displayTone: "positive" },
          ],
        }),
        criterion("reactions_threads", "multi_select", {
          label: "Reactions and threads",
          valueType: "multi_enum",
          displayMode: "coverage",
          options: [
            { id: "reactions", label: "Reactions", displayTone: "positive" },
            { id: "threads", label: "Threads", displayTone: "positive" },
            { id: "polls", label: "Polls", displayTone: "tradeoff" },
          ],
        }),
      ],
    },
  ];

  const alternatives: MatrixAlternative[] = [
    matrixAlternative("zeta-chat", "Zeta Chat", {
      e2ee: {
        status: "verified",
        value: false,
        source: {
          url: "https://zeta-chat.example/encryption-report",
          title: "Zeta encryption report",
          accessedDate: "2026-05-24",
        },
        auditQuote:
          "Internal verification quote for Zeta encryption must stay private.",
        raw_response: "Never show verifier raw response for Zeta.",
      } as unknown as MatrixFact,
      hosting_region: { status: "verified", value: "global" },
      export_formats: {
        status: "unverified",
        value: null,
        source: {
          url: "https://zeta-chat.example/export-formats",
          title: "Zeta export format source",
        },
        auditQuote:
          "Internal unverified export quote must not become public.",
      } as unknown as MatrixFact,
      privacy_policy: {
        status: "verified",
        value: "https://zeta-chat.example/privacy",
      },
      supported_platforms: {
        status: "verified",
        value: ["android", "linux"],
      },
      reactions_threads: {
        status: "verified",
        value: ["reactions", "polls"],
      },
    }),
    matrixAlternative("alpha-chat", "Alpha Chat", {
      e2ee: {
        status: "verified",
        value: true,
        source: {
          url: "https://alpha-chat.example/security",
        },
      },
      hosting_region: {
        status: "verified",
        value: "eu",
        source: {
          url: "javascript:alert(99)",
          title: "Unsafe Alpha hosting source",
          accessedDate: "2026-05-23",
        },
      },
      export_formats: {
        status: "not_applicable",
        value: null,
        source: {
          url: "https://alpha-chat.example/export-na",
          title: "Alpha export NA source",
        },
        auditQuote:
          "Internal not-applicable export quote must not become public.",
      } as unknown as MatrixFact,
      privacy_policy: {
        status: "verified",
        value: "https://alpha-chat.example/privacy",
      },
      supported_platforms: {
        status: "verified",
        value: ["ios"],
      },
      reactions_threads: {
        status: "verified",
        value: [],
      },
    }),
  ];

  const criterionCount = groups.reduce(
    (count, group) => count + group.criteria.length,
    0,
  );

  return {
    data: {
      category: {
        id: "messaging",
        name: "Messaging",
        description: "Secure messaging and chat apps",
        emoji: "chat",
      },
      groups,
      alternatives,
    },
    meta: {
      category: "messaging",
      locale: "en",
      groupCount: groups.length,
      criterionCount,
      alternativeCount: alternatives.length,
    },
  };
}

async function renderMatrix(): Promise<string> {
  const module = (await import("../src/components/CategoryMatrixView")) as {
    default: (props: { matrix: CategoryMatrixApiResponse }) => unknown;
  };
  return renderToStaticMarkup(
    createElement(module.default as never, { matrix: fixture() }),
  );
}

describe("matrix legend block", () => {
  it("renders a legend section listing each tone with both a label and an icon", async () => {
    const html = await renderMatrix();

    expect(html).toContain("category-matrix-legend");

    // Six legend entries: positive, warning, negative, neutral,
    // unverified, not-applicable. Each entry must carry a localized label
    // (color-independence: WCAG 1.4.1).
    expect(html).toContain("Positive / supported");
    expect(html).toContain("Caution");
    expect(html).toContain("Negative / not supported");
    expect(html).toContain("Neutral / informational");
    expect(html).toMatch(/category-matrix-legend[\s\S]*?Unverified/u);
    expect(html).toMatch(/category-matrix-legend[\s\S]*?Not applicable/u);

    // Each positive/negative legend item carries an inline SVG icon so users
    // can map the table icon back to its meaning without reading color.
    expect(html).toMatch(
      /category-matrix-legend-item[\s\S]{0,800}?--positive[\s\S]{0,500}?<svg/u,
    );
    expect(html).toMatch(
      /category-matrix-legend-item[\s\S]{0,800}?--negative[\s\S]{0,500}?<svg/u,
    );
  });

  it("pairs every legend entry with an inline SVG icon so the legend itself is not color-only", async () => {
    const html = await renderMatrix();

    // The legend is the color->meaning map. If its own warning / neutral /
    // unverified / not-applicable rows are not paired with an icon, the map
    // collapses back to "match this color against the cell" — which is
    // exactly what WCAG 1.4.1 prohibits and what the legend is meant to fix.
    const tones = [
      "positive",
      "warning",
      "negative",
      "neutral",
      "unverified",
      "not-applicable",
    ] as const;

    for (const tone of tones) {
      const itemPattern = new RegExp(
        `category-matrix-legend-item[\\s\\S]{0,800}?--${tone}[\\s\\S]{0,800}?<svg`,
        "u",
      );
      expect(
        html,
        `legend item for tone "${tone}" must contain an inline SVG icon`,
      ).toMatch(itemPattern);
    }
  });

  it("pins legend i18n copy in both browse locales", () => {
    const enLegend = (browseEn.matrixView as Record<string, unknown>).legend as
      | Record<string, string>
      | undefined;
    const deLegend = (browseDe.matrixView as Record<string, unknown>).legend as
      | Record<string, string>
      | undefined;

    expect(enLegend).toBeDefined();
    expect(deLegend).toBeDefined();

    const requiredKeys = [
      "positive",
      "warning",
      "negative",
      "neutral",
      "unverified",
      "notApplicable",
    ] as const;

    for (const key of requiredKeys) {
      expect(
        enLegend?.[key],
        `EN browse.matrixView.legend.${key} must be defined`,
      ).toBeTruthy();
      expect(
        deLegend?.[key],
        `DE browse.matrixView.legend.${key} must be defined`,
      ).toBeTruthy();
    }
  });
});

describe("matrix cell source links", () => {
  it("renders sourced verified fact cells as direct links to their public source", async () => {
    const html = await renderMatrix();

    // The matrix cell itself is the proof affordance: click the value and
    // open the verified public source directly. No in-table popover is
    // needed because product, criterion, and value are already visible.
    expect(html).toMatch(
      /<a[^>]*class="category-matrix-cell-source-link"[^>]*href="https:\/\/zeta-chat\.example\/encryption-report"[^>]*target="_blank"[^>]*rel="noopener noreferrer"[^>]*aria-label="Open source for Zeta Chat — End-to-end encryption"/u,
    );
    expect(html).toMatch(
      /<a[^>]*class="category-matrix-cell-source-link"[^>]*href="https:\/\/alpha-chat\.example\/security"[^>]*target="_blank"[^>]*rel="noopener noreferrer"[^>]*aria-label="Open source for Alpha Chat — End-to-end encryption"/u,
    );
  });

  it("does not render duplicated source metadata in the matrix body", async () => {
    const html = await renderMatrix();

    expect(html).toContain("Zeta Chat");
    expect(html).toContain("End-to-end encryption");
    expect(html).not.toContain("Zeta encryption report");
    expect(html).not.toContain("Accessed 2026-05-24");
  });

  it("never renders an unsafe javascript: source URL as a clickable link anywhere in the matrix", async () => {
    const html = await renderMatrix();

    // Defence-in-depth: every URL must route through sanitizeHref. If the
    // scheme is rejected, no <a href> may be emitted anywhere in the matrix.
    expect(html).not.toContain('href="javascript:alert(99)"');
    expect(html).not.toContain("Unsafe Alpha hosting source");
    expect(html).not.toContain("Accessed 2026-05-23");
  });

  it("omits source-link affordances for unverified and not_applicable cells", async () => {
    const html = await renderMatrix();

    // Source <a> tags must never be emitted for cells whose status is
    // unverified or not_applicable — these statuses carry no public claim
    // that can be backed by a citation.
    expect(html).not.toContain(
      'href="https://zeta-chat.example/export-formats"',
    );
    expect(html).not.toContain("Zeta export format source");
    expect(html).not.toContain('href="https://alpha-chat.example/export-na"');
    expect(html).not.toContain("Alpha export NA source");
  });

  it("never leaks internal audit / verifier text anywhere in the rendered matrix", async () => {
    const html = await renderMatrix();

    const forbidden = [
      "Internal verification quote for Zeta encryption must stay private.",
      "Never show verifier raw response for Zeta.",
      "Internal unverified export quote must not become public.",
      "Internal not-applicable export quote must not become public.",
      "auditQuote",
      "raw_response",
    ];

    for (const phrase of forbidden) {
      expect(html, `rendered HTML must not contain "${phrase}"`).not.toContain(
        phrase,
      );
    }
  });

  it("pins direct-source i18n copy in both browse locales", () => {
    const enMatrix = browseEn.matrixView as Record<string, unknown>;
    const deMatrix = browseDe.matrixView as Record<string, unknown>;

    expect(enMatrix.openSourceLabel).toBe(
      "Open source for {{product}} — {{criterion}}",
    );
    expect(deMatrix.openSourceLabel).toBe(
      "Quelle für {{product}} — {{criterion}} öffnen",
    );
  });
});

describe("matrix cell color-independence", () => {
  it("pairs every enum chip with a non-color affordance (icon or accessible label)", async () => {
    const html = await renderMatrix();

    // EU hosted (positive) and Global (warning) are both enum chips.
    // Each chip must carry either an inline icon or a textual aria-label
    // describing the tone — colour alone is not allowed (WCAG 1.4.1).
    const positiveChip = html.match(
      /<[^>]*category-matrix-option--positive[\s\S]{0,500}?<\/(span|button|div|li)>/u,
    );
    const warningChip = html.match(
      /<[^>]*category-matrix-option--warning[\s\S]{0,500}?<\/(span|button|div|li)>/u,
    );

    expect(positiveChip, "expected a positive enum chip").not.toBeNull();
    expect(warningChip, "expected a warning enum chip").not.toBeNull();

    const hasNonColorAffordance = (chunk: string) =>
      /<svg/u.test(chunk) || /aria-label="[^"]+"/u.test(chunk);

    expect(
      hasNonColorAffordance(positiveChip?.[0] ?? ""),
      "positive enum chip must carry an icon or aria-label, not color alone",
    ).toBe(true);
    expect(
      hasNonColorAffordance(warningChip?.[0] ?? ""),
      "warning enum chip must carry an icon or aria-label, not color alone",
    ).toBe(true);
  });

  it("prefixes every option chip aria-label with its localized tone description", async () => {
    const html = await renderMatrix();

    // Color-independence regression guard: the aria-label of an enum chip
    // must NAME the tone semantics, not just repeat the option label.
    // Without this, a screen-reader user only hears "EU hosted" without
    // any signal that it is the positive/recommended option. The exact
    // format is `${toneLabel}: ${label}`.
    expect(html).toMatch(
      /<[^>]*category-matrix-option--positive[^>]*aria-label="Positive \/ supported: EU hosted"/u,
    );
    expect(html).toMatch(
      /<[^>]*category-matrix-option--warning[^>]*aria-label="Caution: Global"/u,
    );
  });

  it("renders coverage rows with supported options green and missing options red", async () => {
    const html = await renderMatrix();

    expect(html).toMatch(
      /category-matrix-option--positive[^>]*aria-label="Positive \/ supported: Android"/u,
    );
    expect(html).toMatch(
      /category-matrix-option--negative[^>]*aria-label="Negative \/ not supported: iOS"/u,
    );
    expect(html).toMatch(
      /category-matrix-option--positive[^>]*aria-label="Positive \/ supported: Reactions"/u,
    );
    expect(html).toMatch(
      /category-matrix-option--negative[^>]*aria-label="Negative \/ not supported: Threads"/u,
    );
  });

  it("keeps a supported-but-tradeoff coverage option amber, not green", async () => {
    const html = await renderMatrix();

    // Presence upgrades neutral options to green, but a supported option whose
    // catalogue tone is a tradeoff must stay amber so it is not overstated.
    expect(html).toMatch(
      /category-matrix-option--tradeoff[^>]*aria-label="[^"]*Polls"/u,
    );
    expect(html).not.toMatch(
      /category-matrix-option--positive[^>]*aria-label="[^"]*Polls"/u,
    );
  });
});

describe("matrix cell source-link wiring", () => {
  it("styles sourced matrix cells as direct link targets without changing chip colors", () => {
    const css = readFileSync(
      new URL("../src/index.css", import.meta.url),
      "utf8",
    );
    const rule = css.match(/\.category-matrix-cell-source-link\s*\{[\s\S]*?\n\}/u)?.[0];

    expect(rule, "expected the source-link CSS rule to exist").toBeDefined();
    expect(rule).toMatch(/display\s*:\s*inline-flex/u);
    expect(rule).toMatch(/text-decoration\s*:\s*none/u);
    expect(rule).toMatch(/cursor\s*:\s*pointer/u);
    expect(css).toMatch(
      /\.category-matrix-cell-source-link:focus-visible\s*\{[\s\S]*?outline\s*:\s*2px\s+solid\s+var\(--accent-primary\)/u,
    );
  });

  it("does not render popover markup or dialog triggers", async () => {
    const html = await renderMatrix();

    expect(html).not.toContain("category-matrix-cell-popover");
    expect(html).not.toContain("category-matrix-cell-trigger");
    expect(html).not.toContain('role="dialog"');
    expect(html).not.toMatch(/aria-haspopup="dialog"/u);
    expect(html).not.toMatch(/aria-controls=/u);
    expect(html).not.toMatch(/aria-expanded="true"/u);
  });

  it("renders unverified and not_applicable cells as static status chips without source links", async () => {
    const html = await renderMatrix();

    expect(html).toContain("Data export formats");
    expect(html).toContain("Unverified");
    expect(html).toContain("Not applicable");
    expect(html).not.toContain(
      'href="https://zeta-chat.example/export-formats"',
    );
    expect(html).not.toContain('href="https://alpha-chat.example/export-na"');
  });

  it("keeps url-valueType cells as direct anchors when the value itself is the useful URL", async () => {
    const html = await renderMatrix();

    expect(html).toMatch(
      /<a[^>]*href="https:\/\/zeta-chat\.example\/privacy"[^>]*target="_blank"[^>]*>/u,
    );
    expect(html).toMatch(
      /<a[^>]*href="https:\/\/alpha-chat\.example\/privacy"[^>]*target="_blank"[^>]*>/u,
    );
  });
});
