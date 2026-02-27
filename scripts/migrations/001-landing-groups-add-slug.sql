-- Migration: Add slug column to landing_category_groups
-- Date: 2026-02-27
-- Reason: Frontend expects string slug IDs for i18n key lookup (e.g. "communication-work")
--         but the table only had auto-increment numeric IDs.

-- Step 1: Add column without unique key (avoids duplicate '' error)
ALTER TABLE `landing_category_groups`
  ADD COLUMN `slug` VARCHAR(100) NOT NULL DEFAULT '' AFTER `id`;

-- Step 2: Backfill slugs for existing rows
UPDATE `landing_category_groups` SET `slug` = 'communication-work'      WHERE `name_en` = 'Communication & Work';
UPDATE `landing_category_groups` SET `slug` = 'web-discovery'           WHERE `name_en` = 'Web & Discovery';
UPDATE `landing_category_groups` SET `slug` = 'privacy-security'        WHERE `name_en` = 'Privacy & Security';
UPDATE `landing_category_groups` SET `slug` = 'social-entertainment'    WHERE `name_en` = 'Social & Entertainment';
UPDATE `landing_category_groups` SET `slug` = 'money-commerce'          WHERE `name_en` = 'Money & Commerce';
UPDATE `landing_category_groups` SET `slug` = 'devices-platforms'       WHERE `name_en` = 'Devices & Platforms';
UPDATE `landing_category_groups` SET `slug` = 'ai-creative'             WHERE `name_en` = 'AI & Creative';
UPDATE `landing_category_groups` SET `slug` = 'builders-infrastructure' WHERE `name_en` = 'Builders & Infrastructure';

-- Step 3: Add unique constraint (all slugs now distinct)
ALTER TABLE `landing_category_groups`
  ADD UNIQUE KEY `uq_lcg_slug` (`slug`);

-- Step 4: Remove the default
ALTER TABLE `landing_category_groups`
  ALTER COLUMN `slug` DROP DEFAULT;

-- Step 5: Record migration
INSERT INTO `schema_migrations` (`version`, `applied_at`)
VALUES ('001-landing-groups-add-slug', NOW());
