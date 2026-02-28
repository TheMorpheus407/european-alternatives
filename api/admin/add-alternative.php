<?php
declare(strict_types=1);

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/auth.php';

requireHttpMethod('POST');
requireAdminAuth();

// This endpoint is CLI-only (called by research-alternative.sh via curl).
// Reject any request with an Origin header to block browser-originated requests entirely.
// If a browser-based admin UI is ever added, replace this with an origin allowlist check.
if (isset($_SERVER['HTTP_ORIGIN'])) {
    jsonError(403, 'browser_requests_not_allowed');
}

// --- Read & decode request body ---

$rawBody = file_get_contents('php://input', false, null, 0, 65536); // 64KB limit
if ($rawBody === false || $rawBody === '') {
    jsonError(400, 'empty_request_body');
}

$body = json_decode($rawBody, true);
if (!is_array($body)) {
    jsonError(400, 'invalid_json');
}

// --- Validate required fields ---

$requiredStrings = ['slug', 'name', 'description_en', 'country_code', 'website_url'];
foreach ($requiredStrings as $field) {
    if (!isset($body[$field]) || !is_string($body[$field]) || trim($body[$field]) === '') {
        jsonError(400, "missing_or_empty_field:$field");
    }
}

$slug = trim($body['slug']);
$name = trim($body['name']);

// Validate slug format (lowercase alphanumeric, hyphens, dots)
if (!preg_match('/^[a-z0-9][a-z0-9._-]{0,98}[a-z0-9]$/', $slug) && !preg_match('/^[a-z0-9]$/', $slug)) {
    jsonError(400, 'invalid_slug_format');
}

// --- URL validation helper (scheme + reserved host check) ---

function validatePublicUrl(string $url, string $fieldName): void
{
    if (!preg_match('#^https?://#i', $url)) {
        jsonError(400, "invalid_{$fieldName}_scheme");
    }
    $parsed = parse_url($url);
    if ($parsed === false || empty($parsed['host'])) {
        jsonError(400, "invalid_{$fieldName}");
    }
    // parse_url strips brackets from IPv6, e.g. [::1] → ::1
    $host = strtolower(trim($parsed['host'], '[]'));
    // Block reserved hostnames
    if (in_array($host, ['localhost'], true)) {
        jsonError(400, "reserved_{$fieldName}_host");
    }
    // Block reserved IP ranges (only when the host is an actual IP address, not a domain name
    // like "10.com" or "192.168.cool"). This is storage-only validation — the server never
    // fetches these URLs, so this is defense-in-depth, not SSRF protection.
    $isIpv4 = filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) !== false;
    $isIpv6 = filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6) !== false;
    if ($isIpv4) {
        if (in_array($host, ['0.0.0.0'], true)
            || preg_match('/^127\./', $host)               // 127.0.0.0/8 loopback
            || str_starts_with($host, '10.')                // 10.0.0.0/8 private
            || str_starts_with($host, '169.254.')           // 169.254.0.0/16 link-local
            || str_starts_with($host, '192.168.')           // 192.168.0.0/16 private
            || str_starts_with($host, '0.')                 // 0.0.0.0/8
            || preg_match('/^172\.(1[6-9]|2[0-9]|3[01])\./', $host)  // 172.16.0.0/12 private
            || preg_match('/^100\.(6[4-9]|[7-9][0-9]|1[01][0-9]|12[0-7])\./', $host) // 100.64.0.0/10 CGNAT
            || preg_match('/^198\.1[89]\./', $host)) {      // 198.18.0.0/15 benchmark
            jsonError(400, "reserved_{$fieldName}_host");
        }
    } elseif ($isIpv6) {
        if (in_array($host, ['::1'], true)
            || str_starts_with($host, 'fe80:')              // link-local
            || str_starts_with($host, 'fd00:')              // ULA
            || str_starts_with($host, 'fc00:')              // ULA
            || str_starts_with($host, '::ffff:')) {          // IPv4-mapped
            jsonError(400, "reserved_{$fieldName}_host");
        }
    } else {
        // Not a valid IP — it's a domain name or obfuscated IP notation.
        // Block obfuscation attempts that browsers resolve to real IPs:
        //   - Pure hex/octal/decimal: 0x7f000001, 2130706433, 0177
        //   - Octal-dotted: 0177.0.0.1 (= 127.0.0.1)
        //   - Digits-and-dots only: any string with no letters is suspicious since all valid
        //     TLDs contain letters; this catches mixed-format IP encodings
        if (preg_match('/^(0x[0-9a-f]+|0[0-7]+|[0-9]+)$/i', $host)
            || preg_match('/^[\d.]+$/', $host)) {
            jsonError(400, "reserved_{$fieldName}_host");
        }
    }
}

$websiteUrl = trim($body['website_url']);
validatePublicUrl($websiteUrl, 'website_url');

// Validate enums
$validStatuses = ['alternative', 'draft'];
$status = $body['status'] ?? 'alternative';
if (!in_array($status, $validStatuses, true)) {
    jsonError(400, 'invalid_status');
}

$validPricing = ['free', 'freemium', 'paid'];
$pricing = $body['pricing'] ?? null;
if ($pricing !== null && !in_array($pricing, $validPricing, true)) {
    jsonError(400, 'invalid_pricing');
}

$validOpenSourceLevels = ['full', 'partial', 'none'];
$openSourceLevel = $body['open_source_level'] ?? null;
if ($openSourceLevel !== null && !in_array($openSourceLevel, $validOpenSourceLevels, true)) {
    jsonError(400, 'invalid_open_source_level');
}

// Validate boolean fields strictly (reject string "false" which PHP casts to true)
$isOpenSource = null;
if (isset($body['is_open_source'])) {
    if (!is_bool($body['is_open_source']) && $body['is_open_source'] !== 0 && $body['is_open_source'] !== 1) {
        jsonError(400, 'is_open_source_must_be_boolean');
    }
    $isOpenSource = (bool) $body['is_open_source'];
}

$selfHostable = null;
if (isset($body['self_hostable'])) {
    if (!is_bool($body['self_hostable']) && $body['self_hostable'] !== 0 && $body['self_hostable'] !== 1) {
        jsonError(400, 'self_hostable_must_be_boolean');
    }
    $selfHostable = (bool) $body['self_hostable'];
}

// Validate openness consistency — mirrors DB CHECK constraint chk_openness exactly:
//   (both NULL) OR (false + 'none') OR (true + 'full'|'partial')
$opennessValid =
    ($isOpenSource === null && $openSourceLevel === null) ||
    ($isOpenSource === false && $openSourceLevel === 'none') ||
    ($isOpenSource === true && in_array($openSourceLevel, ['full', 'partial'], true));
if (!$opennessValid) {
    jsonError(400, 'inconsistent_openness');
}

$categories = $body['categories'] ?? [];
if (!is_array($categories) || count($categories) === 0) {
    jsonError(400, 'missing_categories');
}

$tags = $body['tags'] ?? [];
if (!is_array($tags)) {
    jsonError(400, 'invalid_tags');
}
if (count($tags) > 20) {
    jsonError(400, 'too_many_tags');
}

$replacesUs = $body['replaces_us'] ?? [];
if (!is_array($replacesUs)) {
    jsonError(400, 'invalid_replaces_us');
}

// --- Database operations in a transaction ---

try {
    $pdo = getDatabaseConnection();
} catch (Throwable $e) {
    error_log('euroalt-admin: DB connection failed: ' . $e->getMessage());
    jsonError(500, 'database_unavailable');
}

try {
    $pdo->beginTransaction();

    // 1. Verify country_code exists (normalize to lowercase for consistency)
    $countryCode = strtolower(trim($body['country_code']));
    $stmt = $pdo->prepare('SELECT code FROM countries WHERE code = :code');
    $stmt->execute(['code' => $countryCode]);
    if ($stmt->fetch() === false) {
        $pdo->rollBack();
        jsonError(400, 'unknown_country_code:' . $countryCode);
    }

    // 2. Verify all category IDs exist
    $categoryIds = [];
    $seenCategoryIds = [];
    $primaryCategoryId = null;
    foreach ($categories as $i => $cat) {
        if (!is_array($cat) || !isset($cat['category_id']) || !is_string($cat['category_id'])) {
            $pdo->rollBack();
            jsonError(400, "invalid_category_at_index:$i");
        }
        $catId = trim($cat['category_id']);
        if (isset($seenCategoryIds[$catId])) {
            $pdo->rollBack();
            jsonError(400, 'duplicate_category_id:' . $catId);
        }
        $seenCategoryIds[$catId] = true;
        $isPrimary = isset($cat['is_primary']) && ($cat['is_primary'] === true || $cat['is_primary'] === 1);
        $categoryIds[] = [
            'category_id' => $catId,
            'is_primary' => $isPrimary,
            'sort_order' => $i,
        ];
        if ($isPrimary) {
            if ($primaryCategoryId !== null) {
                $pdo->rollBack();
                jsonError(400, 'multiple_primary_categories');
            }
            $primaryCategoryId = $catId;
        }
    }

    if ($primaryCategoryId === null) {
        $pdo->rollBack();
        jsonError(400, 'missing_primary_category');
    }

    // Verify categories exist in bulk
    $catPlaceholders = [];
    $catParams = [];
    foreach ($categoryIds as $i => $c) {
        $key = ":cat$i";
        $catPlaceholders[] = $key;
        $catParams[$key] = $c['category_id'];
    }
    $stmt = $pdo->prepare(
        'SELECT id FROM categories WHERE id IN (' . implode(',', $catPlaceholders) . ')'
    );
    $stmt->execute($catParams);
    $foundCats = $stmt->fetchAll(PDO::FETCH_COLUMN);
    foreach ($categoryIds as $c) {
        if (!in_array($c['category_id'], $foundCats, true)) {
            $pdo->rollBack();
            jsonError(400, 'unknown_category_id:' . $c['category_id']);
        }
    }

    // 3. Check for duplicate slug
    $stmt = $pdo->prepare('SELECT id FROM catalog_entries WHERE slug = :slug');
    $stmt->execute(['slug' => $slug]);
    if ($stmt->fetch() !== false) {
        $pdo->rollBack();
        jsonError(409, 'duplicate_slug:' . $slug);
    }

    // 4. Validate optional URL fields
    $sourceCodeUrl = null;
    if (isset($body['source_code_url']) && is_string($body['source_code_url']) && trim($body['source_code_url']) !== '') {
        $sourceCodeUrl = trim($body['source_code_url']);
        validatePublicUrl($sourceCodeUrl, 'source_code_url');
    }

    // 5. INSERT into catalog_entries
    $foundedYear = isset($body['founded_year']) ? (int) $body['founded_year'] : null;
    if ($foundedYear !== null && ($foundedYear < 1900 || $foundedYear > (int) date('Y') + 1)) {
        $pdo->rollBack();
        jsonError(400, 'invalid_founded_year');
    }

    $stmt = $pdo->prepare('
        INSERT INTO catalog_entries (
            slug, status, source_file, is_active,
            name, description_en, description_de,
            country_code, website_url, logo_path, pricing,
            is_open_source, open_source_level, source_code_url,
            self_hostable, founded_year, headquarters_city, license_text
        ) VALUES (
            :slug, :status, :source_file, :is_active,
            :name, :description_en, :description_de,
            :country_code, :website_url, :logo_path, :pricing,
            :is_open_source, :open_source_level, :source_code_url,
            :self_hostable, :founded_year, :headquarters_city, :license_text
        )
    ');

    $logoPath = isset($body['logo_path']) && is_string($body['logo_path']) ? $body['logo_path'] : null;
    // Logo path regex: slug portion allows dots to match the slug format on line 35 (e.g., node.js.png)
    if ($logoPath !== null && !preg_match('#^/logos/[a-z0-9][a-z0-9._-]*\.(svg|png|jpg|webp)$#', $logoPath)) {
        $pdo->rollBack();
        jsonError(400, 'invalid_logo_path');
    }

    $stmt->execute([
        'slug' => $slug,
        'status' => $status,
        'source_file' => 'research',
        // 'us' included for forward compatibility — currently only 'alternative' and 'draft' pass validation
        'is_active' => in_array($status, ['alternative', 'us'], true) ? 1 : 0,
        'name' => $name,
        'description_en' => trim($body['description_en']),
        'description_de' => isset($body['description_de']) && is_string($body['description_de'])
            ? trim($body['description_de']) : null,
        'country_code' => $countryCode,
        'website_url' => $websiteUrl,
        'logo_path' => $logoPath,
        'pricing' => $pricing,
        'is_open_source' => $isOpenSource !== null ? ($isOpenSource ? 1 : 0) : null,
        'open_source_level' => $openSourceLevel,
        'source_code_url' => $sourceCodeUrl,
        'self_hostable' => $selfHostable !== null ? ($selfHostable ? 1 : 0) : null,
        'founded_year' => $foundedYear,
        'headquarters_city' => isset($body['headquarters_city']) && is_string($body['headquarters_city'])
            ? trim($body['headquarters_city']) : null,
        'license_text' => isset($body['license_text']) && is_string($body['license_text'])
            ? trim($body['license_text']) : null,
    ]);

    $entryId = (int) $pdo->lastInsertId();

    // 6. INSERT into entry_categories
    $catStmt = $pdo->prepare('
        INSERT INTO entry_categories (entry_id, category_id, is_primary, sort_order)
        VALUES (:entry_id, :category_id, :is_primary, :sort_order)
    ');
    foreach ($categoryIds as $c) {
        $catStmt->execute([
            'entry_id' => $entryId,
            'category_id' => $c['category_id'],
            'is_primary' => $c['is_primary'] ? 1 : 0,
            'sort_order' => $c['sort_order'],
        ]);
    }

    // 7. Auto-create tags if needed, INSERT into entry_tags (deduplicate first)
    if (count($tags) > 0) {
        $tagStmt = $pdo->prepare('SELECT id FROM tags WHERE slug = :slug');
        $tagInsert = $pdo->prepare('INSERT INTO tags (slug) VALUES (:slug)');
        $entryTagStmt = $pdo->prepare('
            INSERT INTO entry_tags (entry_id, tag_id, sort_order)
            VALUES (:entry_id, :tag_id, :sort_order)
        ');

        $seenTags = [];
        $tagSortOrder = 0;
        foreach ($tags as $tagSlug) {
            if (!is_string($tagSlug) || trim($tagSlug) === '') {
                continue;
            }
            $tagSlug = trim($tagSlug);
            if (isset($seenTags[$tagSlug])) {
                continue; // skip duplicate tags silently
            }
            $seenTags[$tagSlug] = true;
            // Tag slugs are intentionally stricter than entry slugs: no dots or underscores,
            // only lowercase alphanumeric and hyphens (e.g., "open-source", "privacy-focused")
            if (!preg_match('/^[a-z0-9][a-z0-9-]{0,98}[a-z0-9]$/', $tagSlug) && !preg_match('/^[a-z0-9]$/', $tagSlug)) {
                $pdo->rollBack();
                jsonError(400, 'invalid_tag_slug_format:' . $tagSlug);
            }

            $tagStmt->execute(['slug' => $tagSlug]);
            $tagRow = $tagStmt->fetch();

            if ($tagRow !== false) {
                $tagId = (int) $tagRow['id'];
            } else {
                $tagInsert->execute(['slug' => $tagSlug]);
                $tagId = (int) $pdo->lastInsertId();
            }

            $entryTagStmt->execute([
                'entry_id' => $entryId,
                'tag_id' => $tagId,
                'sort_order' => $tagSortOrder++,
            ]);
        }
    }

    // 8. INSERT into entry_replacements (auto-creates missing US vendor entries)
    if (count($replacesUs) > 0) {
        $replStmt = $pdo->prepare('
            INSERT INTO entry_replacements (entry_id, raw_name, replaced_entry_id, sort_order)
            VALUES (:entry_id, :raw_name, :replaced_entry_id, :sort_order)
        ');

        // Try to resolve US vendor names to existing entry IDs (exact match → alias → auto-create)
        $resolveStmt = $pdo->prepare('
            SELECT id FROM catalog_entries WHERE name = :name AND status = :status LIMIT 1
        ');
        $aliasStmt = $pdo->prepare('
            SELECT entry_id FROM us_vendor_aliases WHERE alias = :alias LIMIT 1
        ');
        $createVendorStmt = $pdo->prepare('
            INSERT INTO catalog_entries (slug, name, status, country_code, is_active, source_file)
            VALUES (:slug, :name, :status, :country_code, :is_active, :source_file)
        ');
        $createAliasStmt = $pdo->prepare('
            INSERT IGNORE INTO us_vendor_aliases (alias, entry_id) VALUES (:alias, :entry_id)
        ');

        $replSortOrder = 0;
        foreach ($replacesUs as $rawName) {
            if (!is_string($rawName) || trim($rawName) === '') {
                continue;
            }
            $rawName = trim($rawName);

            // 1) Exact name match against US vendor catalog entries
            $resolveStmt->execute(['name' => $rawName, 'status' => 'us']);
            $usRow = $resolveStmt->fetch();
            $replacedEntryId = $usRow !== false ? (int) $usRow['id'] : null;

            // 2) Alias fallback — check us_vendor_aliases table
            if ($replacedEntryId === null) {
                $aliasStmt->execute(['alias' => $rawName]);
                $aliasRow = $aliasStmt->fetch();
                $replacedEntryId = $aliasRow !== false ? (int) $aliasRow['entry_id'] : null;
            }

            // 3) Auto-create missing US vendor entry + self-alias
            if ($replacedEntryId === null) {
                $vendorSlug = strtolower(trim(preg_replace('/[^a-z0-9]+/i', '-', $rawName), '-'));
                if ($vendorSlug !== '') {
                    // Check slug isn't already taken (could differ from name match above)
                    $slugCheck = $pdo->prepare('SELECT id FROM catalog_entries WHERE slug = :slug');
                    $slugCheck->execute(['slug' => $vendorSlug]);
                    $existingBySlug = $slugCheck->fetch();

                    if ($existingBySlug !== false) {
                        // Slug exists but name didn't match — use the existing entry
                        $replacedEntryId = (int) $existingBySlug['id'];
                    } else {
                        // Create new US vendor entry
                        $createVendorStmt->execute([
                            'slug' => $vendorSlug,
                            'name' => $rawName,
                            'status' => 'us',
                            'country_code' => 'us',
                            'is_active' => 1,
                            'source_file' => 'auto',
                        ]);
                        $replacedEntryId = (int) $pdo->lastInsertId();
                        // Add self-alias so future lookups by name resolve immediately
                        $createAliasStmt->execute(['alias' => $rawName, 'entry_id' => $replacedEntryId]);
                        error_log("euroalt-admin: auto-created US vendor '$rawName' (id=$replacedEntryId, slug=$vendorSlug)");
                    }
                }
            }

            $replStmt->execute([
                'entry_id' => $entryId,
                'raw_name' => $rawName,
                'replaced_entry_id' => $replacedEntryId,
                'sort_order' => $replSortOrder++,
            ]);
        }
    }

    $pdo->commit();

    sendJsonResponse(201, [
        'ok' => true,
        'entry_id' => $entryId,
        'slug' => $slug,
    ]);
} catch (\PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    // MySQL error 1062 = duplicate key — return 409 instead of generic 500
    if ($e->errorInfo[1] === 1062) {
        error_log('euroalt-admin: duplicate key: ' . $e->getMessage());
        jsonError(409, 'duplicate_entry');
    }
    error_log('euroalt-admin: add-alternative failed: ' . $e->getMessage());
    jsonError(500, 'internal_error');
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('euroalt-admin: add-alternative failed: ' . $e->getMessage());
    jsonError(500, 'internal_error');
}
