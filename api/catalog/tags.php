<?php
declare(strict_types=1);

require_once __DIR__ . '/../db.php';

requireHttpMethod('GET');

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

    http_response_code(200);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: public, max-age=300, stale-while-revalidate=60');
    header('X-Content-Type-Options: nosniff');

    echo json_encode([
        'data' => $data,
        'meta' => [
            'count' => count($data),
        ],
    ], JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES);
    exit;
} catch (Throwable $exception) {
    error_log(sprintf('[api][catalog/tags] %s', $exception->getMessage()));
    sendJsonResponse(500, [
        'ok'    => false,
        'error' => 'internal_error',
    ]);
}
