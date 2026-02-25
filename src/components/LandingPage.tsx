import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { alternatives, categories } from '../data';
import { landingCategoryGroups } from '../data/landingCategoryGroups';
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
  const { lang } = useParams<{ lang: string }>();
  const { t } = useTranslation(['landing', 'common', 'data']);
  const langPrefix = lang ?? 'en';

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
          <div className="landing-eu-flag" aria-hidden="true">
            <span className="fi fi-eu landing-flag-icon"></span>
          </div>

          <h1 className="landing-headline">{t('landing:headline')}</h1>

          <p className="landing-subtext">
            {t('landing:subtext')}
          </p>

          <p className="landing-nudge">
            {t('landing:nudge')}
          </p>
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
