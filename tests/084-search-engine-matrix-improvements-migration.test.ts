import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL(
    "../scripts/migrations/084-search-engine-matrix-improvements.sql",
    import.meta.url,
  ),
  "utf8",
);

describe("search-engine matrix improvements migration", () => {
  it("flips the reviewed search-engine presence lists to coverage", () => {
    expect(migration).toMatch(
      /UPDATE\s+`matrix_criteria`[\s\S]*`display_mode`\s*=\s*'coverage'/i,
    );
    expect(migration).toContain("`value_type` = 'multi_enum'");
    expect(migration).toContain("`category_id` = 'search-engine'");
    for (const key of [
      "upstream_result_sources",
      "result_freshness_controls",
      "regional_language_controls",
      "advanced_search_operators",
      "search_filter_controls",
      "ranking_customization",
      "spelling_query_assistance",
      "vertical_search_types",
      "image_search_filters",
      "news_search_controls",
      "multimedia_search_controls",
      "non_ai_instant_answers",
      "access_paths",
      "result_transparency_signals",
    ]) {
      expect(migration).toContain(`'${key}'`);
    }
  });

  it("does not flip the summary/fit lists", () => {
    // best_query_types and fit_profiles must stay in default mode: they must
    // not appear inside the coverage UPDATE's IN (...) list.
    const update = migration.slice(
      migration.indexOf("UPDATE `matrix_criteria`"),
      migration.indexOf("-- Part B"),
    );
    expect(update).not.toContain("'best_query_types'");
    expect(update).not.toContain("'fit_profiles'");
    expect(migration).not.toMatch(/LIKE\s+'%/i);
  });

  it("adds the data_processing_region enum criterion in Privacy & Personalization", () => {
    expect(migration).toContain("INSERT IGNORE INTO `matrix_criteria`");
    expect(migration).toContain("'data_processing_region'");
    expect(migration).toContain("'privacy_personalization'");
    expect(migration).toContain("'Query/data processing region'");
    // enum, tradeoff, must_match
    expect(migration).toMatch(
      /'data_processing_region'[\s\S]*?'enum'[\s\S]*?'tradeoff'[\s\S]*?'must_match'/,
    );
    // group_id join like migration 008
    expect(migration).toMatch(
      /JOIN\s+`matrix_criterion_groups`\s+g[\s\S]*g\.group_key\s*=\s*d\.group_key/i,
    );
  });

  it("defines all seven data_processing_region options with the right tones", () => {
    const options: Array<[string, string]> = [
      ["eu_only", "positive"],
      ["user_selectable_region", "positive"],
      ["self_hosted", "positive"],
      ["provider_selected", "neutral"],
      ["global_or_mixed", "tradeoff"],
      ["non_eu", "tradeoff"],
      ["unclear", "warning"],
    ];
    expect(migration).toContain("INSERT IGNORE INTO `matrix_criterion_options`");
    for (const [key, tone] of options) {
      expect(migration).toMatch(
        new RegExp(`'${key}'[^\\n]*'${tone}'`),
      );
    }
  });

  it("adds the bang_shortcuts boolean criterion in Query Controls with no options", () => {
    expect(migration).toContain("'bang_shortcuts'");
    expect(migration).toContain("'query_controls'");
    expect(migration).toContain("'Bang / shortcut commands'");
    expect(migration).toMatch(
      /'bang_shortcuts'[\s\S]*?'boolean'[\s\S]*?'beneficial'[\s\S]*?'optional'/,
    );
    // boolean criterion => no option rows keyed to it
    expect(migration).not.toMatch(/'bang_shortcuts'[^\n]*'positive'/);
  });

  it("initializes open facts for both new criteria over active alternatives", () => {
    const factInserts = migration.match(
      /INSERT IGNORE INTO `matrix_facts`/g,
    );
    expect(factInserts).toHaveLength(2);
    expect(migration).toContain("ce.`status` = 'alternative'");
    expect(migration).toContain("ce.is_active = 1");
    expect(migration).toMatch(
      /mc\.criterion_key\s*=\s*'data_processing_region'/,
    );
    expect(migration).toMatch(/mc\.criterion_key\s*=\s*'bang_shortcuts'/);
  });

  it("records the migration version and uses idempotent inserts", () => {
    expect(migration).toContain(
      "'084-search-engine-matrix-improvements'",
    );
    // criteria, options and facts all use INSERT IGNORE
    expect(migration).not.toMatch(/INSERT INTO `matrix_criteria`/);
    expect(migration).not.toMatch(/INSERT INTO `matrix_criterion_options`/);
    expect(migration).not.toMatch(/INSERT INTO `matrix_facts`/);
  });
});
