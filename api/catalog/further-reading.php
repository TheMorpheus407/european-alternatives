<?php
declare(strict_types=1);

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../cache.php';

requireHttpMethod('GET');

serveCachedResponse('further-reading');

try {
    $pdo = getDatabaseConnection();

    $sql = "
        SELECT
            fr.id,
            fr.slug,
            fr.name,
            fr.website_url,
            fr.section,
            fr.focus,
            fr.related_issues_json,
            fr.last_reviewed,
            fr.sort_order
        FROM further_reading_resources fr
        ORDER BY fr.sort_order, fr.slug
    ";
    $stmt = $pdo->query($sql);
    $rows = $stmt->fetchAll();

    $data = [];
    foreach ($rows as $row) {
        $relatedIssues = $row['related_issues_json'] !== null
            ? json_decode($row['related_issues_json'], true)
            : [];

        $data[] = [
            'id'            => $row['slug'],
            'name'          => $row['name'],
            'website'       => $row['website_url'],
            'section'       => $row['section'],
            'focus'         => $row['focus'],
            'relatedIssues' => is_array($relatedIssues) ? $relatedIssues : [],
            'lastReviewed'  => $row['last_reviewed'],
        ];
    }

    sendCacheableJsonResponse('further-reading', [], [
        'data' => $data,
        'meta' => [
            'count' => count($data),
        ],
    ]);
} catch (Throwable $exception) {
    error_log(sprintf('[api][catalog/further-reading] %s', $exception->getMessage()));
    sendJsonResponse(500, [
        'ok'    => false,
        'error' => 'internal_error',
    ]);
}
