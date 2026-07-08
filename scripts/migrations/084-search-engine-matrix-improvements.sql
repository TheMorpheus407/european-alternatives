-- Migration 084: Improve the Search Engine category matrix.
--
-- Mirrors how email was handled (008 criteria init, 082 coverage flip):
--
--   Part A - Put reviewed search-engine presence-list multi-enums into
--            `display_mode = 'coverage'` so every option renders as supported
--            (green / amber for a tradeoff option) or absent (red), instead of
--            only showing the options an entry HAS. Migration 010 created these
--            as plain multi-enums, so their cells never showed what is missing.
--            Deliberately NOT flipping `best_query_types` or `fit_profiles`:
--            those are summary/fit lists that would become red-heavy noise
--            under coverage.
--
--   Part B - Add two new criteria to existing groups (options + open facts),
--            following the 008 `INSERT IGNORE ... SELECT ... JOIN` pattern:
--            `data_processing_region` (Privacy & Personalization) and
--            `bang_shortcuts` (Query Controls).
--
-- Idempotent: INSERT IGNORE for criteria/options/facts and a constrained
-- UPDATE; safe to re-run.

-- Part A: coverage flips for reviewed search-engine presence lists.
UPDATE `matrix_criteria`
SET `display_mode` = 'coverage'
WHERE `value_type` = 'multi_enum'
  AND `category_id` = 'search-engine'
  AND `criterion_key` IN (
    'upstream_result_sources',
    'result_freshness_controls',
    'regional_language_controls',
    'advanced_search_operators',
    'search_filter_controls',
    'ranking_customization',
    'spelling_query_assistance',
    'vertical_search_types',
    'image_search_filters',
    'news_search_controls',
    'multimedia_search_controls',
    'non_ai_instant_answers',
    'access_paths',
    'result_transparency_signals'
  );

-- Part B: new criteria attached to existing search-engine groups.
INSERT IGNORE INTO `matrix_criteria`
  (`category_id`, `group_id`, `criterion_key`, `label_en`, `label_de`, `value_type`, `semantics`, `filter_mode`, `sort_order`, `help_text_en`, `help_text_de`)
SELECT d.category_id, g.id, d.criterion_key, d.label_en, d.label_de, d.value_type, d.semantics, d.filter_mode, d.sort_order, d.help_text_en, d.help_text_de
FROM (
  SELECT 'search-engine' AS category_id, 'privacy_personalization' AS group_key, 'data_processing_region' AS criterion_key, 'Query/data processing region' AS label_en, 'Region der Anfrage- und Datenverarbeitung' AS label_de, 'enum' AS value_type, 'tradeoff' AS semantics, 'must_match' AS filter_mode, 2070 AS sort_order, 'Where the service processes search queries and the jurisdiction it operates under, central to the EU-alternative case.' AS help_text_en, 'Wo der Dienst Suchanfragen verarbeitet und unter welcher Rechtsordnung er betrieben wird, was für den Gedanken einer EU-Alternative zentral ist.' AS help_text_de
  UNION ALL SELECT 'search-engine', 'query_controls', 'bang_shortcuts', 'Bang / shortcut commands', 'Bang-/Shortcut-Befehle', 'boolean', 'beneficial', 'optional', 3060, 'DuckDuckGo-style !bang shortcuts that jump directly to a search on another site.', '!bang-Kurzbefehle nach Art von DuckDuckGo, die direkt zu einer Suche auf einer anderen Website springen.'
) AS d
JOIN `matrix_criterion_groups` g
  ON g.category_id = d.category_id
 AND g.group_key = d.group_key;

INSERT IGNORE INTO `matrix_criterion_options`
  (`criterion_id`, `option_key`, `label_en`, `label_de`, `display_tone`, `sort_order`)
SELECT mc.id, d.option_key, d.label_en, d.label_de, d.display_tone, d.sort_order
FROM (
  SELECT 'search-engine' AS category_id, 'data_processing_region' AS criterion_key, 'eu_only' AS option_key, 'EU-only processing' AS label_en, 'Verarbeitung nur in der EU' AS label_de, 'positive' AS display_tone, 10 AS sort_order
  UNION ALL SELECT 'search-engine', 'data_processing_region', 'user_selectable_region', 'User-selectable region', 'Nutzerwählbare Region', 'positive', 20
  UNION ALL SELECT 'search-engine', 'data_processing_region', 'self_hosted', 'Self-hosted / user-controlled', 'Selbstgehostet / nutzerkontrolliert', 'positive', 30
  UNION ALL SELECT 'search-engine', 'data_processing_region', 'provider_selected', 'Provider-selected region', 'Anbietergewählte Region', 'neutral', 40
  UNION ALL SELECT 'search-engine', 'data_processing_region', 'global_or_mixed', 'Global or mixed regions', 'Globale oder gemischte Regionen', 'tradeoff', 50
  UNION ALL SELECT 'search-engine', 'data_processing_region', 'non_eu', 'Non-EU processing', 'Verarbeitung außerhalb der EU', 'tradeoff', 60
  UNION ALL SELECT 'search-engine', 'data_processing_region', 'unclear', 'Unclear', 'Unklar', 'warning', 70
) AS d
JOIN `matrix_criteria` mc
  ON mc.category_id = d.category_id
 AND mc.criterion_key = d.criterion_key;

INSERT IGNORE INTO `matrix_facts` (`entry_id`, `category_id`, `criterion_id`, `status`)
SELECT ce.id, 'search-engine', mc.id, 'open'
FROM `catalog_entries` ce
JOIN `entry_categories` ec
  ON ec.entry_id = ce.id
 AND ec.category_id = 'search-engine'
JOIN `matrix_criteria` mc
  ON mc.category_id = 'search-engine'
 AND mc.criterion_key = 'data_processing_region'
WHERE ce.`status` = 'alternative'
  AND ce.is_active = 1;

INSERT IGNORE INTO `matrix_facts` (`entry_id`, `category_id`, `criterion_id`, `status`)
SELECT ce.id, 'search-engine', mc.id, 'open'
FROM `catalog_entries` ce
JOIN `entry_categories` ec
  ON ec.entry_id = ce.id
 AND ec.category_id = 'search-engine'
JOIN `matrix_criteria` mc
  ON mc.category_id = 'search-engine'
 AND mc.criterion_key = 'bang_shortcuts'
WHERE ce.`status` = 'alternative'
  AND ce.is_active = 1;

INSERT INTO `schema_migrations` (`version`)
VALUES ('084-search-engine-matrix-improvements');
