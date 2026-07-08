-- Migration 086: Improve the Cloud Storage matrix.
--
-- Part A flips the reviewed cloud-storage presence-list multi-enums into
-- `display_mode = 'coverage'`, mirroring migration 082 for email/messaging. In
-- coverage mode every option renders supported (green / amber for a tradeoff
-- option) or absent (red), so a cell shows what a service is missing instead of
-- only the options it has.
--
-- Part B adds two decision-relevant enum criteria that migration 007 did not
-- cover: a headline pricing model (Storage & Plans) and sync efficiency, i.e.
-- whether the client transfers only changed blocks/deltas (Sync & Access).
--
-- Existing option tones are deliberately left untouched.

-- Part A --------------------------------------------------------------------
-- Flip reviewed presence-list multi-enums to coverage display mode.

UPDATE `matrix_criteria`
SET `display_mode` = 'coverage'
WHERE `value_type` = 'multi_enum'
  AND `category_id` = 'cloud-storage'
  AND `criterion_key` IN (
    'link_access_controls',
    'ransomware_protection',
    'compliance_profiles',
    'open_protocol_access',
    'migration_import_sources',
    'role_permissions',
    'sharing_policy_controls',
    'integration_support'
  );

-- Part B --------------------------------------------------------------------
-- Add the two new enum criteria to their existing groups.

INSERT IGNORE INTO `matrix_criteria`
  (`category_id`, `group_id`, `criterion_key`, `label_en`, `label_de`, `value_type`, `semantics`, `filter_mode`, `sort_order`, `help_text_en`, `help_text_de`)
SELECT d.category_id, g.id, d.criterion_key, d.label_en, d.label_de, d.value_type, d.semantics, d.filter_mode, d.sort_order, d.help_text_en, d.help_text_de
FROM (
  SELECT 'cloud-storage' AS category_id, 'storage_plans' AS group_key, 'pricing_model' AS criterion_key, 'Pricing model' AS label_en, 'Preismodell' AS label_de, 'enum' AS value_type, 'tradeoff' AS semantics, 'optional' AS filter_mode, 1070 AS sort_order, 'How the service charges for storage, usage, or infrastructure — a primary decision filter.' AS help_text_en, 'Wie der Dienst Speicher, Nutzung oder Infrastruktur abrechnet — ein zentrales Entscheidungskriterium.' AS help_text_de
  UNION ALL SELECT 'cloud-storage', 'sync_access', 'sync_efficiency', 'Sync efficiency', 'Sync-Effizienz', 'enum', 'beneficial', 'optional', 2090, 'Whether the sync client transfers only changed blocks or deltas instead of whole files — the daily-use performance differentiator.', 'Ob der Sync-Client nur geänderte Blöcke bzw. Deltas statt ganzer Dateien überträgt — der Leistungsunterschied im täglichen Einsatz.'
) AS d
JOIN `matrix_criterion_groups` g
  ON g.category_id = d.category_id
 AND g.group_key = d.group_key;

INSERT IGNORE INTO `matrix_criterion_options`
  (`criterion_id`, `option_key`, `label_en`, `label_de`, `display_tone`, `sort_order`)
SELECT mc.id, d.option_key, d.label_en, d.label_de, d.display_tone, d.sort_order
FROM (
  SELECT 'cloud-storage' AS category_id, 'pricing_model' AS criterion_key, 'free_and_paid' AS option_key, 'Free tier + paid plans' AS label_en, 'Gratis-Tarif + Bezahltarife' AS label_de, 'neutral' AS display_tone, 10 AS sort_order
  UNION ALL SELECT 'cloud-storage', 'pricing_model', 'flat_tiers', 'Flat storage tiers', 'Feste Speichertarife', 'neutral', 20
  UNION ALL SELECT 'cloud-storage', 'pricing_model', 'one_time_lifetime', 'One-time / lifetime', 'Einmalzahlung / Lebenslang', 'positive', 30
  UNION ALL SELECT 'cloud-storage', 'pricing_model', 'self_hosted_free', 'Self-hosted / open source', 'Selbstgehostet / Open Source', 'positive', 40
  UNION ALL SELECT 'cloud-storage', 'pricing_model', 'per_gb_usage', 'Usage / per-GB billing', 'Nutzung / Abrechnung pro GB', 'tradeoff', 50
  UNION ALL SELECT 'cloud-storage', 'pricing_model', 'per_user_seat', 'Per-user / per-seat', 'Pro Nutzer / pro Platz', 'tradeoff', 60
  UNION ALL SELECT 'cloud-storage', 'sync_efficiency', 'block_level_delta', 'Block-level / delta sync', 'Blockweise / Delta-Sync', 'positive', 10
  UNION ALL SELECT 'cloud-storage', 'sync_efficiency', 'full_file', 'Full-file sync', 'Vollständige Dateisynchronisierung', 'neutral', 20
  UNION ALL SELECT 'cloud-storage', 'sync_efficiency', 'unclear', 'Unclear', 'Unklar', 'neutral', 30
) AS d
JOIN `matrix_criteria` mc
  ON mc.category_id = d.category_id
 AND mc.criterion_key = d.criterion_key;

-- Initialize `open` matrix facts for every active cloud-storage alternative,
-- one INSERT per new criterion (mirrors migration 008).

INSERT IGNORE INTO `matrix_facts` (`entry_id`, `category_id`, `criterion_id`, `status`)
SELECT ce.id, 'cloud-storage', mc.id, 'open'
FROM `catalog_entries` ce
JOIN `entry_categories` ec
  ON ec.entry_id = ce.id
 AND ec.category_id = 'cloud-storage'
JOIN `matrix_criteria` mc
  ON mc.category_id = 'cloud-storage'
 AND mc.criterion_key = 'pricing_model'
WHERE ce.`status` = 'alternative'
  AND ce.is_active = 1;

INSERT IGNORE INTO `matrix_facts` (`entry_id`, `category_id`, `criterion_id`, `status`)
SELECT ce.id, 'cloud-storage', mc.id, 'open'
FROM `catalog_entries` ce
JOIN `entry_categories` ec
  ON ec.entry_id = ce.id
 AND ec.category_id = 'cloud-storage'
JOIN `matrix_criteria` mc
  ON mc.category_id = 'cloud-storage'
 AND mc.criterion_key = 'sync_efficiency'
WHERE ce.`status` = 'alternative'
  AND ce.is_active = 1;

INSERT INTO `schema_migrations` (`version`)
VALUES ('086-cloud-storage-matrix-improvements');
