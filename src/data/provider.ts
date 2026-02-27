/**
 * CatalogData -- the unified data shape consumed by all UI components.
 *
 * Every piece of data that components currently import from `src/data/*` is
 * represented here. The `CatalogContext` provider (see `src/contexts/CatalogContext.tsx`)
 * and its `useCatalog()` hook return this shape regardless of whether the
 * underlying source is the static TypeScript modules (`ts` backend) or the
 * database API (`db` backend).
 *
 * The `loading` and `error` fields only matter for the `db` path.
 * When `dataBackend === 'ts'`, loading is always `false` and error is always `null`.
 */

import type { Alternative, Category, FurtherReadingResource } from '../types';
import type { LandingCategoryGroup } from './landingCategoryGroups';

export interface CatalogData {
  /** All merged and scored alternatives (manual + research). */
  alternatives: Alternative[];

  /** Category definitions including emoji and US giant mappings. */
  categories: Category[];

  /** External resource links for the Further Reading page. */
  furtherReadingResources: FurtherReadingResource[];

  /** Grouping of categories for the landing page grid layout. */
  landingCategoryGroups: LandingCategoryGroup[];

  /** `true` while the DB backend is fetching data. Always `false` for the TS backend. */
  loading: boolean;

  /** Non-null when the DB backend encountered a fetch error. Always `null` for the TS backend. */
  error: string | null;
}
