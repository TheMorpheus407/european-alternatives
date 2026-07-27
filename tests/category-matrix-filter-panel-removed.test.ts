import { existsSync, readFileSync } from "node:fs";
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
  browseTestMocks.search = options.search ?? "";
  browseTestMocks.viewMode = options.viewMode ?? "grid";

  const browseModule = (await import("../src/components/BrowsePage")) as {
    default: ComponentType;
  };

  return renderToStaticMarkup(createElement(browseModule.default));
}

function criterion(
  id: string,
  overrides: Partial<MatrixCriterion> = {},
): MatrixCriterion {
  return {
    id,
    label: overrides.label ?? id,
    helpText: overrides.helpText ?? null,
    valueType: overrides.valueType ?? "boolean",
    semantics: overrides.semantics ?? "informational",
    filterMode: overrides.filterMode ?? "must_match",
    options: overrides.options ?? [],
  };
}

function readyMatrixResult(): CategoryMatrixLoadResult {
  const groups = [
    {
      id: "privacy",
      label: "Privacy",
      description: null,
      criteria: [criterion("e2ee", { label: "End-to-end encryption" })],
    },
  ];
  const alternatives: MatrixAlternative[] = [
    {
      id: "alpha-chat",
      name: "Alpha Chat",
      website: "https://alpha-chat.example",
      logo: null,
      country: "de",
      category: "messaging",
      secondaryCategories: [],
      facts: {
        e2ee: { status: "verified", value: true } as MatrixFact,
      },
    },
    {
      id: "zeta-chat",
      name: "Zeta Chat",
      website: "https://zeta-chat.example",
      logo: null,
      country: "de",
      category: "messaging",
      secondaryCategories: [],
      facts: {
        e2ee: { status: "verified", value: false } as MatrixFact,
      },
    },
  ];
  const matrix: CategoryMatrixApiResponse = {
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
      groupCount: 1,
      criterionCount: 1,
      alternativeCount: alternatives.length,
    },
  };

  return { status: "ready", matrix, error: null };
}

function loadingMatrixResult(): CategoryMatrixLoadResult {
  return { status: "loading", matrix: null, error: null };
}

function errorMatrixResult(): CategoryMatrixLoadResult {
  return {
    status: "unavailable",
    matrix: null,
    error: {
      code: "network_error",
      message: "Could not load matrix.",
      httpStatus: 500,
    },
  };
}

function emptyMatrixResult(): CategoryMatrixLoadResult {
  const matrix: CategoryMatrixApiResponse = {
    data: {
      category: {
        id: "messaging",
        name: "Messaging",
        description: "Secure messaging and chat apps",
        emoji: "chat",
      },
      groups: [],
      alternatives: [],
    },
    meta: {
      category: "messaging",
      locale: "en",
      groupCount: 0,
      criterionCount: 0,
      alternativeCount: 0,
    },
  };

  return { status: "ready", matrix, error: null };
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
    usVendors: [],
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

describe("category matrix filter panel removal — public browse rendering", () => {
  it.each([
    {
      name: "no category selected (no matrix loaded)",
      search: "",
      loadedCategoryMatrix: undefined as LoadedCategoryMatrixFixture | undefined,
    },
    {
      name: "multiple categories selected",
      search: "category=messaging&category=email",
      loadedCategoryMatrix: undefined as LoadedCategoryMatrixFixture | undefined,
    },
    {
      name: "the 'other' bucket is selected",
      search: "category=other",
      loadedCategoryMatrix: undefined as LoadedCategoryMatrixFixture | undefined,
    },
    {
      name: "single category — loading state",
      search: "category=messaging",
      loadedCategoryMatrix: loadedMatrix("messaging", loadingMatrixResult()),
    },
    {
      name: "single category — error state",
      search: "category=messaging",
      loadedCategoryMatrix: loadedMatrix("messaging", errorMatrixResult()),
    },
    {
      name: "single category — empty matrix",
      search: "category=messaging",
      loadedCategoryMatrix: loadedMatrix("messaging", emptyMatrixResult()),
    },
    {
      name: "single category — ready matrix",
      search: "category=messaging",
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
    },
  ])(
    "never renders the category-matrix-filter panel ($name)",
    async ({ search, loadedCategoryMatrix }) => {
      const html = await renderBrowsePage({
        loadedCategoryMatrix,
        search,
      });

      // No panel markup of any kind — not the wrapper, not a status section,
      // not a single helper class. Hides idle/loading/error/empty/ready alike.
      expect(html).not.toMatch(/category-matrix-filter[-\s"']/u);
      // Translation strings used only by the panel must not leak into the DOM
      // (would also catch a stub render that emitted the i18n key as text).
      expect(html).not.toContain("Category fit filters");
      expect(html).not.toContain("Loading category criteria");
      expect(html).not.toContain("Category criteria could not be loaded");
    },
  );

  it("preserves matrix view availability for a single category with a ready matrix", async () => {
    await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
      search: "category=messaging",
    });

    // The matrix data load (separate from the removed filter panel) must keep
    // gating matrixViewAvailable so the Matrix toggle in <Filters> still works.
    expect(browseTestMocks.filterProps[0]?.matrixViewAvailable).toBe(true);
  });

  it("does not shrink browse results from any stale matrix-fit selection state", async () => {
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
      search: "category=messaging",
    });

    // Both messaging alternatives must appear regardless of any matrix facts
    // (one has e2ee=true, the other e2ee=false). If the matrix-fit pipeline
    // is still wired up and silently activates with non-empty selections, one
    // of these would disappear.
    expect(html).toContain("Alpha Chat");
    expect(html).toContain("Zeta Chat");
    expect(html).not.toContain("Inbox EU");
    expect(html).not.toContain("Other Option");
  });
});

describe("category matrix filter panel removal — repo contract", () => {
  it("removes the panel component and its helper module from the source tree", () => {
    const panelPath = new URL(
      "../src/components/CategoryMatrixFilterPanel.tsx",
      import.meta.url,
    ).pathname;
    const helperPath = new URL(
      "../src/utils/categoryMatrixFilters.ts",
      import.meta.url,
    ).pathname;

    expect(existsSync(panelPath)).toBe(false);
    expect(existsSync(helperPath)).toBe(false);
  });

  it("removes all panel-only references from BrowsePage", () => {
    const browsePageSource = readFileSync(
      new URL("../src/components/BrowsePage.tsx", import.meta.url),
      "utf8",
    );

    expect(browsePageSource).not.toMatch(/CategoryMatrixFilterPanel/u);
    expect(browsePageSource).not.toMatch(/categoryMatrixFilters/u);
    expect(browsePageSource).not.toMatch(/MatrixFilterSelections/u);
    expect(browsePageSource).not.toMatch(/matrixAlternativeMatchesFilters/u);
    expect(browsePageSource).not.toMatch(/hasActiveMatrixFilters/u);
    expect(browsePageSource).not.toMatch(/INACTIVE_MATRIX_FILTER_CATEGORY/u);
  });

  it("removes the panel CSS section from index.css", () => {
    const css = readFileSync(
      new URL("../src/index.css", import.meta.url),
      "utf8",
    );

    expect(css).not.toContain("category-matrix-filter-");
  });

  it("drops the matrixFilters locale block from both browse bundles", () => {
    expect(browseEn).not.toHaveProperty("matrixFilters");
    expect(browseDe).not.toHaveProperty("matrixFilters");
    // The Matrix view block must survive — it is a separate, kept feature.
    expect(browseEn).toHaveProperty("matrixView");
    expect(browseDe).toHaveProperty("matrixView");
  });
});
