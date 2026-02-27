import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useCatalog } from '../contexts/CatalogContext';
import AlternativeCard from './AlternativeCard';
import Filters from './Filters';
import { getLocalizedAlternativeDescription } from '../utils/alternativeText';
import { getAlternativeCategories } from '../utils/alternativeCategories';
import { getEffectiveTrustScore } from '../utils/trustScore';
import type { CategoryId, CountryCode, SelectedFilters, SortBy, ViewMode } from '../types';

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
  const { t, i18n } = useTranslation('browse');

  const validCategoryIds = useMemo(
    () => new Set<string>(categories.map((category) => category.id)),
    [categories],
  );

  const setSearchParamsRef = useRef(setSearchParams);
  useEffect(() => {
    setSearchParamsRef.current = setSearchParams;
  }, [setSearchParams]);

  const searchTerm = searchParams.get('q') ?? '';
  const categoryFilters = useMemo(
    () => searchParams.getAll('category').filter((category) => validCategoryIds.has(category)) as CategoryId[],
    [searchParams, validCategoryIds],
  );

  const latestParamsRef = useRef(new URLSearchParams(searchParams));
  useEffect(() => {
    latestParamsRef.current = new URLSearchParams(searchParams);
  }, [searchParams]);

  const [countryFilters, setCountryFilters] = useState<CountryCode[]>([]);
  const [pricingFilters, setPricingFilters] = useState<string[]>([]);
  const [openSourceOnly, setOpenSourceOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('trustScore');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const selectedFilters: SelectedFilters = useMemo(
    () => ({
      category: categoryFilters,
      country: countryFilters,
      pricing: pricingFilters,
      openSourceOnly,
    }),
    [categoryFilters, countryFilters, pricingFilters, openSourceOnly],
  );

  const handleSearchChange = useCallback((term: string) => {
    const params = new URLSearchParams(latestParamsRef.current);
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    latestParamsRef.current = params;
    setSearchParamsRef.current(params, { replace: true });
  }, []);

  const handleFilterChange = useCallback((filterType: keyof SelectedFilters, values: string[] | boolean) => {
    switch (filterType) {
      case 'category': {
        const params = new URLSearchParams(latestParamsRef.current);
        params.delete('category');
        for (const category of values as string[]) {
          params.append('category', category);
        }
        latestParamsRef.current = params;
        setSearchParamsRef.current(params, { replace: true });
        break;
      }
      case 'country':
        setCountryFilters(values as CountryCode[]);
        break;
      case 'pricing':
        setPricingFilters(values as string[]);
        break;
      case 'openSourceOnly':
        setOpenSourceOnly(values as boolean);
        break;
    }
  }, []);

  const handleClearAll = useCallback(() => {
    const params = new URLSearchParams();
    const currentQ = latestParamsRef.current.get('q');
    if (currentQ) {
      params.set('q', currentQ);
    }
    latestParamsRef.current = params;
    setSearchParamsRef.current(params, { replace: true });
    setCountryFilters([]);
    setPricingFilters([]);
    setOpenSourceOnly(false);
  }, []);

  const filteredAlternatives = useMemo(() => {
    let result = [...alternatives];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((alternative) => {
        const localizedDescription = getLocalizedAlternativeDescription(alternative, i18n.language).toLowerCase();
        const baseDescription = alternative.description.toLowerCase();

        return (
          alternative.name.toLowerCase().includes(term) ||
          baseDescription.includes(term) ||
          localizedDescription.includes(term) ||
          alternative.replacesUS.some((slug) => {
            const vendorName = usVendorNameBySlug.get(slug);
            return slug.toLowerCase().includes(term) ||
              (vendorName != null && vendorName.toLowerCase().includes(term));
          }) ||
          alternative.tags.some((tag) => tag.toLowerCase().includes(term))
        );
      });
    }

    if (selectedFilters.category.length > 0) {
      result = result.filter((alternative) => {
        const alternativeCategories = getAlternativeCategories(alternative);
        return selectedFilters.category.some((selectedCategory) => alternativeCategories.includes(selectedCategory));
      });
    }

    if (selectedFilters.country.length > 0) {
      result = result.filter((alternative) => selectedFilters.country.includes(alternative.country));
    }

    if (selectedFilters.pricing.length > 0) {
      result = result.filter((alternative) => selectedFilters.pricing.includes(alternative.pricing));
    }

    if (selectedFilters.openSourceOnly) {
      result = result.filter((alternative) => alternative.isOpenSource);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'trustScore': {
          const trustDelta = getEffectiveTrustScore(b) - getEffectiveTrustScore(a);
          if (trustDelta !== 0) return trustDelta;
          return a.name.localeCompare(b.name);
        }
        case 'name':
          return a.name.localeCompare(b.name);
        case 'country':
          return a.country.localeCompare(b.country);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return result;
  }, [alternatives, usVendorNameBySlug, searchTerm, selectedFilters, sortBy, i18n.language]);

  if (loading) {
    return (
      <div className="browse-page">
        <div className="browse-header">
          <h1 className="browse-title">{t('title')}</h1>
          <p className="browse-subtitle">{t('subtitle')}</p>
        </div>
        <div className="catalog-loading">Loading catalog data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="browse-page">
        <div className="browse-header">
          <h1 className="browse-title">{t('title')}</h1>
          <p className="browse-subtitle">{t('subtitle')}</p>
        </div>
        <div className="catalog-error" role="alert">Data temporarily unavailable. Please try again later.</div>
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
        <h1 className="browse-title">{t('title')}</h1>
        <p className="browse-subtitle">{t('subtitle')}</p>
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
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalCount={alternatives.length}
          filteredCount={filteredAlternatives.length}
        />

        {filteredAlternatives.length > 0 ? (
          <div className={`alt-grid${viewMode === 'list' ? ' list-view' : ''}`}>
            {filteredAlternatives.map((alternative, index) => (
              <motion.div
                key={alternative.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(0.1 + index * 0.05, 1) }}
              >
                <AlternativeCard alternative={alternative} viewMode={viewMode} usVendorLookup={usVendorLookup} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            className="no-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {alternatives.length === 0 ? (
              <div className="empty-catalogue">
                <div className="empty-icon" aria-hidden="true">
                  <span className="fi fi-eu"></span>
                </div>
                <h2>{t('catalogueComingSoon')}</h2>
                <p>{t('catalogueComingSoonDesc')}</p>
              </div>
            ) : (
              <div className="empty-catalogue">
                <div className="empty-icon" aria-hidden="true">
                  <svg className="empty-search-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                </div>
                <h2>{t('noResults')}</h2>
                <p>{t('noResultsDesc')}</p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
