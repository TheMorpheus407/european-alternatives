-- Migration 089: Replace kMeet's retired product URL with its current page.
--
-- Official source (accessed 2026-07-27):
--   https://www.infomaniak.com/en/ksuite/kmeet
-- The page identifies itself as Infomaniak's kMeet product page and declares that
-- same URL as canonical. Independent HTTP requests on 2026-07-27 returned
-- 404 for https://www.infomaniak.com/en/kmeet and 200 for the canonical URL.
--
-- Change only the active alternative row while it still has the audited stale
-- URL. Re-running the migration cannot overwrite a later editorial correction.

START TRANSACTION;

UPDATE `catalog_entries`
SET `website_url` = 'https://www.infomaniak.com/en/ksuite/kmeet'
WHERE `slug` = 'kmeet'
  AND `status` = 'alternative'
  AND `is_active` = 1
  AND `website_url` = 'https://www.infomaniak.com/en/kmeet';

INSERT INTO `schema_migrations` (`version`)
VALUES ('089-kmeet-current-website')
ON DUPLICATE KEY UPDATE `version` = VALUES(`version`);

COMMIT;
