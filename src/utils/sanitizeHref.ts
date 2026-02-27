const SAFE_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tel:']);

/**
 * Sanitize a URL for use in href attributes.
 * Returns undefined for unsafe schemes (e.g. javascript:, data:) to prevent XSS.
 */
export function sanitizeHref(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url, 'https://placeholder.invalid');
    if (!SAFE_SCHEMES.has(parsed.protocol)) return undefined;
    return url;
  } catch {
    return undefined;
  }
}
