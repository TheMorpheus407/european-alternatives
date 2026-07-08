import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  applyMatrixColumnFilters,
  matrixFactMatchesColumnFilter,
  upsertMatrixColumnFilter,
  withoutMatrixColumnFilter,
} from "../utils/categoryMatrixColumnFilters";
import type {
  MatrixColumnFilter,
  MatrixColumnFilterStatus,
} from "../utils/categoryMatrixColumnFilters";
import { sanitizeHref } from "../utils/sanitizeHref";
import CategoryMatrixToolbar, {
  type MatrixDensity,
} from "./CategoryMatrixToolbar";
import type {
  CategoryMatrixApiResponse,
  MatrixCriterion,
  MatrixCriterionOption,
  MatrixDisplayTone,
  MatrixFact,
  MatrixFactValue,
  MatrixGroup,
} from "../types";

type TranslateFn = ReturnType<typeof useTranslation<"browse">>["t"];

interface CategoryMatrixViewProps {
  matrix: CategoryMatrixApiResponse;
  visibleAlternativeIds?: ReadonlySet<string>;
  onAlternativeOpen?: (alternativeId: string) => void;
  reducedMotion?: boolean;
}

const UNVERIFIED_FACT: MatrixFact = {
  status: "unverified",
  value: null,
};

type MatrixSortKey = "name" | "trust_score";
type MatrixSortDirection = "asc" | "desc";

interface MatrixSortState {
  key: MatrixSortKey | null;
  direction: MatrixSortDirection;
}

function effectiveFactKey(fact: MatrixFact): string {
  if (fact.status === "unverified") {
    return "u";
  }
  if (fact.status === "not_applicable") {
    return "na";
  }
  const value = fact.value;
  if (value === null) {
    return "v:null";
  }
  if (Array.isArray(value)) {
    const sorted = [...value].sort();
    return `v:arr:${JSON.stringify(sorted)}`;
  }
  return `v:${typeof value}:${JSON.stringify(value)}`;
}

function cellCustomProps(rowIndex: number, colIndex: number): CSSProperties {
  return {
    ["--cell-row" as never]: rowIndex,
    ["--cell-col" as never]: colIndex,
  };
}

function sortMatrixAlternatives(
  alternatives: CategoryMatrixApiResponse["data"]["alternatives"],
  sortState: MatrixSortState,
): CategoryMatrixApiResponse["data"]["alternatives"] {
  if (sortState.key === null) {
    return alternatives;
  }

  return [...alternatives].sort((left, right) =>
    compareMatrixAlternatives(left, right, sortState),
  );
}

function compareMatrixAlternatives(
  left: CategoryMatrixApiResponse["data"]["alternatives"][number],
  right: CategoryMatrixApiResponse["data"]["alternatives"][number],
  sortState: MatrixSortState,
): number {
  const directionMultiplier = sortState.direction === "asc" ? 1 : -1;

  if (sortState.key === "trust_score") {
    const leftScore = matrixTrustScore(left);
    const rightScore = matrixTrustScore(right);
    if (leftScore !== rightScore) {
      return (leftScore - rightScore) * directionMultiplier;
    }
  }

  const nameComparison = left.name.localeCompare(right.name);
  if (nameComparison !== 0) {
    return sortState.key === "name"
      ? nameComparison * directionMultiplier
      : nameComparison;
  }

  const idComparison = left.id.localeCompare(right.id);
  return sortState.key === "name"
    ? idComparison * directionMultiplier
    : idComparison;
}

function matrixTrustScore(
  alternative: CategoryMatrixApiResponse["data"]["alternatives"][number],
): number {
  const fact = alternative.facts.trust_score;
  return fact?.status === "verified" && typeof fact.value === "number"
    ? fact.value
    : Number.NEGATIVE_INFINITY;
}

function sortAriaValue(
  sortState: MatrixSortState,
  key: MatrixSortKey,
): "ascending" | "descending" | "none" {
  if (sortState.key === null || sortState.key !== key) {
    return "none";
  }

  return sortState.direction === "asc" ? "ascending" : "descending";
}

function matrixSortLabel(
  t: TranslateFn,
  key: MatrixSortKey,
  sortState: MatrixSortState,
): string {
  const nextDirection =
    sortState.key === null || sortState.key !== key
      ? key === "trust_score"
        ? "desc"
        : "asc"
      : sortState.direction === "asc"
        ? "desc"
        : "asc";
  const keyName = key === "name" ? "name" : "trustScore";
  const directionName = nextDirection === "asc" ? "Asc" : "Desc";

  return t(`matrixView.sort.${keyName}${directionName}`);
}

export default function CategoryMatrixView({
  matrix,
  visibleAlternativeIds,
  onAlternativeOpen,
  reducedMotion = false,
}: CategoryMatrixViewProps) {
  const [query, setQuery] = useState("");
  const [density, setDensity] = useState<MatrixDensity>("comfortable");
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);
  const [hideUnverified, setHideUnverified] = useState(false);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set<string>());
  const [focusedOnly, setFocusedOnly] = useState(false);
  const [sortState, setSortState] = useState<MatrixSortState>({
    key: null,
    direction: "asc",
  });
  const [columnFilters, setColumnFilters] = useState<MatrixColumnFilter[]>([]);
  const [openFilterCriterionId, setOpenFilterCriterionId] = useState<
    string | null
  >(null);
  const topScrollRef = useRef<HTMLDivElement | null>(null);
  const bottomScrollRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement | null>(null);
  const [scrollSpacerWidth, setScrollSpacerWidth] = useState(0);
  const { t, i18n } = useTranslation("browse");
  const browseFilteredAlternatives = useMemo(
    () =>
      visibleAlternativeIds === undefined
        ? matrix.data.alternatives
        : matrix.data.alternatives.filter((alternative) =>
            visibleAlternativeIds.has(alternative.id),
          ),
    [matrix.data.alternatives, visibleAlternativeIds],
  );
  const matrixFilteredAlternatives = useMemo(
    () => applyMatrixColumnFilters(browseFilteredAlternatives, columnFilters),
    [browseFilteredAlternatives, columnFilters],
  );
  const sortedMatrixFilteredAlternatives = useMemo(
    () => sortMatrixAlternatives(matrixFilteredAlternatives, sortState),
    [matrixFilteredAlternatives, sortState],
  );
  const pinnedAlternatives = useMemo(
    () =>
      sortedMatrixFilteredAlternatives.filter((alternative) =>
        pinnedIds.has(alternative.id),
      ),
    [sortedMatrixFilteredAlternatives, pinnedIds],
  );
  const orderedAlternatives = useMemo(() => {
    if (pinnedAlternatives.length === 0) {
      return sortedMatrixFilteredAlternatives;
    }
    const pinnedSet = new Set(pinnedAlternatives.map((alt) => alt.id));
    const unpinned = sortedMatrixFilteredAlternatives.filter(
      (alternative) => !pinnedSet.has(alternative.id),
    );
    return [...pinnedAlternatives, ...unpinned];
  }, [sortedMatrixFilteredAlternatives, pinnedAlternatives]);
  const focusMode = focusedOnly && pinnedAlternatives.length > 0;
  const visibleAlternatives = focusMode
    ? pinnedAlternatives
    : orderedAlternatives;
  const comparisonAlternatives = focusMode
    ? pinnedAlternatives
    : matrixFilteredAlternatives;
  const focusedEmpty = focusedOnly && pinnedAlternatives.length === 0;
  const pinnedCount = useMemo(
    () =>
      matrix.data.alternatives.filter((alternative) =>
        pinnedIds.has(alternative.id),
      ).length,
    [matrix.data.alternatives, pinnedIds],
  );
  const togglePin = (alternativeId: string) => {
    setPinnedIds((previous) => {
      const next = new Set(previous);
      if (next.has(alternativeId)) {
        next.delete(alternativeId);
      } else {
        next.add(alternativeId);
      }
      return next;
    });
  };
  const clearPins = () => {
    setPinnedIds(new Set<string>());
    setFocusedOnly(false);
  };
  const applyColumnFilter = (filter: MatrixColumnFilter) => {
    setColumnFilters((previous) => upsertMatrixColumnFilter(previous, filter));
  };
  const clearColumnFilter = (criterionId: string) => {
    setColumnFilters((previous) =>
      withoutMatrixColumnFilter(previous, criterionId),
    );
    setOpenFilterCriterionId((previous) =>
      previous === criterionId ? null : previous,
    );
  };
  const clearColumnFilters = () => {
    setColumnFilters([]);
    setOpenFilterCriterionId(null);
  };
  const toggleColumnFilterPopover = (criterionId: string) => {
    setOpenFilterCriterionId((previous) =>
      previous === criterionId ? null : criterionId,
    );
  };
  const toggleSort = (key: MatrixSortKey) => {
    setSortState((previous) =>
      previous.key === key
        ? {
            key,
            direction: previous.direction === "asc" ? "desc" : "asc",
          }
        : {
            key,
            direction: key === "trust_score" ? "desc" : "asc",
          },
    );
  };
  const exitFocus = () => {
    setFocusedOnly(false);
  };
  const title = t("matrixView.title", {
    category: matrix.data.category.name,
  });
  const groupsWithCriteria = useMemo(
    () => matrix.data.groups.filter((group) => group.criteria.length > 0),
    [matrix.data.groups],
  );
  const totalCriterionCount = useMemo(
    () =>
      groupsWithCriteria.reduce(
        (count, group) => count + group.criteria.length,
        0,
      ),
    [groupsWithCriteria],
  );
  const tokens = useMemo(
    () =>
      query
        .trim()
        .toLowerCase()
        .split(/\s+/u)
        .filter((token) => token.length > 0),
    [query],
  );
  const isQuerying = tokens.length > 0;
  const filteredGroups = useMemo<MatrixGroup[]>(() => {
    const applyDifferences =
      showOnlyDifferences && comparisonAlternatives.length > 1;
    const applyHideUnverified = hideUnverified;
    const applySearch = isQuerying;

    if (!applyDifferences && !applyHideUnverified && !applySearch) {
      return groupsWithCriteria;
    }

    const next: MatrixGroup[] = [];
    for (const group of groupsWithCriteria) {
      const groupLabelLower = group.label.toLowerCase();
      const criteria = group.criteria.filter((criterion) => {
        if (applyHideUnverified) {
          const allUnverified = comparisonAlternatives.every((alternative) => {
            const fact = alternative.facts[criterion.id] ?? UNVERIFIED_FACT;
            return fact.status === "unverified";
          });
          if (allUnverified && comparisonAlternatives.length > 0) {
            return false;
          }
        }
        if (applyDifferences) {
          const firstKey = effectiveFactKey(
            comparisonAlternatives[0]?.facts[criterion.id] ?? UNVERIFIED_FACT,
          );
          const allSame = comparisonAlternatives.every(
            (alternative) =>
              effectiveFactKey(
                alternative.facts[criterion.id] ?? UNVERIFIED_FACT,
              ) === firstKey,
          );
          if (allSame) {
            return false;
          }
        }
        if (applySearch) {
          const labelLower = criterion.label.toLowerCase();
          const helpLower = (criterion.helpText ?? "").toLowerCase();
          return tokens.every(
            (token) =>
              labelLower.includes(token) ||
              helpLower.includes(token) ||
              groupLabelLower.includes(token),
          );
        }
        return true;
      });
      if (criteria.length > 0) {
        next.push({ ...group, criteria });
      }
    }
    return next;
  }, [
    groupsWithCriteria,
    isQuerying,
    tokens,
    showOnlyDifferences,
    hideUnverified,
    comparisonAlternatives,
  ]);
  const filteredCriteria = useMemo(
    () => filteredGroups.flatMap((group) => group.criteria),
    [filteredGroups],
  );
  const visibleOpenFilterCriterionId =
    openFilterCriterionId !== null &&
    filteredCriteria.some((criterion) => criterion.id === openFilterCriterionId)
      ? openFilterCriterionId
      : null;
  const scrollFrameClassName =
    visibleOpenFilterCriterionId === null
      ? "category-matrix-view-scroll-frame"
      : "category-matrix-view-scroll-frame is-filter-popover-open";
  const scrollContainerClassName =
    visibleOpenFilterCriterionId === null
      ? "category-matrix-view-scroll"
      : "category-matrix-view-scroll is-filter-popover-open";
  const criteriaById = useMemo(() => {
    const entries = groupsWithCriteria.flatMap((group) => group.criteria);
    return new Map(entries.map((criterion) => [criterion.id, criterion]));
  }, [groupsWithCriteria]);
  const togglesActive = showOnlyDifferences || hideUnverified;
  const showEmptyState =
    filteredCriteria.length === 0 && (isQuerying || togglesActive);
  const columnFiltersActive = columnFilters.length > 0;
  const showRowEmptyState =
    visibleAlternatives.length === 0 && columnFiltersActive && !focusedEmpty;
  const updateScrollSpacerWidth = useCallback(() => {
    const width = tableRef.current?.scrollWidth ?? 0;
    setScrollSpacerWidth((previous) => (previous === width ? previous : width));

    const topScroller = topScrollRef.current;
    const bottomScroller = bottomScrollRef.current;
    if (
      topScroller !== null &&
      bottomScroller !== null &&
      Math.abs(topScroller.scrollLeft - bottomScroller.scrollLeft) > 1
    ) {
      topScroller.scrollLeft = bottomScroller.scrollLeft;
    }
  }, []);
  const syncScroll = useCallback((source: "top" | "bottom") => {
    const sourceElement =
      source === "top" ? topScrollRef.current : bottomScrollRef.current;
    const targetElement =
      source === "top" ? bottomScrollRef.current : topScrollRef.current;

    if (sourceElement === null || targetElement === null) {
      return;
    }

    if (Math.abs(targetElement.scrollLeft - sourceElement.scrollLeft) > 1) {
      targetElement.scrollLeft = sourceElement.scrollLeft;
    }
  }, []);

  useEffect(() => {
    updateScrollSpacerWidth();
  });

  useEffect(() => {
    updateScrollSpacerWidth();

    if (typeof ResizeObserver === "undefined" || tableRef.current === null) {
      return undefined;
    }

    const observer = new ResizeObserver(updateScrollSpacerWidth);
    observer.observe(tableRef.current);
    if (bottomScrollRef.current !== null) {
      observer.observe(bottomScrollRef.current);
    }

    return () => observer.disconnect();
  }, [
    filteredCriteria.length,
    focusedEmpty,
    showEmptyState,
    updateScrollSpacerWidth,
    visibleAlternatives.length,
  ]);

  return (
    <section
      className="category-matrix-view"
      aria-labelledby="category-matrix-view-title"
      data-density={density}
    >
      <div className="category-matrix-view-header">
        <h2 id="category-matrix-view-title">{title}</h2>
      </div>
      <MatrixLegend t={t} />
      <CategoryMatrixToolbar
        query={query}
        onQueryChange={setQuery}
        density={density}
        onDensityChange={setDensity}
        matchCount={filteredCriteria.length}
        totalCount={totalCriterionCount}
        showOnlyDifferences={showOnlyDifferences}
        onShowOnlyDifferencesChange={setShowOnlyDifferences}
        hideUnverified={hideUnverified}
        onHideUnverifiedChange={setHideUnverified}
        pinnedCount={pinnedCount}
        focusedOnly={focusedOnly}
        onFocusedOnlyChange={setFocusedOnly}
        onClearPins={clearPins}
      />
      <MatrixColumnFilterChips
        filters={columnFilters}
        criteriaById={criteriaById}
        resultCount={matrixFilteredAlternatives.length}
        onClearFilter={clearColumnFilter}
        onClearAll={clearColumnFilters}
        t={t}
      />
      {focusedEmpty ? (
        <div
          className="category-matrix-focused-empty"
          role="status"
          data-testid="category-matrix-focused-empty"
        >
          <h3 className="category-matrix-focused-empty-title">
            {t("matrixView.focusedEmptyTitle")}
          </h3>
          <p className="category-matrix-focused-empty-body">
            {t("matrixView.focusedEmptyBody")}
          </p>
          <button
            type="button"
            className="category-matrix-focused-empty-exit"
            onClick={exitFocus}
          >
            {t("matrixView.exitFocus")}
          </button>
        </div>
      ) : showEmptyState ? (
        <div
          className="category-matrix-toolbar-empty"
          role="status"
          data-testid="category-matrix-toolbar-empty"
        >
          <h3 className="category-matrix-toolbar-empty-title">
            {t("matrixView.toolbar.emptyTitle")}
          </h3>
          <p className="category-matrix-toolbar-empty-body">
            {togglesActive
              ? t("matrixView.toolbar.emptyBodyWithToggles")
              : t("matrixView.toolbar.emptyBody")}
          </p>
          {togglesActive && (
            <button
              type="button"
              className="category-matrix-toolbar-empty-reset"
              onClick={() => {
                setShowOnlyDifferences(false);
                setHideUnverified(false);
              }}
            >
              {t("matrixView.toolbar.resetToggles")}
            </button>
          )}
          {isQuerying && (
            <button
              type="button"
              className="category-matrix-toolbar-empty-clear"
              onClick={() => setQuery("")}
            >
              {t("matrixView.toolbar.clearSearch")}
            </button>
          )}
        </div>
      ) : showRowEmptyState ? (
        <div
          className="category-matrix-row-empty"
          role="status"
          data-testid="category-matrix-row-empty"
        >
          <h3 className="category-matrix-row-empty-title">
            {t("matrixView.columnFilters.emptyTitle")}
          </h3>
          <p className="category-matrix-row-empty-body">
            {t("matrixView.columnFilters.emptyBody")}
          </p>
          <button
            type="button"
            className="category-matrix-row-empty-reset"
            onClick={clearColumnFilters}
          >
            {t("matrixView.columnFilters.clearAll")}
          </button>
        </div>
      ) : (
        <>
          <div className={scrollFrameClassName}>
            <div
              className="category-matrix-view-scrollbar-top"
              aria-hidden="true"
              ref={topScrollRef}
              onScroll={() => syncScroll("top")}
            >
              <div
                className="category-matrix-view-scrollbar-spacer"
                style={
                  scrollSpacerWidth > 0
                    ? { width: scrollSpacerWidth }
                    : undefined
                }
              />
            </div>
            <div
              className={scrollContainerClassName}
              tabIndex={0}
              ref={bottomScrollRef}
              onScroll={() => syncScroll("bottom")}
            >
              <table
                ref={tableRef}
                className="category-matrix-view-table"
                aria-label={title}
              >
                <thead className="category-matrix-view-head">
                  <tr className="category-matrix-view-group-row">
                    <th
                      scope="col"
                      rowSpan={2}
                      className="category-matrix-view-product-header category-matrix-view-corner"
                      aria-sort={sortAriaValue(sortState, "name")}
                    >
                      <button
                        type="button"
                        className="category-matrix-sort-button"
                        onClick={() => toggleSort("name")}
                        aria-label={matrixSortLabel(t, "name", sortState)}
                      >
                        <span>{t("matrixView.productColumn")}</span>
                        {renderSortIcon(sortState, "name")}
                      </button>
                    </th>
                    {filteredGroups.map((group) => (
                      <th
                        key={group.id}
                        scope="colgroup"
                        colSpan={group.criteria.length}
                        className="category-matrix-view-group-header"
                      >
                        <span className="category-matrix-view-group-label">
                          {group.label}
                        </span>
                        {group.description !== null && (
                          <span className="category-matrix-view-group-description">
                            {group.description}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                  <tr className="category-matrix-view-criterion-row">
                    {filteredCriteria.map((criterion) => {
                      const activeFilter = findMatrixColumnFilter(
                        columnFilters,
                        criterion.id,
                      );
                      const isFilterOpen =
                        visibleOpenFilterCriterionId === criterion.id;

                      return (
                      <th
                        key={criterion.id}
                        scope="col"
                        className={
                          isFilterOpen
                            ? "category-matrix-view-criterion-header is-filter-open"
                            : "category-matrix-view-criterion-header"
                        }
                        aria-sort={
                          criterion.id === "trust_score"
                            ? sortAriaValue(sortState, "trust_score")
                            : undefined
                        }
                      >
                        {criterion.id === "trust_score" ? (
                          <span className="category-matrix-view-criterion-actions">
                            <button
                              type="button"
                              className="category-matrix-sort-button"
                              onClick={() => toggleSort("trust_score")}
                              aria-label={matrixSortLabel(
                                t,
                                "trust_score",
                                sortState,
                              )}
                            >
                              <span>{criterion.label}</span>
                              {renderSortIcon(sortState, "trust_score")}
                            </button>
                            <MatrixColumnFilterTrigger
                              criterion={criterion}
                              activeFilter={activeFilter}
                              isOpen={isFilterOpen}
                              onToggle={() =>
                                toggleColumnFilterPopover(criterion.id)
                              }
                              t={t}
                              variant="icon"
                              surface="desktop"
                            />
                          </span>
                        ) : (
                          <MatrixColumnFilterTrigger
                            criterion={criterion}
                            activeFilter={activeFilter}
                            isOpen={isFilterOpen}
                            onToggle={() =>
                              toggleColumnFilterPopover(criterion.id)
                            }
                            t={t}
                            variant="label"
                            surface="desktop"
                          />
                        )}
                        {criterion.helpText !== null && (
                          <span className="category-matrix-view-criterion-help">
                            {criterion.helpText}
                          </span>
                        )}
                        {isFilterOpen && (
                          <MatrixColumnFilterPopover
                            id={matrixColumnFilterPopoverId(
                              criterion.id,
                              "desktop",
                            )}
                            criterion={criterion}
                            alternatives={browseFilteredAlternatives}
                            filters={columnFilters}
                            activeFilter={activeFilter}
                            onApplyFilter={applyColumnFilter}
                            onClearFilter={() => clearColumnFilter(criterion.id)}
                            onClose={() => setOpenFilterCriterionId(null)}
                            t={t}
                          />
                        )}
                      </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {visibleAlternatives.map((alternative, rowIndex) => {
                    const isPinned = pinnedIds.has(alternative.id);
                    const pinLabel = t(
                      isPinned
                        ? "matrixView.unpinAction"
                        : "matrixView.pinAction",
                      { product: alternative.name },
                    );
                    const rowClassName = isPinned
                      ? "category-matrix-view-row is-pinned"
                      : "category-matrix-view-row";
                    return (
                      <tr key={alternative.id} className={rowClassName}>
                        <th
                          scope="row"
                          className="category-matrix-view-alternative-label"
                          data-morph-id={
                            reducedMotion
                              ? undefined
                              : `alt-name-${alternative.id}`
                          }
                          data-pinned={isPinned ? "true" : "false"}
                          style={cellCustomProps(rowIndex, 0)}
                        >
                          {onAlternativeOpen === undefined ? (
                            <span className="category-matrix-view-alternative-name">
                              {alternative.name}
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="category-matrix-view-alternative-open"
                              onClick={() => onAlternativeOpen(alternative.id)}
                              aria-label={t("matrixView.openProductDetails", {
                                product: alternative.name,
                              })}
                            >
                              {alternative.name}
                            </button>
                          )}
                          <button
                            type="button"
                            aria-pressed={isPinned ? "true" : "false"}
                            aria-label={pinLabel}
                            title={pinLabel}
                            className={
                              isPinned
                                ? "category-matrix-pin-button is-pinned"
                                : "category-matrix-pin-button"
                            }
                            onClick={() => togglePin(alternative.id)}
                          >
                            {renderPinIcon(isPinned)}
                          </button>
                        </th>
                        {filteredCriteria.map((criterion, colIndex) => (
                          <td
                            key={criterion.id}
                            className="category-matrix-view-fact-cell"
                            style={cellCustomProps(rowIndex, colIndex + 1)}
                          >
                            <MatrixCell
                              fact={
                                alternative.facts[criterion.id] ??
                                UNVERIFIED_FACT
                              }
                              criterion={criterion}
                              alternativeName={alternative.name}
                              t={t}
                              language={i18n.language}
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <MobileMatrixInspector
            groups={filteredGroups}
            alternatives={orderedAlternatives}
            pinnedAlternatives={pinnedAlternatives}
            onAlternativeOpen={onAlternativeOpen}
            baseAlternativesForFilterCounts={browseFilteredAlternatives}
            columnFilters={columnFilters}
            openFilterCriterionId={visibleOpenFilterCriterionId}
            onToggleFilterPopover={toggleColumnFilterPopover}
            onApplyColumnFilter={applyColumnFilter}
            onClearColumnFilter={clearColumnFilter}
            onCloseColumnFilter={() => setOpenFilterCriterionId(null)}
            t={t}
            language={i18n.language}
          />
        </>
      )}
    </section>
  );
}

function renderPinIcon(isPinned: boolean): ReactNode {
  return (
    <svg
      className="category-matrix-pin-icon"
      viewBox="0 0 24 24"
      fill={isPinned ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 3l5 5-4 4v5l-2 2-5-5-4 4-2-2 4-4-5-5 2-2h5l4-4z" />
    </svg>
  );
}

function renderSortIcon(
  sortState: MatrixSortState,
  key: MatrixSortKey,
): ReactNode {
  const active = sortState.key === key;
  const direction = active ? sortState.direction : "none";

  return (
    <svg
      className="category-matrix-sort-button-icon"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      data-direction={direction}
    >
      {direction === "asc" ? (
        <path d="M7 14l5-5 5 5H7z" />
      ) : direction === "desc" ? (
        <path d="M7 10l5 5 5-5H7z" />
      ) : (
        <path d="M7 8l5-5 5 5H7zm10 8l-5 5-5-5h10z" />
      )}
    </svg>
  );
}

type MatrixColumnFilterSurface = "desktop" | "mobile";
type MatrixColumnFilterTriggerVariant = "label" | "icon";
type MatrixColumnFilterTone =
  | MatrixDisplayTone
  | MatrixBooleanTone
  | "unverified"
  | "not-applicable";

interface MatrixColumnFilterTriggerProps {
  criterion: MatrixCriterion;
  activeFilter: MatrixColumnFilter | undefined;
  isOpen: boolean;
  onToggle: () => void;
  t: TranslateFn;
  variant: MatrixColumnFilterTriggerVariant;
  surface: MatrixColumnFilterSurface;
}

function MatrixColumnFilterTrigger({
  criterion,
  activeFilter,
  isOpen,
  onToggle,
  t,
  variant,
  surface,
}: MatrixColumnFilterTriggerProps) {
  const isActive = activeFilter !== undefined;
  const className = [
    variant === "icon"
      ? "category-matrix-column-filter-icon-button"
      : "category-matrix-column-filter-trigger",
    isActive ? "is-active" : "",
    isOpen ? "is-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={className}
      onClick={onToggle}
      aria-expanded={isOpen ? "true" : "false"}
      aria-controls={
        isOpen ? matrixColumnFilterPopoverId(criterion.id, surface) : undefined
      }
      aria-label={t("matrixView.columnFilters.openLabel", {
        criterion: criterion.label,
      })}
      title={t("matrixView.columnFilters.openLabel", {
        criterion: criterion.label,
      })}
    >
      {variant === "label" && (
        <span className="category-matrix-view-criterion-label">
          {criterion.label}
        </span>
      )}
      {renderColumnFilterIcon(isActive)}
    </button>
  );
}

function renderColumnFilterIcon(isActive: boolean): ReactNode {
  return (
    <svg
      className="category-matrix-column-filter-icon"
      viewBox="0 0 24 24"
      fill={isActive ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 5h16l-6 7v5l-4 2v-7L4 5z" />
    </svg>
  );
}

function renderSmallCloseIcon(): ReactNode {
  return (
    <svg
      className="category-matrix-column-filter-close-icon"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.41L10.59 13.41 4.29 19.7 2.88 18.29 9.17 12 2.88 5.71 4.29 4.3l6.3 6.29 6.3-6.29z" />
    </svg>
  );
}

interface MatrixColumnFilterChipsProps {
  filters: MatrixColumnFilter[];
  criteriaById: ReadonlyMap<string, MatrixCriterion>;
  resultCount: number;
  onClearFilter: (criterionId: string) => void;
  onClearAll: () => void;
  t: TranslateFn;
}

function MatrixColumnFilterChips({
  filters,
  criteriaById,
  resultCount,
  onClearFilter,
  onClearAll,
  t,
}: MatrixColumnFilterChipsProps) {
  if (filters.length === 0) {
    return null;
  }

  return (
    <div
      className="category-matrix-column-filter-chips"
      role="list"
      aria-label={t("matrixView.columnFilters.activeLabel")}
    >
      <span className="category-matrix-column-filter-chips-label">
        {t("matrixView.columnFilters.activeLabel")}
      </span>
      {filters.map((filter) => {
        const criterion = criteriaById.get(filter.criterionId);
        const label = matrixColumnFilterSummary(filter, criterion, t);
        return (
          <span key={filter.criterionId} role="listitem">
            <button
              type="button"
              className="category-matrix-column-filter-chip"
              onClick={() => onClearFilter(filter.criterionId)}
              aria-label={t("matrixView.columnFilters.removeLabel", { label })}
            >
              <span>{label}</span>
              {renderSmallCloseIcon()}
            </button>
          </span>
        );
      })}
      <span className="category-matrix-column-filter-result-count">
        {t("matrixView.columnFilters.resultCount", { count: resultCount })}
      </span>
      <button
        type="button"
        className="category-matrix-column-filter-clear-all"
        onClick={onClearAll}
      >
        {t("matrixView.columnFilters.clearAll")}
      </button>
    </div>
  );
}

interface MatrixColumnFilterPopoverProps {
  id: string;
  criterion: MatrixCriterion;
  alternatives: CategoryMatrixApiResponse["data"]["alternatives"];
  filters: MatrixColumnFilter[];
  activeFilter: MatrixColumnFilter | undefined;
  onApplyFilter: (filter: MatrixColumnFilter) => void;
  onClearFilter: () => void;
  onClose: () => void;
  t: TranslateFn;
}

function MatrixColumnFilterPopover({
  id,
  criterion,
  alternatives,
  filters,
  activeFilter,
  onApplyFilter,
  onClearFilter,
  onClose,
  t,
}: MatrixColumnFilterPopoverProps) {
  const alternativesForCounts = applyMatrixColumnFilters(
    alternatives,
    withoutMatrixColumnFilter(filters, criterion.id),
  );
  const hasValueFilters = hasMatrixColumnValueFilters(criterion);

  return (
    <div
      id={id}
      className="category-matrix-column-filter-popover"
      role="dialog"
      aria-label={t("matrixView.columnFilters.title", {
        criterion: criterion.label,
      })}
    >
      <div className="category-matrix-column-filter-popover-header">
        <span className="category-matrix-column-filter-popover-title">
          {criterion.label}
        </span>
        <button
          type="button"
          className="category-matrix-column-filter-popover-close"
          onClick={onClose}
          aria-label={t("matrixView.columnFilters.close")}
        >
          {renderSmallCloseIcon()}
        </button>
      </div>
      {hasValueFilters ? (
        <div className="category-matrix-column-filter-section">
          <span className="category-matrix-column-filter-section-title">
            {t("matrixView.columnFilters.valuesTitle")}
          </span>
          {renderMatrixColumnValueFilterControls({
            criterion,
            alternativesForCounts,
            activeFilter,
            onApplyFilter,
            onClearFilter,
            t,
          })}
        </div>
      ) : null}
      {isValueColumnFilter(activeFilter) && (
        <label className="category-matrix-column-filter-toggle">
          <input
            type="checkbox"
            checked={activeFilter.includeUnverified}
            onChange={(event) =>
              onApplyFilter({
                ...activeFilter,
                includeUnverified: event.currentTarget.checked,
              })
            }
          />
          <span>{t("matrixView.columnFilters.includeUnverified")}</span>
        </label>
      )}
      <div className="category-matrix-column-filter-section">
        <span className="category-matrix-column-filter-section-title">
          {t("matrixView.columnFilters.statusTitle")}
        </span>
        <div className="category-matrix-column-filter-options">
          {MATRIX_COLUMN_FILTER_STATUSES.map((status) =>
            renderMatrixColumnStatusFilterControl({
              status,
              criterion,
              alternativesForCounts,
              activeFilter,
              onApplyFilter,
              onClearFilter,
              t,
            }),
          )}
        </div>
      </div>
      <div className="category-matrix-column-filter-popover-footer">
        <button
          type="button"
          className="category-matrix-column-filter-clear"
          onClick={onClearFilter}
          disabled={activeFilter === undefined}
        >
          {t("matrixView.columnFilters.clear")}
        </button>
      </div>
    </div>
  );
}

const MATRIX_COLUMN_FILTER_STATUSES: MatrixColumnFilterStatus[] = [
  "verified",
  "unverified",
  "not_applicable",
];

interface MatrixColumnValueFilterControlProps {
  criterion: MatrixCriterion;
  alternativesForCounts: CategoryMatrixApiResponse["data"]["alternatives"];
  activeFilter: MatrixColumnFilter | undefined;
  onApplyFilter: (filter: MatrixColumnFilter) => void;
  onClearFilter: () => void;
  t: TranslateFn;
}

function renderMatrixColumnValueFilterControls({
  criterion,
  alternativesForCounts,
  activeFilter,
  onApplyFilter,
  onClearFilter,
  t,
}: MatrixColumnValueFilterControlProps): ReactNode {
  if (criterion.valueType === "boolean") {
    const choices = [true, false]
      .map((value) => ({
        value,
        label: t(value ? "matrixView.yes" : "matrixView.no"),
        tone: booleanVerdictTone(value, criterion.semantics),
      }))
      .sort((left, right) => compareColumnFilterChoices(left, right));

    return (
      <div className="category-matrix-column-filter-options">
        {choices.map((choice) => {
          const filter: MatrixColumnFilter = {
            criterionId: criterion.id,
            kind: "boolean",
            value: choice.value,
            includeUnverified: false,
          };
          const isActive =
            activeFilter?.kind === "boolean" &&
            activeFilter.value === choice.value;
          return renderMatrixColumnFilterOptionButton({
            key: choice.value ? "true" : "false",
            label: choice.label,
            tone: choice.tone,
            count: countMatchingColumnFilter(alternativesForCounts, filter),
            isActive,
            onClick: () => (isActive ? onClearFilter() : onApplyFilter(filter)),
          });
        })}
      </div>
    );
  }

  if (criterion.valueType === "enum") {
    const options = matrixColumnCriterionOptions(
      criterion,
      alternativesForCounts,
    );

    if (options.length === 0) {
      return (
        <span className="category-matrix-column-filter-empty">
          {t("matrixView.columnFilters.noValues")}
        </span>
      );
    }

    return (
      <div className="category-matrix-column-filter-options">
        {options.map((option) => {
          const filter: MatrixColumnFilter = {
            criterionId: criterion.id,
            kind: "enum",
            values: [option.id],
            includeUnverified: false,
          };
          const isActive =
            activeFilter?.kind === "enum" &&
            activeFilter.values.length === 1 &&
            activeFilter.values[0] === option.id;
          return renderMatrixColumnFilterOptionButton({
            key: option.id,
            label: option.label,
            tone: option.tone,
            count: countMatchingColumnFilter(alternativesForCounts, filter),
            isActive,
            onClick: () => (isActive ? onClearFilter() : onApplyFilter(filter)),
          });
        })}
      </div>
    );
  }

  if (criterion.valueType === "multi_enum") {
    const options = matrixColumnCriterionOptions(
      criterion,
      alternativesForCounts,
    );

    if (options.length === 0) {
      return (
        <span className="category-matrix-column-filter-empty">
          {t("matrixView.columnFilters.noValues")}
        </span>
      );
    }

    return (
      <div className="category-matrix-column-filter-options">
        {options.map((option) => {
          const activeValues =
            activeFilter?.kind === "multi_enum" ? activeFilter.values : [];
          const isActive = activeValues.includes(option.id);
          const filter: MatrixColumnFilter = {
            criterionId: criterion.id,
            kind: "multi_enum",
            values: [option.id],
            includeUnverified: false,
          };
          return renderMatrixColumnFilterOptionButton({
            key: option.id,
            label: option.label,
            tone: option.tone,
            count: countMatchingColumnFilter(alternativesForCounts, filter),
            isActive,
            onClick: () => {
              const nextValues = orderedMatrixColumnValues(
                options.map((entry) => entry.id),
                isActive
                  ? activeValues.filter((value) => value !== option.id)
                  : [...activeValues, option.id],
              );

              if (nextValues.length === 0) {
                onClearFilter();
                return;
              }

              onApplyFilter({
                criterionId: criterion.id,
                kind: "multi_enum",
                values: nextValues,
                includeUnverified:
                  activeFilter?.kind === "multi_enum"
                    ? activeFilter.includeUnverified
                    : false,
              });
            },
          });
        })}
      </div>
    );
  }

  return null;
}

interface MatrixColumnFilterOptionButtonProps {
  key: string;
  label: string;
  tone: MatrixColumnFilterTone;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

function renderMatrixColumnFilterOptionButton({
  key,
  label,
  tone,
  count,
  isActive,
  onClick,
}: MatrixColumnFilterOptionButtonProps): ReactNode {
  return (
    <button
      key={key}
      type="button"
      className={
        isActive
          ? `category-matrix-column-filter-option category-matrix-column-filter-option--${tone} is-active`
          : `category-matrix-column-filter-option category-matrix-column-filter-option--${tone}`
      }
      onClick={onClick}
      aria-pressed={isActive ? "true" : "false"}
    >
      <span className="category-matrix-column-filter-option-label">
        {label}
      </span>
      <span className="category-matrix-column-filter-option-count">
        {count}
      </span>
    </button>
  );
}

interface MatrixColumnStatusFilterControlProps {
  status: MatrixColumnFilterStatus;
  criterion: MatrixCriterion;
  alternativesForCounts: CategoryMatrixApiResponse["data"]["alternatives"];
  activeFilter: MatrixColumnFilter | undefined;
  onApplyFilter: (filter: MatrixColumnFilter) => void;
  onClearFilter: () => void;
  t: TranslateFn;
}

function renderMatrixColumnStatusFilterControl({
  status,
  criterion,
  alternativesForCounts,
  activeFilter,
  onApplyFilter,
  onClearFilter,
  t,
}: MatrixColumnStatusFilterControlProps): ReactNode {
  const filter: MatrixColumnFilter = {
    criterionId: criterion.id,
    kind: "status",
    statuses: [status],
  };
  const activeStatuses =
    activeFilter?.kind === "status" ? activeFilter.statuses : [];
  const isActive =
    activeFilter?.kind === "status" && activeStatuses.includes(status);

  return renderMatrixColumnFilterOptionButton({
    key: status,
    label: matrixColumnFilterStatusLabel(status, t),
    tone: matrixColumnFilterStatusTone(status),
    count: countMatchingColumnFilter(alternativesForCounts, filter),
    isActive,
    onClick: () => {
      const selected = new Set(activeStatuses);
      if (isActive) {
        selected.delete(status);
      } else {
        selected.add(status);
      }

      const nextStatuses = MATRIX_COLUMN_FILTER_STATUSES.filter((entry) =>
        selected.has(entry),
      );

      if (nextStatuses.length === 0) {
        onClearFilter();
        return;
      }

      onApplyFilter({
        criterionId: criterion.id,
        kind: "status",
        statuses: nextStatuses,
      });
    },
  });
}

interface MatrixColumnCriterionOption {
  id: string;
  label: string;
  tone: MatrixDisplayTone;
}

function matrixColumnCriterionOptions(
  criterion: MatrixCriterion,
  alternatives: CategoryMatrixApiResponse["data"]["alternatives"],
): MatrixColumnCriterionOption[] {
  const optionIds = new Set<string>();
  for (const option of criterion.options) {
    optionIds.add(option.id);
  }

  for (const alternative of alternatives) {
    const fact = alternative.facts[criterion.id] ?? UNVERIFIED_FACT;
    if (fact.status !== "verified" || fact.value === null) {
      continue;
    }
    if (criterion.valueType === "enum" && typeof fact.value === "string") {
      optionIds.add(fact.value);
    }
    if (criterion.valueType === "multi_enum" && Array.isArray(fact.value)) {
      for (const value of fact.value) {
        optionIds.add(value);
      }
    }
  }

  return [...optionIds]
    .map((optionId) => {
      const option = criterion.options.find((entry) => entry.id === optionId);
      return {
        id: optionId,
        label: option?.label ?? optionId,
        tone: option?.displayTone ?? "neutral",
      };
    })
    .sort(compareColumnFilterChoices);
}

function compareColumnFilterChoices(
  left: { label: string; tone: MatrixColumnFilterTone },
  right: { label: string; tone: MatrixColumnFilterTone },
): number {
  const toneComparison =
    matrixColumnFilterTonePriority(left.tone) -
    matrixColumnFilterTonePriority(right.tone);

  return toneComparison === 0
    ? left.label.localeCompare(right.label)
    : toneComparison;
}

function matrixColumnFilterTonePriority(tone: MatrixColumnFilterTone): number {
  switch (tone) {
    case "positive":
      return 0;
    case "warning":
    case "tradeoff":
      return 1;
    case "neutral":
      return 2;
    case "unverified":
      return 3;
    case "not-applicable":
      return 4;
    case "negative":
    default:
      return 5;
  }
}

function matrixColumnFilterStatusTone(
  status: MatrixColumnFilterStatus,
): MatrixColumnFilterTone {
  switch (status) {
    case "verified":
      return "positive";
    case "unverified":
      return "unverified";
    case "not_applicable":
      return "not-applicable";
  }
}

function countMatchingColumnFilter(
  alternatives: CategoryMatrixApiResponse["data"]["alternatives"],
  filter: MatrixColumnFilter,
): number {
  return alternatives.filter((alternative) =>
    matrixFactMatchesColumnFilter(
      alternative.facts[filter.criterionId] ?? UNVERIFIED_FACT,
      filter,
    ),
  ).length;
}

function orderedMatrixColumnValues(
  order: string[],
  selectedValues: string[],
): string[] {
  const selected = new Set(selectedValues);
  return order.filter((value) => selected.has(value));
}

function hasMatrixColumnValueFilters(criterion: MatrixCriterion): boolean {
  return (
    criterion.valueType === "boolean" ||
    criterion.valueType === "enum" ||
    criterion.valueType === "multi_enum"
  );
}

function isValueColumnFilter(
  filter: MatrixColumnFilter | undefined,
): filter is Extract<
  MatrixColumnFilter,
  { kind: "boolean" | "enum" | "multi_enum" }
> {
  return (
    filter?.kind === "boolean" ||
    filter?.kind === "enum" ||
    filter?.kind === "multi_enum"
  );
}

function findMatrixColumnFilter(
  filters: readonly MatrixColumnFilter[],
  criterionId: string,
): MatrixColumnFilter | undefined {
  return filters.find((filter) => filter.criterionId === criterionId);
}

function matrixColumnFilterSummary(
  filter: MatrixColumnFilter,
  criterion: MatrixCriterion | undefined,
  t: TranslateFn,
): string {
  const criterionLabel = criterion?.label ?? filter.criterionId;
  const valueLabel = matrixColumnFilterValueSummary(filter, criterion, t);
  return `${criterionLabel}: ${valueLabel}`;
}

function matrixColumnFilterValueSummary(
  filter: MatrixColumnFilter,
  criterion: MatrixCriterion | undefined,
  t: TranslateFn,
): string {
  if (filter.kind === "boolean") {
    return appendIncludeUnverifiedLabel(
      filter.value ? t("matrixView.yes") : t("matrixView.no"),
      filter.includeUnverified,
      t,
    );
  }

  if (filter.kind === "status") {
    return filter.statuses
      .map((status) => matrixColumnFilterStatusLabel(status, t))
      .join(", ");
  }

  const labels = filter.values.map((value) =>
    matrixColumnCriterionValueLabel(criterion, value),
  );

  return appendIncludeUnverifiedLabel(
    labels.join(", "),
    filter.includeUnverified,
    t,
  );
}

function appendIncludeUnverifiedLabel(
  label: string,
  includeUnverified: boolean,
  t: TranslateFn,
): string {
  return includeUnverified
    ? `${label} + ${t("matrixView.columnFilters.unverified")}`
    : label;
}

function matrixColumnCriterionValueLabel(
  criterion: MatrixCriterion | undefined,
  value: string,
): string {
  return criterion?.options.find((option) => option.id === value)?.label ?? value;
}

function matrixColumnFilterStatusLabel(
  status: MatrixColumnFilterStatus,
  t: TranslateFn,
): string {
  switch (status) {
    case "verified":
      return t("matrixView.columnFilters.verified");
    case "unverified":
      return t("matrixView.columnFilters.unverified");
    case "not_applicable":
      return t("matrixView.columnFilters.notApplicable");
  }
}

function matrixColumnFilterPopoverId(
  criterionId: string,
  surface: MatrixColumnFilterSurface,
): string {
  return `category-matrix-column-filter-${matrixDomIdSegment(
    criterionId,
  )}-${surface}`;
}

function matrixDomIdSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]+/gu, "-");
}

interface MobileMatrixInspectorProps {
  groups: CategoryMatrixApiResponse["data"]["groups"];
  alternatives: CategoryMatrixApiResponse["data"]["alternatives"];
  pinnedAlternatives?: CategoryMatrixApiResponse["data"]["alternatives"];
  onAlternativeOpen?: (alternativeId: string) => void;
  baseAlternativesForFilterCounts: CategoryMatrixApiResponse["data"]["alternatives"];
  columnFilters: MatrixColumnFilter[];
  openFilterCriterionId: string | null;
  onToggleFilterPopover: (criterionId: string) => void;
  onApplyColumnFilter: (filter: MatrixColumnFilter) => void;
  onClearColumnFilter: (criterionId: string) => void;
  onCloseColumnFilter: () => void;
  t: TranslateFn;
  language: string;
}

export function deriveFocusedAlternativeIds(
  primarySelection: string,
  secondarySelection: string,
  alternatives: ReadonlyArray<{ id: string }>,
): { primaryId: string; secondaryId: string } {
  const primaryId = alternatives.some(
    (alternative) => alternative.id === primarySelection,
  )
    ? primarySelection
    : (alternatives[0]?.id ?? "");
  const secondaryId =
    secondarySelection !== "" &&
    secondarySelection !== primaryId &&
    alternatives.some((alternative) => alternative.id === secondarySelection)
      ? secondarySelection
      : "";
  return { primaryId, secondaryId };
}

function MobileMatrixInspector({
  groups,
  alternatives,
  pinnedAlternatives,
  onAlternativeOpen,
  baseAlternativesForFilterCounts,
  columnFilters,
  openFilterCriterionId,
  onToggleFilterPopover,
  onApplyColumnFilter,
  onClearColumnFilter,
  onCloseColumnFilter,
  t,
  language,
}: MobileMatrixInspectorProps) {
  const primaryLabel = t("matrixView.inspector.primaryLabel");
  const compareLabel = t("matrixView.inspector.compareLabel");
  const noSecondaryLabel = t("matrixView.inspector.noSecondary");

  const [primarySelection, setPrimaryId] = useState<string>("");
  const [secondarySelection, setSecondaryId] = useState<string>("");

  const { primaryId, secondaryId } = deriveFocusedAlternativeIds(
    primarySelection,
    secondarySelection,
    alternatives,
  );

  const usePinned =
    pinnedAlternatives !== undefined && pinnedAlternatives.length > 0;

  const focusedAlternatives = usePinned
    ? pinnedAlternatives
    : ([
        alternatives.find((alternative) => alternative.id === primaryId),
        secondaryId === ""
          ? undefined
          : alternatives.find((alternative) => alternative.id === secondaryId),
      ].filter((alternative): alternative is (typeof alternatives)[number] =>
        Boolean(alternative),
      ) as CategoryMatrixApiResponse["data"]["alternatives"]);

  return (
    <div
      className="category-matrix-mobile-inspector"
      data-testid="category-matrix-mobile-inspector"
      data-mode={usePinned ? "pinned" : "select"}
    >
      {!usePinned && (
        <div className="category-matrix-mobile-inspector-controls">
          <label className="category-matrix-mobile-inspector-control">
            <span className="category-matrix-mobile-inspector-control-label">
              {primaryLabel}
            </span>
            <select
              className="category-matrix-mobile-inspector-select"
              aria-label={primaryLabel}
              value={primaryId}
              onChange={(event) => setPrimaryId(event.target.value)}
            >
              {alternatives.map((alternative) => (
                <option key={alternative.id} value={alternative.id}>
                  {alternative.name}
                </option>
              ))}
            </select>
          </label>
          <label className="category-matrix-mobile-inspector-control">
            <span className="category-matrix-mobile-inspector-control-label">
              {compareLabel}
            </span>
            <select
              className="category-matrix-mobile-inspector-select"
              aria-label={compareLabel}
              value={secondaryId}
              onChange={(event) => setSecondaryId(event.target.value)}
            >
              <option value="">{noSecondaryLabel}</option>
              {alternatives
                .filter((alternative) => alternative.id !== primaryId)
                .map((alternative) => (
                  <option key={alternative.id} value={alternative.id}>
                    {alternative.name}
                  </option>
                ))}
            </select>
          </label>
        </div>
      )}
      {groups.map((group) => (
        <section
          key={group.id}
          className="category-matrix-mobile-inspector-group"
          aria-label={group.label}
        >
          <h3 className="category-matrix-mobile-inspector-group-label">
            {group.label}
          </h3>
          {group.criteria.map((criterion) => (
            <div
              key={criterion.id}
              className="category-matrix-mobile-inspector-row"
            >
              <div className="category-matrix-mobile-inspector-criterion-header">
                <span className="category-matrix-mobile-inspector-criterion-label">
                  {criterion.label}
                </span>
                <MatrixColumnFilterTrigger
                  criterion={criterion}
                  activeFilter={findMatrixColumnFilter(
                    columnFilters,
                    criterion.id,
                  )}
                  isOpen={openFilterCriterionId === criterion.id}
                  onToggle={() => onToggleFilterPopover(criterion.id)}
                  t={t}
                  variant="icon"
                  surface="mobile"
                />
                {openFilterCriterionId === criterion.id && (
                  <MatrixColumnFilterPopover
                    id={matrixColumnFilterPopoverId(criterion.id, "mobile")}
                    criterion={criterion}
                    alternatives={baseAlternativesForFilterCounts}
                    filters={columnFilters}
                    activeFilter={findMatrixColumnFilter(
                      columnFilters,
                      criterion.id,
                    )}
                    onApplyFilter={onApplyColumnFilter}
                    onClearFilter={() => onClearColumnFilter(criterion.id)}
                    onClose={onCloseColumnFilter}
                    t={t}
                  />
                )}
              </div>
              <div className="category-matrix-mobile-inspector-cells">
                {focusedAlternatives.map((alternative) => (
                  <div
                    key={alternative.id}
                    className="category-matrix-mobile-inspector-cell"
                    data-alternative-id={alternative.id}
                  >
                    {onAlternativeOpen === undefined ? (
                      <span className="category-matrix-mobile-inspector-alternative-label">
                        {alternative.name}
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="category-matrix-mobile-inspector-alternative-open"
                        onClick={() => onAlternativeOpen(alternative.id)}
                        aria-label={t("matrixView.openProductDetails", {
                          product: alternative.name,
                        })}
                      >
                        {alternative.name}
                      </button>
                    )}
                    <MatrixCell
                      fact={alternative.facts[criterion.id] ?? UNVERIFIED_FACT}
                      criterion={criterion}
                      alternativeName={alternative.name}
                      t={t}
                      language={language}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

interface MatrixLegendProps {
  t: TranslateFn;
}

function MatrixLegend({ t }: MatrixLegendProps) {
  const entries: ReadonlyArray<{
    tone:
      | "positive"
      | "warning"
      | "negative"
      | "neutral"
      | "unverified"
      | "not-applicable";
    labelKey: string;
  }> = [
    { tone: "positive", labelKey: "matrixView.legend.positive" },
    { tone: "warning", labelKey: "matrixView.legend.warning" },
    { tone: "negative", labelKey: "matrixView.legend.negative" },
    { tone: "neutral", labelKey: "matrixView.legend.neutral" },
    { tone: "unverified", labelKey: "matrixView.legend.unverified" },
    { tone: "not-applicable", labelKey: "matrixView.legend.notApplicable" },
  ];

  return (
    <div className="category-matrix-legend" role="list">
      <span className="category-matrix-legend-title">
        {t("matrixView.legend.title")}
      </span>
      {entries.map((entry) => (
        <span
          key={entry.tone}
          role="listitem"
          className={`category-matrix-legend-item category-matrix-legend-item--${entry.tone}`}
        >
          {renderLegendIcon(entry.tone)}
          <span className="category-matrix-legend-label">
            {t(entry.labelKey)}
          </span>
        </span>
      ))}
    </div>
  );
}

function renderLegendIcon(
  tone:
    | "positive"
    | "warning"
    | "negative"
    | "neutral"
    | "unverified"
    | "not-applicable",
): ReactNode {
  const className = "category-matrix-legend-icon";
  switch (tone) {
    case "positive":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      );
    case "negative":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      );
    case "warning":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2 1 21h22L12 2zm0 5 7.53 13H4.47L12 7zm-1 5v4h2v-4h-2zm0 6v2h2v-2h-2z" />
        </svg>
      );
    case "unverified":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M11 7h2v6h-2zm0 8h2v2h-2zM12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
        </svg>
      );
    case "not-applicable":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M5 11h14v2H5z" />
        </svg>
      );
    case "neutral":
    default:
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
  }
}

interface MatrixCellProps {
  fact: MatrixFact;
  criterion: MatrixCriterion;
  alternativeName: string;
  t: TranslateFn;
  language: string;
}

function MatrixCell({
  fact,
  criterion,
  alternativeName,
  t,
  language,
}: MatrixCellProps) {
  const body = renderFactBody(fact, criterion, t, language);
  const sourceHref = getVerifiedSourceHref(fact);

  if (sourceHref !== undefined) {
    return (
      <span className="category-matrix-cell">
        <a
          className="category-matrix-cell-source-link"
          href={sourceHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("matrixView.openSourceLabel", {
            product: alternativeName,
            criterion: criterion.label,
          })}
        >
          {renderSourceLinkBody(fact, criterion, body)}
        </a>
      </span>
    );
  }

  return <span className="category-matrix-cell">{body}</span>;
}

function getVerifiedSourceHref(fact: MatrixFact): string | undefined {
  if (fact.status !== "verified") {
    return undefined;
  }
  const source = fact.source;
  if (source === undefined) {
    return undefined;
  }

  return sanitizeHref(source.url);
}

function renderSourceLinkBody(
  fact: MatrixFact,
  criterion: MatrixCriterion,
  body: ReactNode,
): ReactNode {
  if (
    criterion.valueType === "url" &&
    fact.status === "verified" &&
    typeof fact.value === "string"
  ) {
    return fact.value;
  }

  return body;
}

function renderFactBody(
  fact: MatrixFact,
  criterion: MatrixCriterion,
  t: TranslateFn,
  language: string,
): ReactNode {
  if (fact.status === "unverified") {
    return (
      <span className="category-matrix-fact category-matrix-fact--unverified">
        {t("matrixView.unverified")}
      </span>
    );
  }

  if (fact.status === "not_applicable") {
    return (
      <span className="category-matrix-fact category-matrix-fact--not-applicable">
        {t("matrixView.notApplicable")}
      </span>
    );
  }

  return renderVerifiedValue(fact.value, criterion, t, language);
}

function renderVerifiedValue(
  value: MatrixFactValue,
  criterion: MatrixCriterion,
  t: TranslateFn,
  language: string,
): ReactNode {
  if (value === null) {
    return (
      <span className="category-matrix-fact category-matrix-fact--unverified">
        {t("matrixView.unverified")}
      </span>
    );
  }

  if (criterion.id === "trust_score" && typeof value === "number") {
    return renderTrustScoreValue(value, language);
  }

  switch (criterion.valueType) {
    case "boolean":
      return typeof value === "boolean"
        ? renderBooleanVerdict(value, criterion, t)
        : String(value);
    case "enum":
      return typeof value === "string"
        ? renderOption(criterion, value, t)
        : String(value);
    case "multi_enum":
      return Array.isArray(value) ? (
        renderMultiEnumValue(value, criterion, t)
      ) : (
        String(value)
      );
    case "number":
      return typeof value === "number"
        ? new Intl.NumberFormat(
            language.startsWith("de") ? "de-DE" : "en-US",
          ).format(value)
        : String(value);
    case "url":
      return typeof value === "string" ? renderUrlValue(value) : String(value);
    case "date":
    case "text":
    default:
      return Array.isArray(value) ? value.join(", ") : String(value);
  }
}

function renderTrustScoreValue(value: number, language: string): ReactNode {
  const tone = trustScoreTone(value);
  const score = new Intl.NumberFormat(
    language.startsWith("de") ? "de-DE" : "en-US",
    {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    },
  ).format(value);

  return (
    <span className={`category-matrix-fact category-matrix-fact--${tone}`}>
      {renderBooleanVerdictIcon(tone)}
      <span className="category-matrix-fact-label">{score}/10</span>
    </span>
  );
}

function trustScoreTone(value: number): MatrixBooleanTone {
  if (value < 5) {
    return "negative";
  }

  if (value <= 7) {
    return "warning";
  }

  return "positive";
}

function renderMultiEnumValue(
  value: string[],
  criterion: MatrixCriterion,
  t: TranslateFn,
): ReactNode {
  if (criterion.displayMode === "coverage") {
    return renderFullCoverageOptions(value, criterion, t);
  }

  return (
    <span className="category-matrix-option-list">
      {value.map((optionId) => renderOption(criterion, optionId, t))}
    </span>
  );
}

function renderFullCoverageOptions(
  value: string[],
  criterion: MatrixCriterion,
  t: TranslateFn,
): ReactNode {
  const selected = new Set(value);
  const knownOptionIds = new Set(criterion.options.map((option) => option.id));
  const unknownSelected = value.filter((optionId) => !knownOptionIds.has(optionId));

  return (
    <span className="category-matrix-option-list category-matrix-option-list--coverage">
      {criterion.options.map((option) =>
        renderOption(criterion, option.id, t, {
          tone: selected.has(option.id)
            ? coveragePresentTone(option.displayTone)
            : "negative",
        }),
      )}
      {unknownSelected.map((optionId) =>
        renderOption(criterion, optionId, t, { tone: "positive" }),
      )}
    </span>
  );
}

// Tone for a *supported* option in a coverage row. Presence is the primary
// signal, so a supported option with a neutral (or unset) catalogue tone still
// reads as positive/green — matching the "present = good" reading of coverage
// rows (e.g. a mail service that offers POP3 or an app that runs on iOS). A
// tradeoff/warning/negative tone is preserved so a supported-but-cautionary
// option stays amber or red rather than being painted green. Absent options are
// always negative (red), handled by the caller.
function coveragePresentTone(
  tone: MatrixDisplayTone | undefined,
): MatrixDisplayTone {
  return tone === undefined || tone === "neutral" ? "positive" : tone;
}

type MatrixBooleanTone = "positive" | "warning" | "negative" | "neutral";

function renderBooleanVerdict(
  value: boolean,
  criterion: MatrixCriterion,
  t: TranslateFn,
): ReactNode {
  const tone = booleanVerdictTone(value, criterion.semantics);
  const toneClass = `category-matrix-fact--${tone}`;
  const label = t(value ? "matrixView.yes" : "matrixView.no");

  return (
    <span className={`category-matrix-fact ${toneClass}`}>
      {renderBooleanVerdictIcon(tone)}
      <span className="category-matrix-fact-label">{label}</span>
    </span>
  );
}

function booleanVerdictTone(
  value: boolean,
  semantics: MatrixCriterion["semantics"],
): MatrixBooleanTone {
  switch (semantics) {
    case "beneficial":
      return value ? "positive" : "negative";
    case "harmful":
    case "risk":
      return value ? "negative" : "positive";
    case "tradeoff":
      return "warning";
    case "informational":
    case "neutral":
    default:
      return "neutral";
  }
}

function renderBooleanVerdictIcon(tone: MatrixBooleanTone): ReactNode {
  const className = "category-matrix-fact-icon";

  switch (tone) {
    case "positive":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      );
    case "negative":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      );
    case "warning":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
        </svg>
      );
    case "neutral":
    default:
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M5 11h14v2H5z" />
        </svg>
      );
  }
}

function renderOption(
  criterion: MatrixCriterion,
  optionId: string,
  t: TranslateFn,
  overrides: { tone?: MatrixDisplayTone } = {},
): ReactNode {
  const option = criterion.options.find((entry) => entry.id === optionId);
  const label = option?.label ?? optionId;
  const tone = overrides.tone ?? getOptionTone(option);
  const toneLabel = t(`matrixView.legend.${toneLabelKey(tone)}`);

  return (
    <span
      key={optionId}
      className={`category-matrix-option category-matrix-option--${tone}`}
      aria-label={`${toneLabel}: ${label}`}
    >
      {renderOptionIcon(tone)}
      <span className="category-matrix-option-label">{label}</span>
    </span>
  );
}

function toneLabelKey(tone: string): string {
  switch (tone) {
    case "positive":
      return "positive";
    case "warning":
      return "warning";
    case "negative":
      return "negative";
    case "tradeoff":
      return "tradeoff";
    case "neutral":
    default:
      return "neutral";
  }
}

function renderOptionIcon(tone: string): ReactNode {
  const className = "category-matrix-option-icon";
  switch (tone) {
    case "positive":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      );
    case "negative":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      );
    case "warning":
    case "tradeoff":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2 1 21h22L12 2zm-1 6h2v6h-2zm0 8h2v2h-2z" />
        </svg>
      );
    case "neutral":
    default:
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
  }
}

function getOptionTone(option: MatrixCriterionOption | undefined): string {
  return option?.displayTone ?? "neutral";
}

function renderUrlValue(value: string): ReactNode {
  const href = sanitizeHref(value);

  if (href === undefined) {
    return value;
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {value}
    </a>
  );
}
