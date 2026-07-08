-- Migration 081: Revert dark-theme-safe logo variants back to their plain
-- (dark/coloured) SVG siblings.
--
-- Migration 080 swapped 31 low-contrast logos to pale `*-dark-safe.png` variants
-- so they would show on the dark logo chip (which used the theme-flipping
-- `var(--bg-secondary)`). The card logo chip is now a constant light background
-- (see `.alt-card-logo` in src/index.css), so the pale variants would instead be
-- invisible while the original dark/coloured SVGs read correctly. Point each of
-- the 31 entries back at its plain `/logos/<slug>.svg` sibling.
--
-- This migration is coupled to the constant-light-chip CSS change and must ship
-- together with it. The `*-dark-safe.png` assets are intentionally left in place
-- (still referenced by migration 080's history / test) but are no longer used.

UPDATE `catalog_entries`
SET `logo_path` = CASE `slug`
  WHEN 'bluecode' THEN '/logos/bluecode.svg'
  WHEN 'collabora-online' THEN '/logos/collabora-online.svg'
  WHEN 'deepl' THEN '/logos/deepl.svg'
  WHEN 'disroot' THEN '/logos/disroot.svg'
  WHEN 'duplicati' THEN '/logos/duplicati.svg'
  WHEN 'filen' THEN '/logos/filen.svg'
  WHEN 'freebsd' THEN '/logos/freebsd.svg'
  WHEN 'gnu-taler' THEN '/logos/gnu-taler.svg'
  WHEN 'hedgedoc' THEN '/logos/hedgedoc.svg'
  WHEN 'hostinger' THEN '/logos/hostinger.svg'
  WHEN 'internxt' THEN '/logos/internxt.svg'
  WHEN 'ionos' THEN '/logos/ionos.svg'
  WHEN 'matomo' THEN '/logos/matomo.svg'
  WHEN 'mattermost' THEN '/logos/mattermost.svg'
  WHEN 'mullvad-browser' THEN '/logos/mullvad-browser.svg'
  WHEN 'mullvad-vpn' THEN '/logos/mullvad-vpn.svg'
  WHEN 'netcup' THEN '/logos/netcup.svg'
  WHEN 'opencloud' THEN '/logos/opencloud.svg'
  WHEN 'opensearch' THEN '/logos/opensearch.svg'
  WHEN 'organic-maps' THEN '/logos/organic-maps.svg'
  WHEN 'ovhcloud' THEN '/logos/ovhcloud.svg'
  WHEN 'paperless-ngx' THEN '/logos/paperless-ngx.svg'
  WHEN 'pexip' THEN '/logos/pexip.svg'
  WHEN 'piper' THEN '/logos/piper.svg'
  WHEN 'qobuz' THEN '/logos/qobuz.svg'
  WHEN 'sailfish-os' THEN '/logos/sailfish-os.svg'
  WHEN 'scaleway' THEN '/logos/scaleway.svg'
  WHEN 'tor-browser' THEN '/logos/tor-browser.svg'
  WHEN 'tuta' THEN '/logos/tuta.svg'
  WHEN 'xmpp' THEN '/logos/xmpp.svg'
  WHEN 'zen-browser' THEN '/logos/zen-browser.svg'
  ELSE `logo_path`
END
WHERE `slug` IN (
  'bluecode',
  'collabora-online',
  'deepl',
  'disroot',
  'duplicati',
  'filen',
  'freebsd',
  'gnu-taler',
  'hedgedoc',
  'hostinger',
  'internxt',
  'ionos',
  'matomo',
  'mattermost',
  'mullvad-browser',
  'mullvad-vpn',
  'netcup',
  'opencloud',
  'opensearch',
  'organic-maps',
  'ovhcloud',
  'paperless-ngx',
  'pexip',
  'piper',
  'qobuz',
  'sailfish-os',
  'scaleway',
  'tor-browser',
  'tuta',
  'xmpp',
  'zen-browser'
);

INSERT INTO `schema_migrations` (`version`)
VALUES ('081-revert-dark-safe-logos-for-light-chip')
ON DUPLICATE KEY UPDATE `version` = VALUES(`version`);
