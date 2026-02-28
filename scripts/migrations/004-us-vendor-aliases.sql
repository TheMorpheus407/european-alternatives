-- Migration 004: Add US vendor name aliases for replacement resolution
--
-- When the research script submits "Adobe Photoshop" as a replacement target,
-- the exact-match lookup fails if the catalog only has an entry named "Adobe".
-- This table maps common product names / abbreviations to the canonical
-- catalog_entries entry so that entry_replacements.replaced_entry_id
-- can be resolved automatically.
--
-- Run: mysql -u <user> -p <database> < scripts/migrations/004-us-vendor-aliases.sql

-- ---------------------------------------------------------------------------
-- Step 1: Create the alias table
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `us_vendor_aliases` (
  `id`       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `alias`    VARCHAR(255)    NOT NULL,
  `entry_id` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_alias` (`alias`),
  CONSTRAINT `fk_uva_entry` FOREIGN KEY (`entry_id`) REFERENCES `catalog_entries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Step 2: Auto-seed aliases from existing US vendor entry names
--         (every US vendor's own name becomes a self-alias so the alias
--          lookup path always finds them)
-- ---------------------------------------------------------------------------

INSERT IGNORE INTO `us_vendor_aliases` (`alias`, `entry_id`)
SELECT ce.name, ce.id
FROM `catalog_entries` ce
WHERE ce.status = 'us';

-- ---------------------------------------------------------------------------
-- Record migration
-- ---------------------------------------------------------------------------

INSERT INTO `schema_migrations` (`version`) VALUES ('004-us-vendor-aliases');
