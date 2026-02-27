<?php
declare(strict_types=1);

/**
 * Database Import Script — European Alternatives
 *
 * Reads a pre-exported JSON catalog (produced by scripts/export-to-json.mjs)
 * and seeds all 20 MySQL tables in a single transaction.
 *
 * Usage:
 *   php scripts/db-import.php --source tmp/export/catalog.json
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

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Write a message to stderr.
 */
function stderr(string $msg): void
{
    fwrite(STDERR, $msg . "\n");
}

/**
 * Parse CLI arguments. Returns associative array of --key value pairs.
 */
function parseCliArgs(array $argv): array
{
    $args = [];
    $count = count($argv);
    for ($i = 1; $i < $count; $i++) {
        if (str_starts_with($argv[$i], '--') && $i + 1 < $count) {
            $key = substr($argv[$i], 2);
            $args[$key] = $argv[$i + 1];
            $i++; // skip value
        }
    }
    return $args;
}

/**
 * Encode a value as JSON for a MySQL JSON column, or return null.
 */
function jsonColumnValue(mixed $value): ?string
{
    if ($value === null) {
        return null;
    }
    return json_encode($value, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
}

// ── Argument parsing ────────────────────────────────────────────────────────
$args = parseCliArgs($argv);

if (!isset($args['source'])) {
    stderr('Usage: php scripts/db-import.php --source path/to/catalog.json');
    exit(1);
}

$sourcePath = $args['source'];
if (!is_readable($sourcePath)) {
    stderr("Error: Source file not readable: {$sourcePath}");
    exit(1);
}

// ── Load JSON ───────────────────────────────────────────────────────────────
stderr("Reading source file: {$sourcePath}");
$rawJson = file_get_contents($sourcePath);
if ($rawJson === false) {
    stderr('Error: Failed to read source file.');
    exit(1);
}

$data = json_decode($rawJson, true, 512, JSON_THROW_ON_ERROR);
if (!is_array($data)) {
    stderr('Error: Source file does not contain a valid JSON object.');
    exit(1);
}

// ── Connect ─────────────────────────────────────────────────────────────────
stderr('Connecting to database...');
$pdo = getDatabaseConnection();

// ── Advisory lock ───────────────────────────────────────────────────────────
$lockStmt = $pdo->query("SELECT GET_LOCK('euroalt_import', 0) AS acquired");
$lockResult = $lockStmt->fetch(PDO::FETCH_ASSOC);
if (!$lockResult || (int) $lockResult['acquired'] !== 1) {
    stderr('Error: Could not acquire advisory lock. Another import may be running.');
    exit(1);
}
stderr('Advisory lock acquired.');

// ── Row-count tracker ───────────────────────────────────────────────────────
$rowCounts = [];

/**
 * Track the number of rows inserted into a table.
 */
function trackRows(string $table, int $count): void
{
    global $rowCounts;
    $rowCounts[$table] = ($rowCounts[$table] ?? 0) + $count;
}

// ── Table definitions ───────────────────────────────────────────────────────

/**
 * All 20 tables in reverse FK-dependency order for DELETE.
 * Child tables first, parent tables last.
 */
const DELETE_ORDER = [
    'landing_group_categories',
    'landing_category_groups',
    'further_reading_resources',
    'denied_decisions',
    'scoring_metadata',
    'positive_signals',
    'reservations',
    'entry_replacements',
    'category_us_vendors',
    'us_vendor_profile_reservations',
    'us_vendor_profiles',
    'us_vendor_aliases',
    'us_vendors',
    'entry_tags',
    'entry_categories',
    'catalog_entries',
    'tags',
    'categories',
    'countries',
];

// ── Import functions ────────────────────────────────────────────────────────

/**
 * Delete all rows in reverse FK order.
 */
function deleteAllRows(PDO $pdo): void
{
    foreach (DELETE_ORDER as $table) {
        $pdo->exec("DELETE FROM `{$table}`");
        stderr("  Cleared {$table}");
    }
}

/**
 * Step 1: Import countries.
 */
function importCountries(PDO $pdo, array $countries): void
{
    stderr('Importing countries...');
    $stmt = $pdo->prepare(
        'INSERT INTO `countries` (`code`, `label_en`, `label_de`, `sort_order`)
         VALUES (:code, :label_en, :label_de, :sort_order)'
    );

    $count = 0;
    foreach ($countries as $idx => $row) {
        $stmt->execute([
            ':code'       => $row['code'],
            ':label_en'   => $row['label_en'],
            ':label_de'   => $row['label_de'],
            ':sort_order' => $row['sort_order'] ?? $idx,
        ]);
        $count++;
    }

    trackRows('countries', $count);
    stderr("  countries: {$count} rows");
}

/**
 * Step 2: Import categories.
 */
function importCategories(PDO $pdo, array $categories): void
{
    stderr('Importing categories...');
    $stmt = $pdo->prepare(
        'INSERT INTO `categories` (`id`, `emoji`, `name_en`, `name_de`, `description_en`, `description_de`, `sort_order`)
         VALUES (:id, :emoji, :name_en, :name_de, :description_en, :description_de, :sort_order)'
    );

    $count = 0;
    foreach ($categories as $idx => $row) {
        $stmt->execute([
            ':id'             => $row['id'],
            ':emoji'          => $row['emoji'],
            ':name_en'        => $row['name_en'],
            ':name_de'        => $row['name_de'],
            ':description_en' => $row['description_en'],
            ':description_de' => $row['description_de'],
            ':sort_order'     => $row['sort_order'] ?? $idx,
        ]);
        $count++;
    }

    trackRows('categories', $count);
    stderr("  categories: {$count} rows");
}

/**
 * Step 3: Import tags.
 */
function importTags(PDO $pdo, array $tags): void
{
    stderr('Importing tags...');
    $stmt = $pdo->prepare(
        'INSERT INTO `tags` (`slug`, `label_en`, `label_de`)
         VALUES (:slug, :label_en, :label_de)'
    );

    $count = 0;
    foreach ($tags as $row) {
        $stmt->execute([
            ':slug'     => $row['slug'],
            ':label_en' => $row['label_en'] ?? null,
            ':label_de' => $row['label_de'] ?? null,
        ]);
        $count++;
    }

    trackRows('tags', $count);
    stderr("  tags: {$count} rows");
}

/**
 * Step 4: Import catalog_entries (all statuses: alternative, us, denied, draft).
 * Returns a slug->id lookup map.
 */
function importCatalogEntries(PDO $pdo, array $entries): array
{
    stderr('Importing catalog_entries...');
    $stmt = $pdo->prepare(
        'INSERT INTO `catalog_entries` (
            `slug`, `status`, `source_file`, `is_active`, `date_added`,
            `name`, `description_en`, `description_de`,
            `country_code`, `website_url`, `logo_path`,
            `pricing`, `is_open_source`, `open_source_level`,
            `open_source_audit_url`, `source_code_url`, `self_hostable`,
            `founded_year`, `headquarters_city`, `license_text`,
            `action_links_json`
        ) VALUES (
            :slug, :status, :source_file, :is_active, :date_added,
            :name, :description_en, :description_de,
            :country_code, :website_url, :logo_path,
            :pricing, :is_open_source, :open_source_level,
            :open_source_audit_url, :source_code_url, :self_hostable,
            :founded_year, :headquarters_city, :license_text,
            :action_links_json
        )'
    );

    $slugToId = [];
    $count = 0;

    foreach ($entries as $entry) {
        $isOpenSource = $entry['is_open_source'] ?? null;
        $openSourceLevel = $entry['open_source_level'] ?? null;

        // Normalize is_open_source to int for MySQL TINYINT(1)
        $isOpenSourceVal = null;
        if ($isOpenSource !== null) {
            $isOpenSourceVal = $isOpenSource ? 1 : 0;
        }

        $stmt->execute([
            ':slug'                  => $entry['slug'],
            ':status'                => $entry['status'],
            ':source_file'           => $entry['source_file'],
            ':is_active'             => ($entry['is_active'] ?? true) ? 1 : 0,
            ':date_added'            => $entry['date_added'] ?? date('Y-m-d'),
            ':name'                  => $entry['name'],
            ':description_en'        => $entry['description_en'] ?? null,
            ':description_de'        => $entry['description_de'] ?? null,
            ':country_code'          => $entry['country_code'] ?? null,
            ':website_url'           => $entry['website_url'] ?? null,
            ':logo_path'             => $entry['logo_path'] ?? null,
            ':pricing'               => $entry['pricing'] ?? null,
            ':is_open_source'        => $isOpenSourceVal,
            ':open_source_level'     => $openSourceLevel,
            ':open_source_audit_url' => $entry['open_source_audit_url'] ?? null,
            ':source_code_url'       => $entry['source_code_url'] ?? null,
            ':self_hostable'         => isset($entry['self_hostable']) ? ($entry['self_hostable'] ? 1 : 0) : null,
            ':founded_year'          => $entry['founded_year'] ?? null,
            ':headquarters_city'     => $entry['headquarters_city'] ?? null,
            ':license_text'          => $entry['license_text'] ?? null,
            ':action_links_json'     => jsonColumnValue($entry['action_links_json'] ?? null),
        ]);

        $slugToId[$entry['slug']] = (int) $pdo->lastInsertId();
        $count++;
    }

    trackRows('catalog_entries', $count);
    stderr("  catalog_entries: {$count} rows");

    return $slugToId;
}

/**
 * Step 5a: Import entry_categories.
 */
function importEntryCategories(PDO $pdo, array $entryCategories, array $slugToId): void
{
    stderr('Importing entry_categories...');
    $stmt = $pdo->prepare(
        'INSERT INTO `entry_categories` (`entry_id`, `category_id`, `is_primary`, `sort_order`)
         VALUES (:entry_id, :category_id, :is_primary, :sort_order)'
    );

    $count = 0;
    foreach ($entryCategories as $row) {
        $entryId = $slugToId[$row['entry_slug']] ?? null;
        if ($entryId === null) {
            stderr("  WARNING: entry_categories references unknown slug: {$row['entry_slug']}");
            continue;
        }

        $stmt->execute([
            ':entry_id'    => $entryId,
            ':category_id' => $row['category_id'],
            ':is_primary'  => ($row['is_primary'] ?? false) ? 1 : 0,
            ':sort_order'  => $row['sort_order'] ?? 0,
        ]);
        $count++;
    }

    trackRows('entry_categories', $count);
    stderr("  entry_categories: {$count} rows");
}

/**
 * Step 5b: Import entry_tags.
 * Requires a tag slug->id lookup.
 */
function importEntryTags(PDO $pdo, array $entryTags, array $slugToId): void
{
    stderr('Importing entry_tags...');

    // Build tag slug->id map from DB
    $tagMap = [];
    $result = $pdo->query('SELECT `id`, `slug` FROM `tags`');
    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
        $tagMap[$row['slug']] = (int) $row['id'];
    }

    $stmt = $pdo->prepare(
        'INSERT INTO `entry_tags` (`entry_id`, `tag_id`, `sort_order`)
         VALUES (:entry_id, :tag_id, :sort_order)'
    );

    $count = 0;
    foreach ($entryTags as $row) {
        $entryId = $slugToId[$row['entry_slug']] ?? null;
        if ($entryId === null) {
            stderr("  WARNING: entry_tags references unknown entry slug: {$row['entry_slug']}");
            continue;
        }

        $tagId = $tagMap[$row['tag_slug']] ?? null;
        if ($tagId === null) {
            stderr("  WARNING: entry_tags references unknown tag slug: {$row['tag_slug']}");
            continue;
        }

        $stmt->execute([
            ':entry_id'   => $entryId,
            ':tag_id'     => $tagId,
            ':sort_order' => $row['sort_order'] ?? 0,
        ]);
        $count++;
    }

    trackRows('entry_tags', $count);
    stderr("  entry_tags: {$count} rows");
}

/**
 * Step 6a: Import us_vendors.
 * Returns a vendor slug->id lookup map.
 */
function importUsVendors(PDO $pdo, array $vendors, array $slugToId): array
{
    stderr('Importing us_vendors...');
    $stmt = $pdo->prepare(
        'INSERT INTO `us_vendors` (`slug`, `name`, `entry_id`)
         VALUES (:slug, :name, :entry_id)'
    );

    $vendorSlugToId = [];
    $count = 0;

    foreach ($vendors as $vendor) {
        $entryId = $slugToId[$vendor['entry_slug']] ?? null;
        if ($entryId === null) {
            stderr("  WARNING: us_vendor references unknown entry slug: {$vendor['entry_slug']}");
            continue;
        }

        $stmt->execute([
            ':slug'     => $vendor['slug'],
            ':name'     => $vendor['name'],
            ':entry_id' => $entryId,
        ]);

        $vendorSlugToId[$vendor['slug']] = (int) $pdo->lastInsertId();
        $count++;
    }

    trackRows('us_vendors', $count);
    stderr("  us_vendors: {$count} rows");

    return $vendorSlugToId;
}

/**
 * Step 6b: Import us_vendor_aliases.
 */
function importUsVendorAliases(PDO $pdo, array $aliases, array $vendorSlugToId): void
{
    stderr('Importing us_vendor_aliases...');
    $stmt = $pdo->prepare(
        'INSERT INTO `us_vendor_aliases` (`us_vendor_id`, `alias_normalized`)
         VALUES (:us_vendor_id, :alias_normalized)'
    );

    $count = 0;
    foreach ($aliases as $row) {
        $vendorId = $vendorSlugToId[$row['vendor_slug']] ?? null;
        if ($vendorId === null) {
            stderr("  WARNING: us_vendor_alias references unknown vendor slug: {$row['vendor_slug']}");
            continue;
        }

        $stmt->execute([
            ':us_vendor_id'     => $vendorId,
            ':alias_normalized' => $row['alias_normalized'],
        ]);
        $count++;
    }

    trackRows('us_vendor_aliases', $count);
    stderr("  us_vendor_aliases: {$count} rows");
}

/**
 * Step 7a: Import us_vendor_profiles.
 */
function importUsVendorProfiles(PDO $pdo, array $profiles, array $vendorSlugToId): void
{
    stderr('Importing us_vendor_profiles...');
    $stmt = $pdo->prepare(
        'INSERT INTO `us_vendor_profiles` (
            `us_vendor_id`, `description_en`, `description_de`,
            `trust_score_override_10`, `trust_score_status`, `score_source`
        ) VALUES (
            :us_vendor_id, :description_en, :description_de,
            :trust_score_override_10, :trust_score_status, :score_source
        )'
    );

    $count = 0;
    foreach ($profiles as $row) {
        $vendorId = $vendorSlugToId[$row['vendor_slug']] ?? null;
        if ($vendorId === null) {
            stderr("  WARNING: us_vendor_profile references unknown vendor slug: {$row['vendor_slug']}");
            continue;
        }

        $stmt->execute([
            ':us_vendor_id'            => $vendorId,
            ':description_en'          => $row['description_en'] ?? null,
            ':description_de'          => $row['description_de'] ?? null,
            ':trust_score_override_10' => $row['trust_score_override_10'] ?? null,
            ':trust_score_status'      => $row['trust_score_status'] ?? 'pending',
            ':score_source'            => $row['score_source'] ?? 'computed',
        ]);
        $count++;
    }

    trackRows('us_vendor_profiles', $count);
    stderr("  us_vendor_profiles: {$count} rows");
}

/**
 * Step 7b: Import us_vendor_profile_reservations.
 */
function importUsVendorProfileReservations(PDO $pdo, array $reservations, array $vendorSlugToId): void
{
    stderr('Importing us_vendor_profile_reservations...');
    $stmt = $pdo->prepare(
        'INSERT INTO `us_vendor_profile_reservations` (
            `us_vendor_id`, `reservation_key`, `sort_order`,
            `text_en`, `text_de`, `severity`, `event_date`,
            `source_url`, `penalty_tier`, `penalty_amount`
        ) VALUES (
            :us_vendor_id, :reservation_key, :sort_order,
            :text_en, :text_de, :severity, :event_date,
            :source_url, :penalty_tier, :penalty_amount
        )'
    );

    $count = 0;
    foreach ($reservations as $row) {
        $vendorId = $vendorSlugToId[$row['vendor_slug']] ?? null;
        if ($vendorId === null) {
            stderr("  WARNING: us_vendor_profile_reservation references unknown vendor slug: {$row['vendor_slug']}");
            continue;
        }

        $stmt->execute([
            ':us_vendor_id'    => $vendorId,
            ':reservation_key' => $row['reservation_key'],
            ':sort_order'      => $row['sort_order'],
            ':text_en'         => $row['text_en'],
            ':text_de'         => $row['text_de'] ?? null,
            ':severity'        => $row['severity'],
            ':event_date'      => $row['event_date'] ?? null,
            ':source_url'      => $row['source_url'] ?? null,
            ':penalty_tier'    => $row['penalty_tier'] ?? null,
            ':penalty_amount'  => $row['penalty_amount'] ?? null,
        ]);
        $count++;
    }

    trackRows('us_vendor_profile_reservations', $count);
    stderr("  us_vendor_profile_reservations: {$count} rows");
}

/**
 * Step 8: Import category_us_vendors.
 */
function importCategoryUsVendors(PDO $pdo, array $categoryVendors, array $vendorSlugToId): void
{
    stderr('Importing category_us_vendors...');
    $stmt = $pdo->prepare(
        'INSERT INTO `category_us_vendors` (`category_id`, `us_vendor_id`, `raw_name`, `sort_order`)
         VALUES (:category_id, :us_vendor_id, :raw_name, :sort_order)'
    );

    $count = 0;
    foreach ($categoryVendors as $row) {
        $vendorId = null;
        if (isset($row['vendor_slug']) && $row['vendor_slug'] !== null) {
            $vendorId = $vendorSlugToId[$row['vendor_slug']] ?? null;
        }

        $stmt->execute([
            ':category_id'  => $row['category_id'],
            ':us_vendor_id' => $vendorId,
            ':raw_name'     => $row['raw_name'],
            ':sort_order'   => $row['sort_order'],
        ]);
        $count++;
    }

    trackRows('category_us_vendors', $count);
    stderr("  category_us_vendors: {$count} rows");
}

/**
 * Step 9: Import entry_replacements.
 */
function importEntryReplacements(PDO $pdo, array $replacements, array $slugToId, array $vendorSlugToId): void
{
    stderr('Importing entry_replacements...');
    $stmt = $pdo->prepare(
        'INSERT INTO `entry_replacements` (`entry_id`, `raw_name`, `us_vendor_id`, `sort_order`)
         VALUES (:entry_id, :raw_name, :us_vendor_id, :sort_order)'
    );

    $count = 0;
    foreach ($replacements as $row) {
        $entryId = $slugToId[$row['entry_slug']] ?? null;
        if ($entryId === null) {
            stderr("  WARNING: entry_replacement references unknown entry slug: {$row['entry_slug']}");
            continue;
        }

        $vendorId = null;
        if (isset($row['vendor_slug']) && $row['vendor_slug'] !== null) {
            $vendorId = $vendorSlugToId[$row['vendor_slug']] ?? null;
        }

        $stmt->execute([
            ':entry_id'     => $entryId,
            ':raw_name'     => $row['raw_name'],
            ':us_vendor_id' => $vendorId,
            ':sort_order'   => $row['sort_order'],
        ]);
        $count++;
    }

    trackRows('entry_replacements', $count);
    stderr("  entry_replacements: {$count} rows");
}

/**
 * Step 10: Import reservations.
 */
function importReservations(PDO $pdo, array $reservations, array $slugToId): void
{
    stderr('Importing reservations...');
    $stmt = $pdo->prepare(
        'INSERT INTO `reservations` (
            `entry_id`, `reservation_key`, `sort_order`,
            `severity`, `event_date`, `penalty_tier`, `penalty_amount`,
            `is_structural`, `text_en`, `text_de`, `source_url`
        ) VALUES (
            :entry_id, :reservation_key, :sort_order,
            :severity, :event_date, :penalty_tier, :penalty_amount,
            :is_structural, :text_en, :text_de, :source_url
        )'
    );

    $count = 0;
    foreach ($reservations as $row) {
        $entryId = $slugToId[$row['entry_slug']] ?? null;
        if ($entryId === null) {
            stderr("  WARNING: reservation references unknown entry slug: {$row['entry_slug']}");
            continue;
        }

        $stmt->execute([
            ':entry_id'        => $entryId,
            ':reservation_key' => $row['reservation_key'],
            ':sort_order'      => $row['sort_order'],
            ':severity'        => $row['severity'],
            ':event_date'      => $row['event_date'] ?? null,
            ':penalty_tier'    => $row['penalty_tier'] ?? null,
            ':penalty_amount'  => $row['penalty_amount'] ?? null,
            ':is_structural'   => ($row['is_structural'] ?? false) ? 1 : 0,
            ':text_en'         => $row['text_en'],
            ':text_de'         => $row['text_de'] ?? null,
            ':source_url'      => $row['source_url'] ?? null,
        ]);
        $count++;
    }

    trackRows('reservations', $count);
    stderr("  reservations: {$count} rows");
}

/**
 * Step 11: Import positive_signals.
 */
function importPositiveSignals(PDO $pdo, array $signals, array $slugToId): void
{
    stderr('Importing positive_signals...');
    $stmt = $pdo->prepare(
        'INSERT INTO `positive_signals` (
            `entry_id`, `signal_key`, `sort_order`,
            `dimension`, `amount`, `text_en`, `text_de`, `source_url`
        ) VALUES (
            :entry_id, :signal_key, :sort_order,
            :dimension, :amount, :text_en, :text_de, :source_url
        )'
    );

    $count = 0;
    foreach ($signals as $row) {
        $entryId = $slugToId[$row['entry_slug']] ?? null;
        if ($entryId === null) {
            stderr("  WARNING: positive_signal references unknown entry slug: {$row['entry_slug']}");
            continue;
        }

        $stmt->execute([
            ':entry_id'   => $entryId,
            ':signal_key' => $row['signal_key'],
            ':sort_order' => $row['sort_order'],
            ':dimension'  => $row['dimension'],
            ':amount'     => $row['amount'],
            ':text_en'    => $row['text_en'],
            ':text_de'    => $row['text_de'] ?? null,
            ':source_url' => $row['source_url'] ?? null,
        ]);
        $count++;
    }

    trackRows('positive_signals', $count);
    stderr("  positive_signals: {$count} rows");
}

/**
 * Step 12: Import scoring_metadata.
 */
function importScoringMetadata(PDO $pdo, array $metadata, array $slugToId): void
{
    stderr('Importing scoring_metadata...');
    $stmt = $pdo->prepare(
        'INSERT INTO `scoring_metadata` (
            `entry_id`, `base_class_override`, `is_ad_surveillance`,
            `deep_research_path`, `worksheet_path`
        ) VALUES (
            :entry_id, :base_class_override, :is_ad_surveillance,
            :deep_research_path, :worksheet_path
        )'
    );

    $count = 0;
    foreach ($metadata as $row) {
        $entryId = $slugToId[$row['entry_slug']] ?? null;
        if ($entryId === null) {
            stderr("  WARNING: scoring_metadata references unknown entry slug: {$row['entry_slug']}");
            continue;
        }

        $stmt->execute([
            ':entry_id'             => $entryId,
            ':base_class_override'  => $row['base_class_override'] ?? null,
            ':is_ad_surveillance'   => isset($row['is_ad_surveillance']) ? ($row['is_ad_surveillance'] ? 1 : 0) : null,
            ':deep_research_path'   => $row['deep_research_path'] ?? null,
            ':worksheet_path'       => $row['worksheet_path'] ?? null,
        ]);
        $count++;
    }

    trackRows('scoring_metadata', $count);
    stderr("  scoring_metadata: {$count} rows");
}

/**
 * Step 13: Write cached trust scores to catalog_entries.
 */
function updateTrustScores(PDO $pdo, array $trustScores, array $slugToId): void
{
    stderr('Updating trust scores on catalog_entries...');
    $stmt = $pdo->prepare(
        'UPDATE `catalog_entries` SET
            `trust_score_100` = :trust_score_100,
            `trust_score_10_display` = :trust_score_10_display,
            `trust_score_status` = :trust_score_status,
            `trust_score_breakdown_json` = :trust_score_breakdown_json
         WHERE `id` = :id'
    );

    $count = 0;
    foreach ($trustScores as $row) {
        $entryId = $slugToId[$row['entry_slug']] ?? null;
        if ($entryId === null) {
            stderr("  WARNING: trust_score references unknown entry slug: {$row['entry_slug']}");
            continue;
        }

        $stmt->execute([
            ':id'                          => $entryId,
            ':trust_score_100'             => $row['trust_score_100'] ?? null,
            ':trust_score_10_display'      => $row['trust_score_10_display'] ?? null,
            ':trust_score_status'          => $row['trust_score_status'] ?? null,
            ':trust_score_breakdown_json'  => jsonColumnValue($row['trust_score_breakdown_json'] ?? null),
        ]);
        $count++;
    }

    trackRows('catalog_entries (trust scores)', $count);
    stderr("  trust scores updated: {$count} entries");
}

/**
 * Step 14: Import denied_decisions.
 */
function importDeniedDecisions(PDO $pdo, array $decisions, array $slugToId): void
{
    stderr('Importing denied_decisions...');
    $stmt = $pdo->prepare(
        'INSERT INTO `denied_decisions` (
            `entry_id`, `proposed_in`, `claimed_origin`, `actual_origin`,
            `removed_in`, `raw_category_label`, `failed_gateways_json`,
            `text_en`, `text_de`, `sources_json`
        ) VALUES (
            :entry_id, :proposed_in, :claimed_origin, :actual_origin,
            :removed_in, :raw_category_label, :failed_gateways_json,
            :text_en, :text_de, :sources_json
        )'
    );

    $count = 0;
    foreach ($decisions as $row) {
        $entryId = $slugToId[$row['entry_slug']] ?? null;
        if ($entryId === null) {
            stderr("  WARNING: denied_decision references unknown entry slug: {$row['entry_slug']}");
            continue;
        }

        $stmt->execute([
            ':entry_id'              => $entryId,
            ':proposed_in'           => $row['proposed_in'] ?? null,
            ':claimed_origin'        => $row['claimed_origin'] ?? null,
            ':actual_origin'         => $row['actual_origin'] ?? null,
            ':removed_in'            => $row['removed_in'] ?? null,
            ':raw_category_label'    => $row['raw_category_label'] ?? null,
            ':failed_gateways_json'  => jsonColumnValue($row['failed_gateways_json'] ?? null),
            ':text_en'               => $row['text_en'],
            ':text_de'               => $row['text_de'] ?? null,
            ':sources_json'          => jsonColumnValue($row['sources_json'] ?? null),
        ]);
        $count++;
    }

    trackRows('denied_decisions', $count);
    stderr("  denied_decisions: {$count} rows");
}

/**
 * Step 15: Import further_reading_resources.
 */
function importFurtherReadingResources(PDO $pdo, array $resources): void
{
    stderr('Importing further_reading_resources...');
    $stmt = $pdo->prepare(
        'INSERT INTO `further_reading_resources` (
            `slug`, `name`, `website_url`, `section`, `focus`,
            `related_issues_json`, `last_reviewed`, `sort_order`
        ) VALUES (
            :slug, :name, :website_url, :section, :focus,
            :related_issues_json, :last_reviewed, :sort_order
        )'
    );

    $count = 0;
    foreach ($resources as $idx => $row) {
        $stmt->execute([
            ':slug'                => $row['slug'],
            ':name'                => $row['name'],
            ':website_url'         => $row['website_url'],
            ':section'             => $row['section'],
            ':focus'               => $row['focus'],
            ':related_issues_json' => jsonColumnValue($row['related_issues_json'] ?? null),
            ':last_reviewed'       => $row['last_reviewed'] ?? null,
            ':sort_order'          => $row['sort_order'] ?? $idx,
        ]);
        $count++;
    }

    trackRows('further_reading_resources', $count);
    stderr("  further_reading_resources: {$count} rows");
}

/**
 * Step 16a: Import landing_category_groups.
 * Returns a group index->id lookup map.
 */
function importLandingCategoryGroups(PDO $pdo, array $groups): array
{
    stderr('Importing landing_category_groups...');
    $stmt = $pdo->prepare(
        'INSERT INTO `landing_category_groups` (
            `name_en`, `name_de`, `description_en`, `description_de`, `sort_order`
        ) VALUES (
            :name_en, :name_de, :description_en, :description_de, :sort_order
        )'
    );

    $groupIdMap = [];
    $count = 0;

    foreach ($groups as $idx => $row) {
        $stmt->execute([
            ':name_en'        => $row['name_en'],
            ':name_de'        => $row['name_de'] ?? null,
            ':description_en' => $row['description_en'] ?? null,
            ':description_de' => $row['description_de'] ?? null,
            ':sort_order'     => $row['sort_order'] ?? $idx,
        ]);

        // Map by the group's source identifier (slug or index)
        $sourceKey = $row['source_id'] ?? (string) $idx;
        $groupIdMap[$sourceKey] = (int) $pdo->lastInsertId();
        $count++;
    }

    trackRows('landing_category_groups', $count);
    stderr("  landing_category_groups: {$count} rows");

    return $groupIdMap;
}

/**
 * Step 16b: Import landing_group_categories.
 */
function importLandingGroupCategories(PDO $pdo, array $groupCategories, array $groupIdMap): void
{
    stderr('Importing landing_group_categories...');
    $stmt = $pdo->prepare(
        'INSERT INTO `landing_group_categories` (`group_id`, `category_id`, `sort_order`)
         VALUES (:group_id, :category_id, :sort_order)'
    );

    $count = 0;
    foreach ($groupCategories as $row) {
        $groupId = $groupIdMap[$row['group_source_id']] ?? null;
        if ($groupId === null) {
            stderr("  WARNING: landing_group_category references unknown group source_id: {$row['group_source_id']}");
            continue;
        }

        $stmt->execute([
            ':group_id'    => $groupId,
            ':category_id' => $row['category_id'],
            ':sort_order'  => $row['sort_order'] ?? 0,
        ]);
        $count++;
    }

    trackRows('landing_group_categories', $count);
    stderr("  landing_group_categories: {$count} rows");
}

// ── Main import execution ───────────────────────────────────────────────────

try {
    // Disable FK checks at session level (survives transaction boundaries)
    $pdo->exec('SET FOREIGN_KEY_CHECKS = 0');
    stderr('Foreign key checks disabled.');

    $pdo->beginTransaction();
    stderr('Transaction started.');

    // ── Delete all rows in reverse FK order ─────────────────────────────
    stderr('Clearing all tables...');
    deleteAllRows($pdo);

    // ── Step 1: countries ───────────────────────────────────────────────
    importCountries($pdo, $data['countries'] ?? []);

    // ── Step 2: categories ──────────────────────────────────────────────
    importCategories($pdo, $data['categories'] ?? []);

    // ── Step 3: tags ────────────────────────────────────────────────────
    importTags($pdo, $data['tags'] ?? []);

    // ── Step 4: catalog_entries ─────────────────────────────────────────
    $slugToId = importCatalogEntries($pdo, $data['catalog_entries'] ?? []);

    // ── Step 5: entry_categories + entry_tags ───────────────────────────
    importEntryCategories($pdo, $data['entry_categories'] ?? [], $slugToId);
    importEntryTags($pdo, $data['entry_tags'] ?? [], $slugToId);

    // ── Step 6: us_vendors + us_vendor_aliases ──────────────────────────
    $vendorSlugToId = importUsVendors($pdo, $data['us_vendors'] ?? [], $slugToId);
    importUsVendorAliases($pdo, $data['us_vendor_aliases'] ?? [], $vendorSlugToId);

    // ── Step 7: us_vendor_profiles + us_vendor_profile_reservations ─────
    importUsVendorProfiles($pdo, $data['us_vendor_profiles'] ?? [], $vendorSlugToId);
    importUsVendorProfileReservations($pdo, $data['us_vendor_profile_reservations'] ?? [], $vendorSlugToId);

    // ── Step 8: category_us_vendors ─────────────────────────────────────
    importCategoryUsVendors($pdo, $data['category_us_vendors'] ?? [], $vendorSlugToId);

    // ── Step 9: entry_replacements ──────────────────────────────────────
    importEntryReplacements($pdo, $data['entry_replacements'] ?? [], $slugToId, $vendorSlugToId);

    // ── Step 10: reservations ───────────────────────────────────────────
    importReservations($pdo, $data['reservations'] ?? [], $slugToId);

    // ── Step 11: positive_signals ───────────────────────────────────────
    importPositiveSignals($pdo, $data['positive_signals'] ?? [], $slugToId);

    // ── Step 12: scoring_metadata ───────────────────────────────────────
    importScoringMetadata($pdo, $data['scoring_metadata'] ?? [], $slugToId);

    // ── Step 13: trust scores (UPDATE catalog_entries) ──────────────────
    updateTrustScores($pdo, $data['trust_scores'] ?? [], $slugToId);

    // ── Step 14: denied_decisions ───────────────────────────────────────
    importDeniedDecisions($pdo, $data['denied_decisions'] ?? [], $slugToId);

    // ── Step 15: further_reading_resources ──────────────────────────────
    importFurtherReadingResources($pdo, $data['further_reading_resources'] ?? []);

    // ── Step 16: landing_category_groups + landing_group_categories ─────
    $groupIdMap = importLandingCategoryGroups($pdo, $data['landing_category_groups'] ?? []);
    importLandingGroupCategories($pdo, $data['landing_group_categories'] ?? [], $groupIdMap);

    // ── Commit ──────────────────────────────────────────────────────────
    $pdo->commit();
    stderr('Transaction committed successfully.');

} catch (Throwable $e) {
    // Roll back on any failure
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
        stderr('Transaction rolled back.');
    }

    stderr('');
    stderr('ERROR: Import failed.');
    stderr("Message: {$e->getMessage()}");
    stderr("File:    {$e->getFile()}:{$e->getLine()}");
    stderr('');
    stderr('Stack trace:');
    stderr($e->getTraceAsString());

    // Mark failure so summary section knows to exit
    $importFailed = true;

} finally {
    // Always restore FK checks and release advisory lock
    try {
        $pdo->exec('SET FOREIGN_KEY_CHECKS = 1');
        stderr('Foreign key checks re-enabled.');
    } catch (Throwable $ignored) {
        // Connection may be dead; best-effort
    }

    try {
        $pdo->exec("SELECT RELEASE_LOCK('euroalt_import')");
        stderr('Advisory lock released.');
    } catch (Throwable $ignored) {
        // Connection may be dead; best-effort
    }
}

if (!empty($importFailed)) {
    exit(1);
}

// ── Summary ─────────────────────────────────────────────────────────────────
stderr('');
stderr('=== Import Summary ===');
$totalRows = 0;
foreach ($rowCounts as $table => $count) {
    stderr(sprintf('  %-45s %d rows', $table, $count));
    $totalRows += $count;
}
stderr(sprintf('  %-45s %d rows', 'TOTAL', $totalRows));
stderr('');
stderr('Import completed successfully.');
