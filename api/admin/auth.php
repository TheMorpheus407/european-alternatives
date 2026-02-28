<?php
declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

const APP_ADMIN_TOKEN_ENV = 'EUROALT_ADMIN_TOKEN';
const DEFAULT_ADMIN_TOKEN_PATH = '/home/u688914453/.secrets/euroalt-admin-token.php';

/**
 * Load the admin bearer token from environment or secrets file.
 *
 * The secrets file must call putenv('EUROALT_ADMIN_TOKEN=...');
 */
function loadAdminToken(): string
{
    $token = getenv(APP_ADMIN_TOKEN_ENV);
    if (is_string($token) && $token !== '') {
        return validateTokenFormat($token);
    }

    $envPath = getenv('EUROALT_ADMIN_TOKEN_PATH');
    $tokenPath = is_string($envPath) && $envPath !== '' ? $envPath : DEFAULT_ADMIN_TOKEN_PATH;
    // Defense-in-depth: restrict token file to the Hostinger user's home directory to prevent
    // require_once of arbitrary paths if the env var is ever controllable (e.g., misconfigured CGI/FastCGI).
    $realTokenPath = realpath($tokenPath);
    if ($realTokenPath === false) {
        // File does not exist — fall through to the RuntimeException below
    } elseif (!str_starts_with($realTokenPath, '/home/u688914453/.secrets/')) {
        throw new RuntimeException('Admin token path is outside the allowed directory.');
    } elseif (is_readable($realTokenPath)) {
        require_once $realTokenPath;
        $token = getenv(APP_ADMIN_TOKEN_ENV);
        if (is_string($token) && $token !== '') {
            return validateTokenFormat($token);
        }
    }

    throw new RuntimeException('Admin token is not configured.');
}

function validateTokenFormat(string $token): string
{
    if (strlen($token) < 32) {
        throw new RuntimeException('Admin token is too short (minimum 32 characters).');
    }
    if ($token === 'replace-with-a-long-random-token') {
        throw new RuntimeException('Admin token is still the placeholder value — generate a real token.');
    }
    return $token;
}

/**
 * Require a valid Bearer token on the current request.
 *
 * Terminates with 401 (missing) or 403 (invalid) JSON error on failure.
 */
function requireAdminAuth(): void
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

    if ($header === '') {
        jsonError(401, 'missing_authorization');
    }

    if (!str_starts_with(strtolower($header), 'bearer ')) {
        jsonError(401, 'invalid_authorization_scheme');
    }

    $providedToken = substr($header, 7);
    if ($providedToken === '') {
        jsonError(401, 'empty_token');
    }

    try {
        $expectedToken = loadAdminToken();
    } catch (RuntimeException) {
        error_log('euroalt-admin: token not configured on server');
        jsonError(500, 'auth_not_configured');
    }

    if (!hash_equals($expectedToken, $providedToken)) {
        sleep(1); // slow down brute-force attempts
        jsonError(403, 'forbidden');
    }
}
