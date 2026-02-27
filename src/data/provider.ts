/**
 * CatalogData -- the unified data shape consumed by all UI components.
 *
 * Every piece of data that components currently import from `src/data/*` is
 * represented here. The `CatalogContext` provider (see `src/contexts/CatalogContext.tsx`)
 * and its `useCatalog()` hook return this shape regardless of whether the
 * underlying source is the database API.
 */

import type { Alternative, Category, FurtherReadingResource, LandingCategoryGroup } from '../types';

export interface CatalogData {
  /** All merged and scored alternatives (manual + research). */
  alternatives: Alternative[];

  /** US vendor entries (status='us'), fetched separately for client-side comparison building. */
  usVendors: Alternative[];

  /** Category definitions including emoji and US giant mappings. */
  categories: Category[];

  /** External resource links for the Further Reading page. */
  furtherReadingResources: FurtherReadingResource[];

  /** Grouping of categories for the landing page grid layout. */
  landingCategoryGroups: LandingCategoryGroup[];

  /** `true` while the API is fetching data. */
  loading: boolean;

  /** Non-null when the API fetch encountered an error. */
  error: string | null;
}
