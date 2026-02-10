#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const researchPath = path.join(repoRoot, 'data/research/master-research.md');
const outPath = path.join(repoRoot, 'src/data/researchAlternatives.ts');

const sectionToCategory = {
  'Cloud Storage': 'cloud-storage',
  'Email': 'email',
  'Social Media — Fediverse Only': 'social-media',
  'Video Hosting': 'video-hosting',
  'Messaging': 'messaging',
  'Office Suite': 'office-suite',
  'Browser': 'browser',
  'Maps & Navigation': 'maps',
  'VPN': 'vpn',
  'Password Manager': 'password-manager',
  'Analytics': 'analytics',
  'Project Management': 'project-management',
  'AI & Machine Learning': 'ai-ml',
  'Cloud & Hosting': 'hosting',
  'Payments': 'payments',
  'E-Commerce': 'ecommerce',
};

function normalizeName(value) {
  return value
    .toLowerCase()
    .replace(/\*+/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const nameToIdOverrides = new Map([
  ['infomaniak kdrive', 'kdrive'],
  ['pirsch analytics', 'pirsch'],
  ['plausible analytics', 'plausible'],
]);

function parseOpenSourceLevel(raw) {
  const low = raw.toLowerCase();
  if (low.startsWith('partial')) return 'partial';
  if (low.startsWith('yes')) {
    if (low.includes('community license')) return 'partial';
    return 'full';
  }
  return 'none';
}

function parsePricing(raw) {
  const low = raw.toLowerCase();
  if (low.startsWith('freemium')) return 'freemium';
  if (low.startsWith('free')) return 'free';
  return 'paid';
}

function parseCountryCode(countryRaw) {
  const match = countryRaw.match(/^([A-Z]{2,3})\b/);
  if (!match) return 'eu';
  return match[1].slice(0, 2).toLowerCase();
}

function parseHeadquartersCity(countryRaw) {
  const insideParens = countryRaw.match(/\(([^)]+)\)/)?.[1];
  if (!insideParens) return undefined;
  return insideParens
    .replace(/\s*[—-].*$/u, '')
    .replace(/\s*\/.*$/u, '')
    .trim() || undefined;
}

function parseLicense(openSourceRaw) {
  return openSourceRaw.match(/\(([^)]+)\)/)?.[1]?.trim();
}

const keywordToTag = [
  ['privacy', 'privacy'],
  ['gdpr', 'gdpr'],
  ['encrypted', 'encryption'],
  ['encryption', 'encryption'],
  ['zero-knowledge', 'zero-knowledge'],
  ['zero access', 'zero-knowledge'],
  ['self-hosted', 'self-hosted'],
  ['self host', 'self-hosted'],
  ['federated', 'federated'],
  ['open-source', 'open-source'],
  ['open source', 'open-source'],
  ['machine learning', 'ai'],
  ['artificial intelligence', 'ai'],
  ['analytics', 'analytics'],
  ['vpn', 'vpn'],
  ['password', 'password-manager'],
  ['cloud', 'cloud'],
  ['email', 'email'],
  ['browser', 'browser'],
  ['maps', 'maps'],
  ['hosting', 'hosting'],
  ['payments', 'payments'],
  ['e-commerce', 'ecommerce'],
  ['ecommerce', 'ecommerce'],
  ['office', 'office-suite'],
  ['project', 'project-management'],
];

function generateTags(entry) {
  const tags = new Set();
  tags.add(entry.category);
  tags.add(entry.pricing);

  if (entry.openSourceLevel !== 'none') {
    tags.add('open-source');
  }

  const haystack = `${entry.description} ${entry.name}`.toLowerCase();
  for (const [needle, tag] of keywordToTag) {
    if (haystack.includes(needle)) {
      tags.add(tag);
    }
  }

  for (const replace of entry.replacesUS.slice(0, 2)) {
    const normalized = replace.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (normalized) tags.add(normalized);
  }

  return Array.from(tags).slice(0, 8);
}

function slugifyName(name) {
  return name
    .toLowerCase()
    .replace(/\*+/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function parseResearchEntries(markdown) {
  const lines = markdown.split(/\r?\n/);
  const entries = [];
  let currentSection = '';

  for (let i = 0; i < lines.length; i += 1) {
    const sectionMatch = lines[i].match(/^##\s+(.+?)\s*\(\d+\)\s*$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      continue;
    }

    const entryHeading = lines[i].match(/^###\s+\d+\.\s+(.+)$/);
    if (!entryHeading) continue;

    const rawName = entryHeading[1].trim();
    const cleanName = rawName
      .replace(/\s*\*\(.*?\)\*\s*$/u, '')
      .replace(/\*+/g, '')
      .trim();

    const id =
      nameToIdOverrides.get(normalizeName(rawName)) ??
      nameToIdOverrides.get(normalizeName(cleanName)) ??
      slugifyName(cleanName);

    const entry = {
      id,
      name: cleanName,
      category: sectionToCategory[currentSection] ?? 'other',
      country: 'eu',
      replacesUS: [],
      pricing: 'paid',
      website: '',
      description: '',
      localizedDescriptions: {},
      isOpenSource: false,
      openSourceLevel: 'none',
      tags: [],
      foundedYear: undefined,
      headquartersCity: undefined,
      githubUrl: undefined,
      license: undefined,
    };

    let countryRaw = '';
    let openSourceRaw = 'No';

    let j = i + 1;
    while (j < lines.length && !/^###\s+\d+\./.test(lines[j]) && !/^##\s+/.test(lines[j])) {
      const line = lines[j];

      if (line.startsWith('- **Country:**')) {
        const match = line.match(/- \*\*Country:\*\*\s*([^|]+)\|\s*\*\*Founded:\*\*\s*([^|]+)\|\s*\*\*Open Source:\*\*\s*(.+)$/);
        if (match) {
          countryRaw = match[1].trim();
          entry.country = parseCountryCode(countryRaw);

          const foundedMatch = match[2].match(/\d{4}/);
          if (foundedMatch) {
            entry.foundedYear = Number(foundedMatch[0]);
          }

          openSourceRaw = match[3].trim();
          entry.openSourceLevel = parseOpenSourceLevel(openSourceRaw);
          entry.isOpenSource = entry.openSourceLevel !== 'none';
          entry.license = parseLicense(openSourceRaw);
          entry.headquartersCity = parseHeadquartersCity(countryRaw);
        }
      }

      if (line.startsWith('- **Pricing:**')) {
        const match = line.match(/- \*\*Pricing:\*\*\s*([^|]+)\|\s*\*\*Replaces:\*\*\s*(.+)$/);
        if (match) {
          entry.pricing = parsePricing(match[1].trim());
          entry.replacesUS = match[2]
            .split(',')
            .map((part) => part.trim())
            .filter(Boolean);
        }
      }

      if (line.startsWith('- **Website:**')) {
        const match = line.match(/- \*\*Website:\*\*\s*([^|\s]+)(?:\s*\|\s*\*\*GitHub:\*\*\s*(\S+))?/);
        if (match) {
          entry.website = match[1].trim();
          if (match[2]) {
            entry.githubUrl = match[2].trim();
          }
        }
      }

      if (line.startsWith('- **EN:**')) {
        entry.description = line.replace('- **EN:**', '').trim();
      }

      if (line.startsWith('- **DE:**')) {
        entry.localizedDescriptions.de = line.replace('- **DE:**', '').trim();
      }

      j += 1;
    }

    entry.tags = generateTags(entry);
    entries.push(entry);
  }

  return entries;
}

function sortObjectKeysStable(entries) {
  return [...entries].sort((a, b) => a.name.localeCompare(b.name));
}

function emitTypeScript(entries) {
  const header = `import type { Alternative } from '../types';\n\n` +
    `// Generated from data/research/master-research.md\n` +
    `// via scripts/generate-research-catalog.mjs\n` +
    `// Last generated: ${new Date().toISOString()}\n\n`;

  const body = `export const researchAlternatives: Alternative[] = ${JSON.stringify(entries, null, 2)};\n`;

  return header + body;
}

const researchMarkdown = fs.readFileSync(researchPath, 'utf8');
const entries = parseResearchEntries(researchMarkdown);

if (entries.length !== 61) {
  throw new Error(`Expected 61 research entries, got ${entries.length}`);
}

const output = emitTypeScript(sortObjectKeysStable(entries));
fs.writeFileSync(outPath, output, 'utf8');
console.log(`Wrote ${entries.length} entries to ${path.relative(repoRoot, outPath)}`);
