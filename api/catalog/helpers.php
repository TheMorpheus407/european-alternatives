<?php
declare(strict_types=1);

// ===========================================================================
// Shared helper functions for catalog API endpoints.
// ===========================================================================

/**
 * Send a JSON response with public caching headers and terminate.
 * Bypasses sendJsonResponse() to avoid its no-cache override.
 */
if (!function_exists('sendCachedJsonResponse')) {
    function sendCachedJsonResponse(array $payload): never
    {
        http_response_code(200);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: public, max-age=300, stale-while-revalidate=60');
        header('X-Content-Type-Options: nosniff');

        echo json_encode($payload, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES);
        exit;
    }
}

/**
 * Convert a MySQL TINYINT(1) value to a PHP bool or null.
 */
if (!function_exists('toBoolOrNull')) {
    function toBoolOrNull(mixed $value): ?bool
    {
        if ($value === null) {
            return null;
        }
        return (bool)$value;
    }
}
