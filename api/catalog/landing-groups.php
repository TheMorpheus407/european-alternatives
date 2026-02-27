<?php
declare(strict_types=1);

require_once __DIR__ . '/../db.php';

requireHttpMethod('GET');

try {
    $pdo = getDatabaseConnection();

    $locale = ($_GET['locale'] ?? 'en');
    if (!in_array($locale, ['en', 'de'], true)) {
        $locale = 'en';
    }

    // Column selectors for locale-aware fields on landing groups.
    $groupNameCol = $locale === 'de'
        ? 'COALESCE(NULLIF(lg.name_de, \'\'), lg.name_en)'
        : 'lg.name_en';
    $groupDescCol = $locale === 'de'
        ? 'COALESCE(NULLIF(lg.description_de, \'\'), lg.description_en)'
        : 'lg.description_en';

    // Column selectors for locale-aware fields on categories.
    $catNameCol = $locale === 'de'
        ? 'COALESCE(NULLIF(c.name_de, \'\'), c.name_en)'
        : 'c.name_en';
    $catDescCol = $locale === 'de'
        ? 'COALESCE(NULLIF(c.description_de, \'\'), c.description_en)'
        : 'c.description_en';

    // 1. Fetch all landing groups.
    $groupSql = "
        SELECT
            lg.id,
            {$groupNameCol}  AS name,
            {$groupDescCol}  AS description,
            lg.sort_order
        FROM landing_category_groups lg
        ORDER BY lg.sort_order, lg.id
    ";
    $groupStmt = $pdo->query($groupSql);
    $groups = $groupStmt->fetchAll();

    // 2. Fetch all landing group -> category mappings with full category data.
    $catSql = "
        SELECT
            lgc.group_id,
            lgc.sort_order          AS lgc_sort_order,
            c.id                    AS category_id,
            c.emoji,
            {$catNameCol}           AS name,
            {$catDescCol}           AS description,
            c.sort_order            AS category_sort_order
        FROM landing_group_categories lgc
        INNER JOIN categories c ON c.id = lgc.category_id
        ORDER BY lgc.group_id, lgc.sort_order
    ";
    $catStmt = $pdo->query($catSql);
    $catRows = $catStmt->fetchAll();

    // Collect all category IDs referenced by landing groups.
    $catIds = [];
    foreach ($catRows as $row) {
        $catIds[] = $row['category_id'];
    }
    $catIds = array_unique($catIds);

    // 3. Fetch usGiants for referenced categories.
    $giantsByCategory = [];
    if (count($catIds) > 0) {
        $placeholders = implode(',', array_fill(0, count($catIds), '?'));
        $giantsSql = "
            SELECT
                cuv.category_id,
                cuv.raw_name,
                cuv.sort_order
            FROM category_us_vendors cuv
            WHERE cuv.category_id IN ({$placeholders})
            ORDER BY cuv.category_id, cuv.sort_order
        ";
        $giantsStmt = $pdo->prepare($giantsSql);
        $giantsStmt->execute(array_values($catIds));
        $giantsRows = $giantsStmt->fetchAll();

        foreach ($giantsRows as $row) {
            $giantsByCategory[$row['category_id']][] = $row['raw_name'];
        }
    }

    // 4. Fetch alternative counts per category (active alternatives only).
    $countsByCategory = [];
    if (count($catIds) > 0) {
        $placeholders = implode(',', array_fill(0, count($catIds), '?'));
        $countSql = "
            SELECT
                ec.category_id,
                COUNT(ec.entry_id) AS cnt
            FROM entry_categories ec
            INNER JOIN catalog_entries ce ON ce.id = ec.entry_id
                                          AND ce.is_active = 1
                                          AND ce.status = 'alternative'
            WHERE ec.category_id IN ({$placeholders})
            GROUP BY ec.category_id
        ";
        $countStmt = $pdo->prepare($countSql);
        $countStmt->execute(array_values($catIds));
        $countRows = $countStmt->fetchAll();

        foreach ($countRows as $row) {
            $countsByCategory[$row['category_id']] = (int) $row['cnt'];
        }
    }

    // 5. Index category data by group_id.
    $categoriesByGroup = [];
    foreach ($catRows as $row) {
        $categoriesByGroup[$row['group_id']][] = [
            'id'               => $row['category_id'],
            'name'             => $row['name'],
            'description'      => $row['description'],
            'emoji'            => $row['emoji'],
            'usGiants'         => $giantsByCategory[$row['category_id']] ?? [],
            'alternativeCount' => $countsByCategory[$row['category_id']] ?? 0,
        ];
    }

    // 6. Assemble response.
    $data = [];
    foreach ($groups as $group) {
        $groupId = (int) $group['id'];
        $data[] = [
            'id'          => $groupId,
            'name'        => $group['name'],
            'description' => $group['description'],
            'categories'  => $categoriesByGroup[$groupId] ?? [],
        ];
    }

    http_response_code(200);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: public, max-age=300, stale-while-revalidate=60');
    header('X-Content-Type-Options: nosniff');

    echo json_encode([
        'data' => $data,
        'meta' => [
            'count'  => count($data),
            'locale' => $locale,
        ],
    ], JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES);
    exit;
} catch (Throwable $exception) {
    error_log(sprintf('[api][catalog/landing-groups] %s', $exception->getMessage()));
    sendJsonResponse(500, [
        'ok'    => false,
        'error' => 'internal_error',
    ]);
}
