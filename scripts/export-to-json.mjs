#!/usr/bin/env node

/**
 * Export TS data to JSON for database import.
 *
 * This script imports all TypeScript data modules, runs the trust scoring
 * engine (via the already-computed alternatives pipeline), and writes a
 * single JSON file to tmp/export/catalog.json.  The PHP import script
 * reads only this JSON.
 *
 * The output is a flat, snake_case structure that maps 1-to-1 to the MySQL
 * schema tables.  Every top-level key is an array of plain row objects.
 *
 * Run with: npx tsx scripts/export-to-json.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------- resolve project root ----------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

// ---------- import TS data modules ----------

// Individual source lists (needed to determine source_file per alternative)
import { manualAlternatives } from '../src/data/manualAlternatives.ts';
import { researchAlternatives } from '../src/data/researchAlternatives.ts';

// The merged alternatives pipeline (computes trust scores, dedupes, normalizes)
import { alternatives } from '../src/data/alternatives.ts';

// Category definitions
import { categories } from '../src/data/categories.ts';

// US vendor raw data (records, trust profiles)
import {
  US_VENDOR_RECORDS,
  US_VENDOR_TRUST_PROFILES,
} from '../src/data/usVendors.ts';

// Reservations keyed by alternative ID
import { reservationsById } from '../src/data/trustOverrides.ts';

// Positive signals keyed by alternative ID
import { positiveSignalsById } from '../src/data/positiveSignals.ts';

// Scoring metadata keyed by alternative ID
import { scoringMetadata } from '../src/data/scoringData.ts';

// Further reading resources
import { furtherReadingResources } from '../src/data/furtherReading.ts';

// Landing category groups
import { landingCategoryGroups } from '../src/data/landingCategoryGroups.ts';

// ---------- load i18n locale files ----------

const enDataPath = path.join(repoRoot, 'src/i18n/locales/en/data.json');
const deDataPath = path.join(repoRoot, 'src/i18n/locales/de/data.json');
const enLandingPath = path.join(repoRoot, 'src/i18n/locales/en/landing.json');
const deLandingPath = path.join(repoRoot, 'src/i18n/locales/de/landing.json');

const enData = JSON.parse(fs.readFileSync(enDataPath, 'utf-8'));
const deData = JSON.parse(fs.readFileSync(deDataPath, 'utf-8'));
const enLanding = JSON.parse(fs.readFileSync(enLandingPath, 'utf-8'));
const deLanding = JSON.parse(fs.readFileSync(deLandingPath, 'utf-8'));

const enCountries = enData.countries ?? {};
const deCountries = deData.countries ?? {};
const enCategories = enData.categories ?? {};
const deCategories = deData.categories ?? {};
const enCategoryGroups = enLanding.categoryGroups ?? {};
const deCategoryGroups = deLanding.categoryGroups ?? {};

// ---------- build manual ID set for source_file tagging ----------

const manualIdSet = new Set(manualAlternatives.map((a) => a.id));

// ---------- build US vendor alias-to-slug lookup ----------

function normalizeVendorName(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Map from normalized alias string -> vendor record id (slug) */
const aliasToVendorSlug = new Map();
for (const record of US_VENDOR_RECORDS) {
  const names = [record.name, ...record.aliases];
  for (const name of names) {
    const normalized = normalizeVendorName(name);
    if (normalized) {
      aliasToVendorSlug.set(normalized, record.id);
    }
  }
}

/**
 * Attempt to resolve a raw US vendor name to a vendor slug.
 * Returns the slug if found, otherwise null.
 */
function resolveVendorSlug(rawName) {
  const normalized = normalizeVendorName(rawName);
  return aliasToVendorSlug.get(normalized) ?? null;
}

// ---------- parse DENIED_ALTERNATIVES.md ----------

function parseDeniedAlternatives(mdContent) {
  const entries = [];

  // Split on "## " headings (skip preamble before first heading)
  const sections = mdContent.split(/^## /m).slice(1);

  for (const section of sections) {
    const lines = section.split('\n');
    const heading = lines[0]?.trim() ?? '';

    // Parse the heading: "Name (Category)" pattern
    const headingMatch = heading.match(/^(.+?)\s*\((.+?)\)\s*$/);
    const name = headingMatch ? headingMatch[1].trim() : heading;
    const category = headingMatch ? headingMatch[2].trim() : undefined;

    const fullText = section;

    // Extract bold-prefixed metadata fields
    const metadata = {};
    const metadataPatterns = [
      { key: 'proposedIn', pattern: /\*\*Proposed in:\*\*\s*(.+)/i },
      { key: 'previouslyListed', pattern: /\*\*Previously listed,?\s*removed in:\*\*\s*(.+)/i },
      { key: 'claimedOrigin', pattern: /\*\*Claimed origin(?:\s*in\s*catalog)?:\*\*\s*(.+)/i },
      { key: 'actualOrigin', pattern: /\*\*Actual origin:\*\*\s*(.+)/i },
      { key: 'effectiveControl', pattern: /\*\*Effective control:\*\*\s*(.+)/i },
      { key: 'origin', pattern: /\*\*Origin:\*\*\s*(.+)/i },
      { key: 'category', pattern: /\*\*Category:\*\*\s*(.+)/i },
      { key: 'verificationResult', pattern: /\*\*Verification result:\*\*\s*(.+)/i },
      { key: 'legalServiceEntity', pattern: /\*\*Legal service entity:\*\*\s*(.+)/i },
      { key: 'raisedIn', pattern: /\*\*Raised in:\*\*\s*(.+)/i },
    ];

    for (const { key, pattern } of metadataPatterns) {
      const match = fullText.match(pattern);
      if (match) {
        metadata[key] = match[1].trim();
      }
    }

    // Extract denial/removal reason text
    let reasonText = '';
    const reasonMatch = fullText.match(
      /###\s+Reason(?:\s+for\s+(?:Denial|Removal))?\s*\n([\s\S]*?)(?=###\s+Sources|###\s+Additional|---|\n##\s)/i,
    );
    if (reasonMatch) {
      reasonText = reasonMatch[1].trim();
    }

    // Extract additional concerns if present
    let additionalConcerns = '';
    const additionalMatch = fullText.match(
      /###\s+Additional Concerns?\s*\n([\s\S]*?)(?=###\s+Sources|---|\n##\s)/i,
    );
    if (additionalMatch) {
      additionalConcerns = additionalMatch[1].trim();
    }

    // Combine reason + additional concerns for text_en
    const textEn = additionalConcerns
      ? `${reasonText}\n\n${additionalConcerns}`
      : reasonText;

    // Extract sources as URLs from markdown links under "### Sources"
    const sources = [];
    const sourcesMatch = fullText.match(/###\s+Sources\s*\n([\s\S]*?)(?=---|$)/i);
    if (sourcesMatch) {
      const sourcesBlock = sourcesMatch[1];
      const linkPattern = /\[([^\]]*)\]\(([^)]+)\)/g;
      let linkMatch;
      while ((linkMatch = linkPattern.exec(sourcesBlock)) !== null) {
        sources.push({
          title: linkMatch[1].trim(),
          url: linkMatch[2].trim(),
        });
      }
    }

    // Infer failed gateways
    const failedGateways = [];
    const gwPatterns = [
      /(?:fails?|failed)\s[\s\S]{0,40}?\*{0,2}G(\d+)\*{0,2}/gi,
      /criterion\s+\*{0,2}G(\d+)\*{0,2}/gi,
    ];
    for (const gwPattern of gwPatterns) {
      let gwMatch;
      while ((gwMatch = gwPattern.exec(fullText)) !== null) {
        const gw = `G${gwMatch[1]}`;
        if (!failedGateways.includes(gw)) {
          failedGateways.push(gw);
        }
      }
    }

    // Generate a slug-style ID from the name
    const id = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Determine proposedIn (could be "Proposed in" or "Raised in" or "Previously listed, removed in")
    const proposedIn = metadata.proposedIn ?? metadata.raisedIn ?? null;
    const removedIn = metadata.previouslyListed ?? null;

    // Claimed/actual origin
    const claimedOrigin = metadata.claimedOrigin ?? metadata.origin ?? null;
    const actualOrigin = metadata.actualOrigin ?? metadata.effectiveControl ?? null;

    entries.push({
      id,
      name,
      rawCategoryLabel: metadata.category ?? category ?? null,
      proposedIn,
      removedIn,
      claimedOrigin,
      actualOrigin,
      textEn,
      sources,
      failedGateways,
    });
  }

  return entries;
}

// =====================================================================
//  BUILDERS — one function per output table
// =====================================================================

/** 1. countries */
function buildCountries(alts) {
  const seen = new Set();
  const rows = [];

  for (const alt of alts) {
    if (alt.country && !seen.has(alt.country)) {
      seen.add(alt.country);
      rows.push({
        code: alt.country,
        label_en: enCountries[alt.country] ?? alt.country.toUpperCase(),
        label_de: deCountries[alt.country] ?? enCountries[alt.country] ?? alt.country.toUpperCase(),
      });
    }
  }

  // Also add 'us' if not present (needed for US vendor entries)
  if (!seen.has('us')) {
    rows.push({
      code: 'us',
      label_en: enCountries['us'] ?? 'United States',
      label_de: deCountries['us'] ?? 'Vereinigte Staaten',
    });
  }

  rows.sort((a, b) => a.code.localeCompare(b.code));
  return rows.map((r, i) => ({ ...r, sort_order: i }));
}

/** 2. categories */
function buildCategories() {
  return categories.map((cat, idx) => ({
    id: cat.id,
    emoji: cat.emoji,
    name_en: enCategories[cat.id]?.name ?? cat.name,
    name_de: deCategories[cat.id]?.name ?? cat.name,
    description_en: enCategories[cat.id]?.description ?? cat.description,
    description_de: deCategories[cat.id]?.description ?? cat.description,
    sort_order: idx,
  }));
}

/** 3. tags — collect unique tags across all alternatives */
function buildTags(alts) {
  const tagSet = new Set();
  for (const alt of alts) {
    if (alt.tags) {
      for (const tag of alt.tags) {
        tagSet.add(tag);
      }
    }
  }

  return Array.from(tagSet).sort().map((slug) => ({
    slug,
    label_en: slug,
    label_de: null,
  }));
}

/** 4. catalog_entries — alternatives + US vendors + denied entries */
function buildCatalogEntries(alts, usVendorRecords, deniedEntries) {
  const rows = [];
  const seenSlugs = new Set();

  // Alternatives
  for (const alt of alts) {
    const sourceFile = manualIdSet.has(alt.id) ? 'manual' : 'research';
    const isDefaultLogo = alt.logo === `/logos/${alt.id}.svg`;

    rows.push({
      slug: alt.id,
      status: 'alternative',
      source_file: sourceFile,
      is_active: true,
      name: alt.name,
      description_en: alt.description,
      description_de: alt.localizedDescriptions?.de ?? null,
      country_code: alt.country,
      website_url: alt.website,
      logo_path: isDefaultLogo ? null : (alt.logo ?? null),
      pricing: alt.pricing,
      is_open_source: alt.isOpenSource,
      open_source_level: alt.openSourceLevel ?? null,
      open_source_audit_url: alt.openSourceAuditUrl ?? null,
      source_code_url: alt.sourceCodeUrl ?? null,
      self_hostable: alt.selfHostable ?? null,
      founded_year: alt.foundedYear ?? null,
      headquarters_city: alt.headquartersCity ?? null,
      license_text: alt.license ?? null,
      action_links_json: alt.actionLinks ?? null,
    });
    seenSlugs.add(alt.id);
  }

  // US vendor entries — skip if slug already exists (dual-role: alternative takes priority)
  for (const record of usVendorRecords) {
    if (seenSlugs.has(record.id)) continue;

    rows.push({
      slug: record.id,
      status: 'us',
      source_file: 'us',
      is_active: true,
      name: record.name,
      description_en: null,
      description_de: null,
      country_code: 'us',
      website_url: null,
      logo_path: null,
      pricing: null,
      is_open_source: null,
      open_source_level: null,
      open_source_audit_url: null,
      source_code_url: null,
      self_hostable: null,
      founded_year: null,
      headquarters_city: null,
      license_text: null,
      action_links_json: null,
    });
    seenSlugs.add(record.id);
  }

  // Denied entries — skip if slug already exists (dual-role: US vendor or alternative takes priority)
  for (const denied of deniedEntries) {
    if (seenSlugs.has(denied.id)) continue;

    rows.push({
      slug: denied.id,
      status: 'denied',
      source_file: 'denied',
      is_active: false,
      name: denied.name,
      description_en: null,
      description_de: null,
      country_code: null,
      website_url: null,
      logo_path: null,
      pricing: null,
      is_open_source: null,
      open_source_level: null,
      open_source_audit_url: null,
      source_code_url: null,
      self_hostable: null,
      founded_year: null,
      headquarters_city: null,
      license_text: null,
      action_links_json: null,
    });
    seenSlugs.add(denied.id);
  }

  return rows;
}

/** 5a. entry_categories */
function buildEntryCategories(alts) {
  const rows = [];

  for (const alt of alts) {
    // Primary category
    rows.push({
      entry_slug: alt.id,
      category_id: alt.category,
      is_primary: true,
      sort_order: 0,
    });

    // Secondary categories
    if (alt.secondaryCategories) {
      for (let i = 0; i < alt.secondaryCategories.length; i++) {
        rows.push({
          entry_slug: alt.id,
          category_id: alt.secondaryCategories[i],
          is_primary: false,
          sort_order: i + 1,
        });
      }
    }
  }

  return rows;
}

/** 5b. entry_tags */
function buildEntryTags(alts) {
  const rows = [];

  for (const alt of alts) {
    if (alt.tags) {
      for (let i = 0; i < alt.tags.length; i++) {
        rows.push({
          entry_slug: alt.id,
          tag_slug: alt.tags[i],
          sort_order: i,
        });
      }
    }
  }

  return rows;
}

/** 6a. us_vendors */
function buildUsVendors(records) {
  return records.map((record) => ({
    slug: record.id,
    name: record.name,
    entry_slug: record.id,  // The catalog_entry slug for this US vendor
  }));
}

/** 6b. us_vendor_aliases */
function buildUsVendorAliases(records) {
  const rows = [];
  const seen = new Set();
  for (const record of records) {
    for (const alias of record.aliases) {
      const normalized = normalizeVendorName(alias);
      if (!normalized) continue;
      const key = `${record.id}|${normalized}`;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push({
        vendor_slug: record.id,
        alias_normalized: normalized,
      });
    }
  }
  return rows;
}

/** 7a. us_vendor_profiles */
function buildUsVendorProfiles(profiles) {
  const rows = [];
  for (const [vendorSlug, profile] of Object.entries(profiles)) {
    const hasReservations = profile.reservations && profile.reservations.length > 0;
    rows.push({
      vendor_slug: vendorSlug,
      description_en: profile.description ?? null,
      description_de: profile.descriptionDe ?? null,
      trust_score_override_10: profile.trustScore ?? null,
      trust_score_status: hasReservations ? 'ready' : 'pending',
      score_source: 'computed',
    });
  }
  return rows;
}

/** 7b. us_vendor_profile_reservations */
function buildUsVendorProfileReservations(profiles) {
  const rows = [];
  for (const [vendorSlug, profile] of Object.entries(profiles)) {
    if (profile.reservations) {
      for (let i = 0; i < profile.reservations.length; i++) {
        const r = profile.reservations[i];
        rows.push({
          vendor_slug: vendorSlug,
          reservation_key: r.id,
          sort_order: i,
          text_en: r.text,
          text_de: r.textDe ?? null,
          severity: r.severity,
          event_date: r.date ?? null,
          source_url: r.sourceUrl ?? null,
          penalty_tier: r.penalty?.tier ?? null,
          penalty_amount: r.penalty?.amount ?? null,
        });
      }
    }
  }
  return rows;
}

/** 8. category_us_vendors — from each category's usGiants array */
function buildCategoryUsVendors() {
  const rows = [];

  for (const cat of categories) {
    for (let i = 0; i < cat.usGiants.length; i++) {
      const rawName = cat.usGiants[i];
      const vendorSlug = resolveVendorSlug(rawName);
      rows.push({
        category_id: cat.id,
        vendor_slug: vendorSlug,
        raw_name: rawName,
        sort_order: i,
      });
    }
  }

  return rows;
}

/** 9. entry_replacements — from each alternative's resolved usVendorComparisons */
function buildEntryReplacements(alts) {
  const rows = [];

  for (const alt of alts) {
    const comparisons = alt.usVendorComparisons ?? [];
    for (let i = 0; i < comparisons.length; i++) {
      const comp = comparisons[i];
      rows.push({
        entry_slug: alt.id,
        raw_name: comp.name,
        vendor_slug: comp.id,
        sort_order: i,
      });
    }
  }

  return rows;
}

/**
 * 10. reservations — flatten into a flat array.
 *
 * Precedence: an alternative's inline `.reservations` array (even if empty)
 * takes priority over the trustOverrides entry.  Only fall back to
 * reservationsById when the merged alternative already merged them.
 *
 * Since the `alternatives` array is the merged pipeline output, each
 * alternative already has the correct reservations resolved.
 */
function buildReservations(alts) {
  const rows = [];

  for (const alt of alts) {
    const reservations = alt.reservations ?? [];
    for (let i = 0; i < reservations.length; i++) {
      const r = reservations[i];
      rows.push({
        entry_slug: alt.id,
        reservation_key: r.id,
        sort_order: i,
        severity: r.severity,
        event_date: r.date ?? null,
        penalty_tier: r.penalty?.tier ?? null,
        penalty_amount: r.penalty?.amount ?? null,
        is_structural: !r.date,
        text_en: r.text,
        text_de: r.textDe ?? null,
        source_url: r.sourceUrl ?? null,
      });
    }
  }

  return rows;
}

/** 11. positive_signals — flatten from positiveSignalsById and inline */
function buildPositiveSignals(alts) {
  const rows = [];

  for (const alt of alts) {
    const signals = alt.positiveSignals ?? [];
    for (let i = 0; i < signals.length; i++) {
      const s = signals[i];
      rows.push({
        entry_slug: alt.id,
        signal_key: s.id,
        sort_order: i,
        dimension: s.dimension,
        amount: s.amount,
        text_en: s.text,
        text_de: s.textDe ?? null,
        source_url: s.sourceUrl ?? null,
      });
    }
  }

  return rows;
}

/** 12. scoring_metadata */
function buildScoringMetadata() {
  const rows = [];
  for (const [entrySlug, meta] of Object.entries(scoringMetadata)) {
    rows.push({
      entry_slug: entrySlug,
      base_class_override: meta.baseClassOverride ?? null,
      is_ad_surveillance: meta.isAdSurveillance ?? null,
      deep_research_path: null,
      worksheet_path: null,
    });
  }
  return rows;
}

/** 13. trust_scores — from each alternative's computed trust score */
function buildTrustScores(alts) {
  const rows = [];

  for (const alt of alts) {
    if (alt.trustScore == null) continue;

    rows.push({
      entry_slug: alt.id,
      trust_score_100: Math.round(alt.trustScore * 10),
      trust_score_10_display: alt.trustScore,
      trust_score_status: alt.trustScoreStatus ?? 'pending',
      trust_score_breakdown_json: alt.trustScoreBreakdown ?? null,
    });
  }

  return rows;
}

/** 14. denied_decisions */
function buildDeniedDecisions(deniedEntries) {
  return deniedEntries.map((d) => ({
    entry_slug: d.id,
    proposed_in: d.proposedIn,
    claimed_origin: d.claimedOrigin,
    actual_origin: d.actualOrigin,
    removed_in: d.removedIn,
    raw_category_label: d.rawCategoryLabel,
    failed_gateways_json: d.failedGateways.length > 0 ? d.failedGateways : null,
    text_en: d.textEn,
    text_de: null,
    sources_json: d.sources.length > 0 ? d.sources : null,
  }));
}

/** 15. further_reading_resources */
function buildFurtherReadingResources() {
  return furtherReadingResources.map((r, idx) => ({
    slug: r.id,
    name: r.name,
    website_url: r.website,
    section: r.section,
    focus: r.focus,
    related_issues_json: r.relatedIssues.length > 0 ? r.relatedIssues : null,
    last_reviewed: r.lastReviewed ?? null,
    sort_order: idx,
  }));
}

/** 16a. landing_category_groups */
function buildLandingCategoryGroups() {
  return landingCategoryGroups.map((g, idx) => ({
    source_id: g.id,
    name_en: enCategoryGroups[g.id]?.name ?? g.id,
    name_de: deCategoryGroups[g.id]?.name ?? null,
    description_en: enCategoryGroups[g.id]?.description ?? null,
    description_de: deCategoryGroups[g.id]?.description ?? null,
    sort_order: idx,
  }));
}

/** 16b. landing_group_categories */
function buildLandingGroupCategories() {
  const rows = [];

  for (const group of landingCategoryGroups) {
    for (let i = 0; i < group.categories.length; i++) {
      rows.push({
        group_source_id: group.id,
        category_id: group.categories[i],
        sort_order: i,
      });
    }
  }

  return rows;
}

// =====================================================================
//  MAIN
// =====================================================================

function main() {
  console.log('Exporting catalog data to JSON...');
  console.log(`  Alternatives: ${alternatives.length}`);
  console.log(`  Categories: ${categories.length}`);
  console.log(`  US vendor records: ${US_VENDOR_RECORDS.length}`);

  // Read and parse denied alternatives
  const deniedMdPath = path.join(repoRoot, 'DENIED_ALTERNATIVES.md');
  const deniedMdContent = fs.readFileSync(deniedMdPath, 'utf-8');
  const deniedEntries = parseDeniedAlternatives(deniedMdContent);
  console.log(`  Denied decisions: ${deniedEntries.length}`);

  // Build all 20 tables
  const countriesRows = buildCountries(alternatives);
  const categoriesRows = buildCategories();
  const tagsRows = buildTags(alternatives);
  const catalogEntriesRows = buildCatalogEntries(alternatives, US_VENDOR_RECORDS, deniedEntries);
  const entryCategoriesRows = buildEntryCategories(alternatives);
  const entryTagsRows = buildEntryTags(alternatives);
  const usVendorsRows = buildUsVendors(US_VENDOR_RECORDS);
  const usVendorAliasesRows = buildUsVendorAliases(US_VENDOR_RECORDS);
  const usVendorProfilesRows = buildUsVendorProfiles(US_VENDOR_TRUST_PROFILES);
  const usVendorProfileReservationsRows = buildUsVendorProfileReservations(US_VENDOR_TRUST_PROFILES);
  const categoryUsVendorsRows = buildCategoryUsVendors();
  const entryReplacementsRows = buildEntryReplacements(alternatives);
  const reservationsRows = buildReservations(alternatives);
  const positiveSignalsRows = buildPositiveSignals(alternatives);
  const scoringMetadataRows = buildScoringMetadata();
  const trustScoresRows = buildTrustScores(alternatives);
  const deniedDecisionsRows = buildDeniedDecisions(deniedEntries);
  const furtherReadingRows = buildFurtherReadingResources();
  const landingGroupsRows = buildLandingCategoryGroups();
  const landingGroupCategoriesRows = buildLandingGroupCategories();

  // Log counts
  console.log(`  Countries: ${countriesRows.length}`);
  console.log(`  Tags: ${tagsRows.length}`);
  console.log(`  Catalog entries: ${catalogEntriesRows.length}`);
  console.log(`  Entry categories: ${entryCategoriesRows.length}`);
  console.log(`  Entry tags: ${entryTagsRows.length}`);
  console.log(`  US vendors: ${usVendorsRows.length}`);
  console.log(`  US vendor aliases: ${usVendorAliasesRows.length}`);
  console.log(`  US vendor profiles: ${usVendorProfilesRows.length}`);
  console.log(`  US vendor profile reservations: ${usVendorProfileReservationsRows.length}`);
  console.log(`  Category US vendors: ${categoryUsVendorsRows.length}`);
  console.log(`  Entry replacements: ${entryReplacementsRows.length}`);
  console.log(`  Reservations: ${reservationsRows.length}`);
  console.log(`  Positive signals: ${positiveSignalsRows.length}`);
  console.log(`  Scoring metadata: ${scoringMetadataRows.length}`);
  console.log(`  Trust scores: ${trustScoresRows.length}`);
  console.log(`  Denied decisions: ${deniedDecisionsRows.length}`);
  console.log(`  Further reading: ${furtherReadingRows.length}`);
  console.log(`  Landing groups: ${landingGroupsRows.length}`);
  console.log(`  Landing group categories: ${landingGroupCategoriesRows.length}`);

  // Assemble the catalog JSON with all 20 top-level keys
  const catalog = {
    exported_at: new Date().toISOString(),
    countries: countriesRows,
    categories: categoriesRows,
    tags: tagsRows,
    catalog_entries: catalogEntriesRows,
    entry_categories: entryCategoriesRows,
    entry_tags: entryTagsRows,
    us_vendors: usVendorsRows,
    us_vendor_aliases: usVendorAliasesRows,
    us_vendor_profiles: usVendorProfilesRows,
    us_vendor_profile_reservations: usVendorProfileReservationsRows,
    category_us_vendors: categoryUsVendorsRows,
    entry_replacements: entryReplacementsRows,
    reservations: reservationsRows,
    positive_signals: positiveSignalsRows,
    scoring_metadata: scoringMetadataRows,
    trust_scores: trustScoresRows,
    denied_decisions: deniedDecisionsRows,
    further_reading_resources: furtherReadingRows,
    landing_category_groups: landingGroupsRows,
    landing_group_categories: landingGroupCategoriesRows,
  };

  // Ensure output directory exists
  const outDir = path.join(repoRoot, 'tmp/export');
  fs.mkdirSync(outDir, { recursive: true });

  // Write the JSON file
  const outPath = path.join(outDir, 'catalog.json');
  fs.writeFileSync(outPath, JSON.stringify(catalog, null, 2), 'utf-8');

  const sizeKB = (fs.statSync(outPath).size / 1024).toFixed(1);
  console.log(`\nWrote ${outPath} (${sizeKB} KB)`);

  // Verify all 20 data keys are present and non-empty
  const dataKeys = [
    'countries', 'categories', 'tags', 'catalog_entries',
    'entry_categories', 'entry_tags', 'us_vendors', 'us_vendor_aliases',
    'us_vendor_profiles', 'us_vendor_profile_reservations',
    'category_us_vendors', 'entry_replacements', 'reservations',
    'positive_signals', 'scoring_metadata', 'trust_scores',
    'denied_decisions', 'further_reading_resources',
    'landing_category_groups', 'landing_group_categories',
  ];

  let allGood = true;
  for (const key of dataKeys) {
    const arr = catalog[key];
    if (!Array.isArray(arr) || arr.length === 0) {
      console.error(`ERROR: "${key}" is missing or empty!`);
      allGood = false;
    }
  }

  if (allGood) {
    console.log('\nAll 20 data keys present and non-empty.');
  } else {
    console.error('\nSome data keys are missing or empty — check above.');
    process.exit(1);
  }
}

main();
