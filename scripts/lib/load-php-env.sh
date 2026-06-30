#!/usr/bin/env bash

# Source this file from Bash entrypoints that need the same local PHP env
# files as the PHP API/CLI scripts. It exports only the requested keys.

load_euroalt_php_env_vars() {
    local repo_root="$1"
    shift

    if [[ "$#" -eq 0 ]]; then
        return 0
    fi

    local missing=0
    local key
    for key in "$@"; do
        if [[ -z "${!key:-}" ]]; then
            missing=1
            break
        fi
    done

    if [[ "$missing" -eq 0 ]]; then
        return 0
    fi

    if ! command -v php >/dev/null 2>&1; then
        return 0
    fi

    local output
    output="$(
        php -r '
            $repoRoot = $argv[1] ?? "";
            $keys = array_slice($argv, 2);

            if ($repoRoot === "" || !is_dir($repoRoot)) {
                fwrite(STDERR, "invalid repo root\n");
                exit(64);
            }

            foreach ($keys as $key) {
                if (!preg_match("/\AEUROALT_[A-Z0-9_]+\z/", $key)) {
                    fwrite(STDERR, "invalid env key\n");
                    exit(64);
                }
            }

            require $repoRoot . "/api/bootstrap.php";
            loadEnvironmentOverrides();

            if (in_array("EUROALT_ADMIN_TOKEN", $keys, true)) {
                $adminTokenPath = $repoRoot . "/api/config/admin-token.php";
                if (is_readable($adminTokenPath)) {
                    require_once $adminTokenPath;
                }
            }

            foreach ($keys as $key) {
                $value = getenv($key);
                if (is_string($value) && $value !== "") {
                    $value = str_replace(["\r", "\n"], "", $value);
                    echo $key . "=" . $value . "\n";
                }
            }
        ' "$repo_root" "$@"
    )"

    while IFS= read -r line; do
        [[ -z "$line" ]] && continue
        export "$line"
    done <<< "$output"
}
