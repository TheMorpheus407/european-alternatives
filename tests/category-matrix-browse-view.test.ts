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

type BrowseViewModeForTest = ViewMode | "matrix";

type LoadedCategoryMatrixFixture = {
  category: CategoryId;
  language: string;
  result: CategoryMatrixLoadResult;
};

type CapturedFiltersProps = {
  matrixViewAvailable: boolean;
  viewMode: string | undefined;
};

type BrowseEffect = () => void | (() => void);

const browseTestMocks = vi.hoisted(() => ({
  catalog: null as unknown,
  effects: [] as BrowseEffect[],
  fetchCategoryMatrix: vi.fn(),
  filterProps: [] as CapturedFiltersProps[],
  language: "en",
  loadedCategoryMatrix: undefined as unknown,
  search: "",
  setSearchParams: vi.fn(),
  setViewMode: vi.fn(),
  viewMode: "grid" as BrowseViewModeForTest,
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");

  return {
    ...actual,
    useEffect: (effect: BrowseEffect) => {
      browseTestMocks.effects.push(effect);
    },
    useState: <State>(initialState: State | (() => State)) => {
      if (initialState === "grid") {
        return [
          browseTestMocks.viewMode as State,
          browseTestMocks.setViewMode as Dispatch<SetStateAction<State>>,
        ];
      }

      if (
        browseTestMocks.loadedCategoryMatrix !== undefined &&
        initialState === null
      ) {
        return [
          browseTestMocks.loadedCategoryMatrix as State,
          vi.fn() as Dispatch<SetStateAction<State>>,
        ];
      }

      return actual.useState(initialState);
    },
  };
});

vi.mock("react-i18next", () => {
  const translations: Record<string, string> = {
    title: "Browse alternatives",
    subtitle: "Find European alternatives",
    noResults: "No results",
    noResultsDesc: "No alternatives match.",
    catalogueComingSoon: "Catalogue coming soon",
    catalogueComingSoonDesc: "Check back soon.",
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
    "matrixView.sort.nameAsc": "Sort by name ascending",
    "matrixView.sort.nameDesc": "Sort by name descending",
    "matrixView.sort.trustScoreAsc": "Sort by Trust Score ascending",
    "matrixView.sort.trustScoreDesc": "Sort by Trust Score descending",
    "matrixView.openProductDetails": "Open {{product}} details",
    "compare.selectedCount": "{{count}} card selected for comparison",
    "compare.open": "Compare",
    "compare.clear": "Clear comparison selection",
    "overlay.close": "Close",
  };

  return {
    useTranslation: () => ({
      i18n: { language: browseTestMocks.language },
      t: (key: string, values?: Record<string, string | number>) => {
        const template = translations[key] ?? key;

        return template.replace(/\{\{(\w+)\}\}/gu, (_match, name: string) =>
          String(values?.[name] ?? ""),
        );
      },
    }),
  };
});

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
    default: ({
      matrixViewAvailable,
      viewMode,
    }: {
      matrixViewAvailable?: boolean;
      viewMode?: string;
    }) => {
      browseTestMocks.filterProps.push({
        matrixViewAvailable: matrixViewAvailable === true,
        viewMode,
      });

      return React.createElement(
        "div",
        {
          "data-browse-test": "global-filters",
          "data-matrix-view-available":
            matrixViewAvailable === true ? "true" : "false",
          "data-view-mode": viewMode,
        },
        "Global Filters",
      );
    },
  };
});

vi.mock("../src/components/AlternativeCard", async () => {
  const React = await vi.importActual<typeof import("react")>("react");

  return {
    default: ({
      alternative,
      viewMode,
    }: {
      alternative: Alternative;
      viewMode: string;
    }) =>
      React.createElement(
        "article",
        {
          "data-browse-test": "result-card",
          "data-view-mode": viewMode,
        },
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
        if (motionProps.has(key)) {
          continue;
        }
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
      {
        get: (_target, tag) => createMotionComponent(String(tag)),
      },
    ),
    AnimatePresence: passthrough,
    LayoutGroup: passthrough,
    MotionConfig: passthrough,
    useReducedMotion: () => false,
  };
});

beforeEach(() => {
  browseTestMocks.catalog = createBrowseCatalog();
  browseTestMocks.effects = [];
  browseTestMocks.fetchCategoryMatrix.mockReturnValue(new Promise(() => {}));
  browseTestMocks.filterProps = [];
  browseTestMocks.language = "en";
  browseTestMocks.loadedCategoryMatrix = undefined;
  browseTestMocks.search = "";
  browseTestMocks.setSearchParams.mockClear();
  browseTestMocks.setViewMode.mockClear();
  browseTestMocks.viewMode = "grid";
});

async function renderBrowsePage(
  options: {
    language?: string;
    loadedCategoryMatrix?: LoadedCategoryMatrixFixture;
    search?: string;
    viewMode?: BrowseViewModeForTest;
  } = {},
): Promise<string> {
  browseTestMocks.effects = [];
  browseTestMocks.filterProps = [];
  browseTestMocks.language = options.language ?? "en";
  browseTestMocks.loadedCategoryMatrix =
    options.loadedCategoryMatrix ?? undefined;

  const requestedViewMode = options.viewMode ?? "grid";
  if (requestedViewMode === "matrix") {
    const params = new URLSearchParams(options.search ?? "");
    if (!params.has("view")) {
      params.set("view", "matrix");
    }
    browseTestMocks.search = params.toString();
    browseTestMocks.viewMode = "grid";
  } else {
    browseTestMocks.search = options.search ?? "";
    browseTestMocks.viewMode = requestedViewMode;
  }

  const browseModule = (await import("../src/components/BrowsePage")) as {
    default: ComponentType;
  };

  return renderToStaticMarkup(createElement(browseModule.default));
}

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
  overrides: Partial<MatrixAlternative> = {},
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
    ...overrides,
  };
}

function readyMatrixResult(): CategoryMatrixLoadResult {
  return {
    status: "ready",
    matrix: matrix(
      [
        {
          id: "privacy",
          label: "Privacy",
          description: null,
          criteria: [
            criterion("e2ee", "must_match", {
              label: "End-to-end encryption",
              valueType: "boolean",
              semantics: "beneficial",
            }),
            criterion("hosting_region", "must_match", {
              label: "Hosting region",
              valueType: "enum",
              options: [
                { id: "eu", label: "EU hosted", displayTone: "positive" },
                { id: "global", label: "Global", displayTone: "warning" },
              ],
            }),
            criterion("privacy_policy", "none", {
              label: "Privacy policy",
              valueType: "url",
            }),
          ],
        },
        {
          id: "portability",
          label: "Portability",
          description: null,
          criteria: [
            criterion("retention_days", "none", {
              label: "Data retention days",
              valueType: "number",
            }),
            criterion("export_formats", "none", {
              label: "Data export formats",
              valueType: "multi_enum",
              options: [
                { id: "csv", label: "CSV export" },
                { id: "json", label: "JSON export" },
              ],
            }),
            criterion("support_sla", "none", {
              label: "Support SLA",
              valueType: "text",
            }),
          ],
        },
      ],
      [
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
          privacy_policy: {
            status: "verified",
            value: "https://zeta-chat.example/privacy",
          },
          retention_days: { status: "verified", value: 1234 },
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
          support_sla: { status: "verified", value: "Community support" },
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
          privacy_policy: {
            status: "verified",
            value: "javascript:alert(1)",
          },
          retention_days: { status: "verified", value: 7 },
          export_formats: {
            status: "verified",
            value: ["csv", "json"],
          },
          support_sla: {
            status: "not_applicable",
            value: null,
            source: {
              url: "https://alpha-chat.example/support-sla",
              title: "Alpha support SLA source",
            },
            auditQuote:
              "Internal not-applicable support quote must not become public.",
          } as unknown as MatrixFact,
        }),
      ],
    ),
    error: null,
  };
}

function emptyMatrixResult(): CategoryMatrixLoadResult {
  return {
    status: "empty",
    matrix: matrix([]),
    error: null,
  };
}

function unavailableMatrixResult(): CategoryMatrixLoadResult {
  return {
    status: "unavailable",
    matrix: null,
    error: {
      code: "not_found",
      message: "Matrix unavailable",
    },
  };
}

function allUnverifiedMatrixResult(): CategoryMatrixLoadResult {
  return {
    status: "ready",
    matrix: matrix(
      [
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
              ],
            }),
          ],
        },
      ],
      [
        matrixAlternative("alpha-chat", "Alpha Chat", {
          e2ee: { status: "unverified", value: null },
          hosting_region: { status: "unverified", value: null },
        }),
        matrixAlternative("zeta-chat", "Zeta Chat", {
          e2ee: { status: "unverified", value: null },
          hosting_region: { status: "unverified", value: null },
        }),
      ],
    ),
    error: null,
  };
}

function mixedVerificationMatrixResult(): CategoryMatrixLoadResult {
  return {
    status: "ready",
    matrix: matrix(
      [
        {
          id: "privacy",
          label: "Privacy",
          description: null,
          criteria: [
            criterion("e2ee", "must_match", {
              label: "End-to-end encryption",
              valueType: "boolean",
            }),
          ],
        },
      ],
      [
        matrixAlternative("alpha-chat", "Alpha Chat", {
          e2ee: { status: "verified", value: true },
        }),
        matrixAlternative("zeta-chat", "Zeta Chat", {
          e2ee: { status: "unverified", value: null },
        }),
      ],
    ),
    error: null,
  };
}

function allNotApplicableMatrixResult(): CategoryMatrixLoadResult {
  return {
    status: "ready",
    matrix: matrix(
      [
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
              ],
            }),
          ],
        },
      ],
      [
        matrixAlternative("alpha-chat", "Alpha Chat", {
          e2ee: { status: "not_applicable", value: null },
          hosting_region: { status: "not_applicable", value: null },
        }),
        matrixAlternative("zeta-chat", "Zeta Chat", {
          e2ee: { status: "not_applicable", value: null },
          hosting_region: { status: "not_applicable", value: null },
        }),
      ],
    ),
    error: null,
  };
}

function sparseVerifiedMatrixResult(): CategoryMatrixLoadResult {
  return {
    status: "ready",
    matrix: matrix(
      [
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
              ],
            }),
          ],
        },
      ],
      [
        matrixAlternative("alpha-chat", "Alpha Chat", {
          e2ee: { status: "verified", value: true },
          hosting_region: { status: "unverified", value: null },
        }),
        matrixAlternative("zeta-chat", "Zeta Chat", {
          e2ee: { status: "unverified", value: null },
          hosting_region: { status: "not_applicable", value: null },
        }),
      ],
    ),
    error: null,
  };
}

function matrix(
  groups: CategoryMatrixApiResponse["data"]["groups"],
  alternatives: MatrixAlternative[] = [],
): CategoryMatrixApiResponse {
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

function loadedMatrix(
  category: CategoryId,
  result: CategoryMatrixLoadResult,
  language = "en",
): LoadedCategoryMatrixFixture {
  return { category, language, result };
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
    {
      id: "email",
      name: "Email",
      description: "Email providers",
      usGiants: [],
      emoji: "mail",
    },
    {
      id: "other",
      name: "Other",
      description: "Other tools",
      usGiants: [],
      emoji: "other",
    },
  ];

  return {
    alternatives: [
      browseAlternative("alpha-chat", "Alpha Chat", "messaging"),
      browseAlternative("zeta-chat", "Zeta Chat", "messaging"),
      browseAlternative("inbox-eu", "Inbox EU", "email"),
      browseAlternative("other-option", "Other Option", "other"),
    ],
    categories,
    deniedAlternatives: [],
    error: null,
    furtherReadingResources: [],
    landingCategoryGroups: [],
    loading: false,
    usVendors: [browseAlternative("whatsapp", "WhatsApp", "messaging")],
  };
}

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

function expectInOrder(html: string, labels: string[]): void {
  const indices = labels.map((label) => html.indexOf(label));

  for (let index = 0; index < labels.length; index += 1) {
    expect(
      indices[index],
      `${labels[index]} should be rendered`,
    ).toBeGreaterThanOrEqual(0);

    if (index > 0) {
      expect(
        indices[index],
        `${labels[index]} should render after ${labels[index - 1]}`,
      ).toBeGreaterThan(indices[index - 1]);
    }
  }
}

describe("browse matrix view mode", () => {
  it("offers matrix mode only for a single selected category with ready non-empty matrix data", async () => {
    await renderBrowsePage();
    expect(browseTestMocks.filterProps[0]?.matrixViewAvailable).toBe(false);

    await renderBrowsePage({ search: "category=messaging&category=email" });
    expect(browseTestMocks.filterProps[0]?.matrixViewAvailable).toBe(false);

    await renderBrowsePage({ search: "category=other" });
    expect(browseTestMocks.filterProps[0]?.matrixViewAvailable).toBe(false);

    await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", emptyMatrixResult()),
      search: "category=messaging",
    });
    expect(browseTestMocks.filterProps[0]?.matrixViewAvailable).toBe(false);

    await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix(
        "messaging",
        unavailableMatrixResult(),
      ),
      search: "category=messaging",
    });
    expect(browseTestMocks.filterProps[0]?.matrixViewAvailable).toBe(false);

    await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
      search: "category=messaging",
    });
    expect(browseTestMocks.filterProps[0]?.matrixViewAvailable).toBe(true);
  });

  it("renders matrix mode as product rows with grouped criterion columns instead of normal cards", async () => {
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
      search: "category=messaging",
      viewMode: "matrix",
    });

    expect(html).not.toContain('data-browse-test="result-card"');
    expect(html).toContain("<table");
    expect(html).toContain("Messaging comparison matrix");
    expect(html).toContain('tabindex="0"');
    // Group ribbon labels appear in <thead> before per-criterion column headers.
    expectInOrder(html, [
      "Privacy",
      "Portability",
      "End-to-end encryption",
      "Hosting region",
      "Privacy policy",
      "Data retention days",
      "Data export formats",
      "Support SLA",
    ]);
    // Alternative names appear as row-label headers (scope="row") in the
    // matrix order until the user changes the table sort.
    expect(html).toMatch(
      /<th[^>]*scope="row"[^>]*>[\s\S]*?Zeta Chat[\s\S]*?<\/th>/u,
    );
    expect(html).toMatch(
      /<th[^>]*scope="row"[^>]*>[\s\S]*?Alpha Chat[\s\S]*?<\/th>/u,
    );
    expectInOrder(html, ["Zeta Chat", "Alpha Chat"]);
    expect(html).toContain("Yes");
    expect(html).toContain("No");
    expect(html).toContain("EU hosted");
    expect(html).toContain('href="https://zeta-chat.example/privacy"');
    expect(html).not.toContain('href="javascript:alert(1)"');
    expect(html).toContain("javascript:alert(1)");
    expect(html).toContain("1,234");
    expect(html).toContain("CSV export");
    expect(html).toContain("JSON export");
    expect(html).toContain("Community support");
    expect(html).toContain("Unverified");
    expect(html).toContain("Not applicable");
    expect(html).not.toMatch(/needs-deeper-research|manual-human/iu);
  });

  it("hides matrix mode when every fact in the loaded matrix is unverified", async () => {
    await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix(
        "messaging",
        allUnverifiedMatrixResult(),
      ),
      search: "category=messaging",
    });
    expect(browseTestMocks.filterProps[0]?.matrixViewAvailable).toBe(false);
  });

  it("does not unlock matrix mode from Trust Score alone", async () => {
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix(
        "messaging",
        {
          status: "ready",
          matrix: matrix(
            [
              {
                id: "trust",
                label: "Trust",
                description: "Cross-category score from our vetting.",
                criteria: [
                  criterion("trust_score", "none", {
                    label: "Trust Score",
                    valueType: "number",
                    semantics: "beneficial",
                  }),
                ],
              },
              {
                id: "privacy",
                label: "Privacy",
                description: null,
                criteria: [
                  criterion("e2ee", "must_match", {
                    label: "End-to-end encryption",
                    valueType: "boolean",
                    semantics: "beneficial",
                  }),
                ],
              },
            ],
            [
              matrixAlternative("alpha-chat", "Alpha Chat", {
                trust_score: { status: "verified", value: 8.6 },
                e2ee: { status: "unverified", value: null },
              }),
            ],
          ),
          error: null,
        },
      ),
      search: "category=messaging",
      viewMode: "matrix",
    });

    expect(browseTestMocks.filterProps[0]?.matrixViewAvailable).toBe(false);
    expect(browseTestMocks.filterProps[0]?.viewMode).toBe("grid");
    expect(html).not.toContain("<table");
  });

  it("offers matrix mode as soon as at least one fact in the loaded matrix is verified", async () => {
    await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix(
        "messaging",
        mixedVerificationMatrixResult(),
      ),
      search: "category=messaging",
    });
    expect(browseTestMocks.filterProps[0]?.matrixViewAvailable).toBe(true);
  });

  it("falls back to the card grid when matrix mode is active but every fact is unverified", async () => {
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix(
        "messaging",
        allUnverifiedMatrixResult(),
      ),
      search: "category=messaging",
      viewMode: "matrix",
    });

    expect(browseTestMocks.filterProps[0]?.matrixViewAvailable).toBe(false);
    expect(browseTestMocks.filterProps[0]?.viewMode).toBe("grid");
    expect(html).not.toContain("<table");
  });

  it("hides matrix mode and falls back to grid when every fact is marked not_applicable", async () => {
    // A matrix that only contains not_applicable cells has no publicly
    // researched values to compare — the "first Matrix experience" rule
    // from #499 treats that as not-yet-ready just like all-unverified.
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix(
        "messaging",
        allNotApplicableMatrixResult(),
      ),
      search: "category=messaging",
      viewMode: "matrix",
    });

    expect(browseTestMocks.filterProps[0]?.matrixViewAvailable).toBe(false);
    expect(browseTestMocks.filterProps[0]?.viewMode).toBe("grid");
    expect(html).not.toContain("<table");
  });

  it("offers matrix mode when only a single fact across the whole category is verified", async () => {
    // Minimum-sparse case: one verified cell, every other cell is unverified
    // or not_applicable. The category-level gate must still unlock as soon
    // as any researched public value exists.
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix(
        "messaging",
        sparseVerifiedMatrixResult(),
      ),
      search: "category=messaging",
      viewMode: "matrix",
    });

    expect(browseTestMocks.filterProps[0]?.matrixViewAvailable).toBe(true);
    expect(browseTestMocks.filterProps[0]?.viewMode).toBe("grid");
    expect(html).toContain("<table");
  });

  it("renders boolean verified facts with a verdict color class, inline SVG icon, and localized Yes/No text", async () => {
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
      search: "category=messaging",
      viewMode: "matrix",
    });

    // Positive boolean cell carries both a tone class AND an inline SVG icon
    // AND localized "Yes" text — so a future "icon-only" or "text-only"
    // regression would still fail at least one of the assertions.
    expect(html).toMatch(/category-matrix-fact--positive[\s\S]{0,500}?<svg/u);
    expect(html).toMatch(/category-matrix-fact--positive[\s\S]{0,500}?Yes/u);
    // Same for false → negative class + cross icon + localized "No" text.
    expect(html).toMatch(/category-matrix-fact--negative[\s\S]{0,500}?<svg/u);
    expect(html).toMatch(/category-matrix-fact--negative[\s\S]{0,500}?No/u);
  });

  it("renders the Trust Score as the first matrix criterion with score-scale verdict colors", async () => {
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix(
        "messaging",
        {
          status: "ready",
          matrix: matrix(
            [
              {
                id: "trust",
                label: "Trust",
                description: "Cross-category score from our vetting.",
                criteria: [
                  criterion("trust_score", "none", {
                    label: "Trust Score",
                    valueType: "number",
                    semantics: "beneficial",
                  }),
                ],
              },
              {
                id: "privacy",
                label: "Privacy",
                description: null,
                criteria: [
                  criterion("e2ee", "must_match", {
                    label: "End-to-end encryption",
                    valueType: "boolean",
                    semantics: "beneficial",
                  }),
                ],
              },
            ],
            [
              matrixAlternative("alpha-chat", "Alpha Chat", {
                trust_score: { status: "verified", value: 8.6 },
                e2ee: { status: "verified", value: true },
              }),
              matrixAlternative("zeta-chat", "Zeta Chat", {
                trust_score: { status: "verified", value: 3.6 },
                e2ee: { status: "verified", value: false },
              }),
            ],
          ),
          error: null,
        },
      ),
      search: "category=messaging",
      viewMode: "matrix",
    });

    expect(html).toContain("Trust");
    expectInOrder(html, ["Trust Score", "End-to-end encryption"]);
    expect(html).toMatch(/category-matrix-fact--positive[\s\S]{0,500}?8\.6\/10/u);
    expect(html).toMatch(/category-matrix-fact--negative[\s\S]{0,500}?3\.6\/10/u);
  });

  it("renders table sort controls and clickable matrix product names", async () => {
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix(
        "messaging",
        {
          status: "ready",
          matrix: matrix(
            [
              {
                id: "trust",
                label: "Trust",
                description: null,
                criteria: [
                  criterion("trust_score", "none", {
                    label: "Trust Score",
                    valueType: "number",
                  }),
                ],
              },
              {
                id: "privacy",
                label: "Privacy",
                description: null,
                criteria: [
                  criterion("e2ee", "must_match", {
                    label: "End-to-end encryption",
                    valueType: "boolean",
                    semantics: "beneficial",
                  }),
                ],
              },
            ],
            [
              matrixAlternative("alpha-chat", "Alpha Chat", {
                trust_score: { status: "verified", value: 8.6 },
                e2ee: { status: "verified", value: true },
              }),
            ],
          ),
          error: null,
        },
      ),
      search: "category=messaging",
      viewMode: "matrix",
    });

    expect(html).toContain('aria-label="Sort by name ascending"');
    expect(html).toContain('aria-label="Sort by Trust Score descending"');
    expect(html).toMatch(
      /<button[^>]*class="category-matrix-view-alternative-open"[^>]*>[\s\S]*?Alpha Chat[\s\S]*?<\/button>/u,
    );
  });

  it("renders risk booleans from the user's perspective so false is positive and true is negative", async () => {
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix(
        "messaging",
        {
          status: "ready",
          matrix: matrix(
            [
              {
                id: "identity",
                label: "Identity",
                description: null,
                criteria: [
                  criterion("phone_number_required", "must_match", {
                    label: "Phone number required",
                    valueType: "boolean",
                    semantics: "risk",
                  }),
                ],
              },
            ],
            [
              matrixAlternative("alpha-chat", "Alpha Chat", {
                phone_number_required: { status: "verified", value: false },
              }),
              matrixAlternative("zeta-chat", "Zeta Chat", {
                phone_number_required: { status: "verified", value: true },
              }),
            ],
          ),
          error: null,
        },
      ),
      search: "category=messaging",
      viewMode: "matrix",
    });

    expect(html).toMatch(/category-matrix-fact--positive[\s\S]{0,500}?No/u);
    expect(html).toMatch(/category-matrix-fact--negative[\s\S]{0,500}?Yes/u);
  });

  it("places each group label in a header cell whose colSpan matches its criteria count", async () => {
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
      search: "category=messaging",
      viewMode: "matrix",
    });

    // Each group in the fixture has exactly 3 criteria → colSpan=3 ribbon.
    // Case-insensitive because React serializes the attribute as either
    // "colspan" or "colSpan" depending on the JSX casing used. The ribbon
    // must not be a row-group label (the old orientation) — it must span
    // the group's columns, so its scope is "col"/"colgroup" or omitted.
    expect(html).toMatch(
      /<th(?![^>]*scope="rowgroup")[^>]*colspan="3"[^>]*>[\s\S]*?Privacy/iu,
    );
    expect(html).toMatch(
      /<th(?![^>]*scope="rowgroup")[^>]*colspan="3"[^>]*>[\s\S]*?Portability/iu,
    );
    // The ribbon must precede the per-criterion column headers.
    expectInOrder(html, ["Privacy", "End-to-end encryption"]);
    expectInOrder(html, ["Portability", "Data retention days"]);
  });

  it("renders a mirrored top horizontal scrollbar above the matrix table", async () => {
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
      search: "category=messaging",
      viewMode: "matrix",
    });

    const topScrollbarIndex = html.indexOf(
      "category-matrix-view-scrollbar-top",
    );
    const tableScrollIndex = html.indexOf(
      'class="category-matrix-view-scroll"',
    );
    const tableIndex = html.indexOf("category-matrix-view-table");

    expect(topScrollbarIndex).toBeGreaterThan(-1);
    expect(html).toContain("category-matrix-view-scrollbar-spacer");
    expect(topScrollbarIndex).toBeLessThan(tableScrollIndex);
    expect(tableScrollIndex).toBeLessThan(tableIndex);
  });

  it("keeps column filter popovers usable when filtered tables are short", () => {
    const componentSource = readFileSync(
      new URL("../src/components/CategoryMatrixView.tsx", import.meta.url),
      "utf8",
    );
    const css = readFileSync(
      new URL("../src/index.css", import.meta.url),
      "utf8",
    );

    expect(componentSource).toContain("is-filter-popover-open");
    expect(css).toMatch(
      /\.category-matrix-view-scroll\.is-filter-popover-open\s*\{[\s\S]*?padding-bottom:/u,
    );
    expect(css).toMatch(
      /\.category-matrix-column-filter-popover\s*\{[\s\S]*?max-height:[\s\S]*?overflow-y:\s*auto/u,
    );
  });

  it("renders the localized product corner-cell label spanning both header rows in matrix mode", async () => {
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
      search: "category=messaging",
      viewMode: "matrix",
    });

    // Corner cell carries the localized "Product" label and spans both
    // header rows so the group ribbon and criterion row both anchor to it.
    expect(html).toMatch(
      /<th[^>]*rowspan="2"[^>]*>[\s\S]*?Product[\s\S]*?<\/th>/iu,
    );
    // The corner cell must precede the group ribbon labels in the table.
    expectInOrder(html, ["Product", "Privacy", "Portability"]);
  });

  it("does not mount the category-matrix-filter panel while matrix view is the active surface", async () => {
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
      search: "category=messaging",
      viewMode: "matrix",
    });

    // Matrix view replaces the filter panel as the primary comparison surface;
    // mounting both would duplicate criterion labels and leak the (hidden)
    // panel into the in-document order of the new group ribbon.
    expect(html).toContain("<table");
    expect(html).not.toContain("category-matrix-filter-panel");
  });

  it("does not mount the category-matrix-filter panel in grid mode even when matrix data is loaded", async () => {
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
      search: "category=messaging",
    });

    // The filter panel feature is removed — even with a ready matrix loaded
    // for the active category, grid mode must not render the panel surface.
    expect(html).not.toContain("<table");
    expect(html).not.toContain("category-matrix-filter-panel");
  });

  it("falls back to grid mode without mounting the filter panel when matrix is requested but unavailable", async () => {
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix(
        "messaging",
        allUnverifiedMatrixResult(),
      ),
      search: "category=messaging",
      viewMode: "matrix",
    });

    // viewMode=matrix is requested, but the all-unverified gate downgrades
    // the effective view to grid. The filter panel must stay removed.
    expect(browseTestMocks.filterProps[0]?.viewMode).toBe("grid");
    expect(html).not.toContain("<table");
    expect(html).not.toContain("category-matrix-filter-panel");
  });

  it("defines the new product corner-column copy in both browse locales", () => {
    // The corner cell label is a new user-facing string; pin both locales so
    // a future locale prune cannot silently regress the matrix header.
    expect(browseEn.matrixView).toMatchObject({ productColumn: "Product" });
    expect(browseDe.matrixView).toMatchObject({ productColumn: "Produkt" });
  });

  it("renders sanitized source links for verified matrix facts without audit quote text", async () => {
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
      search: "category=messaging",
      viewMode: "matrix",
    });

    expect(html).toContain(
      'href="https://zeta-chat.example/encryption-report"',
    );
    expect(html).toMatch(
      /<a[^>]*class="category-matrix-cell-source-link"[^>]*href="https:\/\/zeta-chat\.example\/encryption-report"[^>]*target="_blank"[^>]*rel="noopener noreferrer"[^>]*aria-label="Open source for Zeta Chat — End-to-end encryption"/u,
    );
    expect(html).not.toContain("Zeta encryption report");
    expect(html).not.toContain("Accessed 2026-05-24");
    expect(html).toMatch(
      /class="category-matrix-cell-source-link"[^>]*href="https:\/\/alpha-chat\.example\/security"[^>]*aria-label="Open source for Alpha Chat — End-to-end encryption"/u,
    );
    expect(html).not.toContain(
      "Internal verification quote for Zeta encryption must stay private.",
    );
    expect(html).not.toContain("Never show verifier raw response for Zeta.");
    expect(html).not.toContain("auditQuote");
    expect(html).not.toContain("raw_response");
  });

  it("does not expose source affordances for unsafe, unverified, or not-applicable matrix facts", async () => {
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
      search: "category=messaging",
      viewMode: "matrix",
    });

    expect(html).not.toContain('href="javascript:alert(99)"');
    expect(html).not.toContain("Unsafe Alpha hosting source");
    expect(html).not.toContain("Accessed 2026-05-23");
    expect(html).not.toContain(
      'href="https://zeta-chat.example/export-formats"',
    );
    expect(html).not.toContain("Zeta export format source");
    expect(html).not.toContain('href="https://alpha-chat.example/support-sla"');
    expect(html).not.toContain("Alpha support SLA source");
    expect(html).not.toContain(
      "Internal unverified export quote must not become public.",
    );
    expect(html).not.toContain(
      "Internal not-applicable support quote must not become public.",
    );
  });

  it("defines source metadata copy in both browse locales", () => {
    expect(browseEn.matrixView).toMatchObject({
      source: "Source",
      accessedDate: "Accessed {{date}}",
    });
    expect(browseDe.matrixView).toMatchObject({
      source: "Quelle",
      accessedDate: "Abgerufen am {{date}}",
    });
  });

  it("falls back to the card grid when matrix mode is active but unavailable", async () => {
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", emptyMatrixResult()),
      search: "category=messaging",
      viewMode: "matrix",
    });

    expect(browseTestMocks.filterProps[0]?.matrixViewAvailable).toBe(false);
    expect(browseTestMocks.filterProps[0]?.viewMode).toBe("grid");
    expect(html).not.toContain("<table");
    expect(html).toContain('data-browse-test="result-card"');
    expect(html).toContain('data-view-mode="grid"');
  });

  it("limits matrix rows to the alternatives visible after browse filters", async () => {
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix(
        "messaging",
        {
          status: "ready",
          matrix: matrix(
            readyMatrixResult().matrix?.data.groups ?? [],
            [
              ...(readyMatrixResult().matrix?.data.alternatives ?? []),
              matrixAlternative(
                "whatsapp",
                "WhatsApp",
                {
                  trust_score: { status: "verified", value: 3.6 },
                  e2ee: { status: "unverified", value: null },
                },
                {
                  status: "us",
                  country: "us",
                  category: null,
                },
              ),
            ],
          ),
          error: null,
        },
      ),
      search: "category=messaging&q=alpha",
      viewMode: "matrix",
    });

    expect(html).toContain("<table");
    // Filtered-out normal alternatives are hidden, but US benchmark rows stay
    // visible so the matrix can compare against the products being replaced.
    expect(html).not.toMatch(
      /<th[^>]*scope="row"[^>]*>[\s\S]*?Zeta Chat[\s\S]*?<\/th>/u,
    );
    expect(html).toMatch(
      /<th[^>]*scope="row"[^>]*>[\s\S]*?Alpha Chat[\s\S]*?<\/th>/u,
    );
    expect(html).toMatch(
      /<th[^>]*scope="row"[^>]*>[\s\S]*?WhatsApp[\s\S]*?<\/th>/u,
    );
    expect(html).not.toContain("Zeta Chat");
    expect(html).toContain("Alpha Chat");
    expect(html).toContain("WhatsApp");
    expect(html).toContain("EU hosted");
    expect(html).not.toContain("https://zeta-chat.example/privacy");
    expect(html).not.toContain("1,234");
    expect(html).not.toContain("Community support");
  });
});
