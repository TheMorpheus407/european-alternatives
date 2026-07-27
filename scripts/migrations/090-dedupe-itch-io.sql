-- Migration 090: Merge the duplicate itch.io catalog rows.
--
-- Official sources (accessed 2026-07-27):
--   https://itch.io/
--   https://itch.io/docs/general/about
--   https://itch.io/app
-- The official site identifies itch.io as one marketplace for independent
-- digital creators, and its app page links the same service to the open-source
-- itch desktop app. Both live catalog rows point to exactly https://itch.io/.
--
-- Live database and public EN/DE API audit on 2026-07-27:
--   * both locales exposed two active US entries named itch.io;
--   * id 969 / `itch-io` is the richer active US row (pricing, partial
--     open-source metadata, source URL, founding year, licence, and two tags);
--   * id 931 / `itch.io` is an older sparse active US duplicate;
--   * both have the same primary `game-stores` membership and the same 37
--     untouched open matrix facts (criterion ids 2819..2855), with no attempts;
--   * neither row has vendor, replacement, alias, trust, scoring, or denial
--     relations.
--
-- Keep the richer, URL-safe `itch-io` row. Preserve the earliest catalog date
-- and materialize its checked-in logo path. The readiness gate encodes the
-- complete audited relation shape. Any state other than the exact initial or
-- exact final state raises a SQL error so later migrations cannot conceal a
-- skipped merge.

START TRANSACTION;

SELECT COUNT(*)
INTO @itch_locked_row_count
FROM `catalog_entries`
WHERE `id` IN (931, 969)
FOR UPDATE;

SET @itch_canonical_id := (
  SELECT `id`
  FROM `catalog_entries`
  WHERE `id` = 969
    AND `slug` = 'itch-io'
    AND `status` = 'us'
    AND `source_file` = 'research'
    AND `is_active` = 1
    AND `retired_at` IS NULL
    AND `date_added` = '2026-06-25'
    AND `name` = 'itch.io'
    AND `description_en` = 'itch.io is an open marketplace and desktop app ecosystem for independent digital creators, focused on hosting, selling, downloading, and updating indie games and other creative software.'
    AND `description_de` IS NULL
    AND `country_code` = 'us'
    AND `website_url` = 'https://itch.io/'
    AND `logo_path` IS NULL
    AND `pricing` = 'freemium'
    AND `is_open_source` = 1
    AND `open_source_level` = 'partial'
    AND `open_source_audit_url` IS NULL
    AND `source_code_url` = 'https://github.com/itchio/itch'
    AND `self_hostable` IS NULL
    AND `founded_year` = 2013
    AND `headquarters_city` IS NULL
    AND `license_text` = 'MIT License'
    AND `action_links_json` IS NULL
  LIMIT 1
);

SET @itch_duplicate_id := (
  SELECT `id`
  FROM `catalog_entries`
  WHERE `id` = 931
    AND `slug` = 'itch.io'
    AND `status` = 'us'
    AND `source_file` = 'research'
    AND `is_active` = 1
    AND `retired_at` IS NULL
    AND `date_added` = '2026-06-12'
    AND `name` = 'itch.io'
    AND `description_en` = 'itch.io is an open marketplace and digital distribution platform for independent video games and other digital creator content.'
    AND `description_de` IS NULL
    AND `country_code` = 'us'
    AND `website_url` = 'https://itch.io/'
    AND `logo_path` = '/logos/itch.io.svg'
    AND `pricing` IS NULL
    AND `is_open_source` IS NULL
    AND `open_source_level` IS NULL
    AND `open_source_audit_url` IS NULL
    AND `source_code_url` IS NULL
    AND `self_hostable` IS NULL
    AND `founded_year` IS NULL
    AND `headquarters_city` IS NULL
    AND `license_text` IS NULL
    AND `action_links_json` IS NULL
  LIMIT 1
);

SET @itch_merge_ready := (
  SELECT CASE WHEN
    @itch_canonical_id = 969
    AND @itch_duplicate_id = 931

    -- Both rows have exactly the same sole primary category.
    AND (
      SELECT COUNT(*)
      FROM `entry_categories`
      WHERE `entry_id` IN (@itch_canonical_id, @itch_duplicate_id)
    ) = 2
    AND (
      SELECT COUNT(*)
      FROM `entry_categories`
      WHERE `entry_id` IN (@itch_canonical_id, @itch_duplicate_id)
        AND `category_id` = 'game-stores'
        AND `is_primary` = 1
        AND `sort_order` = 0
    ) = 2

    -- The richer row owns the only useful tags.
    AND (
      SELECT COUNT(*)
      FROM `entry_tags`
      WHERE `entry_id` = @itch_canonical_id
    ) = 2
    AND (
      SELECT COUNT(*)
      FROM `entry_tags` et
      JOIN `tags` t ON t.`id` = et.`tag_id`
      WHERE et.`entry_id` = @itch_canonical_id
        AND (
          (t.`slug` = 'game-store' AND et.`sort_order` = 0)
          OR (t.`slug` = 'launcher' AND et.`sort_order` = 1)
        )
    ) = 2
    AND NOT EXISTS (
      SELECT 1
      FROM `entry_tags`
      WHERE `entry_id` = @itch_duplicate_id
    )

    -- Each row has the same 37 untouched placeholder facts and no attempts.
    AND (
      SELECT COUNT(*)
      FROM `matrix_facts`
      WHERE `entry_id` = @itch_canonical_id
    ) = 37
    AND (
      SELECT COUNT(*)
      FROM `matrix_facts`
      WHERE `entry_id` = @itch_duplicate_id
    ) = 37
    AND NOT EXISTS (
      SELECT 1
      FROM `matrix_facts`
      WHERE `entry_id` IN (@itch_canonical_id, @itch_duplicate_id)
        AND (
          `category_id` <> 'game-stores'
          OR `criterion_id` NOT BETWEEN 2819 AND 2855
          OR `status` <> 'open'
          OR `value_bool` IS NOT NULL
          OR `value_number` IS NOT NULL
          OR `value_text` IS NOT NULL
          OR `value_json` IS NOT NULL
          OR `public_source_url` IS NOT NULL
          OR `public_source_title` IS NOT NULL
          OR `public_source_accessed_date` IS NOT NULL
          OR `selected_attempt_id` IS NOT NULL
          OR `deeper_research_attempt_count` <> 0
          OR `deeper_research_next_eligible_at` IS NOT NULL
        )
    )
    AND NOT EXISTS (
      SELECT 1
      FROM `matrix_facts` canonical_fact
      LEFT JOIN `matrix_facts` duplicate_fact
        ON duplicate_fact.`entry_id` = @itch_duplicate_id
       AND duplicate_fact.`criterion_id` = canonical_fact.`criterion_id`
      WHERE canonical_fact.`entry_id` = @itch_canonical_id
        AND duplicate_fact.`id` IS NULL
    )
    AND NOT EXISTS (
      SELECT 1
      FROM `matrix_fact_attempts` attempt
      JOIN `matrix_facts` fact ON fact.`id` = attempt.`fact_id`
      WHERE fact.`entry_id` IN (@itch_canonical_id, @itch_duplicate_id)
    )

    -- Every other direct catalog-entry relation was audited as empty.
    AND NOT EXISTS (
      SELECT 1 FROM `category_us_vendors`
      WHERE `entry_id` IN (@itch_canonical_id, @itch_duplicate_id)
    )
    AND NOT EXISTS (
      SELECT 1 FROM `entry_replacements`
      WHERE `entry_id` IN (@itch_canonical_id, @itch_duplicate_id)
         OR `replaced_entry_id` IN (@itch_canonical_id, @itch_duplicate_id)
    )
    AND NOT EXISTS (
      SELECT 1 FROM `us_vendor_aliases`
      WHERE `entry_id` IN (@itch_canonical_id, @itch_duplicate_id)
    )
    AND NOT EXISTS (
      SELECT 1 FROM `reservations`
      WHERE `entry_id` IN (@itch_canonical_id, @itch_duplicate_id)
    )
    AND NOT EXISTS (
      SELECT 1 FROM `positive_signals`
      WHERE `entry_id` IN (@itch_canonical_id, @itch_duplicate_id)
    )
    AND NOT EXISTS (
      SELECT 1 FROM `scoring_metadata`
      WHERE `entry_id` IN (@itch_canonical_id, @itch_duplicate_id)
    )
    AND NOT EXISTS (
      SELECT 1 FROM `denied_decisions`
      WHERE `entry_id` IN (@itch_canonical_id, @itch_duplicate_id)
    )
  THEN 1 ELSE 0 END
);

SET @itch_final_state := (
  SELECT COUNT(*) = 1
  FROM `catalog_entries` canonical
  WHERE canonical.`id` = 969
    AND canonical.`slug` = 'itch-io'
    AND canonical.`status` = 'us'
    AND canonical.`source_file` = 'research'
    AND canonical.`is_active` = 1
    AND canonical.`retired_at` IS NULL
    AND canonical.`date_added` = '2026-06-12'
    AND canonical.`name` = 'itch.io'
    AND canonical.`description_en` = 'itch.io is an open marketplace and desktop app ecosystem for independent digital creators, focused on hosting, selling, downloading, and updating indie games and other creative software.'
    AND canonical.`description_de` IS NULL
    AND canonical.`country_code` = 'us'
    AND canonical.`website_url` = 'https://itch.io/'
    AND canonical.`logo_path` = '/logos/itch-io.svg'
    AND canonical.`pricing` = 'freemium'
    AND canonical.`is_open_source` = 1
    AND canonical.`open_source_level` = 'partial'
    AND canonical.`open_source_audit_url` IS NULL
    AND canonical.`source_code_url` = 'https://github.com/itchio/itch'
    AND canonical.`self_hostable` IS NULL
    AND canonical.`founded_year` = 2013
    AND canonical.`headquarters_city` IS NULL
    AND canonical.`license_text` = 'MIT License'
    AND canonical.`action_links_json` IS NULL
    AND NOT EXISTS (
      SELECT 1
      FROM `catalog_entries`
      WHERE `id` = 931
         OR `slug` = 'itch.io'
    )
    AND (
      SELECT COUNT(*)
      FROM `catalog_entries`
      WHERE `status` = 'us'
        AND `is_active` = 1
        AND `website_url` = 'https://itch.io/'
    ) = 1
    AND (
      SELECT COUNT(*)
      FROM `entry_categories`
      WHERE `entry_id` = 969
    ) = 1
    AND EXISTS (
      SELECT 1
      FROM `entry_categories`
      WHERE `entry_id` = 969
        AND `category_id` = 'game-stores'
        AND `is_primary` = 1
        AND `sort_order` = 0
    )
    AND (
      SELECT COUNT(*)
      FROM `entry_tags`
      WHERE `entry_id` = 969
    ) = 2
    AND (
      SELECT COUNT(*)
      FROM `entry_tags` et
      JOIN `tags` t ON t.`id` = et.`tag_id`
      WHERE et.`entry_id` = 969
        AND (
          (t.`slug` = 'game-store' AND et.`sort_order` = 0)
          OR (t.`slug` = 'launcher' AND et.`sort_order` = 1)
        )
    ) = 2
    AND (
      SELECT COUNT(*)
      FROM `matrix_facts`
      WHERE `entry_id` = 969
    ) = 37
    AND NOT EXISTS (
      SELECT 1
      FROM `matrix_facts`
      WHERE `entry_id` = 969
        AND (
          `category_id` <> 'game-stores'
          OR `criterion_id` NOT BETWEEN 2819 AND 2855
          OR `status` <> 'open'
          OR `value_bool` IS NOT NULL
          OR `value_number` IS NOT NULL
          OR `value_text` IS NOT NULL
          OR `value_json` IS NOT NULL
          OR `public_source_url` IS NOT NULL
          OR `public_source_title` IS NOT NULL
          OR `public_source_accessed_date` IS NOT NULL
          OR `selected_attempt_id` IS NOT NULL
          OR `deeper_research_attempt_count` <> 0
          OR `deeper_research_next_eligible_at` IS NOT NULL
        )
    )
    AND NOT EXISTS (
      SELECT 1
      FROM `matrix_fact_attempts` attempt
      JOIN `matrix_facts` fact ON fact.`id` = attempt.`fact_id`
      WHERE fact.`entry_id` = 969
    )
    AND NOT EXISTS (
      SELECT 1 FROM `category_us_vendors`
      WHERE `entry_id` IN (931, 969)
    )
    AND NOT EXISTS (
      SELECT 1 FROM `entry_replacements`
      WHERE `entry_id` IN (931, 969)
         OR `replaced_entry_id` IN (931, 969)
    )
    AND NOT EXISTS (
      SELECT 1 FROM `us_vendor_aliases`
      WHERE `entry_id` IN (931, 969)
    )
    AND NOT EXISTS (
      SELECT 1 FROM `reservations`
      WHERE `entry_id` IN (931, 969)
    )
    AND NOT EXISTS (
      SELECT 1 FROM `positive_signals`
      WHERE `entry_id` IN (931, 969)
    )
    AND NOT EXISTS (
      SELECT 1 FROM `scoring_metadata`
      WHERE `entry_id` IN (931, 969)
    )
    AND NOT EXISTS (
      SELECT 1 FROM `denied_decisions`
      WHERE `entry_id` IN (931, 969)
    )
);

DROP TEMPORARY TABLE IF EXISTS `_dedupe_itch_io_assert`;
CREATE TEMPORARY TABLE `_dedupe_itch_io_assert` (
  `singleton` TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (`singleton`)
);
INSERT INTO `_dedupe_itch_io_assert` (`singleton`) VALUES (1);
-- Abort the migration on drift. A SQL error prevents later migrations such as
-- 093 from consuming an initial-state precondition after a skipped merge.
INSERT INTO `_dedupe_itch_io_assert` (`singleton`)
SELECT 1
WHERE COALESCE(@itch_merge_ready, 0)
    + COALESCE(@itch_final_state, 0) <> 1;

SET @itch_should_merge := COALESCE(@itch_merge_ready, 0);

-- Preserve the original catalog history and use the richer row's matching,
-- checked-in logo. All other useful fields already live on the canonical row.
UPDATE `catalog_entries`
SET
  `date_added` = '2026-06-12',
  `logo_path` = '/logos/itch-io.svg'
WHERE `id` = @itch_canonical_id
  AND `slug` = 'itch-io'
  AND @itch_should_merge = 1;
SET @itch_updated_row_count := ROW_COUNT();

-- The discarded facts are exact empty duplicates of the canonical fact set.
DELETE FROM `matrix_facts`
WHERE `entry_id` = @itch_duplicate_id
  AND @itch_should_merge = 1;
SET @itch_deleted_fact_count := ROW_COUNT();

-- Remove the now-unreferenced duplicate membership, retaining id 969's copy.
DELETE FROM `entry_categories`
WHERE `entry_id` = @itch_duplicate_id
  AND `category_id` = 'game-stores'
  AND `is_primary` = 1
  AND `sort_order` = 0
  AND @itch_should_merge = 1;
SET @itch_deleted_category_count := ROW_COUNT();

-- Delete exactly the sparse duplicate only after every FK-bearing table is
-- empty for it. This prevents ON DELETE rules from hiding unexpected data.
DELETE duplicate_entry
FROM `catalog_entries` duplicate_entry
WHERE duplicate_entry.`id` = @itch_duplicate_id
  AND duplicate_entry.`slug` = 'itch.io'
  AND @itch_should_merge = 1
  AND NOT EXISTS (
    SELECT 1 FROM `entry_categories`
    WHERE `entry_id` = @itch_duplicate_id
  )
  AND NOT EXISTS (
    SELECT 1 FROM `matrix_facts`
    WHERE `entry_id` = @itch_duplicate_id
  )
  AND NOT EXISTS (
    SELECT 1 FROM `entry_tags`
    WHERE `entry_id` = @itch_duplicate_id
  )
  AND NOT EXISTS (
    SELECT 1 FROM `category_us_vendors`
    WHERE `entry_id` = @itch_duplicate_id
  )
  AND NOT EXISTS (
    SELECT 1 FROM `entry_replacements`
    WHERE `entry_id` = @itch_duplicate_id
       OR `replaced_entry_id` = @itch_duplicate_id
  )
  AND NOT EXISTS (
    SELECT 1 FROM `us_vendor_aliases`
    WHERE `entry_id` = @itch_duplicate_id
  )
  AND NOT EXISTS (
    SELECT 1 FROM `reservations`
    WHERE `entry_id` = @itch_duplicate_id
  )
  AND NOT EXISTS (
    SELECT 1 FROM `positive_signals`
    WHERE `entry_id` = @itch_duplicate_id
  )
  AND NOT EXISTS (
    SELECT 1 FROM `scoring_metadata`
    WHERE `entry_id` = @itch_duplicate_id
  )
  AND NOT EXISTS (
    SELECT 1 FROM `denied_decisions`
    WHERE `entry_id` = @itch_duplicate_id
  );
SET @itch_deleted_entry_count := ROW_COUNT();

-- An exact already-merged state is a valid rerun. For a fresh merge, the
-- affected-row counts prove that every intended mutation occurred from the
-- strictly audited initial state before the version can be recorded.
SET @itch_merge_completed := (
  SELECT CASE
    WHEN @itch_should_merge = 0
      THEN COALESCE(@itch_final_state, 0)
    WHEN @itch_updated_row_count = 1
      AND @itch_deleted_fact_count = 37
      AND @itch_deleted_category_count = 1
      AND @itch_deleted_entry_count = 1
      AND EXISTS (
        SELECT 1
        FROM `catalog_entries`
        WHERE `id` = 969
          AND `slug` = 'itch-io'
          AND `status` = 'us'
          AND `is_active` = 1
          AND `website_url` = 'https://itch.io/'
          AND `date_added` = '2026-06-12'
          AND `logo_path` = '/logos/itch-io.svg'
      )
      AND NOT EXISTS (
        SELECT 1
        FROM `catalog_entries`
        WHERE `id` = 931
           OR `slug` = 'itch.io'
      )
      THEN 1
    ELSE 0
  END
);

INSERT INTO `_dedupe_itch_io_assert` (`singleton`)
SELECT 1
WHERE COALESCE(@itch_merge_completed, 0) <> 1;

INSERT INTO `schema_migrations` (`version`)
VALUES ('090-dedupe-itch-io')
ON DUPLICATE KEY UPDATE `version` = VALUES(`version`);

DROP TEMPORARY TABLE IF EXISTS `_dedupe_itch_io_assert`;

COMMIT;
