import type { Locale, LocalizedText } from '@/types';

export type GuestLanguage = 'es' | 'en';

/** DE y FR quedan en español hasta que existan esos recursos. */
export function supportedGuestLanguage(locale: Locale): GuestLanguage {
  return locale === 'en' ? 'en' : 'es';
}

/** Resuelve contenido del dominio con español como respaldo obligatorio. */
export function localizedText(text: LocalizedText, locale: Locale): string {
  return text[locale] ?? text.es;
}

export function intlLocale(language: GuestLanguage): 'es-CR' | 'en-US' {
  return language === 'en' ? 'en-US' : 'es-CR';
}
