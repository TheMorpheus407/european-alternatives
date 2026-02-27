<?php
declare(strict_types=1);

/**
 * Alignment v2 Trust Scoring Engine (PHP)
 *
 * Ported from src/utils/trustScore.ts and src/data/scoringConfig.ts.
 * Computes trust scores dynamically from reservations, positive signals,
 * and scoring metadata — no stored scores needed.
 */

// ===========================================================================
// Constants (from scoringConfig.ts)
// ===========================================================================

const SCORING_BASE_SCORES = [
    'foss'      => 80,
    'eu'        => 70,
    'nonEU'     => 65,
    'rest'      => 40,
    'us'        => 20,
    'autocracy' => 10,
];

const SCORING_CLASS_CAPS = [
    'foss'      => 100,
    'eu'        => 97,
    'nonEU'     => 95,
    'rest'      => 70,
    'us'        => 50,
    'autocracy' => 30,
];

const SCORING_AD_SURVEILLANCE_CAP = 45;

const SCORING_CUMULATIVE_PENALTY_CAP = 15;

const SCORING_DIMENSION_MAXES = [
    'security'    => 12,
    'governance'  => 8,
    'reliability' => 6,
    'contract'    => 6,
];

const SCORING_DIMENSION_BASELINE_FRACTION = 0.5;

const SCORING_NON_VETTED_DIMENSION_FRACTION = 0.5;

const SCORING_RECENCY_BRACKETS = [
    ['maxYears' => 1,    'multiplier' => 1.0],
    ['maxYears' => 3,    'multiplier' => 0.5],
    ['maxYears' => 5,    'multiplier' => 0.25],
    ['maxYears' => INF,  'multiplier' => 0.1],
];

const SCORING_EU_MEMBER_STATES = [
    'at', 'be', 'bg', 'hr', 'cy', 'cz', 'dk', 'ee',
    'fi', 'fr', 'de', 'gr', 'hu', 'ie', 'it', 'lv',
    'lt', 'lu', 'mt', 'nl', 'pl', 'pt', 'ro', 'sk',
    'si', 'es', 'se',
];

const SCORING_EUROPEAN_NON_EU = ['ch', 'no', 'gb', 'is'];

const SCORING_PENALTY_TIERS = ['security', 'governance', 'reliability', 'contract'];

const SCORING_TIER_PATTERNS = [
    'security'    => '/breach|vulnerab|cve|exploit|encrypt|tracker|unauthorized|injection|bypass|attack|malicious|phishing|2fa|mfa|credential|leak|compromise|security|audit|pentest|ddos|intercept/i',
    'reliability' => '/outage|incident|downtime|availab|status|deprecat|degrad|disrupt|suspend|latency|maintenance|uptime|infra/i',
    'contract'    => '/lock-in|portab|cancel|terminat|pricing|renewal|arbitrat|subscript|fee|charge|billing|invoice|refund|unilateral|reserve|withhold|waiver|class-action|non-commercial|liability|indemnif|license|restriction|restrict|sublicens/i',
];

// ===========================================================================
// Helper functions
// ===========================================================================

/**
 * Calculate years elapsed since a given ISO date string.
 */
function scoringYearsSince(string $dateStr): float
{
    $then = strtotime($dateStr);
    if ($then === false) {
        return 0.0;
    }
    $now = time();
    return max(0.0, ($now - $then) / (365.25 * 24 * 60 * 60));
}

/**
 * Recency multiplier: structural/ongoing penalties (no date) get 1.0.
 */
function scoringGetRecencyMultiplier(?string $date): float
{
    if ($date === null || $date === '') {
        return 1.0;
    }
    $ageYears = scoringYearsSince($date);
    foreach (SCORING_RECENCY_BRACKETS as $bracket) {
        if ($ageYears < $bracket['maxYears']) {
            return $bracket['multiplier'];
        }
    }
    return 0.1;
}

/**
 * Auto-classify base class from country and open-source level.
 */
function scoringAssignBaseClass(?string $countryCode, ?string $openSourceLevel): string
{
    if ($openSourceLevel === 'full') {
        return 'foss';
    }
    if ($countryCode !== null && in_array($countryCode, SCORING_EU_MEMBER_STATES, true)) {
        return 'eu';
    }
    if ($countryCode !== null && in_array($countryCode, SCORING_EUROPEAN_NON_EU, true)) {
        return 'nonEU';
    }
    if ($countryCode === 'eu') {
        return 'eu';
    }
    if ($countryCode === 'oss') {
        return 'foss';
    }
    if ($countryCode === 'us') {
        return 'us';
    }
    return 'rest';
}

// ===========================================================================
// Core scoring functions
// ===========================================================================

/**
 * Compute per-dimension breakdown from reservations and positive signals.
 *
 * @param array[] $reservations  Each has: penalty => ['tier' => string, 'amount' => float], date => ?string, id => string
 * @param array[] $signals       Each has: dimension => string, amount => float
 * @param array   $capExemptIds  Reservation IDs exempt from cumulative penalty cap
 * @return array<string, array{max: float, penalties: float, signals: float, effective: float}>
 */
function scoringComputeDimensions(array $reservations, array $signals, array $capExemptIds = []): array
{
    $capExemptSet = array_flip($capExemptIds);
    $result = [];

    // First pass: compute raw penalty sums per tier, separating capped and exempt
    $cappedPenalties = [];
    $exemptPenalties = [];
    foreach (SCORING_PENALTY_TIERS as $tier) {
        $cappedSum = 0.0;
        $exemptSum = 0.0;
        foreach ($reservations as $r) {
            if (isset($r['penalty']) && $r['penalty']['tier'] === $tier) {
                $effective = (float)$r['penalty']['amount'] * scoringGetRecencyMultiplier($r['date'] ?? null);
                if (isset($capExemptSet[$r['id']])) {
                    $exemptSum += $effective;
                } else {
                    $cappedSum += $effective;
                }
            }
        }
        $cappedPenalties[$tier] = $cappedSum;
        $exemptPenalties[$tier] = $exemptSum;
    }

    // Apply cumulative penalty cap to non-exempt penalties only
    $totalCappedPenalties = 0.0;
    foreach (SCORING_PENALTY_TIERS as $tier) {
        $totalCappedPenalties += $cappedPenalties[$tier];
    }
    $penaltyScale = $totalCappedPenalties > SCORING_CUMULATIVE_PENALTY_CAP
        ? SCORING_CUMULATIVE_PENALTY_CAP / $totalCappedPenalties
        : 1.0;

    // Second pass: compute dimensions with capped + exempt penalties
    foreach (SCORING_PENALTY_TIERS as $tier) {
        $max = (float)SCORING_DIMENSION_MAXES[$tier];
        $penaltySum = $cappedPenalties[$tier] * $penaltyScale + $exemptPenalties[$tier];

        $signalSum = 0.0;
        foreach ($signals as $s) {
            if ($s['dimension'] === $tier) {
                $signalSum += (float)$s['amount'];
            }
        }

        $baseline = $max * SCORING_DIMENSION_BASELINE_FRACTION;
        $effective = max(0.0, min($max, $baseline - $penaltySum + $signalSum));

        $result[$tier] = [
            'max'       => $max,
            'penalties' => $penaltySum,
            'signals'   => $signalSum,
            'effective' => $effective,
        ];
    }

    return $result;
}

/**
 * Main v2 scoring function for vetted alternatives.
 *
 * @return array{score: float, breakdown: array}
 */
function scoringCalculateTrustScore(
    string $baseClass,
    array $reservations,
    array $signals,
    bool $isAdSurveillance = false,
    array $capExemptIds = []
): array {
    if (!isset(SCORING_BASE_SCORES[$baseClass])) {
        $baseClass = 'rest'; // safe fallback for unknown base classes
    }
    $baseScore = (float)SCORING_BASE_SCORES[$baseClass];
    $dimensions = scoringComputeDimensions($reservations, $signals, $capExemptIds);

    $operationalTotal = 0.0;
    $penaltyTotal = 0.0;
    $signalTotal = 0.0;
    foreach (SCORING_PENALTY_TIERS as $tier) {
        $operationalTotal += $dimensions[$tier]['effective'];
        $penaltyTotal += $dimensions[$tier]['penalties'];
        $signalTotal += $dimensions[$tier]['signals'];
    }

    $raw = $baseScore + $operationalTotal;

    // Apply caps (lowest wins)
    $cap = (float)SCORING_CLASS_CAPS[$baseClass];
    if ($isAdSurveillance) {
        $cap = min($cap, (float)SCORING_AD_SURVEILLANCE_CAP);
    }
    $capped = min($raw, $cap);
    $finalScore100 = max(0.0, min(100.0, $capped));

    return [
        'score' => round($finalScore100) / 10,
        'breakdown' => [
            'baseClass'        => $baseClass,
            'baseScore'        => $baseScore,
            'dimensions'       => $dimensions,
            'operationalTotal' => $operationalTotal,
            'penaltyTotal'     => $penaltyTotal,
            'signalTotal'      => $signalTotal,
            'capApplied'       => $capped < $raw ? $cap : null,
            'finalScore100'    => $finalScore100,
        ],
    ];
}

/**
 * Synthesize penalty fields on reservations that don't already carry explicit
 * penalty data, using severity as a heuristic and text for tier classification.
 *
 * @param array[] $reservations
 * @return array[]
 */
function scoringWithEstimatedPenalties(array $reservations): array
{
    return array_map(function (array $r): array {
        if (isset($r['penalty'])) {
            return $r;
        }

        $tier = 'governance'; // default fallback
        $text = strtolower($r['text'] ?? '');
        foreach (SCORING_TIER_PATTERNS as $t => $pattern) {
            if (preg_match($pattern, $text)) {
                $tier = $t;
                break;
            }
        }

        $severity = $r['severity'] ?? 'minor';
        $amount = $severity === 'major' ? 4.0 : ($severity === 'moderate' ? 2.0 : 1.0);

        $r['penalty'] = [
            'tier'   => $tier,
            'amount' => $amount,
        ];
        return $r;
    }, $reservations);
}

/**
 * Estimate positive signals from tags for non-vetted alternatives.
 *
 * @return array[]
 */
function scoringEstimateSignals(array $entry): array
{
    $tags = array_map('strtolower', $entry['tags'] ?? []);
    $tagSet = array_flip($tags);
    $signals = [];
    $openSourceLevel = $entry['openSourceLevel'] ?? null;
    $selfHostable = $entry['selfHostable'] ?? false;

    // Security signals
    if (isset($tagSet['encryption']) || isset($tagSet['zero-knowledge'])) {
        $signals[] = [
            'id' => 'e2e-encryption-default', 'text' => 'End-to-end encryption',
            'dimension' => 'security', 'amount' => 2.0, 'sourceUrl' => '',
        ];
    }
    if (isset($tagSet['privacy']) || isset($tagSet['no-logs'])) {
        $signals[] = [
            'id' => 'data-minimization-verified', 'text' => 'Privacy / no-logs practices',
            'dimension' => 'security', 'amount' => 1.0, 'sourceUrl' => '',
        ];
    }

    // Governance signals
    if ($openSourceLevel === 'full') {
        $signals[] = [
            'id' => 'full-open-source', 'text' => 'Fully open-source',
            'dimension' => 'governance', 'amount' => 2.0, 'sourceUrl' => '',
        ];
    } elseif ($openSourceLevel === 'partial') {
        $signals[] = [
            'id' => 'partial-open-source', 'text' => 'Partially open-source',
            'dimension' => 'governance', 'amount' => 1.0, 'sourceUrl' => '',
        ];
    }
    if (isset($tagSet['gdpr'])) {
        $signals[] = [
            'id' => 'gdpr-dpa-documented', 'text' => 'GDPR compliance documented',
            'dimension' => 'governance', 'amount' => 1.0, 'sourceUrl' => '',
        ];
    }

    // Reliability signals
    if (isset($tagSet['federated']) || isset($tagSet['local']) || isset($tagSet['offline'])) {
        $signals[] = [
            'id' => 'multi-region-infrastructure', 'text' => 'Federated/local resilience',
            'dimension' => 'reliability', 'amount' => 1.0, 'sourceUrl' => '',
        ];
    }

    // Contract signals
    if ($selfHostable) {
        $signals[] = [
            'id' => 'self-hostable', 'text' => 'Self-hostable',
            'dimension' => 'contract', 'amount' => 2.0, 'sourceUrl' => '',
        ];
    }
    if ($openSourceLevel === 'full') {
        $signals[] = [
            'id' => 'open-standards-no-lock-in', 'text' => 'Open-source prevents lock-in',
            'dimension' => 'contract', 'amount' => 1.0, 'sourceUrl' => '',
        ];
    }

    return $signals;
}

/**
 * Simplified v2 for alternatives without vetted scoring data.
 *
 * @return array{score: float, breakdown: array}
 */
function scoringCalculateSimpleTrustScore(array $entry): array
{
    $countryCode = $entry['country'] ?? null;
    $openSourceLevel = $entry['openSourceLevel'] ?? null;

    $baseClass = scoringAssignBaseClass($countryCode, $openSourceLevel);
    $reservationsWithPenalties = scoringWithEstimatedPenalties($entry['reservations'] ?? []);
    $estimatedSignals = scoringEstimateSignals($entry);

    // Non-vetted: create virtual discount penalties so dimensions start at fraction of max.
    // These are structural, not trust penalties — exempt them from the cumulative penalty cap.
    $discountReservations = [];
    $capExemptIds = [];
    foreach (SCORING_PENALTY_TIERS as $tier) {
        $id = "_non-vetted-discount-{$tier}";
        $discountReservations[] = [
            'id'       => $id,
            'text'     => 'Non-vetted dimension discount',
            'severity' => 'minor',
            'penalty'  => [
                'tier'   => $tier,
                'amount' => SCORING_DIMENSION_MAXES[$tier] * SCORING_DIMENSION_BASELINE_FRACTION * (1 - SCORING_NON_VETTED_DIMENSION_FRACTION),
            ],
        ];
        $capExemptIds[] = $id;
    }

    return scoringCalculateTrustScore(
        $baseClass,
        array_merge($discountReservations, $reservationsWithPenalties),
        $estimatedSignals,
        false,
        $capExemptIds
    );
}

// ===========================================================================
// Main entry point: compute trust score for a catalog entry
// ===========================================================================

/**
 * Compute the trust score for a catalog entry dynamically.
 *
 * @param array      $row             The catalog_entries row (needs: country_code, open_source_level, self_hostable)
 * @param array[]    $reservations    Pre-built reservation arrays (same shape as API output)
 * @param array[]    $signals         Pre-built positive signal arrays (same shape as API output)
 * @param array|null $scoringMeta     Row from scoring_metadata (base_class_override, is_ad_surveillance)
 * @param string[]   $tags            Tag slugs for this entry
 * @return array{trustScore: float, trustScoreStatus: string, trustScoreBreakdown: array|null}
 */
function computeEntryTrustScore(
    array $row,
    array $reservations,
    array $signals,
    ?array $scoringMeta,
    array $tags
): array {
    // Determine if vetted: has scoring_metadata OR has positive_signals in DB
    $isVetted = $scoringMeta !== null || count($signals) > 0;

    if ($isVetted) {
        // Full v2 computation
        $baseClass = $scoringMeta['base_class_override']
            ?? scoringAssignBaseClass($row['country_code'] ?? null, $row['open_source_level'] ?? null);
        $isAdSurveillance = isset($scoringMeta['is_ad_surveillance']) && (bool)$scoringMeta['is_ad_surveillance'];

        $result = scoringCalculateTrustScore($baseClass, $reservations, $signals, $isAdSurveillance);

        return [
            'trustScore'          => $result['score'],
            'trustScoreStatus'    => 'ready',
            'trustScoreBreakdown' => $result['breakdown'],
        ];
    }

    // Non-vetted: simplified computation with dimension discounts and heuristic signals
    $entryForSimple = [
        'country'        => $row['country_code'] ?? null,
        'openSourceLevel' => $row['open_source_level'] ?? null,
        'tags'           => $tags,
        'selfHostable'   => isset($row['self_hostable']) ? (bool)$row['self_hostable'] : false,
        'reservations'   => $reservations,
    ];

    $result = scoringCalculateSimpleTrustScore($entryForSimple);

    return [
        'trustScore'          => $result['score'],
        'trustScoreStatus'    => 'pending',
        'trustScoreBreakdown' => null,
    ];
}
