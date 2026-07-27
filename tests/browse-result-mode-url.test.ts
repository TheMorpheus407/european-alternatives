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
  MatrixFilterMode,
} from "../src/types";

type ResultMode = "browse" | "matrix";

type LoadedCategoryMatrixFixture = {
  category: CategoryId;
  language: string;
  result: CategoryMatrixLoadResult;
};

type CapturedFiltersProps = {
  matrixViewAvailable: boolean;
  viewMode: string | undefined;
  onFilterChange?: (
    filterType: string,
    values: string[] | boolean,
  ) => void;
};

type CapturedResultModeSwitchProps = {
  mode: ResultMode;
  matrixAvailable: boolean;
  onChange: (mode: ResultMode) => void;
};

type BrowseEffect = () => void | (() => void);

const browseTestMocks = vi.hoisted(() => ({
  catalog: null as unknown,
  effects: [] as BrowseEffect[],
  fetchCategoryMatrix: vi.fn(),
  filterProps: [] as CapturedFiltersProps[],
  language: "en",
  loadedCategoryMatrix: undefined as unknown,
  resultModeSwitchProps: [] as CapturedResultModeSwitchProps[],
  search: "",
  setSearchParams: vi.fn(),
  setViewMode: vi.fn(),
  viewMode: "grid" as "grid" | "list",
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
    "resultMode.label": "Show alternatives as",
    "resultMode.browse": "Browse",
    "resultMode.matrix": "Matrix",
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
      onFilterChange,
    }: {
      matrixViewAvailable?: boolean;
      viewMode?: string;
      onFilterChange?: (
        filterType: string,
        values: string[] | boolean,
      ) => void;
    }) => {
      browseTestMocks.filterProps.push({
        matrixViewAvailable: matrixViewAvailable === true,
        viewMode,
        onFilterChange,
      });

      return React.createElement(
        "div",
        {
          className: "distro-filters",
          "data-browse-test": "global-filters",
        },
        "Global Filters",
      );
    },
  };
});

vi.mock("../src/components/ResultModeSwitch", async () => {
  const React = await vi.importActual<typeof import("react")>("react");

  return {
    default: ({
      mode,
      matrixAvailable,
      onChange,
    }: {
      mode: ResultMode;
      matrixAvailable: boolean;
      onChange: (mode: ResultMode) => void;
    }) => {
      browseTestMocks.resultModeSwitchProps.push({
        mode,
        matrixAvailable,
        onChange,
      });

      if (!matrixAvailable) {
        return null;
      }

      return React.createElement(
        "div",
        {
          "data-browse-test": "result-mode-switch",
          "data-result-mode": mode,
        },
        "Result Mode Switch",
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
  browseTestMocks.resultModeSwitchProps = [];
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
    viewMode?: "grid" | "list";
  } = {},
): Promise<string> {
  browseTestMocks.effects = [];
  browseTestMocks.filterProps = [];
  browseTestMocks.resultModeSwitchProps = [];
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
  facts: Record<string, import("../src/types").MatrixFact>,
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
            }),
          ],
        },
      ],
      [
        matrixAlternative("alpha-chat", "Alpha Chat", {
          e2ee: { status: "verified", value: true },
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

describe("browse result-mode switch", () => {
  it("reads ?view=matrix from the URL and renders the matrix table on first paint", async () => {
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
      search: "category=messaging&view=matrix",
    });

    // URL is the source of truth — no React-state ramp-up needed for matrix.
    expect(html).toContain("<table");
    expect(html).toContain("Messaging comparison matrix");
    // ResultModeSwitch was mounted with mode=matrix because the URL asked
    // for it and the category is ready.
    const switchProps = browseTestMocks.resultModeSwitchProps.at(-1);
    expect(switchProps?.mode).toBe("matrix");
    expect(switchProps?.matrixAvailable).toBe(true);
  });

  it("silently falls back to browse when ?view=matrix is set but the category has no ready matrix", async () => {
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", emptyMatrixResult()),
      search: "category=messaging&view=matrix",
    });

    // Empty matrix → not available → switch must not render and the
    // effective surface must be the card grid (no <table>, no error UI).
    expect(html).not.toContain("<table");
    expect(html).toContain('data-browse-test="result-card"');
    expect(html).not.toContain('data-browse-test="result-mode-switch"');
    // The switch may still be mounted to evaluate availability, but it
    // must report matrixAvailable=false — which our mock interprets as
    // "render nothing", matching the real component's contract.
    const switchProps = browseTestMocks.resultModeSwitchProps.at(-1);
    if (switchProps) {
      expect(switchProps.matrixAvailable).toBe(false);
    }
  });

  it("defaults to browse mode when no view param is set and renders the switch when matrix is available", async () => {
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
      search: "category=messaging",
    });

    expect(html).not.toContain("<table");
    expect(html).toContain('data-browse-test="result-mode-switch"');
    expect(html).toContain('data-result-mode="browse"');
    const switchProps = browseTestMocks.resultModeSwitchProps.at(-1);
    expect(switchProps?.mode).toBe("browse");
    expect(switchProps?.matrixAvailable).toBe(true);
  });

  it("does not render the result-mode switch when matrix is not available for the current selection", async () => {
    // No category selected → matrixViewAvailable=false → no switch UI.
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
      search: "",
    });

    expect(html).not.toContain('data-browse-test="result-mode-switch"');
  });

  it("places the result-mode switch outside the .distro-filters container", async () => {
    // The issue's whole point: the switch is a first-class result-surface
    // control, not a Filters child. The DOM order is part of the contract
    // — the switch must not nest inside the .distro-filters subtree.
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
      search: "category=messaging",
    });

    const filtersMatch = html.match(
      /<div\b[^>]*class="distro-filters"[^>]*>([\s\S]*?)<\/div>/u,
    );
    expect(filtersMatch).not.toBeNull();
    expect(filtersMatch?.[1] ?? "").not.toContain(
      'data-browse-test="result-mode-switch"',
    );
    // And the switch is present somewhere in the page.
    expect(html).toContain('data-browse-test="result-mode-switch"');
  });

  it("writes ?view=matrix to the URL with replace=true when the switch onChange fires with 'matrix'", async () => {
    await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
      search: "category=messaging",
    });

    const switchProps = browseTestMocks.resultModeSwitchProps.at(-1);
    expect(switchProps).toBeDefined();
    browseTestMocks.setSearchParams.mockClear();
    switchProps?.onChange("matrix");

    expect(browseTestMocks.setSearchParams).toHaveBeenCalledTimes(1);
    const [paramsArg, optionsArg] =
      browseTestMocks.setSearchParams.mock.calls[0] ?? [];
    const params = paramsArg as URLSearchParams;
    expect(params.get("view")).toBe("matrix");
    // Existing query state must be preserved across the write.
    expect(params.getAll("category")).toEqual(["messaging"]);
    expect(optionsArg).toEqual({ replace: true });
  });

  it("removes the view param entirely when the switch onChange fires with 'browse'", async () => {
    await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
      search: "category=messaging&view=matrix",
    });

    const switchProps = browseTestMocks.resultModeSwitchProps.at(-1);
    expect(switchProps).toBeDefined();
    browseTestMocks.setSearchParams.mockClear();
    switchProps?.onChange("browse");

    expect(browseTestMocks.setSearchParams).toHaveBeenCalledTimes(1);
    const params = browseTestMocks.setSearchParams.mock
      .calls[0]?.[0] as URLSearchParams;
    // Clean URLs: browse is the default, so the param is dropped, not
    // written as ?view=browse.
    expect(params.has("view")).toBe(false);
    expect(params.getAll("category")).toEqual(["messaging"]);
  });

  it("preserves the view param when the category filter rewrite keeps the same single matrix category", async () => {
    // Regression guard for the `nextMatrixCategory !== matrixCategory` check
    // in handleFilterChange. A category-list rewrite that resolves to the
    // same matrix category (e.g. re-applying the current selection, or a
    // category-checkbox toggle that ends up where it started) must NOT
    // strand the user back in Browse — view=matrix must survive.
    await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
      search: "category=messaging&view=matrix",
    });

    const filtersProps = browseTestMocks.filterProps.at(-1);
    expect(filtersProps?.onFilterChange).toBeDefined();
    browseTestMocks.setSearchParams.mockClear();

    filtersProps?.onFilterChange?.("category", ["messaging"]);

    expect(browseTestMocks.setSearchParams).toHaveBeenCalledTimes(1);
    const params = browseTestMocks.setSearchParams.mock
      .calls[0]?.[0] as URLSearchParams;
    expect(params.get("view")).toBe("matrix");
    expect(params.getAll("category")).toEqual(["messaging"]);
  });

  it("drops the view param when the category set widens such that no single matrix category remains", async () => {
    // The matrixCategory derivation requires exactly one selected category.
    // Adding a second category collapses matrixCategory to null, so the
    // implementation's guard must treat that as a change and drop view —
    // otherwise the user would be stranded on a matrix surface that the
    // gate immediately refuses to render.
    await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
      search: "category=messaging&view=matrix",
    });

    const filtersProps = browseTestMocks.filterProps.at(-1);
    expect(filtersProps?.onFilterChange).toBeDefined();
    browseTestMocks.setSearchParams.mockClear();

    filtersProps?.onFilterChange?.("category", ["messaging", "email"]);

    expect(browseTestMocks.setSearchParams).toHaveBeenCalledTimes(1);
    const params = browseTestMocks.setSearchParams.mock
      .calls[0]?.[0] as URLSearchParams;
    expect(params.has("view")).toBe(false);
    expect(params.getAll("category")).toEqual(["messaging", "email"]);
  });

  it("drops the view param in the same history step when the category filter changes", async () => {
    await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
      search: "category=messaging&view=matrix",
    });

    const filtersProps = browseTestMocks.filterProps.at(-1);
    expect(filtersProps).toBeDefined();
    expect(filtersProps?.onFilterChange).toBeDefined();
    browseTestMocks.setSearchParams.mockClear();

    // Simulate the user switching from messaging to email. The previous
    // matrix category is no longer selected, so ?view=matrix would strand
    // the user — it must be dropped in the same setSearchParams call,
    // not in a separate render.
    filtersProps?.onFilterChange?.("category", ["email"]);

    expect(browseTestMocks.setSearchParams).toHaveBeenCalledTimes(1);
    const params = browseTestMocks.setSearchParams.mock
      .calls[0]?.[0] as URLSearchParams;
    expect(params.has("view")).toBe(false);
    expect(params.getAll("category")).toEqual(["email"]);
  });

  it("defines the new resultMode copy in both browse locales", () => {
    expect(browseEn.resultMode).toMatchObject({
      label: expect.any(String),
      browse: expect.any(String),
      matrix: expect.any(String),
    });
    expect(browseDe.resultMode).toMatchObject({
      label: expect.any(String),
      browse: expect.any(String),
      matrix: expect.any(String),
    });
  });

  it("removes the now-unused filters.matrixView copy from both browse locales", () => {
    // The matrix surface is no longer a Filters toggle; the old label
    // would silently misdescribe the new control if kept.
    expect((browseEn.filters as Record<string, unknown>).matrixView).toBeUndefined();
    expect((browseDe.filters as Record<string, unknown>).matrixView).toBeUndefined();
  });
});
