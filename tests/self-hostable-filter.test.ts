import { createElement } from "react";
import type { ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { describe, expect, it, vi } from "vitest";

import Filters from "../src/components/Filters";
import browseDe from "../src/i18n/locales/de/browse.json";
import browseEn from "../src/i18n/locales/en/browse.json";
import type { CardViewMode, SelectedFilters, SortBy } from "../src/types";

// --- Behavioral contract for issue #552 (self-hostable global filter) ------
// Issue #552 asks for new browse filters, including a "Self-hosted" deployment
// option. The `selfHostable` fact already exists on every catalog entry
// (`Alternative.selfHostable`, populated from `catalog_entries.self_hostable`
// and exposed by api/catalog/entries.php), so the concrete, data-backed slice
// is a cross-category "self-hostable" global browse filter that mirrors the
// existing `openSourceOnly` facet.
//
// The filter must be a first-class member of `SelectedFilters`, so the browse
// UI has to treat it like every other active filter: when it is the only
// active filter, `Filters` must show the "clear all" affordance and the active
// filter badge, and clearing filters must reset it. Those manifestations are
// rendered in the always-visible toolbar (unlike the filter checkboxes, which
// live inside a collapsible panel gated by internal component state that a
// static server render cannot open), so they are the render-observable
// behavioural contract for this slice.
// --------------------------------------------------------------------------

type SelectedFiltersForTest = SelectedFilters & { selfHostable?: boolean };

type FiltersPropsForTest = {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedFilters: SelectedFiltersForTest;
  onFilterChange: (filterType: string, values: string[] | boolean) => void;
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
    "browse:filters.clearSearch": "Clear search",
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
    "browse:filters.selfHostable": "Self-hostable",
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

const EMPTY_FILTERS: SelectedFiltersForTest = {
  category: [],
  country: [],
  pricing: [],
  openSourceOnly: false,
};

function renderFilters(
  overrides: Partial<SelectedFiltersForTest> = {},
): string {
  return renderToStaticMarkup(
    createElement(FiltersForTest, {
      searchTerm: "",
      onSearchChange: vi.fn(),
      selectedFilters: { ...EMPTY_FILTERS, ...overrides },
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

describe("Filters — self-hostable is a first-class active filter (issue #552)", () => {
  it("shows the clear-all affordance and active badge when self-hostable is the only active filter", () => {
    // Control: with no filter active, the clear-all button and badge are hidden.
    const noneActive = renderFilters();
    expect(noneActive).not.toContain('class="filters-clear"');
    expect(noneActive).not.toContain('class="filter-badge"');

    // Contract: activating ONLY the self-hostable filter must mark the browse
    // state as filtered — the clear-all button and the active-filter badge
    // appear. This fails until `selfHostable` is added to `SelectedFilters`
    // and folded into the component's `hasActiveFilters` calculation.
    const selfHostableActive = renderFilters({ selfHostable: true });
    expect(selfHostableActive).toContain('class="filters-clear"');
    expect(selfHostableActive).toContain('class="filter-badge"');
  });

  it("keeps the clear-all affordance behaviour consistent with the existing open-source filter", () => {
    // Sanity anchor: the existing `openSourceOnly` boolean already drives the
    // clear-all button. The new self-hostable filter must behave identically,
    // so both single-facet activations produce the clear-all button.
    const openSourceActive = renderFilters({ openSourceOnly: true });
    const selfHostableActive = renderFilters({ selfHostable: true });

    expect(openSourceActive).toContain('class="filters-clear"');
    expect(selfHostableActive).toContain('class="filters-clear"');
  });
});

// The render tests above mock react-i18next, so a missing real translation key
// would still pass there while shipping a raw key string to users. These parity
// checks read the actual locale JSON so a dropped or untranslated label — in
// either EN or DE — is caught (research §5: i18n is mandatory, EN + DE).
describe("Filters self-hostable label — i18n key parity (issue #552)", () => {
  const filtersEn = (browseEn as { filters: Record<string, unknown> }).filters;
  const filtersDe = (browseDe as { filters: Record<string, unknown> }).filters;

  it("defines the self-hostable filter label in both EN and DE", () => {
    expect(typeof filtersEn.selfHostable).toBe("string");
    expect((filtersEn.selfHostable as string).length).toBeGreaterThan(0);
    expect(typeof filtersDe.selfHostable).toBe("string");
    expect((filtersDe.selfHostable as string).length).toBeGreaterThan(0);
  });

  it("keeps EN and DE self-hostable labels distinct (DE is translated, not an EN copy)", () => {
    expect(filtersDe.selfHostable).not.toBe(filtersEn.selfHostable);
  });
});
