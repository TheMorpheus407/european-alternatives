import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Alternative, Category, FurtherReadingResource } from '../types';
import type { LandingCategoryGroup } from '../data/landingCategoryGroups';
import type { CatalogData } from '../data/provider';
import { alternatives as tsAlternatives, categories as tsCategories, furtherReadingResources as tsFurtherReadingResources } from '../data';
import { landingCategoryGroups as tsLandingCategoryGroups } from '../data/landingCategoryGroups';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DataBackend = 'ts' | 'db';

interface FeatureFlags {
  dataBackend: DataBackend;
}

// Re-export CatalogData so existing consumers can import from either location.
export type { CatalogData };

type CatalogContextValue = CatalogData;

// ---------------------------------------------------------------------------
// Defaults (TS path — immediate, synchronous)
// ---------------------------------------------------------------------------

const DEFAULT_CONTEXT_VALUE: CatalogContextValue = {
  alternatives: tsAlternatives,
  categories: tsCategories,
  furtherReadingResources: tsFurtherReadingResources,
  landingCategoryGroups: tsLandingCategoryGroups,
  loading: false,
  error: null,
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const CatalogContext = createContext<CatalogContextValue>(DEFAULT_CONTEXT_VALUE);

// ---------------------------------------------------------------------------
// Feature flag loader
// ---------------------------------------------------------------------------

const FLAGS_URL = '/api/config/flags.json';
const DEFAULT_FLAGS: FeatureFlags = { dataBackend: 'ts' };

async function fetchFeatureFlags(): Promise<FeatureFlags> {
  try {
    const response = await fetch(FLAGS_URL);
    if (!response.ok) return DEFAULT_FLAGS;
    const json: unknown = await response.json();
    if (
      typeof json === 'object' &&
      json !== null &&
      'dataBackend' in json &&
      (json as FeatureFlags).dataBackend === 'db'
    ) {
      return { dataBackend: 'db' };
    }
    return DEFAULT_FLAGS;
  } catch {
    return DEFAULT_FLAGS;
  }
}

// ---------------------------------------------------------------------------
// API client (DB path only)
// ---------------------------------------------------------------------------

const API_BASE = '/api/catalog';

async function fetchCatalogFromApi(): Promise<Omit<CatalogData, 'loading' | 'error'>> {
  const [entriesRes, categoriesRes, furtherReadingRes, landingGroupsRes] = await Promise.all([
    fetch(`${API_BASE}/entries?status=alternative`),
    fetch(`${API_BASE}/categories`),
    fetch(`${API_BASE}/further-reading`),
    fetch(`${API_BASE}/landing-groups`),
  ]);

  if (!entriesRes.ok) throw new Error(`API error: entries returned ${entriesRes.status}`);
  if (!categoriesRes.ok) throw new Error(`API error: categories returned ${categoriesRes.status}`);
  if (!furtherReadingRes.ok) throw new Error(`API error: further-reading returned ${furtherReadingRes.status}`);
  if (!landingGroupsRes.ok) throw new Error(`API error: landing-groups returned ${landingGroupsRes.status}`);

  const [entriesJson, categoriesJson, furtherReadingJson, landingGroupsJson] = await Promise.all([
    entriesRes.json(),
    categoriesRes.json(),
    furtherReadingRes.json(),
    landingGroupsRes.json(),
  ]);

  return {
    alternatives: entriesJson.data as Alternative[],
    categories: categoriesJson.data as Category[],
    furtherReadingResources: furtherReadingJson.data as FurtherReadingResource[],
    landingCategoryGroups: landingGroupsJson.data as LandingCategoryGroup[],
  };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface CatalogProviderProps {
  children: ReactNode;
}

export function CatalogProvider({ children }: CatalogProviderProps) {
  const [state, setState] = useState<CatalogContextValue>(DEFAULT_CONTEXT_VALUE);

  useEffect(() => {
    let cancelled = false;

    fetchFeatureFlags().then((flags) => {
      if (cancelled) return;

      if (flags.dataBackend === 'ts') {
        // TS path: data is already loaded synchronously via the default value.
        // No state update needed — DEFAULT_CONTEXT_VALUE has everything.
        return;
      }

      // DB path: fetch from API with loading state.
      setState((prev) => ({ ...prev, loading: true, error: null }));

      fetchCatalogFromApi()
        .then((data) => {
          if (cancelled) return;
          setState({
            ...data,
            loading: false,
            error: null,
          });
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          const message = err instanceof Error ? err.message : 'Data temporarily unavailable.';
          setState((prev) => ({
            ...prev,
            loading: false,
            error: message,
          }));
        });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CatalogContext.Provider value={state}>
      {children}
    </CatalogContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

// eslint-disable-next-line react-refresh/only-export-components -- Hook must be co-located with its context provider
export function useCatalog(): CatalogContextValue {
  return useContext(CatalogContext);
}
