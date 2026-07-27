import { readFileSync } from "node:fs";
import { createElement } from "react";
import type { ComponentType, Dispatch, ReactNode, SetStateAction } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { beforeEach, describe, expect, it, vi } from "vitest";

import browseDe from "../src/i18n/locales/de/browse.json";
import browseEn from "../src/i18n/locales/en/browse.json";
import type {
  Alternative,
  Category,
  CategoryId,
  CategoryMatrixApiResponse,
  CategoryMatrixLoadResult,
  MatrixAlternative,
  MatrixCriterion,
  MatrixFact,
  MatrixFilterMode,
  ViewMode,
} from "../src/types";

// ---------------------------------------------------------------------------
// Shared mocks for the matrix module
// ---------------------------------------------------------------------------

type ToolbarHookSeeds = {
  query: string;
  density: "comfortable" | "compact";
  queryInjected: boolean;
  densityInjected: boolean;
};

const toolbarHookSeeds: ToolbarHookSeeds = vi.hoisted(() => ({
  query: "",
  density: "comfortable",
  queryInjected: false,
  densityInjected: false,
}));

// `useState` interception: the toolbar's query+density state lives inside
// `CategoryMatrixView` as component-local state. To exercise the behaviour
// of a non-default state from an SSR test (where we cannot dispatch input
// events), we intercept the first `useState("")` call as the criteria query,
// and the first `useState("comfortable")` call as the density. All other
// hook calls (matrix cell popovers, mobile inspector selections) fall through
// to the real React implementation so unrelated behaviour stays correct.
vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");

  return {
    ...actual,
    useState: <S>(initial: S | (() => S)) => {
      if (initial === "" && !toolbarHookSeeds.queryInjected) {
        toolbarHookSeeds.queryInjected = true;
        return [
          toolbarHookSeeds.query as unknown as S,
          vi.fn() as Dispatch<SetStateAction<S>>,
        ];
      }
      if (
        initial === "comfortable" &&
        !toolbarHookSeeds.densityInjected
      ) {
        toolbarHookSeeds.densityInjected = true;
        return [
          toolbarHookSeeds.density as unknown as S,
          vi.fn() as Dispatch<SetStateAction<S>>,
        ];
      }
      return actual.useState(initial);
    },
  };
});

vi.mock("react-i18next", () => {
  const translations: Record<string, string> = {
    // Reused matrix surface keys
    "matrixView.title": "{{category}} comparison matrix",
    "matrixView.productColumn": "Product",
    "matrixView.criteriaColumn": "Criterion",
    "matrixView.yes": "Yes",
    "matrixView.no": "No",
    "matrixView.unverified": "Unverified",
    "matrixView.notApplicable": "Not applicable",
    "matrixView.source": "Source",
    "matrixView.accessedDate": "Accessed {{date}}",
    "matrixView.legend.title": "Legend",
    "matrixView.legend.positive": "Positive / supported",
    "matrixView.legend.warning": "Caution",
    "matrixView.legend.negative": "Negative / not supported",
    "matrixView.legend.neutral": "Neutral / informational",
    "matrixView.legend.tradeoff": "Trade-off",
    "matrixView.legend.unverified": "Unverified",
    "matrixView.legend.notApplicable": "Not applicable",
    "matrixView.popover.openLabel":
      "Show details for {{product}} — {{criterion}}",
    "matrixView.popover.close": "Close",
    "matrixView.inspector.primaryLabel": "Primary product",
    "matrixView.inspector.compareLabel": "Compare with",
    "matrixView.inspector.noSecondary": "No comparison",
    // New toolbar keys this issue introduces
    "matrixView.toolbar.searchPlaceholder": "Search criteria...",
    "matrixView.toolbar.searchLabel": "Search criteria",
    "matrixView.toolbar.clearSearch": "Clear criteria search",
    "matrixView.toolbar.matchCount": "{{matched}} of {{total}} criteria",
    "matrixView.toolbar.densityLabel": "Density",
    "matrixView.toolbar.densityCompact": "Compact",
    "matrixView.toolbar.densityComfortable": "Comfortable",
    "matrixView.toolbar.emptyTitle": "No criteria match",
    "matrixView.toolbar.emptyBody":
      "No criteria match the current search. Clear the search to see all criteria.",
  };

  return {
    useTranslation: () => ({
      i18n: { language: "en" },
      t: (key: string, values?: Record<string, string | number>) => {
        const template = translations[key] ?? key;

        return template.replace(/\{\{(\w+)\}\}/gu, (_match, name: string) =>
          String(values?.[name] ?? ""),
        );
      },
    }),
  };
});

beforeEach(() => {
  toolbarHookSeeds.query = "";
  toolbarHookSeeds.density = "comfortable";
  toolbarHookSeeds.queryInjected = false;
  toolbarHookSeeds.densityInjected = false;
});

// ---------------------------------------------------------------------------
// Matrix fixture: groups + criteria with distinctive labels/help text so the
// search and grouping behaviour can be observed in the rendered HTML.
// ---------------------------------------------------------------------------

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
          helpText: "Default-on E2EE for direct and group messages",
          valueType: "boolean",
        }),
        criterion("metadata_min", "none", {
          label: "Metadata minimisation",
          helpText: "Server stores no message metadata",
          valueType: "boolean",
        }),
      ],
    },
    {
      id: "compliance",
      label: "Compliance",
      description: null,
      criteria: [
        criterion("eu_hosting", "must_match", {
          label: "EU hosting",
          helpText: "Servers physically located in the EU",
          valueType: "boolean",
        }),
        criterion("dpa_available", "none", {
          label: "Data processing agreement",
          helpText: "Vendor offers a standard DPA",
          valueType: "boolean",
        }),
      ],
    },
  ];

  const verifiedTrue: MatrixFact = { status: "verified", value: true };
  const verifiedFalse: MatrixFact = { status: "verified", value: false };

  const alternatives: MatrixAlternative[] = [
    matrixAlternative("alpha-chat", "Alpha Chat", {
      e2ee: verifiedTrue,
      metadata_min: verifiedTrue,
      eu_hosting: verifiedTrue,
      dpa_available: verifiedTrue,
    }),
    matrixAlternative("beta-chat", "Beta Chat", {
      e2ee: verifiedTrue,
      metadata_min: verifiedFalse,
      eu_hosting: verifiedFalse,
      dpa_available: verifiedTrue,
    }),
    matrixAlternative("gamma-chat", "Gamma Chat", {
      e2ee: verifiedFalse,
      metadata_min: verifiedFalse,
      eu_hosting: verifiedTrue,
      dpa_available: verifiedFalse,
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

// ---------------------------------------------------------------------------
// BrowsePage rendering harness (mirrors the pattern from
// tests/category-matrix-filter-panel-removed.test.ts). Used only to verify
// the toolbar is gated to matrix mode.
// ---------------------------------------------------------------------------

type BrowseViewModeForTest = ViewMode | "matrix";
type BrowseEffect = () => void | (() => void);

type LoadedCategoryMatrixFixture = {
  category: CategoryId;
  language: string;
  result: CategoryMatrixLoadResult;
};

const browseTestMocks = vi.hoisted(() => ({
  catalog: null as unknown,
  effects: [] as BrowseEffect[],
  fetchCategoryMatrix: vi.fn(),
  language: "en",
  loadedCategoryMatrix: undefined as unknown,
  search: "",
  setSearchParams: vi.fn(),
  setViewMode: vi.fn(),
  viewMode: "grid" as BrowseViewModeForTest,
}));

vi.mock("react-router", () => ({
  useSearchParams: () => [
    new URLSearchParams(browseTestMocks.search),
    browseTestMocks.setSearchParams,
  ],
}));

vi.mock("../src/contexts/CatalogContext", () => ({
  useCatalog: () => browseTestMocks.catalog,
}));

vi.mock("../src/data/categoryMatrix", () => ({
  fetchCategoryMatrix: browseTestMocks.fetchCategoryMatrix,
}));

vi.mock("../src/components/Filters", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  return {
    default: () =>
      React.createElement("div", { "data-browse-test": "filters" }, "Filters"),
  };
});

vi.mock("../src/components/AlternativeCard", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  return {
    default: ({ alternative }: { alternative: Alternative }) =>
      React.createElement(
        "article",
        { "data-browse-test": "result-card" },
        alternative.name,
      ),
  };
});

vi.mock("framer-motion", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  const motionProps = new Set([
    "animate",
    "exit",
    "initial",
    "transition",
    "variants",
    "whileHover",
    "whileTap",
  ]);
  const createMotionComponent =
    (tag: string) =>
    ({
      children,
      ...props
    }: Record<string, unknown> & { children?: ReactNode }) => {
      const domProps: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(props)) {
        if (motionProps.has(key)) continue;
        if (key === "layoutId") {
          domProps["data-morph-id"] = String(value);
          continue;
        }
        domProps[key] = value;
      }
      return React.createElement(tag, domProps, children);
    };

  const passthrough = ({ children }: { children?: ReactNode }) =>
    React.createElement(React.Fragment, null, children);

  return {
    motion: new Proxy(
      {},
      { get: (_t, tag) => createMotionComponent(String(tag)) },
    ),
    AnimatePresence: passthrough,
    LayoutGroup: passthrough,
    MotionConfig: passthrough,
    useReducedMotion: () => false,
  };
});

function browseAlternative(
  id: string,
  name: string,
  category: CategoryId,
): Alternative {
  return {
    id,
    name,
    description: `${name} description`,
    website: `https://${id}.example`,
    country: "de",
    category,
    secondaryCategories: [],
    replacesUS: [],
    isOpenSource: true,
    pricing: "free",
    tags: [category],
    trustScoreStatus: "ready",
    trustScore: 90,
  };
}

function createBrowseCatalog() {
  const categories: Category[] = [
    {
      id: "messaging",
      name: "Messaging",
      description: "Secure messaging",
      usGiants: [],
      emoji: "chat",
    },
  ];
  return {
    alternatives: [
      browseAlternative("alpha-chat", "Alpha Chat", "messaging"),
      browseAlternative("beta-chat", "Beta Chat", "messaging"),
    ],
    categories,
    deniedAlternatives: [],
    error: null,
    furtherReadingResources: [],
    landingCategoryGroups: [],
    loading: false,
    usVendors: [],
  };
}

function readyBrowseMatrix(): CategoryMatrixLoadResult {
  return {
    status: "ready",
    matrix: fixture(),
    error: null,
  };
}

async function renderBrowsePage(
  options: {
    loadedCategoryMatrix?: LoadedCategoryMatrixFixture;
    search?: string;
    viewMode?: BrowseViewModeForTest;
  } = {},
): Promise<string> {
  browseTestMocks.catalog = createBrowseCatalog();
  browseTestMocks.effects = [];
  browseTestMocks.fetchCategoryMatrix.mockReturnValue(new Promise(() => {}));
  browseTestMocks.language = "en";
  browseTestMocks.loadedCategoryMatrix =
    options.loadedCategoryMatrix ?? undefined;
  browseTestMocks.search = options.search ?? "";
  browseTestMocks.setSearchParams.mockClear();
  browseTestMocks.setViewMode.mockClear();
  browseTestMocks.viewMode = options.viewMode ?? "grid";

  const browseModule = (await import("../src/components/BrowsePage")) as {
    default: ComponentType;
  };

  return renderToStaticMarkup(createElement(browseModule.default));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("matrix toolbar — default render (no query, comfortable density)", () => {
  it("renders a matrix toolbar surface inside the matrix view", async () => {
    const html = await renderMatrix();

    // The toolbar must live inside the matrix view, not in the BrowsePage
    // chrome. The class prefix must be `category-matrix-toolbar`, not
    // `category-matrix-filter-` (which is forbidden by the panel-removal
    // contract).
    expect(html).toMatch(/category-matrix-toolbar/u);
  });

  it("exposes a labelled criteria search input with an accessible name", async () => {
    const html = await renderMatrix();

    // The search input must have an accessible name; the simplest way is
    // either a visible <label> or an aria-label. Either is acceptable —
    // assert at least one is present pointing at the localised search label.
    const hasAriaLabel = /<input[^>]*aria-label="Search criteria"/u.test(html);
    const hasWrappingLabel =
      /<label[^>]*>[\s\S]{0,200}?Search criteria[\s\S]{0,200}?<input/u.test(
        html,
      );

    expect(
      hasAriaLabel || hasWrappingLabel,
      "toolbar search input must be labelled with the localised 'Search criteria' string",
    ).toBe(true);

    // The placeholder must come from the i18n bundle, not be hardcoded.
    expect(html).toMatch(/placeholder="Search criteria\.\.\."/u);
  });

  it("renders the density control as a radiogroup with two radios", async () => {
    const html = await renderMatrix();

    // The density control must be a true radiogroup, not two unrelated
    // buttons — otherwise screen readers cannot announce the relationship.
    expect(html).toMatch(/role="radiogroup"/u);
    // Both options must be present as radios with an accessible name.
    const radioCount = (html.match(/role="radio"/gu) ?? []).length;
    expect(radioCount).toBeGreaterThanOrEqual(2);
    // Comfortable is the default; its radio should be checked.
    expect(html).toMatch(
      /role="radio"[^>]*aria-checked="true"[^>]*>[\s\S]{0,200}?Comfortable/u,
    );
    // Compact is available but not selected.
    expect(html).toMatch(
      /role="radio"[^>]*aria-checked="false"[^>]*>[\s\S]{0,200}?Compact/u,
    );
  });

  it("applies the comfortable density attribute to the matrix wrapper", async () => {
    const html = await renderMatrix();

    // Density is implemented as a `data-density` attribute on the matrix
    // wrapper so a single attribute toggle re-themes the whole table via
    // CSS custom properties. Default is comfortable.
    expect(html).toMatch(/data-density="comfortable"/u);
    expect(html).not.toMatch(/data-density="compact"/u);
  });

  it("shows every criterion when the search query is empty", async () => {
    const html = await renderMatrix();

    // All four criteria from the fixture must render as column headers when
    // the criteria search has not narrowed the set.
    expect(html).toContain("End-to-end encryption");
    expect(html).toContain("Metadata minimisation");
    expect(html).toContain("EU hosting");
    expect(html).toContain("Data processing agreement");
    // Both group headers must render too.
    expect(html).toContain("Privacy");
    expect(html).toContain("Compliance");
  });
});

describe("matrix toolbar — criteria search filtering", () => {
  it("hides criteria whose label does not match the query", async () => {
    toolbarHookSeeds.query = "encryption";

    const html = await renderMatrix();

    // The label-matching criterion is kept.
    expect(html).toContain("End-to-end encryption");
    // The non-matching criteria must be hidden from the rendered matrix.
    expect(html).not.toContain("Metadata minimisation");
    expect(html).not.toContain("EU hosting");
    expect(html).not.toContain("Data processing agreement");
  });

  it("matches against helpText, not just label", async () => {
    toolbarHookSeeds.query = "physically located";

    const html = await renderMatrix();

    // Only `eu_hosting` carries the phrase "physically located" in helpText.
    expect(html).toContain("EU hosting");
    expect(html).not.toContain("End-to-end encryption");
    expect(html).not.toContain("Metadata minimisation");
    expect(html).not.toContain("Data processing agreement");
  });

  it("matches against group label (whole group survives a group-label query)", async () => {
    toolbarHookSeeds.query = "Compliance";

    const html = await renderMatrix();

    // Every criterion in the Compliance group must remain visible because
    // the query matches the group's own label.
    expect(html).toContain("EU hosting");
    expect(html).toContain("Data processing agreement");
    // Privacy-group criteria must be hidden.
    expect(html).not.toContain("End-to-end encryption");
    expect(html).not.toContain("Metadata minimisation");
  });

  it("performs case-insensitive matching", async () => {
    toolbarHookSeeds.query = "ENCRYPTION";

    const html = await renderMatrix();

    expect(html).toContain("End-to-end encryption");
    expect(html).not.toContain("Metadata minimisation");
  });

  it("requires every whitespace-separated token to match (AND semantics)", async () => {
    // 'eu hosting' must match only the eu_hosting criterion — even though
    // 'eu' alone would also match 'EU hosting' inside the Compliance label,
    // 'hosting' as a token narrows the match further.
    toolbarHookSeeds.query = "eu hosting";

    const html = await renderMatrix();

    expect(html).toContain("EU hosting");
    expect(html).not.toContain("End-to-end encryption");
    expect(html).not.toContain("Metadata minimisation");
    expect(html).not.toContain("Data processing agreement");
  });

  it("treats whitespace-only queries as empty", async () => {
    toolbarHookSeeds.query = "   ";

    const html = await renderMatrix();

    // Whitespace-only must restore the full set, not collapse to an empty
    // filter (and therefore the empty-state).
    expect(html).toContain("End-to-end encryption");
    expect(html).toContain("Metadata minimisation");
    expect(html).toContain("EU hosting");
    expect(html).toContain("Data processing agreement");
  });

  it("does not reduce visible alternatives (rows) when criteria are hidden", async () => {
    toolbarHookSeeds.query = "encryption";

    const html = await renderMatrix();

    // The toolbar operates on the column axis only. All three alternatives
    // (rows) must still appear regardless of how many criteria the search
    // hid — otherwise the Browse-vs-Matrix separation contract is broken.
    expect(html).toContain("Alpha Chat");
    expect(html).toContain("Beta Chat");
    expect(html).toContain("Gamma Chat");
  });

  it("renders a matrix-specific empty state when no criteria match the query", async () => {
    toolbarHookSeeds.query = "thiswillmatchnothing";

    const html = await renderMatrix();

    // The localized empty-state title is the structural marker — the matrix
    // table must not render when there is nothing to compare.
    expect(html).toContain("No criteria match");
    // The data table itself must not be rendered when there's nothing to
    // show. Otherwise the user sees a sticky-header skeleton with no body
    // rows, which is what the empty state replaces.
    expect(html).not.toMatch(/<table[^>]*category-matrix-view-table/u);
    // None of the criterion labels should render in the empty state.
    expect(html).not.toContain("End-to-end encryption");
    expect(html).not.toContain("EU hosting");
  });

  it("filters the mobile inspector in lockstep with the desktop table", async () => {
    toolbarHookSeeds.query = "encryption";

    const html = await renderMatrix();

    // The mobile inspector container must still render (it is the alternate
    // layout, not a separate data set), but the filtered-out criteria must
    // not appear inside it either.
    expect(html).toContain('data-testid="category-matrix-mobile-inspector"');
    // Locate the mobile inspector slice and assert the hidden criteria are
    // absent within it.
    const mobileStart = html.indexOf(
      'data-testid="category-matrix-mobile-inspector"',
    );
    expect(mobileStart).toBeGreaterThan(-1);
    const mobileSlice = html.slice(mobileStart);
    expect(mobileSlice).toContain("End-to-end encryption");
    expect(mobileSlice).not.toContain("Metadata minimisation");
    expect(mobileSlice).not.toContain("EU hosting");
    expect(mobileSlice).not.toContain("Data processing agreement");
  });

  it("skips group headers that have no matching criteria (no orphan group labels)", async () => {
    toolbarHookSeeds.query = "encryption";

    const html = await renderMatrix();

    // Only the Privacy group has a matching criterion under this query.
    // The Compliance group header must not appear anywhere (no orphan
    // `<h3>Compliance</h3>` in the mobile inspector, no orphan colgroup
    // header in the desktop table).
    expect(html).toContain("Privacy");
    expect(html).not.toContain("Compliance");
  });
});

describe("matrix toolbar — density control", () => {
  it("applies data-density='compact' to the wrapper when compact is selected", async () => {
    toolbarHookSeeds.density = "compact";

    const html = await renderMatrix();

    expect(html).toMatch(/data-density="compact"/u);
    expect(html).not.toMatch(/data-density="comfortable"/u);
    // The compact radio must report itself as checked.
    expect(html).toMatch(
      /role="radio"[^>]*aria-checked="true"[^>]*>[\s\S]{0,200}?Compact/u,
    );
    expect(html).toMatch(
      /role="radio"[^>]*aria-checked="false"[^>]*>[\s\S]{0,200}?Comfortable/u,
    );
  });
});

describe("matrix toolbar — mode gating in BrowsePage", () => {
  it("never renders the toolbar surface when BrowsePage is in browse (non-matrix) mode", async () => {
    const html = await renderBrowsePage({
      loadedCategoryMatrix: {
        category: "messaging",
        language: "en",
        result: readyBrowseMatrix(),
      },
      search: "category=messaging",
      viewMode: "grid",
    });

    // Matrix view must not be rendered at all in browse mode, so neither
    // the toolbar nor its localised strings may appear.
    expect(html).not.toMatch(/category-matrix-toolbar/u);
    expect(html).not.toContain("Search criteria");
    expect(html).not.toMatch(/role="radiogroup"/u);
  });
});

describe("matrix toolbar — naming contract (must not regress on removed filter panel)", () => {
  it("uses the category-matrix-toolbar CSS prefix and avoids the forbidden category-matrix-filter- prefix", async () => {
    const html = await renderMatrix();

    expect(html).toMatch(/category-matrix-toolbar/u);
    // The removed filter panel's prefix must not reappear in the rendered
    // markup. Word-boundary so we do not accidentally match a substring of
    // a different identifier.
    expect(html).not.toMatch(/category-matrix-filter[-\s"']/u);
  });

  it("does not introduce a `matrixFilters` block in either locale bundle", () => {
    // The removed filter panel was namespaced under `matrixFilters`. The new
    // toolbar must stay under the existing `matrixView` block.
    expect(browseEn).not.toHaveProperty("matrixFilters");
    expect(browseDe).not.toHaveProperty("matrixFilters");
  });

  it("does not introduce a `category-matrix-filter-` rule into index.css", () => {
    const css = readFileSync(
      new URL("../src/index.css", import.meta.url),
      "utf8",
    );

    // The toolbar's CSS must use its own prefix and must not resurrect the
    // removed panel's class block.
    expect(css).not.toContain("category-matrix-filter-");
  });
});

describe("matrix toolbar — i18n key parity", () => {
  it("ships every toolbar key in both the English and German browse bundles", () => {
    const enToolbar = (browseEn.matrixView as Record<string, unknown>)
      .toolbar as Record<string, string> | undefined;
    const deToolbar = (browseDe.matrixView as Record<string, unknown>)
      .toolbar as Record<string, string> | undefined;

    expect(enToolbar, "EN browse.matrixView.toolbar must be defined").toBeDefined();
    expect(deToolbar, "DE browse.matrixView.toolbar must be defined").toBeDefined();

    const requiredKeys = [
      "searchPlaceholder",
      "searchLabel",
      "clearSearch",
      "densityLabel",
      "densityCompact",
      "densityComfortable",
      "emptyTitle",
      "emptyBody",
    ] as const;

    for (const key of requiredKeys) {
      expect(
        enToolbar?.[key],
        `EN browse.matrixView.toolbar.${key} must be a non-empty string`,
      ).toBeTruthy();
      expect(
        deToolbar?.[key],
        `DE browse.matrixView.toolbar.${key} must be a non-empty string`,
      ).toBeTruthy();
    }
  });

  it("uses native German umlauts in the toolbar bundle", () => {
    const deToolbar = (browseDe.matrixView as Record<string, unknown>)
      .toolbar as Record<string, string> | undefined;

    expect(deToolbar).toBeDefined();

    expect(deToolbar?.clearSearch).toBe("Kriteriensuche löschen");
    expect(deToolbar?.emptyBody).toContain("zurück");
    expect(deToolbar?.emptyBodyWithToggles).toContain("zurück");
    expect(deToolbar?.hideUnverified).toBe("Unbestätigte ausblenden");
    expect(deToolbar?.resetToggles).toBe("Schalter zurücksetzen");
    expect(deToolbar?.clearPins).toBe("Anheftungen löschen");
  });

  it("ships a `matchCount` key in both locale bundles so the live counter can interpolate", () => {
    // The toolbar's live match-count surface calls
    // t("matrixView.toolbar.matchCount", { matched, total }). If the key is
    // missing the counter renders the raw key path, which is a visible bug.
    const enToolbar = (browseEn.matrixView as Record<string, unknown>)
      .toolbar as Record<string, string> | undefined;
    const deToolbar = (browseDe.matrixView as Record<string, unknown>)
      .toolbar as Record<string, string> | undefined;

    expect(enToolbar?.matchCount).toBeTruthy();
    expect(deToolbar?.matchCount).toBeTruthy();
    // The template must reference both placeholders so the counter actually
    // shows matched + total counts.
    expect(enToolbar?.matchCount).toMatch(/\{\{matched\}\}/u);
    expect(enToolbar?.matchCount).toMatch(/\{\{total\}\}/u);
    expect(deToolbar?.matchCount).toMatch(/\{\{matched\}\}/u);
    expect(deToolbar?.matchCount).toMatch(/\{\{total\}\}/u);
  });
});

describe("matrix toolbar — match-count live counter", () => {
  it("does not render the match counter when no query is active", async () => {
    // With an empty query, the entire criterion set is visible — the counter
    // is noise, not signal. The implementation must omit it.
    const html = await renderMatrix();

    expect(html).not.toContain("category-matrix-toolbar-match-count");
    // Defensive: the literal " of " text from the counter template
    // ("{{matched}} of {{total}} criteria") must not appear in the rendered
    // toolbar either.
    expect(html).not.toMatch(/\b\d+ of \d+ criteria\b/u);
  });

  it("renders the match counter with matched/total values when a query is active", async () => {
    toolbarHookSeeds.query = "encryption";

    const html = await renderMatrix();

    // Only `e2ee` (End-to-end encryption) matches across all four criteria,
    // so the counter must read "1 of 4 criteria".
    expect(html).toContain("category-matrix-toolbar-match-count");
    expect(html).toContain("1 of 4 criteria");
  });

  it("annotates the match counter with aria-live='polite' for screen readers", async () => {
    toolbarHookSeeds.query = "encryption";

    const html = await renderMatrix();

    // The counter must announce updates as the user types so non-sighted
    // users get the same "X of Y" feedback sighted users do.
    expect(html).toMatch(
      /<[^>]*category-matrix-toolbar-match-count[^>]*aria-live="polite"/u,
    );
  });

  it("reports `0 of N` when the query matches nothing (paired with the empty state)", async () => {
    toolbarHookSeeds.query = "thiswillmatchnothing";

    const html = await renderMatrix();

    // Even when no criteria match, the counter stays visible so the user
    // can see the search is active. The empty state is the structural cue,
    // the counter is the numerical confirmation.
    expect(html).toContain("0 of 4 criteria");
  });
});

describe("matrix toolbar — search clear button", () => {
  it("renders no clear button while the search input is empty", async () => {
    const html = await renderMatrix();

    // Without a query there is nothing to clear, so the button must not
    // render. (The aria-label "Clear criteria search" is the structural
    // marker.)
    expect(html).not.toContain("Clear criteria search");
    expect(html).not.toContain("category-matrix-toolbar-search-clear");
  });

  it("renders a clear button with a localised aria-label when a query is active", async () => {
    toolbarHookSeeds.query = "encryption";

    const html = await renderMatrix();

    // The clear button must be a real <button type="button"> with the
    // localised accessible name — otherwise keyboard / screen-reader users
    // cannot reset the search.
    expect(html).toMatch(
      /<button[^>]*type="button"[^>]*aria-label="Clear criteria search"/u,
    );
  });
});

describe("matrix toolbar — empty state structure", () => {
  it("renders the empty-state body text and a localised clear button when no criteria match", async () => {
    toolbarHookSeeds.query = "thiswillmatchnothing";

    const html = await renderMatrix();

    // Existing tests cover the empty-state title and the absence of the
    // table; this fills the gap on the body copy and the recovery button,
    // which are what actually let the user understand and recover.
    expect(html).toContain(
      "No criteria match the current search. Clear the search to see all criteria.",
    );
    // The clear button inside the empty state — distinct from the in-search
    // clear button — must render with the localised label so the user can
    // recover without scrolling back to the search input.
    expect(html).toMatch(
      /<button[^>]*category-matrix-toolbar-empty-clear[^>]*>[\s\S]{0,200}?Clear criteria search/u,
    );
  });

  it("keeps the toolbar visible in the empty state so the user can recover", async () => {
    toolbarHookSeeds.query = "thiswillmatchnothing";

    const html = await renderMatrix();

    // The toolbar must stay rendered alongside the empty state — otherwise
    // the user is stranded with no way to clear or refine the query
    // (except the empty-state clear button, which alone is not enough:
    // the user might want to edit the query, not wipe it).
    expect(html).toContain("category-matrix-toolbar-search-input");
    expect(html).toMatch(/role="radiogroup"/u);
    // And the live match counter must still be present, reporting 0 of N.
    expect(html).toContain("category-matrix-toolbar-match-count");
  });

  it("marks the empty state with role='status' for assistive tech", async () => {
    toolbarHookSeeds.query = "thiswillmatchnothing";

    const html = await renderMatrix();

    // The empty state is the structural announcement of "your search hid
    // everything" — screen readers should pick it up automatically, which
    // requires either role="status" or aria-live. The implementation uses
    // role="status".
    expect(html).toMatch(
      /<div[^>]*category-matrix-toolbar-empty[^>]*role="status"/u,
    );
  });
});
