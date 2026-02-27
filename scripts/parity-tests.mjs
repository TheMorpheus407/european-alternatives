#!/usr/bin/env node

/**
 * Parity Test Suite for DB Migration (Phase 1)
 *
 * Validates that the DB import (via tmp/export/catalog.json) or API endpoints
 * produce results identical to the TypeScript source-of-truth data.
 *
 * The catalog.json uses a flat, DB-ready format with snake_case field names.
 * See scripts/db-import.php for the authoritative JSON structure.
 *
 * Usage:
 *   npx tsx scripts/parity-tests.mjs                          # all tests, catalog.json mode
 *   npx tsx scripts/parity-tests.mjs --skip-api               # skip API tests (14, 15)
 *   npx tsx scripts/parity-tests.mjs --api-base http://host   # custom API base URL
 *   npx tsx scripts/parity-tests.mjs --catalog path/to/file   # custom catalog.json path
 *
 * 15 parity tests from DB_MIGRATION_PLAN.md Section 7:
 *   1.  Entry count parity
 *   2.  Trust score parity
 *   3.  Tag parity
 *   4.  Category assignment parity
 *   5.  US vendor alias resolution
 *   6.  US vendor comparison dedup
 *   7.  Reservation/signal count
 *   8.  Translation fallback
 *   9.  Denied entry parity
 *   10. Landing + further reading
 *   11. Schema constraints (on catalog.json structure)
 *   12. Open-source consistency
 *   13. Manual-over-research dedup
 *   14. API payload spot-check (requires API)
 *   15. Full API contract test (requires API)
 */

import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

// ---------------------------------------------------------------------------
// Resolve project root
// ---------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Parse CLI args
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);

function getArg(name) {
  const idx = args.indexOf(name);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

const SKIP_API = args.includes('--skip-api');
const API_BASE = getArg('--api-base') || 'https://european-alternatives.cloud';
const CATALOG_PATH = getArg('--catalog') || path.join(ROOT, 'tmp', 'export', 'catalog.json');

// ---------------------------------------------------------------------------
// Import TS source-of-truth modules (requires tsx runtime)
// ---------------------------------------------------------------------------
const { alternatives } = await import('../src/data/alternatives.ts');
const { categories } = await import('../src/data/categories.ts');
const { manualAlternatives } = await import('../src/data/manualAlternatives.ts');
const { researchAlternatives } = await import('../src/data/researchAlternatives.ts');
const { reservationsById } = await import('../src/data/trustOverrides.ts');
const { positiveSignalsById } = await import('../src/data/positiveSignals.ts');
const { scoringMetadata } = await import('../src/data/scoringData.ts');
const { furtherReadingResources } = await import('../src/data/furtherReading.ts');
const { landingCategoryGroups } = await import('../src/data/landingCategoryGroups.ts');
const {
  US_VENDOR_RECORDS,
  US_VENDOR_TRUST_PROFILES,
  buildUSVendorComparisons,
  resolveUSVendorComparison,
} = await import('../src/data/usVendors.ts');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a lookup map from the merged alternatives array, keyed by id. */
function buildAlternativeMap() {
  const map = new Map();
  for (const alt of alternatives) {
    map.set(alt.id, alt);
  }
  return map;
}

const altMap = buildAlternativeMap();

/** Try to load the catalog.json export file. Returns null if not found. */
function loadCatalog() {
  if (!fs.existsSync(CATALOG_PATH)) return null;
  const raw = fs.readFileSync(CATALOG_PATH, 'utf8');
  return JSON.parse(raw);
}

/** Count denied alternatives by parsing DENIED_ALTERNATIVES.md headings. */
function countDeniedAlternativesFromMarkdown() {
  const mdPath = path.join(ROOT, 'DENIED_ALTERNATIVES.md');
  if (!fs.existsSync(mdPath)) return 0;
  const content = fs.readFileSync(mdPath, 'utf8');
  // Each denied entry is a ## heading (not the top # heading)
  const matches = content.match(/^## .+$/gm);
  return matches ? matches.length : 0;
}

/** Parse denied alternatives from markdown, returning structured entries. */
function parseDeniedAlternativesFromMarkdown() {
  const mdPath = path.join(ROOT, 'DENIED_ALTERNATIVES.md');
  if (!fs.existsSync(mdPath)) return [];
  const content = fs.readFileSync(mdPath, 'utf8');

  const entries = [];
  // Split on ## headings
  const sections = content.split(/^## /m).slice(1); // skip preamble before first ##

  for (const section of sections) {
    const lines = section.split('\n');
    const titleLine = lines[0].trim();
    // Extract name (before parenthesized category)
    const nameMatch = titleLine.match(/^(.+?)\s*\((.+)\)\s*$/);
    const name = nameMatch ? nameMatch[1].trim() : titleLine;
    const rawCategory = nameMatch ? nameMatch[2].trim() : null;

    // Extract metadata
    const proposedIn = extractBoldField(section, 'Proposed in');
    const claimedOrigin = extractBoldField(section, 'Claimed origin');
    const actualOrigin = extractBoldField(section, 'Actual origin');
    const removedIn = extractBoldField(section, 'Previously listed, removed in');

    // Extract failed gateways from text
    const failedGateways = [];
    const gwMatches = section.matchAll(/fails?\s+(G\d+)/gi);
    for (const m of gwMatches) {
      if (!failedGateways.includes(m[1].toUpperCase())) {
        failedGateways.push(m[1].toUpperCase());
      }
    }

    // Extract sources (markdown links under ### Sources)
    const sourcesSection = section.match(/### Sources\s*\n([\s\S]*?)(?=\n---|\n## |$)/);
    const sources = [];
    if (sourcesSection) {
      const linkMatches = sourcesSection[1].matchAll(/\[([^\]]+)\]\(([^)]+)\)/g);
      for (const lm of linkMatches) {
        sources.push(lm[2]);
      }
    }

    entries.push({
      name,
      rawCategory,
      proposedIn,
      claimedOrigin,
      actualOrigin,
      removedIn,
      failedGateways,
      sources,
    });
  }

  return entries;
}

function extractBoldField(text, label) {
  const re = new RegExp(`\\*\\*${label}:\\*\\*\\s*(.+)`, 'i');
  const m = text.match(re);
  return m ? m[1].trim() : null;
}

/** Deep comparison for simple JSON-serializable values. Returns diff string or null. */
function deepDiff(expected, actual, path = '') {
  if (expected === actual) return null;
  if (expected === undefined && actual === undefined) return null;
  if (expected === null && actual === null) return null;

  if (typeof expected !== typeof actual) {
    return `${path}: type mismatch (expected ${typeof expected}, got ${typeof actual})`;
  }

  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) {
      return `${path}: expected array, got ${typeof actual}`;
    }
    if (expected.length !== actual.length) {
      return `${path}: array length mismatch (expected ${expected.length}, got ${actual.length})`;
    }
    const diffs = [];
    for (let i = 0; i < expected.length; i++) {
      const d = deepDiff(expected[i], actual[i], `${path}[${i}]`);
      if (d) diffs.push(d);
    }
    return diffs.length > 0 ? diffs.join('\n') : null;
  }

  if (expected && typeof expected === 'object') {
    if (!actual || typeof actual !== 'object') {
      return `${path}: expected object, got ${typeof actual}`;
    }
    const allKeys = new Set([...Object.keys(expected), ...Object.keys(actual)]);
    const diffs = [];
    for (const key of allKeys) {
      const d = deepDiff(expected[key], actual[key], path ? `${path}.${key}` : key);
      if (d) diffs.push(d);
    }
    return diffs.length > 0 ? diffs.join('\n') : null;
  }

  if (typeof expected === 'number' && typeof actual === 'number') {
    // Allow small floating-point tolerance
    if (Math.abs(expected - actual) < 0.0001) return null;
  }

  return `${path}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`;
}

/** Fetch JSON from an API endpoint. Returns { data, error }. */
async function fetchApi(endpoint) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const resp = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(15000),
    });
    if (!resp.ok) {
      return { data: null, error: `HTTP ${resp.status} ${resp.statusText}` };
    }
    const data = await resp.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

/** Pick N random items from an array (Fisher-Yates partial shuffle). */
function randomSample(arr, n) {
  const copy = [...arr];
  const result = [];
  for (let i = 0; i < Math.min(n, copy.length); i++) {
    const j = i + Math.floor(Math.random() * (copy.length - i));
    [copy[i], copy[j]] = [copy[j], copy[i]];
    result.push(copy[i]);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Catalog helpers for the flat DB-ready format
// ---------------------------------------------------------------------------

/**
 * Filter catalog_entries by status.
 * Returns flat array of entry objects with snake_case fields.
 */
function getCatalogEntriesByStatus(catalog, status) {
  return (catalog.catalog_entries || []).filter(e => e.status === status);
}

/**
 * Build a Map from entry_slug -> entry for catalog_entries with a given status.
 */
function buildCatalogEntryMap(catalog, status) {
  const map = new Map();
  for (const entry of getCatalogEntriesByStatus(catalog, status)) {
    map.set(entry.slug, entry);
  }
  return map;
}

/**
 * Build a Map from entry_slug -> array of related rows from a junction table.
 * The junction table rows must have an `entry_slug` field.
 */
function groupByEntrySlug(rows) {
  const map = new Map();
  for (const row of rows || []) {
    const slug = row.entry_slug;
    if (!map.has(slug)) map.set(slug, []);
    map.get(slug).push(row);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Test definitions
// ---------------------------------------------------------------------------

/**
 * Test 1: Entry count parity
 * Alternative, US vendor, and denied counts match TS totals.
 */
async function test01_entryCountParity() {
  const catalog = loadCatalog();
  if (!catalog) {
    return { pass: false, message: 'catalog.json not found at ' + CATALOG_PATH };
  }

  const diffs = [];

  // Alternative count: filter catalog_entries by status === 'alternative'
  const expectedAltCount = alternatives.length;
  const catalogAlts = getCatalogEntriesByStatus(catalog, 'alternative').length;
  if (expectedAltCount !== catalogAlts) {
    diffs.push(`Alternatives: expected ${expectedAltCount}, got ${catalogAlts}`);
  }

  // US vendor count: catalog.us_vendors is the flat array of vendor records
  const expectedVendorCount = US_VENDOR_RECORDS.length;
  const catalogVendors = (catalog.us_vendors || []).length;
  if (expectedVendorCount !== catalogVendors) {
    diffs.push(`US vendors: expected ${expectedVendorCount}, got ${catalogVendors}`);
  }

  // Denied count (from markdown vs catalog.denied_decisions)
  const expectedDeniedCount = countDeniedAlternativesFromMarkdown();
  const catalogDenied = (catalog.denied_decisions || []).length;
  if (expectedDeniedCount !== catalogDenied) {
    diffs.push(`Denied: expected ${expectedDeniedCount}, got ${catalogDenied}`);
  }

  // Category count
  const expectedCategoryCount = categories.length;
  const catalogCategories = (catalog.categories || []).length;
  if (expectedCategoryCount !== catalogCategories) {
    diffs.push(`Categories: expected ${expectedCategoryCount}, got ${catalogCategories}`);
  }

  if (diffs.length > 0) {
    return { pass: false, message: 'Count mismatches found', details: diffs.join('\n') };
  }

  return {
    pass: true,
    message: `Counts match: ${expectedAltCount} alternatives, ${expectedVendorCount} US vendors, ${expectedDeniedCount} denied, ${expectedCategoryCount} categories`,
  };
}

/**
 * Test 2: Trust score parity
 * Vetted scores match trustScore.ts output (score, status, breakdown).
 *
 * Trust scores are in catalog.trust_scores, matched by entry_slug.
 * The trust_score_10_display field is the 0-10 scale score.
 */
async function test02_trustScoreParity() {
  const catalog = loadCatalog();
  if (!catalog) {
    return { pass: false, message: 'catalog.json not found' };
  }

  // Build a map from entry_slug -> trust score row
  const trustScoreMap = new Map();
  for (const row of catalog.trust_scores || []) {
    trustScoreMap.set(row.entry_slug, row);
  }

  const diffs = [];

  for (const alt of alternatives) {
    const tsRow = trustScoreMap.get(alt.id);

    // Compare trust score (0-10 scale): trust_score_10_display in catalog
    if (alt.trustScore !== undefined) {
      if (!tsRow) {
        diffs.push(`${alt.id}: has trustScore in TS but missing from catalog trust_scores`);
        continue;
      }
      if (tsRow.trust_score_10_display !== undefined && tsRow.trust_score_10_display !== null) {
        if (Math.abs(alt.trustScore - tsRow.trust_score_10_display) > 0.05) {
          diffs.push(`${alt.id}: trustScore expected ${alt.trustScore}, got ${tsRow.trust_score_10_display}`);
        }
      }
    } else if (tsRow && tsRow.trust_score_10_display !== undefined && tsRow.trust_score_10_display !== null) {
      diffs.push(`${alt.id}: no trustScore in TS but catalog has ${tsRow.trust_score_10_display}`);
    }

    // Compare trust score status
    if (tsRow) {
      if (alt.trustScoreStatus !== tsRow.trust_score_status) {
        diffs.push(`${alt.id}: trustScoreStatus expected "${alt.trustScoreStatus}", got "${tsRow.trust_score_status}"`);
      }

      // Compare breakdown if both exist
      if (alt.trustScoreBreakdown && tsRow.trust_score_breakdown_json) {
        const bd = alt.trustScoreBreakdown;
        // trust_score_breakdown_json may be a string or already-parsed object
        const cbd = typeof tsRow.trust_score_breakdown_json === 'string'
          ? JSON.parse(tsRow.trust_score_breakdown_json)
          : tsRow.trust_score_breakdown_json;

        if (cbd) {
          if (bd.baseClass !== cbd.baseClass) {
            diffs.push(`${alt.id}: breakdown.baseClass expected "${bd.baseClass}", got "${cbd.baseClass}"`);
          }
          if (bd.baseScore !== cbd.baseScore) {
            diffs.push(`${alt.id}: breakdown.baseScore expected ${bd.baseScore}, got ${cbd.baseScore}`);
          }
          if (Math.abs(bd.finalScore100 - cbd.finalScore100) > 0.5) {
            diffs.push(`${alt.id}: breakdown.finalScore100 expected ${bd.finalScore100}, got ${cbd.finalScore100}`);
          }
        }
      }
    }
  }

  if (diffs.length > 0) {
    return {
      pass: false,
      message: `${diffs.length} trust score mismatches`,
      details: diffs.slice(0, 20).join('\n') + (diffs.length > 20 ? `\n... and ${diffs.length - 20} more` : ''),
    };
  }

  return { pass: true, message: `All ${alternatives.length} trust scores match` };
}

/**
 * Test 3: Tag parity
 * Tags per entry are in catalog.entry_tags (filter by entry_slug, order by sort_order).
 * Compare tag slugs against the TS source tags array.
 */
async function test03_tagParity() {
  const catalog = loadCatalog();
  if (!catalog) {
    return { pass: false, message: 'catalog.json not found' };
  }

  // Group entry_tags by entry_slug, sorted by sort_order
  const tagsByEntry = groupByEntrySlug(catalog.entry_tags);

  const diffs = [];

  for (const alt of alternatives) {
    const catalogTagRows = (tagsByEntry.get(alt.id) || [])
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const actualTags = catalogTagRows.map(r => r.tag_slug);

    const expectedTags = alt.tags;

    if (expectedTags.length !== actualTags.length) {
      diffs.push(`${alt.id}: tag count mismatch (expected ${expectedTags.length}, got ${actualTags.length})`);
      continue;
    }

    for (let i = 0; i < expectedTags.length; i++) {
      if (expectedTags[i] !== actualTags[i]) {
        diffs.push(`${alt.id}: tag[${i}] expected "${expectedTags[i]}", got "${actualTags[i]}"`);
      }
    }
  }

  if (diffs.length > 0) {
    return {
      pass: false,
      message: `${diffs.length} tag mismatches`,
      details: diffs.slice(0, 20).join('\n') + (diffs.length > 20 ? `\n... and ${diffs.length - 20} more` : ''),
    };
  }

  return { pass: true, message: `All tags match across ${alternatives.length} entries` };
}

/**
 * Test 4: Category assignment parity
 * Categories are in catalog.entry_categories (filter by entry_slug).
 * Primary has is_primary === true. Non-primary are secondary categories.
 */
async function test04_categoryParity() {
  const catalog = loadCatalog();
  if (!catalog) {
    return { pass: false, message: 'catalog.json not found' };
  }

  // Group entry_categories by entry_slug
  const catsByEntry = groupByEntrySlug(catalog.entry_categories);

  const diffs = [];

  for (const alt of alternatives) {
    const catalogCatRows = catsByEntry.get(alt.id) || [];

    // Find the primary category
    const primaryRow = catalogCatRows.find(r => r.is_primary === true);
    const primaryCatId = primaryRow ? primaryRow.category_id : null;

    if (alt.category !== primaryCatId) {
      diffs.push(`${alt.id}: primary category expected "${alt.category}", got "${primaryCatId}"`);
    }

    // Secondary categories: all non-primary rows, sorted by sort_order
    const expectedSecondary = alt.secondaryCategories || [];
    const actualSecondary = catalogCatRows
      .filter(r => !r.is_primary)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map(r => r.category_id);

    if (expectedSecondary.length !== actualSecondary.length) {
      diffs.push(`${alt.id}: secondary category count mismatch (expected ${expectedSecondary.length}, got ${actualSecondary.length})`);
    } else {
      for (let i = 0; i < expectedSecondary.length; i++) {
        if (expectedSecondary[i] !== actualSecondary[i]) {
          diffs.push(`${alt.id}: secondaryCategories[${i}] expected "${expectedSecondary[i]}", got "${actualSecondary[i]}"`);
        }
      }
    }
  }

  if (diffs.length > 0) {
    return {
      pass: false,
      message: `${diffs.length} category mismatches`,
      details: diffs.slice(0, 20).join('\n') + (diffs.length > 20 ? `\n... and ${diffs.length - 20} more` : ''),
    };
  }

  return { pass: true, message: `All categories match across ${alternatives.length} entries` };
}

/**
 * Test 5: US vendor alias resolution
 * Aliases are in catalog.us_vendor_aliases: [{vendor_slug, alias_normalized}].
 * Verify that the TS resolveUSVendorComparison function and catalog aliases agree.
 */
async function test05_usVendorAliasResolution() {
  const catalog = loadCatalog();
  if (!catalog) {
    return { pass: false, message: 'catalog.json not found' };
  }

  // Build a lookup: alias_normalized -> vendor_slug from catalog
  const catalogAliasMap = new Map();
  for (const row of catalog.us_vendor_aliases || []) {
    catalogAliasMap.set(row.alias_normalized, row.vendor_slug);
  }

  const diffs = [];

  for (const record of US_VENDOR_RECORDS) {
    // Check that resolving the canonical name returns the correct id
    const resolved = resolveUSVendorComparison(record.name);
    if (resolved.id !== record.id) {
      diffs.push(`Canonical "${record.name}": expected id "${record.id}", resolved to "${resolved.id}"`);
    }

    // Check each alias
    for (const alias of record.aliases) {
      if (!alias.trim()) continue;
      const aliasResolved = resolveUSVendorComparison(alias);
      if (aliasResolved.id !== record.id) {
        diffs.push(`Alias "${alias}": expected vendor "${record.id}", resolved to "${aliasResolved.id}"`);
      }

      // If catalog includes this alias, verify it maps to the correct vendor slug
      const normalized = alias.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      const catalogVendorSlug = catalogAliasMap.get(normalized);
      if (catalogVendorSlug !== undefined && catalogVendorSlug !== record.id) {
        diffs.push(`Catalog alias "${normalized}": expected vendor "${record.id}", got "${catalogVendorSlug}"`);
      }
    }
  }

  if (diffs.length > 0) {
    return {
      pass: false,
      message: `${diffs.length} alias resolution mismatches`,
      details: diffs.slice(0, 20).join('\n') + (diffs.length > 20 ? `\n... and ${diffs.length - 20} more` : ''),
    };
  }

  const totalAliases = US_VENDOR_RECORDS.reduce((sum, r) => sum + r.aliases.length, 0);
  return {
    pass: true,
    message: `All ${totalAliases} aliases across ${US_VENDOR_RECORDS.length} vendors resolve correctly`,
  };
}

/**
 * Test 6: US vendor comparison dedup
 * Use catalog.entry_replacements to check replacements per entry.
 * Each replacement row has {entry_slug, raw_name, vendor_slug, sort_order}.
 */
async function test06_usVendorComparisonDedup() {
  const catalog = loadCatalog();
  if (!catalog) {
    return { pass: false, message: 'catalog.json not found' };
  }

  // Group entry_replacements by entry_slug
  const replacementsByEntry = groupByEntrySlug(catalog.entry_replacements);

  const diffs = [];

  for (const alt of alternatives) {
    const expectedComparisons = alt.usVendorComparisons || [];
    const catalogReplacements = (replacementsByEntry.get(alt.id) || [])
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    if (expectedComparisons.length !== catalogReplacements.length) {
      diffs.push(`${alt.id}: comparison count mismatch (expected ${expectedComparisons.length}, got ${catalogReplacements.length})`);
      continue;
    }

    for (let i = 0; i < expectedComparisons.length; i++) {
      const exp = expectedComparisons[i];
      const act = catalogReplacements[i];

      // vendor_slug in the catalog should match the resolved vendor id
      if (act.vendor_slug !== null && act.vendor_slug !== undefined) {
        if (exp.id !== act.vendor_slug) {
          diffs.push(`${alt.id}: replacement[${i}].vendor_slug expected "${exp.id}", got "${act.vendor_slug}"`);
        }
      }
      // raw_name should match the vendor name
      if (exp.name !== act.raw_name) {
        diffs.push(`${alt.id}: replacement[${i}].raw_name expected "${exp.name}", got "${act.raw_name}"`);
      }
    }
  }

  if (diffs.length > 0) {
    return {
      pass: false,
      message: `${diffs.length} comparison dedup mismatches`,
      details: diffs.slice(0, 20).join('\n') + (diffs.length > 20 ? `\n... and ${diffs.length - 20} more` : ''),
    };
  }

  return { pass: true, message: `All US vendor comparisons match across ${alternatives.length} entries` };
}

/**
 * Test 7: Reservation/signal count
 * Reservations are in flat catalog.reservations array (filter by entry_slug).
 * Signals are in flat catalog.positive_signals array (filter by entry_slug).
 * US vendor profile reservations are in catalog.us_vendor_profile_reservations.
 */
async function test07_reservationSignalCount() {
  const catalog = loadCatalog();
  if (!catalog) {
    return { pass: false, message: 'catalog.json not found' };
  }

  // Group reservations and positive_signals by entry_slug
  const reservationsByEntry = groupByEntrySlug(catalog.reservations);
  const signalsByEntry = groupByEntrySlug(catalog.positive_signals);

  const diffs = [];

  for (const alt of alternatives) {
    // Reservations
    const expectedResCount = (alt.reservations || []).length;
    const actualResCount = (reservationsByEntry.get(alt.id) || []).length;
    if (expectedResCount !== actualResCount) {
      diffs.push(`${alt.id}: reservation count expected ${expectedResCount}, got ${actualResCount}`);
    }

    // Positive signals
    const expectedSigCount = (alt.positiveSignals || []).length;
    const actualSigCount = (signalsByEntry.get(alt.id) || []).length;
    if (expectedSigCount !== actualSigCount) {
      diffs.push(`${alt.id}: signal count expected ${expectedSigCount}, got ${actualSigCount}`);
    }
  }

  // Also check US vendor profile reservations
  // catalog.us_vendor_profile_reservations has {vendor_slug, ...}
  const vendorReservationsBySlug = new Map();
  for (const row of catalog.us_vendor_profile_reservations || []) {
    const slug = row.vendor_slug;
    if (!vendorReservationsBySlug.has(slug)) vendorReservationsBySlug.set(slug, []);
    vendorReservationsBySlug.get(slug).push(row);
  }

  for (const [vendorId, profile] of Object.entries(US_VENDOR_TRUST_PROFILES)) {
    const expectedProfileResCount = (profile.reservations || []).length;
    const actualProfileResCount = (vendorReservationsBySlug.get(vendorId) || []).length;
    if (expectedProfileResCount !== actualProfileResCount) {
      diffs.push(`US vendor ${vendorId}: reservation count expected ${expectedProfileResCount}, got ${actualProfileResCount}`);
    }
  }

  if (diffs.length > 0) {
    return {
      pass: false,
      message: `${diffs.length} reservation/signal count mismatches`,
      details: diffs.slice(0, 20).join('\n') + (diffs.length > 20 ? `\n... and ${diffs.length - 20} more` : ''),
    };
  }

  return { pass: true, message: 'All reservation and signal counts match' };
}

/**
 * Test 8: Translation fallback
 * Use catalog.catalog_entries and check description_en is not null/empty.
 * Also verify EN and DE descriptions match TS source.
 */
async function test08_translationFallback() {
  const catalog = loadCatalog();
  if (!catalog) {
    return { pass: false, message: 'catalog.json not found' };
  }

  const diffs = [];

  // Check all alternative entries have an EN description and a name
  const catalogAlts = getCatalogEntriesByStatus(catalog, 'alternative');
  for (const entry of catalogAlts) {
    if (!entry.description_en) {
      diffs.push(`${entry.slug}: missing English description (description_en)`);
    }
    if (!entry.name) {
      diffs.push(`${entry.slug}: missing name`);
    }
  }

  // Build a lookup for catalog entries by slug
  const catalogEntryMap = buildCatalogEntryMap(catalog, 'alternative');

  // Verify localized descriptions match TS source
  for (const alt of alternatives) {
    const catEntry = catalogEntryMap.get(alt.id);
    if (!catEntry) continue;

    // EN description
    const expectedDesc = alt.description;
    const actualDesc = catEntry.description_en;
    if (expectedDesc && actualDesc && expectedDesc !== actualDesc) {
      diffs.push(`${alt.id}: EN description mismatch`);
    }

    // DE description (if present in TS source, should be in catalog)
    const expectedDe = alt.localizedDescriptions?.de;
    const actualDe = catEntry.description_de;
    if (expectedDe && !actualDe) {
      diffs.push(`${alt.id}: DE description present in TS but missing in catalog`);
    }
  }

  if (diffs.length > 0) {
    return {
      pass: false,
      message: `${diffs.length} translation issues`,
      details: diffs.slice(0, 20).join('\n') + (diffs.length > 20 ? `\n... and ${diffs.length - 20} more` : ''),
    };
  }

  return { pass: true, message: 'All entries have EN descriptions; locale fallback verified' };
}

/**
 * Test 9: Denied entry parity
 * Use catalog.denied_decisions array with entry_slug, sources_json, failed_gateways_json.
 */
async function test09_deniedEntryParity() {
  const catalog = loadCatalog();
  if (!catalog) {
    return { pass: false, message: 'catalog.json not found' };
  }

  const markdownDenied = parseDeniedAlternativesFromMarkdown();
  const catalogDenied = catalog.denied_decisions || [];

  const diffs = [];

  // Count check
  if (markdownDenied.length !== catalogDenied.length) {
    diffs.push(`Denied count: expected ${markdownDenied.length} (from markdown), got ${catalogDenied.length}`);
  }

  // Check each denied entry from markdown has a corresponding catalog entry
  for (const mdEntry of markdownDenied) {
    // Match by entry_slug or by name (the catalog uses entry_slug which is a slugified name)
    const catalogMatch = catalogDenied.find(
      cd => cd.entry_slug === mdEntry.name
        || cd.entry_slug?.toLowerCase() === mdEntry.name?.toLowerCase()
        // Also try matching by looking up the catalog_entries with status='denied'
        || (catalog.catalog_entries || []).some(
          e => e.status === 'denied' && e.slug === cd.entry_slug && e.name?.toLowerCase() === mdEntry.name?.toLowerCase()
        )
    );

    if (!catalogMatch) {
      diffs.push(`Denied "${mdEntry.name}": not found in catalog denied_decisions`);
      continue;
    }

    // Verify failed gateways are preserved (stored as failed_gateways_json)
    if (mdEntry.failedGateways.length > 0) {
      let catalogGateways = catalogMatch.failed_gateways_json;
      if (typeof catalogGateways === 'string') {
        try { catalogGateways = JSON.parse(catalogGateways); } catch { catalogGateways = []; }
      }
      const parsedGateways = Array.isArray(catalogGateways) ? catalogGateways : [];
      const missingGateways = mdEntry.failedGateways.filter(g => !parsedGateways.includes(g));
      if (missingGateways.length > 0) {
        diffs.push(`Denied "${mdEntry.name}": missing gateways ${missingGateways.join(', ')}`);
      }
    }

    // Verify sources are preserved (stored as sources_json)
    if (mdEntry.sources.length > 0) {
      let catalogSources = catalogMatch.sources_json;
      if (typeof catalogSources === 'string') {
        try { catalogSources = JSON.parse(catalogSources); } catch { catalogSources = []; }
      }
      const catalogSourceUrls = Array.isArray(catalogSources)
        ? catalogSources.map(s => typeof s === 'string' ? s : s?.url || '')
        : [];
      if (catalogSourceUrls.length === 0) {
        diffs.push(`Denied "${mdEntry.name}": sources present in markdown but missing in catalog`);
      }
    }
  }

  if (diffs.length > 0) {
    return {
      pass: false,
      message: `${diffs.length} denied entry mismatches`,
      details: diffs.join('\n'),
    };
  }

  return { pass: true, message: `All ${markdownDenied.length} denied entries match` };
}

/**
 * Test 10: Landing + further reading
 * Further reading is catalog.further_reading_resources with slug and website_url.
 * Landing groups are catalog.landing_category_groups with source_id.
 * Landing group categories are in separate catalog.landing_group_categories.
 */
async function test10_landingAndFurtherReading() {
  const catalog = loadCatalog();
  if (!catalog) {
    return { pass: false, message: 'catalog.json not found' };
  }

  const diffs = [];

  // Further reading resources
  const expectedResources = furtherReadingResources;
  const catalogResources = catalog.further_reading_resources || [];

  if (expectedResources.length !== catalogResources.length) {
    diffs.push(`Further reading count: expected ${expectedResources.length}, got ${catalogResources.length}`);
  }

  for (const res of expectedResources) {
    const catalogRes = catalogResources.find(
      cr => cr.slug === res.id
    );
    if (!catalogRes) {
      diffs.push(`Further reading "${res.id}": not found in catalog (by slug)`);
      continue;
    }

    if (catalogRes.name !== res.name) {
      diffs.push(`Further reading "${res.id}": name expected "${res.name}", got "${catalogRes.name}"`);
    }
    if (catalogRes.website_url !== res.website) {
      diffs.push(`Further reading "${res.id}": website_url expected "${res.website}", got "${catalogRes.website_url}"`);
    }
    if (catalogRes.section !== res.section) {
      diffs.push(`Further reading "${res.id}": section expected "${res.section}", got "${catalogRes.section}"`);
    }
    if (catalogRes.focus !== res.focus) {
      diffs.push(`Further reading "${res.id}": focus expected "${res.focus}", got "${catalogRes.focus}"`);
    }
  }

  // Landing category groups
  const expectedGroups = landingCategoryGroups;
  const catalogGroups = catalog.landing_category_groups || [];

  if (expectedGroups.length !== catalogGroups.length) {
    diffs.push(`Landing group count: expected ${expectedGroups.length}, got ${catalogGroups.length}`);
  }

  // Build a lookup: group source_id -> group categories from landing_group_categories
  const groupCategoriesMap = new Map();
  for (const row of catalog.landing_group_categories || []) {
    const groupId = row.group_source_id;
    if (!groupCategoriesMap.has(groupId)) groupCategoriesMap.set(groupId, []);
    groupCategoriesMap.get(groupId).push(row);
  }

  for (let i = 0; i < expectedGroups.length; i++) {
    const expGroup = expectedGroups[i];
    // Match by source_id in catalog
    const catGroup = catalogGroups.find(g => g.source_id === expGroup.id);

    if (!catGroup) {
      diffs.push(`Landing group "${expGroup.id}": missing from catalog`);
      continue;
    }

    // Get categories for this group from the junction table
    const actualCategoryRows = (groupCategoriesMap.get(expGroup.id) || [])
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const actualCategories = actualCategoryRows.map(r => r.category_id);

    const expectedCategories = expGroup.categories;

    if (expectedCategories.length !== actualCategories.length) {
      diffs.push(`Landing group "${expGroup.id}": category count mismatch (expected ${expectedCategories.length}, got ${actualCategories.length})`);
    } else {
      for (let j = 0; j < expectedCategories.length; j++) {
        if (expectedCategories[j] !== actualCategories[j]) {
          diffs.push(`Landing group "${expGroup.id}": category[${j}] expected "${expectedCategories[j]}", got "${actualCategories[j]}"`);
        }
      }
    }
  }

  if (diffs.length > 0) {
    return {
      pass: false,
      message: `${diffs.length} landing/further-reading mismatches`,
      details: diffs.join('\n'),
    };
  }

  return {
    pass: true,
    message: `${expectedResources.length} further reading resources and ${expectedGroups.length} landing groups match`,
  };
}

/**
 * Test 11: Schema constraints
 * FK integrity, unique constraints, NOT NULL all pass (on catalog.json structure).
 *
 * Checks:
 * - Unique slugs in catalog.catalog_entries
 * - FK: entry_categories.category_id exists in catalog.categories
 * - FK: entry_tags.entry_slug exists in catalog.catalog_entries
 * - NOT NULL for name, country_code on alternative entries
 */
async function test11_schemaConstraints() {
  const catalog = loadCatalog();
  if (!catalog) {
    return { pass: false, message: 'catalog.json not found' };
  }

  const diffs = [];

  // Build valid sets
  const validCategoryIds = new Set((catalog.categories || []).map(c => c.id));
  const validEntrySlugs = new Set((catalog.catalog_entries || []).map(e => e.slug));

  // Check for unique slugs in catalog_entries
  const seenSlugs = new Set();
  for (const entry of catalog.catalog_entries || []) {
    if (!entry.slug) {
      diffs.push('catalog_entry with missing slug');
      continue;
    }
    if (seenSlugs.has(entry.slug)) {
      diffs.push(`Duplicate catalog_entry slug: "${entry.slug}"`);
    }
    seenSlugs.add(entry.slug);

    // NOT NULL checks for alternative entries
    if (entry.status === 'alternative') {
      if (!entry.name) {
        diffs.push(`${entry.slug}: missing required field "name"`);
      }
      if (entry.country_code === undefined || entry.country_code === null) {
        diffs.push(`${entry.slug}: missing required field "country_code"`);
      }
    }
  }

  // FK: entry_categories.category_id must exist in categories
  for (const row of catalog.entry_categories || []) {
    if (!validCategoryIds.has(row.category_id)) {
      diffs.push(`entry_categories: category_id "${row.category_id}" not in valid categories (entry_slug: ${row.entry_slug})`);
    }
    if (!validEntrySlugs.has(row.entry_slug)) {
      diffs.push(`entry_categories: entry_slug "${row.entry_slug}" not in catalog_entries`);
    }
  }

  // FK: entry_tags.entry_slug must exist in catalog_entries
  const validTagSlugs = new Set((catalog.tags || []).map(t => t.slug));
  for (const row of catalog.entry_tags || []) {
    if (!validEntrySlugs.has(row.entry_slug)) {
      diffs.push(`entry_tags: entry_slug "${row.entry_slug}" not in catalog_entries`);
    }
    if (!validTagSlugs.has(row.tag_slug)) {
      diffs.push(`entry_tags: tag_slug "${row.tag_slug}" not in tags`);
    }
  }

  // Check for unique US vendor slugs
  const seenVendorSlugs = new Set();
  for (const vendor of catalog.us_vendors || []) {
    if (!vendor.slug) {
      diffs.push('us_vendor with missing slug');
      continue;
    }
    if (seenVendorSlugs.has(vendor.slug)) {
      diffs.push(`Duplicate us_vendor slug: "${vendor.slug}"`);
    }
    seenVendorSlugs.add(vendor.slug);

    if (!vendor.name) {
      diffs.push(`US vendor ${vendor.slug}: missing required field "name"`);
    }
  }

  // Check category completeness
  const seenCatIds = new Set();
  for (const cat of catalog.categories || []) {
    if (!cat.id) {
      diffs.push('Category with missing id');
      continue;
    }
    if (seenCatIds.has(cat.id)) {
      diffs.push(`Duplicate category id: "${cat.id}"`);
    }
    seenCatIds.add(cat.id);
  }

  if (diffs.length > 0) {
    return {
      pass: false,
      message: `${diffs.length} schema constraint violations`,
      details: diffs.slice(0, 20).join('\n') + (diffs.length > 20 ? `\n... and ${diffs.length - 20} more` : ''),
    };
  }

  return { pass: true, message: 'All schema constraints (uniqueness, FK, NOT NULL) pass' };
}

/**
 * Test 12: Open-source consistency
 * Use catalog.catalog_entries fields is_open_source and open_source_level.
 */
async function test12_openSourceConsistency() {
  const diffs = [];

  // Verify TS source data first
  for (const alt of alternatives) {
    const isOS = alt.isOpenSource;
    const level = alt.openSourceLevel;

    // After merge pipeline, these should always be consistent:
    // isOpenSource=true <=> level in ('full', 'partial')
    // isOpenSource=false <=> level = 'none'
    if (isOS === true && level === 'none') {
      diffs.push(`${alt.id}: isOpenSource=true but openSourceLevel="none"`);
    }
    if (isOS === false && (level === 'full' || level === 'partial')) {
      diffs.push(`${alt.id}: isOpenSource=false but openSourceLevel="${level}"`);
    }
    if (isOS === true && !level) {
      diffs.push(`${alt.id}: isOpenSource=true but openSourceLevel is undefined`);
    }
    if (isOS === false && !level) {
      diffs.push(`${alt.id}: isOpenSource=false but openSourceLevel is undefined`);
    }
  }

  // Verify catalog.json if present
  const catalog = loadCatalog();
  if (catalog) {
    const catalogAlts = getCatalogEntriesByStatus(catalog, 'alternative');
    for (const entry of catalogAlts) {
      const isOS = entry.is_open_source;
      const level = entry.open_source_level;

      // Both null/undefined is OK (unknown)
      if (isOS == null && level == null) continue;

      if (isOS === true && level === 'none') {
        diffs.push(`catalog ${entry.slug}: is_open_source=true but open_source_level="none"`);
      }
      if (isOS === false && (level === 'full' || level === 'partial')) {
        diffs.push(`catalog ${entry.slug}: is_open_source=false but open_source_level="${level}"`);
      }
    }
  }

  if (diffs.length > 0) {
    return {
      pass: false,
      message: `${diffs.length} open-source consistency violations`,
      details: diffs.join('\n'),
    };
  }

  return { pass: true, message: 'All entries have consistent isOpenSource / openSourceLevel' };
}

/**
 * Test 13: Manual-over-research dedup
 * Check no duplicate slugs in catalog.catalog_entries.
 * Also verify manual-wins in the TS merge pipeline.
 */
async function test13_manualOverResearchDedup() {
  const diffs = [];

  // Find IDs that exist in both manual and research
  const manualIds = new Set(manualAlternatives.map(a => a.id));
  const researchIds = new Set(researchAlternatives.map(a => a.id));
  const overlapping = [...manualIds].filter(id => researchIds.has(id));

  // Verify merged array has no duplicates
  const seenIds = new Set();
  for (const alt of alternatives) {
    if (seenIds.has(alt.id)) {
      diffs.push(`Duplicate id in merged alternatives: "${alt.id}"`);
    }
    seenIds.add(alt.id);
  }

  // Verify manual wins for overlapping IDs
  for (const id of overlapping) {
    const merged = altMap.get(id);
    const manual = manualAlternatives.find(a => a.id === id);
    if (!merged || !manual) continue;

    // The merged entry should use the manual version's description
    if (merged.description !== manual.description) {
      diffs.push(`${id}: merged entry doesn't use manual description (manual-wins violated)`);
    }
  }

  // Also check catalog.json for duplicate slugs
  const catalog = loadCatalog();
  if (catalog) {
    const catalogSlugs = new Set();
    for (const entry of catalog.catalog_entries || []) {
      if (catalogSlugs.has(entry.slug)) {
        diffs.push(`Duplicate slug in catalog.catalog_entries: "${entry.slug}"`);
      }
      catalogSlugs.add(entry.slug);
    }
  }

  if (diffs.length > 0) {
    return {
      pass: false,
      message: `${diffs.length} dedup issues`,
      details: diffs.join('\n'),
    };
  }

  return {
    pass: true,
    message: `No duplicates; ${overlapping.length} overlapping IDs correctly resolved with manual-wins`,
  };
}

/**
 * Test 14: API payload spot-check
 * 20 random entries compared field-by-field.
 */
async function test14_apiPayloadSpotCheck() {
  if (SKIP_API) {
    return { pass: true, message: 'SKIPPED (--skip-api flag set)' };
  }

  // Fetch entries from API
  const { data, error } = await fetchApi('/api/catalog/entries?status=alternative');
  if (error) {
    return { pass: false, message: `API fetch failed: ${error}` };
  }

  const apiEntries = Array.isArray(data) ? data : (data?.data || data?.entries || []);
  if (apiEntries.length === 0) {
    return { pass: false, message: 'API returned no entries' };
  }

  const apiMap = new Map();
  for (const entry of apiEntries) {
    const id = entry.id || entry.slug;
    if (id) apiMap.set(id, entry);
  }

  // Sample 20 random alternatives
  const sample = randomSample(alternatives, 20);
  const diffs = [];

  for (const alt of sample) {
    const apiEntry = apiMap.get(alt.id);
    if (!apiEntry) {
      diffs.push(`${alt.id}: not found in API response`);
      continue;
    }

    // Compare key fields
    const fieldChecks = [
      ['name', alt.name, apiEntry.name],
      ['country', alt.country, apiEntry.country || apiEntry.countryCode],
      ['category', alt.category, apiEntry.category],
      ['pricing', alt.pricing, apiEntry.pricing],
      ['isOpenSource', alt.isOpenSource, apiEntry.isOpenSource],
      ['openSourceLevel', alt.openSourceLevel, apiEntry.openSourceLevel],
      ['website', alt.website, apiEntry.website || apiEntry.websiteUrl],
      ['trustScoreStatus', alt.trustScoreStatus, apiEntry.trustScoreStatus],
    ];

    for (const [field, expected, actual] of fieldChecks) {
      if (expected !== actual) {
        diffs.push(`${alt.id}.${field}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    }

    // Compare trust score with tolerance
    if (alt.trustScore !== undefined && apiEntry.trustScore !== undefined) {
      if (Math.abs(alt.trustScore - apiEntry.trustScore) > 0.05) {
        diffs.push(`${alt.id}.trustScore: expected ${alt.trustScore}, got ${apiEntry.trustScore}`);
      }
    }

    // Compare tag count
    const expectedTagCount = (alt.tags || []).length;
    const actualTagCount = (apiEntry.tags || []).length;
    if (expectedTagCount !== actualTagCount) {
      diffs.push(`${alt.id}.tags: count expected ${expectedTagCount}, got ${actualTagCount}`);
    }

    // Compare comparison count
    const expectedCompCount = (alt.usVendorComparisons || []).length;
    const actualCompCount = (apiEntry.usVendorComparisons || []).length;
    if (expectedCompCount !== actualCompCount) {
      diffs.push(`${alt.id}.usVendorComparisons: count expected ${expectedCompCount}, got ${actualCompCount}`);
    }
  }

  if (diffs.length > 0) {
    return {
      pass: false,
      message: `${diffs.length} field mismatches across 20 spot-checked entries`,
      details: diffs.slice(0, 30).join('\n') + (diffs.length > 30 ? `\n... and ${diffs.length - 30} more` : ''),
    };
  }

  return { pass: true, message: `20 random entries match API payload field-by-field` };
}

/**
 * Test 15: Full API contract test
 * Every endpoint returns expected shape.
 */
async function test15_fullApiContractTest() {
  if (SKIP_API) {
    return { pass: true, message: 'SKIPPED (--skip-api flag set)' };
  }

  const diffs = [];

  // Define expected endpoints and their shape checks
  const endpoints = [
    {
      path: '/api/catalog/entries?status=alternative',
      check: (data) => {
        const entries = Array.isArray(data) ? data : (data?.data || data?.entries || []);
        if (!Array.isArray(entries)) return 'Expected array of entries';
        if (entries.length === 0) return 'Expected non-empty entries array';
        const first = entries[0];
        const required = ['name'];
        for (const field of required) {
          if (first[field] === undefined) return `Missing field "${field}" in first entry`;
        }
        // Must have an id or slug
        if (!first.id && !first.slug) return 'Missing id/slug in first entry';
        return null;
      },
    },
    {
      path: '/api/catalog/entries?status=us',
      check: (data) => {
        const entries = Array.isArray(data) ? data : (data?.data || data?.entries || []);
        if (!Array.isArray(entries)) return 'Expected array of US entries';
        // US entries may be empty if not yet seeded, but shape should be array
        return null;
      },
    },
    {
      path: '/api/catalog/entries?status=denied',
      check: (data) => {
        const entries = Array.isArray(data) ? data : (data?.data || data?.entries || []);
        if (!Array.isArray(entries)) return 'Expected array of denied entries';
        return null;
      },
    },
    {
      path: '/api/catalog/categories',
      check: (data) => {
        const cats = Array.isArray(data) ? data : (data?.data || data?.categories || []);
        if (!Array.isArray(cats)) return 'Expected array of categories';
        if (cats.length === 0) return 'Expected non-empty categories array';
        const first = cats[0];
        if (!first.id && !first.slug) return 'Missing id/slug in first category';
        return null;
      },
    },
    {
      path: '/api/catalog/further-reading',
      check: (data) => {
        const resources = Array.isArray(data) ? data : (data?.data || data?.resources || []);
        if (!Array.isArray(resources)) return 'Expected array of further reading resources';
        return null;
      },
    },
    {
      path: '/api/catalog/landing-groups',
      check: (data) => {
        const groups = Array.isArray(data) ? data : (data?.data || data?.groups || []);
        if (!Array.isArray(groups)) return 'Expected array of landing category groups';
        return null;
      },
    },
  ];

  for (const ep of endpoints) {
    const { data, error } = await fetchApi(ep.path);
    if (error) {
      diffs.push(`${ep.path}: fetch failed - ${error}`);
      continue;
    }
    const issue = ep.check(data);
    if (issue) {
      diffs.push(`${ep.path}: ${issue}`);
    }
  }

  if (diffs.length > 0) {
    return {
      pass: false,
      message: `${diffs.length} API contract issues`,
      details: diffs.join('\n'),
    };
  }

  return { pass: true, message: `All ${endpoints.length} API endpoints return expected shapes` };
}

// ---------------------------------------------------------------------------
// Test runner
// ---------------------------------------------------------------------------

const TESTS = [
  { num: 1, name: 'Entry count parity', fn: test01_entryCountParity },
  { num: 2, name: 'Trust score parity', fn: test02_trustScoreParity },
  { num: 3, name: 'Tag parity', fn: test03_tagParity },
  { num: 4, name: 'Category assignment parity', fn: test04_categoryParity },
  { num: 5, name: 'US vendor alias resolution', fn: test05_usVendorAliasResolution },
  { num: 6, name: 'US vendor comparison dedup', fn: test06_usVendorComparisonDedup },
  { num: 7, name: 'Reservation/signal count', fn: test07_reservationSignalCount },
  { num: 8, name: 'Translation fallback', fn: test08_translationFallback },
  { num: 9, name: 'Denied entry parity', fn: test09_deniedEntryParity },
  { num: 10, name: 'Landing + further reading', fn: test10_landingAndFurtherReading },
  { num: 11, name: 'Schema constraints', fn: test11_schemaConstraints },
  { num: 12, name: 'Open-source consistency', fn: test12_openSourceConsistency },
  { num: 13, name: 'Manual-over-research dedup', fn: test13_manualOverResearchDedup },
  { num: 14, name: 'API payload spot-check', fn: test14_apiPayloadSpotCheck },
  { num: 15, name: 'Full API contract test', fn: test15_fullApiContractTest },
];

async function runAllTests() {
  console.log('='.repeat(72));
  console.log('  Parity Test Suite — DB Migration Phase 1');
  console.log('='.repeat(72));
  console.log(`  Catalog:  ${CATALOG_PATH}`);
  console.log(`  API base: ${API_BASE}${SKIP_API ? ' (SKIPPED)' : ''}`);
  console.log(`  TS alternatives: ${alternatives.length}`);
  console.log(`  US vendor records: ${US_VENDOR_RECORDS.length}`);
  console.log(`  Categories: ${categories.length}`);
  console.log('='.repeat(72));
  console.log('');

  let passed = 0;
  let failed = 0;
  let skipped = 0;
  const results = [];

  for (const test of TESTS) {
    const label = `Test ${String(test.num).padStart(2, '0')}: ${test.name}`;
    try {
      const result = await test.fn();
      results.push({ ...test, result });

      if (result.message.startsWith('SKIPPED')) {
        console.log(`  [SKIP] ${label}`);
        console.log(`         ${result.message}`);
        skipped++;
      } else if (result.pass) {
        console.log(`  [PASS] ${label}`);
        console.log(`         ${result.message}`);
        passed++;
      } else {
        console.log(`  [FAIL] ${label}`);
        console.log(`         ${result.message}`);
        if (result.details) {
          for (const line of result.details.split('\n')) {
            console.log(`           ${line}`);
          }
        }
        failed++;
      }
    } catch (err) {
      console.log(`  [ERR!] ${label}`);
      console.log(`         Exception: ${err.message}`);
      if (err.stack) {
        const stackLines = err.stack.split('\n').slice(1, 4);
        for (const line of stackLines) {
          console.log(`           ${line.trim()}`);
        }
      }
      results.push({ ...test, result: { pass: false, message: `Exception: ${err.message}` } });
      failed++;
    }

    console.log('');
  }

  // Summary
  console.log('='.repeat(72));
  console.log(`  SUMMARY: ${passed} passed, ${failed} failed, ${skipped} skipped out of ${TESTS.length} tests`);
  console.log('='.repeat(72));

  if (failed > 0) {
    console.log('\n  Failed tests:');
    for (const r of results) {
      if (!r.result.pass && !r.result.message.startsWith('SKIPPED')) {
        console.log(`    - Test ${String(r.num).padStart(2, '0')}: ${r.name}`);
      }
    }
  }

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

runAllTests();
