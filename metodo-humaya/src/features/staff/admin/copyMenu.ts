import type { Idioma } from '@/hooks/useIdiomaElegido';

/**
 * El texto de Admin → Menú del huésped.
 *
 * ── OJO CON `etiquetaEs` Y `etiquetaEn` ─────────────────────────────────
 * No son el idioma de la pantalla: son los dos nombres que puede tener una
 * opción del menú, porque la app del huésped está en español y en inglés. En
 * la pantalla en inglés siguen siendo «Spanish name» y «English name».
 */
export interface MenuTextos {
  titulo: string;
  cuerpo: string;

  /** Cuando el hotel no tiene ninguna opcion. No deberia pasar nunca. */
  vacio: string;
  vacioCuerpo: string;

  habilitada: string;
  deshabilitada: string;
  habilitar: string;
  deshabilitar: string;
  editar: string;
  cancelar: string;
  guardar: string;
  guardando: string;

  nombres: string;
  nombresCuerpo: string;
  etiquetaEs: string;
  etiquetaEn: string;
  descripcionEs: string;
  descripcionEn: string;
  pordefecto: (texto: string) => string;
  sinTexto: string;

  verEs: string;
  verEn: string;

  error: string;
  sinPermiso: string;
}

export const menuCopy: Record<Idioma, MenuTextos> = {
  es: {
    titulo: 'Menú del huésped',
    vacio: 'Este hotel no tiene ninguna opción de menú',
    vacioCuerpo:
      'Y debería: un hotel nuevo nace con las seis que trae la app. Estas opciones no se inventan —cada una es una pantalla del producto—, así que esto no se arregla agregando una a mano. Avisale a la plataforma para que vuelva a sembrar este hotel.',
    cuerpo:
      'Lo que ves acá es lo que el huésped ve en el Home y en la barra de abajo. Apagar una opción la saca de los dos lugares.',

    habilitada: 'Habilitada',
    deshabilitada: 'Deshabilitada',
    habilitar: 'Habilitar',
    deshabilitar: 'Deshabilitar',
    editar: 'Cambiar el nombre',
    cancelar: 'Cancelar',
    guardar: 'Guardar',
    guardando: 'Guardando…',

    // Por qué hay dos idiomas y no uno: la app del huésped está en español y
    // en inglés, y el nombre que elige el hotel tiene que poder estar en los
    // dos.
    nombres: 'Cómo se llama',
    nombresCuerpo:
      'Dejá un idioma en blanco y en ese idioma sigue valiendo el nombre que trae la app. Así podés renombrar solo el español sin que un huésped en inglés lea español.',
    etiquetaEs: 'Nombre en español',
    etiquetaEn: 'Nombre en inglés',
    descripcionEs: 'Línea de abajo, en español',
    descripcionEn: 'Línea de abajo, en inglés',
    pordefecto: (texto) => `Ahora dice: ${texto}`,
    sinTexto: 'Sin texto',

    verEs: 'Lo que ve en español',
    verEn: 'Lo que ve en inglés',

    error: 'No se pudo guardar. Probá de nuevo.',
    sinPermiso: 'Solo un administrador puede cambiar el menú.',
  },

  en: {
    titulo: 'Guest menu',
    vacio: 'This hotel has no menu options',
    vacioCuerpo:
      'And it should: a new hotel is born with the six the app ships with. These options are not made up — each one is a screen of the product — so this is not fixed by adding one by hand. Tell the platform to seed this hotel again.',
    cuerpo:
      'What you see here is what the guest sees on the Home and in the bottom bar. Turning an option off removes it from both places.',

    habilitada: 'Enabled',
    deshabilitada: 'Disabled',
    habilitar: 'Enable',
    deshabilitar: 'Disable',
    editar: 'Change the name',
    cancelar: 'Cancel',
    guardar: 'Save',
    guardando: 'Saving…',

    nombres: 'What it is called',
    nombresCuerpo:
      'Leave a language blank and in that language the name the app ships with still applies. That way you can rename only the Spanish without a guest reading English getting Spanish.',
    etiquetaEs: 'Spanish name',
    etiquetaEn: 'English name',
    descripcionEs: 'Line underneath, in Spanish',
    descripcionEn: 'Line underneath, in English',
    pordefecto: (texto) => `Right now it says: ${texto}`,
    sinTexto: 'No text',

    verEs: 'What they see in Spanish',
    verEn: 'What they see in English',

    error: 'It could not be saved. Try again.',
    sinPermiso: 'Only an administrator can change the menu.',
  },
};
