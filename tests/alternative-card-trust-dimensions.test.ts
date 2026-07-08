import { createElement } from "react";
import type { ComponentType, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { describe, expect, it, vi } from "vitest";

import AlternativeCard from "../src/components/AlternativeCard";
import type {
  Alternative,
  CardViewMode,
  DimensionBreakdown,
  PenaltyTier,
  TrustScoreBreakdown,
} from "../src/types";

// --- Behavioral contract for issue #550 -----------------------------------
// 1. The per-dimension trust breakdown (Security / Governance / Reliability /
//    Contract) must be visible at a glance in the LIST view without the user
//    having to click "show more". The motivating example from the issue: a
//    vendor whose security score is low while everything else is high should
//    make that low security score visible without interaction.
// 2. The "US Company Profile" block must be simplified to a plain list — the
//    duplicated, per-vendor rich trust-score breakdown (equation + summary
//    table behind a per-vendor expand toggle) must no longer be rendered.
// 3. Overlay/detail mode must keep force-expanding the full breakdown
//    (regression guard for the request-1 refactor).
// --------------------------------------------------------------------------

vi.mock("../src/contexts/CatalogContext", () => ({
  useCatalog: () => ({ categories: [] }),
}));

vi.mock("react-i18next", () => {
  const translations: Record<string, string> = {
    "browse:card.trustScoreLabel": "Trust Score: {{score}}/10",
    "browse:card.trustScorePending": "Not rated yet",
    "browse:card.trustScoreBreakdownTitle": "Trust Score Breakdown",
    "browse:card.trustScoreBreakdownExplanation": "How the score is built.",
    "browse:card.trustScoreBreakdownEquation":
      "{{base}} + {{operational}} = {{final}}/10",
    "browse:card.trustScoreBreakdownEquationCapped":
      "{{base}} + {{operational}} → capped at {{cap}} = {{final}}/10",
    "browse:card.trustScoreBreakdownBase": "Base score ({{baseClass}})",
    "browse:card.trustScoreBreakdownReservations": "Reservations",
    "browse:card.trustScoreBreakdownSignals": "Positive signals",
    "browse:card.trustScoreBreakdownOperational": "Operational",
    "browse:card.trustScoreBreakdownRaw": "Raw",
    "browse:card.trustScoreBreakdownClassCap": "Class cap",
    "browse:card.trustScoreBreakdownFinal": "Final",
    "browse:card.baseClass.eu": "EU",
    "browse:card.baseClass.us": "US",
    "browse:card.penaltyTier.security": "Security",
    "browse:card.penaltyTier.governance": "Governance",
    "browse:card.penaltyTier.reliability": "Reliability",
    "browse:card.penaltyTier.contract": "Contract",
    "browse:card.dimensionDesc.security": "Audits, encryption, vulnerabilities",
    "browse:card.dimensionDesc.governance": "Ownership, transparency",
    "browse:card.dimensionDesc.reliability": "Uptime, incidents",
    "browse:card.dimensionDesc.contract": "Portability, lock-in",
    "browse:card.usVendorComparison": "US Company Profile",
    "browse:card.showUSVendorDetails": "Show details",
    "browse:card.hideUSVendorDetails": "Hide details",
    "browse:card.showUSVendorDetailsFor": "Show US company profiles for {{name}}",
    "browse:card.hideUSVendorDetailsFor": "Hide US company profiles for {{name}}",
    "browse:card.showMore": "Show more",
    "browse:card.showMoreFor": "Show more about {{name}}",
    "browse:card.addToCompare": "Add {{name}} to comparison",
    "browse:card.removeFromCompare": "Remove {{name}} from comparison",
    "common:pricing.free": "Free",
    "common:pricing.paid": "Paid",
    "common:proprietary": "Proprietary",
    "common:openSourceFull": "Open source",
  };

  return {
    useTranslation: () => ({
      t: (key: string, values?: Record<string, string | number>) => {
        const template = translations[key] ?? key;
        return template.replace(/\{\{(\w+)\}\}/gu, (_match, name: string) =>
          String(values?.[name] ?? ""),
        );
      },
      i18n: { language: "en" },
    }),
  };
});

vi.mock("framer-motion", async () => {
  const React = await vi.importActual<typeof import("react")>("react");

  return {
    AnimatePresence: ({ children }: { children?: ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    motion: {
      div: (allProps: Record<string, unknown> & { children?: ReactNode }) => {
        // Strip framer-motion-only props so they don't leak onto the DOM node.
        const domProps: Record<string, unknown> = { ...allProps };
        for (const key of [
          "children",
          "whileHover",
          "transition",
          "initial",
          "animate",
          "exit",
        ]) {
          delete domProps[key];
        }
        return React.createElement("div", domProps, allProps.children);
      },
    },
  };
});

// Production per-dimension maxes (api/catalog/scoring.php:38-43). The card
// colours each dimension by the RATIO effective/max, so fixtures MUST use these
// real ceilings: a max:100 fixture inflates effective10 into the aggregate's
// 0–10 range and masks the always-red scale bug that motivated this fix.
const DIMENSION_MAXES: Record<PenaltyTier, number> = {
  security: 12,
  governance: 8,
  reliability: 6,
  contract: 6,
};

function dim(effective: number, max: number): DimensionBreakdown {
  return { max, penalties: Math.max(0, max - effective), signals: 0, effective };
}

// Build a dimension record where every tier shares the same effective/max
// ratio. Used to pin the fractional colour thresholds: with a uniform ratio
// exactly one bucket may appear in the rendered strip, so an off-by-one at a
// boundary flips the whole strip and is impossible to miss.
function dimsAtRatio(ratio: number): Record<PenaltyTier, DimensionBreakdown> {
  return {
    security: dim(ratio * DIMENSION_MAXES.security, DIMENSION_MAXES.security),
    governance: dim(
      ratio * DIMENSION_MAXES.governance,
      DIMENSION_MAXES.governance,
    ),
    reliability: dim(
      ratio * DIMENSION_MAXES.reliability,
      DIMENSION_MAXES.reliability,
    ),
    contract: dim(ratio * DIMENSION_MAXES.contract, DIMENSION_MAXES.contract),
  };
}

function breakdown(
  overrides: Partial<TrustScoreBreakdown> = {},
): TrustScoreBreakdown {
  return {
    baseClass: "eu",
    baseScore: 70,
    operationalTotal: 15,
    penaltyTotal: 5,
    signalTotal: 3,
    capApplied: null,
    finalScore100: 82,
    dimensions: {
      // Low security, high everything else — the issue's motivating scenario.
      // Under the real 12/8/6/6 maxes the RATIO drives the colour:
      //   security   3/12  = 0.25  → low
      //   governance 7/8   = 0.875 → high
      //   reliability 4/6  ≈ 0.67  → medium
      //   contract   5/6   ≈ 0.83  → high
      security: dim(3, DIMENSION_MAXES.security),
      governance: dim(7, DIMENSION_MAXES.governance),
      reliability: dim(4, DIMENSION_MAXES.reliability),
      contract: dim(5, DIMENSION_MAXES.contract),
    } satisfies Record<PenaltyTier, DimensionBreakdown>,
    ...overrides,
  };
}

function makeAlternative(overrides: Partial<Alternative> = {}): Alternative {
  return {
    id: "signal-eu",
    name: "Signal EU",
    description: "A privacy-focused European messenger.",
    website: "https://example.eu",
    country: "de",
    category: "messaging",
    replacesUS: [],
    isOpenSource: true,
    openSourceLevel: "full",
    pricing: "free",
    tags: [],
    trustScore: 8.2,
    trustScoreStatus: "ready",
    trustScoreBreakdown: breakdown(),
    ...overrides,
  };
}

const usVendor: Alternative = {
  id: "us-giant",
  name: "Big US Corp",
  description: "A large US messaging vendor.",
  website: "https://bigus.example",
  country: "us",
  category: "messaging",
  replacesUS: [],
  isOpenSource: false,
  pricing: "paid",
  tags: [],
  trustScore: 2.5,
  trustScoreStatus: "ready",
  trustScoreBreakdown: breakdown({
    baseClass: "us",
    baseScore: 40,
    operationalTotal: 0,
    penaltyTotal: 30,
    signalTotal: 0,
    capApplied: 30,
    finalScore100: 25,
    dimensions: {
      security: dim(2, DIMENSION_MAXES.security),
      governance: dim(1, DIMENSION_MAXES.governance),
      reliability: dim(2, DIMENSION_MAXES.reliability),
      contract: dim(1, DIMENSION_MAXES.contract),
    },
  }),
};

const CardForTest = AlternativeCard as unknown as ComponentType<{
  alternative: Alternative;
  viewMode: CardViewMode;
  usVendorLookup: Map<string, Alternative>;
  overlayMode?: boolean;
}>;

function renderCard(props: {
  alternative: Alternative;
  viewMode: CardViewMode;
  usVendorLookup?: Map<string, Alternative>;
  overlayMode?: boolean;
}): string {
  return renderToStaticMarkup(
    createElement(CardForTest, {
      usVendorLookup: new Map(),
      ...props,
    }),
  );
}

const TIER_LABELS: Record<PenaltyTier, string> = {
  security: "Security",
  governance: "Governance",
  reliability: "Reliability",
  contract: "Contract",
};

describe("AlternativeCard — trust dimension breakdown by default (issue #550)", () => {
  it("surfaces all four dimension scores in list view without any interaction", () => {
    const html = renderCard({
      alternative: makeAlternative({ replacesUS: [] }),
      viewMode: "list",
      overlayMode: false,
    });

    // Every dimension label must be visible at a glance (no click required).
    for (const label of Object.values(TIER_LABELS)) {
      expect(html).toContain(label);
    }

    // The numeric per-dimension values must be present so they can be compared
    // quickly. They render on the same ten-scale as the aggregate (effective /
    // 10, max / 10), so the real 12/8/6/6 ceilings show as small effective/max
    // pairs — but each dimension, including the deliberately low security one,
    // is visible without interaction.
    expect(html).toContain("0.3/1.2"); // security   3 / 12
    expect(html).toContain("0.7/0.8"); // governance 7 / 8
    expect(html).toContain("0.4/0.6"); // reliability 4 / 6
    expect(html).toContain("0.5/0.6"); // contract   5 / 6
  });

  it("keeps the low security score visible even when the aggregate score is high", () => {
    const html = renderCard({
      alternative: makeAlternative(),
      viewMode: "list",
      overlayMode: false,
    });

    // Aggregate trust score is high (8.2) but the security dimension is low
    // (3/12 = 0.25); both must be readable without expanding anything, and the
    // low security ratio must read red at a glance.
    expect(html).toContain("Trust Score: 8.2/10");
    expect(html).toContain("Security");
    expect(html).toContain("0.3/1.2");
    expect(html).toContain("alt-card-trust-dimension-score-low");
  });
});

describe("AlternativeCard — simplified US Company Profile (issue #550)", () => {
  it("does not render the duplicated per-vendor trust-score breakdown", () => {
    const html = renderCard({
      alternative: makeAlternative({ replacesUS: ["us-giant"] }),
      viewMode: "list",
      usVendorLookup: new Map([["us-giant", usVendor]]),
    });

    // The per-vendor rich breakdown (its expand toggle + region id) must be
    // gone — that duplicated equation/summary UI is what the issue calls out
    // as wasted rendering for structurally-low US scores.
    expect(html).not.toContain("alt-us-vendor-breakdown-");
  });

  it("still shows each US vendor's name and scalar trust score as a plain list", () => {
    const html = renderCard({
      alternative: makeAlternative({ replacesUS: ["us-giant"] }),
      viewMode: "list",
      usVendorLookup: new Map([["us-giant", usVendor]]),
    });

    // Nothing of value is lost: the vendor and its at-a-glance score remain.
    expect(html).toContain("Big US Corp");
    expect(html).toContain("2.5");
  });

  it("renders an unresolved US vendor as a pending badge, never a breakdown", () => {
    // A replacesUS slug with no match in the lookup becomes a pending
    // placeholder (name = slug, status = "pending"). The refactored
    // ready/pending ternary must still render the pending badge for it — and
    // the removed per-vendor rich breakdown must not reappear for pending rows.
    const html = renderCard({
      alternative: makeAlternative({ replacesUS: ["unknown-us-vendor"] }),
      viewMode: "list",
      usVendorLookup: new Map(), // slug is unresolved → pending placeholder
    });

    expect(html).toContain("unknown-us-vendor");
    // "Not rated yet" proves the pending (else) branch fired — the ready branch
    // would have rendered a "Trust Score: …/10" badge instead.
    expect(html).toContain("Not rated yet");
    expect(html).toContain("alt-card-badge-trust-pending");
    // The removed per-vendor breakdown must not reappear for pending rows.
    expect(html).not.toContain("alt-us-vendor-breakdown-");
  });
});

describe("AlternativeCard — compact dimension strip colour by ratio (issue #550)", () => {
  it("colours each dimension by its effective/max RATIO under production maxes", () => {
    const html = renderCard({
      alternative: makeAlternative({
        trustScoreBreakdown: breakdown({
          dimensions: {
            security: dim(3, DIMENSION_MAXES.security), // 3/12  = 0.25  → low
            governance: dim(7, DIMENSION_MAXES.governance), // 7/8 = 0.875 → high
            reliability: dim(4, DIMENSION_MAXES.reliability), // 4/6 ≈ 0.67 → medium
            contract: dim(5, DIMENSION_MAXES.contract), // 5/6   ≈ 0.83  → high
          },
        }),
      }),
      viewMode: "list",
      overlayMode: false,
    });

    // Under the real 12/8/6/6 maxes every effective10 is <= 1.2. Bucketing on
    // the absolute ten-scale value would paint ALL of them red (the bug this fix
    // targets); bucketing on the ratio makes them span low / medium / high.
    expect(html).toContain("alt-card-trust-dimension-score-low");
    expect(html).toContain("alt-card-trust-dimension-score-medium");
    expect(html).toContain("alt-card-trust-dimension-score-high");
  });

  it("renders a low-ratio dimension red and a high-ratio dimension green under realistic maxes", () => {
    // A uniform low ratio (0.25) must produce ONLY the low class — never high,
    // which is exactly what the absolute-scale bug could never guarantee.
    const lowOnly = renderCard({
      alternative: makeAlternative({
        trustScoreBreakdown: breakdown({ dimensions: dimsAtRatio(3 / 12) }),
      }),
      viewMode: "list",
      overlayMode: false,
    });
    expect(lowOnly).toContain("alt-card-trust-dimension-score-low");
    expect(lowOnly).not.toContain("alt-card-trust-dimension-score-medium");
    expect(lowOnly).not.toContain("alt-card-trust-dimension-score-high");

    // A uniform high ratio (0.875) must produce ONLY the high class.
    const highOnly = renderCard({
      alternative: makeAlternative({
        trustScoreBreakdown: breakdown({ dimensions: dimsAtRatio(7 / 8) }),
      }),
      viewMode: "list",
      overlayMode: false,
    });
    expect(highOnly).toContain("alt-card-trust-dimension-score-high");
    expect(highOnly).not.toContain("alt-card-trust-dimension-score-low");
    expect(highOnly).not.toContain("alt-card-trust-dimension-score-medium");
  });

  it("pins the fractional thresholds at 0.5 and 0.7 (boundary coverage)", () => {
    const bucketAt = (ratio: number): string => {
      const html = renderCard({
        alternative: makeAlternative({
          trustScoreBreakdown: breakdown({ dimensions: dimsAtRatio(ratio) }),
        }),
        viewMode: "list",
        overlayMode: false,
      });
      const buckets = {
        low: html.includes("alt-card-trust-dimension-score-low"),
        medium: html.includes("alt-card-trust-dimension-score-medium"),
        high: html.includes("alt-card-trust-dimension-score-high"),
      };
      // Ratio is uniform across every dimension, so exactly one bucket may show.
      const active = Object.entries(buckets).filter(([, on]) => on);
      expect(active).toHaveLength(1);
      return active[0][0];
    };

    // Below 0.5 is low; 0.5 exactly flips to medium (threshold is `< 0.5`).
    expect(bucketAt(0.49)).toBe("low");
    expect(bucketAt(0.5)).toBe("medium");
    // 0.7 exactly is still medium; just above flips to high (threshold `<= 0.7`).
    expect(bucketAt(0.7)).toBe("medium");
    expect(bucketAt(0.71)).toBe("high");
  });

  it("coalesces a zero-max dimension to the low bucket without dividing by zero", () => {
    // Guards the call-site ratio guard's false branch:
    //   max10 > 0 && Number.isFinite(effective10) ? effective10 / max10 : 0
    // A max of 0 makes effective/max non-finite (Infinity/NaN). The guard must
    // fall the ratio to 0 → the low class, and never leak NaN/Infinity into the
    // rendered effective/max pair. Every other test uses positive 12/8/6/6
    // maxes, so this defensive branch was otherwise unexercised.
    const html = renderCard({
      alternative: makeAlternative({
        trustScoreBreakdown: breakdown({
          dimensions: {
            security: dim(5, 0),
            governance: dim(5, 0),
            reliability: dim(5, 0),
            contract: dim(5, 0),
          },
        }),
      }),
      viewMode: "list",
      overlayMode: false,
    });

    // Uniform zero-max ⇒ every dimension buckets low, and nothing else.
    expect(html).toContain("alt-card-trust-dimension-score-low");
    expect(html).not.toContain("alt-card-trust-dimension-score-medium");
    expect(html).not.toContain("alt-card-trust-dimension-score-high");
    // The guard prevents divide-by-zero from surfacing in the displayed pair.
    expect(html).not.toContain("NaN");
    expect(html).not.toContain("Infinity");
    // The numeric pair still renders (effective 5 → 0.5, max 0 → 0.0).
    expect(html).toContain("0.5/0.0");
  });

  it("also surfaces the compact dimension strip in grid view (not only list)", () => {
    const html = renderCard({
      alternative: makeAlternative(),
      viewMode: "grid",
      overlayMode: false,
    });

    // The strip is gated on `!trustBreakdownExpanded`, not on the view mode, so
    // a collapsed grid card shows it too — the four labels + scores at a glance.
    for (const label of Object.values(TIER_LABELS)) {
      expect(html).toContain(label);
    }
    expect(html).toContain("alt-card-trust-dimension-score-low"); // security 3/12 = 0.25
  });

  it("does not render the compact strip when the full breakdown is expanded (overlay)", () => {
    const html = renderCard({
      alternative: makeAlternative(),
      viewMode: "grid",
      overlayMode: true,
    });

    // Strip and full breakdown are mutually exclusive: overlay force-expands the
    // full breakdown, so the compact strip's colour-coded score chips must be
    // absent (the dimension data still appears inside the full breakdown grid).
    expect(html).not.toContain("alt-card-trust-dimension-score-");
  });
});

describe("AlternativeCard — overlay still force-expands full breakdown (issue #550 regression guard)", () => {
  it("renders the full trust-score breakdown summary in overlay mode", () => {
    const html = renderCard({
      alternative: makeAlternative(),
      viewMode: "grid",
      overlayMode: true,
    });

    // Detail/overlay view must keep the complete breakdown, not just the
    // compact dimension strip — the request-1 refactor must not regress it.
    expect(html).toContain("Trust Score Breakdown");
    expect(html).toContain("alt-card-trust-breakdown-summary");
    expect(html).toContain("8.2/10"); // final score row
  });
});
