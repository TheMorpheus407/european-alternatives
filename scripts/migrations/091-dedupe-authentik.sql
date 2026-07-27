-- Migration 091: Merge duplicate authentik rows and correct its jurisdiction.
--
-- Official evidence (accessed 2026-07-27):
--   https://docs.goauthentik.io/developer-docs/docs/style-guide/
--     The official spelling of the product is lowercase `authentik`; the legal
--     company name is Authentik Security, Inc.
--   https://goauthentik.io/legal/terms/
--     Authentik Security Inc. is a Delaware corporation whose principal
--     offices are in Pennsylvania.
--   https://goauthentik.io/legal/privacy-policy
--     The company says it is headquartered in the United States and gives its
--     mailing address in Philadelphia, Pennsylvania.
--   https://docs.goauthentik.io/index.html
--   https://docs.goauthentik.io/developer-docs/contributing/
--     authentik has a free open-source core, while Enterprise features are
--     source-available and explicitly not open source.
--   https://github.com/goauthentik/authentik
--   https://goauthentik.io/blog/2022-11-02-the-next-step-for-authentik/
--     The official repository publishes the self-hosted product, and the
--     founder dates the project to 2018 and describes Authentik Security as
--     the open-core public-benefit company built around it.
--
-- Repository eligibility decision:
--   DECISION_MATRIX.md requires a non-European Tier 2 alternative to be fully
--   open source. A US-operated product with non-open-source Enterprise modules
--   therefore belongs in the US catalog, not the alternatives catalog.
--
-- Live DB and public EN/DE API audit on 2026-07-27:
--   * id 325 / `authentik` is the rich but misclassified alternative. It owns
--     the complete bilingual description, IAM membership, ten tags, 51 empty
--     IAM matrix placeholders, six reservations, twenty positive signals,
--     scoring metadata, and five outgoing US-product replacement claims.
--   * id 881 / `goauthentik` is a sparse US duplicate. It owns the same IAM
--     membership, seven tags, the same 51 untouched matrix placeholders, and
--     one outgoing Auth0 replacement claim.
--   * neither identity has an inbound replacement, US benchmark membership,
--     US alias, denial decision, matrix attempt, or matrix verification.
--
-- Keep id 325 and the official `authentik` slug. Preserve its richer trust and
-- catalog data, merge the two useful missing tags, discard only exact duplicate
-- placeholders, remove outgoing replacement claims that would contradict the
-- final US status, and delete exactly row 881. The initial/final-state
-- assertion makes the migration atomic, fail-closed on drift, and idempotent.

START TRANSACTION;

SELECT COUNT(*)
INTO @authentik_locked_row_count
FROM `catalog_entries`
WHERE `id` IN (325, 881)
FOR UPDATE;

SET @authentik_initial_state = (
  SELECT COUNT(*) = 1
  FROM `catalog_entries` canonical
  JOIN `catalog_entries` duplicate
    ON duplicate.`id` = 881
   AND duplicate.`slug` = 'goauthentik'
   AND duplicate.`status` = 'us'
   AND duplicate.`source_file` = 'research'
   AND duplicate.`is_active` = 1
   AND duplicate.`date_added` = '2026-06-11'
   AND duplicate.`retired_at` IS NULL
   AND duplicate.`name` = 'authentik'
   AND duplicate.`description_en` =
     'authentik is a self-hosted identity provider for modern single sign-on and application access management.'
   AND duplicate.`description_de` IS NULL
   AND duplicate.`country_code` = 'us'
   AND duplicate.`website_url` = 'https://goauthentik.io/'
   AND duplicate.`logo_path` = '/logos/goauthentik.svg'
   AND duplicate.`pricing` = 'freemium'
   AND duplicate.`is_open_source` = 1
   AND duplicate.`open_source_level` = 'partial'
   AND duplicate.`open_source_audit_url` IS NULL
   AND duplicate.`source_code_url` =
     'https://github.com/goauthentik/authentik'
   AND duplicate.`self_hostable` = 1
   AND duplicate.`founded_year` IS NULL
   AND duplicate.`headquarters_city` IS NULL
   AND duplicate.`license_text` IS NULL
   AND duplicate.`action_links_json` IS NULL
   AND duplicate.`created_at` = '2026-06-11 18:44:22'
   AND duplicate.`updated_at` = '2026-06-12 08:57:38'
  WHERE canonical.`id` = 325
    AND canonical.`slug` = 'authentik'
    AND canonical.`status` = 'alternative'
    AND canonical.`source_file` = 'research'
    AND canonical.`is_active` = 1
    AND canonical.`date_added` = '2026-02-27'
    AND canonical.`retired_at` IS NULL
    AND canonical.`name` = 'Authentik'
    AND canonical.`description_en` =
      'Identity Provider (IdP) and SSO platform supporting SAML, OAuth2/OIDC, LDAP, RADIUS, and more. Designed for self-hosting from small labs to large production clusters. Offers a free open-source core plus an enterprise tier with additional features under separate commercial terms.'
    AND canonical.`description_de` =
      'Open-Source Identity Provider (IdP) und SSO-Plattform mit Unterstützung für SAML, OAuth2/OIDC, LDAP, RADIUS und mehr. Entworfen für Selbsthosting von kleinen Labs bis zu großen Produktionsclustern. Bietet sowohl eine kostenlose Open-Source-Version als auch eine quelloffene Enterprise-Version mit zusätzlichen Funktionen.'
    AND canonical.`country_code` = 'us'
    AND canonical.`website_url` = 'https://goauthentik.io'
    AND canonical.`logo_path` = '/logos/authentik.svg'
    AND canonical.`pricing` = 'freemium'
    AND canonical.`is_open_source` = 1
    AND canonical.`open_source_level` = 'partial'
    AND canonical.`open_source_audit_url` IS NULL
    AND canonical.`source_code_url` =
      'https://github.com/goauthentik/authentik'
    AND canonical.`self_hostable` = 1
    AND canonical.`founded_year` = 2019
    AND canonical.`headquarters_city` =
      'United States (city not publicly disclosed)'
    AND canonical.`license_text` =
      'MIT (core) + enterprise modules under separate commercial terms'
    AND canonical.`action_links_json` IS NULL
    AND canonical.`created_at` = '2026-02-27 14:30:34'
    AND canonical.`updated_at` = '2026-06-12 08:57:38'

    -- Both rows have exactly the same sole primary IAM membership.
    AND (
      SELECT COUNT(*)
      FROM `entry_categories`
      WHERE `entry_id` IN (325, 881)
    ) = 2
    AND (
      SELECT COUNT(*)
      FROM `entry_categories`
      WHERE `entry_id` IN (325, 881)
        AND `category_id` = 'iam'
        AND `is_primary` = 1
        AND `sort_order` = 0
        AND `primary_entry_id` = `entry_id`
    ) = 2

    -- Guard the complete tag shape before merging identity-provider and radius.
    AND (
      SELECT COUNT(*)
      FROM `entry_tags`
      WHERE `entry_id` IN (325, 881)
    ) = 17
    AND (
      SELECT COUNT(*)
      FROM `entry_tags`
      WHERE
        (
          `entry_id` = 325
          AND (
            (`tag_id` = 812 AND `sort_order` = 0)
            OR (`tag_id` = 695 AND `sort_order` = 1)
            OR (`tag_id` = 893 AND `sort_order` = 2)
            OR (`tag_id` = 864 AND `sort_order` = 3)
            OR (`tag_id` = 787 AND `sort_order` = 4)
            OR (`tag_id` = 793 AND `sort_order` = 5)
            OR (`tag_id` = 723 AND `sort_order` = 6)
            OR (`tag_id` = 517 AND `sort_order` = 7)
            OR (`tag_id` = 871 AND `sort_order` = 8)
            OR (`tag_id` = 625 AND `sort_order` = 9)
          )
        )
        OR (
          `entry_id` = 881
          AND (
            (`tag_id` = 1190 AND `sort_order` = 0)
            OR (`tag_id` = 893 AND `sort_order` = 1)
            OR (`tag_id` = 871 AND `sort_order` = 2)
            OR (`tag_id` = 864 AND `sort_order` = 3)
            OR (`tag_id` = 793 AND `sort_order` = 4)
            OR (`tag_id` = 723 AND `sort_order` = 5)
            OR (`tag_id` = 1191 AND `sort_order` = 6)
          )
        )
    ) = 17

    -- Each identity owns an identical, untouched IAM placeholder set.
    AND (
      SELECT COUNT(*)
      FROM `matrix_facts`
      WHERE `entry_id` = 325
    ) = 51
    AND (
      SELECT COUNT(*)
      FROM `matrix_facts`
      WHERE `entry_id` = 881
    ) = 51
    AND NOT EXISTS (
      SELECT 1
      FROM `matrix_facts`
      WHERE `entry_id` IN (325, 881)
        AND (
          `category_id` <> 'iam'
          OR (`entry_id` = 325 AND `id` NOT BETWEEN 15702 AND 15752)
          OR (`entry_id` = 881 AND `id` NOT BETWEEN 29097 AND 29147)
          OR `criterion_id` NOT BETWEEN 1859 AND 1909
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
        ON duplicate_fact.`entry_id` = 881
       AND duplicate_fact.`category_id` = canonical_fact.`category_id`
       AND duplicate_fact.`criterion_id` = canonical_fact.`criterion_id`
      WHERE canonical_fact.`entry_id` = 325
        AND duplicate_fact.`id` IS NULL
    )
    AND NOT EXISTS (
      SELECT 1
      FROM `matrix_fact_attempts` attempt
      JOIN `matrix_facts` fact ON fact.`id` = attempt.`fact_id`
      WHERE fact.`entry_id` IN (325, 881)
    )
    AND NOT EXISTS (
      SELECT 1
      FROM `matrix_fact_verifications` verification
      JOIN `matrix_fact_attempts` attempt
        ON attempt.`id` = verification.`attempt_id`
      JOIN `matrix_facts` fact ON fact.`id` = attempt.`fact_id`
      WHERE fact.`entry_id` IN (325, 881)
    )

    -- These six exact outgoing claims become invalid when id 325 is US.
    AND (
      SELECT COUNT(*)
      FROM `entry_replacements`
      WHERE `entry_id` IN (325, 881)
         OR `replaced_entry_id` IN (325, 881)
         OR LOWER(REPLACE(TRIM(`raw_name`), ' ', '')) IN
           ('authentik', 'goauthentik')
    ) = 6
    AND (
      SELECT COUNT(*)
      FROM `entry_replacements`
      WHERE
        (`id` = 34 AND `entry_id` = 325 AND `raw_name` = 'Okta'
          AND `sort_order` = 0 AND `replaced_entry_id` IS NULL)
        OR (`id` = 35 AND `entry_id` = 325 AND `raw_name` = 'Azure AD'
          AND `sort_order` = 1 AND `replaced_entry_id` IS NULL)
        OR (`id` = 36 AND `entry_id` = 325 AND `raw_name` = 'Entra ID'
          AND `sort_order` = 2 AND `replaced_entry_id` IS NULL)
        OR (`id` = 37 AND `entry_id` = 325 AND `raw_name` = 'Ping Identity'
          AND `sort_order` = 3 AND `replaced_entry_id` IS NULL)
        OR (`id` = 38 AND `entry_id` = 325 AND `raw_name` = 'Auth0'
          AND `sort_order` = 4 AND `replaced_entry_id` IS NULL)
        OR (`id` = 834 AND `entry_id` = 881 AND `raw_name` = 'Auth0'
          AND `sort_order` = 0 AND `replaced_entry_id` = 739)
    ) = 6

    -- Preserve the rich row's complete trust/scoring relations.
    AND (
      SELECT COUNT(*)
      FROM `reservations`
      WHERE `entry_id` IN (325, 881)
    ) = 6
    AND (
      SELECT COUNT(*)
      FROM `reservations`
      WHERE `entry_id` = 325
        AND `id` BETWEEN 2304 AND 2309
    ) = 6
    AND (
      SELECT COUNT(*)
      FROM `positive_signals`
      WHERE `entry_id` IN (325, 881)
    ) = 20
    AND (
      SELECT COUNT(*)
      FROM `positive_signals`
      WHERE `entry_id` = 325
        AND `id` BETWEEN 2803 AND 2822
    ) = 20
    AND (
      SELECT COUNT(*)
      FROM `scoring_metadata`
      WHERE `entry_id` IN (325, 881)
        AND `entry_id` = 325
        AND `base_class_override` IS NULL
        AND `is_ad_surveillance` = 0
        AND `deep_research_path` = 'tmp/deepresearches/Authentik.md'
        AND `worksheet_path` = 'tmp/vetted/authentik-trust-score.md'
    ) = 1

    -- Every other direct catalog-entry relation was audited as empty,
    -- including semantic US-benchmark references with a NULL entry_id.
    AND NOT EXISTS (
      SELECT 1
      FROM `category_us_vendors`
      WHERE `entry_id` IN (325, 881)
         OR LOWER(REPLACE(TRIM(`raw_name`), ' ', '')) IN
           ('authentik', 'goauthentik')
    )
    AND NOT EXISTS (
      SELECT 1
      FROM `us_vendor_aliases`
      WHERE `entry_id` IN (325, 881)
         OR LOWER(REPLACE(TRIM(`alias`), ' ', '')) IN
           ('authentik', 'goauthentik')
    )
    AND NOT EXISTS (
      SELECT 1
      FROM `denied_decisions`
      WHERE `entry_id` IN (325, 881)
    )
);

SET @authentik_final_state = (
  SELECT COUNT(*) = 1
  FROM `catalog_entries` canonical
  WHERE canonical.`id` = 325
    AND canonical.`slug` = 'authentik'
    AND canonical.`status` = 'us'
    AND canonical.`source_file` = 'research'
    AND canonical.`is_active` = 1
    AND canonical.`date_added` = '2026-02-27'
    AND canonical.`retired_at` IS NULL
    AND canonical.`name` = 'authentik'
    AND canonical.`description_en` =
      'authentik is a self-hosted identity provider (IdP) and SSO platform supporting SAML, OAuth2/OIDC, LDAP, RADIUS, and more, from small labs to production clusters. Its core is MIT-licensed, while Enterprise features are source-available under separate commercial terms.'
    AND canonical.`description_de` =
      'authentik ist ein selbst gehosteter Identity Provider (IdP) und eine SSO-Plattform mit Unterstützung für SAML, OAuth2/OIDC, LDAP, RADIUS und weitere Protokolle – von kleinen Labs bis zu Produktionsclustern. Der Kern ist MIT-lizenziert; Enterprise-Funktionen sind unter separaten kommerziellen Bedingungen quellverfügbar.'
    AND canonical.`country_code` = 'us'
    AND canonical.`website_url` = 'https://goauthentik.io'
    AND canonical.`logo_path` = '/logos/authentik.svg'
    AND canonical.`pricing` = 'freemium'
    AND canonical.`is_open_source` = 1
    AND canonical.`open_source_level` = 'partial'
    AND canonical.`open_source_audit_url` IS NULL
    AND canonical.`source_code_url` =
      'https://github.com/goauthentik/authentik'
    AND canonical.`self_hostable` = 1
    AND canonical.`founded_year` = 2018
    AND canonical.`headquarters_city` = 'Philadelphia, Pennsylvania'
    AND canonical.`license_text` =
      'MIT (open-source core); Enterprise features source-available under separate commercial terms'
    AND canonical.`action_links_json` IS NULL
    AND NOT EXISTS (
      SELECT 1
      FROM `catalog_entries`
      WHERE `id` = 881 OR `slug` = 'goauthentik'
    )
    AND (
      SELECT COUNT(*)
      FROM `entry_categories`
      WHERE `entry_id` = 325
        AND `category_id` = 'iam'
        AND `is_primary` = 1
        AND `sort_order` = 0
        AND `primary_entry_id` = 325
    ) = 1
    AND (
      SELECT COUNT(*) FROM `entry_categories` WHERE `entry_id` = 325
    ) = 1
    AND (
      SELECT COUNT(*) FROM `entry_tags` WHERE `entry_id` = 325
    ) = 12
    AND EXISTS (
      SELECT 1 FROM `entry_tags`
      WHERE `entry_id` = 325 AND `tag_id` = 1190 AND `sort_order` = 10
    )
    AND EXISTS (
      SELECT 1 FROM `entry_tags`
      WHERE `entry_id` = 325 AND `tag_id` = 1191 AND `sort_order` = 11
    )
    AND (
      SELECT COUNT(*)
      FROM `matrix_facts`
      WHERE `entry_id` = 325
        AND `category_id` = 'iam'
        AND `criterion_id` BETWEEN 1859 AND 1909
        AND `status` = 'open'
        AND `selected_attempt_id` IS NULL
    ) = 51
    AND (
      SELECT COUNT(*) FROM `reservations` WHERE `entry_id` = 325
    ) = 6
    AND (
      SELECT COUNT(*) FROM `positive_signals` WHERE `entry_id` = 325
    ) = 20
    AND (
      SELECT COUNT(*) FROM `scoring_metadata` WHERE `entry_id` = 325
    ) = 1
    AND NOT EXISTS (
      SELECT 1
      FROM `entry_replacements`
      WHERE `entry_id` IN (325, 881)
         OR `replaced_entry_id` IN (325, 881)
         OR LOWER(REPLACE(TRIM(`raw_name`), ' ', '')) IN
           ('authentik', 'goauthentik')
    )
    AND NOT EXISTS (
      SELECT 1
      FROM `category_us_vendors`
      WHERE `entry_id` IN (325, 881)
         OR LOWER(REPLACE(TRIM(`raw_name`), ' ', '')) IN
           ('authentik', 'goauthentik')
    )
    AND NOT EXISTS (
      SELECT 1
      FROM `us_vendor_aliases`
      WHERE `entry_id` IN (325, 881)
         OR LOWER(REPLACE(TRIM(`alias`), ' ', '')) IN
           ('authentik', 'goauthentik')
    )
    AND NOT EXISTS (
      SELECT 1 FROM `denied_decisions` WHERE `entry_id` IN (325, 881)
    )
);

DROP TEMPORARY TABLE IF EXISTS `_dedupe_authentik_assert`;
CREATE TEMPORARY TABLE `_dedupe_authentik_assert` (
  `singleton` TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (`singleton`)
);
INSERT INTO `_dedupe_authentik_assert` (`singleton`) VALUES (1);
INSERT INTO `_dedupe_authentik_assert` (`singleton`)
SELECT 1
WHERE COALESCE(@authentik_initial_state, 0)
    + COALESCE(@authentik_final_state, 0) <> 1;

SET @authentik_should_merge = COALESCE(@authentik_initial_state, 0);

-- US catalog records do not replace other US products. Remove only the six
-- audited outgoing claims; there are no inbound links to rewire.
DELETE FROM `entry_replacements`
WHERE @authentik_should_merge = 1
  AND (
    (`id` = 34 AND `entry_id` = 325 AND `raw_name` = 'Okta'
      AND `sort_order` = 0 AND `replaced_entry_id` IS NULL)
    OR (`id` = 35 AND `entry_id` = 325 AND `raw_name` = 'Azure AD'
      AND `sort_order` = 1 AND `replaced_entry_id` IS NULL)
    OR (`id` = 36 AND `entry_id` = 325 AND `raw_name` = 'Entra ID'
      AND `sort_order` = 2 AND `replaced_entry_id` IS NULL)
    OR (`id` = 37 AND `entry_id` = 325 AND `raw_name` = 'Ping Identity'
      AND `sort_order` = 3 AND `replaced_entry_id` IS NULL)
    OR (`id` = 38 AND `entry_id` = 325 AND `raw_name` = 'Auth0'
      AND `sort_order` = 4 AND `replaced_entry_id` IS NULL)
    OR (`id` = 834 AND `entry_id` = 881 AND `raw_name` = 'Auth0'
      AND `sort_order` = 0 AND `replaced_entry_id` = 739)
  );

-- Preserve the two useful tags that exist only on the sparse duplicate.
INSERT INTO `entry_tags` (`entry_id`, `tag_id`, `sort_order`)
SELECT 325, 1190, 10
FROM `entry_tags`
WHERE `entry_id` = 881
  AND `tag_id` = 1190
  AND `sort_order` = 0
  AND @authentik_should_merge = 1
UNION ALL
SELECT 325, 1191, 11
FROM `entry_tags`
WHERE `entry_id` = 881
  AND `tag_id` = 1191
  AND `sort_order` = 6
  AND @authentik_should_merge = 1;

DELETE FROM `entry_tags`
WHERE `entry_id` = 881
  AND @authentik_should_merge = 1
  AND (
    (`tag_id` = 1190 AND `sort_order` = 0)
    OR (`tag_id` = 893 AND `sort_order` = 1)
    OR (`tag_id` = 871 AND `sort_order` = 2)
    OR (`tag_id` = 864 AND `sort_order` = 3)
    OR (`tag_id` = 793 AND `sort_order` = 4)
    OR (`tag_id` = 723 AND `sort_order` = 5)
    OR (`tag_id` = 1191 AND `sort_order` = 6)
  );

-- The duplicate's facts are exact empty copies; retain id 325's full set.
DELETE FROM `matrix_facts`
WHERE `entry_id` = 881
  AND `id` BETWEEN 29097 AND 29147
  AND `category_id` = 'iam'
  AND `criterion_id` BETWEEN 1859 AND 1909
  AND `status` = 'open'
  AND `value_bool` IS NULL
  AND `value_number` IS NULL
  AND `value_text` IS NULL
  AND `value_json` IS NULL
  AND `public_source_url` IS NULL
  AND `public_source_title` IS NULL
  AND `public_source_accessed_date` IS NULL
  AND `selected_attempt_id` IS NULL
  AND `deeper_research_attempt_count` = 0
  AND `deeper_research_next_eligible_at` IS NULL
  AND @authentik_should_merge = 1;

DELETE FROM `entry_categories`
WHERE `entry_id` = 881
  AND `category_id` = 'iam'
  AND `is_primary` = 1
  AND `sort_order` = 0
  AND `primary_entry_id` = 881
  AND @authentik_should_merge = 1;

-- Delete exactly the sparse duplicate after its complete guarded relation set
-- has been removed. No unexamined ON DELETE behavior can hide extra data.
DELETE FROM `catalog_entries`
WHERE `id` = 881
  AND `slug` = 'goauthentik'
  AND `status` = 'us'
  AND `source_file` = 'research'
  AND `is_active` = 1
  AND `country_code` = 'us'
  AND `website_url` = 'https://goauthentik.io/'
  AND `source_code_url` = 'https://github.com/goauthentik/authentik'
  AND @authentik_should_merge = 1
  AND NOT EXISTS (
    SELECT 1 FROM `entry_categories` WHERE `entry_id` = 881
  )
  AND NOT EXISTS (
    SELECT 1 FROM `entry_tags` WHERE `entry_id` = 881
  )
  AND NOT EXISTS (
    SELECT 1 FROM `matrix_facts` WHERE `entry_id` = 881
  )
  AND NOT EXISTS (
    SELECT 1
    FROM `entry_replacements`
    WHERE `entry_id` = 881 OR `replaced_entry_id` = 881
  )
  AND NOT EXISTS (
    SELECT 1 FROM `category_us_vendors` WHERE `entry_id` = 881
  )
  AND NOT EXISTS (
    SELECT 1 FROM `us_vendor_aliases` WHERE `entry_id` = 881
  )
  AND NOT EXISTS (
    SELECT 1 FROM `reservations` WHERE `entry_id` = 881
  )
  AND NOT EXISTS (
    SELECT 1 FROM `positive_signals` WHERE `entry_id` = 881
  )
  AND NOT EXISTS (
    SELECT 1 FROM `scoring_metadata` WHERE `entry_id` = 881
  )
  AND NOT EXISTS (
    SELECT 1 FROM `denied_decisions` WHERE `entry_id` = 881
  );

-- Correct the surviving record from official first-party evidence.
UPDATE `catalog_entries`
SET
  `status` = 'us',
  `name` = 'authentik',
  `description_en` =
    'authentik is a self-hosted identity provider (IdP) and SSO platform supporting SAML, OAuth2/OIDC, LDAP, RADIUS, and more, from small labs to production clusters. Its core is MIT-licensed, while Enterprise features are source-available under separate commercial terms.',
  `description_de` =
    'authentik ist ein selbst gehosteter Identity Provider (IdP) und eine SSO-Plattform mit Unterstützung für SAML, OAuth2/OIDC, LDAP, RADIUS und weitere Protokolle – von kleinen Labs bis zu Produktionsclustern. Der Kern ist MIT-lizenziert; Enterprise-Funktionen sind unter separaten kommerziellen Bedingungen quellverfügbar.',
  `founded_year` = 2018,
  `headquarters_city` = 'Philadelphia, Pennsylvania',
  `license_text` =
    'MIT (open-source core); Enterprise features source-available under separate commercial terms'
WHERE `id` = 325
  AND `slug` = 'authentik'
  AND `status` = 'alternative'
  AND `source_file` = 'research'
  AND `is_active` = 1
  AND `country_code` = 'us'
  AND `website_url` = 'https://goauthentik.io'
  AND `logo_path` = '/logos/authentik.svg'
  AND `open_source_level` = 'partial'
  AND @authentik_should_merge = 1;

SET @authentik_post_state = (
  SELECT COUNT(*) = 1
  FROM `catalog_entries`
  WHERE `id` = 325
    AND `slug` = 'authentik'
    AND `status` = 'us'
    AND `name` = 'authentik'
    AND `country_code` = 'us'
    AND `open_source_level` = 'partial'
    AND `founded_year` = 2018
    AND `headquarters_city` = 'Philadelphia, Pennsylvania'
    AND NOT EXISTS (
      SELECT 1 FROM `catalog_entries` WHERE `id` = 881
    )
    AND NOT EXISTS (
      SELECT 1
      FROM `entry_replacements`
      WHERE `entry_id` IN (325, 881)
         OR `replaced_entry_id` IN (325, 881)
    )
    AND (
      SELECT COUNT(*) FROM `entry_categories` WHERE `entry_id` = 325
    ) = 1
    AND (
      SELECT COUNT(*) FROM `entry_tags` WHERE `entry_id` = 325
    ) = 12
    AND (
      SELECT COUNT(*) FROM `matrix_facts` WHERE `entry_id` = 325
    ) = 51
    AND (
      SELECT COUNT(*) FROM `reservations` WHERE `entry_id` = 325
    ) = 6
    AND (
      SELECT COUNT(*) FROM `positive_signals` WHERE `entry_id` = 325
    ) = 20
    AND (
      SELECT COUNT(*) FROM `scoring_metadata` WHERE `entry_id` = 325
    ) = 1
);

INSERT INTO `_dedupe_authentik_assert` (`singleton`)
SELECT 1
WHERE COALESCE(@authentik_post_state, 0) <> 1;

INSERT INTO `schema_migrations` (`version`)
VALUES ('091-dedupe-authentik')
ON DUPLICATE KEY UPDATE `version` = VALUES(`version`);

DROP TEMPORARY TABLE IF EXISTS `_dedupe_authentik_assert`;

COMMIT;
