#!/usr/bin/env node

/**
 * Snapshot Baseline Capture
 *
 * Captures the current TypeScript data as a deterministic JSON snapshot.
 * Used for frontend switch validation (Phase 2 of DB migration):
 * after switching to the DB-backed API, compare API responses against
 * this baseline to verify parity.
 *
 * Output:
 *   tmp/snapshots/baseline-{timestamp}.json   (timestamped copy)
 *   tmp/snapshots/latest.json                 (overwritten each run)
 *
 * Run with: npx tsx scripts/snapshot-baseline.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------- resolve project root ----------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// ---------- import TS data modules ----------

const { alternatives } = await import('../src/data/alternatives.ts');
const { categories } = await import('../src/data/categories.ts');
const { furtherReadingResources } = await import('../src/data/furtherReading.ts');
const { landingCategoryGroups } = await import('../src/data/landingCategoryGroups.ts');
const { positiveSignalsById } = await import('../src/data/positiveSignals.ts');
const { scoringMetadata } = await import('../src/data/scoringData.ts');

// ---------- compute counts ----------

/** Collect all unique tags across all alternatives. */
function countUniqueTags(alts) {
  const tagSet = new Set();
  for (const alt of alts) {
    if (alt.tags) {
      for (const tag of alt.tags) {
        tagSet.add(tag);
      }
    }
  }
  return tagSet.size;
}

/** Count total reservations across all alternatives. */
function countReservations(alts) {
  let total = 0;
  for (const alt of alts) {
    if (alt.reservations) {
      total += alt.reservations.length;
    }
  }
  return total;
}

/** Count total positive signals across all alternatives. */
function countPositiveSignals(alts) {
  let total = 0;
  for (const alt of alts) {
    if (alt.positiveSignals) {
      total += alt.positiveSignals.length;
    }
  }
  return total;
}

/** Count vetted vs pending alternatives. */
function countByStatus(alts) {
  let vetted = 0;
  let pending = 0;
  for (const alt of alts) {
    if (alt.trustScoreStatus === 'ready') {
      vetted++;
    } else {
      pending++;
    }
  }
  return { vetted, pending };
}

// ---------- build trust scores map ----------

/** Build a trust scores map keyed by alternative ID. */
function buildTrustScoresMap(alts) {
  const map = {};
  for (const alt of alts) {
    map[alt.id] = {
      score: alt.trustScore ?? null,
      status: alt.trustScoreStatus ?? 'pending',
      breakdown: alt.trustScoreBreakdown ?? null,
    };
  }
  return map;
}

// ---------- deterministic sort ----------

/**
 * Sort an array of objects by their `id` property for deterministic output.
 * Returns a new array (does not mutate the input).
 */
function sortById(arr) {
  return [...arr].sort((a, b) => {
    const aId = a.id ?? '';
    const bId = b.id ?? '';
    return aId.localeCompare(bId);
  });
}

/**
 * Sort trust scores map keys for deterministic JSON serialization.
 * Returns a new object with sorted keys.
 */
function sortObjectKeys(obj) {
  const sorted = {};
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = obj[key];
  }
  return sorted;
}

// ---------- main ----------

function main() {
  const capturedAt = new Date().toISOString();
  const { vetted, pending } = countByStatus(alternatives);

  const snapshot = {
    capturedAt,
    counts: {
      alternatives: alternatives.length,
      categories: categories.length,
      tags: countUniqueTags(alternatives),
      reservations: countReservations(alternatives),
      positiveSignals: countPositiveSignals(alternatives),
      vettedAlternatives: vetted,
      pendingAlternatives: pending,
    },
    alternatives: sortById(alternatives),
    categories: sortById(categories),
    furtherReadingResources: sortById(furtherReadingResources),
    landingCategoryGroups: [...landingCategoryGroups],
    trustScores: sortObjectKeys(buildTrustScoresMap(alternatives)),
  };

  // Ensure output directory exists
  const outDir = path.join(ROOT, 'tmp', 'snapshots');
  fs.mkdirSync(outDir, { recursive: true });

  // Deterministic JSON serialization (sorted keys, 2-space indent)
  const json = JSON.stringify(snapshot, null, 2);

  // Write timestamped snapshot
  const timestamp = capturedAt.replace(/[:.]/g, '-').replace('T', '_').replace('Z', '');
  const timestampedPath = path.join(outDir, `baseline-${timestamp}.json`);
  fs.writeFileSync(timestampedPath, json, 'utf-8');

  // Write latest.json (overwrite)
  const latestPath = path.join(outDir, 'latest.json');
  fs.writeFileSync(latestPath, json, 'utf-8');

  // Report
  const sizeKB = (Buffer.byteLength(json, 'utf-8') / 1024).toFixed(1);
  console.log('Snapshot baseline captured successfully.');
  console.log('');
  console.log('Counts:');
  console.log(`  Alternatives:       ${snapshot.counts.alternatives}`);
  console.log(`  Categories:         ${snapshot.counts.categories}`);
  console.log(`  Unique tags:        ${snapshot.counts.tags}`);
  console.log(`  Reservations:       ${snapshot.counts.reservations}`);
  console.log(`  Positive signals:   ${snapshot.counts.positiveSignals}`);
  console.log(`  Vetted:             ${snapshot.counts.vettedAlternatives}`);
  console.log(`  Pending:            ${snapshot.counts.pendingAlternatives}`);
  console.log('');
  console.log(`Timestamped: ${timestampedPath}`);
  console.log(`Latest:      ${latestPath}`);
  console.log(`Size:        ${sizeKB} KB`);
}

main();
