import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL(
    "../scripts/migrations/085-office-suite-matrix-improvements.sql",
    import.meta.url,
  ),
  "utf8",
);

const COVERAGE_KEYS = [
  "included_editors",
  "pdf_workflow",
  "forms_database_tools",
  "equation_or_scientific_tools",
  "mobile_platforms",
  "legacy_format_support",
  "export_formats",
  "format_fidelity_tools",
  "sharing_link_controls",
  "collaboration_presence",
  "citation_bibliography_tools",
  "advanced_layout_tools",
  "role_access_controls",
  "sharing_security_controls",
  "dlp_retention_controls",
  "developer_api",
  "cloud_storage_integrations",
  "bulk_import_migration",
  "standards_interoperability",
  "language_tools",
];

const LICENSING_OPTIONS = [
  "foss",
  "self_hosted_community",
  "free_gratis",
  "freemium",
  "perpetual_license",
  "per_user_subscription",
  "subscription_only_cloud",
];

describe("office-suite matrix improvements migration", () => {
  it("flips the reviewed office-suite presence lists to coverage", () => {
    expect(migration).toMatch(
      /UPDATE\s+`matrix_criteria`[\s\S]*`display_mode`\s*=\s*'coverage'/i,
    );
    expect(migration).toContain("`value_type` = 'multi_enum'");
    expect(migration).toContain("`category_id` = 'office-suite'");
    for (const key of COVERAGE_KEYS) {
      expect(migration).toContain(`'${key}'`);
    }
    expect(COVERAGE_KEYS).toHaveLength(20);
  });

  it("does not flip fit_profiles or blanket-convert via LIKE", () => {
    expect(migration).not.toContain("'fit_profiles'");
    expect(migration).not.toMatch(/LIKE\s+'%/i);
  });

  it("adds the licensing_model criterion to the deployment_admin group", () => {
    expect(migration).toContain("'licensing_model'");
    expect(migration).toContain("'Licensing model'");
    expect(migration).toContain("'Lizenzmodell'");
    expect(migration).toContain("'deployment_admin'");
    // enum tradeoff filter, seated at the end of the deployment_admin group.
    expect(migration).toMatch(
      /'licensing_model'[\s\S]*'enum'[\s\S]*'tradeoff'[\s\S]*'optional'[\s\S]*6080/i,
    );
    expect(migration).toMatch(
      /INSERT IGNORE INTO `matrix_criteria`[\s\S]*JOIN `matrix_criterion_groups` g/i,
    );
  });

  it("defines the licensing_model options with reviewed tones", () => {
    for (const option of LICENSING_OPTIONS) {
      expect(migration).toContain(`'${option}'`);
    }
    expect(LICENSING_OPTIONS).toHaveLength(7);
    // positives, neutrals, and tradeoffs are all represented.
    expect(migration).toMatch(/'foss'[\s\S]*'positive'/i);
    expect(migration).toMatch(/'self_hosted_community'[\s\S]*'positive'/i);
    expect(migration).toMatch(/'per_user_subscription'[\s\S]*'tradeoff'/i);
    expect(migration).toMatch(/'subscription_only_cloud'[\s\S]*'tradeoff'/i);
  });

  it("seeds matrix_facts 'open' rows for active alternatives only", () => {
    expect(migration).toMatch(
      /INSERT IGNORE INTO `matrix_facts`[\s\S]*mc\.criterion_key = 'licensing_model'/i,
    );
    expect(migration).toContain("ce.`status` = 'alternative'");
    expect(migration).toContain("ce.is_active = 1");
  });

  it("records the migration version", () => {
    expect(migration).toContain("'085-office-suite-matrix-improvements'");
  });
});
