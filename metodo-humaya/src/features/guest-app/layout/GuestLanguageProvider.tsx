import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import i18n from '@/i18n';
import { supportedGuestLanguage, type GuestLanguage } from '@/i18n/localizedText';
import { DEMO_STAYS } from '@/services/session';
import { GuestLanguageContext } from './GuestLanguageContext';
import { useCurrentStay } from './useCurrentStay';

const STORAGE_PREFIX = 'humaya.guest-language:';

function storageKey(stayId: string): string {
  return `${STORAGE_PREFIX}${stayId}`;
}

function storedLanguage(stayId: string): GuestLanguage | undefined {
  try {
    const value = window.localStorage.getItem(storageKey(stayId));
    return value === 'es' || value === 'en' ? value : undefined;
  } catch {
    return undefined;
  }
}

function preferredLanguage(stayId: string): GuestLanguage {
  const locale = DEMO_STAYS.find((stay) => stay.stayId === stayId)?.locale ?? 'es';
  return supportedGuestLanguage(locale);
}

function languageForStay(stayId: string): GuestLanguage {
  return storedLanguage(stayId) ?? preferredLanguage(stayId);
}

export function GuestLanguageProvider({ children }: { children: ReactNode }) {
  const { stayId } = useCurrentStay();
  const [selections, setSelections] = useState<Record<string, GuestLanguage>>({});
  const language = selections[stayId] ?? languageForStay(stayId);

  useEffect(() => {
    void i18n.changeLanguage(language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback(
    (next: GuestLanguage) => {
      try {
        window.localStorage.setItem(storageKey(stayId), next);
      } catch {
        // La app sigue funcionando si el navegador bloquea el almacenamiento.
      }
      setSelections((current) => ({ ...current, [stayId]: next }));
    },
    [stayId],
  );

  const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage]);
  return <GuestLanguageContext.Provider value={value}>{children}</GuestLanguageContext.Provider>;
}
