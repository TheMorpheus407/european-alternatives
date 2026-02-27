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
 * Slugify a raw vendor name for fallback comparison IDs.
 * Mirrors the TS `slugifyVendorName` behavior.
 */
if (!function_exists('slugifyName')) {
    function slugifyName(string $name): string
    {
        $slug = trim($name);
        $slug = mb_strtolower($slug, 'UTF-8');
        $slug = preg_replace('/[^a-z0-9]+/', '-', $slug) ?? $slug;
        $slug = trim($slug, '-');
        return $slug !== '' ? $slug : 'vendor';
    }
}

/**
 * Build a single reservation array for a US vendor profile reservation row.
 */
if (!function_exists('buildUSVendorReservation')) {
    function buildUSVendorReservation(array $row): array
    {
        $reservation = [
            'id'       => $row['reservation_key'],
            'text'     => $row['res_text'],
            'severity' => $row['res_severity'],
        ];
        if ($row['res_text_de'] !== null) {
            $reservation['textDe'] = $row['res_text_de'];
        }
        if ($row['res_event_date'] !== null) {
            $reservation['date'] = $row['res_event_date'];
        }
        if ($row['res_source_url'] !== null) {
            $reservation['sourceUrl'] = $row['res_source_url'];
        }
        if ($row['res_penalty_tier'] !== null && $row['res_penalty_amount'] !== null) {
            $reservation['penalty'] = [
                'tier'   => $row['res_penalty_tier'],
                'amount' => (float)$row['res_penalty_amount'],
            ];
        }
        return $reservation;
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
