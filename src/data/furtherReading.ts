import type { FurtherReadingResource } from '../types';

export const furtherReadingResources: FurtherReadingResource[] = [
  {
    id: 'european-alternatives-eu',
    name: 'european-alternatives.eu',
    website: 'https://european-alternatives.eu/',
    section: 'directories',
    focus: 'eu',
    relatedIssues: [12, 39],
    lastReviewed: '2026-02-25',
  },
  {
    id: 'privacy-guides-tools',
    name: 'Privacy Guides - Tools',
    website: 'https://www.privacyguides.org/en/tools/',
    section: 'directories',
    focus: 'global',
    relatedIssues: [12],
    lastReviewed: '2026-02-25',
  },
  {
    id: 'prism-break',
    name: 'PRISM Break',
    website: 'https://prism-break.org/en/all/',
    section: 'directories',
    focus: 'global',
    relatedIssues: [39],
    lastReviewed: '2026-02-25',
  },
  {
    id: 'eu-oss-catalogue',
    name: 'EU Open Source Solutions Catalogue',
    website: 'https://interoperable-europe.ec.europa.eu/eu-oss-catalogue/',
    section: 'publicCatalogues',
    focus: 'public-sector-eu',
    relatedIssues: [8],
    lastReviewed: '2026-02-25',
  },
  {
    id: 'digital-independence-day',
    name: 'Digital Independence Day',
    website: 'https://di.day/alternativen/',
    section: 'migrationGuides',
    focus: 'eu',
    relatedIssues: [12],
    lastReviewed: '2026-02-25',
  },
];
