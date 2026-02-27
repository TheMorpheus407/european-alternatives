#!/usr/bin/env node

/**
 * Shadow Validation Script for DB Migration (Phase 2)
 *
 * Compares API responses from the DB-backed endpoints against the TS static
 * data to verify parity before switching DATA_BACKEND=db.
 *
 * Five validation areas from DB_MIGRATION_PLAN.md Phase 2:
 *   1. Full payload snapshot test
 *   2. Locale parity (EN + DE)
 *   3. Scoring stability (repeated fetches)
 *   4. Browse ordering parity
 *   5. Edge case coverage (dual-role, unresolved replacements, inline
 *      reservations, missing logos, secondary categories, non-vetted)
 *
 * Usage:
 *   npx tsx scripts/shadow-diff.mjs --api-base https://european-alternatives.cloud/api/catalog
 *   npx tsx scripts/shadow-diff.mjs --api-base http://localhost/api/catalog
 */

import { fileURLToPath } from 'node:url';
import path from 'node:path';

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
  if (idx === -1 || idx + 1 >= args.length) return undefined;
  return args[idx + 1];
}

const API_BASE = (getArg('--api-base') || 'https://european-alternatives.cloud/api/catalog')
  .replace(/\/+$/, '');

// ---------------------------------------------------------------------------
// Import TS source-of-truth modules (requires tsx runtime)
// ---------------------------------------------------------------------------
const { alternatives } = await import('../src/data/alternatives.ts');
const { manualAlternatives } = await import('../src/data/manualAlternatives.ts');
const { reservationsById } = await import('../src/data/trustOverrides.ts');
const { positiveSignalsById } = await import('../src/data/positiveSignals.ts');
const { scoringMetadata } = await import('../src/data/scoringData.ts');

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

/** Fetch JSON from an API endpoint. Returns { data, error }. */
async function fetchApi(endpoint) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  try {
    const resp = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(30000),
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

/**
 * Extract the entries array from an API response.
 * The API returns { data: [...], meta: { count, locale } }.
 */
function extractEntries(responseData) {
  if (!responseData) return [];
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData.data)) return responseData.data;
  if (Array.isArray(responseData.entries)) return responseData.entries;
  return [];
}

/**
 * Build a Map from id -> entry for an array of API entries.
 */
function buildEntryMap(entries) {
  const map = new Map();
  for (const entry of entries) {
    const id = entry.id || entry.slug;
    if (id) map.set(id, entry);
  }
  return map;
}

/**
 * Compare two values with floating-point tolerance for numbers.
 * Returns a diff string or null if equal.
 */
function compareValues(expected, actual, label) {
  if (expected === actual) return null;
  if (expected === undefined && actual === undefined) return null;
  if (expected === null && actual === null) return null;

  // Treat undefined vs null as equal for optional fields
  if (expected == null && actual == null) return null;

  if (typeof expected === 'number' && typeof actual === 'number') {
    if (Math.abs(expected - actual) < 0.0001) return null;
  }

  return `${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`;
}

/**
 * Deep comparison for JSON-serializable values. Returns array of diff strings.
 */
function deepDiff(expected, actual, pathStr) {
  if (expected === actual) return [];
  if (expected == null && actual == null) return [];

  if (typeof expected !== typeof actual) {
    // Allow number/null mismatches for optional fields
    if (expected == null || actual == null) {
      return [`${pathStr}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`];
    }
    return [`${pathStr}: type mismatch (expected ${typeof expected}, got ${typeof actual})`];
  }

  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) {
      return [`${pathStr}: expected array, got ${typeof actual}`];
    }
    const diffs = [];
    if (expected.length !== actual.length) {
      diffs.push(`${pathStr}: array length mismatch (expected ${expected.length}, got ${actual.length})`);
    }
    const len = Math.min(expected.length, actual.length);
    for (let i = 0; i < len; i++) {
      diffs.push(...deepDiff(expected[i], actual[i], `${pathStr}[${i}]`));
    }
    return diffs;
  }

  if (expected && typeof expected === 'object') {
    if (!actual || typeof actual !== 'object') {
      return [`${pathStr}: expected object, got ${typeof actual}`];
    }
    const allKeys = new Set([...Object.keys(expected), ...Object.keys(actual)]);
    const diffs = [];
    for (const key of allKeys) {
      diffs.push(...deepDiff(
        expected[key],
        actual[key],
        pathStr ? `${pathStr}.${key}` : key
      ));
    }
    return diffs;
  }

  if (typeof expected === 'number' && typeof actual === 'number') {
    if (Math.abs(expected - actual) < 0.0001) return [];
  }

  if (expected !== actual) {
    return [`${pathStr}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`];
  }

  return [];
}

/**
 * Compare a TS alternative against an API entry, accounting for known
 * field mapping differences (e.g. trust score scale).
 *
 * Returns an array of diff strings (empty = match).
 */
function compareAlternativeToApi(tsAlt, apiEntry, locale) {
  const diffs = [];
  const add = (d) => { if (d) diffs.push(d); };

  // --- Scalar fields ---
  add(compareValues(tsAlt.name, apiEntry.name, `${tsAlt.id}.name`));
  add(compareValues(tsAlt.country, apiEntry.country, `${tsAlt.id}.country`));
  add(compareValues(tsAlt.category, apiEntry.category, `${tsAlt.id}.category`));
  add(compareValues(tsAlt.pricing, apiEntry.pricing, `${tsAlt.id}.pricing`));
  add(compareValues(tsAlt.isOpenSource, apiEntry.isOpenSource, `${tsAlt.id}.isOpenSource`));
  add(compareValues(tsAlt.openSourceLevel, apiEntry.openSourceLevel, `${tsAlt.id}.openSourceLevel`));
  add(compareValues(tsAlt.website, apiEntry.website, `${tsAlt.id}.website`));
  add(compareValues(tsAlt.logo, apiEntry.logo, `${tsAlt.id}.logo`));
  add(compareValues(tsAlt.selfHostable, apiEntry.selfHostable, `${tsAlt.id}.selfHostable`));
  add(compareValues(tsAlt.foundedYear, apiEntry.foundedYear, `${tsAlt.id}.foundedYear`));
  add(compareValues(tsAlt.headquartersCity, apiEntry.headquartersCity, `${tsAlt.id}.headquartersCity`));
  add(compareValues(tsAlt.license, apiEntry.license, `${tsAlt.id}.license`));
  add(compareValues(tsAlt.openSourceAuditUrl, apiEntry.openSourceAuditUrl, `${tsAlt.id}.openSourceAuditUrl`));
  add(compareValues(tsAlt.sourceCodeUrl, apiEntry.sourceCodeUrl, `${tsAlt.id}.sourceCodeUrl`));
  add(compareValues(tsAlt.trustScoreStatus, apiEntry.trustScoreStatus, `${tsAlt.id}.trustScoreStatus`));

  // --- Trust score: TS is 0-10 scale, API returns trust_score_100 (0-100 int) ---
  if (tsAlt.trustScore != null && apiEntry.trustScore != null) {
    const tsAs100 = Math.round(tsAlt.trustScore * 10);
    if (Math.abs(tsAs100 - apiEntry.trustScore) > 1) {
      diffs.push(`${tsAlt.id}.trustScore: TS=${tsAlt.trustScore} (x10=${tsAs100}), API=${apiEntry.trustScore}`);
    }
  } else if ((tsAlt.trustScore != null) !== (apiEntry.trustScore != null)) {
    diffs.push(`${tsAlt.id}.trustScore: TS=${tsAlt.trustScore}, API=${apiEntry.trustScore}`);
  }

  // --- Description: depends on locale ---
  if (locale === 'en') {
    add(compareValues(tsAlt.description, apiEntry.description, `${tsAlt.id}.description`));
  }
  // DE locale checks are handled in the locale parity test.

  // --- Tags ---
  const tsTags = tsAlt.tags || [];
  const apiTags = apiEntry.tags || [];
  if (tsTags.length !== apiTags.length) {
    diffs.push(`${tsAlt.id}.tags: count expected ${tsTags.length}, got ${apiTags.length}`);
  } else {
    for (let i = 0; i < tsTags.length; i++) {
      if (tsTags[i] !== apiTags[i]) {
        diffs.push(`${tsAlt.id}.tags[${i}]: expected "${tsTags[i]}", got "${apiTags[i]}"`);
      }
    }
  }

  // --- replacesUS ---
  const tsReplaces = tsAlt.replacesUS || [];
  const apiReplaces = apiEntry.replacesUS || [];
  if (tsReplaces.length !== apiReplaces.length) {
    diffs.push(`${tsAlt.id}.replacesUS: count expected ${tsReplaces.length}, got ${apiReplaces.length}`);
  } else {
    for (let i = 0; i < tsReplaces.length; i++) {
      if (tsReplaces[i] !== apiReplaces[i]) {
        diffs.push(`${tsAlt.id}.replacesUS[${i}]: expected "${tsReplaces[i]}", got "${apiReplaces[i]}"`);
      }
    }
  }

  // --- Secondary categories ---
  const tsSecCats = tsAlt.secondaryCategories || [];
  const apiSecCats = apiEntry.secondaryCategories || [];
  if (tsSecCats.length !== apiSecCats.length) {
    diffs.push(`${tsAlt.id}.secondaryCategories: count expected ${tsSecCats.length}, got ${apiSecCats.length}`);
  } else {
    for (let i = 0; i < tsSecCats.length; i++) {
      if (tsSecCats[i] !== apiSecCats[i]) {
        diffs.push(`${tsAlt.id}.secondaryCategories[${i}]: expected "${tsSecCats[i]}", got "${apiSecCats[i]}"`);
      }
    }
  }

  // --- Reservations (count and IDs) ---
  const tsReservations = tsAlt.reservations || [];
  const apiReservations = apiEntry.reservations || [];
  if (tsReservations.length !== apiReservations.length) {
    diffs.push(`${tsAlt.id}.reservations: count expected ${tsReservations.length}, got ${apiReservations.length}`);
  } else {
    for (let i = 0; i < tsReservations.length; i++) {
      if (tsReservations[i].id !== apiReservations[i].id) {
        diffs.push(`${tsAlt.id}.reservations[${i}].id: expected "${tsReservations[i].id}", got "${apiReservations[i].id}"`);
      }
      if (tsReservations[i].severity !== apiReservations[i].severity) {
        diffs.push(`${tsAlt.id}.reservations[${i}].severity: expected "${tsReservations[i].severity}", got "${apiReservations[i].severity}"`);
      }
    }
  }

  // --- Positive signals (count and IDs) ---
  const tsSignals = tsAlt.positiveSignals || [];
  const apiSignals = apiEntry.positiveSignals || [];
  if (tsSignals.length !== apiSignals.length) {
    diffs.push(`${tsAlt.id}.positiveSignals: count expected ${tsSignals.length}, got ${apiSignals.length}`);
  } else {
    for (let i = 0; i < tsSignals.length; i++) {
      if (tsSignals[i].id !== apiSignals[i].id) {
        diffs.push(`${tsAlt.id}.positiveSignals[${i}].id: expected "${tsSignals[i].id}", got "${apiSignals[i].id}"`);
      }
    }
  }

  // --- US vendor comparisons (count and IDs) ---
  const tsComps = tsAlt.usVendorComparisons || [];
  const apiComps = apiEntry.usVendorComparisons || [];
  if (tsComps.length !== apiComps.length) {
    diffs.push(`${tsAlt.id}.usVendorComparisons: count expected ${tsComps.length}, got ${apiComps.length}`);
  } else {
    for (let i = 0; i < tsComps.length; i++) {
      if (tsComps[i].id !== apiComps[i].id) {
        diffs.push(`${tsAlt.id}.usVendorComparisons[${i}].id: expected "${tsComps[i].id}", got "${apiComps[i].id}"`);
      }
      if (tsComps[i].name !== apiComps[i].name) {
        diffs.push(`${tsAlt.id}.usVendorComparisons[${i}].name: expected "${tsComps[i].name}", got "${apiComps[i].name}"`);
      }
    }
  }

  // --- Action links ---
  const tsLinks = tsAlt.actionLinks || [];
  const apiLinks = apiEntry.actionLinks || [];
  if (tsLinks.length !== apiLinks.length) {
    diffs.push(`${tsAlt.id}.actionLinks: count expected ${tsLinks.length}, got ${apiLinks.length}`);
  }

  // --- Localized descriptions structure ---
  const tsLocalized = tsAlt.localizedDescriptions;
  const apiLocalized = apiEntry.localizedDescriptions;
  if (tsLocalized?.de && !apiLocalized?.de) {
    diffs.push(`${tsAlt.id}.localizedDescriptions.de: present in TS but missing from API`);
  } else if (!tsLocalized?.de && apiLocalized?.de) {
    diffs.push(`${tsAlt.id}.localizedDescriptions.de: absent in TS but present in API`);
  }

  return diffs;
}


// ---------------------------------------------------------------------------
// Test definitions
// ---------------------------------------------------------------------------

/**
 * Test 1: Full payload snapshot test
 *
 * Fetches the complete alternatives array from the API, imports the TS
 * alternatives, and does a deep field-by-field comparison.
 */
async function test01_fullPayloadSnapshot() {
  const { data, error } = await fetchApi('/entries?status=alternative&locale=en');
  if (error) {
    return { pass: false, message: `API fetch failed: ${error}` };
  }

  const apiEntries = extractEntries(data);
  if (apiEntries.length === 0) {
    return { pass: false, message: 'API returned no entries' };
  }

  const apiMap = buildEntryMap(apiEntries);

  // Count check
  const diffs = [];
  if (alternatives.length !== apiEntries.length) {
    diffs.push(`Entry count mismatch: TS has ${alternatives.length}, API has ${apiEntries.length}`);
  }

  // Field-by-field comparison for every entry
  let missingInApi = 0;
  for (const tsAlt of alternatives) {
    const apiEntry = apiMap.get(tsAlt.id);
    if (!apiEntry) {
      diffs.push(`${tsAlt.id}: present in TS but missing from API`);
      missingInApi++;
      continue;
    }

    const entryDiffs = compareAlternativeToApi(tsAlt, apiEntry, 'en');
    diffs.push(...entryDiffs);
  }

  // Check for entries in API but not in TS
  for (const apiEntry of apiEntries) {
    const id = apiEntry.id || apiEntry.slug;
    if (id && !altMap.has(id)) {
      diffs.push(`${id}: present in API but missing from TS`);
    }
  }

  if (diffs.length > 0) {
    const maxShow = 40;
    return {
      pass: false,
      message: `${diffs.length} differences found (${missingInApi} missing in API)`,
      details: diffs.slice(0, maxShow).join('\n')
        + (diffs.length > maxShow ? `\n... and ${diffs.length - maxShow} more` : ''),
    };
  }

  return {
    pass: true,
    message: `All ${alternatives.length} entries match API payload field-by-field`,
  };
}

/**
 * Test 2: Locale parity
 *
 * Fetches EN and DE responses, verifies:
 *   - EN descriptions match TS source
 *   - DE descriptions match TS localizedDescriptions.de
 *   - Locale fallback works (DE returns EN when no DE translation exists)
 */
async function test02_localeParity() {
  const [enResult, deResult] = await Promise.all([
    fetchApi('/entries?status=alternative&locale=en'),
    fetchApi('/entries?status=alternative&locale=de'),
  ]);

  if (enResult.error) {
    return { pass: false, message: `EN fetch failed: ${enResult.error}` };
  }
  if (deResult.error) {
    return { pass: false, message: `DE fetch failed: ${deResult.error}` };
  }

  const enEntries = extractEntries(enResult.data);
  const deEntries = extractEntries(deResult.data);

  if (enEntries.length === 0) {
    return { pass: false, message: 'EN response returned no entries' };
  }
  if (deEntries.length === 0) {
    return { pass: false, message: 'DE response returned no entries' };
  }

  const enMap = buildEntryMap(enEntries);
  const deMap = buildEntryMap(deEntries);

  const diffs = [];

  // Entry count should be identical across locales
  if (enEntries.length !== deEntries.length) {
    diffs.push(`Entry count differs between locales: EN=${enEntries.length}, DE=${deEntries.length}`);
  }

  let checkedEn = 0;
  let checkedDe = 0;
  let fallbackOk = 0;

  for (const tsAlt of alternatives) {
    const enEntry = enMap.get(tsAlt.id);
    const deEntry = deMap.get(tsAlt.id);

    if (!enEntry) {
      diffs.push(`${tsAlt.id}: missing from EN response`);
      continue;
    }
    if (!deEntry) {
      diffs.push(`${tsAlt.id}: missing from DE response`);
      continue;
    }

    // EN description should match TS source description
    if (enEntry.description !== tsAlt.description) {
      diffs.push(`${tsAlt.id}: EN description mismatch`);
    }
    checkedEn++;

    // DE description behavior
    const hasDe = tsAlt.localizedDescriptions?.de;
    if (hasDe) {
      // If DE translation exists, the API DE response should return it
      if (deEntry.description !== tsAlt.localizedDescriptions.de) {
        diffs.push(`${tsAlt.id}: DE description mismatch (expected DE translation)`);
      }
      checkedDe++;
    } else {
      // Locale fallback: DE should return EN description when no DE exists
      if (deEntry.description !== tsAlt.description) {
        diffs.push(`${tsAlt.id}: DE locale fallback failed (expected EN description, got different text)`);
      } else {
        fallbackOk++;
      }
    }

    // Reservation text locale (spot-check: if reservations exist,
    // EN text should match TS text_en equivalent)
    const tsReservations = tsAlt.reservations || [];
    const enReservations = enEntry.reservations || [];
    const deReservations = deEntry.reservations || [];

    if (tsReservations.length > 0 && enReservations.length === tsReservations.length) {
      for (let i = 0; i < tsReservations.length; i++) {
        // EN reservation text should match the TS text field
        if (enReservations[i].text !== tsReservations[i].text) {
          diffs.push(`${tsAlt.id}.reservations[${i}].text: EN text mismatch`);
        }

        // DE reservation text should be textDe if available, else fallback to text
        if (tsReservations[i].textDe && deReservations[i]) {
          if (deReservations[i].text !== tsReservations[i].textDe) {
            diffs.push(`${tsAlt.id}.reservations[${i}].text: DE text should be textDe`);
          }
        } else if (deReservations[i]) {
          // Fallback: DE should use EN text
          if (deReservations[i].text !== tsReservations[i].text) {
            diffs.push(`${tsAlt.id}.reservations[${i}].text: DE fallback text mismatch`);
          }
        }
      }
    }
  }

  if (diffs.length > 0) {
    return {
      pass: false,
      message: `${diffs.length} locale differences found`,
      details: diffs.slice(0, 30).join('\n')
        + (diffs.length > 30 ? `\n... and ${diffs.length - 30} more` : ''),
    };
  }

  return {
    pass: true,
    message: `Locale parity OK: ${checkedEn} EN, ${checkedDe} DE translations, ${fallbackOk} fallbacks verified`,
  };
}

/**
 * Test 3: Scoring stability
 *
 * Fetches the same endpoint 3 times, verifies identical trust scores each time.
 */
async function test03_scoringStability() {
  const fetches = [];
  for (let i = 0; i < 3; i++) {
    fetches.push(fetchApi('/entries?status=alternative&locale=en'));
  }

  const results = await Promise.all(fetches);

  // Check all fetches succeeded
  for (let i = 0; i < results.length; i++) {
    if (results[i].error) {
      return { pass: false, message: `Fetch ${i + 1}/3 failed: ${results[i].error}` };
    }
  }

  const entrySets = results.map(r => extractEntries(r.data));

  // Verify all have the same count
  const counts = entrySets.map(e => e.length);
  if (new Set(counts).size > 1) {
    return { pass: false, message: `Entry counts differ across fetches: ${counts.join(', ')}` };
  }

  if (counts[0] === 0) {
    return { pass: false, message: 'All fetches returned empty results' };
  }

  // Build maps for each fetch
  const maps = entrySets.map(entries => buildEntryMap(entries));

  const diffs = [];
  const baseline = maps[0];

  for (const [id, baseEntry] of baseline) {
    for (let i = 1; i < maps.length; i++) {
      const compareEntry = maps[i].get(id);
      if (!compareEntry) {
        diffs.push(`${id}: missing from fetch ${i + 1}`);
        continue;
      }

      // Compare trust scores
      if (baseEntry.trustScore !== compareEntry.trustScore) {
        diffs.push(`${id}: trustScore unstable (fetch 1: ${baseEntry.trustScore}, fetch ${i + 1}: ${compareEntry.trustScore})`);
      }
      if (baseEntry.trustScoreStatus !== compareEntry.trustScoreStatus) {
        diffs.push(`${id}: trustScoreStatus unstable (fetch 1: ${baseEntry.trustScoreStatus}, fetch ${i + 1}: ${compareEntry.trustScoreStatus})`);
      }
    }
  }

  if (diffs.length > 0) {
    return {
      pass: false,
      message: `${diffs.length} scoring instabilities across 3 fetches`,
      details: diffs.slice(0, 20).join('\n')
        + (diffs.length > 20 ? `\n... and ${diffs.length - 20} more` : ''),
    };
  }

  return {
    pass: true,
    message: `Trust scores stable across 3 fetches (${counts[0]} entries each)`,
  };
}

/**
 * Test 4: Browse ordering parity
 *
 * Verifies the default sort order from the API matches the TS-driven order.
 * The TS source sorts by name ascending (localeCompare) in mergeCatalogue().
 * The API SQL sorts by `ce.name ASC`.
 */
async function test04_browseOrderingParity() {
  const { data, error } = await fetchApi('/entries?status=alternative&locale=en');
  if (error) {
    return { pass: false, message: `API fetch failed: ${error}` };
  }

  const apiEntries = extractEntries(data);
  if (apiEntries.length === 0) {
    return { pass: false, message: 'API returned no entries' };
  }

  const diffs = [];

  // The TS alternatives array is already sorted by name (localeCompare)
  // The API should return entries in name ASC order
  const tsOrder = alternatives.map(a => a.id);
  const apiOrder = apiEntries.map(e => e.id || e.slug);

  if (tsOrder.length !== apiOrder.length) {
    diffs.push(`Order length mismatch: TS has ${tsOrder.length}, API has ${apiOrder.length}`);
  }

  const len = Math.min(tsOrder.length, apiOrder.length);
  let firstMismatch = -1;
  let mismatchCount = 0;

  for (let i = 0; i < len; i++) {
    if (tsOrder[i] !== apiOrder[i]) {
      if (firstMismatch === -1) firstMismatch = i;
      mismatchCount++;
    }
  }

  if (mismatchCount > 0) {
    diffs.push(`${mismatchCount} ordering mismatches starting at position ${firstMismatch}`);

    // Show first 5 mismatches for debugging
    let shown = 0;
    for (let i = 0; i < len && shown < 5; i++) {
      if (tsOrder[i] !== apiOrder[i]) {
        diffs.push(`  position ${i}: TS="${tsOrder[i]}", API="${apiOrder[i]}"`);
        shown++;
      }
    }
  }

  if (diffs.length > 0) {
    return {
      pass: false,
      message: `Browse order mismatch: ${mismatchCount} positions differ`,
      details: diffs.join('\n'),
    };
  }

  return {
    pass: true,
    message: `Browse order matches: ${tsOrder.length} entries in identical order`,
  };
}

/**
 * Test 5: Edge case coverage
 *
 * Validates specific edge cases:
 *   a) Dual-role entries (bitwarden: both alternative and US vendor)
 *   b) Unresolved replacements (replacesUS names that don't match any vendor)
 *   c) Inline reservations (defined directly on alternatives, not in trustOverrides)
 *   d) Missing logos (alternatives without custom logos)
 *   e) Entries with secondary categories
 *   f) Non-vetted alternatives (trust score pending)
 */
async function test05_edgeCaseCoverage() {
  const { data, error } = await fetchApi('/entries?status=alternative&locale=en');
  if (error) {
    return { pass: false, message: `API fetch failed: ${error}` };
  }

  const apiEntries = extractEntries(data);
  if (apiEntries.length === 0) {
    return { pass: false, message: 'API returned no entries' };
  }

  const apiMap = buildEntryMap(apiEntries);
  const diffs = [];
  const checks = {
    dualRole: 0,
    unresolvedReplacements: 0,
    inlineReservations: 0,
    missingLogos: 0,
    secondaryCategories: 0,
    nonVetted: 0,
  };

  // --- 5a: Dual-role entries ---
  // Bitwarden is both an alternative (in the catalog) and a US vendor (in usVendors).
  // The TS data has 'bitwarden' as a positiveSignals key. The API should serve it as
  // an alternative with full data.
  const dualRoleIds = ['bitwarden'];
  for (const id of dualRoleIds) {
    const tsAlt = altMap.get(id);
    const apiEntry = apiMap.get(id);

    if (!tsAlt) {
      // Not currently in the catalog as an alternative; this is OK, not all
      // US vendors are alternatives. Only test if it IS in the TS data.
      continue;
    }

    if (!apiEntry) {
      diffs.push(`dual-role[${id}]: present in TS but missing from API`);
      continue;
    }

    // Should have reservations, signals, and vendor comparisons
    const entryDiffs = compareAlternativeToApi(tsAlt, apiEntry, 'en');
    diffs.push(...entryDiffs.map(d => `dual-role: ${d}`));
    checks.dualRole++;
  }

  // --- 5b: Unresolved replacements ---
  // Find alternatives whose replacesUS names resolve to an unresolved
  // fallback comparison (id starts with "us-")
  for (const tsAlt of alternatives) {
    const unresolvedComps = (tsAlt.usVendorComparisons || [])
      .filter(c => c.id.startsWith('us-'));

    if (unresolvedComps.length === 0) continue;

    const apiEntry = apiMap.get(tsAlt.id);
    if (!apiEntry) continue;

    const apiUnresolved = (apiEntry.usVendorComparisons || [])
      .filter(c => c.id.startsWith('us-'));

    if (unresolvedComps.length !== apiUnresolved.length) {
      diffs.push(`unresolved[${tsAlt.id}]: unresolved comparison count expected ${unresolvedComps.length}, got ${apiUnresolved.length}`);
    } else {
      for (let i = 0; i < unresolvedComps.length; i++) {
        if (unresolvedComps[i].id !== apiUnresolved[i].id) {
          diffs.push(`unresolved[${tsAlt.id}]: unresolved comparison ID expected "${unresolvedComps[i].id}", got "${apiUnresolved[i].id}"`);
        }
      }
    }
    checks.unresolvedReplacements++;
  }

  // --- 5c: Inline reservations ---
  // Alternatives that have reservations defined inline (in manualAlternatives.ts)
  // rather than in trustOverrides.ts
  for (const manual of manualAlternatives) {
    if (!manual.reservations || manual.reservations.length === 0) continue;

    // This is an inline reservation (not from trustOverrides)
    const tsAlt = altMap.get(manual.id);
    const apiEntry = apiMap.get(manual.id);
    if (!tsAlt || !apiEntry) continue;

    const tsResCount = (tsAlt.reservations || []).length;
    const apiResCount = (apiEntry.reservations || []).length;

    if (tsResCount !== apiResCount) {
      diffs.push(`inline-res[${manual.id}]: reservation count expected ${tsResCount}, got ${apiResCount}`);
    } else {
      // Verify each reservation ID matches
      for (let i = 0; i < tsResCount; i++) {
        if (tsAlt.reservations[i].id !== apiEntry.reservations[i]?.id) {
          diffs.push(`inline-res[${manual.id}]: reservation[${i}].id expected "${tsAlt.reservations[i].id}", got "${apiEntry.reservations[i]?.id}"`);
        }
      }
    }
    checks.inlineReservations++;
  }

  // --- 5d: Missing logos ---
  // Alternatives that use the default fallback logo path (/logos/<id>.svg)
  // because no custom logo was specified in the original data
  for (const tsAlt of alternatives) {
    const expectedLogo = `/logos/${tsAlt.id}.svg`;
    if (tsAlt.logo !== expectedLogo) continue; // has custom logo

    const apiEntry = apiMap.get(tsAlt.id);
    if (!apiEntry) continue;

    if (apiEntry.logo !== expectedLogo) {
      diffs.push(`missing-logo[${tsAlt.id}]: expected fallback logo "${expectedLogo}", got "${apiEntry.logo}"`);
    }
    checks.missingLogos++;
  }

  // --- 5e: Secondary categories ---
  for (const tsAlt of alternatives) {
    if (!tsAlt.secondaryCategories || tsAlt.secondaryCategories.length === 0) continue;

    const apiEntry = apiMap.get(tsAlt.id);
    if (!apiEntry) continue;

    const apiSecCats = apiEntry.secondaryCategories || [];
    if (tsAlt.secondaryCategories.length !== apiSecCats.length) {
      diffs.push(`secondary-cats[${tsAlt.id}]: count expected ${tsAlt.secondaryCategories.length}, got ${apiSecCats.length}`);
    } else {
      for (let i = 0; i < tsAlt.secondaryCategories.length; i++) {
        if (tsAlt.secondaryCategories[i] !== apiSecCats[i]) {
          diffs.push(`secondary-cats[${tsAlt.id}][${i}]: expected "${tsAlt.secondaryCategories[i]}", got "${apiSecCats[i]}"`);
        }
      }
    }
    checks.secondaryCategories++;
  }

  // --- 5f: Non-vetted alternatives (trust score pending) ---
  for (const tsAlt of alternatives) {
    if (tsAlt.trustScoreStatus !== 'pending') continue;

    const apiEntry = apiMap.get(tsAlt.id);
    if (!apiEntry) continue;

    if (apiEntry.trustScoreStatus !== 'pending') {
      diffs.push(`non-vetted[${tsAlt.id}]: expected trustScoreStatus "pending", got "${apiEntry.trustScoreStatus}"`);
    }

    // Non-vetted entries should NOT have a trustScoreBreakdown
    if (tsAlt.trustScoreBreakdown == null && apiEntry.trustScoreBreakdown != null) {
      diffs.push(`non-vetted[${tsAlt.id}]: should not have trustScoreBreakdown`);
    }

    checks.nonVetted++;
  }

  if (diffs.length > 0) {
    return {
      pass: false,
      message: `${diffs.length} edge case differences`,
      details: diffs.slice(0, 30).join('\n')
        + (diffs.length > 30 ? `\n... and ${diffs.length - 30} more` : ''),
    };
  }

  const summary = [
    `dual-role: ${checks.dualRole}`,
    `unresolved-replacements: ${checks.unresolvedReplacements}`,
    `inline-reservations: ${checks.inlineReservations}`,
    `missing-logos: ${checks.missingLogos}`,
    `secondary-categories: ${checks.secondaryCategories}`,
    `non-vetted: ${checks.nonVetted}`,
  ].join(', ');

  return {
    pass: true,
    message: `Edge cases verified: ${summary}`,
  };
}


// ---------------------------------------------------------------------------
// Test runner
// ---------------------------------------------------------------------------

const TESTS = [
  { num: 1, name: 'Full payload snapshot test', fn: test01_fullPayloadSnapshot },
  { num: 2, name: 'Locale parity (EN + DE)', fn: test02_localeParity },
  { num: 3, name: 'Scoring stability', fn: test03_scoringStability },
  { num: 4, name: 'Browse ordering parity', fn: test04_browseOrderingParity },
  { num: 5, name: 'Edge case coverage', fn: test05_edgeCaseCoverage },
];

async function runAllTests() {
  console.log('='.repeat(72));
  console.log('  Shadow Validation — DB Migration Phase 2');
  console.log('='.repeat(72));
  console.log(`  API base:         ${API_BASE}`);
  console.log(`  TS alternatives:  ${alternatives.length}`);
  console.log(`  Manual entries:   ${manualAlternatives.length}`);
  console.log(`  Trust overrides:  ${Object.keys(reservationsById).length}`);
  console.log(`  Positive signals: ${Object.keys(positiveSignalsById).length}`);
  console.log(`  Scoring metadata: ${Object.keys(scoringMetadata).length}`);
  console.log('='.repeat(72));
  console.log('');

  let passed = 0;
  let failed = 0;
  const results = [];

  for (const test of TESTS) {
    const label = `Test ${String(test.num).padStart(2, '0')}: ${test.name}`;
    try {
      const result = await test.fn();
      results.push({ ...test, result });

      if (result.pass) {
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
  console.log(`  SUMMARY: ${passed} passed, ${failed} failed out of ${TESTS.length} tests`);
  console.log('='.repeat(72));

  if (failed > 0) {
    console.log('\n  Failed tests:');
    for (const r of results) {
      if (!r.result.pass) {
        console.log(`    - Test ${String(r.num).padStart(2, '0')}: ${r.name}`);
      }
    }
  }

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

runAllTests();
