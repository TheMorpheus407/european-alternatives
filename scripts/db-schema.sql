-- =============================================================================
-- European Alternatives — Database Schema
-- =============================================================================
-- Migration version: v2.0.0
-- Date:             2026-02-27
-- Engine:           MySQL 8.0+ (InnoDB)
-- Charset:          utf8mb4 / utf8mb4_unicode_ci
-- Tables:           16
-- Schema for European Alternatives database
--
-- This schema creates the full normalized catalog database for the European
-- Alternatives project. Tables are ordered to satisfy foreign-key dependencies
-- (independent tables first, dependent tables after their parents).
--
-- Usage:
--   mysql -u <user> -p <database> < scripts/db-schema.sql
--
-- To tear down (reverse FK order):
--   DROP TABLE IF EXISTS landing_group_categories, landing_category_groups,
--     further_reading_resources, denied_decisions, scoring_metadata,
--     positive_signals, reservations, entry_replacements, category_us_vendors,
--     entry_tags, entry_categories, catalog_entries, tags,
--     categories, countries, schema_migrations;
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------------
-- 1. schema_migrations — tracks applied migration versions
-- ---------------------------------------------------------------------------
CREATE TABLE `schema_migrations` (
  `version`    VARCHAR(255) NOT NULL,
  `applied_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 2. countries — ISO 3166-1 alpha-2 codes (plus `eu` pseudo-code)
-- ---------------------------------------------------------------------------
CREATE TABLE `countries` (
  `code`       VARCHAR(5)   NOT NULL,
  `label_en`   VARCHAR(100) NOT NULL,
  `label_de`   VARCHAR(100) NOT NULL,
  `sort_order` INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 3. categories — catalog category slugs with i18n names
-- ---------------------------------------------------------------------------
CREATE TABLE `categories` (
  `id`             VARCHAR(50)  NOT NULL,
  `emoji`          VARCHAR(20)  NOT NULL,
  `name_en`        VARCHAR(200) NOT NULL,
  `name_de`        VARCHAR(200) NOT NULL,
  `description_en` TEXT         NOT NULL,
  `description_de` TEXT         NOT NULL,
  `sort_order`     INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 4. tags — normalized tag slugs with optional i18n labels
-- ---------------------------------------------------------------------------
CREATE TABLE `tags` (
  `id`       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug`     VARCHAR(100)    NOT NULL,
  `label_en` VARCHAR(200)    DEFAULT NULL,
  `label_de` VARCHAR(200)    DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tags_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 5. catalog_entries — unified entity table (alternatives, US, denied, etc.)
--    Depends on: countries
-- ---------------------------------------------------------------------------
CREATE TABLE `catalog_entries` (
  `id`                          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug`                        VARCHAR(100)    NOT NULL,
  `status`                      ENUM('alternative','us','denied','draft','archived') NOT NULL,
  `source_file`                 ENUM('manual','research','us','denied') NOT NULL,
  `is_active`                   TINYINT(1)      NOT NULL DEFAULT 1,
  `date_added`                  DATE            NOT NULL DEFAULT (CURRENT_DATE),
  `retired_at`                  DATETIME        DEFAULT NULL,
  `name`                        VARCHAR(255)    NOT NULL,
  `description_en`              TEXT            DEFAULT NULL,
  `description_de`              TEXT            DEFAULT NULL,
  `country_code`                VARCHAR(5)      DEFAULT NULL,
  `website_url`                 VARCHAR(2048)   DEFAULT NULL,
  `logo_path`                   VARCHAR(512)    DEFAULT NULL,
  `pricing`                     ENUM('free','freemium','paid') DEFAULT NULL,
  `is_open_source`              TINYINT(1)      DEFAULT NULL,
  `open_source_level`           ENUM('full','partial','none') DEFAULT NULL,
  `open_source_audit_url`       VARCHAR(2048)   DEFAULT NULL,
  `source_code_url`             VARCHAR(2048)   DEFAULT NULL,
  `self_hostable`               TINYINT(1)      DEFAULT NULL,
  `founded_year`                SMALLINT UNSIGNED DEFAULT NULL,
  `headquarters_city`           VARCHAR(200)    DEFAULT NULL,
  `license_text`                TEXT            DEFAULT NULL,
  `action_links_json`           JSON            DEFAULT NULL,
  `created_at`                  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`                  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_slug` (`slug`),
  KEY `ix_status` (`status`),
  KEY `ix_active_status` (`is_active`, `status`),
  CONSTRAINT `fk_country` FOREIGN KEY (`country_code`) REFERENCES `countries` (`code`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_openness` CHECK (
    (`is_open_source` IS NULL AND `open_source_level` IS NULL)
    OR (`is_open_source` = 0 AND `open_source_level` = 'none')
    OR (`is_open_source` = 1 AND `open_source_level` IN ('full','partial'))
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 6. entry_categories — many-to-many: entries <-> categories
--    Depends on: catalog_entries, categories
--    Uses a generated column + unique index to enforce at-most-one primary
--    category per entry.
-- ---------------------------------------------------------------------------
CREATE TABLE `entry_categories` (
  `entry_id`         BIGINT UNSIGNED NOT NULL,
  `category_id`      VARCHAR(50)     NOT NULL,
  `is_primary`       TINYINT(1)      NOT NULL DEFAULT 0,
  `sort_order`       INT             NOT NULL DEFAULT 0,
  `primary_entry_id` BIGINT UNSIGNED AS (IF(`is_primary`, `entry_id`, NULL)) STORED,
  PRIMARY KEY (`entry_id`, `category_id`),
  UNIQUE KEY `uq_primary` (`primary_entry_id`),
  CONSTRAINT `fk_ec_entry` FOREIGN KEY (`entry_id`) REFERENCES `catalog_entries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ec_cat`   FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 7. entry_tags — many-to-many: entries <-> tags (with display order)
--    Depends on: catalog_entries, tags
-- ---------------------------------------------------------------------------
CREATE TABLE `entry_tags` (
  `entry_id`   BIGINT UNSIGNED NOT NULL,
  `tag_id`     BIGINT UNSIGNED NOT NULL,
  `sort_order` INT             NOT NULL DEFAULT 0,
  PRIMARY KEY (`entry_id`, `tag_id`),
  UNIQUE KEY `uq_tag_order` (`entry_id`, `sort_order`),
  CONSTRAINT `fk_et_entry` FOREIGN KEY (`entry_id`) REFERENCES `catalog_entries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_et_tag`   FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 8. category_us_vendors — "Replaces X, Y, Z" per category
--    Depends on: categories, catalog_entries
-- ---------------------------------------------------------------------------
CREATE TABLE `category_us_vendors` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id`  VARCHAR(50)     NOT NULL,
  `entry_id`     BIGINT UNSIGNED DEFAULT NULL,
  `raw_name`     VARCHAR(255)    NOT NULL,
  `sort_order`   INT             NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cuv_order` (`category_id`, `sort_order`),
  UNIQUE KEY `uq_cuv_name` (`category_id`, `raw_name`),
  CONSTRAINT `fk_cuv_cat` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cuv_entry` FOREIGN KEY (`entry_id`) REFERENCES `catalog_entries` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 9. entry_replacements — which US vendors an alternative replaces
--    Depends on: catalog_entries
-- ---------------------------------------------------------------------------
CREATE TABLE `entry_replacements` (
  `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `entry_id`          BIGINT UNSIGNED NOT NULL,
  `raw_name`          VARCHAR(255)    NOT NULL,
  `replaced_entry_id` BIGINT UNSIGNED DEFAULT NULL,
  `sort_order`        INT             NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_er_order` (`entry_id`, `sort_order`),
  CONSTRAINT `fk_er_entry` FOREIGN KEY (`entry_id`) REFERENCES `catalog_entries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_er_replaced` FOREIGN KEY (`replaced_entry_id`) REFERENCES `catalog_entries` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 10. reservations — trust reservations (penalties) for catalog entries
--     Depends on: catalog_entries
-- ---------------------------------------------------------------------------
CREATE TABLE `reservations` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `entry_id`        BIGINT UNSIGNED NOT NULL,
  `reservation_key` VARCHAR(100)    NOT NULL,
  `sort_order`      INT             NOT NULL,
  `severity`        ENUM('minor','moderate','major') NOT NULL,
  `event_date`      DATE            DEFAULT NULL,
  `penalty_tier`    ENUM('security','governance','reliability','contract') DEFAULT NULL,
  `penalty_amount`  DECIMAL(5,2)    DEFAULT NULL,
  `is_structural`   TINYINT(1)      NOT NULL DEFAULT 0,
  `text_en`         TEXT            NOT NULL,
  `text_de`         TEXT            DEFAULT NULL,
  `source_url`      TEXT            DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_res_key` (`entry_id`, `reservation_key`),
  UNIQUE KEY `uq_res_order` (`entry_id`, `sort_order`),
  CONSTRAINT `fk_res_entry` FOREIGN KEY (`entry_id`) REFERENCES `catalog_entries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 11. positive_signals — trust-positive evidence for catalog entries
--     Depends on: catalog_entries
-- ---------------------------------------------------------------------------
CREATE TABLE `positive_signals` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `entry_id`   BIGINT UNSIGNED NOT NULL,
  `signal_key` VARCHAR(100)    NOT NULL,
  `sort_order` INT             NOT NULL,
  `dimension`  ENUM('security','governance','reliability','contract') NOT NULL,
  `amount`     DECIMAL(5,2)    NOT NULL,
  `text_en`    TEXT            NOT NULL,
  `text_de`    TEXT            DEFAULT NULL,
  `source_url` TEXT            DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sig_key` (`entry_id`, `signal_key`),
  UNIQUE KEY `uq_sig_order` (`entry_id`, `sort_order`),
  CONSTRAINT `fk_sig_entry` FOREIGN KEY (`entry_id`) REFERENCES `catalog_entries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 12. scoring_metadata — per-entry scoring configuration overrides
--     Depends on: catalog_entries
-- ---------------------------------------------------------------------------
CREATE TABLE `scoring_metadata` (
  `entry_id`            BIGINT UNSIGNED NOT NULL,
  `base_class_override` ENUM('foss','eu','nonEU','rest','us','autocracy') DEFAULT NULL,
  `is_ad_surveillance`  TINYINT(1)      DEFAULT NULL,
  `deep_research_path`  VARCHAR(512)    DEFAULT NULL,
  `worksheet_path`      VARCHAR(512)    DEFAULT NULL,
  PRIMARY KEY (`entry_id`),
  CONSTRAINT `fk_sm_entry` FOREIGN KEY (`entry_id`) REFERENCES `catalog_entries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 13. denied_decisions — denial reasoning for rejected alternatives
--     Depends on: catalog_entries (status = 'denied')
-- ---------------------------------------------------------------------------
CREATE TABLE `denied_decisions` (
  `entry_id`             BIGINT UNSIGNED NOT NULL,
  `proposed_in`          VARCHAR(255)    DEFAULT NULL,
  `claimed_origin`       VARCHAR(100)    DEFAULT NULL,
  `actual_origin`        VARCHAR(100)    DEFAULT NULL,
  `removed_in`           VARCHAR(255)    DEFAULT NULL,
  `raw_category_label`   VARCHAR(200)    DEFAULT NULL,
  `failed_gateways_json` JSON            DEFAULT NULL,
  `text_en`              TEXT            NOT NULL,
  `text_de`              TEXT            DEFAULT NULL,
  `sources_json`         JSON            DEFAULT NULL,
  PRIMARY KEY (`entry_id`),
  CONSTRAINT `fk_dd_entry` FOREIGN KEY (`entry_id`) REFERENCES `catalog_entries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 14. further_reading_resources — curated external resource links
--     No FK dependencies
-- ---------------------------------------------------------------------------
CREATE TABLE `further_reading_resources` (
  `id`                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug`                VARCHAR(100)    NOT NULL,
  `name`                VARCHAR(255)    NOT NULL,
  `website_url`         VARCHAR(2048)   NOT NULL,
  `section`             ENUM('directories','publicCatalogues','migrationGuides') NOT NULL,
  `focus`               ENUM('eu','global','public-sector-eu') NOT NULL,
  `related_issues_json` JSON            DEFAULT NULL,
  `last_reviewed`       DATE            DEFAULT NULL,
  `sort_order`          INT             NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_fr_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 15. landing_category_groups — groups for landing page display
--     No FK dependencies
-- ---------------------------------------------------------------------------
CREATE TABLE `landing_category_groups` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug`           VARCHAR(100)    NOT NULL,
  `name_en`        VARCHAR(200)    NOT NULL,
  `name_de`        VARCHAR(200)    DEFAULT NULL,
  `description_en` TEXT            DEFAULT NULL,
  `description_de` TEXT            DEFAULT NULL,
  `sort_order`     INT             NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_lcg_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 16. landing_group_categories — many-to-many: landing groups <-> categories
--     Depends on: landing_category_groups, categories
-- ---------------------------------------------------------------------------
CREATE TABLE `landing_group_categories` (
  `group_id`    BIGINT UNSIGNED NOT NULL,
  `category_id` VARCHAR(50)     NOT NULL,
  `sort_order`  INT             NOT NULL DEFAULT 0,
  PRIMARY KEY (`group_id`, `category_id`),
  UNIQUE KEY `uq_lgc_order` (`group_id`, `sort_order`),
  CONSTRAINT `fk_lgc_group` FOREIGN KEY (`group_id`) REFERENCES `landing_category_groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lgc_cat`   FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Re-enable foreign key checks
-- ---------------------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 1;
