-- Migration 093: Persist logo paths for catalog rows backed by local assets.
--
-- The entries and entry APIs previously fabricated `/logos/<slug>.svg` for a
-- NULL `logo_path`. That made the API advertise files that were not guaranteed
-- to exist and hid incomplete catalog data. These are the exact NULL-path rows
-- audited when the corresponding local SVG assets were added.
--
-- Keep the update deliberately narrow:
--   * never overwrite a path populated before this migration runs;
--   * require the audited status and activity state for each slug group; and
--   * leave future NULL rows NULL so clients can render their normal fallback.

START TRANSACTION;

UPDATE `catalog_entries`
SET `logo_path` = CONCAT('/logos/', `slug`, '.svg')
WHERE `logo_path` IS NULL
  AND (
    (
      `status` = 'alternative'
      AND `is_active` = 1
      AND `slug` IN (
        'agora-cosmica',
        'argos-translate',
        'artfol',
        'asyntai',
        'buddy',
        'bulwark-webmail',
        'captchaapi.eu',
        'clesk-uptime',
        'codecks',
        'deezer',
        'degoog',
        'deutschlandgpt',
        'euro-office',
        'eusend',
        'faugus-launcher',
        'fotocommunity',
        'friv',
        'gamex-games',
        'glitchtip',
        'habicht-ai',
        'heimdall',
        'hilbertraum',
        'hydra-launcher',
        'irys',
        'kanidm',
        'keytrace',
        'maptoolkit',
        'melious-ai',
        'murena-workspace',
        'nebula',
        0x6F65666669,
        'ohhi',
        'oshu',
        'oxid-eshop',
        'paas.build',
        'parsehawk',
        'rare',
        'rethinkdns',
        'retroachievements',
        'sifa-id',
        'silex',
        'silverbullet',
        'softmaker-office-2024',
        'stammhausplus',
        'tangled',
        'the-wolfs-stash',
        'tymeslot',
        'upscrolled',
        'viewbook',
        'weasyl',
        'websidian',
        'whisper-web',
        'zeiterfassungplus'
      )
    )
    OR (
      `status` = 'us'
      AND `is_active` = 1
      AND `slug` IN (
        'bluehost',
        'character-ai',
        'chatbase',
        'cloudflare-turnstile',
        'deviantart',
        'drift',
        'epic-games-launcher',
        'flickr',
        'google-document-ai',
        'google-recaptcha',
        'hcaptcha',
        'intercom',
        'itch-io',
        'keybase',
        'lemon-squeezy',
        'newgrounds',
        'otter.ai',
        'pingdom',
        'sentry',
        'squarespace',
        'tailscale',
        'tawk-to',
        'webflow',
        'wix',
        'wordpress-com',
        'wp-engine',
        'zendesk'
      )
    )
    OR (
      `status` = 'denied'
      AND `is_active` = 0
      AND `slug` IN (
        'affine',
        'anki',
        'brave-browser',
        'calyxos',
        'crdroid',
        'cryptostorm',
        'currents',
        'deepdna',
        'docufluxia',
        'flute-cms',
        'free-games-utopia',
        'ginlo-private',
        'gitlab',
        'hubitat-elevation',
        'hugging-face',
        'kagi',
        'mammouth-ai',
        'not-doppler',
        'obsidian',
        'onlyoffice',
        'pangolin',
        'peggy',
        'pixiv',
        'sheezy-art',
        'skunkyart',
        'solaar',
        'startpage',
        'thaura'
      )
    )
  );

INSERT INTO `schema_migrations` (`version`)
VALUES ('093-materialize-catalog-logo-paths')
ON DUPLICATE KEY UPDATE `version` = VALUES(`version`);

COMMIT;
