-- Migration 087: Correct the four logo assets reported in issue #557.
--
-- These cache-busting paths replace a wrong mark (Plankton), a missing asset
-- (insteady), an old raster-wrapped wordmark (Qobuz), and a non-upstream icon
-- (BigBlueButton). Each replacement comes from a first-party source:
--   https://plankton.social/wp-content/uploads/2020/12/cropped-plankton_Symbol_CMYK_b-192x192.jpg
--   https://insteady.net/apple-icon.png
--   https://static.qobuz.com/images/favicon/favicon.svg
--   https://github.com/bigbluebutton/bigbluebutton/blob/ac21de5ddf046036d64592f382121d62b288a563/docs/static/img/logo.svg
-- The Plankton favicon remains a raster image; it is transcoded to a compact
-- 192x192 PNG to discard the source JPEG's unusually large CMYK colour profile.

UPDATE `catalog_entries`
SET `logo_path` = CASE `slug`
  WHEN 'plankton' THEN '/logos/plankton-icon.png'
  WHEN 'insteady' THEN '/logos/insteady-icon.png'
  WHEN 'qobuz' THEN '/logos/qobuz-icon.svg'
  WHEN 'bigbluebutton' THEN '/logos/bigbluebutton-logo.svg'
  ELSE `logo_path`
END
WHERE `slug` IN (
  'plankton',
  'insteady',
  'qobuz',
  'bigbluebutton'
);

INSERT INTO `schema_migrations` (`version`)
VALUES ('087-correct-reported-logo-assets')
ON DUPLICATE KEY UPDATE `version` = VALUES(`version`);
