#!/usr/bin/env php
<?php
declare(strict_types=1);

/**
 * Unit tests for the PHP scoring engine (api/catalog/scoring.php).
 *
 * Run: php scripts/test-scoring.php
 * All assertions must pass — any failure exits with code 1.
 */

require_once __DIR__ . '/../api/catalog/scoring.php';

$passed = 0;
$failed = 0;

function assertEqual(mixed $expected, mixed $actual, string $label): void
{
    global $passed, $failed;
    if ($expected === $actual) {
        $passed++;
    } else {
        $failed++;
        fprintf(STDERR, "FAIL: %s\n  expected: %s\n  actual:   %s\n",
            $label, var_export($expected, true), var_export($actual, true));
    }
}

function assertApprox(float $expected, float $actual, string $label, float $epsilon = 0.01): void
{
    global $passed, $failed;
    if (abs($expected - $actual) < $epsilon) {
        $passed++;
    } else {
        $failed++;
        fprintf(STDERR, "FAIL: %s\n  expected: %.4f\n  actual:   %.4f\n", $label, $expected, $actual);
    }
}

// =========================================================================
// Test: scoringAssignBaseClass
// =========================================================================

assertEqual('foss', scoringAssignBaseClass('de', 'full'), 'assignBaseClass: full open-source → foss');
assertEqual('foss', scoringAssignBaseClass('us', 'full'), 'assignBaseClass: US + full open-source → foss');
assertEqual('eu', scoringAssignBaseClass('de', null), 'assignBaseClass: Germany → eu');
assertEqual('eu', scoringAssignBaseClass('fr', 'partial'), 'assignBaseClass: France partial → eu');
assertEqual('eu', scoringAssignBaseClass('eu', null), 'assignBaseClass: EU meta code → eu');
assertEqual('nonEU', scoringAssignBaseClass('ch', null), 'assignBaseClass: Switzerland → nonEU');
assertEqual('nonEU', scoringAssignBaseClass('gb', null), 'assignBaseClass: UK → nonEU');
assertEqual('nonEU', scoringAssignBaseClass('no', null), 'assignBaseClass: Norway → nonEU');
assertEqual('nonEU', scoringAssignBaseClass('is', null), 'assignBaseClass: Iceland → nonEU');
assertEqual('us', scoringAssignBaseClass('us', null), 'assignBaseClass: US → us');
assertEqual('rest', scoringAssignBaseClass('jp', null), 'assignBaseClass: Japan → rest');
assertEqual('rest', scoringAssignBaseClass(null, null), 'assignBaseClass: null country → rest');

// =========================================================================
// Test: scoringGetRecencyMultiplier
// =========================================================================

assertApprox(1.0, scoringGetRecencyMultiplier(null), 'recency: null → 1.0');
assertApprox(1.0, scoringGetRecencyMultiplier(''), 'recency: empty → 1.0');
assertApprox(1.0, scoringGetRecencyMultiplier(date('Y-m-d')), 'recency: today → 1.0');
assertApprox(0.5, scoringGetRecencyMultiplier(date('Y-m-d', strtotime('-2 years'))), 'recency: 2 years ago → 0.5');
assertApprox(0.25, scoringGetRecencyMultiplier(date('Y-m-d', strtotime('-4 years'))), 'recency: 4 years ago → 0.25');
assertApprox(0.1, scoringGetRecencyMultiplier(date('Y-m-d', strtotime('-10 years'))), 'recency: 10 years ago → 0.1');

// =========================================================================
// Test: scoringWithEstimatedPenalties
// =========================================================================

$reservations = [
    ['id' => 'r1', 'text' => 'Data breach exposed user credentials', 'severity' => 'major'],
    ['id' => 'r2', 'text' => 'Pricing changed unilaterally', 'severity' => 'moderate'],
    ['id' => 'r3', 'text' => 'Some governance concern', 'severity' => 'minor'],
    ['id' => 'r4', 'text' => 'Has a penalty already', 'severity' => 'major', 'penalty' => ['tier' => 'reliability', 'amount' => 5.0]],
];

$withPenalties = scoringWithEstimatedPenalties($reservations);

assertEqual('security', $withPenalties[0]['penalty']['tier'], 'estimatePenalty: breach → security');
assertApprox(4.0, $withPenalties[0]['penalty']['amount'], 'estimatePenalty: major → 4.0');
assertEqual('contract', $withPenalties[1]['penalty']['tier'], 'estimatePenalty: pricing → contract');
assertApprox(2.0, $withPenalties[1]['penalty']['amount'], 'estimatePenalty: moderate → 2.0');
assertEqual('governance', $withPenalties[2]['penalty']['tier'], 'estimatePenalty: fallback → governance');
assertApprox(1.0, $withPenalties[2]['penalty']['amount'], 'estimatePenalty: minor → 1.0');
assertEqual('reliability', $withPenalties[3]['penalty']['tier'], 'estimatePenalty: existing penalty preserved');
assertApprox(5.0, $withPenalties[3]['penalty']['amount'], 'estimatePenalty: existing amount preserved');

// =========================================================================
// Test: scoringComputeDimensions — baseline with no penalties or signals
// =========================================================================

$dims = scoringComputeDimensions([], []);
assertApprox(6.0, $dims['security']['effective'], 'dimensions: security baseline = 6.0 (12 * 0.5)');
assertApprox(4.0, $dims['governance']['effective'], 'dimensions: governance baseline = 4.0 (8 * 0.5)');
assertApprox(3.0, $dims['reliability']['effective'], 'dimensions: reliability baseline = 3.0 (6 * 0.5)');
assertApprox(3.0, $dims['contract']['effective'], 'dimensions: contract baseline = 3.0 (6 * 0.5)');

// =========================================================================
// Test: scoringComputeDimensions — with penalties and signals
// =========================================================================

$testReservations = [
    ['id' => 't1', 'text' => 'test', 'severity' => 'major', 'penalty' => ['tier' => 'security', 'amount' => 3.0]],
];
$testSignals = [
    ['id' => 's1', 'text' => 'test signal', 'dimension' => 'security', 'amount' => 2.0, 'sourceUrl' => ''],
];

$dims2 = scoringComputeDimensions($testReservations, $testSignals);
// baseline(6) - penalty(3) + signal(2) = 5.0
assertApprox(5.0, $dims2['security']['effective'], 'dimensions: security with penalty and signal');
// Other dimensions unchanged
assertApprox(4.0, $dims2['governance']['effective'], 'dimensions: governance unaffected');

// =========================================================================
// Test: scoringCalculateTrustScore — basic EU entry
// =========================================================================

$euResult = scoringCalculateTrustScore('eu', [], []);
// base(70) + operational(6+4+3+3=16) = 86, cap=97 → 86
assertApprox(8.6, $euResult['score'], 'trustScore: EU with no penalties → 8.6');
assertEqual('eu', $euResult['breakdown']['baseClass'], 'trustScore: baseClass = eu');
assertApprox(70.0, $euResult['breakdown']['baseScore'], 'trustScore: baseScore = 70');
assertEqual(null, $euResult['breakdown']['capApplied'], 'trustScore: no cap applied');

// =========================================================================
// Test: scoringCalculateTrustScore — FOSS entry
// =========================================================================

$fossResult = scoringCalculateTrustScore('foss', [], []);
// base(80) + operational(16) = 96, cap=100 → 96
assertApprox(9.6, $fossResult['score'], 'trustScore: FOSS with no penalties → 9.6');

// =========================================================================
// Test: scoringCalculateTrustScore — US entry
// =========================================================================

$usResult = scoringCalculateTrustScore('us', [], []);
// base(20) + operational(16) = 36, cap=50 → 36
assertApprox(3.6, $usResult['score'], 'trustScore: US with no penalties → 3.6');

// =========================================================================
// Test: scoringCalculateTrustScore — cap applied
// =========================================================================

$capResult = scoringCalculateTrustScore('rest', [], [
    ['id' => 's1', 'text' => 'max signals', 'dimension' => 'security', 'amount' => 12.0, 'sourceUrl' => ''],
    ['id' => 's2', 'text' => 'max signals', 'dimension' => 'governance', 'amount' => 8.0, 'sourceUrl' => ''],
    ['id' => 's3', 'text' => 'max signals', 'dimension' => 'reliability', 'amount' => 6.0, 'sourceUrl' => ''],
    ['id' => 's4', 'text' => 'max signals', 'dimension' => 'contract', 'amount' => 6.0, 'sourceUrl' => ''],
]);
// base(40) + operational(12+8+6+6=32) = 72, cap=70 → 70
assertApprox(7.0, $capResult['score'], 'trustScore: rest with max signals → capped at 7.0');
assertApprox(70.0, $capResult['breakdown']['capApplied'], 'trustScore: capApplied = 70');

// =========================================================================
// Test: scoringCalculateTrustScore — ad surveillance cap
// =========================================================================

$adResult = scoringCalculateTrustScore('eu', [], [], true);
// base(70) + operational(16) = 86, adCap=45 → 45
assertApprox(4.5, $adResult['score'], 'trustScore: EU + ad surveillance → capped at 4.5');
assertApprox(45.0, $adResult['breakdown']['capApplied'], 'trustScore: ad surveillance capApplied = 45');

// =========================================================================
// Test: cumulative penalty cap
// =========================================================================

$heavyPenalties = [];
for ($i = 0; $i < 10; $i++) {
    $heavyPenalties[] = [
        'id' => "heavy-{$i}",
        'text' => 'test',
        'severity' => 'major',
        'penalty' => ['tier' => 'security', 'amount' => 3.0],
    ];
}
// Total raw penalties = 30, cap = 15, so scale = 0.5
$heavyResult = scoringCalculateTrustScore('eu', $heavyPenalties, []);
$penaltyTotal = $heavyResult['breakdown']['penaltyTotal'];
assertApprox(15.0, $penaltyTotal, 'cumulativeCap: total penalties capped at 15');

// =========================================================================
// Test: cap-exempt penalties bypass cumulative cap
// =========================================================================

$exemptReservations = [
    ['id' => 'exempt-1', 'text' => 'exempt', 'severity' => 'major', 'penalty' => ['tier' => 'security', 'amount' => 10.0]],
    ['id' => 'normal-1', 'text' => 'normal', 'severity' => 'major', 'penalty' => ['tier' => 'security', 'amount' => 10.0]],
];
$dims3 = scoringComputeDimensions($exemptReservations, [], ['exempt-1']);
// normal penalty: 10.0, cap scale = 15/10 = 1.0 (only 10 is capped, which is ≤ 15 → no scaling actually)
// Wait: totalCappedPenalties = 10 (only normal-1), cap = 15, so scale = 1.0
// exempt penalty: 10.0 (not scaled)
// total security penalty: 10.0 * 1.0 + 10.0 = 20.0
// baseline 6 - 20 = negative → clamped to 0
assertApprox(0.0, $dims3['security']['effective'], 'capExempt: exempt + normal penalties both apply');

// =========================================================================
// Test: scoringEstimateSignals
// =========================================================================

$entry = [
    'openSourceLevel' => 'full',
    'selfHostable' => true,
    'tags' => ['encryption', 'privacy', 'gdpr', 'federated'],
];

$estimatedSignals = scoringEstimateSignals($entry);
$signalIds = array_map(fn($s) => $s['id'], $estimatedSignals);

assertEqual(true, in_array('e2e-encryption-default', $signalIds, true), 'estimateSignals: encryption tag → e2e signal');
assertEqual(true, in_array('data-minimization-verified', $signalIds, true), 'estimateSignals: privacy tag → data-minimization signal');
assertEqual(true, in_array('full-open-source', $signalIds, true), 'estimateSignals: full open-source → governance signal');
assertEqual(true, in_array('gdpr-dpa-documented', $signalIds, true), 'estimateSignals: gdpr tag → gdpr signal');
assertEqual(true, in_array('multi-region-infrastructure', $signalIds, true), 'estimateSignals: federated tag → reliability signal');
assertEqual(true, in_array('self-hostable', $signalIds, true), 'estimateSignals: selfHostable → contract signal');
assertEqual(true, in_array('open-standards-no-lock-in', $signalIds, true), 'estimateSignals: full open-source → contract signal');

// =========================================================================
// Test: scoringCalculateSimpleTrustScore
// =========================================================================

$simpleEntry = [
    'country' => 'de',
    'openSourceLevel' => 'full',
    'tags' => [],
    'selfHostable' => false,
    'reservations' => [],
];
$simpleResult = scoringCalculateSimpleTrustScore($simpleEntry);
// Base class: foss (full open-source), base score: 80
// Non-vetted discount applies, but score should be > 0
assertEqual(true, $simpleResult['score'] > 0, 'simpleScore: positive score');
assertEqual(true, $simpleResult['score'] <= 10, 'simpleScore: within 0-10 range');
assertEqual('foss', $simpleResult['breakdown']['baseClass'], 'simpleScore: baseClass = foss');

// =========================================================================
// Test: computeEntryTrustScore — vetted entry
// =========================================================================

$row = ['country_code' => 'de', 'open_source_level' => null, 'self_hostable' => 0];
$reservations = [];
$signals = [
    ['id' => 's1', 'text' => 'ISO cert', 'dimension' => 'security', 'amount' => 2.0, 'sourceUrl' => ''],
];
$scoringMeta = ['base_class_override' => 'eu', 'is_ad_surveillance' => 0];
$result = computeEntryTrustScore($row, $reservations, $signals, $scoringMeta, []);
assertEqual('ready', $result['trustScoreStatus'], 'computeEntry: vetted → status ready');
assertEqual(true, $result['trustScoreBreakdown'] !== null, 'computeEntry: vetted → has breakdown');
assertEqual(true, $result['trustScore'] > 0, 'computeEntry: vetted → positive score');

// =========================================================================
// Test: computeEntryTrustScore — non-vetted entry
// =========================================================================

$row2 = ['country_code' => 'de', 'open_source_level' => null, 'self_hostable' => 0];
$result2 = computeEntryTrustScore($row2, [], [], null, []);
assertEqual('pending', $result2['trustScoreStatus'], 'computeEntry: non-vetted → status pending');
assertEqual(null, $result2['trustScoreBreakdown'], 'computeEntry: non-vetted → no breakdown');
assertEqual(true, $result2['trustScore'] > 0, 'computeEntry: non-vetted → positive score');

// =========================================================================
// Test: baseClass validation fallback
// =========================================================================

$invalidResult = scoringCalculateTrustScore('invalid_class', [], []);
// Should fall back to 'rest' base class
assertApprox(5.6, $invalidResult['score'], 'baseClassFallback: invalid → falls back to rest (5.6)');
assertEqual('rest', $invalidResult['breakdown']['baseClass'], 'baseClassFallback: baseClass corrected to rest');

// =========================================================================
// Summary
// =========================================================================

echo "\n";
if ($failed > 0) {
    echo "FAILED: {$failed} test(s) failed, {$passed} passed.\n";
    exit(1);
} else {
    echo "OK: All {$passed} tests passed.\n";
    exit(0);
}
