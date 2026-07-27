-- Migration 088: Point fckaf.de Mail at its browser-renderable PNG logo.
--
-- The previous SVG was only a wrapper around a relative PNG reference. Browsers
-- intentionally do not fetch external resources when an SVG is loaded through
-- an <img>, so the catalog card rendered blank. Update only the known affected
-- row and only while it still has the broken path.

UPDATE `catalog_entries`
SET `logo_path` = '/logos/fckaf-de-mail.png'
WHERE `slug` = 'fckaf-de-mail'
  AND `logo_path` = '/logos/fckaf-de-mail.svg';

INSERT INTO `schema_migrations` (`version`)
VALUES ('088-fckaf-de-mail-visible-logo')
ON DUPLICATE KEY UPDATE `version` = VALUES(`version`);
