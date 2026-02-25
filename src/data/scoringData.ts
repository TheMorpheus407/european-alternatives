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
  'peertube': { baseClassOverride: 'foss' },
  'pixelfed': { baseClassOverride: 'foss' },
  'prestashop': { baseClassOverride: 'foss' },
  'thunderbird': { baseClassOverride: 'foss' },
  'tor-browser': { baseClassOverride: 'foss' },
  'ungoogled-chromium': { baseClassOverride: 'foss' },
  'vikunja': { baseClassOverride: 'foss' },
};
