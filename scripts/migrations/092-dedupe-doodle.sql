-- Migration 092: Merge the duplicate Doodle records into one Swiss alternative.
--
-- Official evidence (accessed 2026-07-27):
--   https://doodle.com/en/website-imprint/
--     Doodle identifies the operator as Doodle AG, gives its head office as
--     Zurich, Switzerland, states that it is registered and governed by Swiss
--     law, and identifies Zurich-based TX Group as its owner.
--   https://doodle.com/en/about-us/
--     Doodle describes the product as built in Europe / Switzerland.
--   https://tx.group/fileadmin/user_upload/reports-and-publications/2025/en/Annual_Report_2025_ENG.pdf
--     TX Group's 2025 annual report lists Doodle AG with domicile in Zurich.
--
-- Live DB/API audit on 2026-07-27:
--   * id 903 / doodle-ch is the complete Swiss alternative. It owns the
--     scheduling membership, four tags, 41 matrix facts, six reservations,
--     five positive signals, EU scoring metadata, and the Calendly replacement.
--   * id 884 / doodle is an empty row incorrectly classified as a US product.
--     Its only dependants are US alias id 281 and meetergo replacement id 836.
--     Its legacy source_file value is the zero-length string (LENGTH = 0,
--     HEX = ''), even though that value is absent from the current schema enum.
--   * Doodle is not a US benchmark, so those two US-semantic relations must be
--     removed rather than rewired to the Swiss alternative. A semantic scan of
--     raw_name / alias, including rows with NULL entry_id, found no other
--     Doodle US-benchmark reference.
--
-- Preserve rich row id 903 and give it the user-facing canonical slug `doodle`.
-- The initial/final-state assertion makes the migration fail closed on drift
-- while still allowing a safe re-run after the merge has completed.

START TRANSACTION;

-- Lock the two audited identities while their complete relation shape is
-- checked and, on the initial run, changed.
SELECT COUNT(*)
INTO @doodle_locked_row_count
FROM `catalog_entries`
WHERE `id` IN (884, 903)
FOR UPDATE;

SET @doodle_initial_state = (
  SELECT COUNT(*) = 1
  FROM `catalog_entries` canonical
  JOIN `catalog_entries` duplicate
    ON duplicate.`id` = 884
   AND duplicate.`slug` = 'doodle'
   AND duplicate.`status` = 'us'
   AND duplicate.`source_file` = ''
   AND duplicate.`is_active` = 1
   AND duplicate.`date_added` = '2026-06-11'
   AND duplicate.`retired_at` IS NULL
   AND duplicate.`name` = 'Doodle'
   AND duplicate.`description_en` IS NULL
   AND duplicate.`description_de` IS NULL
   AND duplicate.`country_code` = 'us'
   AND duplicate.`website_url` IS NULL
   AND duplicate.`logo_path` = '/logos/doodle.svg'
   AND duplicate.`pricing` IS NULL
   AND duplicate.`is_open_source` IS NULL
   AND duplicate.`open_source_level` IS NULL
   AND duplicate.`open_source_audit_url` IS NULL
   AND duplicate.`source_code_url` IS NULL
   AND duplicate.`self_hostable` IS NULL
   AND duplicate.`founded_year` IS NULL
   AND duplicate.`headquarters_city` IS NULL
   AND duplicate.`license_text` IS NULL
   AND duplicate.`action_links_json` IS NULL
  WHERE canonical.`id` = 903
    AND canonical.`slug` = 'doodle-ch'
    AND canonical.`status` = 'alternative'
    AND canonical.`source_file` = 'research'
    AND canonical.`is_active` = 1
    AND canonical.`date_added` = '2026-06-11'
    AND canonical.`retired_at` IS NULL
    AND canonical.`name` = 'Doodle'
    AND canonical.`description_en` =
      'Doodle is a scheduling platform for coordinating group meetings, one-to-one appointments, booking pages, and calendar workflows.'
    AND canonical.`description_de` IS NULL
    AND canonical.`country_code` = 'ch'
    AND canonical.`website_url` = 'https://doodle.com/'
    AND canonical.`logo_path` = '/logos/doodle-ch.svg'
    AND canonical.`pricing` = 'freemium'
    AND canonical.`is_open_source` = 0
    AND canonical.`open_source_level` = 'none'
    AND canonical.`open_source_audit_url` IS NULL
    AND canonical.`source_code_url` IS NULL
    AND canonical.`self_hostable` = 0
    AND canonical.`founded_year` = 2007
    AND canonical.`headquarters_city` = 'Zurich'
    AND canonical.`license_text` IS NULL
    AND canonical.`action_links_json` IS NULL
    AND (
      SELECT COUNT(*)
      FROM `category_us_vendors`
      WHERE `entry_id` IN (884, 903)
         OR LOWER(TRIM(`raw_name`)) = 'doodle'
    ) = 0
    AND (
      SELECT COUNT(*)
      FROM `denied_decisions`
      WHERE `entry_id` IN (884, 903)
    ) = 0
    AND (
      SELECT COUNT(*)
      FROM `entry_categories`
      WHERE `entry_id` IN (884, 903)
    ) = 1
    AND EXISTS (
      SELECT 1
      FROM `entry_categories`
      WHERE `entry_id` = 903
        AND `category_id` = 'scheduling'
        AND `is_primary` = 1
        AND `sort_order` = 0
    )
    AND (
      SELECT COUNT(*)
      FROM `entry_replacements`
      WHERE `entry_id` IN (884, 903)
         OR `replaced_entry_id` IN (884, 903)
         OR LOWER(TRIM(`raw_name`)) = 'doodle'
    ) = 2
    AND EXISTS (
      SELECT 1
      FROM `entry_replacements`
      WHERE `id` = 847
        AND `entry_id` = 903
        AND `raw_name` = 'Calendly'
        AND `replaced_entry_id` = 640
        AND `sort_order` = 0
    )
    AND EXISTS (
      SELECT 1
      FROM `entry_replacements`
      WHERE `id` = 836
        AND `entry_id` = 883
        AND `raw_name` = 'Doodle'
        AND `replaced_entry_id` = 884
        AND `sort_order` = 1
    )
    AND (
      SELECT COUNT(*)
      FROM `entry_tags`
      WHERE `entry_id` IN (884, 903)
    ) = 4
    AND (
      SELECT COUNT(*)
      FROM `entry_tags`
      WHERE `entry_id` = 903
        AND (
          (`tag_id` = 865 AND `sort_order` = 0)
          OR (`tag_id` = 1225 AND `sort_order` = 1)
          OR (`tag_id` = 539 AND `sort_order` = 2)
          OR (`tag_id` = 1226 AND `sort_order` = 3)
        )
    ) = 4
    AND (
      SELECT COUNT(*)
      FROM `matrix_facts`
      WHERE `entry_id` IN (884, 903)
    ) = 41
    AND (
      SELECT COUNT(*)
      FROM `matrix_facts`
      WHERE `entry_id` = 903
        AND `category_id` = 'scheduling'
        AND `status` = 'open'
        AND `selected_attempt_id` IS NULL
    ) = 41
    AND (
      SELECT COUNT(*)
      FROM `matrix_fact_attempts` attempt
      JOIN `matrix_facts` fact ON fact.`id` = attempt.`fact_id`
      WHERE fact.`entry_id` IN (884, 903)
    ) = 0
    AND (
      SELECT COUNT(*)
      FROM `matrix_fact_verifications` verification
      JOIN `matrix_fact_attempts` attempt
        ON attempt.`id` = verification.`attempt_id`
      JOIN `matrix_facts` fact ON fact.`id` = attempt.`fact_id`
      WHERE fact.`entry_id` IN (884, 903)
    ) = 0
    AND (
      SELECT COUNT(*)
      FROM `positive_signals`
      WHERE `entry_id` IN (884, 903)
    ) = 5
    AND (
      SELECT COUNT(*)
      FROM `reservations`
      WHERE `entry_id` IN (884, 903)
    ) = 6
    AND (
      SELECT COUNT(*)
      FROM `scoring_metadata`
      WHERE `entry_id` IN (884, 903)
        AND `entry_id` = 903
        AND `base_class_override` = 'eu'
        AND `is_ad_surveillance` = 1
        AND `deep_research_path` =
          '/home/morpheus/Documents/Projects/european-alternatives/tmp/score-resume-input-2026-06-12-docx-121000/doodle-ch.md'
        AND `worksheet_path` = 'tmp/scoring-worksheets/doodle-ch.md'
    ) = 1
    AND (
      SELECT COUNT(*)
      FROM `us_vendor_aliases`
      WHERE `entry_id` IN (884, 903)
         OR LOWER(TRIM(`alias`)) = 'doodle'
    ) = 1
    AND EXISTS (
      SELECT 1
      FROM `us_vendor_aliases`
      WHERE `id` = 281
        AND `alias` = 'Doodle'
        AND `entry_id` = 884
    )
);

SET @doodle_final_state = (
  SELECT COUNT(*) = 1
  FROM `catalog_entries` canonical
  WHERE canonical.`id` = 903
    AND canonical.`slug` = 'doodle'
    AND canonical.`status` = 'alternative'
    AND canonical.`source_file` = 'research'
    AND canonical.`is_active` = 1
    AND canonical.`name` = 'Doodle'
    AND canonical.`country_code` = 'ch'
    AND canonical.`website_url` = 'https://doodle.com/'
    AND canonical.`logo_path` = '/logos/doodle-ch.svg'
    AND NOT EXISTS (
      SELECT 1 FROM `catalog_entries` WHERE `id` = 884
    )
    AND NOT EXISTS (
      SELECT 1
      FROM `category_us_vendors`
      WHERE `entry_id` IN (884, 903)
         OR LOWER(TRIM(`raw_name`)) = 'doodle'
    )
    AND NOT EXISTS (
      SELECT 1
      FROM `us_vendor_aliases`
      WHERE `entry_id` IN (884, 903)
         OR LOWER(TRIM(`alias`)) = 'doodle'
    )
    AND NOT EXISTS (
      SELECT 1
      FROM `entry_replacements`
      WHERE LOWER(TRIM(`raw_name`)) = 'doodle'
         OR `entry_id` = 884
         OR (`entry_id` = 903 AND `replaced_entry_id` = 903)
         OR `replaced_entry_id` = 884
    )
    AND EXISTS (
      SELECT 1
      FROM `entry_replacements`
      WHERE `id` = 847
        AND `entry_id` = 903
        AND `raw_name` = 'Calendly'
        AND `replaced_entry_id` = 640
        AND `sort_order` = 0
    )
    AND (
      SELECT COUNT(*) FROM `entry_categories` WHERE `entry_id` = 903
    ) = 1
    AND (
      SELECT COUNT(*) FROM `entry_tags` WHERE `entry_id` = 903
    ) = 4
    AND (
      SELECT COUNT(*) FROM `matrix_facts` WHERE `entry_id` = 903
    ) = 41
    AND (
      SELECT COUNT(*) FROM `positive_signals` WHERE `entry_id` = 903
    ) = 5
    AND (
      SELECT COUNT(*) FROM `reservations` WHERE `entry_id` = 903
    ) = 6
    AND (
      SELECT COUNT(*) FROM `scoring_metadata` WHERE `entry_id` = 903
    ) = 1
);

DROP TEMPORARY TABLE IF EXISTS `_dedupe_doodle_assert`;
CREATE TEMPORARY TABLE `_dedupe_doodle_assert` (
  `singleton` TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (`singleton`)
);
INSERT INTO `_dedupe_doodle_assert` (`singleton`) VALUES (1);
-- A second singleton row is attempted only when neither exact allowed state
-- matches. The duplicate-key error aborts the transaction instead of recording
-- a migration against unexpected data.
INSERT INTO `_dedupe_doodle_assert` (`singleton`)
SELECT 1
WHERE COALESCE(@doodle_initial_state, 0)
    + COALESCE(@doodle_final_state, 0) <> 1;

SET @doodle_should_merge = COALESCE(@doodle_initial_state, 0);

-- Doodle is Swiss, so do not preserve or rewire relations whose schema means
-- "US comparison product".
DELETE FROM `entry_replacements`
WHERE `id` = 836
  AND `entry_id` = 883
  AND `raw_name` = 'Doodle'
  AND `replaced_entry_id` = 884
  AND `sort_order` = 1
  AND @doodle_should_merge = 1;

DELETE FROM `us_vendor_aliases`
WHERE `id` = 281
  AND `alias` = 'Doodle'
  AND `entry_id` = 884
  AND @doodle_should_merge = 1;

-- Remove only the empty, misclassified source row. The relation guard above
-- proves no other child row can be lost through ON DELETE behavior.
DELETE FROM `catalog_entries`
WHERE `id` = 884
  AND `slug` = 'doodle'
  AND `status` = 'us'
  AND `source_file` = ''
  AND `is_active` = 1
  AND `country_code` = 'us'
  AND `website_url` IS NULL
  AND `description_en` IS NULL
  AND @doodle_should_merge = 1;

-- Keep rich row id 903 and all of its dependent data. Only claim the product's
-- concise canonical slug after the conflicting placeholder has been removed.
UPDATE `catalog_entries`
SET `slug` = 'doodle'
WHERE `id` = 903
  AND `slug` = 'doodle-ch'
  AND `status` = 'alternative'
  AND `source_file` = 'research'
  AND `is_active` = 1
  AND `country_code` = 'ch'
  AND `website_url` = 'https://doodle.com/'
  AND `logo_path` = '/logos/doodle-ch.svg'
  AND @doodle_should_merge = 1;

-- Re-read the complete required state after the conditional DML. This catches
-- a zero-row or partial mutation (for example, because a trigger or concurrent
-- change invalidated an exact predicate) before the version can be recorded.
-- The same assertion succeeds on a legitimate idempotent final-state re-run.
SET @doodle_post_state = (
  SELECT COUNT(*) = 1
  FROM `catalog_entries` canonical
  WHERE canonical.`id` = 903
    AND canonical.`slug` = 'doodle'
    AND canonical.`status` = 'alternative'
    AND canonical.`source_file` = 'research'
    AND canonical.`is_active` = 1
    AND canonical.`name` = 'Doodle'
    AND canonical.`country_code` = 'ch'
    AND canonical.`website_url` = 'https://doodle.com/'
    AND canonical.`logo_path` = '/logos/doodle-ch.svg'
    AND NOT EXISTS (
      SELECT 1 FROM `catalog_entries` WHERE `id` = 884
    )
    AND NOT EXISTS (
      SELECT 1
      FROM `category_us_vendors`
      WHERE `entry_id` IN (884, 903)
         OR LOWER(TRIM(`raw_name`)) = 'doodle'
    )
    AND NOT EXISTS (
      SELECT 1
      FROM `us_vendor_aliases`
      WHERE `entry_id` IN (884, 903)
         OR LOWER(TRIM(`alias`)) = 'doodle'
    )
    AND NOT EXISTS (
      SELECT 1
      FROM `entry_replacements`
      WHERE LOWER(TRIM(`raw_name`)) = 'doodle'
         OR `entry_id` = 884
         OR (`entry_id` = 903 AND `replaced_entry_id` = 903)
         OR `replaced_entry_id` = 884
    )
    AND EXISTS (
      SELECT 1
      FROM `entry_replacements`
      WHERE `id` = 847
        AND `entry_id` = 903
        AND `raw_name` = 'Calendly'
        AND `replaced_entry_id` = 640
        AND `sort_order` = 0
    )
    AND (
      SELECT COUNT(*) FROM `entry_categories` WHERE `entry_id` = 903
    ) = 1
    AND (
      SELECT COUNT(*) FROM `entry_tags` WHERE `entry_id` = 903
    ) = 4
    AND (
      SELECT COUNT(*) FROM `matrix_facts` WHERE `entry_id` = 903
    ) = 41
    AND (
      SELECT COUNT(*) FROM `positive_signals` WHERE `entry_id` = 903
    ) = 5
    AND (
      SELECT COUNT(*) FROM `reservations` WHERE `entry_id` = 903
    ) = 6
    AND (
      SELECT COUNT(*) FROM `scoring_metadata` WHERE `entry_id` = 903
    ) = 1
);

INSERT INTO `_dedupe_doodle_assert` (`singleton`)
SELECT 1
WHERE COALESCE(@doodle_post_state, 0) <> 1;

INSERT INTO `schema_migrations` (`version`)
VALUES ('092-dedupe-doodle')
ON DUPLICATE KEY UPDATE `version` = VALUES(`version`);

DROP TEMPORARY TABLE IF EXISTS `_dedupe_doodle_assert`;

COMMIT;
