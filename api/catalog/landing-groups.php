<?php
declare(strict_types=1);

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../cache.php';

requireHttpMethod('GET');

serveCachedResponse('landing-groups');

try {
    $pdo = getDatabaseConnection();

    // 1. Fetch all landing groups (use slug as the public identifier).
    $groupSql = "
        SELECT
            lg.id,
            lg.slug,
            lg.sort_order
        FROM landing_category_groups lg
        ORDER BY lg.sort_order, lg.id
    ";
    $groupStmt = $pdo->query($groupSql);
    $groups = $groupStmt->fetchAll();

    // 2. Fetch landing group -> category mappings (just the category IDs).
    $catSql = "
        SELECT
            lgc.group_id,
            lgc.category_id
        FROM landing_group_categories lgc
        ORDER BY lgc.group_id, lgc.sort_order
    ";
    $catStmt = $pdo->query($catSql);
    $catRows = $catStmt->fetchAll();

    // 3. Index category IDs by group_id.
    $categoriesByGroup = [];
    foreach ($catRows as $row) {
        $categoriesByGroup[$row['group_id']][] = $row['category_id'];
    }

    // 4. Assemble response — return slug as id, categories as string arrays.
    $data = [];
    foreach ($groups as $group) {
        $groupId = (int) $group['id'];
        $data[] = [
            'id'         => $group['slug'],
            'categories' => $categoriesByGroup[$groupId] ?? [],
        ];
    }

    sendCacheableJsonResponse('landing-groups', [], [
        'data' => $data,
        'meta' => [
            'count' => count($data),
        ],
    ]);
} catch (Throwable $exception) {
    error_log(sprintf('[api][catalog/landing-groups] %s', $exception->getMessage()));
    sendJsonResponse(500, [
        'ok'    => false,
        'error' => 'internal_error',
    ]);
}
