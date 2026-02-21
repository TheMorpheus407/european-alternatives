import type {
  Alternative,
  BaseClass,
  CountryCode,
  DimensionBreakdown,
  OpenSourceLevel,
  PenaltyTier,
  PositiveSignal,
  Reservation,
  TrustScoreBreakdown,
} from '../types';
import {
  BASE_SCORES,
  CLASS_CAPS,
  AD_SURVEILLANCE_CAP,
  DIMENSION_MAXES,
  DIMENSION_BASELINE_FRACTION,
  NON_VETTED_DIMENSION_FRACTION,
  RECENCY_BRACKETS,
  EU_MEMBER_STATES,
  EUROPEAN_NON_EU,
} from '../data/scoringConfig';

// --- Alignment v2 scoring engine ---

export interface V11ScoringResult {
  score: number;              // 0–10 scale, one decimal
  breakdown: TrustScoreBreakdown;
}

const PENALTY_TIERS: PenaltyTier[] = ['security', 'governance', 'reliability', 'contract'];

/** Auto-classify base class from alternative properties. */
export function assignBaseClass(
  country: CountryCode,
  openSourceLevel: OpenSourceLevel,
): BaseClass {
  if (openSourceLevel === 'full') return 'foss';
  if (EU_MEMBER_STATES.has(country)) return 'eu';
  if (EUROPEAN_NON_EU.has(country)) return 'nonEU';
  if (country === 'eu') return 'eu';
  if (country === 'us') return 'us';
  return 'rest';
}

/** Calculate years elapsed since a given ISO date string. */
function yearsSince(dateStr: string): number {
  const then = new Date(dateStr);
  const now = new Date();
  return (now.getTime() - then.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
}

/** Recency multiplier: structural/ongoing penalties (no date) get 1.0. */
export function getRecencyMultiplier(date?: string): number {
  if (!date) return 1.0;
  const ageYears = yearsSince(date);
  for (const bracket of RECENCY_BRACKETS) {
    if (ageYears < bracket.maxYears) return bracket.multiplier;
  }
  return 0.1;
}

/**
 * Compute per-dimension breakdown from reservations and positive signals.
 * Each dimension starts at a baseline fraction of MAX, penalties subtract
 * (with recency decay), positive signals add back. Effective is clamped to [0, max].
 */
export function computeDimensions(
  reservations: Reservation[],
  signals: PositiveSignal[],
): Record<PenaltyTier, DimensionBreakdown> {
  const result = {} as Record<PenaltyTier, DimensionBreakdown>;

  for (const tier of PENALTY_TIERS) {
    const max = DIMENSION_MAXES[tier];

    let penaltySum = 0;
    for (const r of reservations) {
      if (r.penalty && r.penalty.tier === tier) {
        penaltySum += r.penalty.amount * getRecencyMultiplier(r.date);
      }
    }

    let signalSum = 0;
    for (const s of signals) {
      if (s.dimension === tier) {
        signalSum += s.amount;
      }
    }

    const baseline = max * DIMENSION_BASELINE_FRACTION;
    const effective = Math.max(0, Math.min(max, baseline - penaltySum + signalSum));

    result[tier] = { max, penalties: penaltySum, signals: signalSum, effective };
  }

  return result;
}

/** Main v2 scoring function for vetted alternatives. */
export function calculateTrustScoreV11(
  baseClass: BaseClass,
  reservations: Reservation[],
  signals: PositiveSignal[],
  isAdSurveillance?: boolean,
): V11ScoringResult {
  const baseScore = BASE_SCORES[baseClass];
  const dimensions = computeDimensions(reservations, signals);

  let operationalTotal = 0;
  let penaltyTotal = 0;
  let signalTotal = 0;
  for (const tier of PENALTY_TIERS) {
    operationalTotal += dimensions[tier].effective;
    penaltyTotal += dimensions[tier].penalties;
    signalTotal += dimensions[tier].signals;
  }

  const raw = baseScore + operationalTotal;

  // Apply caps (lowest wins)
  let cap = CLASS_CAPS[baseClass];
  if (isAdSurveillance) cap = Math.min(cap, AD_SURVEILLANCE_CAP);
  const capped = Math.min(raw, cap);
  const finalScore100 = Math.max(0, Math.min(100, capped));

  return {
    score: Math.round(finalScore100) / 10,
    breakdown: {
      baseClass,
      baseScore,
      dimensions,
      operationalTotal,
      penaltyTotal,
      signalTotal,
      capApplied: capped < raw ? cap : null,
      finalScore100,
    },
  };
}

// --- Heuristic penalty/signal estimation for non-vetted alternatives ---

/** Text-based heuristic patterns for 4-tier penalty classification. */
const TIER_PATTERNS: { tier: PenaltyTier; pattern: RegExp }[] = [
  { tier: 'security', pattern: /breach|vulnerab|cve|exploit|encrypt|tracker|unauthorized|injection|bypass|attack|malicious|phishing|2fa|mfa|credential|leak|compromise|security|audit|pentest|ddos|intercept/i },
  { tier: 'reliability', pattern: /outage|incident|downtime|availab|status|deprecat|degrad|disrupt|suspend|latency|maintenance|uptime|infra/i },
  { tier: 'contract', pattern: /lock-in|portab|cancel|terminat|pricing|renewal|arbitrat|subscript|fee|charge|billing|invoice|refund|unilateral|reserve|withhold|waiver|class-action|non-commercial|liability|indemnif|license|restriction|restrict|sublicens/i },
];

/**
 * Synthesize penalty fields on reservations that don't already carry explicit
 * penalty data, using severity as a heuristic and text for tier classification.
 */
export function withEstimatedPenalties(reservations: Reservation[]): Reservation[] {
  return reservations.map((r) => {
    if (r.penalty) return r;

    let tier: PenaltyTier = 'governance'; // default fallback
    const text = r.text.toLowerCase();
    for (const { tier: t, pattern } of TIER_PATTERNS) {
      if (pattern.test(text)) {
        tier = t;
        break;
      }
    }

    return {
      ...r,
      penalty: {
        tier,
        amount: r.severity === 'major' ? 4 : r.severity === 'moderate' ? 2 : 1,
      },
    };
  });
}

/** Estimate positive signals from tags for non-vetted alternatives. */
function estimateSignals(alt: {
  tags: string[];
  selfHostable?: boolean;
  openSourceLevel?: OpenSourceLevel;
}): PositiveSignal[] {
  const tags = new Set(alt.tags.map((t) => t.toLowerCase()));
  const signals: PositiveSignal[] = [];

  // Security signals
  if (tags.has('encryption') || tags.has('zero-knowledge')) {
    signals.push({
      id: 'e2e-encryption-default', text: 'End-to-end encryption',
      dimension: 'security', amount: 2, sourceUrl: '',
    });
  }
  if (tags.has('privacy') || tags.has('no-logs')) {
    signals.push({
      id: 'data-minimization-verified', text: 'Privacy / no-logs practices',
      dimension: 'security', amount: 1, sourceUrl: '',
    });
  }

  // Governance signals
  if (alt.openSourceLevel === 'full') {
    signals.push({
      id: 'full-open-source', text: 'Fully open-source',
      dimension: 'governance', amount: 2, sourceUrl: '',
    });
  } else if (alt.openSourceLevel === 'partial') {
    signals.push({
      id: 'partial-open-source', text: 'Partially open-source',
      dimension: 'governance', amount: 1, sourceUrl: '',
    });
  }
  if (tags.has('gdpr')) {
    signals.push({
      id: 'gdpr-dpa-documented', text: 'GDPR compliance documented',
      dimension: 'governance', amount: 1, sourceUrl: '',
    });
  }

  // Reliability signals
  if (tags.has('federated') || tags.has('local') || tags.has('offline')) {
    signals.push({
      id: 'multi-region-infrastructure', text: 'Federated/local resilience',
      dimension: 'reliability', amount: 1, sourceUrl: '',
    });
  }

  // Contract signals
  if (alt.selfHostable) {
    signals.push({
      id: 'self-hostable', text: 'Self-hostable',
      dimension: 'contract', amount: 2, sourceUrl: '',
    });
  }
  if (alt.openSourceLevel === 'full') {
    signals.push({
      id: 'open-standards-no-lock-in', text: 'Open-source prevents lock-in',
      dimension: 'contract', amount: 1, sourceUrl: '',
    });
  }

  return signals;
}

/** Simplified v2 for alternatives without vetted scoring data. */
export function calculateSimpleTrustScore(alt: {
  country: CountryCode;
  openSourceLevel: OpenSourceLevel;
  tags: string[];
  selfHostable?: boolean;
  reservations?: Reservation[];
}): V11ScoringResult {
  const baseClass = assignBaseClass(alt.country, alt.openSourceLevel);
  const reservationsWithPenalties = withEstimatedPenalties(alt.reservations ?? []);
  const estimatedSignals = estimateSignals(alt);

  // Non-vetted: create virtual discount penalties so dimensions start at fraction of max
  const discountReservations: Reservation[] = PENALTY_TIERS.map((tier) => ({
    id: `_non-vetted-discount-${tier}`,
    text: 'Non-vetted dimension discount',
    severity: 'minor' as const,
    penalty: {
      tier,
      amount: DIMENSION_MAXES[tier] * DIMENSION_BASELINE_FRACTION * (1 - NON_VETTED_DIMENSION_FRACTION),
    },
  }));

  return calculateTrustScoreV11(
    baseClass,
    [...discountReservations, ...reservationsWithPenalties],
    estimatedSignals,
  );
}

/** Return the trust score for sorting — uses the already-assigned score. */
export function getEffectiveTrustScore(
  alternative: Pick<Alternative, 'trustScore'>,
): number {
  return alternative.trustScore ?? 0;
}
