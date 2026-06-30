<?php
declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

const APP_ADMIN_TOKEN_ENV = 'EUROALT_ADMIN_TOKEN';
const APP_ADMIN_TOKEN_PATH_ENV = 'EUROALT_ADMIN_TOKEN_PATH';
const APP_ADMIN_RATE_LIMIT_DIR_ENV = 'EUROALT_ADMIN_RATE_LIMIT_DIR';
const APP_ADMIN_RATE_LIMIT_NOW_ENV = 'EUROALT_ADMIN_AUTH_NOW';
const DEFAULT_ADMIN_TOKEN_PATH = '/home/u688914453/.secrets/euroalt-admin-token.php';
const LOCAL_ADMIN_TOKEN_PATH = __DIR__ . '/../config/admin-token.php';
const DEFAULT_ADMIN_RATE_LIMIT_DIR = '/home/u688914453/.local/state/euroalt-admin-auth';
const ADMIN_AUTH_SHORT_WINDOW_SECONDS = 900;
const ADMIN_AUTH_SHORT_WINDOW_MAX_FAILURES = 5;
const ADMIN_AUTH_LONG_WINDOW_SECONDS = 3600;
const ADMIN_AUTH_LONG_WINDOW_MAX_FAILURES = 20;
const ADMIN_AUTH_BLOCK_SECONDS = 3600;

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

    $envPath = getenv(APP_ADMIN_TOKEN_PATH_ENV);
    if (is_string($envPath) && $envPath !== '') {
        $token = loadAdminTokenFromRestrictedPath($envPath);
        if ($token !== null) {
            return $token;
        }

        throw new RuntimeException('Admin token is not configured.');
    }

    $token = loadAdminTokenFromRestrictedPath(DEFAULT_ADMIN_TOKEN_PATH);
    if ($token !== null) {
        return $token;
    }

    $token = loadLocalAdminToken();
    if ($token !== null) {
        return $token;
    }

    throw new RuntimeException('Admin token is not configured.');
}

function loadAdminTokenFromRestrictedPath(string $tokenPath): ?string
{
    // Defense-in-depth: restrict token file to the secrets directory to prevent
    // require_once of arbitrary paths if the env var is ever controllable (e.g., misconfigured CGI/FastCGI).
    $realTokenPath = realpath($tokenPath);
    if ($realTokenPath === false) {
        return null;
    }

    if (!str_starts_with($realTokenPath, APP_SECRETS_DIRECTORY)) {
        throw new RuntimeException('Admin token path is outside the allowed directory.');
    }

    if (is_readable($realTokenPath)) {
        require_once $realTokenPath;
        $token = getenv(APP_ADMIN_TOKEN_ENV);
        if (is_string($token) && $token !== '') {
            return validateTokenFormat($token);
        }
    }

    return null;
}

function loadLocalAdminToken(): ?string
{
    $realTokenPath = realpath(LOCAL_ADMIN_TOKEN_PATH);
    if ($realTokenPath === false) {
        return null;
    }

    $realLocalConfigDirectory = realpath(__DIR__ . '/../config');
    if ($realLocalConfigDirectory === false) {
        return null;
    }

    if (!str_starts_with($realTokenPath, $realLocalConfigDirectory . DIRECTORY_SEPARATOR)) {
        throw new RuntimeException('Local admin token path is outside the API config directory.');
    }

    if (is_readable($realTokenPath)) {
        require_once $realTokenPath;
        $token = getenv(APP_ADMIN_TOKEN_ENV);
        if (is_string($token) && $token !== '') {
            return validateTokenFormat($token);
        }
    }

    return null;
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

function getAdminRequestIp(): string
{
    $clientIp = $_SERVER['REMOTE_ADDR'] ?? '';

    if (!is_string($clientIp) || trim($clientIp) === '') {
        return 'unknown';
    }

    return trim($clientIp);
}

function getAdminAuditUserAgent(): string
{
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';

    if (!is_string($userAgent) || $userAgent === '') {
        return '';
    }

    $sanitizedUserAgent = preg_replace('/[\x00-\x1F\x7F]+/', ' ', $userAgent);
    if (!is_string($sanitizedUserAgent)) {
        return '';
    }

    return substr(trim($sanitizedUserAgent), 0, 100);
}

function sanitizeAdminLogMessage(string $message): string
{
    $sanitizedMessage = preg_replace_callback(
        '/[\x00-\x1F\x7F]/',
        static function (array $matches): string {
            return match ($matches[0]) {
                "\r" => '\\r',
                "\n" => '\\n',
                "\t" => '\\t',
                default => sprintf('\\x%02X', ord($matches[0])),
            };
        },
        $message
    );

    return is_string($sanitizedMessage) ? $sanitizedMessage : '[admin-log-sanitization-failed]';
}

function logAdminMessage(string $message): void
{
    error_log(sanitizeAdminLogMessage($message));
}

/**
 * @param array<string, int|string> $fields
 */
function formatAdminAuditFields(array $fields): string
{
    $parts = [];

    foreach ($fields as $name => $value) {
        if (is_int($value)) {
            $parts[] = sprintf('%s=%d', $name, $value);
            continue;
        }

        if ($value !== '' && preg_match('/^[A-Za-z0-9._:\\/-]+$/', $value) === 1) {
            $parts[] = sprintf('%s=%s', $name, $value);
            continue;
        }

        $encodedValue = json_encode($value, JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
        $parts[] = sprintf('%s=%s', $name, is_string($encodedValue) ? $encodedValue : '""');
    }

    return implode(' ', $parts);
}

function logAdminMutationAuditSuccess(
    string $action,
    int $entryId,
    string $slug,
    string $status,
    ?int $reasonLength = null
): void {
    $fields = [
        'action' => $action,
        'slug' => $slug,
        'entry_id' => $entryId,
        'status' => $status,
    ];

    if ($reasonLength !== null) {
        $fields['reason_length'] = max(0, $reasonLength);
    }

    $fields['ip'] = getAdminRequestIp();
    $fields['ua'] = getAdminAuditUserAgent();

    logAdminMessage('euroalt-admin: audit ' . formatAdminAuditFields($fields));
}

function getAdminAuthClientKey(): string
{
    return getAdminRequestIp();
}

function adminAuthNow(): int
{
    $override = getenv(APP_ADMIN_RATE_LIMIT_NOW_ENV);

    if (is_string($override) && ctype_digit($override)) {
        return (int) $override;
    }

    return time();
}

/**
 * @return array{failures: list<int>, blocked_until: int}
 */
function emptyAdminAuthRateLimitState(): array
{
    return [
        'failures' => [],
        'blocked_until' => 0,
    ];
}

/**
 * @return list<int>
 */
function filterAdminAuthFailuresWithinWindow(array $failures, int $now, int $windowSeconds): array
{
    $cutoff = $now - $windowSeconds;
    $recentFailures = [];

    foreach ($failures as $failureTimestamp) {
        if ($failureTimestamp > $cutoff) {
            $recentFailures[] = $failureTimestamp;
        }
    }

    sort($recentFailures);

    return $recentFailures;
}

function ensureAdminAuthRateLimitDirectory(): void
{
    $directory = getAdminAuthRateLimitDirectory();

    clearstatcache(true, $directory);
    if (is_link($directory)) {
        throw new RuntimeException('Admin auth rate limit directory must not be a symlink.');
    }

    if (!is_dir($directory) && !(@mkdir($directory, 0700, true) || is_dir($directory))) {
        throw new RuntimeException('Unable to create admin auth rate limit directory.');
    }

    @chmod($directory, 0700);

    if (!is_dir($directory)) {
        throw new RuntimeException('Admin auth rate limit path is not a directory.');
    }

    $permissions = fileperms($directory);
    if ($permissions === false || ($permissions & 0077) !== 0) {
        throw new RuntimeException('Admin auth rate limit directory permissions must be 0700.');
    }

    $owner = fileowner($directory);
    $expectedOwner = function_exists('posix_geteuid') ? @posix_geteuid() : null;
    if (is_int($owner) && is_int($expectedOwner) && $expectedOwner >= 0 && $owner !== $expectedOwner) {
        throw new RuntimeException('Admin auth rate limit directory owner is invalid.');
    }
}

function getAdminAuthRateLimitDirectory(): string
{
    $configuredDirectory = getenv(APP_ADMIN_RATE_LIMIT_DIR_ENV);
    $directory = is_string($configuredDirectory) && trim($configuredDirectory) !== ''
        ? trim($configuredDirectory)
        : DEFAULT_ADMIN_RATE_LIMIT_DIR;

    $directory = rtrim($directory, "/\\");
    if ($directory === '') {
        throw new RuntimeException('Admin auth rate limit directory is empty.');
    }

    return $directory;
}

function adminAuthRateLimitPath(string $clientKey): string
{
    return getAdminAuthRateLimitDirectory() . DIRECTORY_SEPARATOR . hash('sha256', $clientKey) . '.json';
}

/**
 * @param resource $handle
 * @return array{failures: list<int>, blocked_until: int}
 */
function readAdminAuthRateLimitState($handle, int $now): array
{
    rewind($handle);
    $rawState = stream_get_contents($handle);

    if (!is_string($rawState) || trim($rawState) === '') {
        return emptyAdminAuthRateLimitState();
    }

    $decodedState = json_decode($rawState, true);
    if (!is_array($decodedState)) {
        return emptyAdminAuthRateLimitState();
    }

    $failures = [];
    foreach (($decodedState['failures'] ?? []) as $failureTimestamp) {
        if (is_int($failureTimestamp) || (is_string($failureTimestamp) && ctype_digit($failureTimestamp))) {
            $failures[] = (int) $failureTimestamp;
        }
    }

    $blockedUntil = $decodedState['blocked_until'] ?? 0;
    if (!is_int($blockedUntil) && !(is_string($blockedUntil) && ctype_digit($blockedUntil))) {
        $blockedUntil = 0;
    }

    $normalizedState = [
        'failures' => filterAdminAuthFailuresWithinWindow($failures, $now, ADMIN_AUTH_LONG_WINDOW_SECONDS),
        'blocked_until' => (int) $blockedUntil,
    ];

    if ($normalizedState['blocked_until'] <= $now) {
        $normalizedState['blocked_until'] = 0;
    }

    return $normalizedState;
}

/**
 * @param resource $handle
 * @param array{failures: list<int>, blocked_until: int} $state
 */
function writeAdminAuthRateLimitState($handle, string $path, array $state): void
{
    rewind($handle);
    ftruncate($handle, 0);

    if (count($state['failures']) === 0 && $state['blocked_until'] === 0) {
        fflush($handle);
        @unlink($path);
        return;
    }

    fwrite($handle, json_encode($state, JSON_THROW_ON_ERROR));
    fflush($handle);
}

/**
 * @template TResult
 * @param callable(array{failures: list<int>, blocked_until: int}, int): array{0: array{failures: list<int>, blocked_until: int}, 1: TResult} $mutator
 * @return TResult
 */
function mutateAdminAuthRateLimitState(string $clientKey, callable $mutator)
{
    ensureAdminAuthRateLimitDirectory();

    $path = adminAuthRateLimitPath($clientKey);
    clearstatcache(true, $path);
    if (is_link($path)) {
        throw new RuntimeException('Admin auth rate limit state path must not be a symlink.');
    }

    $handle = fopen($path, 'c+');
    if ($handle === false) {
        throw new RuntimeException('Unable to open admin auth rate limit state file.');
    }

    try {
        if (!flock($handle, LOCK_EX)) {
            throw new RuntimeException('Unable to lock admin auth rate limit state file.');
        }

        $now = adminAuthNow();
        $state = readAdminAuthRateLimitState($handle, $now);
        [$updatedState, $result] = $mutator($state, $now);
        writeAdminAuthRateLimitState($handle, $path, $updatedState);

        flock($handle, LOCK_UN);
        fclose($handle);

        return $result;
    } catch (Throwable $throwable) {
        flock($handle, LOCK_UN);
        fclose($handle);
        throw $throwable;
    }
}

function clearAdminAuthRateLimitState(string $clientKey): void
{
    $directory = getAdminAuthRateLimitDirectory();
    if (!is_dir($directory)) {
        return;
    }

    mutateAdminAuthRateLimitState(
        $clientKey,
        static function (array $state, int $now): array {
            return [emptyAdminAuthRateLimitState(), null];
        }
    );
}

function safeClearAdminAuthRateLimitState(string $clientKey): void
{
    try {
        clearAdminAuthRateLimitState($clientKey);
    } catch (Throwable $throwable) {
        logAdminMessage('euroalt-admin: unable to clear auth rate limit state: ' . $throwable->getMessage());
    }
}

/**
 * @return array{status_code: int, error: string, retry_after: int|null}
 */
function registerAdminAuthFailure(string $clientKey, int $statusCode, string $message): array
{
    return mutateAdminAuthRateLimitState(
        $clientKey,
        static function (array $state, int $now) use ($clientKey, $statusCode, $message): array {
            if ($state['blocked_until'] > $now) {
                return [$state, [
                    'status_code' => 429,
                    'error' => 'too_many_auth_attempts',
                    'retry_after' => $state['blocked_until'] - $now,
                ]];
            }

            $state['failures'][] = $now;
            $state['failures'] = filterAdminAuthFailuresWithinWindow(
                $state['failures'],
                $now,
                ADMIN_AUTH_LONG_WINDOW_SECONDS
            );

            $recentHourlyFailures = count($state['failures']);
            if ($recentHourlyFailures >= ADMIN_AUTH_LONG_WINDOW_MAX_FAILURES) {
                if ($state['blocked_until'] <= $now) {
                    $state['blocked_until'] = $now + ADMIN_AUTH_BLOCK_SECONDS;
                    logAdminMessage(sprintf(
                        'euroalt-admin: auth rate limit block for %s until %s',
                        $clientKey,
                        gmdate(DATE_ATOM, $state['blocked_until'])
                    ));
                }

                return [$state, [
                    'status_code' => 429,
                    'error' => 'too_many_auth_attempts',
                    'retry_after' => max(1, $state['blocked_until'] - $now),
                ]];
            }

            $recentShortWindowFailures = filterAdminAuthFailuresWithinWindow(
                $state['failures'],
                $now,
                ADMIN_AUTH_SHORT_WINDOW_SECONDS
            );

            if (count($recentShortWindowFailures) > ADMIN_AUTH_SHORT_WINDOW_MAX_FAILURES) {
                $oldestRelevantFailure = $recentShortWindowFailures[0];
                $retryAfter = ($oldestRelevantFailure + ADMIN_AUTH_SHORT_WINDOW_SECONDS) - $now;

                return [$state, [
                    'status_code' => 429,
                    'error' => 'too_many_auth_attempts',
                    'retry_after' => max(1, $retryAfter),
                ]];
            }

            return [$state, [
                'status_code' => $statusCode,
                'error' => $message,
                'retry_after' => null,
            ]];
        }
    );
}

function denyAdminAuth(string $clientKey, int $statusCode, string $message): never
{
    $ip = getAdminRequestIp();
    $ua = getAdminAuditUserAgent();
    logAdminMessage(sprintf('euroalt-admin: auth FAILED from %s reason=%s (UA: %s)', $ip, $message, $ua));

    try {
        $result = registerAdminAuthFailure($clientKey, $statusCode, $message);
    } catch (Throwable $throwable) {
        logAdminMessage('euroalt-admin: auth rate limiter unavailable: ' . $throwable->getMessage());
        jsonError(503, 'auth_rate_limit_unavailable');
    }

    if ($result['retry_after'] !== null) {
        header('Retry-After: ' . $result['retry_after']);
    }

    jsonError($result['status_code'], $result['error']);
}

/**
 * Require a valid Bearer token on the current request.
 *
 * Terminates with 401 (missing) or 403 (invalid) JSON error on failure.
 */
function requireAdminAuth(): void
{
    $clientKey = getAdminAuthClientKey();
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

    if ($header === '') {
        denyAdminAuth($clientKey, 401, 'missing_authorization');
    }

    if (!str_starts_with(strtolower($header), 'bearer ')) {
        denyAdminAuth($clientKey, 401, 'invalid_authorization_scheme');
    }

    $providedToken = substr($header, 7);
    if ($providedToken === '') {
        denyAdminAuth($clientKey, 401, 'empty_token');
    }

    try {
        $expectedToken = loadAdminToken();
    } catch (RuntimeException) {
        logAdminMessage('euroalt-admin: token not configured on server');
        jsonError(500, 'auth_not_configured');
    }

    if (hash_equals($expectedToken, $providedToken)) {
        $ip = getAdminRequestIp();
        logAdminMessage(sprintf('euroalt-admin: auth OK from %s', $ip));
        // A successful CLI submission should not keep the maintainer locked out behind old failures.
        safeClearAdminAuthRateLimitState($clientKey);
        return;
    }

    denyAdminAuth($clientKey, 403, 'forbidden');
}
