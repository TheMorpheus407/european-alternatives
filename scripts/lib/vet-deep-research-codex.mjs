import { basename } from "node:path";

const HOST_PATTERN = /https?:\/\/([^\s/"'<>)\]]+)/gi;
const BODY_SCAN_LINE_LIMIT = 50;

export function slugFromFilename(filename) {
  if (typeof filename !== "string") {
    return "";
  }

  let base = basename(filename);

  if (base.toLowerCase().endsWith(".md")) {
    base = base.slice(0, -3);
  }

  return slugify(base);
}

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9.\-]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function extractFrontmatter(content) {
  if (typeof content !== "string") {
    return null;
  }

  if (!content.startsWith("---")) {
    return null;
  }

  const newlineAfterOpen = content.indexOf("\n");

  if (newlineAfterOpen === -1) {
    return null;
  }

  const firstLine = content.slice(0, newlineAfterOpen).trim();

  if (firstLine !== "---") {
    return null;
  }

  const rest = content.slice(newlineAfterOpen + 1);
  const closeIndex = rest.indexOf("\n---");

  if (closeIndex === -1) {
    return null;
  }

  const block = rest.slice(0, closeIndex);
  const result = {};

  for (const rawLine of block.split("\n")) {
    const line = rawLine.trim();

    if (line === "" || line.startsWith("#")) {
      continue;
    }

    const colonIndex = line.indexOf(":");

    if (colonIndex === -1) {
      continue;
    }

    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key !== "") {
      result[key] = value;
    }
  }

  return result;
}

function normalizeHost(url) {
  if (typeof url !== "string" || url === "") {
    return null;
  }

  let host = url.trim();

  host = host.replace(/[)>\].,;:!?'"]+$/g, "");
  host = host.replace(/^[(<\[]+/g, "");

  if (host.startsWith("http://") || host.startsWith("https://")) {
    host = host.replace(/^https?:\/\//i, "");
  }

  host = host.split("/")[0];
  host = host.split("?")[0];
  host = host.split("#")[0];
  host = host.toLowerCase();

  if (host.startsWith("www.")) {
    host = host.slice(4);
  }

  return host === "" ? null : host;
}

function hostsMatch(a, b) {
  if (a === b) {
    return true;
  }

  return a.endsWith(`.${b}`) || b.endsWith(`.${a}`);
}

function collectHostsFromBody(content) {
  if (typeof content !== "string" || content === "") {
    return [];
  }

  const lines = content.split("\n").slice(0, BODY_SCAN_LINE_LIMIT);
  const head = lines.join("\n");
  const seen = new Set();
  const hosts = [];

  let match;
  HOST_PATTERN.lastIndex = 0;

  while ((match = HOST_PATTERN.exec(head)) !== null) {
    const host = normalizeHost(match[1]);

    if (host !== null && !seen.has(host)) {
      seen.add(host);
      hosts.push(host);
    }
  }

  return hosts;
}

function buildIndexes(snapshotEntries) {
  const bySlug = new Map();
  const byHost = new Map();

  if (!Array.isArray(snapshotEntries)) {
    return { bySlug, byHost };
  }

  for (const entry of snapshotEntries) {
    if (entry === null || typeof entry !== "object") {
      continue;
    }

    if (typeof entry.slug !== "string" || entry.slug === "") {
      continue;
    }

    bySlug.set(entry.slug, entry);

    if (typeof entry.website === "string" && entry.website !== "") {
      const host = normalizeHost(entry.website);

      if (host !== null && !byHost.has(host)) {
        byHost.set(host, entry);
      }
    }
  }

  return { bySlug, byHost };
}

function entryToResult(entry, documentPath, matchedVia) {
  const result = {
    documentPath,
    entrySlug: entry.slug,
    entryName: typeof entry.name === "string" ? entry.name : entry.slug,
    matchedVia: [...matchedVia],
  };

  if (typeof entry.id === "number") {
    result.entryId = entry.id;
  }

  return result;
}

export function matchDocument({
  documentPath,
  content,
  forcedEntrySlug = null,
  snapshotEntries,
}) {
  const { bySlug, byHost } = buildIndexes(snapshotEntries);

  if (
    typeof forcedEntrySlug === "string" &&
    forcedEntrySlug.trim() !== ""
  ) {
    const slug = forcedEntrySlug.trim();
    const entry = bySlug.get(slug);

    if (entry === undefined) {
      return {
        documentPath,
        reason: "no_match",
      };
    }

    return entryToResult(entry, documentPath, ["forced"]);
  }

  const frontmatter = extractFrontmatter(content);
  const filenameSlug = slugFromFilename(documentPath);

  let primarySlug = null;
  let primarySource = null;

  if (
    frontmatter !== null &&
    typeof frontmatter.entry_slug === "string" &&
    frontmatter.entry_slug.trim() !== ""
  ) {
    primarySlug = frontmatter.entry_slug.trim();
    primarySource = "frontmatter";
    const entry = bySlug.get(primarySlug);

    if (entry === undefined) {
      return {
        documentPath,
        reason: "no_match",
      };
    }

    return entryToResult(entry, documentPath, [primarySource]);
  } else if (filenameSlug !== "") {
    primarySlug = filenameSlug;
    primarySource = "filename";
  }

  const candidates = [];
  const candidateSources = new Map();

  if (primarySlug !== null && bySlug.has(primarySlug)) {
    candidates.push(primarySlug);
    candidateSources.set(primarySlug, [primarySource]);
  }

  const hosts = collectHostsFromBody(content);

  for (const host of hosts) {
    const entry = byHost.get(host);

    if (entry === undefined) {
      continue;
    }

    if (candidateSources.has(entry.slug)) {
      const sources = candidateSources.get(entry.slug);

      if (!sources.includes("website")) {
        sources.push("website");
      }
      continue;
    }

    candidates.push(entry.slug);
    candidateSources.set(entry.slug, ["website"]);
  }

  if (candidates.length === 0) {
    return {
      documentPath,
      reason: "no_match",
    };
  }

  if (candidates.length > 1) {
    return {
      documentPath,
      reason: "ambiguous_match",
      candidates,
    };
  }

  const winningSlug = candidates[0];
  const entry = bySlug.get(winningSlug);
  const sources = candidateSources.get(winningSlug) ?? [];

  // Domain-corroboration guard: a slug-only match (e.g. by filename) can
  // pair a document to an unrelated catalog entry that merely shares the
  // same name on a different domain (the "graphite.com" doc vs the
  // "graphite.art" entry). When the match was not already corroborated by a
  // body URL, require that the entry's website host appears among the hosts
  // extracted from the document body. Only enforce this when the comparison
  // is actually possible: the entry has a parseable host AND the document
  // yielded at least one host. Otherwise fall back to the existing match.
  if (!sources.includes("website")) {
    const entryHost = normalizeHost(entry.website);

    if (
      entryHost !== null &&
      hosts.length > 0 &&
      !hosts.some((host) => hostsMatch(entryHost, host))
    ) {
      return {
        documentPath,
        reason: "website_mismatch",
        rejectedSlug: entry.slug,
        rejectedWebsite: entry.website,
        documentHosts: hosts,
      };
    }
  }

  return entryToResult(entry, documentPath, sources);
}
