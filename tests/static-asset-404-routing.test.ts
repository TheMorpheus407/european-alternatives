import {
  existsSync,
  readdirSync,
  statSync,
  readFileSync,
} from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const repoRoot = resolve('.')
const htaccessSource = readFileSync(resolve(repoRoot, '.htaccess'), 'utf8')
const existingDistCondition =
  'RewriteCond %{DOCUMENT_ROOT}/dist%{REQUEST_URI} -f'
const existingDistRule = 'RewriteRule ^ dist%{REQUEST_URI} [L]'
const missingStaticRule =
  'RewriteRule ^(?:assets|logos)(?:/|$) - [R=404,L,NC]'
const spaFallbackRule = 'RewriteRule ^ dist/index.html [L]'
const staticNamespacePattern = /^\/(?:assets|logos)(?:\/|$)/iu

type RouteResult = 'dist-file' | 'static-404' | 'spa-fallback'

function getActiveHtaccessLines(source: string): string[] {
  return source
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
}

function isFile(path: string): boolean {
  return existsSync(path) && statSync(path).isFile()
}

function resolveRoute(path: string): RouteResult {
  const pathname = new URL(path, 'https://european-alternatives.cloud')
    .pathname
  const relativePath = pathname.replace(/^\/+/u, '')
  const distPath = resolve(repoRoot, 'dist', relativePath)

  if (relativePath.length > 0 && isFile(distPath)) {
    return 'dist-file'
  }

  if (staticNamespacePattern.test(pathname)) {
    return 'static-404'
  }

  return 'spa-fallback'
}

const activeLines = getActiveHtaccessLines(htaccessSource)

describe('missing static asset routing', () => {
  it('checks dist before returning a static 404 and keeps the SPA fallback last', () => {
    const existingDistConditionIndex = activeLines.indexOf(
      existingDistCondition,
    )
    const existingDistRuleIndex = activeLines.indexOf(existingDistRule)
    const missingStaticRuleIndex = activeLines.indexOf(missingStaticRule)
    const spaFallbackRuleIndex = activeLines.indexOf(spaFallbackRule)

    expect(existingDistConditionIndex).toBeGreaterThanOrEqual(0)
    expect(existingDistRuleIndex).toBe(existingDistConditionIndex + 1)
    expect(missingStaticRuleIndex).toBe(existingDistRuleIndex + 1)
    expect(spaFallbackRuleIndex).toBe(missingStaticRuleIndex + 1)
  })

  it('continues serving existing logo and asset files from dist', () => {
    const assetFilename = readdirSync(resolve(repoRoot, 'dist/assets')).find(
      (filename) => isFile(resolve(repoRoot, 'dist/assets', filename)),
    )

    expect(assetFilename).toBeDefined()
    expect(resolveRoute('/logos/signal.svg')).toBe('dist-file')
    expect(resolveRoute(`/assets/${assetFilename}`)).toBe('dist-file')
  })

  it('returns 404 for unresolved logo and asset namespace requests', () => {
    expect(resolveRoute('/logos/definitely-missing.svg')).toBe('static-404')
    expect(resolveRoute('/assets/definitely-missing.css')).toBe('static-404')
    expect(resolveRoute('/LOGOS/definitely-missing.svg?cache=1')).toBe(
      'static-404',
    )
    expect(resolveRoute('/assets')).toBe('static-404')
  })

  it('does not capture application routes with similar path segments', () => {
    expect(resolveRoute('/en')).toBe('spa-fallback')
    expect(resolveRoute('/en/logos/example')).toBe('spa-fallback')
    expect(resolveRoute('/logo-store')).toBe('spa-fallback')
    expect(resolveRoute('/assets-library')).toBe('spa-fallback')
  })
})
