// Scoring constants used by frontend display helpers.
// Full scoring computation has moved to the PHP API (api/catalog/scoring.php).

// Total effective penalties (after recency decay) are capped at this value.
// No alternative loses more than CUMULATIVE_PENALTY_CAP points from penalties.
export const CUMULATIVE_PENALTY_CAP = 15;

// Recency multipliers for penalties — ordered by ascending age bracket
export const RECENCY_BRACKETS: { maxYears: number; multiplier: number }[] = [
  { maxYears: 1, multiplier: 1.0 },
  { maxYears: 3, multiplier: 0.5 },
  { maxYears: 5, multiplier: 0.25 },
  { maxYears: Infinity, multiplier: 0.1 },
];
