import {
  Children,
  createElement,
  isValidElement,
  type Dispatch,
  type ReactElement,
  type ReactNode,
  type SetStateAction,
} from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { beforeEach, describe, expect, it, vi } from "vitest";

import LandingPage from "../src/components/LandingPage";
import landingDe from "../src/i18n/locales/de/landing.json";
import landingEn from "../src/i18n/locales/en/landing.json";
import { buildBrowseSearchPath } from "../src/utils/browseSearch";

const landingSearchMocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  searchTerm: "",
  setSearchTerm: vi.fn(),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");

  return {
    ...actual,
    useState: <State,>(initialState: State | (() => State)) => {
      const initialValue =
        typeof initialState === "function"
          ? (initialState as () => State)()
          : initialState;
      const value =
        initialValue === ""
          ? (landingSearchMocks.searchTerm as State)
          : initialValue;

      return [
        value,
        landingSearchMocks.setSearchTerm as Dispatch<SetStateAction<State>>,
      ];
    },
  };
});

vi.mock("react-router", async () => {
  const React = await vi.importActual<typeof import("react")>("react");

  return {
    Link: ({
      children,
      to,
      ...props
    }: {
      children?: ReactNode;
      to: string;
      [key: string]: unknown;
    }) => React.createElement("a", { ...props, href: to }, children),
    useNavigate: () => landingSearchMocks.navigate,
    useParams: () => ({ lang: "de" }),
  };
});

vi.mock("react-i18next", () => {
  const translations: Record<string, string> = {
    "landing:search.label": "Alternativenkatalog durchsuchen",
    "landing:search.placeholder": "Alternativen suchen...",
    "landing:search.submit": "Suchen",
    "landing:search.hint":
      "Suche nach Alternative, US-Dienst oder Stichwort.",
  };

  return {
    useTranslation: () => ({
      t: (key: string) => translations[key] ?? key,
    }),
  };
});

vi.mock("../src/contexts/CatalogContext", () => ({
  useCatalog: () => ({
    alternatives: [],
    categories: [],
    landingCategoryGroups: [],
    deniedAlternatives: [],
    loading: false,
    error: null,
  }),
}));

vi.mock("framer-motion", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  const motionProps = new Set([
    "animate",
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
      const domProps = Object.fromEntries(
        Object.entries(props).filter(([key]) => !motionProps.has(key)),
      );
      return React.createElement(tag, domProps, children);
    };

  return {
    motion: new Proxy(
      {},
      {
        get: (_target, tag) => createMotionComponent(String(tag)),
      },
    ),
  };
});

function findElement(
  node: ReactNode,
  predicate: (element: ReactElement<Record<string, unknown>>) => boolean,
): ReactElement<Record<string, unknown>> | null {
  if (!isValidElement<Record<string, unknown>>(node)) {
    return null;
  }

  if (predicate(node)) {
    return node;
  }

  for (const child of Children.toArray(node.props.children)) {
    const match = findElement(child, predicate);
    if (match) {
      return match;
    }
  }

  return null;
}

beforeEach(() => {
  landingSearchMocks.navigate.mockReset();
  landingSearchMocks.searchTerm = "";
  landingSearchMocks.setSearchTerm.mockReset();
});

describe("landing-page catalogue search (issue #613)", () => {
  it("renders an accessible search landmark with an associated hint and submit action", () => {
    const markup = renderToStaticMarkup(createElement(LandingPage));

    expect(markup).toContain(
      'class="landing-search" role="search" aria-label="Alternativenkatalog durchsuchen"',
    );
    expect(markup).toContain('action="/de/browse" method="get"');
    expect(markup).toMatch(
      /<label[^>]*for="landing-catalog-search"[^>]*>Alternativenkatalog durchsuchen<\/label>/u,
    );
    const input = markup.match(
      /<input[^>]*id="landing-catalog-search"[^>]*>/u,
    )?.[0];
    expect(input).toContain('name="q"');
    expect(input).toContain('type="search"');
    expect(input).toContain('aria-describedby="landing-search-hint"');
    expect(markup).toContain(
      '<button class="landing-search-submit" type="submit">Suchen</button>',
    );
    expect(markup).toContain(
      '<p id="landing-search-hint" class="landing-search-hint">Suche nach Alternative, US-Dienst oder Stichwort.</p>',
    );
  });

  it("submits a trimmed, URL-encoded query to the localized browse page", () => {
    landingSearchMocks.searchTerm = "  Google Drive & Docs  ";
    const tree = LandingPage();
    const form = findElement(tree, (element) => element.type === "form");
    const preventDefault = vi.fn();

    expect(form).not.toBeNull();
    const onSubmit = form?.props.onSubmit as
      | ((event: { preventDefault: () => void }) => void)
      | undefined;
    expect(onSubmit).toBeTypeOf("function");
    onSubmit?.({ preventDefault });

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(landingSearchMocks.navigate).toHaveBeenCalledWith(
      "/de/browse?q=Google+Drive+%26+Docs",
    );
  });
});

describe("landing-page browse search URL", () => {
  it("uses the existing q query parameter and trims user input", () => {
    expect(buildBrowseSearchPath("en", "  Proton Mail  ")).toBe(
      "/en/browse?q=Proton+Mail",
    );
  });

  it("opens the full browse page when the query is blank", () => {
    expect(buildBrowseSearchPath("de", " \t ")).toBe("/de/browse");
  });
});

describe("landing-page search translations", () => {
  const requiredKeys = ["label", "placeholder", "submit", "hint"] as const;

  it("ships complete, localized English and German copy", () => {
    for (const key of requiredKeys) {
      expect(landingEn.search[key]).toBeTruthy();
      expect(landingDe.search[key]).toBeTruthy();
      expect(landingDe.search[key]).not.toBe(landingEn.search[key]);
    }
  });
});
