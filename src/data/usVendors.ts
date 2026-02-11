import type { Reservation, USVendorComparison } from '../types';

interface USVendorRecord {
  id: string;
  name: string;
  aliases: string[];
}

interface USVendorTrustProfile {
  trustScore: number;
  description: string;
  descriptionDe: string;
  reservations: Reservation[];
}

const US_VENDOR_RECORDS: USVendorRecord[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    aliases: ['gmail'],
  },
  {
    id: 'google-search',
    name: 'Google Search',
    aliases: ['google search'],
  },
  {
    id: 'google',
    name: 'Google',
    aliases: [
      'google workspace',
      'google maps',
      'google chrome',
      'google drive',
      'google ai',
      'google cloud',
      'google analytics',
      'google gemini',
      'google translate',
      'google imagen',
      'waze',
      'youtube',
    ],
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    aliases: [
      'outlook',
      'onedrive',
      'microsoft office',
      'bing',
      'edge',
      'azure',
      'microsoft copilot',
      'github copilot',
      'linkedin',
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    aliases: ['chatgpt', 'openai dall-e', 'dall-e', 'dall e'],
  },
  {
    id: 'amazon',
    name: 'Amazon',
    aliases: ['aws', 'aws ai', 'aws translate', 'twitch'],
  },
  {
    id: 'apple',
    name: 'Apple',
    aliases: ['icloud', 'apple maps', 'safari', 'imessage'],
  },
  {
    id: 'meta',
    name: 'Meta',
    aliases: ['facebook', 'instagram', 'whatsapp'],
  },
  {
    id: 'atlassian',
    name: 'Atlassian',
    aliases: ['jira', 'trello'],
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    aliases: ['slack'],
  },
  {
    id: 'x-corp',
    name: 'X Corp',
    aliases: ['x/twitter', 'twitter', 'x'],
  },
  {
    id: 'yahoo',
    name: 'Yahoo',
    aliases: ['yahoo mail'],
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    aliases: [],
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    aliases: [],
  },
  {
    id: 'discord',
    name: 'Discord',
    aliases: [],
  },
  {
    id: 'vimeo',
    name: 'Vimeo',
    aliases: [],
  },
  {
    id: 'expressvpn',
    name: 'ExpressVPN',
    aliases: [],
  },
  {
    id: 'mixpanel',
    name: 'Mixpanel',
    aliases: [],
  },
  {
    id: 'amplitude',
    name: 'Amplitude',
    aliases: [],
  },
  {
    id: 'asana',
    name: 'Asana',
    aliases: [],
  },
  {
    id: 'monday-com',
    name: 'Monday.com',
    aliases: ['monday'],
  },
  {
    id: 'lastpass',
    name: 'LastPass',
    aliases: [],
  },
  {
    id: '1password',
    name: '1Password',
    aliases: [],
  },
  {
    id: 'dashlane',
    name: 'Dashlane',
    aliases: [],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    aliases: [],
  },
  {
    id: 'paypal',
    name: 'PayPal',
    aliases: ['pay pal'],
  },
  {
    id: 'block',
    name: 'Block',
    aliases: ['square'],
  },
  {
    id: 'shopify',
    name: 'Shopify',
    aliases: [],
  },
  {
    id: 'ebay',
    name: 'eBay',
    aliases: ['ebay'],
  },
];

const US_VENDOR_TRUST_PROFILES: Record<string, USVendorTrustProfile> = {
  gmail: {
    trustScore: 2.7,
    description:
      'US-operated email service with strong technical hardening, but trust is reduced by Alphabet\'s ad-driven incentives, major privacy enforcement actions, and antitrust rulings.',
    descriptionDe:
      'US-E-Mail-Dienst mit starker technischer Absicherung, dessen Vertrauen aber durch Alphabets werbegetriebene Anreize, schwere Privacy-Verfahren und Antitrust-Urteile reduziert wird.',
    reservations: [
      {
        id: 'ad-tech-majority-control',
        text: 'Alphabet remains majority-funded by advertising, creating structural incentives that can conflict with privacy-first expectations.',
        textDe: 'Alphabet erzielt weiterhin den Großteil seines Umsatzes aus Werbung, was strukturelle Anreize schafft, die mit Privacy-First-Erwartungen kollidieren können.',
        severity: 'major',
        sourceUrl: 'https://www.sec.gov/ixviewer/ix.html?doc=/Archives/edgar/data/1652044/000165204425000014/goog-20241231.htm',
      },
      {
        id: 'major-privacy-settlement-2025',
        text: 'Google agreed to a $1.375B Texas settlement over privacy allegations around location, incognito, and biometrics.',
        textDe: 'Google stimmte in Texas einem Vergleich über 1,375 Mrd. USD zu, basierend auf Privacy-Vorwürfen zu Standortdaten, Incognito und biometrischen Daten.',
        severity: 'major',
        date: '2025-05-09',
        sourceUrl: 'https://apnews.com/article/8097e181cc7cb8522781db8a9a897eea',
      },
      {
        id: 'adverse-antitrust-rulings-2024-2025',
        text: 'US antitrust cases found Google violated competition law in search and open-web ad-tech markets.',
        textDe: 'US-Antitrust-Verfahren stellten fest, dass Google im Such- und Open-Web-Ad-Tech-Markt gegen Wettbewerbsrecht verstoßen hat.',
        severity: 'major',
        date: '2025-04-17',
        sourceUrl: 'https://www.justice.gov/opa/pr/department-justice-prevails-landmark-antitrust-case-against-google',
      },
      {
        id: 'gemini-bundled-pricing-2025',
        text: 'Workspace business plans were repriced while Gemini AI features were bundled into base offerings, reducing opt-out flexibility on cost.',
        textDe: 'Workspace-Business-Pläne wurden neu bepreist, während Gemini-AI-Funktionen in Basispakete gebündelt wurden, was die Kosten-Opt-out-Flexibilität reduziert.',
        severity: 'moderate',
        date: '2025-01-15',
        sourceUrl: 'https://workspace.google.com/blog/product-announcements/empowering-businesses-with-AI',
      },
    ],
  },
  'google-search': {
    trustScore: 2.0,
    description:
      'US-operated search platform with strong engineering depth, but ad-driven data monetization, AI training defaults, and major legal findings materially reduce trust.',
    descriptionDe:
      'US-Suchplattform mit starker technischer Reife, deren Vertrauen aber durch werbegetriebene Datennutzung, KI-Trainings-Defaults und schwere Rechtsbefunde deutlich sinkt.',
    reservations: [
      {
        id: 'search-ad-surveillance-business-model',
        text: 'Google Search is monetized via advertising and personalization signals, creating a structural conflict with strict privacy-first expectations.',
        textDe: 'Google Search wird ueber Werbung und Personalisierungssignale monetarisiert, was einen strukturellen Konflikt mit strikten Privacy-First-Erwartungen schafft.',
        severity: 'major',
        sourceUrl: 'https://policies.google.com/privacy',
      },
      {
        id: 'search-default-ai-training-controls',
        text: 'Google states Search interactions can be used to improve generative AI models, including signed-out searches and aggregated/anonymized usage even after certain controls are disabled.',
        textDe: 'Google dokumentiert, dass Search-Interaktionen zur Verbesserung generativer KI genutzt werden koennen, einschliesslich ausgeloggter Suchen und aggregierter/anonymisierter Nutzung auch bei deaktivierten Kontrollen.',
        severity: 'major',
        sourceUrl: 'https://support.google.com/websearch/answer/14901683',
      },
      {
        id: 'search-antitrust-monopoly-finding',
        text: 'The US court found Google maintained an illegal search monopoly, and remedies now impose restrictions tied to default-distribution and data access.',
        textDe: 'Das US-Gericht stellte fest, dass Google ein illegales Suchmonopol aufrechterhalten hat; die verhaengten Auflagen betreffen unter anderem Default-Distribution und Datenzugang.',
        severity: 'major',
        date: '2024-08-05',
        sourceUrl: 'https://apnews.com/article/846916fda0943c5fa359385044a02c8b',
      },
      {
        id: 'search-major-privacy-settlement-2025',
        text: 'Google agreed to a $1.375B Texas settlement over privacy allegations, including location tracking and incognito-related practices.',
        textDe: 'Google stimmte in Texas einem Vergleich ueber 1,375 Mrd. USD wegen Privacy-Vorwuerfen zu, einschliesslich Standort-Tracking und Incognito-bezogener Praktiken.',
        severity: 'major',
        date: '2025-05-09',
        sourceUrl: 'https://apnews.com/article/8097e181cc7cb8522781db8a9a897eea',
      },
      {
        id: 'search-us-controller-global-processing',
        text: 'Google privacy terms describe global processing and specify Google LLC as data controller for information indexed and displayed in Search regardless of user location.',
        textDe: 'Googles Datenschutzhinweise beschreiben globale Verarbeitung und benennen Google LLC als Data Controller fuer in Search indexierte und angezeigte Informationen unabhaengig vom Standort des Nutzers.',
        severity: 'moderate',
        sourceUrl: 'https://policies.google.com/privacy',
      },
    ],
  },
};

function normalizeVendorName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function slugifyVendorName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

const US_VENDOR_BY_ALIAS = new Map<string, USVendorRecord>();

for (const record of US_VENDOR_RECORDS) {
  const normalizedNames = [record.name, ...record.aliases].map(normalizeVendorName);
  for (const normalizedName of normalizedNames) {
    if (normalizedName) {
      US_VENDOR_BY_ALIAS.set(normalizedName, record);
    }
  }
}

function toComparison(record: USVendorRecord): USVendorComparison {
  const profile = US_VENDOR_TRUST_PROFILES[record.id];

  return {
    id: record.id,
    name: record.name,
    trustScoreStatus: profile ? 'ready' : 'pending',
    trustScore: profile?.trustScore,
    description: profile?.description,
    descriptionDe: profile?.descriptionDe,
    reservations: profile?.reservations,
  };
}

function toFallbackComparison(name: string): USVendorComparison {
  const normalized = name.trim();
  const fallbackId = slugifyVendorName(normalized) || 'us-vendor';

  return {
    id: `us-${fallbackId}`,
    name: normalized,
    trustScoreStatus: 'pending',
  };
}

export function resolveUSVendorComparison(name: string): USVendorComparison {
  const normalized = normalizeVendorName(name);
  const record = US_VENDOR_BY_ALIAS.get(normalized);

  if (record) {
    return toComparison(record);
  }

  return toFallbackComparison(name);
}

export function buildUSVendorComparisons(names: string[]): USVendorComparison[] {
  const deduped = new Map<string, USVendorComparison>();

  for (const name of names) {
    if (!name.trim()) continue;
    const comparison = resolveUSVendorComparison(name);
    if (!deduped.has(comparison.id)) {
      deduped.set(comparison.id, comparison);
    }
  }

  return Array.from(deduped.values());
}
