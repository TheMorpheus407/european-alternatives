import type {
  Alternative,
  ReservationSeverity,
  TrustConfidence,
  TrustReasonKey,
  TrustTier,
  VettingStatus,
} from '../types';
import { trustWebSignalsById } from '../data/trustWebSignals';

const reservationPenalty: Record<ReservationSeverity, number> = {
  minor: 1,
  moderate: 2,
  major: 3,
};

const privacySignalTags = new Set([
  'privacy',
  'gdpr',
  'encryption',
  'zero-knowledge',
  'no-logs',
  'sovereign',
]);

const selfHostingTags = new Set([
  'self-hosted',
  'self-hostable',
  'offline',
  'federated',
]);

export function getTrustTier(score: number): TrustTier {
  if (score >= 9) return 'excellent';
  if (score >= 7) return 'good';
  if (score >= 5) return 'fair';
  return 'poor';
}

function normalizeStatus(status: VettingStatus | undefined): VettingStatus {
  return status ?? 'research';
}

function dedupeReasons(reasons: TrustReasonKey[]): TrustReasonKey[] {
  return Array.from(new Set(reasons));
}

export function computeTrustFields(alternative: Alternative): Alternative {
  const status = normalizeStatus(alternative.vettingStatus);
  const openSourceLevel = alternative.openSourceLevel ?? (alternative.isOpenSource ? 'full' : 'none');
  const reservations = alternative.reservations ?? [];
  const webSignals = trustWebSignalsById[alternative.id];

  let score = 4;
  const reasons: TrustReasonKey[] = [];

  if (alternative.country === 'eu') {
    // "eu" is used for exceptions (non-EU HQ or diffuse governance),
    // so keep a stronger baseline penalty than explicit EU/EEA countries.
    score -= 2;
    reasons.push('non-eu-exception');
  } else {
    score += 2;
    reasons.push('european-jurisdiction');
  }

  if (openSourceLevel === 'full') {
    score += 3;
    reasons.push('open-source-full');
  } else if (openSourceLevel === 'partial') {
    score += 1;
    reasons.push('open-source-partial');
  } else {
    score -= 1;
    reasons.push('closed-source');
  }

  if (alternative.githubUrl) {
    score += 1;
    reasons.push('github-transparency');
  }

  if (alternative.tags.some((tag) => selfHostingTags.has(tag.toLowerCase()))) {
    score += 1;
    reasons.push('self-hosting-possible');
  }

  if (alternative.tags.some((tag) => privacySignalTags.has(tag.toLowerCase()))) {
    score += 1;
    reasons.push('privacy-centric-features');
  }

  if (webSignals?.signals.openSourceMention && openSourceLevel !== 'none') {
    score += 0.5;
  }

  if (webSignals?.signals.encryption || webSignals?.signals.noLogs) {
    score += 0.5;
    reasons.push('privacy-centric-features');
  }

  if (webSignals?.signals.selfHosting) {
    score += 0.5;
    reasons.push('self-hosting-possible');
  }

  if (webSignals?.signals.audit) {
    score += 1;
  }

  if (status === 'vetted-approved') {
    score += 2;
    reasons.push('vetted-approved');
  } else if (status === 'vetted-rejected') {
    score -= 4;
    reasons.push('vetted-rejected');
  } else {
    reasons.push('not-fully-vetted');
  }

  const reservationPenaltyTotal = reservations.reduce((sum, reservation) => {
    return sum + reservationPenalty[reservation.severity];
  }, 0);

  if (reservationPenaltyTotal > 0) {
    score -= reservationPenaltyTotal;
    reasons.push('reservations-present');
  }

  const sourcedReservations = reservations.filter((reservation) => reservation.sourceUrl).length;
  let confidence: TrustConfidence = 'low';
  if (
    status === 'vetted-approved' ||
    status === 'vetted-rejected' ||
    ((webSignals?.signalCount ?? 0) >= 4 && sourcedReservations > 0)
  ) {
    confidence = 'high';
  } else if (alternative.githubUrl || reservations.length > 0 || (webSignals?.signalCount ?? 0) >= 2) {
    confidence = 'medium';
  }

  if (confidence === 'low') {
    score = Math.min(score, 8);
  }

  if (confidence === 'medium') {
    score = Math.min(score, 9);
  }

  const bounded = Math.max(1, Math.min(10, Math.round(score)));
  const trustScore = alternative.trustScore ?? bounded;

  return {
    ...alternative,
    isOpenSource: openSourceLevel !== 'none',
    openSourceLevel,
    vettingStatus: status,
    reservations,
    trustScore,
    trustTier: alternative.trustTier ?? getTrustTier(trustScore),
    trustConfidence: alternative.trustConfidence ?? confidence,
    trustRationale: dedupeReasons(alternative.trustRationale ?? reasons),
  };
}
