export const menuCopy = {
  titulo: 'Menú del huésped',
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

  // Por qué hay dos idiomas y no uno: la app del huésped está en español y en
  // inglés, y el nombre que elige el hotel tiene que poder estar en los dos.
  nombres: 'Cómo se llama',
  nombresCuerpo:
    'Dejá un idioma en blanco y en ese idioma sigue valiendo el nombre que trae la app. Así podés renombrar solo el español sin que un huésped en inglés lea español.',
  etiquetaEs: 'Nombre en español',
  etiquetaEn: 'Nombre en inglés',
  descripcionEs: 'Línea de abajo, en español',
  descripcionEn: 'Línea de abajo, en inglés',
  pordefecto: (texto: string) => `Ahora dice: ${texto}`,
  sinTexto: 'Sin texto',

  verEs: 'Lo que ve en español',
  verEn: 'Lo que ve en inglés',

  error: 'No se pudo guardar. Probá de nuevo.',
  sinPermiso: 'Solo un administrador puede cambiar el menú.',
};
