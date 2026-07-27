import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import { basename, extname, join, relative, resolve } from "node:path";

import { XMLValidator } from "fast-xml-parser";

const LOCAL_LOGO_PATH =
  /^\/logos\/[A-Za-z0-9][A-Za-z0-9._-]*\.(?:jpe?g|png|svg|webp)$/u;
const SUPPORTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".svg", ".webp"]);
const CATALOG_SLUG = /^[A-Za-z0-9][A-Za-z0-9._-]*$/u;
const DRAWABLE_SVG_ELEMENT =
  /<(?:circle|ellipse|image|line|path|polygon|polyline|rect|text|use)\b/iu;
const XML_NAME = "[A-Za-z_][\\w.-]*";
const QUALIFIED_XML_NAME = `${XML_NAME}(?::${XML_NAME})?`;

function describeXmlValidationError(validationResult) {
  if (
    validationResult &&
    typeof validationResult === "object" &&
    validationResult.err
  ) {
    const { code, line, msg } = validationResult.err;
    const location = Number.isInteger(line) ? ` on line ${line}` : "";
    const detail = msg || code || "invalid XML";
    return `${detail}${location}`;
  }

  return "invalid XML";
}

function validatePng(bytes) {
  const errors = [];
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  if (bytes.length < 33 || !bytes.subarray(0, 8).equals(signature)) {
    return ["does not have a valid PNG signature and header"];
  }

  let offset = 8;
  let chunkIndex = 0;
  let sawImageData = false;
  let sawImageEnd = false;

  while (offset < bytes.length) {
    if (offset + 12 > bytes.length) {
      errors.push("has a truncated PNG chunk");
      break;
    }

    const chunkLength = bytes.readUInt32BE(offset);
    const chunkType = bytes.toString("ascii", offset + 4, offset + 8);
    const chunkEnd = offset + 12 + chunkLength;

    if (!/^[A-Za-z]{4}$/u.test(chunkType) || chunkEnd > bytes.length) {
      errors.push("has an invalid or truncated PNG chunk");
      break;
    }

    if (chunkIndex === 0) {
      if (chunkType !== "IHDR" || chunkLength !== 13) {
        errors.push("does not start with a valid PNG IHDR chunk");
      } else if (
        bytes.readUInt32BE(offset + 8) === 0 ||
        bytes.readUInt32BE(offset + 12) === 0
      ) {
        errors.push("has zero-width or zero-height PNG dimensions");
      }
    }

    if (chunkType === "IDAT") {
      sawImageData = true;
    }

    if (chunkType === "IEND") {
      if (chunkLength !== 0 || chunkEnd !== bytes.length) {
        errors.push("has an invalid PNG IEND chunk");
      }
      sawImageEnd = true;
      break;
    }

    offset = chunkEnd;
    chunkIndex += 1;
  }

  if (!sawImageData) {
    errors.push("does not contain PNG image data");
  }
  if (!sawImageEnd) {
    errors.push("does not contain a complete PNG IEND chunk");
  }

  return errors;
}

function validateJpeg(bytes) {
  const errors = [];

  if (
    bytes.length < 4 ||
    bytes[0] !== 0xff ||
    bytes[1] !== 0xd8 ||
    bytes.at(-2) !== 0xff ||
    bytes.at(-1) !== 0xd9
  ) {
    return ["does not have complete JPEG SOI/EOI markers"];
  }

  const startOfFrameMarkers = new Set([
    0xc0,
    0xc1,
    0xc2,
    0xc3,
    0xc5,
    0xc6,
    0xc7,
    0xc9,
    0xca,
    0xcb,
    0xcd,
    0xce,
    0xcf,
  ]);
  let offset = 2;
  let sawDimensions = false;

  while (offset < bytes.length - 2) {
    if (bytes[offset] !== 0xff) {
      errors.push("has malformed JPEG segment framing");
      break;
    }

    while (bytes[offset] === 0xff) {
      offset += 1;
    }

    const marker = bytes[offset];
    offset += 1;

    if (marker === 0xda || marker === 0xd9) {
      break;
    }
    if (marker === 0x00 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      continue;
    }
    if (offset + 2 > bytes.length) {
      errors.push("has a truncated JPEG segment");
      break;
    }

    const segmentLength = bytes.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > bytes.length) {
      errors.push("has an invalid or truncated JPEG segment");
      break;
    }

    if (startOfFrameMarkers.has(marker)) {
      if (
        segmentLength < 7 ||
        bytes.readUInt16BE(offset + 3) === 0 ||
        bytes.readUInt16BE(offset + 5) === 0
      ) {
        errors.push("has invalid JPEG dimensions");
      } else {
        sawDimensions = true;
      }
    }

    offset += segmentLength;
  }

  if (!sawDimensions) {
    errors.push("does not contain a JPEG start-of-frame with dimensions");
  }

  return errors;
}

function validateWebp(bytes) {
  if (
    bytes.length < 20 ||
    bytes.toString("ascii", 0, 4) !== "RIFF" ||
    bytes.toString("ascii", 8, 12) !== "WEBP"
  ) {
    return ["does not have a valid WebP RIFF header"];
  }

  const errors = [];
  const declaredLength = bytes.readUInt32LE(4) + 8;
  if (declaredLength !== bytes.length) {
    errors.push("has a WebP RIFF length that does not match the file size");
  }

  let offset = 12;
  let sawImageChunk = false;

  while (offset < bytes.length) {
    if (offset + 8 > bytes.length) {
      errors.push("has a truncated WebP chunk");
      break;
    }

    const chunkType = bytes.toString("ascii", offset, offset + 4);
    const chunkLength = bytes.readUInt32LE(offset + 4);
    const chunkEnd = offset + 8 + chunkLength;
    const paddedEnd = chunkEnd + (chunkLength % 2);

    if (chunkEnd > bytes.length || paddedEnd > bytes.length) {
      errors.push("has an invalid or truncated WebP chunk");
      break;
    }

    if (chunkType === "VP8 " || chunkType === "VP8L" || chunkType === "VP8X") {
      sawImageChunk = true;
    }

    offset = paddedEnd;
  }

  if (!sawImageChunk) {
    errors.push("does not contain a WebP image chunk");
  }

  return errors;
}

function xmlNames(svg) {
  const names = [];
  const tagPattern = new RegExp(
    `<\\/?\\s*(${QUALIFIED_XML_NAME})(?=[\\s/>])`,
    "gu",
  );
  const openingTagPattern = new RegExp(
    `<(${QUALIFIED_XML_NAME})([^<>]*?)\\/?\\s*>`,
    "gsu",
  );
  const attributePattern = new RegExp(
    `(?:^|\\s)(${QUALIFIED_XML_NAME})\\s*=`,
    "gu",
  );

  for (const match of svg.matchAll(tagPattern)) {
    names.push(match[1]);
  }
  for (const tagMatch of svg.matchAll(openingTagPattern)) {
    for (const attributeMatch of tagMatch[2].matchAll(attributePattern)) {
      names.push(attributeMatch[1]);
    }
  }

  return names;
}

function validateEmbeddedDataImage(reference) {
  const match = reference.match(
    /^data:image\/(jpeg|png|webp);base64,([\s\S]+)$/iu,
  );
  if (!match) {
    return ["uses an unsupported or malformed embedded image data URI"];
  }

  const encoded = match[2].replace(/\s+/gu, "");
  if (
    encoded.length === 0 ||
    encoded.length % 4 !== 0 ||
    !/^[A-Za-z0-9+/]*={0,2}$/u.test(encoded)
  ) {
    return ["uses malformed base64 in an embedded image data URI"];
  }

  const bytes = Buffer.from(encoded, "base64");
  return validateRasterBytes(`embedded.${match[1]}`, bytes);
}

function collectSvgReferences(svg) {
  const references = [];
  const attributePattern =
    /\b(?:href|src)\s*=\s*(["'])([\s\S]*?)\1/giu;
  const cssUrlPattern = /\burl\(\s*(["']?)([\s\S]*?)\1\s*\)/giu;

  for (const match of svg.matchAll(attributePattern)) {
    references.push(match[2].trim());
  }
  for (const match of svg.matchAll(cssUrlPattern)) {
    references.push(match[2].trim());
  }

  return references;
}

function validateSvg(bytes) {
  const errors = [];
  const svg = bytes.toString("utf8");
  const xmlValidation = XMLValidator.validate(svg);

  if (xmlValidation !== true) {
    errors.push(`contains malformed SVG XML: ${describeXmlValidationError(xmlValidation)}`);
  }

  const rootMatch = svg.match(/<svg\b([^>]*)>/iu);
  if (!rootMatch) {
    errors.push("does not contain an SVG root element");
  } else {
    if (
      !/\bxmlns\s*=\s*(["'])http:\/\/www\.w3\.org\/2000\/svg\1/iu.test(
        rootMatch[1],
      )
    ) {
      errors.push("does not declare the SVG XML namespace on its root element");
    }

    const viewBox = rootMatch[1].match(
      /\bviewBox\s*=\s*(["'])\s*[-+]?(?:\d+\.?\d*|\.\d+)\s+[-+]?(?:\d+\.?\d*|\.\d+)\s+([-+]?(?:\d+\.?\d*|\.\d+))\s+([-+]?(?:\d+\.?\d*|\.\d+))\s*\1/iu,
    );
    if (viewBox) {
      if (Number(viewBox[2]) <= 0 || Number(viewBox[3]) <= 0) {
        errors.push("has a non-positive SVG viewBox");
      }
    } else if (
      !/\bwidth\s*=\s*(["'])\s*[1-9]\d*(?:\.\d+)?(?:px|pt|pc|cm|mm|in|em|ex|%)?\s*\1/iu.test(
        rootMatch[1],
      ) ||
      !/\bheight\s*=\s*(["'])\s*[1-9]\d*(?:\.\d+)?(?:px|pt|pc|cm|mm|in|em|ex|%)?\s*\1/iu.test(
        rootMatch[1],
      )
    ) {
      errors.push("does not define positive SVG dimensions");
    }
  }

  if (!DRAWABLE_SVG_ELEMENT.test(svg)) {
    errors.push("does not contain a drawable SVG element");
  }
  if (/<(?:foreignObject|script)\b/iu.test(svg)) {
    errors.push("contains executable or embedded HTML content");
  }
  if (/\son[A-Za-z]+\s*=/u.test(svg) || /\bjavascript\s*:/iu.test(svg)) {
    errors.push("contains executable SVG attributes or URLs");
  }

  const namespaceDeclarations = new Set(
    [...svg.matchAll(/\bxmlns:([A-Za-z_][\w.-]*)\s*=/gu)].map(
      (match) => match[1],
    ),
  );
  const usedPrefixes = new Set(
    xmlNames(svg)
      .filter((name) => name.includes(":") && !name.startsWith("xmlns:"))
      .map((name) => name.slice(0, name.indexOf(":")))
      .filter((prefix) => prefix !== "xml"),
  );
  for (const prefix of usedPrefixes) {
    if (!namespaceDeclarations.has(prefix)) {
      errors.push(`uses undeclared XML namespace prefix "${prefix}"`);
    }
  }

  for (const reference of collectSvgReferences(svg)) {
    if (reference.startsWith("#")) {
      continue;
    }
    if (reference.startsWith("data:")) {
      errors.push(...validateEmbeddedDataImage(reference));
      continue;
    }
    errors.push(`depends on external subresource "${reference}"`);
  }

  return errors;
}

export function validateRasterBytes(filename, bytes) {
  const extension = extname(filename).toLowerCase();

  if (extension === ".png") {
    return validatePng(bytes);
  }
  if (extension === ".jpg" || extension === ".jpeg") {
    return validateJpeg(bytes);
  }
  if (extension === ".webp") {
    return validateWebp(bytes);
  }

  return [`uses unsupported raster extension "${extension || "(none)"}"`];
}

export function validateLogoBytes(filename, bytes) {
  const extension = extname(filename).toLowerCase();

  if (extension === ".svg") {
    return validateSvg(bytes);
  }
  if (SUPPORTED_EXTENSIONS.has(extension)) {
    return validateRasterBytes(filename, bytes);
  }

  return [`uses unsupported logo extension "${extension || "(none)"}"`];
}

function addLocalLogoPath(paths, candidate) {
  if (typeof candidate === "string" && candidate.startsWith("/logos/")) {
    try {
      const url = new URL(candidate, "https://catalog.invalid");
      paths.add(url.pathname);
    } catch {
      paths.add(candidate);
    }
  }
}

export function collectCatalogLogoPaths(value, paths = new Set()) {
  if (typeof value === "string") {
    addLocalLogoPath(paths, value);
    return paths;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      collectCatalogLogoPaths(item, paths);
    }
    return paths;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      collectCatalogLogoPaths(item, paths);
    }
  }

  return paths;
}

function generatedMigrationSlugs(source) {
  const slugs = [];
  const literalPattern =
    /\b0x((?:[A-Fa-f0-9]{2})+)\b|\bX'((?:[A-Fa-f0-9]{2})+)'|(["'])([A-Za-z0-9][A-Za-z0-9._-]*)\3/giu;

  for (const match of source.matchAll(literalPattern)) {
    const encodedSlug = match[1] ?? match[2];
    const slug =
      encodedSlug === undefined
        ? match[4]
        : Buffer.from(encodedSlug, "hex").toString("utf8");

    if (CATALOG_SLUG.test(slug)) {
      slugs.push(slug);
    }
  }

  return slugs;
}

export function discoverMigrationLogoPaths(migrationsDirectory) {
  const paths = new Set();
  if (!existsSync(migrationsDirectory)) {
    return paths;
  }

  const migrationFiles = readdirSync(migrationsDirectory)
    .filter((filename) => filename.endsWith(".sql"))
    .sort();

  for (const filename of migrationFiles) {
    const sql = readFileSync(join(migrationsDirectory, filename), "utf8");

    for (const match of sql.matchAll(
      /(["'])(\/logos\/[A-Za-z0-9][A-Za-z0-9._-]*\.(?:jpe?g|png|svg|webp))\1/giu,
    )) {
      paths.add(match[2]);
    }

    for (const match of sql.matchAll(/\bCONCAT\s*\(([^)]*)\)/giu)) {
      const argumentsSource = match[1];
      const stringParts = [
        ...argumentsSource.matchAll(/(["'])((?:(?!\1)[\s\S])*)\1/gu),
      ].map((part) => part[2]);
      const withoutStringParts = argumentsSource
        .replace(/(["'])((?:(?!\1)[\s\S])*)\1/gu, "")
        .replace(/[\s,]/gu, "");

      if (stringParts.length > 0 && withoutStringParts === "") {
        addLocalLogoPath(paths, stringParts.join(""));
      }
    }

    const generatedPathMatch = sql.match(
      /\bSET\s+`?logo_path`?\s*=\s*CONCAT\s*\(\s*(["'])(\/logos\/)\1\s*,\s*`?slug`?\s*,\s*(["'])(\.(?:jpe?g|png|svg|webp))\3\s*\)/iu,
    );
    if (generatedPathMatch) {
      for (const slugList of sql.matchAll(
        /`?slug`?\s+IN\s*\(([\s\S]*?)\)/giu,
      )) {
        for (const slug of generatedMigrationSlugs(slugList[1])) {
          paths.add(`${generatedPathMatch[2]}${slug}${generatedPathMatch[4]}`);
        }
      }
    }
  }

  return paths;
}

export function auditLogoRepository({
  projectRoot,
  catalogPayloads = [],
}) {
  const absoluteProjectRoot = resolve(projectRoot);
  const logosDirectory = join(absoluteProjectRoot, "public", "logos");
  const migrationsDirectory = join(
    absoluteProjectRoot,
    "scripts",
    "migrations",
  );
  const advertisedPaths = discoverMigrationLogoPaths(migrationsDirectory);
  const errors = [];

  for (const payload of catalogPayloads) {
    collectCatalogLogoPaths(payload, advertisedPaths);
  }

  if (!existsSync(logosDirectory) || !statSync(logosDirectory).isDirectory()) {
    return {
      advertisedPathCount: advertisedPaths.size,
      assetCount: 0,
      errors: ["public/logos: logo asset directory is missing"],
    };
  }

  const assetNames = readdirSync(logosDirectory).sort();
  for (const logoPath of [...advertisedPaths].sort()) {
    if (!LOCAL_LOGO_PATH.test(logoPath)) {
      errors.push(`${logoPath}: advertised local logo path is malformed`);
      continue;
    }

    const assetPath = join(absoluteProjectRoot, "public", logoPath);
    if (!existsSync(assetPath) || !statSync(assetPath).isFile()) {
      errors.push(
        `${logoPath}: advertised logo is missing from ${relative(
          absoluteProjectRoot,
          assetPath,
        )}`,
      );
    }
  }

  for (const assetName of assetNames) {
    const assetPath = join(logosDirectory, assetName);
    if (!statSync(assetPath).isFile()) {
      continue;
    }

    const assetErrors = validateLogoBytes(assetName, readFileSync(assetPath));
    for (const error of assetErrors) {
      errors.push(`public/logos/${basename(assetPath)}: ${error}`);
    }
  }

  return {
    advertisedPathCount: advertisedPaths.size,
    assetCount: assetNames.length,
    errors,
  };
}
