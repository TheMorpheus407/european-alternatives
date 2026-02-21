import type { BaseClass, CountryCode, PenaltyTier } from '../types';

// Alignment v1.1 base scores (0–100 scale)
export const BASE_SCORES: Record<BaseClass, number> = {
  foss: 80,
  eu: 70,
  nonEU: 65,
  rest: 40,
  us: 20,
  autocracy: 10,
};

// Hard caps per base class (0–100 scale)
export const CLASS_CAPS: Record<BaseClass, number> = {
  foss: 100,
  eu: 97,
  nonEU: 95,
  rest: 70,
  us: 50,
  autocracy: 30,
};

// Core ad-surveillance business model cap
export const AD_SURVEILLANCE_CAP = 45;

// Total effective penalties (after recency decay) are capped at this value.
// No alternative loses more than CUMULATIVE_PENALTY_CAP points from penalties.
export const CUMULATIVE_PENALTY_CAP = 15;

// Per-dimension maximum operational scores (total = 32)
export const DIMENSION_MAXES: Record<PenaltyTier, number> = {
  security: 12,
  governance: 8,
  reliability: 6,
  contract: 6,
};

// Vetted alternatives start at this fraction of each dimension max (not at full max)
export const DIMENSION_BASELINE_FRACTION = 0.5;

// Non-vetted alternatives start at this fraction of the vetted baseline
export const NON_VETTED_DIMENSION_FRACTION = 0.5;

// Recency multipliers for penalties — ordered by ascending age bracket
export const RECENCY_BRACKETS: { maxYears: number; multiplier: number }[] = [
  { maxYears: 1, multiplier: 1.0 },
  { maxYears: 3, multiplier: 0.5 },
  { maxYears: 5, multiplier: 0.25 },
  { maxYears: Infinity, multiplier: 0.1 },
];

// EU member states (Tier 1 — full EU jurisdiction)
export const EU_MEMBER_STATES: Set<CountryCode> = new Set([
  'at', 'be', 'bg', 'hr', 'cy', 'cz', 'dk', 'ee',
  'fi', 'fr', 'de', 'gr', 'hu', 'ie', 'it', 'lv',
  'lt', 'lu', 'mt', 'nl', 'pl', 'pt', 'ro', 'sk',
  'si', 'es', 'se',
]);

// European non-EU jurisdictions (Tier 1 — European but outside EU)
export const EUROPEAN_NON_EU: Set<CountryCode> = new Set(['ch', 'no', 'gb', 'is']);
