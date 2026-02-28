import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useCatalog } from '../contexts/CatalogContext';
import { getAlternativeCategories } from '../utils/alternativeCategories';
import type { CategoryId } from '../types';

const stagger = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  const { alternatives, categories, landingCategoryGroups, deniedAlternatives, loading, error } = useCatalog();
  const { lang } = useParams<{ lang: string }>();
  const { t } = useTranslation(['landing', 'common', 'data']);
  const langPrefix = lang ?? 'en';

  if (loading) {
    return (
      <div className="landing-page">
        <div className="catalog-loading">Loading catalog data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="landing-page">
        <div className="catalog-error" role="alert">Data temporarily unavailable. Please try again later.</div>
      </div>
    );
  }

  const totalAlternatives = alternatives.length;
  const totalCategories = categories.filter(
    (c) => alternatives.some((a) => getAlternativeCategories(a).includes(c.id))
  ).length;
  const totalCountries = new Set(alternatives.map((a) => a.country)).size;
  const openSourceCount = alternatives.filter((a) => a.isOpenSource).length;

  const visibleCategories = categories.filter((category) => category.id !== 'other');
  const categoriesById = new Map(visibleCategories.map((category) => [category.id, category]));
  const alternativeCountsByCategory = new Map<CategoryId, number>();
  for (const category of visibleCategories) {
    alternativeCountsByCategory.set(category.id, 0);
  }
  for (const alternative of alternatives) {
    for (const categoryId of getAlternativeCategories(alternative)) {
      if (alternativeCountsByCategory.has(categoryId)) {
        alternativeCountsByCategory.set(categoryId, (alternativeCountsByCategory.get(categoryId) ?? 0) + 1);
      }
    }
  }
  const assignedCategoryIds = new Set<CategoryId>();
  const groupedCategorySections = landingCategoryGroups.map((group) => {
    const groupCategories = group.categories
      .map((categoryId) => categoriesById.get(categoryId))
      .filter((category): category is (typeof categories)[number] => Boolean(category));

    for (const category of groupCategories) {
      assignedCategoryIds.add(category.id);
    }

    return {
      ...group,
      categories: groupCategories,
    };
  });

  const ungroupedCategories = visibleCategories.filter((category) => !assignedCategoryIds.has(category.id));
  if (ungroupedCategories.length > 0) {
    groupedCategorySections.push({
      id: 'uncategorized',
      categories: ungroupedCategories,
    });
  }

  return (
    <div className="landing-page">
      <motion.div
        className="landing-content"
        initial="initial"
        animate="animate"
        variants={stagger}
      >
        {/* Hero Section */}
        <motion.div className="landing-hero" variants={fadeUp}>
          <div className="landing-hero-flags" aria-hidden="true">
            <span className="fi fi-eu landing-flag-icon"></span>
            <svg className="landing-osi-icon" viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 22c11 0 20 9 20 20 0 7.7-4.4 14.4-10.8 17.7L65 88H35l5.8-28.3C34.4 56.4 30 49.7 30 42c0-11 9-20 20-20z"/>
            </svg>
          </div>

          <h1 className="landing-headline">{t('landing:headline')}</h1>

          <p className="landing-subtext">
            {t('landing:subtext')}
          </p>

          <p className="landing-nudge">
            {t('landing:nudge')}
          </p>

          <div className="landing-hero-actions">
            <a
              href="https://github.com/TheMorpheus407/european-alternatives/issues/new?template=new-alternative.yaml"
              target="_blank"
              rel="noopener noreferrer"
              className="landing-contribute-cta"
            >
              <svg className="landing-contribute-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.38-1.33-1.74-1.33-1.74-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.23 1.84 1.23 1.07 1.84 2.81 1.31 3.49 1 .11-.77.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.46-2.38 1.23-3.22-.12-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.4 11.4 0 0 1 6 0c2.29-1.55 3.29-1.23 3.29-1.23.66 1.65.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.49 5.93.43.38.82 1.12.82 2.26v3.35c0 .32.22.69.83.58A12 12 0 0 0 12 0Z" />
              </svg>
              {t('landing:heroContribution.cta')}
            </a>
            <p className="landing-contribute-hint">{t('landing:heroContribution.hint')}</p>
          </div>
        </motion.div>

        {/* Stats Bar */}
        {totalAlternatives > 0 && (
          <motion.div className="landing-stats" variants={fadeUp}>
            <div className="landing-stats-item">
              <span className="landing-stats-number">{totalAlternatives}</span>
              <span className="landing-stats-label">{t('landing:stats.alternatives')}</span>
            </div>
            <div className="landing-stats-divider" />
            <div className="landing-stats-item">
              <span className="landing-stats-number">{totalCategories}</span>
              <span className="landing-stats-label">{t('landing:stats.categories')}</span>
            </div>
            <div className="landing-stats-divider" />
            <div className="landing-stats-item">
              <span className="landing-stats-number">{totalCountries}</span>
              <span className="landing-stats-label">{t('landing:stats.country', { count: totalCountries })}</span>
            </div>
            <div className="landing-stats-divider" />
            <div className="landing-stats-item">
              <span className="landing-stats-number">{openSourceCount}</span>
              <span className="landing-stats-label">{t('landing:stats.openSource')}</span>
            </div>
            {deniedAlternatives.length > 0 && (
              <>
                <div className="landing-stats-divider" />
                <Link to={`/${langPrefix}/denied`} className="landing-stats-item landing-stats-item-link landing-stats-item-denied">
                  <span className="landing-stats-number landing-stats-number-denied">{deniedAlternatives.length}</span>
                  <span className="landing-stats-label">{t('landing:stats.denied')}</span>
                </Link>
              </>
            )}
          </motion.div>
        )}

        {/* Category Grid */}
        <motion.div className="landing-categories" variants={fadeUp}>
          <h2 className="landing-section-title">{t('landing:browseByCategory')}</h2>
          <div className="landing-category-group-nav" role="navigation" aria-label={t('landing:categoryGroupsNavLabel')}>
            {groupedCategorySections.map((group) => (
              <a key={group.id} href={`#group-${group.id}`} className="landing-category-group-nav-item">
                {t(`landing:categoryGroups.${group.id}.name`)}
              </a>
            ))}
          </div>

          <div className="landing-category-groups">
            {groupedCategorySections.map((group) => (
              <section key={group.id} id={`group-${group.id}`} className="landing-category-group">
                <div className="landing-category-group-header">
                  <h3 className="landing-category-group-title">
                    {t(`landing:categoryGroups.${group.id}.name`)}
                  </h3>
                  <p className="landing-category-group-description">
                    {t(`landing:categoryGroups.${group.id}.description`)}
                  </p>
                </div>

                <div className="landing-categories-grid">
                  {group.categories.map((cat) => {
                    const count = alternativeCountsByCategory.get(cat.id) ?? 0;
                    const catName = t(`data:categories.${cat.id}.name`);
                    return (
                      <Link
                        key={cat.id}
                        to={`/${langPrefix}/browse?category=${cat.id}`}
                        className="landing-category-card"
                      >
                        <span className="landing-category-emoji" aria-hidden="true">
                          {cat.emoji}
                        </span>
                        <span className="landing-category-name">{catName}</span>
                        <span className="landing-category-count">
                          {t('landing:alternative', { count })}
                        </span>
                        {cat.usGiants.length > 0 && (
                          <div className="landing-category-replaces">
                            <span className="landing-category-replaces-label">
                              {t('landing:replacesLabel')}
                            </span>
                            <ul className="landing-category-giants-list">
                              {cat.usGiants.map((giant) => (
                                <li key={giant}>{giant}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </motion.div>

        {/* Values Section */}
        <motion.div className="landing-values" variants={fadeUp}>
          <div className="landing-value-card">
            <div className="landing-value-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
              </svg>
            </div>
            <strong>{t('landing:values.gdpr.title')}</strong>
            <span>{t('landing:values.gdpr.description')}</span>
          </div>
          <div className="landing-value-card">
            <div className="landing-value-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <strong>{t('landing:values.sovereignty.title')}</strong>
            <span>{t('landing:values.sovereignty.description')}</span>
          </div>
          <div className="landing-value-card">
            <div className="landing-value-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <strong>{t('landing:values.openSource.title')}</strong>
            <span>{t('landing:values.openSource.description')}</span>
          </div>
        </motion.div>

        <motion.section className="landing-score-context" variants={fadeUp}>
          <h2 className="landing-section-title">{t('landing:scoreContext.title')}</h2>
          <p className="landing-score-context-intro">{t('landing:scoreContext.intro')}</p>

          <div className="landing-score-context-grid">
            <div className="landing-score-context-card">
              <h3>{t('landing:scoreContext.usFactorsTitle')}</h3>
              <ul className="landing-score-context-list">
                <li>
                  <strong>{t('landing:scoreContext.factors.fisa.title')}</strong>
                  <span>{t('landing:scoreContext.factors.fisa.text')}</span>
                </li>
                <li>
                  <strong>{t('landing:scoreContext.factors.cloudAct.title')}</strong>
                  <span>{t('landing:scoreContext.factors.cloudAct.text')}</span>
                </li>
                <li>
                  <strong>{t('landing:scoreContext.factors.transfers.title')}</strong>
                  <span>{t('landing:scoreContext.factors.transfers.text')}</span>
                </li>
                <li>
                  <strong>{t('landing:scoreContext.factors.metadata.title')}</strong>
                  <span>{t('landing:scoreContext.factors.metadata.text')}</span>
                </li>
                <li>
                  <strong>{t('landing:scoreContext.factors.brokeredData.title')}</strong>
                  <span>{t('landing:scoreContext.factors.brokeredData.text')}</span>
                </li>
              </ul>
            </div>

            <div className="landing-score-context-card">
              <h3>{t('landing:scoreContext.openSource.title')}</h3>
              <p className="landing-score-context-open-source-text">
                {t('landing:scoreContext.openSource.text')}
              </p>
              <p className="landing-score-context-video">
                {t('landing:scoreContext.videoPrefix')}{' '}
                <a
                  href="https://www.youtube.com/c/TheMorpheusVlogs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="landing-note-link"
                >
                  {t('landing:scoreContext.videoLinkLabel')}
                </a>
                {t('landing:scoreContext.videoSuffix')}
              </p>
            </div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div className="landing-buttons" variants={fadeUp}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to={`/${langPrefix}/browse`} className="cta-button">
              {t('landing:browseAlternatives')}
              <svg className="cta-arrow" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
              </svg>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div className="landing-disclaimer" variants={fadeUp}>
          <p className="landing-disclaimer-title">{t('landing:disclaimer.title')}</p>
          <p className="landing-disclaimer-text">{t('landing:disclaimer.text')}</p>
        </motion.div>

        <motion.p className="landing-note" variants={fadeUp}>
          {t('landing:communityNote.prefix')}{' '}
          <a
            href="https://github.com/TheMorpheus407/european-alternatives/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="landing-note-link"
          >
            {t('landing:communityNote.linkLabel')}
          </a>{' '}
          {t('landing:communityNote.suffix')}
        </motion.p>
      </motion.div>
    </div>
  );
}
