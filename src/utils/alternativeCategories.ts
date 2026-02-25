import type { Alternative, CategoryId } from '../types';

export function getAlternativeCategories(
  alternative: Pick<Alternative, 'category' | 'secondaryCategories'>,
): CategoryId[] {
  const allCategories = [alternative.category, ...(alternative.secondaryCategories ?? [])];
  return Array.from(new Set(allCategories));
}
