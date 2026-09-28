import { useTranslation } from 'react-i18next';
import { useGuestLanguage } from '../layout/useGuestLanguage';

export function LanguageSelector() {
  const { t } = useTranslation();
  const { language, setLanguage } = useGuestLanguage();
  const next = language === 'es' ? 'en' : 'es';

  return (
    <button
      type="button"
      aria-label={t(`common.languageTo${next === 'en' ? 'English' : 'Spanish'}`)}
      onClick={() => setLanguage(next)}
      className="h-11 min-w-11 rounded-pill border border-line-strong bg-transparent px-3 text-xs font-medium tracking-[0.08em] text-text"
    >
      {language.toUpperCase()}
    </button>
  );
}
