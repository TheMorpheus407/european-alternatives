import type {
  Alternative,
  PenaltyTier,
  Reservation,
} from '../types';
import {
  RECENCY_BRACKETS,
} from '../data/scoringConfig';

// --- Display helpers (used by AlternativeCard.tsx and BrowsePage.tsx) ---
// Scoring computation has moved to the PHP API (api/catalog/scoring.php).

/** Calculate years elapsed since a given ISO date string. */
function yearsSince(dateStr: string): number {
  const then = new Date(dateStr);
  const now = new Date();
  return Math.max(0, (now.getTime() - then.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
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

// --- Heuristic penalty estimation for display ---

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

/** Return the trust score for sorting — uses the already-assigned score. */
export function getEffectiveTrustScore(
  alternative: Pick<Alternative, 'trustScore'>,
): number {
  return alternative.trustScore ?? 0;
}

