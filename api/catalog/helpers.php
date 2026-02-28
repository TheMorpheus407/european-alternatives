<?php
declare(strict_types=1);

// ===========================================================================
// Shared helper functions for catalog API endpoints.
// ===========================================================================

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
