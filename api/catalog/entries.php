<?php
declare(strict_types=1);

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/scoring.php';

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
    ce.date_added
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
// 6. Batch-fetch scoring_metadata
// ---------------------------------------------------------------------------

[$inSm, $smParams] = buildInPlaceholders($entryIds, 'sm');

$smSql = <<<SQL
SELECT
    sm.entry_id,
    sm.base_class_override,
    sm.is_ad_surveillance
FROM scoring_metadata sm
WHERE sm.entry_id IN ({$inSm})
SQL;

$smStmt = $pdo->prepare($smSql);
$smStmt->execute($smParams);
$smRows = $smStmt->fetchAll();

$scoringMetaByEntry = [];
foreach ($smRows as $smr) {
    $eid = (int)$smr['entry_id'];
    $scoringMetaByEntry[$eid] = $smr;
}

// ---------------------------------------------------------------------------
// 7. Batch-fetch entry_replacements (simplified: replaced_entry_id → slug)
// ---------------------------------------------------------------------------

[$inRep, $repParams] = buildInPlaceholders($entryIds, 'rep');

$repSql = <<<SQL
SELECT
    er.entry_id,
    er.raw_name,
    er.sort_order       AS er_sort,
    er.replaced_entry_id,
    ce2.slug            AS replaced_slug
FROM entry_replacements er
LEFT JOIN catalog_entries ce2 ON ce2.id = er.replaced_entry_id
WHERE er.entry_id IN ({$inRep})
ORDER BY er.entry_id, er.sort_order
SQL;

$repStmt = $pdo->prepare($repSql);
$repStmt->execute($repParams);
$repRows = $repStmt->fetchAll();

$replacesUSByEntry = [];

foreach ($repRows as $rr) {
    $eid = (int)$rr['entry_id'];
    $erSort = (int)$rr['er_sort'];

    if (!isset($replacesUSByEntry[$eid])) {
        $replacesUSByEntry[$eid] = [];
    }

    // Use the catalog_entries slug if resolved, otherwise the raw_name
    $replacesUSByEntry[$eid][$erSort] = $rr['replaced_slug'] ?? $rr['raw_name'];
}

// ---------------------------------------------------------------------------
// 8. Batch-fetch denied_decisions (only for status=denied)
// ---------------------------------------------------------------------------

$deniedByEntry = [];
if ($status === 'denied' && count($entryIds) > 0) {
    [$inDd, $ddParams] = buildInPlaceholders($entryIds, 'dd');

    $ddDescCol = $locale === 'de'
        ? 'COALESCE(dd.text_de, dd.text_en)'
        : 'dd.text_en';

    $ddSql = <<<SQL
SELECT
    dd.entry_id,
    {$ddDescCol}           AS reason_text,
    dd.proposed_in,
    dd.claimed_origin,
    dd.actual_origin,
    dd.removed_in,
    dd.raw_category_label,
    dd.failed_gateways_json,
    dd.sources_json
FROM denied_decisions dd
WHERE dd.entry_id IN ({$inDd})
SQL;

    $ddStmt = $pdo->prepare($ddSql);
    $ddStmt->execute($ddParams);
    $ddRows = $ddStmt->fetchAll();

    foreach ($ddRows as $ddr) {
        $eid = (int)$ddr['entry_id'];
        $decision = [
            'reason' => $ddr['reason_text'],
        ];
        if ($ddr['proposed_in'] !== null) {
            $decision['proposedIn'] = $ddr['proposed_in'];
        }
        if ($ddr['claimed_origin'] !== null) {
            $decision['claimedOrigin'] = $ddr['claimed_origin'];
        }
        if ($ddr['actual_origin'] !== null) {
            $decision['actualOrigin'] = $ddr['actual_origin'];
        }
        if ($ddr['removed_in'] !== null) {
            $decision['removedIn'] = $ddr['removed_in'];
        }
        if ($ddr['raw_category_label'] !== null) {
            $decision['rawCategoryLabel'] = $ddr['raw_category_label'];
        }
        if ($ddr['failed_gateways_json'] !== null) {
            $decoded = json_decode($ddr['failed_gateways_json'], true);
            if (is_array($decoded)) {
                $decision['failedGateways'] = $decoded;
            }
        }
        if ($ddr['sources_json'] !== null) {
            $decoded = json_decode($ddr['sources_json'], true);
            if (is_array($decoded)) {
                $decision['sources'] = $decoded;
            }
        }
        $deniedByEntry[$eid] = $decision;
    }
}

// ---------------------------------------------------------------------------
// 9. Assemble the final response array
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

    // replacesUS: ordered slugs (or raw names for unresolved replacements)
    $replacesUS = [];
    if (isset($replacesUSByEntry[$eid])) {
        ksort($replacesUSByEntry[$eid]);
        $replacesUS = array_values($replacesUSByEntry[$eid]);
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

    if ($row['date_added'] !== null) {
        $entry['dateAdded'] = $row['date_added'];
    }

    // Localized descriptions (always include for client-side locale switching)
    if ($row['description_de'] !== null) {
        $entry['localizedDescriptions'] = ['de' => $row['description_de']];
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

    // Trust score (dynamically computed from reservations + signals + scoring_metadata)
    $trustResult = computeEntryTrustScore(
        $row,
        $entryReservations,
        $entrySignals,
        $scoringMetaByEntry[$eid] ?? null,
        $tagsByEntry[$eid] ?? []
    );
    $entry['trustScore'] = $trustResult['trustScore'];
    $entry['trustScoreStatus'] = $trustResult['trustScoreStatus'];
    if ($trustResult['trustScoreBreakdown'] !== null) {
        $entry['trustScoreBreakdown'] = $trustResult['trustScoreBreakdown'];
    }

    // Denied decision (only present for status=denied entries with a decision row)
    if (isset($deniedByEntry[$eid])) {
        $entry['deniedDecision'] = $deniedByEntry[$eid];
    }

    $data[] = $entry;
}

// ---------------------------------------------------------------------------
// 10. Send response
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
