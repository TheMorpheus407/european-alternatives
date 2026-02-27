#!/usr/bin/env node

/**
 * Snapshot Comparison Tool
 *
 * Compares two snapshot JSON files (or a snapshot against live API data)
 * to verify parity during the database migration frontend switch.
 *
 * Usage:
 *   # Compare two snapshot files
 *   npx tsx scripts/snapshot-compare.mjs --base tmp/snapshots/latest.json --compare tmp/snapshots/other.json
 *
 *   # Compare snapshot against API
 *   npx tsx scripts/snapshot-compare.mjs --base tmp/snapshots/latest.json --api https://european-alternatives.cloud
 *
 * Exit codes:
 *   0 — snapshots are identical (within tolerance)
 *   1 — differences found
 *   2 — usage error or file not found
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------- resolve project root ----------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// ---------- CLI arg parsing ----------

const args = process.argv.slice(2);

function getArg(name) {
  const idx = args.indexOf(name);
  if (idx === -1 || idx + 1 >= args.length) return undefined;
  return args[idx + 1];
}

const basePath = getArg('--base');
const comparePath = getArg('--compare');
const apiBase = getArg('--api');

if (!basePath) {
  console.error('Usage:');
  console.error('  npx tsx scripts/snapshot-compare.mjs --base <file> --compare <file>');
  console.error('  npx tsx scripts/snapshot-compare.mjs --base <file> --api <url>');
  process.exit(2);
}

if (!comparePath && !apiBase) {
  console.error('Error: provide either --compare <file> or --api <url>');
  process.exit(2);
}

if (comparePath && apiBase) {
  console.error('Error: provide either --compare or --api, not both');
  process.exit(2);
}

// ---------- constants ----------

/** Floating point tolerance for trust score comparisons. */
const SCORE_TOLERANCE = 0.01;

// ---------- load snapshot files ----------

/**
 * Load and parse a snapshot JSON file.
 * @param {string} filePath - path to the snapshot JSON file
 * @returns {object} parsed snapshot object
 */
function loadSnapshot(filePath) {
  const resolved = path.isAbsolute(filePath) ? filePath : path.resolve(ROOT, filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`Error: file not found: ${resolved}`);
    process.exit(2);
  }
  const content = fs.readFileSync(resolved, 'utf-8');
  return JSON.parse(content);
}

// ---------- API snapshot builder ----------

/**
 * Fetch a snapshot from the live API.
 * Assembles data from multiple endpoints to match the snapshot format.
 *
 * @param {string} baseUrl - API base URL (e.g. https://european-alternatives.cloud)
 * @returns {Promise<object>} snapshot-shaped object
 */
async function fetchApiSnapshot(baseUrl) {
  const url = (endpoint) => `${baseUrl.replace(/\/$/, '')}${endpoint}`;

  console.log(`Fetching snapshot from API: ${baseUrl}`);

  // Fetch alternatives and categories in parallel
  const [entriesRes, categoriesRes] = await Promise.all([
    fetch(url('/api/catalog/entries?status=alternative&locale=en')),
    fetch(url('/api/catalog/categories?locale=en')),
  ]);

  if (!entriesRes.ok) {
    console.error(`API error fetching entries: ${entriesRes.status} ${entriesRes.statusText}`);
    process.exit(2);
  }
  if (!categoriesRes.ok) {
    console.error(`API error fetching categories: ${categoriesRes.status} ${categoriesRes.statusText}`);
    process.exit(2);
  }

  const entriesData = await entriesRes.json();
  const categoriesData = await categoriesRes.json();

  // Extract arrays from API envelope (adapt to actual API response shape)
  const apiAlternatives = entriesData.data ?? entriesData.entries ?? entriesData;
  const apiCategories = categoriesData.data ?? categoriesData.categories ?? categoriesData;

  // Normalize alternatives to match snapshot shape
  const alternatives = Array.isArray(apiAlternatives) ? apiAlternatives : [];
  const categoriesList = Array.isArray(apiCategories) ? apiCategories : [];

  // Build trust scores map from API alternatives
  const trustScores = {};
  for (const alt of alternatives) {
    const id = alt.id ?? alt.slug;
    trustScores[id] = {
      score: alt.trustScore ?? alt.trust_score_10_display ?? null,
      status: alt.trustScoreStatus ?? alt.trust_score_status ?? 'pending',
      breakdown: alt.trustScoreBreakdown ?? alt.trust_score_breakdown_json ?? null,
    };
  }

  // Compute counts
  const tagSet = new Set();
  let reservationCount = 0;
  let signalCount = 0;
  let vetted = 0;
  let pending = 0;

  for (const alt of alternatives) {
    const tags = alt.tags ?? [];
    for (const tag of tags) tagSet.add(tag);

    const reservations = alt.reservations ?? [];
    reservationCount += reservations.length;

    const signals = alt.positiveSignals ?? alt.positive_signals ?? [];
    signalCount += signals.length;

    const status = alt.trustScoreStatus ?? alt.trust_score_status;
    if (status === 'ready') vetted++;
    else pending++;
  }

  return {
    capturedAt: new Date().toISOString(),
    counts: {
      alternatives: alternatives.length,
      categories: categoriesList.length,
      tags: tagSet.size,
      reservations: reservationCount,
      positiveSignals: signalCount,
      vettedAlternatives: vetted,
      pendingAlternatives: pending,
    },
    alternatives: alternatives.sort((a, b) => {
      const aId = a.id ?? a.slug ?? '';
      const bId = b.id ?? b.slug ?? '';
      return aId.localeCompare(bId);
    }),
    categories: categoriesList.sort((a, b) => {
      const aId = a.id ?? '';
      const bId = b.id ?? '';
      return aId.localeCompare(bId);
    }),
    trustScores,
  };
}

// ---------- comparison logic ----------

/**
 * @typedef {object} ComparisonResult
 * @property {boolean} identical - true if snapshots match within tolerance
 * @property {string[]} differences - list of human-readable difference descriptions
 * @property {{ added: string[], removed: string[], changed: string[] }} entries
 */

/**
 * Compare two snapshot objects.
 *
 * @param {object} base - the baseline snapshot
 * @param {object} compare - the comparison snapshot
 * @returns {ComparisonResult}
 */
function compareSnapshots(base, compare) {
  const differences = [];
  const added = [];
  const removed = [];
  const changed = [];

  // 1. Check counts match
  const countKeys = [
    'alternatives', 'categories', 'tags', 'reservations',
    'positiveSignals', 'vettedAlternatives', 'pendingAlternatives',
  ];

  for (const key of countKeys) {
    const baseVal = base.counts?.[key] ?? 0;
    const compareVal = compare.counts?.[key] ?? 0;
    if (baseVal !== compareVal) {
      differences.push(`Count mismatch for "${key}": base=${baseVal}, compare=${compareVal}`);
    }
  }

  // 2. Check every alternative exists in both
  const baseAltIds = new Set((base.alternatives ?? []).map((a) => a.id));
  const compareAltIds = new Set((compare.alternatives ?? []).map((a) => a.id ?? a.slug));

  for (const id of baseAltIds) {
    if (!compareAltIds.has(id)) {
      removed.push(id);
      differences.push(`Alternative removed: "${id}" exists in base but not in compare`);
    }
  }

  for (const id of compareAltIds) {
    if (!baseAltIds.has(id)) {
      added.push(id);
      differences.push(`Alternative added: "${id}" exists in compare but not in base`);
    }
  }

  // 3. Check trust scores match (within tolerance)
  const baseTrust = base.trustScores ?? {};
  const compareTrust = compare.trustScores ?? {};

  for (const id of baseAltIds) {
    if (!compareAltIds.has(id)) continue; // already reported as removed

    const baseScore = baseTrust[id]?.score;
    const compareScore = compareTrust[id]?.score;

    if (baseScore == null && compareScore == null) continue;
    if (baseScore == null || compareScore == null) {
      differences.push(`Trust score mismatch for "${id}": base=${baseScore}, compare=${compareScore}`);
      changed.push(id);
      continue;
    }

    if (Math.abs(baseScore - compareScore) > SCORE_TOLERANCE) {
      differences.push(
        `Trust score mismatch for "${id}": base=${baseScore}, compare=${compareScore} (delta=${Math.abs(baseScore - compareScore).toFixed(4)})`
      );
      changed.push(id);
    }

    // Check trust score status
    const baseStatus = baseTrust[id]?.status;
    const compareStatus = compareTrust[id]?.status;
    if (baseStatus !== compareStatus) {
      differences.push(
        `Trust score status mismatch for "${id}": base="${baseStatus}", compare="${compareStatus}"`
      );
      if (!changed.includes(id)) changed.push(id);
    }
  }

  // 4. Check category assignments match
  const baseAltMap = new Map((base.alternatives ?? []).map((a) => [a.id, a]));
  const compareAltMap = new Map((compare.alternatives ?? []).map((a) => [a.id ?? a.slug, a]));

  for (const id of baseAltIds) {
    if (!compareAltIds.has(id)) continue;

    const baseAlt = baseAltMap.get(id);
    const compareAlt = compareAltMap.get(id);

    // Primary category
    const baseCat = baseAlt?.category;
    const compareCat = compareAlt?.category;
    if (baseCat !== compareCat) {
      differences.push(`Category mismatch for "${id}": base="${baseCat}", compare="${compareCat}"`);
      if (!changed.includes(id)) changed.push(id);
    }

    // Secondary categories
    const baseSecondary = (baseAlt?.secondaryCategories ?? []).sort().join(',');
    const compareSecondary = (compareAlt?.secondaryCategories ?? []).sort().join(',');
    if (baseSecondary !== compareSecondary) {
      differences.push(
        `Secondary categories mismatch for "${id}": base=[${baseSecondary}], compare=[${compareSecondary}]`
      );
      if (!changed.includes(id)) changed.push(id);
    }
  }

  // 5. Check reservation counts match per alternative
  for (const id of baseAltIds) {
    if (!compareAltIds.has(id)) continue;

    const baseAlt = baseAltMap.get(id);
    const compareAlt = compareAltMap.get(id);

    const baseResCount = (baseAlt?.reservations ?? []).length;
    const compareResCount = (compareAlt?.reservations ?? []).length;
    if (baseResCount !== compareResCount) {
      differences.push(
        `Reservation count mismatch for "${id}": base=${baseResCount}, compare=${compareResCount}`
      );
      if (!changed.includes(id)) changed.push(id);
    }
  }

  // 6. Check category counts
  const baseCatIds = new Set((base.categories ?? []).map((c) => c.id));
  const compareCatIds = new Set((compare.categories ?? []).map((c) => c.id));

  for (const id of baseCatIds) {
    if (!compareCatIds.has(id)) {
      differences.push(`Category removed: "${id}" exists in base but not in compare`);
    }
  }
  for (const id of compareCatIds) {
    if (!baseCatIds.has(id)) {
      differences.push(`Category added: "${id}" exists in compare but not in base`);
    }
  }

  return {
    identical: differences.length === 0,
    differences,
    entries: { added, removed, changed },
  };
}

// ---------- report ----------

/**
 * Print a human-readable comparison report.
 * @param {ComparisonResult} result
 * @param {object} base
 * @param {object} compare
 */
function printReport(result, base, compare) {
  console.log('');
  console.log('=== Snapshot Comparison Report ===');
  console.log('');
  console.log(`Base captured at:    ${base.capturedAt}`);
  console.log(`Compare captured at: ${compare.capturedAt}`);
  console.log('');

  // Summary counts side-by-side
  console.log('Counts:');
  const countKeys = [
    ['alternatives', 'Alternatives'],
    ['categories', 'Categories'],
    ['tags', 'Unique tags'],
    ['reservations', 'Reservations'],
    ['positiveSignals', 'Positive signals'],
    ['vettedAlternatives', 'Vetted'],
    ['pendingAlternatives', 'Pending'],
  ];

  for (const [key, label] of countKeys) {
    const baseVal = base.counts?.[key] ?? 0;
    const compareVal = compare.counts?.[key] ?? 0;
    const match = baseVal === compareVal ? ' ' : '*';
    console.log(`  ${match} ${label.padEnd(20)} base=${String(baseVal).padStart(4)}  compare=${String(compareVal).padStart(4)}`);
  }

  console.log('');

  if (result.identical) {
    console.log('Result: IDENTICAL');
    console.log('All alternatives, categories, trust scores, and reservations match.');
  } else {
    console.log(`Result: ${result.differences.length} DIFFERENCE(S) FOUND`);
    console.log('');

    if (result.entries.added.length > 0) {
      console.log(`Added entries (${result.entries.added.length}):`);
      for (const id of result.entries.added) {
        console.log(`  + ${id}`);
      }
      console.log('');
    }

    if (result.entries.removed.length > 0) {
      console.log(`Removed entries (${result.entries.removed.length}):`);
      for (const id of result.entries.removed) {
        console.log(`  - ${id}`);
      }
      console.log('');
    }

    if (result.entries.changed.length > 0) {
      console.log(`Changed entries (${result.entries.changed.length}):`);
      for (const id of result.entries.changed) {
        console.log(`  ~ ${id}`);
      }
      console.log('');
    }

    console.log('Details:');
    for (const diff of result.differences) {
      console.log(`  - ${diff}`);
    }
  }

  console.log('');
}

// ---------- main ----------

async function main() {
  // Load base snapshot
  const base = loadSnapshot(basePath);

  // Load or fetch comparison snapshot
  let compare;
  if (comparePath) {
    compare = loadSnapshot(comparePath);
  } else {
    compare = await fetchApiSnapshot(apiBase);
  }

  // Run comparison
  const result = compareSnapshots(base, compare);

  // Print report
  printReport(result, base, compare);

  // Exit code
  process.exit(result.identical ? 0 : 1);
}

main();
