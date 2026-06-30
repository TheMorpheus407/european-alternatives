#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RUNNER="$SCRIPT_DIR/insert-verified-alternative-run.mjs"

# shellcheck source=scripts/lib/load-php-env.sh
source "$SCRIPT_DIR/lib/load-php-env.sh"

usage() {
    cat <<'USAGE'
Usage:
  scripts/insert-verified-alternative.sh --verified-action-file <path> [options]
  scripts/insert-verified-alternative.sh --help

Stage-4 of the catalog-suggestion pipeline. Inserts a verified
new_alternative through the admin API as status="alternative" by default with
trustScoreStatus=pending. Forwards arguments to the Node runner.

Options:
  --verified-action-file <path>   Stage-3 verified_action JSON.
  --verified-action-json <json>   Inline stage-3 verified_action JSON.
  --status <status>               Insert as alternative, us, or draft.
  --dry-run                       Print would-be payload without contacting the API.
  --repo <owner/name>             Source repo passthrough for downstream stages.

Environment:
  EUROALT_API_BASE                Base URL of the API host (required).
  EUROALT_ADMIN_TOKEN             Admin bearer token (required for non-dry-run).
                                  The wrapper auto-loads gitignored local PHP
                                  env files before invoking the Node runner.
USAGE
}

if [[ "$#" -eq 0 ]]; then
    usage >&2
    echo "error: provide a verified_action source" >&2
    exit 64
fi

ARGS=()

while [[ "$#" -gt 0 ]]; do
    case "$1" in
        -h|--help)
            usage
            exit 0
            ;;
        --dry-run)
            ARGS+=("--dry-run")
            shift
            ;;
        --verified-action-file|--verified-action-json|--repo|--status)
            if [[ "$#" -lt 2 ]]; then
                echo "error: $1 requires a value" >&2
                exit 64
            fi
            ARGS+=("$1" "$2")
            shift 2
            ;;
        --verified-action-file=*|--verified-action-json=*|--repo=*|--status=*)
            ARGS+=("$1")
            shift
            ;;
        --)
            shift
            break
            ;;
        --*)
            echo "error: unknown option $1" >&2
            exit 64
            ;;
        *)
            echo "error: unexpected positional argument $1" >&2
            exit 64
            ;;
    esac
done

if ! command -v node >/dev/null 2>&1; then
    echo "error: missing required tool: node" >&2
    exit 1
fi

cd "$REPO_ROOT"
load_euroalt_php_env_vars "$REPO_ROOT" EUROALT_API_BASE EUROALT_ADMIN_TOKEN
exec node "$RUNNER" "${ARGS[@]}"
