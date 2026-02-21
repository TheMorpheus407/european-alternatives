import type { ScoringMetadata } from '../types';

// Scoring metadata for vetted EU/European alternatives.
// Only contains overrides — operational scores are now derived from
// reservations (penalties) and positive signals via the v2 engine.

export const scoringMetadata: Record<string, ScoringMetadata> = {
  'bitwarden': { baseClassOverride: 'foss' },
  'element': { baseClassOverride: 'foss' },
  'home-assistant': { baseClassOverride: 'foss' },
  'keepassxc': { baseClassOverride: 'foss' },
  'librewolf': { baseClassOverride: 'foss' },
  'linux-kernel': { baseClassOverride: 'foss' },
  'mastodon': { baseClassOverride: 'foss' },
  'nextcloud-docs': { baseClassOverride: 'foss' },
  'ollama': { baseClassOverride: 'foss' },
  'openstreetmap': { baseClassOverride: 'foss' },
  'organic-maps': { baseClassOverride: 'foss' },
  'peertube': { baseClassOverride: 'foss' },
  'pixelfed': { baseClassOverride: 'foss' },
  'prestashop': { baseClassOverride: 'foss' },
  'thunderbird': { baseClassOverride: 'foss' },
  'tor-browser': { baseClassOverride: 'foss' },
  'ungoogled-chromium': { baseClassOverride: 'foss' },
  'vikunja': { baseClassOverride: 'foss' },
};

// Scoring metadata for vetted US vendors.

export const usVendorScoringMetadata: Record<string, ScoringMetadata> = {
  'bing': { isAdSurveillance: true },
  'gmail': { isAdSurveillance: true },
  'google-analytics': { isAdSurveillance: true },
  'google-authenticator': { isAdSurveillance: true },
  'google-chrome': { isAdSurveillance: true },
  'google-docs': { isAdSurveillance: true },
  'google-drive': { isAdSurveillance: true },
  'google-gemini': { isAdSurveillance: true },
  'google-home': { isAdSurveillance: true },
  'google-maps': { isAdSurveillance: true },
  'google-meet': { isAdSurveillance: true },
  'google-search': { isAdSurveillance: true },
  'google-translate': { isAdSurveillance: true },
  'google-workspace': { isAdSurveillance: true },
  'meta': { isAdSurveillance: true },
  'nano-banana-pro': { isAdSurveillance: true },
  'reddit': { isAdSurveillance: true },
  'whatsapp': { isAdSurveillance: true },
  'x-corp': { isAdSurveillance: true },
  'yahoo': { isAdSurveillance: true },
  'youtube': { isAdSurveillance: true },
};
