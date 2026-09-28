import { useContext } from 'react';
import { GuestLanguageContext } from './GuestLanguageContext';

export function useGuestLanguage() {
  const context = useContext(GuestLanguageContext);
  if (!context) {
    throw new Error('useGuestLanguage necesita estar dentro de GuestLanguageProvider');
  }
  return context;
}
