import { describe, expect, it } from "vitest";

import { getEffectiveDimensionScore } from "../src/utils/trustScore";
import type {
  Alternative,
  DimensionBreakdown,
  PenaltyTier,
  TrustScoreBreakdown,
} from "../src/types";

// --- Coverage for issue #550 (request 3) ----------------------------------
// `getEffectiveDimensionScore` is the sort key that powers the new
// per-dimension list-view sorting (BrowsePage's `security | governance |
// reliability | contract` comparator cases). It must:
//   - return the requested dimension's `effective` score for ready entries,
//   - coalesce pending/unscored entries to 0 (so they sort to the bottom),
//   - coalesce a missing breakdown or a missing dimension to 0,
// mirroring `getEffectiveTrustScore`. The test-dev stage deliberately left this
// helper (which did not exist yet at that point) to the coverage stage.
// --------------------------------------------------------------------------

const TIERS: PenaltyTier[] = [
  "security",
  "governance",
  "reliability",
  "contract",
];

function dim(effective: number): DimensionBreakdown {
  return { max: 100, penalties: 100 - effective, signals: 0, effective };
}

function makeBreakdown(
  dimensions: Record<PenaltyTier, DimensionBreakdown>,
): TrustScoreBreakdown {
  return {
    baseClass: "eu",
    baseScore: 70,
    operationalTotal: 15,
    penaltyTotal: 5,
    signalTotal: 3,
    capApplied: null,
    finalScore100: 82,
    dimensions,
  };
}

// Minimal object satisfying the helper's `Pick<...>` parameter type.
type ScoreInput = Pick<
  Alternative,
  "trustScoreStatus" | "trustScoreBreakdown"
>;

describe("getEffectiveDimensionScore (issue #550 per-dimension sort key)", () => {
  it("returns the requested dimension's effective score for ready entries", () => {
    const input: ScoreInput = {
      trustScoreStatus: "ready",
      trustScoreBreakdown: makeBreakdown({
        security: dim(30),
        governance: dim(90),
        reliability: dim(85),
        contract: dim(80),
      }),
    };

    // Each tier resolves to its own distinct value — the helper must not read a
    // fixed dimension regardless of the `tier` argument.
    expect(getEffectiveDimensionScore(input, "security")).toBe(30);
    expect(getEffectiveDimensionScore(input, "governance")).toBe(90);
    expect(getEffectiveDimensionScore(input, "reliability")).toBe(85);
    expect(getEffectiveDimensionScore(input, "contract")).toBe(80);
  });

  it("treats pending entries as unscored (0) even when a full breakdown exists", () => {
    // A pending vendor may still carry stale breakdown data; it must not be
    // ranked ahead of ready entries.
    const input: ScoreInput = {
      trustScoreStatus: "pending",
      trustScoreBreakdown: makeBreakdown({
        security: dim(95),
        governance: dim(95),
        reliability: dim(95),
        contract: dim(95),
      }),
    };

    for (const tier of TIERS) {
      expect(getEffectiveDimensionScore(input, tier)).toBe(0);
    }
  });

  it("returns 0 when trustScoreStatus is undefined", () => {
    const input: ScoreInput = {
      trustScoreStatus: undefined,
      trustScoreBreakdown: makeBreakdown({
        security: dim(50),
        governance: dim(50),
        reliability: dim(50),
        contract: dim(50),
      }),
    };

    expect(getEffectiveDimensionScore(input, "security")).toBe(0);
  });

  it("returns 0 for a ready entry that has no breakdown", () => {
    const input: ScoreInput = {
      trustScoreStatus: "ready",
      trustScoreBreakdown: undefined,
    };

    for (const tier of TIERS) {
      expect(getEffectiveDimensionScore(input, tier)).toBe(0);
    }
  });

  it("returns 0 when the requested dimension is missing from the breakdown", () => {
    // Guards the `?? 0` fallback: a breakdown missing a tier must not throw or
    // return NaN/undefined, or that entry would sort unpredictably.
    const partialDimensions = {
      security: dim(60),
      governance: dim(70),
      // reliability + contract deliberately absent
    } as unknown as Record<PenaltyTier, DimensionBreakdown>;

    const input: ScoreInput = {
      trustScoreStatus: "ready",
      trustScoreBreakdown: makeBreakdown(partialDimensions),
    };

    expect(getEffectiveDimensionScore(input, "security")).toBe(60);
    expect(getEffectiveDimensionScore(input, "reliability")).toBe(0);
    expect(getEffectiveDimensionScore(input, "contract")).toBe(0);
  });

  it("returns a genuine 0 for a present dimension whose effective score is 0", () => {
    const input: ScoreInput = {
      trustScoreStatus: "ready",
      trustScoreBreakdown: makeBreakdown({
        security: dim(0),
        governance: dim(40),
        reliability: dim(40),
        contract: dim(40),
      }),
    };

    expect(getEffectiveDimensionScore(input, "security")).toBe(0);
    expect(getEffectiveDimensionScore(input, "governance")).toBe(40);
  });

  it("orders alternatives by the chosen dimension, sinking pending entries (BrowsePage sort contract)", () => {
    // Reproduces exactly how BrowsePage uses the helper: descending by the
    // dimension's effective score with a stable name tiebreak. Security here is
    // the discriminating dimension — a vendor strong overall but weak on
    // security must fall below one that is strong on security specifically.
    const strongSecurity: Alternative = makeAlt("Strong Security", "ready", {
      security: dim(90),
      governance: dim(40),
      reliability: dim(40),
      contract: dim(40),
    });
    const weakSecurity: Alternative = makeAlt("Weak Security", "ready", {
      security: dim(20),
      governance: dim(95),
      reliability: dim(95),
      contract: dim(95),
    });
    const tiedA: Alternative = makeAlt("Alpha", "ready", {
      security: dim(50),
      governance: dim(50),
      reliability: dim(50),
      contract: dim(50),
    });
    const tiedB: Alternative = makeAlt("Bravo", "ready", {
      security: dim(50),
      governance: dim(50),
      reliability: dim(50),
      contract: dim(50),
    });
    const pending: Alternative = makeAlt("Pending Vendor", "pending", {
      security: dim(99),
      governance: dim(99),
      reliability: dim(99),
      contract: dim(99),
    });

    const sorted = [pending, tiedB, weakSecurity, tiedA, strongSecurity].sort(
      (a, b) => {
        const delta =
          getEffectiveDimensionScore(b, "security") -
          getEffectiveDimensionScore(a, "security");
        if (delta !== 0) return delta;
        return a.name.localeCompare(b.name);
      },
    );

    expect(sorted.map((alt) => alt.name)).toEqual([
      "Strong Security", // 90
      "Alpha", // 50, tiebreak before Bravo
      "Bravo", // 50
      "Weak Security", // 20
      "Pending Vendor", // 0 (pending → bottom despite 99 raw)
    ]);
  });
});

function makeAlt(
  name: string,
  status: Alternative["trustScoreStatus"],
  dimensions: Record<PenaltyTier, DimensionBreakdown>,
): Alternative {
  return {
    id: name.toLowerCase().replace(/\s+/gu, "-"),
    name,
    description: "",
    website: "https://example.eu",
    country: "de",
    category: "messaging",
    replacesUS: [],
    isOpenSource: true,
    pricing: "free",
    tags: [],
    trustScore: 5,
    trustScoreStatus: status,
    trustScoreBreakdown: makeBreakdown(dimensions),
  };
}
