import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useCatalog } from "../contexts/CatalogContext";
import AlternativeCard from "./AlternativeCard";
import Filters from "./Filters";
import CategoryMatrixView from "./CategoryMatrixView";
import ResultModeSwitch from "./ResultModeSwitch";
import { fetchCategoryMatrix } from "../data/categoryMatrix";
import { getLocalizedAlternativeDescription } from "../utils/alternativeText";
import { getAlternativeCategories } from "../utils/alternativeCategories";
import {
  getEffectiveDimensionScore,
  getEffectiveTrustScore,
} from "../utils/trustScore";
import type {
  Alternative,
  CardViewMode,
  CategoryId,
  CategoryMatrixLoadResult,
  CategoryMatrixState,
  CountryCode,
  ResultMode,
  SelectedFilters,
  SortBy,
} from "../types";

interface LoadedCategoryMatrix {
  category: CategoryId;
  language: string;
  result: CategoryMatrixLoadResult;
}

export default function BrowsePage() {
  const { alternatives, usVendors, categories, loading, error } = useCatalog();

  const usVendorLookup = useMemo(
    () => new Map(usVendors.map((v) => [v.id, v])),
    [usVendors],
  );
  const usVendorNameBySlug = useMemo(
    () => new Map(usVendors.map((v) => [v.id, v.name])),
    [usVendors],
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, i18n } = useTranslation(["browse", "common"]);

  const validCategoryIds = useMemo(
    () => new Set<string>(categories.map((category) => category.id)),
    [categories],
  );

  const setSearchParamsRef = useRef(setSearchParams);
  useEffect(() => {
    setSearchParamsRef.current = setSearchParams;
  }, [setSearchParams]);

  const searchTerm = searchParams.get("q") ?? "";
  const requestedResultMode: ResultMode =
    searchParams.get("view") === "matrix" ? "matrix" : "browse";
  const categoryFilters = useMemo(
    () =>
      searchParams
        .getAll("category")
        .filter((category) => validCategoryIds.has(category)) as CategoryId[],
    [searchParams, validCategoryIds],
  );

  const latestParamsRef = useRef(new URLSearchParams(searchParams));
  useEffect(() => {
    latestParamsRef.current = new URLSearchParams(searchParams);
  }, [searchParams]);

  const [countryFilters, setCountryFilters] = useState<CountryCode[]>([]);
  const [pricingFilters, setPricingFilters] = useState<string[]>([]);
  const [openSourceOnly, setOpenSourceOnly] = useState(false);
  const [selfHostable, setSelfHostable] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("trustScore");
  const [browseLayout, setBrowseLayout] = useState<CardViewMode>("grid");
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(
    new Set(),
  );
  const [compareCardIds, setCompareCardIds] = useState<Set<string>>(new Set());
  const [loadedCategoryMatrix, setLoadedCategoryMatrix] =
    useState<LoadedCategoryMatrix | null>(null);

  const matrixCategory =
    categoryFilters.length === 1 && categoryFilters[0] !== "other"
      ? categoryFilters[0]
      : null;

  const categoryMatrixState = useMemo<CategoryMatrixState>(() => {
    if (matrixCategory === null) {
      return { status: "idle", matrix: null, error: null };
    }

    if (
      loadedCategoryMatrix !== null &&
      loadedCategoryMatrix.category === matrixCategory &&
      loadedCategoryMatrix.language === i18n.language
    ) {
      return loadedCategoryMatrix.result;
    }

    return { status: "loading", matrix: null, error: null };
  }, [loadedCategoryMatrix, matrixCategory, i18n.language]);
  const readyCategoryMatrix =
    categoryMatrixState.status === "ready" ? categoryMatrixState.matrix : null;
  const matrixViewAvailable =
    categoryFilters.length === 1 &&
    readyCategoryMatrix !== null &&
    readyCategoryMatrix.meta.criterionCount > 0 &&
    readyCategoryMatrix.meta.alternativeCount > 0 &&
    readyCategoryMatrix.data.alternatives.length > 0 &&
    readyCategoryMatrix.data.groups.some((group) => group.criteria.length > 0) &&
    readyCategoryMatrix.data.alternatives.some((alternative) =>
      Object.entries(alternative.facts).some(
        ([criterionId, fact]) =>
          criterionId !== "trust_score" && fact.status === "verified",
      ),
    );

  useEffect(() => {
    if (matrixCategory === null) {
      return;
    }

    let cancelled = false;
    const requestedCategory = matrixCategory;
    const requestedLanguage = i18n.language;

    fetchCategoryMatrix(requestedCategory, requestedLanguage).then((result) => {
      if (!cancelled) {
        setLoadedCategoryMatrix({
          category: requestedCategory,
          language: requestedLanguage,
          result,
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [matrixCategory, i18n.language]);

  const handleExpand = useCallback(
    (id: string) => {
      setExpandedCardIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        // Also add all compared cards
        compareCardIds.forEach((cid) => next.add(cid));
        return next;
      });
    },
    [compareCardIds],
  );

  const handleCollapse = useCallback((id: string) => {
    setExpandedCardIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const handleCollapseAll = useCallback(() => {
    setExpandedCardIds(new Set());
  }, []);

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (expandedCardIds.size > 0) {
      document.body.classList.add("overlay-open");
    } else {
      document.body.classList.remove("overlay-open");
    }
    return () => document.body.classList.remove("overlay-open");
  }, [expandedCardIds.size]);

  // Close overlay on Escape
  useEffect(() => {
    if (expandedCardIds.size === 0) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCollapseAll();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [expandedCardIds.size, handleCollapseAll]);

  const handleToggleCompare = useCallback((id: string) => {
    setCompareCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleOpenCompare = useCallback(() => {
    setExpandedCardIds(new Set(compareCardIds));
  }, [compareCardIds]);

  const handleClearCompare = useCallback(() => {
    setCompareCardIds(new Set());
  }, []);

  const selectedFilters: SelectedFilters = useMemo(
    () => ({
      category: categoryFilters,
      country: countryFilters,
      pricing: pricingFilters,
      openSourceOnly,
      selfHostable,
    }),
    [
      categoryFilters,
      countryFilters,
      pricingFilters,
      openSourceOnly,
      selfHostable,
    ],
  );

  const handleSearchChange = useCallback((term: string) => {
    const params = new URLSearchParams(latestParamsRef.current);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    latestParamsRef.current = params;
    setSearchParamsRef.current(params, { replace: true });
  }, []);

  const handleFilterChange = useCallback(
    (filterType: keyof SelectedFilters, values: string[] | boolean) => {
      switch (filterType) {
        case "category": {
          const nextCategories = values as CategoryId[];
          const nextMatrixCategory =
            nextCategories.length === 1 && nextCategories[0] !== "other"
              ? nextCategories[0]
              : null;
          const params = new URLSearchParams(latestParamsRef.current);
          params.delete("category");
          for (const category of nextCategories) {
            params.append("category", category);
          }
          if (nextMatrixCategory !== matrixCategory) {
            params.delete("view");
          }
          latestParamsRef.current = params;
          setSearchParamsRef.current(params, { replace: true });
          break;
        }
        case "country":
          setCountryFilters(values as CountryCode[]);
          break;
        case "pricing":
          setPricingFilters(values as string[]);
          break;
        case "openSourceOnly":
          setOpenSourceOnly(values as boolean);
          break;
        case "selfHostable":
          setSelfHostable(values as boolean);
          break;
      }
    },
    [matrixCategory],
  );

  const handleClearAll = useCallback(() => {
    const params = new URLSearchParams();
    const currentQ = latestParamsRef.current.get("q");
    if (currentQ) {
      params.set("q", currentQ);
    }
    latestParamsRef.current = params;
    setSearchParamsRef.current(params, { replace: true });
    setCountryFilters([]);
    setPricingFilters([]);
    setOpenSourceOnly(false);
    setSelfHostable(false);
    setBrowseLayout("grid");
  }, []);

  const handleResultModeChange = useCallback((nextMode: ResultMode) => {
    const params = new URLSearchParams(latestParamsRef.current);
    if (nextMode === "matrix") {
      params.set("view", "matrix");
    } else {
      params.delete("view");
    }
    latestParamsRef.current = params;
    setSearchParamsRef.current(params, { replace: true });
  }, []);

  const filteredAlternatives = useMemo(() => {
    let result = [...alternatives];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((alternative) => {
        const localizedDescription = getLocalizedAlternativeDescription(
          alternative,
          i18n.language,
        ).toLowerCase();
        const baseDescription = alternative.description.toLowerCase();

        return (
          alternative.name.toLowerCase().includes(term) ||
          baseDescription.includes(term) ||
          localizedDescription.includes(term) ||
          alternative.replacesUS.some((slug) => {
            const vendorName = usVendorNameBySlug.get(slug);
            return (
              slug.toLowerCase().includes(term) ||
              (vendorName != null && vendorName.toLowerCase().includes(term))
            );
          }) ||
          alternative.tags.some((tag) => tag.toLowerCase().includes(term))
        );
      });
    }

    if (selectedFilters.category.length > 0) {
      result = result.filter((alternative) => {
        const alternativeCategories = getAlternativeCategories(alternative);
        return selectedFilters.category.some((selectedCategory) =>
          alternativeCategories.includes(selectedCategory),
        );
      });
    }

    if (selectedFilters.country.length > 0) {
      result = result.filter((alternative) =>
        selectedFilters.country.includes(alternative.country),
      );
    }

    if (selectedFilters.pricing.length > 0) {
      result = result.filter((alternative) =>
        selectedFilters.pricing.includes(alternative.pricing),
      );
    }

    if (selectedFilters.openSourceOnly) {
      result = result.filter((alternative) => alternative.isOpenSource);
    }

    if (selectedFilters.selfHostable) {
      result = result.filter((alternative) => alternative.selfHostable);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "trustScore": {
          const trustDelta =
            getEffectiveTrustScore(b) - getEffectiveTrustScore(a);
          if (trustDelta !== 0) return trustDelta;
          return a.name.localeCompare(b.name);
        }
        case "name":
          return a.name.localeCompare(b.name);
        case "country":
          return a.country.localeCompare(b.country);
        case "category":
          return a.category.localeCompare(b.category);
        case "security":
        case "governance":
        case "reliability":
        case "contract": {
          const dimensionDelta =
            getEffectiveDimensionScore(b, sortBy) -
            getEffectiveDimensionScore(a, sortBy);
          if (dimensionDelta !== 0) return dimensionDelta;
          return a.name.localeCompare(b.name);
        }
        default:
          return 0;
      }
    });

    return result;
  }, [
    alternatives,
    usVendorNameBySlug,
    searchTerm,
    selectedFilters,
    sortBy,
    i18n.language,
  ]);
  const catalogAlternativeById = useMemo(() => {
    const lookup = new Map<string, Alternative>();
    for (const alternative of alternatives) {
      lookup.set(alternative.id, alternative);
    }
    for (const vendor of usVendors) {
      lookup.set(vendor.id, vendor);
    }
    return lookup;
  }, [alternatives, usVendors]);
  const visibleMatrixAlternativeIds = useMemo(
    () => {
      const ids = new Set(filteredAlternatives.map((alternative) => alternative.id));
      for (const matrixAlternative of readyCategoryMatrix?.data.alternatives ?? []) {
        if (
          matrixAlternative.status === "us" ||
          matrixAlternative.country === "us"
        ) {
          ids.add(matrixAlternative.id);
        }
      }
      return ids;
    },
    [filteredAlternatives, readyCategoryMatrix],
  );
  const effectiveResultMode: ResultMode =
    requestedResultMode === "matrix" && matrixViewAvailable ? "matrix" : "browse";
  const cardViewMode: CardViewMode = browseLayout;
  const showMatrixView = effectiveResultMode === "matrix";

  const expandedAlternatives = useMemo(
    () =>
      Array.from(expandedCardIds)
        .map((id) => catalogAlternativeById.get(id))
        .filter((alternative): alternative is Alternative => alternative !== undefined),
    [catalogAlternativeById, expandedCardIds],
  );

  const reducedMotion = useReducedMotion() ?? false;
  const morphTransition = { duration: 0.42, ease: [0.32, 0.72, 0.2, 1] as const };

  const browseSurfaceVariants = reducedMotion
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 0, transition: { duration: 0 } },
      }
    : {
        initial: { opacity: 0 },
        animate: {
          opacity: 1,
          transition: {
            duration: 0.32,
            ease: [0.32, 0.72, 0.2, 1] as const,
            when: "beforeChildren" as const,
            staggerChildren: 0.025,
            delayChildren: 0.08,
          },
        },
        exit: {
          opacity: 1,
          transition: {
            when: "afterChildren" as const,
            staggerChildren: 0.02,
            staggerDirection: -1 as const,
          },
        },
      };

  const browseCardVariants = reducedMotion
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 0, transition: { duration: 0 } },
      }
    : {
        initial: { opacity: 0, y: 20, scaleY: 1 },
        animate: {
          opacity: 1,
          y: 0,
          scaleY: 1,
          transition: { duration: 0.36, ease: [0.32, 0.72, 0.2, 1] as const },
        },
        exit: {
          opacity: 0,
          scaleY: 0.18,
          transition: {
            opacity: { duration: 0.18, ease: "easeIn" as const },
            scaleY: {
              duration: 0.28,
              delay: 0.08,
              ease: [0.6, 0.04, 0.32, 1] as const,
            },
          },
        },
      };

  if (loading) {
    return (
      <div className="browse-page">
        <div className="browse-header">
          <h1 className="browse-title">{t("title")}</h1>
          <p className="browse-subtitle">{t("subtitle")}</p>
        </div>
        <div className="catalog-loading">
          {t("common:status.loadingCatalog")}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="browse-page">
        <div className="browse-header">
          <h1 className="browse-title">{t("title")}</h1>
          <p className="browse-subtitle">{t("subtitle")}</p>
        </div>
        <div className="catalog-error" role="alert">
          {t("common:status.dataUnavailable")}
        </div>
      </div>
    );
  }

  return (
    <div className="browse-page">
      <motion.div
        className="browse-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="browse-title">{t("title")}</h1>
        <p className="browse-subtitle">{t("subtitle")}</p>
      </motion.div>

      <motion.div
        className="browse-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Filters
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          onClearAll={handleClearAll}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={browseLayout}
          onViewModeChange={setBrowseLayout}
          totalCount={alternatives.length}
          filteredCount={filteredAlternatives.length}
          matrixViewAvailable={matrixViewAvailable}
        />

        <ResultModeSwitch
          mode={effectiveResultMode}
          onChange={handleResultModeChange}
          matrixAvailable={matrixViewAvailable}
        />

        <div
          className="browse-morph-region"
          data-morph={reducedMotion ? "reduced" : "active"}
        >
          <AnimatePresence mode="wait" initial={false}>
              {filteredAlternatives.length > 0 ? (
                showMatrixView && readyCategoryMatrix !== null ? (
                  <motion.div
                    key="matrix-surface"
                    className="browse-morph-surface browse-morph-surface--matrix"
                    initial={
                      reducedMotion ? false : { opacity: 0, scale: 0.98 }
                    }
                    animate={{ opacity: 1, scale: 1 }}
                    exit={
                      reducedMotion
                        ? { opacity: 0 }
                        : { opacity: 0, scale: 0.98 }
                    }
                    transition={reducedMotion ? { duration: 0 } : morphTransition}
                  >
                    <CategoryMatrixView
                      matrix={readyCategoryMatrix}
                      visibleAlternativeIds={visibleMatrixAlternativeIds}
                      onAlternativeOpen={handleExpand}
                      reducedMotion={reducedMotion}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="browse-surface"
                    className={`browse-morph-surface browse-morph-surface--browse alt-grid${cardViewMode === "list" ? " list-view" : ""}`}
                    variants={browseSurfaceVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    style={{ transformOrigin: "top" }}
                  >
                    {filteredAlternatives.map((alternative) => (
                      <motion.div
                        key={alternative.id}
                        className="browse-morph-card"
                        data-morph-id={
                          reducedMotion
                            ? undefined
                            : `alt-name-${alternative.id}`
                        }
                        variants={browseCardVariants}
                        style={{ transformOrigin: "top" }}
                      >
                        <AlternativeCard
                          alternative={alternative}
                          viewMode={cardViewMode}
                          usVendorLookup={usVendorLookup}
                          onExpand={handleExpand}
                          isComparing={compareCardIds.has(alternative.id)}
                          onToggleCompare={handleToggleCompare}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )
              ) : (
                <motion.div
                  key="empty-surface"
                  className="no-results"
                  initial={reducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={
                    reducedMotion ? { duration: 0 } : { duration: 0.4 }
                  }
                >
                  {alternatives.length === 0 ? (
                    <div className="empty-catalogue">
                      <div className="empty-icon" aria-hidden="true">
                        <span className="fi fi-eu"></span>
                      </div>
                      <h2>{t("catalogueComingSoon")}</h2>
                      <p>{t("catalogueComingSoonDesc")}</p>
                    </div>
                  ) : (
                    <div className="empty-catalogue">
                      <div className="empty-icon" aria-hidden="true">
                        <svg
                          className="empty-search-icon"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                        </svg>
                      </div>
                      <h2>{t("noResults")}</h2>
                      <p>{t("noResultsDesc")}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
        </div>
      </motion.div>

      {compareCardIds.size > 0 && expandedCardIds.size === 0 && (
        <div className="compare-floating-bar">
          <span className="compare-floating-count">
            {t("compare.selectedCount", { count: compareCardIds.size })}
          </span>
          <button className="compare-floating-open" onClick={handleOpenCompare}>
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M10 3H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM9 9H5V5h4v4zm11-6h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm-1 6h-4V5h4v4zm-9 4H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1zm-1 6H5v-4h4v4zm8-6c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3zm1-4h-2v2h2v-2z" />
            </svg>
            {t("compare.open")}
          </button>
          <button
            className="compare-floating-clear"
            onClick={handleClearCompare}
            aria-label={t("compare.clear")}
          >
            ✕
          </button>
        </div>
      )}

      {expandedCardIds.size > 0 &&
        createPortal(
          <div
            className="card-overlay-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget) handleCollapseAll();
            }}
          >
            <div className="card-overlay-container">
              {expandedAlternatives.map((alternative) => (
                <div key={alternative.id} className="card-overlay-card">
                  <button
                    className="card-overlay-close"
                    onClick={() => handleCollapse(alternative.id)}
                    aria-label={t("overlay.close")}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                  </button>
                  <AlternativeCard
                    alternative={alternative}
                    viewMode={cardViewMode}
                    usVendorLookup={usVendorLookup}
                    overlayMode
                  />
                </div>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
