import { createElement } from "react";
import type { ComponentType, Dispatch, ReactNode, SetStateAction } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { beforeEach, describe, expect, it, vi } from "vitest";

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
  language: "en",
  loadedCategoryMatrix: undefined as unknown,
  reducedMotion: false,
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
    default: () =>
      React.createElement(
        "div",
        {
          className: "distro-filters",
          "data-browse-test": "global-filters",
        },
        "Global Filters",
      ),
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

// Extended framer-motion mock: exposes layoutId as data-morph-id so SSR
// markup is inspectable, and surfaces AnimatePresence / LayoutGroup /
// useReducedMotion (which the new transition implementation depends on).
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
    useReducedMotion: () => browseTestMocks.reducedMotion,
  };
});

beforeEach(() => {
  browseTestMocks.catalog = createBrowseCatalog();
  browseTestMocks.effects = [];
  browseTestMocks.fetchCategoryMatrix.mockReturnValue(new Promise(() => {}));
  browseTestMocks.language = "en";
  browseTestMocks.loadedCategoryMatrix = undefined;
  browseTestMocks.reducedMotion = false;
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
        matrixAlternative("zeta-chat", "Zeta Chat", {
          e2ee: { status: "verified", value: false },
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

describe("browse <-> matrix morph transition", () => {
  it("marks the surface region as morph-active when prefers-reduced-motion is off", async () => {
    // The signature transition orchestrator must exist as a discoverable
    // wrapper around the swap-able surface. Without it, a "morph" is just
    // an unceremonious content swap (the current behaviour).
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
      search: "category=messaging",
    });

    expect(html).toMatch(/data-morph="active"/u);
    // The surface itself still renders normally beneath the orchestrator.
    expect(html).toContain('data-browse-test="result-card"');
  });

  it("marks the surface region as morph-reduced under prefers-reduced-motion and still renders the active surface", async () => {
    // Reduced-motion is a hard requirement from the issue. The orchestrator
    // must consult useReducedMotion() and bypass the morph timeline —
    // expressed in the DOM as data-morph="reduced" so SR / dev tooling can
    // see the gate, and so we can verify it without a real animation runtime.
    browseTestMocks.reducedMotion = true;

    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
      search: "category=messaging",
    });

    expect(html).toMatch(/data-morph="reduced"/u);
    // No content disappears just because motion is off — the surface must
    // remain fully visible and interactive.
    expect(html).toContain('data-browse-test="result-card"');
    // The morph timeline is suppressed: no layoutId measurements should be
    // emitted on the surface, otherwise framer-motion would still FLIP-measure
    // on every render for users who explicitly asked for no motion.
    expect(html).not.toMatch(/data-morph-id="/u);
  });

  it("attaches a stable shared-identity marker per alternative in browse mode (full motion)", async () => {
    // The morph reads as "the same product changing shape" only if each
    // alternative carries a stable identity that survives the swap. Without
    // a per-alternative layoutId there is no FLIP source/destination pairing.
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
      search: "category=messaging",
    });

    expect(html).toMatch(/data-morph-id="alt-name-alpha-chat"/u);
    expect(html).toMatch(/data-morph-id="alt-name-zeta-chat"/u);
  });

  it("attaches the matching shared-identity marker on every matrix row label", async () => {
    // The destination side of the morph. The row label is the visual landing
    // pad for the card's product name, so it must carry the same layoutId.
    // If either side is missing the marker, the morph degrades to a fade.
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
      search: "category=messaging&view=matrix",
    });

    expect(html).toContain("<table");
    const tableMatch = html.match(/<table[\s\S]*?<\/table>/u);
    expect(tableMatch).not.toBeNull();
    const tableHtml = tableMatch?.[0] ?? "";
    // The markers live inside the matrix table — specifically on/near the
    // row-label cells, paired with the same id used by the card surface.
    expect(tableHtml).toMatch(/data-morph-id="alt-name-alpha-chat"/u);
    expect(tableHtml).toMatch(/data-morph-id="alt-name-zeta-chat"/u);
  });

  it("suppresses matrix row-label markers under prefers-reduced-motion", async () => {
    // Symmetric to the browse-side suppression: when the user opted out of
    // motion, BrowsePage must propagate reducedMotion through to
    // CategoryMatrixView so the destination side of the morph also stops
    // emitting layout markers. Without this, reduced-motion users would
    // still pay the FLIP-measurement cost on every matrix render.
    browseTestMocks.reducedMotion = true;

    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
      search: "category=messaging&view=matrix",
    });

    // The matrix still renders — reduced motion is about suppressing the
    // morph timeline, not the comparison surface itself.
    expect(html).toContain("<table");
    expect(html).toMatch(/data-morph="reduced"/u);
    // And no shared-identity markers anywhere, including the matrix
    // row labels.
    expect(html).not.toMatch(/data-morph-id="/u);
  });

  it("renders the empty-results surface inside the morph orchestrator", async () => {
    // When a filter narrows results down to zero, the empty-state surface
    // still lives inside the orchestrator so the morph region stays a single
    // discoverable wrapper. If a future refactor pulls the empty branch
    // outside the orchestrator, the data-morph marker would disappear for
    // empty categories and tooling/SR consumers would lose the gate.
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
      // category=other has no alternatives in the catalogue, so the filtered
      // result set is empty.
      search: "category=other",
    });

    expect(html).toMatch(/data-morph="active"/u);
    expect(html).toContain("no-results");
    // No result cards in the empty surface.
    expect(html).not.toContain('data-browse-test="result-card"');
  });

  it("emits --cell-row / --cell-col style custom properties on matrix cells (staggered sweep contract)", async () => {
    // The staggered cell sweep is driven by CSS keyframes consuming
    // per-cell custom properties — one compositor timeline for hundreds
    // of cells, instead of hundreds of JS-driven animation tracks
    // (forbidden by tests/csp-source-safety.test.ts). The contract at
    // the SSR layer is that every <td> emits both custom properties.
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
      search: "category=messaging&view=matrix",
    });

    expect(html).toContain("<table");
    // At least one td carries --cell-row and --cell-col inline style props.
    expect(html).toMatch(/<td[^>]*style="[^"]*--cell-row:\s*\d+/u);
    expect(html).toMatch(/<td[^>]*style="[^"]*--cell-col:\s*\d+/u);
  });

  it("wraps the surface region in a .browse-morph-region container so the CSS keyframes resolve", async () => {
    // The animation rules in src/index.css are scoped under
    // `.browse-morph-region[data-morph="active"]`. The data-morph attribute
    // is already pinned, but if the className got renamed or dropped, every
    // CSS animation would silently stop firing while data-morph still
    // pretended the morph was active. Pin both halves of the selector.
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
      search: "category=messaging",
    });

    expect(html).toMatch(/class="[^"]*\bbrowse-morph-region\b/u);
  });

  it("tags the matrix <thead> with category-matrix-view-head so the header animations scope correctly", async () => {
    // The group-ribbon and criterion-row animations land at 280ms / 340ms
    // delays so the structure visibly forms after the cell sweep starts.
    // Both rules in src/index.css target
    // `.category-matrix-view-head .category-matrix-view-group-row > th`
    // and `... .category-matrix-view-criterion-row > th`. Without the
    // category-matrix-view-head class on <thead>, neither selector
    // matches and the "headers arrive last" choreography disappears
    // (regressing the issue's acceptance criterion).
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
      search: "category=messaging&view=matrix",
    });

    expect(html).toContain("<table");
    expect(html).toMatch(
      /<thead[^>]*class="[^"]*\bcategory-matrix-view-head\b[^"]*"[^>]*>/u,
    );
  });

  it("emits --cell-row on every matrix row-label so its staggered entry sequences per row", async () => {
    // The row-label rule in src/index.css uses
    // `animation-delay: calc(var(--cell-row, 0) * 60ms)` on
    // `.category-matrix-view-alternative-label`. Without an inline
    // --cell-row custom property on each <th scope="row">, every row
    // label resolves to delay 0 and the per-row cascade collapses into a
    // single sync arrival. The existing td-only test does not catch
    // that regression because td cells get their own --cell-row.
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
      search: "category=messaging&view=matrix",
    });

    const rowLabelRegex =
      /<th[^>]*class="[^"]*\bcategory-matrix-view-alternative-label\b[^"]*"[^>]*style="[^"]*--cell-row:\s*\d+/gu;
    const rowLabelMatches = html.match(rowLabelRegex);
    expect(rowLabelMatches).not.toBeNull();
    // readyMatrixResult() defines two product rows (alpha-chat + zeta-chat),
    // so both row labels must carry --cell-row.
    expect(rowLabelMatches?.length ?? 0).toBeGreaterThanOrEqual(2);
  });

  it("propagates the morph orchestrator and per-card shared identity to list-view browse mode", async () => {
    // The issue explicitly calls out "Support both grid and list Browse
    // layouts". The existing browse-side morph-id test only renders grid
    // mode. A future refactor that only wraps the grid branch in the
    // morph surface would silently degrade list mode back to a plain
    // content swap.
    const html = await renderBrowsePage({
      loadedCategoryMatrix: loadedMatrix("messaging", readyMatrixResult()),
      search: "category=messaging",
      viewMode: "list",
    });

    expect(html).toMatch(/data-morph="active"/u);
    expect(html).toMatch(/class="[^"]*\blist-view\b/u);
    // Shared-identity markers still ride on the per-card wrappers in
    // list mode — without them the morph degrades to a fade in list view.
    expect(html).toMatch(/data-morph-id="alt-name-alpha-chat"/u);
    expect(html).toMatch(/data-morph-id="alt-name-zeta-chat"/u);
    expect(html).toContain('data-browse-test="result-card"');
  });
});
