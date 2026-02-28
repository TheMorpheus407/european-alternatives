<?php
declare(strict_types=1);

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../cache.php';

requireHttpMethod('GET');

serveCachedResponse('tags');

try {
    $pdo = getDatabaseConnection();

    $sql = "
        SELECT
            t.id,
            t.slug,
            t.label_en,
            t.label_de
        FROM tags t
        ORDER BY t.slug
    ";
    $stmt = $pdo->query($sql);
    $rows = $stmt->fetchAll();

    $data = [];
    foreach ($rows as $row) {
        $data[] = [
            'id'      => (int) $row['id'],
            'slug'    => $row['slug'],
            'labelEn' => $row['label_en'],
            'labelDe' => $row['label_de'],
        ];
    }

    sendCacheableJsonResponse('tags', [], [
        'data' => $data,
        'meta' => [
            'count' => count($data),
        ],
    ]);
} catch (Throwable $exception) {
    error_log(sprintf('[api][catalog/tags] %s', $exception->getMessage()));
    sendJsonResponse(500, [
        'ok'    => false,
        'error' => 'internal_error',
    ]);
}
