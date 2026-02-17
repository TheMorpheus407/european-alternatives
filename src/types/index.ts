export interface AlternativeActionLink {
  label: string;
  url: string;
}

export interface Alternative {
  id: string;
  name: string;
  description: string;
  localizedDescriptions?: {
    de?: string;
  };
  website: string;
  logo?: string;
  country: CountryCode;
  category: CategoryId;
  replacesUS: string[];
  usVendorComparisons?: USVendorComparison[];
  isOpenSource: boolean;
  openSourceLevel?: OpenSourceLevel;
  sourceCodeUrl?: string;
  actionLinks?: AlternativeActionLink[];
  pricing: 'free' | 'freemium' | 'paid';
  tags: string[];
  foundedYear?: number;
  headquartersCity?: string;
  license?: string;
  reservations?: Reservation[];
  trustScore?: number;
  trustScoreStatus?: TrustScoreStatus;
  trustScoreBreakdown?: TrustScoreBreakdown;
}

export interface USVendorComparison {
  id: string;
  name: string;
  trustScoreStatus: TrustScoreStatus;
  trustScore?: number;
  description?: string;
  descriptionDe?: string;
  reservations?: Reservation[];
}

export interface Reservation {
  id: string;
  text: string;
  textDe?: string;
  severity: ReservationSeverity;
  date?: string;
  sourceUrl?: string;
}

export type CountryCode =
  | 'at' | 'be' | 'bg' | 'hr' | 'cy' | 'cz' | 'dk' | 'ee'
  | 'fi' | 'fr' | 'de' | 'gr' | 'hu' | 'ie' | 'it' | 'lv'
  | 'lt' | 'lu' | 'mt' | 'nl' | 'pl' | 'pt' | 'ro' | 'sk'
  | 'si' | 'es' | 'se'
  | 'ch' | 'no' | 'gb' | 'is'
  | 'eu' | 'us' | 'open-source' | 'ca';

export type CategoryId =
  | 'cloud-storage'
  | 'email'
  | 'mail-client'
  | 'search-engine'
  | 'social-media'
  | 'messaging'
  | 'meeting-software'
  | 'video-hosting'
  | 'office-suite'
  | 'maps'
  | 'browser'
  | 'desktop-os'
  | 'mobile-os'
  | 'vpn'
  | 'analytics'
  | 'project-management'
  | 'password-manager'
  | '2fa-authenticator'
  | 'ai-ml'
  | 'hosting'
  | 'payments'
  | 'smart-home'
  | 'ecommerce'
  | 'other';

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  usGiants: string[];
  emoji: string;
}

export type OpenSourceLevel = 'full' | 'partial' | 'none';
export type ReservationSeverity = 'minor' | 'moderate' | 'major';
export type TrustScoreStatus = 'pending' | 'ready';

export interface TrustScoreBreakdown {
  jurisdiction: number;
  openness: number;
  privacySignals: number;
  reservationPenalty: number;
  usCapApplied: boolean;
}

export type SortBy = 'trustScore' | 'name' | 'country' | 'category';
export type ViewMode = 'grid' | 'list';

export interface SelectedFilters {
  category: CategoryId[];
  country: CountryCode[];
  pricing: string[];
  openSourceOnly: boolean;
}
