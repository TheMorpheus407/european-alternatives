<?php
declare(strict_types=1);

const APP_DB_CONFIG_ENV = 'EUROALT_DB_CONFIG';
const DEFAULT_DB_CONFIG_PATH = '/home/u688914453/.secrets/euroalt-db.php';
const APP_ENV_LOADER_PATH_ENV = 'EUROALT_ENV_LOADER';
const DEFAULT_ENV_LOADER_PATH = '/home/u688914453/.secrets/euroalt-db-env.php';

/**
 * Send a JSON response and terminate.
 */
function sendJsonResponse(int $statusCode, array $payload): never
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('X-Content-Type-Options: nosniff');

    echo json_encode($payload, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Restrict an endpoint to a single HTTP method.
 */
function requireHttpMethod(string $method): void
{
    $expectedMethod = strtoupper($method);
    $requestMethod = strtoupper($_SERVER['REQUEST_METHOD'] ?? '');

    if ($requestMethod === $expectedMethod) {
        return;
    }

    header('Allow: ' . $expectedMethod);
    sendJsonResponse(405, [
        'ok' => false,
        'error' => 'method_not_allowed',
    ]);
}

/**
 * Load database config from a file kept outside the web root.
 * Environment variables take precedence; file config is fallback.
 */
function loadDbConfig(): array
{
    loadEnvironmentOverrides();

    $envConfig = loadDbConfigFromEnvironment();
    if ($envConfig !== null) {
        return $envConfig;
    }

    $configPath = getenv(APP_DB_CONFIG_ENV) ?: DEFAULT_DB_CONFIG_PATH;

    if (!is_string($configPath) || $configPath === '' || !is_readable($configPath)) {
        throw new RuntimeException('Database config file is missing or unreadable.');
    }

    $config = require $configPath;
    if (!is_array($config)) {
        throw new RuntimeException('Database config must return an array.');
    }

    foreach (['host', 'database', 'username', 'password'] as $requiredKey) {
        if (!isset($config[$requiredKey]) || !is_string($config[$requiredKey]) || $config[$requiredKey] === '') {
            throw new RuntimeException(sprintf('Database config key "%s" is missing for mysql.', $requiredKey));
        }
    }

    $port = filter_var(
        $config['port'] ?? 3306,
        FILTER_VALIDATE_INT,
        ['options' => ['min_range' => 1, 'max_range' => 65535]]
    );

    if ($port === false) {
        throw new RuntimeException('Database config port is invalid.');
    }

    $charset = $config['charset'] ?? 'utf8mb4';
    if (!is_string($charset) || $charset === '') {
        throw new RuntimeException('Database config charset is invalid.');
    }

    return [
        'driver' => 'mysql',
        'host' => $config['host'],
        'port' => $port,
        'database' => $config['database'],
        'username' => $config['username'],
        'password' => $config['password'],
        'charset' => $charset,
    ];
}

/**
 * Load optional env loader file that sets process environment variables via putenv().
 */
function loadEnvironmentOverrides(): void
{
    static $loaded = false;
    if ($loaded) {
        return;
    }
    $loaded = true;

    $envLoaderPath = getenv(APP_ENV_LOADER_PATH_ENV) ?: DEFAULT_ENV_LOADER_PATH;
    if (is_string($envLoaderPath) && $envLoaderPath !== '' && is_readable($envLoaderPath)) {
        require_once $envLoaderPath;
    }
}

/**
 * Build DB config from environment variables if present.
 */
function loadDbConfigFromEnvironment(): ?array
{
    $host = getenv('EUROALT_DB_HOST');
    $database = getenv('EUROALT_DB_NAME');
    $username = getenv('EUROALT_DB_USER');
    $password = getenv('EUROALT_DB_PASS');

    $allMissing = $host === false && $database === false && $username === false && $password === false;
    if ($allMissing) {
        return null;
    }

    foreach ([
        'EUROALT_DB_HOST' => $host,
        'EUROALT_DB_NAME' => $database,
        'EUROALT_DB_USER' => $username,
        'EUROALT_DB_PASS' => $password,
    ] as $key => $value) {
        if (!is_string($value) || $value === '') {
            throw new RuntimeException(sprintf('Environment variable "%s" is missing or empty.', $key));
        }
    }

    $portValue = getenv('EUROALT_DB_PORT');
    $port = filter_var(
        $portValue === false || $portValue === '' ? 3306 : $portValue,
        FILTER_VALIDATE_INT,
        ['options' => ['min_range' => 1, 'max_range' => 65535]]
    );
    if ($port === false) {
        throw new RuntimeException('Environment variable "EUROALT_DB_PORT" is invalid.');
    }

    $charset = getenv('EUROALT_DB_CHARSET');
    if (!is_string($charset) || $charset === '') {
        $charset = 'utf8mb4';
    }

    return [
        'driver' => 'mysql',
        'host' => $host,
        'port' => $port,
        'database' => $database,
        'username' => $username,
        'password' => $password,
        'charset' => $charset,
    ];
}
