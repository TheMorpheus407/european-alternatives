#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { auditLogoRepository } from "./lib/logo-integrity.mjs";

const DEFAULT_API_BASE = "https://european-alternatives.cloud/api";
const CATALOG_STATUSES = ["alternative", "us", "denied"];

function usage() {
  process.stdout.write(`Usage:
  npm run logos:check -- [--catalog-file <path>] [--api-base <url>]

Validates every checked-in logo and every local /logos/... path discoverable
from catalog migrations. Optional catalog files and the public catalog API add
their currently advertised logo paths to the same deterministic asset checks.

Options:
  --catalog-file <path>  Read an exported/catalog JSON payload (repeatable).
  --api-base <url>       Also check all statuses from a public catalog API.
                         Use "default" for ${DEFAULT_API_BASE}
  --help                 Show this help.
`);
}

function fail(message, exitCode = 64) {
  process.stderr.write(`${message}\n`);
  process.exit(exitCode);
}

function parseArguments(argv) {
  const options = {
    apiBase: null,
    catalogFiles: [],
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--help" || argument === "-h") {
      options.help = true;
      continue;
    }
    if (argument === "--catalog-file") {
      if (index + 1 >= argv.length) {
        fail("error: --catalog-file requires a path");
      }
      options.catalogFiles.push(argv[++index]);
      continue;
    }
    if (argument.startsWith("--catalog-file=")) {
      options.catalogFiles.push(argument.slice("--catalog-file=".length));
      continue;
    }
    if (argument === "--api-base") {
      if (index + 1 >= argv.length) {
        fail("error: --api-base requires a URL or default");
      }
      options.apiBase = argv[++index];
      continue;
    }
    if (argument.startsWith("--api-base=")) {
      options.apiBase = argument.slice("--api-base=".length);
      continue;
    }

    fail(`error: unknown option ${argument}`);
  }

  if (options.apiBase === "default") {
    options.apiBase = DEFAULT_API_BASE;
  }
  if (options.apiBase !== null) {
    try {
      const url = new URL(options.apiBase);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        fail("error: --api-base must be an http or https URL");
      }
      options.apiBase = url.toString().replace(/\/$/u, "");
    } catch {
      fail("error: --api-base must be a valid URL");
    }
  }

  return options;
}

async function fetchCatalogPayloads(apiBase) {
  return Promise.all(
    CATALOG_STATUSES.map(async (status) => {
      const url = `${apiBase}/catalog/entries?status=${status}&locale=en`;
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(15_000),
      });

      if (!response.ok) {
        throw new Error(`${url} returned HTTP ${response.status}`);
      }

      const payload = await response.json();
      if (!payload || typeof payload !== "object" || !Array.isArray(payload.data)) {
        throw new Error(`${url} did not contain a data array`);
      }

      return payload;
    }),
  );
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    usage();
    return;
  }

  const catalogPayloads = options.catalogFiles.map((catalogFile) => {
    const absolutePath = resolve(catalogFile);
    try {
      return JSON.parse(readFileSync(absolutePath, "utf8"));
    } catch (error) {
      fail(
        `error: could not read catalog JSON ${catalogFile}: ${
          error instanceof Error ? error.message : String(error)
        }`,
        1,
      );
    }
  });

  if (options.apiBase !== null) {
    try {
      catalogPayloads.push(...(await fetchCatalogPayloads(options.apiBase)));
    } catch (error) {
      fail(
        `error: could not read catalog API: ${
          error instanceof Error ? error.message : String(error)
        }`,
        1,
      );
    }
  }

  const result = auditLogoRepository({
    projectRoot: resolve("."),
    catalogPayloads,
  });

  if (result.errors.length > 0) {
    process.stderr.write(
      `Logo integrity check failed with ${result.errors.length} issue${
        result.errors.length === 1 ? "" : "s"
      }:\n`,
    );
    for (const error of result.errors) {
      process.stderr.write(`- ${error}\n`);
    }
    process.exitCode = 1;
    return;
  }

  process.stdout.write(
    `Logo integrity check passed: ${result.assetCount} assets, ` +
      `${result.advertisedPathCount} persisted/advertised local paths.\n`,
  );
}

await main();
