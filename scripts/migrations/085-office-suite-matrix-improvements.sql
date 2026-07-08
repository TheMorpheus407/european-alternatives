-- Migration 085: Office Suite matrix improvements.
--
-- Mirrors how the Email matrix (008) and the coverage flip (082) were done.
--
-- Part A: put the reviewed office-suite capability/presence multi-enums into
-- `display_mode = 'coverage'` so every option renders supported (green / amber
-- for a tradeoff option) or absent (red), instead of only showing what an entry
-- HAS in its static per-option tone. `fit_profiles` is deliberately NOT flipped:
-- it is a summary/enumeration list that would become red-heavy noise under
-- coverage.
--
-- Part B: add a `licensing_model` criterion to the Deployment & Administration
-- group. How a suite is licensed and priced is a primary decision filter, so it
-- gets a dedicated enum with reviewed option tones, and `matrix_facts` 'open'
-- rows are seeded for every active alternative in the category (mirroring 008).

-- Part A: coverage flips for reviewed office-suite presence lists.
UPDATE `matrix_criteria`
SET `display_mode` = 'coverage'
WHERE `value_type` = 'multi_enum'
  AND `category_id` = 'office-suite'
  AND `criterion_key` IN (
    'included_editors',
    'pdf_workflow',
    'forms_database_tools',
    'equation_or_scientific_tools',
    'mobile_platforms',
    'legacy_format_support',
    'export_formats',
    'format_fidelity_tools',
    'sharing_link_controls',
    'collaboration_presence',
    'citation_bibliography_tools',
    'advanced_layout_tools',
    'role_access_controls',
    'sharing_security_controls',
    'dlp_retention_controls',
    'developer_api',
    'cloud_storage_integrations',
    'bulk_import_migration',
    'standards_interoperability',
    'language_tools'
  );

-- Part B: new licensing_model criterion in the Deployment & Administration group.
INSERT IGNORE INTO `matrix_criteria`
  (`category_id`, `group_id`, `criterion_key`, `label_en`, `label_de`, `value_type`, `semantics`, `filter_mode`, `sort_order`, `help_text_en`, `help_text_de`)
SELECT d.category_id, g.id, d.criterion_key, d.label_en, d.label_de, d.value_type, d.semantics, d.filter_mode, d.sort_order, d.help_text_en, d.help_text_de
FROM (
  SELECT 'office-suite' AS category_id, 'deployment_admin' AS group_key, 'licensing_model' AS criterion_key, 'Licensing model' AS label_en, 'Lizenzmodell' AS label_de, 'enum' AS value_type, 'tradeoff' AS semantics, 'optional' AS filter_mode, 6080 AS sort_order, 'How the suite is licensed and priced, from free and open source to subscription-only cloud. This is often a primary decision filter.' AS help_text_en, 'Wie das Paket lizenziert und bepreist wird, von frei und quelloffen bis hin zu reinen Cloud-Abonnements. Dies ist häufig ein zentrales Entscheidungskriterium.' AS help_text_de
) AS d
JOIN `matrix_criterion_groups` g
  ON g.category_id = d.category_id
 AND g.group_key = d.group_key;

INSERT IGNORE INTO `matrix_criterion_options`
  (`criterion_id`, `option_key`, `label_en`, `label_de`, `display_tone`, `sort_order`)
SELECT mc.id, d.option_key, d.label_en, d.label_de, d.display_tone, d.sort_order
FROM (
  SELECT 'office-suite' AS category_id, 'licensing_model' AS criterion_key, 'foss' AS option_key, 'Free & open source' AS label_en, 'Frei & quelloffen' AS label_de, 'positive' AS display_tone, 10 AS sort_order
  UNION ALL SELECT 'office-suite', 'licensing_model', 'self_hosted_community', 'Self-hosted / community edition', 'Selbstgehostet / Community-Edition', 'positive', 20
  UNION ALL SELECT 'office-suite', 'licensing_model', 'free_gratis', 'Free (gratis, proprietary)', 'Kostenlos (gratis, proprietär)', 'neutral', 30
  UNION ALL SELECT 'office-suite', 'licensing_model', 'freemium', 'Freemium', 'Freemium', 'neutral', 40
  UNION ALL SELECT 'office-suite', 'licensing_model', 'perpetual_license', 'Perpetual license', 'Dauerlizenz', 'neutral', 50
  UNION ALL SELECT 'office-suite', 'licensing_model', 'per_user_subscription', 'Per-user subscription', 'Abonnement pro Nutzer', 'tradeoff', 60
  UNION ALL SELECT 'office-suite', 'licensing_model', 'subscription_only_cloud', 'Subscription-only cloud', 'Nur-Cloud-Abonnement', 'tradeoff', 70
) AS d
JOIN `matrix_criteria` mc
  ON mc.category_id = d.category_id
 AND mc.criterion_key = d.criterion_key;

INSERT IGNORE INTO `matrix_facts` (`entry_id`, `category_id`, `criterion_id`, `status`)
SELECT ce.id, 'office-suite', mc.id, 'open'
FROM `catalog_entries` ce
JOIN `entry_categories` ec
  ON ec.entry_id = ce.id
 AND ec.category_id = 'office-suite'
JOIN `matrix_criteria` mc
  ON mc.category_id = 'office-suite'
 AND mc.criterion_key = 'licensing_model'
WHERE ce.`status` = 'alternative'
  AND ce.is_active = 1;

INSERT INTO `schema_migrations` (`version`) VALUES ('085-office-suite-matrix-improvements');
