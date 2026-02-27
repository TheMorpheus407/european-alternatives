import { Routes, Route, Navigate, Outlet, useParams, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from './Layout';
import LandingPage from './LandingPage';
import BrowsePage from './BrowsePage';
import FurtherReadingPage from './FurtherReadingPage';
import { CatalogProvider } from '../contexts/CatalogContext';
import { supportedLanguages, defaultLanguage, localeMap, detectBrowserLanguage, type SupportedLanguage } from '../i18n';

function LocaleLayout() {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (lang && supportedLanguages.includes(lang as SupportedLanguage)) {
      const apply = (translate: (key: string) => string) => {
        document.documentElement.lang = lang;
        document.title = translate('meta.title');

        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', translate('meta.description'));

        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', translate('meta.title'));

        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', translate('meta.ogDescription'));

        const ogLocale = document.querySelector('meta[property="og:locale"]');
        if (ogLocale) ogLocale.setAttribute('content', localeMap[lang as SupportedLanguage]);

        const twTitle = document.querySelector('meta[name="twitter:title"]');
        if (twTitle) twTitle.setAttribute('content', translate('meta.title'));

        const twDesc = document.querySelector('meta[name="twitter:description"]');
        if (twDesc) twDesc.setAttribute('content', translate('meta.ogDescription'));

        // Manage hreflang alternate links
        document.querySelectorAll('link[hreflang]').forEach((el) => el.remove());
        const pathWithoutLang = window.location.pathname.replace(new RegExp(`^/${lang}`), '');
        for (const sl of supportedLanguages) {
          const link = document.createElement('link');
          link.rel = 'alternate';
          link.hreflang = sl;
          link.href = `${window.location.origin}/${sl}${pathWithoutLang}`;
          document.head.appendChild(link);
        }
        const xDefault = document.createElement('link');
        xDefault.rel = 'alternate';
        xDefault.hreflang = 'x-default';
        xDefault.href = `${window.location.origin}/${defaultLanguage}${pathWithoutLang}`;
        document.head.appendChild(xDefault);

        // Manage canonical URL
        let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
        if (!canonical) {
          canonical = document.createElement('link');
          canonical.rel = 'canonical';
          document.head.appendChild(canonical);
        }
        canonical.href = `${window.location.origin}/${lang}${pathWithoutLang}`;
      };

      if (i18n.language !== lang) {
        i18n.changeLanguage(lang).then((t) => apply(t));
      } else {
        apply(i18n.t.bind(i18n));
      }
    }
  }, [lang, i18n]);

  if (!lang || !supportedLanguages.includes(lang as SupportedLanguage)) {
    return <Navigate to={`/${defaultLanguage}`} replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function LanguageRedirect() {
  const [searchParams] = useSearchParams();
  const lang = detectBrowserLanguage();
  const search = searchParams.toString();

  return <Navigate to={`/${lang}${search ? `?${search}` : ''}`} replace />;
}

function BrowseRedirect() {
  const [searchParams] = useSearchParams();
  const lang = detectBrowserLanguage();
  const search = searchParams.toString();

  return <Navigate to={`/${lang}/browse${search ? `?${search}` : ''}`} replace />;
}

function FurtherReadingRedirect() {
  const [searchParams] = useSearchParams();
  const lang = detectBrowserLanguage();
  const search = searchParams.toString();

  return <Navigate to={`/${lang}/further-reading${search ? `?${search}` : ''}`} replace />;
}

function CatchAllRedirect() {
  const lang = detectBrowserLanguage();
  return <Navigate to={`/${lang}`} replace />;
}

export default function App() {
  return (
    <CatalogProvider>
      <Routes>
        <Route path="/:lang" element={<LocaleLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="browse" element={<BrowsePage />} />
          <Route path="further-reading" element={<FurtherReadingPage />} />
        </Route>
        <Route path="/" element={<LanguageRedirect />} />
        <Route path="/browse" element={<BrowseRedirect />} />
        <Route path="/further-reading" element={<FurtherReadingRedirect />} />
        <Route path="*" element={<CatchAllRedirect />} />
      </Routes>
    </CatalogProvider>
  );
}
