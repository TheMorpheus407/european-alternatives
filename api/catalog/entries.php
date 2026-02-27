<?php
declare(strict_types=1);

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/helpers.php';

requireHttpMethod('GET');

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

$validStatuses = ['alternative', 'us', 'denied'];
$validLocales  = ['en', 'de'];

$status = $_GET['status'] ?? 'alternative';
$locale = $_GET['locale'] ?? 'en';

if (!in_array($status, $validStatuses, true)) {
    sendJsonResponse(400, [
        'ok'    => false,
        'error' => 'invalid_status',
        'detail' => 'Allowed values: ' . implode(', ', $validStatuses),
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
    error_log(sprintf('[api][catalog/entries] DB connection failed: %s', $e->getMessage()));
    sendJsonResponse(500, [
        'ok'    => false,
        'error' => 'database_unavailable',
    ]);
}

// ---------------------------------------------------------------------------
// 1. Fetch catalog entries
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
    ce.trust_score_100,
    ce.trust_score_10_display,
    ce.trust_score_status,
    ce.trust_score_breakdown_json
FROM catalog_entries ce
WHERE ce.status = :status
  AND (ce.is_active = 1 OR ce.status = 'denied')
ORDER BY ce.name ASC
SQL;

try {
    $stmt = $pdo->prepare($entrySql);
    $stmt->execute(['status' => $status]);
    $rows = $stmt->fetchAll();
} catch (Throwable $e) {
    error_log(sprintf('[api][catalog/entries] Entry query failed: %s', $e->getMessage()));
    sendJsonResponse(500, ['ok' => false, 'error' => 'query_failed']);
}

if (count($rows) === 0) {
    sendCachedJsonResponse([
        'data' => [],
        'meta' => ['count' => 0, 'locale' => $locale],
    ]);
}

// Build lookup: id -> row index, and collect all entry IDs for batch queries.
$entryById   = [];
$entryIds    = [];
foreach ($rows as $row) {
    $entryById[(int)$row['id']] = $row;
    $entryIds[] = (int)$row['id'];
}

// ---------------------------------------------------------------------------
// Helper: generate IN-clause placeholders for a list of integer IDs
// ---------------------------------------------------------------------------

function buildInPlaceholders(array $ids, string $prefix = 'id'): array
{
    $placeholders = [];
    $params       = [];
    foreach ($ids as $i => $id) {
        $key = ":{$prefix}{$i}";
        $placeholders[] = $key;
        $params[$key]   = $id;
    }
    return [implode(',', $placeholders), $params];
}

// ---------------------------------------------------------------------------
// 2-7. Batch-fetch related data and assemble response
// ---------------------------------------------------------------------------

try {

// ---------------------------------------------------------------------------
// 2. Batch-fetch categories per entry
// ---------------------------------------------------------------------------

[$inCat, $catParams] = buildInPlaceholders($entryIds, 'cat');

$catSql = <<<SQL
SELECT
    ec.entry_id,
    ec.category_id,
    ec.is_primary,
    ec.sort_order
FROM entry_categories ec
WHERE ec.entry_id IN ({$inCat})
ORDER BY ec.entry_id, ec.is_primary DESC, ec.sort_order ASC
SQL;

$catStmt = $pdo->prepare($catSql);
$catStmt->execute($catParams);
$catRows = $catStmt->fetchAll();

// Group: entry_id -> [{category_id, is_primary}]
$categoriesByEntry = [];
foreach ($catRows as $cr) {
    $eid = (int)$cr['entry_id'];
    $categoriesByEntry[$eid][] = [
        'categoryId' => $cr['category_id'],
        'isPrimary'  => (bool)$cr['is_primary'],
    ];
}

// ---------------------------------------------------------------------------
// 3. Batch-fetch tags per entry
// ---------------------------------------------------------------------------

[$inTag, $tagParams] = buildInPlaceholders($entryIds, 'tag');

$tagSql = <<<SQL
SELECT
    et.entry_id,
    t.slug
FROM entry_tags et
JOIN tags t ON t.id = et.tag_id
WHERE et.entry_id IN ({$inTag})
ORDER BY et.entry_id, et.sort_order ASC
SQL;

$tagStmt = $pdo->prepare($tagSql);
$tagStmt->execute($tagParams);
$tagRows = $tagStmt->fetchAll();

$tagsByEntry = [];
foreach ($tagRows as $tr) {
    $eid = (int)$tr['entry_id'];
    $tagsByEntry[$eid][] = $tr['slug'];
}

// ---------------------------------------------------------------------------
// 4. Batch-fetch reservations per entry
// ---------------------------------------------------------------------------

[$inRes, $resParams] = buildInPlaceholders($entryIds, 'res');

$resDescCol = $locale === 'de'
    ? 'COALESCE(r.text_de, r.text_en)'
    : 'r.text_en';

$resSql = <<<SQL
SELECT
    r.entry_id,
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
WHERE r.entry_id IN ({$inRes})
ORDER BY r.entry_id, r.sort_order ASC
SQL;

$resStmt = $pdo->prepare($resSql);
$resStmt->execute($resParams);
$resRows = $resStmt->fetchAll();

$reservationsByEntry = [];
foreach ($resRows as $rr) {
    $eid = (int)$rr['entry_id'];
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
    $reservationsByEntry[$eid][] = $reservation;
}

// ---------------------------------------------------------------------------
// 5. Batch-fetch positive signals per entry
// ---------------------------------------------------------------------------

[$inSig, $sigParams] = buildInPlaceholders($entryIds, 'sig');

$sigDescCol = $locale === 'de'
    ? 'COALESCE(ps.text_de, ps.text_en)'
    : 'ps.text_en';

$sigSql = <<<SQL
SELECT
    ps.entry_id,
    ps.signal_key,
    {$sigDescCol}    AS text,
    ps.text_en,
    ps.text_de,
    ps.dimension,
    ps.amount,
    ps.source_url
FROM positive_signals ps
WHERE ps.entry_id IN ({$inSig})
ORDER BY ps.entry_id, ps.sort_order ASC
SQL;

$sigStmt = $pdo->prepare($sigSql);
$sigStmt->execute($sigParams);
$sigRows = $sigStmt->fetchAll();

$signalsByEntry = [];
foreach ($sigRows as $sr) {
    $eid = (int)$sr['entry_id'];
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
    $signalsByEntry[$eid][] = $signal;
}

// ---------------------------------------------------------------------------
// 6. Batch-fetch US vendor comparisons (entry_replacements -> us_vendors ->
//    us_vendor_profiles -> us_vendor_profile_reservations)
// ---------------------------------------------------------------------------

[$inRep, $repParams] = buildInPlaceholders($entryIds, 'rep');

$uvpDescCol = $locale === 'de'
    ? 'COALESCE(uvp.description_de, uvp.description_en)'
    : 'uvp.description_en';

$uvprTextCol = $locale === 'de'
    ? 'COALESCE(uvpr.text_de, uvpr.text_en)'
    : 'uvpr.text_en';

$repSql = <<<SQL
SELECT
    er.entry_id,
    er.raw_name,
    er.sort_order       AS er_sort,
    uv.slug             AS vendor_id,
    uv.name             AS vendor_name,
    {$uvpDescCol}       AS vendor_description,
    uvp.description_en  AS vendor_description_en,
    uvp.description_de  AS vendor_description_de,
    uvp.trust_score_override_10,
    uvp.trust_score_status,
    uvpr.reservation_key,
    {$uvprTextCol}      AS res_text,
    uvpr.text_en        AS res_text_en,
    uvpr.text_de        AS res_text_de,
    uvpr.severity       AS res_severity,
    uvpr.event_date     AS res_event_date,
    uvpr.source_url     AS res_source_url,
    uvpr.penalty_tier   AS res_penalty_tier,
    uvpr.penalty_amount AS res_penalty_amount,
    uvpr.sort_order     AS res_sort
FROM entry_replacements er
LEFT JOIN us_vendors uv ON uv.id = er.us_vendor_id
LEFT JOIN us_vendor_profiles uvp ON uvp.us_vendor_id = uv.id
LEFT JOIN us_vendor_profile_reservations uvpr ON uvpr.us_vendor_id = uv.id
WHERE er.entry_id IN ({$inRep})
ORDER BY er.entry_id, er.sort_order, uvpr.sort_order
SQL;

$repStmt = $pdo->prepare($repSql);
$repStmt->execute($repParams);
$repRows = $repStmt->fetchAll();

// Post-process: group by entry, dedupe by us_vendor_id (first by sort_order),
// nest reservations inside each comparison.
$comparisonsByEntry = [];
$replacesUSByEntry  = [];

foreach ($repRows as $rr) {
    $eid = (int)$rr['entry_id'];

    if (!isset($comparisonsByEntry[$eid])) {
        $comparisonsByEntry[$eid] = [];
        $replacesUSByEntry[$eid]  = [];
    }

    // Determine the comparison identity key. Resolved vendors use their slug;
    // unresolved ones use a fallback "us-{slugified-raw-name}".
    $vendorId = $rr['vendor_id'];
    $isResolved = $vendorId !== null;

    if (!$isResolved) {
        $vendorId = 'us-' . slugifyName($rr['raw_name']);
    }

    // Track the raw replacement names for the replacesUS array.
    // Use er_sort as the dedup key for raw names to preserve order.
    $erSort = (int)$rr['er_sort'];
    if (!isset($replacesUSByEntry[$eid][$erSort])) {
        $replacesUSByEntry[$eid][$erSort] = $rr['raw_name'];
    }

    // Dedupe by vendor_id: keep first occurrence (lowest er_sort).
    if (isset($comparisonsByEntry[$eid][$vendorId])) {
        // Already seen this vendor — only add reservation if new.
        if ($rr['reservation_key'] !== null) {
            $existingResKeys = array_column(
                $comparisonsByEntry[$eid][$vendorId]['_reservations'] ?? [],
                'id'
            );
            if (!in_array($rr['reservation_key'], $existingResKeys, true)) {
                $comparisonsByEntry[$eid][$vendorId]['_reservations'][] =
                    buildUSVendorReservation($rr);
            }
        }
        continue;
    }

    // First occurrence of this vendor for this entry.
    // A profile exists when the LEFT JOIN to us_vendor_profiles produced a row
    // (trust_score_status is NOT NULL in that table, so NULL here means no row).
    $hasProfile = $isResolved && $rr['trust_score_status'] !== null;
    $hasReservations = $rr['reservation_key'] !== null;
    $hasProfileWithReservations = $hasProfile && $hasReservations;

    $comparison = [
        'id'              => $vendorId,
        'name'            => $isResolved ? $rr['vendor_name'] : trim($rr['raw_name']),
        'trustScoreStatus' => $hasProfileWithReservations
            ? ($rr['trust_score_status'] ?? 'ready')
            : 'pending',
    ];

    if ($hasProfileWithReservations && $rr['trust_score_override_10'] !== null) {
        $comparison['trustScore'] = (float)$rr['trust_score_override_10'];
    }
    if ($hasProfileWithReservations && $rr['vendor_description'] !== null) {
        $comparison['description'] = $rr['vendor_description'];
    }
    if ($hasProfileWithReservations && $rr['vendor_description_de'] !== null) {
        $comparison['descriptionDe'] = $rr['vendor_description_de'];
    }

    // Track whether this comparison has a full profile with reservations.
    $comparison['_hasProfileWithRes'] = $hasProfileWithReservations;

    // Initialize reservations list.
    $comparison['_reservations'] = [];
    if ($rr['reservation_key'] !== null) {
        $comparison['_reservations'][] = buildUSVendorReservation($rr);
    }

    $comparisonsByEntry[$eid][$vendorId] = $comparison;
}

// ---------------------------------------------------------------------------
// 7. Assemble the final response array
// ---------------------------------------------------------------------------

$data = [];

foreach ($rows as $row) {
    $eid = (int)$row['id'];

    // Primary and secondary categories
    $primaryCategory      = null;
    $secondaryCategories  = [];
    foreach ($categoriesByEntry[$eid] ?? [] as $cat) {
        if ($cat['isPrimary']) {
            $primaryCategory = $cat['categoryId'];
        } else {
            $secondaryCategories[] = $cat['categoryId'];
        }
    }

    // replacesUS: ordered raw_name strings
    $replacesUS = [];
    if (isset($replacesUSByEntry[$eid])) {
        ksort($replacesUSByEntry[$eid]);
        $replacesUS = array_values($replacesUSByEntry[$eid]);
    }

    // usVendorComparisons: finalize (strip internal keys, attach reservations)
    $usVendorComparisons = [];
    foreach ($comparisonsByEntry[$eid] ?? [] as $comp) {
        $resData = $comp['_reservations'] ?? [];
        $hasProfileWithRes = $comp['_hasProfileWithRes'] ?? false;
        unset($comp['_reservations'], $comp['_hasProfileWithRes']);

        if ($hasProfileWithRes && count($resData) > 0) {
            $comp['reservations'] = $resData;
        }

        $usVendorComparisons[] = $comp;
    }

    // Logo fallback
    $logo = $row['logo_path'] ?? '/logos/' . $row['slug'] . '.svg';

    // Build the entry object matching the Alternative TypeScript interface
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
        'tags'            => $tagsByEntry[$eid] ?? [],
    ];

    // Optional scalar fields (omit if null, matching TS interface where fields are optional)
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

    // Localized descriptions (always include for client-side locale switching)
    if ($row['description_de'] !== null) {
        $entry['localizedDescriptions'] = ['de' => $row['description_de']];
    }

    // US vendor comparisons
    if (count($usVendorComparisons) > 0) {
        $entry['usVendorComparisons'] = $usVendorComparisons;
    }

    // Reservations and signals
    $entryReservations = $reservationsByEntry[$eid] ?? [];
    if (count($entryReservations) > 0) {
        $entry['reservations'] = $entryReservations;
    }

    $entrySignals = $signalsByEntry[$eid] ?? [];
    if (count($entrySignals) > 0) {
        $entry['positiveSignals'] = $entrySignals;
    }

    // Trust score (pre-computed, read from cached columns)
    // DB stores 0-100 scale; frontend expects 0-10 (one decimal place).
    if ($row['trust_score_100'] !== null) {
        $entry['trustScore'] = round((int)$row['trust_score_100'] / 10, 1);
    }
    if ($row['trust_score_status'] !== null) {
        $entry['trustScoreStatus'] = $row['trust_score_status'];
    }
    if ($row['trust_score_breakdown_json'] !== null) {
        $decoded = json_decode($row['trust_score_breakdown_json'], true);
        if (is_array($decoded)) {
            $entry['trustScoreBreakdown'] = $decoded;
        }
    }

    $data[] = $entry;
}

// ---------------------------------------------------------------------------
// 8. Send response
// ---------------------------------------------------------------------------

sendCachedJsonResponse([
    'data' => $data,
    'meta' => [
        'count'  => count($data),
        'locale' => $locale,
    ],
]);

} catch (Throwable $e) {
    error_log(sprintf('[api][catalog/entries] Batch query failed: %s', $e->getMessage()));
    sendJsonResponse(500, ['ok' => false, 'error' => 'query_failed']);
}
