import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useCatalog } from '../contexts/CatalogContext';
import type { SelectedFilters, SortBy, ViewMode } from '../types';

const pricingKeys = ['free', 'freemium', 'paid'] as const;

interface FiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedFilters: SelectedFilters;
  onFilterChange: (filterType: keyof SelectedFilters, values: string[] | boolean) => void;
  onClearAll: () => void;
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalCount: number;
  filteredCount: number;
}

export default function Filters({
  searchTerm,
  onSearchChange,
  selectedFilters,
  onFilterChange,
  onClearAll,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalCount,
  filteredCount,
}: FiltersProps) {
  const { alternatives, categories } = useCatalog();
  const [showFilters, setShowFilters] = useState(false);
  const { t } = useTranslation(['browse', 'common', 'data']);

  const countryCodes = useMemo(
    () => Array.from(new Set(alternatives.map((alternative) => alternative.country))).sort(),
    [alternatives],
  );

  const hasActiveFilters =
    selectedFilters.category.length > 0 ||
    selectedFilters.country.length > 0 ||
    selectedFilters.pricing.length > 0 ||
    selectedFilters.openSourceOnly;

  const toggleFilter = (type: 'category' | 'country' | 'pricing', value: string) => {
    const current = selectedFilters[type] as string[];
    const updated = current.includes(value)
      ? current.filter((currentValue) => currentValue !== value)
      : [...current, value];
    onFilterChange(type, updated);
  };

  return (
    <div className="distro-filters">
      <div className="filters-search">
        <svg className="search-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <input
          type="text"
          placeholder={t('browse:filters.searchPlaceholder')}
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          aria-label={t('browse:filters.searchLabel')}
        />
        {searchTerm && (
          <button
            className="search-clear"
            onClick={() => onSearchChange('')}
            aria-label={t('browse:filters.clearSearch')}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        )}
      </div>

      <div className="filters-controls-row">
        <span className="filters-count">
          {t('browse:filters.count', { filtered: filteredCount, total: totalCount })}
        </span>

        <div className="filters-controls-right">
          <div className="filters-sort">
            <select
              value={sortBy}
              onChange={(event) => onSortChange(event.target.value as SortBy)}
              aria-label={t('browse:filters.sortBy')}
            >
              <option value="trustScore">{t('browse:filters.sortTrustScore')}</option>
              <option value="name">{t('browse:filters.sortName')}</option>
              <option value="country">{t('browse:filters.sortCountry')}</option>
              <option value="category">{t('browse:filters.sortCategory')}</option>
            </select>
            <svg className="sort-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </div>

          <div className="filters-view-toggle">
            <button
              className={`view-toggle-button ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => onViewModeChange('grid')}
              aria-label={t('browse:filters.gridView')}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 11h5V5H4v6zm0 7h5v-6H4v6zm6 0h5v-6h-5v6zm6 0h5v-6h-5v6zm-6-7h5V5h-5v6zm6-6v6h5V5h-5z"/>
              </svg>
            </button>
            <button
              className={`view-toggle-button ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => onViewModeChange('list')}
              aria-label={t('browse:filters.listView')}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 14h4v-4H4v4zm0 5h4v-4H4v4zM4 9h4V5H4v4zm5 5h12v-4H9v4zm0 5h12v-4H9v4zM9 5v4h12V5H9z"/>
              </svg>
            </button>
          </div>

          <button
            className="filters-mobile-toggle"
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            aria-controls="filter-section"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
            </svg>
            {t('browse:filters.filters')}
            {hasActiveFilters && <span className="filter-badge" />}
          </button>
        </div>
      </div>

      {hasActiveFilters && (
        <button className="filters-clear" onClick={onClearAll}>
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
          {t('browse:filters.clearAll')}
        </button>
      )}

      <AnimatePresence>
        {showFilters && (
          <motion.div
            id="filter-section"
            className="filters-section"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="filters-section-content">
              <div className="filters-group">
                <h4 className="filters-group-title">{t('browse:filters.categoryTitle')}</h4>
                {categories.map((category) => (
                  <label key={category.id} className="filter-label">
                    <input
                      type="checkbox"
                      className="filter-checkbox"
                      checked={selectedFilters.category.includes(category.id)}
                      onChange={() => toggleFilter('category', category.id)}
                    />
                    <span className="filter-checkbox-custom">
                      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </span>
                    <span className="filter-label-text">
                      <span className="filter-emoji">{category.emoji}</span>
                      {t(`data:categories.${category.id}.name`)}
                    </span>
                  </label>
                ))}
              </div>

              <div className="filters-group">
                <h4 className="filters-group-title">{t('browse:filters.countryTitle')}</h4>
                {countryCodes.map((code) => (
                  <label key={code} className="filter-label">
                    <input
                      type="checkbox"
                      className="filter-checkbox"
                      checked={selectedFilters.country.includes(code)}
                      onChange={() => toggleFilter('country', code)}
                    />
                    <span className="filter-checkbox-custom">
                      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </span>
                    <span className="filter-label-text">
                      <span className={`fi fi-${code} filter-flag`}></span>
                      {t(`data:countries.${code}`, { defaultValue: code.toUpperCase() })}
                    </span>
                  </label>
                ))}
              </div>

              <div className="filters-group">
                <h4 className="filters-group-title">{t('browse:filters.pricingTitle')}</h4>
                {pricingKeys.map((key) => (
                  <label key={key} className="filter-label">
                    <input
                      type="checkbox"
                      className="filter-checkbox"
                      checked={selectedFilters.pricing.includes(key)}
                      onChange={() => toggleFilter('pricing', key)}
                    />
                    <span className="filter-checkbox-custom">
                      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </span>
                    <span className="filter-label-text">{t(`common:pricing.${key}`)}</span>
                  </label>
                ))}

                <div className="filter-separator" />

                <label className="filter-label">
                  <input
                    type="checkbox"
                    className="filter-checkbox"
                    checked={selectedFilters.openSourceOnly}
                    onChange={() => onFilterChange('openSourceOnly', !selectedFilters.openSourceOnly)}
                  />
                  <span className="filter-checkbox-custom">
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </span>
                  <span className="filter-label-text">{t('browse:filters.openSourceOnly')}</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
