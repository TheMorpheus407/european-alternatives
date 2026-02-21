import { describe, it, expect } from 'vitest';
import type { Reservation, PositiveSignal, PenaltyTier } from '../types';
import { computeDimensions, calculateTrustScoreV11, calculateSimpleTrustScore } from './trustScore';
import {
  CUMULATIVE_PENALTY_CAP,
  DIMENSION_MAXES,
  DIMENSION_BASELINE_FRACTION,
  NON_VETTED_DIMENSION_FRACTION,
} from '../data/scoringConfig';

/** Helper: create a structural reservation (no date -> recency multiplier 1.0). */
function makeReservation(tier: PenaltyTier, amount: number, id?: string): Reservation {
  return {
    id: id ?? `test-${tier}-${amount}`,
    text: `Test reservation (${tier}, ${amount})`,
    severity: 'major',
    penalty: { tier, amount },
  };
}

describe('computeDimensions — cumulative penalty cap', () => {
  const noSignals: PositiveSignal[] = [];

  it('does not scale penalties when total is under the cap', () => {
    // 3 points each in security + governance = 6, well under 15
    const reservations = [
      makeReservation('security', 3),
      makeReservation('governance', 3),
    ];

    const dims = computeDimensions(reservations, noSignals);

    expect(dims.security.penalties).toBe(3);
    expect(dims.governance.penalties).toBe(3);
    expect(dims.reliability.penalties).toBe(0);
    expect(dims.contract.penalties).toBe(0);

    const total = dims.security.penalties + dims.governance.penalties
      + dims.reliability.penalties + dims.contract.penalties;
    expect(total).toBe(6);
  });

  it('does not scale penalties when total equals the cap exactly', () => {
    // Exactly 15 points total: 6 + 4 + 3 + 2
    const reservations = [
      makeReservation('security', 6),
      makeReservation('governance', 4),
      makeReservation('reliability', 3),
      makeReservation('contract', 2),
    ];

    const dims = computeDimensions(reservations, noSignals);

    const total = dims.security.penalties + dims.governance.penalties
      + dims.reliability.penalties + dims.contract.penalties;
    expect(total).toBe(15);

    // Each tier should be unscaled
    expect(dims.security.penalties).toBe(6);
    expect(dims.governance.penalties).toBe(4);
    expect(dims.reliability.penalties).toBe(3);
    expect(dims.contract.penalties).toBe(2);
  });

  it('caps total penalties at 15 when they exceed the cap', () => {
    // 30 total points: 10 in security, 10 in governance, 5 in reliability, 5 in contract
    const reservations = [
      makeReservation('security', 10),
      makeReservation('governance', 10),
      makeReservation('reliability', 5),
      makeReservation('contract', 5),
    ];

    const dims = computeDimensions(reservations, noSignals);

    const total = dims.security.penalties + dims.governance.penalties
      + dims.reliability.penalties + dims.contract.penalties;
    expect(total).toBeCloseTo(CUMULATIVE_PENALTY_CAP, 10);
  });

  it('scales penalties proportionally when cap is applied', () => {
    // 30 total -> scale factor = 15/30 = 0.5
    const reservations = [
      makeReservation('security', 10),
      makeReservation('governance', 10),
      makeReservation('reliability', 5),
      makeReservation('contract', 5),
    ];

    const dims = computeDimensions(reservations, noSignals);

    // Each tier's penalties should be halved
    expect(dims.security.penalties).toBeCloseTo(5, 10);
    expect(dims.governance.penalties).toBeCloseTo(5, 10);
    expect(dims.reliability.penalties).toBeCloseTo(2.5, 10);
    expect(dims.contract.penalties).toBeCloseTo(2.5, 10);
  });

  it('preserves correct effective values after cap scaling', () => {
    // 30 total -> capped to 15 -> scaled by 0.5
    // security: baseline 6, penalty 5 (scaled from 10), no signals -> effective = 1
    // governance: baseline 4, penalty 5 (scaled from 10), no signals -> effective = 0 (floored)
    const reservations = [
      makeReservation('security', 10),
      makeReservation('governance', 10),
      makeReservation('reliability', 5),
      makeReservation('contract', 5),
    ];

    const dims = computeDimensions(reservations, noSignals);

    const secBaseline = DIMENSION_MAXES.security * DIMENSION_BASELINE_FRACTION;
    expect(dims.security.effective).toBeCloseTo(secBaseline - 5, 10); // 6 - 5 = 1

    const govBaseline = DIMENSION_MAXES.governance * DIMENSION_BASELINE_FRACTION;
    expect(dims.governance.effective).toBeCloseTo(Math.max(0, govBaseline - 5), 10); // max(0, 4 - 5) = 0
  });

  it('signals still apply on top of capped penalties', () => {
    // Single-tier overflow: 20 in security, scale = 15/20 = 0.75
    // security penalty = 20 * 0.75 = 15
    // effective = max(0, 6 - 15 + 3) = 0
    const reservations = [
      makeReservation('security', 20),
    ];
    const signals: PositiveSignal[] = [{
      id: 'test-signal', text: 'Test', dimension: 'security', amount: 3, sourceUrl: '',
    }];

    const dims = computeDimensions(reservations, signals);

    expect(dims.security.penalties).toBeCloseTo(15, 10);
    expect(dims.security.signals).toBe(3);
    expect(dims.security.effective).toBe(0);
  });

  it('does not cap exempt penalties', () => {
    // 20 in security via exempt ID + 10 in governance non-exempt
    // Only the 10 in governance is subject to the cap (10 < 15, no scaling)
    // Total effective penalties = 20 + 10 = 30 (exempt bypasses the cap)
    const exemptId = '_non-vetted-discount-security';
    const reservations = [
      makeReservation('security', 20, exemptId),
      makeReservation('governance', 10),
    ];
    const capExemptIds = new Set([exemptId]);

    const dims = computeDimensions(reservations, noSignals, capExemptIds);

    // Exempt penalty applied at full value
    expect(dims.security.penalties).toBe(20);
    // Non-exempt penalty: 10 total capped < 15, no scaling
    expect(dims.governance.penalties).toBe(10);
  });

  it('scales only non-exempt penalties when cap is exceeded', () => {
    // 5 exempt in security, 20 non-exempt in governance -> cap 20 to 15
    // Total: 5 (exempt, full) + 15 (capped) = 20
    const exemptId = '_exempt-test';
    const reservations = [
      makeReservation('security', 5, exemptId),
      makeReservation('governance', 20),
    ];
    const capExemptIds = new Set([exemptId]);

    const dims = computeDimensions(reservations, noSignals, capExemptIds);

    expect(dims.security.penalties).toBe(5); // exempt, not scaled
    expect(dims.governance.penalties).toBeCloseTo(15, 10); // 20 capped to 15
  });
});

describe('calculateTrustScoreV11 — penalty cap integration', () => {
  const noSignals: PositiveSignal[] = [];

  it('reports capped penaltyTotal in breakdown when cap triggers', () => {
    // FOSS base = 80, 30 raw penalty points
    const reservations = [
      makeReservation('security', 10),
      makeReservation('governance', 10),
      makeReservation('reliability', 5),
      makeReservation('contract', 5),
    ];

    const result = calculateTrustScoreV11('foss', reservations, noSignals);

    expect(result.breakdown.penaltyTotal).toBeCloseTo(CUMULATIVE_PENALTY_CAP, 10);
  });

  it('produces higher score with cap than without (regression test)', () => {
    // With 30 raw penalty points, uncapped would give lower score than capped
    const reservations = [
      makeReservation('security', 10),
      makeReservation('governance', 10),
      makeReservation('reliability', 5),
      makeReservation('contract', 5),
    ];

    const result = calculateTrustScoreV11('foss', reservations, noSignals);

    // Without cap: all baselines wiped -> operational = 0 -> raw = 80
    // With cap: penalty = 15, baselines total 16, operational = 16 - 15 = 1 -> raw = 81
    expect(result.breakdown.operationalTotal).toBeGreaterThan(0);
  });

  it('does not affect scoring when penalties are under cap', () => {
    // 4 penalty points total — well under cap
    const reservations = [
      makeReservation('security', 2),
      makeReservation('governance', 2),
    ];

    const result = calculateTrustScoreV11('eu', reservations, noSignals);

    expect(result.breakdown.penaltyTotal).toBe(4);
    // EU base = 70, baselines = 16, penalties = 4, operational = 12
    // raw = 70 + 12 = 82, capped at 97 -> 82
    expect(result.breakdown.finalScore100).toBe(82);
  });
});

describe('calculateSimpleTrustScore — non-vetted discount + penalty cap interaction', () => {
  // Non-vetted discount totals: security 3 + governance 2 + reliability 1.5 + contract 1.5 = 8
  const discountTotal = (['security', 'governance', 'reliability', 'contract'] as PenaltyTier[])
    .reduce((sum, tier) => sum + DIMENSION_MAXES[tier] * DIMENSION_BASELINE_FRACTION * (1 - NON_VETTED_DIMENSION_FRACTION), 0);

  it('discount penalties are not subject to the cumulative cap', () => {
    // A non-vetted EU alternative with 12 real penalty points.
    // discount (8) + real (12) = 20 total. If discount were capped too, scale = 15/20 = 0.75.
    // But discount is exempt, so only real penalties are checked: 12 < 15 -> no scaling.
    const result = calculateSimpleTrustScore({
      country: 'de',
      openSourceLevel: 'none',
      tags: [],
      reservations: [
        { id: 'r1', text: 'Security breach', severity: 'major', penalty: { tier: 'security', amount: 6 } },
        { id: 'r2', text: 'Governance issue', severity: 'major', penalty: { tier: 'governance', amount: 6 } },
      ],
    });

    // Real penalty total = 12, discount total = 8
    // If discount were NOT exempt, total 20 > 15, scale = 0.75
    // discount would become 6 instead of 8, and real 9 instead of 12
    // With exemption: real stays 12 (< 15), discount stays 8
    // Total effective penalties in breakdown = 12 + 8 = 20
    expect(result.breakdown.penaltyTotal).toBeCloseTo(12 + discountTotal, 5);
  });

  it('caps only real penalties when real penalties exceed the cap', () => {
    // Non-vetted alternative with 20 real penalty points (all security).
    // discount = 8 (exempt), real = 20 -> capped to 15.
    // Total effective = 8 + 15 = 23.
    const result = calculateSimpleTrustScore({
      country: 'de',
      openSourceLevel: 'none',
      tags: [],
      reservations: [
        { id: 'r1', text: 'Major security breach', severity: 'major', penalty: { tier: 'security', amount: 20 } },
      ],
    });

    // Real penalty capped to 15, discount stays 8
    expect(result.breakdown.penaltyTotal).toBeCloseTo(15 + discountTotal, 5);
  });

  it('does not affect non-vetted scoring when real penalties are under cap', () => {
    // Non-vetted alternative with 4 real penalty points.
    // discount = 8 (exempt), real = 4 < 15 -> no scaling.
    const result = calculateSimpleTrustScore({
      country: 'de',
      openSourceLevel: 'none',
      tags: [],
      reservations: [
        { id: 'r1', text: 'Minor issue', severity: 'minor', penalty: { tier: 'governance', amount: 4 } },
      ],
    });

    expect(result.breakdown.penaltyTotal).toBeCloseTo(4 + discountTotal, 5);
  });
});
