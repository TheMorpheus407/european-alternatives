#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const logosDir = path.join(repoRoot, 'public', 'logos');
const researchPath = path.join(repoRoot, 'src', 'data', 'researchAlternatives.ts');
const manualPath = path.join(repoRoot, 'src', 'data', 'manualAlternatives.ts');

const USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

function decodeHtmlEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function parseResearchAlternatives() {
  const source = fs.readFileSync(researchPath, 'utf8');
  const assignIndex = source.indexOf('=');
  const start = source.indexOf('[', assignIndex);
  const end = source.lastIndexOf('];');
  if (start === -1 || end === -1) throw new Error('Cannot parse research alternatives.');
  const json = source.slice(start, end + 1);
  return JSON.parse(json);
}

function parseManualAlternatives() {
  const source = fs.readFileSync(manualPath, 'utf8');
  const regex = /\{\s*id:\s*'([^']+)',[\s\S]*?name:\s*'([^']+)',[\s\S]*?website:\s*'([^']+)'/g;
  const results = [];
  for (const match of source.matchAll(regex)) {
    results.push({
      id: match[1],
      name: match[2],
      website: match[3],
    });
  }
  return results;
}

function uniq(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/\*+/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function domainToCandidates(website) {
  try {
    const host = new URL(website).hostname.replace(/^www\./, '').toLowerCase();
    const firstLabel = host.split('.')[0] ?? '';
    return uniq([
      host,
      host.replace(/\./g, ''),
      host.replace(/\./g, 'dot'),
      firstLabel,
      firstLabel.replace(/-/g, ''),
    ]);
  } catch {
    return [];
  }
}

function buildSlugCandidates(entry) {
  const id = entry.id;
  const name = entry.name;
  const lowerName = name.toLowerCase();
  const nameSlug = slugify(name);

  const manual = {
    'mailbox-org': ['mailboxdotorg', 'mailboxorg', 'mailbox'],
    'kdrive': ['kdrive', 'infomaniak', 'infomaniakkdrive'],
    'mullvad-vpn': ['mullvad', 'mullvadvpn'],
    'proton-pass': ['protonpass', 'proton'],
    'black-forest-labs': ['blackforestlabs', 'flux', 'fluxai'],
    'hugging-face': ['huggingface'],
    'magic-earth': ['magicearth'],
    'stability-ai': ['stabilityai', 'stablediffusion'],
    'collabora-online': ['collaboraonline', 'collabora'],
    'ovhcloud': ['ovh', 'ovhcloud'],
    'nextcloud': ['nextcloud'],
    'threema': ['threema'],
    'osmand': ['osmand'],
    'organic-maps': ['organicmaps'],
    'proton-drive': ['protondrive'],
    'proton-mail': ['protonmail'],
    'simple-analytics': ['simpleanalytics'],
    'openproject': ['openproject'],
  };

  const fromDomain = domainToCandidates(entry.website);

  return uniq([
    ...(manual[id] ?? []),
    id,
    id.replace(/-/g, ''),
    id.replace(/-/g, 'dot'),
    nameSlug,
    nameSlug.replace(/-/g, ''),
    ...lowerName.split(/[^a-z0-9]+/g),
    ...fromDomain,
  ]).filter((slug) => slug.length >= 2);
}

function buildStaticCandidates(entry) {
  const slugs = buildSlugCandidates(entry);
  const direct = {
    ivpn: ['https://www.ivpn.net/v2/assets/img/ivpn-logo.svg'],
    pcloud: ['https://pcdn-www.pcloud.com/Zon/images/logo/pcloud.svg'],
  };
  const urls = [];

  for (const url of direct[entry.id] ?? []) {
    urls.push(url);
  }

  for (const slug of slugs) {
    urls.push(`https://cdn.simpleicons.org/${slug}`);
    urls.push(`https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/svg/${slug}.svg`);
    urls.push(`https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg/${slug}.svg`);
  }

  return uniq(urls);
}

async function fetchText(url) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: {
      'user-agent': USER_AGENT,
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/svg+xml,*/*;q=0.8',
    },
  });

  if (!response.ok) return null;

  const text = await response.text();
  return {
    url: response.url,
    text,
    contentType: response.headers.get('content-type') ?? '',
  };
}

function isSvgText(text) {
  if (!text || text.length < 40) return false;
  const lower = text.trim().toLowerCase();
  if (lower.startsWith('<!doctype html') || lower.startsWith('<html')) return false;
  return lower.includes('<svg');
}

function scoreSvgCandidate(url, entry, domainRoot) {
  const lower = url.toLowerCase();
  let score = 0;

  if (lower.includes('logo')) score += 50;
  if (lower.includes('wordmark')) score += 30;
  if (lower.includes('brand')) score += 20;
  if (lower.includes('icon')) score += 8;
  if (lower.includes('favicon')) score -= 12;
  if (lower.includes('sprite')) score -= 40;
  if (lower.includes('social')) score -= 20;

  const idNoDash = entry.id.replace(/-/g, '');
  if (lower.includes(entry.id)) score += 35;
  if (idNoDash && lower.includes(idNoDash)) score += 25;

  const nameTokens = entry.name.toLowerCase().split(/[^a-z0-9]+/g).filter(Boolean);
  for (const token of nameTokens) {
    if (token.length >= 4 && lower.includes(token)) score += 12;
  }

  if (domainRoot && lower.includes(domainRoot)) score += 15;

  return score;
}

function absoluteSvgUrlsFromHtml(htmlText, baseUrl) {
  const refs = [];
  const attrPattern = /(?:src|href|content)=["']([^"']+\.svg(?:\?[^"']*)?)["']/gi;
  const cssPattern = /url\(([^)]+\.svg[^)]*)\)/gi;

  let match;
  while ((match = attrPattern.exec(htmlText))) {
    refs.push(decodeHtmlEntities(match[1].trim()));
  }

  while ((match = cssPattern.exec(htmlText))) {
    refs.push(decodeHtmlEntities(match[1].replace(/["']/g, '').trim()));
  }

  return uniq(
    refs
      .map((ref) => {
        try {
          return new URL(ref, baseUrl).toString();
        } catch {
          return null;
        }
      })
      .filter((value) => value && value.startsWith('http')),
  );
}

function inlineSvgFromHtml(htmlText, entry) {
  const pattern = /<svg[\s\S]*?<\/svg>/gi;
  const chunks = [];
  let match;
  while ((match = pattern.exec(htmlText))) {
    const svg = match[0];
    const lower = svg.toLowerCase();
    let score = 0;

    if (lower.includes('logo')) score += 30;
    if (lower.includes(entry.id)) score += 30;

    const nameTokens = entry.name.toLowerCase().split(/[^a-z0-9]+/g).filter(Boolean);
    for (const token of nameTokens) {
      if (token.length >= 4 && lower.includes(token)) score += 10;
    }

    if (svg.length > 500) score += 5;
    chunks.push({ score, svg });
  }

  chunks.sort((a, b) => b.score - a.score);
  return chunks[0]?.svg ?? null;
}

async function fetchBestLogoForEntry(entry) {
  const staticCandidates = buildStaticCandidates(entry);

  for (const url of staticCandidates) {
    try {
      const result = await fetchText(url);
      if (!result) continue;
      if (isSvgText(result.text)) return { svg: result.text, source: url };
    } catch {
      // Continue to next candidate
    }
  }

  const domainRoot = (() => {
    try {
      return new URL(entry.website).hostname.replace(/^www\./, '').split('.')[0]?.toLowerCase() ?? '';
    } catch {
      return '';
    }
  })();

  try {
    const website = await fetchText(entry.website);
    if (website && website.text) {
      const extracted = absoluteSvgUrlsFromHtml(website.text, website.url);
      const ranked = extracted
        .map((url) => ({ url, score: scoreSvgCandidate(url, entry, domainRoot) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 24);

      for (const candidate of ranked) {
        try {
          const result = await fetchText(candidate.url);
          if (!result) continue;
          if (isSvgText(result.text)) return { svg: result.text, source: candidate.url };
        } catch {
          // continue
        }
      }

      const inline = inlineSvgFromHtml(website.text, entry);
      if (inline && isSvgText(inline)) {
        return { svg: inline, source: `${website.url}#inline-svg` };
      }
    }
  } catch {
    // fall through
  }

  return null;
}

function makePlaceholder(entry) {
  const letter = entry.name.trim().charAt(0).toUpperCase() || '?';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="${entry.name} logo placeholder">\n` +
    `  <rect width="200" height="200" rx="28" fill="#1a1a1f"/>\n` +
    `  <circle cx="100" cy="100" r="78" fill="#2a2a32"/>\n` +
    `  <text x="100" y="122" text-anchor="middle" font-family="Arial, sans-serif" font-size="88" font-weight="700" fill="#f0f2f5">${letter}</text>\n` +
    `</svg>\n`;
}

async function main() {
  if (!fs.existsSync(logosDir)) fs.mkdirSync(logosDir, { recursive: true });

  const research = parseResearchAlternatives();
  const manual = parseManualAlternatives();
  const allEntries = [...research, ...manual]
    .reduce((map, entry) => map.set(entry.id, entry), new Map())
    .values();

  const entries = Array.from(allEntries);
  const missing = entries.filter((entry) => !fs.existsSync(path.join(logosDir, `${entry.id}.svg`)));

  console.log(`Total entries: ${entries.length}`);
  console.log(`Missing logos before: ${missing.length}`);

  const unresolved = [];

  for (const entry of missing) {
    const targetFile = path.join(logosDir, `${entry.id}.svg`);
    process.stdout.write(`- ${entry.id}: `);

    const result = await fetchBestLogoForEntry(entry);
    if (result) {
      fs.writeFileSync(targetFile, result.svg.trim() + '\n', 'utf8');
      console.log(`fetched (${result.source})`);
    } else {
      fs.writeFileSync(targetFile, makePlaceholder(entry), 'utf8');
      unresolved.push(entry.id);
      console.log('placeholder');
    }
  }

  const stillMissing = entries.filter((entry) => !fs.existsSync(path.join(logosDir, `${entry.id}.svg`)));

  console.log(`Missing logos after: ${stillMissing.length}`);
  if (unresolved.length > 0) {
    console.log('Used placeholders for:');
    for (const id of unresolved) console.log(`  - ${id}`);
  }
}

await main();
