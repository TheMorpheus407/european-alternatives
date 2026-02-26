<?php
declare(strict_types=1);

require_once __DIR__ . '/../db.php';

requireHttpMethod('GET');

try {
    $pdo = getDatabaseConnection();
    $statement = $pdo->query('SELECT 1 AS db_ok');
    $row = $statement->fetch();

    sendJsonResponse(200, [
        'ok' => true,
        'db' => 'up',
        'check' => (int)($row['db_ok'] ?? 0),
    ]);
} catch (Throwable $exception) {
    error_log(sprintf('[api][db-health] %s', $exception->getMessage()));
    sendJsonResponse(500, [
        'ok' => false,
        'db' => 'down',
        'error' => 'database_unreachable',
    ]);
}
