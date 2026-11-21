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
    //
    // Se pone un valor acá y se vuelve a poner en `aplicarMarca()`: este
    // módulo se carga ANTES de que se resuelva el hotel —hace falta una
    // consulta—, así que lo de acá es solo el respaldo.
    defaultVariables: { experiencia: MARCA.experiencia },
  },
  initAsync: false,
});

/**
 * Vuelve a poner el nombre de la experiencia, ya con el hotel resuelto.
 *
 * Sin esto, cada `{{experiencia}}` de los archivos de traducción se quedaba
 * con la marca por defecto. Comprobado el 20 de noviembre de 2026: en el
 * hotel demo, /demo/entrada decía «HUMAYA EXPERIENCE».
 */
export function aplicarMarcaEnTextos(experiencia: string): void {
  const interpolacion = i18n.options.interpolation ?? {};
  interpolacion.defaultVariables = { ...interpolacion.defaultVariables, experiencia };
  i18n.options.interpolation = interpolacion;
}

export default i18n;
