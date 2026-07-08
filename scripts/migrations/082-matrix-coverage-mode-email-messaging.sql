-- Migration 082: Put email + messaging presence-list criteria into coverage display mode.
--
-- Migration 063 assigned `display_mode = 'coverage'` by criterion-key naming
-- (`supported_%`, `%_features`, plus a hardcoded list). That heuristic missed
-- email's presence-list multi-enums, which do not follow that naming, so those
-- cells only render the options an entry HAS (in their static per-option tone)
-- and never show what is missing. In coverage mode every option renders:
-- supported (green / amber for a tradeoff option) or absent (red).
--
-- This migration flips only reviewed, genuine presence lists. It deliberately
-- does NOT blanket-convert every multi-enum: long enumeration/summary lists
-- (fit_profiles, format/codec/region/SDK-language lists) would become red-heavy
-- noise under coverage and need per-category review instead.

UPDATE `matrix_criteria`
SET `display_mode` = 'coverage'
WHERE `value_type` = 'multi_enum'
  AND (
    (
      `category_id` = 'email'
      AND `criterion_key` IN (
        'standard_mail_protocols',
        'server_side_filters',
        'domain_authentication_controls',
        'anti_abuse_protection',
        'tracker_remote_content_protection',
        'compliance_profiles',
        'migration_import_sources',
        'contacts_calendar_export',
        'productivity_suite_scope'
      )
    )
    OR (
      `category_id` = 'messaging'
      AND `criterion_key` IN (
        'group_admin_tools'
      )
    )
  );

INSERT INTO `schema_migrations` (`version`)
VALUES ('082-matrix-coverage-mode-email-messaging');
