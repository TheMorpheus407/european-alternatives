-- Migration 003: Unify US vendors into catalog_entries
--
-- US vendors now use the shared reservations, positive_signals, and
-- scoring_metadata tables. The parallel US vendor hierarchy
-- (us_vendors, us_vendor_aliases, us_vendor_profiles, us_vendor_profile_reservations)
-- is dropped.
--
-- IMPORTANT: This migration is for EXISTING databases that have the old
-- US vendor tables and FK names (fk_er_vendor, fk_cuv_vendor). For a fresh
-- install, use scripts/db-schema.sql directly — this migration is already
-- folded into the schema definition and should be skipped.
--
-- Run: mysql -u <user> -p <database> < scripts/migrations/003-unify-us-vendors.sql

-- ---------------------------------------------------------------------------
-- Step 1: Copy US vendor profile reservations → shared reservations table
-- ---------------------------------------------------------------------------

INSERT INTO `reservations` (`entry_id`, `reservation_key`, `sort_order`, `severity`, `event_date`, `source_url`, `penalty_tier`, `penalty_amount`, `text_en`, `text_de`)
SELECT
    uv.entry_id,
    uvpr.reservation_key,
    uvpr.sort_order,
    uvpr.severity,
    uvpr.event_date,
    uvpr.source_url,
    uvpr.penalty_tier,
    uvpr.penalty_amount,
    uvpr.text_en,
    uvpr.text_de
FROM `us_vendor_profile_reservations` uvpr
JOIN `us_vendors` uv ON uv.id = uvpr.us_vendor_id;

-- ---------------------------------------------------------------------------
-- Step 2: Copy US vendor profile descriptions → catalog_entries
-- ---------------------------------------------------------------------------

UPDATE `catalog_entries` ce
JOIN `us_vendors` uv ON uv.entry_id = ce.id
JOIN `us_vendor_profiles` uvp ON uvp.us_vendor_id = uv.id
SET
    ce.description_en = COALESCE(ce.description_en, uvp.description_en),
    ce.description_de = COALESCE(ce.description_de, uvp.description_de);

-- ---------------------------------------------------------------------------
-- Step 3: Add scoring_metadata for US vendors (base class = 'us')
-- ---------------------------------------------------------------------------

INSERT INTO `scoring_metadata` (`entry_id`, `base_class_override`)
SELECT uv.entry_id, 'us'
FROM `us_vendors` uv
ON DUPLICATE KEY UPDATE `base_class_override` = 'us';

-- ---------------------------------------------------------------------------
-- Step 4: Repoint entry_replacements.us_vendor_id → replaced_entry_id
-- ---------------------------------------------------------------------------

ALTER TABLE `entry_replacements` ADD COLUMN `replaced_entry_id` BIGINT UNSIGNED DEFAULT NULL;

UPDATE `entry_replacements` er
JOIN `us_vendors` uv ON uv.id = er.us_vendor_id
SET er.replaced_entry_id = uv.entry_id;

ALTER TABLE `entry_replacements` DROP FOREIGN KEY `fk_er_vendor`;
ALTER TABLE `entry_replacements` DROP COLUMN `us_vendor_id`;
ALTER TABLE `entry_replacements` ADD CONSTRAINT `fk_er_replaced`
    FOREIGN KEY (`replaced_entry_id`) REFERENCES `catalog_entries` (`id`) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- Step 5: Repoint category_us_vendors.us_vendor_id → entry_id
-- ---------------------------------------------------------------------------

ALTER TABLE `category_us_vendors` ADD COLUMN `entry_id` BIGINT UNSIGNED DEFAULT NULL;

UPDATE `category_us_vendors` cuv
JOIN `us_vendors` uv ON uv.id = cuv.us_vendor_id
SET cuv.entry_id = uv.entry_id;

ALTER TABLE `category_us_vendors` DROP FOREIGN KEY `fk_cuv_vendor`;
ALTER TABLE `category_us_vendors` DROP COLUMN `us_vendor_id`;
ALTER TABLE `category_us_vendors` ADD CONSTRAINT `fk_cuv_entry`
    FOREIGN KEY (`entry_id`) REFERENCES `catalog_entries` (`id`) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- Step 6: Drop US vendor tables (reverse FK order)
-- ---------------------------------------------------------------------------

DROP TABLE `us_vendor_profile_reservations`;
DROP TABLE `us_vendor_profiles`;
DROP TABLE `us_vendor_aliases`;
DROP TABLE `us_vendors`;

-- ---------------------------------------------------------------------------
-- Record migration
-- ---------------------------------------------------------------------------

INSERT INTO `schema_migrations` (`version`) VALUES ('003-unify-us-vendors');
