-- Migration 083: Improve the Browser category matrix.
--
-- Part A: Put reviewed browser presence-list multi-enums into coverage display
--   mode (mirrors 082 for email). In coverage mode every option renders as
--   supported (green / amber for a tradeoff option) or absent (red), instead of
--   only showing the options an entry HAS. Only genuine, reviewed presence
--   lists are flipped here; long enumeration/summary lists are left as-is.
--
-- Part B: Add two new browser criteria — default_telemetry (Privacy & Tracking)
--   and mobile_extension_support (Extensions & Customization) — each attached to
--   its existing group, with its options and an 'open' matrix_facts row for
--   every active browser alternative (mirrors 008/016).

-- ---------------------------------------------------------------------------
-- Part A — coverage flips for reviewed browser presence lists.
-- ---------------------------------------------------------------------------
UPDATE `matrix_criteria`
SET `display_mode` = 'coverage'
WHERE `value_type` = 'multi_enum'
  AND `category_id` = 'browser'
  AND `criterion_key` IN (
    'built_in_tools',
    'protocol_support',
    'extension_api_compatibility'
  );

-- ---------------------------------------------------------------------------
-- Part B — new browser criteria attached to their existing groups.
-- ---------------------------------------------------------------------------
INSERT IGNORE INTO `matrix_criteria`
  (`category_id`, `group_id`, `criterion_key`, `label_en`, `label_de`, `value_type`, `semantics`, `filter_mode`, `sort_order`, `help_text_en`, `help_text_de`)
SELECT d.category_id, g.id, d.criterion_key, d.label_en, d.label_de, d.value_type, d.semantics, d.filter_mode, d.sort_order, d.help_text_en, d.help_text_de
FROM (
  SELECT 'browser' AS category_id, 'privacy_tracking' AS group_key, 'default_telemetry' AS criterion_key, 'Default telemetry' AS label_en, 'Standard-Telemetrie' AS label_de, 'enum' AS value_type, 'risk' AS semantics, 'optional' AS filter_mode, 2060 AS sort_order, 'What data the browser itself sends back to the vendor by default, before any user configuration.' AS help_text_en, 'Welche Daten der Browser selbst standardmäßig an den Anbieter zurücksendet, bevor Nutzer etwas konfigurieren.' AS help_text_de
  UNION ALL SELECT 'browser', 'extensions_customization', 'mobile_extension_support', 'Mobile extension support', 'Erweiterungsunterstützung auf Mobilgeräten', 'enum', 'beneficial', 'optional', 7050, 'Whether the mobile version of the browser supports add-ons or extensions.', 'Ob die mobile Version des Browsers Add-ons oder Erweiterungen unterstützt.'
) AS d
JOIN `matrix_criterion_groups` g
  ON g.category_id = d.category_id
 AND g.group_key = d.group_key;

INSERT IGNORE INTO `matrix_criterion_options`
  (`criterion_id`, `option_key`, `label_en`, `label_de`, `display_tone`, `sort_order`)
SELECT mc.id, d.option_key, d.label_en, d.label_de, d.display_tone, d.sort_order
FROM (
  SELECT 'browser' AS category_id, 'default_telemetry' AS criterion_key, 'none_or_opt_in' AS option_key, 'No telemetry / opt-in only' AS label_en, 'Keine Telemetrie / nur Opt-in' AS label_de, 'positive' AS display_tone, 10 AS sort_order
  UNION ALL SELECT 'browser', 'default_telemetry', 'anonymous_stats', 'Anonymous usage stats only', 'Nur anonyme Nutzungsstatistiken', 'neutral', 20
  UNION ALL SELECT 'browser', 'default_telemetry', 'on_by_default_opt_out', 'On by default, opt-out available', 'Standardmäßig aktiv, Opt-out möglich', 'tradeoff', 30
  UNION ALL SELECT 'browser', 'default_telemetry', 'on_by_default_sticky', 'On by default, hard to disable', 'Standardmäßig aktiv, schwer zu deaktivieren', 'warning', 40
  UNION ALL SELECT 'browser', 'default_telemetry', 'undocumented', 'Undocumented', 'Nicht dokumentiert', 'negative', 50
  UNION ALL SELECT 'browser', 'mobile_extension_support', 'full', 'Full add-on support', 'Vollständige Add-on-Unterstützung', 'positive', 10
  UNION ALL SELECT 'browser', 'mobile_extension_support', 'curated_limited', 'Curated/limited add-ons', 'Kuratierte/eingeschränkte Add-ons', 'tradeoff', 20
  UNION ALL SELECT 'browser', 'mobile_extension_support', 'none', 'No mobile extensions', 'Keine mobilen Erweiterungen', 'negative', 30
  UNION ALL SELECT 'browser', 'mobile_extension_support', 'no_mobile_app', 'No mobile app', 'Keine mobile App', 'neutral', 40
) AS d
JOIN `matrix_criteria` mc
  ON mc.category_id = d.category_id
 AND mc.criterion_key = d.criterion_key;

-- Initialize matrix_facts 'open' rows for the new default_telemetry criterion.
INSERT IGNORE INTO `matrix_facts` (`entry_id`, `category_id`, `criterion_id`, `status`)
SELECT ce.id, 'browser', mc.id, 'open'
FROM `catalog_entries` ce
JOIN `entry_categories` ec
  ON ec.entry_id = ce.id
 AND ec.category_id = 'browser'
JOIN `matrix_criteria` mc
  ON mc.category_id = 'browser'
 AND mc.criterion_key = 'default_telemetry'
WHERE ce.`status` = 'alternative'
  AND ce.is_active = 1;

-- Initialize matrix_facts 'open' rows for the new mobile_extension_support criterion.
INSERT IGNORE INTO `matrix_facts` (`entry_id`, `category_id`, `criterion_id`, `status`)
SELECT ce.id, 'browser', mc.id, 'open'
FROM `catalog_entries` ce
JOIN `entry_categories` ec
  ON ec.entry_id = ce.id
 AND ec.category_id = 'browser'
JOIN `matrix_criteria` mc
  ON mc.category_id = 'browser'
 AND mc.criterion_key = 'mobile_extension_support'
WHERE ce.`status` = 'alternative'
  AND ce.is_active = 1;

INSERT INTO `schema_migrations` (`version`) VALUES ('083-browser-matrix-improvements');
