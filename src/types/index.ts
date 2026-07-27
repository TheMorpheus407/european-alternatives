import type { SupportedLanguage } from "../i18n";

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
  logo?: string | null;
  country: CountryCode;
  category: CategoryId;
  secondaryCategories?: CategoryId[];
  replacesUS: string[];
  isOpenSource: boolean;
  openSourceLevel?: OpenSourceLevel;
  openSourceAuditUrl?: string;
  sourceCodeUrl?: string;
  actionLinks?: AlternativeActionLink[];
  pricing: "free" | "freemium" | "paid";
  selfHostable?: boolean;
  tags: string[];
  foundedYear?: number;
  headquartersCity?: string;
  license?: string;
  reservations?: Reservation[];
  positiveSignals?: PositiveSignal[];
  trustScore?: number;
  trustScoreStatus?: TrustScoreStatus;
  trustScoreBreakdown?: TrustScoreBreakdown;
  dateAdded?: string;
  deniedDecision?: DeniedDecision;
}

export interface DeniedDecision {
  reason: string;
  proposedIn?: string;
  claimedOrigin?: string;
  actualOrigin?: string;
  removedIn?: string;
  rawCategoryLabel?: string;
  failedGateways?: string[];
  sources?: Array<{ title: string; url: string }>;
}

export interface Reservation {
  id: string;
  text: string;
  textDe?: string;
  severity: ReservationSeverity;
  date?: string;
  sourceUrl?: string;
  // If this reservation carries a trust-score penalty (omit for informational-only reservations)
  penalty?: {
    tier: PenaltyTier;
    amount: number; // positive number (will be subtracted from trust score)
  };
}

// Tier 1: EU member states + European non-EU (CH, NO, GB, IS)
// Tier 2: Any jurisdiction not in Tier 1 (see DECISION_MATRIX.md)
// Extend this union when adding alternatives from new jurisdictions.
export type CountryCode =
  // Tier 1 — EU member states
  | "at"
  | "be"
  | "bg"
  | "hr"
  | "cy"
  | "cz"
  | "dk"
  | "ee"
  | "fi"
  | "fr"
  | "de"
  | "gr"
  | "hu"
  | "ie"
  | "it"
  | "lv"
  | "lt"
  | "lu"
  | "mt"
  | "nl"
  | "pl"
  | "pt"
  | "ro"
  | "sk"
  | "si"
  | "es"
  | "se"
  // Tier 1 — European non-EU
  | "ch"
  | "no"
  | "gb"
  | "is"
  // Tier 2 — Non-Tier-1 jurisdictions (extend as needed)
  | "au"
  | "ae"
  | "br"
  | "ca"
  | "us"
  | "in"
  | "jp"
  | "sa"
  | "mx"
  | "cn"
  | "vg"
  // Meta
  | "eu"
  | "oss";

export type CategoryId =
  | "cloud-storage"
  | "email"
  | "mail-client"
  | "search-engine"
  | "social-media"
  | "messaging"
  | "meeting-software"
  | "video-hosting"
  | "office-suite"
  | "maps"
  | "browser"
  | "desktop-os"
  | "mobile-os"
  | "vpn"
  | "dns"
  | "analytics"
  | "project-management"
  | "password-manager"
  | "2fa-authenticator"
  | "writing-assistant"
  | "translation"
  | "image-generation"
  | "ai-ml"
  | "hosting"
  | "databases"
  | "payments"
  | "smart-home"
  | "ecommerce"
  | "version-control"
  | "music-streaming"
  | "game-stores"
  | "iam"
  | "note-taking"
  | "app-stores"
  | "smartphones"
  | "e-readers"
  | "media-server"
  | "feed-reader"
  | "scheduling"
  | "personal-finance"
  | "virtualization"
  | "design"
  | "video-editing"
  | "gis"
  | "privacy-tools"
  | "podcasts"
  | "photo-management"
  | "other";

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  usGiants: string[];
  emoji: string;
}

export interface CategoryMatrixApiResponse {
  data: CategoryMatrixData;
  meta: CategoryMatrixMeta;
}

export interface CategoryMatrixData {
  category: CategoryMatrixCategory;
  groups: MatrixGroup[];
  alternatives: MatrixAlternative[];
}

export interface CategoryMatrixCategory {
  id: CategoryId;
  name: string;
  description: string;
  emoji: string | null;
}

export interface CategoryMatrixMeta {
  category: CategoryId;
  locale: SupportedLanguage;
  groupCount: number;
  criterionCount: number;
  alternativeCount: number;
}

export type MatrixValueType =
  | "boolean"
  | "enum"
  | "multi_enum"
  | "number"
  | "text"
  | "url"
  | "date";

export type MatrixSemantics =
  | "beneficial"
  | "harmful"
  | "neutral"
  | "tradeoff"
  | "informational"
  | "risk";

export type MatrixFilterMode =
  | "none"
  | "optional"
  | "must_match"
  | "range"
  | "multi_select";

export type MatrixDisplayMode = "default" | "coverage";

export type MatrixDisplayTone =
  | "positive"
  | "warning"
  | "negative"
  | "neutral"
  | "tradeoff";

export interface MatrixGroup {
  id: string;
  label: string;
  description: string | null;
  criteria: MatrixCriterion[];
}

export interface MatrixCriterion {
  id: string;
  label: string;
  helpText: string | null;
  valueType: MatrixValueType;
  semantics: MatrixSemantics;
  filterMode: MatrixFilterMode;
  displayMode?: MatrixDisplayMode;
  options: MatrixCriterionOption[];
}

export interface MatrixCriterionOption {
  id: string;
  label: string;
  displayTone?: MatrixDisplayTone;
}

export interface MatrixAlternative {
  id: string;
  name: string;
  status?: "alternative" | "us";
  website: string | null;
  logo: string | null;
  country: CountryCode | null;
  category: CategoryId | null;
  secondaryCategories: CategoryId[];
  facts: Record<string, MatrixFact>;
}

export type MatrixFactValue = boolean | number | string | string[] | null;

export type MatrixFact =
  | VerifiedMatrixFact
  | UnverifiedMatrixFact
  | NotApplicableMatrixFact;

export interface VerifiedMatrixFact {
  status: "verified";
  value: MatrixFactValue;
  source?: MatrixSourceMetadata;
}

export interface UnverifiedMatrixFact {
  status: "unverified";
  value: null;
}

export interface NotApplicableMatrixFact {
  status: "not_applicable";
  value: null;
}

export interface MatrixSourceMetadata {
  url: string;
  title?: string;
  accessedDate?: string;
}

export interface CategoryMatrixError {
  code: string;
  message: string;
  httpStatus?: number;
}

export type CategoryMatrixLoadResult =
  | { status: "ready"; matrix: CategoryMatrixApiResponse; error: null }
  | { status: "empty"; matrix: CategoryMatrixApiResponse; error: null }
  | { status: "unavailable"; matrix: null; error: CategoryMatrixError }
  | { status: "error"; matrix: null; error: CategoryMatrixError };

export type CategoryMatrixState =
  | { status: "idle"; matrix: null; error: null }
  | { status: "loading"; matrix: null; error: null }
  | CategoryMatrixLoadResult;

export type FurtherReadingSectionId =
  | "directories"
  | "publicCatalogues"
  | "migrationGuides";
export type FurtherReadingFocus = "eu" | "global" | "public-sector-eu";

export interface FurtherReadingResource {
  id: string;
  name: string;
  website: string;
  section: FurtherReadingSectionId;
  focus: FurtherReadingFocus;
  relatedIssues: number[];
  lastReviewed: string;
}

export type OpenSourceLevel = "full" | "partial" | "none";
export type ReservationSeverity = "minor" | "moderate" | "major";
export type TrustScoreStatus = "pending" | "ready";

export interface DimensionBreakdown {
  max: number;
  /** Effective penalties after cumulative penalty cap scaling (not raw). */
  penalties: number;
  signals: number;
  effective: number;
}

export interface TrustScoreBreakdown {
  baseClass: BaseClass;
  baseScore: number;
  dimensions: Record<PenaltyTier, DimensionBreakdown>;
  operationalTotal: number;
  penaltyTotal: number;
  signalTotal: number;
  capApplied: number | null;
  finalScore100: number;
}

// --- Alignment v2 scoring types ---

export type BaseClass = "foss" | "eu" | "nonEU" | "rest" | "us" | "autocracy";
export type PenaltyTier =
  | "security"
  | "governance"
  | "reliability"
  | "contract";

export interface PositiveSignal {
  id: string;
  text: string;
  textDe?: string;
  dimension: PenaltyTier;
  amount: number;
  sourceUrl: string;
}

// --- Landing page category groups ---

export type LandingCategoryGroupId =
  | "communication-work"
  | "web-discovery"
  | "privacy-security"
  | "social-entertainment"
  | "money-commerce"
  | "devices-platforms"
  | "ai-creative"
  | "builders-infrastructure"
  | "uncategorized";

export interface LandingCategoryGroup {
  id: LandingCategoryGroupId;
  categories: CategoryId[];
}

export type SortBy =
  | "trustScore"
  | "name"
  | "country"
  | "category"
  | PenaltyTier;
export type CardViewMode = "grid" | "list";
export type ViewMode = CardViewMode | "matrix";
export type ResultMode = "browse" | "matrix";

export interface SelectedFilters {
  category: CategoryId[];
  country: CountryCode[];
  pricing: string[];
  openSourceOnly: boolean;
  selfHostable: boolean;
}
