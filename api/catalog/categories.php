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

    $nameCol = $locale === 'de'
        ? 'COALESCE(NULLIF(c.name_de, \'\'), c.name_en)'
        : 'c.name_en';
    $descCol = $locale === 'de'
        ? 'COALESCE(NULLIF(c.description_de, \'\'), c.description_en)'
        : 'c.description_en';

    // Fetch categories with alternative counts (only active alternatives).
    $categorySql = "
        SELECT
            c.id,
            c.emoji,
            {$nameCol}        AS name,
            {$descCol}        AS description,
            c.sort_order,
            COUNT(ec.entry_id) AS alternative_count
        FROM categories c
        LEFT JOIN entry_categories ec ON ec.category_id = c.id
        LEFT JOIN catalog_entries ce  ON ce.id = ec.entry_id
                                     AND ce.is_active = 1
                                     AND ce.status = 'alternative'
        GROUP BY c.id, c.emoji, c.name_en, c.name_de, c.description_en, c.description_de, c.sort_order
        ORDER BY c.sort_order, c.id
    ";
    $categoryStmt = $pdo->query($categorySql);
    $categories = $categoryStmt->fetchAll();

    // Fetch all usGiants per category, ordered by sort_order.
    $giantsSql = "
        SELECT
            cuv.category_id,
            cuv.raw_name,
            cuv.sort_order
        FROM category_us_vendors cuv
        ORDER BY cuv.category_id, cuv.sort_order
    ";
    $giantsStmt = $pdo->query($giantsSql);
    $giantsRows = $giantsStmt->fetchAll();

    // Index giants by category_id.
    $giantsByCategory = [];
    foreach ($giantsRows as $row) {
        $giantsByCategory[$row['category_id']][] = $row['raw_name'];
    }

    // Assemble response.
    $data = [];
    foreach ($categories as $cat) {
        $data[] = [
            'id'               => $cat['id'],
            'name'             => $cat['name'],
            'description'      => $cat['description'],
            'emoji'            => $cat['emoji'],
            'usGiants'         => $giantsByCategory[$cat['id']] ?? [],
            'alternativeCount' => (int) $cat['alternative_count'],
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
    error_log(sprintf('[api][catalog/categories] %s', $exception->getMessage()));
    sendJsonResponse(500, [
        'ok'    => false,
        'error' => 'internal_error',
    ]);
}
