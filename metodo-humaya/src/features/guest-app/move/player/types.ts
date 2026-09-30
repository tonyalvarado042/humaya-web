/**
 * Los cuatro tratamientos visuales del video de demostración. "takeover" es
 * el recomendado (video de fondo a pantalla completa, controles sobrepuestos);
 * los otros tres quedan disponibles para que Anthony los compare en vivo.
 */
export type VideoStyle = 'immersive' | 'framed' | 'bubble' | 'takeover';

export type VideoRole = 'intro' | 'section' | 'exercise' | 'closing' | 'cooldown';
