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

    $labelCol = $locale === 'de'
        ? 'COALESCE(NULLIF(co.label_de, \'\'), co.label_en)'
        : 'co.label_en';

    // Fetch countries with active alternative counts.
    $sql = "
        SELECT
            co.code,
            {$labelCol}        AS label,
            co.sort_order,
            COUNT(ce.id)       AS alternative_count
        FROM countries co
        LEFT JOIN catalog_entries ce ON ce.country_code = co.code
                                    AND ce.is_active = 1
                                    AND ce.status = 'alternative'
        GROUP BY co.code, co.label_en, co.label_de, co.sort_order
        ORDER BY co.sort_order, co.code
    ";
    $stmt = $pdo->query($sql);
    $rows = $stmt->fetchAll();

    $data = [];
    foreach ($rows as $row) {
        $data[] = [
            'code'             => $row['code'],
            'label'            => $row['label'],
            'alternativeCount' => (int) $row['alternative_count'],
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
    error_log(sprintf('[api][catalog/countries] %s', $exception->getMessage()));
    sendJsonResponse(500, [
        'ok'    => false,
        'error' => 'internal_error',
    ]);
}
