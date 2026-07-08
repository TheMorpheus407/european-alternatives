import { createElement } from "react";
import type { ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { describe, expect, it, vi } from "vitest";

import Filters from "../src/components/Filters";
import browseDe from "../src/i18n/locales/de/browse.json";
import browseEn from "../src/i18n/locales/en/browse.json";
import type { CardViewMode, PenaltyTier, SelectedFilters, SortBy } from "../src/types";

// --- Behavioral contract for issue #550 (request 3) -----------------------
// The trust-score breakdown dimensions must be usable for sorting in the list
// view. The sort dropdown must therefore offer a sort option for each of the
// four trust dimensions (Security / Governance / Reliability / Contract) in
// addition to the existing trust-score / name / country / category options.
// --------------------------------------------------------------------------

type FiltersPropsForTest = {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedFilters: SelectedFilters;
  onFilterChange: (
    filterType: keyof SelectedFilters,
    values: string[] | boolean,
  ) => void;
  onClearAll: () => void;
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
  viewMode: CardViewMode;
  onViewModeChange: (mode: CardViewMode) => void;
  totalCount: number;
  filteredCount: number;
  matrixViewAvailable?: boolean;
};

vi.mock("../src/contexts/CatalogContext", () => ({
  useCatalog: () => ({
    alternatives: [{ id: "primary-chat", country: "de" }],
    categories: [
      {
        id: "messaging",
        name: "Messaging",
        description: "Secure messaging",
        usGiants: [],
        emoji: "chat",
      },
    ],
  }),
}));

vi.mock("react-i18next", () => {
  const translations: Record<string, string> = {
    "browse:filters.searchPlaceholder": "Search alternatives...",
    "browse:filters.searchLabel": "Search alternatives",
    "browse:filters.count": "{{filtered}} of {{total}} alternatives",
    "browse:filters.sortBy": "Sort by",
    "browse:filters.sortTrustScore": "Trust score",
    "browse:filters.sortName": "Name",
    "browse:filters.sortCountry": "Country",
    "browse:filters.sortCategory": "Category",
    "browse:filters.gridView": "Grid view",
    "browse:filters.listView": "List view",
    "browse:filters.filters": "Filters",
    "browse:filters.clearAll": "Clear all filters",
  };

  return {
    useTranslation: () => ({
      t: (key: string, values?: Record<string, string | number>) => {
        const template = translations[key] ?? key;
        return template.replace(/\{\{(\w+)\}\}/gu, (_match, name: string) =>
          String(values?.[name] ?? ""),
        );
      },
    }),
  };
});

vi.mock("framer-motion", async () => {
  const React = await vi.importActual<typeof import("react")>("react");

  return {
    AnimatePresence: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    motion: {
      div: ({
        children,
        ...props
      }: Record<string, unknown> & { children?: React.ReactNode }) =>
        React.createElement("div", props, children),
    },
  };
});

const FiltersForTest = Filters as unknown as ComponentType<FiltersPropsForTest>;

function renderFilters(): string {
  return renderToStaticMarkup(
    createElement(FiltersForTest, {
      searchTerm: "",
      onSearchChange: vi.fn(),
      selectedFilters: {
        category: [],
        country: [],
        pricing: [],
        openSourceOnly: false,
      },
      onFilterChange: vi.fn(),
      onClearAll: vi.fn(),
      sortBy: "trustScore",
      onSortChange: vi.fn(),
      viewMode: "list",
      onViewModeChange: vi.fn(),
      totalCount: 1,
      filteredCount: 1,
    }),
  );
}

function sortSelectMarkup(html: string): string {
  const select = html.match(
    /<select\b(?=[^>]*aria-label="Sort by")[^>]*>([\s\S]*?)<\/select>/u,
  )?.[1];
  expect(select).toBeDefined();
  return select ?? "";
}

const DIMENSIONS: PenaltyTier[] = [
  "security",
  "governance",
  "reliability",
  "contract",
];

describe("Filters sort dropdown — per-dimension sorting (issue #550)", () => {
  it("offers a sort option for each of the four trust dimensions", () => {
    const select = sortSelectMarkup(renderFilters());

    // Each dimension must be selectable as a sort key. The option's value
    // encodes which dimension it sorts by, so the tier name appears in the
    // value attribute regardless of the exact naming convention chosen
    // (e.g. value="security" or value="dim:security").
    for (const tier of DIMENSIONS) {
      const optionForTier = new RegExp(
        `<option\\b[^>]*value="[^"]*${tier}[^"]*"`,
        "u",
      );
      expect(select).toMatch(optionForTier);
    }
  });

  it("keeps the existing trust-score sort option alongside the dimension options", () => {
    const select = sortSelectMarkup(renderFilters());

    expect(select).toContain('value="trustScore"');
    expect(select).toContain('value="name"');
  });
});

// The render test above mocks react-i18next, so a missing real translation key
// would still pass there while shipping the raw key string (e.g. the literal
// "browse:filters.sortSecurity") to users. These parity checks read the actual
// locale JSON so a dropped key — in either EN or DE — is caught (research §5).
describe("Filters per-dimension sort labels — i18n key parity (issue #550)", () => {
  const filtersEn = (browseEn as { filters: Record<string, unknown> }).filters;
  const filtersDe = (browseDe as { filters: Record<string, unknown> }).filters;

  const SORT_KEYS = [
    "sortSecurity",
    "sortGovernance",
    "sortReliability",
    "sortContract",
  ];

  it("defines every new dimension sort label in both EN and DE", () => {
    for (const key of SORT_KEYS) {
      expect(typeof filtersEn[key]).toBe("string");
      expect((filtersEn[key] as string).length).toBeGreaterThan(0);
      expect(typeof filtersDe[key]).toBe("string");
      expect((filtersDe[key] as string).length).toBeGreaterThan(0);
    }
  });

  it("keeps EN and DE labels distinct (DE is translated, not an EN copy)", () => {
    // Each new key must exist in both locales with a locale-specific value; an
    // accidental copy of the English string into de/browse.json is a parity bug.
    for (const key of SORT_KEYS) {
      expect(filtersDe[key]).not.toBe(filtersEn[key]);
    }
  });
});
