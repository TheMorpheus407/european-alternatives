import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCatalog } from '../contexts/CatalogContext';
import { sanitizeHref } from '../utils/sanitizeHref';
import type { Alternative } from '../types';

export default function DeniedPage() {
  const { deniedAlternatives, loading, error } = useCatalog();
  const { t } = useTranslation(['denied', 'data']);

  if (loading) {
    return (
      <div className="denied-page">
        <div className="denied-header">
          <h1 className="denied-title">{t('denied:title')}</h1>
          <p className="denied-subtitle">{t('denied:subtitle')}</p>
        </div>
        <div className="catalog-loading">Loading catalog data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="denied-page">
        <div className="denied-header">
          <h1 className="denied-title">{t('denied:title')}</h1>
          <p className="denied-subtitle">{t('denied:subtitle')}</p>
        </div>
        <div className="catalog-error" role="alert">Data temporarily unavailable. Please try again later.</div>
      </div>
    );
  }

  if (deniedAlternatives.length === 0) {
    return (
      <div className="denied-page">
        <div className="denied-header">
          <h1 className="denied-title">{t('denied:title')}</h1>
          <p className="denied-subtitle">{t('denied:subtitle')}</p>
        </div>
        <p className="denied-empty">{t('denied:emptyState')}</p>
      </div>
    );
  }

  return (
    <div className="denied-page">
      <motion.div
        className="denied-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="denied-title">{t('denied:title')}</h1>
        <p className="denied-subtitle">{t('denied:subtitle')}</p>
      </motion.div>

      <motion.section
        className="denied-intro"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <h2>{t('denied:introTitle')}</h2>
        <p>{t('denied:introText')}</p>
      </motion.section>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <DecisionFrameworkSection />
      </motion.div>

      <div className="denied-list">
        {deniedAlternatives.map((alternative, index) => (
          <motion.div
            key={alternative.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(0.3 + index * 0.06, 1) }}
          >
            <DeniedCard alternative={alternative} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Decision Framework Section ─── */

function DecisionFrameworkSection() {
  const { t } = useTranslation('denied');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = useCallback((key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const isOpen = (key: string) => openSections[key] ?? false;

  const gatewayKeys = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8'] as const;

  const examples = t('denied:framework.examples', { returnObjects: true }) as Array<{
    name: string;
    country: string;
    openSource: string;
    outcome: string;
    reasoning: string;
  }>;

  return (
    <section className="denied-framework">
      <h2 className="denied-framework-title">{t('denied:framework.title')}</h2>
      <p className="denied-framework-intro">{t('denied:framework.intro')}</p>

      {/* Two-Tier System */}
      <CollapsibleSection
        id="two-tier"
        title={t('denied:framework.twoTierTitle')}
        isOpen={isOpen('two-tier')}
        onToggle={() => toggleSection('two-tier')}
      >
        <p className="denied-framework-text">{t('denied:framework.twoTierIntro')}</p>
        <div className="denied-framework-table-wrap">
          <table className="denied-framework-table">
            <thead>
              <tr>
                <th />
                <th>{t('denied:framework.tier1Label')}</th>
                <th>{t('denied:framework.tier2Label')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="denied-framework-table-label">{t('denied:framework.tierHeaders.jurisdiction')}</td>
                <td>{t('denied:framework.tier1.jurisdiction')}</td>
                <td>{t('denied:framework.tier2.jurisdiction')}</td>
              </tr>
              <tr>
                <td className="denied-framework-table-label">{t('denied:framework.tierHeaders.openSourceReq')}</td>
                <td>{t('denied:framework.tier1.openSourceReq')}</td>
                <td>{t('denied:framework.tier2.openSourceReq')}</td>
              </tr>
              <tr>
                <td className="denied-framework-table-label">{t('denied:framework.tierHeaders.proprietaryAllowed')}</td>
                <td>{t('denied:framework.tier1.proprietaryAllowed')}</td>
                <td>{t('denied:framework.tier2.proprietaryAllowed')}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="denied-framework-note">{t('denied:framework.twoTierRationale')}</p>
      </CollapsibleSection>

      {/* Gateway Criteria */}
      <CollapsibleSection
        id="gateways"
        title={t('denied:framework.gatewayTitle')}
        isOpen={isOpen('gateways')}
        onToggle={() => toggleSection('gateways')}
      >
        <p className="denied-framework-text">{t('denied:framework.gatewayIntro')}</p>
        <div className="denied-framework-gateway-list">
          {gatewayKeys.map((gw) => (
            <div key={gw} className="denied-framework-gateway-item">
              <span className="denied-framework-gateway-code">{gw}</span>
              <div className="denied-framework-gateway-content">
                <strong className="denied-framework-gateway-name">
                  {t(`denied:gateways.${gw}`)}
                </strong>
                <p className="denied-framework-gateway-desc">
                  {t(`denied:gatewayDescriptions.${gw}`)}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="denied-framework-note">{t('denied:framework.g8Note')}</p>
      </CollapsibleSection>

      {/* Decision Flowchart */}
      <CollapsibleSection
        id="flowchart"
        title={t('denied:framework.flowchartTitle')}
        isOpen={isOpen('flowchart')}
        onToggle={() => toggleSection('flowchart')}
      >
        <p className="denied-framework-text">{t('denied:framework.flowchartIntro')}</p>
        <div className="denied-framework-flowchart">
          <div className="denied-flowchart-node denied-flowchart-question">
            {t('denied:framework.flowchartEuropean')}
          </div>
          <div className="denied-flowchart-branch">
            <div className="denied-flowchart-path">
              <span className="denied-flowchart-arrow denied-flowchart-arrow-yes">{t('denied:framework.flowchartYesTier1')}</span>
              <div className="denied-flowchart-node denied-flowchart-question">
                {t('denied:framework.flowchartPassGateway')}
              </div>
              <div className="denied-flowchart-outcomes">
                <span className="denied-flowchart-outcome denied-flowchart-outcome-included">
                  {t('denied:framework.flowchartIncluded')}
                </span>
                <span className="denied-flowchart-outcome denied-flowchart-outcome-denied">
                  {t('denied:framework.flowchartDenied')}
                </span>
              </div>
            </div>
            <div className="denied-flowchart-path">
              <span className="denied-flowchart-arrow denied-flowchart-arrow-no">{t('denied:framework.flowchartNoTier2')}</span>
              <div className="denied-flowchart-node denied-flowchart-question">
                {t('denied:framework.flowchartFullOSS')}
              </div>
              <div className="denied-flowchart-outcomes">
                <span className="denied-flowchart-outcome denied-flowchart-outcome-included">
                  {t('denied:framework.flowchartOSSYes')}
                  <br />
                  {t('denied:framework.flowchartOSSIncluded')}
                </span>
                <span className="denied-flowchart-outcome denied-flowchart-outcome-denied">
                  {t('denied:framework.flowchartOSSDenied')}
                </span>
                <span className="denied-flowchart-outcome denied-flowchart-outcome-denied">
                  {t('denied:framework.flowchartOSSNo')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Examples */}
      <CollapsibleSection
        id="examples"
        title={t('denied:framework.examplesTitle')}
        isOpen={isOpen('examples')}
        onToggle={() => toggleSection('examples')}
      >
        <p className="denied-framework-text">{t('denied:framework.examplesIntro')}</p>
        <div className="denied-framework-table-wrap">
          <table className="denied-framework-table denied-framework-examples-table">
            <thead>
              <tr>
                <th>{t('denied:framework.exampleHeaders.alternative')}</th>
                <th>{t('denied:framework.exampleHeaders.country')}</th>
                <th>{t('denied:framework.exampleHeaders.openSource')}</th>
                <th>{t('denied:framework.exampleHeaders.outcome')}</th>
                <th>{t('denied:framework.exampleHeaders.reasoning')}</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(examples) && examples.map((ex) => (
                <tr key={ex.name}>
                  <td><strong>{ex.name}</strong></td>
                  <td>{ex.country}</td>
                  <td>{ex.openSource}</td>
                  <td>{ex.outcome}</td>
                  <td>{ex.reasoning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>
    </section>
  );
}

/* ─── Collapsible Section helper ─── */

function CollapsibleSection({
  id,
  title,
  isOpen,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const { t } = useTranslation('denied');

  return (
    <div className="denied-framework-section">
      <button
        className="denied-framework-section-toggle"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`framework-${id}`}
      >
        <span className="denied-framework-section-title">{title}</span>
        <span className="denied-framework-section-hint">
          {isOpen ? t('denied:framework.collapse') : t('denied:framework.expand')}
        </span>
        <svg
          className={`denied-framework-section-icon${isOpen ? ' rotated' : ''}`}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
        </svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`framework-${id}`}
            className="denied-framework-section-content"
            role="region"
            aria-label={title}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="denied-framework-section-inner">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Denied Card ─── */

function DeniedCard({ alternative }: { alternative: Alternative }) {
  const [expanded, setExpanded] = useState(false);
  const { t, i18n } = useTranslation(['denied', 'data']);
  const decision = alternative.deniedDecision;

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const categoryName = t(`data:categories.${alternative.category}.name`, { defaultValue: '' });
  const displayCategory = decision?.rawCategoryLabel ?? categoryName;

  const localizedDescription = i18n.language.startsWith('de')
    ? (alternative.localizedDescriptions?.de ?? alternative.description)
    : alternative.description;

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString(i18n.language === 'de' ? 'de-DE' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <article className="denied-card">
      <div className="denied-card-header">
        <div className="denied-card-title-section">
          <h3 className="denied-card-name">{alternative.name}</h3>
          <div className="denied-card-tags">
            {displayCategory && (
              <span className="denied-card-tag denied-card-tag-category">{displayCategory}</span>
            )}
            {alternative.dateAdded && (
              <span className="denied-card-tag denied-card-tag-date">
                {t('denied:deniedOn')}: {formatDate(alternative.dateAdded)}
              </span>
            )}
          </div>
        </div>
        <span className="denied-card-badge">
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" aria-hidden="true">
            <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
          </svg>
          {t('denied:badge')}
        </span>
      </div>

      {localizedDescription && (
        <p className="denied-card-description">{localizedDescription}</p>
      )}

      {decision?.failedGateways && decision.failedGateways.length > 0 && (
        <div className="denied-card-gateways">
          <span className="denied-card-gateways-label">{t('denied:gatewayLabel')}:</span>
          <div className="denied-card-gateway-details">
            {decision.failedGateways.map((gw) => (
              <div key={gw} className="denied-card-gateway-detail">
                <span className="denied-gateway-badge">
                  {t(`denied:gateways.${gw}`, { defaultValue: gw })}
                </span>
                <p className="denied-card-gateway-explanation">
                  {t(`denied:gatewayDescriptions.${gw}`, { defaultValue: '' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {(decision?.claimedOrigin || decision?.actualOrigin || decision?.proposedIn || decision?.removedIn) && (
        <div className="denied-card-meta">
          {decision.claimedOrigin && (
            <div className="denied-card-meta-item">
              <span className="denied-card-meta-label">{t('denied:claimedOrigin')}</span>
              <span className="denied-card-meta-value">{decision.claimedOrigin}</span>
            </div>
          )}
          {decision.actualOrigin && (
            <div className="denied-card-meta-item">
              <span className="denied-card-meta-label">{t('denied:actualOrigin')}</span>
              <span className="denied-card-meta-value denied-card-meta-value-actual">{decision.actualOrigin}</span>
            </div>
          )}
          {decision.proposedIn && (
            <div className="denied-card-meta-item">
              <span className="denied-card-meta-label">{t('denied:proposedIn')}</span>
              <span className="denied-card-meta-value">{decision.proposedIn}</span>
            </div>
          )}
          {decision.removedIn && (
            <div className="denied-card-meta-item">
              <span className="denied-card-meta-label">{t('denied:removedIn')}</span>
              <span className="denied-card-meta-value">{decision.removedIn}</span>
            </div>
          )}
        </div>
      )}

      {decision?.reason && (
        <>
          <button
            className="denied-card-toggle"
            onClick={toggleExpanded}
            aria-expanded={expanded}
            aria-controls={`denied-reason-${alternative.id}`}
          >
            {expanded ? t('denied:hideReasoning') : t('denied:showReasoning')}
            <svg
              className={`denied-card-toggle-icon${expanded ? ' rotated' : ''}`}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/>
            </svg>
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                id={`denied-reason-${alternative.id}`}
                className="denied-card-reason"
                role="region"
                aria-label={t('denied:reasoningLabel', { name: alternative.name })}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="denied-card-reason-inner">
                  <p className="denied-card-reason-text">{decision.reason}</p>

                  {decision.sources && decision.sources.length > 0 && (
                    <div className="denied-card-sources">
                      <span className="denied-card-sources-label">{t('denied:sources')}:</span>
                      <ul className="denied-card-sources-list">
                        {decision.sources.map((source, idx) => {
                          const href = sanitizeHref(source.url);
                          if (!href) return null;
                          const displayText = source.title || (() => {
                            try {
                              return new URL(href).hostname.replace(/^www\./, '');
                            } catch {
                              return href;
                            }
                          })();
                          return (
                            <li key={idx}>
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="denied-card-source-link"
                              >
                                {displayText}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </article>
  );
}
