import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

const projectDir = resolve(".");
const libModuleUrl = new URL(
  "../scripts/lib/vet-deep-research-codex.mjs",
  import.meta.url,
);
const runnerPath = resolve("scripts/vet-deep-research-codex-run.mjs");
const shellScriptPath = resolve("scripts/vet-deep-research-codex.sh");

type ActiveEntry = {
  id?: number;
  slug: string;
  name: string;
  website?: string | null;
};

type Snapshot = {
  entries: ActiveEntry[];
};

type MatchResult = {
  documentPath: string;
  entrySlug?: string;
  entryName?: string;
  matchedVia?: string[];
  reason?: string;
  candidates?: string[];
  rejectedSlug?: string;
  rejectedWebsite?: string;
  documentHosts?: string[];
};

type LibModule = {
  slugFromFilename: (filename: string) => string;
  extractFrontmatter: (content: string) => { entry_slug?: string } | null;
  matchDocument: (input: {
    documentPath: string;
    content: string;
    forcedEntrySlug?: string | null;
    snapshotEntries: ActiveEntry[];
  }) => MatchResult;
};

const baselineSnapshot: Snapshot = {
  entries: [
    {
      id: 1,
      slug: "proton-mail",
      name: "Proton Mail",
      website: "https://proton.me",
    },
    {
      id: 2,
      slug: "nextcloud",
      name: "Nextcloud",
      website: "https://nextcloud.com",
    },
    {
      id: 3,
      slug: "tutanota",
      name: "Tuta",
      website: "https://tuta.com",
    },
    {
      id: 4,
      slug: "mastodon",
      name: "Mastodon",
      website: "https://joinmastodon.org",
    },
  ],
};

function makeProjectTempDir(prefix: string): string {
  const tempRoot = resolve("tmp");
  mkdirSync(tempRoot, { recursive: true });

  return mkdtempSync(join(tempRoot, prefix));
}

function writeDoc(dir: string, filename: string, content: string): string {
  const docPath = join(dir, filename);
  writeFileSync(docPath, content, "utf8");
  return docPath;
}

function writeSnapshot(dir: string, snapshot: Snapshot): string {
  const snapshotPath = join(dir, "snapshot.json");
  writeFileSync(snapshotPath, JSON.stringify(snapshot), "utf8");
  return snapshotPath;
}

function runRunner(args: string[]) {
  return spawnSync(process.execPath, [runnerPath, ...args], {
    cwd: projectDir,
    encoding: "utf8",
  });
}

function parseJsonObject(stdout: string): Record<string, unknown> {
  return JSON.parse(stdout) as Record<string, unknown>;
}

async function loadLibModule(): Promise<LibModule> {
  return (await import(libModuleUrl.href)) as LibModule;
}

describe("vet-deep-research-codex slugFromFilename", () => {
  it("strips the .md extension and lowercases the basename", async () => {
    const { slugFromFilename } = await loadLibModule();

    expect(slugFromFilename("Proton-Mail.md")).toBe("proton-mail");
    expect(slugFromFilename("Nextcloud.md")).toBe("nextcloud");
  });

  it("normalises whitespace and underscores into hyphens", async () => {
    const { slugFromFilename } = await loadLibModule();

    expect(slugFromFilename("Proton Mail.md")).toBe("proton-mail");
    expect(slugFromFilename("some_tool.md")).toBe("some-tool");
  });

  it("strips an absolute or relative directory prefix before slugifying", async () => {
    const { slugFromFilename } = await loadLibModule();

    expect(slugFromFilename("/abs/path/Proton Mail.md")).toBe("proton-mail");
    expect(slugFromFilename("tmp/deep/nextcloud.md")).toBe("nextcloud");
  });
});

describe("vet-deep-research-codex extractFrontmatter", () => {
  it("returns the parsed entry_slug from a YAML front-matter block", async () => {
    const { extractFrontmatter } = await loadLibModule();

    const result = extractFrontmatter(
      "---\nentry_slug: nextcloud\n---\n\n# body\n",
    );

    expect(result).not.toBeNull();
    expect(result?.entry_slug).toBe("nextcloud");
  });

  it("returns null when the document has no front-matter block", async () => {
    const { extractFrontmatter } = await loadLibModule();

    expect(extractFrontmatter("# Just a heading\nNo front-matter here.")).toBeNull();
  });

  it("strips surrounding single or double quotes from front-matter values", async () => {
    const { extractFrontmatter } = await loadLibModule();

    const doubleQuoted = extractFrontmatter(
      '---\nentry_slug: "nextcloud"\n---\n# body\n',
    );
    const singleQuoted = extractFrontmatter(
      "---\nentry_slug: 'proton-mail'\n---\n# body\n",
    );

    expect(doubleQuoted?.entry_slug).toBe("nextcloud");
    expect(singleQuoted?.entry_slug).toBe("proton-mail");
  });
});

describe("vet-deep-research-codex matchDocument", () => {
  it("matches a document by filename slug against an active entry", async () => {
    const { matchDocument } = await loadLibModule();

    const result = matchDocument({
      documentPath: "tmp/deep/proton-mail.md",
      content: "# Proton Mail\nSome body.\n",
      snapshotEntries: baselineSnapshot.entries,
    });

    expect(result.entrySlug).toBe("proton-mail");
    expect(result.entryName).toBe("Proton Mail");
    expect(result.matchedVia).toContain("filename");
    expect(result.reason).toBeUndefined();
  });

  it("reports no_match when the filename slug is not in the active snapshot", async () => {
    const { matchDocument } = await loadLibModule();

    const result = matchDocument({
      documentPath: "tmp/deep/unknown-tool.md",
      content: "# Unknown\n",
      snapshotEntries: baselineSnapshot.entries,
    });

    expect(result.entrySlug).toBeUndefined();
    expect(result.reason).toBe("no_match");
  });

  it("uses front-matter entry_slug to override the filename-based slug", async () => {
    const { matchDocument } = await loadLibModule();

    const result = matchDocument({
      documentPath: "tmp/deep/whatever.md",
      content: "---\nentry_slug: nextcloud\n---\n# body\n",
      snapshotEntries: baselineSnapshot.entries,
    });

    expect(result.entrySlug).toBe("nextcloud");
  });

  it("flags ambiguous_match when filename and a body URL host point at different active entries", async () => {
    const { matchDocument } = await loadLibModule();

    const result = matchDocument({
      documentPath: "tmp/deep/proton-mail.md",
      content:
        "# Proton Mail\nSee also https://nextcloud.com for comparison.\n",
      snapshotEntries: baselineSnapshot.entries,
    });

    expect(result.entrySlug).toBeUndefined();
    expect(result.reason).toBe("ambiguous_match");
    expect(result.candidates).toEqual(
      expect.arrayContaining(["proton-mail", "nextcloud"]),
    );
  });

  it("forcedEntrySlug bypasses filename/front-matter and lands on that slug when active", async () => {
    const { matchDocument } = await loadLibModule();

    const result = matchDocument({
      documentPath: "tmp/deep/random-name.md",
      content: "# Anything\n",
      forcedEntrySlug: "tutanota",
      snapshotEntries: baselineSnapshot.entries,
    });

    expect(result.entrySlug).toBe("tutanota");
  });

  it("forcedEntrySlug fails closed when the slug is not in the active snapshot", async () => {
    const { matchDocument } = await loadLibModule();

    const result = matchDocument({
      documentPath: "tmp/deep/random-name.md",
      content: "# Anything\n",
      forcedEntrySlug: "no-such-slug",
      snapshotEntries: baselineSnapshot.entries,
    });

    expect(result.entrySlug).toBeUndefined();
    expect(result.reason).toBe("no_match");
  });

  it("labels matchedVia with 'forced' when forcedEntrySlug resolves to an active entry", async () => {
    const { matchDocument } = await loadLibModule();

    const result = matchDocument({
      documentPath: "tmp/deep/random-name.md",
      content: "# Anything mentioning https://nextcloud.com\n",
      forcedEntrySlug: "tutanota",
      snapshotEntries: baselineSnapshot.entries,
    });

    expect(result.entrySlug).toBe("tutanota");
    expect(result.matchedVia).toEqual(["forced"]);
  });

  it("labels matchedVia with 'frontmatter' when an entry_slug override lands on an active entry", async () => {
    const { matchDocument } = await loadLibModule();

    const result = matchDocument({
      documentPath: "tmp/deep/some-random-name.md",
      content: "---\nentry_slug: nextcloud\n---\n# body\n",
      snapshotEntries: baselineSnapshot.entries,
    });

    expect(result.entrySlug).toBe("nextcloud");
    expect(result.matchedVia).toEqual(["frontmatter"]);
  });

  it("treats front-matter entry_slug as authoritative even when body URLs cite other catalog hosts", async () => {
    const { matchDocument } = await loadLibModule();

    const result = matchDocument({
      documentPath: "tmp/deep/nextcloud.md",
      content:
        "---\nentry_slug: nextcloud\n---\n# body\nCitation: https://proton.me/blog/source\n",
      snapshotEntries: baselineSnapshot.entries,
    });

    expect(result.entrySlug).toBe("nextcloud");
    expect(result.reason).toBeUndefined();
    expect(result.matchedVia).toEqual(["frontmatter"]);
  });

  it("adds 'website' to matchedVia when a body URL corroborates the filename match", async () => {
    const { matchDocument } = await loadLibModule();

    const result = matchDocument({
      documentPath: "tmp/deep/proton-mail.md",
      content: "# Proton Mail\nOfficial site: https://proton.me/about\n",
      snapshotEntries: baselineSnapshot.entries,
    });

    expect(result.entrySlug).toBe("proton-mail");
    expect(result.reason).toBeUndefined();
    expect(result.matchedVia).toEqual(["filename", "website"]);
  });

  it("fails closed (no_match) when frontmatter entry_slug points at an unknown slug, with no fallback to filename", async () => {
    const { matchDocument } = await loadLibModule();

    const result = matchDocument({
      documentPath: "tmp/deep/proton-mail.md",
      content: "---\nentry_slug: not-in-snapshot\n---\n# body\n",
      snapshotEntries: baselineSnapshot.entries,
    });

    expect(result.entrySlug).toBeUndefined();
    expect(result.reason).toBe("no_match");
  });

  it("normalises 'www.' hosts when corroborating against the catalog snapshot", async () => {
    const { matchDocument } = await loadLibModule();

    const result = matchDocument({
      documentPath: "tmp/deep/proton-mail.md",
      content: "# Proton Mail\nOfficial: https://www.proton.me/login\n",
      snapshotEntries: baselineSnapshot.entries,
    });

    expect(result.entrySlug).toBe("proton-mail");
    expect(result.matchedVia).toEqual(["filename", "website"]);
  });

  it("rejects a slug-only match when the entry website host is absent from the document hosts (graphite.com vs graphite.art)", async () => {
    const { matchDocument } = await loadLibModule();

    const snapshotEntries: ActiveEntry[] = [
      {
        id: 9,
        slug: "graphite",
        name: "Graphite",
        website: "https://graphite.art/",
      },
    ];

    const result = matchDocument({
      documentPath: "tmp/deep/graphite.md",
      content:
        "# Graphite\nAI code review at https://graphite.com and https://graphite.dev/docs\n",
      snapshotEntries,
    });

    expect(result.entrySlug).toBeUndefined();
    expect(result.reason).toBe("website_mismatch");
    expect(result.rejectedSlug).toBe("graphite");
    expect(result.rejectedWebsite).toBe("https://graphite.art/");
    expect(result.documentHosts).toEqual(["graphite.com", "graphite.dev"]);
  });

  it("keeps a slug match when the entry website host appears in the document hosts", async () => {
    const { matchDocument } = await loadLibModule();

    const snapshotEntries: ActiveEntry[] = [
      {
        id: 9,
        slug: "graphite",
        name: "Graphite",
        website: "https://graphite.art/",
      },
    ];

    const result = matchDocument({
      documentPath: "tmp/deep/graphite.md",
      content:
        "# Graphite\nThe open-source editor lives at https://graphite.art/learn\n",
      snapshotEntries,
    });

    expect(result.entrySlug).toBe("graphite");
    expect(result.reason).toBeUndefined();
    expect(result.matchedVia).toEqual(["filename", "website"]);
  });

  it("accepts a slug match when the entry host is a parent of a document subdomain host", async () => {
    const { matchDocument } = await loadLibModule();

    const snapshotEntries: ActiveEntry[] = [
      {
        id: 9,
        slug: "graphite",
        name: "Graphite",
        website: "https://graphite.art/",
      },
    ];

    const result = matchDocument({
      documentPath: "tmp/deep/graphite.md",
      content: "# Graphite\nApp at https://app.graphite.art/dashboard\n",
      snapshotEntries,
    });

    expect(result.entrySlug).toBe("graphite");
    expect(result.reason).toBeUndefined();
  });

  it("falls back to the slug match when the document yields no hosts (comparison impossible)", async () => {
    const { matchDocument } = await loadLibModule();

    const snapshotEntries: ActiveEntry[] = [
      {
        id: 9,
        slug: "graphite",
        name: "Graphite",
        website: "https://graphite.art/",
      },
    ];

    const result = matchDocument({
      documentPath: "tmp/deep/graphite.md",
      content: "# Graphite\nA standalone vector editor with no links.\n",
      snapshotEntries,
    });

    expect(result.entrySlug).toBe("graphite");
    expect(result.reason).toBeUndefined();
    expect(result.matchedVia).toEqual(["filename"]);
  });

  it("falls back to the slug match when the entry has no parseable website (comparison impossible)", async () => {
    const { matchDocument } = await loadLibModule();

    const snapshotEntries: ActiveEntry[] = [
      {
        id: 9,
        slug: "graphite",
        name: "Graphite",
        website: null,
      },
    ];

    const result = matchDocument({
      documentPath: "tmp/deep/graphite.md",
      content:
        "# Graphite\nAI code review at https://graphite.com and https://graphite.dev/docs\n",
      snapshotEntries,
    });

    expect(result.entrySlug).toBe("graphite");
    expect(result.reason).toBeUndefined();
    expect(result.matchedVia).toEqual(["filename"]);
  });
});

describe("vet-deep-research-codex runner CLI", () => {
  it("--help prints usage and exits 0", () => {
    const result = runRunner(["--help"]);

    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/usage/i);
  });

  it("missing --input-dir exits with usage code 64", () => {
    const result = runRunner([]);

    expect(result.status).toBe(64);
    expect(result.stderr).not.toBe("");
  });

  it("rejects unknown options before doing any work", () => {
    const result = runRunner(["--no-such-flag"]);

    expect(result.status).toBe(64);
    expect(result.stderr).toMatch(/unknown/i);
  });

  it("--dry-run emits the JSON summary with matches and skipped entries", () => {
    const tempDir = makeProjectTempDir("vet-deep-research-codex-");

    try {
      const inputDir = join(tempDir, "docs");
      mkdirSync(inputDir);
      writeDoc(inputDir, "proton-mail.md", "# Proton Mail\nBody.\n");
      writeDoc(inputDir, "nextcloud.md", "# Nextcloud\nBody.\n");
      writeDoc(inputDir, "unknown-tool.md", "# Unknown\nBody.\n");
      const snapshotPath = writeSnapshot(tempDir, baselineSnapshot);

      const result = runRunner([
        "--input-dir",
        inputDir,
        "--catalog-snapshot-file",
        snapshotPath,
        "--dry-run",
      ]);

      expect(result.status).toBe(0);
      const parsed = parseJsonObject(result.stdout);

      expect(parsed.dryRun).toBe(true);
      expect(Array.isArray(parsed.matches)).toBe(true);
      expect(Array.isArray(parsed.skipped)).toBe(true);
      const summary = parsed.summary as Record<string, number>;
      expect(summary.discovered).toBe(3);
      expect(summary.matched).toBe(2);
      expect(summary.skipped).toBe(1);

      const matchedSlugs = (parsed.matches as MatchResult[]).map(
        (m) => m.entrySlug,
      );
      expect(matchedSlugs).toEqual(
        expect.arrayContaining(["proton-mail", "nextcloud"]),
      );
      const skippedReasons = (parsed.skipped as MatchResult[]).map(
        (s) => s.reason,
      );
      expect(skippedReasons).toContain("no_match");
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("ignores non-Markdown files and does not recurse into subdirectories by default", () => {
    const tempDir = makeProjectTempDir("vet-deep-research-codex-");

    try {
      const inputDir = join(tempDir, "docs");
      mkdirSync(inputDir);
      const nestedDir = join(inputDir, "nested");
      mkdirSync(nestedDir);
      writeDoc(inputDir, "proton-mail.md", "# Proton Mail\n");
      writeDoc(inputDir, "notes.txt", "should be ignored");
      writeDoc(inputDir, "README", "no extension");
      writeDoc(nestedDir, "nextcloud.md", "should not be recursed into");
      const snapshotPath = writeSnapshot(tempDir, baselineSnapshot);

      const result = runRunner([
        "--input-dir",
        inputDir,
        "--catalog-snapshot-file",
        snapshotPath,
        "--dry-run",
      ]);

      expect(result.status).toBe(0);
      const parsed = parseJsonObject(result.stdout);
      const summary = parsed.summary as Record<string, number>;
      expect(summary.discovered).toBe(1);
      const matchedSlugs = (parsed.matches as MatchResult[]).map(
        (m) => m.entrySlug,
      );
      expect(matchedSlugs).toEqual(["proton-mail"]);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("produces byte-identical stdout for the same input folder on repeat runs (deterministic ordering)", () => {
    const tempDir = makeProjectTempDir("vet-deep-research-codex-");

    try {
      const inputDir = join(tempDir, "docs");
      mkdirSync(inputDir);
      writeDoc(inputDir, "tutanota.md", "# Tuta\n");
      writeDoc(inputDir, "proton-mail.md", "# Proton Mail\n");
      writeDoc(inputDir, "nextcloud.md", "# Nextcloud\n");
      const snapshotPath = writeSnapshot(tempDir, baselineSnapshot);

      const first = runRunner([
        "--input-dir",
        inputDir,
        "--catalog-snapshot-file",
        snapshotPath,
        "--dry-run",
      ]);
      const second = runRunner([
        "--input-dir",
        inputDir,
        "--catalog-snapshot-file",
        snapshotPath,
        "--dry-run",
      ]);

      expect(first.status).toBe(0);
      expect(second.status).toBe(0);
      expect(first.stdout).toBe(second.stdout);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("--entry forces a single document to the given slug regardless of filename", () => {
    const tempDir = makeProjectTempDir("vet-deep-research-codex-");

    try {
      const inputDir = join(tempDir, "docs");
      mkdirSync(inputDir);
      writeDoc(inputDir, "random-name.md", "# Random\nBody.\n");
      const snapshotPath = writeSnapshot(tempDir, baselineSnapshot);

      const result = runRunner([
        "--input-dir",
        inputDir,
        "--catalog-snapshot-file",
        snapshotPath,
        "--entry",
        "tutanota",
        "--dry-run",
      ]);

      expect(result.status).toBe(0);
      const parsed = parseJsonObject(result.stdout);
      const matched = parsed.matches as MatchResult[];
      expect(matched.length).toBe(1);
      expect(matched[0].entrySlug).toBe("tutanota");
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("fails closed with non-zero exit when --catalog-snapshot-file is malformed JSON", () => {
    const tempDir = makeProjectTempDir("vet-deep-research-codex-");

    try {
      const inputDir = join(tempDir, "docs");
      mkdirSync(inputDir);
      writeDoc(inputDir, "proton-mail.md", "# Proton Mail\n");
      const snapshotPath = join(tempDir, "snapshot.json");
      writeFileSync(snapshotPath, "{ not valid json", "utf8");

      const result = runRunner([
        "--input-dir",
        inputDir,
        "--catalog-snapshot-file",
        snapshotPath,
        "--dry-run",
      ]);

      expect(result.status).not.toBe(0);
      expect(result.stdout).toBe("");
      expect(result.stderr).toMatch(/json|snapshot|invalid/i);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("emits a zero-match summary with exit 0 for an empty input folder", () => {
    const tempDir = makeProjectTempDir("vet-deep-research-codex-");

    try {
      const inputDir = join(tempDir, "docs");
      mkdirSync(inputDir);
      const snapshotPath = writeSnapshot(tempDir, baselineSnapshot);

      const result = runRunner([
        "--input-dir",
        inputDir,
        "--catalog-snapshot-file",
        snapshotPath,
        "--dry-run",
      ]);

      expect(result.status).toBe(0);
      const parsed = parseJsonObject(result.stdout);
      const summary = parsed.summary as Record<string, number>;
      expect(summary.discovered).toBe(0);
      expect(summary.matched).toBe(0);
      expect(summary.skipped).toBe(0);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("fails closed when --input-dir points at a non-existent directory", () => {
    const tempDir = makeProjectTempDir("vet-deep-research-codex-");

    try {
      const missingDir = join(tempDir, "does-not-exist");
      const snapshotPath = writeSnapshot(tempDir, baselineSnapshot);

      const result = runRunner([
        "--input-dir",
        missingDir,
        "--catalog-snapshot-file",
        snapshotPath,
        "--dry-run",
      ]);

      expect(result.status).not.toBe(0);
      expect(result.stdout).toBe("");
      expect(result.stderr).not.toBe("");
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("treats a snapshot without an entries array as zero active entries (every doc becomes no_match)", () => {
    const tempDir = makeProjectTempDir("vet-deep-research-codex-");

    try {
      const inputDir = join(tempDir, "docs");
      mkdirSync(inputDir);
      writeDoc(inputDir, "proton-mail.md", "# Proton Mail\n");
      writeDoc(inputDir, "nextcloud.md", "# Nextcloud\n");
      const snapshotPath = join(tempDir, "snapshot.json");
      writeFileSync(snapshotPath, "{}", "utf8");

      const result = runRunner([
        "--input-dir",
        inputDir,
        "--catalog-snapshot-file",
        snapshotPath,
        "--dry-run",
      ]);

      expect(result.status).toBe(0);
      const parsed = parseJsonObject(result.stdout);
      const summary = parsed.summary as Record<string, number>;
      expect(summary.discovered).toBe(2);
      expect(summary.matched).toBe(0);
      expect(summary.skipped).toBe(2);
      const skippedReasons = (parsed.skipped as MatchResult[]).map(
        (s) => s.reason,
      );
      expect(skippedReasons).toEqual(["no_match", "no_match"]);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("reports ambiguous_match in the skipped list when filename and body URL disagree", () => {
    const tempDir = makeProjectTempDir("vet-deep-research-codex-");

    try {
      const inputDir = join(tempDir, "docs");
      mkdirSync(inputDir);
      writeDoc(
        inputDir,
        "proton-mail.md",
        "# Proton Mail\nCompare with https://nextcloud.com\n",
      );
      const snapshotPath = writeSnapshot(tempDir, baselineSnapshot);

      const result = runRunner([
        "--input-dir",
        inputDir,
        "--catalog-snapshot-file",
        snapshotPath,
        "--dry-run",
      ]);

      expect(result.status).toBe(0);
      const parsed = parseJsonObject(result.stdout);
      const skipped = parsed.skipped as MatchResult[];
      expect(skipped.length).toBe(1);
      expect(skipped[0].reason).toBe("ambiguous_match");
      expect(skipped[0].candidates).toEqual(
        expect.arrayContaining(["proton-mail", "nextcloud"]),
      );
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});

describe("vet-deep-research-codex bash entrypoint", () => {
  const scriptExists = existsSync(shellScriptPath);

  it.skipIf(!scriptExists)(
    "is deterministic and never shells out to opencode, MiniMax, or codex (discovery is model-free)",
    () => {
      const scriptText = readFileSync(shellScriptPath, "utf8");

      expect(scriptText).not.toMatch(/\bopencode\b/);
      expect(scriptText).not.toMatch(/minimax/i);
      expect(scriptText).not.toMatch(/\bcodex\s+exec\b/);
    },
  );

  it.skipIf(!scriptExists)(
    "supports --help without invoking node with required inputs",
    () => {
      const result = spawnSync("bash", [shellScriptPath, "--help"], {
        cwd: projectDir,
        encoding: "utf8",
      });

      expect(result.status).toBe(0);
      expect(result.stdout).toMatch(/usage/i);
    },
  );

  it.skipIf(!scriptExists)(
    "exits with usage error code 64 when invoked with no arguments",
    () => {
      const result = spawnSync("bash", [shellScriptPath], {
        cwd: projectDir,
        encoding: "utf8",
      });

      expect(result.status).toBe(64);
    },
  );

  it.skipIf(!scriptExists)(
    "exits with usage error code 64 when an unknown option is supplied",
    () => {
      const result = spawnSync(
        "bash",
        [shellScriptPath, "--no-such-flag"],
        {
          cwd: projectDir,
          encoding: "utf8",
        },
      );

      expect(result.status).toBe(64);
      expect(result.stderr).toMatch(/unknown/i);
    },
  );
});
