import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL(
    "../scripts/migrations/083-browser-matrix-improvements.sql",
    import.meta.url,
  ),
  "utf8",
);

describe("browser matrix improvements migration", () => {
  it("flips the reviewed browser presence lists to coverage", () => {
    expect(migration).toMatch(
      /UPDATE\s+`matrix_criteria`[\s\S]*`display_mode`\s*=\s*'coverage'/i,
    );
    expect(migration).toContain("`value_type` = 'multi_enum'");
    expect(migration).toContain("`category_id` = 'browser'");
    for (const key of [
      "built_in_tools",
      "protocol_support",
      "extension_api_compatibility",
    ]) {
      expect(migration).toContain(`'${key}'`);
    }
  });

  it("adds default_telemetry as a risk enum in the privacy group", () => {
    expect(migration).toMatch(
      /'privacy_tracking' AS group_key, 'default_telemetry' AS criterion_key/,
    );
    expect(migration).toMatch(
      /'default_telemetry'[^\n]*'enum'[^\n]*'risk'[^\n]*'optional'[^\n]*2060/,
    );
    const telemetryTones: Array<[string, string]> = [
      ["none_or_opt_in", "positive"],
      ["anonymous_stats", "neutral"],
      ["on_by_default_opt_out", "tradeoff"],
      ["on_by_default_sticky", "warning"],
      ["undocumented", "negative"],
    ];
    for (const [key, tone] of telemetryTones) {
      expect(migration).toMatch(new RegExp(`'${key}'[^\\n]*'${tone}'`));
    }
  });

  it("adds mobile_extension_support as a beneficial enum in the extensions group", () => {
    expect(migration).toMatch(
      /'extensions_customization', 'mobile_extension_support'/,
    );
    expect(migration).toMatch(
      /'mobile_extension_support'[^\n]*'enum'[^\n]*'beneficial'[^\n]*'optional'[^\n]*7050/,
    );
    const mobileTones: Array<[string, string]> = [
      ["full", "positive"],
      ["curated_limited", "tradeoff"],
      ["none", "negative"],
      ["no_mobile_app", "neutral"],
    ];
    for (const [key, tone] of mobileTones) {
      expect(migration).toMatch(new RegExp(`'${key}'[^\\n]*'${tone}'`));
    }
  });

  it("initializes open matrix_facts for every active browser alternative", () => {
    for (const key of ["default_telemetry", "mobile_extension_support"]) {
      expect(migration).toMatch(
        new RegExp(
          `INSERT IGNORE INTO \`matrix_facts\`[\\s\\S]*?mc\\.criterion_key = '${key}'[\\s\\S]*?ce\\.\`status\` = 'alternative'[\\s\\S]*?ce\\.is_active = 1`,
        ),
      );
    }
    expect(migration).toMatch(/SELECT ce\.id, 'browser', mc\.id, 'open'/);
  });

  it("uses idempotent inserts and records the migration", () => {
    expect(migration).toContain("INSERT IGNORE INTO `matrix_criteria`");
    expect(migration).toContain("INSERT IGNORE INTO `matrix_criterion_options`");
    expect(migration).not.toMatch(/LIKE\s+'%/i);
    expect(migration).toContain("'083-browser-matrix-improvements'");
  });
});
