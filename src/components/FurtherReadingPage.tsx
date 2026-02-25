import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { furtherReadingResources } from '../data';
import type { FurtherReadingSectionId } from '../types';

const ISSUE_BASE_URL = 'https://github.com/TheMorpheus407/european-alternatives/issues/';
const sectionOrder: FurtherReadingSectionId[] = ['directories', 'publicCatalogues', 'migrationGuides'];

export default function FurtherReadingPage() {
  const { t } = useTranslation('furtherReading');

  const sections = useMemo(
    () =>
      sectionOrder.map((sectionId) => ({
        sectionId,
        resources: furtherReadingResources.filter((resource) => resource.section === sectionId),
      })),
    [],
  );

  return (
    <div className="reading-page">
      <motion.div
        className="reading-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="reading-title">{t('title')}</h1>
        <p className="reading-subtitle">{t('subtitle')}</p>
      </motion.div>

      <motion.section
        className="reading-governance"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <h2>{t('governance.title')}</h2>
        <p>{t('governance.line1')}</p>
        <p>{t('governance.line2')}</p>
      </motion.section>

      <div className="reading-sections">
        {sections.map((section, sectionIndex) => (
          <motion.section
            key={section.sectionId}
            className="reading-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + sectionIndex * 0.08 }}
          >
            <h2 className="reading-section-title">{t(`sections.${section.sectionId}.title`)}</h2>
            <p className="reading-section-description">{t(`sections.${section.sectionId}.description`)}</p>

            <div className="reading-grid">
              {section.resources.map((resource) => (
                <article key={resource.id} className="reading-card">
                  <h3 className="reading-card-title">{resource.name}</h3>
                  <p className="reading-card-summary">{t(`resources.${resource.id}.summary`)}</p>

                  <ul className="reading-card-list">
                    <li>
                      <strong>{t('labels.howToUse')}:</strong> {t(`resources.${resource.id}.howToUse`)}
                    </li>
                    <li>
                      <strong>{t('labels.caveat')}:</strong> {t(`resources.${resource.id}.caveat`)}
                    </li>
                  </ul>

                  <div className="reading-card-meta">
                    <span>
                      {t('labels.focus')}: {t(`labels.focusValues.${resource.focus}`)}
                    </span>
                    <span>
                      {t('labels.lastReviewed')}: {resource.lastReviewed}
                    </span>
                  </div>

                  {resource.relatedIssues.length > 0 && (
                    <div className="reading-card-issues">
                      <span>{t('labels.relatedIssues')}:</span>
                      <div className="reading-card-issue-links">
                        {resource.relatedIssues.map((issueNumber) => (
                          <a
                            key={issueNumber}
                            href={`${ISSUE_BASE_URL}${issueNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="reading-issue-link"
                          >
                            #{issueNumber}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <a
                    href={resource.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="reading-visit-link"
                  >
                    {t('labels.visit')}
                  </a>
                </article>
              ))}
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
}
