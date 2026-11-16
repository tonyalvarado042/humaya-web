import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { MARCA } from '@/marca';
import en from './en.json';
import es from './es.json';

void i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: 'es',
  fallbackLng: 'es',
  supportedLngs: ['es', 'en'],
  interpolation: {
    escapeValue: false,
    // El nombre de la experiencia es nombre propio y NO se traduce: va igual
    // en los dos idiomas. Entra como variable para que viva en un solo lugar
    // —src/marca.ts— y no haya que cambiarlo archivo por archivo el dia que
    // esta app se venda a otro hotel.
    defaultVariables: { experiencia: MARCA.experiencia },
  },
  initAsync: false,
});

export default i18n;
