import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL(
    "../scripts/migrations/082-matrix-coverage-mode-email-messaging.sql",
    import.meta.url,
  ),
  "utf8",
);

describe("matrix coverage-mode email/messaging migration", () => {
  it("flips the reviewed email presence lists to coverage", () => {
    expect(migration).toMatch(
      /UPDATE\s+`matrix_criteria`[\s\S]*`display_mode`\s*=\s*'coverage'/i,
    );
    expect(migration).toContain("`value_type` = 'multi_enum'");
    for (const key of [
      "standard_mail_protocols",
      "server_side_filters",
      "domain_authentication_controls",
      "anti_abuse_protection",
      "tracker_remote_content_protection",
      "compliance_profiles",
      "migration_import_sources",
      "contacts_calendar_export",
      "productivity_suite_scope",
    ]) {
      expect(migration).toContain(`'${key}'`);
    }
  });

  it("flips the messaging group-admin gap and records the migration", () => {
    expect(migration).toContain("'group_admin_tools'");
    expect(migration).toContain("`category_id` = 'messaging'");
    expect(migration).toContain(
      "'082-matrix-coverage-mode-email-messaging'",
    );
  });

  it("does not blanket-convert summary lists like fit_profiles", () => {
    expect(migration).not.toContain("'fit_profiles'");
    expect(migration).not.toMatch(/LIKE\s+'%/i);
  });
});
