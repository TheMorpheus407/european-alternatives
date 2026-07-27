import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { join, resolve } from "node:path";

import { loadNodeRuntime, useHostFilesystem } from "@php-wasm/node";
import { PHP } from "@php-wasm/universal";
import { afterAll, describe, expect, it } from "vitest";

const matrixEndpointPath = resolve("api/catalog/matrix.php");
const cachePath = resolve("api/cache.php");
const helpersPath = resolve("api/catalog/helpers.php");
const scoringPath = resolve("api/catalog/scoring.php");
const localTempRoot = resolve("logs/issues/410");
const tempPaths: string[] = [];

let phpPromise: Promise<PHP> | undefined;

type MatrixRequestQuery = Record<string, string | string[]>;

type MatrixScenario = {
  category: Record<string, unknown>;
  groups: Array<Record<string, unknown>>;
  criteria: Array<Record<string, unknown>>;
  options: Array<Record<string, unknown>>;
  alternatives: Array<Record<string, unknown>>;
  categoryUsVendors: Array<Record<string, unknown>>;
  replacements: Array<Record<string, unknown>>;
  tags: Array<Record<string, unknown>>;
  reservations: Array<Record<string, unknown>>;
  positiveSignals: Array<Record<string, unknown>>;
  scoringMetadata: Array<Record<string, unknown>>;
  facts: Array<Record<string, unknown>>;
  auditRows: Array<Record<string, unknown>>;
  failOnDb?: boolean;
};

type PhpResponse = {
  status: number;
  headers: Record<string, string[]>;
  json: unknown;
  stdoutText: string;
  stderr: string;
};

type MatrixFact = {
  status: string;
  value: unknown;
  source?: {
    url?: string;
    title?: string;
    accessedDate?: string;
  };
};

type MatrixAlternative = {
  id: string;
  status?: string;
  logo: string | null;
  country: string | null;
  category: string | null;
  secondaryCategories?: string[];
  facts: Record<string, MatrixFact>;
};

type MatrixPayload = {
  data: {
    category: {
      id: string;
      name: string;
      description: string | null;
      emoji?: string | null;
    };
    groups: Array<{
      id: string;
      label: string;
      description?: string | null;
      criteria: Array<{
        id: string;
        label: string;
        helpText?: string | null;
        options: Array<{ id: string; label: string; displayTone?: string }>;
      }>;
    }>;
    alternatives: MatrixAlternative[];
  };
  meta: {
    category: string;
    locale: string;
    groupCount: number;
    criterionCount: number;
    alternativeCount: number;
  };
};

const matrixScenario: MatrixScenario = {
  category: {
    id: "messaging",
    emoji: "chat",
    name: "Messaging",
    name_en: "Messaging",
    name_de: "Messaging DE",
    description: "Secure messaging and chat apps",
    description_en: "Secure messaging and chat apps",
    description_de: "Sichere Messenger",
    sort_order: 1,
  },
  groups: [
    {
      id: 20,
      category_id: "messaging",
      group_key: "compliance",
      label: "Compliance",
      label_en: "Compliance",
      label_de: "Compliance DE",
      description: "Jurisdiction fit",
      description_en: "Jurisdiction fit",
      description_de: "Rechtsraum",
      sort_order: 1,
    },
    {
      id: 10,
      category_id: "messaging",
      group_key: "privacy",
      label: "Privacy",
      label_en: "Privacy",
      label_de: "Datenschutz",
      description: "Privacy features",
      description_en: "Privacy features",
      description_de: "Datenschutzfunktionen",
      sort_order: 2,
    },
  ],
  criteria: [
    {
      id: 200,
      category_id: "messaging",
      group_id: 20,
      criterion_key: "hosting_region",
      label: "Hosting region",
      label_en: "Hosting region",
      label_de: "Hosting-Region",
      helpText: "Where account data is primarily hosted",
      help_text: "Where account data is primarily hosted",
      help_text_en: "Where account data is primarily hosted",
      help_text_de: "Wo Kontodaten hauptsächlich gehostet werden",
      value_type: "enum",
      semantics: "informational",
      filter_mode: "optional",
      sort_order: 1,
    },
    {
      id: 100,
      category_id: "messaging",
      group_id: 10,
      criterion_key: "e2ee",
      label: "End-to-end encryption",
      label_en: "End-to-end encryption",
      label_de: "Ende-zu-Ende-Verschlüsselung",
      helpText: "Whether private chats are end-to-end encrypted",
      help_text: "Whether private chats are end-to-end encrypted",
      help_text_en: "Whether private chats are end-to-end encrypted",
      help_text_de: "Ob private Chats Ende-zu-Ende-verschlüsselt sind",
      value_type: "boolean",
      semantics: "beneficial",
      filter_mode: "must_match",
      sort_order: 2,
    },
  ],
  options: [
    {
      id: 301,
      criterion_id: 200,
      criterion_key: "hosting_region",
      option_key: "eu",
      label: "EU",
      label_en: "EU",
      label_de: "EU",
      display_tone: "positive",
      sort_order: 1,
    },
    {
      id: 302,
      criterion_id: 200,
      criterion_key: "hosting_region",
      option_key: "global",
      label: "Global",
      label_en: "Global",
      label_de: "Global DE",
      display_tone: "neutral",
      sort_order: 2,
    },
  ],
  alternatives: [
    {
      id: 501,
      slug: "primary-chat",
      name: "Primary Chat",
      status: "alternative",
      is_active: 1,
      country_code: "de",
      website_url: "https://primary-chat.example",
      logo_path: "/logos/primary-chat.svg",
      open_source_level: "full",
      self_hostable: 1,
      memberships: [
        {
          entry_id: 501,
          category_id: "messaging",
          is_primary: 1,
          sort_order: 1,
        },
      ],
    },
    {
      id: 502,
      slug: "secondary-chat",
      name: "Secondary Chat",
      status: "alternative",
      is_active: 1,
      country_code: "fr",
      website_url: "https://secondary-chat.example",
      logo_path: null,
      open_source_level: "partial",
      self_hostable: 0,
      memberships: [
        {
          entry_id: 502,
          category_id: "productivity",
          is_primary: 1,
          sort_order: 1,
        },
        {
          entry_id: 502,
          category_id: "messaging",
          is_primary: 0,
          sort_order: 2,
        },
      ],
    },
    {
      id: 503,
      slug: "email-only",
      name: "Email Only",
      status: "alternative",
      is_active: 1,
      country_code: "nl",
      website_url: "https://email-only.example",
      logo_path: "/logos/email-only.svg",
      open_source_level: "none",
      self_hostable: 0,
      memberships: [
        { entry_id: 503, category_id: "email", is_primary: 1, sort_order: 1 },
      ],
    },
    {
      id: 504,
      slug: "inactive-chat",
      name: "Inactive Chat",
      status: "alternative",
      is_active: 0,
      country_code: "es",
      website_url: "https://inactive-chat.example",
      logo_path: "/logos/inactive-chat.svg",
      open_source_level: "none",
      self_hostable: 0,
      memberships: [
        {
          entry_id: 504,
          category_id: "messaging",
          is_primary: 1,
          sort_order: 1,
        },
      ],
    },
    {
      id: 505,
      slug: "draft-chat",
      name: "Draft Chat",
      status: "draft",
      is_active: 1,
      country_code: "it",
      website_url: "https://draft-chat.example",
      logo_path: "/logos/draft-chat.svg",
      open_source_level: "none",
      self_hostable: 0,
      memberships: [
        {
          entry_id: 505,
          category_id: "messaging",
          is_primary: 1,
          sort_order: 1,
        },
      ],
    },
    {
      id: 506,
      slug: "us-chat",
      name: "US Chat",
      status: "us",
      is_active: 1,
      country_code: "us",
      website_url: "https://us-chat.example",
      logo_path: "/logos/us-chat.svg",
      open_source_level: "none",
      self_hostable: 0,
      memberships: [
        {
          entry_id: 506,
          category_id: "messaging",
          is_primary: 0,
          sort_order: 1,
        },
      ],
    },
    {
      id: 507,
      slug: "signal",
      name: "Signal",
      status: "us",
      is_active: 1,
      country_code: "us",
      website_url: "https://signal.example",
      logo_path: "/logos/signal.svg",
      open_source_level: "full",
      self_hostable: 0,
      memberships: [
        {
          entry_id: 507,
          category_id: "messaging",
          is_primary: 0,
          sort_order: 2,
        },
      ],
    },
    {
      id: 508,
      slug: "jira",
      name: "Jira",
      status: "us",
      is_active: 1,
      country_code: "us",
      website_url: "https://jira.example",
      logo_path: "/logos/jira.svg",
      open_source_level: "none",
      self_hostable: 0,
      memberships: [
        {
          entry_id: 508,
          category_id: "project-management",
          is_primary: 0,
          sort_order: 1,
        },
      ],
    },
  ],
  categoryUsVendors: [
    {
      category_id: "messaging",
      entry_id: 506,
      raw_name: "US Chat",
      sort_order: 1,
    },
    {
      category_id: "project-management",
      entry_id: 508,
      raw_name: "Jira",
      sort_order: 1,
    },
  ],
  replacements: [
    {
      entry_id: 501,
      replaced_entry_id: 507,
      raw_name: "Signal",
      sort_order: 1,
    },
    {
      entry_id: 501,
      replaced_entry_id: 508,
      raw_name: "Jira",
      sort_order: 2,
    },
  ],
  tags: [
    {
      entry_id: 501,
      slug: "privacy",
      sort_order: 1,
    },
  ],
  reservations: [],
  positiveSignals: [],
  scoringMetadata: [
    {
      entry_id: 501,
      base_class_override: "foss",
      is_ad_surveillance: 0,
    },
    {
      entry_id: 506,
      base_class_override: "us",
      is_ad_surveillance: 0,
    },
    {
      entry_id: 507,
      base_class_override: "foss",
      is_ad_surveillance: 0,
    },
  ],
  facts: [
    {
      id: 9001,
      entry_id: 501,
      category_id: "messaging",
      criterion_id: 100,
      criterion_key: "e2ee",
      status: "verified",
      value_bool: 1,
      value_number: null,
      value_text: null,
      value_json: null,
      public_source_url: "https://primary-chat.example/security",
      public_source_title: "Primary Chat security whitepaper",
      public_source_accessed_date: "2026-05-24",
    },
    {
      id: 9002,
      entry_id: 501,
      category_id: "messaging",
      criterion_id: 200,
      criterion_key: "hosting_region",
      status: "open",
      value_bool: null,
      value_number: null,
      value_text: "internal-stale-value",
      value_json: null,
      public_source_url: "https://primary-chat.example/unreviewed",
      public_source_title: "Unreviewed source",
      public_source_accessed_date: "2026-05-23",
    },
  ],
  auditRows: [
    {
      entry_id: 501,
      criterion_id: 100,
      criterion_key: "e2ee",
      status: "verified",
      value_bool: 1,
      audit_quote: "AUDIT_QUOTE_SHOULD_NOT_LEAK",
      raw_response: "RAW_RESPONSE_SHOULD_NOT_LEAK",
    },
  ],
};

function createTempPath(prefix: string): string {
  mkdirSync(localTempRoot, { recursive: true });
  const path = mkdtempSync(join(localTempRoot, prefix));
  tempPaths.push(path);
  return path;
}

function getPhp(): Promise<PHP> {
  phpPromise ??= loadNodeRuntime("8.3").then((runtime) => {
    const php = new PHP(runtime);
    useHostFilesystem(php);
    return php;
  });

  return phpPromise;
}

function getHeader(
  headers: Record<string, string[]>,
  name: string,
): string | undefined {
  const expectedName = name.toLowerCase();

  for (const [headerName, values] of Object.entries(headers)) {
    if (headerName.toLowerCase() === expectedName) {
      return values[0];
    }
  }

  return undefined;
}

function readMatrixEndpointSource(): string {
  if (!existsSync(matrixEndpointPath)) {
    throw new Error(
      "Expected api/catalog/matrix.php to exist for the catalog matrix endpoint.",
    );
  }

  return readFileSync(matrixEndpointPath, "utf8");
}

function stripMatrixEndpointSource(source: string): string {
  return source
    .replace(/^<\?php\s*/, "")
    .replace(/declare\(strict_types=1\);\s*/, "")
    .replace(
      /require(?:_once)?\s+__DIR__\s*\.\s*['"]\/\.\.\/(?:bootstrap|db|cache)\.php['"];\s*/g,
      "",
    )
    .replace(
      /require(?:_once)?\s+__DIR__\s*\.\s*['"]\/(?:helpers|scoring)\.php['"];\s*/g,
      "",
    );
}

function buildMatrixRequestCode(
  query: MatrixRequestQuery,
  scenario: MatrixScenario,
  cacheDir: string,
): string {
  return `<?php
declare(strict_types=1);
define('EUROALT_CACHE_DIR', ${JSON.stringify(`${cacheDir}/`)});
define('EUROALT_CACHE_TTL', 300);
require ${JSON.stringify(cachePath)};
require ${JSON.stringify(helpersPath)};
require ${JSON.stringify(scoringPath)};

$_SERVER['REQUEST_METHOD'] = 'GET';
$_GET = json_decode(${JSON.stringify(JSON.stringify(query))}, true, 512, JSON_THROW_ON_ERROR);
$matrixCatalogScenario = json_decode(${JSON.stringify(JSON.stringify(scenario))}, true, 512, JSON_THROW_ON_ERROR);

final class MatrixCatalogTestStatement
{
    private array $params = [];
    private bool $fetched = false;

    public function __construct(
        private array $scenario,
        private string $sql,
    ) {
    }

    public function execute(?array $params = null): bool
    {
        $this->params = $params ?? [];
        return true;
    }

    public function fetch(int $mode = 0): mixed
    {
        if ($this->fetched) {
            return false;
        }

        $this->fetched = true;
        $rows = $this->rows();

        return $rows[0] ?? false;
    }

    public function fetchAll(int $mode = 0): array
    {
        return $this->rows();
    }

    public function fetchColumn(int $column = 0): mixed
    {
        $row = $this->fetch();
        if (!is_array($row)) {
            return false;
        }

        $values = array_values($row);
        return $values[$column] ?? false;
    }

    private function rows(): array
    {
        return matrix_catalog_test_rows_for_sql($this->sql, $this->params, $this->scenario);
    }
}

final class MatrixCatalogTestPdo
{
    public function __construct(private array $scenario)
    {
    }

    public function prepare(string $sql): MatrixCatalogTestStatement
    {
        return new MatrixCatalogTestStatement($this->scenario, $sql);
    }

    public function query(string $sql): MatrixCatalogTestStatement
    {
        $statement = new MatrixCatalogTestStatement($this->scenario, $sql);
        $statement->execute();

        return $statement;
    }
}

function getDatabaseConnection(): MatrixCatalogTestPdo
{
    global $matrixCatalogScenario;

    if (($matrixCatalogScenario['failOnDb'] ?? false) === true) {
        throw new RuntimeException('Database should not be reached for syntactically invalid matrix requests.');
    }

    return new MatrixCatalogTestPdo($matrixCatalogScenario);
}

function matrix_catalog_test_param(array $params, array $names): mixed
{
    foreach ($names as $name) {
        if (array_key_exists($name, $params)) {
            return $params[$name];
        }

        $colonName = ':' . $name;
        if (array_key_exists($colonName, $params)) {
            return $params[$colonName];
        }
    }

    foreach ($params as $value) {
        if (is_string($value)) {
            return $value;
        }
    }

    return null;
}

function matrix_catalog_test_entry_belongs_to_category(array $entry, string $categoryId): bool
{
    foreach ($entry['memberships'] ?? [] as $membership) {
        if (($membership['category_id'] ?? null) === $categoryId) {
            return true;
        }
    }

    return false;
}

function matrix_catalog_test_entry_is_category_us_vendor(array $scenario, array $entry, string $categoryId): bool
{
    foreach ($scenario['categoryUsVendors'] ?? [] as $vendor) {
        if (
            ($vendor['category_id'] ?? null) === $categoryId
            && (int)($vendor['entry_id'] ?? 0) === (int)($entry['id'] ?? 0)
        ) {
            return true;
        }
    }

    return false;
}

function matrix_catalog_test_find_entry(array $scenario, int $entryId): ?array
{
    foreach ($scenario['alternatives'] as $candidate) {
        if ((int)($candidate['id'] ?? 0) === $entryId) {
            return $candidate;
        }
    }

    return null;
}

function matrix_catalog_test_entry_is_replaced_by_category_alternative(array $scenario, array $entry, string $categoryId): bool
{
    foreach ($scenario['replacements'] ?? [] as $replacement) {
        if ((int)($replacement['replaced_entry_id'] ?? 0) !== (int)($entry['id'] ?? 0)) {
            continue;
        }

        $alternative = matrix_catalog_test_find_entry($scenario, (int)($replacement['entry_id'] ?? 0));
        if ($alternative === null) {
            continue;
        }

        if (($alternative['status'] ?? null) !== 'alternative' || (int)($alternative['is_active'] ?? 0) !== 1) {
            continue;
        }

        if (matrix_catalog_test_entry_belongs_to_category($alternative, $categoryId)) {
            return true;
        }
    }

    return false;
}

function matrix_catalog_test_entry_primary_matches_category(array $entry, string $categoryId): bool
{
    foreach ($entry['memberships'] ?? [] as $membership) {
        if (($membership['category_id'] ?? null) === $categoryId && (int)($membership['is_primary'] ?? 0) === 1) {
            return true;
        }
    }

    return false;
}

function matrix_catalog_test_sql_uses_german_locale(string $sql): bool
{
    return str_contains(strtolower($sql), '_de');
}

function matrix_catalog_test_localized_value(array $row, string $baseKey, bool $usesGermanLocale): mixed
{
    $localizedKey = $baseKey . ($usesGermanLocale ? '_de' : '_en');
    $localizedValue = $row[$localizedKey] ?? null;

    if (is_string($localizedValue) && $localizedValue !== '') {
        return $localizedValue;
    }

    if ($localizedValue !== null && !is_string($localizedValue)) {
        return $localizedValue;
    }

    return $row[$baseKey . '_en'] ?? ($row[$baseKey] ?? null);
}

function matrix_catalog_test_entry_ids_from_params(array $params): array
{
    $entryIds = [];

    foreach ($params as $key => $value) {
        $normalizedKey = ltrim((string)$key, ':');
        if (str_starts_with($normalizedKey, 'entry') && is_numeric($value)) {
            $entryIds[] = (int)$value;
        }
    }

    return $entryIds;
}

function matrix_catalog_test_selected_entry_ids(array $scenario, string $sql, string $categoryId): array
{
    $normalized = strtolower(preg_replace('/\\s+/', ' ', $sql) ?? $sql);
    $usesCategoryMembership = str_contains($normalized, 'entry_categories');
    $filtersAlternativeStatus = preg_match("/\\bce\\.status\\s*=\\s*'alternative'/", $normalized) === 1;
    $filtersAlternativeOrUsStatus = preg_match("/status\\s+in\\s*\\(\\s*'alternative'\\s*,\\s*'us'\\s*\\)/", $normalized) === 1;
    $filtersActive = preg_match('/\\bis_active\\b\\s*=\\s*(?:1|true)/', $normalized) === 1;
    $filtersPrimaryMembership = preg_match('/\\bis_primary\\b\\s*=\\s*(?:1|true)/', $normalized) === 1;
    $selected = [];

    foreach ($scenario['alternatives'] as $entry) {
        if ($filtersAlternativeStatus && ($entry['status'] ?? null) !== 'alternative') {
            continue;
        }

        if ($filtersAlternativeOrUsStatus && !in_array($entry['status'] ?? null, ['alternative', 'us'], true)) {
            continue;
        }

        if ($filtersActive && (int)($entry['is_active'] ?? 0) !== 1) {
            continue;
        }

        if (!$usesCategoryMembership) {
            $selected[] = (int)$entry['id'];
            continue;
        }

        $belongsToCategory = matrix_catalog_test_entry_belongs_to_category($entry, $categoryId);

        if (!$belongsToCategory) {
            continue;
        }

        if (
            $filtersPrimaryMembership
            && !matrix_catalog_test_entry_primary_matches_category($entry, $categoryId)
        ) {
            continue;
        }

        $selected[] = (int)$entry['id'];
    }

    return $selected;
}

function matrix_catalog_test_rows_for_sql(string $sql, array $params, array $scenario): array
{
    $normalized = strtolower(preg_replace('/\\s+/', ' ', $sql) ?? $sql);
    $categoryId = matrix_catalog_test_param($params, ['category', 'category_id', 'categoryId', 'id']);

    if (!is_string($categoryId) || $categoryId === '') {
        $categoryId = (string)$scenario['category']['id'];
    }

    if (str_contains($normalized, 'information_schema.columns')) {
        return [['COUNT(*)' => 1]];
    }

    if (str_contains($normalized, 'matrix_fact_attempts') || str_contains($normalized, 'matrix_fact_verifications')) {
        return $scenario['auditRows'];
    }

    if (str_contains($normalized, 'matrix_facts')) {
        return array_values(array_filter(
            $scenario['facts'],
            static fn (array $fact): bool => ($fact['category_id'] ?? null) === $categoryId,
        ));
    }

    if (str_contains($normalized, 'matrix_criterion_options')) {
        $usesGermanLocale = matrix_catalog_test_sql_uses_german_locale($sql);

        return array_map(
            static fn (array $option): array => [
                'id' => $option['id'],
                'criterion_id' => $option['criterion_id'],
                'option_key' => $option['option_key'],
                'label' => matrix_catalog_test_localized_value($option, 'label', $usesGermanLocale),
                'display_tone' => $option['display_tone'] ?? null,
                'sort_order' => $option['sort_order'] ?? 0,
                'criterion_sort_order' => $option['criterion_sort_order'] ?? 0,
            ],
            $scenario['options'],
        );
    }

    if (str_contains($normalized, 'matrix_criteria')) {
        $usesGermanLocale = matrix_catalog_test_sql_uses_german_locale($sql);

        return array_map(
            static fn (array $criterion): array => [
                'id' => $criterion['id'],
                'group_id' => $criterion['group_id'],
                'criterion_key' => $criterion['criterion_key'],
                'label' => matrix_catalog_test_localized_value($criterion, 'label', $usesGermanLocale),
                'help_text' => matrix_catalog_test_localized_value($criterion, 'help_text', $usesGermanLocale),
                'value_type' => $criterion['value_type'],
                'semantics' => $criterion['semantics'],
                'filter_mode' => $criterion['filter_mode'],
                'display_mode' => $criterion['display_mode'] ?? 'default',
                'sort_order' => $criterion['sort_order'] ?? 0,
            ],
            $scenario['criteria'],
        );
    }

    if (str_contains($normalized, 'matrix_criterion_groups')) {
        $usesGermanLocale = matrix_catalog_test_sql_uses_german_locale($sql);

        return array_map(
            static fn (array $group): array => [
                'id' => $group['id'],
                'group_key' => $group['group_key'],
                'label' => matrix_catalog_test_localized_value($group, 'label', $usesGermanLocale),
                'description' => matrix_catalog_test_localized_value($group, 'description', $usesGermanLocale),
                'sort_order' => $group['sort_order'] ?? 0,
            ],
            $scenario['groups'],
        );
    }

    if (str_contains($normalized, 'scoring_metadata')) {
        $selectedIds = matrix_catalog_test_entry_ids_from_params($params);

        return array_values(array_filter(
            $scenario['scoringMetadata'] ?? [],
            static fn (array $row): bool => count($selectedIds) === 0 || in_array((int)$row['entry_id'], $selectedIds, true),
        ));
    }

    if (str_contains($normalized, 'positive_signals')) {
        $selectedIds = matrix_catalog_test_entry_ids_from_params($params);
        $usesGermanLocale = matrix_catalog_test_sql_uses_german_locale($sql);

        return array_values(array_map(
            static fn (array $row): array => [
                'entry_id' => $row['entry_id'],
                'signal_key' => $row['signal_key'],
                'text' => matrix_catalog_test_localized_value($row, 'text', $usesGermanLocale),
                'text_de' => $row['text_de'] ?? null,
                'dimension' => $row['dimension'],
                'amount' => $row['amount'],
                'source_url' => $row['source_url'] ?? null,
            ],
            array_values(array_filter(
                $scenario['positiveSignals'] ?? [],
                static fn (array $row): bool => count($selectedIds) === 0 || in_array((int)$row['entry_id'], $selectedIds, true),
            )),
        ));
    }

    if (str_contains($normalized, 'reservations')) {
        $selectedIds = matrix_catalog_test_entry_ids_from_params($params);
        $usesGermanLocale = matrix_catalog_test_sql_uses_german_locale($sql);

        return array_values(array_map(
            static fn (array $row): array => [
                'entry_id' => $row['entry_id'],
                'reservation_key' => $row['reservation_key'],
                'text' => matrix_catalog_test_localized_value($row, 'text', $usesGermanLocale),
                'text_de' => $row['text_de'] ?? null,
                'severity' => $row['severity'],
                'event_date' => $row['event_date'] ?? null,
                'source_url' => $row['source_url'] ?? null,
                'penalty_tier' => $row['penalty_tier'] ?? null,
                'penalty_amount' => $row['penalty_amount'] ?? null,
            ],
            array_values(array_filter(
                $scenario['reservations'] ?? [],
                static fn (array $row): bool => count($selectedIds) === 0 || in_array((int)$row['entry_id'], $selectedIds, true),
            )),
        ));
    }

    if (str_contains($normalized, 'entry_tags')) {
        $selectedIds = matrix_catalog_test_entry_ids_from_params($params);

        return array_values(array_filter(
            $scenario['tags'] ?? [],
            static fn (array $row): bool => count($selectedIds) === 0 || in_array((int)$row['entry_id'], $selectedIds, true),
        ));
    }

    if (str_contains($normalized, 'catalog_entries')) {
        $selectedIds = matrix_catalog_test_selected_entry_ids($scenario, $sql, $categoryId);

        return array_values(array_filter(
            $scenario['alternatives'],
            static fn (array $entry): bool => in_array((int)$entry['id'], $selectedIds, true),
        ));
    }

    if (str_contains($normalized, 'entry_categories')) {
        $selectedIds = matrix_catalog_test_entry_ids_from_params($params);

        $memberships = [];
        foreach ($scenario['alternatives'] as $entry) {
            if (count($selectedIds) > 0 && !in_array((int)$entry['id'], $selectedIds, true)) {
                continue;
            }

            if (count($selectedIds) === 0 && !matrix_catalog_test_entry_belongs_to_category($entry, $categoryId)) {
                continue;
            }

            foreach ($entry['memberships'] ?? [] as $membership) {
                $memberships[] = $membership + ['entry_id' => $entry['id']];
            }
        }

        return $memberships;
    }

    if (str_contains($normalized, 'from categories') || str_contains($normalized, ' categories ')) {
        if ($categoryId !== $scenario['category']['id']) {
            return [];
        }

        $usesGermanLocale = matrix_catalog_test_sql_uses_german_locale($sql);
        $category = $scenario['category'];

        return [[
            'id' => $category['id'],
            'emoji' => $category['emoji'] ?? null,
            'name' => matrix_catalog_test_localized_value($category, 'name', $usesGermanLocale),
            'description' => matrix_catalog_test_localized_value($category, 'description', $usesGermanLocale),
        ]];
    }

    return [];
}

${stripMatrixEndpointSource(readMatrixEndpointSource())}
`;
}

async function runMatrixRequest(
  query: MatrixRequestQuery,
  scenario: MatrixScenario = matrixScenario,
  cacheDir = createTempPath("catalog-matrix-cache-"),
): Promise<PhpResponse> {
  const php = await getPhp();
  const code = buildMatrixRequestCode(query, scenario, cacheDir);
  const response = await php.runStream({
    code,
    method: "GET",
    $_SERVER: {
      REQUEST_METHOD: "GET",
    },
  });

  const stdoutText = await response.stdoutText;
  const stderr = await response.stderrText;
  const exitCode = await response.exitCode;

  if (exitCode !== 0) {
    throw new Error(
      `PHP exited with code ${exitCode}: ${stderr}\n${stdoutText}`,
    );
  }

  return {
    status: await response.httpStatusCode,
    headers: await response.headers,
    json: JSON.parse(stdoutText) as unknown,
    stdoutText,
    stderr,
  };
}

function expectMatrixPayload(response: PhpResponse): MatrixPayload {
  expect(response.status).toBe(200);
  expect(getHeader(response.headers, "X-Cache")).toBe("MISS");

  return response.json as MatrixPayload;
}

function findAlternative(
  payload: MatrixPayload,
  id: string,
): MatrixAlternative {
  const alternative = payload.data.alternatives.find(
    (entry) => entry.id === id,
  );

  if (alternative === undefined) {
    throw new Error(`Expected matrix response to include alternative "${id}".`);
  }

  return alternative;
}

afterAll(async () => {
  if (phpPromise) {
    const php = await phpPromise;
    php.exit(0);
  }

  for (const tempPath of tempPaths) {
    rmSync(tempPath, { recursive: true, force: true });
  }
});

describe("catalog matrix API endpoint", () => {
  it("rejects missing and empty categories before reaching the database", async () => {
    const requests: MatrixRequestQuery[] = [
      { locale: "en" },
      { category: "", locale: "en" },
      { category: "   ", locale: "en" },
    ];

    for (const query of requests) {
      const response = await runMatrixRequest(query, {
        ...matrixScenario,
        failOnDb: true,
      });

      expect(response.status).toBe(400);
      expect(response.json).toMatchObject({
        ok: false,
        error: "missing_category",
      });
    }
  });

  it("rejects unsupported locales before reaching the database", async () => {
    const response = await runMatrixRequest(
      { category: "messaging", locale: "fr" },
      { ...matrixScenario, failOnDb: true },
    );

    expect(response.status).toBe(400);
    expect(response.json).toMatchObject({
      ok: false,
      error: "invalid_locale",
    });
  });

  it("rejects non-scalar category and locale query parameters before reaching the database", async () => {
    const categoryResponse = await runMatrixRequest(
      { category: ["messaging", "email"], locale: "en" },
      { ...matrixScenario, failOnDb: true },
    );

    expect(categoryResponse.status).toBe(400);
    expect(categoryResponse.json).toMatchObject({
      ok: false,
      error: "invalid_category",
    });

    const localeResponse = await runMatrixRequest(
      { category: "messaging", locale: ["en", "de"] },
      { ...matrixScenario, failOnDb: true },
    );

    expect(localeResponse.status).toBe(400);
    expect(localeResponse.json).toMatchObject({
      ok: false,
      error: "invalid_locale",
    });
  });

  it("rejects categories that do not exist in the database", async () => {
    const response = await runMatrixRequest({
      category: "does-not-exist",
      locale: "en",
    });

    expect(response.status).toBe(400);
    expect(response.json).toMatchObject({
      ok: false,
      error: "invalid_category",
    });
  });

  it("defaults omitted locale to English and returns category metadata", async () => {
    const payload = expectMatrixPayload(
      await runMatrixRequest({ category: "messaging" }),
    );

    expect(payload.meta).toMatchObject({
      category: "messaging",
      locale: "en",
    });
    expect(payload.data.category).toEqual({
      id: "messaging",
      name: "Messaging",
      description: "Secure messaging and chat apps",
      emoji: "chat",
    });
  });

  it("returns localized category metadata and matrix labels for German requests", async () => {
    const payload = expectMatrixPayload(
      await runMatrixRequest({ category: "messaging", locale: "de" }),
    );

    expect(payload.meta.locale).toBe("de");
    expect(payload.data.category).toEqual({
      id: "messaging",
      name: "Messaging DE",
      description: "Sichere Messenger",
      emoji: "chat",
    });
    expect(payload.data.groups[0]).toMatchObject({
      id: "trust",
      label: "Vertrauen",
      description: "Kategorieübergreifende Bewertung aus dem Vetting.",
    });
    expect(payload.data.groups[0]?.criteria[0]).toMatchObject({
      id: "trust_score",
      label: "Trust-Score",
      helpText: "Unsere eigene Bewertung aus dem Vetting.",
    });
    expect(payload.data.groups[1]).toMatchObject({
      id: "compliance",
      label: "Compliance DE",
      description: "Rechtsraum",
    });
    expect(payload.data.groups[1]?.criteria[0]).toMatchObject({
      id: "hosting_region",
      label: "Hosting-Region",
      helpText: "Wo Kontodaten hauptsächlich gehostet werden",
    });
    expect(payload.data.groups[1]?.criteria[0]?.options).toEqual([
      { id: "eu", label: "EU", displayTone: "positive" },
      { id: "global", label: "Global DE", displayTone: "neutral" },
    ]);
  });

  it("returns ordered groups, criteria, options, and active secondary-category alternatives for one category", async () => {
    const payload = expectMatrixPayload(
      await runMatrixRequest({ category: "messaging", locale: "en" }),
    );

    expect(payload.meta).toMatchObject({
      category: "messaging",
      locale: "en",
      groupCount: 3,
      criterionCount: 3,
      alternativeCount: 4,
    });
    expect(payload.data.groups.map((group) => group.id)).toEqual([
      "trust",
      "compliance",
      "privacy",
    ]);
    expect(
      payload.data.groups[0]?.criteria.map((criterion) => criterion.id),
    ).toEqual(["trust_score"]);
    expect(
      payload.data.groups[1]?.criteria.map((criterion) => criterion.id),
    ).toEqual(["hosting_region"]);
    expect(
      payload.data.groups[1]?.criteria[0]?.options.map((option) => option.id),
    ).toEqual(["eu", "global"]);

    expect(payload.data.alternatives.map((entry) => entry.id).sort()).toEqual([
      "primary-chat",
      "secondary-chat",
      "signal",
      "us-chat",
    ]);
    expect(payload.data.alternatives.map((entry) => entry.id)).not.toContain(
      "inactive-chat",
    );
    expect(payload.data.alternatives.map((entry) => entry.id)).not.toContain(
      "draft-chat",
    );
    expect(payload.data.alternatives.map((entry) => entry.id)).not.toContain(
      "jira",
    );
    expect(findAlternative(payload, "secondary-chat")).toMatchObject({
      category: "productivity",
      secondaryCategories: ["messaging"],
    });
    expect(findAlternative(payload, "us-chat")).toMatchObject({
      status: "us",
      country: "us",
      category: null,
      secondaryCategories: ["messaging"],
    });
    expect(findAlternative(payload, "signal")).toMatchObject({
      status: "us",
      country: "us",
      category: null,
      secondaryCategories: ["messaging"],
    });
  });

  it("returns persisted logo paths verbatim and keeps a missing path null", async () => {
    const response = await runMatrixRequest({
      category: "messaging",
      locale: "en",
    });
    const payload = expectMatrixPayload(response);
    const explicitLogo = findAlternative(payload, "primary-chat");
    const missingLogo = findAlternative(payload, "secondary-chat");

    expect(explicitLogo).toHaveProperty("logo", "/logos/primary-chat.svg");
    expect(missingLogo).toHaveProperty("logo", null);
    expect(response.stdoutText).not.toContain("/logos/secondary-chat.svg");
  });

  it("prepends the global Trust Score criterion and exposes only vetted scores", async () => {
    const payload = expectMatrixPayload(
      await runMatrixRequest({ category: "messaging", locale: "en" }),
    );
    const primary = findAlternative(payload, "primary-chat");
    const secondary = findAlternative(payload, "secondary-chat");
    const usVendor = findAlternative(payload, "us-chat");
    const replacementVendor = findAlternative(payload, "signal");

    expect(payload.data.groups[0]).toMatchObject({
      id: "trust",
      label: "Trust",
    });
    expect(payload.data.groups[0]?.criteria[0]).toMatchObject({
      id: "trust_score",
      label: "Trust Score",
      valueType: "number",
      semantics: "beneficial",
      filterMode: "none",
      options: [],
    });
    expect(primary.facts.trust_score).toMatchObject({
      status: "verified",
    });
    expect(typeof primary.facts.trust_score.value).toBe("number");
    expect(primary.facts.trust_score).not.toHaveProperty("source");
    expect(secondary.facts.trust_score).toEqual({
      status: "unverified",
      value: null,
    });
    expect(usVendor.facts.trust_score).toMatchObject({
      status: "verified",
    });
    expect(typeof usVendor.facts.trust_score.value).toBe("number");
    expect(replacementVendor.facts.trust_score).toMatchObject({
      status: "verified",
    });
    expect(typeof replacementVendor.facts.trust_score.value).toBe("number");
  });

  it("serves repeated matrix requests from cache without requiring database access", async () => {
    const cacheDir = createTempPath("catalog-matrix-cache-");
    const firstPayload = expectMatrixPayload(
      await runMatrixRequest(
        { category: "messaging", locale: "en" },
        matrixScenario,
        cacheDir,
      ),
    );
    const cachedResponse = await runMatrixRequest(
      { category: "messaging", locale: "en" },
      { ...matrixScenario, failOnDb: true },
      cacheDir,
    );

    expect(cachedResponse.status).toBe(200);
    expect(getHeader(cachedResponse.headers, "X-Cache")).toBe("HIT");
    expect(cachedResponse.json).toEqual(firstPayload);
  });

  it("maps missing and unresolved facts to unverified while exposing only public verified-source metadata", async () => {
    const payload = expectMatrixPayload(
      await runMatrixRequest({ category: "messaging", locale: "en" }),
    );
    const primary = findAlternative(payload, "primary-chat");
    const secondary = findAlternative(payload, "secondary-chat");

    expect(primary.facts.hosting_region).toMatchObject({
      status: "unverified",
      value: null,
    });
    expect(primary.facts.hosting_region).not.toHaveProperty("source");
    expect(secondary.facts.e2ee).toMatchObject({
      status: "unverified",
      value: null,
    });

    expect(primary.facts.e2ee).toEqual({
      status: "verified",
      value: true,
      source: {
        url: "https://primary-chat.example/security",
        title: "Primary Chat security whitepaper",
        accessedDate: "2026-05-24",
      },
    });

    const serialized = JSON.stringify(payload);
    expect(serialized).not.toContain("AUDIT_QUOTE_SHOULD_NOT_LEAK");
    expect(serialized).not.toContain("RAW_RESPONSE_SHOULD_NOT_LEAK");
    expect(serialized).not.toContain("audit_quote");
    expect(serialized).not.toContain("raw_response");
    expect(serialized).not.toContain("auditQuote");
    expect(serialized).not.toContain("rawResponse");
  });

  it("maps every unresolved fact status to unverified without leaking stale values or sources", async () => {
    const unresolvedStatuses = [
      "researching",
      "rejected",
      "needs-deeper-research",
    ];
    const unresolvedCriteria = unresolvedStatuses.map((status, index) => ({
      id: 700 + index,
      category_id: "messaging",
      group_id: 20,
      criterion_key: `${status.replace(/-/g, "_")}_fact`,
      label: `Unresolved ${status}`,
      help_text: `Unresolved ${status} help`,
      value_type: "text",
      semantics: "informational",
      filter_mode: "optional",
      sort_order: 10 + index,
    }));
    const unresolvedFacts = unresolvedStatuses.map((status, index) => ({
      id: 9100 + index,
      entry_id: 501,
      category_id: "messaging",
      criterion_id: 700 + index,
      criterion_key: `${status.replace(/-/g, "_")}_fact`,
      status,
      value_bool: null,
      value_number: null,
      value_text: `stale ${status} value`,
      value_json: null,
      public_source_url: `https://primary-chat.example/${status}`,
      public_source_title: `Stale ${status} source`,
      public_source_accessed_date: "2026-05-24",
    }));
    const payload = expectMatrixPayload(
      await runMatrixRequest(
        { category: "messaging", locale: "en" },
        {
          ...matrixScenario,
          criteria: [...matrixScenario.criteria, ...unresolvedCriteria],
          facts: [...matrixScenario.facts, ...unresolvedFacts],
        },
      ),
    );
    const primary = findAlternative(payload, "primary-chat");

    for (const status of unresolvedStatuses) {
      const criterionKey = `${status.replace(/-/g, "_")}_fact`;

      expect(primary.facts[criterionKey]).toEqual({
        status: "unverified",
        value: null,
      });
      expect(primary.facts[criterionKey]).not.toHaveProperty("source");
    }
  });

  it("maps verified non-boolean values and not-applicable facts without leaking stale values", async () => {
    const typedScenario: MatrixScenario = {
      ...matrixScenario,
      criteria: [
        ...matrixScenario.criteria,
        {
          id: 300,
          category_id: "messaging",
          group_id: 20,
          criterion_key: "server_count",
          label: "Server count",
          help_text: "Number of documented EU servers",
          value_type: "number",
          semantics: "beneficial",
          filter_mode: "optional",
          sort_order: 2,
        },
        {
          id: 400,
          category_id: "messaging",
          group_id: 20,
          criterion_key: "supported_platforms",
          label: "Supported platforms",
          help_text: "Supported mobile platforms",
          value_type: "multi_enum",
          semantics: "informational",
          filter_mode: "optional",
          sort_order: 3,
        },
        {
          id: 500,
          category_id: "messaging",
          group_id: 20,
          criterion_key: "support_url",
          label: "Support URL",
          help_text: "Public support page",
          value_type: "url",
          semantics: "informational",
          filter_mode: "optional",
          sort_order: 4,
        },
        {
          id: 600,
          category_id: "messaging",
          group_id: 20,
          criterion_key: "self_hosting",
          label: "Self-hosting",
          help_text: "Whether self-hosting is applicable",
          value_type: "boolean",
          semantics: "informational",
          filter_mode: "optional",
          sort_order: 5,
        },
      ],
      options: [
        ...matrixScenario.options,
        {
          id: 401,
          criterion_id: 400,
          criterion_key: "supported_platforms",
          option_key: "ios",
          label: "iOS",
          display_tone: "neutral",
          sort_order: 1,
        },
        {
          id: 402,
          criterion_id: 400,
          criterion_key: "supported_platforms",
          option_key: "android",
          label: "Android",
          display_tone: "neutral",
          sort_order: 2,
        },
      ],
      facts: [
        ...matrixScenario.facts,
        {
          id: 9003,
          entry_id: 501,
          category_id: "messaging",
          criterion_id: 300,
          criterion_key: "server_count",
          status: "verified",
          value_bool: null,
          value_number: "12.5",
          value_text: null,
          value_json: null,
          public_source_url: "",
          public_source_title: "",
          public_source_accessed_date: "",
        },
        {
          id: 9004,
          entry_id: 501,
          category_id: "messaging",
          criterion_id: 400,
          criterion_key: "supported_platforms",
          status: "verified",
          value_bool: null,
          value_number: null,
          value_text: null,
          value_json: '["ios","android"]',
          public_source_url: "",
          public_source_title: "",
          public_source_accessed_date: "",
        },
        {
          id: 9005,
          entry_id: 501,
          category_id: "messaging",
          criterion_id: 500,
          criterion_key: "support_url",
          status: "verified",
          value_bool: null,
          value_number: null,
          value_text: "https://primary-chat.example/help",
          value_json: null,
          public_source_url: "",
          public_source_title: "",
          public_source_accessed_date: "",
        },
        {
          id: 9006,
          entry_id: 501,
          category_id: "messaging",
          criterion_id: 600,
          criterion_key: "self_hosting",
          status: "not-applicable",
          value_bool: 1,
          value_number: null,
          value_text: "stale-not-applicable-value",
          value_json: null,
          public_source_url: "https://primary-chat.example/irrelevant-source",
          public_source_title: "Irrelevant source",
          public_source_accessed_date: "2026-05-24",
        },
      ],
    };

    const payload = expectMatrixPayload(
      await runMatrixRequest(
        { category: "messaging", locale: "en" },
        typedScenario,
      ),
    );
    const primary = findAlternative(payload, "primary-chat");

    expect(primary.facts.server_count).toEqual({
      status: "verified",
      value: 12.5,
    });
    expect(primary.facts.supported_platforms).toEqual({
      status: "verified",
      value: ["ios", "android"],
    });
    expect(primary.facts.support_url).toEqual({
      status: "verified",
      value: "https://primary-chat.example/help",
    });
    expect(primary.facts.self_hosting).toEqual({
      status: "not_applicable",
      value: null,
    });
  });
});
