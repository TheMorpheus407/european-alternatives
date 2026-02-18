import type { Alternative, OpenSourceLevel } from '../types';
import { manualAlternatives } from './manualAlternatives';
import { researchAlternatives } from './researchAlternatives';
import { reservationsById, trustScoresById } from './trustOverrides';
import { calculateTrustScore } from '../utils/trustScore';
import { buildUSVendorComparisons } from './usVendors';

const pricingLikeTagKeys = new Set(['free', 'freemium', 'paid', 'free-and-paid']);
const opennessTagKeys = new Set([
  'open-source',
  'open-source-software',
  'opensource',
  'partial-open-source',
  'partly-open-source',
  'proprietary',
]);
const openSourceTagByLevel: Record<OpenSourceLevel, string> = {
  full: 'open-source',
  partial: 'partly-open-source',
  none: 'proprietary',
};

function normalizeTagKey(tag: string): string {
  return tag.trim().toLowerCase().replace(/[\s_]+/g, '-');
}

function sanitizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const sanitized: string[] = [];

  for (const tag of tags) {
    const trimmed = tag.trim();
    if (!trimmed) continue;

    const normalized = normalizeTagKey(trimmed);
    if (pricingLikeTagKeys.has(normalized) || opennessTagKeys.has(normalized) || seen.has(normalized)) continue;

    seen.add(normalized);
    sanitized.push(trimmed);
  }

  return sanitized;
}

function resolveOpenSourceLevel(alternative: Pick<Alternative, 'isOpenSource' | 'openSourceLevel'>): OpenSourceLevel {
  if (alternative.openSourceLevel === 'full' || alternative.openSourceLevel === 'partial' || alternative.openSourceLevel === 'none') {
    return alternative.openSourceLevel;
  }

  return alternative.isOpenSource ? 'full' : 'none';
}

function normalizeReplacesUS(names: string[], category: Alternative['category']): string[] {
  return names.map((name) => {
    const normalized = name.trim().toLowerCase();

    if (normalized !== 'outlook') {
      return name;
    }

    if (category === 'email') {
      return 'Outlook.com';
    }

    if (category === 'mail-client') {
      return 'Microsoft Outlook (Desktop)';
    }

    return name;
  });
}

function mergeCatalogue(): Alternative[] {
  const deduped = new Map<string, Alternative>();

  for (const alternative of [...manualAlternatives, ...researchAlternatives]) {
    // Manual entries win if IDs collide in future updates.
    if (!deduped.has(alternative.id)) {
      deduped.set(alternative.id, alternative);
    }
  }

  const merged = Array.from(deduped.values()).map((alternative) => {
    const openSourceLevel = resolveOpenSourceLevel(alternative);
    const isOpenSource = openSourceLevel !== 'none';
    const tags = [openSourceTagByLevel[openSourceLevel], ...sanitizeTags(alternative.tags)];
    const replacesUS = normalizeReplacesUS(alternative.replacesUS, alternative.category);
    const reservations = alternative.reservations ?? reservationsById[alternative.id] ?? [];
    const computedTrustScore = calculateTrustScore({
      country: alternative.country,
      isOpenSource,
      openSourceLevel,
      tags,
      reservations,
    });
    const trustScore = trustScoresById[alternative.id];
    const trustScoreStatus = trustScore != null ? 'ready' as const : 'pending' as const;

    return {
      ...alternative,
      isOpenSource,
      openSourceLevel,
      tags,
      replacesUS,
      logo: alternative.logo ?? `/logos/${alternative.id}.svg`,
      reservations,
      trustScore,
      usVendorComparisons: buildUSVendorComparisons(replacesUS),
      trustScoreStatus,
      trustScoreBreakdown: trustScoreStatus === 'pending' ? computedTrustScore.breakdown : undefined,
    };
  });

  return merged.sort((a, b) => a.name.localeCompare(b.name));
}

export const alternatives: Alternative[] = mergeCatalogue();
