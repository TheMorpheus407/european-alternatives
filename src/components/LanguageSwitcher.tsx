import { useParams, useLocation, useNavigate } from 'react-router';
import { supportedLanguages, languageEndonyms, type SupportedLanguage } from '../i18n';

export default function LanguageSwitcher() {
  const { lang } = useParams<{ lang: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const switchLanguage = (newLang: string) => {
    if (newLang === lang) return;
    const pathWithoutLang = location.pathname.replace(new RegExp(`^/${lang}`), '');
    navigate(`/${newLang}${pathWithoutLang}${location.search}`, { replace: true });
  };

  return (
    <div className="language-switcher">
      {supportedLanguages.map((l) => (
        <button
          key={l}
          className={`lang-button${l === lang ? ' active' : ''}`}
          onClick={() => switchLanguage(l)}
          aria-label={languageEndonyms[l as SupportedLanguage]}
          aria-current={l === lang ? 'true' : undefined}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
