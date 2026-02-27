-- Migration 002: Drop static trust score columns from catalog_entries
--
-- Trust scores are now computed dynamically by the PHP scoring engine
-- (api/catalog/scoring.php) from reservations, positive_signals, and
-- scoring_metadata on every API request. No stored scores needed.
--
-- Run: mysql -u <user> -p <database> < scripts/migrations/002-drop-trust-score-columns.sql

-- Drop the score range constraint first (MariaDB uses DROP CONSTRAINT)
ALTER TABLE `catalog_entries` DROP CONSTRAINT `chk_score_range`;

-- Drop the 4 trust score columns
ALTER TABLE `catalog_entries`
  DROP COLUMN `trust_score_100`,
  DROP COLUMN `trust_score_10_display`,
  DROP COLUMN `trust_score_status`,
  DROP COLUMN `trust_score_breakdown_json`;

-- Record migration
INSERT INTO `schema_migrations` (`version`) VALUES ('002-drop-trust-score-columns');
