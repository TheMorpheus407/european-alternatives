# API Setup

This folder contains a minimal PHP API layer for Hostinger shared hosting.

## Files

- `bootstrap.php`: shared JSON + request validation helpers and secure config loader
- `db.php`: PDO connector with secure defaults
- `health/db.php`: DB health endpoint (`GET /api/health/db.php`)
- `config/db.example.php`: config template (do not store real secrets in git)
- `config/db.env.example.php`: env loader template (`putenv(...)`)

## Production secret file

Create a file outside web root:

- Path: `/home/u688914453/.secrets/euroalt-db-env.php`
- Owner: account user
- Permissions: `chmod 600 /home/u688914453/.secrets/euroalt-db-env.php`

Use the `putenv(...)` format from `config/db.env.example.php`.
The API reads these variables first: `EUROALT_DB_HOST`, `EUROALT_DB_PORT`, `EUROALT_DB_NAME`, `EUROALT_DB_USER`, `EUROALT_DB_PASS`, `EUROALT_DB_CHARSET`.

## Optional override

To use a different env loader path, set `EUROALT_ENV_LOADER`.
As fallback, array config file loading is still supported via `EUROALT_DB_CONFIG`.
