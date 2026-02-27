import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useCatalog } from '../contexts/CatalogContext';
import { getLocalizedAlternativeDescription } from '../utils/alternativeText';
import { getAlternativeCategories } from '../utils/alternativeCategories';
import { CUMULATIVE_PENALTY_CAP } from '../data/scoringConfig';
import { getRecencyMultiplier, withEstimatedPenalties } from '../utils/trustScore';
import type { Alternative, OpenSourceLevel, PenaltyTier, Reservation, USVendorComparison, ViewMode } from '../types';

interface AlternativeCardProps {
  alternative: Alternative;
  viewMode: ViewMode;
}

function getTrustBadgeClass(score: number): string {
  if (score < 5) return 'alt-card-badge-trust-low';
  if (score <= 7) return 'alt-card-badge-trust-medium';
  return 'alt-card-badge-trust-high';
}

function formatScore(value: number): string {
  return (Math.round(value * 10) / 10).toFixed(1);
}

function toTenScale(value: number): number {
  return value / 10;
}

const PENALTY_TIERS: PenaltyTier[] = ['security', 'governance', 'reliability', 'contract'];

type ReservationWithPenalty = Reservation & {
  penalty: {
    tier: PenaltyTier;
    amount: number;
  };
};

function hasPenalty(reservation: Reservation): reservation is ReservationWithPenalty {
  return Boolean(reservation.penalty);
}

const opennessTagKeys = new Set([
  'open-source',
  'open-source-software',
  'opensource',
  'partial-open-source',
  'partly-open-source',
  'proprietary',
]);

function normalizeTagKey(tag: string): string {
  return tag.trim().toLowerCase().replace(/[\s_]+/g, '-');
}

function getOpenSourceLevel(alternative: Pick<Alternative, 'isOpenSource' | 'openSourceLevel'>): OpenSourceLevel {
  if (alternative.openSourceLevel === 'full' || alternative.openSourceLevel === 'partial' || alternative.openSourceLevel === 'none') {
    return alternative.openSourceLevel;
  }

  return alternative.isOpenSource ? 'full' : 'none';
}

function getOpenSourceBadgeConfig(openSourceLevel: OpenSourceLevel): { className: string; labelKey: string } {
  switch (openSourceLevel) {
    case 'full':
      return {
        className: 'alt-card-badge-openness-full',
        labelKey: 'common:openSourceFull',
      };
    case 'partial':
      return {
        className: 'alt-card-badge-openness-partial',
        labelKey: 'common:openSourcePartial',
      };
    case 'none':
    default:
      return {
        className: 'alt-card-badge-openness-none',
        labelKey: 'common:proprietary',
      };
  }
}

export default function AlternativeCard({ alternative, viewMode }: AlternativeCardProps) {
  const { categories } = useCatalog();
  const [expanded, setExpanded] = useState(false);
  const [usVendorDetailsExpanded, setUsVendorDetailsExpanded] = useState(false);
  const [trustBreakdownExpanded, setTrustBreakdownExpanded] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const { t, i18n } = useTranslation(['browse', 'common', 'data']);

  const categoryLabel = getAlternativeCategories(alternative)
    .map((categoryId) => categories.find((entry) => entry.id === categoryId))
    .filter((category): category is (typeof categories)[number] => Boolean(category))
    .map((category) => `${category.emoji} ${t(`data:categories.${category.id}.name`)}`)
    .join(' · ');
  const translatedDescription = getLocalizedAlternativeDescription(alternative, i18n.language);
  const description = (() => {
    if (viewMode !== 'grid' || translatedDescription.length <= 120) return translatedDescription;
    const truncated = translatedDescription.slice(0, 120);
    const lastSpace = truncated.lastIndexOf(' ');
    return `${(lastSpace > 80 ? truncated.slice(0, lastSpace) : truncated).trim()}...`;
  })();

  const isTrustScorePending = alternative.trustScoreStatus !== 'ready';
  const trustScoreLabel = alternative.trustScore != null ? alternative.trustScore.toFixed(1) : null;
  const trustBadgeClass = alternative.trustScore != null
    ? getTrustBadgeClass(alternative.trustScore)
    : '';
  const trustBreakdown = useMemo(() => {
    if (alternative.trustScoreStatus !== 'ready' || !alternative.trustScoreBreakdown) {
      return null;
    }

    const reservationsWithPenalties = withEstimatedPenalties(alternative.reservations ?? [])
      .filter(hasPenalty);
    const rawPenaltyTotal = reservationsWithPenalties.reduce(
      (sum, reservation) => sum + reservation.penalty.amount * getRecencyMultiplier(reservation.date),
      0,
    );
    const penaltyScale = rawPenaltyTotal > CUMULATIVE_PENALTY_CAP
      ? CUMULATIVE_PENALTY_CAP / rawPenaltyTotal
      : 1;

    const reservationItems = reservationsWithPenalties
      .map((reservation) => ({
        id: reservation.id,
        text: reservation.text,
        textDe: reservation.textDe,
        tier: reservation.penalty.tier,
        amount: reservation.penalty.amount * getRecencyMultiplier(reservation.date) * penaltyScale,
        sourceUrl: reservation.sourceUrl,
      }))
      .filter((item) => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    const signalItems = (alternative.positiveSignals ?? [])
      .map((signal) => ({
        id: signal.id,
        text: signal.text,
        textDe: signal.textDe,
        tier: signal.dimension,
        amount: signal.amount,
        sourceUrl: signal.sourceUrl,
      }))
      .sort((a, b) => b.amount - a.amount);

    const breakdown = alternative.trustScoreBreakdown;
    const dimensionItems = PENALTY_TIERS.map((tier) => {
      const dimension = breakdown.dimensions[tier];
      return {
        tier,
        effective: dimension.effective,
        max: dimension.max,
      };
    });

    return {
      baseClass: breakdown.baseClass,
      baseScore10: toTenScale(breakdown.baseScore),
      operationalTotal10: toTenScale(breakdown.operationalTotal),
      signalTotal10: toTenScale(breakdown.signalTotal),
      penaltyTotal10: toTenScale(breakdown.penaltyTotal),
      rawScore10: toTenScale(breakdown.baseScore + breakdown.operationalTotal),
      finalScore10: toTenScale(breakdown.finalScore100),
      classCap10: breakdown.capApplied != null ? toTenScale(breakdown.capApplied) : null,
      penaltyCapApplied: penaltyScale < 1,
      dimensions: dimensionItems.map((dimension) => ({
        ...dimension,
        effective10: toTenScale(dimension.effective),
        max10: toTenScale(dimension.max),
      })),
      reservationItems: reservationItems.map((item) => ({
        ...item,
        amount10: toTenScale(item.amount),
      })),
      signalItems: signalItems.map((item) => ({
        ...item,
        amount10: toTenScale(item.amount),
      })),
    };
  }, [
    alternative.trustScoreStatus,
    alternative.trustScoreBreakdown,
    alternative.reservations,
    alternative.positiveSignals,
  ]);
  const reservationBreakdownById = useMemo(
    () => new Map((trustBreakdown?.reservationItems ?? []).map((item) => [item.id, item])),
    [trustBreakdown],
  );
  const signalBreakdownById = useMemo(
    () => new Map((trustBreakdown?.signalItems ?? []).map((item) => [item.id, item])),
    [trustBreakdown],
  );
  const trustBreakdownRegionId = `alt-trust-breakdown-${alternative.id}`;
  const hasReservations = (alternative.reservations?.length ?? 0) > 0;
  const hasPositiveSignals = (alternative.positiveSignals?.length ?? 0) > 0;
  const fallbackUSVendorComparisons: USVendorComparison[] = alternative.replacesUS.map((name) => ({
      id: `us-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`,
      name,
      trustScoreStatus: 'pending' as const,
    }));
  const usVendorComparisons = alternative.usVendorComparisons?.length
    ? alternative.usVendorComparisons
    : fallbackUSVendorComparisons;
  const openSourceLevel = getOpenSourceLevel(alternative);
  const openSourceBadge = getOpenSourceBadgeConfig(openSourceLevel);
  const visibleTags = alternative.tags.filter((tag) => !opennessTagKeys.has(normalizeTagKey(tag)));

  return (
    <motion.div
      className={`alt-card ${viewMode === 'list' ? 'list-view' : ''}`}
      whileHover={{ scale: viewMode === 'grid' ? 1.02 : 1.01 }}
      transition={{ duration: 0.2 }}
      layout
    >
      <div className="alt-card-header">
        <div className="alt-card-logo-wrap">
          {alternative.logo && !logoError ? (
            <img
              src={alternative.logo}
              alt={t('common:logoSuffix', { name: alternative.name })}
              className="alt-card-logo"
              loading="lazy"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className={`fi fi-${alternative.country} alt-card-logo-fallback`}></span>
          )}
          <span className={`fi fi-${alternative.country} alt-card-flag-badge`}></span>
        </div>
        <div className="alt-card-title-section">
          <div className="alt-card-title-row">
            <h3 className="alt-card-name">{alternative.name}</h3>
            {isTrustScorePending ? (
              <span className="alt-card-trust-stamp alt-card-trust-stamp-pending">
                {t('browse:card.trustScorePending')}
              </span>
            ) : (
              trustScoreLabel && (
                trustBreakdown ? (
                  <button
                    type="button"
                    className={`alt-card-trust-stamp alt-card-trust-stamp-button ${trustBadgeClass.replace('alt-card-badge', 'alt-card-trust-stamp')}`}
                    onClick={() => setTrustBreakdownExpanded(!trustBreakdownExpanded)}
                    aria-expanded={trustBreakdownExpanded}
                    aria-controls={trustBreakdownRegionId}
                  >
                    <span>{t('browse:card.trustScoreLabel', { score: trustScoreLabel })}</span>
                    <svg
                      className={`alt-card-trust-stamp-icon ${trustBreakdownExpanded ? 'rotated' : ''}`}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                    </svg>
                  </button>
                ) : (
                  <span className={`alt-card-trust-stamp ${trustBadgeClass.replace('alt-card-badge', 'alt-card-trust-stamp')}`}>
                    {t('browse:card.trustScoreLabel', { score: trustScoreLabel })}
                  </span>
                )
              )
            )}
          </div>
          {categoryLabel && (
            <span className="alt-card-category">
              {categoryLabel}
            </span>
          )}
          {trustBreakdown && trustBreakdownExpanded && (
            <div
              id={trustBreakdownRegionId}
              className="alt-card-trust-breakdown"
              role="region"
              aria-label={t('browse:card.trustScoreBreakdownTitle')}
            >
              <h4 className="alt-card-trust-breakdown-title">
                {t('browse:card.trustScoreBreakdownTitle')}
              </h4>
              <p className="alt-card-trust-breakdown-equation">
                {t(
                  trustBreakdown.classCap10 != null
                    ? 'browse:card.trustScoreBreakdownEquationCapped'
                    : 'browse:card.trustScoreBreakdownEquation',
                  {
                    base: formatScore(trustBreakdown.baseScore10),
                    operational: formatScore(trustBreakdown.operationalTotal10),
                    cap: trustBreakdown.classCap10 != null ? formatScore(trustBreakdown.classCap10) : undefined,
                    final: formatScore(trustBreakdown.finalScore10),
                  },
                )}
              </p>
              <div className="alt-card-trust-breakdown-summary">
                <div className="alt-card-trust-breakdown-row">
                  <span>
                    {t('browse:card.trustScoreBreakdownBase', {
                      baseClass: t(`browse:card.baseClass.${trustBreakdown.baseClass}`),
                    })}
                  </span>
                  <strong>+{formatScore(trustBreakdown.baseScore10)}</strong>
                </div>
                <div className="alt-card-trust-breakdown-row">
                  <span>{t('browse:card.trustScoreBreakdownOperational')}</span>
                  <strong>+{formatScore(trustBreakdown.operationalTotal10)}</strong>
                </div>
                <div className="alt-card-trust-breakdown-row">
                  <span>{t('browse:card.trustScoreBreakdownRaw')}</span>
                  <strong>{formatScore(trustBreakdown.rawScore10)}</strong>
                </div>
                {trustBreakdown.classCap10 != null && (
                  <div className="alt-card-trust-breakdown-row">
                    <span>{t('browse:card.trustScoreBreakdownClassCap')}</span>
                    <strong>{formatScore(trustBreakdown.classCap10)}</strong>
                  </div>
                )}
                <div className="alt-card-trust-breakdown-row alt-card-trust-breakdown-row-final">
                  <span>{t('browse:card.trustScoreBreakdownFinal')}</span>
                  <strong>{formatScore(trustBreakdown.finalScore10)}/10</strong>
                </div>
              </div>
              {trustBreakdown.penaltyCapApplied && (
                <p className="alt-card-trust-breakdown-cap-note">
                  {t('browse:card.trustScoreBreakdownPenaltyCap', {
                    cap: formatScore(toTenScale(CUMULATIVE_PENALTY_CAP)),
                  })}
                </p>
              )}
              <div className="alt-card-trust-breakdown-dimensions">
                {trustBreakdown.dimensions.map((dimension) => (
                  <div key={dimension.tier} className="alt-card-trust-breakdown-dimension">
                    <span>{t(`browse:card.penaltyTier.${dimension.tier}`)}</span>
                    <strong>{formatScore(dimension.effective10)}/{formatScore(dimension.max10)}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="alt-card-description">{description}</p>

      <div className="alt-card-replaces">
        <div className="alt-card-replaces-header">
          <span className="alt-card-replaces-label">{t('browse:card.usVendorComparison')}</span>
          <button
            type="button"
            className="alt-card-replaces-toggle"
            onClick={() => setUsVendorDetailsExpanded(!usVendorDetailsExpanded)}
            aria-expanded={usVendorDetailsExpanded}
            aria-controls={`alt-us-vendors-${alternative.id}`}
          >
            <span>
              {usVendorDetailsExpanded
                ? t('browse:card.hideUSVendorDetails')
                : t('browse:card.showUSVendorDetails')}
            </span>
            <svg
              className={`alt-card-replaces-toggle-icon ${usVendorDetailsExpanded ? 'rotated' : ''}`}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
            </svg>
          </button>
        </div>
        <div id={`alt-us-vendors-${alternative.id}`} className="alt-card-us-vendor-list">
          {usVendorComparisons.map((vendor) => (
            <div key={vendor.id} className="alt-card-us-vendor-item">
              <div className="alt-card-us-vendor-summary">
                <span className="alt-card-us-vendor-name">{vendor.name}</span>
                {vendor.trustScoreStatus === 'ready' && vendor.trustScore != null ? (
                  <span className={`alt-card-badge ${getTrustBadgeClass(vendor.trustScore)}`}>
                    {t('browse:card.trustScoreLabel', { score: vendor.trustScore.toFixed(1) })}
                  </span>
                ) : (
                  <span className="alt-card-badge alt-card-badge-trust-pending">
                    {t('browse:card.trustScorePending')}
                  </span>
                )}
              </div>
              {usVendorDetailsExpanded && (
                <div className="alt-card-us-vendor-content">
                  {((i18n.language.startsWith('de') && vendor.descriptionDe) || vendor.description) && (
                    <p className="alt-card-us-vendor-description">
                      {i18n.language.startsWith('de') && vendor.descriptionDe ? vendor.descriptionDe : vendor.description}
                    </p>
                  )}
                  {(vendor.reservations?.length ?? 0) > 0 && (
                    <ul className="alt-card-us-vendor-reservations">
                      {vendor.reservations?.map((reservation) => (
                        <li key={reservation.id} className="alt-card-us-vendor-reservation-item">
                          <p className="alt-card-us-vendor-reservation-text">
                            {i18n.language.startsWith('de') && reservation.textDe
                              ? reservation.textDe
                              : reservation.text}
                          </p>
                          {reservation.sourceUrl && (
                            <a
                              href={reservation.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="alt-detail-source-link"
                            >
                              {t('browse:card.reservationSource')}
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="alt-card-badges">
        <span className={`alt-card-badge alt-card-badge-pricing ${alternative.pricing}`}>
          {t(`common:pricing.${alternative.pricing}`)}
        </span>
        <span className={`alt-card-badge alt-card-badge-openness ${openSourceBadge.className}`}>
          {t(openSourceBadge.labelKey)}
        </span>
        {visibleTags.slice(0, 2).map((tag) => (
          <span key={tag} className="alt-card-badge alt-card-badge-tag">{tag}</span>
        ))}
      </div>

      <button
        className="alt-card-expand"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls={`alt-details-${alternative.id}`}
      >
        <span>{expanded ? t('browse:card.showLess') : t('browse:card.showMore')}</span>
        <svg
          className={`alt-card-expand-icon ${expanded ? 'rotated' : ''}`}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
        </svg>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            id={`alt-details-${alternative.id}`}
            className="alt-card-details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="alt-card-details-content">
              <div className="alt-detail-section">
                <h4 className="alt-detail-title">{t('browse:card.about')}</h4>
                <p className="alt-detail-text">{translatedDescription}</p>
              </div>

              {(alternative.foundedYear != null || alternative.headquartersCity || alternative.license) && (
                <div className="alt-detail-section">
                  <h4 className="alt-detail-title">{t('browse:card.details')}</h4>
                  <div className="alt-detail-meta">
                    {alternative.foundedYear != null && (
                      <div className="alt-detail-meta-item">
                        <span className="alt-detail-meta-label">{t('browse:card.founded')}</span>
                        <span className="alt-detail-meta-value">{alternative.foundedYear}</span>
                      </div>
                    )}
                    {alternative.headquartersCity && (
                      <div className="alt-detail-meta-item">
                        <span className="alt-detail-meta-label">{t('browse:card.headquarters')}</span>
                        <span className="alt-detail-meta-value">
                          {alternative.headquartersCity}
                          <span className={`fi fi-${alternative.country} alt-detail-meta-flag`}></span>
                        </span>
                      </div>
                    )}
                    {alternative.license && (
                      <div className="alt-detail-meta-item">
                        <span className="alt-detail-meta-label">{t('browse:card.license')}</span>
                        <span className="alt-detail-meta-value">{alternative.license}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {visibleTags.length > 0 && (
                <div className="alt-detail-section">
                  <h4 className="alt-detail-title">{t('browse:card.tags')}</h4>
                  <div className="alt-detail-tags">
                    {visibleTags.map((tag) => (
                      <span key={tag} className="alt-detail-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {hasReservations && (
                <div className="alt-detail-section">
                  <h4 className="alt-detail-title">{t('browse:card.reservations')}</h4>
                  <ul className="alt-detail-reservations">
                    {alternative.reservations?.map((reservation) => {
                      const reservationScore = reservationBreakdownById.get(reservation.id);
                      return (
                      <li key={reservation.id} className="alt-detail-reservation-item">
                        {reservationScore && (
                          <div className="alt-detail-score-meta">
                            <span className="alt-detail-score-delta alt-detail-score-delta-negative">
                              -{formatScore(reservationScore.amount10)}
                            </span>
                            <span className="alt-detail-score-tier">
                              {t(`browse:card.penaltyTier.${reservationScore.tier}`)}
                            </span>
                          </div>
                        )}
                        <p className="alt-detail-text">
                          {i18n.language.startsWith('de') && reservation.textDe
                            ? reservation.textDe
                            : reservation.text}
                        </p>
                        {reservation.sourceUrl && (
                          <a
                            href={reservation.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="alt-detail-source-link"
                          >
                            {t('browse:card.reservationSource')}
                          </a>
                        )}
                      </li>
                    )})}
                  </ul>
                </div>
              )}

              {hasPositiveSignals && (
                <div className="alt-detail-section">
                  <h4 className="alt-detail-title">{t('browse:card.positiveSignals')}</h4>
                  <ul className="alt-detail-signals">
                    {alternative.positiveSignals?.map((signal) => {
                      const signalScore = signalBreakdownById.get(signal.id);
                      return (
                      <li key={signal.id} className="alt-detail-signal-item">
                        {signalScore && (
                          <div className="alt-detail-score-meta">
                            <span className="alt-detail-score-delta alt-detail-score-delta-positive">
                              +{formatScore(signalScore.amount10)}
                            </span>
                            <span className="alt-detail-score-tier">
                              {t(`browse:card.penaltyTier.${signalScore.tier}`)}
                            </span>
                          </div>
                        )}
                        <p className="alt-detail-text">
                          {i18n.language.startsWith('de') && signal.textDe
                            ? signal.textDe
                            : signal.text}
                        </p>
                        {signal.sourceUrl && (
                          <a
                            href={signal.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="alt-detail-source-link"
                          >
                            {t('browse:card.reservationSource')}
                          </a>
                        )}
                      </li>
                    )})}
                  </ul>
                </div>
              )}

              <div className="alt-card-actions">
                <a
                  href={alternative.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="alt-card-link alt-card-link-primary"
                  aria-label={t('browse:card.visitWebsite', { name: alternative.name })}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                  {t('browse:card.website')}
                </a>
                {alternative.sourceCodeUrl && (
                  <a
                    href={alternative.sourceCodeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="alt-card-link alt-card-link-secondary"
                    aria-label={t('browse:card.sourceCode', { name: alternative.name })}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M8.7 16.7 4 12l4.7-4.7 1.4 1.4L6.8 12l3.3 3.3-1.4 1.4zm6.6 0-1.4-1.4 3.3-3.3-3.3-3.3 1.4-1.4L20 12l-4.7 4.7z"/>
                    </svg>
                    {t('browse:card.sourceCodeLabel')}
                  </a>
                )}
                {alternative.actionLinks?.map((link) => (
                  <a
                    key={`${alternative.id}-${link.url}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="alt-card-link alt-card-link-secondary"
                    aria-label={t('browse:card.visitWebsite', { name: link.label })}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3z"/>
                      <path d="M5 5h6v2H7v10h10v-4h2v6H5V5z"/>
                    </svg>
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
