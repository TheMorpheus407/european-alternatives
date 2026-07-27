import { createElement } from "react";
import type { ComponentType, Dispatch, ReactNode, SetStateAction } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Alternative, Category, CategoryId } from "../src/types";

// --- Behavioral contract for issue #552 (self-hostable list-narrowing) ------
// The sibling suite `self-hostable-filter.test.ts` covers the render-observable
// `Filters` affordances (clear-all button + active badge) and i18n parity. It
// deliberately does NOT exercise the actual list-narrowing predicate, because
// that lives inline in `BrowsePage`'s `filteredAlternatives` memo behind local,
// non-URL filter state that a plain static render cannot toggle.
//
// This suite closes that gap. It reuses the established BrowsePage render
// harness pattern (renderToStaticMarkup + mocked children + a react useState
// mock, exactly as in browse-mode-morph.test.ts / browse-result-mode-url.test.ts)
// and adds the ability to flip the two boolean global filters ON. BrowsePage has
// exactly two `useState(false)` calls — `openSourceOnly` and `selfHostable` — so
// flipping every `false`-initialised boolean turns both on. By making every
// fixture entry `isOpenSource: true`, the `openSourceOnly` predicate becomes a
// no-op and the net, observable narrowing is purely the `selfHostable` filter:
//
//   if (selectedFilters.selfHostable) {
//     result = result.filter((alternative) => alternative.selfHostable);
//   }
//
// AlternativeCard is mocked to emit one `data-browse-test="result-card"` article
// per surviving alternative, so the exact set that passes the filter is
// render-observable.
// --------------------------------------------------------------------------

const browseTestMocks = vi.hoisted(() => ({
  catalog: null as unknown,
  effects: [] as Array<() => void | (() => void)>,
  forceBooleanFiltersOn: false,
  reducedMotion: false,
  search: "",
  setSearchParams: vi.fn(),
  setViewMode: vi.fn(),
  viewMode: "grid" as "grid" | "list",
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");

  return {
    ...actual,
    // Effects never run under renderToStaticMarkup anyway; capture them so the
    // catalog-matrix fetch effect can't fire a spurious update during render.
    useEffect: (effect: () => void | (() => void)) => {
      browseTestMocks.effects.push(effect);
    },
    useState: <State>(initialState: State | (() => State)) => {
      if (initialState === "grid") {
        return [
          browseTestMocks.viewMode as State,
          browseTestMocks.setViewMode as Dispatch<SetStateAction<State>>,
        ];
      }

      // BrowsePage's only two `useState(false)` calls are the `openSourceOnly`
      // and `selfHostable` global-filter toggles. Flip them both ON on demand;
      // fixtures keep `openSourceOnly` inert by being uniformly open-source.
      if (browseTestMocks.forceBooleanFiltersOn && initialState === false) {
        return [
          true as unknown as State,
          vi.fn() as Dispatch<SetStateAction<State>>,
        ];
      }

      return actual.useState(initialState);
    },
  };
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    i18n: { language: "en" },
    t: (key: string, values?: Record<string, string | number>) => {
      if (values == null) {
        return key;
      }
      return key.replace(/\{\{(\w+)\}\}/gu, (_match, name: string) =>
        String(values[name] ?? ""),
      );
    },
  }),
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
  fetchCategoryMatrix: vi.fn(() => new Promise(() => {})),
}));

vi.mock("../src/components/Filters", async () => {
  const React = await vi.importActual<typeof import("react")>("react");

  return {
    default: () =>
      React.createElement(
        "div",
        { "data-browse-test": "global-filters" },
        "Global Filters",
      ),
  };
});

vi.mock("../src/components/ResultModeSwitch", async () => {
  const React = await vi.importActual<typeof import("react")>("react");

  return {
    default: () => React.createElement(React.Fragment, null),
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

  const createMotionComponent =
    (tag: string) =>
    ({
      children,
      ...props
    }: Record<string, unknown> & { children?: ReactNode }) => {
      const motionOnly = new Set([
        "animate",
        "exit",
        "initial",
        "transition",
        "variants",
        "whileHover",
        "whileTap",
        "layout",
        "layoutId",
      ]);
      const domProps: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(props)) {
        if (motionOnly.has(key)) {
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
      { get: (_target, tag) => createMotionComponent(String(tag)) },
    ),
    AnimatePresence: passthrough,
    LayoutGroup: passthrough,
    MotionConfig: passthrough,
    useReducedMotion: () => browseTestMocks.reducedMotion,
  };
});

function browseAlternative(
  id: string,
  name: string,
  selfHostable: boolean | undefined,
): Alternative {
  const alternative: Alternative = {
    id,
    name,
    description: `${name} description`,
    website: `https://${id}.example`,
    country: "de",
    category: "messaging" as CategoryId,
    secondaryCategories: [],
    replacesUS: [],
    // Uniformly open-source so the `openSourceOnly` predicate (flipped ON
    // alongside `selfHostable`) removes nothing and the observed narrowing is
    // attributable solely to the self-hostable filter.
    isOpenSource: true,
    pricing: "free",
    tags: ["messaging"],
    trustScoreStatus: "ready",
    trustScore: 90,
  };

  if (selfHostable !== undefined) {
    alternative.selfHostable = selfHostable;
  }

  return alternative;
}

const SELF_HOSTED = browseAlternative("self-hosted-app", "Self Hosted App", true);
const CLOUD_ONLY = browseAlternative("cloud-only-app", "Cloud Only App", false);
// Field absent entirely — mirrors real catalog entries where `self_hostable`
// was never populated (`Alternative.selfHostable` is optional).
const UNKNOWN_HOST = browseAlternative(
  "unknown-host-app",
  "Unknown Host App",
  undefined,
);

function createCatalog() {
  const categories: Category[] = [
    {
      id: "messaging" as CategoryId,
      name: "Messaging",
      description: "Secure messaging",
      usGiants: [],
      emoji: "chat",
    },
  ];

  return {
    alternatives: [SELF_HOSTED, CLOUD_ONLY, UNKNOWN_HOST],
    categories,
    deniedAlternatives: [],
    error: null,
    furtherReadingResources: [],
    landingCategoryGroups: [],
    loading: false,
    usVendors: [],
  };
}

async function renderBrowsePage(): Promise<string> {
  const browseModule = (await import("../src/components/BrowsePage")) as {
    default: ComponentType;
  };
  return renderToStaticMarkup(createElement(browseModule.default));
}

function resultCardCount(html: string): number {
  return [...html.matchAll(/data-browse-test="result-card"/gu)].length;
}

beforeEach(() => {
  browseTestMocks.catalog = createCatalog();
  browseTestMocks.effects = [];
  browseTestMocks.forceBooleanFiltersOn = false;
  browseTestMocks.reducedMotion = false;
  browseTestMocks.search = "";
  browseTestMocks.setSearchParams.mockClear();
  browseTestMocks.setViewMode.mockClear();
  browseTestMocks.viewMode = "grid";
});

describe("BrowsePage — self-hostable filter narrows results (issue #552)", () => {
  it("renders every alternative when the self-hostable filter is OFF (baseline)", async () => {
    // Control: with no filter active, all three fixtures — self-hostable,
    // explicitly not self-hostable, and unpopulated — are visible. This proves
    // the narrowing seen in the next test is the filter's doing, not the setup.
    const html = await renderBrowsePage();

    expect(resultCardCount(html)).toBe(3);
    expect(html).toContain("Self Hosted App");
    expect(html).toContain("Cloud Only App");
    expect(html).toContain("Unknown Host App");
  });

  it("keeps only entries with a truthy selfHostable when the filter is ON", async () => {
    // Contract: activating the self-hostable filter must apply
    // `result.filter((a) => a.selfHostable)`, so ONLY the entry whose
    // `selfHostable` is true survives. The explicitly-false entry and the
    // entry whose field is absent (undefined -> falsy) are both excluded.
    browseTestMocks.forceBooleanFiltersOn = true;

    const html = await renderBrowsePage();

    expect(resultCardCount(html)).toBe(1);
    expect(html).toContain("Self Hosted App");
    expect(html).not.toContain("Cloud Only App");
    expect(html).not.toContain("Unknown Host App");
  });
});
