<?php
declare(strict_types=1);

// ===========================================================================
// Server-side file cache for API responses.
//
// Eliminates DB connections for cache hits. Catalog data rarely changes,
// so a 5-minute TTL keeps the site fast while limiting stale data.
// ===========================================================================

define('EUROALT_CACHE_DIR', '/tmp/euroalt-cache/');
define('EUROALT_CACHE_TTL', 300);

/**
 * Serve a cached response if a fresh cache file exists.
 *
 * On hit: outputs JSON with X-Cache: HIT header and exits.
 * On miss: returns false so the endpoint continues to the DB.
 *
 * @param string $key    Endpoint name (e.g. 'entries', 'categories')
 * @param array  $params Vary parameters (e.g. ['status' => 'alternative', 'locale' => 'en'])
 * @return bool  Always false on miss; on hit the function exits and never returns.
 */
function serveCachedResponse(string $key, array $params = []): bool
{
    $cacheFile = buildCachePath($key, $params);

    if (!is_file($cacheFile)) {
        return false;
    }

    $mtime = filemtime($cacheFile);
    if ($mtime === false || (time() - $mtime) > EUROALT_CACHE_TTL) {
        return false;
    }

    $content = file_get_contents($cacheFile);
    if ($content === false) {
        return false;
    }

    http_response_code(200);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: public, max-age=' . EUROALT_CACHE_TTL . ', stale-while-revalidate=60');
    header('X-Content-Type-Options: nosniff');
    header('X-Cache: HIT');

    echo $content;
    exit;
}

/**
 * Encode payload as JSON, write to cache atomically, send response, and exit.
 *
 * Uses temp-file + rename() for atomic writes to prevent serving partial files.
 *
 * @param string $key     Endpoint name
 * @param array  $params  Vary parameters
 * @param array  $payload Response data to encode and cache
 */
function sendCacheableJsonResponse(string $key, array $params, array $payload): never
{
    $json = json_encode($payload, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES);

    // Write cache file atomically (temp file + rename)
    $cacheFile = buildCachePath($key, $params);
    $cacheDir = dirname($cacheFile);

    if (!is_dir($cacheDir)) {
        @mkdir($cacheDir, 0755, true);
    }

    $pid = getmypid();
    $tmpFile = $cacheFile . '.' . ($pid !== false ? $pid : bin2hex(random_bytes(4))) . '.tmp';
    if (file_put_contents($tmpFile, $json) !== false) {
        rename($tmpFile, $cacheFile);
    } else {
        @unlink($tmpFile);
    }

    http_response_code(200);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: public, max-age=' . EUROALT_CACHE_TTL . ', stale-while-revalidate=60');
    header('X-Content-Type-Options: nosniff');
    header('X-Cache: MISS');

    echo $json;
    exit;
}

/**
 * Delete all cached response files (and any orphaned temp files).
 */
function invalidateCache(): void
{
    $dir = EUROALT_CACHE_DIR;

    if (!is_dir($dir)) {
        return;
    }

    $files = array_merge(
        glob($dir . '*.json') ?: [],
        glob($dir . '*.tmp') ?: []
    );

    foreach ($files as $file) {
        @unlink($file);
    }
}

/**
 * Build the filesystem path for a cache entry.
 *
 * Cache key format: {endpoint}_{md5(sorted params)}.json
 * Sorting params ensures consistent keys regardless of query parameter order.
 */
function buildCachePath(string $key, array $params): string
{
    if (!preg_match('/^[a-z0-9-]+$/', $key)) {
        throw new \InvalidArgumentException('Invalid cache key: ' . $key);
    }

    ksort($params);
    $suffix = count($params) > 0 ? '_' . md5(json_encode($params)) : '';

    return EUROALT_CACHE_DIR . $key . $suffix . '.json';
}
