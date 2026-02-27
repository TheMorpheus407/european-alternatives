<?php
declare(strict_types=1);

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/scoring.php';

requireHttpMethod('GET');

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

$validLocales = ['en', 'de'];

$slug   = $_GET['slug']   ?? '';
$locale = $_GET['locale'] ?? 'en';

if ($slug === '' || !is_string($slug)) {
    sendJsonResponse(400, [
        'ok'    => false,
        'error' => 'missing_slug',
        'detail' => 'Query parameter "slug" is required.',
    ]);
}

// Sanitize slug: allow only alphanumeric, hyphens, underscores, dots.
if (!preg_match('/^[a-zA-Z0-9._-]+$/', $slug)) {
    sendJsonResponse(400, [
        'ok'    => false,
        'error' => 'invalid_slug',
        'detail' => 'Slug contains invalid characters.',
    ]);
}

if (!in_array($locale, $validLocales, true)) {
    sendJsonResponse(400, [
        'ok'    => false,
        'error' => 'invalid_locale',
        'detail' => 'Allowed values: ' . implode(', ', $validLocales),
    ]);
}

// ---------------------------------------------------------------------------
// Database connection
// ---------------------------------------------------------------------------

try {
    $pdo = getDatabaseConnection();
} catch (Throwable $e) {
    error_log(sprintf('[api][catalog/entry] DB connection failed: %s', $e->getMessage()));
    sendJsonResponse(500, [
        'ok'    => false,
        'error' => 'database_unavailable',
    ]);
}

// ---------------------------------------------------------------------------
// 1. Fetch the catalog entry by slug
// ---------------------------------------------------------------------------

$descExpr = $locale === 'de'
    ? 'COALESCE(ce.description_de, ce.description_en)'
    : 'ce.description_en';

$entrySql = <<<SQL
SELECT
    ce.id,
    ce.slug,
    ce.status,
    ce.name,
    {$descExpr}                       AS description,
    ce.description_en,
    ce.description_de,
    ce.country_code,
    ce.website_url,
    ce.logo_path,
    ce.pricing,
    ce.is_open_source,
    ce.open_source_level,
    ce.open_source_audit_url,
    ce.source_code_url,
    ce.self_hostable,
    ce.founded_year,
    ce.headquarters_city,
    ce.license_text,
    ce.action_links_json,
    ce.date_added
FROM catalog_entries ce
WHERE ce.slug = :slug
  AND (ce.is_active = 1 OR ce.status = 'denied')
LIMIT 1
SQL;

try {
    $stmt = $pdo->prepare($entrySql);
    $stmt->execute(['slug' => $slug]);
    $row = $stmt->fetch();
} catch (Throwable $e) {
    error_log(sprintf('[api][catalog/entry] Entry query failed: %s', $e->getMessage()));
    sendJsonResponse(500, ['ok' => false, 'error' => 'query_failed']);
}

if ($row === false) {
    sendJsonResponse(404, [
        'ok'    => false,
        'error' => 'not_found',
        'detail' => 'No active entry found for the given slug.',
    ]);
}

$eid = (int)$row['id'];

// ---------------------------------------------------------------------------
// 2-9. Fetch related data, assemble, and respond
// ---------------------------------------------------------------------------

try {

// ---------------------------------------------------------------------------
// 2. Fetch categories
// ---------------------------------------------------------------------------

$catSql = <<<SQL
SELECT
    ec.category_id,
    ec.is_primary,
    ec.sort_order
FROM entry_categories ec
WHERE ec.entry_id = :eid
ORDER BY ec.is_primary DESC, ec.sort_order ASC
SQL;

$catStmt = $pdo->prepare($catSql);
$catStmt->execute(['eid' => $eid]);
$catRows = $catStmt->fetchAll();

$primaryCategory     = null;
$secondaryCategories = [];
foreach ($catRows as $cr) {
    if ((bool)$cr['is_primary']) {
        $primaryCategory = $cr['category_id'];
    } else {
        $secondaryCategories[] = $cr['category_id'];
    }
}

// ---------------------------------------------------------------------------
// 3. Fetch tags
// ---------------------------------------------------------------------------

$tagSql = <<<SQL
SELECT t.slug
FROM entry_tags et
JOIN tags t ON t.id = et.tag_id
WHERE et.entry_id = :eid
ORDER BY et.sort_order ASC
SQL;

$tagStmt = $pdo->prepare($tagSql);
$tagStmt->execute(['eid' => $eid]);
$tags = array_column($tagStmt->fetchAll(), 'slug');

// ---------------------------------------------------------------------------
// 4. Fetch reservations
// ---------------------------------------------------------------------------

$resDescCol = $locale === 'de'
    ? 'COALESCE(r.text_de, r.text_en)'
    : 'r.text_en';

$resSql = <<<SQL
SELECT
    r.reservation_key,
    {$resDescCol}    AS text,
    r.text_en,
    r.text_de,
    r.severity,
    r.event_date,
    r.source_url,
    r.penalty_tier,
    r.penalty_amount
FROM reservations r
WHERE r.entry_id = :eid
ORDER BY r.sort_order ASC
SQL;

$resStmt = $pdo->prepare($resSql);
$resStmt->execute(['eid' => $eid]);
$resRows = $resStmt->fetchAll();

$reservations = [];
foreach ($resRows as $rr) {
    $reservation = [
        'id'       => $rr['reservation_key'],
        'text'     => $rr['text'],
        'severity' => $rr['severity'],
    ];
    if ($rr['text_de'] !== null) {
        $reservation['textDe'] = $rr['text_de'];
    }
    if ($rr['event_date'] !== null) {
        $reservation['date'] = $rr['event_date'];
    }
    if ($rr['source_url'] !== null) {
        $reservation['sourceUrl'] = $rr['source_url'];
    }
    if ($rr['penalty_tier'] !== null && $rr['penalty_amount'] !== null) {
        $reservation['penalty'] = [
            'tier'   => $rr['penalty_tier'],
            'amount' => (float)$rr['penalty_amount'],
        ];
    }
    $reservations[] = $reservation;
}

// ---------------------------------------------------------------------------
// 5. Fetch positive signals
// ---------------------------------------------------------------------------

$sigDescCol = $locale === 'de'
    ? 'COALESCE(ps.text_de, ps.text_en)'
    : 'ps.text_en';

$sigSql = <<<SQL
SELECT
    ps.signal_key,
    {$sigDescCol}    AS text,
    ps.text_en,
    ps.text_de,
    ps.dimension,
    ps.amount,
    ps.source_url
FROM positive_signals ps
WHERE ps.entry_id = :eid
ORDER BY ps.sort_order ASC
SQL;

$sigStmt = $pdo->prepare($sigSql);
$sigStmt->execute(['eid' => $eid]);
$sigRows = $sigStmt->fetchAll();

$signals = [];
foreach ($sigRows as $sr) {
    $signal = [
        'id'        => $sr['signal_key'],
        'text'      => $sr['text'],
        'dimension' => $sr['dimension'],
        'amount'    => (float)$sr['amount'],
        'sourceUrl' => $sr['source_url'],
    ];
    if ($sr['text_de'] !== null) {
        $signal['textDe'] = $sr['text_de'];
    }
    $signals[] = $signal;
}

// ---------------------------------------------------------------------------
// 6. Fetch scoring_metadata
// ---------------------------------------------------------------------------

$smSql = <<<SQL
SELECT
    sm.base_class_override,
    sm.is_ad_surveillance
FROM scoring_metadata sm
WHERE sm.entry_id = :eid
SQL;

$smStmt = $pdo->prepare($smSql);
$smStmt->execute(['eid' => $eid]);
$scoringMeta = $smStmt->fetch() ?: null;

// ---------------------------------------------------------------------------
// 7. Fetch entry_replacements (simplified: replaced_entry_id → slug)
// ---------------------------------------------------------------------------

$repSql = <<<SQL
SELECT
    er.raw_name,
    er.sort_order       AS er_sort,
    er.replaced_entry_id,
    ce2.slug            AS replaced_slug
FROM entry_replacements er
LEFT JOIN catalog_entries ce2 ON ce2.id = er.replaced_entry_id
WHERE er.entry_id = :eid
ORDER BY er.sort_order
SQL;

$repStmt = $pdo->prepare($repSql);
$repStmt->execute(['eid' => $eid]);
$repRows = $repStmt->fetchAll();

$replacesUS = [];
foreach ($repRows as $rr) {
    $erSort = (int)$rr['er_sort'];
    $replacesUS[$erSort] = $rr['replaced_slug'] ?? $rr['raw_name'];
}
ksort($replacesUS);
$replacesUS = array_values($replacesUS);

// ---------------------------------------------------------------------------
// 8. Fetch denied_decisions (only for status=denied)
// ---------------------------------------------------------------------------

$deniedDecision = null;
if ($row['status'] === 'denied') {
    $ddSql = <<<SQL
SELECT
    dd.proposed_in,
    dd.claimed_origin,
    dd.actual_origin,
    dd.removed_in,
    dd.raw_category_label,
    dd.failed_gateways_json,
    dd.text_en,
    dd.text_de,
    dd.sources_json
FROM denied_decisions dd
WHERE dd.entry_id = :eid
LIMIT 1
SQL;

    $ddStmt = $pdo->prepare($ddSql);
    $ddStmt->execute(['eid' => $eid]);
    $ddRow = $ddStmt->fetch();

    if ($ddRow !== false) {
        $deniedTextCol = $locale === 'de'
            ? ($ddRow['text_de'] ?? $ddRow['text_en'])
            : $ddRow['text_en'];

        $deniedDecision = [
            'reason' => $deniedTextCol,
        ];
        if ($ddRow['proposed_in'] !== null) {
            $deniedDecision['proposedIn'] = $ddRow['proposed_in'];
        }
        if ($ddRow['claimed_origin'] !== null) {
            $deniedDecision['claimedOrigin'] = $ddRow['claimed_origin'];
        }
        if ($ddRow['actual_origin'] !== null) {
            $deniedDecision['actualOrigin'] = $ddRow['actual_origin'];
        }
        if ($ddRow['removed_in'] !== null) {
            $deniedDecision['removedIn'] = $ddRow['removed_in'];
        }
        if ($ddRow['raw_category_label'] !== null) {
            $deniedDecision['rawCategoryLabel'] = $ddRow['raw_category_label'];
        }
        if ($ddRow['failed_gateways_json'] !== null) {
            $decoded = json_decode($ddRow['failed_gateways_json'], true);
            if (is_array($decoded)) {
                $deniedDecision['failedGateways'] = $decoded;
            }
        }
        if ($ddRow['sources_json'] !== null) {
            $decoded = json_decode($ddRow['sources_json'], true);
            if (is_array($decoded)) {
                $deniedDecision['sources'] = $decoded;
            }
        }
    }
}

// ---------------------------------------------------------------------------
// 9. Assemble the entry object
// ---------------------------------------------------------------------------

$logo = $row['logo_path'] ?? '/logos/' . $row['slug'] . '.svg';

$entry = [
    'id'              => $row['slug'],
    'name'            => $row['name'],
    'description'     => $row['description'] ?? '',
    'website'         => $row['website_url'] ?? '',
    'logo'            => $logo,
    'country'         => $row['country_code'],
    'category'        => $primaryCategory,
    'replacesUS'      => $replacesUS,
    'isOpenSource'    => toBoolOrNull($row['is_open_source']),
    'pricing'         => $row['pricing'],
    'tags'            => $tags,
];

if (count($secondaryCategories) > 0) {
    $entry['secondaryCategories'] = $secondaryCategories;
}
if ($row['open_source_level'] !== null) {
    $entry['openSourceLevel'] = $row['open_source_level'];
}
if ($row['open_source_audit_url'] !== null) {
    $entry['openSourceAuditUrl'] = $row['open_source_audit_url'];
}
if ($row['source_code_url'] !== null) {
    $entry['sourceCodeUrl'] = $row['source_code_url'];
}
if ($row['self_hostable'] !== null) {
    $entry['selfHostable'] = (bool)$row['self_hostable'];
}
if ($row['founded_year'] !== null) {
    $entry['foundedYear'] = (int)$row['founded_year'];
}
if ($row['headquarters_city'] !== null) {
    $entry['headquartersCity'] = $row['headquarters_city'];
}
if ($row['license_text'] !== null) {
    $entry['license'] = $row['license_text'];
}
if ($row['action_links_json'] !== null) {
    $decoded = json_decode($row['action_links_json'], true);
    if (is_array($decoded) && count($decoded) > 0) {
        $entry['actionLinks'] = $decoded;
    }
}
if ($row['date_added'] !== null) {
    $entry['dateAdded'] = $row['date_added'];
}
if ($row['description_de'] !== null) {
    $entry['localizedDescriptions'] = ['de' => $row['description_de']];
}
if (count($reservations) > 0) {
    $entry['reservations'] = $reservations;
}
if (count($signals) > 0) {
    $entry['positiveSignals'] = $signals;
}
// Trust score (dynamically computed from reservations + signals + scoring_metadata)
$trustResult = computeEntryTrustScore(
    $row,
    $reservations,
    $signals,
    $scoringMeta,
    $tags
);
$entry['trustScore'] = $trustResult['trustScore'];
$entry['trustScoreStatus'] = $trustResult['trustScoreStatus'];
if ($trustResult['trustScoreBreakdown'] !== null) {
    $entry['trustScoreBreakdown'] = $trustResult['trustScoreBreakdown'];
}
if ($deniedDecision !== null) {
    $entry['deniedDecision'] = $deniedDecision;
}

// ---------------------------------------------------------------------------
// 10. Send response
// ---------------------------------------------------------------------------

sendCachedJsonResponse([
    'data' => $entry,
    'meta' => [
        'locale' => $locale,
    ],
]);

} catch (Throwable $e) {
    error_log(sprintf('[api][catalog/entry] Query failed: %s', $e->getMessage()));
    sendJsonResponse(500, ['ok' => false, 'error' => 'query_failed']);
}
