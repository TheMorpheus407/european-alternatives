<?php
declare(strict_types=1);

/**
 * Database-to-TypeScript Export Script — European Alternatives
 *
 * Reads the MySQL database and generates TypeScript source files that match
 * the exact format of the existing hand-maintained files. This enables:
 *
 *   1. Git-tracked audit trail of all data changes
 *   2. Transparency — anyone can read the TS files without DB access
 *   3. Rollback safety — if DB goes down, TS files are the fallback
 *
 * Output directory: tmp/ts-export/
 *
 * Usage:
 *   php scripts/db-export-to-ts.php
 *
 * CLI-only. Never expose via HTTP.
 */

// ── Guard: CLI only ─────────────────────────────────────────────────────────
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    echo 'This script must be run from the command line.';
    exit(1);
}

// ── Bootstrap ───────────────────────────────────────────────────────────────
require_once __DIR__ . '/../api/bootstrap.php';
require_once __DIR__ . '/../api/db.php';

// ── Constants ───────────────────────────────────────────────────────────────
$projectRoot = realpath(__DIR__ . '/..');
$outputDir = $projectRoot . '/tmp/ts-export';

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Write a message to stderr.
 */
function stderr(string $msg): void
{
    fwrite(STDERR, $msg . "\n");
}

/**
 * Escape a string for use inside a TypeScript single-quoted string literal.
 *
 * Escapes backslashes and single quotes. Leaves all other characters
 * (including UTF-8 multi-byte) as-is — the output files are UTF-8.
 */
function tsEscapeSingle(string $value): string
{
    $value = str_replace('\\', '\\\\', $value);
    $value = str_replace("'", "\\'", $value);
    return $value;
}

/**
 * Format a string value as a TypeScript single-quoted literal, or 'undefined'
 * placeholder (which won't be emitted — caller should skip null fields).
 */
function tsString(?string $value): string
{
    if ($value === null) {
        return 'undefined';
    }
    return "'" . tsEscapeSingle($value) . "'";
}

/**
 * Format a value for TypeScript. Handles strings, numbers, booleans, nulls,
 * arrays, and associative arrays (objects).
 */
function tsValue(mixed $value, int $indent = 4): string
{
    if ($value === null) {
        return 'undefined';
    }
    if (is_bool($value)) {
        return $value ? 'true' : 'false';
    }
    if (is_int($value) || is_float($value)) {
        return (string) $value;
    }
    if (is_string($value)) {
        return tsString($value);
    }
    if (is_array($value)) {
        // Check if it's an associative array (object) or sequential array
        if (array_is_list($value)) {
            return tsArray($value, $indent);
        }
        return tsObject($value, $indent);
    }
    return (string) $value;
}

/**
 * Format a sequential array as a TypeScript array literal.
 */
function tsArray(array $items, int $indent = 4): string
{
    if (empty($items)) {
        return '[]';
    }

    $pad = str_repeat(' ', $indent);
    $innerPad = str_repeat(' ', $indent + 2);

    // Short arrays of simple strings can be inline
    $allSimpleStrings = true;
    foreach ($items as $item) {
        if (!is_string($item)) {
            $allSimpleStrings = false;
            break;
        }
    }

    if ($allSimpleStrings && count($items) <= 5) {
        $parts = array_map(fn($s) => tsString($s), $items);
        $inline = '[' . implode(', ', $parts) . ']';
        if (strlen($inline) <= 100) {
            return $inline;
        }
    }

    $lines = [];
    foreach ($items as $item) {
        $lines[] = $innerPad . tsValue($item, $indent + 2) . ',';
    }

    return "[\n" . implode("\n", $lines) . "\n" . $pad . ']';
}

/**
 * Format an associative array as a TypeScript object literal.
 */
function tsObject(array $obj, int $indent = 4): string
{
    if (empty($obj)) {
        return '{}';
    }

    $pad = str_repeat(' ', $indent);
    $innerPad = str_repeat(' ', $indent + 2);

    $lines = [];
    foreach ($obj as $key => $value) {
        $tsKey = preg_match('/^[a-zA-Z_$][a-zA-Z0-9_$]*$/', (string) $key) ? (string) $key : tsString((string) $key);
        $lines[] = $innerPad . $tsKey . ': ' . tsValue($value, $indent + 2) . ',';
    }

    return "{\n" . implode("\n", $lines) . "\n" . $pad . '}';
}

/**
 * Generate the header comment for auto-generated files.
 */
function generatedHeader(): string
{
    $date = date('Y-m-d');
    return "// Auto-generated from database on {$date}. Do not edit manually.";
}

/**
 * Write a TypeScript file to the output directory.
 */
function writeFile(string $outputDir, string $filename, string $content): void
{
    $path = $outputDir . '/' . $filename;
    $result = file_put_contents($path, $content);
    if ($result === false) {
        stderr("Error: Failed to write {$path}");
        exit(1);
    }
    stderr("  Wrote {$filename} (" . number_format(strlen($content)) . " bytes)");
}

// ── Database connection ─────────────────────────────────────────────────────
stderr('Connecting to database...');
$pdo = getDatabaseConnection();
stderr('Connected.');

// ── Ensure output directory exists ──────────────────────────────────────────
if (!is_dir($outputDir)) {
    mkdir($outputDir, 0755, true);
}

// ── Row count tracker ───────────────────────────────────────────────────────
$exportCounts = [];

// =============================================================================
// 1. Export manualAlternatives.ts
// =============================================================================
stderr('Exporting manualAlternatives...');

$manualEntries = fetchAlternatives($pdo, 'manual');
$exportCounts['manualAlternatives'] = count($manualEntries);

$manualTs = generatedHeader() . "\n";
$manualTs .= "import type { Alternative } from '../types';\n\n";
$manualTs .= "export const manualAlternatives: Alternative[] = [\n";
foreach ($manualEntries as $entry) {
    $manualTs .= formatAlternativeEntry($entry, $pdo);
}
$manualTs .= "];\n";

writeFile($outputDir, 'manualAlternatives.ts', $manualTs);

// =============================================================================
// 2. Export researchAlternatives.ts
// =============================================================================
stderr('Exporting researchAlternatives...');

$researchEntries = fetchAlternatives($pdo, 'research');
$exportCounts['researchAlternatives'] = count($researchEntries);

$researchTs = generatedHeader() . "\n";
$researchTs .= "import type { Alternative } from '../types';\n\n";
$researchTs .= "export const researchAlternatives: Alternative[] = [\n";
foreach ($researchEntries as $entry) {
    $researchTs .= formatAlternativeEntry($entry, $pdo);
}
$researchTs .= "];\n";

writeFile($outputDir, 'researchAlternatives.ts', $researchTs);

// =============================================================================
// 3. Export trustOverrides.ts
// =============================================================================
stderr('Exporting trustOverrides...');

$reservations = fetchReservations($pdo);
$exportCounts['trustOverrides (entries)'] = count($reservations);
$totalReservations = 0;

$trustTs = generatedHeader() . "\n";
$trustTs .= "import type { Reservation } from '../types';\n\n";
$trustTs .= "export const reservationsById: Record<string, Reservation[]> = {\n";

foreach ($reservations as $slug => $items) {
    $totalReservations += count($items);
    $trustTs .= "  " . formatTsKey($slug) . ": [\n";
    foreach ($items as $res) {
        $trustTs .= formatReservation($res, 4);
    }
    $trustTs .= "  ],\n";
}

$trustTs .= "};\n";
$exportCounts['trustOverrides (reservations)'] = $totalReservations;

writeFile($outputDir, 'trustOverrides.ts', $trustTs);

// =============================================================================
// 4. Export positiveSignals.ts
// =============================================================================
stderr('Exporting positiveSignals...');

$signals = fetchPositiveSignals($pdo);
$exportCounts['positiveSignals (entries)'] = count($signals);
$totalSignals = 0;

$sigTs = generatedHeader() . "\n";
$sigTs .= "import type { PositiveSignal } from '../types';\n\n";
$sigTs .= "/**\n";
$sigTs .= " * Vetted positive signals per alternative, keyed by alternative ID.\n";
$sigTs .= " *\n";
$sigTs .= " * Each signal maps to the standard signal catalog defined in the scoring\n";
$sigTs .= " * playbook and must reference a source URL from the vetted worksheet or\n";
$sigTs .= " * deep-research document.\n";
$sigTs .= " */\n";
$sigTs .= "export const positiveSignalsById: Record<string, PositiveSignal[]> = {\n";

foreach ($signals as $slug => $items) {
    $totalSignals += count($items);
    $sigTs .= "\n  " . formatTsKey($slug) . ": [\n";
    foreach ($items as $sig) {
        $sigTs .= formatPositiveSignal($sig);
    }
    $sigTs .= "  ],\n";
}

$sigTs .= "};\n";
$exportCounts['positiveSignals (signals)'] = $totalSignals;

writeFile($outputDir, 'positiveSignals.ts', $sigTs);

// =============================================================================
// 5. Export scoringData.ts
// =============================================================================
stderr('Exporting scoringData...');

$scoringMetadata = fetchScoringMetadata($pdo);
$exportCounts['scoringData'] = count($scoringMetadata);

$scoreTs = generatedHeader() . "\n";
$scoreTs .= "import type { ScoringMetadata } from '../types';\n\n";
$scoreTs .= "// Scoring metadata for vetted EU/European alternatives.\n";
$scoreTs .= "// Only contains overrides — operational scores are now derived from\n";
$scoreTs .= "// reservations (penalties) and positive signals via the v2 engine.\n\n";
$scoreTs .= "export const scoringMetadata: Record<string, ScoringMetadata> = {\n";

foreach ($scoringMetadata as $slug => $meta) {
    $parts = [];
    if (isset($meta['baseClassOverride'])) {
        $parts[] = "baseClassOverride: " . tsString($meta['baseClassOverride']);
    }
    if (isset($meta['isAdSurveillance'])) {
        $parts[] = "isAdSurveillance: " . ($meta['isAdSurveillance'] ? 'true' : 'false');
    }
    $scoreTs .= "  " . formatTsKey($slug) . ": { " . implode(', ', $parts) . " },\n";
}

$scoreTs .= "};\n";

writeFile($outputDir, 'scoringData.ts', $scoreTs);

// =============================================================================
// 6. Export usVendors.ts
// =============================================================================
stderr('Exporting usVendors...');

$usVendorData = fetchUsVendorData($pdo);
$exportCounts['usVendors (records)'] = count($usVendorData['records']);
$exportCounts['usVendors (profiles)'] = count($usVendorData['profiles']);

$usTs = generatedHeader() . "\n";
$usTs .= "import type { Reservation, USVendorComparison } from '../types';\n\n";
$usTs .= "export interface USVendorRecord {\n";
$usTs .= "  id: string;\n";
$usTs .= "  name: string;\n";
$usTs .= "  aliases: string[];\n";
$usTs .= "}\n\n";
$usTs .= "export interface USVendorTrustProfile {\n";
$usTs .= "  trustScore: number;\n";
$usTs .= "  description: string;\n";
$usTs .= "  descriptionDe: string;\n";
$usTs .= "  reservations: Reservation[];\n";
$usTs .= "}\n\n";

// US_VENDOR_RECORDS
$usTs .= "export const US_VENDOR_RECORDS: USVendorRecord[] = [\n";
foreach ($usVendorData['records'] as $rec) {
    $usTs .= "  {\n";
    $usTs .= "    id: " . tsString($rec['id']) . ",\n";
    $usTs .= "    name: " . tsString($rec['name']) . ",\n";
    $usTs .= "    aliases: " . tsArray($rec['aliases'], 4) . ",\n";
    $usTs .= "  },\n";
}
$usTs .= "];\n\n";

// US_VENDOR_TRUST_PROFILES
$usTs .= "export const US_VENDOR_TRUST_PROFILES: Record<string, USVendorTrustProfile> = {\n";
foreach ($usVendorData['profiles'] as $vendorSlug => $profile) {
    $usTs .= "  " . formatTsKey($vendorSlug) . ": {\n";
    $usTs .= "    trustScore: " . formatDecimal($profile['trustScore']) . ",\n";
    $usTs .= "    description:\n";
    $usTs .= "        " . tsString($profile['description']) . ",\n";
    $usTs .= "    descriptionDe:\n";
    $usTs .= "        " . tsString($profile['descriptionDe']) . ",\n";
    $usTs .= "    reservations: [\n";
    foreach ($profile['reservations'] as $res) {
        $usTs .= formatReservation($res, 6);
    }
    $usTs .= "    ],\n";
    $usTs .= "  },\n";
}
$usTs .= "};\n";

// Append utility functions that exist in the original usVendors.ts
$usTs .= usVendorUtilityFunctions();

writeFile($outputDir, 'usVendors.ts', $usTs);

// ── Summary ─────────────────────────────────────────────────────────────────
stderr('');
stderr('=== Export Summary ===');
foreach ($exportCounts as $label => $count) {
    stderr(sprintf('  %-40s %d', $label, $count));
}
stderr('');
stderr('All files written to: ' . $outputDir);
stderr('Done.');

exit(0);

// =============================================================================
// Data Fetching Functions
// =============================================================================

/**
 * Fetch alternatives from the database by source_file type.
 * Returns an array of entry data with categories, tags, and replacements pre-loaded.
 */
function fetchAlternatives(PDO $pdo, string $sourceFile): array
{
    $stmt = $pdo->prepare(
        "SELECT ce.*
         FROM catalog_entries ce
         WHERE ce.status = 'alternative'
           AND ce.source_file = :source_file
           AND ce.is_active = 1
         ORDER BY ce.slug ASC"
    );
    $stmt->execute([':source_file' => $sourceFile]);
    $entries = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Pre-load all related data
    $slugToId = [];
    foreach ($entries as $e) {
        $slugToId[$e['slug']] = $e['id'];
    }

    if (empty($slugToId)) {
        return [];
    }

    $ids = array_values($slugToId);
    $placeholders = implode(',', array_fill(0, count($ids), '?'));

    // Categories
    $catStmt = $pdo->prepare(
        "SELECT ec.entry_id, ec.category_id, ec.is_primary, ec.sort_order
         FROM entry_categories ec
         WHERE ec.entry_id IN ({$placeholders})
         ORDER BY ec.entry_id, ec.sort_order"
    );
    $catStmt->execute($ids);
    $catRows = $catStmt->fetchAll(PDO::FETCH_ASSOC);

    $categoriesByEntryId = [];
    foreach ($catRows as $row) {
        $categoriesByEntryId[$row['entry_id']][] = $row;
    }

    // Tags
    $tagStmt = $pdo->prepare(
        "SELECT et.entry_id, t.slug
         FROM entry_tags et
         JOIN tags t ON t.id = et.tag_id
         WHERE et.entry_id IN ({$placeholders})
         ORDER BY et.entry_id, et.sort_order"
    );
    $tagStmt->execute($ids);
    $tagRows = $tagStmt->fetchAll(PDO::FETCH_ASSOC);

    $tagsByEntryId = [];
    foreach ($tagRows as $row) {
        $tagsByEntryId[$row['entry_id']][] = $row['slug'];
    }

    // Replacements
    $replStmt = $pdo->prepare(
        "SELECT er.entry_id, er.raw_name
         FROM entry_replacements er
         WHERE er.entry_id IN ({$placeholders})
         ORDER BY er.entry_id, er.sort_order"
    );
    $replStmt->execute($ids);
    $replRows = $replStmt->fetchAll(PDO::FETCH_ASSOC);

    $replacementsByEntryId = [];
    foreach ($replRows as $row) {
        $replacementsByEntryId[$row['entry_id']][] = $row['raw_name'];
    }

    // Combine
    $result = [];
    foreach ($entries as $e) {
        $entryId = $e['id'];
        $e['_categories'] = $categoriesByEntryId[$entryId] ?? [];
        $e['_tags'] = $tagsByEntryId[$entryId] ?? [];
        $e['_replacements'] = $replacementsByEntryId[$entryId] ?? [];
        $result[] = $e;
    }

    return $result;
}

/**
 * Format an alternative entry as TypeScript object syntax.
 */
function formatAlternativeEntry(array $entry, PDO $pdo): string
{
    $out = "  {\n";
    $out .= "    id: " . tsString($entry['slug']) . ",\n";
    $out .= "    name: " . tsString($entry['name']) . ",\n";

    // Description
    if ($entry['description_en'] !== null) {
        $out .= "    description:\n";
        $out .= "      " . tsString($entry['description_en']) . ",\n";
    }

    // Localized descriptions
    if ($entry['description_de'] !== null) {
        $out .= "    localizedDescriptions: {\n";
        $out .= "      de: " . tsString($entry['description_de']) . ",\n";
        $out .= "    },\n";
    }

    // Website
    if ($entry['website_url'] !== null) {
        $out .= "    website: " . tsString($entry['website_url']) . ",\n";
    }

    // Logo
    if ($entry['logo_path'] !== null) {
        $out .= "    logo: " . tsString($entry['logo_path']) . ",\n";
    }

    // Country
    if ($entry['country_code'] !== null) {
        $out .= "    country: " . tsString($entry['country_code']) . ",\n";
    }

    // Primary category
    $primaryCat = null;
    $secondaryCats = [];
    foreach ($entry['_categories'] as $cat) {
        if ($cat['is_primary']) {
            $primaryCat = $cat['category_id'];
        } else {
            $secondaryCats[] = $cat['category_id'];
        }
    }
    if ($primaryCat !== null) {
        $out .= "    category: " . tsString($primaryCat) . ",\n";
    }
    if (!empty($secondaryCats)) {
        $out .= "    secondaryCategories: " . tsArray($secondaryCats, 4) . ",\n";
    }

    // ReplacesUS
    $replacements = $entry['_replacements'];
    $out .= "    replacesUS: " . tsArray($replacements, 4) . ",\n";

    // Open source
    if ($entry['is_open_source'] !== null) {
        $out .= "    isOpenSource: " . ($entry['is_open_source'] ? 'true' : 'false') . ",\n";
    }
    if ($entry['open_source_level'] !== null) {
        $out .= "    openSourceLevel: " . tsString($entry['open_source_level']) . ",\n";
    }
    if ($entry['open_source_audit_url'] !== null) {
        $out .= "    openSourceAuditUrl: " . tsString($entry['open_source_audit_url']) . ",\n";
    }
    if ($entry['source_code_url'] !== null) {
        $out .= "    sourceCodeUrl: " . tsString($entry['source_code_url']) . ",\n";
    }

    // Action links
    if ($entry['action_links_json'] !== null) {
        $actionLinks = json_decode($entry['action_links_json'], true);
        if (is_array($actionLinks) && !empty($actionLinks)) {
            $out .= "    actionLinks: [\n";
            foreach ($actionLinks as $link) {
                $out .= "      { label: " . tsString($link['label'] ?? '') . ", url: " . tsString($link['url'] ?? '') . " },\n";
            }
            $out .= "    ],\n";
        }
    }

    // Pricing
    if ($entry['pricing'] !== null) {
        $out .= "    pricing: " . tsString($entry['pricing']) . ",\n";
    }

    // Self-hostable
    if ($entry['self_hostable'] !== null) {
        $out .= "    selfHostable: " . ($entry['self_hostable'] ? 'true' : 'false') . ",\n";
    }

    // Tags
    $tags = $entry['_tags'];
    $out .= "    tags: " . tsArray($tags, 4) . ",\n";

    // Founded year
    if ($entry['founded_year'] !== null) {
        $out .= "    foundedYear: " . (int) $entry['founded_year'] . ",\n";
    }

    // Headquarters city
    if ($entry['headquarters_city'] !== null) {
        $out .= "    headquartersCity: " . tsString($entry['headquarters_city']) . ",\n";
    }

    // License
    if ($entry['license_text'] !== null) {
        $out .= "    license: " . tsString($entry['license_text']) . ",\n";
    }

    // Trust score status (only emit 'pending' when explicitly set — 'ready' is computed)
    if ($entry['trust_score_status'] !== null && $entry['trust_score_status'] === 'pending') {
        $out .= "    trustScoreStatus: 'pending',\n";
    }

    $out .= "  },\n";
    return $out;
}

/**
 * Fetch all reservations (from the reservations table) grouped by entry slug.
 */
function fetchReservations(PDO $pdo): array
{
    $stmt = $pdo->query(
        "SELECT ce.slug, r.reservation_key, r.text_en, r.text_de, r.severity,
                r.penalty_tier, r.penalty_amount, r.event_date, r.source_url
         FROM reservations r
         JOIN catalog_entries ce ON ce.id = r.entry_id
         WHERE ce.is_active = 1
         ORDER BY ce.slug ASC, r.sort_order ASC"
    );
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $grouped = [];
    foreach ($rows as $row) {
        $grouped[$row['slug']][] = $row;
    }
    return $grouped;
}

/**
 * Format a reservation as TypeScript object syntax.
 */
function formatReservation(array $res, int $baseIndent): string
{
    $pad = str_repeat(' ', $baseIndent);
    $innerPad = str_repeat(' ', $baseIndent + 2);

    $out = $pad . "{\n";
    $out .= $innerPad . "id: " . tsString($res['reservation_key'] ?? $res['id'] ?? '') . ",\n";
    $out .= $innerPad . "text: " . tsString($res['text_en'] ?? $res['text'] ?? '') . ",\n";

    $textDe = $res['text_de'] ?? $res['textDe'] ?? null;
    if ($textDe !== null) {
        $out .= $innerPad . "textDe: " . tsString($textDe) . ",\n";
    }

    $severity = $res['severity'] ?? 'moderate';
    $out .= $innerPad . "severity: " . tsString($severity) . ",\n";

    // Penalty
    $penaltyTier = $res['penalty_tier'] ?? null;
    $penaltyAmount = $res['penalty_amount'] ?? null;
    if ($penaltyTier !== null && $penaltyAmount !== null) {
        $out .= $innerPad . "penalty: { tier: " . tsString($penaltyTier) . ", amount: " . (int) $penaltyAmount . " },\n";
    }

    // Date
    $date = $res['event_date'] ?? $res['date'] ?? null;
    if ($date !== null) {
        $out .= $innerPad . "date: " . tsString($date) . ",\n";
    }

    // Source URL
    $sourceUrl = $res['source_url'] ?? $res['sourceUrl'] ?? null;
    if ($sourceUrl !== null) {
        $out .= $innerPad . "sourceUrl: " . tsString($sourceUrl) . ",\n";
    }

    $out .= $pad . "},\n";
    return $out;
}

/**
 * Fetch all positive signals grouped by entry slug.
 */
function fetchPositiveSignals(PDO $pdo): array
{
    $stmt = $pdo->query(
        "SELECT ce.slug, ps.signal_key, ps.text_en, ps.text_de,
                ps.dimension, ps.amount, ps.source_url
         FROM positive_signals ps
         JOIN catalog_entries ce ON ce.id = ps.entry_id
         WHERE ce.is_active = 1
         ORDER BY ce.slug ASC, ps.sort_order ASC"
    );
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $grouped = [];
    foreach ($rows as $row) {
        $grouped[$row['slug']][] = $row;
    }
    return $grouped;
}

/**
 * Format a positive signal as a TypeScript inline object.
 */
function formatPositiveSignal(array $sig): string
{
    $parts = [];
    $parts[] = "id: " . tsString($sig['signal_key']);
    $parts[] = "text: " . tsString($sig['text_en']);
    if ($sig['text_de'] !== null) {
        $parts[] = "textDe: " . tsString($sig['text_de']);
    }
    $parts[] = "dimension: " . tsString($sig['dimension']);
    $parts[] = "amount: " . (int) $sig['amount'];
    $parts[] = "sourceUrl: " . tsString($sig['source_url']);

    $inline = '    { ' . implode(', ', $parts) . ' },';

    // If the line is too long, format multi-line
    if (strlen($inline) > 160) {
        $out = "    {\n";
        foreach ($parts as $part) {
            $out .= "      {$part},\n";
        }
        $out .= "    },\n";
        return $out;
    }

    return $inline . "\n";
}

/**
 * Fetch scoring metadata.
 */
function fetchScoringMetadata(PDO $pdo): array
{
    $stmt = $pdo->query(
        "SELECT ce.slug, sm.base_class_override, sm.is_ad_surveillance
         FROM scoring_metadata sm
         JOIN catalog_entries ce ON ce.id = sm.entry_id
         WHERE ce.is_active = 1
         ORDER BY ce.slug ASC"
    );
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $result = [];
    foreach ($rows as $row) {
        $meta = [];
        if ($row['base_class_override'] !== null) {
            $meta['baseClassOverride'] = $row['base_class_override'];
        }
        if ($row['is_ad_surveillance'] !== null) {
            $meta['isAdSurveillance'] = (bool) $row['is_ad_surveillance'];
        }
        // Only include entries that have at least one override
        if (!empty($meta)) {
            $result[$row['slug']] = $meta;
        }
    }
    return $result;
}

/**
 * Fetch all US vendor data: records, aliases, profiles, and profile reservations.
 */
function fetchUsVendorData(PDO $pdo): array
{
    // 1. Vendor records with aliases
    $vendorStmt = $pdo->query(
        "SELECT uv.id, uv.slug, uv.name
         FROM us_vendors uv
         ORDER BY uv.slug ASC"
    );
    $vendors = $vendorStmt->fetchAll(PDO::FETCH_ASSOC);

    $vendorIds = array_column($vendors, 'id');

    // Aliases
    $aliases = [];
    if (!empty($vendorIds)) {
        $placeholders = implode(',', array_fill(0, count($vendorIds), '?'));
        $aliasStmt = $pdo->prepare(
            "SELECT us_vendor_id, alias_normalized
             FROM us_vendor_aliases
             WHERE us_vendor_id IN ({$placeholders})
             ORDER BY us_vendor_id, id"
        );
        $aliasStmt->execute($vendorIds);
        $aliasRows = $aliasStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($aliasRows as $row) {
            $aliases[$row['us_vendor_id']][] = $row['alias_normalized'];
        }
    }

    // Build records array
    $records = [];
    $vendorIdToSlug = [];
    foreach ($vendors as $v) {
        $vendorIdToSlug[$v['id']] = $v['slug'];
        $records[] = [
            'id' => $v['slug'],
            'name' => $v['name'],
            'aliases' => $aliases[$v['id']] ?? [],
        ];
    }

    // 2. Profiles
    $profiles = [];
    if (!empty($vendorIds)) {
        $placeholders = implode(',', array_fill(0, count($vendorIds), '?'));
        $profStmt = $pdo->prepare(
            "SELECT uvp.us_vendor_id, uvp.description_en, uvp.description_de,
                    uvp.trust_score_override_10
             FROM us_vendor_profiles uvp
             WHERE uvp.us_vendor_id IN ({$placeholders})"
        );
        $profStmt->execute($vendorIds);
        $profRows = $profStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($profRows as $row) {
            $slug = $vendorIdToSlug[$row['us_vendor_id']];
            $profiles[$slug] = [
                'us_vendor_id' => $row['us_vendor_id'],
                'description' => $row['description_en'],
                'descriptionDe' => $row['description_de'],
                'trustScore' => (float) $row['trust_score_override_10'],
            ];
        }

        // 3. Profile reservations
        $resStmt = $pdo->prepare(
            "SELECT uvpr.us_vendor_id, uvpr.reservation_key, uvpr.text_en, uvpr.text_de,
                    uvpr.severity, uvpr.penalty_tier, uvpr.penalty_amount,
                    uvpr.event_date, uvpr.source_url
             FROM us_vendor_profile_reservations uvpr
             WHERE uvpr.us_vendor_id IN ({$placeholders})
             ORDER BY uvpr.us_vendor_id, uvpr.sort_order"
        );
        $resStmt->execute($vendorIds);
        $resRows = $resStmt->fetchAll(PDO::FETCH_ASSOC);

        $resByVendorId = [];
        foreach ($resRows as $row) {
            $resByVendorId[$row['us_vendor_id']][] = $row;
        }

        // Attach reservations to profiles
        foreach ($profiles as $slug => &$profile) {
            $vid = $profile['us_vendor_id'];
            $profile['reservations'] = $resByVendorId[$vid] ?? [];
            unset($profile['us_vendor_id']);
        }
        unset($profile);
    }

    // Sort profiles by slug key
    ksort($profiles);

    return [
        'records' => $records,
        'profiles' => $profiles,
    ];
}

/**
 * Format a TypeScript object key. Always wraps in single quotes to match the
 * dominant style in positiveSignals.ts and scoringData.ts.
 */
function formatTsKey(string $key): string
{
    return "'" . tsEscapeSingle($key) . "'";
}

/**
 * Format a decimal number for TypeScript output.
 * Ensures at least one decimal place (e.g., 2.0 not 2).
 */
function formatDecimal(float $value): string
{
    $str = (string) $value;
    if (!str_contains($str, '.')) {
        $str .= '.0';
    }
    return $str;
}

/**
 * Return the utility functions appended to the bottom of usVendors.ts.
 * These are runtime helpers used by the frontend to resolve vendor comparisons.
 */
function usVendorUtilityFunctions(): string
{
    return <<<'TS'

function normalizeVendorName(value: string): string {
  return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
}

function slugifyVendorName(value: string): string {
  return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');
}

const US_VENDOR_BY_ALIAS = new Map<string, USVendorRecord>();

for (const record of US_VENDOR_RECORDS) {
  const normalizedNames = [record.name, ...record.aliases].map(normalizeVendorName);
  for (const normalizedName of normalizedNames) {
    if (normalizedName) {
      US_VENDOR_BY_ALIAS.set(normalizedName, record);
    }
  }
}

function toComparison(record: USVendorRecord, sourceName?: string): USVendorComparison {
  const profile = US_VENDOR_TRUST_PROFILES[record.id];
  const normalizedRecordName = normalizeVendorName(record.name);
  const normalizedSourceName = sourceName ? normalizeVendorName(sourceName) : '';
  const shouldIncludeContext = Boolean(normalizedSourceName) && normalizedSourceName !== normalizedRecordName;
  const sourceLabel = sourceName?.trim() ?? '';
  const lowerRecordName = record.name.toLowerCase();
  const lowerSourceLabel = sourceLabel.toLowerCase();
  const compactContext = lowerSourceLabel.startsWith(`${lowerRecordName} `)
      ? sourceLabel.slice(record.name.length).trim()
      : sourceLabel;
  const contextualName = (() => {
    if (!shouldIncludeContext || !compactContext) {
      return record.name;
    }

    if (compactContext.startsWith('(')) {
      return `${record.name} ${compactContext}`;
    }

    return `${record.name} (${compactContext})`;
  })();

  const hasProfileWithReservations = !!profile && profile.reservations.length > 0;

  return {
    id: record.id,
    name: contextualName,
    trustScoreStatus: hasProfileWithReservations ? 'ready' : 'pending',
    trustScore: hasProfileWithReservations ? profile.trustScore : undefined,
    description: hasProfileWithReservations ? profile.description : undefined,
    descriptionDe: hasProfileWithReservations ? profile.descriptionDe : undefined,
    reservations: hasProfileWithReservations ? profile.reservations : undefined,
  };
}

function toFallbackComparison(name: string): USVendorComparison {
  const normalized = name.trim();
  const fallbackId = slugifyVendorName(normalized) || 'us-vendor';

  return {
    id: `us-${fallbackId}`,
    name: normalized,
    trustScoreStatus: 'pending',
  };
}

export function resolveUSVendorComparison(name: string): USVendorComparison {
  const normalized = normalizeVendorName(name);
  const record = US_VENDOR_BY_ALIAS.get(normalized);

  if (record) {
    return toComparison(record, name);
  }

  return toFallbackComparison(name);
}

export function buildUSVendorComparisons(names: string[]): USVendorComparison[] {
  const deduped = new Map<string, USVendorComparison>();

  for (const name of names) {
    if (!name.trim()) continue;
    const comparison = resolveUSVendorComparison(name);
    if (!deduped.has(comparison.id)) {
      deduped.set(comparison.id, comparison);
    }
  }

  return Array.from(deduped.values());
}
TS;
}
