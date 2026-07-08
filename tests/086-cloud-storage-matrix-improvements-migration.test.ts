import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL(
    "../scripts/migrations/086-cloud-storage-matrix-improvements.sql",
    import.meta.url,
  ),
  "utf8",
);

const coverageKeys = [
  "link_access_controls",
  "ransomware_protection",
  "compliance_profiles",
  "open_protocol_access",
  "migration_import_sources",
  "role_permissions",
  "sharing_policy_controls",
  "integration_support",
] as const;

const pricingOptions = [
  "free_and_paid",
  "flat_tiers",
  "one_time_lifetime",
  "self_hosted_free",
  "per_gb_usage",
  "per_user_seat",
] as const;

const syncOptions = ["block_level_delta", "full_file", "unclear"] as const;

describe("cloud-storage matrix improvements migration", () => {
  it("flips the reviewed cloud-storage presence lists to coverage", () => {
    expect(migration).toMatch(
      /UPDATE\s+`matrix_criteria`[\s\S]*`display_mode`\s*=\s*'coverage'/i,
    );
    expect(migration).toContain("`value_type` = 'multi_enum'");
    expect(migration).toContain("`category_id` = 'cloud-storage'");
    for (const key of coverageKeys) {
      expect(migration).toContain(`'${key}'`);
    }
  });

  it("only flips coverage for cloud-storage and does not blanket-convert via LIKE", () => {
    expect(migration).not.toContain("'email'");
    expect(migration).not.toContain("'messaging'");
    expect(migration).not.toMatch(/LIKE\s+'%/i);
  });

  it("adds the pricing_model enum criterion to the storage_plans group", () => {
    expect(migration).toMatch(/INSERT\s+IGNORE\s+INTO\s+`matrix_criteria`/i);
    expect(migration).toMatch(
      /'pricing_model'[\s\S]*'enum'[\s\S]*'tradeoff'[\s\S]*'optional'/i,
    );
    expect(migration).toContain("'storage_plans'");
    expect(migration).toContain("'Pricing model'");
    expect(migration).toContain("'Preismodell'");
  });

  it("adds the sync_efficiency enum criterion to the sync_access group", () => {
    expect(migration).toMatch(
      /'sync_efficiency'[\s\S]*'enum'[\s\S]*'beneficial'[\s\S]*'optional'/i,
    );
    expect(migration).toContain("'sync_access'");
    expect(migration).toContain("'Sync efficiency'");
    expect(migration).toContain("'Sync-Effizienz'");
  });

  it("defines all pricing_model and sync_efficiency options", () => {
    expect(migration).toMatch(
      /INSERT\s+IGNORE\s+INTO\s+`matrix_criterion_options`/i,
    );
    for (const key of [...pricingOptions, ...syncOptions]) {
      expect(migration).toContain(`'${key}'`);
    }
    expect(migration).toMatch(/'one_time_lifetime'[\s\S]*'positive'/i);
    expect(migration).toMatch(/'per_gb_usage'[\s\S]*'tradeoff'/i);
    expect(migration).toMatch(/'block_level_delta'[\s\S]*'positive'/i);
  });

  it("does not touch existing cloud-storage option tones (adds no new option keys beyond the two criteria)", () => {
    expect(migration).not.toMatch(/UPDATE\s+`matrix_criterion_options`/i);
  });

  it("initializes open matrix facts per new criterion and records the migration", () => {
    expect(migration).toMatch(/INSERT\s+IGNORE\s+INTO\s+`matrix_facts`/i);
    expect(migration).toMatch(/mc\.criterion_key\s*=\s*'pricing_model'/i);
    expect(migration).toMatch(/mc\.criterion_key\s*=\s*'sync_efficiency'/i);
    expect(migration).toMatch(/ce\.`status`\s*=\s*'alternative'/i);
    expect(migration).toMatch(/ce\.is_active\s*=\s*1/i);
    expect(migration).toContain("'086-cloud-storage-matrix-improvements'");
  });
});
