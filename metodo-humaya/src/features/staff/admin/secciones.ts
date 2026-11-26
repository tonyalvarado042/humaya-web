import {
  Building2,
  CalendarCheck,
  Image,
  LayoutGrid,
  Link2,
  MonitorPlay,
  Settings2,
  Sparkles,
  SprayCan,
} from 'lucide-react';
import type { Idioma } from '@/hooks/useIdiomaElegido';

/**
 * Admin, separada por función.
 *
 * ── POR QUÉ DEJÓ DE SER UNA SOLA PANTALLA ───────────────────────────────
 * Tony, 20 de noviembre de 2026: «debes mejorar Admin y separar por función,
 * ejemplo: Admin - página TV, todo de TV».
 *
 * Tenía razón y se veía: /staff/admin era una sola columna con el interruptor
 * del demo, seis opciones de menú, el bot del Concierge con su llave y sus
 * respuestas guardadas, el catálogo de servicios con su formulario, y las
 * pantallas de los televisores. Para cambiarle el precio a un servicio había
 * que pasar de largo por la llave de la API; para colgar un televisor nuevo,
 * bajar por todo lo demás. Y cada vez que se cargaba, se cargaba todo.
 *
 * Ahora cada función es una dirección. Se puede mandar un enlace a
 * `/staff/admin/tv` y es lo único que esa persona ve.
 *
 * ── POR QUÉ LA LISTA VIVE ACÁ Y NO EN LA PANTALLA ───────────────────────
 * Porque la usan tres: el menú de arriba, la portada con las fichas, y el
 * título de cada sección. Tres lugares donde escribir lo mismo son tres
 * lugares para que se desincronicen.
 *
 * ── POR QUÉ ES UNA FUNCIÓN Y NO UNA CONSTANTE ───────────────────────────
 * Porque los nombres tienen idioma. Siendo constante, se armaba una sola vez
 * al importar el archivo y el menú de Admin se quedaba en español aunque
 * recepción estuviera en inglés.
 */
export interface SeccionAdmin {
  /** El pedazo de la dirección. Vacío es la portada. */
  ruta: string;
  titulo: string;
  /** Qué se hace acá, para la ficha de la portada. */
  cuerpo: string;
  Icon: typeof LayoutGrid;
}

/**
 * Las secciones de Admin.
 *
 * `conHoteles` agrega «Hotels», que solo ve una cuenta de plataforma: el
 * resto no puede crear hoteles y ofrecerle el enlace seria mandarlo a una
 * pantalla que la base le va a negar.
 */
export function seccionesAdmin(idioma: Idioma, conHoteles = false): SeccionAdmin[] {
  if (idioma === 'en') {
    const base: SeccionAdmin[] = [
      {
        ruta: 'marca',
        titulo: 'Brand',
        cuerpo:
          'What the hotel is called, where the guest writes to, and the colors and fonts the app is seen in.',
        Icon: Image,
      },
      {
        ruta: 'menu',
        titulo: 'Guest menu',
        cuerpo:
          'Which options the guest sees on the Home and in the bottom bar, and what each one is called in Spanish and in English.',
        Icon: LayoutGrid,
      },
      {
        ruta: 'servicios',
        titulo: 'Services',
        cuerpo: 'The catalog the guest can book: price, with whom, duration and hours.',
        Icon: SprayCan,
      },
      {
        ruta: 'concierge',
        titulo: 'Concierge',
        cuerpo: 'The bot that answers at night: its key, what it knows and the saved replies.',
        Icon: Sparkles,
      },
      {
        ruta: 'tv',
        titulo: 'TV screen',
        cuerpo: 'The television in each villa: its name, its photo, its message and its address.',
        Icon: MonitorPlay,
      },
      {
        ruta: 'enlaces',
        titulo: 'Links',
        cuerpo:
          'The internal home page: what this hotel’s team opens every day — the front desk, the guest app, the PMS, the website.',
        Icon: Link2,
      },
      {
        ruta: 'ajustes',
        titulo: 'Settings',
        cuerpo: 'The demo sample data, and whatever belongs to none of the other sections.',
        Icon: Settings2,
      },
    ];
    return conHoteles
      ? [
          ...base,
          {
            ruta: 'hoteles',
            titulo: 'Hotels',
            cuerpo:
              'Create a hotel, say where its bookings come from, and who works in it. Platform accounts only.',
            Icon: Building2,
          },
          {
            ruta: 'cloudbeds',
            titulo: 'Cloudbeds',
            cuerpo:
              'Each hotel’s own Cloudbeds property and API key: where its real bookings come in from.',
            Icon: CalendarCheck,
          },
        ]
      : base;
  }

  const base: SeccionAdmin[] = [
    {
      ruta: 'marca',
      titulo: 'Marca',
      cuerpo:
        'Cómo se llama el hotel, a dónde escribe el huésped, y con qué colores y letras se ve la app.',
      Icon: Image,
    },
    {
      ruta: 'menu',
      titulo: 'Menú del huésped',
      cuerpo:
        'Qué opciones ve el huésped en el Home y en la barra de abajo, y cómo se llama cada una en español y en inglés.',
      Icon: LayoutGrid,
    },
    {
      ruta: 'servicios',
      titulo: 'Servicios',
      cuerpo: 'El catálogo que el huésped puede reservar: precio, con quién, duración y horario.',
      Icon: SprayCan,
    },
    {
      ruta: 'concierge',
      titulo: 'Concierge',
      cuerpo: 'El bot que contesta de noche: su llave, lo que sabe y las respuestas guardadas.',
      Icon: Sparkles,
    },
    {
      ruta: 'tv',
      titulo: 'Pantalla del TV',
      cuerpo: 'El televisor de cada villa: su nombre, su foto, su mensaje y su dirección.',
      Icon: MonitorPlay,
    },
    {
      ruta: 'enlaces',
      titulo: 'Enlaces',
      cuerpo:
        'La portada interna: lo que el equipo de este hotel abre todos los días — recepción, la app del huésped, el PMS, el sitio web.',
      Icon: Link2,
    },
    {
      ruta: 'ajustes',
      titulo: 'Ajustes',
      cuerpo: 'Los datos de ejemplo de la demo, y lo que no es de ninguna de las otras secciones.',
      Icon: Settings2,
    },
  ];
  return conHoteles
    ? [
        ...base,
        {
          ruta: 'hoteles',
          titulo: 'Hoteles',
          cuerpo:
            'Crear un hotel, decir de dónde entran sus reservas y quién trabaja en él. Solo cuentas de plataforma.',
          Icon: Building2,
        },
        {
          ruta: 'cloudbeds',
          titulo: 'Cloudbeds',
          cuerpo:
            'La propiedad de Cloudbeds de cada hotel y su llave: por ahí entran sus reservas de verdad.',
          Icon: CalendarCheck,
        },
      ]
    : base;
}
