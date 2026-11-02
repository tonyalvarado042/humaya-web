import { createContext } from 'react';
import type { GuestLanguage } from '@/i18n/localizedText';

export interface GuestLanguageContextValue {
  language: GuestLanguage;
  setLanguage: (language: GuestLanguage) => void;
}

export const GuestLanguageContext = createContext<GuestLanguageContextValue | null>(null);
