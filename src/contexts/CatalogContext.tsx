import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Alternative, Category, FurtherReadingResource, LandingCategoryGroup } from '../types';
import type { CatalogData } from '../data/provider';

// Re-export CatalogData so existing consumers can import from either location.
export type { CatalogData };

type CatalogContextValue = CatalogData;

// ---------------------------------------------------------------------------
// Initial state (empty until the API responds)
// ---------------------------------------------------------------------------

const EMPTY_CONTEXT: CatalogContextValue = {
  alternatives: [],
  usVendors: [],
  categories: [],
  furtherReadingResources: [],
  landingCategoryGroups: [],
  loading: true,
  error: null,
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const CatalogContext = createContext<CatalogContextValue>(EMPTY_CONTEXT);

// ---------------------------------------------------------------------------
// API client
// ---------------------------------------------------------------------------

const API_BASE = '/api/catalog';

async function fetchCatalogFromApi(): Promise<Omit<CatalogData, 'loading' | 'error'>> {
  const [entriesRes, usEntriesRes, categoriesRes, furtherReadingRes, landingGroupsRes] = await Promise.all([
    fetch(`${API_BASE}/entries?status=alternative`),
    fetch(`${API_BASE}/entries?status=us`),
    fetch(`${API_BASE}/categories`),
    fetch(`${API_BASE}/further-reading`),
    fetch(`${API_BASE}/landing-groups`),
  ]);

  if (!entriesRes.ok) throw new Error(`API error: entries returned ${entriesRes.status}`);
  if (!usEntriesRes.ok) throw new Error(`API error: us entries returned ${usEntriesRes.status}`);
  if (!categoriesRes.ok) throw new Error(`API error: categories returned ${categoriesRes.status}`);
  if (!furtherReadingRes.ok) throw new Error(`API error: further-reading returned ${furtherReadingRes.status}`);
  if (!landingGroupsRes.ok) throw new Error(`API error: landing-groups returned ${landingGroupsRes.status}`);

  const [entriesJson, usEntriesJson, categoriesJson, furtherReadingJson, landingGroupsJson] = await Promise.all([
    entriesRes.json(),
    usEntriesRes.json(),
    categoriesRes.json(),
    furtherReadingRes.json(),
    landingGroupsRes.json(),
  ]);

  const alternatives = entriesJson?.data;
  const usVendors = usEntriesJson?.data;
  const categories = categoriesJson?.data;
  const furtherReading = furtherReadingJson?.data;
  const landingGroups = landingGroupsJson?.data;

  if (!Array.isArray(alternatives)) throw new Error('API returned invalid entries payload');
  if (!Array.isArray(usVendors)) throw new Error('API returned invalid us entries payload');
  if (!Array.isArray(categories)) throw new Error('API returned invalid categories payload');
  if (!Array.isArray(furtherReading)) throw new Error('API returned invalid further-reading payload');
  if (!Array.isArray(landingGroups)) throw new Error('API returned invalid landing-groups payload');

  // Spot-check first element shape to catch contract drift early.
  if (alternatives.length > 0 && typeof alternatives[0].id !== 'string') {
    throw new Error('API entries payload has unexpected element shape (missing id)');
  }
  if (categories.length > 0 && typeof categories[0].id !== 'string') {
    throw new Error('API categories payload has unexpected element shape (missing id)');
  }

  return {
    alternatives: alternatives as Alternative[],
    usVendors: usVendors as Alternative[],
    categories: categories as Category[],
    furtherReadingResources: furtherReading as FurtherReadingResource[],
    landingCategoryGroups: landingGroups as LandingCategoryGroup[],
  };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface CatalogProviderProps {
  children: ReactNode;
}

export function CatalogProvider({ children }: CatalogProviderProps) {
  const [state, setState] = useState<CatalogContextValue>(EMPTY_CONTEXT);

  useEffect(() => {
    let cancelled = false;

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
